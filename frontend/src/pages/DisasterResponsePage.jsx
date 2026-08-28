import React, { useState, useEffect } from 'react';
import { evacuationApi, mapApi } from '../api/client';
import { MetricCard } from '../components/common/MetricCard';
import { RiskBadge } from '../components/common/RiskBadge';
import { 
  Truck, 
  ShieldAlert, 
  Users, 
  Building2, 
  PackageCheck, 
  Radio, 
  Cross,
  RefreshCw,
  Sparkles,
  MapPin
} from 'lucide-react';

export const DisasterResponsePage = () => {
  const [locations, setLocations] = useState([]);
  const [selectedVillage, setSelectedVillage] = useState('');
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await mapApi.getRiskNodes();
        const locs = res.data?.locations || [];
        setLocations(locs);
        if (locs.length > 0) {
          setSelectedVillage(locs[0].village);
          loadPlan(locs[0].village);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchLocations();
  }, []);

  const loadPlan = async (villageName) => {
    setLoading(true);
    try {
      const res = await evacuationApi.getLogisticsPlan({ village: villageName });
      setPlan(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleVillageChange = (e) => {
    const v = e.target.value;
    setSelectedVillage(v);
    loadPlan(v);
  };

  const estimates = plan?.logistics_estimates || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase">
            <Truck className="w-3.5 h-3.5" />
            <span>Disaster Logistics & Resource Coordination</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Emergency Response & Evacuation Forecaster
          </h1>
          <p className="text-rose-100/90 text-xs sm:text-sm max-w-2xl">
            Automated quota estimation for SDRF/NDRF rescue teams, heavy earthmovers (JCBs), evacuation vehicle fleets, and 7-day relief supplies.
          </p>
        </div>

        {/* Sector Selector */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20 space-y-1.5 shrink-0">
          <label className="text-[10px] uppercase font-bold text-rose-200 block">Select At-Risk Hill Sector</label>
          <select
            value={selectedVillage}
            onChange={handleVillageChange}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs"
          >
            {locations.map((loc, idx) => (
              <option key={idx} value={loc.village}>
                {loc.village} ({loc.district}, {loc.state}) — {loc.risk_score}/100
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Sector Card */}
      {plan?.location && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Target Disaster Sector</span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {plan.location.village}, {plan.location.district} ({plan.location.state})
            </h2>
            <p className="text-xs text-slate-500">
              Total Community Population: <strong>{(plan.location.total_population || 0).toLocaleString()}</strong>
            </p>
          </div>
          <RiskBadge level={plan.location.risk_level} score={plan.location.risk_score} size="lg" />
        </div>
      )}

      {/* Logistics Estimates Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-[11px] font-bold uppercase text-slate-400">Evacuation Requirement</div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {estimates.estimated_evacuation_requirement?.toLocaleString() || 0}
          </div>
          <p className="text-[10px] text-slate-500">Residents in direct slope hazard path</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="text-[11px] font-bold uppercase text-slate-400">SDRF / NDRF Teams</div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {estimates.recommended_rescue_teams_sdrf_ndrf || 2} Teams
          </div>
          <p className="text-[10px] text-slate-500">Equipped with search & rescue gear</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <div className="text-[11px] font-bold uppercase text-slate-400">Heavy Earthmovers</div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 font-mono">
            {estimates.heavy_earthmovers_jcbs_required || 3} JCBs
          </div>
          <p className="text-[10px] text-slate-500">For debris clearance on highway cuts</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="text-[11px] font-bold uppercase text-slate-400">Shelter Capacity Needed</div>
          <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 font-mono">
            {estimates.shelter_capacity_required?.toLocaleString() || 0}
          </div>
          <p className="text-[10px] text-slate-500">Target safe indoor hall beds</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div className="text-[11px] font-bold uppercase text-slate-400">7-Day Relief Rations</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {estimates.emergency_relief_packets_7day?.toLocaleString() || 0}
          </div>
          <p className="text-[10px] text-slate-500">Dry rations + potable water sets</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-600 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <div className="text-[11px] font-bold uppercase text-slate-400">Evacuation Bus Fleet</div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
            {estimates.evacuation_buses_required || 12} Buses
          </div>
          <p className="text-[10px] text-slate-500">35-seater all-weather transport</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/15 text-teal-600 flex items-center justify-center">
            <Radio className="w-5 h-5" />
          </div>
          <div className="text-[11px] font-bold uppercase text-slate-400">Satellite Comm Sets</div>
          <div className="text-2xl sm:text-3xl font-black text-teal-600 dark:text-teal-400 font-mono">
            {estimates.satellite_communication_sets || 2} Units
          </div>
          <p className="text-[10px] text-slate-500">For cellular network blackout zones</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-600 flex items-center justify-center">
            <Cross className="w-5 h-5" />
          </div>
          <div className="text-[11px] font-bold uppercase text-slate-400">Mobile Medical Units</div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {estimates.mobile_medical_triage_units || 2} Ambulances
          </div>
          <p className="text-[10px] text-slate-500">Trauma care & first-aid support</p>
        </div>

      </div>

      {/* Planning Notice Banner */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
        <p>
          <strong>Operational Notice:</strong> {plan?.disclaimer}
        </p>
      </div>

    </div>
  );
};
