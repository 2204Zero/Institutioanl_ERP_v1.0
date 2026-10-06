import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { toast } from 'sonner';
import { Loader2, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from './ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from './ui/form';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "./ui/select";
const userSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.string().min(1, "Role is required"),
});
export function CreateUserDialog() {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const form = useForm({
        resolver: zodResolver(userSchema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
            role: 'STUDENT',
        },
    });
    const mutation = useMutation({
        mutationFn: async (data) => {
            const res = await apiClient.post('/admin/users', data);
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast.success(data?.message || 'User created successfully!');
            form.reset();
            setOpen(false);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create user');
        },
    });
    const onSubmit = (data) => {
        mutation.mutate(data);
    };
    return (<Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2 bg-slate-900 text-white hover:bg-black rounded-xl">
          <UserPlus className="w-4 h-4 text-primary"/>
          <span>Provision New User</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Provision New User</DialogTitle>
          <DialogDescription>
            Create a new system account and assign RBAC permissions.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="username" render={({ field }) => (<FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="jdoe" {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>
            
            <FormField control={form.control} name="email" render={({ field }) => (<FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="jdoe@example.com" {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>

            <FormField control={form.control} name="password" render={({ field }) => (<FormItem>
                  <FormLabel>Temporary Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>

            <FormField control={form.control} name="role" render={({ field }) => (<FormItem>
                  <FormLabel>System Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="STUDENT">Student</SelectItem>
                      <SelectItem value="PARENT">Parent</SelectItem>
                      <SelectItem value="FACULTY">Faculty</SelectItem>
                      <SelectItem value="FINANCE">Finance</SelectItem>
                      <SelectItem value="ADMIN">Administrator</SelectItem>
                      <SelectItem value="SUPER_ADMIN">Super Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>)}/>

            <Button type="submit" className="w-full mt-6" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
              {mutation.isPending ? 'Provisioning...' : 'Create Account'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>);
}
