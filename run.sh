#!/bin/bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to display menu
show_menu() {
    clear
    echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║     Rust Web Server - Run Menu        ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}1)${NC} Run (normal)"
    echo -e "${GREEN}2)${NC} Run (release mode)"
    echo -e "${GREEN}3)${NC} Profile Memory (DHAT)"
    echo -e "${GREEN}4)${NC} Profile CPU (Flamegraph)"
    echo -e "${GREEN}5)${NC} Debug Build"
    echo -e "${GREEN}6)${NC} Build Frontend + Run"
    echo -e "${GREEN}7)${NC} Rebuild Frontend (clean) + Run"
    echo -e "${GREEN}8)${NC} Run Tests"
    echo -e "${GREEN}9)${NC} Clean Build"
    echo -e "${RED}0)${NC} Exit"
    echo ""
    echo -ne "${YELLOW}Choose option [0-9]: ${NC}"
}

# Function to build frontend
build_frontend() {
    local clean=$1
    echo -e "${BLUE}Building frontend...${NC}"
    cd src/frontend
    
    if [ "$clean" = true ]; then
        echo -e "${YELLOW}Cleaning node_modules...${NC}"
        rm -rf node_modules package-lock.json
    fi
    
    echo -e "${BLUE}Installing dependencies...${NC}"
    npm install
    
    echo -e "${BLUE}Building React app...${NC}"
    npm run build
    
    cd ../..
    echo -e "${GREEN}Frontend build complete!${NC}"
}

# Function to wait for keypress
wait_key() {
    echo ""
    echo -e "${YELLOW}Press any key to continue...${NC}"
    read -n 1 -s
}

# Main loop
while true; do
    show_menu
    read -r choice
    
    case $choice in
        1)
            echo -e "\n${BLUE}Starting server (debug mode)...${NC}"
            cargo run
            wait_key
            ;;
        2)
            echo -e "\n${BLUE}Starting server (release mode)...${NC}"
            cargo run --release
            wait_key
            ;;
        3)
            echo -e "\n${BLUE}Running memory profiler...${NC}"
            cargo run --release --features dhat-heap --example memory_profile
            if [ -f dhat-heap.json ]; then
                echo -e "${GREEN}Memory profile saved to dhat-heap.json${NC}"
                echo -e "View at: ${CYAN}https://nnethercote.github.io/dh_view/dh_view.html${NC}"
            fi
            wait_key
            ;;
        4)
            echo -e "\n${BLUE}Running CPU profiler...${NC}"
            if ! command -v flamegraph &> /dev/null; then
                echo -e "${YELLOW}Installing flamegraph...${NC}"
                cargo install flamegraph
            fi
            echo -e "${YELLOW}Server will start with profiling enabled.${NC}"
            echo -e "${YELLOW}Press Ctrl+C when done to generate flamegraph.svg${NC}"
            sleep 2
            cargo flamegraph --bin webserver
            if [ -f flamegraph.svg ]; then
                echo -e "${GREEN}Flamegraph saved to flamegraph.svg${NC}"
            fi
            wait_key
            ;;
        5)
            echo -e "\n${BLUE}Building in debug mode...${NC}"
            cargo build
            echo -e "${GREEN}Build complete!${NC}"
            echo -e "${BLUE}Starting debug server...${NC}"
            ./target/debug/webserver
            wait_key
            ;;
        6)
            build_frontend false
            echo -e "\n${BLUE}Starting server...${NC}"
            cargo run --release
            wait_key
            ;;
        7)
            build_frontend true
            echo -e "\n${BLUE}Starting server...${NC}"
            cargo run --release
            wait_key
            ;;
        8)
            echo -e "\n${BLUE}Running tests...${NC}"
            cargo test
            wait_key
            ;;
        9)
            echo -e "\n${BLUE}Cleaning build artifacts...${NC}"
            cargo clean
            echo -e "${GREEN}Clean complete!${NC}"
            wait_key
            ;;
        0)
            echo -e "\n${GREEN}Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "\n${RED}Invalid option!${NC}"
            wait_key
            ;;
    esac
done


