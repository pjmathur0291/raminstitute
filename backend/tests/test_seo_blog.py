"""Iteration 4 — new SEO endpoints: /api/sitemap.xml, /api/robots.txt, blog silo content."""
import os
import re
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://culinary-gateway.preview.emergentagent.com").rstrip("/")

EXPECTED_BLOG_SLUGS = [
    "hotel-management-career-guide-2026",
    "bhm-vs-dhm-which-to-choose",
    "salary-after-hotel-management-india-2026",
    "top-10-skills-luxury-hotel-recruiters",
    "cruise-line-careers-india",
    "scholarships-hotel-management-rihm-2026",
    "becoming-pastry-chef-india",
    "hotel-management-after-12th-2026",
]


# ---------- Sitemap ----------
def test_sitemap_returns_xml():
    r = requests.get(f"{BASE_URL}/api/sitemap.xml", timeout=15)
    assert r.status_code == 200
    assert "application/xml" in r.headers.get("content-type", "")
    assert r.text.startswith("<?xml")


def test_sitemap_contains_static_courses_blogs():
    r = requests.get(f"{BASE_URL}/api/sitemap.xml", timeout=15)
    body = r.text
    # 13 static URLs declared
    static_paths = ["/", "/about", "/courses", "/placements", "/scholarships",
                    "/campus-life", "/gallery", "/blog", "/contact", "/apply",
                    "/career-guide", "/salary-after-hotel-management", "/bhm-vs-diploma"]
    for p in static_paths:
        assert f"<loc>https://ram.institute{p}</loc>" in body, f"missing static {p}"
    # 6 course slugs
    for slug in ["bhm", "mhm", "dhm", "culinary-arts", "bakery-confectionery", "bartending"]:
        assert f"/courses/{slug}" in body, f"missing course {slug}"
    # 8 blog slugs
    for slug in EXPECTED_BLOG_SLUGS:
        assert f"/blog/{slug}" in body, f"missing blog {slug}"


# ---------- robots.txt ----------
def test_robots_text_plain():
    r = requests.get(f"{BASE_URL}/api/robots.txt", timeout=15)
    assert r.status_code == 200
    assert "text/plain" in r.headers.get("content-type", "")
    assert "Sitemap:" in r.text


def test_robots_has_api_sitemap_line():
    """Spec requires 'Sitemap: https://ram.institute/api/sitemap.xml'."""
    r = requests.get(f"{BASE_URL}/api/robots.txt", timeout=15)
    assert "https://ram.institute/api/sitemap.xml" in r.text, \
        f"Sitemap line points to wrong URL: {r.text}"


def test_robots_allows_ai_crawlers():
    """Spec requires Allow directives for GPTBot, ClaudeBot, PerplexityBot."""
    r = requests.get(f"{BASE_URL}/api/robots.txt", timeout=15)
    body = r.text
    for bot in ["GPTBot", "ClaudeBot", "PerplexityBot"]:
        assert bot in body, f"AI crawler {bot} not declared in robots.txt"


# ---------- Blog silo ----------
def test_blog_posts_list_contains_8_silo_posts():
    r = requests.get(f"{BASE_URL}/api/blog/posts", timeout=15)
    assert r.status_code == 200
    posts = r.json()
    slugs = {p["slug"] for p in posts}
    for s in EXPECTED_BLOG_SLUGS:
        assert s in slugs, f"silo blog '{s}' missing"


def test_blog_posts_content_quality():
    r = requests.get(f"{BASE_URL}/api/blog/posts", timeout=15)
    posts = {p["slug"]: p for p in r.json()}
    for s in EXPECTED_BLOG_SLUGS:
        p = posts.get(s)
        assert p is not None
        assert len(p["content"]) > 500, f"{s} content too short ({len(p['content'])})"
        assert p.get("cover_image"), f"{s} missing cover_image"


def test_career_guide_post_keywords():
    r = requests.get(f"{BASE_URL}/api/blog/posts/hotel-management-career-guide-2026", timeout=15)
    assert r.status_code == 200
    body = r.json()["content"]
    for kw in ["Hotel management", "BHM", "DHM", "salary", "70555 47000"]:
        assert kw in body, f"keyword '{kw}' missing from career guide"


# ---------- Lead via footer ----------
def test_footer_callback_lead_creates_with_correct_source():
    payload = {"name": "TEST_Footer_User", "phone": "9876543210", "source": "footer_callback"}
    r = requests.post(f"{BASE_URL}/api/leads", json=payload, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data["source"] == "footer_callback"
    assert data["name"] == "TEST_Footer_User"
    assert "id" in data

    # Admin verification — login and ensure lead is listed
    login = requests.post(f"{BASE_URL}/api/auth/login",
                         json={"email": "admin@ram.institute", "password": "Ram@2026"}, timeout=15)
    assert login.status_code == 200
    token = login.json()["access_token"]
    listing = requests.get(f"{BASE_URL}/api/admin/leads",
                          headers={"Authorization": f"Bearer {token}"}, timeout=15)
    assert listing.status_code == 200
    ids = [x["id"] for x in listing.json()]
    assert data["id"] in ids, "footer lead not found in admin list"


# ---------- Regression ----------
def test_hero_callback_lead_still_works():
    r = requests.post(f"{BASE_URL}/api/leads",
                      json={"name": "TEST_Hero_Reg", "phone": "9123456780", "source": "hero_callback"},
                      timeout=15)
    assert r.status_code == 200
    assert r.json()["source"] == "hero_callback"


def test_courses_list_still_returns_six():
    r = requests.get(f"{BASE_URL}/api/courses", timeout=15)
    assert r.status_code == 200
    assert len(r.json()) >= 6


def test_admin_applications_endpoint_still_works():
    login = requests.post(f"{BASE_URL}/api/auth/login",
                         json={"email": "admin@ram.institute", "password": "Ram@2026"}, timeout=15)
    token = login.json()["access_token"]
    r = requests.get(f"{BASE_URL}/api/admin/applications",
                    headers={"Authorization": f"Bearer {token}"}, timeout=15)
    assert r.status_code == 200
    assert isinstance(r.json(), list)
