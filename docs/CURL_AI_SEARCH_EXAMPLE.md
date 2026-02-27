# AI Search Conversation — cURL Request (Roman Urdu Comments)

Har line ke pehle comment — samajhne ke liye kya karta hai

```bash
# Yeh command AI conversation API ko call karta hai
curl --location 'http://localhost:5173/api/ai-search-conversation' \

# Accept: Browser ko batao ke response kya format chahiye (JSON, etc.)
--header 'Accept: */*' \

# Accept-Language: Browser ki preferred language (English, French, etc.)
--header 'Accept-Language: en-GB,en-US;q=0.9,en;q=0.8,fr;q=0.7,he;q=0.6' \

# Connection: TCP connection keep-alive rakho (band mat karo)
--header 'Connection: keep-alive' \

# Content-Type: Hum JSON bhej rahe hain body mein
--header 'Content-Type: application/json' \

# DNT: Do Not Track — privacy flag
--header 'DNT: 1' \

# Origin: Request kahan se aa rahi hai (frontend URL)
--header 'Origin: http://localhost:5173' \

# Referer: User kis page pe tha jab request bheji
--header 'Referer: http://localhost:5173/' \

# Sec-Fetch-*: Browser security headers (CORS, mode, etc.)
--header 'Sec-Fetch-Dest: empty' \
--header 'Sec-Fetch-Mode: cors' \
--header 'Sec-Fetch-Site: same-origin' \

# User-Agent: Browser/OS info — server ko pata kaun sa client hai
--header 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36' \

# sec-ch-ua: Client hints — browser brand, version
--header 'sec-ch-ua: "Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"' \
--header 'sec-ch-ua-mobile: ?0' \
--header 'sec-ch-ua-platform: "macOS"' \

# Cookie: Session / auth cookies (agar login hai)
--header 'Cookie: tk_ai=...; remember_web_...' \

# --data: Request body — initial_prompt + messages (conversation history)
--data '{"initial_prompt":"DHA plots list","messages":[]}'
```

---

## Sirf zaroori headers (minimal request)

```bash
curl -X POST 'http://localhost:5173/api/ai-search-conversation' \
  -H 'Content-Type: application/json' \
  -d '{"initial_prompt":"DHA plots list","messages":[]}'
```

---

## Note

`localhost:5173` = Vite dev server. Vite proxy `/api` ko backend `127.0.0.1:8000` pe forward karta hai.  
Agar direct backend call karni ho to URL use karo: `http://127.0.0.1:8000/api/ai-search-conversation`
