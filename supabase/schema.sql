-- ==============================================================================
-- SUPABASE PRODUCTION DATABASE SCHEMA FOR PORTFOLIO VISITOR TRACKING & ADMIN
-- ==============================================================================

-- 1. Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CREATE VISITORS TABLE
-- Tracks unique devices/visitors across visits
CREATE TABLE IF NOT EXISTS public.visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id TEXT UNIQUE NOT NULL,
    first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    visit_count INT NOT NULL DEFAULT 1,
    device_type TEXT DEFAULT 'Desktop',
    browser TEXT DEFAULT 'Unknown',
    operating_system TEXT DEFAULT 'Unknown',
    screen_width INT DEFAULT 0,
    screen_height INT DEFAULT 0,
    country TEXT DEFAULT 'Unknown',
    region TEXT DEFAULT 'Unknown',
    approximate_location TEXT DEFAULT 'Unknown'
);

-- 3. CREATE SESSIONS TABLE
-- Tracks each browser session and duration
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id TEXT NOT NULL REFERENCES public.visitors(visitor_id) ON DELETE CASCADE,
    session_id TEXT UNIQUE NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration INT NOT NULL DEFAULT 0,
    referrer TEXT DEFAULT 'Direct',
    landing_page TEXT DEFAULT '/',
    exit_page TEXT DEFAULT '/',
    page_count INT NOT NULL DEFAULT 1,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT
);

-- 4. CREATE PAGE_VIEWS TABLE
-- Tracks individual page and section views
CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id TEXT NOT NULL,
    session_id TEXT NOT NULL REFERENCES public.sessions(session_id) ON DELETE CASCADE,
    page_path TEXT NOT NULL DEFAULT '/',
    viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    duration INT NOT NULL DEFAULT 0
);

-- 5. CREATE MESSAGES TABLE (Contact Form)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unread'
);

-- ==============================================================================
-- 6. PERFORMANCE INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_visitors_visitor_id ON public.visitors(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitors_last_seen ON public.visitors(last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_first_seen ON public.visitors(first_seen DESC);

CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON public.sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_visitor_id ON public.sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON public.sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON public.sessions(last_activity DESC);

CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON public.page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON public.page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON public.page_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON public.page_views(page_path);

CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_status ON public.messages(status);

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to ensure clean idempotent run
DROP POLICY IF EXISTS "Allow public to insert visitors" ON public.visitors;
DROP POLICY IF EXISTS "Allow public to update their own visitor" ON public.visitors;
DROP POLICY IF EXISTS "Allow authenticated admin full access to visitors" ON public.visitors;

DROP POLICY IF EXISTS "Allow public to insert sessions" ON public.sessions;
DROP POLICY IF EXISTS "Allow public to update their own session" ON public.sessions;
DROP POLICY IF EXISTS "Allow authenticated admin full access to sessions" ON public.sessions;

DROP POLICY IF EXISTS "Allow public to insert page_views" ON public.page_views;
DROP POLICY IF EXISTS "Allow authenticated admin full access to page_views" ON public.page_views;

DROP POLICY IF EXISTS "Allow public to insert messages" ON public.messages;
DROP POLICY IF EXISTS "Allow authenticated admin full access to messages" ON public.messages;

-- A. VISITORS POLICIES
-- Anyone can register/upsert a visitor record
CREATE POLICY "Allow public to insert visitors" 
    ON public.visitors 
    FOR INSERT 
    TO anon, authenticated 
    WITH CHECK (true);

-- Allow public to update last_seen and visit_count for heartbeat/returning visits
CREATE POLICY "Allow public to update their own visitor" 
    ON public.visitors 
    FOR UPDATE 
    TO anon, authenticated 
    USING (true)
    WITH CHECK (true);

-- Only authenticated users (admins) can SELECT or DELETE visitors
CREATE POLICY "Allow authenticated admin full access to visitors" 
    ON public.visitors 
    FOR ALL 
    TO authenticated 
    USING (true)
    WITH CHECK (true);

-- B. SESSIONS POLICIES
-- Anyone can insert new sessions
CREATE POLICY "Allow public to insert sessions" 
    ON public.sessions 
    FOR INSERT 
    TO anon, authenticated 
    WITH CHECK (true);

-- Allow updating session duration, last_activity, exit_page, page_count
CREATE POLICY "Allow public to update their own session" 
    ON public.sessions 
    FOR UPDATE 
    TO anon, authenticated 
    USING (true)
    WITH CHECK (true);

-- Only authenticated users can SELECT or DELETE sessions
CREATE POLICY "Allow authenticated admin full access to sessions" 
    ON public.sessions 
    FOR ALL 
    TO authenticated 
    USING (true)
    WITH CHECK (true);

-- C. PAGE_VIEWS POLICIES
-- Anyone can record a pageview
CREATE POLICY "Allow public to insert page_views" 
    ON public.page_views 
    FOR INSERT 
    TO anon, authenticated 
    WITH CHECK (true);

-- Only authenticated users can SELECT or DELETE page_views
CREATE POLICY "Allow authenticated admin full access to page_views" 
    ON public.page_views 
    FOR ALL 
    TO authenticated 
    USING (true)
    WITH CHECK (true);

-- D. MESSAGES POLICIES
-- Anyone can submit a contact message
CREATE POLICY "Allow public to insert messages" 
    ON public.messages 
    FOR INSERT 
    TO anon, authenticated 
    WITH CHECK (true);

-- Only authenticated users can read, update status, or delete contact messages
CREATE POLICY "Allow authenticated admin full access to messages" 
    ON public.messages 
    FOR ALL 
    TO authenticated 
    USING (true)
    WITH CHECK (true);
