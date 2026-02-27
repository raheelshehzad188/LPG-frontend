"""
Gemini — AI Search Conversation (question + filter_criteria + lead_info)
PYTHON_GEMINI_PROMPTS.md ke mutabiq
"""
import json
from typing import Optional

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
- Property questions aur lead questions dono mix karo naturally
- Roman Urdu aur English dono use kar sakte ho — customer ki language follow karo
- Agar customer English prefer kare to English mein jawab do

Conversation flow:
- Pehle initial prompt se samjho customer kya chahta hai
- Property info (budget, area, type) poocho
- Jab mauka mile naturally naam/phone poocho
- Lead info incomplete ho to next question mein include karo

Response format (strict JSON):
{
  "question": "Next question for customer - Roman Urdu/English",
  "filter_criteria": { "budget_max_lac": 200, "area": "DHA Phase 9", "type": "plot" },
  "lead_info": {
    "name": "Extracted name if customer ne diya, else null",
    "phone": "Extracted phone if customer ne diya, else null",
    "city": "Kahan se belong else null",
    "budget_lac": 200,
    "notes": "Any extra info"
  }
}

lead_info mein sirf woh fields bharo jo customer ne de diye. Backend lead create karne ke liye use karega.
"""


def build_conversation_prompt(initial_prompt: str, messages: list, properties: list) -> str:
    conv = "\n".join([f"{m.get('role', 'user')}: {m.get('content', '')}" for m in messages])
    locs = [p.get("location") or p.get("location_name") or "" for p in properties[:10]]
    props_summary = f"Available: {len(properties)} properties. Locations: {locs}"
    return f"""{GEMINI_SYSTEM_PROMPT}

Initial search: {initial_prompt}

Conversation so far:
{conv}

{props_summary}

Ab next question generate karo. Agar property info incomplete ho to poocho. Agar mil gayi aur lead info nahi to naam/phone poocho.
lead_info mein jo bhi customer ne diya woh extract karo.
Sirf JSON do, koi aur text nahi:
"""


def parse_conversation_json(text: str) -> Optional[dict]:
    t = text.strip()
    if "```json" in t:
        t = t.split("```json")[1].split("```")[0].strip()
    elif "```" in t:
        t = t.split("```")[1].split("```")[0].strip()
    try:
        return json.loads(t)
    except json.JSONDecodeError:
        return None


def filter_properties(properties: list, criteria: dict) -> list:
    result = list(properties)
    if criteria.get("budget_max_lac"):
        max_rupees = criteria["budget_max_lac"] * 100000
        result = [p for p in result if (p.get("price") or 0) <= max_rupees]
    if criteria.get("area"):
        area = str(criteria["area"]).lower()
        result = [p for p in result if area in (p.get("location") or p.get("location_name") or "").lower()]
    if criteria.get("type"):
        t = str(criteria["type"]).lower()
        result = [p for p in result if t in (p.get("type") or "").lower()]
    return result
