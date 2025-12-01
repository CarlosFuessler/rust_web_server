#!/bin/bash
echo "Starting build process..."

# Frontend bauen
echo "Building frontend..."
cd src/frontend
npm install
npm run build
cd ../..

echo "Building webserver..."
cargo run
