import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { usePrograms, useAcademicYears } from '../hooks/queries/useAcademics';
import { formatAcademicYearLabel, formatProgramLabel } from '../lib/academicUtils';
import { useCreateInquiry } from '../hooks/queries/useAdmissions';
import { toast } from 'sonner';
import { Loader2, PlusCircle } from 'lucide-react';

interface NewApplicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewApplicationDialog({ isOpen, onClose }: NewApplicationDialogProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [programId, setProgramId] = useState<string>('');
  const [academicYearId, setAcademicYearId] = useState<string>('');
  const [remarks, setRemarks] = useState('');

  const { data: programs = [], isLoading: isLoadingPrograms } = usePrograms();
  const { data: academicYears = [], isLoading: isLoadingAYs } = useAcademicYears();
  const createInquiryMutation = useCreateInquiry();

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setProgramId('');
    setAcademicYearId('');
    setRemarks('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
      toast.error('First Name, Last Name, Email, and Phone are required.');
      return;
    }

    createInquiryMutation.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      programId: programId ? Number(programId) : undefined,
      academicYearId: academicYearId ? Number(academicYearId) : undefined,
      remarks: remarks.trim() || undefined,
    }, {
      onSuccess: (data: any) => {
        toast.success(`Application created successfully! (App ID: APP-${data.id || 'NEW'})`);
        handleClose();
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message || err.message || 'Failed to submit application';
        toast.error(msg);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg bg-white rounded-xl shadow-2xl p-6">
        <DialogHeader>
          <div className="flex items-center space-x-2 text-slate-900">
            <PlusCircle className="w-5 h-5 text-slate-700" />
            <DialogTitle className="text-lg font-bold">New Applicant Inquiry & Submission</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            Register a prospective applicant and initiate an admission application in the verified pipeline.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">First Name *</Label>
              <Input
                placeholder="e.g. Rahul"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="text-xs bg-slate-50 border-slate-200"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Last Name *</Label>
              <Input
                placeholder="e.g. Sharma"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="text-xs bg-slate-50 border-slate-200"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Official Email *</Label>
              <Input
                type="email"
                placeholder="e.g. rahul.sharma@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-xs bg-slate-50 border-slate-200"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Contact Phone *</Label>
              <Input
                placeholder="e.g. +91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="text-xs bg-slate-50 border-slate-200"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Target Academic Program</Label>
              <Select value={programId} onValueChange={setProgramId}>
                <SelectTrigger className="text-xs bg-slate-50 border-slate-200">
                  <SelectValue placeholder={isLoadingPrograms ? "Loading programs..." : "Select program"} />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((p: any) => (
                    <SelectItem key={p.id} value={String(p.id)} className="text-xs">
                      {formatProgramLabel(p)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Target Academic Year</Label>
              <Select value={academicYearId} onValueChange={setAcademicYearId}>
                <SelectTrigger className="text-xs bg-slate-50 border-slate-200">
                  <SelectValue placeholder={isLoadingAYs ? "Loading academic years..." : "Select academic year"} />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((ay: any) => (
                    <SelectItem key={ay.id} value={String(ay.id)} className="text-xs">
                      {formatAcademicYearLabel(ay)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Inquiry Remarks / Background</Label>
            <Input
              placeholder="e.g. Merit scholarship applicant; transfer student inquiry"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="text-xs bg-slate-50 border-slate-200"
            />
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createInquiryMutation.isPending}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createInquiryMutation.isPending}
              className="text-xs bg-black text-white hover:bg-slate-800"
            >
              {createInquiryMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Submitting...
                </>
              ) : (
                'Create Application'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
