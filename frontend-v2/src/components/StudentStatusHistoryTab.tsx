import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { StatusBadge } from './ui/StatusBadge';
import type { StudentStatusHistory } from '../types/student';
import { Loader2, Clock, ArrowRight } from 'lucide-react';

interface StudentStatusHistoryTabProps {
  studentId: number;
}

function formatDate(val: any): string {
  if (!val) return 'N/A';
  if (Array.isArray(val)) {
    const [year, month, day] = val;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  try {
    return new Date(val).toLocaleDateString();
  } catch {
    return String(val);
  }
}

function formatTimestamp(val: any): string {
  if (!val) return 'N/A';
  if (Array.isArray(val)) {
    const [year, month, day, hour = 0, minute = 0] = val;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }
  try {
    return new Date(val).toLocaleString();
  } catch {
    return String(val);
  }
}

export function StudentStatusHistoryTab({ studentId }: StudentStatusHistoryTabProps) {
  const { data, isLoading, isError } = useQuery<StudentStatusHistory[]>({
    queryKey: ['student-history', String(studentId)],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/students/${studentId}/status-history`);
      return res.data?.data || [];
    },
    enabled: !!studentId
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-12 border border-slate-200 bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200">
        <p className="text-xs text-red-600 font-medium">Failed to load status audit history.</p>
      </div>
    );
  }

  const history = data || [];

  return (
    <div className="border border-slate-200 bg-white">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Lifecycle & Status Audit Trail
          </h3>
        </div>
        <span className="text-[10px] font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
          {history.length} {history.length === 1 ? 'event' : 'events'}
        </span>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-10 text-slate-500 text-xs italic">
          No status transitions recorded for this student.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap text-xs">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-4 py-2.5">Date & Time</th>
                <th className="px-4 py-2.5">Effective Date</th>
                <th className="px-4 py-2.5">Transition</th>
                <th className="px-4 py-2.5">Reason / Remarks</th>
                <th className="px-4 py-2.5">Authorized By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                    {formatTimestamp(record.changedAt)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {formatDate(record.effectiveDate)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1.5">
                      {record.previousStatus ? (
                        <>
                          <StatusBadge status={record.previousStatus} />
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Enrollment → </span>
                      )}
                      <StatusBadge status={record.newStatus} />
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate text-slate-700 font-medium" title={record.reason}>
                    {record.reason || '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                    {record.changedBy || 'system'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
