export type TransactionStatus = 'Paid' | 'Pending' | 'Failed' | 'Refunded';

export type PaymentMode = 'Online UPI' | 'UPI Gateway' | 'Net Banking' | 'Credit Card' | 'Challan' | 'Demand Draft' | 'Cash';

export type ERPDomain = 'Foundation' | 'Academic' | 'Enterprise';

export interface Transaction {
  id: string;
  transactionId: string;
  studentName: string;
  rollNo: string;
  department: string;
  amount: number;
  paymentMode: PaymentMode;
  date: string;
  status: TransactionStatus;
  notes?: string;
  receiptUrl?: string;
}

import { Student } from './studentTypes';
export type { Student };

export interface Teacher {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  department: string;
  designation: string;
  subjects: string[];
  salaryGrade: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'payment' | 'alert' | 'export' | 'refund' | 'system';
}

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface ModuleItem {
  id: string;
  name: string;
  path: string;
  category: ERPDomain;
  description: string;
  iconName: string;
  isFavorite: boolean;
}
