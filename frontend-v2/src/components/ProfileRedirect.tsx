import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { Loader2 } from 'lucide-react';

export function ProfileRedirect() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: student, isLoading: loadingStudent } = useQuery({
    queryKey: ['my-student-profile-redirect'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/api/v1/students/me');
        return res.data?.data || res.data;
      } catch (e) {
        return null;
      }
    },
    enabled: user?.role === 'STUDENT'
  });

  const { data: wards, isLoading: loadingWards } = useQuery({
    queryKey: ['my-wards-redirect'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/api/v1/guardians/me/wards');
        return res.data?.data || res.data || [];
      } catch (e) {
        return [];
      }
    },
    enabled: user?.role === 'PARENT'
  });

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    if (user.role === 'STUDENT') {
      if (!loadingStudent) {
        if (student?.id) {
          navigate(`/dashboard/students/${student.id}`, { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    } else if (user.role === 'PARENT') {
      if (!loadingWards) {
        if (wards && wards.length > 0) {
          navigate(`/dashboard/students/${wards[0].id}`, { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    } else {
      navigate('/dashboard/students', { replace: true });
    }
  }, [user, student, wards, loadingStudent, loadingWards, navigate]);

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 min-h-[300px] rounded-2xl m-4">
      <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-2" />
      <p className="text-xs text-slate-500 font-medium">Navigating to your profile context...</p>
    </div>
  );
}
