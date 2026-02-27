# Lahore Property Guide — Admin Panel API Documentation

Admin side ke liye zaroori APIs. Backend banate waqt in formats ko follow karein.

**Base URL:** `http://127.0.0.1:8000` (ya apna production URL)

**Headers (jahan auth chahiye):**
```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## 1. Login

### 1.1 Admin Login
**Endpoint:** `POST /api/auth/admin/login`

**Request:**
```json
{
  "email": "admin@lpg.com",
  "password": "your_password"
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
{
  "error": "Invalid credentials"
}
```

---

### 1.2 Partner Login (Agent Login)
**Endpoint:** `POST /api/auth/partner/login`

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
    "email": "ahmed@eliteproperties.com"
  }
}
```

**Note:** Ye wohi agents hain jo Admin ne create kiye. Inhi credentials se Partner Panel (`/partner`) mein login karte hain.

---

## 2. Agents (Partners) — CRUD

### 2.1 List All Agents
**Endpoint:** `GET /api/admin/agents`

**Headers:** `Authorization: Bearer <token>`

**Query Params (optional):**
- `status`: `active|suspended` — filter by status
- `search`: string — search in agent/agency name

**Response (200):**
```json
{
  "agents": [
    {
      "id": "A1",
      "agentName": "Ahmed Khan",
      "agencyName": "Elite Properties",
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

### 2.2 Create Agent (Add)
**Endpoint:** `POST /api/admin/agents`

**Headers:** `Authorization: Bearer <token>`

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
| email | string | Yes | Partner Panel login ke liye (unique) |
| password | string | Yes (create) | Min 6 chars — Partner login ke liye |
| phone | string | Yes | WhatsApp / contact number |
| specialization | string | No | Areas e.g. "DHA Phase 9, Gulberg" |
| status | string | No | `active` or `suspended` (default: active) |

**Note:** Ye agent = partner. Inhi credentials se wo `/partner` panel mein login karega.

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

### 2.3 Update Agent (Edit)
**Endpoint:** `PATCH /api/admin/agents/:id`

**Headers:** `Authorization: Bearer <token>`

**Request (sirf jo fields change karni hain):**
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
Password optional — change karna ho to bhejo, warna purana rahega.

**Response (200):**
```json
{
  "success": true,
  "agent": {
    "id": "A1",
    "agentName": "Ahmed Khan",
    "agencyName": "Elite Properties",
    "phone": "+92 300 1234567",
    "specialization": "DHA Phase 9, Gulberg III, Bahria",
    "status": "active",
    "routingEnabled": true
  }
}
```

---

### 2.4 Delete Agent
**Endpoint:** `DELETE /api/admin/agents/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Agent deleted"
}
```

**Error (404):**
```json
{
  "error": "Agent not found"
}
```

---

### 2.5 Toggle Lead Routing
**Endpoint:** `PATCH /api/admin/agents/:id/routing`

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "active": true
}
```

| Field | Type | Description |
|-------|------|-------------|
| active | boolean | `true` = leads is agent ko jayengi, `false` = band |

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

## 3. Leads — Command Center

### 3.1 List All Leads
**Endpoint:** `GET /api/admin/leads`

**Headers:** `Authorization: Bearer <token>`

**Query Params (optional):**
- `status`: `new|contacted|site_visit|closed` — filter by status
- `agentId`: string — filter by assigned agent
- `from`: ISO8601 date — date range start
- `to`: ISO8601 date — date range end

**Response (200):**
```json
{
  "leads": [
    {
      "id": "L1",
      "userName": "Fatima Noor",
      "propertyInterest": "DHA Phase 9, 1 kanal",
      "propertyId": "P101",
      "propertyLink": "/property/101",
      "budget": "2.5 Cr",
      "leadScore": 92,
      "assignedAgent": "Ahmed Khan",
      "assignedAgentId": "A1",
      "status": "new",
      "createdAt": "2024-02-20T10:30:00Z"
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| id | string | Lead ID |
| userName | string | User ka naam |
| propertyInterest | string | Property interest (e.g. "DHA Phase 9, 1 kanal") |
| propertyId | string | Property ID (link ke liye) |
| propertyLink | string | Optional — frontend property URL |
| budget | string | User ka budget |
| leadScore | number | AI generated score 0-100 |
| assignedAgent | string | Assigned agent ka naam |
| assignedAgentId | string | Assigned agent ID |
| status | string | `new`, `contacted`, `site_visit`, `closed` |

---

### 3.2 Manual Re-route Lead
**Endpoint:** `POST /api/admin/leads/:id/reroute`

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "agentId": "A2"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| agentId | string | Yes | Naya agent ID jisko lead assign karni hai |

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

**Error (404):**
```json
{
  "error": "Lead or agent not found"
}
```

---

## 4. Scraping Status

### 4.1 List Scraping Sources
**Endpoint:** `GET /api/admin/scraping`

**Headers:** `Authorization: Bearer <token>`

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
      "status": "active",
      "lastRun": "2024-02-20T10:25:00Z",
      "listings": 89
    },
    {
      "id": "S3",
      "source": "Gulberg",
      "status": "paused",
      "lastRun": "2024-02-20T09:30:00Z",
      "listings": 56
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| source | string | Scraping source name (area) |
| status | string | `active` or `paused` |
| lastRun | string | ISO8601 — last scrape time |
| listings | number | Total listings scraped |

---

### 4.2 Toggle Scraping (Pause/Resume)
**Endpoint:** `PATCH /api/admin/scraping/:id`

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "status": "active"
}
```

| Field | Type | Description |
|-------|------|-------------|
| status | string | `active` or `paused` |

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

## 5. Summary Table

| Feature | Method | Endpoint |
|---------|--------|----------|
| **Login** | | |
| Admin Login | POST | `/api/auth/admin/login` |
| Partner Login | POST | `/api/auth/partner/login` |
| **Agents** | | |
| List Agents | GET | `/api/admin/agents` |
| Create Agent | POST | `/api/admin/agents` |
| Update Agent | PATCH | `/api/admin/agents/:id` |
| Delete Agent | DELETE | `/api/admin/agents/:id` |
| Toggle Routing | PATCH | `/api/admin/agents/:id/routing` |
| **Leads** | | |
| List Leads | GET | `/api/admin/leads` |
| Re-route Lead | POST | `/api/admin/leads/:id/reroute` |
| **Scraping** | | |
| List Sources | GET | `/api/admin/scraping` |
| Toggle Scraping | PATCH | `/api/admin/scraping/:id` |

---

## 6. Error Response Format

Sab APIs ke liye common error format:

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
- `400` — Bad Request (invalid data)
- `401` — Unauthorized (invalid/missing token)
- `403` — Forbidden (no permission)
- `404` — Not Found
- `500` — Server Error

---

---

## 7. AI Search Conversation (Customer Listings Page)

**Endpoint:** `POST /api/ai-search-conversation`

**Request:**
```json
{
  "initial_prompt": "DHA Phase 9 mein 1 kanal plot",
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
- `lead_info` — Gemini conversation se extract (name, phone, city, budget, notes)
- `lead_id` — Jab name+phone milne par backend DB mein lead create karta hai, ye id return hoti hai. Warna `null`

Gemini prompts: `docs/PYTHON_GEMINI_PROMPTS.md`

---

## 8. Gemini Settings (Admin)

**Detail:** `docs/GEMINI_SETTINGS_API.md`

| Action | Method | Endpoint |
|--------|--------|----------|
| Fetch settings | GET | `/api/gemini` |
| Save settings | PUT | `/api/gemini` |
| Test connection | POST | `/api/gemini/test` |
| Reset instructions | POST | `/api/gemini/reset` |

---

## 10. Postman Collection (Admin)

Import karein: `docs/LPG_Admin_API.postman_collection.json`

1. Postman open karo → Import → File select karo
2. Pehle **Admin Login** chalao — token auto-save ho jayega
3. Baaki APIs token use karengi

---

*Lahore Property Guide — Admin API Documentation*
