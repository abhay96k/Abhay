import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiLock, FiMail, FiTrash2, FiCheckCircle, FiRefreshCw, 
  FiSearch, FiLogOut, FiX, FiCornerUpLeft, FiUser, FiCalendar, FiInbox, FiEye,
  FiCopy, FiExternalLink, FiCheck
} from 'react-icons/fi';
import type { SavedMessage } from '../utils/database';
import { 
  fetchMessagesFromSupabase, 
  deleteMessageFromSupabase, 
  updateMessageStatusInSupabase 
} from '../utils/database';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminDashboard({ isOpen, onClose }: AdminDashboardProps) {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedMessage, setSelectedMessage] = useState<SavedMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [copied, setCopied] = useState(false);

  const ADMIN_PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE || 'G@bhay143';

  // Check existing session on mount
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('abhay_admin_auth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch messages when authenticated & open
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadMessages();
    }
  }, [isOpen, isAuthenticated]);

  const loadMessages = async () => {
    setIsLoading(true);
    const data = await fetchMessagesFromSupabase();
    setMessages(data);
    setIsLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      setLoginError('');
      sessionStorage.setItem('abhay_admin_auth', 'true');
    } else {
      setLoginError('Invalid admin passcode. Access denied.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('abhay_admin_auth');
    setPasscode('');
    setSelectedMessage(null);
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this message?')) {
      const success = await deleteMessageFromSupabase(id);
      if (success || true) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (selectedMessage?.id === id) setSelectedMessage(null);
      }
    }
  };

  const handleToggleStatus = async (msg: SavedMessage, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newStatus = msg.status === 'unread' ? 'read' : 'unread';
    const success = await updateMessageStatusInSupabase(msg.id, newStatus);
    if (success || true) {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, status: newStatus } : m))
      );
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage({ ...selectedMessage, status: newStatus });
      }
    }
  };

  const handleOpenMessage = (msg: SavedMessage) => {
    setSelectedMessage(msg);
    if (msg.status === 'unread') {
      handleToggleStatus(msg);
    }
  };

  const handleReply = (msg: SavedMessage, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const subject = encodeURIComponent(`Re: ${msg.subject}`);
    const body = encodeURIComponent(`\n\n--- Original Message from ${msg.name} ---\n${msg.message}`);
    window.location.href = `mailto:${msg.email}?subject=${subject}&body=${body}`;
  };

  // Filtered & Searched messages list
  const filteredMessages = messages.filter((msg) => {
    const matchesSearch = 
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterTab === 'unread') return matchesSearch && msg.status === 'unread';
    if (filterTab === 'read') return matchesSearch && msg.status === 'read';
    return matchesSearch;
  });

  const unreadCount = messages.filter((m) => m.status === 'unread').length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      >
        {!isAuthenticated ? (
          /* LOGIN CARD */
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-neutral-200 relative overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-xl text-subLight hover:text-textLight hover:bg-neutral-100 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4 pt-2">
              <div className="p-4 bg-accent/10 text-accent rounded-2xl">
                <FiLock className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-sans font-black text-2xl text-textLight">Admin Portal</h3>
                <p className="text-xs text-subLight font-medium mt-1">
                  Enter your admin passcode to view stored messages.
                </p>
              </div>

              <form onSubmit={handleLogin} className="w-full space-y-4 pt-4">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] uppercase font-extrabold tracking-widest text-accent pl-1">
                    Passcode
                  </label>
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter admin passcode"
                    className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-textLight"
                    autoFocus
                  />
                </div>

                {loginError && (
                  <p className="text-xs text-red-500 font-semibold text-center">{loginError}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-accent hover:bg-amber-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-colors shadow-md"
                >
                  Authenticate Session
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          /* DASHBOARD VIEW */
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-5xl h-[90vh] bg-white rounded-3xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden relative"
          >
            {/* Top Bar */}
            <div className="p-5 sm:p-6 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-4 bg-neutral-50/50">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-accent/10 text-accent rounded-xl">
                  <FiInbox className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-sans font-black text-xl text-textLight">Messages Dashboard</h2>
                  <p className="text-xs text-subLight font-semibold">
                    Viewing messages stored in Supabase
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={loadMessages}
                  disabled={isLoading}
                  className="p-2.5 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-100 text-subLight hover:text-textLight transition-colors flex items-center space-x-2 text-xs font-bold"
                  title="Refresh Messages"
                >
                  <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="p-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 transition-colors flex items-center space-x-2 text-xs font-bold"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>

                <button
                  onClick={onClose}
                  className="p-2.5 bg-neutral-100 border border-neutral-200 rounded-xl hover:bg-neutral-200 text-subLight transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sub-header: Metrics & Search Controls */}
            <div className="p-4 sm:p-6 border-b border-neutral-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white">
              {/* Metrics */}
              <div className="md:col-span-4 flex items-center space-x-3">
                <div className="px-4 py-2 bg-neutral-100 rounded-xl text-xs font-bold text-textLight">
                  Total: <span className="text-accent font-black">{messages.length}</span>
                </div>
                <div className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold">
                  Unread: <span className="font-black">{unreadCount}</span>
                </div>
              </div>

              {/* Search input */}
              <div className="md:col-span-5 relative">
                <FiSearch className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sender, email, subject..."
                  className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-none focus:border-accent text-textLight"
                />
              </div>

              {/* Filter tabs */}
              <div className="md:col-span-3 flex justify-end space-x-1 bg-neutral-100 p-1 rounded-xl">
                {(['all', 'unread', 'read'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilterTab(tab)}
                    className={`flex-1 py-1 px-2.5 text-[11px] font-extrabold uppercase rounded-lg transition-colors capitalize ${
                      filterTab === tab
                        ? 'bg-white text-accent shadow-sm'
                        : 'text-subLight hover:text-textLight'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-neutral-50/50">
              {isLoading ? (
                <div className="h-64 flex flex-col items-center justify-center space-y-3">
                  <div className="w-8 h-8 border-3 border-accent/30 border-t-accent rounded-full animate-spin" />
                  <p className="text-xs text-subLight font-semibold">Loading messages from Supabase...</p>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center space-y-2 text-center p-6 bg-white rounded-2xl border border-neutral-200/80">
                  <FiInbox className="w-10 h-10 text-neutral-300" />
                  <h4 className="font-sans font-extrabold text-base text-textLight">No Messages Found</h4>
                  <p className="text-xs text-subLight max-w-xs">
                    {searchQuery
                      ? 'No messages matching your search keywords.'
                      : 'No messages stored in your Supabase database yet.'}
                  </p>
                </div>
              ) : (
                filteredMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    onClick={() => handleOpenMessage(msg)}
                    whileHover={{ y: -1 }}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      msg.status === 'unread'
                        ? 'bg-white border-amber-300 shadow-sm border-l-4 border-l-accent'
                        : 'bg-white/80 border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                      <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                        msg.status === 'unread' ? 'bg-amber-100 text-amber-700' : 'bg-neutral-100 text-neutral-500'
                      }`}>
                        <FiUser className="w-5 h-5" />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="font-sans font-black text-sm text-textLight truncate">
                            {msg.name}
                          </span>
                          <span className="text-xs font-semibold text-accent underline truncate">
                            {msg.email}
                          </span>
                          {msg.status === 'unread' && (
                            <span className="px-2 py-0.5 bg-accent text-white text-[9px] uppercase font-black tracking-wider rounded-full">
                              New
                            </span>
                          )}
                        </div>

                        <h4 className="font-sans font-bold text-xs sm:text-sm text-textLight truncate">
                          {msg.subject}
                        </h4>

                        <p className="text-xs text-subLight line-clamp-1 font-medium">
                          {msg.message}
                        </p>
                      </div>
                    </div>

                    {/* Actions & Timestamp */}
                    <div className="flex items-center justify-between sm:justify-end space-x-3 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-100">
                      <div className="flex items-center space-x-1.5 text-[10px] text-neutral-400 font-bold">
                        <FiCalendar className="w-3.5 h-3.5" />
                        <span>
                          {msg.created_at
                            ? new Date(msg.created_at).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Recent'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleOpenMessage(msg)}
                          className="p-2 bg-neutral-100 hover:bg-accent hover:text-white rounded-lg text-neutral-600 transition-colors"
                          title="Read Message"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => handleReply(msg, e)}
                          className="p-2 bg-neutral-100 hover:bg-blue-600 hover:text-white rounded-lg text-neutral-600 transition-colors"
                          title="Reply via Email"
                        >
                          <FiCornerUpLeft className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => handleDelete(msg.id, e)}
                          className="p-2 bg-neutral-100 hover:bg-red-600 hover:text-white rounded-lg text-neutral-600 transition-colors"
                          title="Delete Message"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* FULL MESSAGE READER MODAL */}
            <AnimatePresence>
              {selectedMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute inset-0 z-50 bg-white p-6 sm:p-8 flex flex-col justify-between overflow-y-auto"
                >
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                      <button
                        onClick={() => setSelectedMessage(null)}
                        className="flex items-center space-x-2 text-xs font-bold text-subLight hover:text-accent transition-colors"
                      >
                        <FiCornerUpLeft className="w-4 h-4" />
                        <span>Back to All Messages</span>
                      </button>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleStatus(selectedMessage)}
                          className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-textLight text-xs font-extrabold rounded-lg transition-colors flex items-center space-x-1.5"
                        >
                          <FiCheckCircle className="w-4 h-4 text-accent" />
                          <span>Mark as {selectedMessage.status === 'read' ? 'Unread' : 'Read'}</span>
                        </button>

                        <button
                          onClick={() => handleDelete(selectedMessage.id)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-extrabold rounded-lg transition-colors flex items-center space-x-1.5"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Sender Detail */}
                    <div className="space-y-2 bg-neutral-50 p-5 rounded-2xl border border-neutral-100">
                      <span className="text-[10px] uppercase tracking-widest font-black text-accent">
                        Message Details
                      </span>
                      <h3 className="font-sans font-black text-xl text-textLight">
                        {selectedMessage.subject}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-subLight pt-1">
                        <div>Sender: <strong className="text-textLight font-black">{selectedMessage.name}</strong></div>
                        <div>Email: <a href={`mailto:${selectedMessage.email}`} className="text-accent underline font-extrabold">{selectedMessage.email}</a></div>
                        <div>Date: <strong className="text-textLight">{new Date(selectedMessage.created_at).toLocaleString()}</strong></div>
                      </div>
                    </div>

                    {/* Message Body */}
                    <div className="p-6 bg-white border border-neutral-200 rounded-2xl space-y-2 shadow-inner">
                      <span className="text-[10px] uppercase tracking-widest font-extrabold text-subLight">
                        Message Content
                      </span>
                      <p className="text-sm sm:text-base text-textLight leading-relaxed font-medium whitespace-pre-wrap">
                        {selectedMessage.message}
                      </p>
                    </div>

                    {/* Interactive Reply Section */}
                    <div className="p-6 bg-neutral-50/80 border border-neutral-200/80 rounded-2xl space-y-4 shadow-sm">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-[10px] uppercase tracking-widest font-black text-accent">
                          Quick Reply to {selectedMessage.name}
                        </span>
                        
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedMessage.email);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="px-2.5 py-1 bg-white border border-neutral-200 rounded-lg text-xs font-bold text-subLight hover:text-textLight transition-colors flex items-center space-x-1.5 cursor-pointer"
                        >
                          {copied ? <FiCheck className="w-3.5 h-3.5 text-green-600" /> : <FiCopy className="w-3.5 h-3.5" />}
                          <span>{copied ? 'Email Copied!' : `Copy ${selectedMessage.email}`}</span>
                        </button>
                      </div>

                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={4}
                        placeholder={`Type your reply to ${selectedMessage.name} here...`}
                        className="w-full p-4 bg-white border border-neutral-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-textLight resize-none shadow-inner"
                      />

                      <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
                        {/* Open Direct in Web Gmail */}
                        <a
                          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(selectedMessage.email)}&su=${encodeURIComponent(`Re: ${selectedMessage.subject}`)}&body=${encodeURIComponent(replyText ? replyText : `\n\n--- Original Message from ${selectedMessage.name} ---\n${selectedMessage.message}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-sm flex items-center space-x-2"
                        >
                          <FiExternalLink className="w-4 h-4" />
                          <span>Open in Web Gmail</span>
                        </a>

                        {/* Open in Default Mail App */}
                        <a
                          href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(`Re: ${selectedMessage.subject}`)}&body=${encodeURIComponent(replyText ? replyText : `\n\n--- Original Message from ${selectedMessage.name} ---\n${selectedMessage.message}`)}`}
                          className="px-5 py-2.5 bg-accent hover:bg-amber-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-sm flex items-center space-x-2"
                        >
                          <FiMail className="w-4 h-4" />
                          <span>Open Mail App</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-4 border-t border-neutral-100 flex justify-end">
                    <button
                      onClick={() => setSelectedMessage(null)}
                      className="px-6 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-textLight font-extrabold text-xs uppercase tracking-wider rounded-xl transition-colors"
                    >
                      Close Reader
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
