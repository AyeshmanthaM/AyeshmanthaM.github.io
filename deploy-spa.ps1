# Deploy script for GitHub Pages SPA routing
Write-Host "Building the application..." -ForegroundColor Green
npm run build

Write-Host "Deployment build completed!" -ForegroundColor Green
Write-Host "The following files are important for SPA routing:" -ForegroundColor Yellow
Write-Host "- dist/404.html (GitHub Pages SPA redirect)"
Write-Host "- dist/.nojekyll (prevents Jekyll processing)" 
Write-Host "- dist/index.html (contains redirect script)"

Write-Host ""
Write-Host "Your site should now work with direct URL access on GitHub Pages!" -ForegroundColor Green
Write-Host "Make sure to:" -ForegroundColor Yellow
Write-Host "1. Commit and push the changes to your repository"
Write-Host "2. Ensure GitHub Pages is configured to serve from the main branch"
Write-Host "3. Test the sub-routes after deployment"

Write-Host ""
Write-Host "Test URLs that should work after deployment:" -ForegroundColor Cyan
Write-Host "- https://www.ayeshmantha.net/"
Write-Host "- https://www.ayeshmantha.net/projects"
Write-Host "- https://www.ayeshmantha.net/about"
Write-Host "- https://www.ayeshmantha.net/skills"
Write-Host "- https://www.ayeshmantha.net/contact"
