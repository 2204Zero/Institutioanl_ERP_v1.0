import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentsList from './pages/StudentsList';
import StudentProfile from './pages/StudentProfile';
import DepartmentsList from './pages/DepartmentsList';
import Attendance from './pages/Attendance';
import FinanceDashboard from './pages/FinanceDashboard';
import InstitutionsList from './pages/InstitutionsList';
import CampusesList from './pages/CampusesList';
import GuardiansList from './pages/GuardiansList';
import AdminUsersList from './pages/AdminUsersList';
import Admissions from './pages/Admissions';
import Academics from './pages/Academics';
import FacultySections from './pages/FacultySections';
import Layout from './components/Layout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 text-center">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-slate-900">Something went wrong.</h1>
            <p className="text-slate-600">The application encountered an unexpected error.</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function RoleProtectedRoute({ children, allowedRoles }: { children: ReactNode, allowedRoles: string[] }) {
  const user = useAuthStore((state) => state.user);
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }
  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-center space-y-4">
    <h1 className="text-4xl font-bold text-slate-900">404 - Page Not Found</h1>
    <p className="text-slate-600">The page you are looking for doesn't exist or has been moved.</p>
    <Button onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</Button>
  </div>
);

const Forbidden = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-center space-y-4">
    <h1 className="text-4xl font-bold text-slate-900">403 - Access Denied</h1>
    <p className="text-slate-600">You do not have permission to access this page.</p>
    <Button onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</Button>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/login" element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            } />
            <Route path="/403" element={<Forbidden />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="students" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'FINANCE']}><StudentsList /></RoleProtectedRoute>} />
              <Route path="students/:id" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT', 'PARENT', 'FINANCE']}><StudentProfile /></RoleProtectedRoute>} />
              <Route path="departments" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><DepartmentsList /></RoleProtectedRoute>} />
              <Route path="attendance" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT', 'PARENT']}><Attendance /></RoleProtectedRoute>} />
              <Route path="finance" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'STUDENT', 'PARENT']}><FinanceDashboard /></RoleProtectedRoute>} />
              <Route path="institutions" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN']}><InstitutionsList /></RoleProtectedRoute>} />
              <Route path="campuses" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN']}><CampusesList /></RoleProtectedRoute>} />
              <Route path="admissions" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><Admissions /></RoleProtectedRoute>} />
              <Route path="academics" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY']}><Academics /></RoleProtectedRoute>} />
              <Route path="sections" element={<RoleProtectedRoute allowedRoles={['FACULTY']}><FacultySections /></RoleProtectedRoute>} />
              <Route path="guardians" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><GuardiansList /></RoleProtectedRoute>} />
              <Route path="admin/users" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><AdminUsersList /></RoleProtectedRoute>} />
            </Route>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;