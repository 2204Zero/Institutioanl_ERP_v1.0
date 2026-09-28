import React from 'react';
import { useERP } from '../../hooks/useERP';
import { StudentDashboard } from './StudentDashboard';
import { TeacherDashboard } from './TeacherDashboard';
import { ParentDashboard } from './ParentDashboard';
import { AdminDashboard } from './AdminDashboard';

export const DashboardDispatcher: React.FC = () => {
  const selectedRole = (localStorage.getItem('selectedRole') as string) || 'Admin';

  switch (selectedRole) {
    case 'Student':
      return <StudentDashboard />;
    case 'Teacher':
    case 'Faculty':
      return <TeacherDashboard />;
    case 'Parent':
      return <ParentDashboard />;
    case 'Admin':
    case 'SuperAdmin':
    case 'Dean':
    default:
      return <AdminDashboard />;
  }
};
