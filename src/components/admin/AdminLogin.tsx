import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiMail, FiEye, FiEyeOff, FiArrowLeft, FiShield, FiAlertCircle } from 'react-icons/fi';
import { supabase } from '../../utils/database';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToPortfolio: () => void;
}

export default function AdminLogin({ onLoginSuccess, onBackToPortfolio }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (!supabase) {
      setErrorMessage('Supabase client is not configured. Please check your environment variables.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(error.message || 'Authentication failed. Please verify your credentials.');
      } else if (data.session) {
        onLoginSuccess();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred during login.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0d0f12] text-white flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans select-none">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/15 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2" />
      
      {/* Return to Portfolio button */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={onBackToPortfolio}
          className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-wider text-neutral-400 hover:text-white px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all backdrop-blur-md cursor-pointer"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Portfolio</span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-[#16191f]/90 border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-2xl relative z-10"
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-8">
          <div className="p-4 bg-accent/15 text-accent rounded-2xl ring-1 ring-accent/30 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
            <FiShield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Admin Portal
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 font-medium mt-1">
              Sign in with your Supabase credentials to access portfolio analytics & messages.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-3 text-red-400 text-xs font-semibold"
          >
            <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email field */}
          <div className="space-y-1.5 text-left">
            <label className="text-[11px] uppercase font-bold tracking-wider text-neutral-300 pl-1">
              Admin Email
            </label>
            <div className="relative">
              <FiMail className="absolute left-4 top-3.5 text-neutral-500 w-4 h-4" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full pl-11 pr-4 py-3 bg-[#0d0f12]/80 border border-white/10 rounded-xl text-sm font-medium focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-white placeholder-neutral-600 transition-all"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5 text-left">
            <label className="text-[11px] uppercase font-bold tracking-wider text-neutral-300 pl-1">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-4 top-3.5 text-neutral-500 w-4 h-4" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-11 pr-11 py-3 bg-[#0d0f12]/80 border border-white/10 rounded-xl text-sm font-medium focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-white placeholder-neutral-600 transition-all"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-neutral-500 hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-accent hover:bg-amber-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-accent/25 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In to Dashboard</span>
            )}
          </button>
        </form>

        {/* Footer info note */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-[11px] text-neutral-500 font-medium">
            Protected by Supabase Authentication & Row Level Security (RLS).
          </p>
        </div>
      </motion.div>
    </div>
  );
}
