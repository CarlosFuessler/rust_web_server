#!/bin/bash

set -e

# flags
BUILD_FRONTEND=false
REBUILD_FRONTEND=false

# parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --build-frontend)
            BUILD_FRONTEND=true
            shift
            ;;
        --rebuild-frontend)
            REBUILD_FRONTEND=true
            BUILD_FRONTEND=true
            shift
            ;;
        *)
            echo -e "${RED}Unbekanntes Argument: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

echo -e "Starting build process..."

# setting flag
if [ "$BUILD_FRONTEND" = true ]; then
    echo -e "Building frontend..."
    cd src/frontend
    
    # rebuild-frontend
    if [ "$REBUILD_FRONTEND" = true ]; then
        echo -e "${YELLOW} Cleaning node_modules...${NC}"
        rm -rf node_modules package-lock.json
    fi
    
    echo -e "Installing dependencies..."
    npm instal
    
    echo -e "Building React app..."
    npm run build
    
    cd ../..
    echo -e "Frontend build complete!"
else
    echo -e "Skipping frontend build use (--build-frontend to rebuild)"
fi

# webserver
echo -e "Building webserver..."
echo -e "Press Ctrl+C to stop"
cargo build
./target/release/webserver


