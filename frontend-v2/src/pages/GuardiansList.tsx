import React from 'react';
import { Search, Loader2, UserSquare2, Phone, MoreHorizontal, Trash, Edit, Mail } from 'lucide-react';
import { apiClient } from '../config/api';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { GuardianResponseDto } from '../types/guardian';
import { CreateGuardianDialog } from '../components/CreateGuardianDialog';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export default function GuardiansList() {
  const queryClient = useQueryClient();

  const { data: responseData, isLoading, isError } = useQuery({
    queryKey: ['guardians'],
    queryFn: async () => {
      const res = await apiClient.get('/guardians');
      return res.data;
    }
  });

  // The backend wraps Guardian responses in ApiResponse.success(data)
  const guardians: GuardianResponseDto[] = responseData?.data || [];

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/guardians/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardians'] });
      toast.success('Guardian deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete guardian');
    }
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Guardians Directory</h1>
          <p className="text-slate-500 text-sm">Manage parents and emergency contacts globally.</p>
        </div>
        <CreateGuardianDialog />
      </div>

      <div className="bg-white p-4 rounded-t-2xl border-b border-slate-100 flex justify-between items-center shadow-sm mt-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              type="text" 
              placeholder="Search guardians..." 
              className="pl-9 pr-4 py-2 bg-slate-50 border-slate-200 rounded-lg text-sm w-72 h-10"
            />
          </div>
        </div>
        <div className="text-sm text-slate-500 font-medium">
          {guardians.length || 0} guardians
        </div>
      </div>

      <div className="bg-white rounded-b-2xl shadow-sm border border-slate-100 border-t-0">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold px-6 py-4">Guardian Name</TableHead>
              <TableHead className="font-semibold px-6 py-4">Contact Info</TableHead>
              <TableHead className="font-semibold px-6 py-4">Relation</TableHead>
              <TableHead className="font-semibold px-6 py-4">Emergency</TableHead>
              <TableHead className="font-semibold px-6 py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                  <div className="flex justify-center items-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-destructive">Failed to load guardians.</TableCell>
              </TableRow>
            ) : guardians.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">No guardians found.</TableCell>
              </TableRow>
            ) : (
              guardians.map((guardian) => (
                <TableRow key={guardian.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center">
                        <UserSquare2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{guardian.fullName}</div>
                        {guardian.occupation && <div className="text-xs text-slate-400">{guardian.occupation}</div>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center text-slate-600 text-sm">
                        <Phone className="w-3 h-3 mr-2 text-slate-400" />
                        {guardian.phone}
                      </div>
                      {guardian.email && (
                        <div className="flex items-center text-slate-500 text-xs">
                          <Mail className="w-3 h-3 mr-2 text-slate-400" />
                          {guardian.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600">
                      {guardian.relation}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {guardian.isEmergencyContact ? (
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                        Emergency
                      </span>
                    ) : (
                      <span className="text-slate-300 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-700">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="cursor-pointer" onClick={() => toast.info('Edit mode not fully implemented yet')}>
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={() => {
                          if(window.confirm('Are you sure you want to delete this guardian?')) deleteMutation.mutate(guardian.id);
                        }}>
                          <Trash className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
