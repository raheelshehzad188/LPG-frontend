# Partner Panel — APIs Backend Spec

**Ye doc file backend developer ke liye hai.** In 5 APIs ko implement karo — Partner Panel complete ho jayega.

**Base URL:** `http://127.0.0.1:8000` (ya apna domain)

**Auth:** Login ke baad token har request mein `Authorization: Bearer <token>` header mein bhejna hai.

---

## Quick Summary

| # | API | Method | Endpoint |
|---|-----|--------|----------|
| 1 | Partner Login | POST | `/api/auth/partner/login` |
| 2 | Get My Leads | GET | `/api/partner/leads` |
| 3 | Accept Lead | POST | `/api/partner/leads/:id/accept` |
| 4 | Reject Lead | POST | `/api/partner/leads/:id/reject` |
| 5 | Update Lead Status | PATCH | `/api/partner/leads/:id` |

---

## 1. Partner Login

**Endpoint:** `POST /api/auth/partner/login`  
**Auth:** Nahi chahiye

**Request:**
```json
{
  "email": "ahmed@eliteproperties.com",
  "password": "secret123"
}
```

| Field | Type | Required |
|-------|------|----------|
| email | string | Yes |
| password | string | Yes |

**Response 200:**
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

**Logic:** Agents table se email match karo, password verify karo (bcrypt/argon2). Ye wohi agents hain jo Admin ne Create Agent se add kiye.

**Error 401:**
```json
{
  "error": "Invalid credentials"
}
```

---

## 2. Get My Leads

**Endpoint:** `GET /api/partner/leads`  
**Auth:** `Authorization: Bearer <token>`

**Query Params (optional):**
| Param | Values | Description |
|-------|--------|-------------|
| status | `new` \| `in_progress` \| `site_visit` \| `closed` | Filter by status |

**Examples:**
```
GET /api/partner/leads
GET /api/partner/leads?status=new
```

**Response 200:**
```json
{
  "leads": [
    {
      "id": "L1",
      "name": "Fatima Noor",
      "userName": "Fatima Noor",
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

**Logic:**
- JWT token se agent ID nikalo
- Sirf woh leads return karo jinki `assigned_agent_id` = logged-in agent
- `expiresAt` — New leads ke liye optional 5 min timer (createdAt + 5 min). Frontend countdown dikhata hai.

**Lead Fields (backend snake_case bhi chalega, frontend dono handle karta hai):**
| Field | Type | Notes |
|-------|------|-------|
| id | string | Lead ID |
| name | string | Customer naam |
| userName | string | Same as name |
| phone | string | |
| propertyInterest | string | Property interest text |
| budget | string | e.g. "2.5 Cr" |
| leadScore | number | 0–100 |
| status | string | `new`, `in_progress`, `site_visit`, `closed` |
| aiSummary | string | AI summary |
| source | string | e.g. "AI Search" |
| createdAt | string | ISO 8601 |
| expiresAt | string | Optional — ISO 8601, new leads ke liye |

**Alternative:** Agar `data` key use karo to `{ "data": [...] }` bhi chalega.

---

## 3. Accept Lead

**Endpoint:** `POST /api/partner/leads/:id/accept`  
**Auth:** `Authorization: Bearer <token>`

**URL:** `id` = Lead ID (e.g. L1, 123)

**Request Body:** Empty `{}` ya kuch mat bhejo

**Response 200:**
```json
{
  "success": true,
  "lead": {
    "id": "L1",
    "status": "in_progress"
  }
}
```

**Logic:**
- Lead ki `assigned_agent_id` = logged-in agent honi chahiye
- Status: `new` → `in_progress`
- Agar lead kisi aur agent ko assign hai → 403

**Error 403:** `{ "error": "Lead not assigned to you" }`  
**Error 404:** `{ "error": "Lead not found" }`

---

## 4. Reject Lead

**Endpoint:** `POST /api/partner/leads/:id/reject`  
**Auth:** `Authorization: Bearer <token>`

**URL:** `id` = Lead ID

**Request Body:** Empty (optional: `{"reason": "..."}` agar support karna ho)

**Response 200:**
```json
{
  "success": true,
  "message": "Lead rejected"
}
```

**Logic:**
- Lead ko pool mein daalo / next available agent ko assign karo / ya reject flag set karo
- Frontend lead ko list se hata deta hai

---

## 5. Update Lead Status (Move to Next Stage)

**Endpoint:** `PATCH /api/partner/leads/:id`  
**Auth:** `Authorization: Bearer <token>`

**Headers:** `Content-Type: application/json`

**Request:**
```json
{
  "status": "site_visit"
}
```

**Status Values:**
| Value | Meaning |
|-------|---------|
| `new` | Abhi accept nahi hua |
| `in_progress` | Accept ho gaya, follow-up |
| `site_visit` | Site visit scheduled |
| `closed` | Deal closed |

**Response 200:**
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

## Frontend Config (Reference)

```javascript
// src/config.js
partner: {
  leads: '/api/partner/leads',
  leadAccept: (id) => `/api/partner/leads/${id}/accept`,
  leadReject: (id) => `/api/partner/leads/${id}/reject`,
  leadUpdate: (id) => `/api/partner/leads/${id}`,
}
```

---

## JWT Token

- Token me `sub` = agent ID (e.g. A1)
- Verify karke agent identity confirm karo
- 401 return karo agar token invalid/expired

---

## Error Format (Common)

```json
{
  "error": "Error message here"
}
```

| HTTP | Case |
|------|------|
| 200 | Success |
| 401 | Invalid/expired token, Invalid login |
| 403 | Access denied (e.g. lead not yours) |
| 404 | Lead/Resource not found |
| 422 | Validation error |
| 500 | Server error |

---

## cURL Examples (Testing)

```bash
# 1. Login
curl -X POST http://127.0.0.1:8000/api/auth/partner/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ahmed@eliteproperties.com","password":"secret123"}'

# 2. Get Leads (token copy karke use karo)
curl -X GET "http://127.0.0.1:8000/api/partner/leads" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Accept
curl -X POST http://127.0.0.1:8000/api/partner/leads/L1/accept \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Reject
curl -X POST http://127.0.0.1:8000/api/partner/leads/L1/reject \
  -H "Authorization: Bearer YOUR_TOKEN"

# 5. Update Status
curl -X PATCH http://127.0.0.1:8000/api/partner/leads/L1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"site_visit"}'
```

---

**Postman Collection:** `docs/LPG_Partner_Panel_API.postman_collection.json` — Import karo, pehle Login chalao (token auto-save), phir baaki APIs.
