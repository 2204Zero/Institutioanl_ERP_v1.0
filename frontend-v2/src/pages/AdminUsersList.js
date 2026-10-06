import React from 'react';
import { Search, Loader2, MoreHorizontal, Edit, Lock, Ban } from 'lucide-react';
import { apiClient } from '../config/api';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { CreateUserDialog } from '../components/CreateUserDialog';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "../components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "../components/ui/dropdown-menu";
export default function AdminUsersList() {
    const { data: users, isLoading, isError } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const res = await apiClient.get('/admin/users');
            return res.data || [];
        }
    });
    const getRoleBadge = (role) => {
        switch (role) {
            case 'SUPER_ADMIN':
                return 'bg-slate-950 text-white border-red-200';
            case 'ADMIN':
                return 'bg-slate-950 text-white border-red-200';
            case 'FINANCE':
                return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'FACULTY':
                return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'PARENT':
                return 'bg-slate-100 text-slate-700 border-slate-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };
    return (<div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">System Users</h1>
          <p className="text-slate-500 text-sm">Manage access control and user accounts.</p>
        </div>
        <CreateUserDialog />
      </div>

      <div className="bg-white p-4 rounded-t-2xl border-b border-slate-100 flex justify-between items-center shadow-sm mt-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <Input type="text" placeholder="Search by username or email..." className="pl-9 pr-4 py-2 bg-slate-50 border-slate-200 rounded-lg text-sm w-72 h-10"/>
          </div>
        </div>
        <div className="text-sm text-slate-500 font-medium">
          {users?.length || 0} users total
        </div>
      </div>

      <div className="bg-white rounded-b-2xl shadow-sm border border-slate-100 border-t-0">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold px-6 py-4">Username</TableHead>
              <TableHead className="font-semibold px-6 py-4">Email Address</TableHead>
              <TableHead className="font-semibold px-6 py-4">System Role</TableHead>
              <TableHead className="font-semibold px-6 py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (<TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                  <div className="flex justify-center items-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary"/>
                  </div>
                </TableCell>
              </TableRow>) : isError ? (<TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-destructive">Failed to load system users.</TableCell>
              </TableRow>) : users?.length === 0 ? (<TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-slate-500">No users found.</TableCell>
              </TableRow>) : (users?.map((user) => (<TableRow key={user.username} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold uppercase text-slate-600">
                        {user.username.charAt(0)}
                      </div>
                      <div className="font-semibold text-slate-900">{user.username}</div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-slate-600 font-medium">
                    {user.email}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right text-slate-400">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-700">
                          <MoreHorizontal className="w-4 h-4"/>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="cursor-pointer" onClick={() => toast.info('Reset password triggered')}>
                          <Lock className="w-4 h-4 mr-2"/> Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => toast.info('Edit mode not implemented')}>
                          <Edit className="w-4 h-4 mr-2"/> Change Role
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={() => toast.info('Suspend triggered')}>
                          <Ban className="w-4 h-4 mr-2"/> Suspend User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>)))}
          </TableBody>
        </Table>
      </div>
    </div>);
}
