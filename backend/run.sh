#!/bin/bash
# LPG Backend — sahi backend ye hai (question + listings return karta hai)
# Port 8000 pe koi aur backend chal raha ho to pehle band karo: lsof -i :8000
cd "$(dirname "$0")"
export GEMINI_API_KEY="${GEMINI_API_KEY:-}"
[ -f .env ] && source .env 2>/dev/null || true
python init_db.py 2>/dev/null || true
echo "Starting LPG backend on http://127.0.0.1:8000"
uvicorn main:app --reload --host 0.0.0.0 --port 8000
