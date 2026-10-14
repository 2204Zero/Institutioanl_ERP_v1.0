import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { PageFrame } from '../components/ui/PageFrame';
import { CheckCircle2, Loader2, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Input } from '../components/ui/input';

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

interface SectionStudent {
  id: number;
  sectionId: number;
  studentId: number;
  rollNumber: string;
  studentName: string;
  isActive: boolean;
}

interface AttendanceRecordResponse {
  id: number;
  studentId: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
  markedByFacultyId: number;
}

interface SectionAttendanceResponse {
  sectionId: number;
  scheduleId: number;
  date: string;
  records: AttendanceRecordResponse[];
}

interface AttendanceState {
  studentId: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks: string;
}

const getTodayDateString = () => new Date().toISOString().split('T')[0];

function formatTime(timeData: string | number[] | undefined | null): string {
  if (!timeData) return '';
  let h = 0;
  let m = 0;
  if (Array.isArray(timeData)) {
    h = timeData[0] || 0;
    m = timeData[1] || 0;
  } else {
    const parts = String(timeData).split(':');
    h = parseInt(parts[0], 10) || 0;
    m = parseInt(parts[1], 10) || 0;
  }
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  const displayMinute = m < 10 ? `0${m}` : `${m}`;
  return `${displayHour}:${displayMinute} ${period}`;
}

export default function FacultyAttendance() {
  const queryClient = useQueryClient();
  const [selectedSectionId, setSelectedSectionId] = useState<number | ''>('');
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | ''>('');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString);

  const [localAttendance, setLocalAttendance] = useState<Record<number, AttendanceState>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 1. Fetch Sections
  const { data: sections, isLoading: loadingSections, isError: isSectionsError, error: sectionsError } = useQuery<Section[]>({
    queryKey: ['faculty-sections'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/faculty/me/sections');
      return res.data;
    },
    retry: false
  });

  // 2. Fetch Timetable
  const { data: timetable, isLoading: loadingTimetable } = useQuery<TimetableSlot[]>({
    queryKey: ['faculty-timetable'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/faculty/me/timetable');
      return res.data;
    }
  });

  // Filter schedules based on selected section
  const availableSchedules = useMemo(() => {
    if (!timetable || selectedSectionId === '') return [];
    return timetable.filter(t => t.sectionId === selectedSectionId && t.isActive);
  }, [timetable, selectedSectionId]);


  // 3. Fetch Roster
  const { data: roster, isLoading: loadingRoster } = useQuery<SectionStudent[]>({
    queryKey: ['section-students', selectedSectionId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/sections/${selectedSectionId}/students`);
      return res.data;
    },
    enabled: selectedSectionId !== ''
  });

  // 4. Fetch Existing Attendance
  const { data: existingAttendance, isLoading: loadingExisting } = useQuery<SectionAttendanceResponse>({
    queryKey: ['section-attendance', selectedSectionId, selectedDate],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/attendance/section/${selectedSectionId}?date=${selectedDate}`);
      return res.data;
    },
    enabled: selectedSectionId !== '' && selectedDate !== '' && selectedScheduleId !== ''
  });

  const isAttendanceRecorded = existingAttendance?.records && existingAttendance.records.length > 0;

  // Initialize local state when roster loads and no existing attendance
  useEffect(() => {
    if (!roster) return;
    
    const newState: Record<number, AttendanceState> = {};
    if (isAttendanceRecorded && existingAttendance) {
      // Load existing records
      existingAttendance.records.forEach(record => {
        newState[record.studentId] = {
          studentId: record.studentId,
          status: record.status,
          remarks: record.remarks || ''
        };
      });
      setIsDirty(false);
    } else {
      // Initialize with PRESENT
      roster.forEach(student => {
        newState[student.studentId] = {
          studentId: student.studentId,
          status: 'PRESENT',
          remarks: ''
        };
      });
      setIsDirty(false); // Clean initially
    }
    setLocalAttendance(newState);
    setSubmitError(null);
  }, [roster, existingAttendance, isAttendanceRecorded]);

  // Bulk Submit Mutation
  const bulkSubmitMutation = useMutation({
    mutationFn: async () => {
      if (selectedSectionId === '' || selectedScheduleId === '') throw new Error("Invalid selection");
      
      const payload = {
        sectionId: selectedSectionId,
        scheduleId: selectedScheduleId,
        date: selectedDate,
        records: Object.values(localAttendance)
      };
      
      const res = await apiClient.post('/api/v1/attendance/bulk', payload);
      return res.data;
    },
    onSuccess: () => {
      setIsDirty(false);
      setSubmitError(null);
      queryClient.invalidateQueries({ queryKey: ['section-attendance', selectedSectionId, selectedDate] });
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        setSubmitError("Attendance has already been recorded for this class/date.");
      } else if (error.response?.status === 400) {
        setSubmitError("Validation error: " + (error.response.data?.message || "Invalid request."));
      } else if (error.response?.status === 403) {
        setSubmitError("You are not authorized to record attendance for this section.");
      } else {
        setSubmitError("Attendance could not be saved. Please try again.");
      }
    }
  });

  const handleStatusChange = (studentId: number, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    if (isAttendanceRecorded) return; // Read-only if recorded
    setLocalAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
    setIsDirty(true);
  };

  const handleRemarksChange = (studentId: number, remarks: string) => {
    if (isAttendanceRecorded) return; // Read-only if recorded
    setLocalAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks }
    }));
    setIsDirty(true);
  };

  const activeRoster = roster?.filter(s => s.isActive) || [];

  return (
    <PageFrame
      title="Attendance Workspace"
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Attendance" }
      ]}
    >
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Attendance</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Record and manage attendance for your assigned classes.</p>
        </div>

        {/* CONTROLS */}
        <div className="bg-slate-200 border border-slate-200 p-[1px] grid grid-cols-1 md:grid-cols-3 gap-[1px]">
          {/* Section Selection */}
          <div className="bg-white p-4">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Section</label>
            <select
              className="w-full text-sm border-slate-200 rounded-none focus:ring-black focus:border-black"
              value={selectedSectionId}
              onChange={(e) => {
                setSelectedSectionId(e.target.value ? Number(e.target.value) : '');
                setSelectedScheduleId('');
                setSubmitError(null);
              }}
            >
              <option value="">-- Select Section --</option>
              {sections?.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {loadingSections && <div className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Loading sections...</div>}
            {isSectionsError && <div className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Failed to load sections: {sectionsError instanceof Error ? sectionsError.message : 'Unknown error'}</div>}
          </div>

          {/* Schedule Selection */}
          <div className="bg-white p-4">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Schedule Slot</label>
            <select
              className="w-full text-sm border-slate-200 rounded-none focus:ring-black focus:border-black"
              value={selectedScheduleId}
              onChange={(e) => setSelectedScheduleId(e.target.value ? Number(e.target.value) : '')}
              disabled={!selectedSectionId || availableSchedules.length === 0}
            >
              <option value="">-- Select Schedule --</option>
              {availableSchedules.map(t => (
                <option key={t.id} value={t.id}>{t.dayOfWeek} • {formatTime(t.startTime)} - {formatTime(t.endTime)}</option>
              ))}
            </select>
            {selectedSectionId !== '' && availableSchedules.length === 0 && !loadingTimetable && (
              <div className="text-xs text-orange-500 mt-1 font-medium">No active schedules for this section.</div>
            )}
          </div>

          {/* Date Selection */}
          <div className="bg-white p-4">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Date</label>
            <div className="relative">
              <CalendarIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-9 w-full text-sm rounded-none border-slate-200 focus:ring-black focus:border-black h-10"
              />
            </div>
          </div>
        </div>

        {/* WORKSPACE */}
        {selectedSectionId !== '' && selectedScheduleId !== '' && selectedDate !== '' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Student Roster</h2>
              
              {isAttendanceRecorded ? (
                <div className="flex items-center gap-2 text-sm font-bold text-green-700 bg-green-50 px-3 py-1.5 border border-green-200">
                  <CheckCircle2 className="w-4 h-4" />
                  ATTENDANCE RECORDED
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  {isDirty && <span className="text-xs font-bold text-amber-600 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> UNSAVED CHANGES</span>}
                  <button
                    onClick={() => bulkSubmitMutation.mutate()}
                    disabled={bulkSubmitMutation.isPending || activeRoster.length === 0}
                    className="bg-black text-white px-5 py-2 text-[11px] font-bold uppercase tracking-wider hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {bulkSubmitMutation.isPending ? 'SAVING...' : 'SAVE ATTENDANCE'}
                  </button>
                </div>
              )}
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {submitError}
              </div>
            )}

            {bulkSubmitMutation.isSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Attendance saved successfully.
              </div>
            )}

            <div className="bg-white border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-500">Student</th>
                    <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-500 w-48">Status</th>
                    <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-500">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingRoster || loadingExisting ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                          <span className="text-xs font-medium">Loading roster...</span>
                        </div>
                      </td>
                    </tr>
                  ) : activeRoster.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-12 text-center text-slate-500">
                        <span className="text-sm font-medium">No active students enrolled in this section.</span>
                      </td>
                    </tr>
                  ) : (
                    activeRoster.map(student => {
                      const state = localAttendance[student.studentId];
                      return (
                        <tr key={student.studentId} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900">{student.studentName}</div>
                            <div className="text-[11px] font-medium text-slate-500 mt-0.5">{student.rollNumber || 'No Roll #'}</div>
                          </td>
                          <td className="px-4 py-3">
                            {isAttendanceRecorded ? (
                              <StatusBadge status={state?.status || 'UNKNOWN'} />
                            ) : (
                              <div className="flex gap-1">
                                {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map(opt => (
                                  <button
                                    key={opt}
                                    onClick={() => handleStatusChange(student.studentId, opt as any)}
                                    className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                                      state?.status === opt
                                        ? opt === 'PRESENT' ? 'bg-green-100 border-green-200 text-green-800'
                                        : opt === 'ABSENT' ? 'bg-red-100 border-red-200 text-red-800'
                                        : 'bg-amber-100 border-amber-200 text-amber-800'
                                        : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                                    }`}
                                  >
                                    {opt.charAt(0)}
                                  </button>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {isAttendanceRecorded ? (
                              <span className="text-xs text-slate-600">{state?.remarks || '-'}</span>
                            ) : (
                              <Input
                                type="text"
                                value={state?.remarks || ''}
                                onChange={(e) => handleRemarksChange(student.studentId, e.target.value)}
                                placeholder="Optional remarks..."
                                className="text-xs h-8 rounded-none border-slate-200 focus:border-black focus:ring-black w-full"
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PageFrame>
  );
}
