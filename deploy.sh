#!/bin/bash

# Deploy script for westminster-degree-calc
# This script builds the project and deploys it to GitHub Pages

set -e

echo "Building project..."
npm run export

echo "Deploying to GitHub Pages..."
cd out
git init
git add -A
git commit -m "Deploy to GitHub Pages - $(date '+%Y-%m-%d %H:%M:%S')"
git branch -M gh-pages
git remote add origin https://github.com/agcolom/westminster-degree-calc.git 2>/dev/null || true
git push -f origin gh-pages

echo "Cleaning up..."
cd ..
rm -rf out/.git

echo ""
echo "✅ Deployment complete!"
echo "Your site is live at: https://agcolom.github.io/westminster-degree-calc/"
