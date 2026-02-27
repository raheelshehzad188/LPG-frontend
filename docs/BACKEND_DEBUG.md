# Backend Debug — Response Nahi Aa Raha?

## Problem

`/api/ai-search-conversation` galat format return kar raha hai:
```json
{"location_name":"DHA","price_min":null,"price_max":null,...}
```

Frontend ko chahiye:
```json
{"question":"...","listings":[...],"message":"","lead_info":{}}
```

## Cause

Port 8000 pe **galat backend** chal raha hai (Laravel/Node/other). LPG ka Python backend nahi chal raha.

## Fix

### 1. Purana backend band karo

```bash
# Dekho kaun port 8000 use kar raha hai
lsof -i :8000

# Process kill karo (PID replace karo)
kill <PID>
```

### 2. LPG backend chalao

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# .env mein GEMINI_API_KEY add karo (optional — bina key ke bhi chalega)
python init_db.py
uvicorn main:app --reload --port 8000
```

Ya:
```bash
cd backend && bash run.sh
```

### 3. Test

```bash
curl -X POST http://localhost:8000/api/ai-search-conversation \
  -H "Content-Type: application/json" \
  -d '{"initial_prompt":"DHA plots","messages":[]}'
```

Sahi response:
```json
{
  "question": "Aapka budget kitna hai?",
  "listings": [...],
  "message": "",
  "lead_info": {},
  "lead_id": null
}
```

### 4. Frontend fallback

Agar galat backend chal raha ho to frontend ab fallback dikhayega: "Aapka budget kitna hai?" — lekin listings empty rahengi. **Sahi backend chalao** taake listings bhi aayein.
