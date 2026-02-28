import React, { useState, useEffect, useRef } from 'react';
import { aiSearchConversation } from '../api/aiSearchConversation';
import { API_BASE_URL, API_ENDPOINTS } from '../config';
import { getOrCreateThreadId } from '../utils/threadId';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIAssistant({ initialPrompt, onConversation, onFilterListings }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const chatEndRef = useRef(null);
  const autoStartFired = useRef(false);
  // const idleTimerRef = useRef(null);

  // --- Smart Idle Timer (DISABLED - agar bnda chup ho to AI auto request karta tha) ---
  // const startIdleTimer = () => {
  //   if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
  //   idleTimerRef.current = setTimeout(() => {
  //     const lastMsg = messages[messages.length - 1];
  //     if (lastMsg && lastMsg.role === 'assistant' && !loading && !leadCaptured) {
  //       handleSend("ACT_AS_SALES_CLOSER_URGENCY");
  //     }
  //   }, 15000);
  // };
  // useEffect(() => {
  //   if (messages.length > 0) startIdleTimer();
  //   return () => clearTimeout(idleTimerRef.current);
  // }, [messages, loading]);

  // --- 1. Lead Database Saving Logic ---
  const saveLeadToDB = async (phoneText) => {
    try {
      // Phone number extract karne ke liye regex
      const phoneMatch = phoneText.match(/(\+92|03)\d{9,10}/);
      if (!phoneMatch) return;

      const leadData = {
        phone: phoneMatch[0],
        name: "Web Visitor", // Aap user se baad mein naam bhi puch sakte hain
        context: messages.slice(-3).map(m => m.content).join(" | ")
      };

      const base = API_BASE_URL || 'http://127.0.0.1:8000';
      await fetch(`${base}${API_ENDPOINTS.leads}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });
      
      setLeadCaptured(true);
      console.log("Lead Saved Successfully!");
    } catch (err) {
      console.error("Lead Saving Error:", err);
    }
  };

  // --- 2. Chat Logic ---
  useEffect(() => {
    if (!initialPrompt?.trim() || autoStartFired.current) return;
    autoStartFired.current = true;
    handleSend(initialPrompt.trim(), true);
  }, [initialPrompt]);

  useEffect(() => {
    if (!initialPrompt?.trim() && messages.length === 0) {
      setMessages([{ role: 'assistant', content: 'Assalam-o-Alaikum! Main Lahore Property Expert hoon. Aap DHA, Bahria ya kis area mein behtreen options dekh rahe hain?' }]);
    }
  }, [initialPrompt, messages.length]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (forcedText = null, isFirst = false) => {
    const text = forcedText || input;
    if (!text.trim() || loading) return;

    // if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    if (!forcedText) {
      setMessages(prev => [...prev, { role: 'user', content: text }]);
      setInput('');
      
      // Lead detection: Agar message mein phone number hai to DB mein save karo
      if (text.match(/(\+92|03)\d{9,10}/)) {
        saveLeadToDB(text);
      }
    }
    
    setLoading(true);

    try {
      const context = isFirst ? [] : messages.slice(-6);
      const queryPayload = text;
      // if (forcedText === "ACT_AS_SALES_CLOSER_URGENCY") {
      //   queryPayload = "User is silent. Create urgency. Tell them deals are closing fast and strictly ask for their WhatsApp to send location maps/PDFs.";
      // }

      const threadId = getOrCreateThreadId(); // Same chat = same ID (handleSearch ne naya chat pe startNewThread kiya)
      const payload = { query: queryPayload, messages: context, threadId };
      const response = await (onConversation 
        ? onConversation(payload) 
        : aiSearchConversation(payload));
      
      const reply = response?.reply ?? response?.question ?? 'Behtreen! Mazeed details ke liye apna contact number share karein.';
      
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      if (response?.listings) onFilterListings?.(response.listings);

    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection thora slow hai, par main results check kar raha hoon...' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0f172a] border-l border-white/10 shadow-2xl relative overflow-hidden">
      
      {/* Dynamic Header */}
      <div className="p-4 border-b border-white/5 bg-slate-900/80 backdrop-blur-md shrink-0 flex justify-between items-center">
        <div>
          <h3 className="text-blue-400 font-bold text-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            AI Sales Closer
          </h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Live Property Filter</p>
        </div>
        <AnimatePresence>
          {leadCaptured && (
            <motion.span 
              initial={{ scale: 0 }} animate={{ scale: 1 }} 
              className="bg-green-500/20 text-green-500 text-[10px] px-2 py-1 rounded-full border border-green-500/30"
            >
              ✓ Contact Saved
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-slate-950/20">
        {messages.map((m, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[88%] p-3.5 rounded-2xl text-[12px] leading-relaxed shadow-xl ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-slate-800 text-slate-100 border border-white/10 rounded-tl-none ring-1 ring-white/5'
            }`}>
              {m.content}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-1.5 p-2 items-center">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900/90 border-t border-white/10 shrink-0">
        <div className="relative flex items-center bg-slate-800/50 border border-white/10 rounded-2xl px-2 py-1 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all shadow-inner">
          <input 
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={leadCaptured ? "Puchhein jo puchna hai..." : "Contact number share karein..."}
            className="flex-1 bg-transparent border-none p-3 text-sm outline-none text-white placeholder-slate-500"
          />
          <button 
            onClick={() => handleSend()} disabled={loading}
            className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 active:scale-95 transition-all disabled:opacity-50 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}