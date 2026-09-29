import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useERP } from '../hooks/useERP';
import { logBackendAction } from '../utils/backendLogger';
import {
  BookOpen,
  FileText,
  Video,
  Download,
  Upload,
  MessageSquare,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';

interface MaterialItem {
  id: string;
  courseCode: string;
  title: string;
  type: 'PDF' | 'Video' | 'Notes';
  uploadedBy: string;
  date: string;
  size: string;
  downloads: number;
}

const initialMaterials: MaterialItem[] = [
  { id: 'm-1', courseCode: 'CS301', title: 'Chapter 4: Relational Algebra & SQL Normalization', type: 'PDF', uploadedBy: 'Dr. Sunita Rao', date: '2026-09-20', size: '4.2 MB', downloads: 142 },
  { id: 'm-2', courseCode: 'CS304', title: 'Video Lecture: Consensus Algorithms (Raft & Paxos)', type: 'Video', uploadedBy: 'Prof. Ankit Patel', date: '2026-09-22', size: '185 MB', downloads: 98 },
  { id: 'm-3', courseCode: 'CS308', title: 'Lecture Notes: TCP/IP Congestion Control Mechanisms', type: 'Notes', uploadedBy: 'Dr. Priya Desai', date: '2026-09-24', size: '2.8 MB', downloads: 115 },
];

export const LMSPage: React.FC = () => {
  const { addToast } = useERP();
  const [activeTab, setActiveTab] = useState<'materials' | 'assignments' | 'discussions' | 'facilities'>('materials');
  const [materials, setMaterials] = useState<MaterialItem[]>(initialMaterials);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDownload = (title: string, code: string) => {
    logBackendAction(
      `Downloaded LMS Learning Material: ${title} (${code})`,
      `/api/v1/lms/materials/download`,
      'GET',
      200,
      'student.aarav',
      18
    );
    addToast('Download Started', `Downloading "${title}"`, 'success');
  };

  const handleUploadMaterial = () => {
    const newId = `m-${Date.now()}`;
    const newMat: MaterialItem = {
      id: newId,
      courseCode: 'CS301',
      title: 'Lab Exercise 5: Indexing Performance Benchmarks',
      type: 'PDF',
      uploadedBy: 'Dr. Sunita Rao',
      date: new Date().toISOString().slice(0, 10),
      size: '3.1 MB',
      downloads: 0,
    };
    setMaterials((prev) => [newMat, ...prev]);
    logBackendAction(
      `Uploaded New LMS Learning Resource for CS301`,
      `/api/v1/lms/materials/upload`,
      'POST',
      201,
      'faculty.sunita',
      32
    );
    addToast('Material Published', 'Resource uploaded to course portal.', 'success');
  };

  return (
    <AppLayout>
      <div className="space-y-6 text-left">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-brand-600 dark:text-purple-400" /> Enterprise Learning Management System (LMS)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Course notes, recorded lectures, assignment submissions, discussion forums & facility booking.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={handleUploadMaterial}>
            <Upload className="w-4 h-4 mr-1.5" /> Upload Resource
          </Button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-brand-600">
            <p className="text-xs font-semibold text-slate-500 uppercase">Active Courses</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">24 Courses</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Semester 5 Current</span>
          </Card>
          <Card className="p-4 border-l-4 border-l-purple-600">
            <p className="text-xs font-semibold text-slate-500 uppercase">Uploaded Materials</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">450 Resources</h3>
            <span className="text-[11px] text-purple-600 font-medium">PDFs, Videos, Slides</span>
          </Card>
          <Card className="p-4 border-l-4 border-l-emerald-600">
            <p className="text-xs font-semibold text-slate-500 uppercase">Assignment Submissions</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">98.4% Rate</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Graded by Faculty</span>
          </Card>
          <Card className="p-4 border-l-4 border-l-amber-500">
            <p className="text-xs font-semibold text-slate-500 uppercase">Peer Discussions</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">128 Threads</h3>
            <span className="text-[11px] text-amber-600 font-medium">Active Forum Conversations</span>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          {[
            { id: 'materials', label: 'Learning Materials', icon: FileText },
            { id: 'assignments', label: 'Assignments & Projects', icon: Calendar },
            { id: 'discussions', label: 'Discussion Forum', icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-brand-600 dark:bg-purple-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Materials Tab */}
        {activeTab === 'materials' && (
          <Card className="p-4 space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <Input
                placeholder="Search resources by course, title, faculty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            <div className="space-y-3">
              {materials
                .filter((m) => m.title.toLowerCase().includes(searchTerm.toLowerCase()) || m.courseCode.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((m) => (
                  <div key={m.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-brand-50 dark:bg-purple-950/50 text-brand-600 dark:text-purple-400 border border-brand-200 dark:border-purple-800">
                        {m.type === 'Video' ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-brand-600 dark:text-purple-400">{m.courseCode}</span>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{m.title}</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Uploaded by {m.uploadedBy} • {m.date} • {m.size}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 font-mono hidden sm:inline">{m.downloads} downloads</span>
                      <Button variant="outline" size="sm" onClick={() => handleDownload(m.title, m.courseCode)}>
                        <Download className="w-3.5 h-3.5 mr-1" /> Download
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <Card className="p-4 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Current Course Assignments & Deadlines</h3>
            <div className="space-y-3">
              {[
                { code: 'CS301', title: 'Assignment 3: B-Tree Index Implementation in C++', due: 'Oct 04, 2026', points: '100 Marks', status: 'Pending' },
                { code: 'CS304', title: 'Lab Project: Distributed Mutex Raft Algorithm', due: 'Oct 08, 2026', points: '150 Marks', status: 'Submitted' },
              ].map((a, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-brand-600 dark:text-purple-400">{a.code}</span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{a.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Due: {a.due} • {a.points}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {a.status === 'Submitted' ? <Badge variant="success">Submitted</Badge> : <Badge variant="warning">Pending</Badge>}
                    <Button variant="primary" size="sm" onClick={() => addToast('Submit File', 'Opening file submission dialog...', 'info')}>
                      Upload File
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Discussions Tab */}
        {activeTab === 'discussions' && (
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Peer Discussion Forum & Q&A</h3>
              <Button variant="outline" size="sm" onClick={() => addToast('New Thread', 'Opening discussion prompt...', 'info')}>
                <Plus className="w-3.5 h-3.5 mr-1" /> New Thread
              </Button>
            </div>

            <div className="space-y-3">
              {[
                { title: 'Query Optimization in PostgreSQL vs Oracle Database', author: 'Aarav Sharma (Student)', course: 'CS301', replies: 6 },
                { title: 'Clarification on Lab Assignment 3: Distributed Mutex', author: 'Prof. Ankit Patel (Faculty)', course: 'CS304', replies: 12 },
              ].map((d, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-brand-600 dark:text-purple-400 bg-brand-50 dark:bg-purple-950/60 px-2 py-0.5 rounded">
                      {d.course}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">{d.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Started by {d.author}</p>
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300">
                    {d.replies} Replies
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};
