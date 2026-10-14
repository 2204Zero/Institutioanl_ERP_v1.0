import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useCreateAcademicYear } from '../../hooks/queries/useAcademics';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateAcademicYearDialog({ open, onOpenChange, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const createAcademicYear = useCreateAcademicYear();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !startDate || !endDate) {
      toast.error('All fields are required');
      return;
    }

    try {
      await createAcademicYear.mutateAsync({
        name: name.trim(),
        startDate,
        endDate,
        isActive: true,
      });
      toast.success('Academic Year created successfully');
      setName('');
      setStartDate('');
      setEndDate('');
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create academic year');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Academic Year</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year Name</label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 2026-2027"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
            <Input
              required
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
            <Input
              required
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createAcademicYear.isPending}>
              {createAcademicYear.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Academic Year
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
