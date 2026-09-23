export type DocumentType = 
  | 'AADHAAR' 
  | 'TRANSFER_CERTIFICATE' 
  | 'MIGRATION' 
  | 'MARKSHEET' 
  | 'PHOTOGRAPH';

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  AADHAAR: 'Aadhaar Card',
  TRANSFER_CERTIFICATE: 'Transfer Certificate (TC)',
  MIGRATION: 'Migration Certificate',
  MARKSHEET: 'Academic Marksheet',
  PHOTOGRAPH: 'Passport Photograph'
};

export interface StudentDocument {
  id: number;
  studentId: number;
  documentType: DocumentType;
  fileName: string;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  formattedSize?: string;
  downloadUrl: string;
  viewUrl: string;
  uploadedAt: string;
}
