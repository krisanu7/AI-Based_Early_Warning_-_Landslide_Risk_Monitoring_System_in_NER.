import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../api/client';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  CartesianGrid
} from 'recharts';
import { 
  BarChart3, 
  Activity, 
  Droplets, 
  CloudRain, 
  Users, 
  RefreshCw, 
  TrendingUp,
  PieChart as PieIcon
} from 'lucide-react';

const COLORS = ['#0d9488', '#f59e0b', '#e11d48', '#3b82f6', '#8b5cf6'];

export const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await analyticsApi.getMetrics();
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 text-xs font-bold uppercase">
            <BarChart3 className="w-3.5 h-3.5 text-teal-300" />
            <span>Epidemiological Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Regional Outbreak Trends & Correlations
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Correlating environmental precipitation, turbidity sensors, and community symptom growth across Northeast India.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Grid of 4 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Rainfall vs Cases Correlation */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-blue-600" />
              <span>Precipitation (mm) vs 48h Case Surges</span>
            </h3>
            <span className="text-[10px] text-slate-400">14-Day Rolling Window</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.rainfall_vs_cases_trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line yAxisId="left" type="monotone" dataKey="cases" stroke="#e11d48" strokeWidth={3} name="Infection Cases" />
                <Line yAxisId="right" type="monotone" dataKey="rainfall_mm" stroke="#0284c7" strokeWidth={2} name="Rainfall (mm)" strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: State-wise Cases in 8 NER States */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>State-wise Active Cases (NER)</span>
            </h3>
            <span className="text-[10px] text-slate-400">8 NE States</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.state_breakdown || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="state" tick={{ fontSize: 9 }} interval={0} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="cases" fill="#0f766e" radius={[6, 6, 0, 0]} name="Active Cases" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Water Quality Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-600" />
            <span>Water Quality Classification in Monitored Sources</span>
          </h3>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.water_quality_pie || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {(data?.water_quality_pie || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Age Group Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Age-Stratified Vulnerability Profile</span>
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.age_dist || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="age_group" type="category" tick={{ fontSize: 10 }} width={110} />
                <Tooltip />
                <Bar dataKey="percentage" fill="#6366f1" radius={[0, 6, 6, 0]} name="% of Total Cases" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
