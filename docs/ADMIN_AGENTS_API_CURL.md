# Admin Agents Page — APIs & cURL

`/admin/agents` page ye APIs use karta hai:

---

## 1. Get All Agents (List)

**API:** `GET /api/admin/agents`

**Headers:** `Authorization: Bearer <admin_token>` (Admin login ke baad token)

```bash
# Pehle Admin Login karo, token copy karo, phir:
curl -X GET "http://127.0.0.1:8000/api/admin/agents" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
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
      "routingEnabled": true
    }
  ]
}
```

---

## 2. Create Agent

**API:** `POST /api/admin/agents`

```bash
curl -X POST "http://127.0.0.1:8000/api/admin/agents" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "agentName": "Ahmed Khan",
    "agencyName": "Elite Properties",
    "email": "ahmed@eliteproperties.com",
    "password": "secret123",
    "phone": "+92 300 1234567",
    "specialization": "DHA Phase 9, Gulberg III",
    "status": "active"
  }'
```

---

## 3. Update Agent

**API:** `PATCH /api/admin/agents/:id`

```bash
curl -X PATCH "http://127.0.0.1:8000/api/admin/agents/A1" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "agentName": "Ahmed Khan",
    "agencyName": "Elite Properties",
    "email": "ahmed@eliteproperties.com",
    "phone": "+92 300 1234567",
    "specialization": "DHA Phase 9, Gulberg III",
    "status": "active"
  }'
```

---

## 4. Delete Agent

**API:** `DELETE /api/admin/agents/:id`

```bash
curl -X DELETE "http://127.0.0.1:8000/api/admin/agents/A1" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 5. Toggle Agent Routing

**API:** `PATCH /api/admin/agents/:id/routing`

```bash
curl -X PATCH "http://127.0.0.1:8000/api/admin/agents/A1/routing" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"active": true}'
```

---

## Kyun 3 agents dikh rahe hain jab DB mein 1 hai?

**Reason:** API **fail** hone par frontend **MOCK_AGENTS** use karta hai (3 dummy agents).

`AdminAgents.jsx` mein:
```javascript
try {
  const data = await getAgents()
  setAgents(data.agents || [])
} catch {
  setAgents(MOCK_AGENTS)  // ← API fail = 3 mock agents dikhenge!
}
```

**Possible causes:**
1. Backend (port 8000) chal nahi raha
2. `/api/admin/agents` endpoint backend mein implement nahi hai
3. Admin token missing / invalid (401)
4. CORS / proxy issue

**Fix:** Backend chalao, agents API implement karo. Agar API sahi chal rahi hai to sirf DB ke agents dikhenge.
