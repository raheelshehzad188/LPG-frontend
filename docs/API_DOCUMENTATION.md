# Lahore Property Guide — API Documentation

Ye document sab required APIs list karta hai jo Customer Front-End, B2B Partner Panel, aur Master Admin Panel ke liye chahiye honge.

---

## 1. Customer Front-End (AI Guide Interface)

### 1.1 AI Search (Conversational Search)
**Endpoint:** `POST /api/ai-search`

**Request:**
```json
{
  "query": "DHA Phase 9 mein 1 kanal plot, budget 2 crore",
  "variables": {}
}
```

**Response:**
```json
{
  "listings": [
    {
      "id": "string",
      "title": "string",
      "location": "string",
      "price": "string",
      "priceLac": number,
      "image": "string",
      "aiScore": number,
      "aiExplanation": "string",
      "type": "house|plot|apartment",
      "size": "string"
    }
  ]
}
```

**Notes:** Roman Urdu / English dono support. AI score 0-100. `aiExplanation` optional — agar na ho to frontend default message use karega.

---

### 1.2 AI Property Match Explanation
**Endpoint:** `GET /api/property/:id/ai-explanation`

**Query Params:** `?userQuery=...` (optional — user ka search prompt)

**Response:**
```json
{
  "explanation": "Ye plot aapki investment requirements aur budget par perfect poora utarta hai."

}
```

---

### 1.3 ROI / Investment Prediction (5-Year Graph)
**Endpoint:** `POST /api/roi-prediction`

**Request:**
```json
{
  "budget": 5000000,
  "propertyId": "string",
  "years": 5
}
```

**Response:**
```json
{
  "predictions": [
    { "year": 0, "value": 5000000 },
    { "year": 1, "value": 5600000 },
    { "year": 2, "value": 6272000 },
    ...
  ],
  "growthRate": 0.12,
  "source": "gemini_market_data"
}
```

**Notes:** Gemini market data use karke predicted growth. `growthRate` optional.

---

## 2. B2B Partner Panel (Agency Dashboard)

### 2.1 Get Leads (Kanban Pipeline)
**Endpoint:** `GET /api/partner/leads`

**Headers:** `Authorization: Bearer <token>`

**Query Params:**
- `status`: `new|in_progress|site_visit|closed` (optional filter)
- `agencyId`: string (required — backend user se)

**Response:**
```json
{
  "leads": [
    {
      "id": "string",
      "name": "string",
      "phone": "string",
      "source": "AI Search",
      "leadScore": number,
      "status": "new|in_progress|site_visit|closed",
      "aiSummary": "string",
      "propertyInterest": "string",
      "createdAt": "ISO8601",
      "expiresAt": "ISO8601",
      "propertyId": "string"
    }
  ]
}
```

**Notes:** `expiresAt` sirf `new` status ke leads ke liye — 5 minute from `createdAt`.

---

### 2.2 Accept Lead
**Endpoint:** `POST /api/partner/leads/:id/accept`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "lead": { ... }
}
```

**Error (400):** 5 minute ke andar accept nahi kiya — lead expired.

---

### 2.3 Reject Lead
**Endpoint:** `POST /api/partner/leads/:id/reject`

**Headers:** `Authorization: Bearer <token>`

**Request (optional):**
```json
{
  "reason": "string"
}
```

**Response:**
```json
{
  "success": true
}
```

**Notes:** Reject karne par lead next agency ko transfer ho jata hai.

---

### 2.4 Move Lead (Update Status)
**Endpoint:** `PATCH /api/partner/leads/:id`

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "status": "in_progress|site_visit|closed"
}
```

**Response:**
```json
{
  "success": true,
  "lead": { ... }
}
```

---

### 2.5 Real-time Leads (WebSocket)
**Endpoint:** `wss://api.example.com/partner/leads/stream`

**Headers:** `Authorization: Bearer <token>`

**Events:**
- `new_lead` — Naya lead aaya

**Notes:** Agar 5 minute timer real-time hai to WebSocket use karein.

---

## 3. Master Admin Panel

### 3.1 Traffic Routing Override

#### 3.1.1 List Agencies
**Endpoint:** `GET /api/admin/agencies`

**Headers:** `Authorization: Bearer <admin_token>`

**Response:**
```json
{
  "agencies": [
    {
      "id": "string",
      "name": "string",
      "leadsActive": boolean,
      "commissionPaid": boolean,
      "commissionPending": number
    }
  ]
}
```

---

#### 3.1.2 Toggle Agency Leads
**Endpoint:** `POST /api/admin/agencies/:id/toggle-leads`

**Headers:** `Authorization: Bearer <admin_token>`

**Request:**
```json
{
  "active": boolean
}
```

**Response:**
```json
{
  "success": true,
  "agency": { ... }
}
```

---

#### 3.1.3 Redirect Traffic to Agency
**Endpoint:** `POST /api/admin/traffic/redirect`

**Headers:** `Authorization: Bearer <admin_token>`

**Request:**
```json
{
  "fromAgencyId": "string",
  "toAgencyId": "string",
  "area": "DHA Phase 9"
}
```

---

### 3.2 Revenue Tracker

#### 3.2.1 Subscription Income
**Endpoint:** `GET /api/admin/revenue/subscription`

**Response:**
```json
{
  "total": number,
  "period": "month",
  "breakdown": [
    { "agentId": "string", "amount": number }
  ]
}
```

---

#### 3.2.2 Commission Pipeline
**Endpoint:** `GET /api/admin/revenue/commission`

**Response:**
```json
{
  "total": number,
  "deals": [
    {
      "id": "string",
      "agencyId": "string",
      "amount": number,
      "status": "pending|closed"
    }
  ]
}
```

---

### 3.3 Ad Manager

#### 3.3.1 List Ad Placements
**Endpoint:** `GET /api/admin/ads`

**Response:**
```json
{
  "placements": [
    {
      "id": "string",
      "page": "DHA Phase 9",
      "banner": "Banner A",
      "active": boolean,
      "imageUrl": "string"
    }
  ]
}
```

---

#### 3.3.2 Update Ad Placement
**Endpoint:** `PATCH /api/admin/ads/:id`

**Request:**
```json
{
  "banner": "string",
  "active": boolean,
  "imageUrl": "string"
}
```

---

### 3.4 AI Performance Monitor

#### 3.4.1 AI Stats
**Endpoint:** `GET /api/admin/ai/stats`

**Query Params:**
- `from`: ISO8601 date
- `to`: ISO8601 date

**Response:**
```json
{
  "totalLeads": number,
  "conversionRate": number,
  "topPerformingArea": "string",
  "topPerformingPhases": [
    { "area": "string", "leads": number, "conversions": number }
  ],
  "avgLeadScore": number
}
```

---

## 4. Authentication

### 4.1 Partner Login
**Endpoint:** `POST /api/auth/partner/login`

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "string",
  "agency": { ... }
}
```

---

### 4.2 Admin Login
**Endpoint:** `POST /api/auth/admin/login`

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "string"
}
```

---

## 5. Summary Table

| Panel | API | Method | Endpoint |
|-------|-----|--------|----------|
| Customer | AI Search | POST | `/api/ai-search` |
| Customer | AI Explanation | GET | `/api/property/:id/ai-explanation` |
| Customer | ROI Prediction | POST | `/api/roi-prediction` |
| Partner | Get Leads | GET | `/api/partner/leads` |
| Partner | Accept Lead | POST | `/api/partner/leads/:id/accept` |
| Partner | Reject Lead | POST | `/api/partner/leads/:id/reject` |
| Partner | Move Lead | PATCH | `/api/partner/leads/:id` |
| Admin | List Agencies | GET | `/api/admin/agencies` |
| Admin | Toggle Agency | POST | `/api/admin/agencies/:id/toggle-leads` |
| Admin | Redirect Traffic | POST | `/api/admin/traffic/redirect` |
| Admin | Subscription Revenue | GET | `/api/admin/revenue/subscription` |
| Admin | Commission Revenue | GET | `/api/admin/revenue/commission` |
| Admin | List Ads | GET | `/api/admin/ads` |
| Admin | Update Ad | PATCH | `/api/admin/ads/:id` |
| Admin | AI Stats | GET | `/api/admin/ai/stats` |
| Auth | Partner Login | POST | `/api/auth/partner/login` |
| Auth | Admin Login | POST | `/api/auth/admin/login` |

---

*Document generated for Lahore Property Guide.*  
*Backend implement karte waqt in APIs ko follow karein.*
