import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
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
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

function AppContent() {
  const [sihTourOpen, setSihTourOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar onOpenSIHTour={() => setSihTourOpen(true)} />
      <DisasterSafetyBanner />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          <Routes>
            <Route path="/" element={<LandingPage onOpenSIHTour={() => setSihTourOpen(true)} />} />
            <Route path="/dashboard" element={<MainDashboard />} />
            <Route path="/map" element={<MainDashboard />} />
            <Route path="/field-report" element={<FieldSurveillancePage />} />
            <Route path="/investigation" element={<AlertInvestigationPage />} />
            <Route path="/response" element={<DisasterResponsePage />} />
            <Route path="/infrastructure" element={<InfrastructureRiskPage />} />
            <Route path="/evacuation" element={<EvacuationDirectoryPage />} />
            <Route path="/public-warnings" element={<PublicWarningsPage />} />
            <Route path="/safety-guide" element={<LandslideSafetyGuidePage />} />
            <Route path="/analytics" element={<HistoricalAnalyticsPage />} />
            <Route path="/model-monitoring" element={<AdminModelMonitoringPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

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
