import React, { useState } from 'react';
import { Student } from './types/student';
import { studentService } from './services/studentService';
import { StudentList } from './features/students/StudentList';
import { StudentDetails } from './features/students/StudentDetails';
import { StudentForm } from './features/students/StudentForm';
import { GuardianList } from './features/guardians/GuardianList';
import { ApiDocsViewer } from './features/docs_viewer/ApiDocsViewer';
import { Modal } from './components/ui/Modal/Modal';
import { Toast } from './components/ui/Toast/Toast';
import { 
  GraduationCap, Users, ShieldCheck, FileText, 
  Activity, BookOpen, Layers, ExternalLink 
} from 'lucide-react';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'students' | 'details' | 'guardians' | 'api-docs'>('students');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  // Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleSelectStudent = (id: number) => {
    setSelectedStudentId(id);
    setCurrentView('details');
  };

  const handleOpenAddForm = () => {
    setEditingStudent(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (student: Student) => {
    setEditingStudent(student);
    setIsFormOpen(true);
  };

  const handleSaveStudent = async (formData: any) => {
    try {
      setFormLoading(true);
      if (editingStudent) {
        await studentService.update(editingStudent.id, formData);
        showToast('Student profile updated successfully');
      } else {
        await studentService.create(formData);
        showToast('New student enrolled successfully');
      }
      setIsFormOpen(false);
      setEditingStudent(null);
      // If we were on details view, refresh or go to list
      if (currentView === 'details' && selectedStudentId) {
        // Will re-trigger details fetch
      } else {
        setCurrentView('students');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save student', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid var(--slate-200)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        {/* Brand Logo */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--slate-100)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--primary-600)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', lineHeight: 1.2 }}>
              Institutional ERP
            </h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--primary-600)', fontWeight: 600 }}>
              Version 1.0.0
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate-400)', letterSpacing: '0.05em', padding: '0.5rem 0.75rem' }}>
            Modules (Days 02 - 06)
          </div>

          <button
            onClick={() => {
              setCurrentView('students');
              setSelectedStudentId(null);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.625rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              fontWeight: 500,
              backgroundColor: currentView === 'students' || currentView === 'details' ? 'var(--primary-50)' : 'transparent',
              color: currentView === 'students' || currentView === 'details' ? 'var(--primary-700)' : 'var(--slate-600)',
              textAlign: 'left',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Users size={18} />
            <span>Students (Day 02)</span>
          </button>

          <button
            onClick={() => setCurrentView('guardians')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.625rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              fontWeight: 500,
              backgroundColor: currentView === 'guardians' ? 'var(--primary-50)' : 'transparent',
              color: currentView === 'guardians' ? 'var(--primary-700)' : 'var(--slate-600)',
              textAlign: 'left',
              transition: 'all var(--transition-fast)',
            }}
          >
            <ShieldCheck size={18} />
            <span>Guardians (Day 03)</span>
          </button>

          <button
            onClick={() => {
              setCurrentView('students');
              showToast('Select any student to view or upload their documents');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.625rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--slate-600)',
              textAlign: 'left',
            }}
          >
            <FileText size={18} />
            <span>Documents (Day 04)</span>
          </button>

          <button
            onClick={() => {
              setCurrentView('students');
              showToast('Status transitions and audit history are accessible from student details');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.625rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--slate-600)',
              textAlign: 'left',
            }}
          >
            <Activity size={18} />
            <span>Status Workflow (Day 05)</span>
          </button>

          <button
            onClick={() => setCurrentView('api-docs')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.625rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              fontWeight: 500,
              backgroundColor: currentView === 'api-docs' ? 'var(--primary-50)' : 'transparent',
              color: currentView === 'api-docs' ? 'var(--primary-700)' : 'var(--slate-600)',
              textAlign: 'left',
              transition: 'all var(--transition-fast)',
            }}
          >
            <BookOpen size={18} />
            <span>API Docs & Testing (Day 06)</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--slate-200)', backgroundColor: 'var(--slate-50)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-700)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8125rem', fontWeight: 600 }}>
              PA
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-800)' }}>Palak Agarwal</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--slate-500)' }}>feature/management</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Header */}
        <header className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Layers size={20} color="var(--primary-600)" />
            <span style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>Module:</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-800)' }}>
              {currentView === 'students' && 'Student Profile Directory'}
              {currentView === 'details' && 'Student Profile Details'}
              {currentView === 'guardians' && 'Guardian & Parent Management'}
              {currentView === 'api-docs' && 'API Specifications & Testing'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a
              href="http://localhost:8080/swagger-ui.html"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.8125rem',
                color: 'var(--primary-600)',
                fontWeight: 600,
              }}
            >
              Swagger UI <ExternalLink size={14} />
            </a>
          </div>
        </header>

        {/* Body Views */}
        <div className="page-body">
          {currentView === 'students' && (
            <StudentList
              onSelectStudent={handleSelectStudent}
              onAddStudent={handleOpenAddForm}
              onEditStudent={handleOpenEditForm}
              showToast={showToast}
            />
          )}

          {currentView === 'details' && selectedStudentId && (
            <StudentDetails
              studentId={selectedStudentId}
              onBack={() => {
                setCurrentView('students');
                setSelectedStudentId(null);
              }}
              onEditStudent={handleOpenEditForm}
              showToast={showToast}
            />
          )}

          {currentView === 'guardians' && (
            <GuardianList showToast={showToast} />
          )}

          {currentView === 'api-docs' && (
            <ApiDocsViewer />
          )}
        </div>
      </main>

      {/* Student Form Modal (Add / Edit) */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingStudent(null);
        }}
        title={editingStudent ? 'Edit Student Profile' : 'Enroll New Student'}
        subtitle="Day 02 — Student Profile Module"
        maxWidth="680px"
      >
        <StudentForm
          initialData={editingStudent}
          onSubmit={handleSaveStudent}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingStudent(null);
          }}
          isLoading={formLoading}
        />
      </Modal>

      {/* Global Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
