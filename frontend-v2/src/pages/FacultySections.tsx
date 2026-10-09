import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { PageFrame } from '../components/ui/PageFrame';
import { Link } from 'react-router-dom';
import { Users, Calendar, MapPin, Loader2, BookOpen, Clock } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { cn } from '../lib/utils';

interface Section {
  id: number;
  name: string;
  courseOfferingId: number;
  capacity: number;
  currentEnrollment: number;
  isActive: boolean;
}

interface SectionStudent {
  id: number;
  sectionId: number;
  studentId: number;
  rollNumber: string;
  studentName: string;
  isActive: boolean;
}

interface TimetableSlot {
  id: number;
  sectionId: number;
  facultyId: number;
  roomId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export default function FacultySections() {
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);

  // 1. Fetch assigned sections
  const { data: sections, isLoading: loadingSections } = useQuery<Section[]>({
    queryKey: ['faculty-sections'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/faculty/me/sections');
      return res.data;
    }
  });

  // 2. Fetch section details
  const { data: sectionDetails, isLoading: loadingDetails } = useQuery<Section>({
    queryKey: ['section-details', selectedSectionId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/sections/${selectedSectionId}`);
      return res.data;
    },
    enabled: selectedSectionId !== null
  });

  // 3. Fetch students roster
  const { data: roster, isLoading: loadingRoster } = useQuery<SectionStudent[]>({
    queryKey: ['section-students', selectedSectionId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/sections/${selectedSectionId}/students`);
      return res.data;
    },
    enabled: selectedSectionId !== null
  });

  // 4. Fetch section timetable
  const { data: timetable, isLoading: loadingTimetable } = useQuery<TimetableSlot[]>({
    queryKey: ['section-timetable', selectedSectionId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/timetable/section/${selectedSectionId}`);
      return res.data;
    },
    enabled: selectedSectionId !== null
  });

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedH = h % 12 || 12;
    return `${formattedH}:${minutes} ${ampm}`;
  };

  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  return (
    <PageFrame
      title="My Sections"
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "My Sections" }
      ]}
    >
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Sections</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">View your assigned sections, enrolled students, and class schedule.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: ASSIGNED SECTIONS */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2">
              Assigned Sections
            </h2>
            
            {loadingSections ? (
              <div className="flex justify-center p-8 bg-white border border-slate-200"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
            ) : sections && sections.length > 0 ? (
              <div className="bg-white border border-slate-200 divide-y divide-slate-100">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setSelectedSectionId(section.id)}
                    className={cn(
                      "w-full text-left p-4 hover:bg-slate-50 transition-colors focus:outline-none",
                      selectedSectionId === section.id && "bg-slate-50 border-l-4 border-l-primary ring-1 ring-inset ring-slate-200"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-900">Section {section.name}</span>
                      <StatusBadge status={section.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    </div>
                    <div className="flex items-center space-x-4 text-xs font-medium text-slate-500">
                      <span className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {section.currentEnrollment} / {section.capacity} Enrolled
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 p-8 text-center text-sm text-slate-500">
                You do not have any assigned sections.
              </div>
            )}
          </div>

          {/* RIGHT: SECTION DETAIL */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedSectionId ? (
              <div className="bg-white border border-slate-200 p-12 text-center text-slate-500 flex flex-col items-center justify-center min-h-[400px]">
                <BookOpen className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-sm font-medium">Select a section to view details.</p>
              </div>
            ) : (
              <>
                {/* SECTION INFO */}
                <div className="bg-white border border-slate-200 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">Section Details</h3>
                    {loadingDetails ? (
                       <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                    ) : sectionDetails ? (
                       <StatusBadge status={sectionDetails.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    ) : null}
                  </div>
                  
                  {loadingDetails ? (
                     <div className="h-10 bg-slate-100 animate-pulse rounded" />
                  ) : sectionDetails ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Section Name</p>
                        <p className="font-semibold text-slate-900">{sectionDetails.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Course Offering ID</p>
                        <p className="font-semibold text-slate-900">#{sectionDetails.courseOfferingId}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Enrollment</p>
                        <p className="font-semibold text-slate-900">{sectionDetails.currentEnrollment} / {sectionDetails.capacity}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-red-500">Failed to load details.</p>
                  )}
                  
                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <Link
                      to={`/dashboard/attendance`}
                      className="bg-black text-white px-5 py-2 text-[11px] font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors flex items-center space-x-2"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Take Attendance</span>
                    </Link>
                  </div>
                </div>

                {/* TIMETABLE */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2">Class Schedule</h3>
                  {loadingTimetable ? (
                    <div className="flex justify-center p-8 bg-white border border-slate-200"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
                  ) : timetable && timetable.length > 0 ? (
                    <div className="bg-white border border-slate-200 divide-y divide-slate-100">
                      {daysOfWeek.map(day => {
                        const daySlots = timetable.filter(t => t.dayOfWeek === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
                        if (daySlots.length === 0) return null;
                        
                        return (
                          <div key={day} className="flex flex-col sm:flex-row">
                            <div className="sm:w-32 bg-slate-50 p-3 sm:border-r border-slate-100 flex items-center">
                              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{day}</span>
                            </div>
                            <div className="flex-1 divide-y divide-slate-100">
                              {daySlots.map(slot => (
                                <div key={slot.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                                  <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-semibold text-slate-900">
                                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1 bg-slate-100 px-2 py-1 rounded text-xs font-medium text-slate-700">
                                    <MapPin className="w-3 h-3 text-slate-500" />
                                    <span>Room {slot.roomId}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 p-8 text-center text-sm text-slate-500">
                      No schedule available for this section.
                    </div>
                  )}
                </div>

                {/* STUDENTS ROSTER */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2">Student Roster</h3>
                  {loadingRoster ? (
                    <div className="flex justify-center p-8 bg-white border border-slate-200"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
                  ) : roster && roster.length > 0 ? (
                    <div className="bg-white border border-slate-200">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-500">Roll Number</th>
                            <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-500">Name</th>
                            <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-500 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {roster.map(student => (
                            <tr key={student.studentId} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-medium text-slate-600">{student.rollNumber || '-'}</td>
                              <td className="px-4 py-3 font-semibold text-slate-900">{student.studentName}</td>
                              <td className="px-4 py-3 text-right">
                                <StatusBadge status={student.isActive ? 'ACTIVE' : 'INACTIVE'} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 p-8 text-center text-sm text-slate-500">
                      No students enrolled in this section.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
