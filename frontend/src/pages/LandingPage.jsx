import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { LandingNavbar } from '../components/layout/LandingNavbar';
import { 
  Sparkles, 
  Map, 
  ShieldAlert, 
  Cpu, 
  CloudRain, 
  BellRing, 
  Truck, 
  ArrowRight,
  Globe2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  X,
  Send,
  AlertTriangle,
  Upload,
  Camera,
  Activity,
  Radio,
  FileText,
  PhoneCall,
  ExternalLink
} from 'lucide-react';

const SLIDES = [
  {
    badge: "CITIZEN SIGNAL NETWORK",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    dotColor: "bg-emerald-400 shadow-[0_0_10px_#10b981]",
    headlinePrefix: "Every ground observation is a",
    highlight1: "life-saving signal",
    highlight1Color: "text-emerald-400",
    highlight2: "protecting hill communities.",
    highlight2Color: "text-teal-300",
    description: "Connecting grassroots hazard reports and slope fissure signals directly with DDMA disaster responders and AI analytics to safeguard vulnerable lives across Northeast India.",
    primaryCta: {
      text: "Report a Hazard Signal",
      action: "report",
      icon: ArrowRight
    },
    secondaryCta: {
      text: "Register Institution / Scout",
      link: "/register"
    }
  },
  {
    badge: "GEOSPATIAL RADAR DEFENSE",
    badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    dotColor: "bg-cyan-400 shadow-[0_0_10px_#06b6d4]",
    headlinePrefix: "Every unstable mountain slope is an",
    highlight1: "early warning signal",
    highlight1Color: "text-cyan-400",
    highlight2: "detected in real-time.",
    highlight2Color: "text-emerald-400",
    description: "Integrating multi-temporal precipitation radar (1h to 72h) and satellite slope displacement models with 99.2% susceptibility prediction accuracy across 8 Northeast states.",
    primaryCta: {
      text: "Launch Command Radar",
      link: "/dashboard",
      icon: ArrowRight
    },
    secondaryCta: {
      text: "Explore Live GIS Map",
      link: "/map"
    }
  },
  {
    badge: "AI SURVEILLANCE & EARLY WARNING",
    badgeColor: "text-teal-400 bg-teal-500/10 border-teal-500/30",
    dotColor: "bg-teal-400 shadow-[0_0_10px_#14b8a6]",
    headlinePrefix: "Protecting vulnerable hill communities with",
    highlight1: "automated alerts",
    highlight1Color: "text-emerald-400",
    highlight2: "before disaster strikes.",
    highlight2Color: "text-cyan-300",
    description: "Delivering multi-lingual audio broadcasts in Assamese, Bengali, Hindi & English, and coordinating rapid road clearance on critical corridors (NH-27, NH-6, NH-29).",
    primaryCta: {
      text: "View Public Warnings",
      link: "/public-warnings",
      icon: ArrowRight
    },
    secondaryCta: {
      text: "Landslide Safety Guide",
      link: "/safety-guide"
    }
  }
];

const HOTSPOT_NODES = [
  { state: "Assam", loc: "Dima Hasao (Jatinga)", status: "Active Radar", risk: "Moderate (48%)", color: "text-amber-400" },
  { state: "Meghalaya", loc: "Khasi Hills (Cherrapunji)", status: "High Precip (142mm)", risk: "High (78%)", color: "text-rose-400" },
  { state: "Sikkim", loc: "Gangtok - Teesta Corridor", status: "Pore Pressure High", risk: "Warning (65%)", color: "text-amber-400" },
  { state: "Arunachal", loc: "Tawang Pass Slopes", status: "Normal", risk: "Low (22%)", color: "text-emerald-400" },
  { state: "Manipur", loc: "Tupul - Noney Rail Cut", status: "Sensors Online", risk: "Guarded (34%)", color: "text-emerald-400" },
  { state: "Nagaland", loc: "Kohima Bypass", status: "Telemetry Synced", risk: "Moderate (41%)", color: "text-amber-400" },
  { state: "Mizoram", loc: "Aizawl Fault Ridge", status: "Ground Scouts Active", risk: "Moderate (45%)", color: "text-amber-400" },
  { state: "Tripura", loc: "Jampui Hills", status: "Normal", risk: "Low (18%)", color: "text-emerald-400" }
];

export const LandingPage = ({ onOpenSIHTour }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Quick Problem Report Form State
  const [problemForm, setProblemForm] = useState({
    title: '',
    location: '',
    category: 'LANDSLIDE_CRACK',
    description: '',
    urgency: 'HIGH',
    submitted: false
  });

  // Assistant Chat Messages
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Namaste! Welcome to SafeSlope Northeast Signal Desk. You can ask about regional slope danger, report a tension crack, or request emergency SDRF contacts.'
    }
  ]);
  const [userInput, setUserInput] = useState('');

  // Auto carousel slide rotation
  useEffect(() => {
    if (isPaused || reportModalOpen) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [isPaused, reportModalOpen]);

  // Keyboard navigation for carousel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
      } else if (e.key === 'ArrowRight') {
        setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const slide = SLIDES[currentSlide];

  const handlePrimaryClick = (cta) => {
    if (cta.action === 'report') {
      setReportModalOpen(true);
    } else if (cta.link) {
      if (!user && cta.link !== '/register' && cta.link !== '/login') {
        navigate('/login', { state: { from: { pathname: cta.link } } });
      } else {
        navigate(cta.link);
      }
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userText = userInput;
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setUserInput('');

    setTimeout(() => {
      let botResponse = "Our AI system has logged your query. In case of active mud movement, evacuate immediately to the nearest designated shelter and dial SDRF at 1070.";
      const lower = userText.toLowerCase();
      if (lower.includes('dima hasao') || lower.includes('jatinga')) {
        botResponse = "Dima Hasao node status: Moderate risk (48%). Rainfall radar recorded 38mm/24h. Slope sensors at Jatinga pass are operating normally.";
      } else if (lower.includes('report') || lower.includes('crack') || lower.includes('problem')) {
        botResponse = "To report a visible slope fissure or roadblock, click the amber 'Report a Problem' button or visit the Citizen Signals tab for offline GPS submission.";
      } else if (lower.includes('shelter') || lower.includes('evacuat')) {
        botResponse = "There are 24 active evacuation shelters mapped across Assam, Meghalaya, and Sikkim. Visit the Evacuation Directory to find the nearest center with available capacity.";
      }

      setMessages((prev) => [...prev, { sender: 'bot', text: botResponse }]);
    }, 600);
  };

  const handleQuickReportSubmit = (e) => {
    e.preventDefault();
    setProblemForm({ ...problemForm, submitted: true });
    setTimeout(() => {
      setReportModalOpen(false);
      setProblemForm({
        title: '',
        location: '',
        category: 'LANDSLIDE_CRACK',
        description: '',
        urgency: 'HIGH',
        submitted: false
      });
      alert('Your signal report has been registered into the citizen hazard queue! Local disaster response authorities have been notified.');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#060c10] text-slate-100 font-sans selection:bg-emerald-400 selection:text-slate-950 flex flex-col relative overflow-x-hidden">
      
      {/* Top Navbar matching the screenshot */}
      <LandingNavbar 
        onOpenSIHTour={onOpenSIHTour}
        onOpenReportModal={() => setReportModalOpen(true)}
      />

      {/* Main Hero Section (Matching Screenshot) */}
      <section 
        className="relative w-full min-h-[85vh] sm:min-h-[88vh] flex items-center justify-center px-4 sm:px-8 py-16 overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[520px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-transparent rounded-full blur-[140px]" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px]" />
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
        </div>

        {/* Carousel Arrow Navigation Buttons (Far Left and Far Right, as in screenshot) */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
          className="absolute left-3 sm:left-8 md:left-12 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-slate-950/70 hover:bg-slate-900 border border-slate-700/60 backdrop-blur-md text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-2xl group"
          title="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300 group-hover:text-emerald-400 transition-colors" />
        </button>

        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % SLIDES.length)}
          className="absolute right-3 sm:right-8 md:right-12 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-slate-950/70 hover:bg-slate-900 border border-slate-700/60 backdrop-blur-md text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-2xl group"
          title="Next Slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300 group-hover:text-emerald-400 transition-colors" />
        </button>

        {/* Hero Content Container */}
        <div className="relative z-20 max-w-4xl mx-auto text-center space-y-7 animate-in fade-in duration-500 key={currentSlide}">
          
          {/* Top Pill Badge (e.g. CITIZEN SIGNAL NETWORK) */}
          <div className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border text-[11px] sm:text-xs font-black tracking-widest uppercase backdrop-blur-md transition-all duration-300 ${slide.badgeColor}`}>
            <span className={`w-2 h-2 rounded-full ${slide.dotColor} animate-pulse`} />
            <span>{slide.badge}</span>
          </div>

          {/* Large Bold Hero Headline with Styled Gradient Keywords */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.15]">
            <span>{slide.headlinePrefix}</span>
            <br />
            <span className={`${slide.highlight1Color} transition-colors duration-300`}>
              {slide.highlight1}{' '}
            </span>
            <span className={`${slide.highlight2Color} transition-colors duration-300`}>
              {slide.highlight2}
            </span>
          </h1>

          {/* Descriptive Subtitle */}
          <p className="max-w-2xl mx-auto text-slate-300/90 text-sm sm:text-base md:text-lg leading-relaxed font-normal">
            {slide.description}
          </p>

          {/* Action Buttons (Solid Emerald Primary + Dark Bordered Secondary) */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            
            {/* Primary Emerald Button */}
            <button
              onClick={() => handlePrimaryClick(slide.primaryCta)}
              className="px-7 py-3.5 sm:px-8 sm:py-4 rounded-xl font-bold text-sm sm:text-base text-slate-950 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-xl shadow-emerald-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>{slide.primaryCta.text}</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Secondary Dark Bordered Button */}
            {slide.secondaryCta.link.startsWith('#') ? (
              <a
                href={slide.secondaryCta.link}
                className="px-6 py-3.5 sm:px-7 sm:py-4 rounded-xl font-semibold text-sm sm:text-base text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/40 backdrop-blur-md shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                {slide.secondaryCta.text}
              </a>
            ) : (
              <Link
                to={!user && slide.secondaryCta.link !== '/register' && slide.secondaryCta.link !== '/login' ? '/login' : slide.secondaryCta.link}
                state={!user && slide.secondaryCta.link !== '/register' && slide.secondaryCta.link !== '/login' ? { from: { pathname: slide.secondaryCta.link } } : undefined}
                className="px-6 py-3.5 sm:px-7 sm:py-4 rounded-xl font-semibold text-sm sm:text-base text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/40 backdrop-blur-md shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                {slide.secondaryCta.text}
              </Link>
            )}

          </div>

          {/* Carousel Slide Indicator Dots */}
          <div className="flex items-center justify-center gap-2 pt-6">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all rounded-full ${
                  currentSlide === idx 
                    ? 'w-8 h-2 bg-emerald-400 shadow-[0_0_8px_#10b981]' 
                    : 'w-2 h-2 bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* Real-Time Live Hotspot Ticker */}
      <section className="w-full bg-[#0a141a] border-y border-slate-800/80 py-3.5 px-4 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 min-w-max">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Live Regional Nodes (8 NE States):
            </span>
          </div>

          <div className="flex items-center gap-5 text-xs">
            {HOTSPOT_NODES.map((node, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 shrink-0">
                <span className="font-bold text-slate-200">{node.state}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{node.loc}</span>
                <span className={`font-mono font-bold ${node.color}`}>{node.risk}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4-Pillar Surveillance Architecture Section */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>AI-Driven Geospatial Defense</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            The 4-Pillar Early Warning Architecture
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            From remote mountain slope rainfall radar to automated multi-lingual citizen broadcasts and highway clearance logistics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Pillar 01 */}
          <div className="p-7 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-blue-500/40 transition-all hover:-translate-y-1 shadow-xl space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-black text-lg border border-blue-500/20 group-hover:scale-110 transition-transform">
              01
            </div>
            <h3 className="font-black text-white text-lg group-hover:text-blue-400 transition-colors">
              Detect & Ingest
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-temporal precipitation radar (1h/6h/24h/48h/72h) + offline-first IndexedDB field surveys (&lt;60s) from remote mountain scouts with zero cellular connectivity.
            </p>
            <div className="pt-2">
              <Link 
                to="/dashboard"
                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <span>View Radar Feeds</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Pillar 02 */}
          <div className="p-7 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/40 transition-all hover:-translate-y-1 shadow-xl space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-black text-lg border border-purple-500/20 group-hover:scale-110 transition-transform">
              02
            </div>
            <h3 className="font-black text-white text-lg group-hover:text-purple-400 transition-colors">
              Predict & Explain
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Physics-informed Random Forest susceptibility pipeline (99.0% accuracy) with Explainable AI (XAI) feature attribution inspector for geotechnical engineers.
            </p>
            <div className="pt-2">
              <Link 
                to="/model-monitoring"
                className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <span>Inspect AI Telemetry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Pillar 03 */}
          <div className="p-7 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 transition-all hover:-translate-y-1 shadow-xl space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-black text-lg border border-amber-500/20 group-hover:scale-110 transition-transform">
              03
            </div>
            <h3 className="font-black text-white text-lg group-hover:text-amber-400 transition-colors">
              Cluster & Warn
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Haversine 25km corridor clustering and multi-lingual voice broadcasts in English, Assamese, Bengali, and Hindi with strict human-in-the-loop safety verification.
            </p>
            <div className="pt-2">
              <Link 
                to="/public-warnings"
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <span>Public Advisories</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Pillar 04 */}
          <div className="p-7 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-rose-500/40 transition-all hover:-translate-y-1 shadow-xl space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center font-black text-lg border border-rose-500/20 group-hover:scale-110 transition-transform">
              04
            </div>
            <h3 className="font-black text-white text-lg group-hover:text-rose-400 transition-colors">
              Coordinate & Respond
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cascading impact calculations on roads (NH-27, NH-6, NH-29) and automated logistics quotas (SDRF rescue teams, JCB earthmovers, evacuation shelters).
            </p>
            <div className="pt-2">
              <Link 
                to="/response"
                className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <span>Disaster Logistics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Regional Stats & Impact Metrics */}
      <section className="w-full bg-[#0a141a]/60 border-t border-slate-800/80 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">8</div>
              <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">NE States Protected</div>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-3xl sm:text-4xl font-black text-teal-400">99.0%</div>
              <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Model Accuracy</div>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-3xl sm:text-4xl font-black text-cyan-400">&lt;60s</div>
              <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Offline Field Sync</div>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-3xl sm:text-4xl font-black text-emerald-300">4</div>
              <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Languages Broadcast</div>
            </div>
          </div>

          {/* Quick Action Banner */}
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Are you an emergency agency or ground surveyor?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Access the official Command Center to review live satellite susceptibility grids, investigate alerts, or register your district response battalion.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                to={!user ? '/login' : '/dashboard'}
                state={!user ? { from: { pathname: '/dashboard' } } : undefined}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
              >
                Launch Command Center
              </Link>
              <button
                onClick={onOpenSIHTour}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm border border-slate-700 transition-all"
              >
                SIH Tour
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#050a0d] border-t border-slate-800/80 py-8 px-4 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-2 text-slate-400 font-bold">
          <span>SafeSlope NER • PS 26001</span>
          <span>•</span>
          <span>Smart India Hackathon 2026</span>
          <span>•</span>
          <span className="text-emerald-400">Team InnovateX</span>
        </div>
        <p className="text-[11px] text-slate-600 max-w-xl mx-auto">
          Built for disaster management authorities, geotechnical researchers, and mountain communities across Assam, Meghalaya, Sikkim, Arunachal, Manipur, Mizoram, Nagaland, and Tripura.
        </p>
      </footer>

      {/* FLOATING ACTION BUTTON (Emerald Chat / Emergency Assistance Widget) */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-2xl shadow-emerald-500/40 hover:scale-110 active:scale-95 transition-all cursor-pointer group"
        title="Citizen Signal & Emergency Assistant"
      >
        {chatOpen ? (
          <X className="w-6 h-6 text-slate-950" />
        ) : (
          <MessageSquare className="w-6 h-6 text-slate-950 group-hover:rotate-6 transition-transform" />
        )}
      </button>

      {/* Interactive Floating Chat Drawer */}
      {chatOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-40 w-[92vw] sm:w-96 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[500px] animate-in fade-in slide-in-from-bottom-5">
          
          {/* Chat Header */}
          <div className="bg-[#081014] p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <div className="text-xs font-black text-white">SafeSlope Citizen Assistant</div>
                <div className="text-[10px] text-emerald-400 font-medium">Early Warning Desk • Online</div>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Helpline Numbers Bar */}
          <div className="bg-emerald-500/10 px-4 py-2 border-b border-emerald-500/20 text-[11px] font-bold text-emerald-300 flex items-center justify-between">
            <span>Emergency SOS:</span>
            <div className="flex items-center gap-3">
              <span className="text-slate-200">NDMA: 1078</span>
              <span className="text-slate-200">SDRF: 1070</span>
            </div>
          </div>

          {/* Chat Body */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[82%] p-3 rounded-2xl ${
                    m.sender === 'user'
                      ? 'bg-emerald-500 text-slate-950 font-medium rounded-br-none'
                      : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/60 leading-relaxed'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-1.5 border-t border-slate-800 bg-slate-950/60 flex items-center gap-1.5 overflow-x-auto text-[10px]">
            <button
              onClick={() => setUserInput("Status of Dima Hasao slope?")}
              className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap"
            >
              Dima Hasao Status
            </button>
            <button
              onClick={() => setUserInput("How to report a ground fissure?")}
              className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap"
            >
              Report Fissure
            </button>
            <button
              onClick={() => setUserInput("Show nearest evacuation shelter")}
              className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap"
            >
              Nearest Shelter
            </button>
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-[#081014] flex items-center gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask about slope risk or emergency..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-400"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

      {/* QUICK PROBLEM / HAZARD REPORT MODAL (Triggered by 'Report a Problem' button) */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                  <AlertTriangle className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-black text-white text-base">Submit Citizen Hazard Signal</h3>
                  <p className="text-[11px] text-slate-400">Instantly alerts DDMA & SDRF response teams</p>
                </div>
              </div>
              <button
                onClick={() => setReportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {problemForm.submitted ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="font-bold text-white text-base">Signal Logged Successfully!</h4>
                <p className="text-xs text-slate-400">
                  Synchronizing GPS coordinates and notifying local disaster cell...
                </p>
              </div>
            ) : (
              <form onSubmit={handleQuickReportSubmit} className="space-y-3.5 text-xs">
                
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Issue / Observation Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Deep soil cracks appearing along NH-27 slope"
                    value={problemForm.title}
                    onChange={(e) => setProblemForm({ ...problemForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Location / Landmark</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dima Hasao, KM 14"
                      value={problemForm.location}
                      onChange={(e) => setProblemForm({ ...problemForm, location: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Hazard Category</label>
                    <select
                      value={problemForm.category}
                      onChange={(e) => setProblemForm({ ...problemForm, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-400"
                    >
                      <option value="LANDSLIDE_CRACK">Slope Tension Fissure</option>
                      <option value="ROAD_BLOCK">Debris / Road Blockage</option>
                      <option value="ROCKFALL">Rockfall / Debris Falling</option>
                      <option value="MUD_OVERFLOW">Water Seepage / Mudflow</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Details & Community Impact</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe how fast the crack is widening, houses nearby, or if road is blocked..."
                    value={problemForm.description}
                    onChange={(e) => setProblemForm({ ...problemForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between text-slate-400">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <span>Upload ground photos (optional)</span>
                  </div>
                  <label className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-white cursor-pointer font-bold text-[11px]">
                    Browse
                    <input type="file" className="hidden" accept="image/*" />
                  </label>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Signal Report</span>
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
