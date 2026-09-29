// Institutional ERP Suite — Phase 8 Enterprise Library Management System Types

export type BookCondition = 'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED' | 'REPAIR_NEEDED';

export type BookStatus = 'AVAILABLE' | 'ISSUED' | 'RESERVED' | 'LOST' | 'ARCHIVED';

export interface BookDetail {
  id: string;
  bookId: string; // 'LIB-BK-9012'
  isbn: string;
  barcode: string;
  qrCodePayload: string;
  title: string;
  subtitle?: string;
  edition: string;
  language: string;
  author: string;
  coAuthor?: string;
  publisher: string;
  publicationYear: number;
  category: string;
  department: string;
  subject: string;
  keywords: string[];
  shelf: string;
  rack: string;
  floor: string;
  campus: string;
  libraryBranch: string;
  pages: number;
  price: number;
  supplier: string;
  purchaseDate: string;
  status: BookStatus;
  condition: BookCondition;
  copiesTotal: number;
  copiesAvailable: number;
  thumbnailUrl?: string;
  pdfUrl?: string;
  isDigital: boolean;
  description: string;
  tags: string[];
}

export interface IssueTransaction {
  id: string;
  transactionCode: string; // 'ISS-2026-9012'
  bookId: string;
  bookTitle: string;
  isbn: string;
  memberId: string;
  memberRollNo: string;
  memberName: string;
  memberRole: 'Student' | 'Teacher' | 'Librarian' | 'Researcher';
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  renewCount: number;
  fineAmount: number;
  status: 'ISSUED' | 'RETURNED' | 'OVERDUE' | 'LOST';
}

export interface DigitalResource {
  id: string;
  resourceCode: string;
  title: string;
  author: string;
  type: 'PDF' | 'RESEARCH_PAPER' | 'EBOOK' | 'LECTURE_NOTES' | 'QUESTION_PAPER' | 'JOURNAL' | 'VIDEO';
  department: string;
  fileSize: string;
  fileUrl: string;
  downloadsCount: number;
  publicationYear: number;
  tags: string[];
  isBookmarked?: boolean;
}

export interface LibraryMember {
  id: string;
  memberCardNo: string; // 'LIB-MEM-8012'
  name: string;
  email: string;
  role: 'Student' | 'Teacher' | 'Librarian' | 'Researcher';
  department: string;
  maxBooksAllowed: number;
  currentBooksIssued: number;
  membershipStatus: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  membershipExpiry: string;
  qrPayload: string;
  rfidTag: string;
}

export interface FineRecord {
  id: string;
  fineCode: string;
  memberRollNo: string;
  memberName: string;
  bookTitle: string;
  fineType: 'LATE_RETURN' | 'LOST_BOOK' | 'DAMAGED_BOOK';
  amount: number;
  status: 'PENDING' | 'PAID' | 'WAIVED';
  assessedDate: string;
  paidDate?: string;
  receiptNumber?: string;
}

export interface ProcurementRequest {
  id: string;
  requestNumber: string; // 'PROC-2026-041'
  bookTitle: string;
  author: string;
  publisher: string;
  department: string;
  requestedBy: string; // Faculty / HOD
  estimatedPrice: number;
  copiesRequested: number;
  status: 'SUBMITTED' | 'APPROVED' | 'ORDERED' | 'RECEIVED' | 'REJECTED';
  requestedDate: string;
  supplierName?: string;
}

export interface LibraryKPIs {
  totalBooks: number;
  availableBooks: number;
  issuedBooks: number;
  reservedBooks: number;
  lostBooks: number;
  overdueBooks: number;
  digitalResourcesCount: number;
  visitorsToday: number;
  fineCollectionTotal: number;
}
