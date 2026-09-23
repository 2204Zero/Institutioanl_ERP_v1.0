import React, { useState } from 'react';
import { Student, StudentStatus } from '../../types/student';
import { Modal } from '../../components/ui/Modal/Modal';
import { Select } from '../../components/ui/Select/Select';
import { Button } from '../../components/ui/Button/Button';
import { Badge } from '../../components/ui/Badge/Badge';

interface StudentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onUpdateStatus: (studentId: number, status: StudentStatus, reason: string) => Promise<void>;
  isLoading?: boolean;
}

export const StudentStatusModal: React.FC<StudentStatusModalProps> = ({
  isOpen,
  onClose,
  student,
  onUpdateStatus,
  isLoading = false,
}) => {
  const [newStatus, setNewStatus] = useState<StudentStatus>('ACTIVE');
  const [reason, setReason] = useState('');

  React.useEffect(() => {
    if (student) {
      setNewStatus(student.status);
      setReason('');
    }
  }, [student]);

  if (!student) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateStatus(student.id, newStatus, reason);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Enrollment Status"
      subtitle={`Student: ${student.fullName} (${student.rollNumber})`}
      maxWidth="480px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--slate-200)' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--slate-600)' }}>Current Status:</span>
          <Badge status={student.status} />
        </div>

        <Select
          label="New Status"
          required
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value as StudentStatus)}
          options={[
            { value: 'ACTIVE', label: 'Active - Enrolled and in good standing' },
            { value: 'INACTIVE', label: 'Inactive - Temporarily on leave' },
            { value: 'SUSPENDED', label: 'Suspended - Disciplinary or attendance hold' },
            { value: 'GRADUATED', label: 'Graduated - Completed program requirements' },
            { value: 'ALUMNI', label: 'Alumni - Registered in institutional alumni body' },
          ]}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)' }}>
            Reason / Remarks for Status Transition
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Provide context or administrative reason for this status change..."
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--slate-300)',
              outline: 'none',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Update Status
          </Button>
        </div>
      </form>
    </Modal>
  );
};
