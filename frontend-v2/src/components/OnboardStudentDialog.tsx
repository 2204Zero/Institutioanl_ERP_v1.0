import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  CheckCircle2, 
  Copy, 
  FileCheck, 
  FileText, 
  Loader2, 
  ShieldAlert, 
  UserCheck, 
  ExternalLink 
} from 'lucide-react';

interface OnboardStudentDialogProps {
  application: any | null;
  applicant: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OnboardStudentDialog({
  application,
  applicant,
  open,
  onOpenChange,
}: OnboardStudentDialogProps) {
  const queryClient = useQueryClient();

  // Review Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('MALE');
  const [address, setAddress] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');

  // Confirmation step
  const [isConfirming, setIsConfirming] = useState(false);
  const [provisionedStudent, setProvisionedStudent] = useState<any | null>(null);

  // Load real departments
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/departments');
      return res.data || [];
    },
    enabled: open,
  });

  // Load real programs
  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/programs');
      return res.data || [];
    },
    enabled: open,
  });

  // Load batches for selected program
  const { data: batches = [] } = useQuery({
    queryKey: ['batches', selectedProgramId],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/batches', {
        params: selectedProgramId ? { programId: selectedProgramId } : undefined,
      });
      return res.data || [];
    },
    enabled: open && !!selectedProgramId,
  });

  // Load semesters for selected academic year
  const { data: semesters = [] } = useQuery({
    queryKey: ['semesters', selectedAcademicYearId],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/semesters', {
        params: selectedAcademicYearId ? { academicYearId: selectedAcademicYearId } : undefined,
      });
      return res.data || [];
    },
    enabled: open && !!selectedAcademicYearId,
  });

  // Load applicant documents
  const { data: applicantDocs = [], isLoading: loadingDocs } = useQuery({
    queryKey: ['applicant-documents', application?.applicantId],
    queryFn: async () => {
      if (!application?.applicantId) return [];
      const res = await apiClient.get(`/api/v1/applicant-documents/applicant/${application.applicantId}`);
      return res.data || [];
    },
    enabled: open && !!application?.applicantId,
  });

  // Prepopulate form when application/applicant changes
  useEffect(() => {
    if (application && open) {
      const targetApplicant = applicant;
      setFirstName(targetApplicant?.firstName || '');
      setLastName(targetApplicant?.lastName || '');
      setPhone(targetApplicant?.phone || '');
      setDob(targetApplicant?.dateOfBirth ? String(targetApplicant.dateOfBirth) : '');
      setGender(targetApplicant?.gender || 'MALE');
      setAddress(targetApplicant?.address || '');

      const progId = String(application.programId || '');
      setSelectedProgramId(progId);
      const ayId = String(application.academicYearId || '');
      setSelectedAcademicYearId(ayId);

      // Pre-select program's department if available
      const prog = programs.find((p: any) => String(p.id) === progId);
      if (prog?.departmentId) {
        setSelectedDeptId(String(prog.departmentId));
      } else if (departments.length > 0) {
        setSelectedDeptId(String(departments[0].id));
      }
    }
  }, [application, applicant, open, programs, departments]);

  // Set default batch when batches load
  useEffect(() => {
    if (batches.length > 0 && !selectedBatchId) {
      setSelectedBatchId(String(batches[0].id));
    }
  }, [batches, selectedBatchId]);

  // Set default semester when semesters load
  useEffect(() => {
    if (semesters.length > 0 && !selectedSemesterId) {
      const sem1 = semesters.find((s: any) => s.semesterNumber === 1);
      setSelectedSemesterId(String(sem1 ? sem1.id : semesters[0].id));
    }
  }, [semesters, selectedSemesterId]);

  // Reset state on modal close
  const handleClose = () => {
    setIsConfirming(false);
    setProvisionedStudent(null);
    onOpenChange(false);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  const onboardMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        dateOfBirth: dob || undefined,
        gender,
        address: address.trim() || undefined,
        departmentId: selectedDeptId ? Number(selectedDeptId) : undefined,
        programId: selectedProgramId ? Number(selectedProgramId) : undefined,
        academicYearId: selectedAcademicYearId ? Number(selectedAcademicYearId) : undefined,
        batchId: selectedBatchId ? Number(selectedBatchId) : undefined,
        semesterId: selectedSemesterId ? Number(selectedSemesterId) : undefined,
      };

      const res = await apiClient.post(
        `/api/v1/admission-workflows/applications/${application.id}/onboard`,
        payload
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admission-applications'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setProvisionedStudent(data);
      toast.success('Student onboarded & account provisioned successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to onboard student.');
      setIsConfirming(false);
    },
  });

  const handleStartOnboard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('First and last name are required.');
      return;
    }
    if (!selectedDeptId || !selectedProgramId || !selectedBatchId) {
      toast.error('Department, Program, and Batch assignments are required.');
      return;
    }
    setIsConfirming(true);
  };

  if (!application) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white p-6 rounded-2xl shadow-xl">
        {provisionedStudent ? (
          // STEP 6 & 7: Provisioned Credentials Confirmation Screen
          <div className="space-y-6 py-2">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Student Enrolled & Account Provisioned
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Application APP-{application.id} has been transitioned to ENROLLED. Canonical academic credentials and user login account have been issued.
              </DialogDescription>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-xs text-slate-500 font-medium">Student Name:</span>
                <span className="text-sm font-bold text-slate-900">
                  {provisionedStudent.firstName} {provisionedStudent.lastName}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-xs text-slate-500 font-medium">Canonical Enrollment No:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                    {provisionedStudent.enrollmentNumber || 'Assigned'}
                  </span>
                  {provisionedStudent.enrollmentNumber && (
                    <button
                      onClick={() => copyToClipboard(provisionedStudent.enrollmentNumber, 'Enrollment Number')}
                      className="text-slate-400 hover:text-slate-800"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-xs text-slate-500 font-medium">Login Username / Email:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-semibold text-slate-900">
                    {provisionedStudent.username || provisionedStudent.email}
                  </span>
                  <button
                    onClick={() => copyToClipboard(provisionedStudent.username || provisionedStudent.email, 'Username')}
                    className="text-slate-400 hover:text-slate-800"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {provisionedStudent.temporaryPassword && (
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Initial Temporary Password:</span>
                    <span className="text-[10px] text-amber-700">Disclosed one-time upon account creation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                      {provisionedStudent.temporaryPassword}
                    </span>
                    <button
                      onClick={() => copyToClipboard(provisionedStudent.temporaryPassword, 'Password')}
                      className="text-slate-400 hover:text-slate-800"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">Department & Batch:</span>
                <span className="text-xs font-semibold text-slate-800">
                  {provisionedStudent.department} • {provisionedStudent.batch}
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 space-y-1">
              <p className="font-bold flex items-center">
                <FileCheck className="w-4 h-4 mr-1.5 text-blue-700" />
                Next Steps for Student Portal Access:
              </p>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                The student can now log in at <code className="bg-white/80 px-1 py-0.5 rounded font-mono">/login</code> using their username or institutional email and the temporary password above. They should update their password on first sign in.
              </p>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-xl">
                Done & Return to Onboarding List
              </Button>
            </DialogFooter>
          </div>
        ) : isConfirming ? (
          // STEP 5: Explicit Confirmation Screen
          <div className="space-y-5 py-2">
            <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-amber-900">
                <h4 className="font-bold text-sm">Confirm Final Student Onboarding</h4>
                <p>
                  You are about to finalize student enrollment for{' '}
                  <strong className="font-semibold">{firstName} {lastName}</strong>.
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800 mt-2">
                  <li>A permanent student record and canonical ENR number will be generated.</li>
                  <li>A dedicated student portal login account will be provisioned.</li>
                  <li>Academic placement in the selected Department and Batch will be locked.</li>
                  <li>Application documents will be associated with the student profile.</li>
                  <li>Application status will be marked as <span className="font-bold">ENROLLED</span>.</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-semibold text-slate-800">{firstName} {lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Program:</span>
                <span className="font-semibold text-slate-800">
                  {programs.find((p: any) => String(p.id) === selectedProgramId)?.name || `Program #${selectedProgramId}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="font-semibold text-slate-800">
                  {departments.find((d: any) => String(d.id) === selectedDeptId)?.name || 'General'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Batch:</span>
                <span className="font-semibold text-slate-800">
                  {batches.find((b: any) => String(b.id) === selectedBatchId)?.name || 'Default'}
                </span>
              </div>
            </div>

            <DialogFooter className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsConfirming(false)}
                disabled={onboardMutation.isPending}
                className="rounded-xl text-xs"
              >
                Back to Review
              </Button>
              <Button
                onClick={() => onboardMutation.mutate()}
                disabled={onboardMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs flex items-center space-x-1.5"
              >
                {onboardMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                <span>Confirm & Onboard Student</span>
              </Button>
            </DialogFooter>
          </div>
        ) : (
          // STEP 2 & 3: Review Application & Academic Placements
          <form onSubmit={handleStartOnboard} className="space-y-6">
            <DialogHeader>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-mono text-[10px] font-bold rounded">
                  APP-{application.id}
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                  {application.status}
                </span>
              </div>
              <DialogTitle className="text-lg font-bold text-slate-900 mt-1">
                Onboarding Review — {applicant?.firstName} {applicant?.lastName}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Review applicant profile data, verify submitted documents, and assign authoritative academic departments and batches prior to student record creation.
              </DialogDescription>
            </DialogHeader>

            {/* Applicant Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">1. Student Identity & Contact</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-slate-600">First Name</Label>
                  <Input 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                    className="h-9 text-xs" 
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-slate-600">Last Name</Label>
                  <Input 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                    className="h-9 text-xs" 
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-slate-600">Phone</Label>
                  <Input 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    className="h-9 text-xs" 
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-slate-600">Date of Birth</Label>
                  <Input 
                    type="date"
                    value={dob} 
                    onChange={(e) => setDob(e.target.value)} 
                    className="h-9 text-xs" 
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs font-medium text-slate-600">Residential Address</Label>
                  <Input 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    className="h-9 text-xs" 
                  />
                </div>
              </div>
            </div>

            {/* Academic Placement */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">2. Academic Assignments</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-slate-600">Department *</Label>
                  <select
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept: any) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium text-slate-600">Degree Program *</Label>
                  <select
                    value={selectedProgramId}
                    onChange={(e) => setSelectedProgramId(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                    required
                  >
                    <option value="">Select Program</option>
                    {programs.map((prog: any) => (
                      <option key={prog.id} value={prog.id}>
                        {prog.name} ({prog.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium text-slate-600">Batch *</Label>
                  <select
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                    required
                  >
                    <option value="">Select Batch</option>
                    {batches.map((batch: any) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.name} ({batch.code || 'Active'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium text-slate-600">Starting Semester</Label>
                  <select
                    value={selectedSemesterId}
                    onChange={(e) => setSelectedSemesterId(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                  >
                    {semesters.map((sem: any) => (
                      <option key={sem.id} value={sem.id}>
                        {sem.name} (Sem {sem.semesterNumber})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Uploaded Documents Review */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">3. Application Documents</h4>
                <span className="text-[10px] text-slate-500 font-semibold">{applicantDocs.length} Uploaded</span>
              </div>
              {loadingDocs ? (
                <div className="py-3 flex justify-center"><Loader2 className="w-4 h-4 animate-spin text-slate-400" /></div>
              ) : applicantDocs.length === 0 ? (
                <p className="text-xs text-slate-400 italic bg-slate-50 p-2.5 rounded border border-dashed border-slate-200">
                  No documents were uploaded with this application. Additional documents may be uploaded directly to the student profile later.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                  {applicantDocs.map((doc: any) => (
                    <div key={doc.id} className="p-2.5 bg-slate-50 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <div>
                          <p className="font-semibold text-slate-900">{doc.documentType}</p>
                          <p className="text-[10px] text-slate-400">Status: {doc.verificationStatus}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          doc.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                          doc.verificationStatus === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {doc.verificationStatus}
                        </span>
                        {doc.fileUrl && (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-200"
                            title="Preview Document"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter className="flex space-x-2 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs flex items-center space-x-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 mr-1" />
                <span>Review & Confirm Onboarding</span>
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
