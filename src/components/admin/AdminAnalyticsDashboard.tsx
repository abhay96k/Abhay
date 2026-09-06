import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers, FiActivity, FiEye, FiClock, FiRepeat, FiSmartphone, FiMonitor,
  FiTablet, FiGlobe, FiCompass, FiRefreshCw, FiLogOut, FiArrowLeft, FiSearch,
  FiChevronLeft, FiChevronRight, FiInbox, FiMail, FiTrash2,
  FiCheckCircle, FiExternalLink, FiCopy, FiCheck, FiX, FiLayers, FiCalendar
} from 'react-icons/fi';
import {
  fetchAnalyticsOverview,
  fetchTimeseriesData,
  fetchBreakdowns,
  fetchVisitorsList,
  fetchMessagesFromSupabase,
  deleteMessageFromSupabase,
  updateMessageStatusInSupabase,
  type AnalyticsOverview,
  type TimeseriesPoint,
  type BreakdownData,
  type VisitorListItem,
  type SavedMessage,
} from '../../utils/database';

interface AdminAnalyticsDashboardProps {
  onLogout: () => void;
  onBackToPortfolio: () => void;
}

type DateRangeOption = 'today' | 'yesterday' | '7d' | '30d' | '90d' | 'all';

export default function AdminAnalyticsDashboard({ onLogout, onBackToPortfolio }: AdminAnalyticsDashboardProps) {
  // Navigation & Tab State
  const [activeMainTab, setActiveMainTab] = useState<'analytics' | 'messages'>('analytics');
  const [dateRange, setDateRange] = useState<DateRangeOption>('7d');

  // Analytics Data States
  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState<AnalyticsOverview>({
    totalVisitors: 0,
    uniqueVisitors: 0,
    todayVisitors: 0,
    activeVisitors: 0,
    totalPageViews: 0,
    averageDuration: 0,
    returningVisitorsCount: 0,
    returningPercentage: 0,
  });
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>([]);
  const [breakdowns, setBreakdowns] = useState<BreakdownData>({
    deviceBreakdown: [],
    browserBreakdown: [],
    osBreakdown: [],
    topPages: [],
    topReferrers: [],
  });

  // Visitors Table State
  const [visitors, setVisitors] = useState<VisitorListItem[]>([]);
  const [visitorsTotal, setVisitorsTotal] = useState(0);
  const [visitorPage, setVisitorPage] = useState(1);
  const [visitorPageSize] = useState(8);
  const [searchQuery, setSearchQuery] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorListItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Messages Tab State
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [messageSearch, setMessageSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<SavedMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isCopiedEmail, setIsCopiedEmail] = useState(false);

  // Chart Tooltip Hover State
  const [hoveredPoint, setHoveredPoint] = useState<TimeseriesPoint | null>(null);

  // Helper to compute Start & End dates based on selection
  const getDateRangeBounds = useCallback((): { startDate?: Date; endDate?: Date } => {
    const now = new Date();
    const end = new Date(now);

    if (dateRange === 'today') {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return { startDate: start, endDate: end };
    }
    if (dateRange === 'yesterday') {
      const start = new Date(now);
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      const yesterdayEnd = new Date(start);
      yesterdayEnd.setHours(23, 59, 59, 999);
      return { startDate: start, endDate: yesterdayEnd };
    }
    if (dateRange === '7d') {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      return { startDate: start, endDate: end };
    }
    if (dateRange === '30d') {
      const start = new Date(now);
      start.setDate(start.getDate() - 30);
      return { startDate: start, endDate: end };
    }
    if (dateRange === '90d') {
      const start = new Date(now);
      start.setDate(start.getDate() - 90);
      return { startDate: start, endDate: end };
    }
    return {};
  }, [dateRange]);

  // Load All Analytics Data
  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    const { startDate, endDate } = getDateRangeBounds();

    try {
      const [ovData, tsData, bdData, vList, msgList] = await Promise.all([
        fetchAnalyticsOverview(startDate, endDate),
        fetchTimeseriesData(startDate, endDate),
        fetchBreakdowns(startDate, endDate),
        fetchVisitorsList({
          search: searchQuery,
          page: visitorPage,
          pageSize: visitorPageSize,
          deviceFilter,
          startDate,
          endDate,
        }),
        fetchMessagesFromSupabase(),
      ]);

      setOverview(ovData);
      setTimeseries(tsData);
      setBreakdowns(bdData);
      setVisitors(vList.data);
      setVisitorsTotal(vList.total);
      setMessages(msgList);
    } catch (err) {
      console.error('Failed to load analytics dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getDateRangeBounds, searchQuery, visitorPage, visitorPageSize, deviceFilter]);

  // Load data on mount & range change
  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Auto-refresh active count and data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadAnalytics();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadAnalytics]);

  // Copy visitor ID helper
  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Format Duration helper (seconds -> mm:ss or hr:mm:ss)
  const formatDuration = (seconds: number): string => {
    if (!seconds || seconds <= 0) return '0s';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return `${mins}m ${secs}s`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m`;
  };

  const handleToggleMessageStatus = async (msg: SavedMessage, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newStatus = msg.status === 'unread' ? 'read' : 'unread';
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: newStatus } : m));
    if (selectedMessage?.id === msg.id) {
      setSelectedMessage({ ...selectedMessage, status: newStatus });
    }
    await updateMessageStatusInSupabase(msg.id, newStatus);
  };

  const handleDeleteMessage = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this message?')) {
      await deleteMessageFromSupabase(id);
      setMessages(prev => prev.filter(m => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
    }
  };

  // Filtered Messages
  const filteredMessages = messages.filter((msg) => {
    const matchesSearch =
      msg.name.toLowerCase().includes(messageSearch.toLowerCase()) ||
      msg.email.toLowerCase().includes(messageSearch.toLowerCase()) ||
      msg.subject.toLowerCase().includes(messageSearch.toLowerCase()) ||
      msg.message.toLowerCase().includes(messageSearch.toLowerCase());
    const matchesFilter = messageFilter === 'all' || msg.status === messageFilter;
    return matchesSearch && matchesFilter;
  });

  const unreadMessageCount = messages.filter(m => m.status === 'unread').length;

  // Max value for Chart Scale
  const maxVisitorsInChart = Math.max(1, ...timeseries.map(t => Math.max(t.visitors, t.pageViews)));

  return (
    <div className="min-h-screen w-full bg-[#0a0c0f] text-neutral-100 font-sans flex flex-col selection:bg-accent selection:text-white">
      {/* ========================================================================= */}
      {/* 1. TOP EXECUTIVE HEADER                                                   */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-30 bg-[#12151b]/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Branding & Return Button */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={onBackToPortfolio}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
            title="Return to Public Website"
          >
            <FiArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-base sm:text-lg font-black tracking-wide text-white">
                Portfolio Analytics
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-accent/15 text-accent border border-accent/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-medium hidden sm:block">
              Privacy-first real-time tracking & visitor telemetry
            </p>
          </div>
        </div>

        {/* Center: Live Pulse Counter & Main Tabs */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Active Now Pulse */}
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Active: <strong className="font-black">{overview.activeVisitors}</strong></span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-[#161a22] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveMainTab('analytics')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all flex items-center space-x-1.5 ${
                activeMainTab === 'analytics'
                  ? 'bg-accent text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <FiActivity className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>
            <button
              onClick={() => setActiveMainTab('messages')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all flex items-center space-x-1.5 ${
                activeMainTab === 'messages'
                  ? 'bg-accent text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <FiInbox className="w-3.5 h-3.5" />
              <span>Messages</span>
              {unreadMessageCount > 0 && (
                <span className="px-1.5 py-0.2 bg-red-500 text-white text-[9px] font-black rounded-full ml-1">
                  {unreadMessageCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right: Controls & Logout */}
        <div className="flex items-center space-x-2">
          <button
            onClick={loadAnalytics}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-all text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
            title="Refresh Analytics"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-accent' : ''}`} />
            <span className="hidden md:inline">Refresh</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 transition-all text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
          >
            <FiLogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN BODY CONTENT                                                      */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        
        {/* ===================== TAB: ANALYTICS ===================== */}
        {activeMainTab === 'analytics' && (
          <div className="space-y-6">
            {/* Filter Bar: Date Range Picker */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#12151b] p-3 sm:p-4 rounded-2xl border border-white/10">
              <div className="flex items-center space-x-2 text-xs font-bold text-neutral-400">
                <FiCalendar className="w-4 h-4 text-accent" />
                <span>Date Period:</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'today', label: 'Today' },
                  { id: 'yesterday', label: 'Yesterday' },
                  { id: '7d', label: 'Last 7 Days' },
                  { id: '30d', label: 'Last 30 Days' },
                  { id: '90d', label: 'Last 90 Days' },
                  { id: 'all', label: 'All Time' },
                ].map((range) => (
                  <button
                    key={range.id}
                    onClick={() => {
                      setDateRange(range.id as DateRangeOption);
                      setVisitorPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      dateRange === range.id
                        ? 'bg-accent text-white shadow-md'
                        : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Overview Metric Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {/* Total Visits */}
              <div className="bg-[#12151b] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-2 hover:border-white/20 transition-all">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Total Visits</span>
                  <FiUsers className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">{overview.totalVisitors}</div>
                <span className="text-[10px] text-neutral-500 font-semibold">Total recorded sessions</span>
              </div>

              {/* Unique Visitors */}
              <div className="bg-[#12151b] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-2 hover:border-white/20 transition-all">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Unique Users</span>
                  <FiGlobe className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">{overview.uniqueVisitors}</div>
                <span className="text-[10px] text-neutral-500 font-semibold">Distinct browser IDs</span>
              </div>

              {/* Today's Visitors */}
              <div className="bg-[#12151b] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-2 hover:border-white/20 transition-all">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Today</span>
                  <FiActivity className="w-4 h-4 text-accent" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-accent">{overview.todayVisitors}</div>
                <span className="text-[10px] text-neutral-500 font-semibold">Visits since midnight</span>
              </div>

              {/* Total Page Views */}
              <div className="bg-[#12151b] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-2 hover:border-white/20 transition-all">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Page Views</span>
                  <FiEye className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">{overview.totalPageViews}</div>
                <span className="text-[10px] text-neutral-500 font-semibold">Section & route navigations</span>
              </div>

              {/* Avg Session Duration */}
              <div className="bg-[#12151b] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-2 hover:border-white/20 transition-all">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Avg Duration</span>
                  <FiClock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {formatDuration(overview.averageDuration)}
                </div>
                <span className="text-[10px] text-neutral-500 font-semibold">Time spent on site</span>
              </div>

              {/* Returning Rate */}
              <div className="bg-[#12151b] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-2 hover:border-white/20 transition-all">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Returning</span>
                  <FiRepeat className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {overview.returningPercentage}%
                </div>
                <span className="text-[10px] text-neutral-500 font-semibold">{overview.returningVisitorsCount} returning visitors</span>
              </div>
            </div>

            {/* Interactive Timeseries Chart */}
            <div className="bg-[#12151b] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center space-x-2">
                    <FiActivity className="text-accent w-4 h-4" />
                    <span>Traffic & Page Views Over Time</span>
                  </h3>
                  <p className="text-xs text-neutral-400 font-medium mt-0.5">
                    Daily breakdown of unique visitors and total page impressions
                  </p>
                </div>

                <div className="flex items-center space-x-4 text-xs font-bold">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-md bg-accent inline-block" />
                    <span className="text-neutral-300">Visitors</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-md bg-blue-500/60 inline-block" />
                    <span className="text-neutral-300">Page Views</span>
                  </div>
                </div>
              </div>

              {/* Chart Visual Canvas / Bar Area */}
              <div className="relative pt-6 pb-2">
                {timeseries.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-xs text-neutral-500 font-semibold">
                    No traffic activity recorded in this time range.
                  </div>
                ) : (
                  <div className="h-56 flex items-end justify-between gap-2 sm:gap-3 border-b border-white/10 px-2">
                    {timeseries.map((point) => {
                      const visitorHeight = Math.max(8, (point.visitors / maxVisitorsInChart) * 100);
                      const pvHeight = Math.max(8, (point.pageViews / maxVisitorsInChart) * 100);

                      return (
                        <div
                          key={point.date}
                          onMouseEnter={() => setHoveredPoint(point)}
                          onMouseLeave={() => setHoveredPoint(null)}
                          className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                        >
                          <div className="w-full flex items-end justify-center gap-1 h-full pb-1">
                            {/* Visitors Bar */}
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${visitorHeight}%` }}
                              transition={{ duration: 0.5 }}
                              className="w-1/2 max-w-[18px] bg-accent rounded-t-md group-hover:brightness-125 transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                            />
                            {/* Page Views Bar */}
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${pvHeight}%` }}
                              transition={{ duration: 0.5 }}
                              className="w-1/2 max-w-[18px] bg-blue-500/60 rounded-t-md group-hover:brightness-125 transition-all"
                            />
                          </div>

                          {/* X-axis date label */}
                          <span className="text-[10px] text-neutral-400 font-bold truncate max-w-full text-center mt-2">
                            {point.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Floating Tooltip */}
                <AnimatePresence>
                  {hoveredPoint && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-0 right-4 bg-[#1e232d] border border-white/20 rounded-xl px-3.5 py-2 text-xs shadow-xl pointer-events-none z-10"
                    >
                      <div className="font-extrabold text-white mb-1">{hoveredPoint.label} ({hoveredPoint.date})</div>
                      <div className="text-accent font-bold">Visitors: {hoveredPoint.visitors}</div>
                      <div className="text-blue-400 font-bold">Page Views: {hoveredPoint.pageViews}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Breakdown Grids: Devices, Browsers, Top Pages, Sources */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Device Breakdown */}
              <div className="bg-[#12151b] border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center space-x-2 text-sm font-black text-white">
                  <FiMonitor className="text-blue-400 w-4 h-4" />
                  <span>Device Types</span>
                </div>
                <div className="space-y-3">
                  {breakdowns.deviceBreakdown.length === 0 ? (
                    <p className="text-xs text-neutral-500">No device data</p>
                  ) : (
                    breakdowns.deviceBreakdown.map((item) => (
                      <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="flex items-center space-x-1.5 text-neutral-300">
                            {item.name === 'Desktop' && <FiMonitor className="w-3.5 h-3.5 text-blue-400" />}
                            {item.name === 'Mobile' && <FiSmartphone className="w-3.5 h-3.5 text-emerald-400" />}
                            {item.name === 'Tablet' && <FiTablet className="w-3.5 h-3.5 text-purple-400" />}
                            <span>{item.name}</span>
                          </span>
                          <span className="text-neutral-400">{item.percentage}% ({item.count})</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.name === 'Desktop' ? 'bg-blue-500' : item.name === 'Mobile' ? 'bg-emerald-500' : 'bg-purple-500'
                            }`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Browser Breakdown */}
              <div className="bg-[#12151b] border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center space-x-2 text-sm font-black text-white">
                  <FiCompass className="text-accent w-4 h-4" />
                  <span>Browsers</span>
                </div>
                <div className="space-y-3">
                  {breakdowns.browserBreakdown.length === 0 ? (
                    <p className="text-xs text-neutral-500">No browser data</p>
                  ) : (
                    breakdowns.browserBreakdown.slice(0, 4).map((item) => (
                      <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-neutral-300 truncate max-w-[120px]">{item.name}</span>
                          <span className="text-neutral-400">{item.percentage}% ({item.count})</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full" style={{ width: `${item.percentage}%` }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Top Sections & Pages */}
              <div className="bg-[#12151b] border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center space-x-2 text-sm font-black text-white">
                  <FiLayers className="text-purple-400 w-4 h-4" />
                  <span>Top Pages & Sections</span>
                </div>
                <div className="space-y-2.5">
                  {breakdowns.topPages.length === 0 ? (
                    <p className="text-xs text-neutral-500">No pageview data</p>
                  ) : (
                    breakdowns.topPages.slice(0, 4).map((item, idx) => (
                      <div key={item.path} className="flex items-center justify-between text-xs bg-white/5 p-2 rounded-xl">
                        <span className="font-mono text-neutral-300 font-bold truncate max-w-[130px]">
                          {idx + 1}. {item.path}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-extrabold text-[11px]">
                          {item.views} views
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Traffic Referrers */}
              <div className="bg-[#12151b] border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center space-x-2 text-sm font-black text-white">
                  <FiGlobe className="text-cyan-400 w-4 h-4" />
                  <span>Traffic Sources</span>
                </div>
                <div className="space-y-2.5">
                  {breakdowns.topReferrers.length === 0 ? (
                    <p className="text-xs text-neutral-500">No referrer data</p>
                  ) : (
                    breakdowns.topReferrers.slice(0, 4).map((item) => (
                      <div key={item.referrer} className="flex items-center justify-between text-xs bg-white/5 p-2 rounded-xl">
                        <span className="font-semibold text-neutral-300 truncate max-w-[130px]">
                          {item.referrer}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-extrabold text-[11px]">
                          {item.count} visits
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* ========================================================================= */}
            {/* 3. VISITORS EXPLORER TABLE                                                */}
            {/* ========================================================================= */}
            <div className="bg-[#12151b] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-5">
              {/* Header Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center space-x-2">
                    <FiUsers className="text-accent w-4 h-4" />
                    <span>Visitor Sessions Explorer</span>
                  </h3>
                  <p className="text-xs text-neutral-400 font-medium">
                    Detailed breakdown of anonymized visitor sessions, devices, and engagement
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Search input */}
                  <div className="relative min-w-[200px]">
                    <FiSearch className="absolute left-3.5 top-3 text-neutral-500 w-3.5 h-3.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setVisitorPage(1);
                      }}
                      placeholder="Search ID, country, OS..."
                      className="w-full pl-9 pr-4 py-2 bg-[#161a22] border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-accent"
                    />
                  </div>

                  {/* Device Filter */}
                  <div className="relative">
                    <select
                      value={deviceFilter}
                      onChange={(e) => {
                        setDeviceFilter(e.target.value);
                        setVisitorPage(1);
                      }}
                      className="bg-[#161a22] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-neutral-300 focus:outline-none focus:border-accent"
                    >
                      <option value="all">All Devices</option>
                      <option value="Desktop">Desktop</option>
                      <option value="Mobile">Mobile</option>
                      <option value="Tablet">Tablet</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Table Render */}
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0d0f14]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-white/5 text-neutral-400 uppercase text-[10px] tracking-wider font-extrabold border-b border-white/10">
                      <th className="p-3.5">Visitor ID</th>
                      <th className="p-3.5">Location</th>
                      <th className="p-3.5">Device & OS</th>
                      <th className="p-3.5">Browser</th>
                      <th className="p-3.5">Visits</th>
                      <th className="p-3.5">Total Time</th>
                      <th className="p-3.5">Last Active</th>
                      <th className="p-3.5 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {visitors.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-neutral-500 font-semibold">
                          No visitor records found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      visitors.map((v) => (
                        <tr
                          key={v.id}
                          onClick={() => setSelectedVisitor(v)}
                          className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                        >
                          {/* Visitor ID */}
                          <td className="p-3.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold text-accent">
                                {v.visitor_id.substring(0, 12)}...
                              </span>
                              <button
                                onClick={(e) => handleCopyId(v.visitor_id, e)}
                                className="p-1 rounded bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white"
                                title="Copy Full Visitor ID"
                              >
                                {copiedId === v.visitor_id ? (
                                  <FiCheck className="w-3 h-3 text-green-400" />
                                ) : (
                                  <FiCopy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Location */}
                          <td className="p-3.5 text-neutral-300 font-medium">
                            {v.country && v.country !== 'Unknown' ? `${v.country} (${v.region})` : 'Anonymous / Shielded'}
                          </td>

                          {/* Device & OS */}
                          <td className="p-3.5">
                            <div className="flex items-center space-x-1.5 text-neutral-300">
                              {v.device_type === 'Mobile' ? (
                                <FiSmartphone className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <FiMonitor className="w-3.5 h-3.5 text-blue-400" />
                              )}
                              <span>{v.operating_system}</span>
                            </div>
                          </td>

                          {/* Browser */}
                          <td className="p-3.5 text-neutral-300 font-medium">{v.browser}</td>

                          {/* Visits count */}
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-full font-black text-[10px] ${
                              v.visit_count > 1 ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              {v.visit_count > 1 ? `${v.visit_count} visits` : '1st visit'}
                            </span>
                          </td>

                          {/* Total Time */}
                          <td className="p-3.5 text-neutral-300 font-bold">
                            {formatDuration(v.totalDuration || 0)}
                          </td>

                          {/* Last Active */}
                          <td className="p-3.5 text-neutral-400 font-medium">
                            {new Date(v.last_seen).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>

                          {/* Details action */}
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => setSelectedVisitor(v)}
                              className="px-2.5 py-1 bg-white/5 hover:bg-accent hover:text-white rounded-lg text-neutral-400 transition-colors font-bold text-[11px]"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-neutral-400 font-medium">
                  Showing <strong className="text-white">{visitors.length}</strong> of{' '}
                  <strong className="text-white">{visitorsTotal}</strong> visitors
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    disabled={visitorPage <= 1}
                    onClick={() => setVisitorPage(p => Math.max(1, p - 1))}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-300"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold px-2 text-neutral-300">
                    Page {visitorPage} of {Math.max(1, Math.ceil(visitorsTotal / visitorPageSize))}
                  </span>
                  <button
                    disabled={visitorPage >= Math.ceil(visitorsTotal / visitorPageSize)}
                    onClick={() => setVisitorPage(p => p + 1)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-300"
                  >
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ===================== TAB: MESSAGES ===================== */}
        {activeMainTab === 'messages' && (
          <div className="bg-[#12151b] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-5">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center space-x-2">
                  <FiInbox className="text-accent w-4 h-4" />
                  <span>Contact Form Inquiries</span>
                </h3>
                <p className="text-xs text-neutral-400 font-medium">
                  Messages received through the portfolio contact form
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative min-w-[220px]">
                  <FiSearch className="absolute left-3.5 top-3 text-neutral-500 w-3.5 h-3.5" />
                  <input
                    type="text"
                    value={messageSearch}
                    onChange={(e) => setMessageSearch(e.target.value)}
                    placeholder="Search name, email, text..."
                    className="w-full pl-9 pr-4 py-2 bg-[#161a22] border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-accent"
                  />
                </div>

                {/* Filter */}
                <div className="flex bg-[#161a22] p-1 rounded-xl border border-white/10">
                  {(['all', 'unread', 'read'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setMessageFilter(tab)}
                      className={`px-3 py-1 text-[11px] font-extrabold uppercase rounded-lg capitalize transition-colors ${
                        messageFilter === tab
                          ? 'bg-accent text-white shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Messages List */}
            <div className="space-y-3">
              {filteredMessages.length === 0 ? (
                <div className="p-12 text-center text-neutral-500 text-xs font-semibold bg-[#0d0f14] rounded-2xl border border-white/5">
                  No contact messages found.
                </div>
              ) : (
                filteredMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    onClick={() => {
                      setSelectedMessage(msg);
                      if (msg.status === 'unread') handleToggleMessageStatus(msg);
                    }}
                    whileHover={{ y: -1 }}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      msg.status === 'unread'
                        ? 'bg-[#181d26] border-accent/40 border-l-4 border-l-accent shadow-md'
                        : 'bg-[#12151b] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                      <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                        msg.status === 'unread' ? 'bg-accent/20 text-accent' : 'bg-white/5 text-neutral-400'
                      }`}>
                        <FiMail className="w-5 h-5" />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="font-sans font-black text-sm text-white truncate">
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

                        <h4 className="font-bold text-xs sm:text-sm text-neutral-200 truncate">
                          {msg.subject}
                        </h4>

                        <p className="text-xs text-neutral-400 line-clamp-1 font-medium">
                          {msg.message}
                        </p>
                      </div>
                    </div>

                    {/* Actions & Timestamp */}
                    <div className="flex items-center justify-between sm:justify-end space-x-3 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
                      <span className="text-[10px] text-neutral-500 font-bold">
                        {new Date(msg.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMessage(msg);
                          }}
                          className="p-2 bg-white/5 hover:bg-accent hover:text-white rounded-lg text-neutral-300 transition-colors"
                          title="Read Message"
                        >
                          <FiEye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => handleDeleteMessage(msg.id, e)}
                          className="p-2 bg-white/5 hover:bg-red-600 hover:text-white rounded-lg text-neutral-300 transition-colors"
                          title="Delete Message"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* 4. VISITOR INSPECTION MODAL                                               */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedVisitor && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-[#12151b] border border-white/15 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-2xl bg-accent/15 text-accent">
                    <FiUsers className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-white">Visitor Telemetry</h3>
                    <p className="text-xs text-neutral-400 font-mono">{selectedVisitor.visitor_id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedVisitor(null)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-white/5 p-3.5 rounded-2xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Device</span>
                  <div className="text-sm font-bold text-white">{selectedVisitor.device_type}</div>
                </div>
                <div className="bg-white/5 p-3.5 rounded-2xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Operating System</span>
                  <div className="text-sm font-bold text-white">{selectedVisitor.operating_system}</div>
                </div>
                <div className="bg-white/5 p-3.5 rounded-2xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Browser</span>
                  <div className="text-sm font-bold text-white">{selectedVisitor.browser}</div>
                </div>
                <div className="bg-white/5 p-3.5 rounded-2xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Screen Resolution</span>
                  <div className="text-sm font-bold text-white">
                    {selectedVisitor.screen_width} × {selectedVisitor.screen_height}
                  </div>
                </div>
                <div className="bg-white/5 p-3.5 rounded-2xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Location</span>
                  <div className="text-sm font-bold text-white">{selectedVisitor.approximate_location}</div>
                </div>
                <div className="bg-white/5 p-3.5 rounded-2xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Total Visit Count</span>
                  <div className="text-sm font-bold text-accent font-black">{selectedVisitor.visit_count}</div>
                </div>
              </div>

              {/* Latest Session Details */}
              {selectedVisitor.latestSession && (
                <div className="bg-[#161a22] p-4 rounded-2xl border border-white/10 space-y-3">
                  <h4 className="text-xs uppercase font-black text-accent tracking-wider">Latest Session</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>Referrer: <strong className="text-white">{selectedVisitor.latestSession.referrer}</strong></div>
                    <div>Landing: <strong className="text-white">{selectedVisitor.latestSession.landing_page}</strong></div>
                    <div>Exit: <strong className="text-white">{selectedVisitor.latestSession.exit_page}</strong></div>
                    <div>Duration: <strong className="text-white">{formatDuration(selectedVisitor.latestSession.duration)}</strong></div>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="flex justify-between text-xs text-neutral-400 pt-2 border-t border-white/10">
                <div>First Seen: {new Date(selectedVisitor.first_seen).toLocaleString()}</div>
                <div>Last Seen: {new Date(selectedVisitor.last_seen).toLocaleString()}</div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 5. MESSAGE VIEWER MODAL                                                   */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedMessage && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-[#12151b] border border-white/15 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="flex items-center space-x-2 text-xs font-bold text-neutral-400 hover:text-white"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleMessageStatus(selectedMessage)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-extrabold rounded-lg transition-colors flex items-center space-x-1.5"
                  >
                    <FiCheckCircle className="w-4 h-4 text-accent" />
                    <span>Mark as {selectedMessage.status === 'read' ? 'Unread' : 'Read'}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteMessage(selectedMessage.id)}
                    className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-extrabold rounded-lg transition-colors flex items-center space-x-1.5"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* Message Details */}
              <div className="space-y-2 bg-[#161a22] p-4 sm:p-5 rounded-2xl border border-white/10">
                <span className="text-[10px] uppercase tracking-widest font-black text-accent">
                  Subject
                </span>
                <h3 className="font-black text-lg text-white">
                  {selectedMessage.subject}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-neutral-400 pt-1">
                  <div>Sender: <strong className="text-white">{selectedMessage.name}</strong></div>
                  <div>Email: <a href={`mailto:${selectedMessage.email}`} className="text-accent underline">{selectedMessage.email}</a></div>
                  <div>Date: <strong className="text-white">{new Date(selectedMessage.created_at).toLocaleString()}</strong></div>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 bg-[#0d0f14] border border-white/10 rounded-2xl space-y-2">
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-neutral-500">
                  Message Content
                </span>
                <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>

              {/* Quick Reply Box */}
              <div className="p-5 bg-[#161a22] border border-white/10 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest font-black text-accent">
                    Quick Reply
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedMessage.email);
                      setIsCopiedEmail(true);
                      setTimeout(() => setIsCopiedEmail(false), 2000);
                    }}
                    className="text-xs font-bold text-neutral-400 hover:text-white flex items-center space-x-1"
                  >
                    {isCopiedEmail ? <FiCheck className="w-3.5 h-3.5 text-emerald-400" /> : <FiCopy className="w-3.5 h-3.5" />}
                    <span>{isCopiedEmail ? 'Copied' : 'Copy Email'}</span>
                  </button>
                </div>

                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  placeholder={`Write reply to ${selectedMessage.name}...`}
                  className="w-full p-3 bg-[#0d0f14] border border-white/10 rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-accent resize-none"
                />

                <div className="flex justify-end space-x-2 pt-1">
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(selectedMessage.email)}&su=${encodeURIComponent(`Re: ${selectedMessage.subject}`)}&body=${encodeURIComponent(replyText || `\n\n--- Original Message from ${selectedMessage.name} ---\n${selectedMessage.message}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center space-x-1.5"
                  >
                    <FiExternalLink className="w-3.5 h-3.5" />
                    <span>Gmail Web</span>
                  </a>
                  <a
                    href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(`Re: ${selectedMessage.subject}`)}&body=${encodeURIComponent(replyText || `\n\n--- Original Message from ${selectedMessage.name} ---\n${selectedMessage.message}`)}`}
                    className="px-4 py-2 bg-accent hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center space-x-1.5"
                  >
                    <FiMail className="w-3.5 h-3.5" />
                    <span>Mail App</span>
                  </a>
                </div>
              </div>

              {/* Close Modal */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="px-5 py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
