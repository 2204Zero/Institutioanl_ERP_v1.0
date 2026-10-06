import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { toast } from 'sonner';
import { Loader2, PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from './ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from './ui/form';
import { Input } from './ui/input';
import { Button } from './ui/button';
const invoiceSchema = z.object({
    studentId: z.coerce.number().min(1, "Student ID is required"),
    amount: z.coerce.number().min(1, "Amount must be greater than 0"),
    dueDate: z.string().min(10, "Due Date is required"),
    description: z.string().min(2, "Description is required"),
});
export function CreateInvoiceDialog() {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const form = useForm({
        resolver: zodResolver(invoiceSchema),
        defaultValues: {
            studentId: 0,
            amount: 0,
            dueDate: '',
            description: 'Tuition Fee - Fall 2026',
        },
    });
    const mutation = useMutation({
        mutationFn: async (data) => {
            const res = await apiClient.post('/finance/fees', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fees'] });
            toast.success('Invoice created successfully!');
            form.reset();
            setOpen(false);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create invoice');
        },
    });
    const onSubmit = (data) => {
        mutation.mutate(data);
    };
    return (<Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2 bg-red-50 text-primary hover:bg-red-100 hover:text-primary rounded-xl">
          <PlusCircle className="w-4 h-4 text-primary"/>
          <span>Create Invoice</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Generate Fee Invoice</DialogTitle>
          <DialogDescription>
            Issue a new fee request to a student.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="studentId" render={({ field }) => (<FormItem>
                  <FormLabel>Student ID</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="123" {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>
            <FormField control={form.control} name="amount" render={({ field }) => (<FormItem>
                  <FormLabel>Amount ($)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1500" {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>
            <FormField control={form.control} name="dueDate" render={({ field }) => (<FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>
            <FormField control={form.control} name="description" render={({ field }) => (<FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Tuition Fee" {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>
            <Button type="submit" className="w-full mt-6" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
              {mutation.isPending ? 'Generating...' : 'Create Invoice'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>);
}
