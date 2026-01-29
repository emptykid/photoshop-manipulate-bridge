#!/bin/bash

# Example: Execute JSX file via HTTP API

BASE_URL="http://localhost:8020"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Execute JSX File Example ==="
echo ""

# Example 1: Execute with absolute path
echo "1. Executing JSX file with absolute path..."
curl -X POST "$BASE_URL/execute" \
  -H "Content-Type: application/json" \
  -d "{\"file\": \"$SCRIPT_DIR/test.jsx\"}" | jq .
echo ""

# Example 2: Execute with relative path (relative to plugin directory)
echo "2. Executing JSX file with relative path..."
curl -X POST "$BASE_URL/execute" \
  -H "Content-Type: application/json" \
  -d '{"file": "examples/test.jsx"}' | jq .
echo ""

# Example 3: Execute a simple inline script for comparison
echo "3. Executing inline script..."
curl -X POST "$BASE_URL/execute" \
  -H "Content-Type: application/json" \
  -d '{"script": "app.version"}' | jq .
echo ""

echo "Done!"
