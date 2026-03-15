# 🚀 Sea Hawk — Complete Hosting Guide

This guide covers every hosting option — from free platforms to GoDaddy, Hostinger and your own server.

---

## 🎯 ANSWER TO YOUR QUESTION: Can I host everything in one place?

**Yes — and you have two good options:**

---

## Option A — Hostinger (RECOMMENDED for you) ⭐

**Cost: ~₹200–400/month for everything**
**Best for: Non-technical users who want one dashboard, one bill, one support team**

Hostinger lets you host your website, portal AND backend all in one place.

### What to buy on Hostinger:
Go to **hostinger.in** → Buy **Business Web Hosting** plan (~₹279/mo)

This gives you:
- Your domain (seahawkcourier.in)
- Website hosting
- SSL certificate (free)
- Email (info@seahawkcourier.in)
- **VPS** for the backend (add on, ~₹500/mo for KVM 1)

### Step-by-step on Hostinger:

**Step 1 — Buy a domain**
- Go to hostinger.in → search `seahawkcourier.in`
- Buy it (~₹800/year for .in domain)

**Step 2 — Upload the website**
- In Hostinger dashboard → File Manager → `public_html` folder
- Upload everything inside your `website/` folder
- Your site is live at `seahawkcourier.in` ✅

**Step 3 — Get a VPS for the backend**
- Hostinger → VPS Hosting → KVM 1 (~₹499/month)
- Choose Ubuntu 22.04
- Once started, you get an IP address like `65.21.xxx.xxx`

**Step 4 — Set up the backend on VPS**

Connect to your VPS (Hostinger gives you a terminal button in dashboard):
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib
sudo -u postgres createdb seahawk_v6
sudo -u postgres createuser seahawk
sudo -u postgres psql -c "ALTER USER seahawk WITH PASSWORD 'YourStrongPassword123';"
sudo -u postgres psql -c "GRANT ALL ON DATABASE seahawk_v6 TO seahawk;"

# Install PM2 (keeps app running)
sudo npm install -g pm2

# Upload your project
# (use Hostinger's file manager or Git)
cd /var/www
git clone https://github.com/yourusername/seahawk-courier.git seahawk
cd seahawk

# Configure environment
cp backend/.env.example backend/.env
nano backend/.env
# Fill in: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, CORS_ORIGIN

# Install and start
cd backend && npm install && npx prisma migrate deploy && node src/utils/seed.js
cd ..
pm2 start ecosystem.config.js --env production
pm2 save && pm2 startup
```

**Step 5 — Build and upload the React portal**

On your local computer:
```bash
cd frontend
echo "VITE_API_URL=https://seahawkcourier.in/api" > .env.production
npm install && npm run build
```
Then upload the `frontend/dist/` folder to Hostinger File Manager → `public_html/portal/`

**Step 6 — Configure Nginx on the VPS**
```bash
sudo apt install nginx
sudo cp /var/www/seahawk/nginx.conf /etc/nginx/nginx.conf
# Edit nginx.conf — replace seahawkcourier.in with your actual domain
sudo nginx -t && sudo systemctl reload nginx
```

**Step 7 — Free SSL certificate**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seahawkcourier.in -d www.seahawkcourier.in
```
Certbot auto-renews every 90 days.

**Done — everything on Hostinger, one bill. ✅**

---

## Option B — GoDaddy ⭐

**Cost: ~₹300/mo for hosting + domain**
**Very similar to Hostinger — same concept**

1. Go to **godaddy.com** → Domain + Business Hosting plan
2. Buy `seahawkcourier.in` domain
3. For the backend, GoDaddy's shared hosting won't work for Node.js
   → Add a **GoDaddy VPS** (~₹800/mo) for the API server
4. Follow the same VPS setup steps as Hostinger above

GoDaddy vs Hostinger: **Hostinger is cheaper** and has a better control panel for this use case. GoDaddy has better phone support in India.

---

## Option C — Free (Best to start with)

**Cost: ₹0 — use this while testing, switch to Hostinger when ready**

| Service | What it hosts | Cost |
|---|---|---|
| Netlify | Website + Portal frontend | Free |
| Railway | Backend API + Database | Free (then $5/mo) |

This is the easiest and fastest way to get online today. You can always move to Hostinger later — just change the domain DNS settings.

---

## Option D — Full Control VPS (Advanced)

**Cost: ~₹300-600/mo from DigitalOcean / Linode / Hetzner**
**Best for: When you have a developer managing it**

- DigitalOcean Droplet ($6/mo) or Hetzner Cloud (€3.29/mo — cheapest)
- You install everything yourself: Nginx, Node.js, PostgreSQL, SSL
- Full control over everything
- Use the `Dockerfile` + `docker-compose.yml` already in your project

---

## 🏆 My Recommendation for You

### Start today (free, 20 minutes):
1. Push to GitHub
2. Deploy website to **Netlify** (free)
3. Deploy backend to **Railway** (free)

### When you're ready to go professional:
1. Buy `seahawkcourier.in` on **Hostinger** (~₹800/year)
2. Get **Hostinger KVM 1 VPS** (~₹499/mo)
3. Point your domain to the VPS
4. Move everything there

**You keep the same code — just change where it runs.**

---

## 📧 Professional Email Setup

Once you have a domain, set up `info@seahawkcourier.in`, `sales@seahawkcourier.in` etc.

**Option 1 — Google Workspace** (₹150/user/month)
- Professional Gmail for your domain
- Goes to your normal Gmail app

**Option 2 — Hostinger Email** (included with hosting)
- Free with your Hostinger plan
- Access via webmail or any email app

---

## 🌐 Domain Options (where to buy)

| Registrar | .in price | .com price | Notes |
|---|---|---|---|
| Hostinger | ~₹699/yr | ~₹999/yr | Best value |
| GoDaddy | ~₹799/yr | ~₹850/yr | Well known |
| BigRock | ~₹749/yr | ~₹999/yr | Good support |
| Namecheap | ~₹800/yr | ~₹700/yr | Cheapest .com |

**Recommended domain:** `seahawkcourier.in` — professional, Indian identity, affordable

---

## 🔒 SSL Certificate (HTTPS — the padlock)

Always required for professional sites. All options:

| Platform | SSL Cost | How |
|---|---|---|
| Netlify | Free | Automatic |
| Railway | Free | Automatic |
| Hostinger | Free | One click in dashboard |
| Any VPS | Free | `sudo certbot --nginx` (Let's Encrypt) |

**You never need to pay for SSL.** Anyone selling you a paid SSL certificate is overcharging you.

---

## 📱 WhatsApp Business Integration

For the WhatsApp features in your portal:
1. Get a **WhatsApp Business API** account at **business.whatsapp.com**
2. Or use **Wati.io** (₹1,500/mo) — simpler setup, connects to your existing number
3. Your portal already has the WhatsApp page ready — just needs the API credentials

---

## ⚡ Quick Start Comparison

| | Netlify + Railway | Hostinger |
|---|---|---|
| Setup time | 20 minutes | 2-3 hours |
| Cost | Free → $5/mo | ~₹700/mo |
| Technical skill | Easy | Moderate |
| Custom domain | Yes (connect) | Yes (included) |
| Email included | No | Yes |
| One dashboard | No (2 platforms) | Yes |
| Recommended for | Testing / start | Going live |
