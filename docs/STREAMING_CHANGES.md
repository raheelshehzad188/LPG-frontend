# Streaming Support — Changes Summary

Ye document sab changes explain karta hai jo AI Chat streaming ke liye kiye gaye.

---

## 1. Naya File: `src/hooks/useApiNewAiStream.ts`

**Kya hai:** Ek custom React hook jo `api_new_ai` API ko streaming mode mein call karta hai.

**Kya karta hai:**
- `fetch` + `ReadableStream` use karke response ko chunk-by-chunk padhta hai
- NDJSON (newline-delimited JSON) ya SSE format parse karta hai
- **Streaming events:**
  - `type: "chunk"` / `"text"` / `"delta"` → text chunk, `question` mein append hota hai
  - `type: "done"` → final event, `properties`, `lead_collected`, `filter_criteria`, `lead_id` milta hai
- **Non-streaming fallback:** Agar API normal JSON return kare (streaming nahi), to woh bhi handle karta hai
- **Callbacks:** `onProperties` aur `onDone` — jab properties milti hain ya stream khatam hota hai

**Return values:**
- `question` — streaming text (chunk-by-chunk badhta hai)
- `isLoading` — request chal rahi hai ya nahi
- `error` — API error
- `sendMessage(params)` — API call karne ke liye
- `properties`, `lead_collected`, `filter_criteria`, `lead_id` — response data

---

## 2. Update: `src/components/AIAssistant.jsx`

**Pehle:** `onConversation` prop use karta tha — parent se promise milta tha, JSON response aata tha.

**Ab:**
- `useApiNewAiStream` hook use karta hai
- `onConversation` hata diya — ab direct API call hook se hoti hai
- **Initial message:** Mount pe `initialPrompt` ke saath `sendMessage` call hota hai
- **User message:** `handleSend` → `sendMessage` with updated messages
- **Properties update:** `onProperties` aur `onDone` callbacks se `onFilterListings`, `onListingsUpdate`, `onPropertiesReceived` call hote hain
- **Typing indicator:** `isLoading` + `question` hone par blinking cursor `|` dikhta hai
- **Spinner:** `isLoading` + `!question` hone par loading spinner

---

## 3. Update: `src/components/ListingsView.jsx`

**Naya prop:** `onListingsUpdate`
- Jab AI se properties aati hain, parent (App) ko update karne ke liye
- `AIAssistant` → `onListingsUpdate(properties)` call karta hai

---

## 4. Update: `src/App.jsx`

**Change:** `ListingsView` ko `onListingsUpdate={setListings}` pass kiya
- Jab chat se nayi properties aati hain, App ka `listings` state update hota hai

---

## 5. Update: `src/index.css`

**Naya animation:** `animate-cursor-blink`
- Typing cursor `|` ke liye blink effect
- 1 second cycle, step-end infinite

```css
@keyframes cursor-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
```

---

## Flow Diagram

```
User types → AIAssistant.handleSend
    → useApiNewAiStream.sendMessage
        → fetch POST /api_new_ai
        → Stream chunks → setQuestion (cursor dikhta hai)
        → type: "done" → onDone
            → setMessages (model reply add)
            → onFilterListings(properties)
            → onListingsUpdate(properties)
            → onPropertiesReceived(true) [collapse + scroll]
```

---

## Backend Requirement (Streaming ke liye)

Agar backend streaming support kare, to response format:

**Content-Type:** `text/event-stream` ya `application/x-ndjson`

**NDJSON format (har line ek JSON object):**
```
{"type":"chunk","content":"Jee "}
{"type":"chunk","content":"bilkul"}
{"type":"done","question":"Jee bilkul...","properties":[...],"lead_collected":{...},"filter_criteria":{...},"lead_id":"..."}
```

**Agar streaming nahi hai:** Normal JSON response bhi chalega — hook automatically detect karke handle karega.
