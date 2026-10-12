import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { useAuthStore } from '../store/useAuthStore';

export function useMyStudentId() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['myStudentId', user?.username, user?.role],
    queryFn: async () => {
      if (!user?.username) return null;
      
      if (user.role === 'STUDENT') {
        try {
          const res = await apiClient.get('/api/v1/students/me');
          return res.data?.data?.id || null;
        } catch {
          return null;
        }
      }
      
      if (user.role === 'PARENT') {
        try {
          const res = await apiClient.get('/api/v1/guardians');
          const guardians = res.data?.data || [];
          const match = guardians.find((g: any) => g.email === user.username);
          return match?.studentId || null;
        } catch {
          return null;
        }
      }
      
      return null;
    },
    enabled: !!user?.username && (user.role === 'STUDENT' || user.role === 'PARENT'),
    staleTime: Infinity,
  });
}