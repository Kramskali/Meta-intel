# 🚀 Meta Intel - FINAL LAUNCH GUIDE

Follow these **3 simple steps** to take **metaintel.com** live with your **X.509 Certificate** and **PayPal Live** payments.

---

## 📋 Step 1: Copy These Values

You will need these for the next steps. **Copy them now.**

### **Backend (Railway) Variables:**
- `MONGO_URL`: `mongodb+srv://cluster1.cqt1gzx.mongodb.net/?authMechanism=MONGODB-X509&authSource=%24external&tls=true`
- `DB_NAME`: `device_intel_prod`
- `CORS_ORIGINS`: `https://metaintel.com,https://www.metaintel.com`
- `PAYPAL_CLIENT_ID`: `AVshjqaYbr9e5WKaheheaDJZHQUf1JYQbrOaCqVUjphzvv6H1zFzY68gwY9E4aPMxayza___HIbHWede`
- `PAYPAL_SECRET`: `(Your NEW PayPal Secret - Rotate it first!)`
- `PAYPAL_MODE`: `live`
- `MONGODB_CERT_PATH`: `/app/backend/cert.pem`

---

## 🚀 Step 2: Deploy Backend (Railway)

1.  Go to your GitHub: [Kramskali/Meta-intel](https://github.com/Kramskali/Meta-intel)
2.  Click the **"Deploy on Railway"** button in the README.
3.  **Paste the values** from Step 1 into the Railway dashboard.
4.  **Upload your Certificate**: Once the project is created in Railway, go to your service settings and upload your `.pem` file to the path `/app/backend/cert.pem`.
5.  **Copy your Railway URL**: Once deployed, copy the URL Railway gives you (e.g., `https://meta-intel-production.up.railway.app`).

---

## 🚀 Step 3: Deploy Frontend (Vercel)

1.  Click the **"Deploy with Vercel"** button in your GitHub README.
2.  When it asks for `REACT_APP_BACKEND_URL`, **paste the Railway URL** you just copied.
3.  **Connect your domain**: Go to "Settings" -> "Domains" and add `metaintel.com`.

---

## 💰 You are now in business!

Once these steps are done, **metaintel.com** will be live and processing real PayPal payments.

**Good luck with the launch! 🚀**
