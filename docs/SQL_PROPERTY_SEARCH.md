# SQL-Based Property Search — Python Backend

Natural language query → Gemini SQL → Database → Properties + AI Reply

---

## Database Schema

**Table: `properties`**

| Column        | Type   | Description                    |
|---------------|--------|--------------------------------|
| id            | int    | Primary key                    |
| title         | str    | Property title                 |
| location      | str    | DHA 9, Gulberg, Bahria, LSC    |
| price         | int    | Rupees                         |
| size          | str    | e.g. "1 kanal", "5 marla"      |
| beds          | int    | Bedrooms (house)               |
| baths         | int    | Bathrooms (house)              |
| type          | str    | `plot` ya `house`              |
| status        | str    | LDA approved / not             |
| roi_percentage| float  | ROI %                          |

---

## API: `POST /api/process-query`

### Request

```json
{
  "user_message": "DHA 9 mein 2 crore tak ka plot dikhao",
  "chat_history": [
    { "role": "user", "content": "DHA mein plot chahiye" },
    { "role": "assistant", "content": "Kaunsa phase? DHA 9?" },
    { "role": "user", "content": "Haan DHA 9, 2 crore tak" }
  ]
}
```

### Response

```json
{
  "properties": [
    {
      "id": 1,
      "title": "1 Kanal Plot DHA 9",
      "location": "DHA 9",
      "price": 25000000,
      "size": "1 kanal",
      "type": "plot",
      "status": "LDA approved",
      "roi_percentage": 12.5
    }
  ],
  "ai_reply": "Zaroor! Maine DHA 9 mein aapke budget ke mutabiq best plots nikaal liye hain.",
  "sql_query": "SELECT * FROM properties WHERE location='DHA 9' AND price <= 20000000 AND type='plot'",
  "filters_found": {
    "location": "DHA 9",
    "max_price": 20000000
  }
}
```

---

## Flow

1. **Fetch locations** — DB se `SELECT DISTINCT location` → allowed list
2. **Gemini** — User message + chat history + locations → JSON (sql_query, ai_reply, filters_found)
3. **Safe SQL** — Sirf `SELECT` allow, execute
4. **Zero results** — AI reply: *"Abhi is budget mein yahan koi cheez nahi hai, lekin mere paas alternative options hain. Aapka naam aur number share karenge?"* (lead generation)
5. **Fallback** — Gemini fail → basic `LIKE` search on title/location

---

## Setup

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # GEMINI_API_KEY add karo
python init_db.py      # Tables + sample data
uvicorn main:app --reload --port 8000
```

---

## Frontend Integration

`/api/process-query` ko call karo, `properties` + `ai_reply` frontend pe dikhao. Existing listings replace ho jayengi.

---

## Gemini Prompt (SQL Expert)

Gemini ko ye role diya gaya hai:
- User ki natural language → SQL convert
- Sirf allowed locations (DB se fetch) use karo
- JSON response: `sql_query`, `ai_reply`, `filters_found`
- Zero results → lead generation reply: *"Abhi is budget mein yahan koi cheez nahi hai, lekin mere paas alternative options hain..."*

---

*Lahore Property Guide — SQL Property Search*
