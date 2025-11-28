#!/bin/bash

# Performance monitoring script for OneSign Landing Page
# Checks response time, availability, and basic metrics

set -e

# Configuration
URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3001}"
HEALTH_ENDPOINT="$URL/api/health"
LANDING_ENDPOINT="$URL/en/landing"
THRESHOLD_MS=1000
LOG_FILE="./logs/performance.log"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create logs directory if it doesn't exist
mkdir -p ./logs

# Function to check response time
check_response_time() {
    local endpoint=$1
    local name=$2

    echo -n "Checking $name... "

    start_time=$(date +%s%3N)
    http_code=$(curl -o /dev/null -s -w "%{http_code}" "$endpoint")
    end_time=$(date +%s%3N)

    response_time=$((end_time - start_time))

    if [ "$http_code" -eq 200 ]; then
        if [ "$response_time" -lt "$THRESHOLD_MS" ]; then
            echo -e "${GREEN}✓${NC} ${response_time}ms (HTTP $http_code)"
        else
            echo -e "${YELLOW}⚠${NC} ${response_time}ms (HTTP $http_code) - Slow response"
        fi
    else
        echo -e "${RED}✗${NC} HTTP $http_code - Failed"
        return 1
    fi

    # Log result
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $name: ${response_time}ms (HTTP $http_code)" >> "$LOG_FILE"
}

# Function to check health endpoint
check_health() {
    echo -n "Checking health status... "

    health_response=$(curl -s "$HEALTH_ENDPOINT")
    status=$(echo "$health_response" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

    if [ "$status" == "ok" ]; then
        uptime=$(echo "$health_response" | grep -o '"uptime":[0-9.]*' | cut -d':' -f2)
        echo -e "${GREEN}✓${NC} Status: $status, Uptime: ${uptime}s"
    else
        echo -e "${RED}✗${NC} Status: $status"
        return 1
    fi
}

# Function to check memory usage
check_memory() {
    if command -v pm2 &> /dev/null; then
        echo "PM2 Memory Usage:"
        pm2 list | grep onesign-landing || echo "Not running with PM2"
    fi
}

# Main execution
echo "================================================"
echo "OneSign Landing - Performance Monitor"
echo "================================================"
echo "URL: $URL"
echo "Time: $(date '+%Y-%m-%d %H:%M:%S')"
echo "================================================"
echo ""

# Run checks
check_health
check_response_time "$HEALTH_ENDPOINT" "Health Endpoint"
check_response_time "$LANDING_ENDPOINT" "Landing Page (EN)"
check_response_time "$URL/fa/landing" "Landing Page (FA)"

echo ""
check_memory

echo ""
echo "================================================"
echo "Last 5 performance logs:"
echo "================================================"
tail -n 5 "$LOG_FILE" 2>/dev/null || echo "No logs yet"

echo ""
echo "Performance check completed!"
