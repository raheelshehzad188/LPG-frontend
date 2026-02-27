# Standalone Chat HTML

`public/chat.html` — Property search chat jo project ke API use karta hai.

## URL

**Vite dev:** http://localhost:5173/chat.html  
**Build ke baad:** `dist/chat.html` (ya apne domain pe)

## API

- **Endpoint:** `POST /api/ai-search-conversation`
- **Request:** `{ initial_prompt, messages }`
- **Response:** `{ question, listings, lead_id }`

Vite proxy `/api` ko `http://127.0.0.1:8000` pe forward karta hai. Backend chalna chahiye.

## Flow

1. User pehla message likhe (e.g. "DHA Phase 6 plots")
2. API call → question + listings
3. User jawab de (e.g. "2 crore")
4. API call → next question + filtered listings
5. Jab name+phone mile → backend lead create karega → `lead_id` return
6. Green banner: "Lead saved! ID: L1A2B3C4"

## React App vs Chat HTML

| | React (ListingsView) | chat.html |
|---|----------------------|-----------|
| UI | Dark theme, sidebar | Light theme, full page |
| API | Same `/api/ai-search-conversation` | Same |
| Lead banner | AI Assistant panel mein | Top banner |

Dono same API use karte hain.
