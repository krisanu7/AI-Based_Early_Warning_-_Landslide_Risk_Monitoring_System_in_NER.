import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Mountain, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  ArrowRight, 
  UserCheck, 
  CheckCircle2,
  UserPlus,
  LogIn,
  ArrowLeft,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

const QUICK_DEMO_USERS = [
  { role: 'FIELD_WORKER', label: 'Field Scout (Arun Bordoloi)', email: 'field@swasthyajal.gov.in', color: 'emerald' },
  { role: 'BLOCK_OFFICER', label: 'Block Officer (Nandita Hazarika)', email: 'block@swasthyajal.gov.in', color: 'blue' },
  { role: 'DISTRICT_OFFICER', label: 'District Officer (Dr. Subhashish Deb)', email: 'district@swasthyajal.gov.in', color: 'amber' },
  { role: 'AUTHORITY', label: 'State SDMA Director (Smt. K. Sangma)', email: 'authority@swasthyajal.gov.in', color: 'purple' },
  { role: 'ADMIN', label: 'System Admin (Dispur HQ)', email: 'admin@swasthyajal.gov.in', color: 'rose' },
  { role: 'PUBLIC', label: 'Public Citizen Portal', email: 'public@swasthyajal.gov.in', color: 'teal' }
];

const ROLES_OPTIONS = [
  { id: 'FIELD_WORKER', label: 'Field Worker / Ground Surveyor' },
  { id: 'BLOCK_OFFICER', label: 'Block Disaster Officer' },
  { id: 'DISTRICT_OFFICER', label: 'District Disaster Officer (DDMA)' },
  { id: 'AUTHORITY', label: 'State / Regional Authority (SDMA)' },
  { id: 'ADMIN', label: 'System Administrator' },
  { id: 'PUBLIC', label: 'Public Citizen / Resident Scout' }
];

const NE_STATES = [
  'Assam',
  'Meghalaya',
  'Arunachal Pradesh',
  'Sikkim',
  'Nagaland',
  'Manipur',
  'Mizoram',
  'Tripura'
];

export const LoginPage = ({ initialMode = 'login' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, switchDemoRole } = useAuth();

  const isRegisterRoute = location.pathname === '/register' || initialMode === 'register';
  const [mode, setMode] = useState(isRegisterRoute ? 'register' : 'login');
  
  useEffect(() => {
    if (location.pathname === '/register') {
      setMode('register');
    } else if (location.pathname === '/login') {
      setMode('login');
    }
  }, [location.pathname]);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form State
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'DISTRICT_OFFICER',
    state: 'Assam',
    district: 'Dima Hasao',
    village: 'Haflong',
    phone: '',
    designation: ''
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login({ email: loginEmail, password: loginPassword });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check credentials or use 1-Click Demo Login.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await register(regData);
      setSuccess('Account registered successfully! Accessing Command Dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 600);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Email may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    await switchDemoRole(role);
    navigate('/dashboard');
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError(null);
    setSuccess(null);
    if (newMode === 'register' && location.pathname !== '/register') {
      navigate('/register', { replace: true });
    } else if (newMode === 'login' && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#070e13] text-slate-100 flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Top back navigation */}
      <div className="w-full max-w-xl mb-4 flex items-center justify-between relative z-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors py-1.5 px-3 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <span className="text-[11px] font-mono font-bold text-emerald-400/90 tracking-wider px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25">
          SIH PS 26001
        </span>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-xl bg-[#0a1217]/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-800/90 shadow-2xl shadow-black/80 space-y-6 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <img 
            src="/logo.png" 
            alt="SafeSlope Logo" 
            className="h-16 w-auto mx-auto object-contain drop-shadow-md rounded-xl" 
          />
          <h1 className="text-2xl font-black text-white tracking-tight">
            SafeSlope NER
          </h1>
          <p className="text-xs text-slate-400">
            Northeast Early Warning & Landslide Surveillance Portal
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Register Account */}
        <div className="flex rounded-2xl bg-slate-900/80 border border-slate-800 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              mode === 'login'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              mode === 'register'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Account</span>
          </button>
        </div>

        {/* Notification Alerts */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* SIGN IN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Official Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="district@swasthyajal.gov.in"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900/90 text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900/90 text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={regData.name}
                    onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                    placeholder="Dr. Animesh Phukan"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900/90 text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Official Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={regData.email}
                    onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                    placeholder="krisanusamanta2@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900/90 text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={regData.password}
                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">System Role *</label>
                <select
                  value={regData.role}
                  onChange={(e) => setRegData({ ...regData, role: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-bold outline-none focus:border-emerald-500"
                >
                  {ROLES_OPTIONS.map((r) => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">State *</label>
                <select
                  value={regData.state}
                  onChange={(e) => setRegData({ ...regData, state: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-medium outline-none focus:border-emerald-500"
                >
                  {NE_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">District *</label>
                <input
                  type="text"
                  required
                  value={regData.district}
                  onChange={(e) => setRegData({ ...regData, district: e.target.value })}
                  placeholder="Dima Hasao"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-medium outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Block / Village</label>
                <input
                  type="text"
                  value={regData.village}
                  onChange={(e) => setRegData({ ...regData, village: e.target.value })}
                  placeholder="Haflong"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-medium outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Official Designation</label>
                <input
                  type="text"
                  value={regData.designation}
                  onChange={(e) => setRegData({ ...regData, designation: e.target.value })}
                  placeholder="Assistant Disaster Officer"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-medium outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Mobile Contact</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={regData.phone}
                    onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-medium outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-60"
            >
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
              <UserPlus className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 1-Click Fast Demo Login Buttons */}
        <div className="space-y-2 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Instant SIH Demo Personas</span>
            </span>
            <span className="text-amber-400 font-bold">1-Click Access</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {QUICK_DEMO_USERS.map((u, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuickDemo(u.role)}
                className="p-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-left text-[11px] font-bold text-slate-300 hover:text-white transition-all truncate flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{u.label.split('(')[0]}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
