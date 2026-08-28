import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../api/client';
import { 
  BarChart3, 
  TrendingUp, 
  CloudRain, 
  Mountain, 
  RefreshCw 
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export const HistoricalAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getHistory();
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

  const yearly = data?.yearly_trends || [];
  const seasonal = data?.seasonal_monsoon_distribution || [];
  const stateBreakdown = data?.state_breakdown || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Epidemiological & Geomorphic Data Mining</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            10-Year Northeast Landslide & Precipitation Analytics
          </h1>
          <p className="text-purple-100/90 text-xs sm:text-sm max-w-2xl">
            Historical correlation between multi-day monsoon rainfall surges, young Himalayan slope instability, and regional infrastructure damage.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-2xl border border-slate-700 shadow-md flex items-center gap-2 transition-all shrink-0"
        >
          <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 10-Year Annual Landslide Events & Rainfall Triggers */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white">
                10-Year Northeast Landslide Occurrences (2016–2025)
              </h3>
              <p className="text-xs text-slate-500">
                Annual count of major slope failures vs rainfall-triggered events.
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearly}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                />
                <Legend />
                <Bar dataKey="events" name="Total Landslides" fill="#e11d48" radius={[6, 6, 0, 0]} />
                <Bar dataKey="heavy_rainfall_triggers" name="Rainfall-Triggered" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Seasonal Monsoon Distribution (Monthly Precipitation vs Landslide Probability) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white">
                Seasonal Monsoon Surge Profile (Jan–Dec)
              </h3>
              <p className="text-xs text-slate-500">
                Monthly mean rainfall (mm) vs recorded slope failure frequency.
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={seasonal}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis yAxisId="left" stroke="#3b82f6" fontSize={11} />
                <YAxis yAxisId="right" orientation="right" stroke="#e11d48" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="avg_rainfall_mm" name="Avg Rainfall (mm)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3 }} />
                <Line yAxisId="right" type="monotone" dataKey="events" name="Landslide Events" stroke="#e11d48" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* State Susceptibility Profiles Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-black text-sm text-slate-900 dark:text-white">
              State-wise Geological Susceptibility & Dominant Trigger Factors
            </h3>
            <p className="text-xs text-slate-500">
              Analysis based on Geological Survey of India (GSI) and National Landslide Susceptibility Mapping (NLSM).
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">State</th>
                <th className="py-2.5 px-3">10-Year Events</th>
                <th className="py-2.5 px-3">Highly Vulnerable Districts</th>
                <th className="py-2.5 px-3">Primary Geological / Trigger Cause</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {stateBreakdown.map((st, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors font-medium">
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{st.state}</td>
                  <td className="py-3 px-3 font-mono font-black text-rose-600 dark:text-rose-400">{st.historical_count}</td>
                  <td className="py-3 px-3 font-semibold">{st.vulnerable_districts}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{st.primary_cause}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
