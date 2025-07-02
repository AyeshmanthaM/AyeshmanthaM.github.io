#!/bin/bash

# Enhanced Data Synchronization System - Deployment Script
# This script helps set up the new GitHub data branch integration

echo "🚀 Enhanced Data Synchronization System - Setup"
echo "================================================"

# Check if we're in the right directory
if [ ! -f "worker.js" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project root directory confirmed"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Error: Wrangler CLI not found. Please install it first:"
    echo "   npm install -g wrangler"
    exit 1
fi

echo "✅ Wrangler CLI found"

# Login check
echo "🔑 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "⚠️  Please login to Cloudflare first:"
    echo "   wrangler login"
    exit 1
fi

echo "✅ Cloudflare authentication confirmed"

# Environment variables setup
echo ""
echo "🔧 Environment Variables Setup"
echo "==============================="
echo ""
echo "The following secrets need to be configured:"
echo ""
echo "Required:"
echo "- NOTION_TOKEN: Your Notion integration token"
echo "- NOTION_DATABASE_ID: Your Notion database ID"
echo ""
echo "Optional (but recommended):"
echo "- GITHUB_TOKEN: GitHub Personal Access Token for data branch"
echo "- ADMIN_TOKEN: Admin authentication token"
echo "- SENDGRID_API_KEY: For email functionality"
echo ""

read -p "Do you want to set up these secrets now? (y/n): " setup_secrets

if [ "$setup_secrets" = "y" ] || [ "$setup_secrets" = "Y" ]; then
    echo ""
    echo "📝 Setting up secrets..."
    
    echo "Enter your Notion token:"
    wrangler secret put NOTION_TOKEN
    
    echo "Enter your Notion database ID:"
    wrangler secret put NOTION_DATABASE_ID
    
    read -p "Do you have a GitHub token for data branch integration? (y/n): " has_github
    if [ "$has_github" = "y" ] || [ "$has_github" = "Y" ]; then
        echo "Enter your GitHub token:"
        wrangler secret put GITHUB_TOKEN
    fi
    
    read -p "Set up admin token? (y/n): " setup_admin
    if [ "$setup_admin" = "y" ] || [ "$setup_admin" = "Y" ]; then
        echo "Enter your admin token:"
        wrangler secret put ADMIN_TOKEN
    fi
    
    read -p "Set up SendGrid API key? (y/n): " setup_sendgrid
    if [ "$setup_sendgrid" = "y" ] || [ "$setup_sendgrid" = "Y" ]; then
        echo "Enter your SendGrid API key:"
        wrangler secret put SENDGRID_API_KEY
    fi
fi

# KV Namespace setup
echo ""
echo "💾 KV Storage Setup"
echo "==================="
read -p "Do you want to set up KV storage for backups? (y/n): " setup_kv

if [ "$setup_kv" = "y" ] || [ "$setup_kv" = "Y" ]; then
    echo "Creating KV namespaces..."
    
    echo "Creating production namespace..."
    PROD_NS=$(wrangler kv:namespace create BACKUP_KV --json | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    
    echo "Creating preview namespace..."
    PREVIEW_NS=$(wrangler kv:namespace create BACKUP_KV --preview --json | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    
    if [ ! -z "$PROD_NS" ] && [ ! -z "$PREVIEW_NS" ]; then
        echo ""
        echo "✅ KV namespaces created successfully!"
        echo ""
        echo "Add the following to your wrangler.toml:"
        echo ""
        echo "[[kv_namespaces]]"
        echo "binding = \"BACKUP_KV\""
        echo "id = \"$PROD_NS\""
        echo "preview_id = \"$PREVIEW_NS\""
        echo ""
    fi
fi

# Deployment
echo ""
echo "🚀 Deployment"
echo "============="
read -p "Deploy the worker now? (y/n): " deploy_now

if [ "$deploy_now" = "y" ] || [ "$deploy_now" = "Y" ]; then
    echo "Deploying worker..."
    wrangler deploy
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 Deployment successful!"
        echo ""
        echo "Your enhanced data synchronization system is now live!"
        echo ""
        echo "New endpoints available:"
        echo "- /api/data/sync - Enhanced data synchronization"
        echo "- /api/data/backup - Comprehensive backup"
        echo "- /api/data/status - System status"
        echo "- /api/data/migrate - Image migration"
        echo ""
        echo "📋 Next steps:"
        echo "1. Test endpoints using the test-data-sync.html file"
        echo "2. Set up GitHub data branch (already created)"
        echo "3. Configure automated sync triggers"
        echo "4. Review Doc/DATA_SYNC_SETUP.md for detailed instructions"
    else
        echo "❌ Deployment failed. Please check the errors above."
    fi
fi

echo ""
echo "📚 Documentation"
echo "================"
echo "For detailed setup instructions, see:"
echo "- Doc/DATA_SYNC_SETUP.md"
echo "- test-data-sync.html (testing interface)"
echo ""
echo "✨ Setup complete!"
