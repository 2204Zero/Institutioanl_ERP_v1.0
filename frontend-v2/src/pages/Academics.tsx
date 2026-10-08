import { useState } from 'react';
import { BookOpen, GraduationCap, Users, Search, Plus, MoreHorizontal, FileText } from 'lucide-react';
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
import { usePrograms, useCourses, useBatches } from '../hooks/queries/useAcademics';

export default function Academics() {
  const [activeTab, setActiveTab] = useState('programs');

  const { data: programs, isLoading: isLoadingPrograms } = usePrograms();
  const { data: courses, isLoading: isLoadingCourses } = useCourses();
  const { data: batches, isLoading: isLoadingBatches } = useBatches();

  const getTableContent = () => {
    if (activeTab === 'programs') {
      if (isLoadingPrograms) return <SkeletonTable columns={5} />;
      if (!programs || programs.length === 0) return <EmptyState tab="Programs" />;
      return programs.map(p => (
        <TableRow key={p.id}>
          <TableCell className="font-semibold px-6 py-4">{p.code}</TableCell>
          <TableCell className="px-6 py-4">{p.name}</TableCell>
          <TableCell className="px-6 py-4 text-slate-600">{p.type}</TableCell>
          <TableCell className="px-6 py-4 text-slate-600">{p.durationYears} Years</TableCell>
          <TableCell className="px-6 py-4">
            <span className={`px-2 py-1 rounded text-xs font-bold ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
              {p.isActive ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </TableCell>
          <TableCell className="text-right px-6 py-4"><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></TableCell>
        </TableRow>
      ));
    }
    
    if (activeTab === 'courses') {
      if (isLoadingCourses) return <SkeletonTable columns={4} />;
      if (!courses || courses.length === 0) return <EmptyState tab="Courses" />;
      return courses.map(c => (
        <TableRow key={c.id}>
          <TableCell className="font-semibold px-6 py-4">{c.code}</TableCell>
          <TableCell className="px-6 py-4">{c.name}</TableCell>
          <TableCell className="px-6 py-4 text-slate-600">{c.credits} Credits</TableCell>
          <TableCell className="px-6 py-4">
            <span className={`px-2 py-1 rounded text-xs font-bold ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
              {c.isActive ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </TableCell>
          <TableCell className="text-right px-6 py-4"><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></TableCell>
        </TableRow>
      ));
    }

    if (activeTab === 'batches') {
      if (isLoadingBatches) return <SkeletonTable columns={4} />;
      if (!batches || batches.length === 0) return <EmptyState tab="Batches" />;
      return batches.map(b => (
        <TableRow key={b.id}>
          <TableCell className="font-semibold px-6 py-4">{b.code}</TableCell>
          <TableCell className="px-6 py-4">{b.admissionYear} - {b.graduationYear}</TableCell>
          <TableCell className="px-6 py-4">
            <span className={`px-2 py-1 rounded text-xs font-bold ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
              {b.isActive ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </TableCell>
          <TableCell className="text-right px-6 py-4"><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></TableCell>
        </TableRow>
      ));
    }

    return null;
  };

  const SkeletonTable = ({ columns }: { columns: number }) => (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: columns }).map((_, j) => (
             <TableCell key={j} className="px-6 py-4"><Skeleton className="h-4 w-full max-w-[120px]" /></TableCell>
          ))}
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
          <div className="text-sm mt-1">No academic records found in this section. Create your first record to get started.</div>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Academics Core</h1>
          <p className="text-slate-500 text-sm">Configure programs, degrees, course catalog, and academic batches.</p>
        </div>
        <Button className="bg-black text-white hover:bg-black/80 px-6 rounded-full h-11">
          <Plus className="w-4 h-4 mr-2" />
          Add {activeTab.slice(0, -1)}
        </Button>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="flex border-b border-slate-100 px-6 pt-4 space-x-8 overflow-x-auto whitespace-nowrap custom-scrollbar">
          {[
            { id: 'programs', label: '1. Programs & Degrees', icon: GraduationCap },
            { id: 'courses', label: '2. Course Catalog', icon: BookOpen },
            { id: 'batches', label: '3. Academic Batches', icon: Users }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-2 text-sm font-semibold flex items-center transition-all border-b-2 ${activeTab === tab.id ? 'border-black text-black' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
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
              {activeTab === 'programs' ? (
                <>
                  <TableHead className="font-semibold px-6 py-4">Program Code</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Name</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Type</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Duration</TableHead>
                </>
              ) : activeTab === 'courses' ? (
                <>
                  <TableHead className="font-semibold px-6 py-4">Course Code</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Name</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Credits</TableHead>
                </>
              ) : (
                <>
                  <TableHead className="font-semibold px-6 py-4">Batch Code</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Timeline</TableHead>
                </>
              )}
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



