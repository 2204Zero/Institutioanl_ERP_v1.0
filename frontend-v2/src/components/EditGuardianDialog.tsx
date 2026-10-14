import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { toast } from 'sonner';
import { Loader2, Users, ShieldCheck } from 'lucide-react';
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

const editGuardianSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  relation: z.string().min(1, 'Relationship is required'),
  email: z.string().email('Invalid email address').max(150),
  phone: z.string().min(8, 'Phone number must be at least 8 digits').max(20),
  occupation: z.string().optional(),
  address: z.string().optional(),
});

type FormValues = z.infer<typeof editGuardianSchema>;

interface EditGuardianDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guardian: {
    id: number;
    firstName?: string;
    lastName?: string;
    name?: string;
    relation?: string;
    relationship?: string;
    email?: string;
    phone?: string;
    occupation?: string;
    address?: string;
    userId?: number;
  };
  studentId?: number;
  onSuccess?: () => void;
}

export function EditGuardianDialog({
  open,
  onOpenChange,
  guardian,
  studentId,
  onSuccess,
}: EditGuardianDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(editGuardianSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      relation: 'FATHER',
      email: '',
      phone: '',
      occupation: '',
      address: '',
    },
  });

  useEffect(() => {
    if (guardian && open) {
      let fName = guardian.firstName || '';
      let lName = guardian.lastName || '';
      if (!fName && guardian.name) {
        const parts = guardian.name.split(' ');
        fName = parts[0] || '';
        lName = parts.slice(1).join(' ') || '';
      }

      form.reset({
        firstName: fName,
        lastName: lName,
        relation: guardian.relation || guardian.relationship || 'FATHER',
        email: guardian.email || '',
        phone: guardian.phone || '',
        occupation: guardian.occupation || '',
        address: guardian.address || '',
      });
    }
  }, [guardian, open, form]);

  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        relation: values.relation.trim().toUpperCase(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone.trim(),
        occupation: values.occupation?.trim() || undefined,
        address: values.address?.trim() || undefined,
      };
      const res = await apiClient.put(`/api/v1/guardians/${guardian.id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Guardian profile updated successfully! All linked student records synchronized.');
      queryClient.invalidateQueries({ queryKey: ['student-guardians'] });
      queryClient.invalidateQueries({ queryKey: ['guardians'] });
      if (studentId) {
        queryClient.invalidateQueries({ queryKey: ['student', String(studentId)] });
      }
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Failed to update guardian profile.';
      toast.error(msg);
    },
  });

  const onSubmit = (values: FormValues) => {
    updateMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-lg font-bold text-slate-900">
            <Users className="w-5 h-5 mr-2 text-slate-700" />
            Edit Guardian Profile
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Update contact details and relationship info for {guardian.name || `${guardian.firstName} ${guardian.lastName}`}. Changes synchronize across all linked wards.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">First Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ramesh" className="text-xs h-9 bg-white" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">Last Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Mehta" className="text-xs h-9 bg-white" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="relation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">Relationship*</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="text-xs h-9 bg-white">
                          <SelectValue placeholder="Select Relationship" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FATHER">Father</SelectItem>
                        <SelectItem value="MOTHER">Mother</SelectItem>
                        <SelectItem value="GUARDIAN">Guardian</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="occupation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">Occupation</FormLabel>
                    <FormControl>
                      <Input placeholder="Business / Salaried" className="text-xs h-9 bg-white" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">Email Address*</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="guardian@example.com" className="text-xs h-9 bg-white" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">Phone Number*</FormLabel>
                    <FormControl>
                      <Input placeholder="+91 9876543210" className="text-xs h-9 bg-white" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">Residential Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Full residential street address" className="text-xs h-9 bg-white" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-2 text-[11px] text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Multi-ward synchronization active: Edits apply across all linked students sharing this guardian account.</span>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-slate-900 text-white hover:bg-slate-800"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Guardian Changes'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
