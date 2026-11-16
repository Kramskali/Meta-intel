# Meta Intel - Deployment Guide

Use these steps to verify or deploy **metaintel.com** with X.509 database authentication and PayPal Live payments.

**Security:** Rotate the PayPal secret that was previously exposed in this repository. Enter credential values only in Railway's protected environment settings. Never commit them to GitHub.

---

## Step 1: Set Backend Variables in Railway

Fill in every placeholder locally in Railway. Do not copy real values into this file.

- `MONGO_URL`: `YOUR_MONGODB_X509_CONNECTION_STRING`
- `DB_NAME`: `device_intel_prod`
- `CORS_ORIGINS`: `https://metaintel.com,https://www.metaintel.com`
- `PAYPAL_CLIENT_ID`: `YOUR_PAYPAL_CLIENT_ID`
- `PAYPAL_SECRET`: `YOUR_ROTATED_PAYPAL_SECRET`
- `PAYPAL_MODE`: `live`
- `MONGODB_CERT_PATH`: `/app/backend/cert.pem`

---

## Step 2: Verify or Deploy the Backend on Railway

1. Open the [Kramskali/Meta-intel](https://github.com/Kramskali/Meta-intel) repository.
2. If no Railway service exists, use the **Deploy on Railway** button in the README.
3. Set the variables listed above in Railway's protected environment settings.
4. Install the X.509 `.pem` certificate through Railway's protected file or secret mechanism at `/app/backend/cert.pem`. Do not commit the certificate to GitHub.
5. Copy the actual Railway service URL.
6. Verify `https://YOUR_RAILWAY_BACKEND_HOST/health` before connecting the frontend.

A Railway URL printed as an example in old documentation is not proof that a deployment exists.

---

## Step 3: Verify or Deploy the Frontend on Vercel

1. If no Vercel project exists, use the **Deploy with Vercel** button in the README.
2. Set `REACT_APP_BACKEND_URL` to the verified Railway backend URL.
3. Confirm the production deployment completes successfully.
4. Under **Settings -> Domains**, verify or add `metaintel.com` and `www.metaintel.com`.
5. Test the website and complete payment flow before describing the service as live or accepting real payments.
