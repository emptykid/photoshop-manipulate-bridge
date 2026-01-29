#!/bin/bash

# Photoshop Bridge HTTP API Examples

BASE_URL="http://localhost:8020"

echo "=== Photoshop Manipulate Bridge HTTP Client ==="
echo ""

# Check server status
echo "1. Checking server status..."
curl -s "$BASE_URL/status" | jq .
echo ""

# Send alert
echo "2. Sending alert to Photoshop..."
curl -s -X POST "$BASE_URL/execute" \
  -H "Content-Type: application/json" \
  -d '{"action": "alert", "message": "Hello from HTTP client!"}' | jq .
echo ""

# Execute JSX script
echo "3. Executing JSX script..."
curl -s -X POST "$BASE_URL/execute" \
  -H "Content-Type: application/json" \
  -d '{"script": "alert(\"Custom JSX from HTTP\");"}' | jq .
echo ""

echo "Done!"
