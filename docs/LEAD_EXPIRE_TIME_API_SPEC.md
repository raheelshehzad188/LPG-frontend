# Lead Expire Time — API Specification

**Feature:** Admin lead expiry time set karta hai (minutes mein). Agar partner us time ke andar lead accept nahi karta, lead unlink ho jati hai (kisi ko assign nahi rahti).

**Example:** 
- Lead 12:05 par Agent A1 ko assign hui
- Admin ne **5 minutes** expiry set kiya
- Agar 12:10 tak Agent A1 accept nahi karta → Lead unlink (assigned_agent_id = null)
- Lead phir se assign ho sakti hai (Admin reroute ya auto-routing se)

---

## Quick Index — APIs Chahiye

| # | Feature | Method | Endpoint | Auth |
|---|---------|--------|----------|------|
| 1 | Get Admin Settings | GET | `/api/admin/settings` | Admin |
| 2 | Save Admin Settings | PUT | `/api/admin/settings` | Admin |
| 3 | **(Modified)** Get Partner Leads | GET | `/api/partner/leads` | Partner |
| 4 | **(Modified)** Accept Lead | POST | `/api/partner/leads/:id/accept` | Partner |
| 5 | **(Backend)** Unlink Expired Leads | — | Cron/on-request | — |

---

## 1. Admin — Get Settings

**Kahan use:** Admin Panel — Settings page (naya page `/admin/settings` ya Gemini ke saath "System Settings" section)

| | |
|--|--|
| **Method** | GET |
| **Endpoint** | `/api/admin/settings` |
| **Auth** | Admin token |

**Response (200):**
```json
{
  "leadExpireMinutes": 5,
  "updatedAt": "2024-02-28T10:30:00Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| leadExpireMinutes | number | Minutes — lead assign hone ke baad accept karne ka time (default: 5) |
| updatedAt | string | ISO8601 — last update |

**Default:** Agar koi setting nahi hai to `leadExpireMinutes: 5` return karo.

---

## 2. Admin — Save Settings

**Kahan use:** Admin Panel — Settings page form submit

| | |
|--|--|
| **Method** | PUT |
| **Endpoint** | `/api/admin/settings` |
| **Auth** | Admin token |

**Request:**
```json
{
  "leadExpireMinutes": 5
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| leadExpireMinutes | number | Yes | 1–60 (minutes). Validation: min 1, max 60 |

**Response (200):**
```json
{
  "success": true,
  "settings": {
    "leadExpireMinutes": 5,
    "updatedAt": "2024-02-28T10:35:00Z"
  }
}
```

**Error 400 (Validation):**
```json
{
  "error": "leadExpireMinutes must be between 1 and 60"
}
```

**Storage:** JSON file (e.g. `admin_settings.json`) ya DB table `settings` (key-value).

---

## 3. Database / Model Changes

Lead model mein ye field add karo:

| Field | Type | Description |
|-------|------|-------------|
| assigned_at | datetime | Jab lead agent ko assign hui (null = unassigned) |

**Logic:**
- Jab lead kisi agent ko assign hoti hai → `assigned_at = now()`
- Jab lead unlink hoti hai (expire/reject/reroute) → `assigned_at = null`, `assigned_agent_id = null`
- `expiresAt` (frontend ke liye) = `assigned_at + leadExpireMinutes` (computed)

---

## 4. Modified — Get Partner Leads

**Endpoint:** `GET /api/partner/leads`  
**Auth:** Partner token

**Backend Logic (add karo):**

1. **Pehle expired leads unlink karo:**
   - Settings se `leadExpireMinutes` lo
   - Sab leads jinka `status = 'new'` aur `assigned_agent_id` set hai
   - Check: `now() > assigned_at + leadExpireMinutes`
   - Agar haan → `assigned_agent_id = null`, `assigned_at = null` (unlink)

2. **Phir list return karo:**
   - Sirf woh leads jinki `assigned_agent_id` = logged-in agent
   - Expired (unlinked) leads list mein nahi aayengi

**Response mein har new lead ke saath `expiresAt` bhejo:**
```json
{
  "leads": [
    {
      "id": "L1",
      "name": "Fatima Noor",
      "phone": "+92 300 1234567",
      "status": "new",
      "createdAt": "2024-02-28T12:05:00Z",
      "expiresAt": "2024-02-28T12:10:00Z",
      "assignedAt": "2024-02-28T12:05:00Z"
    }
  ]
}
```

| New Field | Type | Description |
|-----------|------|-------------|
| expiresAt | string | ISO8601 — is time ke baad lead unlink ho jayegi |
| assignedAt | string | (optional) Jab assign hui |

---

## 5. Modified — Accept Lead

**Endpoint:** `POST /api/partner/leads/:id/accept`  
**Auth:** Partner token

**Backend Logic (add karo):**

1. Lead fetch karo, check: `assigned_agent_id` = logged-in agent
2. **Expiry check:** Agar `status = 'new'` aur `now() > assigned_at + leadExpireMinutes`:
   - Lead unlink karo (`assigned_agent_id = null`, `assigned_at = null`)
   - **Response 410 Gone:**
   ```json
   {
     "error": "Lead expired. It has been unlinked and is no longer assigned to you.",
     "code": "LEAD_EXPIRED"
   }
   ```
3. Agar expired nahi → normal accept: `status = 'in_progress'`

**Success 200:** (pehle jaisa)
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

## 6. Unlink Logic — Kab Kab Unlink

| Event | Action |
|-------|--------|
| Partner reject karta hai | Unlink (pool mein chali jati hai) |
| Partner 5 min mein accept nahi karta | Unlink (assigned_agent_id = null) |
| Admin reroute karta hai | Purana agent se unlink, naye ko assign |

**Cron vs Lazy:**
- **Lazy (recommended):** `GET /api/partner/leads` aur `POST .../accept` call par check karo, expired ko unlink karo. Simple, extra cron nahi chahiye.
- **Cron (optional):** Har 1 min par cron job chalaye jo expired leads unlink kare.

---

## 7. Frontend Config (Add)

```javascript
// src/config.js — API_ENDPOINTS.admin mein add karo
admin: {
  // ... existing
  settings: '/api/admin/settings',  // NEW
}
```

---

## 8. Admin Panel UI (Frontend)

**Naya page:** `/admin/settings` ya existing layout mein "Settings" nav item.

**Form:**
- Label: "Lead Expire Time (minutes)"
- Input: number, min 1, max 60, default 5
- Button: Save
- Message: "Agar partner X minutes ke andar lead accept nahi karta, lead unlink ho jayegi aur dobara assign ho sakti hai."

**Sidebar:** AdminLayout mein Settings icon + link add karo.

---

## 9. Lead Assignment Flow (Summary)

```
[New Lead] 
    → Routing assigns to Agent A1 
    → assigned_agent_id = A1, assigned_at = now()
    
[Agent A1 sees lead in GET /api/partner/leads]
    → expiresAt = assigned_at + leadExpireMinutes
    
[Case A — Accept within time]
    → POST /api/partner/leads/L1/accept 
    → status = in_progress ✓

[Case B — No accept, time passes]
    → GET /api/partner/leads (next call) 
    → Backend: now() > expiresAt → unlink
    → Lead A1 ki list se gayab
    → Admin/reroute can assign to another agent
```

---

## 10. cURL Examples (Testing)

```bash
# Get settings (Admin token)
curl -X GET http://127.0.0.1:8000/api/admin/settings \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Save settings
curl -X PUT http://127.0.0.1:8000/api/admin/settings \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"leadExpireMinutes": 5}'

# Partner Get Leads (expired auto-unlink)
curl -X GET "http://127.0.0.1:8000/api/partner/leads" \
  -H "Authorization: Bearer PARTNER_TOKEN"

# Partner Accept (agar expired → 410)
curl -X POST http://127.0.0.1:8000/api/partner/leads/L1/accept \
  -H "Authorization: Bearer PARTNER_TOKEN"
```

---

## 11. Postman Collection Updates

**Admin Collection mein add:**
- GET `{{baseUrl}}/api/admin/settings`
- PUT `{{baseUrl}}/api/admin/settings` with body `{"leadExpireMinutes": 5}`

**Partner Collection:**
- Accept Lead description update: "5 min (ya admin setting) ke andar accept karna zaroori. Expired pe 410"

---

*Lahore Property Guide — Lead Expire Time API Spec*
