import { useAuthStore } from '../store/useAuthStore';
import FacultyDashboard from './FacultyDashboard';
import StudentDashboard from './StudentDashboard';
import ParentDashboard from './ParentDashboard';
import FinanceDashboardHome from './FinanceDashboardHome';
import ManagementDashboard from './ManagementDashboard';
import ApplicantDashboard from './ApplicantDashboard';
import { PageFrame } from '../components/ui/PageFrame';

export default function Dashboard() {
  const { user } = useAuthStore();
  const role = user?.role || '';

  switch (role) {
    case 'FACULTY':
      return <FacultyDashboard />;
    case 'STUDENT':
      return <StudentDashboard />;
    case 'PARENT':
      return <ParentDashboard />;
    case 'FINANCE':
      return <FinanceDashboardHome />;
    case 'SUPER_ADMIN':
    case 'ADMIN':
      return <ManagementDashboard />;
    case 'APPLICANT':
      return <ApplicantDashboard />;
    default:
      return (
        <PageFrame title={`Dashboard — Welcome, ${user?.username || 'User'}`} description="Welcome back.">
          <div className="flex h-64 items-center justify-center bg-white border border-slate-200">
            <p className="text-slate-500">Welcome to EduPulse ERP. Please select a navigation option from the menu.</p>
          </div>
        </PageFrame>
      );
  }
}