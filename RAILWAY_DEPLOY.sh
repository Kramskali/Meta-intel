#!/bin/bash

# Device Intel - Railway Deployment Script
# This script prepares your project for Railway deployment

echo "🚀 Device Intel - Railway Deployment Preparation"
echo "=================================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: Git repository not initialized"
    echo "Run: git init && git add . && git commit -m 'Initial commit'"
    exit 1
fi

echo "✅ Step 1: Verifying project structure..."
if [ ! -f "backend/server.py" ] || [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Project structure is incomplete"
    exit 1
fi
echo "✅ Project structure verified"
echo ""

echo "✅ Step 2: Checking environment files..."
if [ ! -f "backend/.env.production" ]; then
    echo "⚠️  Warning: backend/.env.production not found"
else
    echo "✅ Backend production config exists"
fi

if [ ! -f "frontend/.env.production" ]; then
    echo "⚠️  Warning: frontend/.env.production not found"
else
    echo "✅ Frontend production config exists"
fi
echo ""

echo "✅ Step 3: Preparing for Railway deployment..."
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Go to https://railway.app"
echo "2. Click 'New Project'"
echo "3. Select 'Deploy from GitHub repo'"
echo "4. Authorize GitHub and select your device-intel repo"
echo "5. Railway will auto-detect Python and deploy"
echo ""
echo "6. Once deployed, go to 'Variables' and add:"
echo "   MONGO_URL=your_mongodb_connection_string"
echo "   DB_NAME=device_intel_prod"
echo "   CORS_ORIGINS=https://metaintel.com"
echo "   PAYPAL_CLIENT_ID=your_client_id"
echo "   PAYPAL_SECRET=your_secret"
echo "   PAYPAL_MODE=live"
echo ""
echo "7. Set Start Command:"
echo "   uvicorn server:app --host 0.0.0.0 --port \$PORT"
echo ""
echo "8. Railway will give you a URL like:"
echo "   https://device-intel-prod.railway.app"
echo ""
echo "9. Use that as your REACT_APP_BACKEND_URL in Vercel"
echo ""
echo "=================================================="
echo "🎉 Ready for Railway deployment!"
echo "=================================================="
