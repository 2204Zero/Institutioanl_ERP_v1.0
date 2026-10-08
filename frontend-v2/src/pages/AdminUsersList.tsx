import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { PageFrame } from '../components/ui/PageFrame';
import { Input } from '../components/ui/input';

import { Search, Loader2, Mail, ShieldAlert } from 'lucide-react';
import { CreateUserDialog } from '../components/CreateUserDialog';

interface UserSummary {
  username: string;
  email: string;
  role: string;
}

export default function AdminUsersList() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: users, isLoading } = useQuery<UserSummary[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/admin/users');
      return res.data || [];
    }
  });

  const filteredUsers = users?.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageFrame
      title="System Access & Users"
      description="Manage institutional accounts and roles."
      breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'System Access' }]}
      actions={
        <CreateUserDialog />
      }
    >
      <div className="border border-slate-200 bg-white">
        {/* Toolbar */}
        <div className="p-3 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center bg-slate-50">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by username, email, or role..." 
              className="pl-9 h-8 text-xs border-slate-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-3 py-2 border-r border-slate-200/50">Username</th>
                <th className="px-3 py-2 border-r border-slate-200/50">Email</th>
                <th className="px-3 py-2 border-r border-slate-200/50">Assigned Role</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13px]">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400 mx-auto" />
                  </td>
                </tr>
              ) : filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((user, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2 font-semibold text-slate-900 border-r border-slate-100/50">
                      {user.username}
                    </td>
                    <td className="px-3 py-2 text-slate-600 border-r border-slate-100/50">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{user.email}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 border-r border-slate-100/50">
                      <div className="flex items-center space-x-1.5">
                        <ShieldAlert className="w-3 h-3 text-slate-400" />
                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 text-[11px] font-bold tracking-wide uppercase">
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className="text-[11px] text-slate-400 italic">No actions available</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-slate-500">
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageFrame>
  );
}