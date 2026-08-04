import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

/**
 * ChatWidget Component — AI Assistant widget interface.
 */
const ChatWidget = ({ onSendMessage, messages = [], loading = false }) => {
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <Card className="flex flex-col h-96 max-w-md w-full">
      <div className="font-bold text-sm text-text-primary pb-2 border-b border-border flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
        MoveSmart AI Assistant
      </div>
      <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-2 text-xs">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[80%] p-2.5 rounded-lg ${
              msg.role === 'user'
                ? 'bg-primary text-surface self-end rounded-br-none'
                : 'bg-gray-100 text-text-primary self-start rounded-bl-none'
            }`}
          >
            {msg.text}
          </div>
        ))}
        {loading && <p className="text-xs text-text-secondary italic">Assistant is thinking...</p>}
      </div>
      <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-border">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about localities, rent ranges..."
          className="flex-1 bg-surface border border-border rounded-md px-3 py-1.5 text-xs text-text-primary outline-none focus:border-primary"
        />
        <Button type="submit" variant="primary" size="sm" loading={loading}>
          Send
        </Button>
      </form>
    </Card>
  );
};

export default ChatWidget;
