import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { toast } from 'sonner';
import { Loader2, PlusCircle, UserPlus } from 'lucide-react';
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
import { Checkbox } from './ui/checkbox';
import type { GuardianRequestDto } from '../types/guardian';

const guardianSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  relation: z.string().min(2, "Relation is required"),
  phone: z.string().min(10, "Valid phone required"),
  email: z.string().email("Invalid email").optional().or(z.literal('')),
  occupation: z.string().optional(),
  address: z.string().optional(),
  isEmergencyContact: z.boolean().default(false),
});

type FormValues = z.infer<typeof guardianSchema>;

export function CreateGuardianDialog({
  studentId,
  triggerClassName,
  size,
}: {
  studentId?: number;
  triggerClassName?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(guardianSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      relation: 'FATHER',
      phone: '',
      email: '',
      occupation: '',
      address: '',
      isEmergencyContact: false,
    } as FormValues,
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const payload: GuardianRequestDto = { ...data, studentId };
      if (studentId) {
        const res = await apiClient.post(`/api/v1/students/${studentId}/guardians`, payload);
        return res.data;
      } else {
        const res = await apiClient.post('/api/v1/guardians', payload);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardians'] });
      if (studentId) queryClient.invalidateQueries({ queryKey: ['student-guardians', studentId] });
      toast.success('Guardian created successfully!');
      form.reset();
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create guardian');
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size={size || (studentId ? 'sm' : 'default')}
          className={
            triggerClassName ||
            'flex items-center space-x-2 bg-red-50 text-primary hover:bg-red-100 hover:text-primary rounded-xl'
          }
        >
          {studentId ? <UserPlus className="w-4 h-4 text-primary" /> : <PlusCircle className="w-4 h-4 text-primary" />}
          <span>{studentId ? 'Add Guardian' : 'Register New Guardian'}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{studentId ? 'Link New Guardian' : 'Register Guardian'}</DialogTitle>
          <DialogDescription>
            {studentId 
              ? 'Add a new parent or emergency contact for this student.' 
              : 'Register a new guardian in the system database.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Rajesh" {...field} />
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
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Sharma" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="relation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relation</FormLabel>
                    <FormControl>
                      <Input placeholder="FATHER" {...field} />
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
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+919876543210" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="rajesh@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="occupation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Occupation (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Civil Engineer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isEmergencyContact"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Emergency Contact
                    </FormLabel>
                    <DialogDescription className="text-xs">
                      Check if this guardian should be prioritized in emergencies.
                    </DialogDescription>
                  </div>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full mt-6" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mutation.isPending ? 'Saving...' : 'Save Guardian'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
