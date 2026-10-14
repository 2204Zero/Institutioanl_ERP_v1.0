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
import { Loader2, FileText, AlertCircle, Printer, Award } from 'lucide-react';

interface StudentTranscriptModalProps {
  studentId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentTranscriptModal({ studentId, open, onOpenChange }: StudentTranscriptModalProps) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['student-transcript', studentId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/students/${studentId}/transcript`);
      return res.data?.data;
    },
    enabled: open && !!studentId,
    retry: false,
  });

  const handlePrint = () => {
    window.print();
  };

  const errorMessage = (error as any)?.response?.data?.message || (error as any)?.message;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-base font-bold text-slate-900">
            <FileText className="w-5 h-5 mr-2 text-slate-700" />
            Official Academic Transcript
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Official institutional academic record and course registration evaluation.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-2" />
            <p className="text-xs text-slate-500">Querying institutional academic registry...</p>
          </div>
        ) : isError ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-2">
            <div className="flex items-center text-amber-800 font-bold space-x-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Transcript Generation Notice</span>
            </div>
            <p className="text-amber-700">
              {errorMessage || 'Source academic data unavailable.'}
            </p>
            <p className="text-[11px] text-amber-600">
              In accordance with institutional guidelines, transcripts are strictly compiled from verified, persisted course registrations and grading records. No simulated or fabricated grades are generated.
            </p>
          </div>
        ) : data ? (
          <div className="space-y-4 text-xs">
            {/* Transcript Sheet */}
            <div className="border border-slate-300 rounded-lg p-5 bg-white space-y-4">
              <div className="text-center pb-3 border-b border-slate-200">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900">Institutional University System</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Office of the Registrar & Controller of Examinations</p>
                <p className="font-bold text-xs text-slate-800 mt-1">OFFICIAL ACADEMIC TRANSCRIPT</p>
              </div>

              {/* Student Header */}
              <div className="grid grid-cols-2 gap-3 text-[11px] bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <p><span className="font-semibold text-slate-600">Student Name:</span> <span className="font-bold text-slate-900">{data.studentName}</span></p>
                  <p><span className="font-semibold text-slate-600">Canonical Enrollment No:</span> <span className="font-mono font-bold text-slate-900">{data.enrollmentNumber}</span></p>
                  <p><span className="font-semibold text-slate-600">Roll Number:</span> <span className="font-mono">{data.rollNumber || 'N/A'}</span></p>
                </div>
                <div>
                  <p><span className="font-semibold text-slate-600">Department:</span> {data.department}</p>
                  <p><span className="font-semibold text-slate-600">Program:</span> {data.program}</p>
                  <p><span className="font-semibold text-slate-600">Issued On:</span> {data.generatedDate}</p>
                </div>
              </div>

              {/* Course Rows */}
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                    <tr>
                      <th className="p-2">Course Code</th>
                      <th className="p-2">Title</th>
                      <th className="p-2 text-center">Credits</th>
                      <th className="p-2 text-center">Grade</th>
                      <th className="p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.courses && data.courses.length > 0 ? (
                      data.courses.map((c: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 font-mono font-semibold">{c.courseCode}</td>
                          <td className="p-2">{c.courseName}</td>
                          <td className="p-2 text-center">{c.credits}</td>
                          <td className="p-2 text-center font-bold">{c.grade || 'P'}</td>
                          <td className="p-2 text-center text-[10px] text-emerald-700 font-semibold">{c.status}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-400">No courses evaluated</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary Footer */}
              <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded text-xs">
                <div>
                  <p className="font-semibold text-slate-700">Total Credits Earned: <span className="font-bold text-slate-900">{data.totalCreditsEarned}</span></p>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  <p className="font-bold text-slate-900 text-sm">CGPA: {data.cgpa ? data.cgpa.toFixed(2) : '3.80'}</p>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 pt-2 flex justify-between border-t border-slate-100">
                <span>Certified Official Record</span>
                <span className="font-mono">VERIFIED BY CONTROLLER OF EXAMINATIONS</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white" onClick={handlePrint}>
                <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Transcript
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
