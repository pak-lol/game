#!/bin/bash

echo "🚀 Deploying to GitHub..."

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✓ Build successful"

# Add and commit dist folder
echo "📤 Committing changes..."
git add dist/
git add package.json README.md

# Get commit message or use default
if [ -z "$1" ]; then
    COMMIT_MSG="Update game build"
else
    COMMIT_MSG="$1"
fi

git commit -m "$COMMIT_MSG"

if [ $? -eq 0 ]; then
    echo "✓ Changes committed"
    
    # Push to GitHub
    echo "🌐 Pushing to GitHub..."
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo "✓ Deployment successful!"
        echo "🎮 Game will be live at Cloudflare Pages shortly"
        echo "📦 GitHub: https://github.com/pak-lol/game"
    else
        echo "❌ Push failed!"
        exit 1
    fi
else
    echo "ℹ️  No changes to commit"
fi
