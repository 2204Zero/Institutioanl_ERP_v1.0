import React, { useState } from 'react';
import { DocumentType, DOCUMENT_TYPE_LABELS } from '../../types/document';
import { Modal } from '../../components/ui/Modal/Modal';
import { Select } from '../../components/ui/Select/Select';
import { Button } from '../../components/ui/Button/Button';
import { UploadCloud, FileText } from 'lucide-react';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: number;
  studentName?: string;
  onUpload: (studentId: number, documentType: DocumentType, file: File) => Promise<void>;
  isLoading?: boolean;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName,
  onUpload,
  isLoading = false,
}) => {
  const [documentType, setDocumentType] = useState<DocumentType>('AADHAAR');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const documentOptions = Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must not exceed 10 MB');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }
    await onUpload(studentId, documentType, selectedFile);
    setSelectedFile(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Student Document"
      subtitle={studentName ? `Uploading document for: ${studentName}` : undefined}
      maxWidth="480px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Select
          label="Document Type"
          required
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value as DocumentType)}
          options={documentOptions}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)' }}>
            Select File (PDF, PNG, JPG - Max 10MB) <span style={{ color: 'var(--danger-dot)' }}>*</span>
          </label>
          <div
            style={{
              border: '2px dashed var(--slate-300)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              textAlign: 'center',
              backgroundColor: 'var(--slate-50)',
              cursor: 'pointer',
              transition: 'border-color var(--transition-fast), background var(--transition-fast)',
              position: 'relative',
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const file = e.dataTransfer.files[0];
                if (file.size > 10 * 1024 * 1024) {
                  setError('File size must not exceed 10 MB');
                  return;
                }
                setSelectedFile(file);
                setError(null);
              }
            }}
          >
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
              }}
            />
            {selectedFile ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={32} color="var(--primary-600)" />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-800)' }}>
                  {selectedFile.name}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary-600)', textDecoration: 'underline' }}>
                  Click to replace file
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <UploadCloud size={36} color="var(--slate-400)" />
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--slate-700)' }}>
                  Click or drag and drop to upload document
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                  Supports Aadhaar, TC, Migration, Marksheets, Photograph
                </span>
              </div>
            )}
          </div>
          {error && <span style={{ fontSize: '0.75rem', color: 'var(--danger-text)' }}>{error}</span>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading} disabled={!selectedFile}>
            Upload Document
          </Button>
        </div>
      </form>
    </Modal>
  );
};
