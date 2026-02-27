import { API_BASE_URL, API_ENDPOINTS } from '../config'

export const aiSearchConversation = async (payload) => {
  try {
      const base = API_BASE_URL || 'http://127.0.0.1:8000'
      const url = API_ENDPOINTS.aiSearchConversation.startsWith('http')
        ? API_ENDPOINTS.aiSearchConversation
        : `${base}${API_ENDPOINTS.aiConversation}`
      const response = await fetch(url, {
          method: 'POST',
          mode: 'cors', // CORS masla hal karne ke liye
          headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
          },
          // Python backend ChatRequest model ke mutabiq body
          body: JSON.stringify({ 
              query: payload.query, 
              threadId: payload.threadId || 'default_thread', 
              messages: payload.messages || [] 
          })
      });

      if (!response.ok) {
          const errorData = await response.json();
          console.error("Backend Se Error Aaya:", errorData);
          throw new Error(`Server Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("AI Response:", data);
      return data; 

  } catch (error) {
      console.error("Frontend Connection Error:", error);
      return { 
          question: "Maazrat, AI server se rabta nahi ho pa raha. Check karein ke Python backend chal raha hai.",
          listings: [] 
      };
  }
};