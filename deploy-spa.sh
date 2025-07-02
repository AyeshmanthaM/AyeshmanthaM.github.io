#!/bin/bash

# Deploy script for GitHub Pages SPA routing
echo "Building the application..."
npm run build

echo "Deployment build completed!"
echo "The following files are important for SPA routing:"
echo "- dist/404.html (GitHub Pages SPA redirect)"
echo "- dist/.nojekyll (prevents Jekyll processing)"
echo "- dist/index.html (contains redirect script)"

echo ""
echo "Your site should now work with direct URL access on GitHub Pages!"
echo "Make sure to:"
echo "1. Commit and push the changes to your repository"
echo "2. Ensure GitHub Pages is configured to serve from the main branch"
echo "3. Test the sub-routes after deployment"

echo ""
echo "Test URLs that should work after deployment:"
echo "- https://www.ayeshmantha.net/"
echo "- https://www.ayeshmantha.net/projects"
echo "- https://www.ayeshmantha.net/about"
echo "- https://www.ayeshmantha.net/skills"
echo "- https://www.ayeshmantha.net/contact"
