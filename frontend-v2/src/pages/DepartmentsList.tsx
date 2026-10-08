
import { Search, Building2, MoreHorizontal, Loader2, Trash } from 'lucide-react';
import { apiClient } from '../config/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Department } from '../types/department';
import { CreateDepartmentDialog } from '../components/CreateDepartmentDialog';
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

export default function DepartmentsList() {
  const queryClient = useQueryClient();

  const { data: departments, isLoading, isError } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/departments');
      return res.data || [];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/api/v1/departments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete department (it might have associated students)');
    }
  });

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Departments</h1>
          <p className="text-slate-500 text-sm">Manage academic and administrative departments.</p>
        </div>
        <CreateDepartmentDialog />
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-t-2xl border-b border-slate-100 flex justify-between items-center shadow-sm mt-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              type="text" 
              placeholder="Search departments..." 
              className="pl-9 pr-4 py-2 bg-slate-50 border-slate-200 rounded-lg text-sm w-full sm:w-72 h-10"
            />
          </div>
        </div>
        <div className="text-sm text-slate-500 font-medium">
          {departments?.length || 0} departments
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-b-2xl shadow-sm border border-slate-100 border-t-0">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold px-6 py-4">Department Name</TableHead>
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
                <TableCell colSpan={3} className="h-24 text-center text-destructive">Failed to load departments.</TableCell>
              </TableRow>
            ) : departments?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-slate-500">No departments found.<br/><span className="text-sm mt-1 block">Departments will appear here once they are created.</span></TableCell>
              </TableRow>
            ) : (
              departments?.map((dept) => (
                <TableRow key={dept.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="font-semibold text-slate-900">{dept.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 font-medium text-slate-600">
                    <span className="px-2 py-1 bg-slate-100 rounded-md text-xs">{dept.code}</span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="More options" className="text-slate-400 hover:text-slate-700">
                        <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => {
                          if(window.confirm('Delete this department?')) deleteMutation.mutate(dept.id);
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






