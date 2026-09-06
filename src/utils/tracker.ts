import { supabase } from './database';

export interface VisitorInfo {
  visitorId: string;
  sessionId: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  browser: string;
  operatingSystem: string;
  screenWidth: number;
  screenHeight: number;
  country: string;
  region: string;
  approximateLocation: string;
  referrer: string;
  landingPage: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

// Storage Keys
const VISITOR_ID_KEY = 'abhay_vid';
const SESSION_ID_KEY = 'abhay_sid';
const GEO_CACHE_KEY = 'abhay_geo_cache';

/**
 * Generate a unique cryptographically random UUID
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create unique persistent Visitor ID (stored in localStorage)
 */
export function getVisitorId(): { visitorId: string; isReturning: boolean } {
  try {
    const existing = localStorage.getItem(VISITOR_ID_KEY);
    if (existing) {
      return { visitorId: existing, isReturning: true };
    }
    const newId = `vid_${generateUUID()}`;
    localStorage.setItem(VISITOR_ID_KEY, newId);
    return { visitorId: newId, isReturning: false };
  } catch {
    return { visitorId: `vid_${generateUUID()}`, isReturning: false };
  }
}

/**
 * Get or create Session ID (stored in sessionStorage)
 */
export function getSessionId(): { sessionId: string; isNewSession: boolean } {
  try {
    const existing = sessionStorage.getItem(SESSION_ID_KEY);
    if (existing) {
      return { sessionId: existing, isNewSession: false };
    }
    const newSessionId = `sid_${generateUUID()}`;
    sessionStorage.setItem(SESSION_ID_KEY, newSessionId);
    return { sessionId: newSessionId, isNewSession: true };
  } catch {
    return { sessionId: `sid_${generateUUID()}`, isNewSession: true };
  }
}

/**
 * Detect Device Type
 */
function getDeviceType(): 'Desktop' | 'Mobile' | 'Tablet' {
  if (typeof window === 'undefined') return 'Desktop';
  const ua = navigator.userAgent;
  const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i.test(ua);
  if (isTablet) return 'Tablet';
  const isMobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(ua);
  if (isMobile || window.innerWidth < 768) return 'Mobile';
  return 'Desktop';
}

/**
 * Detect Browser
 */
function getBrowser(): string {
  if (typeof window === 'undefined') return 'Unknown';
  const ua = navigator.userAgent;
  if (ua.includes('Edg/')) return 'Microsoft Edge';
  if (ua.includes('OPR/') || ua.includes('Opera/')) return 'Opera';
  if (ua.includes('Chrome/')) return 'Chrome';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('MSIE') || ua.includes('Trident/')) return 'Internet Explorer';
  return 'Other Browser';
}

/**
 * Detect Operating System
 */
function getOperatingSystem(): string {
  if (typeof window === 'undefined') return 'Unknown';
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'macOS';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/Android/i.test(ua)) return 'Android';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Other OS';
}

/**
 * Extract UTM and Source Parameters
 */
function getUTMParams(): { utmSource?: string; utmMedium?: string; utmCampaign?: string } {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get('utm_source') || undefined,
    utmMedium: params.get('utm_medium') || undefined,
    utmCampaign: params.get('utm_campaign') || undefined,
  };
}

/**
 * Get privacy-conscious approximate Geo Location without blocking
 */
async function getApproximateLocation(): Promise<{ country: string; region: string; approximateLocation: string }> {
  try {
    const cached = sessionStorage.getItem(GEO_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fast non-blocking timeout of 2 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const location = {
        country: data.country_name || data.country || 'Unknown',
        region: data.region || data.city || 'Unknown',
        approximateLocation: data.city && data.country_name ? `${data.city}, ${data.country_name}` : (data.country_name || 'Unknown'),
      };
      sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(location));
      return location;
    }
  } catch {
    // Graceful fallback on network block or ad-blocker
  }

  return { country: 'Unknown', region: 'Unknown', approximateLocation: 'Unknown' };
}

// In-memory state tracking
class AnalyticsTracker {
  private visitorId: string = '';
  private sessionId: string = '';
  private sessionStartTime: number = Date.now();
  private lastActivityTime: number = Date.now();
  private pageCount: number = 0;
  private currentPath: string = '/';
  private heartbeatInterval: number | null = null;
  private isInitialized: boolean = false;

  public async initialize(): Promise<void> {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // Do NOT track if visitor is on the admin dashboard to keep analytics clean
    if (window.location.pathname.startsWith('/admin') || window.location.hash === '#admin') {
      return;
    }

    try {
      const { visitorId, isReturning } = getVisitorId();
      const { sessionId, isNewSession } = getSessionId();
      this.visitorId = visitorId;
      this.sessionId = sessionId;
      this.currentPath = window.location.pathname + window.location.hash || '/';
      this.sessionStartTime = Date.now();
      this.lastActivityTime = Date.now();

      const deviceType = getDeviceType();
      const browser = getBrowser();
      const operatingSystem = getOperatingSystem();
      const screenWidth = window.screen?.width || window.innerWidth;
      const screenHeight = window.screen?.height || window.innerHeight;
      const referrer = document.referrer ? new URL(document.referrer, window.location.href).hostname : 'Direct';
      const utms = getUTMParams();

      // Start non-blocking location lookup
      const geo = await getApproximateLocation();

      if (supabase) {
        // 1. Record / Update Visitor
        if (!isReturning) {
          await supabase.from('visitors').insert([
            {
              visitor_id: visitorId,
              first_seen: new Date().toISOString(),
              last_seen: new Date().toISOString(),
              visit_count: 1,
              device_type: deviceType,
              browser,
              operating_system: operatingSystem,
              screen_width: screenWidth,
              screen_height: screenHeight,
              country: geo.country,
              region: geo.region,
              approximate_location: geo.approximateLocation,
            },
          ]);
        } else if (isNewSession) {
          // Increment visit count for returning visitor
          try {
            await supabase.rpc('increment_visitor_count', { vid: visitorId });
          } catch {
            // Fallback direct update
            await supabase
              .from('visitors')
              .update({
                last_seen: new Date().toISOString(),
              })
              .eq('visitor_id', visitorId);
          }
        }

        // 2. Record Session if new
        if (isNewSession) {
          await supabase.from('sessions').insert([
            {
              visitor_id: visitorId,
              session_id: sessionId,
              started_at: new Date(this.sessionStartTime).toISOString(),
              last_activity: new Date(this.lastActivityTime).toISOString(),
              duration: 0,
              referrer,
              landing_page: this.currentPath,
              exit_page: this.currentPath,
              page_count: 1,
              utm_source: utms.utmSource,
              utm_medium: utms.utmMedium,
              utm_campaign: utms.utmCampaign,
            },
          ]);
        }

        // 3. Record Initial Page View
        await this.trackPageView(this.currentPath);
      }

      // Setup Heartbeat and Activity Listeners
      this.setupHeartbeat();
      this.setupActivityListeners();
    } catch (err) {
      // Analytics errors must never affect the user experience
      console.warn('[Analytics] Initialization skipped:', err);
    }
  }

  /**
   * Track Page or Section View
   */
  public async trackPageView(path: string): Promise<void> {
    if (!this.visitorId || !this.sessionId || !supabase) return;
    if (path.startsWith('/admin')) return;

    this.currentPath = path;
    this.pageCount += 1;
    this.lastActivityTime = Date.now();

    try {
      await supabase.from('page_views').insert([
        {
          visitor_id: this.visitorId,
          session_id: this.sessionId,
          page_path: path,
          viewed_at: new Date().toISOString(),
          duration: 0,
        },
      ]);

      // Update session exit page and page count
      await supabase
        .from('sessions')
        .update({
          exit_page: path,
          last_activity: new Date().toISOString(),
          page_count: this.pageCount,
        })
        .eq('session_id', this.sessionId);
    } catch {
      // Fail silently
    }
  }

  /**
   * Periodic Heartbeat to maintain active visitor status and session duration
   * Runs every 35 seconds
   */
  private setupHeartbeat(): void {
    if (this.heartbeatInterval) return;

    this.heartbeatInterval = window.setInterval(async () => {
      // Don't send heartbeat if tab is hidden
      if (document.hidden) return;

      const now = Date.now();
      const durationSeconds = Math.max(0, Math.floor((now - this.sessionStartTime) / 1000));
      this.lastActivityTime = now;

      if (supabase && this.sessionId) {
        try {
          await supabase
            .from('sessions')
            .update({
              last_activity: new Date(now).toISOString(),
              duration: durationSeconds,
            })
            .eq('session_id', this.sessionId);

          await supabase
            .from('visitors')
            .update({
              last_seen: new Date(now).toISOString(),
            })
            .eq('visitor_id', this.visitorId);
        } catch {
          // Fail silently
        }
      }
    }, 35000);
  }

  /**
   * Listen to user interactions to refresh active status
   */
  private setupActivityListeners(): void {
    const handleActivity = () => {
      this.lastActivityTime = Date.now();
    };

    window.addEventListener('scroll', handleActivity, { passive: true });
    window.addEventListener('click', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity, { passive: true });

    // Handle Page Unload / Hide
    const handleUnload = () => {
      const now = Date.now();
      const durationSeconds = Math.max(0, Math.floor((now - this.sessionStartTime) / 1000));
      
      if (supabase && this.sessionId) {
        try {
          supabase
            .from('sessions')
            .update({
              ended_at: new Date(now).toISOString(),
              last_activity: new Date(now).toISOString(),
              duration: durationSeconds,
              exit_page: this.currentPath,
            })
            .eq('session_id', this.sessionId)
            .then(() => {});
        } catch {
          // Ignore
        }
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        handleUnload();
      }
    });
  }

  public cleanup(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

export const tracker = new AnalyticsTracker();
