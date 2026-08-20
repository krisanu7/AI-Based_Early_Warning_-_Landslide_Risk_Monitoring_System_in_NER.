import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import { 
  Activity, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  MapPin, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export const LoginPage = () => {
  const { login, register, loginDemo, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('demo'); // 'demo', 'login', 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('ASHA');
  const [state, setState] = useState('Assam');
  const [district, setDistrict] = useState('Majuli');
  const [village, setVillage] = useState('Garamur');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleDemoClick = async (roleKey) => {
    setError(null);
    try {
      await loginDemo(roleKey);
      if (roleKey === 'ASHA' || roleKey === 'ANM') navigate('/dashboard/asha');
      else if (roleKey === 'MEDICAL_STAFF') navigate('/dashboard/medical');
      else if (roleKey === 'AUTHORITY') navigate('/dashboard/authority');
      else if (roleKey === 'ADMIN') navigate('/dashboard/admin');
      else navigate('/public-warnings');
    } catch (e) {
      setError('Login failed. Please check network connection.');
    }
  };

  const handleCustomLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const user = await login(email, password);
      if (user.role === 'ASHA' || user.role === 'ANM') navigate('/dashboard/asha');
      else if (user.role === 'MEDICAL_STAFF') navigate('/dashboard/medical');
      else if (user.role === 'AUTHORITY') navigate('/dashboard/authority');
      else if (user.role === 'ADMIN') navigate('/dashboard/admin');
      else navigate('/public-warnings');
    } catch (e) {
      setError(e.response?.data?.detail || 'Invalid email or password.');
    }
  };

  const handleCustomRegister = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const user = await register({
        name,
        email,
        password,
        role,
        state,
        district,
        village,
        facility_name: `${village} Health Unit`
      });
      if (user.role === 'ASHA' || user.role === 'ANM') navigate('/dashboard/asha');
      else if (user.role === 'MEDICAL_STAFF') navigate('/dashboard/medical');
      else if (user.role === 'AUTHORITY') navigate('/dashboard/authority');
      else if (user.role === 'ADMIN') navigate('/dashboard/admin');
      else navigate('/public-warnings');
    } catch (e) {
      setError(e.response?.data?.detail || 'Registration failed.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-700 to-emerald-500 text-white flex items-center justify-center mx-auto shadow-md shadow-teal-700/20">
          <Activity className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Access SwasthyaJal NER</h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Role-Based Public Health Early Warning Portal for Northeast India
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
        
        <div className="flex border-b border-slate-200 pb-3 gap-2">
          <button
            onClick={() => setActiveTab('demo')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'demo'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1-Click Demo Logins (SIH)</span>
          </button>
          <button
            onClick={() => setActiveTab('login')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'login'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Standard Sign In
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'register'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            New Registration
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-2xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab 1: 1-Click Demo Accounts */}
        {activeTab === 'demo' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-500">
              Select any role persona to instantly test workflows, ML predictions, and live map updates:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  onClick={() => handleDemoClick(acc.role)}
                  disabled={loading}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-teal-400 bg-slate-50/50 hover:bg-teal-50/40 text-left transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-teal-100 text-teal-800 rounded text-[10px] font-bold">
                        {acc.role}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <div className="font-bold text-slate-900 text-xs mt-2">{acc.label}</div>
                    <div className="text-[11px] text-slate-500">{acc.name}</div>
                  </div>
                  <div className="text-[10px] text-teal-700 font-semibold mt-2 pt-2 border-t border-slate-200/60">
                    📍 {acc.loc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Standard Login */}
        {activeTab === 'login' && (
          <form onSubmit={handleCustomLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="asha@swasthyajal.gov.in"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-md transition-all text-xs"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>
        )}

        {/* Tab 3: Register */}
        {activeTab === 'register' && (
          <form onSubmit={handleCustomRegister} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Health Official Name"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gov.in"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Assign Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 text-xs font-semibold"
              >
                <option value="ASHA">ASHA / Community Health Worker</option>
                <option value="ANM">ANM / Health Worker</option>
                <option value="MEDICAL_STAFF">PHC/CHC Medical Staff</option>
                <option value="AUTHORITY">District/State Health Authority</option>
                <option value="ADMIN">System Administrator</option>
                <option value="PUBLIC">Public Citizen</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-2 py-2 rounded-xl border border-slate-200 text-xs"
                >
                  <option value="Assam">Assam</option>
                  <option value="Meghalaya">Meghalaya</option>
                  <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                  <option value="Manipur">Manipur</option>
                  <option value="Mizoram">Mizoram</option>
                  <option value="Nagaland">Nagaland</option>
                  <option value="Tripura">Tripura</option>
                  <option value="Sikkim">Sikkim</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-2 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Village</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full px-2 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-md transition-all text-xs"
            >
              Register & Sign In
            </button>
          </form>
        )}

      </div>

    </div>
  );
};
