// src/components/assistant/AssistantWidget.jsx — Floating Gemini AI Assistant Widget
import React, { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../../api/assistant';
import Card from '../common/Card';
import Button from '../common/Button';

const SUGGESTED_QUESTIONS = [
  "What are the best localities in Ahmedabad for 2 BHK?",
  "What is the average rent range in Vastrapur?",
  "How can MoveSmart help me find affordable housing?"
];

export default function AssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Hello! I am your MoveSmart AI Relocation Guide. Ask me anything about Ahmedabad rental housing, localities, or budget advice.'
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = textToSend || inputMsg;
    if (!query.trim()) return;

    const userEntry = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userEntry]);
    setInputMsg('');
    setLoading(true);

    try {
      const res = await sendMessage(query);
      const data = res.data || res;
      setMessages((prev) => [
        ...prev,
        { sender: 'assistant', text: data.reply || 'I could not generate a response.' }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: 'assistant', text: 'The AI assistant is temporarily unavailable. Please try again later.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-2 font-bold text-sm"
        >
          <span className="text-xl">🤖</span>
          <span>Ask AI Guide</span>
        </button>
      ) : (
        <Card className="w-80 sm:w-96 h-[500px] bg-white shadow-2xl rounded-2xl flex flex-col p-0 border border-border overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-white p-4 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <h4 className="font-bold text-sm leading-tight">MoveSmart AI Guide</h4>
                <span className="text-[10px] text-white/80 uppercase font-bold tracking-wider">Powered by Gemini AI</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-full w-7 h-7 flex items-center justify-center font-bold"
            >
              ✕
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface/30">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-xl text-xs font-medium leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-primary text-white rounded-br-none'
                      : 'bg-white border border-border text-text-primary shadow-sm rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-border p-3 rounded-xl rounded-bl-none text-xs text-text-secondary flex items-center gap-2 shadow-sm">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce delay-100">●</span>
                  <span className="animate-bounce delay-200">●</span>
                  <span className="text-[10px] font-bold text-text-secondary">AI Thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggested Prompts */}
          {messages.length < 3 && !loading && (
            <div className="p-2 border-t border-border bg-white flex flex-wrap gap-1">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="text-[10px] bg-surface hover:bg-border text-text-primary px-2 py-1 rounded-full text-left font-medium transition-colors"
                >
                  💡 {q}
                </button>
              ))}
            </div>
          )}

          {/* Footer Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-border bg-white flex gap-2 flex-shrink-0"
          >
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ask housing question..."
              className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
            />
            <Button type="submit" variant="primary" size="sm" loading={loading}>
              Send
            </Button>
          </form>

          {/* Disclaimer */}
          <div className="bg-surface border-t border-border px-3 py-1 text-center">
            <span className="text-[9px] text-text-secondary">
              AI-generated advice based on MoveSmart dataset. Check property details directly.
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}
