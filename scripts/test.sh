#!/bin/bash
# filepath: /Users/rom/Desktop/start-basic/test-manifest.sh

# Configuration
BASE_URL="http://192.168.31.181:3000"
ENDPOINT="/api/manifest"
OUTPUT_DIR="./test-output"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo -e "${BLUE}🧪 Testing Expo Manifest API${NC}"
echo "=========================================="
echo "URL: ${BASE_URL}${ENDPOINT}"
echo "Time: $(date)"
echo ""

# Test function
test_manifest() {
    local test_name="$1"
    local additional_headers="$2"
    local query_params="$3"
    
    echo -e "${YELLOW}📋 Test: $test_name${NC}"
    echo "----------------------------------------"
    
    local url="${BASE_URL}${ENDPOINT}${query_params}"
    local output_file="${OUTPUT_DIR}/${test_name// /_}.txt"
    local headers_file="${OUTPUT_DIR}/${test_name// /_}_headers.txt"
    
    echo "Request URL: $url"
    echo "Output file: $output_file"
    echo ""
    
    # Make the request
    local response=$(curl -w "\n%{http_code}\n%{time_total}" \
        -H "expo-current-update-id: 3e0a786c-43ba-4003-ae39-c2aedaf9b60e" \
        -H "expo-embedded-update-id: 3e0a786c-43ba-4003-ae39-c2aedaf9b60e" \
        -H "accept: multipart/mixed,application/expo+json,application/json" \
        -H "expo-platform: android" \
        -H "expo-protocol-version: 1" \
        -H "expo-api-version: 1" \
        -H "expo-updates-environment: BARE" \
        -H "expo-json-error: true" \
        -H "eas-client-id: 2bc1e8a6-d48a-45e0-ba8e-a0cc17cc567a" \
        -H "expo-runtime-version: 1" \
        -H "accept-encoding: br,gzip" \
        -H "connection: Keep-Alive" \
        -H "user-agent: okhttp/4.12.0" \
        -H "if-modified-since: Wed, 04 Jun 2025 09:38:57 GMT" \
        $additional_headers \
        -D "$headers_file" \
        -s \
        "$url" | tee "$output_file")
    
    # Extract status code and time from response
    local lines=($(echo "$response" | tail -2))
    local status_code="${lines[0]}"
    local time_total="${lines[1]}"
    
    # Remove status code and time from output file
    head -n -2 "$output_file" > "${output_file}.tmp" && mv "${output_file}.tmp" "$output_file"
    
    # Print results
    if [[ "$status_code" == "200" ]]; then
        echo -e "✅ ${GREEN}SUCCESS${NC} - Status: $status_code - Time: ${time_total}s"
        
        # Check if response is multipart
        if grep -q "multipart/mixed" "$headers_file"; then
            echo -e "📦 ${GREEN}Multipart response detected${NC}"
            
            # Extract boundary
            boundary=$(grep -o 'boundary=[^;]*' "$headers_file" | cut -d= -f2 | tr -d '\r')
            if [[ -n "$boundary" ]]; then
                echo "🔗 Boundary: $boundary"
                
                # Split multipart response
                echo "📄 Extracting parts..."
                csplit -f "${OUTPUT_DIR}/${test_name// /_}_part_" -b "%02d.txt" "$output_file" "/--$boundary/" {*} 2>/dev/null || true
            fi
        fi
        
        # Check for JSON response
        if grep -q "application/json" "$headers_file"; then
            echo -e "📋 ${GREEN}JSON response detected${NC}"
            if command -v jq &> /dev/null; then
                echo "🎨 Formatting JSON..."
                jq . "$output_file" > "${output_file}.formatted" 2>/dev/null || echo "Invalid JSON format"
            fi
        fi
        
    elif [[ "$status_code" == "400" ]]; then
        echo -e "⚠️  ${YELLOW}CLIENT ERROR${NC} - Status: $status_code"
        echo "Response body:"
        cat "$output_file"
    elif [[ "$status_code" == "404" ]]; then
        echo -e "❌ ${RED}NOT FOUND${NC} - Status: $status_code"
        echo "Response body:"
        cat "$output_file"
    elif [[ "$status_code" == "500" ]]; then
        echo -e "💥 ${RED}SERVER ERROR${NC} - Status: $status_code"
        echo "Response body:"
        cat "$output_file"
    else
        echo -e "❓ ${RED}UNEXPECTED${NC} - Status: $status_code"
        echo "Response body:"
        cat "$output_file"
    fi
    
    echo ""
    echo "Response Headers:"
    cat "$headers_file"
    echo ""
    echo "=========================================="
    echo ""
}

# Run tests
echo -e "${BLUE}🚀 Starting API Tests${NC}"
echo ""

# Test 1: Basic manifest request
test_manifest "Basic Manifest Request" "" ""

# Test 2: Test with query parameters
test_manifest "Manifest with Query Params" "" "?platform=android&runtime-version=1"

# Test 3: Test with iOS platform
test_manifest "iOS Platform Test" "-H 'expo-platform: ios'" ""

# Test 4: Test with protocol version 0
test_manifest "Protocol Version 0" "-H 'expo-protocol-version: 0'" ""

# Test 5: Test with missing runtime version
test_manifest "Missing Runtime Version" "-H 'expo-runtime-version: '" ""

# Test 6: Test with invalid platform
test_manifest "Invalid Platform" "-H 'expo-platform: web'" ""

# Test 7: Test with different update ID (should trigger update)
test_manifest "Different Update ID" "-H 'expo-current-update-id: different-id-12345'" ""

# Summary
echo -e "${BLUE}📊 Test Summary${NC}"
echo "=========================================="
echo "Test files saved in: $OUTPUT_DIR"
echo ""

# List all output files
echo "Generated files:"
ls -la "$OUTPUT_DIR"

echo ""
echo -e "${GREEN}✅ All tests completed!${NC}"
echo ""
echo "💡 Tips:"
echo "- Check the *_headers.txt files for response headers"
echo "- Multipart responses are split into separate part files"
echo "- JSON responses are formatted if jq is available"
echo "- Look for any error messages in the response bodies"