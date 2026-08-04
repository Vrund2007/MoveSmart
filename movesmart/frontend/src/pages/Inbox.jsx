// src/pages/Inbox.jsx — Inbox & Messaging Portal for Accommodation Seekers
import React, { useState, useEffect, useRef } from 'react';
import {
  getConversations,
  startConversation,
  getConversationDetail,
  sendMessageToConversation
} from '../api/messages';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Inbox() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchConversations = async () => {
    setLoadingList(true);
    try {
      const res = await getConversations();
      const data = res.data || res;
      setConversations(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setLoadingList(false);
    }
  };

  const openConversation = async (conv) => {
    setLoadingMessages(true);
    setActiveConversation(null);
    try {
      const res = await getConversationDetail(conv._id);
      const data = res.data || res;
      setActiveConversation(data);
    } catch {
      setActiveConversation(conv);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversation) return;
    setSending(true);
    try {
      const res = await sendMessageToConversation(activeConversation._id, messageText.trim());
      const updated = res.data || res;
      setActiveConversation(updated);
      setMessageText('');
      fetchConversations();
    } catch {
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation?.messages]);

  return (
    <div className="flex gap-4 h-[calc(100vh-180px)] font-sans text-[#222831] animate-fade-in">
      {/* Sidebar — Conversation List */}
      <div className="w-80 flex-shrink-0 bg-white border border-border rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-bold text-sm text-text-primary">Inbox</h3>
          <p className="text-xs text-text-secondary mt-0.5">Conversations with owners & brokers</p>
        </div>

        {loadingList ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner size="sm" message="Loading..." />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="text-3xl mb-3">💬</div>
            <p className="text-xs text-text-secondary">No conversations yet. Contact a property owner or broker from a listing page.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {conversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => openConversation(conv)}
                className={`w-full text-left p-4 hover:bg-surface transition-colors ${
                  activeConversation?._id === conv._id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-bold text-text-primary truncate">
                    {conv.other_participant?.email || 'Property Contact'}
                  </span>
                  <span className="text-[9px] text-text-secondary whitespace-nowrap">
                    {conv.updated_at ? new Date(conv.updated_at).toLocaleDateString() : ''}
                  </span>
                </div>
                {conv.listing && (
                  <span className="text-[10px] text-primary font-semibold block mt-0.5 truncate">
                    Re: {conv.listing.title}
                  </span>
                )}
                <p className="text-[10px] text-text-secondary mt-0.5 truncate">{conv.last_message}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat Window */}
      <div className="flex-1 bg-white border border-border rounded-xl flex flex-col overflow-hidden">
        {!activeConversation && !loadingMessages ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="text-5xl mb-4 opacity-50">✉️</div>
            <h4 className="text-sm font-bold text-text-primary">Select a Conversation</h4>
            <p className="text-xs text-text-secondary mt-1">Choose a conversation from the list to read and reply to messages.</p>
          </div>
        ) : loadingMessages ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner size="md" message="Loading messages..." />
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                {(activeConversation.other_participant?.email?.[0] || 'U').toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-sm text-text-primary">
                  {activeConversation.other_participant?.email || 'Property Contact'}
                </h4>
                {activeConversation.listing && (
                  <p className="text-[10px] text-primary font-semibold">
                    Re: {activeConversation.listing.title} — {activeConversation.listing.locality}
                  </p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(!activeConversation.messages || activeConversation.messages.length === 0) ? (
                <div className="text-center text-xs text-text-secondary py-8">No messages yet. Start the conversation below.</div>
              ) : (
                activeConversation.messages.map((msg, idx) => {
                  const isMine = false; // we don't track current user id client-side in this context
                  return (
                    <div key={idx} className="flex items-end gap-2 flex-row-reverse">
                      <div className="max-w-[70%]">
                        <div className={`bg-primary text-white rounded-xl rounded-tr-none px-4 py-2.5 text-xs font-medium shadow-sm`}>
                          {msg.text}
                        </div>
                        <p className="text-[9px] text-text-secondary mt-1 text-right">
                          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-border flex gap-3 items-center">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-surface border border-border rounded-full px-4 py-2 text-xs text-text-primary outline-none focus:border-primary transition-colors"
              />
              <Button type="submit" variant="primary" size="sm" loading={sending}>
                Send →
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
