import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mountain, Lock, Mail, ArrowRight, UserCheck, Sparkles } from 'lucide-react';

const QUICK_DEMO_USERS = [
  { role: 'FIELD_WORKER', label: 'Field Scout (Arun Bordoloi)', email: 'field@swasthyajal.gov.in', color: 'emerald' },
  { role: 'BLOCK_OFFICER', label: 'Block Officer (Nandita Hazarika)', email: 'block@swasthyajal.gov.in', color: 'blue' },
  { role: 'DISTRICT_OFFICER', label: 'District Officer (Dr. Subhashish Deb)', email: 'district@swasthyajal.gov.in', color: 'amber' },
  { role: 'AUTHORITY', label: 'State SDMA Director (Smt. K. Sangma)', email: 'authority@swasthyajal.gov.in', color: 'purple' },
  { role: 'ADMIN', label: 'System Admin (Dispur HQ)', email: 'admin@swasthyajal.gov.in', color: 'rose' },
  { role: 'PUBLIC', label: 'Public Citizen Portal', email: 'public@swasthyajal.gov.in', color: 'teal' }
];

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, switchDemoRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Use 1-Click Demo Login below.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    await switchDemoRole(role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-rose-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-md shadow-rose-600/25">
            <Mountain className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            NER Landslide AI
          </h1>
          <p className="text-xs text-slate-500">
            Sign in to access regional disaster command controls
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Official Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@swasthyajal.gov.in"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 transition-all"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Fast Demo Login Buttons */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
            <span>Instant SIH Demo Roles</span>
            <span className="text-amber-500">1-Click</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {QUICK_DEMO_USERS.map((u, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuickDemo(u.role)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-750 text-left text-[11px] font-bold text-slate-700 dark:text-slate-300 transition-all truncate flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">{u.label.split('(')[0]}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
