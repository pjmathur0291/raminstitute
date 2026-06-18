# 🚀 RIHM Website — Deployment Guide for Developer

This package contains the complete source code for the **Shri Ram Institute of Hotel Management (raminstitute.in)** website.

## 📦 What's in this package
```
rihm-website/
├── backend/                  # FastAPI + MongoDB API
│   ├── server.py             # Main API (routes, auth, payments, leads)
│   ├── requirements.txt      # Python dependencies (pip freeze)
│   └── .env.example          # Copy to .env and fill in real values
├── frontend/                 # React 19 + Tailwind + Shadcn UI
│   ├── src/                  # All React components, pages, lib
│   ├── public/               # static assets, sitemap.xml, robots.txt
│   ├── scripts/prerender.js  # Puppeteer-based static prerender for SEO
│   ├── package.json
│   └── .env.example          # Copy to .env and fill in REACT_APP_BACKEND_URL
└── DEPLOYMENT_GUIDE.md       # This file
```

---

## 🖥️ Server requirements

| Component  | Minimum                          |
|------------|----------------------------------|
| OS         | Ubuntu 22.04 LTS (or any Linux) |
| RAM        | 2 GB (4 GB recommended)         |
| CPU        | 2 vCPU                           |
| Disk       | 20 GB SSD                        |
| Node.js    | v20.x or v22.x                  |
| Python     | 3.11 or 3.12                    |
| MongoDB    | 6.0+ (local or Atlas)           |
| Nginx      | Latest (reverse proxy + SSL)    |

---

## 📋 Step-by-step deployment

### 1. Install system dependencies
```bash
sudo apt update && sudo apt install -y python3.11 python3.11-venv python3-pip nginx mongodb
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g yarn pm2
```

### 2. Setup MongoDB
```bash
sudo systemctl enable mongod && sudo systemctl start mongod
# OR use MongoDB Atlas (cloud) — get connection string from atlas.mongodb.com
```

### 3. Backend setup (FastAPI)
```bash
cd /var/www/rihm-website/backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Copy and edit env file
cp .env.example .env
nano .env   # Fill in MONGO_URL, JWT_SECRET, RAZORPAY_KEY_ID, SMTP_PASSWORD etc.

# Test run
uvicorn server:app --host 0.0.0.0 --port 8001
# Ctrl-C once you see "Application startup complete"
```

### 4. Run backend as a service (PM2)
```bash
cd /var/www/rihm-website/backend
pm2 start "venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001" --name rihm-backend
pm2 save
pm2 startup   # follow the printed command
```

### 5. Frontend build (React)
```bash
cd /var/www/rihm-website/frontend
cp .env.example .env
nano .env    # Set REACT_APP_BACKEND_URL=https://www.raminstitute.in

yarn install
yarn build          # also runs react-snap prerender for SEO
# Output goes to /var/www/rihm-website/frontend/build
```

### 6. Nginx config
Create `/etc/nginx/sites-available/raminstitute.in`:
```nginx
server {
    listen 80;
    server_name raminstitute.in www.raminstitute.in;

    # Frontend — static files
    root /var/www/rihm-website/frontend/build;
    index index.html;

    # API proxy to FastAPI
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA fallback
    location / {
        try_files $uri /index.html;
    }

    # Long cache for static assets
    location ~* \.(?:css|js|jpg|jpeg|png|webp|svg|woff2|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```
Enable + reload:
```bash
sudo ln -s /etc/nginx/sites-available/raminstitute.in /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 7. SSL (free via Let's Encrypt)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d raminstitute.in -d www.raminstitute.in
# Auto-renews via systemd timer
```

### 8. Optional: redirect apex → www
Certbot usually adds this automatically. Verify in nginx config that `raminstitute.in` 301-redirects to `https://www.raminstitute.in`.

---

## 🔐 Environment Variables (.env)

### `backend/.env`
| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URL` | ✅ | MongoDB connection string (`mongodb://localhost:27017` or Atlas URI) |
| `DB_NAME` | ✅ | Database name (e.g. `rihm_production`) |
| `JWT_SECRET` | ✅ | 64-char random hex — generate via `openssl rand -hex 32` |
| `CORS_ORIGINS` | ✅ | Allowed origins — set to `https://www.raminstitute.in,https://raminstitute.in` in prod |
| `ADMIN_EMAIL` | ✅ | Admin login email (default: `admin@ram.institute`) |
| `ADMIN_PASSWORD` | ✅ | Admin login password — **CHANGE THIS** in production |
| `ADMIN_NAME` | optional | Display name for admin |
| `RAZORPAY_KEY_ID` | ✅ for payments | From dashboard.razorpay.com |
| `RAZORPAY_KEY_SECRET` | ✅ for payments | Generated alongside KEY_ID |
| `APPLICATION_FEE_INR` | optional | Default 5000 |
| `SMTP_HOST` | for email | `smtp.gmail.com` |
| `SMTP_PORT` | for email | `587` |
| `SMTP_USER` | for email | Gmail address (e.g. `admissions.raminstitute@gmail.com`) |
| `SMTP_PASSWORD` | for email | Gmail **App Password** (NOT regular password) |
| `SENDER_EMAIL` | for email | The "from" address shown |
| `SENDER_NAME` | for email | Display name (e.g. `RIHM Admissions`) |
| `NOTIFY_EMAIL` | for email | Comma-separated recipients e.g. `admissions.raminstitute@gmail.com,tanishk@raminstitute.in` |
| `TWILIO_ACCOUNT_SID` | optional | For WhatsApp notifications |
| `TWILIO_AUTH_TOKEN` | optional | |
| `TWILIO_WHATSAPP_FROM` | optional | e.g. `whatsapp:+14155238886` |
| `NOTIFY_WHATSAPP` | optional | e.g. `whatsapp:+917055547000` |

### `frontend/.env`
| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_BACKEND_URL` | ✅ | Production URL — `https://www.raminstitute.in` |

---

## 🧪 Verification checklist after deployment

```bash
# Backend health
curl https://www.raminstitute.in/api/
# → {"service":"RIHM API","status":"ok"}

# Admin login
curl -X POST https://www.raminstitute.in/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ram.institute","password":"<your-password>"}'

# Submit a test lead
curl -X POST https://www.raminstitute.in/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"9999999999","email":"t@t.com","course":"BHM","source":"deploy_test"}'

# Sitemap
curl https://www.raminstitute.in/api/sitemap.xml | head -20
```

---

## 🔑 Default admin credentials (CHANGE on first login)
- **Email:** `admin@ram.institute`
- **Password:** `Ram@2026`
- **Admin login URL:** `https://www.raminstitute.in/admin/login`
- **Admin dashboard URL:** `https://www.raminstitute.in/admin`
- **Role:** `admin` (full CMS access)

### What the admin can do once logged in
- 📥 **Leads inbox** — view every lead submitted from any form (Home hero, Contact, Course detail, Scholarship, Footer, Exit-intent popup)
- 📊 **Applications dashboard** — view paid applications, Razorpay payment status, revenue stats
- 📚 **Courses CRUD** — add/edit/disable courses
- ✍️ **Blog editor** — publish/edit/delete SEO articles
- 🔧 **Site settings** — update phone, WhatsApp, address shown across the site

### How to change the admin password
The simplest way (one-time, on the server):
```bash
# Stop backend
pm2 stop rihm-backend

# Edit .env
nano /var/www/rihm-website/backend/.env
# Change line: ADMIN_PASSWORD="Ram@2026"  →  ADMIN_PASSWORD="YourNewStrongPassword!"

# Restart — the seed logic auto-updates the admin password on startup
pm2 restart rihm-backend
pm2 logs rihm-backend --lines 20
# Look for: "[seed] admin password updated: admin@ram.institute"
```
> ⚠️ The admin password is hashed with bcrypt on first login. It's NEVER stored in plain text in MongoDB. The `.env` value is read once at startup to seed/update the admin user.

### Adding more admin users (currently single-admin; multi-user coming in v2)
For now, the system supports one admin. To add staff, you can either:
1. **Wait for v2 multi-user feature** (planned post-launch), OR
2. **Insert directly into MongoDB** (advanced):
   ```bash
   mongosh
   use rihm_production
   db.users.insertOne({
     id: "uuid-here",
     email: "counsellor@raminstitute.in",
     hashed_password: "<bcrypt-hash>",
     name: "Counsellor 1",
     role: "admin",
     created_at: new Date().toISOString()
   })
   ```

### Auth API endpoints (for reference)
| Method | Endpoint              | Body                          | Returns                |
|--------|-----------------------|-------------------------------|------------------------|
| POST   | `/api/auth/login`     | `{email, password}`           | `{access_token, user}` |
| GET    | `/api/auth/me`        | (Header: `Bearer <token>`)    | `{user}`               |

Token expiry: **7 days** (configurable in `server.py` → `create_access_token`).

---

## 📞 Support
For any deployment questions contact:
- **Tanishk** — tanishk@raminstitute.in / +91 70555 47000

---

## 🚨 Production hardening checklist
- [ ] Change `JWT_SECRET` to a new random 64-char hex
- [ ] Change `ADMIN_PASSWORD` to a strong password
- [ ] Set `CORS_ORIGINS` to only your production domains (not `*`)
- [ ] Enable MongoDB authentication (`mongo --eval` to create db user)
- [ ] Enable UFW firewall: allow only 22, 80, 443
- [ ] Setup daily MongoDB backups (cron + `mongodump`)
- [ ] Setup UptimeRobot / BetterStack for uptime monitoring
- [ ] Submit `/api/sitemap.xml` in Google Search Console
- [ ] Add GA4 + GTM + Meta Pixel IDs (in frontend `.env` if added later)
- [ ] Switch `RAZORPAY_KEY_ID` from `rzp_test_*` to `rzp_live_*` when ready for real payments
