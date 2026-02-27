# Gemini Settings API — Admin Panel

Admin panel mein Gemini AI ke liye API key, instructions aur settings save/fetch karne ke APIs.

**Base URL:** `http://127.0.0.1:8000` (ya apna production URL)

**Headers (auth required):**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

---

## 1. Get Gemini Settings

**Endpoint:** `GET /api/gemini`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "apiKey": "AIza...",
  "apiKeyMasked": "AIza***xyz",
  "systemInstructions": "Tu Lahore Property Guide ka AI assistant ho...",
  "conversationInstructions": "Ek ek question poocho, Roman Urdu use karo...",
  "model": "gemini-1.5-flash",
  "updatedAt": "2024-02-24T10:30:00Z"
}
```

| Field | Type | Description |
|-------|------|--------------|
| apiKey | string \| null | Full API key (agar backend allow kare). Warna null |
| apiKeyMasked | string | Masked key (e.g. AIza***xyz) — frontend display ke liye |
| systemInstructions | string | Main system prompt — AI ka role/behavior |
| conversationInstructions | string | Conversation flow instructions |
| model | string | Model name (gemini-1.5-flash, gemini-1.5-pro) |
| updatedAt | string | Last update timestamp |

**Error (401):** `{ "error": "Unauthorized" }`

---

## 2. Save / Update Gemini Settings

**Endpoint:** `PUT /api/gemini`

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "apiKey": "AIzaSy...",
  "systemInstructions": "Tu Lahore Property Guide ka AI assistant ho. Tumhare do main kaam hain:\n1. PROPERTY REQUIREMENTS...",
  "conversationInstructions": "Ek ek question poocho. Roman Urdu aur English dono use kar sakte ho.",
  "model": "gemini-1.5-flash"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| apiKey | string | No | Naya API key. Agar empty/null to purana key retain |
| systemInstructions | string | No | System prompt — AI ko kaise behave karna hai |
| conversationInstructions | string | No | Conversation rules |
| model | string | No | gemini-1.5-flash \| gemini-1.5-pro |

**Response (200):**
```json
{
  "success": true,
  "message": "Settings saved",
  "updatedAt": "2024-02-24T10:35:00Z"
}
```

**Error (400):** `{ "error": "Invalid API key format" }`

---

## 3. Test Gemini Connection (Optional)

**Endpoint:** `POST /api/gemini/test`

**Headers:** `Authorization: Bearer <token>`

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

**Error (400):**
```json
{
  "success": false,
  "error": "Invalid API key"
}
```

---

## 4. Reset to Default Instructions (Optional)

**Endpoint:** `POST /api/gemini/reset`

**Headers:** `Authorization: Bearer <token>`

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

## Quick Reference

| Action | Method | Endpoint |
|--------|--------|----------|
| Fetch settings | GET | `/api/gemini` |
| Save settings | PUT | `/api/gemini` |
| Test connection | POST | `/api/gemini/test` |
| Reset instructions | POST | `/api/gemini/reset` |

---

## Security Notes

- API key ko DB mein **encrypted** store karo
- Fetch response mein full key mat bhejo — sirf `apiKeyMasked` bhejo
- Admin auth zaroori — sirf logged-in admin access kar sake

---

*Lahore Property Guide — Gemini Settings API*
