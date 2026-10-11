import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { AlertCircle, Loader2, Plus, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface CourseOffering {
  id: number;
  course: { id: number; name: string; code: string };
  semester: { id: number; name: string; semesterNumber: number };
  maxCapacity: number;
  isPublished: boolean;
}

interface Section {
  id: number;
  name: string;
  capacity?: number;
  currentEnrollment?: number;
}

interface CourseRegistration {
  id: number;
  courseOffering: CourseOffering;
  section: Section;
  status: string;
  registeredAt: string;
}

export function StudentAcademicTab({ studentId }: { studentId: number }) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const canManage = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  const [selectedCourseOfferingId, setSelectedCourseOfferingId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');

  const { data: registrationsResponse, isLoading: isLoadingRegistrations } = useQuery({
    queryKey: ['course-registrations', studentId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/course-registrations`, {
        params: { studentId }
      });
      return res.data;
    },
    enabled: canManage && !!studentId
  });

  const { data: offeringsResponse } = useQuery({
    queryKey: ['course-offerings'],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/course-offerings`);
      return res.data;
    },
    enabled: canManage
  });

  const { data: sectionsResponse } = useQuery({
    queryKey: ['sections', selectedCourseOfferingId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/sections`, {
        params: { courseOfferingId: selectedCourseOfferingId }
      });
      return res.data;
    },
    enabled: canManage && !!selectedCourseOfferingId
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(`/api/v1/course-registrations`, null, {
        params: {
          studentId,
          courseOfferingId: selectedCourseOfferingId,
          sectionId: selectedSectionId
        }
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Student registered successfully');
      setSelectedCourseOfferingId('');
      setSelectedSectionId('');
      queryClient.invalidateQueries({ queryKey: ['course-registrations', studentId] });
      queryClient.invalidateQueries({ queryKey: ['sections'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to register student';
      toast.error(msg);
    }
  });

  const dropMutation = useMutation({
    mutationFn: async (registrationId: number) => {
      const res = await apiClient.patch(`/api/v1/course-registrations/${registrationId}/drop`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Registration dropped successfully');
      queryClient.invalidateQueries({ queryKey: ['course-registrations', studentId] });
      queryClient.invalidateQueries({ queryKey: ['sections'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to drop course';
      toast.error(msg);
    }
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) {
      toast.error('Only administrators can register students for courses');
      return;
    }
    if (!selectedCourseOfferingId || !selectedSectionId) {
      toast.error('Please select both a course offering and a section');
      return;
    }
    const chosenSection = sections.find(s => String(s.id) === selectedSectionId);
    if (chosenSection) {
      const cap = typeof chosenSection.capacity === 'number' ? chosenSection.capacity : null;
      const enrolled = typeof chosenSection.currentEnrollment === 'number' ? chosenSection.currentEnrollment : 0;
      if (cap === null) {
        toast.error('Selected section does not have an assigned capacity');
        return;
      }
      if (enrolled >= cap) {
        toast.error('Selected section is already full');
        return;
      }
    }
    registerMutation.mutate();
  };

  const registrations: CourseRegistration[] = registrationsResponse || [];
  const offerings: CourseOffering[] = offeringsResponse || [];
  const sections: Section[] = sectionsResponse || [];

  if (!canManage) {
    return (
      <div className="border border-slate-200 bg-white">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Academic Registrations</h3>
        </div>
        <div className="flex flex-col items-center justify-center p-12 bg-slate-50/50">
          <div className="w-10 h-10 bg-slate-200 flex items-center justify-center mb-3 rounded-full">
            <ShieldAlert className="w-5 h-5 text-slate-500" />
          </div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">Registration Access Restricted</h4>
          <p className="text-slate-500 text-xs text-center max-w-md mt-1">
            Course registrations are managed directly by Academic Administrators. Student and self-service registration tracking is currently restricted on this endpoint.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border border-slate-200 bg-white">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Current Registrations</h3>
        </div>
        <div className="p-0">
          {isLoadingRegistrations ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs italic bg-slate-50">
              No active course registrations found.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {registrations.map(reg => (
                <div key={reg.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {reg.status === 'REGISTERED' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{reg.courseOffering.course.name} ({reg.courseOffering.course.code})</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Section: {reg.section.name} &bull; Semester: {reg.courseOffering.semester.name}
                      </p>
                      <div className="flex items-center mt-1.5 space-x-2">
                         <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                           reg.status === 'REGISTERED' ? 'bg-emerald-100 text-emerald-800' :
                           reg.status === 'DROPPED' ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-800'
                         }`}>
                           {reg.status}
                         </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0">
                    {reg.status === 'REGISTERED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-orange-600 border-orange-200 hover:bg-orange-50"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to drop this course?')) {
                            dropMutation.mutate(reg.id);
                          }
                        }}
                        disabled={dropMutation.isPending}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Drop
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border border-slate-200 bg-white">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Register for Course</h3>
        </div>
        <div className="p-4">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Course Offering</label>
                <select
                  className="w-full text-sm border-slate-200 rounded-md focus:ring-slate-900 focus:border-slate-900"
                  value={selectedCourseOfferingId}
                  onChange={(e) => {
                    setSelectedCourseOfferingId(e.target.value);
                    setSelectedSectionId(''); // Reset section when course offering changes
                  }}
                  disabled={registerMutation.isPending}
                >
                  <option value="">-- Select Course Offering --</option>
                  {offerings.filter(o => o.isPublished).map(o => (
                    <option key={o.id} value={o.id}>
                      {o.course.name} - {o.semester.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Section</label>
                <select
                  className="w-full text-sm border-slate-200 rounded-md focus:ring-slate-900 focus:border-slate-900"
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  disabled={!selectedCourseOfferingId || registerMutation.isPending}
                >
                  <option value="">-- Select Section --</option>
                  {sections.map(s => {
                    const enrolled = typeof s.currentEnrollment === 'number' ? s.currentEnrollment : 0;
                    const hasCapacity = typeof s.capacity === 'number';
                    const cap = hasCapacity ? s.capacity! : null;
                    const isFull = cap !== null ? enrolled >= cap : true;
                    const seatLabel = cap !== null ? `${enrolled}/${cap} Seats` : 'Capacity Not Set';
                    return (
                      <option key={s.id} value={s.id} disabled={isFull}>
                        {s.name} ({seatLabel}){isFull ? (cap !== null ? ' - FULL' : ' - UNAVAILABLE') : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={!selectedCourseOfferingId || !selectedSectionId || registerMutation.isPending}>
                {registerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Register Student
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
