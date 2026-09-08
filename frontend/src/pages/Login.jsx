import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import DevFlowLogo from '../components/DevFlowLogo';

// Subtle Original DevFlow "FLOW" Background Motif
const FlowBackground = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
    <svg
      className="absolute w-full h-full text-blue-600/10 dark:text-blue-500/15 transition-colors"
      viewBox="0 0 1440 900"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <path
        d="M-100 220 C 350 40, 750 680, 1150 180 C 1350 30, 1550 420, 1650 310"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="6 6"
      />
      <path
        d="M-40 280 C 400 100, 800 740, 1200 240 C 1400 90, 1600 480, 1700 370"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.7"
      />
    </svg>
  </div>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setLoading(true);

    try {
      await login(email.trim(), password);
      addToast('Welcome back!', 'success');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex bg-[#F7F8FA] dark:bg-[#0F1115] transition-colors select-none">
      {/* Background Flow Motif */}
      <FlowBackground />

      {/* Left Panel - Brand & Product Showcase (55% desktop) */}
      <div className="hidden lg:flex flex-col justify-between w-[55%] p-10 xl:p-14 bg-white dark:bg-[#12161D] border-r border-[#E5E7EB] dark:border-[#2A303A] relative z-10 overflow-hidden">
        {/* Top Brand Header */}
        <div className="flex items-center space-x-3">
          <DevFlowLogo size="md" />
        </div>

        {/* Center Visual Showcase */}
        <div className="my-auto py-6 max-w-[540px]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-900/50 text-[#2563EB] dark:text-blue-400 text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] dark:bg-blue-400" />
            Developer Workspace
          </div>

          <h1 className="text-3xl xl:text-[36px] font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            Your team's work, <br />
            <span className="text-[#2563EB] dark:text-blue-400">in one place.</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 mb-8 font-medium leading-relaxed">
            Plan projects, track issues, and keep delivery moving effortlessly.
          </p>

          {/* Miniature Product Visualization (DevFlow Kanban Surface) */}
          <div className="rounded-[20px] border border-slate-200/80 dark:border-[#2A303A] bg-slate-50/80 dark:bg-[#171B22] p-4 shadow-soft-lg space-y-3">
            {/* Board Header Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-[#2A303A]">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-2">
                  Sprint 4 Board
                </span>
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/50">
                Active
              </span>
            </div>

            {/* 3 Mini Columns */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* TODO Column */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-1">
                  <span>TO DO</span>
                  <span className="bg-slate-200 dark:bg-[#222731] text-slate-600 dark:text-slate-400 text-[10px] px-1.5 py-0.2 rounded-full font-mono">2</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#1C212A] border border-slate-200/80 dark:border-[#2A303A] shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-medium text-slate-400">DEV-104</span>
                    <span className="text-[9px] font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-1.5 py-0.5 rounded">High</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200 leading-snug">JWT Auth Middleware</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#1C212A] border border-slate-200/80 dark:border-[#2A303A] shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-medium text-slate-400">DEV-107</span>
                    <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded">Med</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200 leading-snug">User Profile Settings</p>
                </div>
              </div>

              {/* IN PROGRESS Column */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-blue-600 dark:text-blue-400 px-1">
                  <span>IN PROGRESS</span>
                  <span className="bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 text-[10px] px-1.5 py-0.2 rounded-full font-mono">1</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#1C212A] border border-blue-200 dark:border-blue-900/50 shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-medium text-blue-500">DEV-102</span>
                    <span className="text-[9px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded">Active</span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 leading-snug">Dark Theme Design</p>
                </div>
              </div>

              {/* DONE Column */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 px-1">
                  <span>DONE</span>
                  <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 text-[10px] px-1.5 py-0.2 rounded-full font-mono">2</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#1C212A] border border-slate-200/80 dark:border-[#2A303A] shadow-xs space-y-1.5 opacity-80">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-medium text-slate-400 line-through">DEV-98</span>
                    <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">Done</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-snug line-through">Database Schema</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#1C212A] border border-slate-200/80 dark:border-[#2A303A] shadow-xs space-y-1.5 opacity-80">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-medium text-slate-400 line-through">DEV-95</span>
                    <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">Done</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-snug line-through">API Rate Limiter</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Note */}
        <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          Designed for modern product development teams.
        </div>
      </div>

      {/* Right Panel - Login Form (45% desktop) */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-12 overflow-y-auto relative z-10 my-auto">
        <div className="max-w-[400px] w-full bg-white dark:bg-[#15181E] border border-[#E2E8F0] dark:border-[#2A303A] rounded-[20px] p-8 sm:p-9 shadow-soft-lg space-y-6 animate-fade-in my-auto">
          {/* Brand Logo & Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <DevFlowLogo size="md" />
            <div className="pt-1">
              <h1 className="text-2xl sm:text-[28px] font-semibold text-[#111827] dark:text-[#F5F7FA] tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-[#667085] dark:text-[#A7AFBD] mt-1.5 font-medium">
                Sign in to continue to your workspace.
              </p>
            </div>
          </div>

          {/* Subtle Inline Error Container */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-900/40 flex items-center space-x-2 text-red-700 dark:text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-[#374151] dark:text-[#A7AFBD] mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[46px] px-3.5 text-xs bg-white dark:bg-[#1B1F27] text-[#111827] dark:text-[#F5F7FA] rounded-xl border border-[#D0D5DD] dark:border-[#2A303A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all placeholder:text-slate-400"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#374151] dark:text-[#A7AFBD] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[46px] px-3.5 pr-10 text-xs bg-white dark:bg-[#1B1F27] text-[#111827] dark:text-[#F5F7FA] rounded-xl border border-[#D0D5DD] dark:border-[#2A303A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all placeholder:text-slate-400"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[46px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs sm:text-sm rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center mt-2"
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Register Navigation */}
          <div className="pt-3 text-center text-xs text-[#667085] dark:text-[#A7AFBD] border-t border-[#E5E7EB] dark:border-[#2A303A]">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-[#2563EB] dark:text-blue-400 hover:underline">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
