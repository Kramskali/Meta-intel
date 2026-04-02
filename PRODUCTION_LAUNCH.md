# Device Intel - Production Launch Guide

## 🚀 Taking Device Intel Live

This guide walks you through deploying Device Intel to production and activating live payments to start generating revenue.

---

## Phase 1: Prepare Your Infrastructure (30 minutes)

### Step 1.1: Set Up MongoDB Atlas (Free Tier Available)

1. **Create MongoDB Atlas Account**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up or log in
   - Create a new project called "Device Intel"

2. **Create a Database Cluster**
   - Click "Create Deployment"
   - Choose **M0 Shared** (free tier, perfect for launch)
   - Select your region (closest to your backend)
   - Click "Create Deployment"

3. **Set Up Database Access**
   - Go to "Database Access" in the left menu
   - Click "Add New Database User"
   - Username: `device_intel_prod`
   - Password: Generate a strong password (save this!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access" in the left menu
   - Click "Add IP Address"
   - Select "Allow access from anywhere" (0.0.0.0/0) for simplicity
   - Click "Confirm"

5. **Get Your Connection String**
   - Go to "Databases" → Click "Connect"
   - Select "Drivers"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/...`)
   - Replace `<username>` and `<password>` with your database user credentials
   - Save this as your `MONGO_URL`

### Step 1.2: Set Up Stripe Live Account

1. **Create/Access Stripe Account**
   - Go to [stripe.com](https://stripe.com)
   - Create account or log in
   - Complete identity verification

2. **Get Live API Keys**
   - Go to [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
   - Make sure you're in **Live mode** (toggle at top)
   - Copy your **Secret Key** (starts with `sk_live_`)
   - Save this as your `STRIPE_API_KEY`

3. **Set Up Webhook Endpoint**
   - Go to [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
   - Click "Add Endpoint"
   - Endpoint URL: `https://api.deviceintel.com/api/webhook/stripe` (replace with your domain)
   - Events to send: Select `checkout.session.completed`
   - Click "Add Endpoint"
   - Copy the Signing Secret (we'll use this later)

### Step 1.3: Set Up PayPal Live Account

1. **Create/Access PayPal Developer Account**
   - Go to [developer.paypal.com](https://developer.paypal.com)
   - Create account or log in
   - Go to "Apps & Credentials"

2. **Get Live API Credentials**
   - Make sure you're in **Live** mode (toggle at top)
   - Under "Sandbox", click the app you want to use (or create one)
   - Copy:
     - **Client ID** → Save as `PAYPAL_CLIENT_ID`
     - **Secret** → Save as `PAYPAL_SECRET`

3. **Enable Payments**
   - Go to "Account Settings" → "Business Account"
   - Ensure your business account is fully set up and verified

---

## Phase 2: Deploy Backend (15 minutes)

### Option A: Deploy to Railway (Recommended - Easiest)

1. **Push to GitHub**
   ```bash
   cd /home/ubuntu/Meta-intel
   git init
   git add .
   git commit -m "Initial Device Intel production commit"
   git remote add origin https://github.com/yourusername/device-intel.git
   git push -u origin main
   ```

2. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Authorize GitHub and select your `device-intel` repo
   - Railway will auto-detect it's a Python project
   - Click "Deploy"

3. **Configure Environment Variables**
   - In Railway dashboard, go to your project
   - Click "Variables"
   - Add the following:
     ```
     MONGO_URL=mongodb+srv://device_intel_prod:PASSWORD@cluster.mongodb.net/device_intel_prod?retryWrites=true&w=majority
     DB_NAME=device_intel_prod
     CORS_ORIGINS=https://deviceintel.com
     STRIPE_API_KEY=sk_live_your_key_here
     PAYPAL_CLIENT_ID=your_client_id
     PAYPAL_SECRET=your_secret
     PAYPAL_MODE=live
     ```

4. **Set Start Command**
   - In Railway, go to "Settings"
   - Under "Start Command", set:
     ```
     uvicorn server:app --host 0.0.0.0 --port $PORT
     ```
   - Click "Save"

5. **Get Your Backend URL**
   - Railway will assign you a URL like: `https://device-intel-prod.railway.app`
   - Save this as your backend URL

### Option B: Deploy to AWS EC2 (More Control)

1. **Launch EC2 Instance**
   - Go to [aws.amazon.com/ec2](https://aws.amazon.com/ec2)
   - Launch a new instance (Ubuntu 22.04, t3.small)
   - Configure security group to allow ports 80, 443, 8000

2. **SSH into Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

3. **Install Dependencies**
   ```bash
   sudo apt update
   sudo apt install -y python3.11 python3-pip git
   ```

4. **Clone and Deploy**
   ```bash
   git clone https://github.com/yourusername/device-intel.git
   cd device-intel/backend
   pip install -r requirements.txt
   ```

5. **Create .env File**
   ```bash
   cat > .env << EOF
   MONGO_URL=your_mongodb_url
   DB_NAME=device_intel_prod
   CORS_ORIGINS=https://deviceintel.com
   STRIPE_API_KEY=sk_live_...
   PAYPAL_CLIENT_ID=...
   PAYPAL_SECRET=...
   PAYPAL_MODE=live
   EOF
   ```

6. **Run with Supervisor**
   ```bash
   sudo apt install -y supervisor
   sudo cat > /etc/supervisor/conf.d/device-intel.conf << EOF
   [program:device-intel]
   directory=/home/ubuntu/device-intel/backend
   command=/usr/bin/python3 -m uvicorn server:app --host 0.0.0.0 --port 8000
   autostart=true
   autorestart=true
   EOF
   sudo supervisorctl reread
   sudo supervisorctl update
   sudo supervisorctl start device-intel
   ```

---

## Phase 3: Deploy Frontend (15 minutes)

### Deploy to Vercel (Recommended - Easiest)

1. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repo
   - Framework: "Create React App"
   - Root Directory: `frontend`
   - Build Command: `yarn build`
   - Output Directory: `build`

2. **Set Environment Variables**
   - In Vercel, go to "Settings" → "Environment Variables"
   - Add:
     ```
     REACT_APP_BACKEND_URL=https://your-backend-url.railway.app
     ```

3. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - You'll get a URL like: `https://device-intel.vercel.app`

4. **Connect Custom Domain**
   - In Vercel, go to "Settings" → "Domains"
   - Add your custom domain (e.g., `deviceintel.com`)
   - Follow DNS configuration instructions

---

## Phase 4: Activate Live Payments (10 minutes)

### Update Backend with Live Keys

1. **Update Environment Variables**
   - In your hosting platform (Railway/AWS), update:
     ```
     STRIPE_API_KEY=sk_live_your_actual_key
     PAYPAL_CLIENT_ID=your_actual_client_id
     PAYPAL_SECRET=your_actual_secret
     PAYPAL_MODE=live
     ```

2. **Verify Stripe Webhook**
   - Go to [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
   - Click your endpoint
   - Send a test event to verify it works

3. **Test Payment Flow**
   - Go to your live site: `https://deviceintel.com`
   - Click "Upgrade to Pro"
   - Use Stripe test card: `4242 4242 4242 4242` (expiry: any future date, CVC: any 3 digits)
   - Verify payment completes and you see success page

---

## Phase 5: Domain & SSL Setup (10 minutes)

### Option A: Use Cloudflare (Recommended)

1. **Add Domain to Cloudflare**
   - Go to [cloudflare.com](https://cloudflare.com)
   - Add your site
   - Update nameservers at your domain registrar

2. **Enable SSL**
   - In Cloudflare, go to "SSL/TLS"
   - Set SSL/TLS encryption mode to "Full (strict)"
   - Enable "Always Use HTTPS"

### Option B: Use Let's Encrypt (Free)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d deviceintel.com -d www.deviceintel.com
```

---

## Phase 6: Launch Checklist ✅

Before going live, verify:

- [ ] MongoDB Atlas cluster is running and accessible
- [ ] Backend is deployed and responding to API calls
- [ ] Frontend is deployed and loads without errors
- [ ] Stripe live keys are configured and webhooks are working
- [ ] PayPal live credentials are configured
- [ ] SSL certificate is installed and HTTPS is working
- [ ] Custom domain is pointing to your frontend
- [ ] Payment flow works end-to-end (test transaction)
- [ ] Privacy policy and terms of service are published
- [ ] Contact/support email is configured

---

## Phase 7: Go Live! 🎉

### Launch Sequence

1. **Announce on Product Hunt**
   - Prepare screenshots and demo video
   - Write compelling launch post
   - Submit at 12:01 AM PST

2. **Post on Reddit**
   - r/privacy
   - r/netsec
   - r/SideProject
   - r/SaaS

3. **Share on Social Media**
   - Twitter/X thread
   - LinkedIn post
   - HackerNews submission

4. **Monitor & Support**
   - Watch Stripe/PayPal dashboards for transactions
   - Respond to user feedback immediately
   - Fix critical bugs within 24 hours

---

## Monitoring & Maintenance

### Daily Checks
- [ ] Backend is running (check logs)
- [ ] No payment failures
- [ ] No database errors
- [ ] Frontend loads without errors

### Weekly Checks
- [ ] Review user feedback
- [ ] Check analytics
- [ ] Monitor error rates
- [ ] Verify backups are working

### Monthly Checks
- [ ] Review revenue and metrics
- [ ] Plan next features
- [ ] Update security patches
- [ ] Analyze user behavior

---

## Troubleshooting

### Backend Not Responding
```bash
# Check logs
railway logs  # If using Railway
# Or SSH and check:
sudo supervisorctl status device-intel
sudo tail -f /var/log/supervisor/device-intel.err.log
```

### Payments Not Processing
- Verify Stripe/PayPal keys are correct (live, not sandbox)
- Check webhook signatures in Stripe dashboard
- Verify CORS is configured correctly
- Check browser console for errors

### Database Connection Issues
- Verify MongoDB Atlas IP whitelist includes your backend
- Check connection string format
- Verify credentials are correct
- Check database user has read/write permissions

---

## Revenue Tracking

### Monitor Your Earnings
- **Stripe Dashboard**: [dashboard.stripe.com](https://dashboard.stripe.com)
- **PayPal Dashboard**: [paypal.com/myaccount](https://paypal.com/myaccount)
- **Your App**: Check `/api/payments/status` endpoint

### Key Metrics
- Monthly Recurring Revenue (MRR)
- Churn rate (cancellations)
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)

---

## Next Steps for Growth

1. **User Authentication** (Week 2)
   - Add login system so users can save history
   - Implement subscription management

2. **Email Notifications** (Week 3)
   - Welcome emails
   - Upgrade prompts
   - Privacy alerts

3. **Browser Extension** (Month 2)
   - Real-time tracking protection
   - 10K+ potential users

4. **API Tier** (Month 3)
   - Developer API at $99/mo
   - Target fraud detection companies

5. **White-Label Solution** (Month 4)
   - Agencies and consultants
   - Custom branding

---

## Support & Questions

- **Deployment Issues**: Check the logs in your hosting platform
- **Payment Issues**: Contact Stripe or PayPal support
- **Technical Help**: Review the original DEPLOYMENT.md and README.md

**You're ready to start making money! 💰**

Good luck with your launch!
