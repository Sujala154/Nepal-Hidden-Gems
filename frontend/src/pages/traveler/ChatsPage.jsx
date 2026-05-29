/**
 * ChatsPage.jsx
 *
 * A comprehensive messaging interface for travelers, guides, and contributors.
 * Handles real-time communication via Socket.io, chat invitations, notifications,
 * and session-based identity resolution.
 *
 * Structure:
 * - Left Sidebar: Lists active conversations and incoming invitations.
 * - Main Area: Displays message history and input field for the active chat.
 */
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  FaComments,
  FaCheck,
  FaTimes,
  FaUser,
  FaPaperPlane,
  FaShieldAlt,
  FaTrash,
  FaUsers,
} from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useSocket } from '../../context/SocketContext';

// ─────────────────────────────────────────────────────────────────────────────
// IDENTITY RESOLVER
// Resolves the current user's identity from sessionStorage.
// This is done once on mount to ensure a stable reference for "isMe" checks.
// ─────────────────────────────────────────────────────────────────────────────
const resolveIdentity = () => {
  try {
    const raw = sessionStorage.getItem('user');
    if (!raw) return { id: '', name: 'Me', role: 'traveler' };
    const parsed = JSON.parse(raw);
    return {
      id: String(parsed.id || parsed._id || '').trim(),
      name: parsed.name || 'Me',
      role: parsed.role || 'traveler',
    };
  } catch {
    return { id: '', name: 'Me', role: 'traveler' };
  }
};

const ROLE_LABEL = {
  guide: 'Guide',
  traveler: 'Traveler',
  contributor: 'Contributor',
  admin: 'Admin',
};

/**
 * RoleBadge Component
 * Renders a small, role-specific tag with consistent styling.
 */
const RoleBadge = ({ role }) => {
  const colors = {
    guide: 'bg-amber-50 text-amber-600 border-amber-100',
    traveler: 'bg-blue-50 text-blue-600 border-blue-100',
    contributor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${
        colors[role] || 'bg-slate-50 text-slate-400 border-slate-100'
      }`}
    >
      {ROLE_LABEL[role] || role}
    </span>
  );
};

const ChatsPage = () => {
  const location = useLocation();
  const socket = useSocket();
  const scrollRef = useRef(null);

  // ── State ──────────────────────────────────────────────────────────────────
  const [chats, setChats] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [chatIdToDelete, setChatIdToDelete] = useState(null);
  const [bookingContext, setBookingContext] = useState(null);

  // ── Memoized Identity ──────────────────────────────────────────────────────
  const ME = useMemo(() => resolveIdentity(), []);

  // ── Partner Detection ──────────────────────────────────────────────────────
  // Strategy: Identify the participant who is NOT the current logged-in user.
  const getPartner = useCallback(
    (chat) => {
      if (!chat?.participants?.length) return null;
      if (ME.id) {
        const byId = chat.participants.find((p) => String(p._id || p).trim() !== ME.id);
        if (byId) return typeof byId === 'object' ? byId : { _id: byId };
      }
      const byRole = chat.participants.find((p) => p.role !== ME.role);
      if (byRole) return byRole;
      return chat.participants[1] || chat.participants[0];
    },
    [ME.id, ME.role],
  );

  /**
   * Generates a descriptive title for the chat.
   * Special logic applies for private bookings to show "Guide: [Name]" or "Traveler: [Name]".
   */
  const getChatTitle = useCallback(
    (chat) => {
      if (
        bookingContext?.bookingType === 'private' &&
        activeChat?._id === chat._id &&
        location.state?.chatId === chat._id
      ) {
        if (ME.role === 'traveler' && bookingContext.guideName) {
          return `Guide: ${bookingContext.guideName}`;
        }
        if (ME.role === 'guide' && bookingContext.travelerName) {
          return `Traveler: ${bookingContext.travelerName}`;
        }
      }
      if (chat.isGroup && chat.metadata?.groupTitle) {
        return chat.metadata.groupTitle;
      }
      const partner = getPartner(chat);
      return partner?.name || 'Unknown';
    },
    [getPartner, bookingContext, activeChat, location, ME.role],
  );

  const getChatAvatar = (chat) => {
    if (chat.isGroup) {
      return (
        <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center border border-orange-200 shadow-sm shrink-0">
          <FaUsers className="text-orange-600 text-lg" />
        </div>
      );
    }
    const partner = getPartner(chat);
    return (
      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-50 shrink-0">
        {partner?.profileImage ? (
          <img src={partner.profileImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <FaUser className="text-slate-200" />
        )}
      </div>
    );
  };

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [chatsRes, notifRes] = await Promise.all([api.get('/chats'), api.get('/chats/notifications')]);
      if (chatsRes.success) {
        setChats(chatsRes.data);
        setActiveChat((prev) => (prev && !chatsRes.data.find((c) => c._id === prev._id) ? null : prev));
      }
      if (notifRes.success) setNotifications(notifRes.notifData || notifRes.data || []);
    } catch (err) {
      // Error handled silently or via toast in sub-actions
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (chatId) => {
    try {
      const res = await api.get(`/chats/${chatId}/messages`);
      if (res.success) setMessages(res.data);
    } catch (err) {
      // Error handled silently
    }
  }, []);

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Effect: Handles auto-selection of a chat when navigating from the Bookings page.
   */
  useEffect(() => {
    if (location.state?.chatId && chats.length > 0) {
      const foundChat = chats.find((c) => c._id === location.state.chatId);
      if (foundChat) {
        setActiveChat(foundChat);
        fetchMessages(foundChat._id);
        if (location.state.bookingType === 'private') {
          setBookingContext({
            bookingType: 'private',
            guideName: location.state.guideName,
            travelerName: location.state.travelerName,
            destinationName: location.state.destinationName,
          });
        }
      }
    }
  }, [location.state?.chatId, chats, fetchMessages]);

  useEffect(() => {
    if (activeChat && location.state?.chatId && activeChat._id !== location.state.chatId) {
      setBookingContext(null);
    } else if (!location.state?.chatId && bookingContext) {
      setBookingContext(null);
    }
  }, [activeChat, location.state?.chatId, bookingContext]);

  /**
   * Effect: Real-time Socket.io integration.
   * Joins the chat room and listens for incoming messages.
   */
  useEffect(() => {
    if (!socket || !activeChat || activeChat.status !== 'active') return;

    socket.emit('join_chat', activeChat._id);
    fetchMessages(activeChat._id);

    socket.on('receive_message', (newMessage) => {
      if (newMessage.chat === activeChat._id) {
        setMessages((prev) => {
          const exists = prev.find((m) => m._id === newMessage._id);
          if (exists) return prev;
          return [...prev, newMessage];
        });
      }
    });

    return () => {
      socket.emit('leave_chat', activeChat._id);
      socket.off('receive_message');
    };
  }, [socket, activeChat, fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const resolveChatId = (chatId) => {
    if (!chatId) return null;
    if (typeof chatId === 'object') {
      return String(chatId._id || chatId);
    }
    return String(chatId);
  };

  const handleAcceptInvite = async (chatId) => {
    const resolvedId = resolveChatId(chatId);
    if (!resolvedId) {
      toast.error('Unable to accept invitation: invalid chat ID');
      return;
    }

    try {
      const res = await api.put(`/chats/${resolvedId}/accept`);
      if (res.success) {
        toast.success('Invitation accepted! Start chatting.');
        await fetchData();
        const updated = await api.get('/chats');
        if (updated.success) {
          const found = updated.data.find((c) => c._id === resolvedId);
          if (found) setActiveChat(found);
        }
      }
    } catch (err) {
      const errMsg = err?.response?.data?.error || 'Failed to accept invitation';
      toast.error(errMsg);
    }
  };

  const handleDeclineInvite = async (chatId) => {
    const resolvedId = resolveChatId(chatId);
    if (!resolvedId) {
      toast.error('Unable to decline invitation: invalid chat ID');
      return;
    }

    try {
      const res = await api.put(`/chats/${resolvedId}/decline`);
      if (res.success) {
        toast.success('Invitation declined.');
        await fetchData();
      }
    } catch (err) {
      toast.error('Failed to decline invitation');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !activeChat) return;
    const content = message;
    setMessage('');
    try {
      const res = await api.post(`/chats/${activeChat._id}/messages`, { content });
      if (res.success) {
        setMessages((prev) => {
          const exists = prev.find((m) => m._id === res.data._id);
          if (exists) return prev;
          return [...prev, res.data];
        });
      } else {
        toast.error('Failed to send message');
      }
    } catch {
      toast.error('Failed to send message');
    }
  };

  const handleDeleteChat = (chatId) => {
    setChatIdToDelete(chatId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteChat = async () => {
    if (!chatIdToDelete) return;

    try {
      const res = await api.delete(`/chats/${chatIdToDelete}`);
      if (res.success) {
        toast.success('Chat deleted successfully');
        if (activeChat?._id === chatIdToDelete) {
          setActiveChat(null);
          setMessages([]);
        }
        setIsDeleteModalOpen(false);
        setChatIdToDelete(null);
        fetchData();
      }
    } catch (err) {
      toast.error(err?.error || err?.message || 'Failed to delete chat');
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-20">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  const partner = activeChat ? getPartner(activeChat) : null;

  return (
    <div className="h-full">
      <div className="h-[calc(100vh-140px)] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex">
        {/* ── LEFT SIDEBAR ── */}
        <div className="w-72 border-r border-slate-200 flex flex-col bg-slate-50/30">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white/50">
            <h2 className="text-base font-black text-slate-900 uppercase tracking-tighter">Messages</h2>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded text-[9px] font-black uppercase tracking-widest">
              {chats.filter((c) => c.status === 'active').length + chats.filter((c) => c.status === 'pending').length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Incoming Invitations (Guides only) */}
            {ME.role === 'guide' && chats.filter((c) => c.status === 'pending').length > 0 && (
              <div className="p-4 border-b border-slate-100 pb-6 mb-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                  New Invitations
                </h3>
                <div className="space-y-2">
                  {chats
                    .filter((c) => c.status === 'pending')
                    .map((pendingChat) => {
                      const chatPartner = getPartner(pendingChat);
                      return (
                        <div
                          key={pendingChat._id}
                          className="bg-white p-4 rounded-3xl border border-amber-100 shadow-sm shadow-amber-500/5 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-50">
                              {chatPartner?.profileImage ? (
                                <img src={chatPartner.profileImage} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <FaUser className="text-slate-200 text-sm" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900">{chatPartner?.name || 'Traveler'}</p>
                              <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">
                                Wants to Chat
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAcceptInvite(pendingChat._id)}
                              className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1.5"
                            >
                              <FaCheck className="text-[8px]" /> Accept
                            </button>
                            <button
                              onClick={() => handleDeclineInvite(pendingChat._id)}
                              className="px-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100/50 transition-colors"
                              title="Decline invitation"
                            >
                              <FaTimes />
                            </button>
                            <button
                              onClick={() => handleDeleteChat(pendingChat._id)}
                              className="px-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-colors"
                              title="Delete chat"
                            >
                              <FaTrash className="text-[10px]" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Active List */}
            <div className="p-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">
                Active Conversations
              </h3>
              {chats.filter((c) => c.status === 'active').length > 0 ? (
                <div className="space-y-1">
                  {chats
                    .filter((c) => c.status === 'active')
                    .map((chat) => {
                      const chatPartner = getPartner(chat);
                      return (
                        <button
                          key={chat._id}
                          onClick={() => setActiveChat(chat)}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-2xl transition-all group ${
                            activeChat?._id === chat._id
                              ? 'bg-white shadow-lg shadow-slate-200/40 border border-slate-100'
                              : 'hover:bg-white/50'
                          }`}
                        >
                          <div className="relative">
                            {getChatAvatar(chat)}
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-[2.5px] border-white rounded-full shadow-sm" />
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-800 truncate mb-0.5 tracking-tight">
                              {getChatTitle(chat)}
                            </p>
                            <div className="flex items-center gap-1">
                              {chat.isGroup && (
                                <span className="text-[7px] font-black text-orange-500 uppercase bg-orange-50 px-1 rounded-sm">
                                  Group
                                </span>
                              )}
                              <p className="text-[9px] font-medium text-slate-400 truncate opacity-70 group-hover:opacity-100 transition-opacity">
                                {chat.lastMessage?.content || 'Click to start chatting...'}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-20 px-6">
                  <div className="w-14 h-14 bg-slate-100/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-50">
                    <FaComments className="text-slate-300 text-lg" />
                  </div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No active chats yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── MAIN CHAT AREA ── */}
        <div className="flex-1 flex flex-col relative bg-white">
          {activeChat && partner ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-sm shadow-slate-50">
                <div className="flex items-center gap-3">
                  {activeChat.isGroup ? (
                    <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center border border-orange-200 shadow-sm shrink-0">
                      <FaUsers className="text-orange-600 text-base" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100 shrink-0">
                      {partner.profileImage ? (
                        <img src={partner.profileImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <FaUser className="text-slate-200 text-sm" />
                      )}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-0.5 leading-none">
                      <h4 className="text-xs font-black text-slate-900 tracking-tight">{getChatTitle(activeChat)}</h4>
                      {!activeChat.isGroup && <RoleBadge role={partner.role} />}
                    </div>
                    <div className="flex items-center gap-1.5 leading-none">
                      <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                        {activeChat.isGroup ? `${activeChat.participants.length} Active` : 'Active Now'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100">
                    <FaShieldAlt className="text-amber-500 text-[8px]" />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                      {ME.name?.split(' ')[0]}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteChat(activeChat._id)}
                    className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100/50 hover:text-slate-600 transition-all shadow-sm group/trash"
                    title="Delete Chat"
                  >
                    <FaTrash className="text-xs group-hover/trash:scale-110 transition-transform" />
                  </button>
                </div>
              </div>

              {activeChat.status === 'active' ? (
                <>
                  {/* Messages container */}
                  <div
                    ref={scrollRef}
                    className="flex-1 w-full px-6 py-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar bg-slate-50/10"
                  >
                    <div className="mx-auto text-center mb-6 mt-2">
                      <div className="inline-block px-3 py-1 bg-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest rounded-full border border-slate-200">
                        Private Conversation
                      </div>
                    </div>

                    {messages.map((msg, index) => {
                      const senderId = String(msg.sender?._id || '').trim();
                      const isMe = senderId === ME.id;
                      const prevSenderId = index > 0 ? String(messages[index - 1].sender?._id || '').trim() : null;
                      const showAvatar = !isMe && senderId !== prevSenderId;

                      return (
                        <div
                          key={msg._id || index}
                          className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'} transition-all`}
                        >
                          {!isMe ? (
                            <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center overflow-hidden mb-1 border border-slate-100 shrink-0">
                              {showAvatar ? (
                                msg.sender?.profileImage ? (
                                  <img src={msg.sender.profileImage} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <FaUser className="text-[10px] text-slate-200" />
                                )
                              ) : null}
                            </div>
                          ) : (
                            <div className="w-7 shrink-0" />
                          )}

                          <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                            {activeChat.isGroup && !isMe && showAvatar && (
                              <span className="text-[10px] font-black text-[#0b1f3a]/60 mb-1 ml-1 uppercase tracking-tighter">
                                {msg.sender?.name || 'Partner'}
                              </span>
                            )}
                            <div
                              className={`px-3.5 py-2.5 rounded-xl font-medium text-[13px] leading-relaxed shadow-sm ${
                                isMe
                                  ? 'bg-[#0b1f3a] text-white rounded-br-none border border-blue-900/10'
                                  : 'bg-white text-slate-700 rounded-bl-none border border-slate-100'
                              }`}
                            >
                              {msg.content}
                            </div>
                            <span className="text-[8px] font-bold text-slate-300 mt-1 uppercase tracking-tight">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {messages.length === 0 && (
                      <div className="flex-1 flex flex-col items-center justify-center opacity-30 mt-20">
                        <FaComments className="text-4xl text-slate-100 mb-4" />
                        <p className="text-xs font-black text-slate-200 uppercase tracking-widest">
                          Start a new conversation
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Input area */}
                  <div className="p-4 bg-white border-t border-slate-200">
                    <form
                      onSubmit={handleSendMessage}
                      className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100"
                    >
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={`Message...`}
                        className="flex-1 px-3 py-2 bg-transparent border-none focus:outline-none text-[13px] font-medium text-slate-700 placeholder:text-slate-400"
                      />
                      <button
                        disabled={!message.trim()}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95 ${
                          message.trim()
                            ? 'bg-amber-500 text-white shadow-amber-500/20 hover:bg-amber-600'
                            : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                        }`}
                      >
                        <FaPaperPlane className="text-[10px]" />
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                /* Pending state */
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/10">
                  <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-10 shadow-inner group">
                    <FaComments className="w-9 h-9 text-amber-500 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  {ME.role === 'guide' ? (
                    <div className="max-w-xs animate-in slide-in-from-bottom-4 duration-700">
                      <h3 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tight">New Request</h3>
                      <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10 italic">
                        <strong>{partner.name}</strong> wants to start a trip conversation with you.
                      </p>
                      <button
                        onClick={() => handleAcceptInvite(activeChat._id)}
                        className="w-full py-4 bg-amber-500 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-600 transition-all shadow-xl shadow-amber-500/30 active:scale-95 flex items-center justify-center gap-2.5"
                      >
                        <FaCheck className="text-xs" /> Accept & Chat
                      </button>
                    </div>
                  ) : (
                    <div className="max-w-xs animate-in slide-in-from-bottom-4 duration-700">
                      <h3 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tight">
                        Wait for Approval
                      </h3>
                      <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10">
                        Your invitation is pending with <strong>{partner.name}</strong>. You'll be notified once they
                        accept.
                      </p>
                      <div className="inline-flex items-center gap-3 px-8 py-3 bg-white rounded-full border border-slate-100 text-[10px] font-black text-slate-300 uppercase tracking-widest shadow-sm">
                        <div className="w-2 h-2 bg-amber-400 rounded-full animate-ping" /> Waiting for approval
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Empty selection state */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-20">
              <div className="w-24 h-24 bg-slate-50/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <FaComments className="w-10 h-10 text-slate-200 relative z-10" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 px-6 py-2 bg-slate-50 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-200">
                  Choose a contact to start
                </div>
              </div>
            </div>
          )}
        </div>

        <style
          dangerouslySetInnerHTML={{
            __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f5f9; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #e2e8f0; }
            `,
          }}
        />

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDeleteChat}
          title="Confirm Deletion"
          message="Are you sure you want to delete this chat? This will permanently remove all messages for everyone in the conversation."
          confirmText="Delete Forever"
          cancelText="Nevermind, Keep it"
          type="danger"
        />
      </div>
    </div>
  );
};

export default ChatsPage;
