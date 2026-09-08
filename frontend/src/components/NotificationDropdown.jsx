import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, MessageSquare, ClipboardCheck, Users, RefreshCw, FolderKanban } from 'lucide-react';
import api from '../api/axios';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data?.count || 0);
    } catch (err) {
      console.error("Failed to fetch unread notification count", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // Lightweight polling every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      fetchNotifications();
    }
  };

  const handleMarkAsRead = async (notification, e) => {
    if (e) e.stopPropagation();
    if (!notification.isRead) {
      try {
        await api.patch(`/notifications/${notification.id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Failed to mark notification as read", err);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
    }
  };

  const handleNotificationClick = async (n) => {
    await handleMarkAsRead(n);
    setIsOpen(false);
    if (n.referenceType === 'PROJECT' && n.referenceId) {
      navigate(`/projects/${n.referenceId}`);
    } else if (n.referenceType === 'ISSUE') {
      navigate(`/my-tasks`);
    } else if (n.referenceType === 'SPRINT') {
      navigate(`/sprints`);
    }
  };

  const getRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const now = new Date();
      const past = new Date(dateStr);
      const diffMs = now.getTime() - past.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return past.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'ISSUE_ASSIGNED':
      case 'ISSUE_STATUS_CHANGED':
        return <ClipboardCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'ISSUE_COMMENTED':
        return <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'PROJECT_MEMBER_ADDED':
      case 'PROJECT_MEMBER_REMOVED':
        return <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'SPRINT_STARTED':
      case 'SPRINT_COMPLETED':
        return <RefreshCw className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <FolderKanban className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={handleToggle}
        className="relative text-text-secondaryLight dark:text-text-secondaryDark hover:text-text-primaryLight dark:hover:text-text-primaryDark p-2 rounded-xl transition-colors active-press bg-slate-100/80 dark:bg-[#1B1F27]"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-600 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-[#15181E]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#15181E] border border-border-light dark:border-border-dark rounded-2xl shadow-xl z-50 overflow-hidden text-xs">
          {/* Header */}
          <div className="p-3.5 border-b border-border-light dark:border-border-dark flex items-center justify-between bg-slate-50/50 dark:bg-[#1B1F27]/50">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-text-primaryLight dark:text-text-primaryDark">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-extrabold text-[10px] px-2 py-0.5 rounded-md">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5 mr-1" />
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border-light dark:divide-border-dark">
            {loading ? (
              <div className="p-6 text-center text-text-mutedLight dark:text-text-mutedDark">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-600 dark:text-blue-400 mb-1" />
                <span>Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center space-y-1 text-text-mutedLight dark:text-text-mutedDark">
                <Bell className="w-6 h-6 mx-auto opacity-40 mb-1" />
                <p className="font-medium">No notifications yet</p>
                <p className="text-[11px]">When team members assign tasks or post updates, they'll show up here.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 flex items-start space-x-3 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-[#1B1F27] ${
                    !n.isRead ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                    {getTypeIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={`font-bold truncate ${!n.isRead ? 'text-blue-600 dark:text-blue-400' : 'text-text-primaryLight dark:text-text-primaryDark'}`}>
                        {n.title}
                      </span>
                      <span className="text-[10px] text-text-mutedLight dark:text-text-mutedDark font-mono shrink-0">
                        {getRelativeTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondaryLight dark:text-text-secondaryDark leading-relaxed">
                      {n.message}
                    </p>
                  </div>

                  {!n.isRead && (
                    <span
                      onClick={(e) => handleMarkAsRead(n, e)}
                      className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0 mt-1.5 hover:scale-125 transition-transform"
                      title="Mark as read"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
