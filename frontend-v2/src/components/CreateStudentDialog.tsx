import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { toast } from 'sonner';
import { Loader2, PlusCircle } from 'lucide-react';
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
import { Input } from './ui/input';
import { Button } from './ui/button';

const studentSchema = z.object({
  rollNumber: z.string().max(50, "Roll number cannot exceed 50 characters").optional(),
  firstName: z.string().min(1, "First name is required").max(100, "First name cannot exceed 100 characters"),
  lastName: z.string().min(1, "Last name is required").max(100, "Last name cannot exceed 100 characters"),
  email: z.string().email("Invalid email address").max(150, "Email cannot exceed 150 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(20, "Phone number cannot exceed 20 digits"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  department: z.string().min(1, "Department is required"),
  program: z.string().optional(),
  batch: z.string().min(1, "Batch is required"),
  enrollmentDate: z.string().min(1, "Enrollment date is required"),
  status: z.enum(['ACTIVE', 'INACTIVE', 'GRADUATED', 'DROPOUT', 'SUSPENDED']).default('ACTIVE'),
});



type FormValues = z.infer<typeof studentSchema>;

export function CreateStudentDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      rollNumber: '',
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      department: '',
      program: '',
      batch: '',
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE' as const,
    } as FormValues,
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/api/v1/students', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student created successfully!');
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to create student');
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2 bg-red-50 text-primary hover:bg-red-100 hover:text-primary rounded-xl" aria-label="Add New Student">
          <PlusCircle className="w-4 h-4 text-primary" />
          <span>Add New Student</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Create a new student record in the system.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem><FormLabel>First Name*</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem><FormLabel>Last Name*</FormLabel><FormControl><Input placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email*</FormLabel><FormControl><Input type="email" placeholder="john.doe@example.com" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Phone*</FormLabel><FormControl><Input type="tel" placeholder="+1234567890" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="rollNumber" render={({ field }) => (
                <FormItem><FormLabel>Roll Number</FormLabel><FormControl><Input placeholder="CS24001" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                <FormItem><FormLabel>Date of Birth*</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem><FormLabel>Gender*</FormLabel><FormControl><Input placeholder="MALE/FEMALE/OTHER" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="bloodGroup" render={({ field }) => (
                <FormItem><FormLabel>Blood Group</FormLabel><FormControl><Input placeholder="O+" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="123 Main St" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="City" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="state" render={({ field }) => (
                <FormItem><FormLabel>State</FormLabel><FormControl><Input placeholder="State" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="pincode" render={({ field }) => (
                <FormItem><FormLabel>Pincode</FormLabel><FormControl><Input placeholder="123456" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="department" render={({ field }) => (
                <FormItem><FormLabel>Department*</FormLabel><FormControl><Input placeholder="Computer Science" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="program" render={({ field }) => (
                <FormItem><FormLabel>Program</FormLabel><FormControl><Input placeholder="B.Tech" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="batch" render={({ field }) => (
                <FormItem><FormLabel>Batch*</FormLabel><FormControl><Input placeholder="2024-2028" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="enrollmentDate" render={({ field }) => (
                <FormItem><FormLabel>Enrollment Date*</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <Button type="submit" className="w-full mt-6" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mutation.isPending ? 'Saving...' : 'Create Student'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}