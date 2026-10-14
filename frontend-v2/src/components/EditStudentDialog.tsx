import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { toast } from 'sonner';
import { Loader2, GraduationCap, User, Phone, Lock, ShieldCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import type { Student } from '../types/student';

const editStudentSchema = z.object({
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
  programId: z.string().optional(),
  batchId: z.string().min(1, "Batch is required"),
});

type FormValues = z.infer<typeof editStudentSchema>;

interface EditStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student;
}

function formatDateForInput(val: any): string {
  if (!val) return '';
  if (Array.isArray(val)) {
    const y = val[0];
    const m = String(val[1] || 1).padStart(2, '0');
    const d = String(val[2] || 1).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof val === 'string') {
    return val.split('T')[0];
  }
  return '';
}

export function EditStudentDialog({ open, onOpenChange, student }: EditStudentDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(editStudentSchema),
    defaultValues: {
      firstName: student?.firstName || '',
      lastName: student?.lastName || '',
      email: student?.email || '',
      phone: student?.phone || '',
      dateOfBirth: formatDateForInput(student?.dateOfBirth),
      gender: student?.gender || 'MALE',
      bloodGroup: student?.bloodGroup || 'O+',
      address: student?.address || '',
      state: student?.state || 'Maharashtra',
      city: student?.city || 'Mumbai',
      pincode: student?.pincode || '',
      departmentId: student?.departmentId ? String(student.departmentId) : '',
      programId: student?.programId ? String(student.programId) : '',
      batchId: student?.batchId ? String(student.batchId) : '',
    },
  });

  const selectedDepartmentId = form.watch('departmentId');
  const selectedProgramId = form.watch('programId');
  const selectedState = form.watch('state');

  // Fetch Departments
  const { data: departments = [], isLoading: isLoadingDepts } = useQuery<any[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/departments');
      return res.data || [];
    },
    enabled: open,
  });

  // Fetch Programs filtered by departmentId
  const { data: programs = [], isLoading: isLoadingPrograms } = useQuery<any[]>({
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
  const { data: batches = [], isLoading: isLoadingBatches } = useQuery<any[]>({
    queryKey: ['batches', selectedProgramId],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/batches', {
        params: selectedProgramId ? { programId: selectedProgramId } : undefined,
      });
      return res.data || [];
    },
    enabled: open,
  });

  // When student or dialog opens, populate form and resolve relationship IDs if missing
  useEffect(() => {
    if (open && student) {
      const dob = formatDateForInput(student.dateOfBirth);
      
      let deptId = student.departmentId ? String(student.departmentId) : '';
      if (!deptId && departments.length > 0 && student.department) {
        const foundDept = departments.find(d => 
          d.name?.toLowerCase() === student.department?.toLowerCase() ||
          d.code?.toLowerCase() === student.department?.toLowerCase()
        );
        if (foundDept) deptId = String(foundDept.id);
      }

      let progId = student.programId ? String(student.programId) : '';
      if (!progId && programs.length > 0 && student.program) {
        const foundProg = programs.find(p => 
          p.name?.toLowerCase() === student.program?.toLowerCase() ||
          p.code?.toLowerCase() === student.program?.toLowerCase()
        );
        if (foundProg) progId = String(foundProg.id);
      }

      let bId = student.batchId ? String(student.batchId) : '';
      if (!bId && batches.length > 0 && student.batch) {
        const foundBatch = batches.find(b => 
          b.name?.toLowerCase() === student.batch?.toLowerCase()
        );
        if (foundBatch) bId = String(foundBatch.id);
      }

      form.reset({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        email: student.email || '',
        phone: student.phone || '',
        dateOfBirth: dob,
        gender: student.gender || 'MALE',
        bloodGroup: student.bloodGroup || 'O+',
        address: student.address || '',
        state: student.state || 'Maharashtra',
        city: student.city || 'Mumbai',
        pincode: student.pincode || '',
        departmentId: deptId || form.getValues('departmentId') || '',
        programId: progId || form.getValues('programId') || '',
        batchId: bId || form.getValues('batchId') || '',
      });
    }
  }, [open, student, departments, programs, batches, form]);

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const selectedDept = departments.find(d => String(d.id) === String(data.departmentId));
      const selectedProg = programs.find(p => String(p.id) === String(data.programId));
      const selectedBatch = batches.find(b => String(b.id) === String(data.batchId));

      const payload = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        bloodGroup: data.bloodGroup || null,
        address: data.address?.trim() || null,
        state: data.state || null,
        city: data.city?.trim() || null,
        pincode: data.pincode?.trim() || null,
        department: selectedDept ? selectedDept.name : student.department,
        departmentId: selectedDept ? Number(selectedDept.id) : student.departmentId,
        program: selectedProg ? selectedProg.name : (student.program || null),
        programId: selectedProg ? Number(selectedProg.id) : student.programId,
        batch: selectedBatch ? selectedBatch.name : student.batch,
        batchId: selectedBatch ? Number(selectedBatch.id) : student.batchId,
        enrollmentDate: formatDateForInput(student.enrollmentDate) || new Date().toISOString().split('T')[0],
        status: student.status,
      };

      const res = await apiClient.put(`/api/v1/students/${student.id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Student profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['student', String(student.id)] });
      queryClient.invalidateQueries({ queryKey: ['student', Number(student.id)] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.message || 'Failed to update student profile';
      toast.error(msg);
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  const citiesForState = selectedState && INDIAN_STATES_CITIES[selectedState] ? INDIAN_STATES_CITIES[selectedState] : [];
  const currentCity = form.watch('city');
  const cityOptions = [...citiesForState];
  if (currentCity && !cityOptions.includes(currentCity)) {
    cityOptions.unshift(currentCity);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <User className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Edit Student Profile</DialogTitle>
                <DialogDescription>
                  Update personal, contact, and academic details for {student.firstName} {student.lastName}.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Immutable Identifiers Notice */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-2">
          <div className="flex items-center space-x-1.5 font-semibold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Protected Immutable Identifiers</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-slate-200">
              <span className="text-slate-500">Student ID:</span>
              <span className="font-mono font-bold text-slate-800">#{student.id}</span>
            </div>
            <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-slate-200">
              <span className="text-slate-500">Canonical ENR:</span>
              <span className="font-mono font-bold text-blue-700">{student.enrollmentNumber || 'Pending'}</span>
            </div>
            <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-slate-200">
              <span className="text-slate-500">Roll Number:</span>
              <span className="font-mono font-bold text-slate-800">{student.rollNumber || 'None'}</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 italic">
            <Lock className="w-3 h-3 inline mr-1 text-slate-400" />
            Internal identifiers, enrollment records, account linkages, and guardian associations are strictly preserved.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Section 1: Basic Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 border-b pb-1">
                <User className="w-4 h-4 text-indigo-600" /> Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name <span className="text-rose-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Aarav" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name <span className="text-rose-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Sharma" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth <span className="text-rose-500">*</span></FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender <span className="text-rose-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bloodGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Group</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || 'O+'}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Blood Group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                            <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section 2: Contact Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 border-b pb-1">
                <Phone className="w-4 h-4 text-emerald-600" /> Contact & Communication
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address <span className="text-rose-500">*</span></FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="student@university.edu" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number <span className="text-rose-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="+91 9876543210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <Select 
                        onValueChange={(val) => {
                          field.onChange(val);
                          const newCities = INDIAN_STATES_CITIES[val] || [];
                          const curCity = form.getValues('city');
                          if (curCity && !newCities.includes(curCity)) {
                            form.setValue('city', newCities[0] || '');
                          }
                        }} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select State" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {INDIAN_STATES.map((state) => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      {cityOptions.length > 0 ? (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select City" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cityOptions.map((city) => (
                              <SelectItem key={city} value={city}>{city}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <FormControl>
                          <Input placeholder="Enter City" {...field} />
                        </FormControl>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pincode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code (PIN)</FormLabel>
                      <FormControl>
                        <Input placeholder="400001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Apartment / Flat, Street, Area" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Section 3: Academic Relationships */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 border-b pb-1">
                <GraduationCap className="w-4 h-4 text-purple-600" /> Academic Placement
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department <span className="text-rose-500">*</span></FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          form.setValue('programId', '');
                          form.setValue('batchId', '');
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingDepts ? "Loading departments..." : "Select Department"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((dept: any) => (
                            <SelectItem key={dept.id} value={String(dept.id)}>
                              {dept.name} {dept.code ? `(${dept.code})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="programId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Degree Program</FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          form.setValue('batchId', '');
                        }}
                        value={field.value}
                        disabled={isLoadingPrograms}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingPrograms ? "Loading programs..." : "Select Program"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {programs.map((prog: any) => (
                            <SelectItem key={prog.id} value={String(prog.id)}>
                              {prog.name} {prog.code ? `(${prog.code})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="batchId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Academic Batch <span className="text-rose-500">*</span></FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoadingBatches}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingBatches ? "Loading batches..." : "Select Batch"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {batches.map((batch: any) => (
                            <SelectItem key={batch.id} value={String(batch.id)}>
                              {batch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
