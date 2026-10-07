import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const CalendarWidget: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState(19);

  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  const events: Record<number, string> = {
    18: 'Semester 5 Fee Deadline',
    19: 'Q3 Financial Audit Review',
    22: 'Scholarship Approval Meeting',
    25: 'Monthly Staff Payroll Disbursal',
  };

  return (
    <Card className="flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-brand-600" />
          <h3 className="text-sm font-bold text-slate-800">Academic Calendar</h3>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <ChevronLeft className="w-4 h-4 cursor-pointer hover:text-slate-700" />
          <span className="text-xs font-bold text-slate-700">Sep 2026</span>
          <ChevronRight className="w-4 h-4 cursor-pointer hover:text-slate-700" />
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 my-3 text-center text-xs">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <span key={d} className="text-[10px] font-bold text-slate-400 uppercase py-1">
            {d}
          </span>
        ))}
        {days.slice(0, 28).map((day) => {
          const hasEvent = !!events[day];
          const isSelected = selectedDay === day;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`p-1.5 rounded-lg text-xs font-semibold relative transition-colors ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-sm'
                  : hasEvent
                  ? 'bg-brand-50 text-brand-700 font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {day}
              {hasEvent && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-2 border-t border-slate-100 text-left">
        {events[selectedDay] ? (
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">Sep {selectedDay}:</span>
            <Badge variant="info">{events[selectedDay]}</Badge>
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">No institutional events for Sep {selectedDay}</span>
        )}
      </div>
    </Card>
  );
};
