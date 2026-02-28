#!/bin/bash
# Partner Panel APIs — Test Script
# Usage: ./run_partner_apis.sh
# Base URL change karo agar backend alag port pe hai

BASE="http://127.0.0.1:8000"
LEAD_ID="${1:-L1}"

echo "=========================================="
echo "  Partner Panel APIs Test"
echo "  Base: $BASE | Lead ID: $LEAD_ID"
echo "=========================================="

# 1. Partner Login
echo ""
echo "=== 1. Partner Login (POST /api/auth/partner/login) ==="
LOGIN=$(curl -s -X POST "$BASE/api/auth/partner/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"ahmed@eliteproperties.com","password":"secret123"}')
echo "$LOGIN" | python3 -m json.tool 2>/dev/null || echo "$LOGIN"

TOKEN=$(echo "$LOGIN" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('token',''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo ""
  echo "⚠️  Login failed — Agent create karo Admin se (email: ahmed@eliteproperties.com, password: secret123)"
  echo "    Ya apne DB mein jo credentials hain woh use karo."
  echo ""
  echo "Baaki APIs ke liye token chahiye. Ab mock token se try karte hain..."
  TOKEN=""
fi

# 2. Get My Leads (All)
echo ""
echo "=== 2. Get My Leads - All (GET /api/partner/leads) ==="
if [ -n "$TOKEN" ]; then
  curl -s -X GET "$BASE/api/partner/leads" \
    -H "Authorization: Bearer $TOKEN" | python3 -m json.tool 2>/dev/null || curl -s -X GET "$BASE/api/partner/leads" -H "Authorization: Bearer $TOKEN"
else
  curl -s -X GET "$BASE/api/partner/leads" | python3 -m json.tool 2>/dev/null || curl -s -X GET "$BASE/api/partner/leads"
fi

# 3. Get My Leads (status=new)
echo ""
echo "=== 3. Get My Leads - status=new (GET /api/partner/leads?status=new) ==="
if [ -n "$TOKEN" ]; then
  curl -s -X GET "$BASE/api/partner/leads?status=new" \
    -H "Authorization: Bearer $TOKEN" | python3 -m json.tool 2>/dev/null || curl -s -X GET "$BASE/api/partner/leads?status=new" -H "Authorization: Bearer $TOKEN"
else
  curl -s -X GET "$BASE/api/partner/leads?status=new" | python3 -m json.tool 2>/dev/null || curl -s -X GET "$BASE/api/partner/leads?status=new"
fi

# 4. Get My Leads (status=in_progress)
echo ""
echo "=== 4. Get My Leads - status=in_progress (GET /api/partner/leads?status=in_progress) ==="
if [ -n "$TOKEN" ]; then
  curl -s -X GET "$BASE/api/partner/leads?status=in_progress" \
    -H "Authorization: Bearer $TOKEN" | python3 -m json.tool 2>/dev/null || curl -s -X GET "$BASE/api/partner/leads?status=in_progress" -H "Authorization: Bearer $TOKEN"
else
  curl -s -X GET "$BASE/api/partner/leads?status=in_progress" | python3 -m json.tool 2>/dev/null || curl -s -X GET "$BASE/api/partner/leads?status=in_progress"
fi

# 5. Accept Lead
echo ""
echo "=== 5. Accept Lead (POST /api/partner/leads/$LEAD_ID/accept) ==="
if [ -n "$TOKEN" ]; then
  curl -s -X POST "$BASE/api/partner/leads/$LEAD_ID/accept" \
    -H "Authorization: Bearer $TOKEN" | python3 -m json.tool 2>/dev/null || curl -s -X POST "$BASE/api/partner/leads/$LEAD_ID/accept" -H "Authorization: Bearer $TOKEN"
else
  curl -s -X POST "$BASE/api/partner/leads/$LEAD_ID/accept" | python3 -m json.tool 2>/dev/null || curl -s -X POST "$BASE/api/partner/leads/$LEAD_ID/accept"
fi

# 6. Reject Lead
echo ""
echo "=== 6. Reject Lead (POST /api/partner/leads/$LEAD_ID/reject) ==="
if [ -n "$TOKEN" ]; then
  curl -s -X POST "$BASE/api/partner/leads/$LEAD_ID/reject" \
    -H "Authorization: Bearer $TOKEN" | python3 -m json.tool 2>/dev/null || curl -s -X POST "$BASE/api/partner/leads/$LEAD_ID/reject" -H "Authorization: Bearer $TOKEN"
else
  curl -s -X POST "$BASE/api/partner/leads/$LEAD_ID/reject" | python3 -m json.tool 2>/dev/null || curl -s -X POST "$BASE/api/partner/leads/$LEAD_ID/reject"
fi

# 7. Update Lead - Site Visit
echo ""
echo "=== 7. Update Lead Status (PATCH /api/partner/leads/$LEAD_ID) — status=site_visit ==="
if [ -n "$TOKEN" ]; then
  curl -s -X PATCH "$BASE/api/partner/leads/$LEAD_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"status":"site_visit"}' | python3 -m json.tool 2>/dev/null || curl -s -X PATCH "$BASE/api/partner/leads/$LEAD_ID" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"status":"site_visit"}'
else
  curl -s -X PATCH "$BASE/api/partner/leads/$LEAD_ID" \
    -H "Content-Type: application/json" \
    -d '{"status":"site_visit"}' | python3 -m json.tool 2>/dev/null || curl -s -X PATCH "$BASE/api/partner/leads/$LEAD_ID" -H "Content-Type: application/json" -d '{"status":"site_visit"}'
fi

# 8. Update Lead - Closed
echo ""
echo "=== 8. Update Lead Status (PATCH /api/partner/leads/$LEAD_ID) — status=closed ==="
if [ -n "$TOKEN" ]; then
  curl -s -X PATCH "$BASE/api/partner/leads/$LEAD_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"status":"closed"}' | python3 -m json.tool 2>/dev/null || curl -s -X PATCH "$BASE/api/partner/leads/$LEAD_ID" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"status":"closed"}'
else
  curl -s -X PATCH "$BASE/api/partner/leads/$LEAD_ID" \
    -H "Content-Type: application/json" \
    -d '{"status":"closed"}' | python3 -m json.tool 2>/dev/null || curl -s -X PATCH "$BASE/api/partner/leads/$LEAD_ID" -H "Content-Type: application/json" -d '{"status":"closed"}'
fi

echo ""
echo "=========================================="
echo "  Done. Agar login 401 tha to Agent create/update karo."
echo "  Lead ID change: ./run_partner_apis.sh L2"
echo "=========================================="
