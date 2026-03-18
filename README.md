# Device Intel - Privacy Metadata Intelligence Platform

![Device Intel](https://img.shields.io/badge/Privacy-Intelligence-cyan)
![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-19.0-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-green)

**Device Intel** is a comprehensive SaaS platform that reveals what information websites collect from your device. With expert-level explanations, privacy scoring, and monetization-ready payment integration.

## 🎯 What It Does

Device Intel collects and displays **all metadata** that websites can gather:

- **Browser Fingerprinting**: User agent, languages, plugins, cookies
- **Device Specs**: Screen resolution, CPU cores, memory, GPU info
- **Network Data**: Connection type, speed, IP address
- **Storage Tracking**: localStorage, sessionStorage, IndexedDB
- **Permissions**: Geolocation, notifications, camera, microphone
- **Hidden Fingerprints**: Canvas, WebGL, installed fonts, battery status, timezone
- **Server-Side Collection**: IP, HTTP headers, security headers

## ✨ Features

### Core Features
- ✅ **8 Metadata Categories** with 50+ data points
- ✅ **Expert Explanations** - hover tooltips on every field
- ✅ **Privacy Score** (0-100) with actionable recommendations
- ✅ **Historical Tracking** - save and compare snapshots
- ✅ **Export to JSON** - download complete reports
- ✅ **Real-time Collection** - instant device scanning

### Monetization Ready
- 💳 **Stripe Integration** - card payments
- 💳 **PayPal Integration** - PayPal payments
- 📊 **3 Pricing Tiers** - Free, Pro ($9/mo), Enterprise ($29/mo)
- 🔒 **Feature Gating** - subscription-based access

### Design
- 🎨 **Cybersecurity HUD Theme** - dark mode with cyan/emerald accents
- 🚀 **Bento Grid Layout** - modern, responsive design
- ⚡ **Micro-animations** - scanlines, glows, hover effects
- 📱 **Fully Responsive** - desktop, tablet, mobile

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Python 3.11+
- MongoDB
- Stripe Account (for payments)
- PayPal Developer Account (for PayPal payments)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/device-intel.git
cd device-intel
```

2. **Backend Setup**
```bash
cd backend
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
MONGO_URL="mongodb://localhost:27017"
DB_NAME="device_intel"
CORS_ORIGINS="*"
STRIPE_API_KEY=your_stripe_key_here
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret
PAYPAL_MODE=sandbox
EOF

# Run server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

3. **Frontend Setup**
```bash
cd frontend
yarn install

# Create .env file
cat > .env << EOF
REACT_APP_BACKEND_URL=http://localhost:8001
EOF

# Run development server
yarn start
```

4. **Access the app**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001/docs

## 🔑 API Keys Setup

### Stripe
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your **Secret Key** from Developers → API Keys
3. Add to `backend/.env`: `STRIPE_API_KEY=sk_test_...`

### PayPal
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Create an app and get **Client ID** and **Secret**
3. Add to `backend/.env`:
   ```
   PAYPAL_CLIENT_ID=your_client_id
   PAYPAL_SECRET=your_secret
   PAYPAL_MODE=sandbox  # or 'live' for production
   ```

## 📊 Architecture

```
device-intel/
├── frontend/               # React 19 SPA
│   ├── src/
│   │   ├── components/    # UI components
│   │   │   ├── Dashboard.js
│   │   │   ├── PricingModal.js
│   │   │   └── ui/        # Shadcn components
│   │   ├── utils/
│   │   │   ├── metadataCollector.js  # Client-side collection
│   │   │   └── privacyScorer.js      # Privacy scoring
│   │   ├── App.js
│   │   └── index.css
│   └── package.json
│
├── backend/                # FastAPI server
│   ├── server.py          # Main API
│   ├── requirements.txt
│   └── .env
│
└── README.md
```

## 🎨 Tech Stack

### Frontend
- **React 19** - UI framework
- **Tailwind CSS** - styling
- **Shadcn/UI** - component library
- **Lucide React** - icons
- **Axios** - HTTP client

### Backend
- **FastAPI** - Python web framework
- **Motor** - async MongoDB driver
- **Pydantic** - data validation
- **Emergentintegrations** - Stripe wrapper
- **PayPal SDK** - PayPal integration

### Database
- **MongoDB** - document store
  - `metadata_snapshots` - saved scans
  - `payment_transactions` - payment records

## 💰 Monetization Strategy

### Pricing Tiers

| Feature | Free | Pro ($9/mo) | Enterprise ($29/mo) |
|---------|------|-------------|---------------------|
| Device Scans | 1 | Unlimited | Unlimited |
| Privacy Score | ❌ | ✅ | ✅ |
| Historical Tracking | ❌ | 90 days | Unlimited |
| Comparisons | ❌ | ✅ | ✅ |
| Alerts | ❌ | ✅ | ✅ |
| Multi-device | ❌ | ❌ | ✅ |
| API Access | ❌ | ❌ | ✅ |
| Support | Community | Priority | Dedicated |

### Revenue Potential
- **B2C**: Privacy-conscious individuals ($9/mo)
- **B2B**: Companies auditing data collection ($29+/mo per seat)
- **Enterprise**: Custom pricing for large orgs
- **API**: Developer tool for bot detection

## 🛠️ Deployment

### Vercel (Frontend)
```bash
cd frontend
vercel --prod
```

### Railway/Render (Backend)
1. Connect GitHub repo
2. Set environment variables
3. Deploy

### MongoDB Atlas
1. Create cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Update `MONGO_URL` in backend `.env`

## 📈 Future Enhancements

- [ ] User authentication & accounts
- [ ] Email alerts for fingerprint changes
- [ ] Browser extension for real-time tracking
- [ ] VPN/Proxy detection
- [ ] Device comparison tool
- [ ] Public API for developers
- [ ] Webhook integrations
- [ ] White-label solution

## 🔒 Privacy & Security

- All data stored locally or in your database
- No third-party data sharing
- End-to-end encryption optional
- GDPR compliant
- User data deletion on request

## 📝 License

MIT License - feel free to use commercially

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 💬 Support

- **Email**: support@deviceintel.com
- **Discord**: [Join our community](https://discord.gg/yourinvite)
- **Docs**: [deviceintel.com/docs](https://deviceintel.com/docs)

## 🌟 Star History

If you find this useful, please star the repo!

---

**Built with ❤️ for privacy-conscious users and developers**

[Live Demo](https://deviceintel.com) | [Documentation](https://docs.deviceintel.com) | [API Reference](https://api.deviceintel.com/docs)
