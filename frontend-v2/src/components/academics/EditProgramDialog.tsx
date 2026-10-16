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
import { useUpdateProgram, type Program, type Department } from '../../hooks/queries/useAcademics';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Props {
  program: Program | null;
  departments: Department[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditProgramDialog({ program, departments, open, onOpenChange, onSuccess }: Props) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [degree, setDegree] = useState('B.Tech');
  const [deptId, setDeptId] = useState('');
  const [duration, setDuration] = useState('4');
  const [isActive, setIsActive] = useState(true);

  const updateProgram = useUpdateProgram();

  useEffect(() => {
    if (program) {
      setCode(program.code || '');
      setName(program.name || '');
      setDegree(program.degree || program.type || 'B.Tech');
      setDeptId(program.departmentId ? String(program.departmentId) : (departments[0]?.id ? String(departments[0].id) : ''));
      setDuration(String(program.duration || program.durationYears || 4));
      setIsActive(program.isActive !== undefined ? program.isActive : true);
    }
  }, [program, departments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!program) return;

    if (!code.trim() || !name.trim()) {
      toast.error('Program code and name are required');
      return;
    }

    try {
      await updateProgram.mutateAsync({
        id: program.id,
        data: {
          code: code.trim().toUpperCase(),
          name: name.trim(),
          degree,
          departmentId: parseInt(deptId) || departments[0]?.id || 1,
          duration: parseInt(duration) || 4,
          isActive
        }
      });
      toast.success('Program updated successfully');
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update program');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Academic Program</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Program Code</label>
              <Input
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. BTECH-CS"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Degree Title</label>
              <select
                required
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
              >
                <option value="B.Tech">B.Tech</option>
                <option value="M.Tech">M.Tech</option>
                <option value="B.Sc">B.Sc</option>
                <option value="M.Sc">M.Sc</option>
                <option value="BBA">BBA</option>
                <option value="MBA">MBA</option>
                <option value="Ph.D">Ph.D</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Program Name</label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bachelor of Technology in CS"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Years)</label>
              <Input
                required
                type="number"
                min="1"
                max="6"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
              <select
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                value={isActive ? 'true' : 'false'}
                onChange={(e) => setIsActive(e.target.value === 'true')}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
            <select
              required
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              value={deptId}
              onChange={(e) => setDeptId(e.target.value)}
            >
              <option value="">Select Department...</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateProgram.isPending}>
              {updateProgram.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
