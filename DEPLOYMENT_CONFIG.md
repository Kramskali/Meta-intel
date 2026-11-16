# Device Intel - Deployment Configuration

## Security Notice

Credential values were removed from this public document on 2026-11-16. Rotate the previously exposed PayPal secret before deploying. Store replacement credentials only in the hosting provider's protected environment settings. Never commit them to GitHub.

## Configuration Status

### Documented
- **Domain**: metaintel.com
- **Payment Provider**: PayPal (Live mode intended)
- **PayPal Client ID**: Set directly in Railway; not stored here
- **PayPal Secret**: Rotate and set directly in Railway; not stored here

### Pending Verification
- **MongoDB Atlas**: Cluster and X.509 certificate setup require verification
- **Deployment Platform**: Railway and Vercel configuration exists; live deployment status requires verification

---

## Next Steps

1. **Verify MongoDB Atlas**
   - Confirm the cluster exists.
   - Install the X.509 certificate through Railway's protected file or secret mechanism.
   - Set the connection string in Railway.

2. **Verify or Deploy the Backend**
   - Connect the GitHub repository to Railway if no service exists.
   - Add environment variables through Railway's protected settings.
   - Verify the `/health` endpoint.

3. **Verify or Deploy the Frontend**
   - Connect the `frontend` directory to Vercel if no project exists.
   - Set `REACT_APP_BACKEND_URL` to the verified Railway backend URL.
   - Verify the Vercel deployment and domain configuration.

4. **Test Payments**
   - Confirm server-side order creation and capture verification.
   - Test the complete payment flow before claiming payments are operational.

---

## Environment Variable Names

Fill in the values only in Railway's protected environment settings. Do not commit the values.

```
PAYPAL_CLIENT_ID=YOUR_PAYPAL_CLIENT_ID
PAYPAL_SECRET=YOUR_ROTATED_PAYPAL_SECRET
PAYPAL_MODE=live
DOMAIN=metaintel.com
```
