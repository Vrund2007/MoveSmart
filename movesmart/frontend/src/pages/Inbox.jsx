import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  getConversations,
  getConversationDetail,
  sendMessageToConversation,
  deleteConversation,
} from '../api/messages';
import api from '../lib/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  MessageIcon,
  ArrowLeftIcon,
  MapPinIcon,
  XIcon,
  ImageIcon,
  MicIcon,
  SendIcon,
  TrashIcon,
} from '../components/common/Icons';

export default function Inbox() {
  const { user } = useContext(AuthContext);
  const currentUserId = user?.id || user?._id;

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Media state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImageModal, setPreviewImageModal] = useState(null);
  const fileInputRef = useRef(null);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  const messagesEndRef = useRef(null);

  const fetchConversations = async () => {
    setLoadingList(true);
    try {
      const res = await getConversations();
      const data = res.data || res;
      setConversations(Array.isArray(data) ? data : []);
    } catch {
      /* ignore */
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
    if (e) e.preventDefault();
    if (!messageText.trim() || !activeConversation) return;
    const textToSend = messageText.trim();
    setMessageText('');
    setSending(true);
    try {
      const res = await sendMessageToConversation(activeConversation._id, textToSend, 'text');
      const updatedConv = res?.data || res;
      if (updatedConv && Array.isArray(updatedConv.messages)) {
        setActiveConversation(updatedConv);
      }
      fetchConversations();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteChat = async (convId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this chat conversation?')) return;

    try {
      await deleteConversation(convId);
      if (activeConversation?._id === convId) {
        setActiveConversation(null);
      }
      fetchConversations();
    } catch {
      alert('Failed to delete chat.');
    }
  };

  const handleImageFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeConversation) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('images', file);

      const uploadRes = await api.post('/listings/upload-image', formData, {
        headers: { 'Content-Type': undefined },
      });

      const uploadData = uploadRes.data?.data || uploadRes.data;
      const imageUrl = uploadData.urls?.[0] || uploadData.images?.[0]?.url || uploadData.url;

      if (imageUrl) {
        const res = await sendMessageToConversation(activeConversation._id, 'Photo Attachment', 'image', imageUrl);
        setActiveConversation(res.data || res);
        fetchConversations();
      } else {
        alert('Failed to upload image. Please try again.');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      alert('Failed to upload image.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `voice_note_${Date.now()}.webm`, { type: 'audio/webm' });

        if (activeConversation) {
          setSending(true);
          try {
            const formData = new FormData();
            formData.append('images', audioFile);

            const uploadRes = await api.post('/listings/upload-image', formData, {
              headers: { 'Content-Type': undefined },
            });

            const uploadData = uploadRes.data?.data || uploadRes.data;
            const audioUrl = uploadData.urls?.[0] || uploadData.images?.[0]?.url || uploadData.url;

            if (audioUrl) {
              const res = await sendMessageToConversation(activeConversation._id, 'Voice Note', 'audio', audioUrl);
              setActiveConversation(res.data || res);
              fetchConversations();
            } else {
              alert('Failed to upload voice note audio.');
            }
          } catch (err) {
            console.error('Voice note upload error:', err);
            alert('Failed to send voice note.');
          } finally {
            setSending(false);
          }
        }

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch {
      alert('Microphone access denied or unavailable.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
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

  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    const otherEmail = c.other_participant?.email?.toLowerCase() || '';
    const title = c.listing?.title?.toLowerCase() || '';
    return otherEmail.includes(q) || title.includes(q);
  });

  return (
    <div className="flex gap-4 h-[calc(100vh-140px)] font-sans text-[#222831] animate-fade-in">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={handleImageFileSelect}
      />

      {/* Sidebar — Conversation List */}
      <div className={`${activeConversation ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-shrink-0 bg-white border border-border rounded-2xl flex-col overflow-hidden shadow-xs`}>
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-base text-text-primary flex items-center gap-2">
              <MessageIcon className="w-5 h-5 text-primary" />
              <span>Direct Messages</span>
            </h3>
            <span className="text-[10px] font-extrabold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
              {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'}
            </span>
          </div>

          <input
            type="text"
            placeholder="Search chat by email or listing..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary outline-none focus:border-primary transition-colors font-medium"
          />
        </div>

        {loadingList ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner size="sm" message="Loading..." />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center mb-3">
              <MessageIcon className="w-6 h-6 text-text-secondary" />
            </div>
            <p className="text-xs font-bold text-text-primary mb-1">No Conversations Found</p>
            <p className="text-[11px] text-text-secondary">
              Contact property owners from listing detail pages to start a chat.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {filteredConversations.map((conv) => {
              const isSelected = activeConversation?._id === conv._id;
              const initial = (conv.other_participant?.email?.[0] || 'U').toUpperCase();

              return (
                <div
                  key={conv._id}
                  onClick={() => openConversation(conv)}
                  className={`p-3.5 cursor-pointer hover:bg-surface transition-all flex items-start justify-between gap-3 group relative ${
                    isSelected ? 'bg-teal-50/70 border-l-4 border-l-primary' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00ADB5] to-teal-600 flex items-center justify-center font-bold text-white text-sm shadow-sm flex-shrink-0">
                    {initial}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-xs font-bold text-text-primary truncate">
                        {conv.other_participant?.email || 'User'}
                      </h4>
                      <span className="text-[9px] text-text-secondary font-medium">
                        {conv.updated_at ? new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    {conv.listing && (
                      <span className="text-[10px] text-primary font-bold block truncate mt-0.5">
                        {conv.listing.title}
                      </span>
                    )}

                    <div className="text-[11px] text-text-secondary truncate mt-1 flex items-center gap-1">
                      {conv.last_message === 'Voice Note' ? (
                        <>
                          <MicIcon className="w-3 h-3 text-primary flex-shrink-0" />
                          <span>Voice Note</span>
                        </>
                      ) : conv.last_message === 'Photo Attachment' ? (
                        <>
                          <ImageIcon className="w-3 h-3 text-primary flex-shrink-0" />
                          <span>Photo Attachment</span>
                        </>
                      ) : (
                        <span>{conv.last_message || 'Conversation started.'}</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteChat(conv._id, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg text-xs"
                    title="Delete Conversation"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Chat Window */}
      <div className={`${!activeConversation ? 'hidden md:flex' : 'flex'} flex-1 bg-white border border-border rounded-2xl flex-col overflow-hidden shadow-xs`}>
        {!activeConversation && !loadingMessages ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-3">
            <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center text-[#00ADB5]">
              <MessageIcon className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-text-primary">Select a Conversation</h4>
            <p className="text-xs text-text-secondary max-w-xs">
              Pick a contact from the inbox list to read messages and reply.
            </p>
          </div>
        ) : loadingMessages ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner size="md" message="Loading messages..." />
          </div>
        ) : (
          <>
            {/* Direct Message Header */}
            <div className="p-4 border-b border-border flex justify-between items-center bg-surface">
              <div className="flex items-center gap-3">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setActiveConversation(null)}
                  className="md:hidden p-1.5 rounded-xl text-text-secondary hover:text-primary hover:bg-white border border-border transition-colors flex items-center gap-1 text-xs font-bold"
                  title="Back to Conversations"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  <span>Chats</span>
                </button>

                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00ADB5] to-teal-600 flex items-center justify-center font-extrabold text-white text-base shadow-sm">
                  {(activeConversation.other_participant?.email?.[0] || 'U').toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-text-primary">
                    {activeConversation.other_participant?.email || 'Property Contact'}
                  </h4>
                  {activeConversation.listing ? (
                    <span className="text-[11px] text-primary font-bold flex items-center gap-1">
                      <MapPinIcon className="w-3 h-3 text-primary flex-shrink-0" />
                      <span>{activeConversation.listing.title} ({activeConversation.listing.locality})</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-600 font-semibold">Active Member</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteChat(activeConversation._id)}
                  className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
                  title="Delete Chat"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Delete Chat</span>
                </button>
              </div>
            </div>

            {/* Conversation Messages Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F9FAFB]">
              {(!activeConversation.messages || activeConversation.messages.length === 0) ? (
                <div className="text-center py-12 text-xs text-text-secondary">
                  No messages yet. Send a message to start chatting!
                </div>
              ) : (
                activeConversation.messages.map((msg, idx) => {
                  const isMe = String(msg.sender_id) === String(currentUserId);
                  const textContent = msg.text || msg.content || '';
                  const timeVal = msg.timestamp || msg.created_at;
                  const hasMedia = Boolean(msg.media_url);

                  return (
                    <div
                      key={msg._id || idx}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs space-y-2 shadow-xs ${
                          isMe
                            ? 'bg-gradient-to-r from-[#00ADB5] to-teal-600 text-white rounded-br-none'
                            : 'bg-white border border-border text-text-primary rounded-bl-none'
                        }`}
                      >
                        {/* Media rendering */}
                        {msg.media_type === 'image' && msg.media_url && (
                          <div className="rounded-xl overflow-hidden max-w-xs border border-white/20">
                            <img
                              src={msg.media_url}
                              alt="Attachment"
                              className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => setPreviewImageModal(msg.media_url)}
                            />
                          </div>
                        )}

                        {msg.media_type === 'audio' && msg.media_url && (
                          <div className="py-1">
                            <audio controls src={msg.media_url} className="w-60 sm:w-64 max-w-full" />
                          </div>
                        )}

                        {/* Always display message content if text is present! */}
                        {textContent && (textContent !== 'Photo Attachment' && textContent !== 'Voice Note' || !hasMedia) && (
                          <p className="leading-relaxed font-medium whitespace-pre-wrap">
                            {textContent}
                          </p>
                        )}

                        {/* Message Timestamp */}
                        <div
                          className={`text-[9px] font-semibold text-right ${
                            isMe ? 'text-teal-100' : 'text-text-secondary'
                          }`}
                        >
                          {timeVal
                            ? new Date(timeVal).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Toolbar */}
            <div className="p-3 border-t border-border bg-white flex items-center gap-2">
              {/* Image upload button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage || isRecording}
                className="p-2.5 rounded-xl text-text-secondary hover:text-primary hover:bg-surface border border-border transition-colors disabled:opacity-50 flex items-center gap-1.5 text-xs font-bold"
                title="Attach Photo"
              >
                <ImageIcon className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline">Photo</span>
              </button>

              {/* Voice note recording button */}
              {isRecording ? (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="px-3 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl animate-pulse flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>Stop ({recordingTime}s)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  disabled={uploadingImage || sending}
                  className="p-2.5 rounded-xl text-text-secondary hover:text-primary hover:bg-surface border border-border transition-colors disabled:opacity-50 flex items-center gap-1.5 text-xs font-bold"
                  title="Record Voice Note"
                >
                  <MicIcon className="w-4 h-4 text-primary" />
                  <span className="hidden sm:inline">Voice</span>
                </button>
              )}

              {/* Text Input */}
              <input
                type="text"
                placeholder={isRecording ? "Recording voice note..." : "Type your message..."}
                value={messageText}
                disabled={isRecording}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-text-primary outline-none focus:border-primary font-medium"
              />

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim() || isRecording || sending || uploadingImage}
                className="bg-[#00ADB5] hover:bg-teal-600 text-white font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all disabled:opacity-40 flex items-center gap-1.5 text-xs"
              >
                <SendIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Lightbox Image Preview Modal */}
      {previewImageModal && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImageModal(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={previewImageModal} alt="Preview" className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain" />
            <button
              onClick={() => setPreviewImageModal(null)}
              className="absolute top-2 right-2 bg-black/70 text-white p-2 rounded-full hover:bg-black"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
