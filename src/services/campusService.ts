// Institutional ERP Suite — Phase 8 Campus Operations & Infrastructure Service Engine

import {
  BookItem,
  LibraryIssueRecord,
  HostelBlock,
  HostelRoom,
  HostelGatePass,
  TransportVehicle,
  TransportPass,
  CampusAsset,
  FacilityRoom,
  FacilityBooking,
  MaintenanceTicket,
  VisitorPass,
  MedicalRecord,
  CampusEvent,
  CampusKPIs,
} from '../types/campusTypes';

/**
 * Spring Boot terminal audit logger for Campus Operations events.
 */
export function logCampusAction(event: {
  user: string;
  action: string;
  student?: string;
  hostel?: string;
  room?: string;
  book?: string;
  ticket?: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REJECTED';
  durationMs?: number;
  details?: string;
}): void {
  const duration = event.durationMs || Math.floor(20 + Math.random() * 50);
  const formattedLog = `[CAMPUS]\nUser: ${event.user}\nAction: ${event.action}${
    event.student ? `\nStudent: ${event.student}` : ''
  }${event.hostel ? `\nHostel: ${event.hostel}` : ''}${event.room ? `\nRoom: ${event.room}` : ''}${
    event.book ? `\nBook: ${event.book}` : ''
  }${event.ticket ? `\nTicket: ${event.ticket}` : ''}\nStatus: ${event.status}\nDuration: ${duration}ms${
    event.details ? `\nDetails: ${event.details}` : ''
  }`;

  console.log(`%c${formattedLog}`, 'color: #8b5cf6; font-weight: bold;');
}

const mockBooks: BookItem[] = [
  { id: 'b-1', isbn: '978-0131103627', title: 'The C Programming Language (2nd Ed)', author: 'Kernighan & Ritchie', publisher: 'Prentice Hall', edition: '2nd', category: 'COMPUTER_SCIENCE', copiesTotal: 45, copiesAvailable: 12, shelfLocation: 'CS-A-04', isDigital: false },
  { id: 'b-2', isbn: '978-0262033848', title: 'Introduction to Algorithms (CLRS)', author: 'Thomas H. Cormen', publisher: 'MIT Press', edition: '4th', category: 'COMPUTER_SCIENCE', copiesTotal: 80, copiesAvailable: 6, shelfLocation: 'CS-B-12', isDigital: true, downloadUrl: '/docs/clrs4.pdf' },
  { id: 'b-3', isbn: '978-0133591620', title: 'Database System Concepts (7th Ed)', author: 'Silberschatz & Korth', publisher: 'McGraw-Hill', edition: '7th', category: 'COMPUTER_SCIENCE', copiesTotal: 60, copiesAvailable: 24, shelfLocation: 'DB-C-02', isDigital: false },
];

const mockLibraryIssues: LibraryIssueRecord[] = [
  { id: 'iss-1', issueCode: 'ISS-2026-901', isbn: '978-0131103627', bookTitle: 'The C Programming Language', borrowerRollNo: '2024CS108', borrowerName: 'Aarav Sharma', borrowerRole: 'Student', issueDate: '2026-09-15', dueDate: '2026-09-29', fineAmount: 0, status: 'ISSUED' },
];

const mockHostelBlocks: HostelBlock[] = [
  { id: 'hb-1', blockCode: 'BLOCK-A', name: 'Boys Hostel Block A (Ramanujan Hall)', totalFloors: 4, totalRooms: 120, wardenName: 'Dr. Ramesh Kumar', wardenPhone: '+91 98765 11001', occupiedBeds: 220, totalCapacity: 240 },
  { id: 'hb-2', blockCode: 'BLOCK-B', name: 'Girls Hostel Block B (Kalpana Chawla Hall)', totalFloors: 4, totalRooms: 100, wardenName: 'Dr. Sunita Rao', wardenPhone: '+91 98765 11002', occupiedBeds: 180, totalCapacity: 200 },
];

const mockHostelRooms: HostelRoom[] = [
  { id: 'hr-1', roomNumber: 'A-203', blockCode: 'BLOCK-A', capacity: 2, occupants: ['2024CS108', '2024CS112'], monthlyFee: 6500, status: 'FULL' },
  { id: 'hr-2', roomNumber: 'A-204', blockCode: 'BLOCK-A', capacity: 2, occupants: ['2024EC210'], monthlyFee: 6500, status: 'AVAILABLE' },
];

const mockTransportFleet: TransportVehicle[] = [
  { id: 'tv-1', vehicleNumber: 'KA-01-EA-9012', busCode: 'BUS-104', capacity: 52, driverName: 'Suresh Singh', driverPhone: '+91 98112 00901', routeCode: 'ROUTE-01', routeName: 'Central City Line -> Campus', fuelType: 'ELECTRIC', status: 'ON_ROUTE' },
];

const mockAssets: CampusAsset[] = [
  { id: 'ast-1', assetTag: 'AST-CS-9012', name: 'NVIDIA H100 GPU Server Cluster', category: 'SERVER', department: 'Computer Science', location: 'AI Research Lab 301', purchaseDate: '2026-01-15', cost: 2800000, warrantyExpiry: '2029-01-15', allocatedTo: 'Dr. Sunita Rao', status: 'ACTIVE' },
];

const mockFacilities: FacilityRoom[] = [
  { id: 'fac-1', facilityCode: 'AUDI-MAIN', name: 'Main University Auditorium', capacity: 800, location: 'Central Academic Block', equipment: ['4K Projector', 'Dolby Surround', 'Stage Lighting'], isAvailable: true },
];

const mockMaintenance: MaintenanceTicket[] = [
  { id: 'tkt-1', ticketNumber: 'TKT-2026-8901', category: 'NETWORKING', location: 'CS Lab 202', description: 'Switch port 12 dropping packets during lab sessions', priority: 'HIGH', reportedBy: 'Prof. Ramesh Kumar', reportedDate: '2026-09-27', assignedTechnician: 'Network Tech R. Verma', status: 'IN_PROGRESS' },
];

const mockVisitors: VisitorPass[] = [
  { id: 'vis-1', visitorPassNo: 'VIS-2026-041', visitorName: 'Anil Mehta (TCS Recruiter)', phone: '+91 98100 12345', purpose: 'Campus Placement Interview', personToMeet: 'Dr. Sunita Rao (Placement HOD)', checkInTime: '2026-09-28 09:30 AM', qrCodePayload: 'visitor://pass/VIS-2026-041', status: 'INSIDE' },
];

const mockMedical: MedicalRecord[] = [
  { id: 'med-1', patientRollNo: '2024CS108', patientName: 'Aarav Sharma', consultationDate: '2026-09-20', doctorName: 'Dr. A. K. Gupta (Chief Medical Officer)', diagnosis: 'Mild Seasonal Influenza', prescribedMedicines: ['Paracetamol 650mg', 'Vitamin C'], vitals: 'BP 120/80, Temp 98.6F' },
];

const mockEvents: CampusEvent[] = [
  { id: 'ev-1', eventCode: 'EV-2026-HACK', title: 'National Hackathon 2026: AI & Edge Computing', category: 'HACKATHON', venue: 'Main University Auditorium', eventDate: '2026-10-12', organizer: 'Dept of Computer Science', registrationCount: 340, capacity: 500, status: 'UPCOMING' },
];

export class CampusService {
  public static getKPIs(): CampusKPIs {
    return {
      libraryBooksCount: 45820,
      libraryIssuedCount: 3450,
      hostelOccupancyPercentage: 91.6,
      activeBusFleetCount: 24,
      totalAssetsValue: 185000000,
      openMaintenanceTickets: 14,
      visitorsTodayCount: 42,
      upcomingEventsCount: 6,
    };
  }

  // Library Management
  public static getBooks(): BookItem[] { return mockBooks; }
  public static getLibraryIssues(): LibraryIssueRecord[] { return mockLibraryIssues; }
  public static issueBookCopy(isbn: string, studentRollNo: string, studentName: string): LibraryIssueRecord {
    const book = mockBooks.find(b => b.isbn === isbn);
    if (book) book.copiesAvailable = Math.max(0, book.copiesAvailable - 1);

    const issueCode = `ISS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord: LibraryIssueRecord = {
      id: `iss-${Date.now()}`,
      issueCode,
      isbn,
      bookTitle: book?.title || 'Cataloged Book',
      borrowerRollNo: studentRollNo,
      borrowerName: studentName,
      borrowerRole: 'Student',
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      fineAmount: 0,
      status: 'ISSUED',
    };
    mockLibraryIssues.unshift(newRecord);

    logCampusAction({
      user: 'Librarian V. Sharma',
      action: 'Issued Book Volume',
      student: studentRollNo,
      book: isbn,
      status: 'SUCCESS',
      details: `Issued ${book?.title} to ${studentName}`,
    });

    return newRecord;
  }

  // Hostel Management
  public static getHostelBlocks(): HostelBlock[] { return mockHostelBlocks; }
  public static getHostelRooms(): HostelRoom[] { return mockHostelRooms; }
  public static allocateRoom(roomNumber: string, studentRollNo: string): void {
    const room = mockHostelRooms.find(r => r.roomNumber === roomNumber);
    if (room && !room.occupants.includes(studentRollNo)) {
      room.occupants.push(studentRollNo);
      if (room.occupants.length >= room.capacity) room.status = 'FULL';

      logCampusAction({
        user: 'Hostel Warden',
        action: 'Room Allocated',
        student: studentRollNo,
        hostel: room.blockCode,
        room: roomNumber,
        status: 'SUCCESS',
        durationMs: 41,
        details: `Assigned bed in Room ${roomNumber} to student ${studentRollNo}`,
      });
    }
  }

  // Transport Management
  public static getTransportFleet(): TransportVehicle[] { return mockTransportFleet; }
  public static generateBusPass(rollNo: string, name: string, routeCode: string): TransportPass {
    const passNo = `TP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    logCampusAction({
      user: 'Transport Officer',
      action: 'Issued Bus Pass',
      student: rollNo,
      status: 'SUCCESS',
      details: `Generated pass #${passNo} for route ${routeCode}`,
    });
    return {
      id: `tp-${Date.now()}`,
      passNumber: passNo,
      userRollNo: rollNo,
      userName: name,
      userRole: 'Student',
      routeCode,
      stopName: 'Central Campus Gate 1',
      validUntil: '2027-05-31',
      qrPayload: `buspass://${passNo}/${rollNo}`,
    };
  }

  // Asset Management
  public static getAssets(): CampusAsset[] { return mockAssets; }

  // Facilities & Room Reservations
  public static getFacilities(): FacilityRoom[] { return mockFacilities; }

  // Maintenance & Work Orders
  public static getMaintenanceTickets(): MaintenanceTicket[] { return mockMaintenance; }
  public static createMaintenanceTicket(data: Omit<MaintenanceTicket, 'id' | 'ticketNumber' | 'reportedDate' | 'status'>): MaintenanceTicket {
    const ticketNumber = `TKT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTkt: MaintenanceTicket = {
      ...data,
      id: `tkt-${Date.now()}`,
      ticketNumber,
      reportedDate: new Date().toISOString().slice(0, 10),
      status: 'OPEN',
    };
    mockMaintenance.unshift(newTkt);

    logCampusAction({
      user: data.reportedBy,
      action: 'Logged Maintenance Ticket',
      ticket: ticketNumber,
      status: 'SUCCESS',
      details: `Logged ${data.category} ticket for ${data.location}`,
    });
    return newTkt;
  }

  // Security & Visitors
  public static getVisitors(): VisitorPass[] { return mockVisitors; }

  // Medical & Events
  public static getMedicalRecords(): MedicalRecord[] { return mockMedical; }
  public static getCampusEvents(): CampusEvent[] { return mockEvents; }
}
