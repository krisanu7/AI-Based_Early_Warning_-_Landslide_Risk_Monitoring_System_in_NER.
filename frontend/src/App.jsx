import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { SafetyBanner } from './components/layout/SafetyBanner';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { AshaDashboard } from './pages/AshaDashboard';
import { WaterObservationPage } from './pages/WaterObservationPage';
import { MedicalDashboard } from './pages/MedicalDashboard';
import { AuthorityDashboard } from './pages/AuthorityDashboard';
import { AlertInvestigationPage } from './pages/AlertInvestigationPage';
import { NortheastRiskMapPage } from './pages/NortheastRiskMapPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { DiseaseSafetyGuide } from './pages/DiseaseSafetyGuide';
import { PublicWarningPage } from './pages/PublicWarningPage';
import { AdminDashboard } from './pages/AdminDashboard';

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <SafetyBanner />
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Landing & Login */}
              <Route path="/" element={<AppLayout><LandingPage /></AppLayout>} />
              <Route path="/login" element={<AppLayout><LoginPage /></AppLayout>} />
              
              {/* Permanent 🛡️ Disease Safety Guide across all roles */}
              <Route path="/disease-safety-guide" element={<AppLayout><DiseaseSafetyGuide /></AppLayout>} />

              {/* Dashboards */}
              <Route path="/dashboard/asha" element={<AppLayout><AshaDashboard /></AppLayout>} />
              <Route path="/dashboard/medical" element={<AppLayout><MedicalDashboard /></AppLayout>} />
              <Route path="/dashboard/authority" element={<AppLayout><AuthorityDashboard /></AppLayout>} />
              <Route path="/dashboard/admin" element={<AppLayout><AdminDashboard /></AppLayout>} />

              {/* Functional Surveillance Pages */}
              <Route path="/cases/report" element={<AppLayout><AshaDashboard /></AppLayout>} />
              <Route path="/water/observation" element={<AppLayout><WaterObservationPage /></AppLayout>} />
              <Route path="/alerts/investigation" element={<AppLayout><AlertInvestigationPage /></AppLayout>} />
              <Route path="/map" element={<AppLayout><NortheastRiskMapPage /></AppLayout>} />
              <Route path="/analytics" element={<AppLayout><AnalyticsPage /></AppLayout>} />
              <Route path="/public-warnings" element={<AppLayout><PublicWarningPage /></AppLayout>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
