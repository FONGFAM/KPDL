#!/bin/bash
# Quick Docker build script

echo "Building frontend locally..."
cd frontend
npm run build
cd ..

echo "Starting Docker..."
docker-compose up --build
