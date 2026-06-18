# Deploy RIHM Website on Vercel

Frontend (React) + Backend (FastAPI) on one Vercel project. Secrets live in the **Vercel dashboard**, not in Git.

---

## 1. Keep secrets out of GitHub

These files are **gitignored** and must never be committed:

- `backend/.env`
- `frontend/.env`
- `backend/memory/` (contains generated credentials)

Before pushing, verify:

```bash
git status
# backend/.env and frontend/.env should NOT appear as staged files

git check-ignore -v backend/.env frontend/.env
# should show they are ignored
```

Only commit `.env.example` and `vercel.env.example` (no real passwords).

---

## 2. Make the GitHub repo private

1. Go to https://github.com/pjmathur0291/raminstitute/settings
2. Scroll to **Danger Zone** → **Change repository visibility**
3. Select **Private**

---

## 3. Push deployment files to GitHub

```bash
cd /Users/nareshkansara/Downloads/rihm-website
git add .gitignore vercel.json api/ backend/server.py frontend/.gitignore frontend/.env.example vercel.env.example VERCEL_DEPLOY.md
git status   # confirm NO .env files are listed
git commit -m "Add Vercel deployment config and secure gitignore"
git push origin main
```

---

## 4. Create Vercel project

1. Go to https://vercel.com and sign in with GitHub
2. **Add New → Project**
3. Import **`pjmathur0291/raminstitute`**
4. Settings (should auto-detect from `vercel.json`):

| Setting | Value |
|---------|--------|
| Root Directory | `.` |
| Framework Preset | Other |
| Build Command | `cd frontend && yarn build` |
| Output Directory | `frontend/build` |

---

## 5. Add environment variables in Vercel

**Project → Settings → Environment Variables**

Use `vercel.env.example` as your checklist. Minimum required:

| Variable | Value |
|----------|--------|
| `MONGO_URL` | Your Atlas connection string |
| `DB_NAME` | `rihm_production` |
| `JWT_SECRET` | Run: `openssl rand -hex 32` |
| `ADMIN_EMAIL` | `admin@ram.institute` |
| `ADMIN_PASSWORD` | Strong password |
| `CORS_ORIGINS` | `https://your-app.vercel.app` (add custom domain later) |
| `REACT_APP_BACKEND_URL` | *(leave empty)* |

Add SMTP / Razorpay keys if you need email and payments.

Apply each variable to **Production**, **Preview**, and **Development**.

---

## 6. Deploy

Click **Deploy**. First build takes ~3–5 minutes.

---

## 7. Verify

Replace `YOUR-APP` with your Vercel URL:

```bash
curl https://YOUR-APP.vercel.app/api/
# → {"service":"RIHM API","status":"ok"}

# Website
open https://YOUR-APP.vercel.app

# Admin
open https://YOUR-APP.vercel.app/admin/login
```

---

## 8. Custom domain (optional)

1. Vercel → **Settings → Domains** → add `raminstitute.in` and `www.raminstitute.in`
2. Update DNS at your registrar (Bluehost) as Vercel instructs
3. Update `CORS_ORIGINS` in Vercel to include production domains
4. **Redeploy**

---

## 9. After every code change

```bash
git add .
git status   # always check .env is not included
git commit -m "Your change"
git push
```

Vercel auto-deploys on push to `main`.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `/api/` 404 | Ensure `api/index.py` is committed |
| `/api/` 500 | Check Vercel **Functions → Logs**; usually wrong `MONGO_URL` |
| CORS error | Add your Vercel URL to `CORS_ORIGINS` and redeploy |
| Build fails on yarn | `vercel.json` installCommand installs deps automatically |
| Admin login fails | Confirm `ADMIN_PASSWORD` in Vercel matches what you use |

---

## Security checklist

- [ ] GitHub repo is **Private**
- [ ] `.env` files are gitignored (run `git check-ignore`)
- [ ] All secrets are in **Vercel Environment Variables** only
- [ ] MongoDB Atlas password rotated if it was ever shared in chat
- [ ] `ADMIN_PASSWORD` is strong in production
- [ ] Atlas Network Access allows `0.0.0.0/0` (required for Vercel serverless)
