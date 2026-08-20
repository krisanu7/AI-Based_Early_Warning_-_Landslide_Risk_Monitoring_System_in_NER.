import React from 'react';
import { createPortal } from 'react-dom';
import { Phone, Hospital, MapPin, X, AlertCircle, Clock } from 'lucide-react';

export const ContactFacilityModal = ({ isOpen, onClose, defaultDistrict = 'Majuli' }) => {
  if (!isOpen) return null;

  const facilities = [
    {
      name: 'Garamur Primary Health Centre (PHC) & 24x7 Emergency',
      district: 'Majuli',
      state: 'Assam',
      phone: '104 (Toll-Free) / +91 3775 274400',
      address: 'Garamur Chariali, Majuli River Island, Assam 785104',
      type: '24/7 Primary Triage & Inpatient'
    },
    {
      name: 'Kamalabari Community Health Centre (CHC)',
      district: 'Majuli',
      state: 'Assam',
      phone: '+91 3775 273211',
      address: 'Kamalabari Ghat Road, Majuli, Assam',
      type: 'Sub-Divisional Hospital'
    },
    {
      name: 'Mawsynram Community Health Centre',
      district: 'East Khasi Hills',
      state: 'Meghalaya',
      phone: '+91 364 250123',
      address: 'Mawsynram Main Road, Meghalaya 793113',
      type: '24/7 Emergency & ORS Station'
    },
    {
      name: 'State Public Health Control Room (NER Hub)',
      district: 'Regional Directorate',
      state: 'Northeast Region',
      phone: '108 (Ambulance) / 1075 (National Health)',
      address: 'IDSP Surveillance Directorate, Khanapara, Guwahati',
      type: 'Emergency Dispatch'
    }
  ];

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div 
        className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="shrink-0 bg-gradient-to-r from-teal-700 to-teal-800 p-4 sm:p-5 text-white flex items-start justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <Hospital className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">Contact Healthcare Facility</h3>
              <p className="text-teal-100 text-xs mt-0.5">Verified Northeast India PHC / CHC Emergency Directory</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-xs transition-colors shrink-0"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Notice */}
        <div className="shrink-0 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 p-3 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>If patient shows severe vomiting, inability to drink, or extreme weakness, call <strong>108 / 104</strong> or visit the nearest Primary Health Centre immediately.</span>
        </div>

        {/* Scrollable Facility Cards */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {facilities.map((fac, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{fac.name}</h4>
                <span className="shrink-0 px-2 py-0.5 bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 rounded text-[10px] font-bold">
                  {fac.type}
                </span>
              </div>
              <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{fac.address}</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-teal-700 dark:text-teal-400">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{fac.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="shrink-0 p-3 sm:p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> 24x7 Helpline: <strong>104 / 108</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            Close
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
