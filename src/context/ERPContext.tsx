import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  Transaction,
  Student,
  Teacher,
  NotificationItem,
  ToastItem,
  ModuleItem,
  PaymentMode,
} from '../types/erp';
import {
  initialTransactions,
  initialStudents,
  initialTeachers,
  initialNotifications,
  initialModules,
} from '../constants/mockData';

export interface ERPContextType {
  // Data State
  transactions: Transaction[];
  students: Student[];
  teachers: Teacher[];
  notifications: NotificationItem[];
  modules: ModuleItem[];
  toasts: ToastItem[];
  recentPages: string[];

  // Navigation & Layout State
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  activePath: string;
  setActivePath: (path: string) => void;
  isGlobalSearchOpen: boolean;
  setGlobalSearchOpen: (open: boolean) => void;

  // Modals Active State
  activeModal:
    | 'collectFee'
    | 'receipt'
    | 'studentDetail'
    | 'teacherDetail'
    | 'refund'
    | 'confirm'
    | 'settings'
    | null;
  selectedTransaction: Transaction | null;
  selectedStudent: Student | null;
  selectedTeacher: Teacher | null;

  // Actions
  openCollectFeeModal: () => void;
  openReceiptModal: (txn: Transaction) => void;
  openStudentDetailModal: (student: Student | string) => void;
  openTeacherDetailModal: (teacher: Teacher) => void;
  openRefundModal: (txn: Transaction) => void;
  openSettingsModal: () => void;
  closeModal: () => void;

  collectFee: (data: {
    studentName: string;
    rollNo: string;
    department: string;
    amount: number;
    paymentMode: PaymentMode;
    notes?: string;
  }) => void;

  deleteTransaction: (id: string) => void;
  updateTransactionStatus: (id: string, status: Transaction['status']) => void;
  sendReminder: (studentName: string, rollNo: string) => void;
  approveRefund: (txnId: string) => void;
  rejectRefund: (txnId: string) => void;

  toggleFavoriteModule: (id: string) => void;
  addRecentPage: (path: string) => void;
  markAllNotificationsRead: () => void;
  addToast: (title: string, description?: string, type?: ToastItem['type']) => void;
  removeToast: (id: string) => void;
  exportTransactionsCSV: () => void;
}

export const ERPContext = createContext<ERPContextType | undefined>(undefined);

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [teachers] = useState<Teacher[]>(initialTeachers);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [modules, setModules] = useState<ModuleItem[]>(initialModules);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [recentPages, setRecentPages] = useState<string[]>(['/finance', '/sis', '/admissions']);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activePath, setActivePath] = useState('/finance');
  const [isGlobalSearchOpen, setGlobalSearchOpen] = useState(false);

  const [activeModal, setActiveModal] = useState<ERPContextType['activeModal']>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const addToast = (title: string, description?: string, type: ToastItem['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  const closeModal = () => {
    setActiveModal(null);
    setSelectedTransaction(null);
    setSelectedStudent(null);
    setSelectedTeacher(null);
  };

  const openCollectFeeModal = () => {
    setActiveModal('collectFee');
  };

  const openReceiptModal = (txn: Transaction) => {
    setSelectedTransaction(txn);
    setActiveModal('receipt');
  };

  const openStudentDetailModal = (studentOrRoll: Student | string) => {
    let studentObj: Student | undefined;
    if (typeof studentOrRoll === 'string') {
      studentObj = students.find(
        (s) =>
          s.rollNo.toLowerCase() === studentOrRoll.toLowerCase() ||
          s.name.toLowerCase().includes(studentOrRoll.toLowerCase())
      );
      if (!studentObj) {
        studentObj = {
          id: 'st-temp',
          name: studentOrRoll,
          rollNo: '2024CS-REG',
          email: `${studentOrRoll.toLowerCase().replace(/\s+/g, '.')}@nits.edu`,
          phone: '+91 98765 00000',
          department: 'Computer Science',
          semester: 'Semester 5',
          cgpa: 8.4,
          totalPaid: 170000,
          totalDues: 0,
          status: 'Active',
        };
      }
    } else {
      studentObj = studentOrRoll;
    }
    setSelectedStudent(studentObj);
    setActiveModal('studentDetail');
  };

  const openTeacherDetailModal = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setActiveModal('teacherDetail');
  };

  const openRefundModal = (txn: Transaction) => {
    setSelectedTransaction(txn);
    setActiveModal('refund');
  };

  const openSettingsModal = () => {
    setActiveModal('settings');
  };

  const collectFee = (data: {
    studentName: string;
    rollNo: string;
    department: string;
    amount: number;
    paymentMode: PaymentMode;
    notes?: string;
  }) => {
    const newTxn: Transaction = {
      id: `tx-${Date.now()}`,
      transactionId: `TXN-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      studentName: data.studentName,
      rollNo: data.rollNo,
      department: data.department,
      amount: data.amount,
      paymentMode: data.paymentMode,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'Paid',
      notes: data.notes || 'Institutional Tuition & Facilities Fee',
    };

    setTransactions((prev) => [newTxn, ...prev]);

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'New Fee Payment Collected',
      message: `${data.studentName} (${data.rollNo}) paid ₹${data.amount.toLocaleString('en-IN')}`,
      time: 'Just now',
      read: false,
      type: 'payment',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    closeModal();
    addToast(
      'Fee Collection Successful!',
      `Receipt #${newTxn.transactionId} issued for ₹${data.amount.toLocaleString('en-IN')}`,
      'success'
    );
  };

  const deleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    addToast('Transaction Deleted', `Transaction ${target?.transactionId || id} removed from ledger.`, 'warning');
  };

  const updateTransactionStatus = (id: string, status: Transaction['status']) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    addToast('Status Updated', `Transaction status updated to ${status}.`, 'info');
  };

  const sendReminder = (studentName: string, rollNo: string) => {
    addToast('Reminder Sent!', `SMS & Email notification dispatched to ${studentName} (${rollNo}).`, 'info');
  };

  const approveRefund = (txnId: string) => {
    addToast('Refund Approved!', `Refund transaction ${txnId} approved and initiated.`, 'success');
    closeModal();
  };

  const rejectRefund = (txnId: string) => {
    addToast('Refund Rejected', `Refund application ${txnId} marked as rejected.`, 'error');
    closeModal();
  };

  const toggleFavoriteModule = (id: string) => {
    setModules((prev) => prev.map((m) => (m.id === id ? { ...m, isFavorite: !m.isFavorite } : m)));
  };

  const addRecentPage = (path: string) => {
    setActivePath(path);
    setRecentPages((prev) => [path, ...prev.filter((p) => p !== path)].slice(0, 5));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast('Notifications Cleared', 'All system alerts marked as read.', 'info');
  };

  const exportTransactionsCSV = () => {
    const headers = 'Transaction ID,Student Name,Roll No,Department,Amount (INR),Payment Mode,Date,Status\n';
    const rows = transactions
      .map(
        (t) =>
          `"${t.transactionId}","${t.studentName}","${t.rollNo}","${t.department}",${t.amount},"${t.paymentMode}","${t.date}","${t.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ERP_Finance_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    addToast('Export Completed', 'Finance transactions ledger saved as CSV file.', 'success');
  };

  const value = useMemo(
    () => ({
      transactions,
      students,
      teachers,
      notifications,
      modules,
      toasts,
      recentPages,
      isSidebarCollapsed,
      toggleSidebar,
      activePath,
      setActivePath: addRecentPage,
      isGlobalSearchOpen,
      setGlobalSearchOpen,
      activeModal,
      selectedTransaction,
      selectedStudent,
      selectedTeacher,
      openCollectFeeModal,
      openReceiptModal,
      openStudentDetailModal,
      openTeacherDetailModal,
      openRefundModal,
      openSettingsModal,
      closeModal,
      collectFee,
      deleteTransaction,
      updateTransactionStatus,
      sendReminder,
      approveRefund,
      rejectRefund,
      toggleFavoriteModule,
      addRecentPage,
      markAllNotificationsRead,
      addToast,
      removeToast,
      exportTransactionsCSV,
    }),
    [
      transactions,
      students,
      teachers,
      notifications,
      modules,
      toasts,
      recentPages,
      isSidebarCollapsed,
      activePath,
      isGlobalSearchOpen,
      activeModal,
      selectedTransaction,
      selectedStudent,
      selectedTeacher,
    ]
  );

  return <ERPContext.Provider value={value}>{children}</ERPContext.Provider>;
};
