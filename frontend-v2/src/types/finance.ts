export interface FeeCreationRequest {
  studentId: number;
  amount: number;
  dueDate: string;
  description: string;
}

export interface FeeRecordResponse {
  id: number;
  studentId: number;
  studentName: string;
  rollNumber: string;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIAL';
  description: string;
  createdAt: string;
}
