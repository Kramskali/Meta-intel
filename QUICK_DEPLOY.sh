#!/bin/bash

# Device Intel - Quick Deployment Script
# This script prepares your project for deployment to Railway

set -e

echo "🚀 Device Intel - Quick Deployment Setup"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "COMMERCIALIZATION.md" ]; then
    echo "❌ Error: Please run this script from the Device Intel root directory"
    exit 1
fi

echo "✅ Step 1: Verifying project structure..."
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: backend/ and frontend/ directories not found"
    exit 1
fi
echo "✅ Project structure verified"
echo ""

echo "✅ Step 2: Checking dependencies..."
if ! command -v git &> /dev/null; then
    echo "⚠️  Warning: git not found. You'll need to push manually."
else
    echo "✅ git is installed"
fi

if ! command -v node &> /dev/null; then
    echo "⚠️  Warning: Node.js not found. Frontend build may fail."
else
    echo "✅ Node.js is installed ($(node --version))"
fi

if ! command -v python3 &> /dev/null; then
    echo "⚠️  Warning: Python3 not found. Backend may not work."
else
    echo "✅ Python3 is installed ($(python3 --version))"
fi
echo ""

echo "✅ Step 3: Creating production environment files..."
if [ ! -f "backend/.env.production.example" ]; then
    echo "⚠️  .env.production.example not found in backend/"
else
    echo "✅ Backend .env template exists"
fi

if [ ! -f "frontend/.env.production.example" ]; then
    echo "⚠️  .env.production.example not found in frontend/"
else
    echo "✅ Frontend .env template exists"
fi
echo ""

echo "✅ Step 4: Preparing Git repository..."
if [ -d ".git" ]; then
    echo "✅ Git repository already initialized"
    echo ""
    echo "📋 Current git status:"
    git status --short
else
    echo "⚠️  Git repository not initialized"
    echo "Run: git init && git add . && git commit -m 'Initial commit'"
fi
echo ""

echo "=========================================="
echo "🎉 Deployment Preparation Complete!"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. CREATE PRODUCTION ACCOUNTS:"
echo "   - MongoDB Atlas: https://mongodb.com/cloud/atlas"
echo "   - Stripe: https://stripe.com"
echo "   - PayPal: https://developer.paypal.com"
echo ""
echo "2. CONFIGURE ENVIRONMENT VARIABLES:"
echo "   - Copy backend/.env.production.example to backend/.env"
echo "   - Copy frontend/.env.production.example to frontend/.env.production"
echo "   - Fill in your production credentials"
echo ""
echo "3. PUSH TO GITHUB:"
echo "   git add ."
echo "   git commit -m 'Production deployment'"
echo "   git push -u origin main"
echo ""
echo "4. DEPLOY TO RAILWAY:"
echo "   - Go to https://railway.app"
echo "   - Create new project from GitHub"
echo "   - Select this repository"
echo "   - Railway will auto-detect and deploy"
echo ""
echo "5. DEPLOY FRONTEND TO VERCEL:"
echo "   - Go to https://vercel.com"
echo "   - Import project from GitHub"
echo "   - Set REACT_APP_BACKEND_URL environment variable"
echo ""
echo "6. READ THE FULL GUIDE:"
echo "   cat PRODUCTION_LAUNCH.md"
echo ""
echo "💰 You're ready to start generating revenue!"
echo ""
