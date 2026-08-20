import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { riskApi } from '../../api/client';
import { RiskBadge } from '../common/RiskBadge';
import { XAIExplainabilityModal } from '../common/XAIExplainabilityModal';
import { IDSPReportModal } from '../common/IDSPReportModal';
import { 
  RefreshCw, 
  Filter, 
  MapPin, 
  Droplets, 
  CloudRain, 
  AlertTriangle, 
  ShieldAlert, 
  Zap, 
  CheckCircle2,
  TrendingUp,
  Layers,
  BrainCircuit,
  FileText
} from 'lucide-react';

// Custom Map Marker Icons based on Risk Level
const createCustomIcon = (level, alertStatus) => {
  let color = '#10b981'; // Green
  let isPulsing = false;

  if (alertStatus === 'CONFIRMED' || level === 'VERY HIGH') {
    color = '#e11d48'; // Red
    isPulsing = true;
  } else if (level === 'HIGH' || alertStatus === 'HIGH') {
    color = '#f97316'; // Orange
    isPulsing = true;
  } else if (level === 'MEDIUM') {
    color = '#eab308'; // Yellow
  }

  const svgHtml = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
      ${isPulsing ? `<div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: ${color}; opacity: 0.4; animation: pulse-ring 1.8s infinite;"></div>` : ''}
      <div style="width: 22px; height: 22px; border-radius: 50%; background: ${color}; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px;">
      </div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-pin',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

// Map Recenter Controller
const RecenterMap = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const NortheastRiskMap = ({ height = '500px', showControls = true, initialFilterState = 'ALL' }) => {
  const [locations, setLocations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState(initialFilterState);
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [simulating, setSimulating] = useState(false);
  const [simulationMessage, setSimulationMessage] = useState(null);
  const [selectedLocationForXAI, setSelectedLocationForXAI] = useState(null);
  const [selectedLocationForIDSP, setSelectedLocationForIDSP] = useState(null);

  const NE_STATES = [
    { name: 'All Northeast States', code: 'ALL', center: [26.2006, 92.9376], zoom: 7 },
    { name: 'Assam', code: 'Assam', center: [26.2006, 92.9376], zoom: 7.5 },
    { name: 'Meghalaya', code: 'Meghalaya', center: [25.4670, 91.3662], zoom: 8.5 },
    { name: 'Arunachal Pradesh', code: 'Arunachal Pradesh', center: [28.2180, 94.7278], zoom: 7.5 },
    { name: 'Manipur', code: 'Manipur', center: [24.6637, 93.9063], zoom: 8.5 },
    { name: 'Mizoram', code: 'Mizoram', center: [23.1645, 92.9376], zoom: 8.5 },
    { name: 'Nagaland', code: 'Nagaland', center: [26.1584, 94.5624], zoom: 8.5 },
    { name: 'Tripura', code: 'Tripura', center: [23.9408, 91.9882], zoom: 8.5 },
    { name: 'Sikkim', code: 'Sikkim', center: [27.5330, 88.5122], zoom: 9 }
  ];

  const activeStateObj = NE_STATES.find(s => s.code === selectedState) || NE_STATES[0];

  const fetchMapData = async () => {
    setLoading(true);
    try {
      const res = await riskApi.getMapData({
        state: selectedState !== 'ALL' ? selectedState : undefined,
        risk_level: selectedRisk !== 'ALL' ? selectedRisk : undefined
      });
      setLocations(res.data.locations || []);
      setSummary(res.data.summary || null);
      setLastRefreshed(new Date());
    } catch (e) {
      console.error('Error fetching live map data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
    const interval = setInterval(fetchMapData, 15000);
    return () => clearInterval(interval);
  }, [selectedState, selectedRisk]);

  const handleSimulateSurge = async () => {
    setSimulating(true);
    try {
      const res = await riskApi.simulateSurge({ village: 'Garamur', district: 'Majuli', state: 'Assam' });
      setSimulationMessage(res.data.message);
      await fetchMapData();
      setTimeout(() => setSimulationMessage(null), 6000);
    } catch (e) {
      console.error('Simulation error', e);
    } finally {
      setSimulating(false);
    }
  };

  const handleSimulateReset = async () => {
    setSimulating(true);
    try {
      const res = await riskApi.simulateReset({ village: 'Garamur', district: 'Majuli' });
      setSimulationMessage(res.data.message);
      await fetchMapData();
      setTimeout(() => setSimulationMessage(null), 4000);
    } catch (e) {
      console.error('Reset error', e);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-colors">
      
      {/* Map Header & Filter Controls */}
      {showControls && (
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="font-bold text-slate-800 dark:text-white text-sm">LIVE GIS SURVEILLANCE FEED</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
              Refreshed: {lastRefreshed.toLocaleTimeString()}
            </span>
          </div>

          {/* Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* State Selector */}
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {NE_STATES.map(s => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>

            {/* Risk Level Filter */}
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="HIGH">High & Very High Risk (🟠/🔴)</option>
              <option value="MEDIUM">Medium Risk (🟡)</option>
              <option value="LOW">Low Risk (🟢)</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={fetchMapData}
              disabled={loading}
              className="p-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
              title="Refresh live map"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-600' : ''}`} />
            </button>

            {/* Live Outbreak Simulation Buttons */}
            <div className="flex items-center gap-1.5 border-l border-slate-300 dark:border-slate-700 pl-2">
              <button
                onClick={handleSimulateSurge}
                disabled={simulating}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold shadow-sm transition-all flex items-center gap-1"
                title="Trigger simulated flood surge in Majuli"
              >
                <Zap className="w-3 h-3" />
                <span>Simulate Surge</span>
              </button>
              <button
                onClick={handleSimulateReset}
                disabled={simulating}
                className="px-2 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-semibold transition-all"
                title="Reset to normal"
              >
                Reset
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Simulation Feedback Alert */}
      {simulationMessage && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-800 px-4 py-2 text-xs font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-2 animate-in slide-in-from-top-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{simulationMessage}</span>
        </div>
      )}

      {/* Map Visual Box */}
      <div style={{ height }} className="relative w-full bg-slate-100 dark:bg-slate-950">
        <MapContainer
          center={activeStateObj.center}
          zoom={activeStateObj.zoom}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <RecenterMap center={activeStateObj.center} zoom={activeStateObj.zoom} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {locations.map((loc) => {
            if (!loc.latitude || !loc.longitude) return null;
            return (
              <Marker
                key={loc.id || `${loc.village}-${loc.district}`}
                position={[loc.latitude, loc.longitude]}
                icon={createCustomIcon(loc.risk_level, loc.alert_status)}
              >
                <Popup className="swasthya-custom-popup">
                  <div className="p-1 min-w-[250px] text-slate-800 font-sans">
                    
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-2 mb-2">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 leading-tight">{loc.village}</h4>
                        <div className="text-[11px] text-slate-500 font-medium">{loc.district}, {loc.state}</div>
                      </div>
                      <RiskBadge level={loc.alert_status === 'CONFIRMED' ? 'CONFIRMED' : loc.risk_level} score={loc.risk_score} size="sm" />
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] mb-2.5">
                      <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Active Cases</span>
                        <span className="font-bold text-slate-900 text-xs">{loc.active_cases || 0} cases</span>
                        {loc.case_growth !== undefined && (
                          <span className={`block text-[9px] font-semibold ${loc.case_growth > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                            {loc.case_growth > 0 ? `+${(loc.case_growth * 100).toFixed(0)}% growth` : 'Stable'}
                          </span>
                        )}
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Rainfall / Flood</span>
                        <span className="font-bold text-slate-900 text-xs">{loc.rainfall_mm || 0} mm</span>
                        <span className="block text-[9px] font-semibold text-teal-700">{loc.flood_status || 'Normal'}</span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Water Quality</span>
                        <span className="font-bold text-slate-900 text-[10px] leading-tight block">{loc.water_quality || 'Clean'}</span>
                        <span className="text-[9px] text-slate-500 font-mono">{loc.turbidity_ntu || 4.0} NTU</span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Primary Source</span>
                        <span className="font-bold text-slate-900 text-[10px] truncate block">{loc.water_source || 'Tube Well'}</span>
                        <span className="text-[9px] text-slate-500">Pop: {loc.population?.toLocaleString() || '3,000'}</span>
                      </div>
                    </div>

                    {/* Contributing Factors */}
                    {loc.contributing_factors && loc.contributing_factors.length > 0 && (
                      <div className="bg-amber-50/80 rounded p-2 border border-amber-200 text-[10px] mb-2">
                        <span className="font-bold text-amber-900 block mb-0.5">Key Risk Signals:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                          {loc.contributing_factors.slice(0, 2).map((f, i) => (
                            <li key={i} className="truncate">{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* XAI & IDSP Action Buttons inside popup */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1 mb-2">
                      <button
                        onClick={() => setSelectedLocationForXAI(loc)}
                        className="p-1.5 bg-teal-50 hover:bg-teal-100 text-teal-900 rounded-lg text-[10px] font-bold border border-teal-200 flex items-center justify-center gap-1 transition-all"
                      >
                        <BrainCircuit className="w-3 h-3 text-teal-700" />
                        <span>XAI Weights</span>
                      </button>
                      <button
                        onClick={() => setSelectedLocationForIDSP({
                          id: `ALT-${loc.village.toUpperCase()}-01`,
                          title: `IDSP Surveillance Dossier: ${loc.village}`,
                          state: loc.state,
                          district: loc.district,
                          village: loc.village,
                          risk_score: loc.risk_score,
                          risk_level: loc.risk_level,
                          total_cases: loc.active_cases || 12,
                          investigator_name: 'Dr. Bhaskar Sarma (PHC MO)',
                          investigation_notes: `Field sanitary survey confirmed elevated risk level in ${loc.village} following monsoon runoff.`,
                          confirmed_by: 'Dr. A. K. Baruah (DSO IDSP)'
                        })}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[10px] font-bold border border-slate-200 flex items-center justify-center gap-1 transition-all"
                      >
                        <FileText className="w-3 h-3 text-slate-700" />
                        <span>IDSP Form</span>
                      </button>
                    </div>

                    {/* Alert Status Footer */}
                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100">
                      <span className="text-slate-400">Status: <strong className="text-slate-700">{loc.alert_status || 'LOW'}</strong></span>
                      <span className="text-[9px] text-teal-700 font-semibold">SwasthyaJal NER</span>
                    </div>

                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur px-3 py-2 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
          <div className="font-bold text-slate-800 dark:text-slate-200 text-[10px] uppercase tracking-wider mb-1">Risk Legend</div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-600 border border-white shadow-sm animate-ping"></span>
            <span className="font-medium text-slate-700 dark:text-slate-300">Confirmed / Very High (81–100)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 border border-white shadow-sm"></span>
            <span className="font-medium text-slate-700 dark:text-slate-300">High Risk (61–80)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-400 border border-white shadow-sm"></span>
            <span className="font-medium text-slate-700 dark:text-slate-300">Medium Risk (31–60)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shadow-sm"></span>
            <span className="font-medium text-slate-700 dark:text-slate-300">Low Risk (0–30)</span>
          </div>
        </div>

      </div>

      {/* Summary Mini Bar */}
      {summary && (
        <div className="p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3 font-medium text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-4">
            <span>Monitored Villages: <strong className="text-slate-900 dark:text-white">{summary.total_monitored_villages}</strong></span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">🔴 {summary.confirmed_outbreaks} Confirmed Outbreaks</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">🟠 {summary.high_risk_villages} High Risk</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">🟢 {summary.low_risk_villages} Low Risk</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Region: <strong>Northeast India (8 States)</strong>
          </div>
        </div>
      )}

      {/* XAI & IDSP Modals */}
      <XAIExplainabilityModal
        isOpen={!!selectedLocationForXAI}
        onClose={() => setSelectedLocationForXAI(null)}
        location={selectedLocationForXAI}
      />

      <IDSPReportModal
        isOpen={!!selectedLocationForIDSP}
        onClose={() => setSelectedLocationForIDSP(null)}
        alertData={selectedLocationForIDSP}
      />

    </div>
  );
};
