import { useState } from 'react';
import { Search, Building2, MoreHorizontal, Loader2, Trash, Users, UserPlus, UserMinus, ShieldCheck } from 'lucide-react';
import { apiClient } from '../config/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Department } from '../types/department';
import { CreateDepartmentDialog } from '../components/CreateDepartmentDialog';
import { useFacultyList, useAssignFacultyDepartment } from '../hooks/queries/useAcademics';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

export default function DepartmentsList() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'departments' | 'faculty'>('departments');
  const [search, setSearch] = useState('');
  const [selectedDeptForFaculty, setSelectedDeptForFaculty] = useState<Department | null>(null);
  const [facultyToAssign, setFacultyToAssign] = useState<string>('');

  const { data: departments, isLoading: isLoadingDepts, isError: isErrorDepts } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/departments');
      return res.data || [];
    }
  });

  const { data: facultyList, isLoading: isLoadingFaculty } = useFacultyList();
  const assignFacultyMutation = useAssignFacultyDepartment();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/api/v1/departments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete department (it might have associated students or records)');
    }
  });

  const handleAssignFaculty = (facultyId: number, deptId: number | null) => {
    assignFacultyMutation.mutate({ facultyId, departmentId: deptId }, {
      onSuccess: () => {
        toast.success(deptId ? 'Faculty assigned to department' : 'Faculty unassigned from department');
        setFacultyToAssign('');
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.error || 'Failed to update faculty assignment');
      }
    });
  };

  const filteredDepartments = departments?.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  const filteredFaculty = facultyList?.filter(f =>
    f.firstName.toLowerCase().includes(search.toLowerCase()) ||
    f.lastName.toLowerCase().includes(search.toLowerCase()) ||
    f.email.toLowerCase().includes(search.toLowerCase()) ||
    f.username.toLowerCase().includes(search.toLowerCase()) ||
    (f.departmentName && f.departmentName.toLowerCase().includes(search.toLowerCase()))
  );

  const assignedToCurrentDept = selectedDeptForFaculty && facultyList
    ? facultyList.filter(f => f.departmentId === selectedDeptForFaculty.id)
    : [];

  const unassignedOrOtherFaculty = selectedDeptForFaculty && facultyList
    ? facultyList.filter(f => f.departmentId !== selectedDeptForFaculty.id)
    : [];

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Departments & Faculty</h1>
          <p className="text-slate-500 text-sm">Manage academic departments, view assigned staff, and configure faculty appointments.</p>
        </div>
        <div className="flex items-center gap-3">
          <CreateDepartmentDialog />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="flex border-b border-slate-100 px-6 pt-4 space-x-8">
          <button
            onClick={() => setActiveTab('departments')}
            className={`pb-4 px-2 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'departments' ? 'border-black text-black' : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Departments ({departments?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('faculty')}
            className={`pb-4 px-2 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'faculty' ? 'border-black text-black' : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            Faculty Directory ({facultyList?.length || 0})
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder={activeTab === 'departments' ? 'Search departments by name or code...' : 'Search faculty by name, email, or dept...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border-slate-200 rounded-lg text-sm w-full sm:w-80 h-10"
            />
          </div>
          <div className="text-xs font-medium text-slate-500">
            {activeTab === 'departments' ? `${filteredDepartments?.length || 0} departments` : `${filteredFaculty?.length || 0} faculty members`}
          </div>
        </div>

        {/* Departments View */}
        {activeTab === 'departments' && (
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold px-6 py-4">Department Name</TableHead>
                <TableHead className="font-semibold px-6 py-4">Code</TableHead>
                <TableHead className="font-semibold px-6 py-4">Assigned Faculty</TableHead>
                <TableHead className="font-semibold px-6 py-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingDepts ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                    <div className="flex justify-center items-center">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : isErrorDepts ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-red-500 font-medium">Failed to load departments.</TableCell>
                </TableRow>
              ) : filteredDepartments?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-slate-500">No departments found.</TableCell>
                </TableRow>
              ) : (
                filteredDepartments?.map((dept) => {
                  const facultyCount = facultyList ? facultyList.filter(f => f.departmentId === dept.id).length : 0;
                  return (
                    <TableRow key={dept.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{dept.name}</div>
                            <div className="text-xs text-slate-400">ID #{dept.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 font-medium text-slate-600">
                        <span className="px-2.5 py-1 bg-slate-100 rounded-md text-xs font-semibold uppercase tracking-wider">{dept.code}</span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          facultyCount > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Users className="w-3.5 h-3.5 mr-1" />
                          {facultyCount} {facultyCount === 1 ? 'Faculty' : 'Faculty'}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8 border-slate-200 hover:bg-slate-100 text-slate-700"
                            onClick={() => setSelectedDeptForFaculty(dept)}
                          >
                            <Users className="w-3.5 h-3.5 mr-1 text-slate-500" />
                            Manage Faculty
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label="More options" className="text-slate-400 hover:text-slate-700 h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive text-xs cursor-pointer"
                                onClick={() => {
                                  if (window.confirm(`Delete department "${dept.name}" (${dept.code})?`)) {
                                    deleteMutation.mutate(dept.id);
                                  }
                                }}
                              >
                                <Trash className="w-4 h-4 mr-2" /> Delete Department
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}

        {/* Faculty Directory View */}
        {activeTab === 'faculty' && (
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold px-6 py-4">Faculty Member</TableHead>
                <TableHead className="font-semibold px-6 py-4">Email</TableHead>
                <TableHead className="font-semibold px-6 py-4">Username</TableHead>
                <TableHead className="font-semibold px-6 py-4">Assigned Department</TableHead>
                <TableHead className="font-semibold px-6 py-4 text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingFaculty ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                    <div className="flex justify-center items-center">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredFaculty?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500">No faculty members found.</TableCell>
                </TableRow>
              ) : (
                filteredFaculty?.map((f) => {
                  const currentDeptId = f.departmentId ? String(f.departmentId) : 'unassigned';
                  return (
                    <TableRow key={f.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase tracking-wider">
                            {f.firstName[0]}{f.lastName[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{f.firstName} {f.lastName}</div>
                            <div className="text-xs text-slate-400">ID #{f.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-slate-600 font-medium">
                        {f.email}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-xs font-mono text-slate-500">
                        {f.username}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="w-56">
                          <Select
                            value={currentDeptId}
                            onValueChange={(val) => {
                              const newDeptId = val === 'unassigned' ? null : Number(val);
                              handleAssignFaculty(f.id, newDeptId);
                            }}
                            disabled={assignFacultyMutation.isPending}
                          >
                            <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
                              <SelectValue placeholder="Assign department" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned" className="text-xs text-slate-500">
                                Unassigned
                              </SelectItem>
                              {departments?.map((d) => (
                                <SelectItem key={d.id} value={String(d.id)} className="text-xs">
                                  {d.name} ({d.code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Manage Department Faculty Dialog */}
      <Dialog open={!!selectedDeptForFaculty} onOpenChange={(open) => !open && setSelectedDeptForFaculty(null)}>
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-slate-700" />
              <span>{selectedDeptForFaculty?.name}</span>
              <span className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-600 uppercase font-mono">
                {selectedDeptForFaculty?.code}
              </span>
            </DialogTitle>
            <DialogDescription>
              View currently assigned faculty members or assign additional faculty to this department.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-6 py-4 pr-1">
            {/* Quick Assign Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-slate-500" />
                Assign Faculty to this Department
              </h4>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Select value={facultyToAssign} onValueChange={setFacultyToAssign}>
                    <SelectTrigger className="h-9 text-xs bg-white border-slate-200">
                      <SelectValue placeholder="Select faculty member to assign..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {unassignedOrOtherFaculty.map((f) => (
                        <SelectItem key={f.id} value={String(f.id)} className="text-xs">
                          {f.firstName} {f.lastName} ({f.email}) {f.departmentName ? `— currently in ${f.departmentName}` : '— [Unassigned]'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  size="sm"
                  className="bg-black text-white hover:bg-slate-800 text-xs h-9 px-4 shrink-0"
                  disabled={!facultyToAssign || assignFacultyMutation.isPending}
                  onClick={() => {
                    if (selectedDeptForFaculty && facultyToAssign) {
                      handleAssignFaculty(Number(facultyToAssign), selectedDeptForFaculty.id);
                    }
                  }}
                >
                  {assignFacultyMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <UserPlus className="w-3.5 h-3.5 mr-1" />}
                  Assign
                </Button>
              </div>
            </div>

            {/* Currently Assigned Faculty */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Assigned Faculty Members ({assignedToCurrentDept.length})
                </h4>
              </div>

              {assignedToCurrentDept.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-medium">No faculty members are currently assigned to this department.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Use the selector above to assign faculty.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {assignedToCurrentDept.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase">
                          {f.firstName[0]}{f.lastName[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-xs">{f.firstName} {f.lastName}</div>
                          <div className="text-[11px] text-slate-500">{f.email} â€¢ @{f.username}</div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 text-xs h-7 px-2.5"
                        disabled={assignFacultyMutation.isPending}
                        onClick={() => handleAssignFaculty(f.id, null)}
                      >
                        <UserMinus className="w-3.5 h-3.5 mr-1" />
                        Unassign
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="border-t border-slate-100 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDeptForFaculty(null)}
              className="text-xs"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
