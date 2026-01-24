#!/bin/bash

# System Check Script for Population Maps Application
# Run this to verify everything is working correctly

echo "=========================================="
echo "Population Maps - System Check"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# 1. Check Node.js version
echo "1. Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$MAJOR_VERSION" -ge 18 ]; then
        check_pass "Node.js $NODE_VERSION (requirement: v18+)"
    else
        check_fail "Node.js $NODE_VERSION is too old (need v18+)"
    fi
else
    check_fail "Node.js not found"
fi
echo ""

# 2. Check npm version
echo "2. Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    check_pass "npm v$NPM_VERSION"
else
    check_fail "npm not found"
fi
echo ""

# 3. Check if node_modules exists
echo "3. Checking dependencies..."
if [ -d "node_modules" ]; then
    check_pass "Dependencies installed"
else
    check_fail "Dependencies not installed (run: npm install)"
fi
echo ""

# 4. Check project structure
echo "4. Checking project structure..."
REQUIRED_DIRS=("backend" "frontend" "data")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        check_pass "$dir/ directory exists"
    else
        check_fail "$dir/ directory missing"
    fi
done
echo ""

# 5. Check data file
echo "5. Checking data files..."
if [ -f "data/API_SP.POP.TOTL_DS2_en_csv_v2_174326.csv" ]; then
    SIZE=$(du -h "data/API_SP.POP.TOTL_DS2_en_csv_v2_174326.csv" | cut -f1)
    check_pass "Population data file exists ($SIZE)"
else
    check_fail "Population data file missing"
fi
echo ""

# 6. Check backend files
echo "6. Checking backend files..."
BACKEND_FILES=("backend/src/server.js" "backend/src/services/populationService.js")
for file in "${BACKEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        check_pass "$file"
    else
        check_fail "$file missing"
    fi
done
echo ""

# 7. Check frontend files
echo "7. Checking frontend files..."
FRONTEND_FILES=("frontend/src/App.jsx" "frontend/src/main.jsx" "frontend/index.html")
for file in "${FRONTEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        check_pass "$file"
    else
        check_fail "$file missing"
    fi
done
echo ""

# 8. Check documentation
echo "8. Checking documentation..."
DOC_FILES=("README.md" "QUICKSTART.md" "DEVELOPMENT.md" "DEPLOYMENT.md" "PROJECT_SUMMARY.md")
for file in "${DOC_FILES[@]}"; do
    if [ -f "$file" ]; then
        check_pass "$file"
    else
        check_warn "$file missing"
    fi
done
echo ""

# 9. Check if servers are running
echo "9. Checking servers..."

# Check backend
if curl -s http://localhost:3001/api/health &> /dev/null; then
    check_pass "Backend server running (http://localhost:3001)"
else
    check_warn "Backend server not running (run: npm run dev)"
fi

# Check frontend
if curl -s http://localhost:3000 &> /dev/null; then
    check_pass "Frontend server running (http://localhost:3000)"
else
    check_warn "Frontend server not running (run: npm run dev)"
fi
echo ""

# 10. Test API if backend is running
echo "10. Testing API..."
if curl -s http://localhost:3001/api/health &> /dev/null; then
    RESPONSE=$(curl -s http://localhost:3001/api/health)
    if [[ $RESPONSE == *"ok"* ]]; then
        check_pass "Health endpoint responding"
    else
        check_fail "Health endpoint not responding correctly"
    fi
    
    # Test population endpoint
    POP_DATA=$(curl -s http://localhost:3001/api/population)
    if [[ $POP_DATA == *"USA"* ]]; then
        US_POP=$(echo $POP_DATA | grep -o '"population":[0-9]*' | head -1 | grep -o '[0-9]*')
        check_pass "Population API responding (US pop: $(printf "%'d" $US_POP))"
    else
        check_fail "Population API not responding correctly"
    fi
else
    check_warn "Cannot test API - backend not running"
fi
echo ""

# 11. Check for common issues
echo "11. Checking for common issues..."

# Check port conflicts
if lsof -i :3000 &> /dev/null && ! curl -s http://localhost:3000 &> /dev/null; then
    check_warn "Port 3000 in use but not responding (may be blocked)"
fi

if lsof -i :3001 &> /dev/null && ! curl -s http://localhost:3001 &> /dev/null; then
    check_warn "Port 3001 in use but not responding (may be blocked)"
fi
echo ""

# Summary
echo "=========================================="
echo "System Check Complete"
echo "=========================================="
echo ""

if curl -s http://localhost:3001/api/health &> /dev/null && curl -s http://localhost:3000 &> /dev/null; then
    echo -e "${GREEN}All systems operational! ✓${NC}"
    echo ""
    echo "Access the application at:"
    echo "  🌐 http://localhost:3000"
    echo ""
else
    echo -e "${YELLOW}Servers not running${NC}"
    echo ""
    echo "To start the application:"
    echo "  npm run dev"
    echo ""
    echo "Then visit:"
    echo "  🌐 http://localhost:3000"
    echo ""
fi

echo "For more information, see:"
echo "  • QUICKSTART.md - Getting started guide"
echo "  • DEVELOPMENT.md - Development guide"
echo "  • PROJECT_SUMMARY.md - Project overview"
echo ""
