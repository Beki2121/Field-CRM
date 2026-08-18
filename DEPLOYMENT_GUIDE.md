# Deployment Guide - Field Sales CRM

## Overview

- **Frontend**: `crm.ilink.market` (static React app)
- **Backend**: `crmbackend.ilink.market` (Node.js/Express + MySQL)

---

## Pre-Deployment Checklist

### ✅ Code Ready

- [x] Frontend built and optimized in `frontend/dist/`
- [x] Backend Express app configured with CORS
- [x] API routes: `/health`, `/api/businesses`, `/api/visits`, `/api/ai-summary`
- [x] MySQL schema created in `backend/schema.sql`

### ✅ Environment Configuration

- [x] Frontend: `frontend/.env` set to `VITE_API_URL=https://crmbackend.ilink.market`
- [x] Backend: `backend/.env` configured with:
  - `CORS_ORIGIN=https://crm.ilink.market`
  - Database credentials filled in
  - `PORT=4000`

### ⚠️ Infrastructure Required (Your Action)

- [ ] DNS A record: `crm.ilink.market` → your hosting IP
- [ ] DNS A record: `crmbackend.ilink.market` → your hosting IP
- [ ] SSL certificate for `crm.ilink.market`
- [ ] SSL certificate for `crmbackend.ilink.market`
- [ ] MySQL database created: `ilinkmth_crm`
- [ ] MySQL user created with access to the database

---

## Step-by-Step Deployment

### Step 1: Database Setup

```bash
# Import schema into your MySQL database
mysql -h DB_HOST -u DB_USER -p DB_NAME < backend/schema.sql
```

### Step 2: Deploy Frontend

Upload all files from `frontend/dist/` to your hosting provider's root directory for `crm.ilink.market`.

**Important**: The build includes:

- PWA manifest at `manifest.webmanifest`
- Service worker at `sw.js`
- All app assets (CSS, JS, images)
- `.htaccess` file (if using Apache)

### Step 3: Deploy Backend

1. Upload `backend/` directory to `crmbackend.ilink.market`
2. Copy `.env` file to the backend directory (do NOT commit this)
3. Ensure `.htaccess` exists in the app root (required for cPanel/CloudLinux Node.js Selector)
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the app from **cPanel → Software → Setup Node.js App** (recommended on CloudLinux), or manually:
   ```bash
   npm start
   # or use PM2 for production:
   pm2 start src/server.js --name "crm-backend"
   ```

**CloudLinux/cPanel note**: Create the Node.js app in cPanel first so Passenger config is injected into `.htaccess`. Startup file: `src/server.js`.

---

## Verification

### Health Check

```bash
curl -i https://crmbackend.ilink.market/health
```

**Expected response**:

```json
{ "ok": true, "service": "field-crm-backend" }
```

### API Check

```bash
# Test GET businesses
curl -i https://crmbackend.ilink.market/api/businesses
```

### Frontend Check

1. Open `https://crm.ilink.market` in browser
2. Check browser console for any errors
3. Open DevTools → Network tab
4. Verify API requests go to `https://crmbackend.ilink.market/api/...`

---

## Environment Variables

### Frontend (`frontend/.env`)

```env
VITE_API_URL=https://crmbackend.ilink.market
```

### Backend (`backend/.env`)

```env
PORT=4000
DB_HOST=your_mysql_host
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=ilinkmth_crm
CORS_ORIGIN=https://crm.ilink.market
```

---

## Troubleshooting

### "Cannot reach crm.ilink.market"

- **Cause**: DNS not configured
- **Fix**: Add A record in your DNS provider pointing to your hosting IP

### "API calls return 403"

- **Cause**: CORS_ORIGIN mismatch
- **Fix**: Verify `backend/.env` has `CORS_ORIGIN=https://crm.ilink.market`

### "Cannot connect to database"

- **Cause**: DB credentials wrong or database doesn't exist
- **Fix**:
  1. Verify credentials in `backend/.env`
  2. Verify database and user exist
  3. Check MySQL server is running

### "Health endpoint returns 500"

- **Cause**: Database connection failed
- **Fix**: Check backend logs and verify DB credentials

### `FileNotFoundError: .../.htaccess` when starting Node.js app

- **Cause**: CloudLinux Node.js Selector expects a `.htaccess` file in the app root before it can start or update the app
- **Fix** (SSH on the server):
  ```bash
  touch /home/ilinkmth/crmbackend.ilink.market/.htaccess
  chown ilinkmth:ilinkmth /home/ilinkmth/crmbackend.ilink.market/.htaccess
  ```
  Then retry **Start** in cPanel → Setup Node.js App. Upload `backend/.htaccess` from this repo on future deploys so the file is always present.

---

## Monitoring

### Health Check Script

```bash
#!/bin/bash
curl -s https://crmbackend.ilink.market/health | jq .
```

### Production PM2 Setup

```bash
cd /path/to/backend
pm2 start src/server.js --name "crm-backend"
pm2 save
pm2 startup
```

---

## Key Files Location

| File                    | Purpose                               |
| ----------------------- | ------------------------------------- |
| `frontend/dist/`        | Production-ready frontend build       |
| `backend/src/server.js` | Backend entry point                   |
| `backend/.env`          | Backend configuration (DO NOT COMMIT) |
| `backend/schema.sql`    | MySQL database schema                 |
| `frontend/.env`         | Frontend configuration                |
| `frontend/.htaccess`    | Apache rewrite rules (if needed)      |
| `backend/.htaccess`     | Required stub for CloudLinux Node.js Selector |

---

## Next Steps

1. ✅ Code is ready
2. 🔜 Set up DNS records
3. 🔜 Get SSL certificates
4. 🔜 Create MySQL database
5. 🔜 Import schema
6. 🔜 Deploy backend
7. 🔜 Deploy frontend
8. 🔜 Test health endpoint
9. 🔜 Test app functionality
