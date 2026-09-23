import React, { useState, useEffect } from 'react';
import { Student, StudentStatus } from '../../types/student';
import { Guardian, GuardianFormData } from '../../types/guardian';
import { DocumentType, DOCUMENT_TYPE_LABELS, StudentDocument } from '../../types/document';
import { studentService } from '../../services/studentService';
import { guardianService } from '../../services/guardianService';
import { documentService } from '../../services/documentService';
import { Badge } from '../../components/ui/Badge/Badge';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import { Tabs, TabItem } from '../../components/ui/Tabs/Tabs';
import { GuardianModal } from '../guardians/GuardianModal';
import { DocumentUploadModal } from './DocumentUploadModal';
import { StudentStatusModal } from './StudentStatusModal';
import { 
  ArrowLeft, Edit3, UserCheck, Phone, Mail, MapPin, 
  Calendar, BookOpen, ShieldAlert, Plus, Download, Eye, Trash2, 
  FileText, Clock, User
} from 'lucide-react';

interface StudentDetailsProps {
  studentId: number;
  onBack: () => void;
  onEditStudent: (student: Student) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export const StudentDetails: React.FC<StudentDetailsProps> = ({
  studentId,
  onBack,
  onEditStudent,
  showToast,
}) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [statusHistory, setStatusHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isGuardianModalOpen, setIsGuardianModalOpen] = useState(false);
  const [selectedGuardian, setSelectedGuardian] = useState<Guardian | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchStudentData = async () => {
    try {
      setIsLoading(true);
      const data = await studentService.getById(studentId);
      setStudent(data);

      const [grds, docs, history] = await Promise.all([
        guardianService.getByStudentId(studentId).catch(() => []),
        documentService.getByStudentId(studentId).catch(() => []),
        studentService.getStatusHistory(studentId).catch(() => []),
      ]);

      setGuardians(grds);
      setDocuments(docs);
      setStatusHistory(history);
    } catch (err: any) {
      showToast(err.message || 'Failed to load student details', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  // Status Change Handler (Day 05)
  const handleUpdateStatus = async (sId: number, status: StudentStatus, reason: string) => {
    try {
      setModalLoading(true);
      await studentService.updateStatus(sId, { status, reason, changedBy: 'admin' });
      showToast(`Student status updated to ${status}`);
      await fetchStudentData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Guardian Handlers (Day 03)
  const handleSaveGuardian = async (formData: GuardianFormData) => {
    try {
      setModalLoading(true);
      if (selectedGuardian) {
        await guardianService.update(selectedGuardian.id, formData);
        showToast('Guardian updated successfully');
      } else {
        await guardianService.addToStudent(studentId, formData);
        showToast('Guardian added and linked to student');
      }
      setSelectedGuardian(null);
      const updatedGuardians = await guardianService.getByStudentId(studentId);
      setGuardians(updatedGuardians);
    } catch (err: any) {
      showToast(err.message || 'Failed to save guardian', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteGuardian = async (guardianId: number) => {
    if (!window.confirm('Are you sure you want to remove this guardian?')) return;
    try {
      await guardianService.delete(guardianId);
      showToast('Guardian removed successfully');
      setGuardians((prev) => prev.filter((g) => g.id !== guardianId));
    } catch (err: any) {
      showToast(err.message || 'Failed to delete guardian', 'error');
    }
  };

  // Document Handlers (Day 04)
  const handleUploadDocument = async (sId: number, documentType: DocumentType, file: File) => {
    try {
      setModalLoading(true);
      await documentService.upload(sId, documentType, file);
      showToast(`${DOCUMENT_TYPE_LABELS[documentType]} uploaded successfully`);
      const updatedDocs = await documentService.getByStudentId(sId);
      setDocuments(updatedDocs);
    } catch (err: any) {
      showToast(err.message || 'Failed to upload document', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteDocument = async (docId: number) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await documentService.delete(docId);
      showToast('Document deleted successfully');
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err: any) {
      showToast(err.message || 'Failed to delete document', 'error');
    }
  };

  if (isLoading || !student) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <span style={{ fontSize: '1rem', color: 'var(--slate-500)' }}>Loading student profile...</span>
      </div>
    );
  }

  const tabs: TabItem[] = [
    { id: 'overview', label: 'Overview', icon: <User size={16} /> },
    { id: 'guardians', label: 'Guardians & Parents', badge: guardians.length, icon: <Phone size={16} /> },
    { id: 'documents', label: 'Documents', badge: documents.length, icon: <FileText size={16} /> },
    { id: 'history', label: 'Status Audit History', badge: statusHistory.length, icon: <Clock size={16} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--slate-600)',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={18} />
          Back to Students List
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<UserCheck size={16} />}
            onClick={() => setIsStatusModalOpen(true)}
          >
            Change Status
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Edit3 size={16} />}
            onClick={() => onEditStudent(student)}
          >
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Profile Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          color: '#ffffff',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 700,
              border: '2px solid rgba(255, 255, 255, 0.4)',
            }}
          >
            {student.firstName[0]}
            {student.lastName[0]}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{student.fullName}</h2>
              <Badge status={student.status} />
            </div>
            <p style={{ opacity: 0.85, fontSize: '0.9375rem' }}>
              Roll No: <span style={{ fontWeight: 600 }}>{student.rollNumber}</span> • {student.department}
            </p>
            <p style={{ opacity: 0.75, fontSize: '0.8125rem', marginTop: '0.25rem' }}>
              Batch: {student.batch} • {student.program || 'Degree Program'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '2rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)', backdropFilter: 'blur(6px)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Guardians</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{guardians.length}</div>
          </div>
          <div style={{ width: '1px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
          <div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Documents</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{documents.length}</div>
          </div>
          <div style={{ width: '1px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
          <div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Enrolled</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{new Date(student.enrollmentDate).getFullYear()}</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          <Card title="Academic Information">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>Department</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-800)' }}>{student.department}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>Program</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-800)' }}>{student.program || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>Academic Batch</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-800)' }}>{student.batch}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>Enrollment Date</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-800)' }}>{student.enrollmentDate}</span>
              </div>
            </div>
          </Card>

          <Card title="Personal & Contact Details">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>Email</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-800)' }}>{student.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>Phone</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-800)' }}>{student.phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>Date of Birth</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-800)' }}>{student.dateOfBirth}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>Gender & Blood Group</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-800)' }}>
                  {student.gender} {student.bloodGroup ? `(${student.bloodGroup})` : ''}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>Address</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-800)', textAlign: 'right' }}>
                  {[student.address, student.city, student.state, student.pincode].filter(Boolean).join(', ') || 'N/A'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Guardians (Day 03) */}
      {activeTab === 'guardians' && (
        <Card
          title="Guardian Management (Day 03)"
          subtitle="Family members and legal guardians linked to this student"
          headerAction={
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Plus size={16} />}
              onClick={() => {
                setSelectedGuardian(null);
                setIsGuardianModalOpen(true);
              }}
            >
              Add Guardian
            </Button>
          }
        >
          {guardians.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <ShieldAlert size={40} color="var(--slate-400)" style={{ margin: '0 auto 1rem' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--slate-700)' }}>No Guardians Linked</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                Click 'Add Guardian' to link a parent or legal guardian to this student profile.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {guardians.map((g) => (
                <div
                  key={g.id}
                  style={{
                    border: '1px solid var(--slate-200)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    backgroundColor: 'var(--slate-50)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--slate-900)' }}>
                          {g.fullName}
                        </h4>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--primary-700)', fontWeight: 500 }}>
                          {g.relation}
                        </span>
                      </div>
                      {g.isEmergencyContact && (
                        <span style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                          Emergency Contact
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--slate-600)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Phone size={14} color="var(--slate-400)" /> {g.phone}
                      </div>
                      {g.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Mail size={14} color="var(--slate-400)" /> {g.email}
                        </div>
                      )}
                      {g.occupation && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <BookOpen size={14} color="var(--slate-400)" /> {g.occupation}
                        </div>
                      )}
                      {g.address && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <MapPin size={14} color="var(--slate-400)" /> {g.address}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--slate-200)', paddingTop: '0.75rem' }}>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedGuardian(g);
                        setIsGuardianModalOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteGuardian(g.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab 3: Documents (Day 04) */}
      {activeTab === 'documents' && (
        <Card
          title="Student Documents (Day 04)"
          subtitle="Aadhaar, Transfer Certificate, Migration, Marksheets, and Photographs"
          headerAction={
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Plus size={16} />}
              onClick={() => setIsDocModalOpen(true)}
            >
              Upload Document
            </Button>
          }
        >
          {documents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <FileText size={40} color="var(--slate-400)" style={{ margin: '0 auto 1rem' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--slate-700)' }}>No Documents Uploaded</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                Upload required verification documents (Aadhaar, TC, Marksheet, etc.)
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    border: '1px solid var(--slate-200)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{ padding: '0.625rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary-50)', color: 'var(--primary-600)' }}>
                        <FileText size={22} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--slate-900)' }}>
                          {DOCUMENT_TYPE_LABELS[doc.documentType] || doc.documentType}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                          {doc.originalFileName}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.5rem' }}>
                      <span>Size: {doc.formattedSize || (doc.fileSize / 1024).toFixed(1) + ' KB'}</span>
                      <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--slate-100)', paddingTop: '0.75rem' }}>
                    <a
                      href={documentService.getViewUrl(doc.id)}
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: 'none' }}
                    >
                      <Button size="sm" variant="outline" leftIcon={<Eye size={14} />}>
                        View
                      </Button>
                    </a>
                    <a
                      href={documentService.getDownloadUrl(doc.id)}
                      download={doc.originalFileName}
                      style={{ textDecoration: 'none' }}
                    >
                      <Button size="sm" variant="outline" leftIcon={<Download size={14} />}>
                        Download
                      </Button>
                    </a>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteDocument(doc.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab 4: Status Audit History (Day 05) */}
      {activeTab === 'history' && (
        <Card
          title="Enrollment Status Audit Trail (Day 05)"
          subtitle="Chronological record of status changes for administrative verification"
        >
          {statusHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>No status transitions recorded yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', paddingLeft: '1.5rem' }}>
              <div style={{ position: 'absolute', top: '10px', bottom: '10px', left: '6px', width: '2px', backgroundColor: 'var(--slate-200)' }} />
              {statusHistory.map((item, index) => (
                <div key={item.id || index} style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-1.45rem', top: '4px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--primary-600)', border: '2px solid #ffffff' }} />
                  <div style={{ backgroundColor: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--slate-200)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
                      {item.previousStatus && (
                        <>
                          <Badge status={item.previousStatus} />
                          <span style={{ fontSize: '0.8125rem', color: 'var(--slate-400)' }}>→</span>
                        </>
                      )}
                      <Badge status={item.newStatus} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginLeft: 'auto' }}>
                        {new Date(item.changedAt).toLocaleString()}
                      </span>
                    </div>
                    {item.reason && (
                      <p style={{ fontSize: '0.8125rem', color: 'var(--slate-700)', marginTop: '0.25rem' }}>
                        <strong>Reason:</strong> {item.reason}
                      </p>
                    )}
                    {item.changedBy && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'block', marginTop: '0.25rem' }}>
                        Logged by: {item.changedBy}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Modals */}
      <GuardianModal
        isOpen={isGuardianModalOpen}
        onClose={() => {
          setIsGuardianModalOpen(false);
          setSelectedGuardian(null);
        }}
        initialData={selectedGuardian}
        studentId={student.id}
        studentName={student.fullName}
        onSubmit={handleSaveGuardian}
        isLoading={modalLoading}
      />

      <DocumentUploadModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        studentId={student.id}
        studentName={student.fullName}
        onUpload={handleUploadDocument}
        isLoading={modalLoading}
      />

      <StudentStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        student={student}
        onUpdateStatus={handleUpdateStatus}
        isLoading={modalLoading}
      />
    </div>
  );
};
