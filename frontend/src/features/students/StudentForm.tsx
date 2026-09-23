import React, { useState, useEffect } from 'react';
import { Student, StudentFormData, StudentStatus } from '../../types/student';
import { Input } from '../../components/ui/Input/Input';
import { Select } from '../../components/ui/Select/Select';
import { Button } from '../../components/ui/Button/Button';

interface StudentFormProps {
  initialData?: Student | null;
  onSubmit: (data: StudentFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const StudentForm: React.FC<StudentFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<StudentFormData>({
    rollNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'MALE',
    bloodGroup: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    department: 'Computer Science and Engineering',
    program: 'B.Tech CSE',
    batch: '2023-2027',
    enrollmentDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        rollNumber: initialData.rollNumber || '',
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        dateOfBirth: initialData.dateOfBirth || '',
        gender: initialData.gender || 'MALE',
        bloodGroup: initialData.bloodGroup || '',
        address: initialData.address || '',
        city: initialData.city || '',
        state: initialData.state || '',
        pincode: initialData.pincode || '',
        department: initialData.department || '',
        program: initialData.program || '',
        batch: initialData.batch || '',
        enrollmentDate: initialData.enrollmentDate || '',
        status: initialData.status || 'ACTIVE',
      });
    }
  }, [initialData]);

  const handleChange = (field: keyof StudentFormData, value: string) => {
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
    if (!formData.rollNumber.trim()) errs.rollNumber = 'Roll number is required';
    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Invalid email address';
    }
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    if (!formData.dateOfBirth) errs.dateOfBirth = 'Date of birth is required';
    if (!formData.department.trim()) errs.department = 'Department is required';
    if (!formData.batch.trim()) errs.batch = 'Batch is required';
    if (!formData.enrollmentDate) errs.enrollmentDate = 'Enrollment date is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <Input
          label="Roll Number"
          required
          value={formData.rollNumber}
          onChange={(e) => handleChange('rollNumber', e.target.value)}
          error={errors.rollNumber}
          placeholder="e.g. 2024-CSE-045"
        />
        <Select
          label="Initial Status"
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value as StudentStatus)}
          options={[
            { value: 'ACTIVE', label: 'Active' },
            { value: 'INACTIVE', label: 'Inactive' },
            { value: 'SUSPENDED', label: 'Suspended' },
            { value: 'GRADUATED', label: 'Graduated' },
            { value: 'ALUMNI', label: 'Alumni' },
          ]}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <Input
          label="First Name"
          required
          value={formData.firstName}
          onChange={(e) => handleChange('firstName', e.target.value)}
          error={errors.firstName}
          placeholder="First name"
        />
        <Input
          label="Last Name"
          required
          value={formData.lastName}
          onChange={(e) => handleChange('lastName', e.target.value)}
          error={errors.lastName}
          placeholder="Last name"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <Input
          label="Email Address"
          type="email"
          required
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          placeholder="student@college.edu"
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <Input
          label="Date of Birth"
          type="date"
          required
          value={formData.dateOfBirth}
          onChange={(e) => handleChange('dateOfBirth', e.target.value)}
          error={errors.dateOfBirth}
        />
        <Select
          label="Gender"
          required
          value={formData.gender}
          onChange={(e) => handleChange('gender', e.target.value)}
          options={[
            { value: 'MALE', label: 'Male' },
            { value: 'FEMALE', label: 'Female' },
            { value: 'OTHER', label: 'Other' },
          ]}
        />
        <Select
          label="Blood Group"
          value={formData.bloodGroup || ''}
          onChange={(e) => handleChange('bloodGroup', e.target.value)}
          placeholder="Select Blood Group"
          options={[
            { value: 'A+', label: 'A+' },
            { value: 'A-', label: 'A-' },
            { value: 'B+', label: 'B+' },
            { value: 'B-', label: 'B-' },
            { value: 'O+', label: 'O+' },
            { value: 'O-', label: 'O-' },
            { value: 'AB+', label: 'AB+' },
            { value: 'AB-', label: 'AB-' },
          ]}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <Select
          label="Department"
          required
          value={formData.department}
          onChange={(e) => handleChange('department', e.target.value)}
          options={[
            { value: 'Computer Science and Engineering', label: 'Computer Science & Engineering' },
            { value: 'Electronics and Communication Engineering', label: 'Electronics & Communication' },
            { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
            { value: 'Civil Engineering', label: 'Civil Engineering' },
            { value: 'Information Technology', label: 'Information Technology' },
          ]}
        />
        <Input
          label="Program / Degree"
          value={formData.program || ''}
          onChange={(e) => handleChange('program', e.target.value)}
          placeholder="e.g. B.Tech Computer Science"
        />
        <Input
          label="Academic Batch"
          required
          value={formData.batch}
          onChange={(e) => handleChange('batch', e.target.value)}
          error={errors.batch}
          placeholder="e.g. 2023-2027"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <Input
          label="Enrollment Date"
          type="date"
          required
          value={formData.enrollmentDate}
          onChange={(e) => handleChange('enrollmentDate', e.target.value)}
          error={errors.enrollmentDate}
        />
        <Input
          label="City"
          value={formData.city || ''}
          onChange={(e) => handleChange('city', e.target.value)}
          placeholder="e.g. New Delhi"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
        <Input
          label="Permanent Address"
          value={formData.address || ''}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Street address, apartment"
        />
        <Input
          label="Pincode"
          value={formData.pincode || ''}
          onChange={(e) => handleChange('pincode', e.target.value)}
          placeholder="110001"
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Update Student' : 'Save Student'}
        </Button>
      </div>
    </form>
  );
};
