import { useState } from 'react';
import { UserCheck, Search, MoreHorizontal, FileText } from 'lucide-react';
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
import { useApplicants, useApplications } from '../hooks/queries/useAdmissions';

export default function Admissions() {
  const [activeTab, setActiveTab] = useState('inquiries');

  const { data: applicants, isLoading: isLoadingInquiries } = useApplicants();
  const { data: applications, isLoading: isLoadingApplications } = useApplications();

  const getTableContent = () => {
    if (activeTab === 'inquiries') {
      if (isLoadingInquiries) return <SkeletonTable />;
      if (!applicants || applicants.length === 0) return <EmptyState tab="Inquiries" />;
      return applicants.map(app => (
        <TableRow key={app.id}>
          <TableCell className="font-semibold px-6 py-4">{app.firstName} {app.lastName}</TableCell>
          <TableCell className="text-slate-600 px-6 py-4">{app.email}</TableCell>
          <TableCell className="text-slate-600 px-6 py-4">{app.phone}</TableCell>
          <TableCell className="text-slate-600 px-6 py-4">{app.inquiryDate || 'N/A'}</TableCell>
          <TableCell className="px-6 py-4"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">NEW</span></TableCell>
          <TableCell className="text-right px-6 py-4"><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></TableCell>
        </TableRow>
      ));
    }
    
    if (activeTab === 'applications') {
      if (isLoadingApplications) return <SkeletonTable />;
      if (!applications || applications.length === 0) return <EmptyState tab="Applications" />;
      return applications.map(app => (
        <TableRow key={app.id}>
          <TableCell className="font-semibold px-6 py-4">APP-{app.id}</TableCell>
          <TableCell className="text-slate-600 px-6 py-4">Applicant #{app.applicantId}</TableCell>
          <TableCell className="text-slate-600 px-6 py-4">Program #{app.programId}</TableCell>
          <TableCell className="text-slate-600 px-6 py-4">{app.applicationDate || 'N/A'}</TableCell>
          <TableCell className="px-6 py-4">
            <span className={`px-2 py-1 rounded text-xs font-bold ${app.status === 'DRAFT' ? 'bg-slate-100 text-slate-700' : app.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-700' : app.status === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-700'}`}>
              {app.status}
            </span>
          </TableCell>
          <TableCell className="text-right px-6 py-4"><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></TableCell>
        </TableRow>
      ));
    }

    return (
      <TableRow>
        <TableCell colSpan={6} className="h-48 text-center text-slate-500">
          Module still under construction for {activeTab}.
        </TableCell>
      </TableRow>
    );
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
          <TableCell className="px-6 py-4"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
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
          <div className="text-sm mt-1">No admission applications found. Applications will appear here once they are submitted.</div>
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
        <Button className="bg-black text-white hover:bg-black/80 px-6 rounded-full h-11">
          <UserCheck className="w-4 h-4 mr-2" />
          New Inquiry
        </Button>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="flex border-b border-slate-100 px-6 pt-4 space-x-8 overflow-x-auto whitespace-nowrap custom-scrollbar">
          {['inquiries', 'applications', 'verification', 'decisions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 text-sm font-semibold capitalize transition-all border-b-2 ${activeTab === tab ? 'border-black text-black' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
            >
              {tab === 'inquiries' ? '1. Inquiries' : 
               tab === 'applications' ? '2. Applications' : 
               tab === 'verification' ? '3. Verification' : 
               '4. Decisions'}
            </button>
          ))}
        </div>

        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              type="text" 
              placeholder={`Search ${activeTab}...`} 
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
                </>
              ) : (
                <>
                  <TableHead className="font-semibold px-6 py-4">Application ID</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Applicant</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Program</TableHead>
                </>
              )}
              <TableHead className="font-semibold px-6 py-4">Date</TableHead>
              <TableHead className="font-semibold px-6 py-4">Status</TableHead>
              <TableHead className="font-semibold px-6 py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getTableContent()}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}



