import React from 'react';
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
import Layout from './components/Layout';
function ProtectedRoute({ children }) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace/>;
}
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});
import { Toaster } from './components/ui/sonner';
function App() {
    return (<QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />}/>
          <Route path="/dashboard" element={<ProtectedRoute>
                <Layout />
              </ProtectedRoute>}>
            <Route index element={<Dashboard />}/>
            <Route path="students" element={<StudentsList />}/>
            <Route path="students/:id" element={<StudentProfile />}/>
            <Route path="departments" element={<DepartmentsList />}/>
            <Route path="attendance" element={<Attendance />}/>
            <Route path="finance" element={<FinanceDashboard />}/>
            <Route path="institutions" element={<InstitutionsList />}/>
            <Route path="campuses" element={<CampusesList />}/>
            <Route path="guardians" element={<GuardiansList />}/>
            <Route path="admin/users" element={<AdminUsersList />}/>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
        </Routes>
      </Router>
      <Toaster position="top-right" richColors/>
    </QueryClientProvider>);
}
export default App;
