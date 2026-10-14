import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { toast } from 'sonner';
import { Loader2, PlusCircle, Users, GraduationCap, Building2, CheckCircle, Copy, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { INDIAN_STATES_CITIES, INDIAN_STATES } from '../constants/locations';
import { formatAcademicYearLabel } from './CreateInvoiceDialog';

const studentSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address").max(150),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(20),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().optional(),
  departmentId: z.string().min(1, "Department is required"),
  department: z.string().optional(),
  programId: z.string().optional(),
  program: z.string().optional(),
  batchId: z.string().min(1, "Batch is required"),
  batch: z.string().optional(),
  academicYearId: z.string().optional(),
  semesterId: z.string().optional(),
  guardianOption: z.enum(['NONE', 'EXISTING', 'NEW']),
  guardianId: z.string().optional(),
  guardianFirstName: z.string().optional(),
  guardianLastName: z.string().optional(),
  guardianEmail: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianRelationship: z.string().optional(),
  enrollmentDate: z.string().min(1, "Enrollment date is required"),
  status: z.enum(['ACTIVE', 'INACTIVE', 'GRADUATED', 'DROPOUT', 'SUSPENDED']),
});

type FormValues = z.infer<typeof studentSchema>;

export function CreateStudentDialog() {
  const [open, setOpen] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    enrollmentNumber: string;
    username: string;
    email: string;
    temporaryPassword?: string;
    firstName: string;
    lastName: string;
  } | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'MALE',
      bloodGroup: 'O+',
      address: '',
      state: 'Maharashtra',
      city: 'Mumbai',
      pincode: '',
      departmentId: '',
      department: '',
      programId: '',
      program: '',
      batchId: '',
      batch: '',
      academicYearId: '',
      semesterId: '',
      guardianOption: 'NONE',
      guardianId: '',
      guardianFirstName: '',
      guardianLastName: '',
      guardianEmail: '',
      guardianPhone: '',
      guardianRelationship: 'FATHER',
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
    },
  });

  const selectedDepartmentId = form.watch('departmentId');
  const selectedProgramId = form.watch('programId');
  const selectedAcademicYearId = form.watch('academicYearId');
  const selectedState = form.watch('state');
  const guardianOption = form.watch('guardianOption');

  // Fetch Departments
  const { data: departments = [], isLoading: isLoadingDepts } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/departments');
      return res.data || [];
    },
    enabled: open,
  });

  // Fetch Programs filtered by departmentId
  const { data: programs = [], isLoading: isLoadingPrograms } = useQuery({
    queryKey: ['programs', selectedDepartmentId],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/programs', {
        params: selectedDepartmentId ? { departmentId: selectedDepartmentId } : undefined,
      });
      return res.data || [];
    },
    enabled: open,
  });

  // Fetch Batches filtered by programId
  const { data: batches = [], isLoading: isLoadingBatches } = useQuery({
    queryKey: ['batches', selectedProgramId],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/batches', {
        params: selectedProgramId ? { programId: selectedProgramId } : undefined,
      });
      return res.data || [];
    },
    enabled: open,
  });

  // Fetch Academic Years
  const { data: academicYears = [], isLoading: isLoadingAY } = useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/academic-years');
      return res.data || [];
    },
    enabled: open,
  });

  // Fetch Semesters filtered by academicYearId
  const { data: semesters = [], isLoading: isLoadingSemesters } = useQuery({
    queryKey: ['semesters', selectedAcademicYearId],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/semesters', {
        params: selectedAcademicYearId ? { academicYearId: selectedAcademicYearId } : undefined,
      });
      return res.data || [];
    },
    enabled: open,
  });

  // Fetch Guardians for linking
  const { data: guardians = [], isLoading: isLoadingGuardians } = useQuery({
    queryKey: ['guardians-list'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/guardians');
      return res.data?.data || [];
    },
    enabled: open && guardianOption === 'EXISTING',
  });

  // Reset form when closed
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      let finalGuardianId: number | undefined = undefined;

      // If creating new guardian, create guardian first
      if (data.guardianOption === 'NEW' && data.guardianFirstName && data.guardianLastName && data.guardianEmail && data.guardianPhone) {
        try {
          const guardianPayload = {
            firstName: data.guardianFirstName,
            lastName: data.guardianLastName,
            email: data.guardianEmail,
            phone: data.guardianPhone,
            relationship: data.guardianRelationship || 'LEGAL_GUARDIAN',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            pincode: data.pincode || '',
          };
          const gRes = await apiClient.post('/api/v1/guardians', guardianPayload);
          finalGuardianId = gRes.data?.data?.id;
        } catch (gErr: any) {
          throw new Error(gErr.response?.data?.message || 'Failed to create guardian record');
        }
      } else if (data.guardianOption === 'EXISTING' && data.guardianId) {
        finalGuardianId = Number(data.guardianId);
      }

      // Build student payload
      const payload: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        bloodGroup: data.bloodGroup || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        pincode: data.pincode || null,
        department: data.department,
        departmentId: data.departmentId ? Number(data.departmentId) : undefined,
        program: data.program,
        programId: data.programId ? Number(data.programId) : undefined,
        batch: data.batch,
        batchId: data.batchId ? Number(data.batchId) : undefined,
        academicYearId: data.academicYearId ? Number(data.academicYearId) : undefined,
        semesterId: data.semesterId ? Number(data.semesterId) : undefined,
        guardianId: finalGuardianId,
        enrollmentDate: data.enrollmentDate,
        status: data.status,
      };

      const res = await apiClient.post('/api/v1/students', payload);
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['guardians'] });
      const studentData = data?.data || data;
      const enr = studentData?.enrollmentNumber || 'Assigned';
      toast.success(`Student enrolled successfully! Enrollment Number: ${enr}`);
      setCreatedCredentials({
        enrollmentNumber: enr,
        username: studentData?.username || variables.email.split('@')[0],
        email: studentData?.email || variables.email,
        temporaryPassword: studentData?.temporaryPassword || undefined,
        firstName: studentData?.firstName || variables.firstName,
        lastName: studentData?.lastName || variables.lastName,
      });
      form.reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to enroll student');
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  const availableCities = selectedState ? INDIAN_STATES_CITIES[selectedState] || [] : [];

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) setCreatedCredentials(null);
    }}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl" aria-label="Add New Student">
          <PlusCircle className="w-4 h-4 mr-1.5" />
          <span>Enroll New Student</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[760px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-lg font-bold text-slate-900">
            <GraduationCap className="w-5 h-5 mr-2 text-slate-800" />
            Institutional Student Enrollment
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Enroll a new student with canonical enrollment generation, academic associations, and guardian linkage.
          </DialogDescription>
        </DialogHeader>

        {createdCredentials ? (
          <div className="py-4 space-y-5">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Student Enrolled Successfully</h3>
              <p className="text-xs text-slate-500 mt-1">
                Account provisioned for <span className="font-semibold text-slate-800">{createdCredentials.firstName} {createdCredentials.lastName}</span>
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60 pb-2">
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Enrollment Number (Canonical ENR)</span>
                  <span className="font-mono font-bold text-sm text-slate-900">{createdCredentials.enrollmentNumber}</span>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-600 hover:text-black" onClick={() => {
                  navigator.clipboard.writeText(createdCredentials.enrollmentNumber);
                  toast.success('Enrollment number copied!');
                }}>
                  <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                </Button>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200/60 pb-2">
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Login Username</span>
                  <span className="font-mono font-semibold text-sm text-slate-900">{createdCredentials.username}</span>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-600 hover:text-black" onClick={() => {
                  navigator.clipboard.writeText(createdCredentials.username);
                  toast.success('Username copied!');
                }}>
                  <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                </Button>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200/60 pb-2">
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Official Email</span>
                  <span className="font-medium text-sm text-slate-900">{createdCredentials.email}</span>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-600 hover:text-black" onClick={() => {
                  navigator.clipboard.writeText(createdCredentials.email);
                  toast.success('Email copied!');
                }}>
                  <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                </Button>
              </div>

              <div className="flex items-center justify-between py-1">
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Temporary Password</span>
                  {createdCredentials.temporaryPassword ? (
                    <span className="font-mono font-bold text-sm text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100">
                      {createdCredentials.temporaryPassword}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                      Linked to existing verified user credentials
                    </span>
                  )}
                </div>
                {createdCredentials.temporaryPassword && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-600 hover:text-black" onClick={() => {
                    navigator.clipboard.writeText(createdCredentials.temporaryPassword || '');
                    toast.success('Password copied!');
                  }}>
                    <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                  </Button>
                )}
              </div>
            </div>

            <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-amber-950">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                Next Steps for Student:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800 pl-1">
                <li>Student can log in to the portal at <span className="font-semibold underline">/login</span>.</li>
                <li>Use either canonical enrollment number or username with the temporary password.</li>
                <li>Student will be prompted to update password and verify profile details upon first sign-in.</li>
              </ul>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                className="bg-black text-white hover:bg-slate-800 text-xs px-6"
                onClick={() => {
                  setCreatedCredentials(null);
                  setOpen(false);
                }}
              >
                Done & Close
              </Button>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-2">
            {/* Personal Details */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">1. Personal Details</h4>
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">First Name*</FormLabel>
                    <FormControl><Input placeholder="e.g. Rahul" className="bg-white text-xs" {...field} /></FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">Last Name*</FormLabel>
                    <FormControl><Input placeholder="e.g. Sharma" className="bg-white text-xs" {...field} /></FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">Institutional Email*</FormLabel>
                    <FormControl><Input type="email" placeholder="rahul.sharma@institution.edu" className="bg-white text-xs" {...field} /></FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">Phone Number*</FormLabel>
                    <FormControl><Input type="tel" placeholder="+91 9876543210" className="bg-white text-xs" {...field} /></FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">Date of Birth*</FormLabel>
                    <FormControl><Input type="date" className="bg-white text-xs" {...field} /></FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )} />
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">Gender*</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger className="bg-white text-xs"><SelectValue placeholder="Select Gender" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )} />
                <FormField control={form.control} name="bloodGroup" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">Blood Group</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger className="bg-white text-xs"><SelectValue placeholder="Blood Group" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>

              {/* Address with Controlled Indian State/City */}
              <div className="pt-2 border-t border-slate-200/60 space-y-3">
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">Street Address</FormLabel>
                    <FormControl><Input placeholder="Flat/House No, Building, Street" className="bg-white text-xs" {...field} /></FormControl>
                  </FormItem>
                )} />
                <div className="grid grid-cols-3 gap-3">
                  <FormField control={form.control} name="state" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700">State (India)</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(val) => {
                          field.onChange(val);
                          const firstCity = INDIAN_STATES_CITIES[val]?.[0] || '';
                          form.setValue('city', firstCity);
                        }}
                      >
                        <FormControl><SelectTrigger className="bg-white text-xs"><SelectValue placeholder="Select State" /></SelectTrigger></FormControl>
                        <SelectContent className="max-h-56">
                          {INDIAN_STATES.map((st) => (
                            <SelectItem key={st} value={st}>{st}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700">City</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl><SelectTrigger className="bg-white text-xs"><SelectValue placeholder="Select City" /></SelectTrigger></FormControl>
                        <SelectContent className="max-h-56">
                          {availableCities.map((ct) => (
                            <SelectItem key={ct} value={ct}>{ct}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="pincode" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700">Pincode</FormLabel>
                      <FormControl><Input placeholder="400001" className="bg-white text-xs" {...field} /></FormControl>
                    </FormItem>
                  )} />
                </div>
              </div>
            </div>

            {/* Academic Placement */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                <Building2 className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                2. Academic Program & Batch Assignment
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="departmentId" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">Department*</FormLabel>
                    <Select
                      disabled={isLoadingDepts}
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val);
                        const match = departments.find((d: any) => String(d.id) === val);
                        form.setValue('department', match?.name || '');
                        form.setValue('programId', '');
                        form.setValue('program', '');
                        form.setValue('batchId', '');
                        form.setValue('batch', '');
                      }}
                    >
                      <FormControl><SelectTrigger className="bg-white text-xs"><SelectValue placeholder="Select Department" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {departments.map((d: any) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            {d.name} ({d.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )} />

                <FormField control={form.control} name="programId" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">Program (Degree)</FormLabel>
                    <Select
                      disabled={isLoadingPrograms || !selectedDepartmentId}
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val);
                        const match = programs.find((p: any) => String(p.id) === val);
                        form.setValue('program', match?.name || '');
                        form.setValue('batchId', '');
                        form.setValue('batch', '');
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white text-xs">
                          <SelectValue placeholder={!selectedDepartmentId ? 'Select Department First' : 'Select Program'} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {programs.map((p: any) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.name} [{p.degree || p.code}]
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <FormField control={form.control} name="batchId" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">Batch Cohort*</FormLabel>
                    <Select
                      disabled={isLoadingBatches}
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val);
                        const match = batches.find((b: any) => String(b.id) === val);
                        form.setValue('batch', match?.name || '');
                      }}
                    >
                      <FormControl><SelectTrigger className="bg-white text-xs"><SelectValue placeholder="Select Batch" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {batches.map((b: any) => (
                          <SelectItem key={b.id} value={String(b.id)}>
                            {b.name} ({b.admissionYear || ''})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )} />

                <FormField control={form.control} name="academicYearId" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">Academic Year</FormLabel>
                    <Select
                      disabled={isLoadingAY}
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val);
                        form.setValue('semesterId', '');
                      }}
                    >
                      <FormControl><SelectTrigger className="bg-white text-xs"><SelectValue placeholder="Select AY" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {academicYears.map((ay: any) => (
                          <SelectItem key={ay.id} value={String(ay.id)}>
                            {formatAcademicYearLabel(ay)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />

                <FormField control={form.control} name="semesterId" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">Initial Semester</FormLabel>
                    <Select
                      disabled={isLoadingSemesters}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl><SelectTrigger className="bg-white text-xs"><SelectValue placeholder="Select Semester" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {semesters.map((s: any) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.name || `Semester ${s.semesterNumber || s.id}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <FormField control={form.control} name="enrollmentDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">Enrollment Date*</FormLabel>
                    <FormControl><Input type="date" className="bg-white text-xs" {...field} /></FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )} />
                <div className="flex flex-col justify-end text-[11px] text-slate-500 pb-2">
                  <p className="font-medium text-slate-700">Identity Generation:</p>
                  <p>Canonical format <span className="font-mono font-bold text-slate-900">ENR-YYYY-XXXXX</span> will be generated atomically upon submission.</p>
                </div>
              </div>
            </div>

            {/* Guardian Linkage */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                <Users className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                3. Parent / Guardian Association
              </h4>

              <FormField control={form.control} name="guardianOption" render={({ field }) => (
                <FormItem>
                  <div className="flex space-x-4 text-xs">
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={field.value === 'NONE'}
                        onChange={() => field.onChange('NONE')}
                        className="text-slate-900 focus:ring-slate-800"
                      />
                      <span>No Guardian Right Now</span>
                    </label>
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={field.value === 'EXISTING'}
                        onChange={() => field.onChange('EXISTING')}
                        className="text-slate-900 focus:ring-slate-800"
                      />
                      <span>Link Existing Guardian Account</span>
                    </label>
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={field.value === 'NEW'}
                        onChange={() => field.onChange('NEW')}
                        className="text-slate-900 focus:ring-slate-800"
                      />
                      <span>Register New Guardian</span>
                    </label>
                  </div>
                </FormItem>
              )} />

              {guardianOption === 'EXISTING' && (
                <FormField control={form.control} name="guardianId" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">Select Guardian Account*</FormLabel>
                    <Select
                      disabled={isLoadingGuardians}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white text-xs">
                          <SelectValue placeholder={isLoadingGuardians ? 'Loading guardians...' : 'Search & Select Guardian'} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-56">
                        {guardians.map((g: any) => (
                          <SelectItem key={g.id} value={String(g.id)}>
                            {g.firstName} {g.lastName} ({g.relationship || 'Guardian'}) - {g.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-slate-500">
                      Reusing an existing guardian links this student as an additional ward under their authenticated account.
                    </p>
                  </FormItem>
                )} />
              )}

              {guardianOption === 'NEW' && (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="guardianFirstName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-700">Guardian First Name*</FormLabel>
                        <FormControl><Input placeholder="Parent's First Name" className="bg-white text-xs" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="guardianLastName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-700">Guardian Last Name*</FormLabel>
                        <FormControl><Input placeholder="Parent's Last Name" className="bg-white text-xs" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <FormField control={form.control} name="guardianEmail" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-700">Guardian Email*</FormLabel>
                        <FormControl><Input type="email" placeholder="parent@example.com" className="bg-white text-xs" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="guardianPhone" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-700">Guardian Phone*</FormLabel>
                        <FormControl><Input type="tel" placeholder="+91 9123456789" className="bg-white text-xs" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="guardianRelationship" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-700">Relationship*</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl><SelectTrigger className="bg-white text-xs"><SelectValue placeholder="Relationship" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="FATHER">Father</SelectItem>
                            <SelectItem value="MOTHER">Mother</SelectItem>
                            <SelectItem value="LEGAL_GUARDIAN">Legal Guardian</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end space-x-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {mutation.isPending ? 'Enrolling...' : 'Complete Enrollment & Provision'}
              </Button>
            </div>
          </form>
        </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}