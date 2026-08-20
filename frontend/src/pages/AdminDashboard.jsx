import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { RiskBadge } from '../components/common/RiskBadge';
import { 
  Settings, 
  Database, 
  Users, 
  ClipboardList, 
  Droplets, 
  Activity, 
  AlertTriangle, 
  Radio, 
  ShieldCheck, 
  FileText, 
  RefreshCw, 
  Trash2, 
  Edit, 
  Search, 
  Server, 
  CheckCircle2, 
  ShieldAlert,
  Layers,
  Sparkles
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [dbStats, setDbStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleChangeUser, setRoleChangeUser] = useState(null);
  const [newRole, setNewRole] = useState('ASHA');
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAllData();
      setData(res.data);
      setDbStats(res.data.mongodb_stats);
    } catch (e) {
      console.error('Error fetching admin data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!roleChangeUser) return;
    try {
      await adminApi.updateUserRole(roleChangeUser.id, newRole);
      setActionSuccess(`Updated role for ${roleChangeUser.name} to ${newRole}`);
      setRoleChangeUser(null);
      await fetchAdminData();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      alert('Failed to update role');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user ${userName}?`)) return;
    try {
      await adminApi.deleteUser(userId);
      setActionSuccess(`User ${userName} deleted.`);
      await fetchAdminData();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const handleDeleteRecord = async (colName, recordId) => {
    if (!window.confirm(`Are you sure you want to remove record ${recordId} from ${colName}?`)) return;
    try {
      await adminApi.deleteRecord(colName, recordId);
      setActionSuccess(`Record deleted from ${colName}.`);
      await fetchAdminData();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      alert('Failed to delete record');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 text-xs font-bold uppercase tracking-wider">
            <Settings className="w-3.5 h-3.5 text-teal-300" />
            <span>Master System Administrator Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Unified System, Data & Cluster Admin
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Live inspection of all registered users, case reports, water testing logs, risk predictions, active alerts, and database state.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh All Collections</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Live MongoDB Cluster Status Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 dark:text-white text-sm">Active MongoDB Cluster Integration</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Cluster URI: <strong>{dbStats?.mongodb_url || 'mongodb://localhost:27017/'}</strong>
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>MongoDB {dbStats?.version || '8.0.11'} Online</span>
          </span>
        </div>

        {/* MongoDB Collection Counts Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Database</span>
            <div className="font-bold text-slate-900 dark:text-white text-xs truncate mt-0.5">{dbStats?.database_name || 'swasthya_jal_db'}</div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Total Users</span>
            <div className="font-black text-slate-900 dark:text-white text-base mt-0.5">{data?.users?.length || 0}</div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Case Reports</span>
            <div className="font-black text-slate-900 dark:text-white text-base mt-0.5">{data?.case_reports?.length || 0}</div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Water Tests</span>
            <div className="font-black text-slate-900 dark:text-white text-base mt-0.5">{data?.water_observations?.length || 0}</div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Risk Nodes</span>
            <div className="font-black text-slate-900 dark:text-white text-base mt-0.5">{data?.locations_risk?.length || 0}</div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Active Alerts</span>
            <div className="font-black text-slate-900 dark:text-white text-base mt-0.5">{data?.alerts?.length || 0}</div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap gap-1.5 text-xs font-bold transition-colors">
        {[
          { id: 'users', label: 'All Users', count: data?.users?.length, icon: Users },
          { id: 'cases', label: 'All Case Reports', count: data?.case_reports?.length, icon: ClipboardList },
          { id: 'water', label: 'All Water Tests', count: data?.water_observations?.length, icon: Droplets },
          { id: 'locations', label: 'All Risk Predictions', count: data?.locations_risk?.length, icon: Activity },
          { id: 'alerts', label: 'All Alerts', count: data?.alerts?.length, icon: AlertTriangle },
          { id: 'warnings', label: 'Public Warnings', count: data?.public_warnings?.length, icon: Radio },
          { id: 'guidelines', label: 'Disease Guidelines', count: data?.health_guidelines?.length, icon: ShieldCheck },
          { id: 'audit', label: 'Audit Logs', count: data?.audit_logs?.length, icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Search ${activeTab}...`}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-teal-500 shadow-sm"
        />
      </div>

      {/* Tab 1: All Users Table */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-3.5">User Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Assigned Facility</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data?.users?.filter(u => 
                  !searchTerm || u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{u.name}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{u.email}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 rounded text-[10px] font-bold">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{u.facility_name || '—'}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{u.village ? `${u.village}, ` : ''}{u.district} ({u.state})</td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => { setRoleChangeUser(u); setNewRole(u.role); }}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-semibold transition-colors"
                      >
                        Change Role
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="p-1 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: All Case Reports */}
      {activeTab === 'cases' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-3.5">Village / Location</th>
                  <th className="p-3.5">Cases</th>
                  <th className="p-3.5">Symptoms</th>
                  <th className="p-3.5">Water Source</th>
                  <th className="p-3.5">Reporter</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data?.case_reports?.filter(c => 
                  !searchTerm || c.village?.toLowerCase().includes(searchTerm.toLowerCase()) || c.district?.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{c.village}, {c.district} ({c.state})</td>
                    <td className="p-3.5 font-bold text-teal-800 dark:text-teal-300">{c.approx_cases} cases ({c.age_group})</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {Array.isArray(c.symptoms) ? c.symptoms.join(', ') : c.symptoms}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{c.water_source}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{c.reporter_name} ({c.reporter_role})</td>
                    <td className="p-3.5 text-slate-400 font-mono text-[11px]">{c.date}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDeleteRecord('case_reports', c.id)}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: All Water Observations */}
      {activeTab === 'water' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-3.5">Village</th>
                  <th className="p-3.5">Source</th>
                  <th className="p-3.5">Turbidity</th>
                  <th className="p-3.5">pH</th>
                  <th className="p-3.5">Coliform</th>
                  <th className="p-3.5">Flood Affected</th>
                  <th className="p-3.5">Tested On</th>
                  <th className="p-3.5 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data?.water_observations?.filter(w => 
                  !searchTerm || w.village?.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{w.village}, {w.district}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{w.water_source}</td>
                    <td className="p-3.5 font-bold text-blue-700 dark:text-blue-400">{w.turbidity_ntu} NTU</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{w.ph_level}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        w.coliform_presence ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300' : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                      }`}>
                        {w.coliform_presence ? 'POSITIVE' : 'Negative'}
                      </span>
                    </td>
                    <td className="p-3.5 dark:text-slate-300">{w.is_flood_affected ? '⚠️ Yes' : 'No'}</td>
                    <td className="p-3.5 text-slate-400 font-mono text-[11px]">{w.observation_date}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDeleteRecord('water_observations', w.id)}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: All Risk Predictions & Locations */}
      {activeTab === 'locations' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-3.5">Village / State</th>
                  <th className="p-3.5">AI Risk Score</th>
                  <th className="p-3.5">Active Cases</th>
                  <th className="p-3.5">Rainfall / Flood</th>
                  <th className="p-3.5">Water Status</th>
                  <th className="p-3.5">Contributing Drivers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data?.locations_risk?.filter(l => 
                  !searchTerm || l.village?.toLowerCase().includes(searchTerm.toLowerCase()) || l.state?.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900 dark:text-white block">{l.village}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">{l.district}, {l.state}</span>
                    </td>
                    <td className="p-3.5">
                      <RiskBadge level={l.alert_status === 'CONFIRMED' ? 'CONFIRMED' : l.risk_level} score={l.risk_score} />
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{l.active_cases || 0} cases</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{l.rainfall_mm} mm ({l.flood_status})</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{l.water_quality} ({l.turbidity_ntu} NTU)</td>
                    <td className="p-3.5 text-[11px] text-slate-600 dark:text-slate-400 max-w-sm">
                      {l.contributing_factors?.slice(0, 2).join('; ') || 'Baseline Normal'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: All Alerts */}
      {activeTab === 'alerts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.alerts?.filter(a => 
            !searchTerm || a.title?.toLowerCase().includes(searchTerm.toLowerCase()) || a.village?.toLowerCase().includes(searchTerm.toLowerCase())
          ).map((alt) => (
            <div key={alt.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] text-slate-400 font-bold">{alt.id}</span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{alt.title}</h3>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">📍 {alt.village}, {alt.district} ({alt.state})</div>
                </div>
                <RiskBadge level={alt.status === 'CONFIRMED' ? 'CONFIRMED' : alt.risk_level} score={alt.risk_score} />
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                {alt.investigation_notes || 'Pending triage'}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Status: <strong className="text-slate-800 dark:text-slate-200">{alt.status}</strong></span>
                <button
                  onClick={() => handleDeleteRecord('alerts', alt.id)}
                  className="text-rose-500 hover:text-rose-700 font-bold"
                >
                  Delete Alert
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 6: Public Warnings */}
      {activeTab === 'warnings' && (
        <div className="space-y-4">
          {data?.public_warnings?.map((w) => (
            <div key={w.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border-2 border-rose-200 dark:border-rose-900/60 shadow-sm space-y-2 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-black uppercase">
                    OFFICIAL ADVISORY
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-1">{w.headline}</h3>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{w.area_covered} ({w.state})</div>
                </div>
                <button
                  onClick={() => handleDeleteRecord('public_warnings', w.id)}
                  className="text-rose-500 hover:text-rose-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-rose-50/50 dark:bg-rose-950/20 p-3 rounded-xl border border-rose-100 dark:border-rose-900/40">
                {w.message}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 7: Disease Guidelines */}
      {activeTab === 'guidelines' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.health_guidelines?.map((g) => (
            <div key={g.disease} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-900 dark:text-white text-base">{g.disease}</h3>
                <span className="text-[10px] text-slate-400">Updated: {g.updated_at}</span>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-emerald-800 dark:text-emerald-400 text-[11px]">✅ DOs ({g.do?.length})</div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] truncate">{g.do?.slice(0, 2).join(' • ')}</p>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-rose-800 dark:text-rose-400 text-[11px]">❌ DONTs ({g.dont?.length})</div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] truncate">{g.dont?.slice(0, 2).join(' • ')}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 8: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200">
            System Event & Security Telemetry Log
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
            {data?.audit_logs?.map((log, i) => (
              <div key={i} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 dark:text-white font-mono text-[11px]">{log.event}</span>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Performed by: <strong>{log.user_name || log.performed_by || 'System'}</strong></div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {roleChangeUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95">
            <div className="bg-teal-800 p-5 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Change Role: {roleChangeUser.name}</h3>
              <button onClick={() => setRoleChangeUser(null)} className="text-white/80 hover:text-white font-bold">✕</button>
            </div>
            <form onSubmit={handleUpdateRole} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select New Authorization Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 font-bold"
                >
                  <option value="ASHA">ASHA (Community Health Worker)</option>
                  <option value="ANM">ANM (Sector Health Worker)</option>
                  <option value="MEDICAL_STAFF">MEDICAL_STAFF (PHC/CHC Medical Officer)</option>
                  <option value="AUTHORITY">AUTHORITY (District/State Surveillance Officer)</option>
                  <option value="ADMIN">ADMIN (System Administrator)</option>
                  <option value="PUBLIC">PUBLIC (Citizen)</option>
                </select>
              </div>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRoleChangeUser(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold shadow-md"
                >
                  Update Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
