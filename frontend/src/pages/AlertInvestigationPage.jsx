import React, { useState, useEffect } from 'react';
import { fieldReportsApi, alertsApi } from '../api/client';
import { RiskBadge } from '../components/common/RiskBadge';
import { IncidentVerificationModal } from '../components/modals/IncidentVerificationModal';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Megaphone, 
  Camera, 
  MapPin, 
  AlertTriangle, 
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';

const CURATED_BASELINE_REPORTS = [
  {
    id: "RPT-NER-1789035038581",
    latitude: 25.1697,
    longitude: 93.0182,
    state: "Assam",
    district: "Dima Hasao",
    village: "Haflong",
    observation_date: "2026-09-10",
    visible_cracks: true,
    soil_mud_movement: true,
    rockfall_observed: false,
    water_seepage_present: true,
    road_blocked: true,
    house_damage: false,
    infrastructure_damage: true,
    estimated_severity: "CATASTROPHIC",
    approx_people_affected: 200,
    casualties_count: 0,
    missing_persons_count: 0,
    rainfall_intensity_observed: "LIGHT",
    photograph_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop",
    field_notes: "15cm tension cracks observed along slope. Continuous mud slurry moving towards road cut.",
    reporter_name: "Arun Bordoloi (Ground Surveyor)",
    reporter_role: "FIELD_WORKER",
    status: "VERIFIED",
    created_at: "2026-09-10T15:40:38.581244",
    verified_by: "System Administrator",
    verified_at: "2026-09-10T15:40:55.180349",
    verification_notes: "Field evidence confirmed by DDMA Incident Commander."
  },
  {
    id: "RPT-NER-1789034881793",
    latitude: 25.1697,
    longitude: 93.0182,
    state: "Assam",
    district: "Dima Hasao",
    village: "Haflong Block HQ",
    observation_date: "2026-09-10",
    visible_cracks: true,
    soil_mud_movement: true,
    rockfall_observed: false,
    water_seepage_present: true,
    road_blocked: true,
    house_damage: false,
    infrastructure_damage: true,
    estimated_severity: "SEVERE",
    approx_people_affected: 150,
    casualties_count: 0,
    missing_persons_count: 0,
    rainfall_intensity_observed: "HEAVY",
    photograph_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop",
    field_notes: "15cm tension cracks observed along slope. Continuous mud slurry moving towards road cut.",
    reporter_name: "Nandita Hazarika (Block Disaster Officer)",
    reporter_role: "BLOCK_OFFICER",
    status: "VERIFIED",
    created_at: "2026-09-10T15:38:01.793169",
    verified_by: "Nandita Hazarika (Block Disaster Officer)",
    verified_at: "2026-09-10T15:38:25.068402",
    verification_notes: "Field evidence confirmed by DDMA Incident Commander."
  },
  {
    id: "RPT-NER-1789034461177",
    latitude: 25.1697,
    longitude: 93.0182,
    state: "Assam",
    district: "Dima Hasao",
    village: "Haflong Block HQ",
    observation_date: "2026-09-10",
    visible_cracks: true,
    soil_mud_movement: true,
    rockfall_observed: true,
    water_seepage_present: true,
    road_blocked: true,
    house_damage: true,
    infrastructure_damage: true,
    estimated_severity: "SEVERE",
    approx_people_affected: 150,
    casualties_count: 0,
    missing_persons_count: 0,
    rainfall_intensity_observed: "HEAVY",
    photograph_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop",
    field_notes: "15cm tension cracks observed along slope. Continuous mud slurry moving towards road cut.",
    reporter_name: "Nandita Hazarika (Block Disaster Officer)",
    reporter_role: "BLOCK_OFFICER",
    status: "VERIFIED",
    created_at: "2026-09-10T15:31:01.177651",
    verified_by: "System Administrator",
    verified_at: "2026-09-10T15:35:33.320938",
    verification_notes: "Field evidence confirmed by DDMA Incident Commander."
  },
  {
    id: "6aa2c4d00eb6e8eb062910af",
    state: "Assam",
    district: "Dima Hasao",
    village: "Haflong Block HQ",
    latitude: 25.1697,
    longitude: 93.0182,
    observation_date: "2026-09-10",
    visible_cracks: true,
    soil_mud_movement: true,
    rockfall_observed: true,
    water_seepage_present: true,
    road_blocked: true,
    house_damage: false,
    infrastructure_damage: true,
    estimated_severity: "MINOR",
    approx_people_affected: 150,
    casualties_count: 0,
    missing_persons_count: 0,
    rainfall_intensity_observed: "NONE",
    photograph_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop",
    field_notes: "15cm tension cracks observed along slope. Continuous mud slurry moving towards road cut.",
    reporter_name: "Nandita Hazarika (Block Disaster Officer)",
    reporter_role: "BLOCK_OFFICER",
    client_id: "offline-rpt-1789052092392-xs503454m",
    status: "PENDING_VERIFICATION",
    created_at: "2026-09-10T14:54:52.392Z",
    synced_at: "2026-09-10T14:55:12.146006"
  },
  {
    id: "6aa184f674417eeb7b28af38",
    state: "Assam",
    district: "Dima Hasao",
    village: "Haflong Block HQ",
    latitude: 25.1697,
    longitude: 93.0182,
    observation_date: "2026-09-09",
    visible_cracks: true,
    soil_mud_movement: true,
    rockfall_observed: false,
    water_seepage_present: true,
    road_blocked: true,
    house_damage: false,
    infrastructure_damage: true,
    estimated_severity: "SEVERE",
    approx_people_affected: 150,
    casualties_count: 0,
    missing_persons_count: 0,
    rainfall_intensity_observed: "HEAVY",
    photograph_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop",
    field_notes: "15cm tension cracks observed along slope. Continuous mud slurry moving towards road cut.",
    reporter_name: "Nandita Hazarika (Block Disaster Officer)",
    reporter_role: "BLOCK_OFFICER",
    client_id: "offline-rpt-1788970165864-6761tyecl",
    status: "PENDING_VERIFICATION",
    created_at: "2026-09-09T16:09:25.864Z",
    synced_at: "2026-09-09T16:10:30.069807"
  },
  {
    id: "6a9462154ce9fb16aa1b34f1",
    latitude: 25.1697,
    longitude: 93.0182,
    state: "Assam",
    district: "Dima Hasao",
    village: "Haflong",
    observation_date: "2026-08-30",
    visible_cracks: true,
    soil_mud_movement: true,
    rockfall_observed: true,
    water_seepage_present: true,
    road_blocked: true,
    house_damage: false,
    infrastructure_damage: true,
    estimated_severity: "MINOR",
    approx_people_affected: 150,
    casualties_count: 0,
    missing_persons_count: 0,
    rainfall_intensity_observed: "LIGHT",
    photograph_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop",
    field_notes: "15cm tension cracks observed along slope. Continuous mud slurry moving towards road cut.",
    reporter_name: "Krisanu Samanta",
    reporter_role: "ADMIN",
    status: "PENDING_VERIFICATION",
    created_at: "2026-08-30T17:02:13.928032",
    verified_by: null,
    verified_at: null
  },
  {
    id: "6a91a4dcb1de9e5a9a67fe63",
    latitude: 22.6039,
    longitude: 88.3676,
    state: "Assam",
    district: "Dima Hasao",
    village: "Haflong",
    observation_date: "2026-08-28",
    visible_cracks: true,
    soil_mud_movement: true,
    rockfall_observed: false,
    water_seepage_present: true,
    road_blocked: true,
    house_damage: false,
    infrastructure_damage: true,
    estimated_severity: "SEVERE",
    approx_people_affected: 150,
    casualties_count: 0,
    missing_persons_count: 0,
    rainfall_intensity_observed: "HEAVY",
    photograph_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop",
    field_notes: "15cm tension cracks observed along slope. Continuous mud slurry moving towards road cut.",
    reporter_name: "Arun Bordoloi (Ground Surveyor)",
    reporter_role: "FIELD_WORKER",
    status: "PENDING_VERIFICATION",
    created_at: "2026-08-28T15:10:20.694216",
    verified_by: null,
    verified_at: null
  },
  {
    id: "RPT-NER-002",
    state: "Meghalaya",
    district: "East Jaintia Hills",
    village: "Sonapur Tunnel Approach",
    latitude: 25.1092,
    longitude: 92.3685,
    observation_date: "2026-08-28",
    visible_cracks: true,
    soil_mud_movement: true,
    rockfall_observed: true,
    water_seepage_present: true,
    road_blocked: true,
    house_damage: false,
    infrastructure_damage: true,
    estimated_severity: "CATASTROPHIC",
    approx_people_affected: 850,
    casualties_count: 0,
    missing_persons_count: 0,
    rainfall_intensity_observed: "TORRENTIAL",
    photograph_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop",
    field_notes: "Debris avalanche blocked both portals of Sonapur tunnel on NH-6. 4 JCBs deployed by NHAI for emergency clearing.",
    reporter_name: "K. Lyngdoh (Field Surveyor)",
    reporter_role: "FIELD_WORKER",
    status: "PENDING_VERIFICATION",
    verified_by: null,
    verified_at: null,
    created_at: "2026-08-28T13:52:08.407975"
  },
  {
    id: "RPT-NER-001",
    state: "Assam",
    district: "Dima Hasao",
    village: "Haflong Hill Cut",
    latitude: 25.1697,
    longitude: 93.0182,
    observation_date: "2026-08-28",
    visible_cracks: true,
    soil_mud_movement: true,
    rockfall_observed: true,
    water_seepage_present: true,
    road_blocked: true,
    house_damage: true,
    infrastructure_damage: true,
    estimated_severity: "SEVERE",
    approx_people_affected: 320,
    casualties_count: 0,
    missing_persons_count: 0,
    rainfall_intensity_observed: "TORRENTIAL",
    photograph_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop",
    field_notes: "Continuous tension cracks of 15cm width noticed along NH-27 cut-slope. Mud slurry flowing towards residential cluster.",
    reporter_name: "Arun Bordoloi (Ground Surveyor)",
    reporter_role: "FIELD_WORKER",
    status: "VERIFIED",
    verified_by: "Dr. Subhashish Deb (District Disaster Officer)",
    verified_at: "2026-08-28T14:52:08.406537",
    created_at: "2026-08-28T11:52:08.407054"
  }
];

export const AlertInvestigationPage = () => {
  const [reports, setReports] = useState(CURATED_BASELINE_REPORTS);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rRes, aRes] = await Promise.all([
        fieldReportsApi.list(),
        alertsApi.list()
      ]);
      const fetched = rRes.data || [];
      // Filter out stale demo reports if any exist in cloud cache
      const nonOldDemoReports = fetched.filter(
        r => r.id !== 'RPT-NER-DEMO-001' && r.id !== 'RPT-NER-DEMO-002'
      );
      
      const mergedMap = new Map();
      // Put live API reports in map first
      nonOldDemoReports.forEach(r => {
        if (r.id) mergedMap.set(r.id, r);
      });
      // Ensure the 9 core baseline reports are always present
      CURATED_BASELINE_REPORTS.forEach(b => {
        if (!mergedMap.has(b.id)) {
          mergedMap.set(b.id, b);
        }
      });
      
      const mergedList = Array.from(mergedMap.values()).map(r => ({
        ...r,
        photograph_url: r.photograph_url || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop'
      }));

      // Sort newest first
      mergedList.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

      setReports(mergedList);
      setAlerts(aRes.data || []);
    } catch (e) {
      console.error(e);
      setReports(CURATED_BASELINE_REPORTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenVerify = (item) => {
    setSelectedIncident(item);
    setVerifyModalOpen(true);
  };

  const filteredReports = reports.filter(r => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Disaster Incident Investigation & Verification Queue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Human-in-the-Loop Triage & Warning Center
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Review ground scout field evidence, inspect photos, cross-examine AI risk signals, and publish authorized public warnings.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-2xl border border-slate-700 shadow-md flex items-center gap-2 transition-all shrink-0"
        >
          <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-bold">
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            filterStatus === 'ALL'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Reports ({reports.length})
        </button>
        <button
          onClick={() => setFilterStatus('PENDING_VERIFICATION')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            filterStatus === 'PENDING_VERIFICATION'
              ? 'bg-amber-500 text-white'
              : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
          }`}
        >
          Pending Review ({reports.filter(r => r.status === 'PENDING_VERIFICATION').length})
        </button>
        <button
          onClick={() => setFilterStatus('VERIFIED')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            filterStatus === 'VERIFIED'
              ? 'bg-emerald-600 text-white'
              : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
          }`}
        >
          Verified Events ({reports.filter(r => r.status === 'VERIFIED').length})
        </button>
      </div>

      {/* Reports Investigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((rpt, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block">{rpt.id}</span>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    {rpt.village}
                  </h3>
                  <p className="text-xs text-slate-500">{rpt.district}, {rpt.state}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  rpt.status === 'VERIFIED'
                    ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-600 border border-amber-500/30 animate-pulse'
                }`}>
                  {rpt.status}
                </span>
              </div>

              {/* Photograph Evidence */}
              <div className="relative rounded-2xl overflow-hidden h-36 bg-slate-800 border border-slate-200 dark:border-slate-700">
                <img
                  src={rpt.photograph_url || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop'}
                  alt="Landslide Evidence"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop';
                  }}
                />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur text-[10px] text-white font-mono">
                  📍 {rpt.latitude ? `${rpt.latitude}° N, ${rpt.longitude}° E` : '25.1697° N, 93.0182° E'}
                </div>
              </div>

              {/* Signs Badges */}
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                {rpt.visible_cracks && (
                  <span className="px-2 py-0.5 rounded-lg bg-rose-500/15 text-rose-700 dark:text-rose-300 font-bold">
                    Tension Cracks
                  </span>
                )}
                {rpt.soil_mud_movement && (
                  <span className="px-2 py-0.5 rounded-lg bg-rose-500/15 text-rose-700 dark:text-rose-300 font-bold">
                    Active Mudflow
                  </span>
                )}
                {rpt.road_blocked && (
                  <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold">
                    Highway Blocked
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                "{rpt.field_notes || 'No description provided.'}"
              </p>

              <div className="text-[10px] text-slate-400 space-y-0.5">
                <div>Observed: <strong>{rpt.observation_date}</strong></div>
                <div>Scout: <strong>{rpt.reporter_name}</strong> ({rpt.reporter_role})</div>
              </div>
            </div>

            {/* Action */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleOpenVerify(rpt)}
                className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all hover:scale-[1.01]"
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Verify & Broadcast Public Warning</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <IncidentVerificationModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        incident={selectedIncident}
        onVerified={fetchData}
      />

    </div>
  );
};
