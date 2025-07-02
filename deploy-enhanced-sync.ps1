# Enhanced Data Synchronization System - Deployment Script (PowerShell)
# This script helps set up the new GitHub data branch integration

Write-Host "🚀 Enhanced Data Synchronization System - Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "worker.js")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Project root directory confirmed" -ForegroundColor Green

# Check if wrangler is installed
try {
    $null = Get-Command wrangler -ErrorAction Stop
    Write-Host "✅ Wrangler CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Wrangler CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g wrangler" -ForegroundColor Yellow
    exit 1
}

# Login check
Write-Host "🔑 Checking Cloudflare authentication..." -ForegroundColor Blue
try {
    $whoami = wrangler whoami 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Not authenticated"
    }
    Write-Host "✅ Cloudflare authentication confirmed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Please login to Cloudflare first:" -ForegroundColor Yellow
    Write-Host "   wrangler login" -ForegroundColor Yellow
    exit 1
}

# Environment variables setup
Write-Host ""
Write-Host "🔧 Environment Variables Setup" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""
Write-Host "The following secrets need to be configured:"
Write-Host ""
Write-Host "Required:" -ForegroundColor Yellow
Write-Host "- NOTION_TOKEN: Your Notion integration token"
Write-Host "- NOTION_DATABASE_ID: Your Notion database ID"
Write-Host ""
Write-Host "Optional (but recommended):" -ForegroundColor Yellow
Write-Host "- GITHUB_TOKEN: GitHub Personal Access Token for data branch"
Write-Host "- ADMIN_TOKEN: Admin authentication token"
Write-Host "- SENDGRID_API_KEY: For email functionality"
Write-Host ""

$setupSecrets = Read-Host "Do you want to set up these secrets now? (y/n)"

if ($setupSecrets -eq "y" -or $setupSecrets -eq "Y") {
    Write-Host ""
    Write-Host "📝 Setting up secrets..." -ForegroundColor Blue
    
    Write-Host "Setting up Notion token..."
    wrangler secret put NOTION_TOKEN
    
    Write-Host "Setting up Notion database ID..."
    wrangler secret put NOTION_DATABASE_ID
    
    $hasGithub = Read-Host "Do you have a GitHub token for data branch integration? (y/n)"
    if ($hasGithub -eq "y" -or $hasGithub -eq "Y") {
        Write-Host "Setting up GitHub token..."
        wrangler secret put GITHUB_TOKEN
    }
    
    $setupAdmin = Read-Host "Set up admin token? (y/n)"
    if ($setupAdmin -eq "y" -or $setupAdmin -eq "Y") {
        Write-Host "Setting up admin token..."
        wrangler secret put ADMIN_TOKEN
    }
    
    $setupSendgrid = Read-Host "Set up SendGrid API key? (y/n)"
    if ($setupSendgrid -eq "y" -or $setupSendgrid -eq "Y") {
        Write-Host "Setting up SendGrid API key..."
        wrangler secret put SENDGRID_API_KEY
    }
}

# KV Namespace setup
Write-Host ""
Write-Host "💾 KV Storage Setup" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
$setupKv = Read-Host "Do you want to set up KV storage for backups? (y/n)"

if ($setupKv -eq "y" -or $setupKv -eq "Y") {
    Write-Host "Creating KV namespaces..." -ForegroundColor Blue
    
    Write-Host "Creating production namespace..."
    $prodResult = wrangler kv:namespace create BACKUP_KV --json | ConvertFrom-Json
    $prodNs = $prodResult.id
    
    Write-Host "Creating preview namespace..."
    $previewResult = wrangler kv:namespace create BACKUP_KV --preview --json | ConvertFrom-Json
    $previewNs = $previewResult.id
    
    if ($prodNs -and $previewNs) {
        Write-Host ""
        Write-Host "✅ KV namespaces created successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Add the following to your wrangler.toml:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "[[kv_namespaces]]"
        Write-Host "binding = `"BACKUP_KV`""
        Write-Host "id = `"$prodNs`""
        Write-Host "preview_id = `"$previewNs`""
        Write-Host ""
    }
}

# Deployment
Write-Host ""
Write-Host "🚀 Deployment" -ForegroundColor Cyan
Write-Host "=============" -ForegroundColor Cyan
$deployNow = Read-Host "Deploy the worker now? (y/n)"

if ($deployNow -eq "y" -or $deployNow -eq "Y") {
    Write-Host "Deploying worker..." -ForegroundColor Blue
    wrangler deploy
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "🎉 Deployment successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Your enhanced data synchronization system is now live!" -ForegroundColor Green
        Write-Host ""
        Write-Host "New endpoints available:" -ForegroundColor Yellow
        Write-Host "- /api/data/sync - Enhanced data synchronization"
        Write-Host "- /api/data/backup - Comprehensive backup"
        Write-Host "- /api/data/status - System status"
        Write-Host "- /api/data/migrate - Image migration"
        Write-Host ""
        Write-Host "📋 Next steps:" -ForegroundColor Yellow
        Write-Host "1. Test endpoints using the test-data-sync.html file"
        Write-Host "2. Set up GitHub data branch (already created)"
        Write-Host "3. Configure automated sync triggers"
        Write-Host "4. Review Doc/DATA_SYNC_SETUP.md for detailed instructions"
    } else {
        Write-Host "❌ Deployment failed. Please check the errors above." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📚 Documentation" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan
Write-Host "For detailed setup instructions, see:"
Write-Host "- Doc/DATA_SYNC_SETUP.md"
Write-Host "- test-data-sync.html (testing interface)"
Write-Host ""
Write-Host "✨ Setup complete!" -ForegroundColor Green
