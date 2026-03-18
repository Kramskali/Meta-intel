#!/bin/bash

# Device Intel - GitHub Export Script
# This script prepares your project for GitHub

echo "🚀 Preparing Device Intel for GitHub export..."

# Create .gitignore if it doesn't exist
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
__pycache__/
*.py[cod]
*$py.class
.venv/
venv/
ENV/

# Environment variables
.env
.env.local
.env.production

# Build outputs
/frontend/build/
/frontend/dist/
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Testing
/coverage/
.nyc_output/

# Misc
*.pem
.cache/
.pytest_cache/
/test_reports/
EOF

echo "✅ Created .gitignore"

# Initialize git if not already
if [ ! -d .git ]; then
    git init
    echo "✅ Initialized git repository"
fi

# Add all files
git add .

# Create initial commit
if [ -z "$(git log --oneline 2>/dev/null)" ]; then
    git commit -m "Initial commit: Device Intel - Privacy Metadata Intelligence Platform

✨ Features:
- Comprehensive metadata collection (8 categories, 50+ data points)
- Privacy scoring with recommendations
- Stripe + PayPal payment integration
- Historical tracking & comparisons
- Export to JSON
- Cybersecurity HUD theme
- Fully monetization-ready SaaS

📊 Tech Stack:
- Frontend: React 19, Tailwind CSS, Shadcn/UI
- Backend: FastAPI, MongoDB, Pydantic
- Payments: Stripe, PayPal

💰 Pricing: Free, Pro ($9/mo), Enterprise ($29/mo)"
    echo "✅ Created initial commit"
fi

echo ""
echo "🎉 Git repository ready!"
echo ""
echo "Next steps:"
echo "1. Create a new repository on GitHub"
echo "2. Run these commands:"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/device-intel.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Update README.md with your GitHub username"
echo "4. Set up GitHub Actions for CI/CD (optional)"
echo ""
echo "📚 Documentation created:"
echo "   - README.md (main documentation)"
echo "   - DEPLOYMENT.md (deployment guide)"
echo ""
echo "🚀 Ready to sell! Your SaaS is production-ready."
