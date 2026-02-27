# Lahore Property Guide — Complete API Specification (New Backend)

**Purpose:** Old project delete ho gaya hai. Ye document saari zaroori APIs list karta hai jo naye backend mein banani hain. Admin Panel login aur uske andar ki sab APIs.

**Base URL:** `http://127.0.0.1:8000` (ya apna production URL)

**Auth Header (jahan auth chahiye):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## Quick Index (Sab APIs Ek Nazar Mein)

| # | Feature | Method | Endpoint | Auth |
|---|---------|--------|----------|------|
| 1 | Admin Login | POST | `/api/auth/admin/login` | — |
| 2 | Partner Login | POST | `/api/auth/partner/login` | — |
| 3 | List Leads (Admin) | GET | `/api/admin/leads` | Admin |
| 4 | Re-route Lead | POST | `/api/admin/leads/:id/reroute` | Admin |
| 5 | List Agents | GET | `/api/admin/agents` | Admin |
| 6 | Create Agent | POST | `/api/admin/agents` | Admin |
| 7 | Update Agent | PATCH | `/api/admin/agents/:id` | Admin |
| 8 | Delete Agent | DELETE | `/api/admin/agents/:id` | Admin |
| 9 | Toggle Agent Routing | PATCH | `/api/admin/agents/:id/routing` | Admin |
| 10 | List Scraping Sources | GET | `/api/admin/scraping` | Admin |
| 11 | Toggle Scraping | PATCH | `/api/admin/scraping/:id` | Admin |
| 12 | Get Gemini Settings | GET | `/api/gemini` | Admin |
| 13 | Save Gemini Settings | PUT | `/api/gemini` | Admin |
| 14 | Test Gemini Key | POST | `/api/gemini/test` | Admin |
| 15 | Reset Gemini Instructions | POST | `/api/gemini/reset` | Admin |
| 16 | Save Lead (AI Chat) | POST | `/api/leads` | — |
| 17 | AI Conversation | POST | `/api_new_ai` | — |
| 18 | Partner: Get My Leads | GET | `/api/partner/leads` | Partner |
| 19 | Partner: Accept Lead | POST | `/api/partner/leads/:id/accept` | Partner |
| 20 | Partner: Reject Lead | POST | `/api/partner/leads/:id/reject` | Partner |
| 21 | Partner: Update Lead Status | PATCH | `/api/partner/leads/:id` | Partner |

---

## 1. Auth APIs

### 1.1 Admin Login
**Kahan use:** Admin Panel `/admin/login`

| | |
|--|--|
| **Method** | POST |
| **Endpoint** | `/api/auth/admin/login` |
| **Auth** | Nahi |

**Request:**
```json
{
  "email": "admin@lpg.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "admin_1",
    "email": "admin@lpg.com",
    "name": "Admin"
  }
}
```

**Error (401):**
```json
{ "error": "Invalid credentials" }
```

**Frontend:** Token `localStorage` mein `lpg_admin_auth` key se save hota hai.

---

### 1.2 Partner / Agent Login
**Kahan use:** Partner Panel `/partner/login`

| | |
|--|--|
| **Method** | POST |
| **Endpoint** | `/api/auth/partner/login` |
| **Auth** | Nahi |

**Request:**
```json
{
  "email": "ahmed@eliteproperties.com",
  "password": "secret123"
}
```

**Response (200):**
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

**Note:** Ye wohi credentials hain jo Admin ne Create Agent ke waqt diye.

---

## 2. Admin — Leads APIs

**Kahan use:** Admin Panel `/admin/leads`

### 2.1 List All Leads

| | |
|--|--|
| **Method** | GET |
| **Endpoint** | `/api/admin/leads` |
| **Auth** | Admin token |

**Query Params (optional):**
- `status`: `new` | `contacted` | `site_visit` | `closed`
- `agentId`: Assigned agent filter
- `from`: ISO8601 date
- `to`: ISO8601 date

**Response (200):**
```json
{
  "leads": [
    {
      "id": "L1",
      "userName": "Fatima Noor",
      "name": "Fatima Noor",
      "phone": "+92 300 1234567",
      "propertyInterest": "DHA Phase 9, 1 kanal",
      "propertyId": "P101",
      "propertyLink": "/property/101",
      "budget": "2.5 Cr",
      "leadScore": 92,
      "assignedAgent": "Ahmed Khan",
      "assignedAgentId": "A1",
      "status": "new",
      "aiSummary": "User DHA 9 mein interested...",
      "createdAt": "2024-02-20T10:30:00Z"
    }
  ]
}
```

**Alternative response keys:** `data` ya direct array bhi chalega, frontend dono handle karta hai.

---

### 2.2 Manual Re-route Lead

| | |
|--|--|
| **Method** | POST |
| **Endpoint** | `/api/admin/leads/:id/reroute` |
| **Auth** | Admin token |

**Request:**
```json
{
  "agentId": "A2"
}
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

## 3. Admin — Agents APIs

**Kahan use:** Admin Panel `/admin/agents`

### 3.1 List Agents

| | |
|--|--|
| **Method** | GET |
| **Endpoint** | `/api/admin/agents` |
| **Auth** | Admin token |

**Query Params (optional):**
- `status`: `active` | `suspended`
- `search`: Search in agent/agency name

**Response (200):**
```json
{
  "agents": [
    {
      "id": "A1",
      "agentName": "Ahmed Khan",
      "agencyName": "Elite Properties",
      "email": "ahmed@eliteproperties.com",
      "phone": "+92 300 1234567",
      "specialization": "DHA Phase 9, Gulberg III",
      "status": "active",
      "routingEnabled": true,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### 3.2 Create Agent

| | |
|--|--|
| **Method** | POST |
| **Endpoint** | `/api/admin/agents` |
| **Auth** | Admin token |

**Request:**
```json
{
  "agentName": "Ahmed Khan",
  "agencyName": "Elite Properties",
  "email": "ahmed@eliteproperties.com",
  "password": "secret123",
  "phone": "+92 300 1234567",
  "specialization": "DHA Phase 9, Gulberg III",
  "status": "active"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| agentName | string | Yes | Agent ka naam |
| agencyName | string | Yes | Agency ka naam |
| email | string | Yes | Partner login ke liye (unique) |
| password | string | Yes | Min 6 chars |
| phone | string | Yes | Contact number |
| specialization | string | No | Areas |
| status | string | No | `active` \| `suspended` (default: active) |

**Response (201):**
```json
{
  "success": true,
  "agent": {
    "id": "A1",
    "agentName": "Ahmed Khan",
    "agencyName": "Elite Properties",
    "phone": "+92 300 1234567",
    "specialization": "DHA Phase 9, Gulberg III",
    "status": "active",
    "routingEnabled": true
  }
}
```

---

### 3.3 Update Agent

| | |
|--|--|
| **Method** | PATCH |
| **Endpoint** | `/api/admin/agents/:id` |
| **Auth** | Admin token |

**Request (partial — sirf jo change karna hai):**
```json
{
  "agentName": "Ahmed Khan",
  "agencyName": "Elite Properties",
  "email": "ahmed@eliteproperties.com",
  "password": "newpass123",
  "phone": "+92 300 1234567",
  "specialization": "DHA Phase 9, Gulberg III, Bahria",
  "status": "active"
}
```
Password optional — change karna ho to bhejo.

---

### 3.4 Delete Agent

| | |
|--|--|
| **Method** | DELETE |
| **Endpoint** | `/api/admin/agents/:id` |
| **Auth** | Admin token |

**Response (200):**
```json
{
  "success": true,
  "message": "Agent deleted"
}
```

---

### 3.5 Toggle Lead Routing

| | |
|--|--|
| **Method** | PATCH |
| **Endpoint** | `/api/admin/agents/:id/routing` |
| **Auth** | Admin token |

**Request:**
```json
{
  "active": true
}
```
`active: true` = leads is agent ko assign hongi. `false` = band.

**Response (200):**
```json
{
  "success": true,
  "agent": {
    "id": "A1",
    "routingEnabled": true
  }
}
```

---

## 4. Admin — Scraping APIs

**Kahan use:** Admin Panel `/admin/scraping`

### 4.1 List Scraping Sources

| | |
|--|--|
| **Method** | GET |
| **Endpoint** | `/api/admin/scraping` |
| **Auth** | Admin token |

**Response (200):**
```json
{
  "sources": [
    {
      "id": "S1",
      "source": "DHA Phase 9",
      "status": "active",
      "lastRun": "2024-02-20T10:28:00Z",
      "listings": 124
    },
    {
      "id": "S2",
      "source": "Bahria Town",
      "status": "paused",
      "lastRun": "2024-02-20T10:25:00Z",
      "listings": 89
    }
  ]
}
```

---

### 4.2 Toggle Scraping (Pause/Resume)

| | |
|--|--|
| **Method** | PATCH |
| **Endpoint** | `/api/admin/scraping/:id` |
| **Auth** | Admin token |

**Request:**
```json
{
  "status": "active"
}
```
`status`: `active` ya `paused`

**Response (200):**
```json
{
  "success": true,
  "source": {
    "id": "S1",
    "status": "active"
  }
}
```

---

## 5. Admin — Gemini Settings APIs

**Kahan use:** Admin Panel `/admin/gemini`

### 5.1 Get Gemini Settings

| | |
|--|--|
| **Method** | GET |
| **Endpoint** | `/api/gemini` |
| **Auth** | Admin token |

**Response (200):**
```json
{
  "apiKey": null,
  "apiKeyMasked": "AIza***xyz",
  "systemInstructions": "Tu Lahore Property Guide ka AI assistant ho...",
  "conversationInstructions": "Ek ek question poocho...",
  "model": "gemini-1.5-flash",
  "updatedAt": "2024-02-24T10:30:00Z"
}
```

---

### 5.2 Save Gemini Settings

| | |
|--|--|
| **Method** | PUT |
| **Endpoint** | `/api/gemini` |
| **Auth** | Admin token |

**Request:**
```json
{
  "apiKey": "AIzaSy...",
  "systemInstructions": "Tu Lahore Property Guide ka AI assistant ho...",
  "conversationInstructions": "Ek ek question poocho...",
  "model": "gemini-1.5-flash"
}
```
`apiKey` optional — bhejo to update, warna purani retain.

---

### 5.3 Test Gemini Connection

| | |
|--|--|
| **Method** | POST |
| **Endpoint** | `/api/gemini/test` |
| **Auth** | Admin token |

**Request:**
```json
{
  "apiKey": "AIzaSy..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Connection successful",
  "model": "gemini-1.5-flash"
}
```

---

### 5.4 Reset to Default Instructions

| | |
|--|--|
| **Method** | POST |
| **Endpoint** | `/api/gemini/reset` |
| **Auth** | Admin token |

**Request:** `{}` (empty body)

**Response (200):**
```json
{
  "success": true,
  "message": "Reset to default instructions",
  "systemInstructions": "...",
  "conversationInstructions": "..."
}
```

---

## 6. Public / Website APIs

### 6.1 Save Lead (AI Chat se)

**Kahan use:** AIAssistant component — jab user phone de deta hai, lead DB mein save hoti hai.

| | |
|--|--|
| **Method** | POST |
| **Endpoint** | `/api/leads` |
| **Auth** | Nahi |

**Request:**
```json
{
  "phone": "+923001234567",
  "name": "Web Visitor",
  "context": "DHA Phase 9 plot | 2 crore budget | ..."
}
```

**Response (200/201):** Success status (frontend sirf success/fail check karta hai)

---

### 6.2 AI Conversation (Property Search)

**Kahan use:** Listings page — AI chat, property recommendations, lead extraction.

| | |
|--|--|
| **Method** | POST |
| **Endpoint** | `/api_new_ai` |
| **Auth** | Nahi |

**Request:**
```json
{
  "query": "DHA Phase 9 mein 1 kanal plot",
  "messages": [
    { "role": "user", "content": "DHA Phase 9 mein 1 kanal plot" },
    { "role": "assistant", "content": "Aapka budget kitna hai?" },
    { "role": "user", "content": "2 crore" }
  ]
}
```

**Response:**
```json
{
  "question": "Plot chahte hain ya constructed house?",
  "listings": [...],
  "message": "",
  "lead_info": {
    "name": "Ahmed Khan",
    "phone": "+92 300 1234567",
    "city": "Lahore",
    "budget_lac": 200,
    "notes": "Investment purpose"
  },
  "lead_id": "L1A2B3C4"
}
```

- `lead_info` — Gemini se extracted (name, phone, city, budget, notes)
- `lead_id` — Jab name+phone milne par backend DB mein lead create karta hai

---

## 7. Partner Panel APIs

**Kahan use:** Partner Dashboard `/partner`

### 7.1 Get My Leads

| | |
|--|--|
| **Method** | GET |
| **Endpoint** | `/api/partner/leads` |
| **Auth** | Partner token |

**Query Params:** `status`: `new` | `in_progress` | `site_visit` | `closed`

**Response (200):**
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
      "aiSummary": "...",
      "source": "AI Search",
      "createdAt": "2024-02-20T10:30:00Z"
    }
  ]
}
```

---

### 7.2 Accept Lead

| | |
|--|--|
| **Method** | POST |
| **Endpoint** | `/api/partner/leads/:id/accept` |
| **Auth** | Partner token |

**Response (200):**
```json
{
  "success": true,
  "lead": {
    "id": "L1",
    "status": "in_progress"
  }
}
```

---

### 7.3 Reject Lead

| | |
|--|--|
| **Method** | POST |
| **Endpoint** | `/api/partner/leads/:id/reject` |
| **Auth** | Partner token |

**Response (200):**
```json
{
  "success": true,
  "message": "Lead rejected"
}
```

---

### 7.4 Update Lead Status (Next Stage)

| | |
|--|--|
| **Method** | PATCH |
| **Endpoint** | `/api/partner/leads/:id` |
| **Auth** | Partner token |

**Request:**
```json
{
  "status": "in_progress"
}
```
Status: `new` | `in_progress` | `site_visit` | `closed`

**Response (200):**
```json
{
  "success": true,
  "lead": {
    "id": "L1",
    "status": "site_visit"
  }
}
```

---

## 8. Error Response Format

Sab APIs ke liye common format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

**Common HTTP Status:**
- `200` — Success
- `201` — Created
- `400` — Bad Request
- `401` — Unauthorized (invalid/missing token)
- `403` — Forbidden
- `404` — Not Found
- `500` — Server Error

---

## 9. Frontend Config Reference

Frontend `src/config.js` mein ye endpoints use hote hain:

```javascript
API_ENDPOINTS = {
  admin: {
    leads: '/api/admin/leads',
    leadReroute: (id) => `/api/admin/leads/${id}/reroute`,
    agents: '/api/admin/agents',
    agentById: (id) => `/api/admin/agents/${id}`,
    agentRouting: (id) => `/api/admin/agents/${id}/routing`,
    scraping: '/api/admin/scraping',
    scrapingById: (id) => `/api/admin/scraping/${id}`,
    geminiSettings: '/api/gemini',
    geminiTest: '/api/gemini/test',
    geminiReset: '/api/gemini/reset',
  },
  auth: {
    adminLogin: '/api/auth/admin/login',
    partnerLogin: '/api/auth/partner/login',
  },
  partner: {
    leads: '/api/partner/leads',
    leadAccept: (id) => `/api/partner/leads/${id}/accept`,
    leadReject: (id) => `/api/partner/leads/${id}/reject`,
    leadUpdate: (id) => `/api/partner/leads/${id}`,
  },
}
```

Base URL: `.env` mein `VITE_API_BASE_URL` (default: `http://127.0.0.1:8000`)

---

## 10. Postman Collections

- Admin APIs: `docs/LPG_Admin_API.postman_collection.json`
- Partner APIs: `docs/LPG_Partner_Panel_API.postman_collection.json`

Pehle Login chalao → token auto-save → phir baaki APIs.

---

*Lahore Property Guide — Complete API Spec for New Backend*
