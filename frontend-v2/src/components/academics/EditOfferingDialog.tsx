import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useUpdateCourseOffering, type CourseOffering } from '../../hooks/queries/useAcademics';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Props {
  offering: CourseOffering | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditOfferingDialog({ offering, open, onOpenChange, onSuccess }: Props) {
  const [maxCapacity, setMaxCapacity] = useState('60');
  const [isPublished, setIsPublished] = useState(false);

  const updateOffering = useUpdateCourseOffering();

  useEffect(() => {
    if (offering) {
      setMaxCapacity(String(offering.maxCapacity || 60));
      setIsPublished(!!offering.isPublished);
    }
  }, [offering]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offering) return;

    const cap = parseInt(maxCapacity);
    if (isNaN(cap) || cap < 1) {
      toast.error('Max capacity must be at least 1');
      return;
    }

    try {
      await updateOffering.mutateAsync({
        id: offering.id,
        data: {
          maxCapacity: cap,
          isPublished
        }
      });
      toast.success('Course offering updated successfully');
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update course offering');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Course Offering</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Course</label>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-800">
              {offering?.course?.code} — {offering?.course?.name}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Semester</label>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-800">
              {offering?.semester?.name}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Max Capacity</label>
            <Input
              required
              type="number"
              min="1"
              max="500"
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(e.target.value)}
              placeholder="e.g. 60"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Publishing Status</label>
            <select
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              value={isPublished ? 'true' : 'false'}
              onChange={(e) => setIsPublished(e.target.value === 'true')}
            >
              <option value="true">Published (Available for Enrollment)</option>
              <option value="false">Draft (Unpublished)</option>
            </select>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateOffering.isPending}>
              {updateOffering.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
