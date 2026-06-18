"""RIHM Backend API regression tests."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://culinary-gateway.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@ram.institute"
ADMIN_PASSWORD = "Ram@2026"
EXPECTED_SLUGS = {"bhm", "mhm", "dhm", "culinary-arts", "bakery-confectionery", "bartending"}


@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(api):
    r = api.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# ---------------- Health ----------------
def test_root_health(api):
    r = api.get(f"{BASE_URL}/api/")
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "ok"
    assert data.get("service") == "RIHM API"


# ---------------- Courses ----------------
def test_list_courses(api):
    r = api.get(f"{BASE_URL}/api/courses")
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    slugs = {c["slug"] for c in items}
    assert EXPECTED_SLUGS.issubset(slugs), f"Missing: {EXPECTED_SLUGS - slugs}"
    for c in items:
        assert c["title"] and c["overview"] and c["fee"] and c["duration"]


def test_get_course_bhm(api):
    r = api.get(f"{BASE_URL}/api/courses/bhm")
    assert r.status_code == 200
    c = r.json()
    assert c["slug"] == "bhm"
    assert isinstance(c["curriculum"], list) and len(c["curriculum"]) > 0
    assert isinstance(c["careers"], list) and len(c["careers"]) > 0
    assert isinstance(c["faqs"], list) and len(c["faqs"]) > 0


def test_get_course_not_found(api):
    r = api.get(f"{BASE_URL}/api/courses/nonexistent-xyz")
    assert r.status_code == 404


# ---------------- Lead submission (public) ----------------
def test_create_lead_minimal(api):
    payload = {"name": "TEST_Aman", "phone": "9876543210", "course": "bhm", "source": "hero_callback"}
    r = api.post(f"{BASE_URL}/api/leads", json=payload)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["status"] == "new"
    assert d["name"] == "TEST_Aman"
    assert d["phone"] == "9876543210"
    # UUID id
    uuid.UUID(d["id"])


def test_create_lead_full(api):
    payload = {
        "name": "TEST_Priya",
        "phone": "9123456780",
        "email": "test_priya@example.com",
        "city": "Dehradun",
        "course": "mhm",
        "message": "Need fee details",
        "source": "enquiry",
    }
    r = api.post(f"{BASE_URL}/api/leads", json=payload)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["email"] == "test_priya@example.com"
    assert d["city"] == "Dehradun"
    assert d["status"] == "new"


def test_create_lead_empty_string_optional_fields_coerced_to_none(api):
    """Regression: empty strings for email/city/message must coerce to None (not 422)."""
    payload = {
        "name": "TEST_EmptyStr",
        "phone": "9876501234",
        "email": "",
        "city": "",
        "course": "BHM",
        "message": "",
        "source": "hero_callback",
    }
    r = api.post(f"{BASE_URL}/api/leads", json=payload)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["email"] is None
    assert d["city"] is None
    assert d["message"] is None
    assert d["course"] == "BHM"
    assert d["status"] == "new"


def test_create_lead_phone_too_short(api):
    r = api.post(f"{BASE_URL}/api/leads", json={"name": "X", "phone": "123"})
    assert r.status_code == 422


def test_create_lead_phone_too_long(api):
    r = api.post(f"{BASE_URL}/api/leads", json={"name": "TEST_LongPhone", "phone": "1" * 16})
    assert r.status_code == 422


# ---------------- Auth ----------------
def test_login_success(api):
    r = api.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200
    d = r.json()
    assert "access_token" in d and len(d["access_token"]) > 20
    assert d["user"]["email"] == ADMIN_EMAIL
    assert d["user"]["role"] == "admin"


def test_login_invalid(api):
    r = api.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": "WrongPass"})
    assert r.status_code == 401


def test_me_with_token(api, admin_headers):
    r = api.get(f"{BASE_URL}/api/auth/me", headers=admin_headers)
    assert r.status_code == 200
    assert r.json()["email"] == ADMIN_EMAIL


def test_me_without_token(api):
    r = requests.get(f"{BASE_URL}/api/auth/me")
    assert r.status_code == 401


# ---------------- Admin Leads ----------------
def test_admin_leads_requires_auth(api):
    r = requests.get(f"{BASE_URL}/api/admin/leads")
    assert r.status_code == 401


def test_admin_leads_list(api, admin_headers):
    r = api.get(f"{BASE_URL}/api/admin/leads", headers=admin_headers)
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    assert any(x["name"].startswith("TEST_") for x in items)


def test_admin_leads_status_filter(api, admin_headers):
    r = api.get(f"{BASE_URL}/api/admin/leads?status_filter=new", headers=admin_headers)
    assert r.status_code == 200
    items = r.json()
    for it in items:
        assert it["status"] == "new"


def test_admin_leads_stats(api, admin_headers):
    r = api.get(f"{BASE_URL}/api/admin/leads/stats", headers=admin_headers)
    assert r.status_code == 200
    d = r.json()
    for k in ["total", "new", "contacted", "converted", "last_7_days"]:
        assert k in d and isinstance(d[k], int)
    assert d["total"] >= 2


def test_admin_lead_update_and_delete(api, admin_headers):
    # Create new lead
    payload = {"name": "TEST_Update", "phone": "9000011111", "source": "enquiry"}
    r = api.post(f"{BASE_URL}/api/leads", json=payload)
    lead_id = r.json()["id"]

    # Update status
    r = api.patch(f"{BASE_URL}/api/admin/leads/{lead_id}", json={"status": "contacted"}, headers=admin_headers)
    assert r.status_code == 200
    assert r.json()["status"] == "contacted"

    # Verify via list with filter
    r = api.get(f"{BASE_URL}/api/admin/leads?status_filter=contacted", headers=admin_headers)
    assert any(x["id"] == lead_id for x in r.json())

    # Delete
    r = api.delete(f"{BASE_URL}/api/admin/leads/{lead_id}", headers=admin_headers)
    assert r.status_code == 200
    assert r.json().get("deleted") is True

    # Verify deleted
    r = api.delete(f"{BASE_URL}/api/admin/leads/{lead_id}", headers=admin_headers)
    assert r.status_code == 404


# ---------------- Settings ----------------
def test_settings(api):
    r = api.get(f"{BASE_URL}/api/settings")
    assert r.status_code == 200
    d = r.json()
    for k in ["phone", "whatsapp", "email", "address"]:
        assert k in d and d[k]


# ---------------- Blog ----------------
def test_blog_list_initially(api):
    r = api.get(f"{BASE_URL}/api/blog/posts")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_blog_create_and_get(api, admin_headers):
    slug = "culinary-gateway"
    payload = {
        "slug": slug,
        "title": "TEST Culinary Gateway",
        "excerpt": "Test excerpt",
        "content": "# Hello\nBody",
        "category": "career",
        "author": "Tester",
        "published": True,
    }
    r = api.post(f"{BASE_URL}/api/admin/blog/posts", json=payload, headers=admin_headers)
    assert r.status_code == 200, r.text
    assert r.json()["slug"] == slug

    r = api.get(f"{BASE_URL}/api/blog/posts/{slug}")
    assert r.status_code == 200
    assert r.json()["title"] == "TEST Culinary Gateway"

    # Cleanup
    r = api.delete(f"{BASE_URL}/api/admin/blog/posts/{slug}", headers=admin_headers)
    assert r.status_code == 200


# ---------------- Cleanup TEST_ leads ----------------
def test_zz_cleanup_test_leads(api, admin_headers):
    r = api.get(f"{BASE_URL}/api/admin/leads", headers=admin_headers)
    for lead in r.json():
        if lead["name"].startswith("TEST_"):
            api.delete(f"{BASE_URL}/api/admin/leads/{lead['id']}", headers=admin_headers)
