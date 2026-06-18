"""Tests for new Applications + Razorpay (mock-mode) endpoints."""
import os
import re
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://culinary-gateway.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@ram.institute"
ADMIN_PASSWORD = "Ram@2026"
APP_NO_RE = re.compile(r"^RIHM\d{4}-\d{5}$")


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin_token(api):
    r = api.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


@pytest.fixture(scope="module")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# --- /api/payments/config -----------------------------------------------------
def test_payments_config(api):
    r = api.get(f"{BASE_URL}/api/payments/config")
    assert r.status_code == 200
    d = r.json()
    assert d["amount_inr"] == 5000
    assert d["currency"] == "INR"
    assert d["configured"] is False  # keys empty in dev
    assert d["test_mode"] is True
    assert "razorpay_key_id" in d


# --- create-order: validation -------------------------------------------------
def test_create_order_missing_father_name_returns_422(api):
    r = api.post(f"{BASE_URL}/api/applications/create-order", json={
        "name": "TEST_NoFather",
        "phone": "9999911111",
        "email": "TEST_nofather@example.com",
        "course": "BHM",
    })
    assert r.status_code == 422


# --- create-order: happy path + lead row creation -----------------------------
def test_create_order_mock_mode_and_lead_created(api):
    payload = {
        "name": "TEST_Applicant_Alpha",
        "father_name": "TEST_Father_Alpha",
        "phone": "9000011001",
        "email": "TEST_alpha@example.com",
        "course": "BHM",
    }
    r = api.post(f"{BASE_URL}/api/applications/create-order", json=payload)
    assert r.status_code == 200, r.text
    d = r.json()
    assert "application_id" in d and len(d["application_id"]) >= 32
    assert APP_NO_RE.match(d["application_no"]), d["application_no"]
    assert d["razorpay_order_id"].startswith("order_mock_"), d["razorpay_order_id"]
    assert d["amount_paise"] == 500000
    assert d["amount_inr"] == 5000
    assert d["test_mode"] is True
    assert d["currency"] == "INR"
    assert d["prefill"]["contact"] == payload["phone"]

    # corresponding lead row created with source=application_started
    # we need admin token for /admin/leads
    login = api.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    tok = login.json()["access_token"]
    leads = api.get(f"{BASE_URL}/api/admin/leads", headers={"Authorization": f"Bearer {tok}"})
    assert leads.status_code == 200
    matched = [le for le in leads.json() if le.get("phone") == payload["phone"] and le.get("source") == "application_started"]
    assert len(matched) >= 1, "Expected a lead row with source=application_started"
    assert matched[0]["status"] == "new"

    # stash for later
    pytest.alpha_application = d
    pytest.alpha_payload = payload


# --- verify-payment: 404 ------------------------------------------------------
def test_verify_payment_nonexistent_returns_404(api):
    r = api.post(f"{BASE_URL}/api/applications/verify-payment", json={
        "application_id": "does-not-exist-123",
        "razorpay_order_id": "order_mock_xxx",
        "razorpay_payment_id": "pay_mock_xxx",
        "razorpay_signature": "mock_signature_dev_only",
    })
    assert r.status_code == 404


# --- verify-payment: happy path + lead flips to converted ---------------------
def test_verify_payment_success_and_lead_converted(api, admin_headers):
    app_data = pytest.alpha_application
    payload = pytest.alpha_payload
    r = api.post(f"{BASE_URL}/api/applications/verify-payment", json={
        "application_id": app_data["application_id"],
        "razorpay_order_id": app_data["razorpay_order_id"],
        "razorpay_payment_id": "pay_mock_dev_123",
        "razorpay_signature": "mock_signature_dev_only",
    })
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["payment_status"] == "paid"
    assert d["paid_at"] is not None
    assert d["razorpay_payment_id"] == "pay_mock_dev_123"
    assert d["application_no"] == app_data["application_no"]

    # Verify lead status flipped to converted
    leads = api.get(f"{BASE_URL}/api/admin/leads", headers=admin_headers).json()
    matched = [le for le in leads if le.get("phone") == payload["phone"] and le.get("source") == "application_started"]
    assert matched, "Lead missing"
    assert matched[0]["status"] == "converted", matched[0]


# --- GET application by id ----------------------------------------------------
def test_get_application_by_id(api):
    app_id = pytest.alpha_application["application_id"]
    r = api.get(f"{BASE_URL}/api/applications/{app_id}")
    assert r.status_code == 200
    d = r.json()
    assert d["payment_status"] == "paid"
    assert d["id"] == app_id


# --- Admin auth on /admin/applications ----------------------------------------
def test_admin_applications_requires_auth(api):
    r = api.get(f"{BASE_URL}/api/admin/applications")
    assert r.status_code == 401


def test_admin_applications_list_sorted_desc(api, admin_headers):
    r = api.get(f"{BASE_URL}/api/admin/applications", headers=admin_headers)
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    assert len(items) >= 1
    # Sorted desc by created_at
    cs = [x["created_at"] for x in items]
    assert cs == sorted(cs, reverse=True)


def test_admin_applications_filter_paid(api, admin_headers):
    r = api.get(f"{BASE_URL}/api/admin/applications?payment_status=paid", headers=admin_headers)
    assert r.status_code == 200
    items = r.json()
    assert all(x["payment_status"] == "paid" for x in items)
    assert any(x["id"] == pytest.alpha_application["application_id"] for x in items)


def test_admin_application_stats(api, admin_headers):
    r = api.get(f"{BASE_URL}/api/admin/applications/stats", headers=admin_headers)
    assert r.status_code == 200
    d = r.json()
    for k in ("total", "paid", "pending", "failed", "revenue_inr"):
        assert k in d
    assert d["revenue_inr"] == d["paid"] * 5000


# --- Application numbering increments (no dupes) ------------------------------
def test_application_no_increments_unique():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    nums = []
    for i in range(3):
        r = sess.post(f"{BASE_URL}/api/applications/create-order", json={
            "name": f"TEST_Seq_{i}",
            "father_name": f"TEST_SeqFather_{i}",
            "phone": f"900003{i:04d}",
            "email": f"TEST_seq{i}_{int(time.time())}@example.com",
            "course": "DHM",
        })
        assert r.status_code == 200, r.text
        nums.append(r.json()["application_no"])
    assert len(set(nums)) == 3, f"Duplicate application_no: {nums}"
    # all must match format
    for n in nums:
        assert APP_NO_RE.match(n), n
    # numbers are strictly increasing
    suffixes = [int(n.split("-")[1]) for n in nums]
    assert suffixes[1] == suffixes[0] + 1
    assert suffixes[2] == suffixes[1] + 1


# --- Regression: hero-callback lead with no email still works -----------------
def test_hero_callback_lead_no_email(api):
    r = api.post(f"{BASE_URL}/api/leads", json={
        "name": "TEST_HeroNoEmail",
        "phone": "9000022002",
        "course": "BHM",
        "source": "hero_callback",
    })
    assert r.status_code == 200
    d = r.json()
    assert d["email"] is None
    assert d["status"] == "new"


# --- cleanup ------------------------------------------------------------------
def test_zzz_cleanup_test_data(admin_headers):
    # Delete TEST_* leads
    r = requests.get(f"{BASE_URL}/api/admin/leads", headers=admin_headers)
    if r.status_code == 200:
        for le in r.json():
            if str(le.get("name", "")).startswith("TEST_") or str(le.get("message", "")).startswith("Started application "):
                requests.delete(f"{BASE_URL}/api/admin/leads/{le['id']}", headers=admin_headers)
    # Applications collection cleanup: no public delete endpoint exists; rely on TEST_ prefix names only.
    # Leaving paid TEST_ applications in DB doesn't disrupt other features; numbering uses year-based counter.
