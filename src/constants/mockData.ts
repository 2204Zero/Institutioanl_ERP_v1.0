import { Transaction, Student, Teacher, NotificationItem, ModuleItem } from '../types/erp';

export const initialTransactions: Transaction[] = [
  {
    id: 'tx-1',
    transactionId: 'TXN-2026-89012',
    studentName: 'Aarav Sharma',
    rollNo: '2024CS108',
    department: 'Computer Science',
    amount: 85000,
    paymentMode: 'Online UPI',
    date: '2026-09-18 14:32',
    status: 'Paid',
    notes: 'Semester 5 Tuition Fee + Lab Charge',
  },
  {
    id: 'tx-2',
    transactionId: 'TXN-2026-89013',
    studentName: 'Ananya Verma',
    rollNo: '2024EC210',
    department: 'Electronics',
    amount: 85000,
    paymentMode: 'Net Banking',
    date: '2026-09-18 11:15',
    status: 'Paid',
    notes: 'Semester 5 Tuition Fee',
  },
  {
    id: 'tx-3',
    transactionId: 'TXN-2026-89014',
    studentName: 'Rohan Gupta',
    rollNo: '2024ME045',
    department: 'Mechanical',
    amount: 42500,
    paymentMode: 'Challan',
    date: '2026-09-17 16:45',
    status: 'Pending',
    notes: 'Partial Payment - First Installment',
  },
  {
    id: 'tx-4',
    transactionId: 'TXN-2026-89015',
    studentName: 'Priya Nair',
    rollNo: '2024CS112',
    department: 'Computer Science',
    amount: 85000,
    paymentMode: 'Credit Card',
    date: '2026-09-16 10:20',
    status: 'Failed',
    notes: 'Card Issuer Timeout',
  },
  {
    id: 'tx-5',
    transactionId: 'TXN-2026-89016',
    studentName: 'Vikram Singh',
    rollNo: '2024CE019',
    department: 'Civil',
    amount: 85000,
    paymentMode: 'Online UPI',
    date: '2026-09-16 09:05',
    status: 'Paid',
    notes: 'Annual Academic & Hostel Deposit',
  },
  {
    id: 'tx-6',
    transactionId: 'TXN-2026-89017',
    studentName: 'Kavya Patel',
    rollNo: '2024EE088',
    department: 'Electrical',
    amount: 72000,
    paymentMode: 'Net Banking',
    date: '2026-09-15 15:10',
    status: 'Paid',
    notes: 'Semester 5 Fee',
  },
  {
    id: 'tx-7',
    transactionId: 'TXN-2026-89018',
    studentName: 'Aditya Roy',
    rollNo: '2024CS145',
    department: 'Computer Science',
    amount: 15000,
    paymentMode: 'Cash',
    date: '2026-09-15 12:00',
    status: 'Paid',
    notes: 'Exam Reissue Fee',
  },
  {
    id: 'tx-8',
    transactionId: 'TXN-2026-89019',
    studentName: 'Sneha Reddy',
    rollNo: '2024IT032',
    department: 'Information Tech',
    amount: 85000,
    paymentMode: 'Online UPI',
    date: '2026-09-14 17:30',
    status: 'Pending',
    notes: 'Verification Pending at Bank Portal',
  },
];

export const initialStudents: Student[] = [
  { id: 'st-1', name: 'Aarav Sharma', rollNo: '2024CS108', email: 'aarav.sharma@nits.edu', phone: '+91 98765 43210', department: 'Computer Science', semester: 'Semester 5', cgpa: 8.9, totalPaid: 340000, totalDues: 0, status: 'Active' },
  { id: 'st-2', name: 'Ananya Verma', rollNo: '2024EC210', email: 'ananya.v@nits.edu', phone: '+91 98765 43211', department: 'Electronics', semester: 'Semester 5', cgpa: 9.2, totalPaid: 340000, totalDues: 0, status: 'Active' },
  { id: 'st-3', name: 'Rohan Gupta', rollNo: '2024ME045', email: 'rohan.g@nits.edu', phone: '+91 98765 43212', department: 'Mechanical', semester: 'Semester 5', cgpa: 7.8, totalPaid: 297500, totalDues: 42500, status: 'Active' },
  { id: 'st-4', name: 'Priya Nair', rollNo: '2024CS112', email: 'priya.n@nits.edu', phone: '+91 98765 43213', department: 'Computer Science', semester: 'Semester 5', cgpa: 8.5, totalPaid: 255000, totalDues: 85000, status: 'Active' },
  { id: 'st-5', name: 'Vikram Singh', rollNo: '2024CE019', email: 'vikram.s@nits.edu', phone: '+91 98765 43214', department: 'Civil', semester: 'Semester 5', cgpa: 8.1, totalPaid: 340000, totalDues: 0, status: 'Active' },
];

export const initialTeachers: Teacher[] = [
  { id: 't-1', name: 'Dr. Sunita Rao', employeeId: 'FAC-8012', email: 'sunita.rao@nits.edu', department: 'Computer Science', designation: 'Professor & Head', subjects: ['Database Systems', 'Distributed Systems'], salaryGrade: 'Grade A+' },
  { id: 't-2', name: 'Prof. Ramesh Kumar', employeeId: 'FAC-8015', email: 'ramesh.k@nits.edu', department: 'Electronics', designation: 'Associate Professor', subjects: ['VLSI Design', 'Digital Signal Processing'], salaryGrade: 'Grade A' },
];

export const initialNotifications: NotificationItem[] = [
  { id: 'n-1', title: 'Fee Payment Received', message: 'Aarav Sharma (2024CS108) paid ₹85,000 via UPI.', time: '10 mins ago', read: false, type: 'payment' },
  { id: 'n-2', title: 'Refund Application', message: 'Rohan Gupta submitted a fee refund request for ₹12,500.', time: '1 hour ago', read: false, type: 'refund' },
  { id: 'n-3', title: 'Audit Export Ready', message: 'Q3 Financial Ledger CSV export completed successfully.', time: '3 hours ago', read: true, type: 'export' },
  { id: 'n-4', title: 'System Security Alert', message: 'Master Password policy updated for all Enterprise Admins.', time: 'Yesterday', read: true, type: 'system' },
];

export const initialModules: ModuleItem[] = [
  { id: 'm-1', name: 'Finance & Accounts', path: '/finance', category: 'Enterprise', description: 'Institutional fee collection, ledgers, payroll & budget', iconName: 'DollarSign', isFavorite: true },
  { id: 'm-2', name: 'Admissions & Intake', path: '/admissions', category: 'Academic', description: 'Student applications, counseling & seat allocation', iconName: 'UserCheck', isFavorite: true },
  { id: 'm-3', name: 'Student Information System', path: '/sis', category: 'Academic', description: 'Student profiles, academic records & documents', iconName: 'Users', isFavorite: true },
  { id: 'm-4', name: 'Timetable & Scheduling', path: '/timetable', category: 'Academic', description: 'Class schedules, lab slots & faculty assignment', iconName: 'Calendar', isFavorite: false },
  { id: 'm-5', name: 'Attendance Register', path: '/attendance', category: 'Academic', description: 'Daily biometric & manual student attendance tracking', iconName: 'CheckCircle', isFavorite: false },
  { id: 'm-6', name: 'Gradebook & Examination', path: '/gradebook', category: 'Academic', description: 'Marks entry, CGPA calculation & report card issuing', iconName: 'Award', isFavorite: false },
  { id: 'm-7', name: 'Human Resources & Payroll', path: '/hr', category: 'Enterprise', description: 'Faculty salaries, leave applications & performance', iconName: 'Briefcase', isFavorite: false },
  { id: 'm-8', name: 'Library Management', path: '/library', category: 'Enterprise', description: 'Book inventory, issue/return logs & digital journals', iconName: 'BookOpen', isFavorite: false },
  { id: 'm-9', name: 'Hostel & Mess Allocation', path: '/hostel', category: 'Enterprise', description: 'Room booking, warden logs & mess fee register', iconName: 'Home', isFavorite: false },
  { id: 'm-10', name: 'Transport & Fleet', path: '/transport', category: 'Enterprise', description: 'Bus routes, driver tracking & student pass passes', iconName: 'Bus', isFavorite: false },
  { id: 'm-11', name: 'User & Role Authorization', path: '/auth', category: 'Foundation', description: 'RBAC permissions, OAuth & security policy setup', iconName: 'Shield', isFavorite: false },
  { id: 'm-12', name: 'Institutional Org Structure', path: '/org', category: 'Foundation', description: 'Campus campuses, departments & degree programs', iconName: 'Building', isFavorite: false },
  { id: 'm-13', name: 'Learning Management System (LMS)', path: '/lms', category: 'Academic', description: 'Course materials, assignments, quizzes & discussion forums', iconName: 'BookOpen', isFavorite: true },
  { id: 'm-14', name: 'BI & AI Analytics Platform', path: '/analytics', category: 'Enterprise', description: 'Institutional analytics, machine learning predictions & custom reports', iconName: 'TrendingUp', isFavorite: true },
];

export const monthlyCollectionChartData = [
  { month: 'Apr', collections: 42.5, target: 40.0, payroll: 18.0 },
  { month: 'May', collections: 38.0, target: 40.0, payroll: 18.2 },
  { month: 'Jun', collections: 55.2, target: 45.0, payroll: 18.5 },
  { month: 'Jul', collections: 98.4, target: 80.0, payroll: 19.0 },
  { month: 'Aug', collections: 125.6, target: 110.0, payroll: 19.5 },
  { month: 'Sep', collections: 98.3, target: 90.0, payroll: 19.8 },
  { month: 'Oct', collections: 45.0, target: 40.0, payroll: 20.0 },
  { month: 'Nov', collections: 35.0, target: 35.0, payroll: 20.0 },
  { month: 'Dec', collections: 78.0, target: 70.0, payroll: 20.2 },
];

export const paymentModeChartData = [
  { name: 'Online UPI', value: 48, amount: '₹ 2.20 Cr', color: '#3B82F6' },
  { name: 'Net Banking', value: 28, amount: '₹ 1.28 Cr', color: '#10B981' },
  { name: 'Credit/Debit Card', value: 14, amount: '₹ 64.1 L', color: '#8B5CF6' },
  { name: 'Challan & Cash', value: 10, amount: '₹ 45.8 L', color: '#F59E0B' },
];

export const departmentRevenueData = [
  { department: 'Computer Sci', revenue: 165.4, dues: 12.2 },
  { department: 'Electronics', revenue: 112.8, dues: 8.5 },
  { department: 'Mechanical', revenue: 88.5, dues: 14.8 },
  { department: 'Civil Engg', revenue: 54.2, dues: 4.2 },
  { department: 'Management', revenue: 37.1, dues: 2.8 },
];
