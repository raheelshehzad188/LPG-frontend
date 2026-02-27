# Admin Leads Page — APIs & cURL

`/admin/leads` page ye APIs use karta hai:

**Base URL:** `http://127.0.0.1:8000` (Vite proxy `/api` → 8000). Agar backend alag port/URL pe hai to `.env` mein `VITE_API_BASE_URL` set karo.

---

## 1. Get All Leads

**API:** `GET /api/admin/leads`

**Headers:** `Authorization: Bearer <admin_token>`

**Query Params (optional):**
| Param | Description |
|-------|-------------|
| status | `new` \| `contacted` \| `in_progress` \| `site_visit` \| `closed` |
| agentId | Filter by assigned agent (e.g. A1) |
| from | Date filter (YYYY-MM-DD) |
| to | Date filter (YYYY-MM-DD) |

```bash
# Pehle Admin Login karo, token copy karo
curl -X GET "http://127.0.0.1:8000/api/admin/leads" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "leads": [
    {
      "id": "L1",
      "userName": "Fatima Noor",
      "phone": "+92 300 1234567",
      "propertyInterest": "DHA Phase 9, 1 kanal",
      "propertyId": "P101",
      "budget": "2.5 Cr",
      "leadScore": 92,
      "assignedAgentId": "A1",
      "assignedAgent": "Ahmed Khan",
      "status": "new",
      "aiSummary": "User DHA 9 mein interested...",
      "createdAt": "2024-02-20T10:30:00Z"
    }
  ]
}
```

**Backend snake_case bhi chalega** — frontend normalize karta hai:
- `user_name` → `userName`
- `property_interest` → `propertyInterest`
- `lead_score` → `leadScore`
- `assigned_agent_id` → `assignedAgentId`
- `assigned_agent` → `assignedAgent`

---

## 2. Re-route Lead (Assign to Different Agent)

**API:** `POST /api/admin/leads/:id/reroute`

```bash
curl -X POST "http://127.0.0.1:8000/api/admin/leads/L1/reroute" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"agentId": "A2"}'
```

**Response (200):**
```json
{
  "success": true,
  "lead": {
    "id": "L1",
    "assignedAgentId": "A2",
    "assignedAgent": "Sara Malik"
  }
}
```

---

## 3. Get Agents (Reroute Dropdown ke liye)

Leads page reroute modal mein agents dropdown ke liye ye API use karta hai:

**API:** `GET /api/admin/agents`

```bash
curl -X GET "http://127.0.0.1:8000/api/admin/agents" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Backend URL Change (PHP / Alag Port)

Agar tumhara backend **PHP** pe hai ya **alag port** pe (e.g. 8080):

1. `.env` file banao project root mein:
```
VITE_API_BASE_URL=http://localhost/propert_paython
```
ya
```
VITE_API_BASE_URL=http://127.0.0.1:8080
```

2. `vite.config.js` mein proxy target change karo — ya `VITE_API_BASE_URL` set karke proxy bypass karo (full URL use hogi).

---

## Full Flow (cURL)

```bash
# 1. Admin Login
curl -X POST "http://127.0.0.1:8000/api/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lpg.com","password":"admin123"}'
# Response se token copy karo

# 2. Get Leads
curl -X GET "http://127.0.0.1:8000/api/admin/leads" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Get Agents (reroute dropdown)
curl -X GET "http://127.0.0.1:8000/api/admin/agents" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Re-route Lead
curl -X POST "http://127.0.0.1:8000/api/admin/leads/L1/reroute" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"agentId":"A2"}'
```
