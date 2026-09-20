import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { DisasterSafetyBanner } from './components/layout/DisasterSafetyBanner';
import { SIHPitchTourModal } from './components/modals/SIHPitchTourModal';

import { LandingPage } from './pages/LandingPage';
import { MainDashboard } from './pages/MainDashboard';
import { FieldSurveillancePage } from './pages/FieldSurveillancePage';
import { AlertInvestigationPage } from './pages/AlertInvestigationPage';
import { DisasterResponsePage } from './pages/DisasterResponsePage';
import { InfrastructureRiskPage } from './pages/InfrastructureRiskPage';
import { EvacuationDirectoryPage } from './pages/EvacuationDirectoryPage';
import { PublicWarningsPage } from './pages/PublicWarningsPage';
import { LandslideSafetyGuidePage } from './pages/LandslideSafetyGuidePage';
import { HistoricalAnalyticsPage } from './pages/HistoricalAnalyticsPage';
import { AdminModelMonitoringPage } from './pages/AdminModelMonitoringPage';
import { VisualTerrainInspectorPage } from './pages/VisualTerrainInspectorPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

function AppContent() {
  const [sihTourOpen, setSihTourOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const isLanding = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // 1. Landing Page: Full-bleed hero marketing interface
  if (isLanding) {
    return (
      <div className="min-h-screen bg-[#070e13] text-slate-100 flex flex-col max-w-full overflow-x-hidden">
        <LandingPage onOpenSIHTour={() => setSihTourOpen(true)} />
        <SIHPitchTourModal
          isOpen={sihTourOpen}
          onClose={() => setSihTourOpen(false)}
        />
      </div>
    );
  }

  // 2. Auth Pages (/register, /login): All sections (sidebar, operational navbar, safety ticker) are HIDDEN
  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage initialMode="login" />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    );
  }

  // 3. Protected Dashboard Routes: Unregistered/unauthenticated visitors must login/register first
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 4. Authenticated Operational Dashboard Layout
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors max-w-full overflow-x-hidden">
      <Navbar 
        onOpenSIHTour={() => setSihTourOpen(true)} 
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />
      <DisasterSafetyBanner />

      <div className="flex-1 flex relative max-w-full">
        <Sidebar 
          isOpenMobile={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          onOpenSIHTour={() => setSihTourOpen(true)}
        />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto max-w-full w-full pb-20 lg:pb-8">
          <Routes>
            <Route path="/dashboard" element={<MainDashboard />} />
            <Route path="/map" element={<MainDashboard />} />
            <Route path="/field-report" element={<FieldSurveillancePage />} />
            <Route path="/visual-inspector" element={<VisualTerrainInspectorPage />} />
            <Route path="/investigation" element={<AlertInvestigationPage />} />
            <Route path="/response" element={<DisasterResponsePage />} />
            <Route path="/infrastructure" element={<InfrastructureRiskPage />} />
            <Route path="/evacuation" element={<EvacuationDirectoryPage />} />
            <Route path="/public-warnings" element={<PublicWarningsPage />} />
            <Route path="/safety-guide" element={<LandslideSafetyGuidePage />} />
            <Route path="/analytics" element={<HistoricalAnalyticsPage />} />
            <Route path="/model-monitoring" element={<AdminModelMonitoringPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>

      {/* Floating Mobile Bottom Navigation Bar for Operational Dashboard */}
      <MobileBottomNav 
        onOpenMenu={() => setMobileMenuOpen(true)} 
        onOpenSIHTour={() => setSihTourOpen(true)} 
      />

      <SIHPitchTourModal
        isOpen={sihTourOpen}
        onClose={() => setSihTourOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
