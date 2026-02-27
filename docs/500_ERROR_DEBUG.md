# 500 Error — Debug Guide

**"Request failed with status code 500"** = Backend server crash / exception. Frontend sahi hai, problem backend pe hai.

---

## 1. Backend Logs Check Karo

**Python (FastAPI/Flask):** Terminal jahan `python main.py` ya `uvicorn` chal raha hai — wahan error stack trace dikhega.

**PHP:** 
- `error_log` file
- Laravel: `storage/logs/laravel.log`
- XAMPP: `xampp/apache/logs/error.log`

**Common causes:**
- Database connection fail
- Missing `.env` variable (DB_HOST, API_KEY, etc.)
- Undefined variable / null reference
- Missing table ya column

---

## 2. Konsi API 500 de rahi hai?

Browser DevTools → Network tab → failed request click karo → Response tab dekho.

Backend agar JSON error bhejta hai:
```json
{"error": "Database connection failed"}
{"message": "Table 'leads' doesn't exist"}
```
Ab frontend ye message dikhayega (improved error handling).

---

## 3. Quick Checks

| Check | Action |
|-------|--------|
| Backend chal raha hai? | `curl http://127.0.0.1:8000/` ya apna URL |
| DB connected? | Backend logs / DB client se verify |
| `.env` sahi? | DB credentials, API keys |
| Endpoint exist karta hai? | Backend mein route defined hai? |
| CORS? | 500 CORS se alag hai — 500 = server crash |

---

## 4. Test with cURL

```bash
# Admin login — 500 aaye to backend auth code check karo
curl -X POST "http://127.0.0.1:8000/api/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lpg.com","password":"admin123"}'

# Leads — 500 aaye to leads/DB code check karo
curl -X GET "http://127.0.0.1:8000/api/admin/leads" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response body mein error detail ho sakti hai.

---

## 5. Backend Error Response Format (Recommended)

Agar backend 500 pe bhi JSON bheje to frontend better message dikha sakta hai:

```json
{
  "error": "Database connection failed",
  "message": "Could not connect to MySQL"
}
```

ya

```json
{
  "message": "Table 'agents' doesn't exist"
}
```
