# Partner Panel — API Documentation

Partner/Agent panel ke liye zaroori APIs. Ye document backend developer ko dein — woh in APIs ko implement karega.

**Postman Collection:** [`LPG_Partner_Panel_API.postman_collection.json`](./LPG_Partner_Panel_API.postman_collection.json) — Import karo Postman mein, pehle Partner Login chalao (token auto-save), phir baaki APIs.

**Base URL:** `http://your-domain.com` (ya `http://localhost:8000` dev mein)

**Partner Dashboard (`/partner`)** — Leads DB se aate hain, Accept/Reject/Status change sab API se.

**Auth:** Login ke baad milne wala JWT token har request mein `Authorization: Bearer <token>` header mein bhejna hai.

---

## API Summary

| # | API | Method | Endpoint | Description |
|---|-----|--------|----------|-------------|
| 1 | Partner Login | POST | `/api/auth/partner/login` | Agent login — token milega |
| 2 | Get My Leads | GET | `/api/partner/leads` | Agent ki assigned leads list |
| 3 | Accept Lead | POST | `/api/partner/leads/:id/accept` | New lead accept karo |
| 4 | Reject Lead | POST | `/api/partner/leads/:id/reject` | Lead reject karo |
| 5 | Update Lead | PATCH | `/api/partner/leads/:id` | Lead ko next stage mein move karo |

---

## 1. Partner Login

Agent/Partner login — Admin ne jo agent create kiya hai, usi email/password se login karega.

**Endpoint:** `POST /api/auth/partner/login`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "ahmed@eliteproperties.com",
  "password": "secret123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Agent ka email (Admin ne create karte waqt diya) |
| password | string | Yes | Min 6 chars |

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "agent": {
    "id": "A1",
    "agentName": "Ahmed Khan",
    "agencyName": "Elite Properties",
    "email": "ahmed@eliteproperties.com",
    "phone": "+92 300 1234567"
  }
}
```

**Error Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

**Frontend:** Token ko `localStorage` mein `lpg_partner_auth` key ke andar store karo (JSON format mein):  
`{ "token": "...", "agent": { ... } }`

---

## 2. Get My Leads

Agent apni assigned leads dekhta hai. Sirf woh leads return karo jinki `assigned_agent_id` = logged-in agent.

**Endpoint:** `GET /api/partner/leads`

**Headers:**
```
Authorization: Bearer <partner_token>
```

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | No | Filter: `new` \| `in_progress` \| `site_visit` \| `closed` |

**Example:**
```
GET /api/partner/leads
GET /api/partner/leads?status=new
GET /api/partner/leads?status=in_progress
```

**Success Response (200):**
```json
{
  "leads": [
    {
      "id": "L1",
      "userName": "Fatima Noor",
      "name": "Fatima Noor",
      "phone": "+92 300 1234567",
      "propertyInterest": "DHA Phase 9, 1 kanal",
      "budget": "2.5 Cr",
      "leadScore": 92,
      "status": "new",
      "aiSummary": "User DHA 9 mein interested. Budget 2-2.5 Cr.",
      "source": "AI Search",
      "createdAt": "2024-02-20T10:30:00Z",
      "expiresAt": "2024-02-20T10:35:00Z"
    }
  ]
}
```

**Lead Object Fields:**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Lead ID |
| name | string | User ka naam |
| userName | string | Same as name (agar alag ho to) |
| phone | string | Contact number |
| propertyInterest | string | Property interest (e.g. "DHA Phase 9, 1 kanal") |
| budget | string | Optional — e.g. "2.5 Cr" |
| leadScore | number | AI score 0–100 |
| status | string | `new` \| `in_progress` \| `site_visit` \| `closed` |
| aiSummary | string | AI ka summary |
| source | string | e.g. "AI Search" |
| createdAt | string | ISO 8601 timestamp |
| expiresAt | string | New leads ke liye 5 min timer (optional) — ISO 8601 |

**Note:** `expiresAt` — New leads ke liye 5 minute ka timer. Isse pehle accept karna zaroori (business rule).

---

## 3. Accept Lead

New lead ko accept karo — status `new` → `in_progress`.

**Endpoint:** `POST /api/partner/leads/:id/accept`

**Headers:**
```
Authorization: Bearer <partner_token>
```

**URL Params:** `id` = Lead ID (e.g. L1, 123)

**Example:**
```
POST /api/partner/leads/L1/accept
```

**Request Body:** None (empty body)

**Success Response (200):**
```json
{
  "success": true,
  "lead": {
    "id": "L1",
    "status": "in_progress"
  }
}
```

**Logic:** Lead ki `assigned_agent_id` = logged-in agent honi chahiye. Status: `new` → `in_progress`.

**Error (403):** Agent ko ye lead assign nahi hai  
**Error (404):** Lead not found

---

## 4. Reject Lead

Lead reject karo — lead next available agent ko assign ho jayegi ya pool mein chali jayegi.

**Endpoint:** `POST /api/partner/leads/:id/reject`

**Headers:**
```
Authorization: Bearer <partner_token>
```

**URL Params:** `id` = Lead ID

**Example:**
```
POST /api/partner/leads/L1/reject
```

**Request Body:** None (optional: `reason` agar backend support kare)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Lead rejected"
}
```

**Logic:** Lead ko re-route karo (next available agent) ya pool mein daalo.

---

## 5. Update Lead (Move to Next Stage)

Lead ko next stage mein move karo — e.g. In Progress → Site Visit → Closed.

**Endpoint:** `PATCH /api/partner/leads/:id`

**Headers:**
```
Authorization: Bearer <partner_token>
Content-Type: application/json
```

**URL Params:** `id` = Lead ID

**Request Body:**
```json
{
  "status": "in_progress"
}
```

**Status Values:**
- `new` — New lead (abhi accept nahi hua)
- `in_progress` — Accept ho gaya, follow-up kar rahe hain
- `site_visit` — Site visit scheduled
- `closed` — Deal closed / Commission pending

**Example:**
```
PATCH /api/partner/leads/L1
Content-Type: application/json

{"status": "site_visit"}
```

**Success Response (200):**
```json
{
  "success": true,
  "lead": {
    "id": "L1",
    "status": "site_visit"
  }
}
```

**Logic:** Agent sirf apni assigned leads update kar sakta hai.

---

## Kanban Columns (Frontend Reference)

| Column ID | Title | Color |
|-----------|-------|-------|
| new | New Leads | primary |
| in_progress | In Progress | amber |
| site_visit | Site Visit | blue |
| closed | Closed / Commission Pending | emerald |

---

## Auth Flow (Frontend)

1. Login: `POST /api/auth/partner/login` → token + agent
2. Store: `localStorage.setItem('lpg_partner_auth', JSON.stringify({ token, agent }))`
3. Har API call: `Authorization: Bearer <token>`
4. Logout: `localStorage.removeItem('lpg_partner_auth')`

---

## cURL Examples

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/partner/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ahmed@elite.com","password":"secret123"}'
```

**Get Leads:**
```bash
curl -X GET "http://localhost:8000/api/partner/leads?status=new" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Accept Lead:**
```bash
curl -X POST http://localhost:8000/api/partner/leads/L1/accept \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Reject Lead:**
```bash
curl -X POST http://localhost:8000/api/partner/leads/L1/reject \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Update Lead:**
```bash
curl -X PATCH http://localhost:8000/api/partner/leads/L1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"site_visit"}'
```

---

## Error Responses (Common)

| Status | Format | Example |
|--------|--------|---------|
| 401 | `{"error": "..."}` | Invalid credentials, Token expired |
| 403 | `{"error": "..."}` | Unauthorized — access denied |
| 404 | `{"error": "..."}` | Lead not found |
| 422 | `{"error": "..."}` | Validation error |
| 500 | `{"error": "..."}` | Server error |
