# Lead Expire Time — Integrated APIs Summary

Yeh saari APIs frontend mein integrate ho chuki hain. Quick reference:

---

## 1. Auth (Pehle run karo)

| API | Method | Endpoint | Frontend Use |
|-----|--------|----------|--------------|
| Admin Login | POST | `/api/auth/admin/login` | `adminLogin(email, password)` — `adminApi.js` |
| Partner Login | POST | `/api/auth/partner/login` | `partnerLogin(email, password)` — `partnerApi.js` |

---

## 2. Admin — Settings

| API | Method | Endpoint | Frontend Use |
|-----|--------|----------|--------------|
| Get Admin Settings | GET | `/api/admin/settings` | `getAdminSettings()` — `adminApi.js` |
| Save Admin Settings | PUT | `/api/admin/settings` | `saveAdminSettings({ leadExpireMinutes })` — `adminApi.js` |

**Response (Get):** `{ leadExpireMinutes: 5, updatedAt: "..." }`  
**Request (Save):** `{ leadExpireMinutes: 5 }` (1–60)

**UI:** `/admin/settings` — AdminSettings.jsx

---

## 3. Partner — Leads (Modified)

| API | Method | Endpoint | Frontend Use |
|-----|--------|----------|--------------|
| Get Partner Leads | GET | `/api/partner/leads` | `getPartnerLeads({ status? })` — `partnerApi.js` |
| Accept Lead | POST | `/api/partner/leads/:id/accept` | `acceptLead(leadId)` — `partnerApi.js` |
| Reject Lead | POST | `/api/partner/leads/:id/reject` | `rejectLead(leadId)` — `partnerApi.js` |

**Leads response:** Har lead ke saath `expiresAt`, `assignedAt`.  
**Accept:** Expired hone par → **410 Gone** — frontend list refresh karta hai.

**UI:** `/partner` — PartnerDashboard.jsx (timer, accept/reject, 410 handling)

---

## Files Changed / Added

| File | Change |
|------|--------|
| `src/config.js` | `admin.settings: '/api/admin/settings'` |
| `src/api/adminApi.js` | `getAdminSettings()`, `saveAdminSettings()` |
| `src/api/partnerApi.js` | 410 / LEAD_EXPIRED ko error pe attach (status, code) |
| `src/pages/admin/AdminSettings.jsx` | **NEW** — Lead expire time form |
| `src/pages/admin/AdminLayout.jsx` | Settings nav item |
| `src/App.jsx` | `/admin/settings` route |
| `src/pages/PartnerDashboard.jsx` | 410 pe refetch, timer from `expiresAt`/`assignedAt` |

---

## Postman Collection

`docs/Lead_Expire_Time_API.postman_collection.json`

Import karke test karo — Auth run karo pehle, phir Settings / Leads.
