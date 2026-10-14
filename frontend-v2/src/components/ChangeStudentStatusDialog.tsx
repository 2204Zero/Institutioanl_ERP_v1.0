import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { StatusBadge } from './ui/StatusBadge';
import type { StudentStatus } from '../types/student';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { formatLocalDate } from '../lib/utils';

interface ChangeStudentStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: number;
  studentName: string;
  currentStatus: StudentStatus;
  targetStatus: StudentStatus | null;
  onSuccess?: () => void;
}

export function ChangeStudentStatusDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
  currentStatus,
  targetStatus,
  onSuccess
}: ChangeStudentStatusDialogProps) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(formatLocalDate());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setReason('');
      setEffectiveDate(formatLocalDate());
      setErrorMessage(null);
    }
    onOpenChange(nextOpen);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!targetStatus) return;
      const res = await apiClient.patch(`/api/v1/students/${studentId}/status`, {
        status: targetStatus,
        reason: reason.trim() || `Status updated from ${currentStatus} to ${targetStatus}`,
        effectiveDate: effectiveDate || formatLocalDate()
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success(`Student status successfully updated to ${targetStatus}`);
      queryClient.invalidateQueries({ queryKey: ['student', String(studentId)] });
      queryClient.invalidateQueries({ queryKey: ['student-history', String(studentId)] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-students'] });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to update student status';
      setErrorMessage(msg);
      toast.error(msg);
    }
  });

  if (!targetStatus) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md bg-white border border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-900">
            Confirm Status Transition
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Update lifecycle status for <span className="font-semibold text-slate-700">{studentName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 flex items-start space-x-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Current Status</p>
              <div className="mt-1">
                <StatusBadge status={currentStatus} />
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400" />

            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Target Status</p>
              <div className="mt-1">
                <StatusBadge status={targetStatus} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Effective Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              className="text-xs h-9"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Audit Reason / Remarks <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full text-xs border border-slate-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-slate-900 min-h-[80px]"
              placeholder={
                targetStatus === 'ALUMNI'
                  ? 'e.g., Convocation ceremony completed, enrolled in Alumni Portal'
                  : targetStatus === 'GRADUATED'
                  ? 'e.g., Completed all degree curriculum requirements with passing credits'
                  : targetStatus === 'SUSPENDED'
                  ? 'e.g., Attendance shortage below 60% requirement'
                  : 'Enter mandatory justification for status change...'
              }
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            className="bg-slate-900 text-white hover:bg-slate-800"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !effectiveDate}
          >
            {mutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
            Confirm Transition
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
