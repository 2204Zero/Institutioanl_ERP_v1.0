import React, { useState, useEffect } from 'react';
import { Student, StudentStatus } from '../../types/student';
import { studentService, StudentFilterParams } from '../../services/studentService';
import { Badge } from '../../components/ui/Badge/Badge';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import { StudentStatusModal } from './StudentStatusModal';
import { 
  Search, Plus, Eye, Edit3, Trash2, Filter, 
  ChevronLeft, ChevronRight, UserCheck, Users, 
  CheckCircle2, AlertOctagon, GraduationCap 
} from 'lucide-react';

interface StudentListProps {
  onSelectStudent: (studentId: number) => void;
  onAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export const StudentList: React.FC<StudentListProps> = ({
  onSelectStudent,
  onAddStudent,
  onEditStudent,
  showToast,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 8;

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StudentStatus | ''>('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Status Modal State
  const [statusModalStudent, setStatusModalStudent] = useState<Student | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Metrics
  const [metrics, setMetrics] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    graduated: 0,
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params: StudentFilterParams = {
        page: currentPage,
        size: pageSize,
        search: searchTerm,
        status: statusFilter,
        department: departmentFilter,
        sortBy: 'id',
        sortDir: 'desc',
      };
      const res = await studentService.getAll(params);
      setStudents(res.content);
      setTotalElements(res.totalElements);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch students', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const allRes = await studentService.getAll({ size: 100 });
      const all = allRes.content;
      setMetrics({
        total: allRes.totalElements,
        active: all.filter((s) => s.status === 'ACTIVE').length,
        suspended: all.filter((s) => s.status === 'SUSPENDED').length,
        graduated: all.filter((s) => s.status === 'GRADUATED' || s.status === 'ALUMNI').length,
      });
    } catch {
      // Ignore background metrics failure
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [currentPage, statusFilter, departmentFilter]);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchStudents();
  };

  const handleDelete = async (student: Student) => {
    if (!window.confirm(`Are you sure you want to delete student ${student.fullName} (${student.rollNumber})? This will also remove linked guardians and documents.`)) {
      return;
    }
    try {
      await studentService.delete(student.id);
      showToast('Student deleted successfully');
      await fetchStudents();
      await fetchMetrics();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete student', 'error');
    }
  };

  const handleStatusUpdate = async (studentId: number, status: StudentStatus, reason: string) => {
    try {
      await studentService.updateStatus(studentId, { status, reason, changedBy: 'admin' });
      showToast('Student status updated');
      await fetchStudents();
      await fetchMetrics();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Metric Cards Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-600)' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', fontWeight: 500 }}>Total Students</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--slate-900)' }}>{metrics.total}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success-dot)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', fontWeight: 500 }}>Active Students</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--slate-900)' }}>{metrics.active}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger-dot)' }}>
            <AlertOctagon size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', fontWeight: 500 }}>Suspended Holds</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--slate-900)' }}>{metrics.suspended}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--purple-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--purple-dot)' }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', fontWeight: 500 }}>Graduated / Alumni</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--slate-900)' }}>{metrics.graduated}</div>
          </div>
        </div>
      </div>

      {/* Control Header & Action Bar */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '280px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} color="var(--slate-400)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student name, roll number, or email..."
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--slate-300)',
                  outline: 'none',
                  fontSize: '0.875rem',
                }}
              />
            </div>
            <Button type="submit" variant="secondary" size="md">
              Search
            </Button>
          </form>

          {/* Department Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={16} color="var(--slate-500)" />
              <select
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  setCurrentPage(0);
                }}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--slate-300)',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="">All Departments</option>
                <option value="Computer Science and Engineering">Computer Science & Eng</option>
                <option value="Electronics and Communication Engineering">Electronics & Comm</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Information Technology">Information Technology</option>
              </select>
            </div>

            <Button variant="primary" leftIcon={<Plus size={16} />} onClick={onAddStudent}>
              Add Student
            </Button>
          </div>
        </div>

        {/* Status Filter Tabs (Day 05) */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.75rem', marginBottom: '1rem', overflowX: 'auto' }}>
          {[
            { value: '', label: 'All Statuses' },
            { value: 'ACTIVE', label: 'Active' },
            { value: 'INACTIVE', label: 'Inactive' },
            { value: 'SUSPENDED', label: 'Suspended' },
            { value: 'GRADUATED', label: 'Graduated' },
            { value: 'ALUMNI', label: 'Alumni' },
          ].map((pill) => {
            const isSelected = statusFilter === pill.value;
            return (
              <button
                key={pill.value}
                onClick={() => {
                  setStatusFilter(pill.value as StudentStatus | '');
                  setCurrentPage(0);
                }}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8125rem',
                  fontWeight: isSelected ? 600 : 500,
                  backgroundColor: isSelected ? 'var(--primary-600)' : 'var(--slate-100)',
                  color: isSelected ? '#ffffff' : 'var(--slate-600)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* Student Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--slate-200)', backgroundColor: 'var(--slate-50)' }}>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-600)', fontWeight: 600 }}>Roll Number</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-600)', fontWeight: 600 }}>Student Name</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-600)', fontWeight: 600 }}>Department & Batch</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-600)', fontWeight: 600 }}>Contact</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-600)', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--slate-600)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
                    Loading student records...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
                    No student records found matching the criteria.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr
                    key={student.id}
                    style={{
                      borderBottom: '1px solid var(--slate-100)',
                      transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--slate-50)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--primary-700)' }}>
                      {student.rollNumber}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{student.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{student.email}</div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ color: 'var(--slate-800)' }}>{student.department}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Batch {student.batch}</div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--slate-600)' }}>
                      {student.phone}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <Badge status={student.status} />
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onSelectStudent(student.id)}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEditStudent(student)}
                          title="Edit Student"
                        >
                          <Edit3 size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setStatusModalStudent(student);
                            setIsStatusModalOpen(true);
                          }}
                          title="Update Status"
                        >
                          <UserCheck size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(student)}
                          title="Delete Student"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--slate-100)' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
              Showing {students.length} of {totalElements} students
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft size={16} /> Previous
              </Button>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-700)', padding: '0 0.5rem' }}>
                Page {currentPage + 1} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Quick Status Modal */}
      <StudentStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setStatusModalStudent(null);
        }}
        student={statusModalStudent}
        onUpdateStatus={handleStatusUpdate}
      />
    </div>
  );
};
