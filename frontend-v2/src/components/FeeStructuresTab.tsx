import React, { useState } from 'react';
import { 
  PlusCircle, CheckCircle, AlertCircle, Loader2, 
  ReceiptText, Layers 
} from 'lucide-react';
import { 
  useFeeStructures, 
  useFeeHeads, 
  useCreateFeeStructure, 
  useApproveFeeStructure, 
  useAddComponentToFeeStructure,
  useCreateFeeHead,
  formatCurrency, 
  parseAmount,
  type FeeStructure
} from '../hooks/queries/useFinance';
import { usePrograms, useAcademicYears } from '../hooks/queries/useAcademics';
import { formatAcademicYearLabel, formatProgramLabel } from '../lib/academicUtils';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { toast } from 'sonner';

export function FeeStructuresTab() {
  const { data: structures = [], isLoading: isLoadingStructures } = useFeeStructures();
  const { data: feeHeads = [], isLoading: isLoadingHeads } = useFeeHeads();
  const { data: programs = [] } = usePrograms();
  const { data: academicYears = [] } = useAcademicYears();

  const createStructureMutation = useCreateFeeStructure();
  const approveStructureMutation = useApproveFeeStructure();
  const addComponentMutation = useAddComponentToFeeStructure();
  const createFeeHeadMutation = useCreateFeeHead();

  // Create Structure Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [structName, setStructName] = useState('');
  const [structCode, setStructCode] = useState('');
  const [structProgramId, setStructProgramId] = useState('');
  const [structAcademicYearId, setStructAcademicYearId] = useState('');

  // Add Component Modal
  const [activeStructureForComp, setActiveStructureForComp] = useState<FeeStructure | null>(null);
  const [compHeadId, setCompHeadId] = useState('');
  const [compAmount, setCompAmount] = useState('');

  // Create Fee Head Modal
  const [isHeadModalOpen, setIsHeadModalOpen] = useState(false);
  const [headName, setHeadName] = useState('');
  const [headCode, setHeadCode] = useState('');

  const handleCreateStructure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!structName.trim()) {
      toast.error('Structure Name is required.');
      return;
    }
    const code = structCode.trim() || `FS-${Date.now().toString().slice(-6)}`;

    createStructureMutation.mutate({
      name: structName.trim(),
      code,
      programId: structProgramId ? Number(structProgramId) : undefined,
      academicYearId: structAcademicYearId ? Number(structAcademicYearId) : undefined,
    }, {
      onSuccess: () => {
        toast.success(`Fee Structure "${structName}" created successfully!`);
        setIsCreateOpen(false);
        setStructName('');
        setStructCode('');
        setStructProgramId('');
        setStructAcademicYearId('');
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || err.message || 'Failed to create fee structure');
      }
    });
  };

  const handleApprove = (id: number) => {
    approveStructureMutation.mutate(id, {
      onSuccess: () => toast.success('Fee structure approved and active for assignment!'),
      onError: (err: any) => toast.error(err.response?.data?.message || err.message || 'Approval failed'),
    });
  };

  const handleAddComponent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStructureForComp || !compHeadId || !compAmount) {
      toast.error('Please choose a fee head and enter an amount.');
      return;
    }
    const amt = parseFloat(compAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Amount must be a positive number.');
      return;
    }

    addComponentMutation.mutate({
      structureId: activeStructureForComp.id,
      headId: Number(compHeadId),
      amount: amt,
    }, {
      onSuccess: () => {
        toast.success('Component added to fee structure!');
        setActiveStructureForComp(null);
        setCompHeadId('');
        setCompAmount('');
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || err.message || 'Failed to add component');
      }
    });
  };

  const handleCreateHead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!headName.trim()) {
      toast.error('Fee Head Name is required.');
      return;
    }
    const code = headCode.trim() || `HEAD-${Date.now().toString().slice(-4)}`;

    createFeeHeadMutation.mutate({
      name: headName.trim(),
      code,
    }, {
      onSuccess: () => {
        toast.success(`Fee Head "${headName}" created!`);
        setIsHeadModalOpen(false);
        setHeadName('');
        setHeadCode('');
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || err.message || 'Failed to create fee head');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Fee Structures & Components</h2>
          <p className="text-xs text-slate-500 mt-0.5">Define institutional tuition templates and approve structures for student billing.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsHeadModalOpen(true)}
            className="text-xs"
          >
            <Layers className="w-3.5 h-3.5 mr-1 text-slate-600" />
            + New Fee Head
          </Button>
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="text-xs bg-black text-white hover:bg-slate-800"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1" />
            + New Fee Structure
          </Button>
        </div>
      </div>

      {/* Structures Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-600">Structure Name & Code</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-600">Program / Academic Year</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-600">Status</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-600">Components</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-600">Total Gross</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-600 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingStructures ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto" />
                </TableCell>
              </TableRow>
            ) : structures.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-slate-500">
                  <ReceiptText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-800 text-xs">No fee structures defined yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Click "+ New Fee Structure" to configure an institutional fee template.</p>
                </TableCell>
              </TableRow>
            ) : (
              structures.map((s) => {
                const totalGross = s.components?.reduce((sum, c) => sum + parseAmount(c.amount), 0) ?? 0;
                const prog = programs.find(p => p.id === s.programId);
                const ay = academicYears.find(a => a.id === s.academicYearId);

                return (
                  <TableRow key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <TableCell className="text-xs">
                      <p className="font-bold text-slate-900">{s.name}</p>
                      <p className="font-mono text-[10px] text-slate-500">{s.code}</p>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      <p className="font-medium text-slate-800">{prog ? formatProgramLabel(prog) : 'All Programs'}</p>
                      <p className="text-[10px] text-slate-500">{ay ? ay.name || ay.code : 'Universal'}</p>
                    </TableCell>
                    <TableCell className="text-xs">
                      {s.active ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3 mr-1" /> APPROVED
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertCircle className="w-3 h-3 mr-1" /> DRAFT
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {s.components && s.components.length > 0 ? (
                        <div className="space-y-0.5">
                          {s.components.map((c, i) => (
                            <span key={i} className="inline-block mr-1 text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-mono">
                              {c.feeHeadName || c.feeHeadCode || `Head #${c.feeHeadId}`}: {formatCurrency(c.amount)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No components</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-900 font-mono">
                      {formatCurrency(totalGross)}
                    </TableCell>
                    <TableCell className="text-right space-x-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[11px] h-7 px-2"
                        onClick={() => setActiveStructureForComp(s)}
                      >
                        + Component
                      </Button>
                      {!s.active && (
                        <Button
                          size="sm"
                          disabled={approveStructureMutation.isPending}
                          className="text-[11px] h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handleApprove(s.id)}
                        >
                          Approve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal 1: Create Fee Structure */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-xl shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">Create Fee Structure</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Set up a new institutional fee template for programs and academic sessions.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateStructure} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Structure Name *</Label>
              <Input
                placeholder="e.g. B.Tech Computer Science - Annual 2026"
                value={structName}
                onChange={(e) => setStructName(e.target.value)}
                className="text-xs bg-slate-50 border-slate-200"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Code (optional)</Label>
              <Input
                placeholder="e.g. FS-CSE-2026"
                value={structCode}
                onChange={(e) => setStructCode(e.target.value)}
                className="text-xs bg-slate-50 border-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Program</Label>
                <Select value={structProgramId} onValueChange={setStructProgramId}>
                  <SelectTrigger className="text-xs bg-slate-50 border-slate-200">
                    <SelectValue placeholder="All Programs" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)} className="text-xs">
                        {formatProgramLabel(p)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Academic Year</Label>
                <Select value={structAcademicYearId} onValueChange={setStructAcademicYearId}>
                  <SelectTrigger className="text-xs bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Universal" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((ay) => (
                      <SelectItem key={ay.id} value={String(ay.id)} className="text-xs">
                        {formatAcademicYearLabel(ay)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={createStructureMutation.isPending} className="text-xs bg-black text-white hover:bg-slate-800">
                {createStructureMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                Save Structure
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Add Component */}
      <Dialog open={!!activeStructureForComp} onOpenChange={(open) => !open && setActiveStructureForComp(null)}>
        <DialogContent className="sm:max-w-md bg-white rounded-xl shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Add Component to {activeStructureForComp?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Attach a fee head and define its amount for this structure.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddComponent} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Fee Head *</Label>
              <Select value={compHeadId} onValueChange={setCompHeadId}>
                <SelectTrigger className="text-xs bg-slate-50 border-slate-200">
                  <SelectValue placeholder={isLoadingHeads ? "Loading fee heads..." : "Select fee head"} />
                </SelectTrigger>
                <SelectContent>
                  {feeHeads.map((h) => (
                    <SelectItem key={h.id} value={String(h.id)} className="text-xs">
                      {h.name} ({h.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Amount (₹) *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g. 45000.00"
                value={compAmount}
                onChange={(e) => setCompAmount(e.target.value)}
                className="text-xs bg-slate-50 border-slate-200"
                required
              />
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setActiveStructureForComp(null)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={addComponentMutation.isPending} className="text-xs bg-black text-white hover:bg-slate-800">
                {addComponentMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                Add Component
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 3: Create Fee Head */}
      <Dialog open={isHeadModalOpen} onOpenChange={setIsHeadModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-xl shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">Define New Fee Head</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Create a reusable institutional accounting head (e.g. Tuition, Lab, Hostel).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateHead} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Fee Head Name *</Label>
              <Input
                placeholder="e.g. Examination Fee"
                value={headName}
                onChange={(e) => setHeadName(e.target.value)}
                className="text-xs bg-slate-50 border-slate-200"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Head Code (optional)</Label>
              <Input
                placeholder="e.g. HEAD-EXAM"
                value={headCode}
                onChange={(e) => setHeadCode(e.target.value)}
                className="text-xs bg-slate-50 border-slate-200"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsHeadModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={createFeeHeadMutation.isPending} className="text-xs bg-black text-white hover:bg-slate-800">
                {createFeeHeadMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                Create Head
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
