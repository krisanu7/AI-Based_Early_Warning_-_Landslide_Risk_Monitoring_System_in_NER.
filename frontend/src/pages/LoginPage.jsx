import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  Send,
  KeyRound,
  RefreshCw,
  AlertCircle,
  Check,
  ExternalLink,
  Settings,
  Eye,
  EyeOff
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
  const { login, googleLogin, register, sendOtp, verifyOtp, switchDemoRole } = useAuth();

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

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP Verification State
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState(null);

  // Google OAuth Client ID & Setup State
  const [googleClientId, setGoogleClientId] = useState(() => {
    return (
      import.meta.env.VITE_GOOGLE_CLIENT_ID || 
      localStorage.getItem('ner_google_client_id') || 
      ''
    );
  });
  const [showGoogleSetupModal, setShowGoogleSetupModal] = useState(false);
  const [inputClientId, setInputClientId] = useState('');
  const [googleGsiLoaded, setGoogleGsiLoaded] = useState(false);
  const isNumericIp = typeof window !== 'undefined' && /^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/.test(window.location.hostname);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Timer for OTP resend countdown
  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  const getDestination = () => {
    return location.state?.from?.pathname || (typeof location.state?.from === 'string' ? location.state.from : null) || '/dashboard';
  };

  // Initialize official Google Identity Services button
  const googleBtnRef = useRef(null);
  useEffect(() => {
    const initGoogleIdentity = () => {
      if (!window.google?.accounts?.id || !googleClientId) {
        return;
      }
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (response?.credential) {
              setLoading(true);
              setError(null);
              setSuccess(null);
              try {
                await googleLogin(response.credential, {
                  role: regData.role,
                  state: regData.state,
                  district: regData.district
                });
                setSuccess('Google verification successful! Launching dashboard...');
                setTimeout(() => {
                  navigate(getDestination(), { replace: true });
                }, 500);
              } catch (err) {
                setError(err.response?.data?.detail || 'Google account verification failed.');
              } finally {
                setLoading(false);
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true
        });

        setGoogleGsiLoaded(true);

        if (googleBtnRef.current) {
          googleBtnRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'filled_black',
            size: 'large',
            type: 'standard',
            shape: 'pill',
            text: mode === 'login' ? 'continue_with' : 'signup_with',
            width: 340,
            logo_alignment: 'left'
          });
        }

        // Also prompt Google One Tap on desktop if available
        try {
          window.google.accounts.id.prompt();
        } catch (_) {}
      } catch (e) {
        console.warn('Google Identity initialization error:', e);
      }
    };

    if (window.google?.accounts?.id) {
      initGoogleIdentity();
    } else {
      const checkTimer = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkTimer);
          initGoogleIdentity();
        }
      }, 300);
      return () => clearInterval(checkTimer);
    }
  }, [googleClientId, mode, googleLogin, navigate]);

  const handleSaveClientId = (e) => {
    e.preventDefault();
    const cleanId = inputClientId.trim();
    if (!cleanId) {
      setError('Please paste a valid Google OAuth Client ID.');
      return;
    }
    localStorage.setItem('ner_google_client_id', cleanId);
    setGoogleClientId(cleanId);
    setShowGoogleSetupModal(false);
    setSuccess('Google OAuth Client ID saved! Google Sign-In activated.');
  };

  const handleGooglePlaceholderClick = () => {
    if (isNumericIp) {
      setError(
        `Google OAuth security policy blocks raw numeric IPs (like ${window.location.hostname}). To use Google One-Tap, access via http://localhost:5173 on your PC. On mobile phones, please sign in with your registered email & password, or use Real Email OTP verification below.`
      );
      return;
    }
    if (!googleClientId) {
      setInputClientId('');
      setShowGoogleSetupModal(true);
    } else if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login({ email: loginEmail, password: loginPassword });
      navigate(getDestination(), { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        'Login failed. Please enter your correct registered email or use Google Sign-In.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!regData.email || !regData.email.includes('@')) {
      setError('Please enter a valid email address first.');
      return;
    }
    setOtpLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await sendOtp(regData.email, 'register');
      setOtpSent(true);
      setOtpCountdown(60);
      setSuccess(`Verification code dispatched to ${regData.email}`);
      if (res.data?.dev_otp) {
        setDevOtpHint(res.data.dev_otp);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send verification code. Please check email address.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    setOtpLoading(true);
    setError(null);
    try {
      await verifyOtp(regData.email, otpCode.trim());
      setOtpVerified(true);
      setSuccess('Email address verified successfully!');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired verification code.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!otpVerified) {
      setError('You must verify your real email address before registering.');
      return;
    }
    if (!regData.password || regData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (regData.password !== confirmPassword) {
      setError('Passwords do not match. Please ensure Create Password and Confirm Password are identical.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await register({
        ...regData,
        confirm_password: confirmPassword,
        otp: otpCode.trim()
      });
      setSuccess('Account verified & registered successfully! Launching SafeSlope Portal...');
      setTimeout(() => {
        navigate(getDestination(), { replace: true });
      }, 700);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Email may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    await switchDemoRole(role);
    navigate(getDestination(), { replace: true });
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError(null);
    setSuccess(null);
    if (newMode === 'register' && location.pathname !== '/register') {
      navigate('/register', { replace: true, state: location.state });
    } else if (newMode === 'login' && location.pathname !== '/login') {
      navigate('/login', { replace: true, state: location.state });
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

        {/* Notice if redirected from protected route */}
        {location.state?.from && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-3 animate-in fade-in">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-left leading-relaxed">
              <span className="font-bold">Authentication Required: </span>
              <span className="text-slate-300">
                Please sign in with your verified Google account or registered credentials to continue.
              </span>
            </div>
          </div>
        )}

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
          <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-bold flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* OFFICIAL GOOGLE SIGN-IN SECTION */}
        <div className="flex flex-col items-center justify-center space-y-2">
          {/* Target container where Google's official iframe button renders */}
          <div 
            ref={googleBtnRef} 
            className="w-full flex justify-center min-h-[44px]"
          />

          {/* Fallback button if Client ID is not yet connected */}
          {(!googleClientId || !googleGsiLoaded) && (
            <button
              type="button"
              onClick={handleGooglePlaceholderClick}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-xl shadow-md border border-slate-200 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-xs cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{mode === 'login' ? 'Continue with Google' : 'Register with Google'}</span>
            </button>
          )}

          {!googleClientId && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span>Google Account Chooser requires a Google Client ID.</span>
              <button 
                type="button" 
                onClick={() => setShowGoogleSetupModal(true)}
                className="text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
              >
                Connect in 1 Min
              </button>
            </div>
          )}

          {isNumericIp && (
            <div className="w-full p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span className="leading-tight">
                <strong>Phone Network Access:</strong> Google OAuth blocks raw IP origins ({window.location.hostname}). On mobile, please use <strong>Registered Email Login</strong>, <strong>Real Email OTP Verification</strong> below, or <strong>1-Click Demo Login</strong>.
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-[#0a1217] px-3 text-[10px] uppercase font-bold tracking-wider text-slate-500 whitespace-nowrap">
            or continue with registered email
          </span>
          <div className="border-t border-slate-800 w-full" />
        </div>

        {/* SIGN IN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Your Registered Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. krisanusamanta2@gmail.com"
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
                  placeholder="Enter your registered password"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900/90 text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
            >
              <span>{loading ? 'Verifying Account...' : 'Sign In to SafeSlope'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* REGISTER FORM WITH REAL EMAIL OTP VERIFICATION */}
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
                    placeholder="e.g. Krisanu Samanta"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900/90 text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Real Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    disabled={otpVerified}
                    value={regData.email}
                    onChange={(e) => {
                      setRegData({ ...regData, email: e.target.value });
                      setOtpSent(false);
                      setOtpVerified(false);
                      setDevOtpHint(null);
                    }}
                    placeholder="e.g. krisanusamanta2@gmail.com"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border ${
                      otpVerified 
                        ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300' 
                        : 'border-slate-700 bg-slate-900/90 text-white'
                    } font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none`}
                  />
                </div>
              </div>
            </div>

            {/* OTP VERIFICATION COMPONENT */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className={`w-3.5 h-3.5 ${otpVerified ? 'text-emerald-400' : 'text-amber-400'}`} />
                  <span>Real Email Verification</span>
                </span>
                {otpVerified ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Verified
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-400/90 font-medium">
                    Verification Needed
                  </span>
                )}
              </div>

              {!otpVerified ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={otpLoading || otpCountdown > 0 || !regData.email}
                      onClick={handleSendOtp}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {otpLoading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      <span>
                        {otpSent 
                          ? (otpCountdown > 0 ? `Resend Code (${otpCountdown}s)` : 'Resend Code') 
                          : 'Send 6-Digit Code'}
                      </span>
                    </button>
                    <span className="text-[10px] text-slate-400 leading-tight">
                      A 6-digit code will be sent to your real inbox to confirm identity.
                    </span>
                  </div>

                  {otpSent && (
                    <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 animate-in fade-in">
                      <div className="relative flex-1">
                        <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="6-digit code"
                          className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono text-sm tracking-widest text-center focus:border-emerald-500 outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={otpLoading || otpCode.length !== 6}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-all disabled:opacity-50 cursor-pointer"
                      >
                        Verify
                      </button>
                    </div>
                  )}

                  {devOtpHint && (
                    <div className="p-2 rounded-lg bg-teal-950/40 border border-teal-800/60 text-[11px] text-teal-300 flex items-center justify-between">
                      <span>Dev/Demo Preview Code: <strong>{devOtpHint}</strong></span>
                      <button
                        type="button"
                        onClick={() => setOtpCode(devOtpHint)}
                        className="underline hover:text-teal-200 font-bold"
                      >
                        Auto-fill
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[11px] text-emerald-300/90 bg-emerald-950/30 border border-emerald-900/60 rounded-xl p-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Email verified! You can now complete your registration below.</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Create Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showCreatePassword ? "text" : "password"}
                    required
                    value={regData.password}
                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePassword(!showCreatePassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {regData.password.length > 0 && regData.password.length < 6 && (
                  <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Minimum 6 characters required ({regData.password.length}/6 entered)</span>
                  </div>
                )}
                {regData.password.length >= 6 && (
                  <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>Password meets length requirement</span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-300">Confirm Password *</label>
                  {confirmPassword ? (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                      regData.password === confirmPassword 
                        ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40' 
                        : 'text-rose-400 bg-rose-950/60 border-rose-500/40'
                    }`}>
                      {regData.password === confirmPassword ? '✓ Passwords match' : '✕ Does not match'}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">Required</span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password to match"
                    className={`w-full pl-9 pr-10 py-2.5 rounded-xl border ${
                      confirmPassword
                        ? regData.password === confirmPassword
                          ? 'border-emerald-500 bg-emerald-950/10 text-white'
                          : 'border-rose-500 bg-rose-950/10 text-white'
                        : 'border-slate-700 bg-slate-900 text-white'
                    } font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && regData.password === confirmPassword && (
                  <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 mt-1">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>Create Password = Confirm Password matched!</span>
                  </div>
                )}
                {confirmPassword && regData.password !== confirmPassword && (
                  <div className="text-[11px] text-rose-400 font-bold flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Both passwords must match to be eligible for register.</span>
                  </div>
                )}
                {!confirmPassword && (
                  <div className="text-[11px] text-slate-400 font-medium mt-1">
                    Re-enter your password to confirm identity.
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            {/* REAL-TIME REGISTRATION ELIGIBILITY SUMMARY */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Registration Eligibility Status</span>
                </span>
                {otpVerified && regData.password.length >= 6 && regData.password === confirmPassword ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-black text-emerald-400">
                    ELIGIBLE TO REGISTER
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-400">
                    REQUIREMENTS PENDING
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                <div className={`flex items-center gap-2 text-[11px] ${otpVerified ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                  {otpVerified ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0" />
                  )}
                  <span>1. Real Email Verified</span>
                </div>

                <div className={`flex items-center gap-2 text-[11px] ${
                  regData.password && regData.password.length >= 6 && regData.password === confirmPassword 
                    ? 'text-emerald-400 font-bold' 
                    : confirmPassword && regData.password !== confirmPassword 
                      ? 'text-rose-400 font-bold' 
                      : 'text-slate-400'
                }`}>
                  {regData.password && regData.password.length >= 6 && regData.password === confirmPassword ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0" />
                  )}
                  <span>2. Create Password = Confirm Password</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={
                loading || 
                !otpVerified || 
                !regData.password || 
                regData.password.length < 6 || 
                regData.password !== confirmPassword
              }
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-50 cursor-pointer"
            >
              <span>
                {loading 
                  ? 'Registering Account...' 
                  : !otpVerified 
                    ? '1. Verify Email to Enable Registration' 
                    : !regData.password || regData.password.length < 6 
                      ? '2. Enter Password (Min 6 Chars)' 
                      : !confirmPassword 
                        ? '3. Confirm Your Password' 
                        : regData.password !== confirmPassword 
                          ? 'Passwords Must Match to Register' 
                          : 'Complete Registration (Eligible)'}
              </span>
              <UserPlus className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 1-Click Fast Demo Login Buttons for Evaluators */}
        <div className="space-y-2 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Official SIH Evaluator Personas</span>
            </span>
            <span className="text-amber-400 font-bold">1-Click Fast Access</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {QUICK_DEMO_USERS.map((u, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuickDemo(u.role)}
                className="p-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-left text-[11px] font-bold text-slate-300 hover:text-white transition-all truncate flex items-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{u.label.split('(')[0]}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Google Setup Guide Modal (Explains 1-minute steps and allows activating real Google popup) */}
      {showGoogleSetupModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e171f] border border-slate-700/80 rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Settings className="w-5 h-5 text-emerald-400 shrink-0" />
                <h3 className="font-black text-white text-base">Enable Real Google Account Popup</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowGoogleSetupModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Google requires an official <strong>OAuth 2.0 Web Client ID</strong> from Google Cloud Console so it can display your desktop's saved Google accounts in the secure popup.
            </p>

            <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 text-[11px] space-y-2 text-slate-300">
              <div className="font-bold text-emerald-400">1-Minute Setup Steps:</div>
              <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1">
                <li>
                  Go to{' '}
                  <a 
                    href="https://console.cloud.google.com/apis/credentials" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-cyan-400 underline inline-flex items-center gap-1 font-semibold"
                  >
                    Google Cloud Credentials <ExternalLink className="w-3 h-3 inline" />
                  </a>
                </li>
                <li>Click <strong>+ CREATE CREDENTIALS</strong> &rarr; <strong>OAuth client ID</strong></li>
                <li>Select Application type: <strong>Web application</strong></li>
                <li>Under <em>Authorized JavaScript origins</em>, add: <code className="bg-slate-800 text-teal-300 px-1 py-0.5 rounded">http://localhost:5173</code></li>
                <li>Click <strong>CREATE</strong> and copy your <strong>Client ID</strong> (ends with <code>.apps.googleusercontent.com</code>)</li>
              </ol>
            </div>

            <form onSubmit={handleSaveClientId} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Paste Your Google OAuth Client ID:</label>
                <input
                  type="text"
                  required
                  value={inputClientId}
                  onChange={(e) => setInputClientId(e.target.value)}
                  placeholder="e.g. 123456789-abcdef.apps.googleusercontent.com"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono text-[11px] focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowGoogleSetupModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg cursor-pointer"
                >
                  Activate Google Account Chooser
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
