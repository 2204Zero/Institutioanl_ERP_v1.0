// Institutional ERP Suite — Phase 6 Finance & Accounting Service Engine

import {
  FeeStructure,
  Invoice,
  PaymentTransaction,
  ScholarshipApplication,
  Account,
  JournalVoucher,
  TrialBalanceItem,
  ParentFinanceSummary,
  FinanceKPIs,
  PaymentMethod,
} from '../types/financeTypes';

/**
 * Terminal stdout Spring Boot style audit logger for Phase 6 Finance events.
 */
export function logFinanceAction(event: {
  user: string;
  role: string;
  action: string;
  invoice?: string;
  amount?: number;
  gateway?: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REJECTED';
  durationMs?: number;
  details?: string;
}): void {
  const duration = event.durationMs || Math.floor(20 + Math.random() * 60);
  const formattedLog = `[FINANCE]\nUser: ${event.user}\nRole: ${event.role}\nAction: ${event.action}${
    event.invoice ? `\nInvoice: ${event.invoice}` : ''
  }${event.amount !== undefined ? `\nAmount: ₹${event.amount.toLocaleString('en-IN')}` : ''}${
    event.gateway ? `\nGateway: ${event.gateway}` : ''
  }\nStatus: ${event.status}\nDuration: ${duration}ms${event.details ? `\nDetails: ${event.details}` : ''}`;

  console.log(`%c${formattedLog}`, 'color: #10b981; font-weight: bold;');
}

// Initial Mock Data Stores
const mockFeeStructures: FeeStructure[] = [
  {
    id: 'fs-1',
    code: 'FS-2026-BTECH-CS',
    name: 'B.Tech Computer Science 2026-27 Fee Plan',
    department: 'Computer Science',
    program: 'B.Tech',
    academicYear: '2026-2027',
    semester: 5,
    totalAmount: 85000,
    totalGst: 4250,
    netAmount: 89250,
    allowInstallments: true,
    maxInstallments: 2,
    lateFeePerDay: 100,
    dueDate: '2026-10-15',
    isFrozen: false,
    revisionVersion: 1,
    updatedAt: '2026-09-01',
    feeItems: [
      { id: 'fi-1', category: 'TUITION', name: 'Academic Tuition Fee', amount: 55000, isOptional: false, gstPercentage: 0 },
      { id: 'fi-2', category: 'LABORATORY', name: 'CS Advanced AI & Cloud Lab Charge', amount: 15000, isOptional: false, gstPercentage: 18 },
      { id: 'fi-3', category: 'LIBRARY', name: 'Digital Library & IEEE Access', amount: 5000, isOptional: false, gstPercentage: 0 },
      { id: 'fi-4', category: 'DEVELOPMENT', name: 'Campus Infrastructure Fund', amount: 10000, isOptional: false, gstPercentage: 18 },
    ],
  },
  {
    id: 'fs-2',
    code: 'FS-2026-BTECH-EC',
    name: 'B.Tech Electronics & Comm 2026-27 Fee Plan',
    department: 'Electronics',
    program: 'B.Tech',
    academicYear: '2026-2027',
    semester: 5,
    totalAmount: 85000,
    totalGst: 3600,
    netAmount: 88600,
    allowInstallments: true,
    maxInstallments: 2,
    lateFeePerDay: 100,
    dueDate: '2026-10-15',
    isFrozen: false,
    revisionVersion: 1,
    updatedAt: '2026-09-01',
    feeItems: [
      { id: 'fi-5', category: 'TUITION', name: 'Academic Tuition Fee', amount: 55000, isOptional: false, gstPercentage: 0 },
      { id: 'fi-6', category: 'LABORATORY', name: 'VLSI & Microcontroller Lab', amount: 18000, isOptional: false, gstPercentage: 18 },
      { id: 'fi-7', category: 'LIBRARY', name: 'Library Access Fee', amount: 4000, isOptional: false, gstPercentage: 0 },
      { id: 'fi-8', category: 'DEVELOPMENT', name: 'Campus Infra Fund', amount: 8000, isOptional: false, gstPercentage: 18 },
    ],
  },
];

const mockInvoices: Invoice[] = [
  {
    id: 'inv-1042',
    invoiceNumber: 'INV-2026-1042',
    studentId: 'st-1',
    studentName: 'Aarav Sharma',
    rollNo: '2024CS108',
    department: 'Computer Science',
    semester: 'Semester 5',
    parentEmail: 'rajesh.sharma@gmail.com',
    parentPhone: '+91 98765 11223',
    issueDate: '2026-09-01',
    dueDate: '2026-10-15',
    subtotal: 85000,
    scholarshipDiscount: 10000,
    taxAmount: 4250,
    latePenaltyAmount: 0,
    totalAmount: 79250,
    paidAmount: 45000,
    balanceDue: 34250,
    status: 'PARTIAL',
    paymentReferenceNumber: 'PAY-RZP-901827',
    qrCodePayload: 'upi://pay?pa=nits.fee@sbi&pn=NITS_Fee_Collection&am=34250&cu=INR&tn=INV-2026-1042',
    lineItems: [
      { id: 'li-1', feeCategory: 'TUITION', name: 'Tuition Fee Sem 5', amount: 55000, discount: 10000, gstAmount: 0, total: 45000 },
      { id: 'li-2', feeCategory: 'LABORATORY', name: 'AI Lab Fee', amount: 15000, discount: 0, gstAmount: 2700, total: 17700 },
      { id: 'li-3', feeCategory: 'LIBRARY', name: 'IEEE Access Fee', amount: 5000, discount: 0, gstAmount: 0, total: 5000 },
      { id: 'li-4', feeCategory: 'DEVELOPMENT', name: 'Campus Development', amount: 10000, discount: 0, gstAmount: 1550, total: 11550 },
    ],
  },
  {
    id: 'inv-1043',
    invoiceNumber: 'INV-2026-1043',
    studentId: 'st-2',
    studentName: 'Ananya Verma',
    rollNo: '2024EC210',
    department: 'Electronics',
    semester: 'Semester 5',
    parentEmail: 'sanjay.verma@yahoo.com',
    parentPhone: '+91 98765 22334',
    issueDate: '2026-09-01',
    dueDate: '2026-10-15',
    subtotal: 85000,
    scholarshipDiscount: 15000,
    taxAmount: 3600,
    latePenaltyAmount: 0,
    totalAmount: 73600,
    paidAmount: 73600,
    balanceDue: 0,
    status: 'PAID',
    paymentReferenceNumber: 'PAY-NET-448102',
    qrCodePayload: 'upi://pay?pa=nits.fee@sbi&pn=NITS_Fee_Collection&am=0&cu=INR&tn=INV-2026-1043',
    lineItems: [
      { id: 'li-5', feeCategory: 'TUITION', name: 'Tuition Fee Sem 5', amount: 55000, discount: 15000, gstAmount: 0, total: 40000 },
      { id: 'li-6', feeCategory: 'LABORATORY', name: 'VLSI Lab Fee', amount: 18000, discount: 0, gstAmount: 3240, total: 21240 },
      { id: 'li-7', feeCategory: 'DEVELOPMENT', name: 'Infra Fund', amount: 12000, discount: 0, gstAmount: 360, total: 12360 },
    ],
  },
];

const mockPayments: PaymentTransaction[] = [
  {
    id: 'p-1',
    transactionId: 'TXN-RZP-90821',
    invoiceNumber: 'INV-2026-1042',
    studentName: 'Aarav Sharma',
    rollNo: '2024CS108',
    amount: 45000,
    method: 'RAZORPAY',
    status: 'SUCCESS',
    gatewayReference: 'rzp_live_K9012a8xL',
    gatewayResponseCode: '200_OK',
    paidAt: '2026-09-18 14:32',
    notes: 'First Installment via UPI Razorpay',
    receiptNumber: 'RCP-2026-8801',
  },
  {
    id: 'p-2',
    transactionId: 'TXN-NET-448102',
    invoiceNumber: 'INV-2026-1043',
    studentName: 'Ananya Verma',
    rollNo: '2024EC210',
    amount: 73600,
    method: 'NET_BANKING',
    status: 'SUCCESS',
    gatewayReference: 'sbi_net_77192',
    gatewayResponseCode: '200_OK',
    paidAt: '2026-09-18 11:15',
    notes: 'Full Semester 5 Payment',
    receiptNumber: 'RCP-2026-8802',
  },
];

const mockScholarships: ScholarshipApplication[] = [
  {
    id: 'sch-1',
    applicationNumber: 'SCH-2026-041',
    studentId: 'st-1',
    studentName: 'Aarav Sharma',
    rollNo: '2024CS108',
    department: 'Computer Science',
    type: 'MERIT',
    title: 'Institutional Merit Excellence Scholarship',
    amountGranted: 10000,
    percentageWaiver: 15,
    status: 'APPROVED',
    appliedDate: '2026-08-15',
    approvedDate: '2026-08-28',
    approvedBy: 'Dr. Rajesh Kumar (Dean)',
    documentsUploaded: ['Income_Certificate.pdf', 'Semester4_MarkSheet.pdf'],
    remarks: 'Approved based on CGPA 8.9 and merit criteria.',
  },
  {
    id: 'sch-2',
    applicationNumber: 'SCH-2026-042',
    studentId: 'st-2',
    studentName: 'Ananya Verma',
    rollNo: '2024EC210',
    department: 'Electronics',
    type: 'GOVERNMENT',
    title: 'State Merit Post-Matric Scholarship',
    amountGranted: 15000,
    percentageWaiver: 20,
    status: 'DISBURSED',
    appliedDate: '2026-08-10',
    approvedDate: '2026-08-25',
    approvedBy: 'State Welfare Portal API',
    documentsUploaded: ['Caste_Cert.pdf', 'Income_Tax_Return.pdf'],
    remarks: 'Disbursed directly to student ledger.',
  },
];

const mockAccounts: Account[] = [
  { id: 'acc-1', accountCode: '1010-CASH', accountName: 'Main Cash Ledger', type: 'ASSET', balance: 1450000, isActive: true },
  { id: 'acc-2', accountCode: '1020-SBI-OPERATING', accountName: 'State Bank of India Operating Account', type: 'ASSET', balance: 48500000, isActive: true },
  { id: 'acc-3', accountCode: '1030-HDFC-COLLECTION', accountName: 'HDFC Fee Collection Account', type: 'ASSET', balance: 28900000, isActive: true },
  { id: 'acc-4', accountCode: '2010-FEE-ADVANCE', accountName: 'Student Fee Advance Liability', type: 'LIABILITY', balance: 3500000, isActive: true },
  { id: 'acc-5', accountCode: '3010-CAPITAL-FUND', accountName: 'Institutional Endowment Capital Fund', type: 'EQUITY', balance: 100000000, isActive: true },
  { id: 'acc-6', accountCode: '4010-TUITION-REVENUE', accountName: 'Tuition Fee Revenue Account', type: 'REVENUE', balance: 68500000, isActive: true },
  { id: 'acc-7', accountCode: '4020-LAB-REVENUE', accountName: 'Lab & Facilities Fee Revenue', type: 'REVENUE', balance: 18200000, isActive: true },
  { id: 'acc-8', accountCode: '5010-FACULTY-SALARY', accountName: 'Faculty & Staff Payroll Expense', type: 'EXPENSE', balance: 19800000, isActive: true },
  { id: 'acc-9', accountCode: '5020-INFRA-MAINTENANCE', accountName: 'Campus Infrastructure & Maintenance Expense', type: 'EXPENSE', balance: 6400000, isActive: true },
];

const mockJournalVouchers: JournalVoucher[] = [
  {
    id: 'jv-1',
    voucherNumber: 'JV-2026-0041',
    voucherType: 'RECEIPT',
    date: '2026-09-18',
    narrative: 'Fee collection receipt for Aarav Sharma (INV-2026-1042)',
    lines: [
      { accountId: 'acc-3', accountCode: '1030-HDFC-COLLECTION', accountName: 'HDFC Fee Collection Account', debit: 45000, credit: 0, description: 'Bank Inflow via Razorpay' },
      { accountId: 'acc-6', accountCode: '4010-TUITION-REVENUE', accountName: 'Tuition Fee Revenue Account', debit: 0, credit: 45000, description: 'Recognized Fee Income' },
    ],
    totalDebit: 45000,
    totalCredit: 45000,
    preparedBy: 'Accounts Officer V. Sharma',
    approvedBy: 'Chief Finance Officer',
    status: 'POSTED',
  },
];

export class FinanceService {
  /**
   * Fetch Finance KPIs
   */
  public static getKPIs(): FinanceKPIs {
    return {
      todayCollection: 185000,
      monthlyCollection: 9830000,
      annualRevenue: 78500000,
      outstandingFees: 12450000,
      pendingRefundsCount: 3,
      pendingRefundsAmount: 37500,
      scholarshipsIssuedCount: 42,
      scholarshipsIssuedAmount: 4800000,
      latePaymentsCount: 14,
      collectionRatePercentage: 88.4,
    };
  }

  /**
   * Fee Structure operations
   */
  public static getFeeStructures(): FeeStructure[] {
    return mockFeeStructures;
  }

  public static addFeeStructure(structure: Omit<FeeStructure, 'id' | 'updatedAt' | 'revisionVersion'>): FeeStructure {
    const newStructure: FeeStructure = {
      ...structure,
      id: `fs-${Date.now()}`,
      revisionVersion: 1,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    mockFeeStructures.unshift(newStructure);
    logFinanceAction({
      user: 'Dr. Rajesh Kumar',
      role: 'Dean / Finance Admin',
      action: 'Created New Fee Structure',
      amount: newStructure.netAmount,
      status: 'SUCCESS',
      details: `Created ${newStructure.code} for ${newStructure.department}`,
    });
    return newStructure;
  }

  /**
   * Invoices & Student Billing
   */
  public static getInvoices(): Invoice[] {
    return mockInvoices;
  }

  public static createInvoice(invData: Omit<Invoice, 'id' | 'invoiceNumber' | 'status'>): Invoice {
    const invoiceNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInv: Invoice = {
      ...invData,
      id: `inv-${Date.now()}`,
      invoiceNumber,
      status: invData.paidAmount >= invData.totalAmount ? 'PAID' : invData.paidAmount > 0 ? 'PARTIAL' : 'PENDING',
      qrCodePayload: `upi://pay?pa=nits.fee@sbi&pn=NITS_Fee_Collection&am=${invData.balanceDue}&cu=INR&tn=${invoiceNumber}`,
    };
    mockInvoices.unshift(newInv);
    logFinanceAction({
      user: 'Finance Billing Automation',
      role: 'System Engine',
      action: 'Generated Student Invoice',
      invoice: invoiceNumber,
      amount: newInv.totalAmount,
      status: 'SUCCESS',
      details: `Invoice generated for ${newInv.studentName} (${newInv.rollNo})`,
    });
    return newInv;
  }

  /**
   * Payment Gateway Simulation & Webhook Verification
   */
  public static processPayment(params: {
    invoiceNumber: string;
    studentName: string;
    rollNo: string;
    amount: number;
    method: PaymentMethod;
    parentRole?: boolean;
  }): PaymentTransaction {
    const targetInvoice = mockInvoices.find((i) => i.invoiceNumber === params.invoiceNumber);
    const txnId = `TXN-${params.method.slice(0, 3)}-${Math.floor(100000 + Math.random() * 900000)}`;
    const receiptNumber = `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPayment: PaymentTransaction = {
      id: `p-${Date.now()}`,
      transactionId: txnId,
      invoiceNumber: params.invoiceNumber,
      studentName: params.studentName,
      rollNo: params.rollNo,
      amount: params.amount,
      method: params.method,
      status: 'SUCCESS',
      gatewayReference: `gw_live_${Math.random().toString(36).substring(7)}`,
      gatewayResponseCode: '200_OK_VERIFIED',
      paidAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      notes: `Payment via ${params.method}`,
      receiptNumber,
    };

    mockPayments.unshift(newPayment);

    if (targetInvoice) {
      targetInvoice.paidAmount += params.amount;
      targetInvoice.balanceDue = Math.max(0, targetInvoice.totalAmount - targetInvoice.paidAmount);
      targetInvoice.status = targetInvoice.balanceDue === 0 ? 'PAID' : 'PARTIAL';
      targetInvoice.paymentReferenceNumber = txnId;
    }

    logFinanceAction({
      user: params.studentName,
      role: params.parentRole ? 'Parent' : 'Student / Admin',
      action: 'Fee Payment',
      invoice: params.invoiceNumber,
      amount: params.amount,
      gateway: params.method,
      status: 'SUCCESS',
      details: `Payment processed & verified via webhook. Receipt #${receiptNumber}`,
    });

    return newPayment;
  }

  public static getPayments(): PaymentTransaction[] {
    return mockPayments;
  }

  /**
   * Scholarships & Financial Aid
   */
  public static getScholarships(): ScholarshipApplication[] {
    return mockScholarships;
  }

  public static updateScholarshipStatus(id: string, status: ScholarshipApplication['status'], approvedBy: string): void {
    const item = mockScholarships.find((s) => s.id === id);
    if (item) {
      item.status = status;
      if (status === 'APPROVED' || status === 'DISBURSED') {
        item.approvedDate = new Date().toISOString().slice(0, 10);
        item.approvedBy = approvedBy;
      }
      logFinanceAction({
        user: approvedBy,
        role: 'Dean / Scholarship Officer',
        action: `Scholarship Application ${status}`,
        amount: item.amountGranted,
        status: 'SUCCESS',
        details: `Updated ${item.applicationNumber} for ${item.studentName}`,
      });
    }
  }

  /**
   * Accounting Engine (General Ledger, Chart of Accounts, Vouchers)
   */
  public static getAccounts(): Account[] {
    return mockAccounts;
  }

  public static getJournalVouchers(): JournalVoucher[] {
    return mockJournalVouchers;
  }

  public static getTrialBalance(): TrialBalanceItem[] {
    return mockAccounts.map((acc) => ({
      accountCode: acc.accountCode,
      accountName: acc.accountName,
      accountType: acc.type,
      debitBalance: acc.type === 'ASSET' || acc.type === 'EXPENSE' ? acc.balance : 0,
      creditBalance: acc.type === 'LIABILITY' || acc.type === 'EQUITY' || acc.type === 'REVENUE' ? acc.balance : 0,
    }));
  }

  /**
   * Parent Portal Summary dataset
   */
  public static getParentFinanceSummary(studentRollNo: string): ParentFinanceSummary {
    const studentInvoices = mockInvoices.filter((i) => i.rollNo === studentRollNo);
    const studentPayments = mockPayments.filter((p) => p.rollNo === studentRollNo);
    const studentScholarships = mockScholarships.filter((s) => s.rollNo === studentRollNo);

    const totalFeeAssessed = studentInvoices.reduce((acc, i) => acc + i.totalAmount, 0);
    const totalPaid = studentInvoices.reduce((acc, i) => acc + i.paidAmount, 0);
    const totalPending = studentInvoices.reduce((acc, i) => acc + i.balanceDue, 0);

    return {
      parentId: 'par-901',
      parentName: 'Rajesh Sharma',
      studentName: 'Aarav Sharma',
      rollNo: studentRollNo,
      program: 'B.Tech Computer Science (Sem 5)',
      totalFeeAssessed,
      totalPaid,
      totalPending,
      activeInvoices: studentInvoices,
      paymentHistory: studentPayments,
      scholarships: studentScholarships,
      availableTaxCertificates: [
        { financialYear: '2026-2027', section: '80G', amount: totalPaid, downloadUrl: '/docs/TaxCert_2026_80G.pdf' },
        { financialYear: '2026-2027', section: 'TUITION_FEE', amount: 55000, downloadUrl: '/docs/TuitionFeeCert_2026.pdf' },
      ],
    };
  }
}
