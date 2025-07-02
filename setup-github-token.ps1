#!/usr/bin/env pwsh
# GitHub Token Setup Script for Portfolio Website

Write-Host "=== GitHub Token Setup ===" -ForegroundColor Green
Write-Host ""
Write-Host "1. Go to: https://github.com/settings/tokens" -ForegroundColor Yellow
Write-Host "2. Click 'Generate new token' -> 'Generate new token (classic)'" -ForegroundColor Yellow
Write-Host "3. Name: 'Portfolio Website'" -ForegroundColor Yellow
Write-Host "4. Select permissions:" -ForegroundColor Yellow
Write-Host "   - ✅ repo (Full control of private repositories)" -ForegroundColor Cyan
Write-Host "   - ✅ public_repo (Access public repositories)" -ForegroundColor Cyan
Write-Host "5. Click 'Generate token'" -ForegroundColor Yellow
Write-Host "6. Copy the token and run:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   wrangler secret put GITHUB_TOKEN" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host ""
Write-Host "Then test with:" -ForegroundColor Yellow
Write-Host "   Invoke-RestMethod -Uri 'https://notion-cors-proxy.maduranga-ayeshmantha.workers.dev/api/data/sync' -Method POST" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host ""
