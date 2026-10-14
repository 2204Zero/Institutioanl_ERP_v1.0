import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { toast } from 'sonner';
import { Search, Loader2, Link2, UserCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import type { GuardianResponseDto } from '../types/guardian';

interface LinkExistingGuardianDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: number;
  currentGuardians: GuardianResponseDto[];
}

export function LinkExistingGuardianDialog({
  open,
  onOpenChange,
  studentId,
  currentGuardians,
}: LinkExistingGuardianDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuardianId, setSelectedGuardianId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Fetch all guardians in the ERP
  const { data: allGuardians = [], isLoading } = useQuery<GuardianResponseDto[]>({
    queryKey: ['guardians'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/guardians');
      return res.data?.data || [];
    },
    enabled: open,
  });

  // Deduplicate candidates and exclude already linked guardians
  const currentEmails = new Set(
    currentGuardians.map((g) => g.email?.toLowerCase()).filter(Boolean)
  );
  const currentPhones = new Set(
    currentGuardians.map((g) => g.phone).filter(Boolean)
  );
  const currentIds = new Set(currentGuardians.map((g) => g.id));

  // Build unique pool of existing guardians not already attached to this student
  const uniqueCandidates: GuardianResponseDto[] = [];
  const seenIdentities = new Set<string>();

  for (const g of allGuardians) {
    if (currentIds.has(g.id)) continue;
    if (g.email && currentEmails.has(g.email.toLowerCase())) continue;
    if (g.phone && currentPhones.has(g.phone)) continue;

    const identityKey = (g.userId ? `user-${g.userId}` : g.email ? `email-${g.email.toLowerCase()}` : `id-${g.id}`);
    if (!seenIdentities.has(identityKey)) {
      seenIdentities.add(identityKey);
      uniqueCandidates.push(g);
    }
  }

  // Filter candidates by search term
  const filteredCandidates = uniqueCandidates.filter((g) => {
    const term = searchTerm.toLowerCase();
    const fullName = `${g.firstName} ${g.lastName}`.toLowerCase();
    const email = (g.email || '').toLowerCase();
    const phone = g.phone || '';
    return fullName.includes(term) || email.includes(term) || phone.includes(term);
  });

  const linkMutation = useMutation({
    mutationFn: async (guardianId: number) => {
      const res = await apiClient.post(`/api/v1/students/${studentId}/guardians/${guardianId}/link`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-guardians', studentId] });
      queryClient.invalidateQueries({ queryKey: ['guardians'] });
      toast.success('Guardian linked to student successfully!');
      setSelectedGuardianId(null);
      setSearchTerm('');
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to link guardian');
    },
  });

  const handleLink = () => {
    if (!selectedGuardianId) {
      toast.error('Please select a guardian to link');
      return;
    }
    linkMutation.mutate(selectedGuardianId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-slate-900 font-bold">
            <Link2 className="w-5 h-5 text-primary" />
            <span>Link Existing Guardian</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Search for an existing parent or guardian registered in the ERP to associate with this student without creating duplicate accounts.
          </DialogDescription>
        </DialogHeader>

        <div className="my-3 relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <Input
            placeholder="Search by name, email, or mobile number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex-1 overflow-y-auto min-h-[220px] max-h-[300px] border border-slate-200 rounded-md divide-y divide-slate-100">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin mb-2" />
              <span>Loading registered guardians...</span>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs px-4">
              {searchTerm ? 'No matching guardians found for this search.' : 'No other registered guardians available to link.'}
            </div>
          ) : (
            filteredCandidates.map((g) => {
              const isSelected = selectedGuardianId === g.id;
              return (
                <div
                  key={g.id}
                  onClick={() => setSelectedGuardianId(g.id)}
                  className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-primary/5 border-l-4 border-primary' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs uppercase shrink-0">
                      {(g.firstName?.[0] || '') + (g.lastName?.[0] || '') || 'G'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-slate-900 text-xs">{g.firstName} {g.lastName}</p>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                          {g.relation || 'GUARDIAN'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{g.email || 'No email'} • {g.phone || 'No phone'}</p>
                      {g.occupation && <p className="text-[10px] text-slate-400">{g.occupation}</p>}
                    </div>
                  </div>

                  <div>
                    {isSelected ? (
                      <span className="flex items-center text-xs font-semibold text-primary">
                        <UserCheck className="w-4 h-4 mr-1" /> Selected
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 hover:text-slate-600 font-medium">Select</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-slate-100 mt-2">
          <p className="text-[11px] text-slate-500">
            {selectedGuardianId ? 'Guardian selected for linking.' : 'Select a guardian from the list above.'}
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={linkMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleLink}
              disabled={!selectedGuardianId || linkMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {linkMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  Linking...
                </>
              ) : (
                'Confirm Link'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
