import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Circle, LayersControl, LayerGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { RiskBadge } from '../common/RiskBadge';
import { 
  Mountain, 
  CloudRain, 
  Route, 
  Building2, 
  Sparkles, 
  AlertTriangle,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const NERLandslideMap = ({ 
  locations = [], 
  clusters = [], 
  infrastructure = [], 
  evacuationCenters = [],
  onSelectLocation = () => {},
  onOpenXAI = () => {},
  onOpenCascading = () => {}
}) => {
  const [activeFilter, setActiveFilter] = useState('ALL');

  const getMarkerColor = (score) => {
    if (score >= 81) return '#e11d48'; // Rose/Red (Critical)
    if (score >= 61) return '#d97706'; // Amber/Orange (High)
    if (score >= 31) return '#eab308'; // Yellow (Moderate)
    return '#10b981'; // Emerald/Green (Low)
  };

  const filteredLocations = locations.filter(loc => {
    if (activeFilter === 'CRITICAL') return loc.risk_score >= 81;
    if (activeFilter === 'HIGH') return loc.risk_score >= 61;
    if (activeFilter === 'RAINFALL_TRIGGER') return loc.rainfall_24h >= 100.0;
    return true;
  });

  return (
    <div className="relative w-full h-[540px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg bg-slate-900">
      
      {/* Quick Filter Bar */}
      <div className="absolute top-4 left-4 z-[400] flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md text-xs">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
            activeFilter === 'ALL'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Slopes ({locations.length})
        </button>
        <button
          onClick={() => setActiveFilter('CRITICAL')}
          className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
            activeFilter === 'CRITICAL'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
          }`}
        >
          Critical ({locations.filter(l => l.risk_score >= 81).length})
        </button>
        <button
          onClick={() => setActiveFilter('RAINFALL_TRIGGER')}
          className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
            activeFilter === 'RAINFALL_TRIGGER'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
          }`}
        >
          Rainfall Trigger ({locations.filter(l => l.rainfall_24h >= 100).length})
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg text-[11px] space-y-1.5">
        <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] pb-1 border-b border-slate-100 dark:border-slate-800">
          Landslide Risk Scale
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Critical (81–100)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">High Risk (61–80)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Moderate (31–60)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Low Risk (0–30)</span>
        </div>
      </div>

      {/* Main Leaflet Map */}
      <MapContainer
        center={[25.80, 93.20]}
        zoom={7}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 25km Cluster Hazard Zones */}
        {clusters.map((clus, idx) => (
          <Circle
            key={idx}
            center={[clus.center_latitude, clus.center_longitude]}
            radius={clus.radius_km * 1000}
            pathOptions={{
              color: clus.max_risk >= 81 ? '#e11d48' : '#d97706',
              fillColor: clus.max_risk >= 81 ? '#e11d48' : '#d97706',
              fillOpacity: 0.12,
              weight: 2,
              dashArray: '6, 8'
            }}
          >
            <Popup>
              <div className="p-2 space-y-1.5 text-xs">
                <div className="font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider text-[10px]">
                  25km Hazard Cluster Detected
                </div>
                <h4 className="font-bold text-slate-900">{clus.name}</h4>
                <p className="text-slate-600 text-[11px]">
                  Nodes Involved: <strong>{clus.node_count} slopes</strong>
                </p>
                <p className="text-slate-600 text-[11px]">
                  Peak Risk: <strong>{clus.max_risk}/100</strong>
                </p>
                <p className="text-slate-600 text-[11px]">
                  Total Population Exposed: <strong>{clus.total_population_exposed.toLocaleString()}</strong>
                </p>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Infrastructure Nodes (Highways / Bridges) */}
        {infrastructure.map((inf, idx) => (
          <CircleMarker
            key={`inf-${idx}`}
            center={[inf.latitude, inf.longitude]}
            radius={6}
            pathOptions={{
              color: '#3b82f6',
              fillColor: inf.status === 'BLOCKED' ? '#e11d48' : '#3b82f6',
              fillOpacity: 0.8,
              weight: 1.5
            }}
          >
            <Popup>
              <div className="p-2 space-y-1 text-xs">
                <div className="font-bold text-blue-600 uppercase text-[10px]">Critical Infrastructure</div>
                <div className="font-bold text-slate-900">{inf.name}</div>
                <div className="text-slate-600">Type: {inf.type}</div>
                <div className="text-slate-600 font-semibold">Status: <strong className={inf.status === 'BLOCKED' ? 'text-rose-600' : 'text-slate-800'}>{inf.status}</strong></div>
                <div className="text-[10px] text-slate-500 italic">{inf.alternative_route}</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Evacuation Centers */}
        {evacuationCenters.map((sh, idx) => (
          <CircleMarker
            key={`sh-${idx}`}
            center={[sh.latitude, sh.longitude]}
            radius={7}
            pathOptions={{
              color: '#10b981',
              fillColor: '#10b981',
              fillOpacity: 0.85,
              weight: 1.5
            }}
          >
            <Popup>
              <div className="p-2 space-y-1 text-xs">
                <div className="font-bold text-emerald-600 uppercase text-[10px]">Safe Evacuation Center</div>
                <div className="font-bold text-slate-900">{sh.name}</div>
                <div className="text-slate-600">Capacity: {sh.capacity} persons</div>
                <div className="text-slate-600">Current Occupancy: {sh.current_occupancy}</div>
                <div className="text-[10px] text-slate-500">Contact: {sh.contact}</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Landslide Monitored Slope Nodes */}
        {filteredLocations.map((loc) => {
          const color = getMarkerColor(loc.risk_score);
          return (
            <CircleMarker
              key={loc.id || loc.village}
              center={[loc.latitude, loc.longitude]}
              radius={loc.risk_score >= 81 ? 12 : (loc.risk_score >= 61 ? 9 : 7)}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.85,
                weight: 2
              }}
              eventHandlers={{
                click: () => onSelectLocation(loc)
              }}
            >
              <Popup>
                <div className="p-2 space-y-2 text-xs min-w-[240px]">
                  <div className="flex items-start justify-between gap-2 border-b pb-1.5">
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">{loc.village}</h4>
                      <p className="text-[11px] text-slate-500">{loc.district}, {loc.state}</p>
                    </div>
                    <RiskBadge level={loc.risk_level} score={loc.risk_score} size="sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">24h Rainfall:</span>
                      <strong className="text-blue-700 font-black">{loc.rainfall_24h || 0} mm</strong>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Slope Angle:</span>
                      <strong className="text-slate-800 font-bold">{loc.slope_degrees || 0}°</strong>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Soil Moisture:</span>
                      <strong className="text-slate-800 font-bold">{loc.soil_moisture_pct || 0}%</strong>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Population:</span>
                      <strong className="text-slate-800 font-bold">{(loc.population || 0).toLocaleString()}</strong>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => onOpenXAI(loc)}
                      className="flex-1 py-1.5 px-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl text-[11px] flex items-center justify-center gap-1 shadow-sm hover:scale-[1.02] transition-transform"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>XAI Insights</span>
                    </button>
                    <button
                      onClick={() => onOpenCascading(loc)}
                      className="flex-1 py-1.5 px-2 bg-slate-800 text-white font-bold rounded-xl text-[11px] flex items-center justify-center gap-1 shadow-sm hover:bg-slate-900 transition-colors"
                    >
                      <ShieldAlert className="w-3 h-3 text-amber-400" />
                      <span>Impact Radius</span>
                    </button>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

      </MapContainer>
    </div>
  );
};
