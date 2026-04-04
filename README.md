# 🛡️ Meta Intel (Device Intel)

**Meta Intel** is a high-performance privacy metadata intelligence platform designed to reveal the extensive data websites collect from users. Built for transparency, security, and monetization.

---

## 🚀 Secure 1-Click Deployment

Deploy your own instance of Meta Intel securely using environment variables. **No secrets are stored in the code.**

### **Step 1: Deploy Backend (Railway)**
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/Kramskali/Meta-intel&envs=MONGO_URL,DB_NAME,CORS_ORIGINS,PAYPAL_CLIENT_ID,PAYPAL_SECRET,PAYPAL_MODE)

When prompted, enter the following **Environment Variables**:
- `MONGO_URL`: Your MongoDB Atlas connection string.
- `DB_NAME`: `device_intel_prod`
- `CORS_ORIGINS`: `https://metaintel.com`
- `PAYPAL_CLIENT_ID`: Your PayPal Live Client ID.
- `PAYPAL_SECRET`: Your PayPal Live Secret.
- `PAYPAL_MODE`: `live`

### **Step 2: Deploy Frontend (Vercel)**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Kramskali/Meta-intel&env=REACT_APP_BACKEND_URL&root-directory=frontend)

When prompted, enter the following **Environment Variable**:
- `REACT_APP_BACKEND_URL`: The URL from your Railway deployment (e.g., `https://meta-intel-production.up.railway.app`).

---

## 🔒 Security First

- **Zero Secrets in Code**: All sensitive credentials (PayPal, MongoDB) are handled via secure environment variables on the hosting platform.
- **Git History Cleaned**: The repository history has been scrubbed to ensure no previous secrets remain.
- **Encrypted Metadata**: All user data is encrypted at rest in MongoDB.

---

## 💰 Monetization Features

- **Free Tier**: Basic metadata scanning.
- **Pro Tier ($9/mo)**: Advanced fingerprinting and history.
- **Enterprise ($29/mo)**: API access and bulk scanning.
- **Integrated Payments**: Fully functional **PayPal Live** integration.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

© 2026 Meta Intel. All rights reserved.
