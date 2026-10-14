import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../config/api';
import {
  Search,
  Users,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Calendar,
  Layers,
  GraduationCap
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import { Input } from '../ui/input';
import {
  useSections,
  useCourseOfferings,
  useRooms,
  useFacultyList,
  type Section
} from '../../hooks/queries/useAcademics';

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
  enrollmentNumber?: string;
  isActive: boolean;
}

interface AttendanceRecordResponse {
  id: number;
  studentId: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
  markedByFacultyId?: number;
}

interface SectionAttendanceResponse {
  sectionId: number;
  scheduleId?: number;
  date: string;
  records: AttendanceRecordResponse[];
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

export function AdminAttendanceWorkspace() {
  const [selectedSectionId, setSelectedSectionId] = useState<number | ''>('');
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | ''>('');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString);
  const [rosterSearch, setRosterSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Metadata queries
  const { data: sections = [], isLoading: loadingSections } = useSections();
  const { data: offerings = [] } = useCourseOfferings();
  const { data: rooms = [] } = useRooms(true);
  const { data: facultyList = [] } = useFacultyList({ enabled: true });

  // 1. Fetch Timetable for the selected section
  const { data: timetable = [], isLoading: loadingTimetable } = useQuery<TimetableSlot[]>({
    queryKey: ['timetable', selectedSectionId],
    queryFn: async () => {
      if (!selectedSectionId) return [];
      const res = await apiClient.get<TimetableSlot[]>(`/api/v1/timetable/section/${selectedSectionId}`);
      return res.data || [];
    },
    enabled: !!selectedSectionId
  });

  // 2. Fetch Enrolled Students for the selected section
  const { data: enrolledStudents = [], isLoading: loadingStudents } = useQuery<SectionStudent[]>({
    queryKey: ['section-students', selectedSectionId],
    queryFn: async () => {
      if (!selectedSectionId) return [];
      const res = await apiClient.get<SectionStudent[]>(`/api/v1/sections/${selectedSectionId}/students`);
      return res.data || [];
    },
    enabled: !!selectedSectionId
  });

  // 3. Fetch Recorded Attendance for the selected section and date
  const { data: sectionAttendance, isLoading: loadingAttendance } = useQuery<SectionAttendanceResponse>({
    queryKey: ['section-attendance', selectedSectionId, selectedDate],
    queryFn: async () => {
      if (!selectedSectionId || !selectedDate) return { sectionId: Number(selectedSectionId), date: selectedDate, records: [] };
      const res = await apiClient.get<SectionAttendanceResponse>(`/api/v1/attendance/section/${selectedSectionId}?date=${selectedDate}`);
      return res.data || { sectionId: Number(selectedSectionId), date: selectedDate, records: [] };
    },
    enabled: !!selectedSectionId && !!selectedDate
  });

  // Helper resolvers
  const getCourseInfoForSection = (section: Section) => {
    const off = offerings.find(o => o.id === section.courseOfferingId);
    if (!off) return { code: 'N/A', name: 'Course Offering #' + section.courseOfferingId };
    return {
      code: off.course?.code || 'N/A',
      name: off.course?.name || 'Course #' + off.id
    };
  };

  const getFacultyName = (facultyId: number) => {
    const f = facultyList.find(item => item.id === facultyId);
    return f ? `${f.firstName} ${f.lastName}` : `Faculty #${facultyId}`;
  };

  const getRoomName = (roomId: number) => {
    const r = rooms.find(item => item.id === roomId);
    return r ? `${r.name} (${r.capacity} seats)` : `Room #${roomId}`;
  };

  const selectedSection = useMemo(() => {
    return sections.find(s => s.id === selectedSectionId);
  }, [sections, selectedSectionId]);

  // Map of studentId -> attendance record
  const attendanceMap = useMemo(() => {
    const map = new Map<number, AttendanceRecordResponse>();
    if (sectionAttendance && sectionAttendance.records) {
      sectionAttendance.records.forEach(rec => {
        map.set(rec.studentId, rec);
      });
    }
    return map;
  }, [sectionAttendance]);

  // Aggregate stats
  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;
    let unrecorded = 0;

    enrolledStudents.forEach(st => {
      const rec = attendanceMap.get(st.studentId);
      if (!rec) {
        unrecorded++;
      } else {
        switch (rec.status) {
          case 'PRESENT': present++; break;
          case 'ABSENT': absent++; break;
          case 'LATE': late++; break;
          case 'EXCUSED': excused++; break;
          default: unrecorded++; break;
        }
      }
    });

    const total = enrolledStudents.length;
    const recordedTotal = present + absent + late + excused;
    const attendancePercentage = total > 0 && recordedTotal > 0
      ? Math.round((present / recordedTotal) * 100)
      : null;

    return {
      total,
      present,
      absent,
      late,
      excused,
      unrecorded,
      recordedTotal,
      attendancePercentage,
      isRecorded: recordedTotal > 0
    };
  }, [enrolledStudents, attendanceMap]);

  // Filtered student roster
  const filteredRoster = useMemo(() => {
    return enrolledStudents.filter(st => {
      const term = rosterSearch.toLowerCase();
      const name = (st.studentName || '').toLowerCase();
      const roll = (st.rollNumber || '').toLowerCase();
      const matchesSearch = name.includes(term) || roll.includes(term);

      if (!matchesSearch) return false;

      const rec = attendanceMap.get(st.studentId);
      const status = rec ? rec.status : 'UNRECORDED';

      if (statusFilter === 'ALL') return true;
      return status === statusFilter;
    });
  }, [enrolledStudents, rosterSearch, statusFilter, attendanceMap]);

  return (
    <div className="space-y-6">
      {/* 1. Level: Section Selection & Date Filter */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-slate-700" />
              1. Section & Date Selection
            </h2>
            <p className="text-xs text-slate-500">
              Select an academic section and target date to inspect session attendance and enrolled roster.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
              <Calendar className="w-4 h-4 text-slate-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-0 text-xs font-semibold text-slate-800 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {loadingSections ? (
            <div className="col-span-full p-6 text-center text-xs text-slate-400">Loading sections...</div>
          ) : sections.length === 0 ? (
            <div className="col-span-full p-6 text-center text-xs text-slate-500">No sections found.</div>
          ) : (
            sections.map((sec) => {
              const crs = getCourseInfoForSection(sec);
              const isSelected = selectedSectionId === sec.id;
              return (
                <div
                  key={sec.id}
                  onClick={() => {
                    setSelectedSectionId(sec.id);
                    setSelectedScheduleId('');
                  }}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-black bg-slate-900 text-white shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {crs.code}
                    </span>
                    <span className={`text-[11px] font-medium ${
                      isSelected ? 'text-slate-300' : 'text-slate-500'
                    }`}>
                      Cap: {sec.capacity}
                    </span>
                  </div>
                  <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {sec.name}
                  </h4>
                  <p className={`text-xs truncate mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {crs.name}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Level: Lecture / Session Overview */}
      {selectedSection && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-700" />
                2. Lecture Sessions & Coverage: {selectedSection.name}
              </h3>
              <p className="text-xs text-slate-500">
                Scheduled timetable slots and attendance records for {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}.
              </p>
            </div>

            {/* Attendance Status Summary Pill */}
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                stats.isRecorded
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {stats.isRecorded ? `Attendance Recorded (${stats.recordedTotal}/${stats.total})` : 'Pending Attendance Record'}
              </span>
            </div>
          </div>

          {/* Timetable slots on date */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {loadingTimetable ? (
              <div className="col-span-full p-4 text-center text-xs text-slate-400">Loading timetable...</div>
            ) : timetable.length === 0 ? (
              <div className="col-span-full p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                No timetable schedule configured for this section.
              </div>
            ) : (
              timetable.map((slot) => {
                const isSelected = selectedScheduleId === slot.id;
                return (
                  <div
                    key={slot.id}
                    onClick={() => setSelectedScheduleId(slot.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-600'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-900 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">{slot.dayOfWeek}</span>
                    </div>
                    <div className="text-xs text-slate-700 flex items-center gap-1.5 mt-1">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{getFacultyName(slot.facultyId)}</span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{getRoomName(slot.roomId)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Attendance Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Enrolled Students</span>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{stats.total}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Present</span>
              <p className="text-lg font-bold text-emerald-800 mt-0.5">{stats.present}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-xl border border-red-200 text-center">
              <span className="text-[10px] font-bold text-red-700 uppercase">Absent</span>
              <p className="text-lg font-bold text-red-800 mt-0.5">{stats.absent}</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-center">
              <span className="text-[10px] font-bold text-amber-700 uppercase">Late</span>
              <p className="text-lg font-bold text-amber-800 mt-0.5">{stats.late}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-center">
              <span className="text-[10px] font-bold text-blue-700 uppercase">Excused</span>
              <p className="text-lg font-bold text-blue-800 mt-0.5">{stats.excused}</p>
            </div>
            <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-600 uppercase">Attendance Rate</span>
              <p className="text-lg font-bold text-slate-800 mt-0.5">
                {stats.attendancePercentage !== null ? `${stats.attendancePercentage}%` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Level: Student Roster */}
      {selectedSection && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-700" />
                3. Student Enrollment Roster ({filteredRoster.length} of {enrolledStudents.length})
              </h3>
              <p className="text-xs text-slate-500">
                Official student members enrolled in {selectedSection.name}.
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Filter student name or roll..."
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  className="pl-9 bg-slate-50 border-slate-200 text-xs h-9 rounded-lg"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-lg px-2.5 h-9 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LATE">Late</option>
                <option value="EXCUSED">Excused</option>
                <option value="UNRECORDED">Unrecorded</option>
              </select>
            </div>
          </div>

          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold px-6 py-3.5 text-xs">Student Member</TableHead>
                <TableHead className="font-semibold px-6 py-3.5 text-xs">Roll Number</TableHead>
                <TableHead className="font-semibold px-6 py-3.5 text-xs">Attendance Status</TableHead>
                <TableHead className="font-semibold px-6 py-3.5 text-xs">Faculty Marker</TableHead>
                <TableHead className="font-semibold px-6 py-3.5 text-xs">Remarks / Exceptions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingStudents || loadingAttendance ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
                      <span className="text-xs">Loading roster and records...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredRoster.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500 text-xs">
                    No students match the current search or status filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRoster.map((st) => {
                  const rec = attendanceMap.get(st.studentId);
                  const status = rec ? rec.status : 'UNRECORDED';
                  const marker = rec?.markedByFacultyId ? getFacultyName(rec.markedByFacultyId) : 'System';

                  return (
                    <TableRow key={st.studentId} className="hover:bg-slate-50/70 transition-colors">
                      <TableCell className="px-6 py-3.5 text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs uppercase">
                            {st.studentName?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{st.studentName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">ID #{st.studentId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-3.5 text-xs font-mono font-medium text-slate-700">
                        {st.rollNumber || 'N/A'}
                      </TableCell>
                      <TableCell className="px-6 py-3.5 text-xs">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          status === 'PRESENT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          status === 'ABSENT' ? 'bg-red-50 text-red-700 border border-red-200' :
                          status === 'LATE' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          status === 'EXCUSED' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {status === 'PRESENT' && <CheckCircle2 className="w-3 h-3" />}
                          {status === 'ABSENT' && <XCircle className="w-3 h-3" />}
                          {status === 'LATE' && <Clock className="w-3 h-3" />}
                          {status === 'EXCUSED' && <AlertCircle className="w-3 h-3" />}
                          {status}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-3.5 text-xs text-slate-600">
                        {rec ? marker : '–'}
                      </TableCell>
                      <TableCell className="px-6 py-3.5 text-xs text-slate-500 italic">
                        {rec?.remarks || '–'}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
