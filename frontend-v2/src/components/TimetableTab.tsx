import React, { useState } from 'react';
import {
  useSections,
  useFacultyList,
  useTimetable,
  useAllocateSlot,
  useCourseOfferings,
  useCourses,
  useSemesters,
  useRooms,
  useCreateRoom
} from '../hooks/queries/useAcademics';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { Loader2, Plus, Calendar as CalendarIcon, FileText, Building2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from './ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from './ui/table';

const DAYS_OF_WEEK = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

export function TimetableTab() {
  const [selectedSectionId, setSelectedSectionId] = useState<number | ''>('');
  const [isCreating, setIsCreating] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomCapacity, setNewRoomCapacity] = useState('60');

  // Form State
  const [ttFacultyId, setTtFacultyId] = useState<string>('');
  const [ttRoomId, setTtRoomId] = useState<string>('');
  const [ttDayOfWeek, setTtDayOfWeek] = useState<string>('MONDAY');
  const [ttStartTime, setTtStartTime] = useState<string>('09:00');
  const [ttEndTime, setTtEndTime] = useState<string>('10:00');

  const { user } = useAuthStore();
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  const { data: sections } = useSections();
  const { data: offerings } = useCourseOfferings();
  const { data: courses } = useCourses();
  const { data: semesters } = useSemesters();
  const { data: facultyList = [] } = useFacultyList({ enabled: isAdmin });
  const { data: rooms } = useRooms();

  const { data: timetable, isLoading: isLoadingTimetable } = useTimetable(selectedSectionId as number);
  const allocateSlot = useAllocateSlot();
  const createRoomMutation = useCreateRoom();

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    try {
      const created = await createRoomMutation.mutateAsync({
        name: newRoomName.trim(),
        capacity: parseInt(newRoomCapacity) || 40,
        isActive: true,
      });
      toast.success(`Room '${created.name}' created successfully`);
      setTtRoomId(String(created.id));
      setIsRoomModalOpen(false);
      setNewRoomName('');
      setNewRoomCapacity('60');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create room');
    }
  };

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error('Only administrators can allocate timetable slots');
      return;
    }
    if (!selectedSectionId) return;

    try {
      await allocateSlot.mutateAsync({
        sectionId: selectedSectionId as number,
        facultyId: parseInt(ttFacultyId),
        roomId: parseInt(ttRoomId),
        dayOfWeek: ttDayOfWeek,
        startTime: ttStartTime + ":00", // backend expects LocalTime HH:mm:ss format
        endTime: ttEndTime + ":00",
      });
      toast.success('Timetable slot allocated successfully');
      setIsCreating(false);
      setTtFacultyId('');
      setTtRoomId('');
      setTtDayOfWeek('MONDAY');
      setTtStartTime('09:00');
      setTtEndTime('10:00');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to allocate slot. There may be a schedule conflict.');
    }
  };

  const getSectionLabel = (sectionId: number) => {
    const sec = sections?.find(s => s.id === sectionId);
    if (!sec) return `Section ID: ${sectionId}`;
    const offering = offerings?.find(o => o.id === sec.courseOfferingId);
    if (!offering) return `${sec.name}`;
    const course = courses?.find(c => c.id === offering.course?.id);
    const sem = semesters?.find(s => s.id === offering.semester?.id);
    return `${course?.code || 'Course'} - ${sem?.name || 'Semester'} - Section ${sec.name}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1 max-w-md">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Section</label>
          <select
            className="w-full text-sm border-slate-200 rounded-md focus:ring-slate-900 focus:border-slate-900 h-10 px-3"
            value={selectedSectionId}
            onChange={(e) => {
              setSelectedSectionId(e.target.value ? parseInt(e.target.value) : '');
              setIsCreating(false);
            }}
          >
            <option value="">-- Choose a Section --</option>
            {sections?.map(s => (
              <option key={s.id} value={s.id}>
                {getSectionLabel(s.id)}
              </option>
            ))}
          </select>
        </div>

        {selectedSectionId && !isCreating && isAdmin && (
          <Button onClick={() => setIsCreating(true)} className="bg-black text-white hover:bg-black/80 px-6 h-10">
            <Plus className="w-4 h-4 mr-2" />
            Allocate Slot
          </Button>
        )}
      </div>

      {isCreating && selectedSectionId && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Allocate New Timetable Slot
          </h3>
          <form onSubmit={handleAllocate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Faculty</label>
              <select required className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={ttFacultyId} onChange={e => setTtFacultyId(e.target.value)}>
                <option value="">Select Faculty...</option>
                {facultyList?.map(f => <option key={f.id} value={f.id}>{f.username} ({f.email})</option>)}
              </select>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700">Room</label>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsRoomModalOpen(true)}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    + New Room
                  </button>
                )}
              </div>
              <select required className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={ttRoomId} onChange={e => setTtRoomId(e.target.value)}>
                <option value="">Select Room...</option>
                {rooms?.map(r => <option key={r.id} value={r.id}>{r.name} (Cap: {r.capacity})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Day of Week</label>
              <select required className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={ttDayOfWeek} onChange={e => setTtDayOfWeek(e.target.value)}>
                {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
              <Input required type="time" value={ttStartTime} onChange={e => setTtStartTime(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">End Time</label>
              <Input required type="time" value={ttEndTime} onChange={e => setTtEndTime(e.target.value)} />
            </div>

            <div className="lg:col-span-3 flex justify-end space-x-2 mt-2 border-t border-slate-200 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button type="submit" disabled={allocateSlot.isPending}>
                {allocateSlot.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Allocate Slot
              </Button>
            </div>
          </form>
        </div>
      )}

      {selectedSectionId && !isCreating && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold px-6 py-4">Day</TableHead>
                <TableHead className="font-semibold px-6 py-4">Time</TableHead>
                <TableHead className="font-semibold px-6 py-4">Faculty</TableHead>
                <TableHead className="font-semibold px-6 py-4">Room</TableHead>
                <TableHead className="font-semibold px-6 py-4">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingTimetable ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24 animate-pulse"></div></TableCell>
                    <TableCell className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32 animate-pulse"></div></TableCell>
                    <TableCell className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-40 animate-pulse"></div></TableCell>
                    <TableCell className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16 animate-pulse"></div></TableCell>
                    <TableCell className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20 animate-pulse"></div></TableCell>
                  </TableRow>
                ))
              ) : !timetable || timetable.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-8 h-8 text-slate-300 mb-2" />
                      <div className="font-medium text-slate-900">No slots allocated.</div>
                      <div className="text-sm mt-1">There are no timetable slots allocated for this section yet.</div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                timetable.map(slot => {
                  const faculty = facultyList?.find(f => f.id === slot.facultyId);
                  const room = rooms?.find(r => r.id === slot.roomId);
                  return (
                    <TableRow key={slot.id}>
                      <TableCell className="font-semibold px-6 py-4">{slot.dayOfWeek}</TableCell>
                      <TableCell className="px-6 py-4 text-slate-600">{slot.startTime} - {slot.endTime}</TableCell>
                      <TableCell className="px-6 py-4">
                        {faculty ? `${faculty.username} (${faculty.email})` : `Faculty ID: ${slot.facultyId}`}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-slate-600">{room ? room.name : `Room ${slot.roomId}`}</TableCell>
                      <TableCell className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${slot.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                          {slot.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Room Modal */}
      <Dialog open={isRoomModalOpen} onOpenChange={setIsRoomModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-base font-bold">
              <Building2 className="w-5 h-5 mr-2 text-slate-700" />
              Create Classroom / Lecture Room
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateRoom} className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Room Name / Code*</label>
              <Input
                required
                placeholder="e.g. Room 301, Lab B, Seminar Hall"
                value={newRoomName}
                onChange={e => setNewRoomName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Capacity (Seats)*</label>
              <Input
                required
                type="number"
                min="1"
                placeholder="e.g. 60"
                value={newRoomCapacity}
                onChange={e => setNewRoomCapacity(e.target.value)}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsRoomModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createRoomMutation.isPending}>
                {createRoomMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Room
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
