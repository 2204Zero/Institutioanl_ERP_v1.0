
import { Search, Loader2, Building2, MoreHorizontal, Trash, Edit } from 'lucide-react';
import { apiClient } from '../config/api';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { InstitutionResponse } from '../types/institution';
import { CreateInstitutionDialog } from '../components/CreateInstitutionDialog';
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

export default function InstitutionsList() {
  const queryClient = useQueryClient();

  const { data: institutions, isLoading, isError } = useQuery<InstitutionResponse[]>({
    queryKey: ['institutions'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/institutions');
      return res.data || [];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/api/v1/institutions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
      toast.success('Institution deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete institution');
    }
  });

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Institutions</h1>
          <p className="text-slate-500 text-sm">Manage top-level educational institutions.</p>
        </div>
        <CreateInstitutionDialog />
      </div>

      <div className="bg-white p-4 rounded-t-2xl border-b border-slate-100 flex justify-between items-center shadow-sm mt-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              type="text" 
              placeholder="Search institutions..." 
              className="pl-9 pr-4 py-2 bg-slate-50 border-slate-200 rounded-lg text-sm w-full sm:w-72 h-10"
            />
          </div>
        </div>
        <div className="text-sm text-slate-500 font-medium">
          {institutions?.length || 0} institutions
        </div>
      </div>

      <div className="bg-white rounded-b-2xl shadow-sm border border-slate-100 border-t-0">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold px-6 py-4">Institution Name</TableHead>
              <TableHead className="font-semibold px-6 py-4">Code</TableHead>
              <TableHead className="font-semibold px-6 py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-slate-500">
                  <div className="flex justify-center items-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-destructive">Failed to load institutions.</TableCell>
              </TableRow>
            ) : institutions?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-48 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <Building2 className="w-8 h-8 text-slate-300 mb-2" />
                    <div className="font-medium text-slate-900">No institutions configured yet.</div>
                    <div className="text-sm mt-1">Please add an institution to get started.</div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              institutions?.map((inst) => (
                <TableRow key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div className="font-semibold text-slate-900">{inst.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600">
                      {inst.code}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right text-slate-400">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="More options" className="text-slate-400 hover:text-slate-700">
                        <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="cursor-pointer" onClick={() => toast.info('Edit mode not fully implemented yet')}>
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={() => {
                          if(window.confirm('Are you sure you want to delete this institution?')) deleteMutation.mutate(inst.id);
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






