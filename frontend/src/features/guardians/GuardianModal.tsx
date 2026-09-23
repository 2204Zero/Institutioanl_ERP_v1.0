import React, { useState, useEffect } from 'react';
import { Guardian, GuardianFormData } from '../../types/guardian';
import { Modal } from '../../components/ui/Modal/Modal';
import { Input } from '../../components/ui/Input/Input';
import { Select } from '../../components/ui/Select/Select';
import { Button } from '../../components/ui/Button/Button';

interface GuardianModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Guardian | null;
  studentId?: number;
  studentName?: string;
  onSubmit: (data: GuardianFormData) => Promise<void>;
  isLoading?: boolean;
}

export const GuardianModal: React.FC<GuardianModalProps> = ({
  isOpen,
  onClose,
  initialData,
  studentId,
  studentName,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<GuardianFormData>({
    studentId,
    firstName: '',
    lastName: '',
    relation: 'FATHER',
    phone: '',
    email: '',
    occupation: '',
    address: '',
    isEmergencyContact: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        studentId: initialData.studentId || studentId,
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        relation: initialData.relation || 'FATHER',
        phone: initialData.phone || '',
        email: initialData.email || '',
        occupation: initialData.occupation || '',
        address: initialData.address || '',
        isEmergencyContact: initialData.isEmergencyContact ?? false,
      });
    } else {
      setFormData({
        studentId,
        firstName: '',
        lastName: '',
        relation: 'FATHER',
        phone: '',
        email: '',
        occupation: '',
        address: '',
        isEmergencyContact: false,
      });
    }
    setErrors({});
  }, [initialData, studentId, isOpen]);

  const handleChange = (field: keyof GuardianFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required';
    if (!formData.relation.trim()) errs.relation = 'Relation is required';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Guardian Details' : 'Add Guardian'}
      subtitle={studentName ? `Linking with student: ${studentName}` : undefined}
      maxWidth="520px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <Input
            label="First Name"
            required
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            error={errors.firstName}
            placeholder="Guardian's first name"
          />
          <Input
            label="Last Name"
            required
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            error={errors.lastName}
            placeholder="Guardian's last name"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <Select
            label="Relationship to Student"
            required
            value={formData.relation}
            onChange={(e) => handleChange('relation', e.target.value)}
            options={[
              { value: 'FATHER', label: 'Father' },
              { value: 'MOTHER', label: 'Mother' },
              { value: 'LEGAL_GUARDIAN', label: 'Legal Guardian' },
              { value: 'OTHER', label: 'Other Family Member' },
            ]}
          />
          <Input
            label="Phone Number"
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={errors.phone}
            placeholder="+919876543210"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <Input
            label="Email Address"
            type="email"
            value={formData.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="guardian@example.com"
          />
          <Input
            label="Occupation"
            value={formData.occupation || ''}
            onChange={(e) => handleChange('occupation', e.target.value)}
            placeholder="e.g. Software Engineer"
          />
        </div>

        <Input
          label="Residential Address"
          value={formData.address || ''}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Address if different from student"
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginTop: '0.25rem' }}>
          <input
            type="checkbox"
            id="emergencyContact"
            checked={formData.isEmergencyContact}
            onChange={(e) => handleChange('isEmergencyContact', e.target.checked)}
            style={{ width: '1.125rem', height: '1.125rem', accentColor: 'var(--primary-600)', cursor: 'pointer' }}
          />
          <label htmlFor="emergencyContact" style={{ fontSize: '0.875rem', color: 'var(--slate-700)', cursor: 'pointer' }}>
            Designate as primary emergency contact
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {initialData ? 'Update Guardian' : 'Save Guardian'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
