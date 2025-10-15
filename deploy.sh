#!/bin/bash
set -e

echo "🚀 Starting Railway deployment..."

# Install dependencies including dev dependencies for build
echo "📦 Installing dependencies..."
npm ci --include=dev

# Build the TypeScript project
echo "🔨 Building TypeScript project..."
npm run build

# Remove dev dependencies to reduce image size
echo "🧹 Cleaning up dev dependencies..."
npm prune --omit=dev

echo "✅ Build completed successfully!"
echo "🎯 Starting server..."

# Start the server
npm start
