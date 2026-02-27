"""
Gemini 1.5 Flash — Natural language → SQL conversion
Sirf allowed locations use karega, JSON response return karega
"""
import json
import re
from typing import Optional

GEMINI_SQL_SYSTEM_PROMPT = """Tu Lahore Property Guide ka SQL Expert ho.

Database schema (properties table):
- id (int), title (str), location (str), price (int, rupees), size (str), beds (int), baths (int)
- type (str: 'plot' ya 'house'), status (str: 'LDA approved' ya 'not'), roi_percentage (float)

Rules:
1. User ki natural language query suno (e.g. "DHA 9 mein 2 crore tak ka plot dikhao")
2. Sirf wahi locations use karo jo main tumhe list bhej raha hoon: {allowed_locations}
3. Location names match karo — exact match ya fuzzy (e.g. "DHA 9" = "DHA 9", "DHA Phase 9")
4. Price ko rupees mein convert karo: 1 crore = 10000000, 1 lac = 100000
5. Agar SQL result 0 aaye (koi property na mile), to ai_reply mein kaho: "Abhi is budget mein yahan koi cheez nahi hai, lekin mere paas alternative options hain. Aapka naam aur number share karenge taake hum aapko best options bhej saken?"
6. Hamesha sirf SELECT query — koi INSERT/UPDATE/DELETE mat banao

Response format (strict JSON):
{{
  "sql_query": "SELECT * FROM properties WHERE location='DHA 9' AND price <= 20000000 AND type='plot'",
  "ai_reply": "Zaroor! Maine DHA 9 mein aapke budget ke mutabiq best plots nikaal liye hain.",
  "filters_found": {{"location": "DHA 9", "max_price": 20000000}
}}
"""


def build_gemini_prompt(user_message: str, chat_history: list, allowed_locations: list[str]) -> str:
    locations_str = ", ".join(repr(loc) for loc in allowed_locations)
    system = GEMINI_SQL_SYSTEM_PROMPT.format(allowed_locations=locations_str)

    conv = "\n".join([f"{m.get('role', 'user')}: {m.get('content', '')}" for m in chat_history])
    if conv:
        conv += f"\nuser: {user_message}"
    else:
        conv = f"user: {user_message}"

    return f"{system}\n\nConversation:\n{conv}\n\nAb JSON response do (sirf JSON, koi aur text nahi):"


def parse_gemini_json(response_text: str) -> Optional[dict]:
    """Gemini response se JSON parse karo"""
    text = response_text.strip()
    # Remove markdown code blocks if present
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        text = text.split("```")[1].split("```")[0].strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None


def build_fallback_like_query(user_message: str, allowed_locations: list[str]) -> str:
    """Gemini fail hone par basic LIKE search — sirf alphanumeric words use"""
    safe_words = [re.sub(r"[^a-zA-Z0-9]", "", w) for w in user_message.split() if len(w) > 2]
    loc_in = ", ".join(repr(l) for l in allowed_locations)
    if not safe_words:
        return f"SELECT * FROM properties WHERE location IN ({loc_in}) LIMIT 20"
    like_parts = []
    for w in safe_words[:3]:
        if w:
            like_parts.append(f"(title LIKE '%{w}%' OR location LIKE '%{w}%')")
    if not like_parts:
        return f"SELECT * FROM properties WHERE location IN ({loc_in}) LIMIT 20"
    return f"SELECT * FROM properties WHERE ({' OR '.join(like_parts)}) AND location IN ({loc_in}) LIMIT 20"
