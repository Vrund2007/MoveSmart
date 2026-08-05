// src/components/shared/UniversalChatWindow.jsx — Multi-role messaging interface
import React, { useState, useEffect, useRef } from 'react';
import { getConversations, getConversationById, sendMessage } from '../../api/messages';
import Card from '../common/Card';
import Button from '../common/Button';

export default function UniversalChatWindow() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [msgText, setMsgText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchConversations = async () => {
    try {
      const res = await getConversations();
      const list = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
      setConversations(list);
      if (list.length > 0 && !activeId) {
        setActiveId(list[0]._id);
      }
    } catch {
      setConversations([]);
    }
  };

  const fetchActiveChat = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getConversationById(id);
      setActiveChat(res.data || res);
    } catch {
      setActiveChat(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeId) {
      fetchActiveChat(activeId);
    }
  }, [activeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!msgText.trim() || !activeId) return;
    try {
      await sendMessage(activeId, msgText.trim());
      setMsgText('');
      fetchActiveChat(activeId);
      fetchConversations();
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white rounded-xl border border-[#D9D9D9] overflow-hidden shadow-sm">
      {/* Conversations List */}
      <div className="w-80 border-r border-[#D9D9D9] bg-[#EEEEEE]/30 flex flex-col">
        <div className="p-4 border-b border-[#D9D9D9]">
          <h3 className="font-extrabold text-sm text-[#222831]">Conversations Hub</h3>
          <p className="text-[10px] text-gray-500 font-semibold">Multi-role chat network</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#D9D9D9]">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-400">No active conversations.</div>
          ) : (
            conversations.map((c) => {
              const isActive = c._id === activeId;
              const other = c.other_participant || {};
              return (
                <button
                  key={c._id}
                  onClick={() => setActiveId(c._id)}
                  className={`w-full text-left p-3.5 transition-colors flex flex-col space-y-1 ${
                    isActive ? 'bg-[#00ADB5]/10 border-l-4 border-[#00ADB5]' : 'hover:bg-[#EEEEEE]'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-[#222831] truncate">{other.email || 'Participant'}</span>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-gray-200 text-gray-700">
                      {other.role || 'user'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate">{c.last_message || 'No messages yet.'}</p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Active Conversation Window */}
      <div className="flex-1 flex flex-col justify-between bg-white">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-[#D9D9D9] flex justify-between items-center bg-white">
              <div>
                <h4 className="font-extrabold text-sm text-[#222831]">
                  {activeChat.other_participant?.email || 'Conversation'}
                </h4>
                <span className="text-[10px] font-semibold text-[#00ADB5] uppercase">
                  Role: {activeChat.other_participant?.role || 'User'}
                </span>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#EEEEEE]/20">
              {activeChat.messages?.map((m, idx) => (
                <div key={idx} className="flex flex-col space-y-1">
                  <div className="max-w-md bg-white border border-[#D9D9D9] p-3 rounded-lg text-xs text-[#222831] shadow-2xs">
                    {m.text}
                  </div>
                  <span className="text-[9px] text-gray-400 font-mono pl-1">
                    {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-4 border-t border-[#D9D9D9] bg-white flex space-x-2">
              <input
                required
                type="text"
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                placeholder="Type message..."
                className="flex-1 bg-[#EEEEEE] border border-[#D9D9D9] rounded p-2.5 text-xs text-[#222831] focus:ring-1 focus:ring-[#00ADB5]"
              />
              <Button type="submit" variant="primary" size="sm">
                Send Message
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
            Select a conversation to open chat portal.
          </div>
        )}
      </div>
    </div>
  );
}
