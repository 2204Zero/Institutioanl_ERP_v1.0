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
        const res = await apiClient.get('/api/v1/students', { params: { size: 1000 } });
        const students = res.data?.data?.content || [];
        const match = students.find((s: any) => s.email === user.username);
        return match?.id || null;
      }
      
      if (user.role === 'PARENT') {
        const res = await apiClient.get('/api/v1/guardians');
        const guardians = res.data?.data || [];
        const match = guardians.find((g: any) => g.email === user.username);
        return match?.studentId || null;
      }
      
      return null;
    },
    enabled: !!user?.username && (user.role === 'STUDENT' || user.role === 'PARENT'),
    staleTime: Infinity,
  });
}