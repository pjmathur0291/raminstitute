# ⚡ RIHM Website — Developer Cheat-Sheet (One Page)

> Hand this to your developer. Run top-to-bottom on a fresh Ubuntu 22.04+ VPS.

## 0️⃣ Server prep
```bash
sudo apt update && sudo apt install -y python3.11 python3.11-venv python3-pip nginx mongodb-org certbot python3-certbot-nginx git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs && sudo npm i -g yarn pm2
sudo systemctl enable --now mongod
```

## 1️⃣ Code
```bash
sudo mkdir -p /var/www && cd /var/www
# Download + unzip code package (link provided separately)
sudo unzip rihm-website.zip   # or: sudo tar -xzf rihm-website.tar.gz
sudo chown -R $USER:$USER rihm-website
cd rihm-website
```

## 2️⃣ Backend
```bash
cd /var/www/rihm-website/backend
python3.11 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env && nano .env    # fill in keys (see below)
pm2 start "venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001" --name rihm-backend
pm2 save && pm2 startup
```

## 3️⃣ Frontend
```bash
cd /var/www/rihm-website/frontend
cp .env.example .env && nano .env    # set REACT_APP_BACKEND_URL=https://www.raminstitute.in
yarn install && yarn build
```

## 4️⃣ Nginx
Create `/etc/nginx/sites-available/raminstitute.in`:
```nginx
server {
  listen 80;
  server_name raminstitute.in www.raminstitute.in;
  root /var/www/rihm-website/frontend/build;
  index index.html;
  location /api/ { proxy_pass http://127.0.0.1:8001; proxy_set_header Host $host; proxy_set_header X-Forwarded-Proto $scheme; }
  location / { try_files $uri /index.html; }
  location ~* \.(?:css|js|jpg|jpeg|png|webp|svg|woff2|ico)$ { expires 1y; add_header Cache-Control "public, immutable"; }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/raminstitute.in /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d raminstitute.in -d www.raminstitute.in
```

## 5️⃣ Required `.env` keys (backend)
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="rihm_production"
JWT_SECRET="<openssl rand -hex 32>"
CORS_ORIGINS="https://www.raminstitute.in,https://raminstitute.in"
ADMIN_EMAIL="admin@ram.institute"
ADMIN_PASSWORD="<strong-password>"
RAZORPAY_KEY_ID="rzp_test_T1yBamRd0d3uDi"
RAZORPAY_KEY_SECRET="tYCqPWkT4tXjVjslEczvcLH1"
APPLICATION_FEE_INR=5000
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="admissions.raminstitute@gmail.com"
SMTP_PASSWORD="<gmail-app-password-16-chars>"
SENDER_EMAIL="admissions.raminstitute@gmail.com"
SENDER_NAME="RIHM Admissions"
NOTIFY_EMAIL="admissions.raminstitute@gmail.com,tanishk@raminstitute.in"
```

## 6️⃣ Frontend `.env`
```env
REACT_APP_BACKEND_URL=https://www.raminstitute.in
```

## 7️⃣ Verify (5 commands)
```bash
curl https://www.raminstitute.in/api/                                         # → {"service":"RIHM API","status":"ok"}
curl https://www.raminstitute.in/api/courses | head -c 200                    # → list of 6 courses
curl https://www.raminstitute.in/api/sitemap.xml | head -10                   # → XML sitemap
curl -X POST https://www.raminstitute.in/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@ram.institute","password":"<pw>"}'   # → access_token
curl -X POST https://www.raminstitute.in/api/leads -H "Content-Type: application/json" -d '{"name":"Test","phone":"9999999999","email":"t@t.com","course":"BHM","source":"deploy"}'   # → {id, ...}
```

## 🔐 Admin login (post-deploy)
- **URL:** `https://www.raminstitute.in/admin/login`
- **Email:** `admin@ram.institute`
- **Password:** `<as set in ADMIN_PASSWORD>`

## 🆘 Common issues
| Symptom | Fix |
|---|---|
| `pkg_resources` ImportError | `pip install "setuptools<81"` |
| Razorpay returns `mock_order_id` | Keys missing in `.env`; restart backend after edit |
| MongoDB connection refused | `sudo systemctl restart mongod` |
| Frontend shows blank | `yarn build` didn't complete; check `frontend/build/` exists |
| CORS error in browser | `CORS_ORIGINS` in backend `.env` must match production URL exactly |
| Email not sending | Gmail App Password must be 16 chars; 2FA must be ON for the Gmail account |

## 🔄 Update flow (future code changes)
```bash
cd /var/www/rihm-website
git pull                                # or upload new zip
cd backend && source venv/bin/activate && pip install -r requirements.txt && pm2 restart rihm-backend
cd ../frontend && yarn install && yarn build
sudo systemctl reload nginx
```

## 📞 Contact
Tanishk — tanishk@raminstitute.in — +91 70555 47000
