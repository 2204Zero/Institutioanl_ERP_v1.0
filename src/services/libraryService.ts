// Institutional ERP Suite — Enterprise Library Management System Service Engine

import {
  BookDetail,
  IssueTransaction,
  DigitalResource,
  LibraryMember,
  FineRecord,
  ProcurementRequest,
  LibraryKPIs,
} from '../types/libraryTypes';

/**
 * Spring Boot terminal audit logger for Enterprise Library events.
 */
export function logLibraryAction(event: {
  user: string;
  role: string;
  action: string;
  book?: string;
  student?: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REJECTED';
  durationMs?: number;
  details?: string;
}): void {
  const duration = event.durationMs || Math.floor(20 + Math.random() * 50);
  const formattedLog = `[LIBRARY]\nUser : ${event.user}\nRole : ${event.role}\nAction : ${event.action}${
    event.book ? `\nBook : ${event.book}` : ''
  }${event.student ? `\nStudent : ${event.student}` : ''}\nStatus : ${event.status}\nDuration : ${duration}ms${
    event.details ? `\nDetails : ${event.details}` : ''
  }`;

  console.log(`%c${formattedLog}`, 'color: #0284c7; font-weight: bold;');
}

const mockBooks: BookDetail[] = [
  {
    id: 'bk-1',
    bookId: 'LIB-BK-9012',
    isbn: '978-0131103627',
    barcode: 'BC-901238',
    qrCodePayload: 'book://lib/LIB-BK-9012',
    title: 'The C Programming Language (2nd Edition)',
    subtitle: 'ANSI C Standard Specification',
    edition: '2nd',
    language: 'English',
    author: 'Brian W. Kernighan',
    coAuthor: 'Dennis M. Ritchie',
    publisher: 'Prentice Hall',
    publicationYear: 1988,
    category: 'Computer Science',
    department: 'Computer Science',
    subject: 'Systems Programming',
    keywords: ['C', 'Programming', 'Kernighan', 'Ritchie', 'Compilers'],
    shelf: 'CS-04',
    rack: 'Rack B',
    floor: 'Floor 2',
    campus: 'Main Campus',
    libraryBranch: 'Central Engineering Library',
    pages: 272,
    price: 1250,
    supplier: 'Oxford University Press Depot',
    purchaseDate: '2022-04-15',
    status: 'AVAILABLE',
    condition: 'GOOD',
    copiesTotal: 45,
    copiesAvailable: 12,
    thumbnailUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300',
    isDigital: false,
    description: 'The definitive reference manual for ANSI C programming language by creators.',
    tags: ['Programming', 'C', 'Classic'],
  },
  {
    id: 'bk-2',
    bookId: 'LIB-BK-9013',
    isbn: '978-0262033848',
    barcode: 'BC-901239',
    qrCodePayload: 'book://lib/LIB-BK-9013',
    title: 'Introduction to Algorithms (CLRS 4th Edition)',
    subtitle: 'Comprehensive Algorithm Analysis',
    edition: '4th',
    language: 'English',
    author: 'Thomas H. Cormen',
    coAuthor: 'Charles E. Leiserson, Ronald L. Rivest',
    publisher: 'MIT Press',
    publicationYear: 2022,
    category: 'Computer Science',
    department: 'Computer Science',
    subject: 'Data Structures & Algorithms',
    keywords: ['Algorithms', 'CLRS', 'Data Structures', 'Graphs', 'Sorting'],
    shelf: 'CS-12',
    rack: 'Rack A',
    floor: 'Floor 2',
    campus: 'Main Campus',
    libraryBranch: 'Central Engineering Library',
    pages: 1312,
    price: 4500,
    supplier: 'MIT Press Direct',
    purchaseDate: '2023-01-10',
    status: 'AVAILABLE',
    condition: 'NEW',
    copiesTotal: 80,
    copiesAvailable: 6,
    isDigital: true,
    pdfUrl: '/docs/clrs4_full.pdf',
    description: 'Essential textbook for algorithm design, graph algorithms, and computational complexity.',
    tags: ['Algorithms', 'MIT', 'Core CS'],
  },
];

const mockIssues: IssueTransaction[] = [
  {
    id: 'iss-1',
    transactionCode: 'ISS-2026-9012',
    bookId: 'LIB-BK-9012',
    bookTitle: 'The C Programming Language (2nd Edition)',
    isbn: '978-0131103627',
    memberId: 'mem-1',
    memberRollNo: '2024CS108',
    memberName: 'Aarav Sharma',
    memberRole: 'Student',
    issueDate: '2026-09-15',
    dueDate: '2026-09-29',
    renewCount: 0,
    fineAmount: 0,
    status: 'ISSUED',
  },
];

const mockDigitalResources: DigitalResource[] = [
  {
    id: 'dig-1',
    resourceCode: 'DIG-2026-041',
    title: 'IEEE Transactions on Artificial Intelligence Vol. 44',
    author: 'IEEE Computer Society',
    type: 'JOURNAL',
    department: 'Computer Science',
    fileSize: '14.2 MB',
    fileUrl: '/docs/ieee_ai_vol44.pdf',
    downloadsCount: 420,
    publicationYear: 2026,
    tags: ['IEEE', 'AI', 'Deep Learning'],
    isBookmarked: true,
  },
  {
    id: 'dig-2',
    resourceCode: 'DIG-2026-042',
    title: 'B.Tech CS 2025 Mid-Semester Question Papers',
    author: 'Examination Cell',
    type: 'QUESTION_PAPER',
    department: 'Computer Science',
    fileSize: '4.8 MB',
    fileUrl: '/docs/question_papers_2025.pdf',
    downloadsCount: 890,
    publicationYear: 2025,
    tags: ['Exam', 'Question Papers', 'CS'],
    isBookmarked: false,
  },
];

const mockMembers: LibraryMember[] = [
  {
    id: 'mem-1',
    memberCardNo: 'LIB-MEM-8012',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@nits.edu',
    role: 'Student',
    department: 'Computer Science',
    maxBooksAllowed: 4,
    currentBooksIssued: 1,
    membershipStatus: 'ACTIVE',
    membershipExpiry: '2027-06-30',
    qrPayload: 'member://lib/LIB-MEM-8012',
    rfidTag: 'RFID-90182736',
  },
];

const mockFines: FineRecord[] = [
  {
    id: 'fn-1',
    fineCode: 'FN-2026-012',
    memberRollNo: '2024ME045',
    memberName: 'Rohan Gupta',
    bookTitle: 'Thermodynamics: An Engineering Approach',
    fineType: 'LATE_RETURN',
    amount: 140,
    status: 'PENDING',
    assessedDate: '2026-09-20',
  },
];

const mockProcurement: ProcurementRequest[] = [
  {
    id: 'pr-1',
    requestNumber: 'PROC-2026-041',
    bookTitle: 'Quantum Computing for Computer Scientists',
    author: 'Noson S. Yanofsky',
    publisher: 'Cambridge University Press',
    department: 'Computer Science',
    requestedBy: 'Dr. Sunita Rao (HOD CS)',
    estimatedPrice: 3200,
    copiesRequested: 10,
    status: 'APPROVED',
    requestedDate: '2026-09-10',
    supplierName: 'Cambridge University Press Direct',
  },
];

export class LibraryService {
  public static getKPIs(): LibraryKPIs {
    return {
      totalBooks: 45820,
      availableBooks: 42370,
      issuedBooks: 3450,
      reservedBooks: 142,
      lostBooks: 14,
      overdueBooks: 84,
      digitalResourcesCount: 1250,
      visitorsToday: 680,
      fineCollectionTotal: 18450,
    };
  }

  // Enterprise Book Management (CRUD)
  public static getBooks(): BookDetail[] { return mockBooks; }

  public static addBook(data: Omit<BookDetail, 'id' | 'bookId' | 'barcode' | 'qrCodePayload'>): BookDetail {
    const bookId = `LIB-BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const barcode = `BC-${Math.floor(100000 + Math.random() * 900000)}`;
    const newBook: BookDetail = {
      ...data,
      id: `bk-${Date.now()}`,
      bookId,
      barcode,
      qrCodePayload: `book://lib/${bookId}`,
    };
    mockBooks.unshift(newBook);

    logLibraryAction({
      user: 'Librarian V. Sharma',
      role: 'Librarian',
      action: 'Cataloged New Book Volume',
      book: newBook.title,
      status: 'SUCCESS',
      details: `Created catalog entry ${bookId} (ISBN ${newBook.isbn})`,
    });

    return newBook;
  }

  // Issue / Return Circulation Desk
  public static getIssues(): IssueTransaction[] { return mockIssues; }

  public static issueBook(bookId: string, memberRollNo: string, memberName: string, role: 'Student' | 'Teacher' = 'Student'): IssueTransaction {
    const book = mockBooks.find((b) => b.id === bookId || b.bookId === bookId);
    if (book) book.copiesAvailable = Math.max(0, book.copiesAvailable - 1);

    const txnCode = `ISS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newIssue: IssueTransaction = {
      id: `iss-${Date.now()}`,
      transactionCode: txnCode,
      bookId: book?.id || bookId,
      bookTitle: book?.title || 'Cataloged Volume',
      isbn: book?.isbn || '978-0000000000',
      memberId: 'mem-1',
      memberRollNo,
      memberName,
      memberRole: role,
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      renewCount: 0,
      fineAmount: 0,
      status: 'ISSUED',
    };

    mockIssues.unshift(newIssue);

    logLibraryAction({
      user: 'Aarav Sharma',
      role: 'Librarian',
      action: 'Issue Book',
      book: book?.title || bookId,
      student: memberRollNo,
      status: 'SUCCESS',
      durationMs: 45,
      details: `Issued book copy ${txnCode} to ${memberName}`,
    });

    return newIssue;
  }

  // Digital Resources
  public static getDigitalResources(): DigitalResource[] { return mockDigitalResources; }

  // Members
  public static getMembers(): LibraryMember[] { return mockMembers; }

  // Fines
  public static getFines(): FineRecord[] { return mockFines; }

  // Procurement
  public static getProcurementRequests(): ProcurementRequest[] { return mockProcurement; }
}
