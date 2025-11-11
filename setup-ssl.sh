#!/bin/bash

# SSL Setup Script for palata.lt
# Run this script after DNS has fully propagated (wait 5-10 minutes)

echo "Setting up SSL certificate for palata.lt..."

# Create well-known directory
sudo mkdir -p /var/www/palata.lt/.well-known/acme-challenge
sudo chown -R www-data:www-data /var/www/palata.lt/.well-known

# Try to get SSL certificate
sudo certbot --nginx -d palata.lt -d www.palata.lt --non-interactive --agree-tos --email admin@palata.lt --redirect

if [ $? -eq 0 ]; then
    echo "✓ SSL certificate installed successfully!"
    echo "✓ Your site is now available at https://palata.lt"
    
    # Set up auto-renewal
    sudo systemctl enable certbot.timer
    sudo systemctl start certbot.timer
    
    echo "✓ Auto-renewal configured"
else
    echo "✗ SSL setup failed. This might be because:"
    echo "  1. DNS hasn't fully propagated yet (wait 5-10 minutes)"
    echo "  2. Port 80 is not accessible from the internet"
    echo "  3. Firewall is blocking HTTP traffic"
    echo ""
    echo "Try running this script again in a few minutes."
fi
