import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { apiClient } from '../config/api';
import { PageFrame } from '../components/ui/PageFrame';
import { Link } from 'react-router-dom';
import { Clock, Users, BookOpen, Calendar, MapPin, ChevronRight, Loader2 } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';

interface Section {
  id: number;
  name: string;
  courseOfferingId: number;
  capacity: number;
  currentEnrollment: number;
  isActive: boolean;
}

interface TimetableSlot {
  id: number;
  sectionId: number;
  facultyId: number;
  roomId: number;
  dayOfWeek: string;
  startTime: string | number[];
  endTime: string | number[];
  isActive: boolean;
}

export default function FacultyDashboard() {
  const { user } = useAuthStore();
  const { data: facultyProfile } = useQuery<{ firstName?: string; lastName?: string }>({
    queryKey: ['faculty-profile-me'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/faculty/me');
      return res.data;
    },
    staleTime: 60000,
  });

  const { data: sections, isLoading: loadingSections } = useQuery<Section[]>({
    queryKey: ['faculty-sections'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/faculty/me/sections');
      return response.data;
    }
  });

  const { data: timetable, isLoading: loadingTimetable } = useQuery<TimetableSlot[]>({
    queryKey: ['faculty-timetable'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/faculty/me/timetable');
      return response.data;
    }
  });

  // Helper to format time (e.g., "09:00:00" or [9, 0] to "09:00 AM")
  const formatTime = (timeData: string | number[]) => {
    if (!timeData) return '';
    let h, m;
    if (Array.isArray(timeData)) {
      h = timeData[0];
      m = timeData[1] || 0;
    } else {
      const parts = timeData.split(':');
      h = parseInt(parts[0], 10);
      m = parseInt(parts[1], 10);
    }
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedH = h % 12 || 12;
    const formattedM = m.toString().padStart(2, '0');
    return `${formattedH}:${formattedM} ${ampm}`;
  };

  // Group timetable by day
  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  
  const facultyName = facultyProfile?.firstName
    ? (facultyProfile.lastName ? `${facultyProfile.firstName} ${facultyProfile.lastName}` : facultyProfile.firstName)
    : (user?.username || 'Faculty');

  return (
    <PageFrame title={`Faculty Dashboard — Welcome, ${facultyName}`}>
      <div className="grid gap-6 md:grid-cols-3">
        {/* Weekly Schedule (Takes up 2 columns on medium screens) */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Weekly Schedule</h3>
          </div>
          
          {loadingTimetable ? (
            <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
          ) : timetable && timetable.length > 0 ? (
            <div className="grid gap-4">
              {daysOfWeek.map(day => {
                const daySlots = timetable.filter(t => t.dayOfWeek === day).sort((a, b) => {
                  const getMinutes = (t: string | number[]) => {
                    if (!t) return 0;
                    if (Array.isArray(t)) return t[0] * 60 + (t[1] || 0);
                    const parts = t.split(':');
                    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
                  };
                  return getMinutes(a.startTime) - getMinutes(b.startTime);
                });
                if (daySlots.length === 0) return null;
                
                return (
                  <div key={day} className="border border-slate-200 bg-white">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 font-bold text-xs uppercase tracking-wider text-slate-600">
                      {day}
                    </div>
                    <div className="divide-y divide-slate-100">
                      {daySlots.map(slot => {
                        // Attempt to find the section name if it exists in the sections data
                        const section = sections?.find(s => s.id === slot.sectionId);
                        return (
                          <div key={slot.id} className="p-3 flex items-start sm:items-center flex-col sm:flex-row gap-3 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center space-x-2 min-w-[140px]">
                              <Clock className="h-4 w-4 text-slate-400" />
                              <span className="text-sm font-semibold text-slate-900">
                                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 flex-1">
                              <div className="flex items-center space-x-1">
                                <BookOpen className="h-4 w-4 text-slate-400" />
                                <span className="text-sm text-slate-700">
                                  Section {section ? section.name : slot.sectionId}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4 text-slate-400" />
                                <span className="text-sm text-slate-700">
                                  Room {slot.roomId}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border border-slate-200 bg-white p-8 text-center">
              <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-900">No scheduled classes</p>
              <p className="text-xs text-slate-500 mt-1">Your weekly timetable is currently empty.</p>
            </div>
          )}
        </div>

        {/* Right Sidebar: My Sections & Quick Actions */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">My Sections</h3>
            </div>
            
            {loadingSections ? (
              <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
            ) : sections && sections.length > 0 ? (
              <div className="border border-slate-200 bg-white divide-y divide-slate-100">
                {sections.map(section => (
                  <div key={section.id} className="p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-slate-900">Section {section.name}</span>
                      <StatusBadge status={section.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    </div>
                    <div className="flex items-center text-xs text-slate-500 space-x-3 mt-2">
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {section.currentEnrollment} / {section.capacity}
                      </span>
                      <span>Offering #{section.courseOfferingId}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                No sections assigned.
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Quick Actions</h3>
            </div>
            <div className="grid gap-2">
              <Link 
                to="/dashboard/attendance" 
                className="flex items-center justify-between p-3 border border-slate-200 bg-white hover:bg-slate-50 transition-colors group"
              >
                <span className="text-sm font-semibold text-slate-900">Take Attendance</span>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </Link>
              <Link 
                to="/dashboard/academics" 
                className="flex items-center justify-between p-3 border border-slate-200 bg-white hover:bg-slate-50 transition-colors group"
              >
                <span className="text-sm font-semibold text-slate-900">Academic Portal</span>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
