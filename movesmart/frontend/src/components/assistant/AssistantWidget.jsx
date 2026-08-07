// src/components/assistant/AssistantWidget.jsx — Draggable AI Assistant Widget
import React, { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../../api/assistant';
import Card from '../common/Card';
import Button from '../common/Button';
import { MessageIcon, XIcon, ArrowLeftIcon } from '../common/Icons';

const SUGGESTED_QUESTIONS = [
  "What are the best localities in Ahmedabad for 2 BHK?",
  "What is the average rent range in Vastrapur?",
  "How do I schedule a property visit on MoveSmart?"
];

export default function AssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Hello! I am your MoveSmart AI Guide. Ask me anything about MoveSmart property listings, localities, or relocation services.'
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Draggable State (X and Y offsets)
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const initialMousePos = useRef({ x: 0, y: 0 });
  const initialWidgetPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Drag Event Handlers (Support Mouse & Touch)
  const handleMouseDown = (e) => {
    // Only initiate drag if clicking header/button, not inputs or message text
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON') {
      if (e.target.dataset.noDrag) return;
    }

    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    initialMousePos.current = { x: clientX, y: clientY };
    initialWidgetPos.current = { x: position.x, y: position.y };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - initialMousePos.current.x;
      const deltaY = clientY - initialMousePos.current.y;

      setPosition({
        x: initialWidgetPos.current.x + deltaX,
        y: initialWidgetPos.current.y + deltaY,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

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
    } catch (err) {
      const serverMsg = err.response?.data?.data?.reply || err.response?.data?.message;
      setMessages((prev) => [
        ...prev,
        { sender: 'assistant', text: serverMsg || 'The MoveSmart AI Guide is temporarily unavailable. Please try again in a moment.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={dragRef}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
      className="fixed bottom-6 right-6 z-50 font-sans transition-transform duration-75 select-none"
    >
      {!isOpen ? (
        <button
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          onClick={() => {
            if (!isDragging) setIsOpen(true);
          }}
          className="bg-[#00ADB5] hover:bg-teal-600 text-white px-5 py-3.5 rounded-full shadow-2xl transition-all flex items-center gap-2.5 font-bold text-xs border border-white/20 active:scale-95"
          title="Drag anywhere or click to open MoveSmart AI Guide"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <MessageIcon className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="tracking-wide">Ask AI Guide</span>
        </button>
      ) : (
        <Card className="w-80 sm:w-96 h-[500px] bg-white shadow-2xl rounded-2xl flex flex-col p-0 border border-border overflow-hidden">
          {/* Draggable Header Bar */}
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            className="bg-slate-900 text-white p-4 flex justify-between items-center flex-shrink-0 cursor-grab active:cursor-grabbing border-b border-slate-800"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#00ADB5] flex items-center justify-center shadow-xs">
                <MessageIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm leading-tight text-white">MoveSmart AI Guide</h4>
                <span className="text-[9px] text-teal-400 font-extrabold uppercase tracking-wider block mt-0.5">Powered by LLaMA-3.3 AI</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-300 hover:text-white hover:bg-white/10 rounded-xl w-7 h-7 flex items-center justify-center transition-colors"
              title="Close AI Assistant"
              data-no-drag="true"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F9FAFB]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-xs ${
                    m.sender === 'user'
                      ? 'bg-[#00ADB5] text-white rounded-br-none'
                      : 'bg-white border border-border text-text-primary rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-border p-3 rounded-2xl rounded-bl-none text-xs text-text-secondary flex items-center gap-2 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#00ADB5] animate-ping" />
                  <span className="text-[10px] font-extrabold text-text-secondary">AI Thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggested Prompts — Always On */}
          {!loading && (
            <div className="p-2 border-t border-border bg-white flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="text-[10px] bg-surface hover:bg-teal-50 hover:text-[#00ADB5] text-text-primary px-2.5 py-1 rounded-xl text-left font-semibold transition-colors border border-border/60 shadow-2xs"
                  data-no-drag="true"
                >
                  {q}
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
              placeholder="Ask MoveSmart question..."
              className="flex-1 bg-surface border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:border-primary font-medium"
              data-no-drag="true"
            />
            <Button type="submit" variant="primary" size="sm" loading={loading} className="font-bold text-xs rounded-xl px-4" data-no-drag="true">
              Send
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
