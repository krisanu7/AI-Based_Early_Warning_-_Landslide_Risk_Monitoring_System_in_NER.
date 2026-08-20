import React from 'react';
import { createPortal } from 'react-dom';
import { Printer, Download, ShieldCheck, X, FileText, CheckCircle2 } from 'lucide-react';

export const IDSPReportModal = ({ isOpen, onClose, alertData, locationData }) => {
  if (!isOpen) return null;

  const data = alertData || {
    id: 'ALT-MAJULI-001',
    title: 'Severe Outbreak Signal: Acute Watery Diarrhea Cluster in Majuli',
    state: 'Assam',
    district: 'Majuli',
    village: 'Garamur & Kamalabari',
    risk_score: 88,
    risk_level: 'VERY HIGH',
    total_cases: 24,
    investigator_name: 'Dr. Bhaskar Sarma (MO PHC)',
    investigation_notes: 'Field sanitary inspection confirmed severe Brahmaputra flood backflow into community drinking shallow wells. High ORS demand.',
    confirmed_by: 'Dr. A. K. Baruah (District Surveillance Officer)',
    created_at: new Date().toISOString()
  };

  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div 
        className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Sticky Top Toolbar with Print & Close buttons - Always 100% visible */}
        <div className="sticky top-0 z-30 p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between shadow-md shrink-0 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold truncate pr-2">
            <FileText className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="truncate">Integrated Disease Surveillance Programme (IDSP) — Official Outbreak Dossier</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md hover:scale-105"
              title="Print or Save PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button 
              onClick={onClose} 
              className="w-7 h-7 rounded-xl bg-slate-800 hover:bg-slate-700 text-white/80 hover:text-white flex items-center justify-center font-bold text-xs transition-colors"
              title="Close Modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Printable Official Government Document Container */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 print:overflow-visible print:p-0 print:text-black">
          
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 dark:border-slate-700 pb-4 space-y-1">
            <div className="text-[11px] font-bold tracking-widest uppercase text-slate-600 dark:text-slate-400">
              Government of India • Ministry of Health & Family Welfare
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Integrated Disease Surveillance Programme (IDSP)
            </h2>
            <div className="text-xs font-bold text-teal-800 dark:text-teal-400">
              NORTHEAST REGIONAL WATER-BORNE DISEASE EARLY WARNING REPORT (FORM-S)
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Report Ref: IDSP/NER/2026/OB-{data.id || '001'} • Generated on {new Date().toLocaleString()}
            </div>
          </div>

          {/* Core Metadata Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-500 uppercase">State / District</span>
              <div className="font-bold text-slate-900 dark:text-white mt-0.5">{data.state} / {data.district}</div>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Epicentre Village</span>
              <div className="font-bold text-slate-900 dark:text-white mt-0.5">{data.village}</div>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-500 uppercase">AI Outbreak Score</span>
              <div className="font-black text-rose-600 mt-0.5">{data.risk_score || 88}/100 ({data.risk_level || 'VERY HIGH'})</div>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Active Case Count</span>
              <div className="font-black text-slate-900 dark:text-white mt-0.5">{data.total_cases || 24} Syndromic Cases</div>
            </div>
          </div>

          {/* Epidemiological Summary */}
          <div className="space-y-2 text-xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 pb-1">
              1. Epidemiological Signal & Environmental Drivers
            </h3>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <p className="leading-relaxed">
                <strong>Outbreak Signal:</strong> {data.title}
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>• Rainfall Velocity: <strong>92.4 mm (24h monsoon surge)</strong></div>
                <div>• Water Turbidity: <strong>32.5 NTU (Highly Contaminated)</strong></div>
                <div>• H2S Bacteriological Test: <strong>PRESUMPTIVE POSITIVE</strong></div>
                <div>• Cluster Radius: <strong>14.2 km Multi-Village Polygon</strong></div>
              </div>
            </div>
          </div>

          {/* Clinical Field Findings */}
          <div className="space-y-2 text-xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 pb-1">
              2. Medical Officer Field Findings & Sanitary Assessment
            </h3>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
              <p className="italic text-slate-700 dark:text-slate-300 leading-relaxed">
                &ldquo;{data.investigation_notes || 'Field inspection confirmed surface flood backflow into community drinking wells. High ORS demand.'}&rdquo;
              </p>
              <div className="text-[11px] text-slate-500 font-semibold pt-1">
                Triage Officer: <strong>{data.investigator_name || 'Dr. Bhaskar Sarma (Medical Officer)'}</strong>
              </div>
            </div>
          </div>

          {/* Recommended Countermeasures & Supply Allocation */}
          <div className="space-y-2 text-xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 pb-1">
              3. Rapid Response Countermeasures Dispatched
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold block">ORS Sachet Quota</span>
                <span className="font-black text-sm text-emerald-900 dark:text-emerald-200">120 Packets</span>
              </div>
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl">
                <span className="text-[10px] text-blue-800 dark:text-blue-300 font-bold block">Chlorine Disinfectant</span>
                <span className="font-black text-sm text-blue-900 dark:text-blue-200">500 Tablets (0.5g)</span>
              </div>
              <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl">
                <span className="text-[10px] text-purple-800 dark:text-purple-300 font-bold block">Surveillance Status</span>
                <span className="font-black text-sm text-purple-900 dark:text-purple-200">ACTIVE RRT DEPLOYED</span>
              </div>
            </div>
          </div>

          {/* Authorization & Signatures */}
          <div className="pt-4 border-t-2 border-slate-900 dark:border-slate-700 grid grid-cols-2 gap-8 text-xs">
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Investigated & Prepared By:</div>
              <div className="font-bold text-slate-900 dark:text-white mt-4">{data.investigator_name || 'Dr. Bhaskar Sarma'}</div>
              <div className="text-[10px] text-slate-500">Medical Officer, PHC Surveillance Unit</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-500 font-medium">Confirmed & Authorized By:</div>
              <div className="font-bold text-slate-900 dark:text-white mt-4">{data.confirmed_by || 'Dr. A. K. Baruah'}</div>
              <div className="text-[10px] text-teal-700 dark:text-teal-400 font-bold">District Surveillance Officer (IDSP / NER)</div>
            </div>
          </div>

        </div>

        {/* Bottom Footer Toolbar with Print & Close - print:hidden */}
        <div className="p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 print:hidden text-xs">
          <div className="text-[11px] text-slate-500">
            Form-S (IDSP Outbreak Surveillance)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};
