# 🌐 Website Integration Brief — raminstitute.in

**To:** Domain Owner / IT Administrator, Shri Ram Institute of Hotel Management
**From:** RIHM Digital Team
**Subject:** DNS configuration request to point `raminstitute.in` to the new website server
**Date:** _________________

---

## 1. Background
A new, fully-rebuilt website for **Shri Ram Institute of Hotel Management, Dehradun** has been developed on a modern stack (React + FastAPI + MongoDB) with deep SEO, online application/payment, lead-capture CRM, and an admin dashboard. The site is currently live on a staging URL and is ready for production cut-over to the official domain.

**Internal Staging URL (for design/QA review only — NOT for DNS or public sharing):** *available on request to the project lead*
**Target production domain:** `https://www.raminstitute.in` (with `raminstitute.in` → `www.raminstitute.in` 301 redirect)

> ⚠️ The staging environment is restricted, password-protected on go-live, and blocked from search engines via `noindex` headers + `robots.txt`. The final production CNAME / IP will be issued by our hosting platform 24 hrs before go-live and shared with the domain owner separately. **Do not configure DNS against any staging URL.**

---

## 2. What is required from the domain owner

To go live, the domain owner needs to perform **3 simple actions** on the DNS provider (GoDaddy / BigRock / Hostinger / wherever `raminstitute.in` is registered):

### ✅ Action 1 — Add the following DNS records

| Type  | Name / Host | Value                                                                                            | TTL  |
|-------|-------------|--------------------------------------------------------------------------------------------------|------|
| CNAME | `www`       | `[production-CNAME-shared-on-go-live]` — *e.g. a cloud load-balancer like `lb.rihm-prod.in`* | 3600 |
| A     | `@` (root)  | `[production-server-IP-shared-on-go-live]`                                                       | 3600 |
| TXT   | `@`         | `v=spf1 include:_spf.google.com ~all` *(only if email is on Google Workspace)*                  | 3600 |

> ℹ️ The exact CNAME hostname and IP will come from a dedicated production server (not a staging / preview URL). They will be issued and emailed to the domain owner 24 hrs before go-live, on RIHM letterhead. **Do not point DNS to any `*.preview.*` or `*.staging.*` subdomain — those are blocked from public traffic.**

### ✅ Action 2 — Grant temporary registrar access OR perform changes yourself
- **Option A (preferred):** Domain owner adds the DNS records above directly from the registrar dashboard.
- **Option B:** Domain owner shares **read-only** registrar access (login or invite collaborator) so our team can configure DNS safely. No transfer of ownership is required — domain remains 100% with the institute.

### ✅ Action 3 — Confirm email routing preference
The new site sends lead-capture emails. We need to confirm whether `admissions@raminstitute.in` / `info@raminstitute.in` mailboxes should:
- (a) Continue working as-is (we will not touch MX records), **OR**
- (b) Be created/migrated (we can guide setup on Google Workspace / Zoho Mail).

---

## 3. What the development team will handle
- Production deployment of the website to a managed cloud server
- SSL certificate provisioning (HTTPS) via Let's Encrypt — automatic & free
- 301 redirect from `raminstitute.in` → `www.raminstitute.in`
- Sitemap submission to Google Search Console & Bing Webmaster
- 24/7 uptime monitoring + daily MongoDB backups
- Migration of any existing SEO equity (301 redirect map for old URLs)

---

## 4. Zero-downtime cut-over plan
1. **Day -2:** Domain owner adds CNAME / A record (DNS propagation begins, ~6–24 hrs)
2. **Day -1:** Dev team verifies records, provisions SSL on the new server
3. **Day 0 (go-live):** Traffic automatically routes to new site. Old site (if any) is mirrored for 7 days as fallback.
4. **Day +7:** Final sign-off, old hosting can be decommissioned.

---

## 5. Information requested from domain owner

Please share the following so we can finalize go-live:

| # | Item                                            | Provided by domain owner |
|---|-------------------------------------------------|--------------------------|
| 1 | Domain registrar name (GoDaddy / BigRock / etc.) | _________________________ |
| 2 | Current DNS provider (if different)             | _________________________ |
| 3 | Existing MX (email) provider                    | _________________________ |
| 4 | Preferred go-live date                          | _________________________ |
| 5 | Authorised technical contact (name + phone)     | _________________________ |
| 6 | Confirmation that domain auto-renew is ON       | ☐ Yes ☐ No              |

---

## 6. Security & ownership assurance
- 🔒 Domain ownership remains **100%** with Shri Ram Institute of Hotel Management. No transfer of the domain takes place.
- 🔐 Any registrar credentials shared will be used **only** for DNS configuration and revoked immediately after go-live.
- 📜 A DNS-change log will be shared with the institute for audit.

---

## 7. Approvals

| Role                         | Name          | Signature | Date |
|------------------------------|---------------|-----------|------|
| Domain Owner / Authorised Signatory |               |           |      |
| RIHM Digital / Project Lead  |               |           |      |

---

## 📞 Single Point of Contact
**RIHM Digital Team**
Email: tanishk@raminstitute.in
Phone / WhatsApp: +91 70555 47000
Website preview: *available on request (restricted, password-protected)*

---
*Generated for internal use by Shri Ram Institute of Hotel Management, Dehradun.*
