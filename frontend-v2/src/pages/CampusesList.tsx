
import { Search, Loader2, MapPin, MoreHorizontal, Trash, Edit } from 'lucide-react';
import { apiClient } from '../config/api';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CampusResponse } from '../types/institution';
import { CreateCampusDialog } from '../components/CreateCampusDialog';
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

export default function CampusesList() {
  const queryClient = useQueryClient();

  const { data: campuses, isLoading, isError } = useQuery<CampusResponse[]>({
    queryKey: ['campuses'],
    queryFn: async () => {
      // NOTE: Using backend typo '/campuss'
      const res = await apiClient.get('/api/v1/campuses');
      return res.data || [];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/api/v1/campuss/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campuses'] });
      toast.success('Campus deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete campus');
    }
  });

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Campuses</h1>
          <p className="text-slate-500 text-sm">Manage physical campus locations.</p>
        </div>
        <CreateCampusDialog />
      </div>

      <div className="bg-white p-4 rounded-t-2xl border-b border-slate-100 flex justify-between items-center shadow-sm mt-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              type="text" 
              placeholder="Search campuses..." 
              className="pl-9 pr-4 py-2 bg-slate-50 border-slate-200 rounded-lg text-sm w-full sm:w-72 h-10"
            />
          </div>
        </div>
        <div className="text-sm text-slate-500 font-medium">
          {campuses?.length || 0} campuses
        </div>
      </div>

      <div className="bg-white rounded-b-2xl shadow-sm border border-slate-100 border-t-0">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold px-6 py-4">Campus Name</TableHead>
              <TableHead className="font-semibold px-6 py-4">Address</TableHead>
              <TableHead className="font-semibold px-6 py-4">Institution ID</TableHead>
              <TableHead className="font-semibold px-6 py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                  <div className="flex justify-center items-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-destructive">Failed to load campuses.</TableCell>
              </TableRow>
            ) : campuses?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-slate-500">No campuses found.<br/><span className="text-sm mt-1 block">Campuses will appear here once they are created.</span></TableCell>
              </TableRow>
            ) : (
              campuses?.map((campus) => (
                <TableRow key={campus.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div className="font-semibold text-slate-900">{campus.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-slate-600">
                    {campus.address}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600">
                      ID: {campus.institutionId}
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
                          if(window.confirm('Are you sure you want to delete this campus?')) deleteMutation.mutate(campus.id);
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






