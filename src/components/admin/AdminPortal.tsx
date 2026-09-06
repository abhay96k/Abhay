import { useState, useEffect } from 'react';
import { supabase } from '../../utils/database';
import AdminLogin from './AdminLogin';
import AdminAnalyticsDashboard from './AdminAnalyticsDashboard';

interface AdminPortalProps {
  onClose?: () => void;
}

export default function AdminPortal({ onClose }: AdminPortalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check Supabase Auth session on mount
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      if (!supabase) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted) {
          setIsAuthenticated(!!session);
        }
      } catch {
        if (isMounted) {
          setIsAuthenticated(false);
        }
      }
    }

    checkAuth();

    // Listen for auth state changes (login, logout, token refresh)
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (isMounted) {
          setIsAuthenticated(!!session);
        }
      });
      authListener = data;
    }

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
  };

  const handleBackToPortfolio = () => {
    if (onClose) {
      onClose();
    } else {
      window.location.href = '/';
    }
  };

  // Loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen w-full bg-[#0a0c0f] flex flex-col items-center justify-center space-y-3 font-sans">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        <p className="text-xs text-neutral-400 font-semibold">Verifying secure admin session...</p>
      </div>
    );
  }

  // If not authenticated, render Login
  if (!isAuthenticated) {
    return (
      <AdminLogin
        onLoginSuccess={() => setIsAuthenticated(true)}
        onBackToPortfolio={handleBackToPortfolio}
      />
    );
  }

  // If authenticated, render full Analytics Dashboard
  return (
    <AdminAnalyticsDashboard
      onLogout={handleLogout}
      onBackToPortfolio={handleBackToPortfolio}
    />
  );
}
