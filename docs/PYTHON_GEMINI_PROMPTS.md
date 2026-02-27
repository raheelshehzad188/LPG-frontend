# Python + Gemini — AI Search & Conversation Prompts

Ye document Python backend ke liye Gemini prompts aur API structure deta hai.

---

## API Endpoint: `POST /api/ai-search-conversation`

### Request Body
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

### Response Body
```json
{
  "question": "Aap plot chahte hain ya constructed house?",
  "listings": [...],
  "message": "Optional greeting",
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
- `lead_info` — Gemini se extract. Jo fields customer ne diye woh hi.
- `lead_id` — Jab name+phone milne par backend DB mein lead create karta hai, to ye id return hoti hai. Warna `null`.

---

## Gemini System Prompt (Python)

```python
GEMINI_SYSTEM_PROMPT = """
Tu Lahore Property Guide ka AI assistant ho. Tumhare do main kaam hain:

1. PROPERTY REQUIREMENTS: Customer se property details poocho (budget, area, type: plot/house/apartment, marlas, etc.)
2. LEAD INFO: Customer se lead ke liye zaroori details bhi naturally poocho — conversation ke dauran:
   - Name (naam)
   - Phone number
   - Budget (property ke liye — already property search mein)
   - Kahan se belong karte hain (city/area — e.g. Lahore, Islamabad, abroad)
   - Koi aur relevant info (timeline, purpose: investment/residence, etc.)

Rules:
- Ek ek question poocho — zyada ek saath mat pocho
- Property questions aur lead questions dono mix karo naturally (e.g. budget poochte waqt lead bhi ban raha hai)
- Roman Urdu aur English dono use kar sakte ho — customer ki language follow karo
- Agar customer English prefer kare to English mein jawab do

Conversation flow:
- Pehle initial prompt se samjho customer kya chahta hai
- Property info (budget, area, type) poocho
- Jab mauka mile naturally naam/phone poocho — e.g. "Agar aapko koi listing pasand aaye to hum aapko contact kar sakte hain. Aapka naam aur number share karenge?"
- Lead info incomplete ho to next question mein include karo

Response format (JSON):
{
  "question": "Next question for customer - Roman Urdu/English",
  "filter_criteria": { "budget_max_lac": 200, "area": "DHA Phase 9", "type": "plot" },
  "lead_info": {
    "name": "Extracted name if customer ne diya, else null",
    "phone": "Extracted phone if customer ne diya, else null",
    "city": "Kahan se belong (Lahore, Islamabad, etc.) else null",
    "budget_lac": 200,
    "notes": "Any extra info customer ne diya"
  },
  "reasoning": "Brief - kya filter kiya, kya lead info mili"
}

lead_info mein sirf woh fields bharo jo customer ne conversation mein de diye. Null mat chhodo agar value hai.
Backend lead_info use karega lead create karne ke liye.
"""
```

---

## Gemini User Prompt (per request)

```python
def build_user_prompt(initial_prompt: str, messages: list, available_properties: list) -> str:
    conv = "\n".join([f"{m['role']}: {m['content']}" for m in messages])
    props_summary = f"Available: {len(available_properties)} properties. Sample: {[p.get('location_name') for p in available_properties[:5]]}"
    
    return f"""
Initial search: {initial_prompt}

Conversation so far:
{conv}

{props_summary}

Ab next question generate karo:
- Agar property info (budget, area, type) incomplete ho to woh poocho
- Agar property info mil gayi aur lead info (name, phone) nahi mili to naturally naam/phone poocho — "Aapka naam aur contact number share karenge taake hum aapko best options bhej saken?"
- Agar sab mil gaya to "Koi aur preference?" ya listings dikhao
- lead_info object mein jo bhi customer ne ab tak diya hai (name, phone, city, budget) woh extract karke bharo
JSON format mein reply do.
"""
```

---

## Filter Logic (Python)

```python
def filter_properties(properties: list, filter_criteria: dict) -> list:
    result = properties
    
    if filter_criteria.get("budget_max_lac"):
        max_price = filter_criteria["budget_max_lac"] * 100000  # lac to rupees
        result = [p for p in result if (p.get("price") or 0) <= max_price]
    
    if filter_criteria.get("area"):
        area_lower = filter_criteria["area"].lower()
        result = [p for p in result if area_lower in (p.get("location_name") or "").lower()]
    
    if filter_criteria.get("type"):
        type_map = {"plot": "plot", "house": "house", "apartment": "apartment"}
        t = type_map.get(filter_criteria["type"].lower(), "")
        if t:
            result = [p for p in result if t in (p.get("type") or "").lower()]
    
    return result
```

---

## Lead Creation (DB mein save)

Jab `lead_info` mein **name** aur **phone** dono mil jayein, DB mein lead create karo.

```python
import uuid
from datetime import datetime

def format_budget(lac: float) -> str:
    """budget_lac ko '2 Cr' ya '50 Lac' format mein convert"""
    if not lac: return ""
    if lac >= 100: return f"{lac/100:.1f} Cr"
    return f"{lac:.0f} Lac"

async def create_lead(lead_info: dict, initial_prompt: str, messages: list, db) -> str | None:
    """
    lead_info se lead DB mein create karo.
    Returns: lead_id agar success, else None
    """
    name = (lead_info.get("name") or "").strip()
    phone = (lead_info.get("phone") or "").strip()
    if not name or not phone:
        return None

    # Property interest = initial prompt + conversation summary
    conv_summary = initial_prompt
    if messages:
        last_user = [m["content"] for m in messages if m.get("role") == "user"][-1:]
        if last_user:
            conv_summary = f"{initial_prompt} | {last_user[0][:100]}"

    budget_str = format_budget(lead_info.get("budget_lac"))
    city = (lead_info.get("city") or "").strip()
    notes = (lead_info.get("notes") or "").strip()

    lead_id = f"L{uuid.uuid4().hex[:8].upper()}"
    lead = {
        "id": lead_id,
        "userName": name,
        "phone": phone,
        "propertyInterest": conv_summary,
        "budget": budget_str,
        "city": city,
        "notes": notes,
        "status": "new",
        "source": "ai_chat",
        "createdAt": datetime.utcnow().isoformat() + "Z",
        # assignedAgentId — routing logic se assign hoga (optional)
    }

    # DB insert — SQLAlchemy / MongoDB / etc. apne stack ke hisaab se
    # await db.leads.insert_one(lead)   # MongoDB
    # await db.execute(leads_table.insert(), lead)  # SQLAlchemy
    return lead_id
```

---

## Full API Flow (Python/FastAPI example)

```python
from fastapi import FastAPI
import google.generativeai as genai

app = FastAPI()
genai.configure(api_key="YOUR_GEMINI_KEY")
model = genai.GenerativeModel("gemini-1.5-flash")

@app.post("/api/ai-search-conversation")
async def ai_search_conversation(body: dict):
    return req
    initial_prompt = body.get("initial_prompt", "")
    messages = body.get("messages", [])
    
    # 1. Pehle properties fetch karo (DB ya ai-search se)
    properties = await get_properties_from_db(initial_prompt)  # ya existing ai-search logic
    
    # 2. Gemini ko bhejo — next question + filter criteria + lead_info
    user_prompt = build_user_prompt(initial_prompt, messages, properties)
    response = model.generate_content([GEMINI_SYSTEM_PROMPT, user_prompt])
    
    # 3. Parse Gemini response (JSON)
    import json
    try:
        data = json.loads(response.text)
        question = data.get("question", "Koi aur requirement?")
        filter_criteria = data.get("filter_criteria", {})
        lead_info = data.get("lead_info", {})
    except:
        question = "Koi aur requirement?"
        filter_criteria = {}
        lead_info = {}
    
    # 4. Properties filter karo
    filtered = filter_properties(properties, filter_criteria)
    
    # 5. Jab saari lead info mil gayi (name + phone) to DB mein lead create karo
    lead_id = None
    if lead_info.get("name") and lead_info.get("phone"):
        lead_id = await create_lead(lead_info, initial_prompt, messages, db)
    
    return {
        "question": question,
        "listings": filtered,
        "message": "",
        "lead_info": lead_info,
        "lead_id": lead_id  # agar lead create hua to id, warna null
    }
```

---

## Quick Reference

| Step | Action |
|------|--------|
| 1 | Receive `initial_prompt` + `messages` |
| 2 | Fetch properties (existing `/api/ai-search` logic ya DB) |
| 3 | Gemini ko conversation + properties bhejo |
| 4 | Gemini se `question` + `filter_criteria` + `lead_info` lo |
| 5 | Properties filter karo |
| 6 | **Lead create:** Agar `name` + `phone` dono mil gaye to `create_lead()` call karo, DB mein save |
| 7 | Return `{ question, listings, lead_info, lead_id }` |

---

*Lahore Property Guide — Python/Gemini Backend*
