// api/assistant.js — API client for AI assistant endpoint (Architecture.md §8: POST /api/assistant/chat)
// Gemini API is called server-side only — frontend never holds the API key (Rules.md §5)
import axios from 'axios';

// TODO: implement sendMessage(message, conversationHistory) → POST /api/assistant/chat
//       Handle Gemini rate-limit/quota errors gracefully with a user-facing fallback message (Rules.md §4)
