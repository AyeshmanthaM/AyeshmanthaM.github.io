#!/usr/bin/env pwsh
# Complete Setup Script for Notion to GitHub Public Folder System

param(
    [string]$GitHubToken = "",
    [switch]$TestOnly = $false
)

Write-Host "=== Portfolio Website - Notion to GitHub Setup ===" -ForegroundColor Green
Write-Host ""

# Function to test API endpoint
function Test-Endpoint {
    param([string]$Url, [string]$Name)
    try {
        $response = Invoke-RestMethod -Uri $Url -Method GET -ErrorAction Stop
        Write-Host "✅ $Name - Working" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ $Name - Failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Step 1: Test Worker Status
Write-Host "1. Testing Cloudflare Worker..." -ForegroundColor Yellow
$workerUrl = "https://notion-cors-proxy.maduranga-ayeshmantha.workers.dev"

if (Test-Endpoint "$workerUrl/api/health" "Health Check") {
    Write-Host "   Worker is deployed and responding" -ForegroundColor Cyan
} else {
    Write-Host "   ❌ Worker deployment issue" -ForegroundColor Red
    exit 1
}

# Step 2: Check Notion Integration
Write-Host "`n2. Testing Notion Integration..." -ForegroundColor Yellow
if (Test-Endpoint "$workerUrl/api/debug" "Notion Config") {
    $debug = Invoke-RestMethod -Uri "$workerUrl/api/debug" -Method GET
    Write-Host "   ✅ Notion Token: $($debug.hasToken)" -ForegroundColor Cyan
    Write-Host "   ✅ Database ID: $($debug.hasDatabase)" -ForegroundColor Cyan
    Write-Host "   📊 Database: $($debug.databaseId)" -ForegroundColor Cyan
} else {
    Write-Host "   ❌ Notion configuration issue" -ForegroundColor Red
    exit 1
}

# Step 3: Test Projects Endpoint
Write-Host "`n3. Testing Projects Data..." -ForegroundColor Yellow
if (Test-Endpoint "$workerUrl/api/projects" "Projects API") {
    $projects = Invoke-RestMethod -Uri "$workerUrl/api/projects" -Method GET
    Write-Host "   📁 Found $($projects.Count) projects" -ForegroundColor Cyan
    foreach ($project in $projects) {
        Write-Host "      - $($project.title) ($($project.category))" -ForegroundColor Gray
    }
} else {
    Write-Host "   ❌ Projects data issue" -ForegroundColor Red
    exit 1
}

# Step 4: Check GitHub Integration Status
Write-Host "`n4. Testing GitHub Integration..." -ForegroundColor Yellow
$status = Invoke-RestMethod -Uri "$workerUrl/api/data/status" -Method GET
Write-Host "   GitHub Integration: $($status.features.githubIntegration)" -ForegroundColor Cyan

if ($status.features.githubIntegration) {
    Write-Host "   ✅ GitHub token is configured" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  GitHub token not configured" -ForegroundColor Yellow
    Write-Host "   Run: wrangler secret put GITHUB_TOKEN" -ForegroundColor White -BackgroundColor DarkBlue
}

# Step 5: Set GitHub Token (if provided)
if ($GitHubToken -ne "") {
    Write-Host "`n5. Setting GitHub Token..." -ForegroundColor Yellow
    try {
        echo $GitHubToken | wrangler secret put GITHUB_TOKEN
        Write-Host "   ✅ GitHub token set successfully" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Failed to set GitHub token: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Step 6: Test Full Sync (if not test-only)
if (-not $TestOnly) {
    Write-Host "`n6. Testing Full Sync..." -ForegroundColor Yellow
    try {
        $syncResult = Invoke-RestMethod -Uri "$workerUrl/api/data/sync" -Method POST
        
        if ($syncResult.success) {
            Write-Host "   ✅ Sync completed successfully" -ForegroundColor Green
            Write-Host "   📊 Projects synced: $($syncResult.data.projectCount)" -ForegroundColor Cyan
            Write-Host "   🔗 GitHub updated: $($syncResult.data.githubUpdated)" -ForegroundColor Cyan
            Write-Host "   🕐 Sync time: $($syncResult.data.syncTimestamp)" -ForegroundColor Gray
            
            if ($syncResult.data.githubUpdated) {
                Write-Host "`n   📁 Files should be created in:" -ForegroundColor Yellow
                Write-Host "      - public/data/metadata.json" -ForegroundColor Gray
                foreach ($project in $syncResult.data.projects) {
                    Write-Host "      - public/data/projects/$($project.id).json" -ForegroundColor Gray
                }
            }
        } else {
            Write-Host "   ❌ Sync failed: $($syncResult.error)" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ❌ Sync error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== Setup Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Check your GitHub repo for files in public/data/" -ForegroundColor Cyan
Write-Host "2. Your frontend can now access:" -ForegroundColor Cyan
Write-Host "   - https://ayeshmantham.github.io/data/metadata.json" -ForegroundColor Gray
Write-Host "   - https://ayeshmantham.github.io/data/projects/[project-id].json" -ForegroundColor Gray
Write-Host "3. Configure your frontend to use these static files" -ForegroundColor Cyan
Write-Host ""
