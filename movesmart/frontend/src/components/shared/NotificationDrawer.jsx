// src/components/shared/NotificationDrawer.jsx — Universal Notification Drawer & Badge Component
import React, { useState, useEffect } from 'react';
import { getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '../../api/notifications';

export default function NotificationDrawer({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await getNotifications({ type: filterType });
      const payload = res.data || res;
      setNotifications(Array.isArray(payload.notifications) ? payload.notifications : []);
      setUnreadCount(payload.unread_count || 0);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, filterType]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      fetchNotifications();
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      fetchNotifications();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      fetchNotifications();
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-slide-left">
        {/* Header */}
        <div className="p-5 border-b border-[#D9D9D9] flex justify-between items-center bg-white">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl">🔔</span>
              <h3 className="font-extrabold text-base text-[#222831]">Notifications Center</h3>
            </div>
            <p className="text-xs text-gray-500 font-semibold">{unreadCount} unread alerts</p>
          </div>

          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-bold text-[#00ADB5] hover:underline"
              >
                Mark all read
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-black font-bold text-lg p-1">
              ✕
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-3 bg-[#EEEEEE]/50 border-b border-[#D9D9D9] flex space-x-1.5 overflow-x-auto text-[11px] font-bold">
          {['all', 'property', 'visit', 'message', 'approval', 'ai', 'system'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 rounded-full uppercase transition-all ${
                filterType === type ? 'bg-[#00ADB5] text-white shadow-sm' : 'bg-white text-[#393E46] hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center py-12 text-xs text-gray-500">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400">No notifications found.</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                className={`p-3.5 rounded-lg border transition-all relative space-y-1 ${
                  n.is_read ? 'bg-white border-[#D9D9D9]' : 'bg-blue-50/60 border-blue-200 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                    {n.type}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>

                <h4 className="font-bold text-xs text-[#222831] pt-1">{n.title}</h4>
                <p className="text-xs text-[#393E46]">{n.message}</p>

                <div className="flex justify-end space-x-3 pt-2 text-[10px] font-bold">
                  {!n.is_read && (
                    <button onClick={() => handleMarkRead(n._id)} className="text-[#00ADB5] hover:underline">
                      Mark Read
                    </button>
                  )}
                  <button onClick={() => handleDelete(n._id)} className="text-red-500 hover:underline">
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#D9D9D9] bg-white text-center">
          <button onClick={onClose} className="w-full py-2 bg-[#393E46] text-white rounded text-xs font-bold hover:bg-[#222831]">
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}
