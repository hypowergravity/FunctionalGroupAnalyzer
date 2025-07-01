#!/bin/bash

echo "🚀 Deploying Functional Group Analyzer to Render.com"
echo "📋 Steps:"
echo "1. Push code to GitHub"
echo "2. Connect GitHub repo to Render.com"
echo "3. Deploy both frontend and backend"
echo ""

echo "🔧 Pre-deployment checks:"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: Functional Group Analyzer"
else
    echo "✅ Git repository exists"
fi

# Check for package.json
if [ -f "package.json" ]; then
    echo "✅ Frontend package.json found"
else
    echo "❌ Frontend package.json missing"
fi

# Check for backend requirements.txt
if [ -f "backend/requirements.txt" ]; then
    echo "✅ Backend requirements.txt found"
else
    echo "❌ Backend requirements.txt missing"
fi

echo ""
echo "📥 Next steps:"
echo "1. Create GitHub repository: https://github.com/new"
echo "2. Push this code:"
echo "   git remote add origin https://github.com/yourusername/functional-group-analyzer.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Deploy on Render:"
echo "   - Go to https://render.com"
echo "   - Connect your GitHub repo"
echo "   - Deploy using render.yaml (auto-detected)"
echo ""
echo "🎉 Your app will be live on Render.com!"