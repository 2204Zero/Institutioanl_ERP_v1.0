import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { toast } from 'sonner';
import { Loader2, CalendarPlus } from 'lucide-react';
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

const attendanceSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  date: z.string().min(10, "Date is required"),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
  remarks: z.string().optional(),
});

type FormValues = z.infer<typeof attendanceSchema>;

export function TakeAttendanceDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormValues, any, FormValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      studentId: '',
      date: new Date().toISOString().split('T')[0],
      status: 'PRESENT',
      remarks: '',
    } as FormValues,
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/api/v1/attendance', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Attendance recorded successfully!');
      form.reset();
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to record attendance');
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate({ ...data, studentId: Number(data.studentId) });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2">
          <CalendarPlus className="w-4 h-4" />
          <span>Take Attendance</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Take Attendance</DialogTitle>
          <DialogDescription>
            Record attendance for a student.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student ID</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status (PRESENT / ABSENT / LATE / EXCUSED)</FormLabel>
                  <FormControl>
                    <Input placeholder="PRESENT" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Doctor appointment" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full mt-6" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mutation.isPending ? 'Saving...' : 'Save Attendance'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}