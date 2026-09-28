import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RoleSelectionPage } from '../pages/RoleSelectionPage';
import { SignUpPage } from '../pages/SignUpPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { VerifyEmailPage } from '../pages/VerifyEmailPage';
import { AccountSettingsPage } from '../pages/AccountSettingsPage';
import { FinanceDashboardPage } from '../pages/FinanceDashboardPage';
import { DashboardDispatcher } from '../pages/dashboards/DashboardDispatcher';
import { AdmissionsPage } from '../pages/AdmissionsPage';
import { SISPage } from '../pages/SISPage';
import { TimetablePage } from '../pages/TimetablePage';
import { AttendancePage } from '../pages/AttendancePage';
import { GradebookPage } from '../pages/GradebookPage';
import { HRPage } from '../pages/HRPage';
import { LibraryPage } from '../pages/LibraryPage';
import { HostelPage } from '../pages/HostelPage';
import { TransportPage } from '../pages/TransportPage';
import { UserAuthPage } from '../pages/UserAuthPage';
import { OrgStructurePage } from '../pages/OrgStructurePage';
import { LMSPage } from '../pages/LMSPage';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Authentication & Role Selection Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/roles" element={<RoleSelectionPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected ERP Module Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardDispatcher />} />
        <Route path="/finance" element={<FinanceDashboardPage />} />
        <Route path="/admissions" element={<AdmissionsPage />} />
        <Route path="/sis" element={<SISPage />} />
        <Route path="/lms" element={<LMSPage />} />
        <Route path="/timetable" element={<TimetablePage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/gradebook" element={<GradebookPage />} />
        <Route path="/hr" element={<HRPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/hostel" element={<HostelPage />} />
        <Route path="/transport" element={<TransportPage />} />
        <Route path="/auth" element={<UserAuthPage />} />
        <Route path="/org" element={<OrgStructurePage />} />
        <Route path="/settings/account" element={<AccountSettingsPage />} />

        {/* Role Restricted Admin Area */}
        <Route element={<RoleRoute allowedRoles={['SuperAdmin', 'Admin', 'Dean']} />}>
          <Route path="/admin/settings" element={<AccountSettingsPage />} />
        </Route>
      </Route>

      {/* Fallback Catch-All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
