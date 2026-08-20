import React, { useState, useEffect } from 'react';
import { waterApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  Droplets, 
  FlaskConical, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  MapPin, 
  Calendar,
  CloudRain,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const WaterObservationPage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    state: user?.state || 'Assam',
    district: user?.district || 'Majuli',
    village: user?.village || 'Garamur',
    water_source: 'Handpump',
    turbidity_ntu: 14.5,
    ph_level: 6.8,
    coliform_presence: true,
    residual_chlorine_ppm: 0.1,
    odor_taste: 'Normal',
    is_flood_affected: true,
    observation_date: new Date().toISOString().split('T')[0],
    notes: 'Presumptive black precipitate in H2S paper strip test.'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [observations, setObservations] = useState([]);

  const fetchObservations = async () => {
    try {
      const res = await waterApi.listObservations({ village: user?.village || 'Garamur' });
      setObservations(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchObservations();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await waterApi.logObservation(formData);
      setResult({
        success: true,
        rating: res.data.water_quality_rating,
        message: res.data.message
      });
      await fetchObservations();
    } catch (err) {
      console.error(err);
      setResult({
        error: true,
        message: 'Failed to record water observation.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-bold uppercase">
            <FlaskConical className="w-3.5 h-3.5 text-blue-300" />
            <span>Water Quality Field Surveillance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Water Source & Environmental Quality Testing
          </h1>
          <p className="text-blue-100/90 text-xs sm:text-sm">
            Record physical turbidity, H2S vial presumptive coliform tests, residual chlorine, and flood contamination indices.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Log Water Source Sample Test</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Correlates water contamination with community disease patterns.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">State</label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">District</label>
                <input
                  type="text"
                  required
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Village</label>
                <input
                  type="text"
                  required
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Water Source Type</label>
                <select
                  value={formData.water_source}
                  onChange={(e) => setFormData({ ...formData, water_source: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Handpump">Community Handpump</option>
                  <option value="Tube Well">Deep Tube Well</option>
                  <option value="River/Stream">River / Stream / Jharna</option>
                  <option value="Open Pond">Open Village Pond / Ring Well</option>
                  <option value="Piped Supply">Piped Supply (Jal Jeevan Mission)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Observation Date</label>
                <input
                  type="date"
                  required
                  value={formData.observation_date}
                  onChange={(e) => setFormData({ ...formData, observation_date: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Test Parameters */}
            <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-750 space-y-3">
              <div className="font-bold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider">Field Test Kit Measurements</div>
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Turbidity (NTU)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="150"
                    required
                    value={formData.turbidity_ntu}
                    onChange={(e) => setFormData({ ...formData, turbidity_ntu: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black shadow-sm text-sm"
                  />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Normal: &lt; 5.0 NTU</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">pH Level</label>
                  <input
                    type="number"
                    step="0.1"
                    min="4"
                    max="10"
                    required
                    value={formData.ph_level}
                    onChange={(e) => setFormData({ ...formData, ph_level: parseFloat(e.target.value) || 7.0 })}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black shadow-sm text-sm"
                  />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Normal: 6.5 – 8.5</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Residual Chlorine</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    required
                    value={formData.residual_chlorine_ppm}
                    onChange={(e) => setFormData({ ...formData, residual_chlorine_ppm: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black shadow-sm text-sm"
                  />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Target: &gt; 0.2 ppm</span>
                </div>
              </div>

              {/* Coliform & Flood Checkbox */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                  formData.coliform_presence 
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200 font-bold shadow-sm' 
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.coliform_presence}
                    onChange={(e) => setFormData({ ...formData, coliform_presence: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                  />
                  <span className="text-xs">H2S Vial Coliform Positive</span>
                </label>

                <label className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                  formData.is_flood_affected 
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 font-bold shadow-sm' 
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.is_flood_affected}
                    onChange={(e) => setFormData({ ...formData, is_flood_affected: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <span className="text-xs">Flood Waterlogged Source</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Field Analyst Notes</label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Presumptive black precipitate in H2S paper strip test."
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 text-xs shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-2xl shadow-lg shadow-blue-700/25 flex items-center justify-center gap-2 transition-all text-xs hover:scale-[1.01] active:scale-[0.99]"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Submitting Test...' : 'Save Water Quality Observation'}</span>
            </button>
          </form>
        </div>

        {/* Recent Observations */}
        <div className="lg:col-span-5 space-y-6">
          {result && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 shadow-sm space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-blue-950 dark:text-blue-200 text-sm">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Assessment Generated</span>
              </div>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Water Safety Classification: <strong className="text-blue-700 dark:text-blue-400 font-bold">{result.rating}</strong>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{result.message}</p>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Recent Water Quality Tests</h3>
              <span className="text-[11px] text-slate-400">{observations.length} logs</span>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto">
              {observations.map((obs, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 text-xs space-y-1.5">
                  <div className="flex items-start justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{obs.village} ({obs.water_source})</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {obs.turbidity_ntu} NTU
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-300">
                    <span>pH: {obs.ph_level}</span>
                    <span>•</span>
                    <span className={obs.coliform_presence ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-emerald-700 dark:text-emerald-400'}>
                      Coliform: {obs.coliform_presence ? 'POSITIVE' : 'Negative'}
                    </span>
                  </div>
                  {obs.notes && <p className="text-[10px] text-slate-500 dark:text-slate-400 italic truncate">{obs.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
