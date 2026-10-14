import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../ui/dialog';
import { Button } from '../ui/button';
import {
  useCoursePrerequisites,
  useAddCoursePrerequisite,
  useRemoveCoursePrerequisite,
  type Course
} from '../../hooks/queries/useAcademics';
import { toast } from 'sonner';
import { Loader2, Trash2, Plus, AlertCircle } from 'lucide-react';

interface Props {
  course: Course | null;
  allCourses: Course[] | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin: boolean;
}

export function CoursePrerequisitesDialog({
  course,
  allCourses = [],
  open,
  onOpenChange,
  isAdmin
}: Props) {
  const [selectedPrereqId, setSelectedPrereqId] = useState<string>('');
  const { data: prerequisites = [], isLoading } = useCoursePrerequisites(course ? course.id : null);
  const addPrerequisite = useAddCoursePrerequisite();
  const removePrerequisite = useRemoveCoursePrerequisite();

  if (!course) return null;

  // Filter out the course itself and courses already in prerequisites
  const existingPrereqIds = new Set(prerequisites.map((p) => p.prerequisiteCourseId));
  const availableCourses = allCourses.filter(
    (c) => c.id !== course.id && !existingPrereqIds.has(c.id)
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrereqId) return;

    try {
      await addPrerequisite.mutateAsync({
        courseId: course.id,
        prerequisiteCourseId: parseInt(selectedPrereqId),
      });
      toast.success('Prerequisite assigned successfully');
      setSelectedPrereqId('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add prerequisite');
    }
  };

  const handleRemove = async (prereqCourseId: number) => {
    try {
      await removePrerequisite.mutateAsync({
        courseId: course.id,
        prerequisiteCourseId: prereqCourseId,
      });
      toast.success('Prerequisite removed successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove prerequisite');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Course Prerequisites</span>
            <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {course.code}
            </span>
          </DialogTitle>
          <p className="text-xs text-slate-500">
            Define mandatory prerequisite courses that students must complete or register for before enrolling in {course.name}.
          </p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {isLoading ? (
            <div className="flex items-center justify-center p-6 text-slate-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading prerequisites...
            </div>
          ) : prerequisites.length === 0 ? (
            <div className="border border-dashed border-slate-200 rounded-lg p-6 text-center text-slate-500 text-sm">
              <AlertCircle className="w-6 h-6 mx-auto mb-1 text-slate-400" />
              No prerequisites assigned. Students can directly register for this course.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <tr>
                    <th className="text-left px-4 py-2">Prerequisite Course</th>
                    <th className="text-left px-4 py-2">Code</th>
                    {isAdmin && <th className="text-right px-4 py-2">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prerequisites.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 font-medium text-slate-800">
                        {p.prerequisiteCourseName}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">{p.prerequisiteCourseCode}</td>
                      {isAdmin && (
                        <td className="px-4 py-2.5 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRemove(p.prerequisiteCourseId)}
                            disabled={removePrerequisite.isPending}
                            title="Remove prerequisite"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {isAdmin && (
            <form onSubmit={handleAdd} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Add Required Prerequisite
              </h4>
              <div className="flex gap-2">
                <select
                  required
                  className="flex-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  value={selectedPrereqId}
                  onChange={(e) => setSelectedPrereqId(e.target.value)}
                >
                  <option value="">Select a course to require...</option>
                  {availableCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.name} ({c.credits} cr)
                    </option>
                  ))}
                </select>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-black text-white hover:bg-black/80 h-9"
                  disabled={!selectedPrereqId || addPrerequisite.isPending}
                >
                  {addPrerequisite.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 mr-1" />
                  )}
                  Add
                </Button>
              </div>
              {availableCourses.length === 0 && (
                <p className="text-xs text-slate-400 italic">
                  All catalog courses are already prerequisites or cannot be selected.
                </p>
              )}
            </form>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
