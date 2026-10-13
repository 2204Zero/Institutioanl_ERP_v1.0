import { useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  Users,
  Search,
  Plus,
  MoreHorizontal,
  FileText,
  Calendar,
  LayoutList,
  Loader2,
  Building2,
  CalendarDays
} from 'lucide-react';
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
  usePrograms,
  useCourses,
  useBatches,
  useSemesters,
  useCourseOfferings,
  useCreateSemester,
  useCreateCourseOffering,
  useAcademicYears,
  useSections,
  useCreateSection,
  useFacultyList,
  useAssignFaculty,
  useDepartments,
  useCreateProgram,
  useCreateCourse,
  useCreateBatch,
  type Course
} from '../hooks/queries/useAcademics';
import { toast } from 'sonner';
import { TimetableTab } from '../components/TimetableTab';
import { useAuthStore } from '../store/useAuthStore';
import { CreateDepartmentDialog } from '../components/academics/CreateDepartmentDialog';
import { CreateAcademicYearDialog } from '../components/academics/CreateAcademicYearDialog';
import { CoursePrerequisitesDialog } from '../components/academics/CoursePrerequisitesDialog';

export default function Academics() {
  const [activeTab, setActiveTab] = useState('programs');
  const [isCreating, setIsCreating] = useState(false);

  // Dialog States
  const [deptDialogOpen, setDeptDialogOpen] = useState(false);
  const [ayDialogOpen, setAyDialogOpen] = useState(false);
  const [selectedCourseForPrereqs, setSelectedCourseForPrereqs] = useState<Course | null>(null);

  const { user } = useAuthStore();
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  const { data: departments = [] } = useDepartments();
  const { data: programs, isLoading: isLoadingPrograms } = usePrograms();
  const { data: courses, isLoading: isLoadingCourses } = useCourses();
  const { data: batches, isLoading: isLoadingBatches } = useBatches();
  const { data: semesters, isLoading: isLoadingSemesters } = useSemesters();
  const { data: offerings, isLoading: isLoadingOfferings } = useCourseOfferings();
  const { data: academicYears } = useAcademicYears();
  const { data: sections, isLoading: isLoadingSections } = useSections();
  const { data: facultyList = [] } = useFacultyList({ enabled: isAdmin });

  const createProgram = useCreateProgram();
  const createCourse = useCreateCourse();
  const createBatch = useCreateBatch();
  const createSemester = useCreateSemester();
  const createOffering = useCreateCourseOffering();
  const createSection = useCreateSection();
  const assignFaculty = useAssignFaculty();

  // Program Form State
  const [progCode, setProgCode] = useState('');
  const [progName, setProgName] = useState('');
  const [progDegree, setProgDegree] = useState('B.Tech');
  const [progDeptId, setProgDeptId] = useState('');
  const [progDuration, setProgDuration] = useState('4');

  // Course Form State
  const [crsCode, setCrsCode] = useState('');
  const [crsName, setCrsName] = useState('');
  const [crsType, setCrsType] = useState('THEORY');
  const [crsCredits, setCrsCredits] = useState('3');
  const [crsDeptId, setCrsDeptId] = useState('');
  const [crsProgId, setCrsProgId] = useState('');

  // Batch Form State
  const [batchName, setBatchName] = useState('');
  const [batchCode, setBatchCode] = useState('');
  const [batchProgId, setBatchProgId] = useState('');
  const [batchAdmYear, setBatchAdmYear] = useState('2026');
  const [batchGradYear, setBatchGradYear] = useState('2030');
  const [batchAyId, setBatchAyId] = useState('');

  // Section Form State
  const [secName, setSecName] = useState('');
  const [secCourseOfferingId, setSecCourseOfferingId] = useState('');
  const [secCapacity, setSecCapacity] = useState('');

  // Faculty Assign State
  const [assigningFacultySectionId, setAssigningFacultySectionId] = useState<number | null>(null);
  const [secFacId, setSecFacId] = useState('');
  const [secFacRole, setSecFacRole] = useState('CLASS_TEACHER');

  // Semester Form State
  const [semName, setSemName] = useState('');
  const [semNumber, setSemNumber] = useState('');
  const [semAcademicYear, setSemAcademicYear] = useState('');
  const [semStart, setSemStart] = useState('');
  const [semEnd, setSemEnd] = useState('');

  // Course Offering Form State
  const [offCourseId, setOffCourseId] = useState('');
  const [offSemesterId, setOffSemesterId] = useState('');
  const [offCapacity, setOffCapacity] = useState('');

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProgram.mutateAsync({
        code: progCode.trim().toUpperCase(),
        name: progName.trim(),
        degree: progDegree,
        departmentId: parseInt(progDeptId),
        duration: parseInt(progDuration),
        isActive: true
      });
      toast.success('Program created successfully');
      setIsCreating(false);
      setProgCode('');
      setProgName('');
      setProgDeptId('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create program');
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCourse.mutateAsync({
        code: crsCode.trim().toUpperCase(),
        name: crsName.trim(),
        courseType: crsType,
        credits: parseInt(crsCredits),
        departmentId: parseInt(crsDeptId),
        programId: crsProgId ? parseInt(crsProgId) : undefined,
        isActive: true
      });
      toast.success('Course created successfully');
      setIsCreating(false);
      setCrsCode('');
      setCrsName('');
      setCrsDeptId('');
      setCrsProgId('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create course');
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBatch.mutateAsync({
        name: batchName.trim(),
        code: batchCode.trim().toUpperCase(),
        programId: parseInt(batchProgId),
        admissionYear: parseInt(batchAdmYear),
        graduationYear: parseInt(batchGradYear),
        academicYearId: batchAyId ? parseInt(batchAyId) : undefined,
        isActive: true
      });
      toast.success('Batch created successfully');
      setIsCreating(false);
      setBatchName('');
      setBatchCode('');
      setBatchProgId('');
      setBatchAyId('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create batch');
    }
  };

  const handleCreateSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSemester.mutateAsync({
        name: semName,
        semesterNumber: parseInt(semNumber),
        academicYearId: parseInt(semAcademicYear),
        startDate: semStart,
        endDate: semEnd,
        isActive: true
      });
      toast.success('Semester created successfully');
      setIsCreating(false);
      setSemName('');
      setSemNumber('');
      setSemAcademicYear('');
      setSemStart('');
      setSemEnd('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create semester');
    }
  };

  const handleCreateOffering = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOffering.mutateAsync({
        courseId: parseInt(offCourseId),
        semesterId: parseInt(offSemesterId),
        maxCapacity: parseInt(offCapacity)
      });
      toast.success('Course offering created successfully');
      setIsCreating(false);
      setOffCourseId('');
      setOffSemesterId('');
      setOffCapacity('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create course offering');
    }
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSection.mutateAsync({
        name: secName,
        courseOfferingId: parseInt(secCourseOfferingId),
        capacity: parseInt(secCapacity)
      });
      toast.success('Section created successfully');
      setIsCreating(false);
      setSecName('');
      setSecCourseOfferingId('');
      setSecCapacity('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create section');
    }
  };

  const handleAssignFaculty = async (e: React.FormEvent, sectionId: number) => {
    e.preventDefault();
    try {
      await assignFaculty.mutateAsync({
        sectionId,
        facultyId: parseInt(secFacId),
        role: secFacRole
      });
      toast.success('Faculty assigned successfully');
      setAssigningFacultySectionId(null);
      setSecFacId('');
      setSecFacRole('CLASS_TEACHER');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign faculty');
    }
  };

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
          <TableCell className="text-right px-6 py-4">
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-semibold"
                onClick={() => setSelectedCourseForPrereqs(c)}
              >
                Prerequisites
              </Button>
              <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
            </div>
          </TableCell>
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

    if (activeTab === 'semesters') {
      if (isLoadingSemesters) return <SkeletonTable columns={4} />;
      if (!semesters || semesters.length === 0) return <EmptyState tab="Semesters" />;
      return semesters.map(s => (
        <TableRow key={s.id}>
          <TableCell className="font-semibold px-6 py-4">{s.name}</TableCell>
          <TableCell className="px-6 py-4">Sem {s.semesterNumber}</TableCell>
          <TableCell className="px-6 py-4 text-slate-600">{s.startDate} to {s.endDate}</TableCell>
          <TableCell className="px-6 py-4">
            <span className={`px-2 py-1 rounded text-xs font-bold ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
              {s.isActive ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </TableCell>
          <TableCell className="text-right px-6 py-4"><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></TableCell>
        </TableRow>
      ));
    }

    if (activeTab === 'offerings') {
      if (isLoadingOfferings) return <SkeletonTable columns={5} />;
      if (!offerings || offerings.length === 0) return <EmptyState tab="Course Offerings" />;
      return offerings.map(o => (
        <TableRow key={o.id}>
          <TableCell className="font-semibold px-6 py-4">{o.course?.code}</TableCell>
          <TableCell className="px-6 py-4">{o.course?.name}</TableCell>
          <TableCell className="px-6 py-4 text-slate-600">{o.semester?.name}</TableCell>
          <TableCell className="px-6 py-4 text-slate-600">Max: {o.maxCapacity}</TableCell>
          <TableCell className="px-6 py-4">
            <span className={`px-2 py-1 rounded text-xs font-bold ${o.isPublished ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
              {o.isPublished ? 'PUBLISHED' : 'DRAFT'}
            </span>
          </TableCell>
          <TableCell className="text-right px-6 py-4"><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></TableCell>
        </TableRow>
      ));
    }

    if (activeTab === 'sections') {
      if (isLoadingSections) return <SkeletonTable columns={5} />;
      if (!sections || sections.length === 0) return <EmptyState tab="Sections" />;
      return sections.map(s => {
        const offering = offerings?.find(o => o.id === s.courseOfferingId);
        return (
          <TableRow key={s.id}>
            <TableCell className="font-semibold px-6 py-4">{s.name}</TableCell>
            <TableCell className="px-6 py-4">
              {offering ? `${offering.course?.code} - ${offering.semester?.name}` : `Offering ID: ${s.courseOfferingId}`}
            </TableCell>
            <TableCell className="px-6 py-4 text-slate-600">{s.currentEnrollment} / {s.capacity}</TableCell>
            <TableCell className="px-6 py-4">
              <span className={`px-2 py-1 rounded text-xs font-bold ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                {s.isActive ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </TableCell>
            <TableCell className="text-right px-6 py-4">
              {assigningFacultySectionId === s.id ? (
                <form onSubmit={(e) => handleAssignFaculty(e, s.id)} className="flex items-center space-x-2">
                  <select required className="h-8 rounded-md border border-slate-200 px-2 text-sm" value={secFacId} onChange={e => setSecFacId(e.target.value)}>
                    <option value="">Select Faculty...</option>
                    {facultyList?.map(f => <option key={f.id} value={f.id}>{f.username} ({f.email})</option>)}
                  </select>
                  <select required className="h-8 rounded-md border border-slate-200 px-2 text-sm" value={secFacRole} onChange={e => setSecFacRole(e.target.value)}>
                    <option value="CLASS_TEACHER">Class Teacher</option>
                    <option value="SUBJECT_TEACHER">Subject Teacher</option>
                  </select>
                  <Button type="submit" size="sm" className="h-8 bg-black text-white" disabled={assignFaculty.isPending}>Save</Button>
                  <Button type="button" size="sm" variant="outline" className="h-8" onClick={() => setAssigningFacultySectionId(null)}>Cancel</Button>
                </form>
              ) : (
                isAdmin ? (
                  <Button variant="outline" size="sm" onClick={() => setAssigningFacultySectionId(s.id)}>Assign Faculty</Button>
                ) : (
                  <span className="text-xs text-slate-400 italic">View Only</span>
                )
              )}
            </TableCell>
          </TableRow>
        );
      });
    }

    if (activeTab === 'timetable') {
      return (
        <TableRow>
          <TableCell colSpan={6} className="p-0 border-0">
            <div className="p-6">
              <TimetableTab />
            </div>
          </TableCell>
        </TableRow>
      );
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
          <p className="text-slate-500 text-sm">Configure programs, degrees, course catalog, batches, and prerequisites.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeptDialogOpen(true)}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 h-10 px-4 rounded-full text-xs font-semibold"
              >
                <Building2 className="w-3.5 h-3.5 mr-1.5" />
                + Department
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAyDialogOpen(true)}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 h-10 px-4 rounded-full text-xs font-semibold"
              >
                <CalendarDays className="w-3.5 h-3.5 mr-1.5" />
                + Academic Year
              </Button>
            </>
          )}

          {activeTab !== 'timetable' && !isCreating && isAdmin && (
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-black text-white hover:bg-black/80 px-6 rounded-full h-10 text-xs font-semibold"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add {
                activeTab === 'programs' ? 'Program' :
                activeTab === 'courses' ? 'Course' :
                activeTab === 'batches' ? 'Batch' :
                activeTab === 'semesters' ? 'Semester' :
                activeTab === 'offerings' ? 'Offering' : 'Section'
              }
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="flex border-b border-slate-100 px-6 pt-4 space-x-8 overflow-x-auto whitespace-nowrap custom-scrollbar">
          {[
            { id: 'programs', label: '1. Programs', icon: GraduationCap },
            { id: 'courses', label: '2. Catalog', icon: BookOpen },
            { id: 'batches', label: '3. Batches', icon: Users },
            { id: 'semesters', label: '4. Semesters', icon: Calendar },
            { id: 'offerings', label: '5. Offerings', icon: LayoutList },
            { id: 'sections', label: '6. Sections', icon: Users },
            { id: 'timetable', label: '7. Timetable', icon: Calendar }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setIsCreating(false); }}
              className={`pb-4 px-2 text-sm font-semibold flex items-center transition-all border-b-2 ${activeTab === tab.id ? 'border-black text-black' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* 1. Create Program Form */}
        {isCreating && activeTab === 'programs' && (
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <h3 className="text-lg font-bold mb-4">Create New Academic Program</h3>
            <form onSubmit={handleCreateProgram} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Program Code</label>
                <Input required value={progCode} onChange={e => setProgCode(e.target.value)} placeholder="e.g. BTECH-CS" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Program Name</label>
                <Input required value={progName} onChange={e => setProgName(e.target.value)} placeholder="e.g. Bachelor of Technology in CS" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Degree Title</label>
                <select
                  required
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={progDegree}
                  onChange={e => setProgDegree(e.target.value)}
                >
                  <option value="B.Tech">B.Tech</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="B.Sc">B.Sc</option>
                  <option value="M.Sc">M.Sc</option>
                  <option value="BBA">BBA</option>
                  <option value="MBA">MBA</option>
                  <option value="Ph.D">Ph.D</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Years)</label>
                <Input required type="number" min="1" max="6" value={progDuration} onChange={e => setProgDuration(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700">Department</label>
                  <button
                    type="button"
                    onClick={() => setDeptDialogOpen(true)}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    + New Department
                  </button>
                </div>
                <select
                  required
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={progDeptId}
                  onChange={e => setProgDeptId(e.target.value)}
                >
                  <option value="">Select Department...</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
                {departments.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">No departments found. Please create a Department first.</p>
                )}
              </div>
              <div className="md:col-span-2 flex justify-end space-x-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                <Button type="submit" disabled={createProgram.isPending}>
                  {createProgram.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Program
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* 2. Create Course Form */}
        {isCreating && activeTab === 'courses' && (
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <h3 className="text-lg font-bold mb-4">Add Course to Catalog</h3>
            <form onSubmit={handleCreateCourse} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Course Code</label>
                <Input required value={crsCode} onChange={e => setCrsCode(e.target.value)} placeholder="e.g. CS101" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Course Name</label>
                <Input required value={crsName} onChange={e => setCrsName(e.target.value)} placeholder="e.g. Introduction to Programming" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Course Type</label>
                <select
                  required
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={crsType}
                  onChange={e => setCrsType(e.target.value)}
                >
                  <option value="THEORY">Theory</option>
                  <option value="LAB">Lab / Practical</option>
                  <option value="SEMINAR">Seminar</option>
                  <option value="PROJECT">Project / Thesis</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Credits</label>
                <Input required type="number" min="1" max="10" value={crsCredits} onChange={e => setCrsCredits(e.target.value)} />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700">Department</label>
                  <button
                    type="button"
                    onClick={() => setDeptDialogOpen(true)}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    + New
                  </button>
                </div>
                <select
                  required
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={crsDeptId}
                  onChange={e => setCrsDeptId(e.target.value)}
                >
                  <option value="">Select Department...</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Associated Program (Optional)</label>
                <select
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={crsProgId}
                  onChange={e => setCrsProgId(e.target.value)}
                >
                  <option value="">None / Open Elective</option>
                  {programs?.map(p => (
                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end space-x-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                <Button type="submit" disabled={createCourse.isPending}>
                  {createCourse.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Course
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* 3. Create Batch Form */}
        {isCreating && activeTab === 'batches' && (
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <h3 className="text-lg font-bold mb-4">Create Academic Batch</h3>
            <form onSubmit={handleCreateBatch} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Batch Name</label>
                <Input required value={batchName} onChange={e => setBatchName(e.target.value)} placeholder="e.g. 2026 CS Batch" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Batch Code</label>
                <Input required value={batchCode} onChange={e => setBatchCode(e.target.value)} placeholder="e.g. CS-2026" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Program</label>
                <select
                  required
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={batchProgId}
                  onChange={e => setBatchProgId(e.target.value)}
                >
                  <option value="">Select Program...</option>
                  {programs?.map(p => (
                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                  ))}
                </select>
                {!programs?.length && (
                  <p className="text-xs text-red-500 mt-1">No programs found. Please create a Program first.</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year (Optional)</label>
                <select
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={batchAyId}
                  onChange={e => setBatchAyId(e.target.value)}
                >
                  <option value="">Select Academic Year...</option>
                  {academicYears?.map(ay => (
                    <option key={ay.id} value={ay.id}>{ay.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Admission Year</label>
                <Input required type="number" min="2000" max="2100" value={batchAdmYear} onChange={e => setBatchAdmYear(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Graduation Year</label>
                <Input required type="number" min="2000" max="2100" value={batchGradYear} onChange={e => setBatchGradYear(e.target.value)} />
              </div>
              <div className="md:col-span-2 flex justify-end space-x-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                <Button type="submit" disabled={createBatch.isPending}>
                  {createBatch.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Batch
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* 4. Create Semester Form */}
        {isCreating && activeTab === 'semesters' && (
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <h3 className="text-lg font-bold mb-4">Create New Semester</h3>
            <form onSubmit={handleCreateSemester} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Semester Name</label>
                <Input required value={semName} onChange={e => setSemName(e.target.value)} placeholder="e.g. Fall 2026" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Semester Number</label>
                <Input required type="number" min="1" value={semNumber} onChange={e => setSemNumber(e.target.value)} placeholder="e.g. 1" />
              </div>
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700">Academic Year</label>
                  <button
                    type="button"
                    onClick={() => setAyDialogOpen(true)}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    + New Academic Year
                  </button>
                </div>
                <select required className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950" value={semAcademicYear} onChange={e => setSemAcademicYear(e.target.value)}>
                  <option value="">Select Academic Year...</option>
                  {academicYears?.map(ay => (
                    <option key={ay.id} value={ay.id}>{ay.name} ({ay.startDate} - {ay.endDate})</option>
                  ))}
                </select>
                {!academicYears?.length && <p className="text-xs text-red-500 mt-1">No Academic Years found. Please create an Academic Year first.</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                <Input required type="date" value={semStart} onChange={e => setSemStart(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
                <Input required type="date" value={semEnd} onChange={e => setSemEnd(e.target.value)} />
              </div>
              <div className="md:col-span-2 flex justify-end space-x-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                <Button type="submit" disabled={createSemester.isPending}>
                  {createSemester.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Semester
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* 5. Create Offering Form */}
        {isCreating && activeTab === 'offerings' && (
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <h3 className="text-lg font-bold mb-4">Create Course Offering</h3>
            <form onSubmit={handleCreateOffering} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Course</label>
                <select required className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={offCourseId} onChange={e => setOffCourseId(e.target.value)}>
                  <option value="">Select Course...</option>
                  {courses?.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                </select>
                {!courses?.length && <p className="text-xs text-red-500 mt-1">No Courses found. Please add a Course to the catalog first.</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Semester</label>
                <select required className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={offSemesterId} onChange={e => setOffSemesterId(e.target.value)}>
                  <option value="">Select Semester...</option>
                  {semesters?.map(s => <option key={s.id} value={s.id}>{s.name} (Sem {s.semesterNumber})</option>)}
                </select>
                {!semesters?.length && <p className="text-xs text-red-500 mt-1">No Semesters found. Please create a Semester first.</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Max Capacity</label>
                <Input required type="number" min="1" value={offCapacity} onChange={e => setOffCapacity(e.target.value)} placeholder="e.g. 60" />
              </div>
              <div className="md:col-span-2 flex justify-end space-x-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                <Button type="submit" disabled={createOffering.isPending}>
                  {createOffering.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Course Offering
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* 6. Create Section Form */}
        {isCreating && activeTab === 'sections' && (
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <h3 className="text-lg font-bold mb-4">Create Section</h3>
            <form onSubmit={handleCreateSection} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Section Name (e.g. A, B, L1)</label>
                <Input required value={secName} onChange={e => setSecName(e.target.value)} placeholder="e.g. A" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Capacity</label>
                <Input required type="number" min="1" value={secCapacity} onChange={e => setSecCapacity(e.target.value)} placeholder="e.g. 30" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Course Offering</label>
                <select required className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={secCourseOfferingId} onChange={e => setSecCourseOfferingId(e.target.value)}>
                  <option value="">Select Course Offering...</option>
                  {offerings?.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.course?.code} ({o.course?.name}) - {o.semester?.name}
                    </option>
                  ))}
                </select>
                {!offerings?.length && <p className="text-xs text-red-500 mt-1">No Course Offerings available. Please create one first.</p>}
              </div>
              <div className="md:col-span-2 flex justify-end space-x-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                <Button type="submit" disabled={createSection.isPending}>
                  {createSection.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Section
                </Button>
              </div>
            </form>
          </div>
        )}

        {!isCreating && activeTab !== 'timetable' && (
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
        )}

        {!isCreating && activeTab !== 'timetable' && (
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
                ) : activeTab === 'batches' ? (
                  <>
                    <TableHead className="font-semibold px-6 py-4">Batch Code</TableHead>
                    <TableHead className="font-semibold px-6 py-4">Timeline</TableHead>
                  </>
                ) : activeTab === 'semesters' ? (
                  <>
                    <TableHead className="font-semibold px-6 py-4">Name</TableHead>
                    <TableHead className="font-semibold px-6 py-4">Number</TableHead>
                    <TableHead className="font-semibold px-6 py-4">Dates</TableHead>
                  </>
                ) : activeTab === 'offerings' ? (
                  <>
                    <TableHead className="font-semibold px-6 py-4">Course Code</TableHead>
                    <TableHead className="font-semibold px-6 py-4">Course Name</TableHead>
                    <TableHead className="font-semibold px-6 py-4">Semester</TableHead>
                    <TableHead className="font-semibold px-6 py-4">Capacity</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead className="font-semibold px-6 py-4">Section Name</TableHead>
                    <TableHead className="font-semibold px-6 py-4">Course Offering</TableHead>
                    <TableHead className="font-semibold px-6 py-4">Enrollment</TableHead>
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
        )}

        {activeTab === 'timetable' && (
          <Table>
            <TableBody>
              {getTableContent()}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Global Modals */}
      <CreateDepartmentDialog
        open={deptDialogOpen}
        onOpenChange={setDeptDialogOpen}
      />
      <CreateAcademicYearDialog
        open={ayDialogOpen}
        onOpenChange={setAyDialogOpen}
      />
      <CoursePrerequisitesDialog
        course={selectedCourseForPrereqs}
        allCourses={courses}
        open={!!selectedCourseForPrereqs}
        onOpenChange={(open) => {
          if (!open) setSelectedCourseForPrereqs(null);
        }}
        isAdmin={isAdmin}
      />
    </div>
  );
}
