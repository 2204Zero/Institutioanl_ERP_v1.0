import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProviders } from './providers/AppProviders';
import { RoleSelectPage } from './pages/RoleSelectPage';
import { LoginPage } from './pages/LoginPage';
import { AppLayout } from './components/layout/AppLayout';
import { FinanceDashboardPage } from './pages/FinanceDashboardPage';
import { SISPage } from './pages/SISPage';
import { AcademicsPage } from './pages/AcademicsPage';
import { AttendancePage } from './pages/AttendancePage';
import { SettingsPage } from './pages/SettingsPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { ServerErrorPage } from './pages/ServerErrorPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedRoute } from './components/routing/ProtectedRoute';

export const App: React.FC = () => {
  return (
    <AppProviders>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<RoleSelectPage />} />
          <Route path="/login" element={<RoleSelectPage />} />
          <Route path="/login/:role" element={<LoginPage />} />

          {/* Protected Application Workspace */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<FinanceDashboardPage />} />
            <Route path="/finance" element={<FinanceDashboardPage />} />
            <Route path="/sis" element={<SISPage />} />
            <Route path="/academics" element={<AcademicsPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/500" element={<ServerErrorPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProviders>
  );
};

export default App;
