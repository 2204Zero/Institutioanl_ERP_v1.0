import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2, PlusCircle, ReceiptText, Search, UserCheck, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../config/api';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useFeeStructures, useAssignFeeStructure, formatCurrency, parseAmount } from '../hooks/queries/useFinance';

const assignFeeSchema = z.object({
  studentId: z.string().min(1, 'Please select a student'),
  feeStructureId: z.string().min(1, 'Please select an approved fee structure'),
  academicYearId: z.string().min(1, 'Please select an academic year'),
});

type FormValues = z.infer<typeof assignFeeSchema>;

export function formatAcademicYearLabel(ay: any): string {
  if (!ay) return 'N/A';
  const name = (ay.name || '').trim();
  if (/^AY[- ]?\d{10,}$/i.test(name)) {
    if (ay.startDate && ay.endDate) {
      const s = new Date(ay.startDate).getFullYear();
      const e = new Date(ay.endDate).getFullYear();
      if (!isNaN(s) && !isNaN(e) && s >= 2000 && s <= 2100) {
        return `AY ${s}-${e} (Record #${ay.id})`;
      }
    }
    return `Unverified Legacy Record #${ay.id}`;
  }
  return name || `Academic Year #${ay.id}`;
}

interface CreateInvoiceDialogProps {
  initialStudentId?: number;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function CreateInvoiceDialog({ initialStudentId, trigger, onSuccess }: CreateInvoiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  
  const { data: feeStructures = [], isLoading: isLoadingStructures } = useFeeStructures({ enabled: open });
  const assignFeeMutation = useAssignFeeStructure();

  // Fetch Academic Years from real persisted records
  const { data: academicYears = [], isLoading: isLoadingAY } = useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/academic-years');
      return res.data || [];
    },
    enabled: open,
  });

  // Fetch Students for searchable selector
  const { data: studentsResponse, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students-selector'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/students?size=200');
      return res.data?.data?.content || res.data?.content || [];
    },
    enabled: open,
  });

  const students: any[] = studentsResponse || [];

  const form = useForm<FormValues>({
    resolver: zodResolver(assignFeeSchema),
    defaultValues: {
      studentId: initialStudentId ? String(initialStudentId) : '',
      feeStructureId: '',
      academicYearId: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        studentId: initialStudentId ? String(initialStudentId) : '',
        feeStructureId: '',
        academicYearId: '',
      });
      setStudentSearch('');
    }
  }, [open, initialStudentId, form]);

  const selectedStudentId = form.watch('studentId');
  const selectedFeeStructureId = form.watch('feeStructureId');
  const selectedStructure = feeStructures.find(s => String(s.id) === String(selectedFeeStructureId));
  const selectedStudent = students.find(st => String(st.id) === String(selectedStudentId));

  const approvedStructures = feeStructures.filter(s => s.active);

  const totalGrossPreview = selectedStructure?.components?.reduce(
    (acc, curr) => acc + parseAmount(curr.amount),
    0
  ) ?? 0;

  const handleStructureChange = (val: string) => {
    form.setValue('feeStructureId', val, { shouldValidate: true });
    const match = feeStructures.find(s => String(s.id) === val);
    if (match?.academicYearId) {
      form.setValue('academicYearId', String(match.academicYearId), { shouldValidate: true });
    }
  };

  const filteredStudents = students.filter(st => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    const fullName = `${st.firstName} ${st.lastName}`.toLowerCase();
    const roll = (st.rollNumber || '').toLowerCase();
    const enr = (st.enrollmentNumber || '').toLowerCase();
    return fullName.includes(q) || roll.includes(q) || enr.includes(q);
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await assignFeeMutation.mutateAsync({
        studentId: Number(data.studentId),
        feeStructureId: Number(data.feeStructureId),
        academicYearId: Number(data.academicYearId),
      });

      toast.success('Fee assigned and invoice generated successfully!');
      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to assign fee structure';
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button className="flex items-center space-x-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-sm font-semibold h-9 px-4">
            <PlusCircle className="w-4 h-4 mr-1.5" />
            <span>Assign Fee / Invoice</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-lg font-bold text-slate-900">
            <ReceiptText className="w-5 h-5 mr-2 text-slate-700" />
            Assign Fee Structure & Generate Invoice
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Assign an approved institutional fee structure to a student with clear selector lookups.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {/* Student Searchable Selector */}
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">Target Student*</FormLabel>
                  {initialStudentId && selectedStudent ? (
                    <div className="flex items-center justify-between p-2.5 bg-slate-100 rounded-lg border border-slate-200">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{selectedStudent.firstName} {selectedStudent.lastName}</p>
                          <p className="text-[11px] text-slate-500">
                            {selectedStudent.enrollmentNumber || selectedStudent.rollNumber || `ID: #${selectedStudent.id}`}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">Preselected</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                        <Input
                          placeholder="Search student by name, roll no, or ENR..."
                          className="pl-8 text-xs h-8 bg-white border-slate-200"
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                        />
                      </div>
                      <Select
                        disabled={isLoadingStudents}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="text-xs bg-slate-50 border-slate-200">
                            <SelectValue placeholder={isLoadingStudents ? 'Loading students...' : 'Choose Student from Directory'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-52">
                          {filteredStudents.length > 0 ? (
                            filteredStudents.map((st: any) => (
                              <SelectItem key={st.id} value={String(st.id)}>
                                <div className="flex items-center justify-between gap-4">
                                  <span className="font-semibold text-slate-900">{st.firstName} {st.lastName}</span>
                                  <span className="text-[11px] text-slate-500 font-mono">
                                    {st.enrollmentNumber ? `[${st.enrollmentNumber}]` : st.rollNumber ? `[${st.rollNumber}]` : `[#${st.id}]`}
                                  </span>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-center text-xs text-slate-500">No matching students found</div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />

            {/* Fee Structure Selector */}
            <FormField
              control={form.control}
              name="feeStructureId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">Fee Structure*</FormLabel>
                  {approvedStructures.length === 0 && !isLoadingStructures ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-[11px] text-amber-800">
                        <p className="font-semibold">No approved fee structures found.</p>
                        <p className="mt-0.5">Please navigate to Finance &gt; Fee Structures to create and approve an active fee structure.</p>
                      </div>
                    </div>
                  ) : (
                    <Select
                      disabled={isLoadingStructures}
                      value={field.value}
                      onValueChange={handleStructureChange}
                    >
                      <FormControl>
                        <SelectTrigger className="text-xs bg-slate-50 border-slate-200">
                          <SelectValue placeholder={isLoadingStructures ? 'Loading structures...' : 'Select an approved fee structure'} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-52">
                        {approvedStructures.map(structure => (
                          <SelectItem key={structure.id} value={String(structure.id)}>
                            <div className="flex items-center justify-between gap-4">
                              <span className="font-medium text-slate-900">{structure.name}</span>
                              <span className="text-xs font-mono text-slate-500">[{structure.code}]</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />

            {/* Component preview */}
            {selectedStructure && (
              <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3.5 space-y-2 text-xs">
                <div className="flex justify-between items-center pb-1 border-b border-slate-200 font-semibold text-slate-700">
                  <span>Fee Components</span>
                  <span className="text-slate-900">{formatCurrency(totalGrossPreview)}</span>
                </div>
                {selectedStructure.components && selectedStructure.components.length > 0 ? (
                  <div className="space-y-1 text-slate-600 max-h-28 overflow-y-auto pr-1">
                    {selectedStructure.components.map(comp => (
                      <div key={comp.id} className="flex justify-between items-center text-[11px]">
                        <span>{comp.feeHeadName || comp.feeHeadCode || `Component #${comp.id}`}</span>
                        <span className="font-medium text-slate-800">{formatCurrency(comp.amount)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic text-[11px]">No components listed in structure</p>
                )}
              </div>
            )}

            {/* Academic Year Dropdown */}
            <FormField
              control={form.control}
              name="academicYearId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-slate-700">Billing Academic Year*</FormLabel>
                  <Select
                    disabled={isLoadingAY}
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="text-xs bg-slate-50 border-slate-200">
                        <SelectValue placeholder={isLoadingAY ? 'Loading academic years...' : 'Select Academic Year'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {academicYears.map((ay: any) => (
                        <SelectItem key={ay.id} value={String(ay.id)}>
                          <span className="font-semibold text-slate-900">{formatAcademicYearLabel(ay)}</span>
                          {ay.isActive && <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded ml-2">Active</span>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-slate-500">
                    Prepopulated automatically from fee structure if defined, or selectable from institutional calendar.
                  </p>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />

            <div className="pt-2 flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
                disabled={assignFeeMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                disabled={assignFeeMutation.isPending || approvedStructures.length === 0}
              >
                {assignFeeMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                )}
                {assignFeeMutation.isPending ? 'Assigning...' : 'Assign & Invoice'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
