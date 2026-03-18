# Device Intel - Deployment Guide

## Production Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend)

#### Frontend on Vercel
1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/device-intel.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repo
   - Framework: Create React App
   - Root Directory: `frontend`
   - Build Command: `yarn build`
   - Output Directory: `build`
   - Environment Variables:
     ```
     REACT_APP_BACKEND_URL=https://your-backend.railway.app
     ```

#### Backend on Railway
1. **Connect Railway**
   - Go to [railway.app](https://railway.app)
   - Create new project from GitHub
   - Select your repo
   - Root Directory: `backend`

2. **Environment Variables**
   ```
   MONGO_URL=your_mongodb_atlas_url
   DB_NAME=device_intel_prod
   CORS_ORIGINS=https://your-app.vercel.app
   STRIPE_API_KEY=sk_live_...
   PAYPAL_CLIENT_ID=your_live_client_id
   PAYPAL_SECRET=your_live_secret
   PAYPAL_MODE=live
   ```

3. **Start Command**
   ```
   uvicorn server:app --host 0.0.0.0 --port $PORT
   ```

### Option 2: AWS (Full Stack)

#### Frontend on S3 + CloudFront
```bash
# Build
cd frontend && yarn build

# Deploy to S3
aws s3 sync build/ s3://device-intel-frontend --delete

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

#### Backend on EC2/ECS
```dockerfile
# Dockerfile for backend
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Option 3: DigitalOcean App Platform

1. **Create app.yaml**
```yaml
name: device-intel
services:
  - name: backend
    github:
      repo: yourusername/device-intel
      branch: main
      deploy_on_push: true
    source_dir: /backend
    envs:
      - key: MONGO_URL
        value: ${db.DATABASE_URL}
      - key: STRIPE_API_KEY
        scope: RUN_TIME
        type: SECRET
    http_port: 8001
    
  - name: frontend
    github:
      repo: yourusername/device-intel
      branch: main
    source_dir: /frontend
    build_command: yarn build
    run_command: serve -s build -p 3000
    envs:
      - key: REACT_APP_BACKEND_URL
        value: ${backend.PUBLIC_URL}
    http_port: 3000

databases:
  - name: db
    engine: MONGODB
    version: "5"
```

## MongoDB Atlas Setup

1. **Create Cluster**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create free M0 cluster
   - Choose region close to your backend

2. **Network Access**
   - Add IP: `0.0.0.0/0` (allow from anywhere)
   - Or add your backend IP

3. **Database User**
   - Create user with read/write permissions
   - Save credentials

4. **Connection String**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/device_intel?retryWrites=true&w=majority
   ```

## Environment Variables Checklist

### Backend (.env)
- [ ] `MONGO_URL` - MongoDB connection string
- [ ] `DB_NAME` - Database name
- [ ] `CORS_ORIGINS` - Frontend URL
- [ ] `STRIPE_API_KEY` - Stripe secret key (sk_live_...)
- [ ] `PAYPAL_CLIENT_ID` - PayPal client ID
- [ ] `PAYPAL_SECRET` - PayPal secret
- [ ] `PAYPAL_MODE` - 'live' for production

### Frontend (.env)
- [ ] `REACT_APP_BACKEND_URL` - Backend API URL

## SSL/HTTPS

### Let's Encrypt (Free)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d deviceintel.com -d www.deviceintel.com
```

### Cloudflare (Recommended)
1. Add domain to Cloudflare
2. Enable SSL/TLS (Full mode)
3. Enable HTTP/2 and HTTP/3
4. Set up caching rules

## Performance Optimization

### Frontend
```bash
# Build with optimizations
REACT_APP_BACKEND_URL=https://api.deviceintel.com yarn build

# Analyze bundle
yarn add -D webpack-bundle-analyzer
yarn build --stats
```

### Backend
```python
# Add caching
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from redis import asyncio as aioredis

@app.on_event("startup")
async def startup():
    redis = aioredis.from_url("redis://localhost")
    FastAPICache.init(RedisBackend(redis), prefix="device-intel")
```

## Monitoring

### Sentry (Error Tracking)
```bash
# Frontend
yarn add @sentry/react

# Backend
pip install sentry-sdk[fastapi]
```

### Google Analytics
```html
<!-- In frontend/public/index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

## Backup Strategy

### MongoDB Automated Backups
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
mongodump --uri="$MONGO_URL" --out="/backups/device-intel-$DATE"
aws s3 cp /backups/device-intel-$DATE s3://backups/device-intel-$DATE --recursive
```

## Scaling

### Horizontal Scaling
- Use load balancer (AWS ALB, DigitalOcean LB)
- Run multiple backend instances
- Use Redis for session storage

### Database Scaling
- Enable MongoDB Atlas auto-scaling
- Add read replicas
- Implement caching (Redis/Memcached)

## Cost Estimates

### Starter (100 users)
- Vercel: Free
- Railway: $5/mo
- MongoDB Atlas: Free (M0)
- **Total: $5/mo**

### Growth (1,000 users)
- Vercel: $20/mo
- Railway: $20/mo
- MongoDB Atlas: $25/mo (M10)
- **Total: $65/mo**

### Scale (10,000 users)
- AWS/DigitalOcean: $200/mo
- MongoDB Atlas: $100/mo (M30)
- CDN: $50/mo
- **Total: $350/mo**

## Security Checklist

- [ ] HTTPS enabled everywhere
- [ ] Environment variables secured
- [ ] API rate limiting enabled
- [ ] CORS properly configured
- [ ] MongoDB authentication enabled
- [ ] Stripe webhook signature verification
- [ ] PayPal webhook validation
- [ ] Regular security updates
- [ ] Password hashing (if auth added)
- [ ] Input validation on all endpoints

## Support

For deployment help: deploy@deviceintel.com
