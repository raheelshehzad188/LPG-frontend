# Lahore Property Guide — Python Backend API Specification

Ye document sab APIs ki detail deta hai jo Python project mein implement karne hain. Admin agent add karta hai (email + password), agent login karke apni leads dekhta hai aur next stage mein move karta hai.

**Base URL:** `http://127.0.0.1:8000`

---

## Flow Summary

1. **Admin** → Agent create karta hai (email, password)
2. **Agent** → Same email/password se login (`/api/auth/partner/login`)
3. **Agent** → Apni leads dekhta hai (`/api/partner/leads`)
4. **Agent** → Lead accept/reject karta hai, ya next stage mein move karta hai

---

## 1. Auth APIs

### 1.1 Admin Login
```
POST /api/auth/admin/login
Content-Type: application/json
```
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
**Error (401):** `{"error": "Invalid credentials"}`

---

### 1.2 Partner / Agent Login
```
POST /api/auth/partner/login
Content-Type: application/json
```
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
**Note:** Ye wohi credentials hain jo Admin ne Create Agent ke waqt diye. Agents table mein email + hashed password store karo.

**Error (401):** `{"error": "Invalid credentials"}`

---

## 2. Admin — Agents CRUD

### 2.1 Create Agent (Add)
```
POST /api/admin/agents
Authorization: Bearer <admin_token>
Content-Type: application/json
```
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
| email | string | Yes | Login ke liye (unique) |
| password | string | Yes | Min 6 chars — Partner login ke liye |
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
    "email": "ahmed@eliteproperties.com",
    "phone": "+92 300 1234567",
    "specialization": "DHA Phase 9, Gulberg III",
    "status": "active",
    "routingEnabled": true
  }
}
```
**DB:** `agents` table — id, agentName, agencyName, email, password_hash, phone, specialization, status, routing_enabled, created_at

---

### 2.2 List Agents
```
GET /api/admin/agents?status=active&search=
Authorization: Bearer <admin_token>
```
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

### 2.3 Update Agent
```
PATCH /api/admin/agents/:id
Authorization: Bearer <admin_token>
Content-Type: application/json
```
**Request:** (partial — sirf jo change karna hai)
```json
{
  "agentName": "Ahmed Khan",
  "password": "newpass123",
  "status": "active"
}
```
Password optional — bhejo to update, warna purana rahe.

---

### 2.4 Delete Agent
```
DELETE /api/admin/agents/:id
Authorization: Bearer <admin_token>
```
**Response (200):** `{"success": true, "message": "Agent deleted"}`

---

### 2.5 Toggle Lead Routing
```
PATCH /api/admin/agents/:id/routing
Authorization: Bearer <admin_token>
Content-Type: application/json
```
**Request:**
```json
{"active": true}
```
`active: true` = naye leads is agent ko assign hongi. `false` = band.

---

## 3. Admin — Leads

### 3.1 List All Leads
```
GET /api/admin/leads?status=new&agentId=A1&from=2024-01-01&to=2024-12-31
Authorization: Bearer <admin_token>
```
**Response (200):**
```json
{
  "leads": [
    {
      "id": "L1",
      "userName": "Fatima Noor",
      "phone": "+92 300 1234567",
      "propertyInterest": "DHA Phase 9, 1 kanal",
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

---

### 3.2 Re-route Lead (Admin)
```
POST /api/admin/leads/:id/reroute
Authorization: Bearer <admin_token>
Content-Type: application/json
```
**Request:**
```json
{"agentId": "A2"}
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

## 4. Partner / Agent — Leads (Agent Panel)

### 4.1 Get My Leads
```
GET /api/partner/leads?status=new
Authorization: Bearer <partner_token>
```
**Note:** Token se agent id nikalo. Sirf woh leads return karo jinki `assigned_agent_id` = logged-in agent.

**Query Params:**
- `status`: `new` \| `in_progress` \| `site_visit` \| `closed` (optional filter)

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
      "aiSummary": "User DHA 9 mein interested. Budget 2-2.5 Cr.",
      "source": "AI Search",
      "createdAt": "2024-02-20T10:30:00Z",
      "expiresAt": "2024-02-20T10:35:00Z"
    }
  ]
}
```
**expiresAt:** New leads ke liye 5 min timer — isse pehle accept karna zaroori (optional business rule).

---

### 4.2 Accept Lead
```
POST /api/partner/leads/:id/accept
Authorization: Bearer <partner_token>
```
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
**Logic:** Lead ki `assigned_agent_id` = logged-in agent honi chahiye. Status: `new` → `in_progress`.

---

### 4.3 Reject Lead
```
POST /api/partner/leads/:id/reject
Authorization: Bearer <partner_token>
```
**Response (200):**
```json
{
  "success": true,
  "message": "Lead rejected"
}
```
**Logic:** Lead ko re-route karo (next available agent ko assign) ya pool mein daalo. Ya lead delete/reject flag.

---

### 4.4 Move Lead to Next Stage
```
PATCH /api/partner/leads/:id
Authorization: Bearer <partner_token>
Content-Type: application/json
```
**Request:**
```json
{
  "status": "in_progress"
}
```
**Status values:** `new` | `in_progress` | `site_visit` | `closed`

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
**Logic:** Agent sirf apni assigned leads update kar sakta hai.

---

## 5. Database Schema (Suggested)

### agents
| Column | Type | Description |
|--------|------|-------------|
| id | PK | A1, A2, ... |
| agent_name | string | |
| agency_name | string | |
| email | string | UNIQUE, login |
| password_hash | string | bcrypt/argon2 |
| phone | string | |
| specialization | string | |
| status | string | active, suspended |
| routing_enabled | bool | |
| created_at | datetime | |

### leads
| Column | Type | Description |
|--------|------|-------------|
| id | PK | L1, L2, ... |
| user_name | string | Customer naam |
| phone | string | |
| property_interest | string | |
| budget | string | |
| lead_score | int | 0-100 |
| ai_summary | text | |
| assigned_agent_id | FK | agents.id |
| status | string | new, in_progress, site_visit, closed |
| source | string | ai_search, etc. |
| created_at | datetime | |
| expires_at | datetime | Optional — new leads ke liye |

---

## 6. Quick Reference Table

| Feature | Method | Endpoint | Auth |
|---------|--------|----------|------|
| Admin Login | POST | `/api/auth/admin/login` | — |
| Partner Login | POST | `/api/auth/partner/login` | — |
| Create Agent | POST | `/api/admin/agents` | Admin |
| List Agents | GET | `/api/admin/agents` | Admin |
| Update Agent | PATCH | `/api/admin/agents/:id` | Admin |
| Delete Agent | DELETE | `/api/admin/agents/:id` | Admin |
| Toggle Routing | PATCH | `/api/admin/agents/:id/routing` | Admin |
| List Leads (Admin) | GET | `/api/admin/leads` | Admin |
| Re-route Lead | POST | `/api/admin/leads/:id/reroute` | Admin |
| **Get My Leads** | GET | `/api/partner/leads` | Partner |
| **Accept Lead** | POST | `/api/partner/leads/:id/accept` | Partner |
| **Reject Lead** | POST | `/api/partner/leads/:id/reject` | Partner |
| **Move Lead** | PATCH | `/api/partner/leads/:id` | Partner |

---

## 7. JWT Token

- Admin token: `sub` = admin id
- Partner token: `sub` = agent id (A1, A2, ...)
- Header: `Authorization: Bearer <token>`

---

*Lahore Property Guide — Python API Spec*
