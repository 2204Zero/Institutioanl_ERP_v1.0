import { useState } from 'react';
import { UserCheck, Search, FileText, CheckCircle, XCircle, Eye, AlertCircle, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../components/ui/table';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import {
  useApplicants,
  useApplications,
  useApplicantDocuments,
  useVerifyDocument,
  useUpdateApplicationStatus,
  useOnboardStudent
} from '../hooks/queries/useAdmissions';
import { usePrograms } from '../hooks/queries/useAcademics';
import { NewApplicationDialog } from '../components/NewApplicationDialog';
import type { AdmissionApplication } from '../hooks/queries/useAdmissions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { toast } from 'sonner';

export default function Admissions() {
  const [activeTab, setActiveTab] = useState('inquiries');
  const [search, setSearch] = useState('');
  const [isNewInquiryOpen, setIsNewInquiryOpen] = useState(false);

  const { data: applicants, isLoading: isLoadingInquiries } = useApplicants();
  const { data: applications, isLoading: isLoadingApplications } = useApplications();
  const { data: programs = [] } = usePrograms();

  const getApplicantName = (applicantId: number) => {
    const a = applicants?.find(item => item.id === applicantId);
    return a ? `${a.firstName} ${a.lastName}` : `Applicant #${applicantId}`;
  };

  const getProgramName = (programId: number) => {
    const p = programs?.find(item => item.id === programId);
    return p ? `${p.name} (${p.code})` : `Program #${programId}`;
  };

  const verifyDocMutation = useVerifyDocument();
  const updateStatusMutation = useUpdateApplicationStatus();
  const onboardStudentMutation = useOnboardStudent();

  const [selectedVerificationApp, setSelectedVerificationApp] = useState<AdmissionApplication | null>(null);

  // Fetch documents for the selected applicant
  const { data: documents, isLoading: isLoadingDocs } = useApplicantDocuments(
    selectedVerificationApp ? selectedVerificationApp.applicantId : null
  );

  const filteredApplicants = applicants?.filter(app =>
    app.firstName.toLowerCase().includes(search.toLowerCase()) ||
    app.lastName.toLowerCase().includes(search.toLowerCase()) ||
    app.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredApplications = applications?.filter(app =>
    `APP-${app.id}`.toLowerCase().includes(search.toLowerCase()) ||
    getApplicantName(app.applicantId).toLowerCase().includes(search.toLowerCase()) ||
    getProgramName(app.programId).toLowerCase().includes(search.toLowerCase())
  );

  const handleVerify = (docId: number, status: string) => {
    verifyDocMutation.mutate({ id: docId, status }, {
      onSuccess: () => toast.success(`Document marked as ${status}`),
      onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to verify document')
    });
  };

  const handleDecision = (appId: number, targetStatus: string) => {
    if (!window.confirm(`Are you sure you want to mark this application as ${targetStatus}?`)) return;

    updateStatusMutation.mutate({ id: appId, targetStatus }, {
      onSuccess: () => {
        toast.success(`Application updated to ${targetStatus}`);
        if (selectedVerificationApp && selectedVerificationApp.id === appId) {
          setSelectedVerificationApp(null);
        }
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update application')
    });
  };

  const handleOnboard = (appId: number) => {
    if (!window.confirm(`Are you sure you want to onboard this applicant as a student?`)) return;

    onboardStudentMutation.mutate(appId, {
      onSuccess: () => {
        toast.success(`Student onboarded successfully!`);
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to onboard student')
    });
  };

  const getTableContent = () => {
    if (activeTab === 'inquiries') {
      if (isLoadingInquiries) return <SkeletonTable />;
      if (!filteredApplicants || filteredApplicants.length === 0) return <EmptyState tab="Inquiries" />;
      return filteredApplicants.map(app => (
        <TableRow key={app.id}>
          <TableCell className="font-semibold px-6 py-4">{app.firstName} {app.lastName}</TableCell>
          <TableCell className="text-slate-600 px-6 py-4">{app.email}</TableCell>
          <TableCell className="text-slate-600 px-6 py-4">{app.phone}</TableCell>
          <TableCell className="text-slate-600 px-6 py-4">{app.inquiryDate ? new Date(app.inquiryDate).toLocaleDateString() : 'N/A'}</TableCell>
          <TableCell className="px-6 py-4"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">INQUIRY</span></TableCell>
          <TableCell className="text-right px-6 py-4">
            <span className="text-xs text-slate-400">ID #{app.id}</span>
          </TableCell>
        </TableRow>
      ));
    }

    if (activeTab === 'applications') {
      if (isLoadingApplications) return <SkeletonTable />;
      if (!filteredApplications || filteredApplications.length === 0) return <EmptyState tab="Applications" />;
      return filteredApplications.map(app => (
        <TableRow key={app.id}>
          <TableCell className="font-semibold px-6 py-4">APP-{app.id}</TableCell>
          <TableCell className="text-slate-800 font-medium px-6 py-4">{getApplicantName(app.applicantId)}</TableCell>
          <TableCell className="text-slate-600 px-6 py-4">{getProgramName(app.programId)}</TableCell>
          <TableCell className="text-slate-600 px-6 py-4">{app.applicationDate ? new Date(app.applicationDate).toLocaleDateString() : 'N/A'}</TableCell>
          <TableCell className="px-6 py-4">
            <span className={`px-2 py-1 rounded text-xs font-bold ${app.status === 'DRAFT' ? 'bg-slate-100 text-slate-700' : app.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-700' : app.status === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-700'}`}>
              {app.status}
            </span>
          </TableCell>
          <TableCell className="text-right px-6 py-4">
            <span className="text-xs text-slate-400">AY #{app.academicYearId}</span>
          </TableCell>
        </TableRow>
      ));
    }

    if (activeTab === 'verification') {
      if (isLoadingApplications) return <SkeletonTable />;
      const verificationApps = filteredApplications?.filter(app => ['SUBMITTED', 'DOCUMENT_VERIFICATION_PENDING', 'UNDER_REVIEW'].includes(app.status));
      if (!verificationApps || verificationApps.length === 0) return <EmptyState tab="Pending Verifications" />;

      return verificationApps.map(app => (
        <TableRow key={app.id}>
          <TableCell className="font-semibold px-6 py-4">APP-{app.id}</TableCell>
          <TableCell className="text-slate-800 font-medium px-6 py-4">{getApplicantName(app.applicantId)}</TableCell>
          <TableCell className="px-6 py-4">
            <span className={`px-2 py-1 rounded text-xs font-bold ${app.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-700' : app.status === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-800' : 'bg-amber-100 text-amber-700'}`}>
              {app.status}
            </span>
          </TableCell>
          <TableCell className="text-right px-6 py-4">
            <Button variant="outline" size="sm" onClick={() => setSelectedVerificationApp(app)}>
              <Eye className="w-4 h-4 mr-2" /> View Documents
            </Button>
          </TableCell>
        </TableRow>
      ));
    }

    if (activeTab === 'decisions') {
      if (isLoadingApplications) return <SkeletonTable />;
      const decisionApps = filteredApplications?.filter(app => ['UNDER_REVIEW', 'WAITLISTED'].includes(app.status));
      if (!decisionApps || decisionApps.length === 0) return <EmptyState tab="Pending Decisions" />;

      return decisionApps.map(app => (
        <TableRow key={app.id}>
          <TableCell className="font-semibold px-6 py-4">APP-{app.id}</TableCell>
          <TableCell className="text-slate-800 font-medium px-6 py-4">{getApplicantName(app.applicantId)}</TableCell>
          <TableCell className="text-slate-600 px-6 py-4">{getProgramName(app.programId)}</TableCell>
          <TableCell className="px-6 py-4">
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold">
              {app.status}
            </span>
          </TableCell>
          <TableCell className="text-right px-6 py-4">
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                className="text-green-600 border-green-200 hover:bg-green-50"
                size="sm"
                disabled={updateStatusMutation.isPending}
                onClick={() => handleDecision(app.id, 'ADMITTED')}
              >
                <CheckCircle className="w-4 h-4 mr-1" /> Admit
              </Button>
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                size="sm"
                disabled={updateStatusMutation.isPending}
                onClick={() => handleDecision(app.id, 'REJECTED')}
              >
                <XCircle className="w-4 h-4 mr-1" /> Reject
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ));
    }

    if (activeTab === 'onboarding') {
      if (isLoadingApplications) return <SkeletonTable />;
      const onboardingApps = filteredApplications?.filter(app => ['ADMITTED'].includes(app.status));
      if (!onboardingApps || onboardingApps.length === 0) return <EmptyState tab="Onboarding" />;

      return onboardingApps.map(app => (
        <TableRow key={app.id}>
          <TableCell className="font-semibold px-6 py-4">APP-{app.id}</TableCell>
          <TableCell className="text-slate-800 font-medium px-6 py-4">{getApplicantName(app.applicantId)}</TableCell>
          <TableCell className="text-slate-600 px-6 py-4">{getProgramName(app.programId)}</TableCell>
          <TableCell className="px-6 py-4">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">
              {app.status}
            </span>
          </TableCell>
          <TableCell className="text-right px-6 py-4">
            <Button
              className="bg-black text-white hover:bg-black/80"
              size="sm"
              disabled={onboardStudentMutation.isPending}
              onClick={() => handleOnboard(app.id)}
            >
              <UserCheck className="w-4 h-4 mr-2" /> Onboard Student
            </Button>
          </TableCell>
        </TableRow>
      ));
    }

    return null;
  };

  const SkeletonTable = () => (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell className="px-6 py-4"><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell className="px-6 py-4"><Skeleton className="h-4 w-48" /></TableCell>
          <TableCell className="px-6 py-4"><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell className="px-6 py-4"><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
        </TableRow>
      ))}
    </>
  );

  const EmptyState = ({ tab }: { tab: string }) => (
    <TableRow>
      <TableCell colSpan={6} className="h-48 text-center text-slate-500">
        <div className="flex flex-col items-center justify-center">
          <FileText className="w-8 h-8 text-slate-300 mb-2" />
          <div className="font-medium text-slate-900">No {tab} found.</div>
          <div className="text-sm mt-1">Check back later or adjust your filters.</div>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Admissions</h1>
          <p className="text-slate-500 text-sm">Manage new inquiries, applications, document verification, and final enrollment decisions.</p>
        </div>
        <Button 
          className="bg-black text-white hover:bg-black/80 px-6 rounded-full h-11"
          onClick={() => setIsNewInquiryOpen(true)}
        >
          <UserCheck className="w-4 h-4 mr-2" />
          New Inquiry
        </Button>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="flex border-b border-slate-100 px-6 pt-4 space-x-8 overflow-x-auto whitespace-nowrap custom-scrollbar">
          {['inquiries', 'applications', 'verification', 'decisions', 'onboarding'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 text-sm font-semibold capitalize transition-all border-b-2 ${activeTab === tab ? 'border-black text-black' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
            >
              {tab === 'inquiries' ? '1. Inquiries' :
               tab === 'applications' ? '2. Applications' :
               tab === 'verification' ? '3. Verification' :
               tab === 'decisions' ? '4. Decisions' :
               '5. Onboarding'}
            </button>
          ))}
        </div>

        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder={`Search...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border-slate-200 rounded-lg text-sm w-full sm:w-72 h-10"
            />
          </div>
        </div>

        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              {activeTab === 'inquiries' ? (
                <>
                  <TableHead className="font-semibold px-6 py-4">Name</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Email</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Phone</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Date</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Status</TableHead>
                  <TableHead className="font-semibold px-6 py-4 text-right">Actions</TableHead>
                </>
              ) : activeTab === 'verification' ? (
                <>
                  <TableHead className="font-semibold px-6 py-4">Application ID</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Applicant</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Status</TableHead>
                  <TableHead className="font-semibold px-6 py-4 text-right">Actions</TableHead>
                </>
              ) : activeTab === 'decisions' ? (
                 <>
                  <TableHead className="font-semibold px-6 py-4">Application ID</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Applicant</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Program</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Status</TableHead>
                  <TableHead className="font-semibold px-6 py-4 text-right">Decision</TableHead>
                </>
              ) : activeTab === 'onboarding' ? (
                <>
                  <TableHead className="font-semibold px-6 py-4">Application ID</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Applicant</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Program</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Status</TableHead>
                  <TableHead className="font-semibold px-6 py-4 text-right">Actions</TableHead>
                </>
              ) : (
                <>
                  <TableHead className="font-semibold px-6 py-4">Application ID</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Applicant</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Program</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Date</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Status</TableHead>
                  <TableHead className="font-semibold px-6 py-4 text-right">Actions</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {getTableContent()}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedVerificationApp} onOpenChange={(open) => !open && setSelectedVerificationApp(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Document Verification</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {isLoadingDocs ? (
              <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
            ) : !documents || documents.length === 0 ? (
              <div className="text-center p-8 bg-slate-50 border border-slate-100 rounded text-slate-500">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="mt-2 text-sm">No documents uploaded yet for this applicant.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {documents.map(doc => (
                  <div key={doc.id} className="border border-slate-200 p-4 rounded-lg flex items-center justify-between bg-slate-50">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{doc.documentType}</h4>
                      <div className="flex items-center space-x-2 mt-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                          doc.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                          doc.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {doc.verificationStatus}
                        </span>
                        {doc.remarks && <span className="text-xs text-slate-500 font-medium">â€¢ {doc.remarks}</span>}
                      </div>
                      <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-600 hover:underline mt-2 inline-block">
                        View Attached File
                      </a>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-200 hover:bg-green-50 text-xs h-8 px-3"
                        onClick={() => handleVerify(doc.id, 'VERIFIED')}
                        disabled={verifyDocMutation.isPending || doc.verificationStatus === 'VERIFIED'}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 text-xs h-8 px-3"
                        onClick={() => handleVerify(doc.id, 'REJECTED')}
                        disabled={verifyDocMutation.isPending || doc.verificationStatus === 'REJECTED'}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter className="border-t border-slate-100 pt-4">
            {selectedVerificationApp && selectedVerificationApp.status === 'SUBMITTED' && (
               <Button
                 onClick={() => handleDecision(selectedVerificationApp.id, 'UNDER_REVIEW')}
                 disabled={updateStatusMutation.isPending}
                 className="bg-black text-white hover:bg-slate-800 text-xs"
               >
                 Move to "Under Review"
               </Button>
            )}
            <Button variant="outline" onClick={() => setSelectedVerificationApp(null)} className="text-xs">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <NewApplicationDialog
        isOpen={isNewInquiryOpen}
        onClose={() => setIsNewInquiryOpen(false)}
      />
    </div>
  );
}
