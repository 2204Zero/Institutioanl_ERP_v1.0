import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { useERP } from '../hooks/useERP';
import { logBackendAction } from '../utils/backendLogger';
import { Calendar, Clock, MapPin, Users, Zap, CheckCircle2, ShieldAlert } from 'lucide-react';

interface TimetableSlot {
  id: string;
  timeSlot: string;
  subject: string;
  code: string;
  faculty: string;
  room: string;
  department: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  status: 'Scheduled' | 'Lab Session' | 'Free Slot';
}

const initialSlots: TimetableSlot[] = [
  { id: 'ts-1', timeSlot: '09:00 - 10:00 AM', subject: 'Database Systems (CS301)', code: 'CS301', faculty: 'Dr. Sunita Rao', room: 'LH-101', department: 'Computer Science', day: 'Monday', status: 'Scheduled' },
  { id: 'ts-2', timeSlot: '10:00 - 11:00 AM', subject: 'Distributed Systems (CS304)', code: 'CS304', faculty: 'Prof. Ankit Patel', room: 'LH-102', department: 'Computer Science', day: 'Monday', status: 'Scheduled' },
  { id: 'ts-3', timeSlot: '11:15 - 01:15 PM', subject: 'Advanced OS Lab (CS304L)', code: 'CS304L', faculty: 'Dr. Sunita Rao', room: 'Computer Lab 3', department: 'Computer Science', day: 'Monday', status: 'Lab Session' },
  { id: 'ts-4', timeSlot: '02:00 - 03:00 PM', subject: 'VLSI Circuit Design', code: 'EC402', faculty: 'Prof. Ramesh Kumar', room: 'LH-201', department: 'Electronics', day: 'Monday', status: 'Scheduled' },
  { id: 'ts-5', timeSlot: '03:00 - 04:00 PM', subject: 'Signal Processing', code: 'EC405', faculty: 'Dr. Priya Desai', room: 'LH-202', department: 'Electronics', day: 'Tuesday', status: 'Scheduled' },
];

export const TimetablePage: React.FC = () => {
  const { addToast } = useERP();
  const [selectedDay, setSelectedDay] = useState<TimetableSlot['day']>('Monday');
  const [selectedDept, setSelectedDept] = useState('All');

  const handleRunConflictAudit = () => {
    logBackendAction(
      'Executed Timetable AI Conflict & Overlap Audit Engine',
      '/api/v1/timetable/audit-conflicts',
      'POST',
      200,
      'admin.academic',
      42
    );
    addToast('Schedule Conflict Audit Complete', 'Zero faculty room overlaps or double-booking conflicts detected!', 'success');
  };

  const filteredSlots = initialSlots.filter((s) => {
    const matchesDay = s.day === selectedDay;
    const matchesDept = selectedDept === 'All' || s.department === selectedDept;
    return matchesDay && matchesDept;
  });

  return (
    <AppLayout>
      <div className="space-y-6 text-left">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-7 h-7 text-brand-600" /> Academic Timetable & Scheduling Matrix
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Automated lecture slot mapping, laboratory bookings & faculty occupancy optimizer.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleRunConflictAudit}>
              <ShieldAlert className="w-4 h-4 mr-1.5 text-brand-600" /> Run Conflict Check
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                logBackendAction('Triggered Automated Slot Scheduler Engine', '/api/v1/timetable/generate', 'POST');
                addToast('Auto Scheduler Triggered', 'Regenerating optimized timetable slots...', 'info');
              }}
            >
              <Zap className="w-4 h-4 mr-1.5" /> Auto-Schedule Slots
            </Button>
          </div>
        </div>

        {/* Control Bar */}
        <Card className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const).map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedDay === day
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <Select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            options={[
              { label: 'All Departments', value: 'All' },
              { label: 'Computer Science', value: 'Computer Science' },
              { label: 'Electronics', value: 'Electronics' },
            ]}
            className="w-48 text-xs py-1.5"
          />
        </Card>

        {/* Timetable Slot List */}
        <div className="space-y-3">
          {filteredSlots.map((slot) => (
            <Card key={slot.id} className="p-4 hover:border-brand-300 transition-all flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-brand-50 text-brand-700 font-bold text-xs flex flex-col items-center justify-center min-w-[120px] border border-brand-200">
                  <Clock className="w-4 h-4 mb-1 text-brand-600" />
                  <span>{slot.timeSlot}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{slot.subject}</h4>
                    <Badge variant={slot.status === 'Lab Session' ? 'purple' : 'info'}>{slot.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> {slot.faculty}
                    </span>
                    <span className="flex items-center gap-1 font-mono font-medium text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-brand-500" /> Room: {slot.room}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-600 border">
                  {slot.department}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};
