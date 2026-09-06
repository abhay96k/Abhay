import { createClient } from '@supabase/supabase-js';

// ==============================================================================
// 1. DATA MODELS & INTERFACES
// ==============================================================================

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface SavedMessage extends ContactMessage {
  id: string;
  created_at: string;
  status: 'read' | 'unread';
}

export interface VisitorRecord {
  id: string;
  visitor_id: string;
  first_seen: string;
  last_seen: string;
  visit_count: number;
  device_type: string;
  browser: string;
  operating_system: string;
  screen_width: number;
  screen_height: number;
  country: string;
  region: string;
  approximate_location: string;
}

export interface SessionRecord {
  id: string;
  visitor_id: string;
  session_id: string;
  started_at: string;
  last_activity: string;
  ended_at: string | null;
  duration: number;
  referrer: string;
  landing_page: string;
  exit_page: string;
  page_count: number;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface PageViewRecord {
  id: string;
  visitor_id: string;
  session_id: string;
  page_path: string;
  viewed_at: string;
  duration: number;
}

export interface AnalyticsOverview {
  totalVisitors: number;
  uniqueVisitors: number;
  todayVisitors: number;
  activeVisitors: number;
  totalPageViews: number;
  averageDuration: number;
  returningVisitorsCount: number;
  returningPercentage: number;
}

export interface TimeseriesPoint {
  date: string;
  label: string;
  visitors: number;
  pageViews: number;
}

export interface DistributionItem {
  name: string;
  count: number;
  percentage: number;
}

export interface BreakdownData {
  deviceBreakdown: DistributionItem[];
  browserBreakdown: DistributionItem[];
  osBreakdown: DistributionItem[];
  topPages: { path: string; views: number }[];
  topReferrers: { referrer: string; count: number }[];
}

export interface VisitorListItem extends VisitorRecord {
  totalDuration?: number;
  totalPages?: number;
  latestSession?: SessionRecord;
}

// ==============================================================================
// 2. SUPABASE INITIALIZATION
// ==============================================================================

const DEFAULT_SUPABASE_URL = 'https://dcupywuwyewseskrixcx.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_aQ9ZynADnxtXuIatPQwsVw_sdiJu4qW';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==============================================================================
// 3. CONTACT MESSAGES API
// ==============================================================================

function getLocalMessages(): SavedMessage[] {
  try {
    const raw = localStorage.getItem('abhay_portfolio_messages');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalMessage(msg: SavedMessage) {
  try {
    const existing = getLocalMessages();
    const updated = [msg, ...existing.filter((m) => m.id !== msg.id)];
    localStorage.setItem('abhay_portfolio_messages', JSON.stringify(updated));
  } catch (err) {
    console.error('LocalStorage Save Error:', err);
  }
}

export async function saveMessageToSupabase(data: ContactMessage): Promise<boolean> {
  const newMsg: SavedMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: data.name,
    email: data.email,
    subject: data.subject,
    message: data.message,
    status: 'unread',
    created_at: new Date().toISOString(),
  };

  saveLocalMessage(newMsg);

  if (supabase) {
    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            name: data.name,
            email: data.email,
            subject: data.subject,
            message: data.message,
            status: 'unread',
            created_at: newMsg.created_at,
          },
        ]);

      if (!error) return true;
    } catch (err) {
      console.warn('Supabase message insert error:', err);
    }
  }

  return true;
}

export async function fetchMessagesFromSupabase(): Promise<SavedMessage[]> {
  let remoteMessages: SavedMessage[] = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) remoteMessages = data as SavedMessage[];
    } catch (err) {
      console.warn('Supabase fetch messages error:', err);
    }
  }

  const localMessages = getLocalMessages();
  const combinedMap = new Map<string, SavedMessage>();

  localMessages.forEach((m) => combinedMap.set(m.email + m.created_at, m));
  remoteMessages.forEach((m) => combinedMap.set(m.email + m.created_at, m));

  return Array.from(combinedMap.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function deleteMessageFromSupabase(id: string): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);

      if (!error) return true;
    } catch (err) {
      console.warn('Supabase delete message error:', err);
    }
  }
  return false;
}

export async function updateMessageStatusInSupabase(id: string, status: 'read' | 'unread'): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ status })
        .eq('id', id);

      if (!error) return true;
    } catch (err) {
      console.warn('Supabase update message error:', err);
    }
  }
  return false;
}

// ==============================================================================
// 4. ANALYTICS API (AUTHENTICATED ADMIN QUERIES)
// ==============================================================================

/**
 * Fetch real-time active visitors count (active in the last 5 minutes)
 */
export async function fetchActiveVisitorsCount(): Promise<number> {
  if (!supabase) return 0;
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count, error } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .gt('last_activity', fiveMinutesAgo);

    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.warn('Error fetching active visitors:', err);
    return 0;
  }
}

/**
 * Fetch high-level analytics metrics
 */
export async function fetchAnalyticsOverview(startDate?: Date, endDate?: Date): Promise<AnalyticsOverview> {
  const fallback: AnalyticsOverview = {
    totalVisitors: 0,
    uniqueVisitors: 0,
    todayVisitors: 0,
    activeVisitors: 0,
    totalPageViews: 0,
    averageDuration: 0,
    returningVisitorsCount: 0,
    returningPercentage: 0,
  };

  if (!supabase) return fallback;

  try {
    const startIso = startDate ? startDate.toISOString() : null;
    const endIso = endDate ? endDate.toISOString() : null;
    const todayStartIso = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

    // 1. Visitors total & returning count
    let visitorsQuery = supabase.from('visitors').select('id, visit_count, first_seen, last_seen', { count: 'exact' });
    if (startIso) visitorsQuery = visitorsQuery.gte('last_seen', startIso);
    if (endIso) visitorsQuery = visitorsQuery.lte('last_seen', endIso);

    const { data: visitorsData, count: totalUnique } = await visitorsQuery;

    // 2. Today's visitors
    const { count: todayCount } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .gte('started_at', todayStartIso);

    // 3. Sessions stats for total visits, duration, and page views
    let sessionsQuery = supabase.from('sessions').select('duration, page_count, started_at');
    if (startIso) sessionsQuery = sessionsQuery.gte('started_at', startIso);
    if (endIso) sessionsQuery = sessionsQuery.lte('started_at', endIso);

    const { data: sessionsData } = await sessionsQuery;

    // 4. Pageviews count
    let pageViewsQuery = supabase.from('page_views').select('*', { count: 'exact', head: true });
    if (startIso) pageViewsQuery = pageViewsQuery.gte('viewed_at', startIso);
    if (endIso) pageViewsQuery = pageViewsQuery.lte('viewed_at', endIso);

    const { count: totalPageViewsCount } = await pageViewsQuery;

    // 5. Active visitors
    const activeVisitors = await fetchActiveVisitorsCount();

    // Calculate aggregations
    const uniqueVisitors = totalUnique || (visitorsData ? visitorsData.length : 0);
    const returningVisitorsCount = visitorsData ? visitorsData.filter(v => v.visit_count > 1).length : 0;
    const returningPercentage = uniqueVisitors > 0 ? Math.round((returningVisitorsCount / uniqueVisitors) * 100) : 0;

    let totalDuration = 0;
    const sessionCount = sessionsData ? sessionsData.length : 0;
    if (sessionsData && sessionsData.length > 0) {
      totalDuration = sessionsData.reduce((acc, s) => acc + (s.duration || 0), 0);
    }
    const averageDuration = sessionCount > 0 ? Math.round(totalDuration / sessionCount) : 0;

    return {
      totalVisitors: sessionCount,
      uniqueVisitors,
      todayVisitors: todayCount || 0,
      activeVisitors,
      totalPageViews: totalPageViewsCount || 0,
      averageDuration,
      returningVisitorsCount,
      returningPercentage,
    };
  } catch (err) {
    console.error('Error fetching analytics overview:', err);
    return fallback;
  }
}

/**
 * Fetch timeseries data for visitors & page views charts
 */
export async function fetchTimeseriesData(startDate?: Date, endDate?: Date): Promise<TimeseriesPoint[]> {
  if (!supabase) return [];

  try {
    const end = endDate || new Date();
    const start = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const { data: sessions } = await supabase
      .from('sessions')
      .select('started_at')
      .gte('started_at', start.toISOString())
      .lte('started_at', end.toISOString())
      .order('started_at', { ascending: true });

    const { data: pageViews } = await supabase
      .from('page_views')
      .select('viewed_at')
      .gte('viewed_at', start.toISOString())
      .lte('viewed_at', end.toISOString())
      .order('viewed_at', { ascending: true });

    // Group by Day (YYYY-MM-DD)
    const map = new Map<string, { visitors: number; pageViews: number }>();

    // Pre-populate days in range
    const curr = new Date(start);
    curr.setHours(0, 0, 0, 0);
    while (curr <= end) {
      const key = curr.toISOString().split('T')[0];
      map.set(key, { visitors: 0, pageViews: 0 });
      curr.setDate(curr.getDate() + 1);
    }

    sessions?.forEach((s) => {
      const day = s.started_at.split('T')[0];
      if (map.has(day)) {
        map.get(day)!.visitors += 1;
      }
    });

    pageViews?.forEach((pv) => {
      const day = pv.viewed_at.split('T')[0];
      if (map.has(day)) {
        map.get(day)!.pageViews += 1;
      }
    });

    return Array.from(map.entries()).map(([dateStr, val]) => {
      const d = new Date(dateStr);
      const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      return {
        date: dateStr,
        label,
        visitors: val.visitors,
        pageViews: val.pageViews,
      };
    });
  } catch (err) {
    console.error('Error fetching timeseries data:', err);
    return [];
  }
}

/**
 * Fetch breakdowns for devices, browsers, operating systems, top pages, referrers
 */
export async function fetchBreakdowns(startDate?: Date, endDate?: Date): Promise<BreakdownData> {
  const fallback: BreakdownData = {
    deviceBreakdown: [],
    browserBreakdown: [],
    osBreakdown: [],
    topPages: [],
    topReferrers: [],
  };

  if (!supabase) return fallback;

  try {
    const startIso = startDate ? startDate.toISOString() : null;
    const endIso = endDate ? endDate.toISOString() : null;

    // 1. Visitors breakdown (device, browser, OS)
    let visitorsQuery = supabase.from('visitors').select('device_type, browser, operating_system, last_seen');
    if (startIso) visitorsQuery = visitorsQuery.gte('last_seen', startIso);
    if (endIso) visitorsQuery = visitorsQuery.lte('last_seen', endIso);

    const { data: visitors } = await visitorsQuery;
    const totalVisitors = visitors ? visitors.length : 0;

    const deviceMap = new Map<string, number>();
    const browserMap = new Map<string, number>();
    const osMap = new Map<string, number>();

    visitors?.forEach((v) => {
      const device = v.device_type || 'Desktop';
      const browser = v.browser || 'Unknown';
      const os = v.operating_system || 'Unknown';

      deviceMap.set(device, (deviceMap.get(device) || 0) + 1);
      browserMap.set(browser, (browserMap.get(browser) || 0) + 1);
      osMap.set(os, (osMap.get(os) || 0) + 1);
    });

    const formatDistribution = (map: Map<string, number>): DistributionItem[] => {
      return Array.from(map.entries())
        .map(([name, count]) => ({
          name,
          count,
          percentage: totalVisitors > 0 ? Math.round((count / totalVisitors) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count);
    };

    // 2. Top pages from page_views
    let pagesQuery = supabase.from('page_views').select('page_path, viewed_at');
    if (startIso) pagesQuery = pagesQuery.gte('viewed_at', startIso);
    if (endIso) pagesQuery = pagesQuery.lte('viewed_at', endIso);

    const { data: pageViews } = await pagesQuery;
    const pageMap = new Map<string, number>();

    pageViews?.forEach((pv) => {
      const p = pv.page_path || '/';
      pageMap.set(p, (pageMap.get(p) || 0) + 1);
    });

    const topPages = Array.from(pageMap.entries())
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // 3. Top referrers from sessions
    let sessionsQuery = supabase.from('sessions').select('referrer, started_at');
    if (startIso) sessionsQuery = sessionsQuery.gte('started_at', startIso);
    if (endIso) sessionsQuery = sessionsQuery.lte('started_at', endIso);

    const { data: sessions } = await sessionsQuery;
    const refMap = new Map<string, number>();

    sessions?.forEach((s) => {
      const ref = s.referrer || 'Direct';
      refMap.set(ref, (refMap.get(ref) || 0) + 1);
    });

    const topReferrers = Array.from(refMap.entries())
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      deviceBreakdown: formatDistribution(deviceMap),
      browserBreakdown: formatDistribution(browserMap),
      osBreakdown: formatDistribution(osMap),
      topPages,
      topReferrers,
    };
  } catch (err) {
    console.error('Error fetching breakdowns:', err);
    return fallback;
  }
}

/**
 * Fetch paginated & filtered visitors table list
 */
export async function fetchVisitorsList(options: {
  search?: string;
  page: number;
  pageSize: number;
  deviceFilter?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: Date;
  endDate?: Date;
}): Promise<{ data: VisitorListItem[]; total: number }> {
  if (!supabase) return { data: [], total: 0 };

  try {
    const {
      search = '',
      page = 1,
      pageSize = 10,
      deviceFilter = 'all',
      sortBy = 'last_seen',
      sortOrder = 'desc',
      startDate,
      endDate,
    } = options;

    let query = supabase
      .from('visitors')
      .select('*, sessions(started_at, duration, page_count, referrer, landing_page, exit_page)', { count: 'exact' });

    if (startDate) query = query.gte('last_seen', startDate.toISOString());
    if (endDate) query = query.lte('last_seen', endDate.toISOString());

    if (deviceFilter && deviceFilter !== 'all') {
      query = query.eq('device_type', deviceFilter);
    }

    if (search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(`visitor_id.ilike.${term},country.ilike.${term},region.ilike.${term},browser.ilike.${term},operating_system.ilike.${term},approximate_location.ilike.${term}`);
    }

    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    const formattedList: VisitorListItem[] = (data || []).map((item) => {
      const sessions = (item.sessions as SessionRecord[]) || [];
      const totalDuration = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
      const totalPages = sessions.reduce((acc, s) => acc + (s.page_count || 1), 0);
      const latestSession = sessions.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())[0];

      return {
        ...item,
        totalDuration,
        totalPages,
        latestSession,
      };
    });

    return {
      data: formattedList,
      total: count || 0,
    };
  } catch (err) {
    console.error('Error fetching visitors list:', err);
    return { data: [], total: 0 };
  }
}
