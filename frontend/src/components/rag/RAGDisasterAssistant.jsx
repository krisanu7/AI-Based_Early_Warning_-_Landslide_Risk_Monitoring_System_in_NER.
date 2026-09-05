import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  BookOpenCheck, 
  Sparkles, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw,
  Globe,
  CheckCircle2,
  ShieldAlert,
  Download
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api/client';
import { exportRagPdf } from '../../utils/exportRagPdf';

const PRESET_QUERIES = [
  {
    label: "🚨 Tension Cracks on NH-27",
    query: "What is the standard operating procedure (SOP) when visible tension cracks and mudflow indicators appear on highway slopes like NH-27?"
  },
  {
    label: "⛺ Relief Ration Quotas",
    query: "What are the mandated daily relief ration, clean drinking water, and sanitation quotas per person in designated evacuation shelters?"
  },
  {
    label: "⚡ Warning Level Actions",
    query: "What immediate response actions must District Incident Commanders (DDMA) take when alert level reaches WARNING or CRITICAL?"
  },
  {
    label: "🛠️ Highway Slope Drainage",
    query: "What are the slope stabilization, catch-water drain clearing, and retaining wall inspection protocols for highway engineers?"
  }
];

const DISTRICTS = [
  "Dima Hasao (Assam)",
  "East Khasi Hills (Meghalaya)",
  "Gangtok (Sikkim)",
  "Champlai (Mizoram)",
  "Kamle (Arunachal Pradesh)",
  "Kohima (Nagaland)",
  "Ukhrul (Manipur)",
  "Unakoti (Tripura)"
];

export const RAGDisasterAssistant = () => {
  const { language } = useLanguage();
  const [query, setQuery] = useState('');
  const [district, setDistrict] = useState(DISTRICTS[0]);
  const [alertLevel, setAlertLevel] = useState('CRITICAL');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [showSnippets, setShowSnippets] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSearch = async (e, customQuery = null) => {
    if (e) e.preventDefault();
    const targetQuery = customQuery || query;
    if (!targetQuery.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);
    setIsSpeaking(false);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    try {
      const res = await api.post('/rag/query', {
        query: targetQuery,
        alert_level: alertLevel,
        district: district,
        language: language || 'en'
      });

      setResponse(res.data);
    } catch (err) {
      console.error("RAG Query Error:", err);
      const errMsg = err.response?.data?.detail || err.message || 'Error connecting to RAG AI Assistant service.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const toggleVoiceAudio = () => {
    if (!('speechSynthesis' in window) || !response?.answer) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      // Clean markdown symbols for speech synthesis
      const cleanText = response.answer
        .replace(/[*#`_]/g, '')
        .replace(/\[Source \d+: [^\]]+\]/g, '');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden">
      {/* Background Gradient Accent */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-slate-100">SafeSlope AI RAG Disaster Advisor</h2>
              <span className="bg-cyan-500/20 text-cyan-300 text-xs px-2.5 py-0.5 rounded-full border border-cyan-500/30 font-mono font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Gemini Grounded
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Instant NDMA SOPs, Highway Safety Pocketbook & Relief Logistics RAG Knowledge Base
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Alert Level:</span>
            <select 
              value={alertLevel} 
              onChange={(e) => setAlertLevel(e.target.value)}
              className="bg-transparent text-amber-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="NORMAL" className="bg-slate-900 text-emerald-400">NORMAL</option>
              <option value="WATCH" className="bg-slate-900 text-blue-400">WATCH</option>
              <option value="WARNING" className="bg-slate-900 text-amber-400">WARNING</option>
              <option value="CRITICAL" className="bg-slate-900 text-rose-400">CRITICAL</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <select 
              value={district} 
              onChange={(e) => setDistrict(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              {DISTRICTS.map(d => (
                <option key={d} value={d} className="bg-slate-900 text-slate-200">{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Preset Query Chips */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Recommended SOP Knowledge Queries:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRESET_QUERIES.map((item, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                setQuery(item.query);
                handleSearch(e, item.query);
              }}
              className="text-left text-xs bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 hover:border-cyan-500/50 rounded-xl p-2.5 transition-all text-slate-300 hover:text-cyan-300 flex items-center justify-between group"
            >
              <span className="font-medium truncate">{item.label}</span>
              <Send className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Query Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask any landslide SOP, highway protocol, or evacuation rule..."
          className="flex-1 bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-medium px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-900/20 transition-all shrink-0 cursor-pointer"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>{loading ? "Synthesizing..." : "Ask RAG"}</span>
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-rose-300 text-sm flex items-center gap-3 mb-6">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* RAG Answer Display Card */}
      {response && (
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-5 text-slate-200 shadow-inner space-y-4 animate-fadeIn">
          {/* Card Top Meta */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-700/70 text-xs">
            <div className="flex items-center gap-2 text-cyan-400 font-mono font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Grounded Response ({response.execution_time_ms} ms)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleVoiceAudio}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-medium transition-all ${
                  isSpeaking 
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse' 
                    : 'bg-slate-700/60 border-slate-600 text-slate-300 hover:text-white'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{isSpeaking ? "Stop Broadcast" : "🔊 Audio Readout"}</span>
              </button>
              <span className="bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md text-xs font-mono">
                {response.model_used}
              </span>
            </div>
          </div>

          {/* Formatted Answer */}
          <div className="prose prose-invert max-w-none text-sm leading-relaxed text-slate-100 whitespace-pre-line">
            {response.answer}
          </div>

          {/* Verified Document Sources & PDF Download Button */}
          <div className="pt-3 border-t border-slate-700/70">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                <BookOpenCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Source Documents Cited ({response.sources?.length || 0}):</span>
              </div>
              <button
                onClick={() => exportRagPdf({ query, response, alertLevel, district })}
                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer hover:shadow-emerald-900/20 active:scale-95 shrink-0"
                title="Download complete RAG model advisory as PDF document"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download PDF Report</span>
              </button>
            </div>

            {response.sources && response.sources.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {response.sources.map((src, i) => (
                  <span
                    key={i}
                    className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs px-3 py-1 rounded-lg font-mono flex items-center gap-1.5"
                  >
                    <FileText className="w-3 h-3 text-emerald-400" />
                    {src}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Expandable Retrieved Context Snippets */}
          {response.context_snippets && response.context_snippets.length > 0 && (
            <div className="pt-2">
              <button
                onClick={() => setShowSnippets(!showSnippets)}
                className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 font-medium focus:outline-none transition-colors"
              >
                <span>{showSnippets ? "Hide" : "Inspect"} Raw Vector Context Chunks ({response.context_snippets.length})</span>
                {showSnippets ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showSnippets && (
                <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1">
                  {response.context_snippets.map((snip, idx) => (
                    <div key={idx} className="bg-slate-900/90 border border-slate-700/60 rounded-lg p-3 text-xs font-mono text-slate-300">
                      <div className="text-cyan-400 font-semibold mb-1">
                        [Chunk #{idx+1} — {snip.source_file}]
                      </div>
                      <div className="text-slate-400 leading-relaxed whitespace-pre-wrap">
                        {snip.content_snippet}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
