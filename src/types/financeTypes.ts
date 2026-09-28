// Institutional ERP Suite - Phase 6 Finance, Fee Management & Accounting System Types

export type FeeCategory =
  | 'TUITION'
  | 'ADMISSION'
  | 'REGISTRATION'
  | 'LIBRARY'
  | 'HOSTEL'
  | 'TRANSPORT'
  | 'LABORATORY'
  | 'SPORTS'
  | 'MEDICAL'
  | 'DEVELOPMENT'
  | 'UNIVERSITY'
  | 'SECURITY_DEPOSIT'
  | 'LATE_FINE'
  | 'EXAMINATION'
  | 'CONVOCATION'
  | 'CUSTOM';

export interface FeeItem {
  id: string;
  category: FeeCategory;
  name: string;
  amount: number;
  isOptional: boolean;
  gstPercentage: number;
  description?: string;
}

export interface FeeStructure {
  id: string;
  code: string; // e.g. 'FS-2026-BTECH-CS'
  name: string; // 'B.Tech CS 2026-27 Fee Structure'
  department: string;
  program: string;
  academicYear: string;
  semester: number;
  feeItems: FeeItem[];
  totalAmount: number;
  totalGst: number;
  netAmount: number;
  allowInstallments: boolean;
  maxInstallments: number;
  lateFeePerDay: number;
  dueDate: string;
  isFrozen: boolean;
  revisionVersion: number;
  updatedAt: string;
}

export type InvoiceStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL' | 'CANCELLED' | 'REFUNDED';

export interface InvoiceLineItem {
  id: string;
  feeCategory: FeeCategory;
  name: string;
  amount: number;
  discount: number;
  gstAmount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // 'INV-2026-1042'
  studentId: string;
  studentName: string;
  rollNo: string;
  department: string;
  semester: string;
  parentEmail: string;
  parentPhone: string;
  issueDate: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  scholarshipDiscount: number;
  taxAmount: number;
  latePenaltyAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: InvoiceStatus;
  paymentReferenceNumber?: string;
  qrCodePayload?: string;
}

export type PaymentMethod =
  | 'RAZORPAY'
  | 'STRIPE'
  | 'PAYPAL'
  | 'UPI'
  | 'NET_BANKING'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'CASH'
  | 'CHEQUE'
  | 'BANK_TRANSFER';

export type PaymentStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED' | 'SETTLED';

export interface PaymentTransaction {
  id: string;
  transactionId: string; // 'TXN-RZP-90821'
  invoiceNumber: string;
  studentName: string;
  rollNo: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  gatewayReference?: string;
  gatewayResponseCode?: string;
  paidAt: string;
  notes?: string;
  receiptNumber: string;
}

export type ScholarshipType =
  | 'GOVERNMENT'
  | 'PRIVATE'
  | 'MERIT'
  | 'NEED_BASED'
  | 'FEE_WAIVER'
  | 'CONCESSION';

export interface ScholarshipApplication {
  id: string;
  applicationNumber: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  department: string;
  type: ScholarshipType;
  title: string; // 'Central Sector Scheme Merit Scholarship'
  amountGranted: number;
  percentageWaiver?: number;
  status: 'SUBMITTED' | 'UNDER_VERIFICATION' | 'APPROVED' | 'REJECTED' | 'DISBURSED';
  appliedDate: string;
  approvedDate?: string;
  approvedBy?: string;
  documentsUploaded: string[];
  remarks?: string;
}

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export interface Account {
  id: string;
  accountCode: string; // '1010-CASH'
  accountName: string; // 'Main Cash Account'
  type: AccountType;
  parentAccount?: string;
  balance: number;
  isActive: boolean;
}

export type VoucherType = 'RECEIPT' | 'PAYMENT' | 'JOURNAL' | 'CONTRA';

export interface JournalLine {
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description: string;
}

export interface JournalVoucher {
  id: string;
  voucherNumber: string; // 'JV-2026-0041'
  voucherType: VoucherType;
  date: string;
  narrative: string;
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
  preparedBy: string;
  approvedBy?: string;
  status: 'DRAFT' | 'POSTED' | 'REJECTED';
}

export interface TrialBalanceItem {
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  debitBalance: number;
  creditBalance: number;
}

export interface ParentFinanceSummary {
  parentId: string;
  parentName: string;
  studentName: string;
  rollNo: string;
  program: string;
  totalFeeAssessed: number;
  totalPaid: number;
  totalPending: number;
  activeInvoices: Invoice[];
  paymentHistory: PaymentTransaction[];
  scholarships: ScholarshipApplication[];
  availableTaxCertificates: {
    financialYear: string;
    section: '80G' | '10E' | 'TUITION_FEE';
    amount: number;
    downloadUrl: string;
  }[];
}

export interface FinanceKPIs {
  todayCollection: number;
  monthlyCollection: number;
  annualRevenue: number;
  outstandingFees: number;
  pendingRefundsCount: number;
  pendingRefundsAmount: number;
  scholarshipsIssuedCount: number;
  scholarshipsIssuedAmount: number;
  latePaymentsCount: number;
  collectionRatePercentage: number;
}
