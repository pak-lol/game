#!/bin/bash

echo "🚀 Deploying to palata.lt..."

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✓ Build successful"

# Deploy to nginx
echo "🌐 Deploying to web server..."
sudo rm -rf /var/www/palata.lt/*
sudo cp -r dist/* /var/www/palata.lt/
sudo chown -R www-data:www-data /var/www/palata.lt

if [ $? -eq 0 ]; then
    echo "✓ Deployment successful!"
    echo "🎮 Game is live at http://palata.lt"
else
    echo "❌ Deployment failed!"
    exit 1
fi
