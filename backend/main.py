"""
Lahore Property Guide — FastAPI Backend
/api/ai-search-conversation — Gemini + SQL property search
/api/process-query — Direct SQL-based query (alternative)
"""
import os
from contextlib import contextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import text

import google.generativeai as genai

from database import get_unique_locations, SessionLocal
from gemini_sql import build_gemini_prompt, parse_gemini_json, build_fallback_like_query
from gemini_conversation import (
    build_conversation_prompt,
    parse_conversation_json,
    filter_properties as filter_props_conv,
)

# --- Config ---
genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))
model = genai.GenerativeModel("gemini-1.5-flash")

app = FastAPI(title="LPG API", version="1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Pydantic models ---
class AiSearchConversationRequest(BaseModel):
    initial_prompt: str
    messages: list[dict] = []  # [{"role": "user"|"assistant", "content": "..."}]


class ProcessQueryRequest(BaseModel):
    user_message: str
    chat_history: list[dict] = []  # [{"role": "user"|"assistant", "content": "..."}]


class ProcessQueryResponse(BaseModel):
    properties: list[dict]
    ai_reply: str
    sql_query: str | None = None
    filters_found: dict | None = None


class GeminiTestRequest(BaseModel):
    apiKey: str


class GeminiSettingsRequest(BaseModel):
    apiKey: str | None = None
    systemInstructions: str | None = None
    conversationInstructions: str | None = None
    model: str | None = None


def is_safe_sql(query: str) -> bool:
    """Sirf SELECT allow — SQL injection prevent"""
    q = query.strip().upper()
    if not q.startswith("SELECT"):
        return False
    bad = ["INSERT", "UPDATE", "DELETE", "DROP", "TRUNCATE", "ALTER", "CREATE", ";--", "/*"]
    return not any(b in q for b in bad)


@contextmanager
def get_db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _row_to_listing(row) -> dict:
    """DB row ko frontend format mein convert"""
    d = dict(row._mapping) if hasattr(row, "_mapping") else dict(row)
    price = d.get("price") or 0
    d["location_name"] = d.get("location", "")
    d["cover_photo"] = d.get("cover_photo") or ""
    return d


@app.post("/api/ai-search-conversation")
def ai_search_conversation(req: AiSearchConversationRequest):
    """
    Frontend AI Assistant — initial_prompt + messages → question + listings + lead_info
    """
    with get_db_session() as db:
        # 1. Properties fetch (simple: sab ya initial prompt se filter)
        try:
            result = db.execute(text("SELECT * FROM properties LIMIT 50"))
            rows = result.fetchall()
            properties = [_row_to_listing(r) for r in rows]
        except Exception:
            properties = []

        if not properties:
            # Fallback: mock listings agar DB empty
            properties = [
                {"id": 1, "title": "1 Kanal Plot DHA 9", "location": "DHA 9", "location_name": "DHA 9", "price": 25000000, "type": "plot", "cover_photo": ""},
                {"id": 2, "title": "5 Marla Gulberg", "location": "Gulberg", "location_name": "Gulberg", "price": 15000000, "type": "plot", "cover_photo": ""},
            ]

        # 2. Gemini ko bhejo (agar API key hai)
        prompt = build_conversation_prompt(req.initial_prompt, req.messages, properties)
        question = "Aapka budget kitna hai? (e.g. 2 crore)"
        filter_criteria = {}
        lead_info = {}

        if os.getenv("GEMINI_API_KEY"):
            try:
                response = model.generate_content(prompt)
                data = parse_conversation_json(response.text)
                if data:
                    question = data.get("question", question)
                    filter_criteria = data.get("filter_criteria") or {}
                    lead_info = data.get("lead_info") or {}
            except Exception:
                pass

        # 3. Properties filter
        filtered = filter_props_conv(properties, filter_criteria)
        if not filtered:
            filtered = properties[:10]

        # 4. Response — frontend format
        return {
            "question": question,
            "listings": filtered,
            "message": "",
            "lead_info": lead_info,
            "lead_id": None,
        }


@app.post("/api/process-query", response_model=ProcessQueryResponse)
def process_query(req: ProcessQueryRequest):
    """
    User message + chat history → Gemini SQL → DB execute → properties + ai_reply
    """
    with get_db_session() as db:
        # 1. DB se allowed locations fetch
        locations = get_unique_locations(db)
        if not locations:
            locations = ["DHA 9", "Gulberg", "Bahria", "LSC"]  # fallback

        # 2. Gemini ko bhejo
        prompt = build_gemini_prompt(req.user_message, req.chat_history, locations)
        sql_query = None
        ai_reply = "Mujhe kuch samajh nahi aaya. Thoda detail mein batao?"
        filters_found = None

        try:
            response = model.generate_content(prompt)
            data = parse_gemini_json(response.text)
            if data:
                sql_query = data.get("sql_query", "").strip()
                ai_reply = data.get("ai_reply", ai_reply)
                filters_found = data.get("filters_found") or {}
        except Exception:
            pass

        # 3. Safe SQL execute — agar Gemini fail to LIKE fallback
        if not sql_query or not is_safe_sql(sql_query):
            sql_query = build_fallback_like_query(req.user_message, locations)
            ai_reply = "Maine aapki query ke mutabiq properties dhoondh li hain."

        # 4. Execute
        try:
            result = db.execute(text(sql_query))
            rows = result.fetchall()
            properties = [dict(row._mapping) if hasattr(row, "_mapping") else dict(zip(result.keys(), row)) for row in rows]

            # 5. Zero results — lead generation reply
            if not properties and "alternative" not in ai_reply.lower():
                ai_reply = (
                    "Abhi is budget mein yahan koi cheez nahi hai, lekin mere paas alternative options hain. "
                    "Aapka naam aur number share karenge taake hum aapko best options bhej saken?"
                )
        except Exception:
            # Fallback: simple LIKE
            sql_query = build_fallback_like_query(req.user_message, locations)
            try:
                result = db.execute(text(sql_query))
                rows = result.fetchall()
                properties = [dict(row._mapping) if hasattr(row, "_mapping") else dict(zip(result.keys(), row)) for row in rows]
            except Exception:
                properties = []
                ai_reply = "Database error. Dobara try karein."

        # 6. Serialize (Decimal, etc. → native Python)
        for p in properties:
            for k, v in p.items():
                if hasattr(v, "__float__") and not isinstance(v, (int, float, str, type(None))):
                    p[k] = float(v) if v is not None else None

        return ProcessQueryResponse(
            properties=properties,
            ai_reply=ai_reply,
            sql_query=sql_query,
            filters_found=filters_found,
        )


# --- Gemini Settings (Admin) ---
# Simple file-based storage — production mein DB use karo
GEMINI_SETTINGS_FILE = os.path.join(os.path.dirname(__file__), "gemini_settings.json")
DEFAULT_SYSTEM = "Tu Lahore Property Guide ka AI assistant ho. Property requirements aur lead info poocho."
DEFAULT_CONVERSATION = "Ek ek question poocho. Roman Urdu aur English dono use karo."


def _load_gemini_settings() -> dict:
    if os.path.exists(GEMINI_SETTINGS_FILE):
        try:
            import json
            with open(GEMINI_SETTINGS_FILE) as f:
                return json.load(f)
        except Exception:
            pass
    return {}


def _save_gemini_settings(data: dict):
    import json
    with open(GEMINI_SETTINGS_FILE, "w") as f:
        json.dump(data, f, indent=2)


def _mask_key(key: str) -> str:
    if not key or len(key) < 10:
        return "***"
    return key[:4] + "***" + key[-4:]


def _test_gemini_key(api_key: str) -> tuple[bool, str]:
    """Test Gemini API key — returns (success, message)"""
    if not api_key or not api_key.strip():
        return False, "API key required"
    try:
        genai.configure(api_key=api_key.strip())
        m = genai.GenerativeModel("gemini-1.5-flash")
        m.generate_content("Hi")
        return True, "Connection successful"
    except Exception as e:
        return False, str(e) or "Invalid API key"


@app.get("/api/gemini")
def get_gemini_settings():
    """Fetch Gemini settings — apiKey masked"""
    s = _load_gemini_settings()
    env_key = os.getenv("GEMINI_API_KEY")
    stored_key = s.get("apiKey") or env_key
    return {
        "apiKey": None,
        "apiKeyMasked": _mask_key(stored_key) if stored_key else "",
        "systemInstructions": s.get("systemInstructions") or DEFAULT_SYSTEM,
        "conversationInstructions": s.get("conversationInstructions") or DEFAULT_CONVERSATION,
        "model": s.get("model") or "gemini-1.5-flash",
        "updatedAt": s.get("updatedAt"),
    }


@app.put("/api/gemini")
def save_gemini_settings(req: GeminiSettingsRequest):
    """Save Gemini settings"""
    from datetime import datetime
    s = _load_gemini_settings()
    if req.apiKey and req.apiKey.strip():
        s["apiKey"] = req.apiKey.strip()
        os.environ["GEMINI_API_KEY"] = s["apiKey"]
    if req.systemInstructions is not None:
        s["systemInstructions"] = req.systemInstructions
    if req.conversationInstructions is not None:
        s["conversationInstructions"] = req.conversationInstructions
    if req.model:
        s["model"] = req.model
    s["updatedAt"] = datetime.utcnow().isoformat() + "Z"
    _save_gemini_settings(s)
    return {"success": True, "message": "Settings saved", "updatedAt": s["updatedAt"]}


@app.post("/api/gemini/test")
def test_gemini(req: GeminiTestRequest):
    """Test Gemini API key connection"""
    ok, msg = _test_gemini_key(req.apiKey or "")
    if ok:
        return {"success": True, "message": "Connection successful", "model": "gemini-1.5-flash"}
    return {"success": False, "error": msg}


@app.post("/api/gemini/reset")
def reset_gemini_instructions():
    """Reset to default instructions"""
    s = _load_gemini_settings()
    s["systemInstructions"] = DEFAULT_SYSTEM
    s["conversationInstructions"] = DEFAULT_CONVERSATION
    _save_gemini_settings(s)
    return {"success": True, "message": "Reset to default", "systemInstructions": DEFAULT_SYSTEM, "conversationInstructions": DEFAULT_CONVERSATION}


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
