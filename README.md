# 🦅 Sea Hawk Courier & Cargo — Full-Stack SaaS Platform v2.0

A production-grade, full-stack courier management SaaS platform built like a Fortune 500 engineering team would build it. Every file, every layer, every page.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     PRODUCTION STACK                     │
├─────────────────────────────────────────────────────────┤
│  Nginx (reverse proxy, SSL, static files, rate limiting)│
├──────────────┬──────────────────────────────────────────┤
│   website/   │           portal/ (React SPA)            │
│  (Static HTML│        React 18 + Vite + Tailwind        │
│   CSS/JS)    │        24 pages, JWT auth, charts        │
├──────────────┴──────────────────────────────────────────┤
│              backend/ (Node.js API Server)               │
│     Express + Prisma ORM + PostgreSQL + JWT + Zod       │
│     14 DB models, 10 route groups, scheduler, audit     │
├─────────────────────────────────────────────────────────┤
│              PostgreSQL 16 Database                      │
│   14 tables, indexed queries, migrations, seed data     │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Complete Project Structure

```
seahawk/                           ← Root (push to GitHub)
│
├── .github/
│   └── workflows/
│       └── deploy.yml             ← CI/CD: test → build → SSH deploy + Docker push
│
├── backend/
│   ├── server.js                  ← Entry point, DB connect, PM2 graceful shutdown
│   ├── package.json
│   ├── .env.example               ← ⚠️  Copy → .env, fill in all values
│   ├── .env.production.example
│   ├── prisma/
│   │   ├── schema.prisma          ← 14-model DB schema (PostgreSQL)
│   │   └── migrations/            ← Auto-generated migration history
│   └── src/
│       ├── app.js                 ← Express: CORS, Helmet, Morgan, all routes
│       ├── config/
│       │   ├── index.js           ← Validated config — throws on missing env vars
│       │   └── prisma.js          ← Singleton Prisma client with query logging
│       ├── controllers/           ← Thin handlers — call services, return response
│       │   ├── auth.controller.js
│       │   ├── shipment.controller.js
│       │   ├── client.controller.js
│       │   ├── invoice.controller.js
│       │   ├── contract.controller.js
│       │   └── audit.controller.js
│       ├── middleware/
│       │   ├── auth.middleware.js  ← JWT protect + adminOnly + staffOrAdmin guards
│       │   ├── errorHandler.js    ← Global error handler + AppError + asyncHandler
│       │   └── validate.middleware.js ← Zod schema validation factory
│       ├── routes/                ← Express routers — all mounted in app.js
│       │   ├── auth.routes.js     ← login, refresh, logout, me, users (admin)
│       │   ├── shipment.routes.js ← CRUD, bulk import, stats, status patch
│       │   ├── client.routes.js   ← CRUD, per-client stats
│       │   ├── contract.routes.js ← Rate contracts, price calculation
│       │   ├── invoice.routes.js  ← Generate, status lifecycle
│       │   ├── audit.routes.js    ← Read-only audit log (admin)
│       │   ├── ops.routes.js      ← Aggregated ops dashboard stats
│       │   ├── rates.routes.js    ← Rate engine: calculate, bulk, health, margin rules
│       │   ├── quote.routes.js    ← Quote lifecycle: create, list, status
│       │   └── reconciliation.routes.js ← Courier invoice upload and matching
│       ├── services/              ← All business logic + DB queries live here
│       │   ├── auth.service.js    ← bcrypt hash, JWT sign, refresh, user CRUD
│       │   ├── shipment.service.js ← Filters, bulk import, daily/monthly stats
│       │   ├── client.service.js  ← Upsert, stats aggregation
│       │   ├── invoice.service.js ← Auto invoice number, unbilled shipment query
│       │   ├── contract.service.js ← Contract matching, price calculation
│       │   ├── quote.service.js   ← Quote numbering, conversion stats
│       │   └── reconciliation.service.js ← Courier invoice vs our DB matching
│       ├── utils/
│       │   ├── logger.js          ← Winston: pretty dev, JSON prod, file rotation
│       │   ├── response.js        ← ok/created/paginated/error/notFound helpers
│       │   ├── audit.js           ← Write structured audit log to DB
│       │   ├── rateEngine.js      ← ⭐ Full rate engine: 17 courier modes
│       │   │                         Trackon Exp/SFC/Air/PT · DTDC 7X/7D/7G/XDOC/XNDX
│       │   │                         Delhivery Std/Exp · B2B · GEC SFC · LTL Road
│       │   │                         BlueDart Exp/Air/SFC · State→Zone mapping
│       │   ├── scheduler.js       ← node-cron: daily DB backup, audit cleanup, summary
│       │   └── seed.js            ← Creates admin user + sample client
│       └── validators/
│           ├── auth.validator.js  ← Zod: login, createUser, updateUser, changePassword
│           └── shipment.validator.js ← Zod: shipment, client, contract, invoice, import
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js             ← Proxy /api → :3001 in dev, manual chunks
│   ├── tailwind.config.js         ← Navy + Orange design tokens
│   ├── postcss.config.js
│   └── src/
│       ├── App.jsx                ← BrowserRouter + all 24 routes + Protected HOC
│       ├── main.jsx
│       ├── index.css              ← Tailwind + custom .btn / .input / .tbl / .badge classes
│       ├── context/
│       │   └── AuthContext.jsx    ← Access token in memory, refresh cookie, session restore
│       ├── hooks/
│       │   ├── useFetch.js        ← Generic data hook with refetch + transform
│       │   └── useToast.js        ← Toast notification hook
│       ├── services/
│       │   └── api.js             ← Axios + silent token refresh on 401
│       ├── components/
│       │   ├── layout/
│       │   │   └── AppLayout.jsx  ← Sidebar + mobile nav + all route links
│       │   └── ui/
│       │       └── index.jsx      ← Toasts, Modal, Spinner, EmptyState, StatusBadge
│       │                             StatCard, ConfirmDialog, Alert, Pagination
│       └── pages/                 ← 24 pages
│           ├── LoginPage.jsx
│           ├── DashboardPage.jsx          ← Stats, carrier chart, top clients, activity
│           ├── OperationsDashboard.jsx    ← CEO view with daily trend + revenue charts
│           ├── NewEntryPage.jsx           ← Keyboard-optimised, Enter to save
│           ├── ImportPage.jsx             ← Excel bulk import
│           ├── AllShipmentsPage.jsx       ← Search, filter, edit, delete
│           ├── PendingPage.jsx            ← Mark delivered, change status
│           ├── TrackPage.jsx              ← AWB lookup + carrier tracking links
│           ├── DailySheetPage.jsx         ← Date picker, printable daily report
│           ├── MonthlyReportPage.jsx      ← Monthly analytics
│           ├── ClientsPage.jsx            ← Full CRUD with modal form
│           ├── ContractsPage.jsx          ← Rate contracts per client
│           ├── InvoicesPage.jsx           ← Generate + DRAFT→SENT→PAID lifecycle
│           ├── ReconciliationPage.jsx     ← Courier invoice discrepancy analysis
│           ├── RateCalculatorPage.jsx     ← All 17 courier modes, margin analysis
│           ├── BulkComparePage.jsx        ← Compare rates across all couriers
│           ├── RateCardPage.jsx           ← Generate rate card PDFs
│           ├── QuoteHistoryPage.jsx       ← Quote log with status
│           ├── WhatsAppPage.jsx           ← Send rates via WhatsApp Business
│           ├── SyncPage.jsx               ← Export to Excel, backup
│           ├── UsersPage.jsx              ← ADMIN: manage portal users
│           ├── AuditPage.jsx              ← ADMIN: full change history
│           ├── RateManagementPage.jsx     ← ADMIN: edit carrier rate tables
│           └── ProfilePage.jsx            ← Change password, sign out
│
├── website/                       ← Public marketing website (static)
│   ├── index.html                 ← Home: hero illustration, animated map, stat counters
│   ├── services.html              ← 5 services in full detail with rate tables
│   ├── contact.html               ← Contact form + FAQ
│   ├── css/
│   │   └── style.css              ← Navy + Orange design system, 800 lines
│   ├── js/
│   │   ├── main.js                ← Navigation, tracking, counters, scroll reveal
│   │   ├── calculator.js          ← Rate calculator (matches backend engine)
│   │   ├── hero.js                ← Animated logistics SVG illustration
│   │   └── map.js                 ← Animated India + world coverage map
│   └── images/
│       ├── logo.png               ← Real Sea Hawk eagle logo
│       ├── favicon.ico
│       ├── courier-service.jpg
│       ├── support.jpg
│       ├── hero-courier.webp
│       ├── cta-bg.jpg
│       └── partners/
│           ├── trackon.png · dtdc.png · bluedart.png · dhl.png
│
├── Dockerfile                     ← Multi-stage: React build → Node production
├── docker-compose.yml             ← Postgres + Redis + App + Nginx
├── nginx.conf                     ← HTTPS, rate limiting, gzip, proxy
├── ecosystem.config.js            ← PM2 cluster mode config
├── .github/workflows/deploy.yml   ← CI/CD pipeline
├── .gitignore
└── README.md                      ← This file
```

---

## 🚀 Quick Start — Development

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (or Docker)
- npm 9+

### 1. Clone and set up backend
```bash
git clone https://github.com/yourname/seahawk.git
cd seahawk

cd backend
cp .env.example .env
# Edit .env — fill in DATABASE_URL and JWT secrets

npm install
npx prisma migrate deploy
npx prisma generate
npm run db:seed
# Creates: admin@seahawk.com / admin123

npm run dev
# → API running at http://localhost:3001
# → Health: http://localhost:3001/api/health
```

### 2. Set up frontend
```bash
# New terminal
cd frontend
npm install
npm run dev
# → Portal at http://localhost:5173
```

### 3. Marketing website
```bash
# No build needed — just open in browser
cd website
# Option A: VS Code Live Server
# Option B: npx serve .
```

---

## 🐳 Docker (Full stack, one command)

```bash
cp backend/.env.example backend/.env.production
# Edit backend/.env.production — fill in all secrets

docker-compose up -d

# First time: run migrations
docker-compose exec app sh -c "cd backend && npx prisma migrate deploy && node src/utils/seed.js"
```

Everything runs at **http://localhost**:
- `/` — Marketing website
- `/portal/` — React portal
- `/api/` — REST API

---

## ☁️ Deploy to Production

### Railway (easiest — 10 minutes)
1. Push to GitHub
2. New project → Deploy from GitHub repo
3. Add PostgreSQL service
4. Set environment variables:
   ```
   NODE_ENV=production
   JWT_SECRET=<generate 64 char random>
   JWT_REFRESH_SECRET=<generate different 64 char random>
   CORS_ORIGIN=https://your-netlify-app.netlify.app
   ```
5. Run in Railway shell: `cd backend && npx prisma migrate deploy && node src/utils/seed.js`

### VPS with PM2 (full control)
```bash
# On your Ubuntu VPS

# 1. Install Node 20 + PostgreSQL + Nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql nginx

# 2. Clone repo
git clone https://github.com/yourname/seahawk.git /var/www/seahawk
cd /var/www/seahawk

# 3. Configure production env
cp backend/.env.example backend/.env.production
nano backend/.env.production  # Fill in all values

# 4. Build everything
cd frontend && npm ci && npm run build && cd ..
cd backend && npm ci --only=production && npx prisma migrate deploy && npx prisma generate && node src/utils/seed.js && cd ..

# 5. Start with PM2
npm install -g pm2
pm2 start ecosystem.config.js --env production
pm2 save && pm2 startup  # Follow the printed command for auto-start

# 6. Configure nginx
sudo cp nginx.conf /etc/nginx/nginx.conf
sudo nginx -t && sudo systemctl reload nginx
```

### Netlify (website only) + Railway (API)
```
website/ folder  →  Netlify (drag & drop the folder, free)
backend/ + frontend/ build  →  Railway (connects to GitHub)
```
After Railway deploy, update `VITE_API_URL` in frontend to your Railway URL and rebuild.

---

## 🔑 Environment Variables

### `backend/.env`
```env
NODE_ENV=development
PORT=3001

# PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/seahawk_v6"

# JWT — generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET="<64-char-random-string>"
JWT_REFRESH_SECRET="<different-64-char-random-string>"
JWT_ACCESS_EXPIRES=1h
JWT_REFRESH_EXPIRES=30d

# CORS (production: your domain)
# CORS_ORIGIN=https://seahawkcourier.in,https://app.seahawkcourier.in
```

### `frontend/.env`
```env
VITE_API_URL=/api
# Production: VITE_API_URL=https://api.seahawkcourier.in/api
```

---

## 📡 API Reference

### Authentication
```
POST  /api/auth/login              Login → access token + httpOnly cookie
POST  /api/auth/refresh            Refresh access token (cookie)
POST  /api/auth/logout             Clear cookie
GET   /api/auth/me                 Current user
PUT   /api/auth/change-password    Change own password
GET   /api/auth/users              [ADMIN] List users
POST  /api/auth/users              [ADMIN] Create user
PUT   /api/auth/users/:id          [ADMIN] Update user
```

### Shipments
```
GET    /api/shipments              List (q, status, courier, date_from, date_to, client)
GET    /api/shipments/stats/today  Dashboard stats
GET    /api/shipments/stats/monthly Monthly stats
POST   /api/shipments              Create
POST   /api/shipments/import       Bulk import array
GET    /api/shipments/:id          Single shipment
PUT    /api/shipments/:id          Update
PATCH  /api/shipments/:id/status   Status only
DELETE /api/shipments/:id          [ADMIN]
```

### Rates Engine
```
POST  /api/rates/calculate         Rate for state+weight — all 17 courier modes
POST  /api/rates/calculate/bulk    Bulk 1-500 shipments
GET   /api/rates/health            Rate table age/staleness check
GET   /api/rates/margin-rules      Margin rules
POST  /api/rates/margin-rules      [ADMIN] Create rule
GET   /api/rates/versions          Rate version history
```

### All other endpoints
- `/api/clients` — CRUD, stats
- `/api/contracts` — Rate contracts, price calc
- `/api/invoices` — Generate, status lifecycle
- `/api/quotes` — Quote CRUD, stats
- `/api/reconciliation` — Courier invoice upload + matching
- `/api/audit` — [ADMIN] Audit logs
- `/api/ops/dashboard` — Aggregated CEO-level stats
- `/api/health` — Health check (no auth)

---

## 🗄️ Database Models

| Model | Description |
|---|---|
| User | Portal users (ADMIN/STAFF), bcrypt passwords |
| Client | Corporate clients with code, company, contact, GST |
| Shipment | Every shipment — AWB, status, weight, amount, carrier |
| Contract | Rate contracts per client (PER_KG/FLAT/PER_SHIPMENT) |
| Invoice | Client invoices with line items, GST calculation |
| InvoiceItem | Shipment lines within an invoice |
| Quote | Rate quotes with margin tracking and status |
| CourierInvoice | Carrier invoices uploaded for reconciliation |
| CourierInvoiceItem | Line items in carrier invoices |
| AuditLog | Full mutation history — user, IP, old/new values |
| MarginRule | Minimum margin enforcement rules per carrier/zone |
| RateVersion | Rate table snapshots with effective date |

---

## ⚡ Rate Engine

The `backend/src/utils/rateEngine.js` is the core business logic:

**17 courier modes:**
- Trackon Express, Surface, Air Cargo, Prime Track
- DTDC Ecomm 7X, 7D, 7G (Gold), Priority X Doc, Priority X Parcel
- Delhivery Standard, Express
- B2B Courier (LTL)
- GEC Surface
- LTL Road Express
- BlueDart Express, Air Cargo, Surface

**Features:**
- `stateToZones(state, district, city)` — Maps any Indian address to carrier-specific zones
- `courierCost(courierId, zone, weight, oda)` — Returns full cost breakdown (base, FSC, docket, GST, ODA, total)
- `proposalSell(zone, weight, type, level)` — Returns our selling price (economy/premium)
- MCW (Minimum Chargeable Weight) enforcement
- FSC (Fuel Surcharge) per carrier
- Rate validity tracking (warns when rate tables are stale)

---

## 🔐 Security Architecture

| Concern | Implementation |
|---|---|
| Access tokens | Short-lived JWT (1h) stored in React memory — never localStorage |
| Refresh tokens | Long-lived JWT (30d) in httpOnly cookie — invisible to JavaScript |
| Password hashing | bcrypt, 12 salt rounds |
| Timing-safe auth | Always runs bcrypt.compare even for non-existent users |
| Input validation | Zod schemas on every API route |
| SQL injection | Impossible — Prisma uses parameterised queries |
| Security headers | Helmet.js (CSP, HSTS, X-Frame-Options, etc.) |
| Rate limiting | Nginx: 30 req/s global, 5 req/min for login |
| Audit trail | Every mutation logged — entity, user, IP, old/new values |
| Non-root Docker | Runs as `seahawk` user (UID 1001) |

---

## 👤 Default Credentials

After running `npm run db:seed`:

| Field | Value |
|---|---|
| Email | `admin@seahawk.com` |
| Password | `admin123` |
| Role | ADMIN |

⚠️ **Change the password immediately after first login.**

---

## 📞 Sea Hawk Courier & Cargo

- 📞 **+91 99115 65523** · +91 83682 01122
- 💬 [WhatsApp](https://wa.me/919911565523)
- 📍 Delhi NCR, India
