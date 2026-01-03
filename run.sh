#!/bin/bash
# KPDL - Run Development Servers

set -e

echo "🚀 Starting KPDL Development Environment..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if ports are available
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${RED}❌ Port $1 is already in use${NC}"
        return 1
    fi
    return 0
}

# Backend
echo -e "${YELLOW}📦 Starting Backend (FastAPI)...${NC}"
if check_port 8000; then
    cd backend
    pip install -q -r requirements.txt 2>/dev/null || true
    echo -e "${GREEN}✅ Backend ready at http://localhost:8000${NC}"
    echo -e "${GREEN}📚 API Docs at http://localhost:8000/docs${NC}"
    python app.py &
    BACKEND_PID=$!
    cd ..
else
    exit 1
fi

sleep 2

# Frontend
echo -e "${YELLOW}🎨 Starting Frontend (React)...${NC}"
if check_port 3000; then
    cd frontend
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "Installing npm dependencies..."
        npm install -q
    fi
    
    echo -e "${GREEN}✅ Frontend ready at http://localhost:3000${NC}"
    npm start &
    FRONTEND_PID=$!
    cd ..
else
    kill $BACKEND_PID
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 KPDL is running!${NC}"
echo ""
echo "📍 Open your browser:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop..."
echo ""

# Cleanup on exit
trap "echo ''; echo 'Shutting down...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Done!';" EXIT

# Wait for both processes
wait
