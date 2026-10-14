import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Loader2, CreditCard, ShieldCheck, Printer } from 'lucide-react';

interface StudentIdCardModalProps {
  studentId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentIdCardModal({ studentId, open, onOpenChange }: StudentIdCardModalProps) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['student-id-card', studentId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/students/${studentId}/id-card`);
      return res.data?.data;
    },
    enabled: open && !!studentId,
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-base font-bold text-slate-900">
            <CreditCard className="w-5 h-5 mr-2 text-slate-700" />
            Official Student ID Card
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Verifiable digital student identity credential generated from persisted records.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-2" />
            <p className="text-xs text-slate-500">Generating student ID card...</p>
          </div>
        ) : isError ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg text-xs">
            {(error as any)?.response?.data?.message || 'Failed to generate ID card.'}
          </div>
        ) : data ? (
          <div className="space-y-4">
            {/* Identity Card Front Preview */}
            <div
              id="printable-student-id-card"
              className="border-2 border-slate-900 rounded-xl overflow-hidden bg-white shadow-lg text-slate-900"
            >
              <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black tracking-wider uppercase">Institutional ERP</h3>
                  <p className="text-[9px] text-slate-300 uppercase tracking-widest">Student Identification Card</p>
                </div>
                <div className="flex items-center space-x-1 text-emerald-400 text-[10px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>VERIFIED</span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-16 h-20 rounded bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-500 font-bold text-sm shrink-0 overflow-hidden relative">
                    <img
                      src={`/api/v1/students/${data.studentId}/photo`}
                      alt={data.fullName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span className="only:block">{data.fullName?.split(' ').map((n: string) => n[0]).join('') || 'PHOTO'}</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-sm text-slate-900 leading-tight">{data.fullName}</p>
                    <div className="space-y-0.5 text-[11px] text-slate-600">
                      <p><span className="font-semibold text-slate-800">Enrollment No:</span> <span className="font-mono font-bold text-slate-900">{data.enrollmentNumber}</span></p>
                      <p><span className="font-semibold text-slate-800">Roll No:</span> <span className="font-mono">{data.rollNumber || 'N/A'}</span></p>
                      <p><span className="font-semibold text-slate-800">Department:</span> {data.department}</p>
                      <p><span className="font-semibold text-slate-800">Program:</span> {data.program}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[10px] text-slate-600">
                  <div>
                    <span className="font-semibold text-slate-700">Internal ID:</span> #{data.studentId}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Status:</span> <span className="font-bold text-emerald-700">{data.status}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Valid Through:</span> {data.validThroughYear}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Issue Date:</span> {data.issueDate}
                  </div>
                </div>

                <div className="pt-2 border-t border-dashed border-slate-300 flex items-center justify-between text-[9px] font-mono text-slate-500">
                  <span>TOKEN: {data.verificationCode?.substring(0, 16)}...</span>
                  <span className="text-slate-400">Institutional Registrar</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white" onClick={handlePrint}>
                <Printer className="w-3.5 h-3.5 mr-1.5" /> Print / Save PDF
              </Button>
            </div>

            <style>{`
              @media print {
                /* Exclude backdrop, header, dialog controls, and page */
                body * {
                  visibility: hidden !important;
                }
                #printable-student-id-card,
                #printable-student-id-card * {
                  visibility: visible !important;
                }
                #printable-student-id-card {
                  position: fixed !important;
                  left: 50% !important;
                  top: 40px !important;
                  transform: translateX(-50%) !important;
                  width: 380px !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  box-shadow: none !important;
                  border: 2px solid #0f172a !important;
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  z-index: 99999 !important;
                }
                /* Hide dialog overlays and wrappers entirely in print */
                [data-radix-portal], [role="dialog"], [data-state="open"] {
                  background: transparent !important;
                  border: none !important;
                  box-shadow: none !important;
                }
              }
            `}</style>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
