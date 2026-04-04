# 🛡️ Meta Intel (Device Intel)

**Meta Intel** is a high-performance privacy metadata intelligence platform designed to reveal the extensive data websites collect from users. Built for transparency, security, and monetization.

---

## 🚀 1-Click Deployment

Deploy your own instance of Meta Intel and start generating revenue in minutes.

### **Step 1: Deploy Backend (Railway)**
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/Kramskali/Meta-intel&envs=MONGO_URL,DB_NAME,CORS_ORIGINS,PAYPAL_CLIENT_ID,PAYPAL_SECRET,PAYPAL_MODE)

*   **Required Variables**: `MONGO_URL`, `DB_NAME`, `CORS_ORIGINS`, `PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`, `PAYPAL_MODE`.
*   **Note**: Your credentials are already pre-configured in `backend/.env.production`.

### **Step 2: Deploy Frontend (Vercel)**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Kramskali/Meta-intel&env=REACT_APP_BACKEND_URL&root-directory=frontend)

*   **Required Variable**: `REACT_APP_BACKEND_URL` (The URL from your Railway deployment).

---

## 💰 Monetization Features

Meta Intel is built to generate revenue from day one:
- **Free Tier**: Basic metadata scanning.
- **Pro Tier ($9/mo)**: Advanced fingerprinting, history saving, and deep network analysis.
- **Enterprise ($29/mo)**: API access, bulk scanning, and white-label reports.
- **Integrated Payments**: Fully functional **PayPal Live** integration.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Tailwind CSS, Framer Motion.
- **Backend**: FastAPI (Python 3.11), MongoDB Atlas.
- **Payments**: PayPal SDK (Live Mode).
- **Infrastructure**: Railway (Backend), Vercel (Frontend).

---

## 🔒 Security & Privacy

- **Zero-Knowledge Architecture**: We don't store what we don't need.
- **Encrypted Metadata**: All user data is encrypted at rest in MongoDB.
- **Secure Payments**: Handled directly by PayPal; no card data touches our servers.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

© 2026 Meta Intel. All rights reserved.
