"""
Shri Ram Institute of Hotel Management — Backend API
FastAPI + MongoDB
Endpoints: auth, leads (admissions enquiries), courses, blog, placements, settings
"""
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
import uuid
import asyncio
import re
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal
from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict, field_validator

# Optional integrations - imported lazily to avoid hard dependency
try:
    import resend  # type: ignore
except Exception:  # pragma: no cover
    resend = None
try:
    from twilio.rest import Client as TwilioClient  # type: ignore
except Exception:  # pragma: no cover
    TwilioClient = None
try:
    import razorpay  # type: ignore
except Exception as _rz_import_err:  # pragma: no cover
    logger_import = logging.getLogger("rihm")
    logger_import.warning(f"[razorpay] SDK import failed: {_rz_import_err}")
    razorpay = None
import hmac
import hashlib

try:
    import certifi
except Exception:  # pragma: no cover
    certifi = None

try:
    from pymongo.server_api import ServerApi
except Exception:  # pragma: no cover
    ServerApi = None  # type: ignore

# ----------------------------------------------------------------------------
# Setup
# ----------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("rihm")


def _strip_env(value: str) -> str:
    return value.strip().strip('"').strip("'")


def _srv_to_standard_url(srv_url: str) -> str:
    """Convert mongodb+srv:// to mongodb:// — fixes SRV DNS + TLS issues on Vercel Lambda."""
    import dns.resolver

    without_scheme = srv_url[len("mongodb+srv://") :]
    creds, rest = (without_scheme.split("@", 1) if "@" in without_scheme else ("", without_scheme))
    host = rest.split("/")[0].split("?")[0]

    srv_records = dns.resolver.resolve(f"_mongodb._tcp.{host}", "SRV")
    nodes = ",".join(
        f"{r.target.to_text(omit_final_dot=True).rstrip('.')}:{r.port}"
        for r in sorted(srv_records, key=lambda x: (x.priority, -x.weight))
    )

    path = ""
    if "/" in rest:
        path_part = rest.split("/", 1)[1]
        db_path = path_part.split("?")[0]
        if db_path:
            path = f"/{db_path}"

    params: list[str] = []
    if "?" in rest:
        params.extend(rest.split("?", 1)[1].split("&"))

    try:
        for txt in dns.resolver.resolve(host, "TXT"):
            for raw in txt.strings:
                params.append(raw.decode() if isinstance(raw, bytes) else raw)
    except Exception:
        pass

    param_map: dict[str, str] = {}
    for p in params:
        if "=" in p:
            k, v = p.split("=", 1)
            param_map[k] = v

    param_map.setdefault("ssl", "true")
    param_map.setdefault("authSource", "admin")
    query = "&".join(f"{k}={v}" for k, v in param_map.items())

    creds_prefix = f"{creds}@" if creds else ""
    return f"mongodb://{creds_prefix}{nodes}{path}?{query}"


def _prepare_mongo_url(url: str) -> str:
    """On Vercel, resolve SRV to a standard URI (serverless DNS often breaks mongodb+srv)."""
    if not url.startswith("mongodb+srv://"):
        return url
    if not os.environ.get("VERCEL"):
        return url
    try:
        standard = _srv_to_standard_url(url)
        logger.info("[mongo] Resolved SRV → standard URI for Vercel")
        return standard
    except Exception as e:
        logger.warning(f"[mongo] SRV resolve failed ({e}); keeping mongodb+srv URL")
        return url


def _mongo_client(url: str) -> AsyncIOMotorClient:
    """Atlas TLS on Vercel/AWS Lambda needs certifi + OCSP check disabled."""
    prepared = _prepare_mongo_url(url)
    kwargs: dict = {
        "serverSelectionTimeoutMS": 15000,
        "connectTimeoutMS": 15000,
        "socketTimeoutMS": 15000,
        "retryWrites": True,
        # Required on Vercel/Lambda — fixes TLSV1_ALERT_INTERNAL_ERROR with Atlas
        "tlsDisableOCSPEndpointCheck": True,
    }
    if certifi is not None:
        kwargs["tlsCAFile"] = certifi.where()
    if ServerApi is not None:
        kwargs["server_api"] = ServerApi("1")
    return AsyncIOMotorClient(prepared, **kwargs)


def _mongo_host_hint(url: str) -> str:
    """Hostname only — safe to expose in /api/health (no credentials)."""
    try:
        rest = url.split("://", 1)[1]
        if "@" in rest:
            rest = rest.split("@", 1)[1]
        return rest.split("/")[0].split("?")[0].split(",")[0]
    except Exception:
        return "unknown"


# Strip accidental quotes from Vercel env paste
mongo_url = _strip_env(os.environ.get("MONGO_URL", ""))
db_name = _strip_env(os.environ.get("DB_NAME", ""))
if not mongo_url or not db_name:
    logger.error("MONGO_URL and DB_NAME must be set in environment variables")
client = _mongo_client(mongo_url) if mongo_url else None
db = client[db_name] if client and db_name else None

JWT_SECRET = os.environ.get('JWT_SECRET', 'change-me')
JWT_ALGORITHM = "HS256"
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@ram.institute')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'Ram@2026')
ADMIN_NAME = os.environ.get('ADMIN_NAME', 'RIHM Admin')

RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', '').strip()
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', '').strip()
APPLICATION_FEE_INR = int(os.environ.get('APPLICATION_FEE_INR', '5000'))

_razorpay_client = None
if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET and razorpay is not None:
    try:
        _razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    except Exception as e:  # pragma: no cover
        logger.warning(f"[razorpay] init failed: {e}")
        _razorpay_client = None

app = FastAPI(title="RIHM API", version="1.0.0")
api = APIRouter(prefix="/api")


# ----------------------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------------------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_admin(request: Request) -> dict:
    auth_header = request.headers.get("Authorization", "")
    token = auth_header[7:] if auth_header.startswith("Bearer ") else None
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        if user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin only")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


# ----------------------------------------------------------------------------
# Notifications (graceful skip if keys missing)
# ----------------------------------------------------------------------------
async def send_email_notification(subject: str, html: str) -> None:
    """Send email via Gmail SMTP (or any SMTP). Falls back to Resend if SMTP not configured."""
    notify_to_raw = os.environ.get("NOTIFY_EMAIL", "").strip()
    recipients = [e.strip() for e in notify_to_raw.split(",") if e.strip()]
    if not recipients:
        logger.info("[email] skipped - no recipients")
        return

    # Prefer SMTP (Gmail) when configured
    smtp_host = os.environ.get("SMTP_HOST", "").strip()
    smtp_user = os.environ.get("SMTP_USER", "").strip()
    smtp_pass = os.environ.get("SMTP_PASSWORD", "").strip()
    if smtp_host and smtp_user and smtp_pass:
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart

        smtp_port = int(os.environ.get("SMTP_PORT", "587"))
        sender_name = os.environ.get("SENDER_NAME", "RIHM Admissions")
        sender_email = os.environ.get("SENDER_EMAIL", smtp_user)

        def _send():
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{sender_name} <{sender_email}>"
            msg["To"] = ", ".join(recipients)
            msg.attach(MIMEText(html, "html"))
            with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.sendmail(sender_email, recipients, msg.as_string())

        try:
            await asyncio.to_thread(_send)
            logger.info(f"[email/smtp] sent to {recipients}")
            return
        except Exception as e:
            logger.warning(f"[email/smtp] failed: {e}")
            return

    # Fallback: Resend
    api_key = os.environ.get("RESEND_API_KEY", "").strip()
    if api_key and resend is not None:
        sender = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev").strip()
        try:
            resend.api_key = api_key
            params = {"from": sender, "to": recipients, "subject": subject, "html": html}
            await asyncio.to_thread(resend.Emails.send, params)
            logger.info(f"[email/resend] sent to {recipients}")
            return
        except Exception as e:
            logger.warning(f"[email/resend] failed: {e}")
            return

    logger.info("[email] skipped - no SMTP or Resend keys configured")


# ExtraaEdge CRM — integration webhook (env override optional; typo alias supported)
DEFAULT_EXTRAEEDGE_WEBHOOK_URL = (
    "https://eeintegration.extraaedge.com/api/integration/Fru3LCCmak2EA8CM"
)

_COURSE_CRM_NAMES: dict[str, str] = {
    "bhm": "Bachelor of Hotel Management (BHM)",
    "mhm": "Master of Hotel Management (MHM)",
    "dhm": "Diploma in Hotel Management (DHM)",
    "culinary arts": "Diploma in Culinary Arts",
    "bakery": "Diploma in Bakery & Confectionery",
    "bartending": "Diploma in Bartending & Mixology",
    "b.sc nursing": "B.Sc Nursing",
    "bsc nursing": "B.Sc Nursing",
}


def _crm_webhook_url() -> str:
    for key in ("EXTRAEEDGE_WEBHOOK_URL", "EXTRAAEDGE_WEBHOOK_URL"):
        val = os.environ.get(key, "").strip()
        if val:
            return val
    return DEFAULT_EXTRAEEDGE_WEBHOOK_URL


def _crm_course(course: Optional[str]) -> str:
    if not course:
        return ""
    mapped = _COURSE_CRM_NAMES.get(course.strip().lower())
    return mapped or course.strip()


def _split_name(full_name: str) -> tuple[str, str]:
    parts = (full_name or "").strip().split(None, 1)
    if not parts:
        return ("", "")
    if len(parts) == 1:
        return (parts[0], ".")
    return (parts[0], parts[1])


def _crm_phone(phone: str) -> str:
    digits = "".join(c for c in (phone or "") if c.isdigit())
    if len(digits) == 10:
        return f"91{digits}"
    return digits or phone


def _lead_crm_payload(lead: dict) -> dict:
    first, last = _split_name(lead.get("name", ""))
    phone = _crm_phone(lead.get("phone", ""))
    course = _crm_course(lead.get("course"))
    payload = {
        "FirstName": first,
        "LastName": last,
        "Name": lead.get("name", ""),
        "MobileNumber": phone,
        "Email": lead.get("email") or "",
        "Course": course,
        "Source": (lead.get("source") or os.environ.get("EXTRAEEDGE_SOURCE") or "Website").strip(),
        "Institute": "Shri Ram Institute of Hotel Management",
    }
    if lead.get("city"):
        payload["City"] = lead["city"]
    if lead.get("message"):
        payload["Remarks"] = lead["message"]
    return payload


async def send_crm_webhook(lead: dict) -> None:
    """Forward lead to ExtraaEdge CRM integration webhook."""
    url = _crm_webhook_url()
    if not url:
        logger.info("[crm] skipped - no webhook URL")
        return

    import json
    from urllib import error, request

    payload = _lead_crm_payload(lead)
    timeout = int(os.environ.get("EXTRAEEDGE_TIMEOUT", "30"))

    def _post() -> str:
        data = json.dumps(payload).encode("utf-8")
        req = request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with request.urlopen(req, timeout=timeout) as resp:
            return resp.read().decode()

    try:
        body = await asyncio.to_thread(_post)
        logger.info(f"[crm] sent lead {lead.get('phone', '')} — {body[:200]}")
    except error.HTTPError as e:
        detail = e.read().decode() if e.fp else str(e)
        logger.warning(f"[crm] HTTP {e.code}: {detail[:300]}")
        raise
    except Exception as e:
        logger.warning(f"[crm] failed: {e}")
        raise


async def send_whatsapp_notification(body: str) -> None:
    sid = os.environ.get("TWILIO_ACCOUNT_SID", "").strip()
    token = os.environ.get("TWILIO_AUTH_TOKEN", "").strip()
    sender = os.environ.get("TWILIO_WHATSAPP_FROM", "").strip()
    to = os.environ.get("NOTIFY_WHATSAPP", "").strip()
    if not sid or not token or not sender or not to or TwilioClient is None:
        logger.info("[whatsapp] skipped - keys not configured")
        return
    try:
        tw = TwilioClient(sid, token)
        await asyncio.to_thread(lambda: tw.messages.create(from_=sender, to=to, body=body))
        logger.info(f"[whatsapp] sent to {to}")
    except Exception as e:
        logger.warning(f"[whatsapp] failed: {e}")


# ----------------------------------------------------------------------------
# Models
# ----------------------------------------------------------------------------
class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class LeadCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str = Field(min_length=2, max_length=80)
    phone: str = Field(min_length=10, max_length=15)
    email: Optional[EmailStr] = None
    city: Optional[str] = None
    course: Optional[str] = None
    message: Optional[str] = None
    source: str = "website"  # hero_callback | enquiry | brochure | scholarship | campus_visit | whatsapp

    @field_validator("email", "city", "course", "message", mode="before")
    @classmethod
    def _empty_to_none(cls, v):
        if isinstance(v, str) and v.strip() == "":
            return None
        return v


class LeadOut(BaseModel):
    id: str
    name: str
    phone: str
    email: Optional[str] = None
    city: Optional[str] = None
    course: Optional[str] = None
    message: Optional[str] = None
    source: str
    status: str
    created_at: str
    notes: Optional[str] = None


class LeadUpdate(BaseModel):
    status: Optional[Literal["new", "contacted", "qualified", "converted", "rejected"]] = None
    notes: Optional[str] = None


class CourseModel(BaseModel):
    id: str
    slug: str
    title: str
    short_title: str
    duration: str
    level: str  # degree | masters | diploma | certificate
    eligibility: str
    fee: str
    overview: str
    curriculum: List[str] = []
    careers: List[str] = []
    salary: str = ""
    faqs: List[dict] = []
    hero_image: Optional[str] = None
    icon: Optional[str] = None
    is_active: bool = True
    created_at: str = Field(default_factory=iso_now)


class CourseUpsert(BaseModel):
    slug: str
    title: str
    short_title: str
    duration: str
    level: str
    eligibility: str
    fee: str
    overview: str
    curriculum: List[str] = []
    careers: List[str] = []
    salary: str = ""
    faqs: List[dict] = []
    hero_image: Optional[str] = None
    icon: Optional[str] = None
    is_active: bool = True


class BlogPostModel(BaseModel):
    id: str
    slug: str
    title: str
    excerpt: str
    content: str
    category: str
    author: str = "RIHM Editorial"
    cover_image: Optional[str] = None
    published: bool = True
    created_at: str = Field(default_factory=iso_now)


class BlogPostUpsert(BaseModel):
    slug: str
    title: str
    excerpt: str
    content: str
    category: str
    author: str = "RIHM Editorial"
    cover_image: Optional[str] = None
    published: bool = True


# ---- Application / Registration (paid) ----
class ApplicationCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str = Field(min_length=2, max_length=80)
    father_name: str = Field(min_length=2, max_length=80)
    phone: str = Field(min_length=10, max_length=15)
    email: EmailStr
    course: str = Field(min_length=2, max_length=80)


class ApplicationOut(BaseModel):
    id: str
    name: str
    father_name: str
    phone: str
    email: str
    course: str
    application_no: str
    payment_status: str  # pending | paid | failed
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    amount_inr: int
    created_at: str
    paid_at: Optional[str] = None


class CreateOrderOut(BaseModel):
    application_id: str
    application_no: str
    razorpay_key_id: str
    razorpay_order_id: str
    amount_paise: int
    amount_inr: int
    currency: str
    prefill: dict
    test_mode: bool


class VerifyPaymentIn(BaseModel):
    application_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


# ----------------------------------------------------------------------------
# Startup: seed admin, indexes, default courses
# ----------------------------------------------------------------------------
DEFAULT_COURSES = [
    {
        "slug": "bhm",
        "title": "Bachelor of Hotel Management (BHM)",
        "short_title": "BHM",
        "duration": "3 Years (6 Semesters)",
        "level": "degree",
        "eligibility": "10+2 with minimum 45% marks from a recognised board",
        "fee": "₹1,15,000 / year (Scholarships available)",
        "overview": "Our flagship 3-year Bachelor of Hotel Management degree blends rigorous academic depth with 70% practical exposure across five core operational departments — Food Production, Food & Beverage Service, Front Office, Housekeeping, and Hospitality Management. With international curriculum standards and direct industry placement pathways into Taj, Oberoi, ITC, Hyatt and Marriott, our BHM is designed for students who aspire to lead 5-star hospitality teams across India and globally.",
        "curriculum": [
            "Foundation Food Production & Patisserie",
            "Food & Beverage Service Operations",
            "Front Office Management & Reservations",
            "Accommodation & Housekeeping Operations",
            "Hotel Accounting and Cost Control",
            "Hospitality Law & Industrial Relations",
            "Hotel French / Communication Skills",
            "Industrial Training (22-week paid internship)",
            "Sales, Marketing & Revenue Management",
            "Strategic Management & Entrepreneurship",
        ],
        "careers": [
            "Management Trainee at 5-star hotel chains",
            "Front Office Executive",
            "Food & Beverage Manager",
            "Banquet & Conference Manager",
            "Executive Chef / Sous Chef",
            "Revenue & Sales Manager",
            "Cruise Liner Hospitality Officer",
            "Airline Cabin Crew",
            "Restaurant / Cloud Kitchen Entrepreneur",
        ],
        "salary": "₹3.5 LPA to ₹8 LPA starting; ₹15-25 LPA at senior levels",
        "faqs": [
            {"q": "Is BHM a good career choice in 2026?", "a": "Yes. India's hospitality sector is projected to reach US$418 billion by 2032 with over 1.5 crore new jobs. BHM graduates are in record demand across luxury hotels, cruise lines, QSR chains and aviation."},
            {"q": "Do you guarantee placement after BHM?", "a": "Our placement record stands at 97% with direct campus drives by Taj, Oberoi, ITC, Hyatt, Marriott, Accor and IHG. Our placement cell handles aptitude prep, GD-PI training and mock interviews."},
            {"q": "Are scholarships available?", "a": "Yes. Merit, Need-based, Girl-Child and Hospitality Excellence scholarships are awarded every year. Apply with our scholarship form."},
        ],
        "hero_image": "https://ram.institute/images/students/taj/taj-rambagh-group.webp",
        "icon": "graduation-cap",
    },
    {
        "slug": "mhm",
        "title": "Master of Hotel Management (MHM)",
        "short_title": "MHM",
        "duration": "2 Years (4 Semesters)",
        "level": "masters",
        "eligibility": "Bachelor's degree (any stream) with minimum 50% marks; BHM graduates preferred",
        "fee": "₹1,35,000 / year",
        "overview": "The Master of Hotel Management is a 2-year postgraduate specialisation for working professionals and BHM graduates aspiring to senior hospitality leadership. Curriculum covers Strategic Hospitality Management, Revenue Operations, Luxury Brand Marketing, Hotel Real Estate, Financial Analysis and Global Hospitality Trends — taught by industry veterans from Taj, Oberoi and Marriott.",
        "curriculum": [
            "Strategic Hospitality Management",
            "Hotel Financial Management & Accounting",
            "Revenue Management & Pricing Strategy",
            "Luxury Brand & Marketing Management",
            "Human Resource Management in Hospitality",
            "Hotel Real Estate & Asset Management",
            "Service Quality & Operations Research",
            "International Cuisine & Wine Studies",
            "Dissertation / Industry Capstone Project",
        ],
        "careers": [
            "Hotel General Manager",
            "Director of Operations",
            "Revenue Director",
            "Corporate Trainer / Faculty",
            "Brand Manager - Luxury Hotel Chains",
            "Hospitality Consultant",
            "Hotel Acquisition & Asset Manager",
        ],
        "salary": "₹6 LPA to ₹12 LPA starting; ₹30+ LPA at senior levels",
        "faqs": [
            {"q": "Who should pursue MHM?", "a": "Working hospitality professionals seeking promotion to managerial roles, BHM graduates planning specialisation, or career-changers from related streams (commerce, tourism, business) seeking entry into hospitality leadership."},
        ],
        "hero_image": "https://ram.institute/images/students/oberoi/kajal-oberoi-sukhvillas.webp",
        "icon": "award",
    },
    {
        "slug": "dhm",
        "title": "Diploma in Hotel Management (DHM)",
        "short_title": "DHM",
        "duration": "1 Year (2 Semesters)",
        "level": "diploma",
        "eligibility": "10+2 pass from a recognised board (any stream)",
        "fee": "₹85,000 / year",
        "overview": "Our fast-track 1-year Diploma in Hotel Management is designed for students seeking quick industry entry. With 80% practical training and 100% placement assistance, DHM graduates step into entry-level roles at 5-star hotels and 3-4 star properties within 12 months of joining. Ideal launchpad for those who want to start earning quickly.",
        "curriculum": [
            "Food Production Fundamentals",
            "Bakery & Confectionery Basics",
            "Food & Beverage Service",
            "Front Office Operations",
            "Housekeeping Skills",
            "Hospitality Communication",
            "Industrial Training (16-week paid internship)",
        ],
        "careers": [
            "Commis Chef I/II",
            "Food & Beverage Attendant",
            "Front Office Associate",
            "Housekeeping Supervisor",
            "Banquet Operations Assistant",
        ],
        "salary": "₹2.4 LPA to ₹4 LPA starting",
        "faqs": [
            {"q": "Can I do BHM after DHM?", "a": "Yes. DHM graduates can do lateral entry into our BHM program directly in Year 2 with full credit transfer."},
        ],
        "hero_image": "https://ram.institute/images/students/taj/monika-taj.webp",
        "icon": "clipboard-list",
    },
    {
        "slug": "culinary-arts",
        "title": "Diploma in Culinary Arts",
        "short_title": "Culinary Arts",
        "duration": "1 Year",
        "level": "certificate",
        "eligibility": "10+2 pass; passion for cooking",
        "fee": "₹95,000 / year",
        "overview": "A specialised culinary diploma for aspiring chefs. Train across Indian Regional, Continental, Pan-Asian and Mediterranean cuisines in our state-of-the-art training kitchens. Learn knife skills, butchery, garde manger, hot kitchen, sauces, plating, modern gastronomy and kitchen leadership from industry-trained Master Chefs.",
        "curriculum": [
            "Knife Skills & Mise-en-Place",
            "Indian Regional Cuisines (North, South, East, West)",
            "Continental Cuisine (French, Italian, Spanish)",
            "Pan-Asian Cuisine (Chinese, Thai, Japanese)",
            "Sauce Making & Stocks",
            "Garde Manger & Cold Kitchen",
            "Butchery & Larder",
            "Modern Gastronomy & Plating",
            "Restaurant Kitchen Internship",
        ],
        "careers": [
            "Commis Chef at 5-star hotels",
            "Specialty Restaurant Chef",
            "Private Chef / Personal Chef",
            "Cloud Kitchen Owner",
            "Culinary Content Creator",
            "Cruise Liner Chef",
        ],
        "salary": "₹3 LPA to ₹6 LPA starting",
        "faqs": [],
        "hero_image": "https://ram.institute/images/students/taj/taj-rambagh-palace-1.webp",
        "icon": "utensils",
    },
    {
        "slug": "bakery-confectionery",
        "title": "Diploma in Bakery & Confectionery",
        "short_title": "Bakery",
        "duration": "1 Year",
        "level": "certificate",
        "eligibility": "10+2 pass",
        "fee": "₹85,000 / year",
        "overview": "Master the art of artisan bread, French patisserie, chocolate work and contemporary desserts. Our bakery lab is equipped with industrial deck ovens, dough sheeters, chocolate tempering machines and patisserie tools used in 5-star hotel pastry sections. Graduates work at Taj Patisserie, Theobroma, L'Opéra and global bakeries.",
        "curriculum": [
            "Artisan Bread Making",
            "French Patisserie & Pastries",
            "Chocolate & Confectionery Work",
            "Plated Desserts & Entremets",
            "Cake Design & Sugar Craft",
            "Viennoiseries & Croissants",
            "Bakery Business Management",
            "Pastry Section Internship",
        ],
        "careers": [
            "Pastry Chef at 5-star hotels",
            "Artisan Bakery Owner",
            "Cake Designer",
            "Chocolatier",
            "Patisserie Boutique Manager",
        ],
        "salary": "₹2.8 LPA to ₹5.5 LPA starting",
        "faqs": [],
        "hero_image": "https://ram.institute/images/students/taj/amit-giri-taj.webp",
        "icon": "cake",
    },
    {
        "slug": "bartending",
        "title": "Diploma in Bartending & Mixology",
        "short_title": "Bartending",
        "duration": "6 Months",
        "level": "certificate",
        "eligibility": "18+ years; 10+2 pass",
        "fee": "₹65,000 / total",
        "overview": "Train as a certified mixologist in our fully equipped mock bar lab. Learn classic & contemporary cocktails, wine & spirits knowledge, flair bartending, bar operations and guest interaction. With cruise lines, luxury bars and high-end restaurants hiring trained bartenders at premium salaries, this is one of the fastest-growth careers in hospitality.",
        "curriculum": [
            "Classic Cocktails (50+ recipes)",
            "Contemporary & Molecular Mixology",
            "Wine Studies & Sommelier Basics",
            "Spirits Knowledge (Whisky, Gin, Rum, Vodka, Tequila)",
            "Flair Bartending Techniques",
            "Bar Operations & Inventory",
            "Coffee & Tea Mastery",
            "Bar Internship at 5-star hotel",
        ],
        "careers": [
            "Bartender / Mixologist at luxury hotels",
            "Cruise Liner Bartender (USD salary)",
            "Bar Manager",
            "Beverage Trainer",
            "Cocktail Bar Entrepreneur",
        ],
        "salary": "₹3 LPA to ₹8 LPA + tips; USD 1500-2500/month on cruise lines",
        "faqs": [],
        "hero_image": "https://ram.institute/images/students/taj/chandra-taj-devi-ratan.webp",
        "icon": "wine",
    },
]


DEFAULT_BLOG_POSTS = [
    {
        "slug": "hotel-management-career-guide-2026",
        "title": "The Complete Hotel Management Career Guide for 2026 — From BHM to Hotel General Manager",
        "excerpt": "Everything a class XII pass-out needs to know about a career in hotel management — courses, fees, top colleges in Dehradun & Uttarakhand, salary expectations, placement opportunities and growth pathways.",
        "category": "Hotel Management Careers",
        "cover_image": "https://ram.institute/images/students/taj/taj-rambagh-group.webp",
        "content": (
            "Hotel management is one of India's fastest-growing professional career streams, with the hospitality sector projected to add 1.5 crore new jobs by 2032 and reach US$418 billion in market size. If you're a class XII pass-out evaluating your career options in 2026, this guide explains exactly what hotel management is, why students in Dehradun, Rishikesh, Haridwar, Roorkee, Haldwani, Saharanpur, Chandigarh, Shimla and Delhi NCR increasingly choose RIHM, and what your earning trajectory looks like.\n\n"
            "What is hotel management?\n"
            "Hotel management is the academic and professional discipline of operating hospitality businesses — luxury hotels, boutique resorts, fine-dining restaurants, bakeries, bars, cruise lines, banquet venues and corporate guest relations. The discipline blends practical craft skills (food production, food & beverage service, housekeeping, front office, bartending) with management capabilities (revenue management, marketing, finance, HR).\n\n"
            "Best hotel management courses after 12th\n"
            "The four primary entry points after class XII are: 1) Bachelor of Hotel Management (BHM) — a 3-year degree, India's most respected hospitality qualification, eligible for management-trainee programs at Taj, Oberoi, ITC, Hyatt and Marriott. 2) Diploma in Hotel Management (DHM) — a 1-year fast-track diploma for students who want to start earning quickly. 3) Specialised diplomas — Culinary Arts, Bakery & Confectionery, Bartending & Mixology — 6 to 12 months. 4) After working for a few years, BHM graduates can pursue Master of Hotel Management (MHM) for senior leadership roles.\n\n"
            "Top hotel management colleges in Dehradun & Uttarakhand\n"
            "Shri Ram Institute of Hotel Management (RIHM) Dehradun, established 1999, is among the most placement-focused private hotel management colleges in North India with a 97% placement rate at Taj Hotels (300+ alumni), ITC Hotels (130+), Hyatt (100+), Oberoi (150+), Marriott (120+), Accor (80+), IHG (70+) and Radisson Blu (60+).\n\n"
            "Hotel management salary in India in 2026\n"
            "Entry-level salaries: DHM ₹2.4–4 LPA • BHM ₹3.5–8 LPA • MHM ₹6–12 LPA. Specialised roles — Bartender ₹3–8 LPA plus tips, Pastry Chef ₹2.8–5.5 LPA, Cruise Line Bartender USD 1,500–2,500/month, Hotel General Manager ₹30 LPA+. Hospitality is one of the few industries where talented professionals can become General Manager of a 5-star property by their late 30s.\n\n"
            "How to start your hotel management career today\n"
            "Speak with a senior admissions counsellor at RIHM Dehradun — call +91 70555 47000 or apply online at /apply (₹5,000 application fee, Razorpay payment). Limited 47 seats remaining for the 2026 batch. Scholarships of up to ₹75,000 are available for merit, girl child, defence wards, sibling and need-based categories."
        ),
    },
    {
        "slug": "bhm-vs-dhm-which-to-choose",
        "title": "BHM vs DHM: Which Hotel Management Course Should You Choose?",
        "excerpt": "Bachelor of Hotel Management (3 years) or Diploma in Hotel Management (1 year)? A practical comparison on duration, career outcomes, salary, scholarship eligibility and ROI for students in Dehradun, Uttarakhand and North India.",
        "category": "Admissions",
        "cover_image": "https://ram.institute/images/students/oberoi/kajal-oberoi-sukhvillas.webp",
        "content": (
            "BHM vs DHM is the single most common question we hear from students considering hotel management at RIHM Dehradun. Both programs lead to luxury hotel jobs — but they suit different student profiles. Here's a frank comparison.\n\n"
            "BHM (Bachelor of Hotel Management) — 3 years, 6 semesters\n"
            "Eligibility: 10+2 with 45%+. Curriculum: Food Production, F&B Service, Front Office, Housekeeping, Revenue Management, Hospitality Law, Industrial Training (22-week paid internship). Career outcome: Management Trainee at Taj/Oberoi/ITC, fast-track to Assistant Manager in 3–4 years, General Manager track. Starting salary: ₹3.5–8 LPA.\n\n"
            "DHM (Diploma in Hotel Management) — 1 year, 2 semesters\n"
            "Eligibility: 10+2 pass. Curriculum: condensed practical training across all 5 operational departments + 16-week paid industrial training. Career outcome: Commis Chef, Front Office Associate, F&B Attendant, Housekeeping Supervisor. Starting salary: ₹2.4–4 LPA.\n\n"
            "Which should YOU pick?\n"
            "Choose BHM if: you want management roles, can invest 3 years, target ₹6 LPA+ salaries within 5 years, want to do MHM later. Choose DHM if: you want to start earning within 12 months, prefer hands-on craft over management theory, plan to upgrade to BHM via lateral entry later (RIHM accepts DHM graduates directly into Year 2 of BHM with full credit transfer).\n\n"
            "Apply for 2026 batch at RIHM Dehradun — call +91 70555 47000 or visit /apply. Scholarships up to ₹75K available."
        ),
    },
    {
        "slug": "salary-after-hotel-management-india-2026",
        "title": "Salary After Hotel Management in India (2026) — Realistic Numbers Across All Roles",
        "excerpt": "Detailed salary breakdown for hotel management graduates in 2026 across roles, cities and chains — starting CTC at Taj, Oberoi, ITC, Hyatt; how salary scales with experience; cruise line USD compensation.",
        "category": "Hospitality Industry Trends",
        "cover_image": "https://ram.institute/images/students/taj/taj-rambagh-palace-1.webp",
        "content": (
            "What is the realistic salary after hotel management in India in 2026? This guide gives honest, role-by-role numbers based on RIHM Dehradun's 7000+ alumni placement record.\n\n"
            "Starting CTC by qualification\n"
            "DHM (1-yr diploma): ₹2.4–4 LPA  •  BHM (3-yr degree): ₹3.5–8 LPA  •  MHM (postgraduate): ₹6–12 LPA  •  Specialised diplomas (Culinary/Bakery/Bartending): ₹2.8–5.5 LPA + tips.\n\n"
            "Salary by role at 5-star hotels\n"
            "Commis Chef I/II: ₹3–4.5 LPA  •  Front Office Associate: ₹3.2–4 LPA  •  F&B Executive: ₹3.5–5 LPA  •  Bartender at luxury bar: ₹3–8 LPA + service charge tips  •  Pastry Chef: ₹3–6 LPA  •  Banquet Executive: ₹3.8–5 LPA  •  Management Trainee (BHM): ₹4.5–7 LPA.\n\n"
            "How salary scales with experience\n"
            "3 years experience — ₹6–10 LPA (typical role: Senior Associate / Assistant Manager). 5–7 years — ₹10–18 LPA (Department Manager). 10+ years — ₹18–35 LPA (Head of Department / Executive Chef). 15+ years — ₹35 LPA to ₹1 Cr+ (General Manager, Director of Operations, Hotel Owner).\n\n"
            "International & cruise line compensation\n"
            "Cruise lines (Royal Caribbean, MSC, Carnival, Norwegian, Princess) hire entry-level Indian hospitality talent at USD 1,500–2,500/month plus tips, free food and accommodation — that's ₹12–25 LPA effective for entry-level. Middle East luxury hotels (Burj Al Arab, Atlantis The Palm, Conrad Dubai) pay 30–50% above Indian rates.\n\n"
            "RIHM Dehradun graduates have been placed across all these salary tiers. Apply for 2026 admission at /apply."
        ),
    },
    {
        "slug": "top-10-skills-luxury-hotel-recruiters",
        "title": "Top 10 Skills Luxury Hotel Recruiters Look For in 2026",
        "excerpt": "Taj, Oberoi, ITC and Hyatt look beyond your degree marksheet. Here are the 10 specific skills RIHM Dehradun trains every student in — that 5-star hotel chains can't find enough of.",
        "category": "Hospitality Industry Trends",
        "cover_image": "https://ram.institute/images/students/taj/taj-club.webp",
        "content": (
            "What makes a hotel management student stand out at a Taj or Oberoi campus drive? After 26 years of placing 7000+ alumni, RIHM Dehradun has identified the 10 skills that consistently win offers from India's top luxury hotel chains.\n\n"
            "1. Spoken English & guest etiquette — Confidence with international guests is non-negotiable. 2. Knife skills & kitchen brigade discipline — Even non-chef tracks must understand kitchen operations. 3. Wine, spirits and cocktail knowledge — Demanded across F&B and bartender roles. 4. OPERA/PMS proficiency — Most 5-star front offices run on OPERA. 5. Service sequence mastery — French service, silver service, banquet, room service. 6. Grooming, posture and uniform discipline. 7. Crisis handling & complaint resolution — The 'how would you handle' interview round. 8. Cross-cultural sensitivity — Serving guests from 100+ countries. 9. Sales aptitude — Upselling is a 5-star revenue driver. 10. Stamina and team spirit — Hospitality is a team craft.\n\n"
            "RIHM trains every student in all 10 skills across BHM/MHM/DHM/Culinary/Bakery/Bartending programs. Apply at /apply."
        ),
    },
    {
        "slug": "cruise-line-careers-india",
        "title": "Cruise Line Careers from India: USD Salary, Free Travel & Global Networks",
        "excerpt": "Royal Caribbean, MSC, Carnival, Norwegian and Princess Cruises actively recruit trained Indian hospitality professionals. RIHM's complete guide to cruise line careers — compensation, role profiles, STCW certification and recruitment cycles.",
        "category": "Placements",
        "cover_image": "https://ram.institute/images/students/taj/amit-giri-taj.webp",
        "content": (
            "Cruise ships are floating 5-star hotels — and the world's largest cruise companies actively recruit Indian hospitality professionals every year. RIHM Dehradun has placed alumni on Royal Caribbean, MSC Cruises, Carnival, Norwegian and Princess Cruises since 2008.\n\n"
            "Why cruise line careers attract young Indians\n"
            "1. USD compensation — Entry-level USD 1,500–2,500/month plus tips. 2. Free accommodation + 3 meals/day on-board. 3. Visa 6-month contracts → 2 months off rotation. 4. Travel the world — Caribbean, Mediterranean, Alaska, Asia. 5. International network — Open to Middle East / European hotel jobs after 1–2 contracts.\n\n"
            "Roles for hotel management graduates on cruise ships\n"
            "Restaurant Steward, Bartender, Galley/Hot Kitchen, Pastry, Cabin Steward, Front Desk Assistant, Guest Relations Officer.\n\n"
            "How to start\n"
            "RIHM offers exclusive on-campus cruise line interviews, STCW certification guidance and pre-cruise documentation/visa support. Apply at /apply or call +91 70555 47000."
        ),
    },
    {
        "slug": "scholarships-hotel-management-rihm-2026",
        "title": "6 Scholarships You Can Avail for Hotel Management in 2026 at RIHM",
        "excerpt": "Merit, Need-Based, Girl Child, Defence Wards — discover ₹3 crore worth of scholarships RIHM Dehradun awards every year and the exact eligibility criteria for each.",
        "category": "Scholarships",
        "cover_image": "https://ram.institute/images/students/oberoi/amisha-oberoi-gurugram.webp",
        "content": (
            "RIHM Dehradun awards over ₹3 crore in scholarships every academic year across six categories. Here's how to qualify.\n\n"
            "1. Merit Scholarship — Up to ₹50,000 for 10+2 score above 80%.\n"
            "2. Girl Child Scholarship — Up to ₹40,000 for all women applicants.\n"
            "3. Need-Based Aid — Up to ₹60,000 for annual family income below ₹4 LPA.\n"
            "4. Hospitality Excellence — Up to ₹75,000 for sports/cultural/co-curricular distinction.\n"
            "5. Defence Wards — 20% fee waiver for children of armed forces/paramilitary.\n"
            "6. Sibling Discount — ₹25,000 for siblings of current students or alumni.\n\n"
            "Application process: 1) Submit online application at /apply with ₹5,000 fee. 2) Submit class 10/12 marksheets + ID proof + income certificate. 3) Scholarship review within 7 working days. 4) Receive scholarship letter and join 2026 batch.\n\n"
            "Most students qualify for at least one scholarship — speak to our counsellor at +91 70555 47000 to check your eligibility."
        ),
    },
    {
        "slug": "becoming-pastry-chef-india",
        "title": "How to Become a Pastry Chef in India — RIHM's Complete Roadmap",
        "excerpt": "From RIHM's 1-year Bakery & Confectionery Diploma to leading the patisserie section of a 5-star hotel — your step-by-step roadmap from our Master Chef faculty.",
        "category": "Bakery",
        "cover_image": "https://ram.institute/images/students/taj/amit-giri-taj.webp",
        "content": (
            "India's artisan bakery boom — Theobroma, L'Opéra, Magnolia Bakery, Taj Patisserie, ITC Fabelle — has made the pastry chef one of the most sought-after hospitality roles of 2026. Here's RIHM Dehradun's complete roadmap.\n\n"
            "Step 1: Diploma in Bakery & Confectionery (1 year)\n"
            "RIHM's flagship bakery program covers Artisan Bread Making, French Patisserie, Chocolate Work, Plated Desserts, Cake Design, Sugar Craft, Viennoiseries and Bakery Business Management. Industrial-grade deck ovens, dough sheeters and chocolate tempering machines.\n\n"
            "Step 2: Industrial Training (12-week paid internship)\n"
            "Direct placement in pastry sections of Taj/Oberoi/ITC luxury hotels and standalone artisan bakeries.\n\n"
            "Step 3: Commis Pastry → Demi → Chef de Partie\n"
            "Career progression: Commis ₹2.8 LPA → Demi Chef ₹3.5 LPA → CDP ₹5 LPA → Sous Chef ₹8 LPA → Executive Pastry Chef ₹15+ LPA.\n\n"
            "Apply at /apply or call +91 70555 47000."
        ),
    },
    {
        "slug": "hotel-management-after-12th-2026",
        "title": "Hotel Management After 12th in 2026 — Step-by-Step Guide for Students in Uttarakhand",
        "excerpt": "Just finished class XII? Here's exactly what to do next if you're considering hotel management — from college selection to entrance prep to first day of college.",
        "category": "Admissions",
        "cover_image": "https://ram.institute/images/students/taj/monika-taj.webp",
        "content": (
            "Hotel management after 12th is one of the smartest career decisions Uttarakhand students make in 2026. Here's the complete step-by-step guide.\n\n"
            "Step 1: Pick your program (BHM 3yr / DHM 1yr / specialised diploma)\n"
            "Step 2: Shortlist colleges — In Dehradun, RIHM is among the top private institutes with 97% placement at Taj/Oberoi/ITC.\n"
            "Step 3: Submit online application — RIHM application fee ₹5,000 at /apply. Razorpay UPI/Card/Netbanking.\n"
            "Step 4: Personal Interaction — RIHM's counsellor will assess your goals + recommend course + scholarship category.\n"
            "Step 5: Submit documents — Class 10/12 marksheets + ID + photographs.\n"
            "Step 6: Pay first-semester fee + join hostel (for outstation students from Rishikesh, Haridwar, Saharanpur, Chandigarh, HP).\n"
            "Step 7: Start your hospitality career on Day 1 of college — RIHM's practical training begins from Week 1.\n\n"
            "Limited 47 seats remaining for 2026. Apply at /apply or call +91 70555 47000."
        ),
    },
]


@app.on_event("startup")
async def startup_event():
    if db is None:
        logger.error("[startup] skipped — MONGO_URL or DB_NAME not set")
        return
    try:
        await client.admin.command("ping")
        logger.info("[startup] MongoDB ping OK")
    except Exception as e:
        logger.error(f"[startup] MongoDB ping failed: {e}")
        return
    try:
        # Indexes
        await db.users.create_index("email", unique=True)
        await db.users.create_index("id", unique=True)
        await db.leads.create_index("created_at")
        await db.courses.create_index("slug", unique=True)
        await db.blog_posts.create_index("slug", unique=True)
        await db.applications.create_index("id", unique=True)
        await db.applications.create_index("application_no", unique=True)
        await db.applications.create_index("razorpay_order_id")

        # Seed admin
        existing = await db.users.find_one({"email": ADMIN_EMAIL})
        if not existing:
            await db.users.insert_one({
                "id": str(uuid.uuid4()),
                "email": ADMIN_EMAIL,
                "password_hash": hash_password(ADMIN_PASSWORD),
                "name": ADMIN_NAME,
                "role": "admin",
                "created_at": iso_now(),
            })
            logger.info(f"[seed] admin user created: {ADMIN_EMAIL}")
        elif not verify_password(ADMIN_PASSWORD, existing.get("password_hash", "")):
            await db.users.update_one(
                {"email": ADMIN_EMAIL},
                {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}},
            )
            logger.info(f"[seed] admin password updated: {ADMIN_EMAIL}")

        # Seed/update default courses (always upsert hero_image so existing rows get new student photos)
        for c in DEFAULT_COURSES:
            exists = await db.courses.find_one({"slug": c["slug"]})
            if not exists:
                doc = {**c, "id": str(uuid.uuid4()), "is_active": True, "created_at": iso_now()}
                await db.courses.insert_one(doc)
            else:
                await db.courses.update_one(
                    {"slug": c["slug"]},
                    {"$set": {"hero_image": c["hero_image"], "icon": c.get("icon")}},
                )
        logger.info("[seed] courses ensured")

        # Seed silo blog posts (only if collection empty — admin can add/edit afterwards)
        blog_count = await db.blog_posts.count_documents({})
        if blog_count == 0:
            for post in DEFAULT_BLOG_POSTS:
                await db.blog_posts.insert_one({
                    **post,
                    "id": str(uuid.uuid4()),
                    "author": "RIHM Editorial",
                    "published": True,
                    "created_at": iso_now(),
                })
            logger.info(f"[seed] {len(DEFAULT_BLOG_POSTS)} silo blog posts inserted")
    except Exception as e:
        logger.error(f"[startup] seed/index failed: {e}")

    # Write test credentials file (local dev only — skip on Vercel/serverless)
    if not os.environ.get("VERCEL"):
        creds_path = ROOT_DIR / "memory" / "test_credentials.md"
        try:
            creds_path.parent.mkdir(parents=True, exist_ok=True)
            creds_path.write_text(
                f"# RIHM Test Credentials\n\n"
                f"## Admin (CMS Dashboard)\n"
                f"- Email: `{ADMIN_EMAIL}`\n"
                f"- Password: `{ADMIN_PASSWORD}`\n"
                f"- Role: admin\n\n"
                f"## Auth Endpoints\n"
                f"- POST `/api/auth/login` body `{{email, password}}` returns `{{access_token, user}}`\n"
                f"- GET `/api/auth/me` requires `Authorization: Bearer <token>`\n"
                f"- Frontend admin login route: `/admin/login`\n"
                f"- Frontend admin dashboard: `/admin`\n\n"
                f"## Public Endpoints\n"
                f"- POST `/api/leads` - submit a lead (no auth)\n"
                f"- GET `/api/courses` - list active courses (no auth)\n"
                f"- GET `/api/courses/{{slug}}` - course detail (no auth)\n"
                f"- GET `/api/blog/posts` - published blog posts (no auth)\n"
            )
        except OSError as e:
            logger.warning(f"[seed] could not write credentials file: {e}")


# ----------------------------------------------------------------------------
# Auth Endpoints
# ----------------------------------------------------------------------------
@api.post("/auth/login", response_model=TokenOut)
async def login(payload: LoginIn):
    user = await db.users.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user["email"], user.get("role", "admin"))
    return TokenOut(
        access_token=token,
        user={
            "id": user["id"],
            "email": user["email"],
            "name": user.get("name", ""),
            "role": user.get("role", "admin"),
        },
    )


@api.get("/auth/me")
async def me(admin: dict = Depends(get_current_admin)):
    return admin


# ----------------------------------------------------------------------------
# Leads (Public Submit + Admin Manage)
# ----------------------------------------------------------------------------
def _lead_html(lead: dict) -> str:
    return f"""
    <div style="font-family:Arial,sans-serif;max-width:600px">
      <h2 style="color:#8f244a">New Admissions Enquiry — RIHM</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td><b>Name</b></td><td>{lead.get('name','')}</td></tr>
        <tr><td><b>Phone</b></td><td>{lead.get('phone','')}</td></tr>
        <tr><td><b>Email</b></td><td>{lead.get('email') or '—'}</td></tr>
        <tr><td><b>City</b></td><td>{lead.get('city') or '—'}</td></tr>
        <tr><td><b>Course</b></td><td>{lead.get('course') or '—'}</td></tr>
        <tr><td><b>Message</b></td><td>{lead.get('message') or '—'}</td></tr>
        <tr><td><b>Source</b></td><td>{lead.get('source','website')}</td></tr>
        <tr><td><b>Time</b></td><td>{lead.get('created_at','')}</td></tr>
      </table>
      <p style="color:#888;font-size:12px">Login to RIHM CMS to manage this lead.</p>
    </div>
    """


def _lead_whatsapp(lead: dict) -> str:
    return (
        f"NEW RIHM LEAD\n"
        f"Name: {lead.get('name','')}\n"
        f"Phone: {lead.get('phone','')}\n"
        f"Email: {lead.get('email') or '-'}\n"
        f"City: {lead.get('city') or '-'}\n"
        f"Course: {lead.get('course') or '-'}\n"
        f"Source: {lead.get('source','')}\n"
    )


async def _schedule_lead_notifications(
    lead: dict,
    *,
    email: bool = True,
    whatsapp: bool = True,
    crm: bool = True,
    email_subject: Optional[str] = None,
) -> None:
    """Fan out lead to ExtraaEdge CRM first, then email/WhatsApp (awaited for serverless)."""
    if crm:
        try:
            await send_crm_webhook(lead)
        except Exception:
            pass  # logged in send_crm_webhook; do not block form save

    tasks = []
    if email:
        subject = email_subject or f"[RIHM Lead] {lead.get('name', '')} • {lead.get('course') or 'General Enquiry'}"
        tasks.append(send_email_notification(subject=subject, html=_lead_html(lead)))
    if whatsapp:
        tasks.append(send_whatsapp_notification(_lead_whatsapp(lead)))
    if not tasks:
        return
    results = await asyncio.gather(*tasks, return_exceptions=True)
    for result in results:
        if isinstance(result, Exception):
            logger.warning(f"[lead-notify] task failed: {result}")


@api.post("/leads", response_model=LeadOut)
async def create_lead(lead: LeadCreate):
    doc = {
        "id": str(uuid.uuid4()),
        **lead.model_dump(),
        "status": "new",
        "notes": None,
        "created_at": iso_now(),
    }
    await db.leads.insert_one(doc.copy())
    await _schedule_lead_notifications(doc)
    doc.pop("_id", None)
    return LeadOut(**doc)


@api.get("/admin/leads", response_model=List[LeadOut])
async def list_leads(
    admin: dict = Depends(get_current_admin),
    status_filter: Optional[str] = None,
    limit: int = 500,
):
    q = {}
    if status_filter:
        q["status"] = status_filter
    cursor = db.leads.find(q, {"_id": 0}).sort("created_at", -1).limit(limit)
    items = await cursor.to_list(limit)
    return [LeadOut(**x) for x in items]


@api.get("/admin/leads/stats")
async def lead_stats(admin: dict = Depends(get_current_admin)):
    total = await db.leads.count_documents({})
    new_count = await db.leads.count_documents({"status": "new"})
    contacted = await db.leads.count_documents({"status": "contacted"})
    converted = await db.leads.count_documents({"status": "converted"})
    # last 7 days
    cutoff = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    last_week = await db.leads.count_documents({"created_at": {"$gte": cutoff}})
    return {
        "total": total,
        "new": new_count,
        "contacted": contacted,
        "converted": converted,
        "last_7_days": last_week,
    }


@api.patch("/admin/leads/{lead_id}", response_model=LeadOut)
async def update_lead(lead_id: str, payload: LeadUpdate, admin: dict = Depends(get_current_admin)):
    updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    res = await db.leads.update_one({"id": lead_id}, {"$set": updates})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    lead = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    return LeadOut(**lead)


@api.delete("/admin/leads/{lead_id}")
async def delete_lead(lead_id: str, admin: dict = Depends(get_current_admin)):
    res = await db.leads.delete_one({"id": lead_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"deleted": True}


# ----------------------------------------------------------------------------
# Courses (Public Read, Admin Write)
# ----------------------------------------------------------------------------
@api.get("/courses", response_model=List[CourseModel])
async def list_courses(active_only: bool = True):
    q = {"is_active": True} if active_only else {}
    cursor = db.courses.find(q, {"_id": 0}).sort("created_at", 1)
    items = await cursor.to_list(100)
    return [CourseModel(**x) for x in items]


@api.get("/courses/{slug}", response_model=CourseModel)
async def get_course(slug: str):
    course = await db.courses.find_one({"slug": slug}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return CourseModel(**course)


@api.post("/admin/courses", response_model=CourseModel)
async def upsert_course(payload: CourseUpsert, admin: dict = Depends(get_current_admin)):
    existing = await db.courses.find_one({"slug": payload.slug})
    if existing:
        await db.courses.update_one({"slug": payload.slug}, {"$set": payload.model_dump()})
        course = await db.courses.find_one({"slug": payload.slug}, {"_id": 0})
        return CourseModel(**course)
    doc = {**payload.model_dump(), "id": str(uuid.uuid4()), "created_at": iso_now()}
    await db.courses.insert_one(doc.copy())
    doc.pop("_id", None)
    return CourseModel(**doc)


@api.delete("/admin/courses/{slug}")
async def delete_course(slug: str, admin: dict = Depends(get_current_admin)):
    res = await db.courses.delete_one({"slug": slug})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"deleted": True}


# ----------------------------------------------------------------------------
# Blog
# ----------------------------------------------------------------------------
@api.get("/blog/posts", response_model=List[BlogPostModel])
async def list_blog(category: Optional[str] = None, limit: int = 50):
    q = {"published": True}
    if category:
        q["category"] = category
    cursor = db.blog_posts.find(q, {"_id": 0}).sort("created_at", -1).limit(limit)
    items = await cursor.to_list(limit)
    return [BlogPostModel(**x) for x in items]


@api.get("/blog/posts/{slug}", response_model=BlogPostModel)
async def get_blog_post(slug: str):
    post = await db.blog_posts.find_one({"slug": slug, "published": True}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return BlogPostModel(**post)


@api.post("/admin/blog/posts", response_model=BlogPostModel)
async def upsert_blog(payload: BlogPostUpsert, admin: dict = Depends(get_current_admin)):
    existing = await db.blog_posts.find_one({"slug": payload.slug})
    if existing:
        await db.blog_posts.update_one({"slug": payload.slug}, {"$set": payload.model_dump()})
        post = await db.blog_posts.find_one({"slug": payload.slug}, {"_id": 0})
        return BlogPostModel(**post)
    doc = {**payload.model_dump(), "id": str(uuid.uuid4()), "created_at": iso_now()}
    await db.blog_posts.insert_one(doc.copy())
    doc.pop("_id", None)
    return BlogPostModel(**doc)


@api.delete("/admin/blog/posts/{slug}")
async def delete_blog(slug: str, admin: dict = Depends(get_current_admin)):
    res = await db.blog_posts.delete_one({"slug": slug})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"deleted": True}


# ----------------------------------------------------------------------------
# Applications & Payment (Razorpay)
# ----------------------------------------------------------------------------
async def _next_application_no() -> str:
    year = datetime.now(timezone.utc).year
    count = await db.applications.count_documents({"created_at": {"$regex": f"^{year}"}})
    return f"RIHM{year}-{(count + 1):05d}"


def _verify_razorpay_signature(order_id: str, payment_id: str, signature: str) -> bool:
    """Standard Razorpay HMAC-SHA256 verification."""
    if not RAZORPAY_KEY_SECRET:
        return False
    payload = f"{order_id}|{payment_id}".encode()
    expected = hmac.new(RAZORPAY_KEY_SECRET.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


@api.get("/payments/config")
async def payment_config():
    """Public payment configuration (no secrets)."""
    return {
        "razorpay_key_id": RAZORPAY_KEY_ID,
        "amount_inr": APPLICATION_FEE_INR,
        "currency": "INR",
        "configured": bool(_razorpay_client),
        "test_mode": RAZORPAY_KEY_ID.startswith("rzp_test_") if RAZORPAY_KEY_ID else True,
    }


@api.post("/applications/create-order", response_model=CreateOrderOut)
async def create_application_order(payload: ApplicationCreate):
    """Create a paid application record + Razorpay order.
    If Razorpay isn't configured, we still create the application with a mock
    order_id so the UI flow can be developed end-to-end (test_mode=true)."""
    application_id = str(uuid.uuid4())
    application_no = await _next_application_no()
    amount_paise = APPLICATION_FEE_INR * 100

    razorpay_order_id = None
    test_mode = True
    if _razorpay_client:
        try:
            order = _razorpay_client.order.create({
                "amount": amount_paise,
                "currency": "INR",
                "receipt": application_no[:40],
                "payment_capture": 1,
                "notes": {"application_no": application_no, "course": payload.course},
            })
            razorpay_order_id = order["id"]
            test_mode = RAZORPAY_KEY_ID.startswith("rzp_test_")
        except Exception as e:
            logger.warning(f"[razorpay] create order failed: {e}")
            raise HTTPException(status_code=502, detail="Payment gateway unavailable. Please call +91 70555 47000.")
    else:
        razorpay_order_id = f"order_mock_{uuid.uuid4().hex[:14]}"
        logger.info("[razorpay] not configured — issuing mock order_id for dev flow")

    doc = {
        "id": application_id,
        "application_no": application_no,
        **payload.model_dump(),
        "amount_inr": APPLICATION_FEE_INR,
        "amount_paise": amount_paise,
        "razorpay_order_id": razorpay_order_id,
        "razorpay_payment_id": None,
        "razorpay_signature": None,
        "payment_status": "pending",
        "created_at": iso_now(),
        "paid_at": None,
    }
    await db.applications.insert_one(doc.copy())

    # Also create a lead row so this prospect surfaces in the admin lead inbox
    app_lead = {
        "id": str(uuid.uuid4()),
        "name": payload.name,
        "phone": payload.phone,
        "email": payload.email,
        "city": None,
        "course": payload.course,
        "message": f"Started application {application_no}. Father: {payload.father_name}",
        "source": "application_started",
        "status": "new",
        "notes": None,
        "created_at": iso_now(),
    }
    await db.leads.insert_one(app_lead.copy())
    await _schedule_lead_notifications(app_lead, email=False, whatsapp=False)

    return CreateOrderOut(
        application_id=application_id,
        application_no=application_no,
        razorpay_key_id=RAZORPAY_KEY_ID or "rzp_test_placeholder",
        razorpay_order_id=razorpay_order_id,
        amount_paise=amount_paise,
        amount_inr=APPLICATION_FEE_INR,
        currency="INR",
        prefill={"name": payload.name, "email": payload.email, "contact": payload.phone},
        test_mode=test_mode,
    )


@api.post("/applications/verify-payment", response_model=ApplicationOut)
async def verify_payment(payload: VerifyPaymentIn):
    app_doc = await db.applications.find_one({"id": payload.application_id})
    if not app_doc:
        raise HTTPException(status_code=404, detail="Application not found")

    # Verify signature when Razorpay is configured
    if _razorpay_client:
        if not _verify_razorpay_signature(payload.razorpay_order_id, payload.razorpay_payment_id, payload.razorpay_signature):
            await db.applications.update_one(
                {"id": payload.application_id},
                {"$set": {"payment_status": "failed"}},
            )
            raise HTTPException(status_code=400, detail="Invalid payment signature")
    # If not configured (dev/test) accept anyway so flow can be tested

    paid_at = iso_now()
    await db.applications.update_one(
        {"id": payload.application_id},
        {"$set": {
            "razorpay_payment_id": payload.razorpay_payment_id,
            "razorpay_signature": payload.razorpay_signature,
            "payment_status": "paid",
            "paid_at": paid_at,
        }},
    )

    updated = await db.applications.find_one({"id": payload.application_id}, {"_id": 0})

    # Fire-and-forget admin notifications
    notification_html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px">
      <h2 style="color:#8f244a">🎉 New Paid Application — RIHM</h2>
      <p style="font-size:18px;color:#2d8a3e"><b>{updated['application_no']}</b> • {updated['payment_status'].upper()}</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td><b>Name</b></td><td>{updated.get('name','')}</td></tr>
        <tr><td><b>Father&apos;s Name</b></td><td>{updated.get('father_name','')}</td></tr>
        <tr><td><b>Phone</b></td><td>{updated.get('phone','')}</td></tr>
        <tr><td><b>Email</b></td><td>{updated.get('email','')}</td></tr>
        <tr><td><b>Course</b></td><td>{updated.get('course','')}</td></tr>
        <tr><td><b>Amount</b></td><td>₹{updated.get('amount_inr','')}</td></tr>
        <tr><td><b>Razorpay Payment ID</b></td><td>{updated.get('razorpay_payment_id','')}</td></tr>
      </table>
    </div>
    """
    await asyncio.gather(
        send_email_notification(
            subject=f"[RIHM Application Paid] {updated['application_no']} • {updated.get('course','')}",
            html=notification_html,
        ),
        send_whatsapp_notification(
            f"💰 PAID APPLICATION\n"
            f"No: {updated['application_no']}\n"
            f"Name: {updated.get('name','')}\n"
            f"Father: {updated.get('father_name','')}\n"
            f"Phone: {updated.get('phone','')}\n"
            f"Course: {updated.get('course','')}\n"
            f"₹{updated.get('amount_inr','')} • {updated.get('razorpay_payment_id','')}"
        ),
        _schedule_lead_notifications(
            {
                "name": updated.get("name", ""),
                "phone": updated.get("phone", ""),
                "email": updated.get("email"),
                "course": updated.get("course"),
                "source": "application_paid",
                "message": (
                    f"Paid application {updated['application_no']}. "
                    f"Father: {updated.get('father_name', '')}. "
                    f"Amount: ₹{updated.get('amount_inr', '')}. "
                    f"Payment ID: {updated.get('razorpay_payment_id', '')}"
                ),
            },
            email=False,
            whatsapp=False,
        ),
        return_exceptions=True,
    )

    # Update related lead
    await db.leads.update_many(
        {"phone": updated["phone"], "source": "application_started"},
        {"$set": {"status": "converted", "notes": f"Paid application {updated['application_no']}"}},
    )

    return ApplicationOut(**{k: v for k, v in updated.items() if k != "_id"})


@api.get("/applications/{application_id}", response_model=ApplicationOut)
async def get_application(application_id: str):
    app_doc = await db.applications.find_one({"id": application_id}, {"_id": 0})
    if not app_doc:
        raise HTTPException(status_code=404, detail="Application not found")
    return ApplicationOut(**app_doc)


@api.get("/admin/applications", response_model=List[ApplicationOut])
async def list_applications(
    admin: dict = Depends(get_current_admin),
    payment_status: Optional[str] = None,
    limit: int = 500,
):
    q = {}
    if payment_status:
        q["payment_status"] = payment_status
    cursor = db.applications.find(q, {"_id": 0}).sort("created_at", -1).limit(limit)
    items = await cursor.to_list(limit)
    return [ApplicationOut(**x) for x in items]


@api.get("/admin/applications/stats")
async def application_stats(admin: dict = Depends(get_current_admin)):
    total = await db.applications.count_documents({})
    paid = await db.applications.count_documents({"payment_status": "paid"})
    pending = await db.applications.count_documents({"payment_status": "pending"})
    failed = await db.applications.count_documents({"payment_status": "failed"})
    return {"total": total, "paid": paid, "pending": pending, "failed": failed, "revenue_inr": paid * APPLICATION_FEE_INR}


# ----------------------------------------------------------------------------
# Site Settings / Tracking IDs (public read, admin write)
# ----------------------------------------------------------------------------
@api.get("/settings")
async def get_settings():
    s = await db.settings.find_one({"key": "site"}, {"_id": 0}) or {}
    s.setdefault("phone", "+917055547000")
    s.setdefault("whatsapp", "+917055547000")
    # public site email = first email in NOTIFY_EMAIL list (others remain internal-only)
    _emails = [e.strip() for e in os.environ.get("NOTIFY_EMAIL", "").split(",") if e.strip()]
    s.setdefault("email", _emails[0] if _emails else "admissions@ram.institute")
    s.setdefault("address", "430, Niranjanpur, Dehradun, Uttarakhand 248001")
    s.setdefault("maps_url", "https://maps.app.goo.gl/CzmWCZRHeKXQc3aU8")
    return s


@api.get("/")
async def root():
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Database not configured. Set MONGO_URL and DB_NAME in Vercel environment variables.",
        )
    return {"service": "RIHM API", "status": "ok"}


@api.get("/health")
async def health():
    """Diagnostics for production — confirms MongoDB connectivity."""
    info: dict = {
        "service": "RIHM API",
        "vercel": bool(os.environ.get("VERCEL")),
        "db_configured": db is not None,
        "db_name": db_name or None,
        "mongo_host": _mongo_host_hint(mongo_url) if mongo_url else None,
        "mongo_uri_mode": "srv" if mongo_url.startswith("mongodb+srv://") else "standard",
        "crm_webhook": "configured",
        "crm_webhook_source": (
            "env" if os.environ.get("EXTRAEEDGE_WEBHOOK_URL") or os.environ.get("EXTRAAEDGE_WEBHOOK_URL")
            else "default"
        ),
    }
    if db is None:
        info["mongo"] = "not_configured"
        return info
    try:
        await client.admin.command("ping")
        course_count = await db.courses.count_documents({})
        info["mongo"] = "ok"
        info["courses"] = course_count
    except Exception as e:
        info["mongo"] = "error"
        info["error"] = str(e)[:300]
    return info


# ----------------------------------------------------------------------------
# Sitemap + robots (served at API; frontend proxies /sitemap.xml → /api/sitemap.xml)
# ----------------------------------------------------------------------------
from fastapi.responses import Response  # noqa: E402

SITE_BASE = "https://ram.institute"
STATIC_URLS = [
    ("/", "1.0", "weekly"),
    ("/about", "0.8", "monthly"),
    ("/courses", "0.9", "weekly"),
    ("/placements", "0.9", "weekly"),
    ("/scholarships", "0.9", "monthly"),
    ("/campus-life", "0.7", "monthly"),
    ("/gallery", "0.6", "monthly"),
    ("/blog", "0.7", "weekly"),
    ("/contact", "0.9", "monthly"),
    ("/apply", "1.0", "weekly"),
    ("/career-guide", "0.8", "monthly"),
    ("/salary-after-hotel-management", "0.8", "monthly"),
    ("/bhm-vs-diploma", "0.8", "monthly"),
]


@api.get("/sitemap.xml")
async def sitemap_xml():
    cursor = db.courses.find({"is_active": True}, {"slug": 1, "_id": 0})
    courses = await cursor.to_list(50)
    cursor = db.blog_posts.find({"published": True}, {"slug": 1, "_id": 0})
    blogs = await cursor.to_list(200)
    lastmod = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    parts = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for path, pri, freq in STATIC_URLS:
        parts.append(f"<url><loc>{SITE_BASE}{path}</loc><lastmod>{lastmod}</lastmod><changefreq>{freq}</changefreq><priority>{pri}</priority></url>")
    for c in courses:
        parts.append(f"<url><loc>{SITE_BASE}/courses/{c['slug']}</loc><lastmod>{lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.85</priority></url>")
    for b in blogs:
        parts.append(f"<url><loc>{SITE_BASE}/blog/{b['slug']}</loc><lastmod>{lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>")
    parts.append("</urlset>")
    return Response(content="\n".join(parts), media_type="application/xml")


@api.get("/robots.txt")
async def robots_txt():
    body = (
        "User-agent: *\n"
        "Allow: /\n"
        "Disallow: /admin/\n"
        "Disallow: /admin/login\n\n"
        "User-agent: GPTBot\nAllow: /\n\n"
        "User-agent: ChatGPT-User\nAllow: /\n\n"
        "User-agent: ClaudeBot\nAllow: /\n\n"
        "User-agent: anthropic-ai\nAllow: /\n\n"
        "User-agent: PerplexityBot\nAllow: /\n\n"
        "User-agent: Google-Extended\nAllow: /\n\n"
        "User-agent: Applebot-Extended\nAllow: /\n\n"
        f"Sitemap: {SITE_BASE}/api/sitemap.xml\n"
    )
    return Response(content=body, media_type="text/plain")


# Include router
app.include_router(api)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown():
    if client:
        client.close()
