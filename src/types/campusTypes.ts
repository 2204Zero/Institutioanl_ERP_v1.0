// Institutional ERP Suite — Phase 8 Campus Operations & Infrastructure Types

export interface BookItem {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  edition: string;
  category: 'COMPUTER_SCIENCE' | 'ELECTRONICS' | 'MECHANICAL' | 'CIVIL' | 'MATH' | 'MANAGEMENT';
  copiesTotal: number;
  copiesAvailable: number;
  shelfLocation: string;
  isDigital: boolean;
  downloadUrl?: string;
}

export interface LibraryIssueRecord {
  id: string;
  issueCode: string;
  isbn: string;
  bookTitle: string;
  borrowerRollNo: string;
  borrowerName: string;
  borrowerRole: 'Student' | 'Faculty';
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fineAmount: number;
  status: 'ISSUED' | 'RETURNED' | 'OVERDUE' | 'LOST';
}

export interface HostelBlock {
  id: string;
  blockCode: string; // 'BLOCK-A'
  name: string; // 'Boys Hostel Block A'
  totalFloors: number;
  totalRooms: number;
  wardenName: string;
  wardenPhone: string;
  occupiedBeds: number;
  totalCapacity: number;
}

export interface HostelRoom {
  id: string;
  roomNumber: string; // 'A-203'
  blockCode: string;
  capacity: number; // 2 or 3 seater
  occupants: string[]; // Student Roll Numbers
  monthlyFee: number;
  status: 'AVAILABLE' | 'FULL' | 'UNDER_MAINTENANCE';
}

export interface HostelGatePass {
  id: string;
  passNumber: string;
  studentRollNo: string;
  studentName: string;
  hostelRoom: string;
  reason: string;
  destination: string;
  departureTime: string;
  expectedReturnTime: string;
  status: 'APPLIED' | 'APPROVED' | 'CHECKED_OUT' | 'RETURNED';
  approvedBy: string;
}

export interface TransportVehicle {
  id: string;
  vehicleNumber: string; // 'KA-01-EA-9012'
  busCode: string; // 'BUS-104'
  capacity: number;
  driverName: string;
  driverPhone: string;
  routeCode: string;
  routeName: string;
  fuelType: 'DIESEL' | 'ELECTRIC' | 'CNG';
  status: 'ON_ROUTE' | 'PARKED' | 'IN_SERVICE';
}

export interface TransportPass {
  id: string;
  passNumber: string; // 'TP-2026-9012'
  userRollNo: string;
  userName: string;
  userRole: 'Student' | 'Faculty';
  routeCode: string;
  stopName: string;
  validUntil: string;
  qrPayload: string;
}

export type AssetCategory =
  | 'COMPUTER'
  | 'SERVER'
  | 'PROJECTOR'
  | 'FURNITURE'
  | 'PRINTER'
  | 'NETWORKING'
  | 'LAB_EQUIPMENT';

export interface CampusAsset {
  id: string;
  assetTag: string; // 'AST-CS-9012'
  name: string;
  category: AssetCategory;
  department: string;
  location: string;
  purchaseDate: string;
  cost: number;
  warrantyExpiry: string;
  allocatedTo?: string;
  status: 'ACTIVE' | 'IN_MAINTENANCE' | 'DISPOSED' | 'RESERVED';
}

export interface FacilityRoom {
  id: string;
  facilityCode: string; // 'AUDI-MAIN'
  name: string; // 'Main University Auditorium'
  capacity: number;
  location: string;
  equipment: string[];
  isAvailable: boolean;
}

export interface FacilityBooking {
  id: string;
  bookingCode: string;
  facilityCode: string;
  facilityName: string;
  eventName: string;
  bookedBy: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
}

export type TicketCategory = 'ELECTRICAL' | 'NETWORKING' | 'PLUMBING' | 'CIVIL' | 'FURNITURE' | 'IT_SUPPORT';

export interface MaintenanceTicket {
  id: string;
  ticketNumber: string; // 'TKT-2026-8901'
  category: TicketCategory;
  location: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reportedBy: string;
  reportedDate: string;
  assignedTechnician?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
}

export interface VisitorPass {
  id: string;
  visitorPassNo: string;
  visitorName: string;
  phone: string;
  purpose: string;
  personToMeet: string;
  checkInTime: string;
  checkOutTime?: string;
  qrCodePayload: string;
  status: 'INSIDE' | 'CHECKED_OUT';
}

export interface MedicalRecord {
  id: string;
  patientRollNo: string;
  patientName: string;
  consultationDate: string;
  doctorName: string;
  diagnosis: string;
  prescribedMedicines: string[];
  vitals: string;
}

export interface CampusEvent {
  id: string;
  eventCode: string;
  title: string;
  category: 'SEMINAR' | 'HACKATHON' | 'CONFERENCE' | 'CULTURAL' | 'SPORTS';
  venue: string;
  eventDate: string;
  organizer: string;
  registrationCount: number;
  capacity: number;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
}

export interface CampusKPIs {
  libraryBooksCount: number;
  libraryIssuedCount: number;
  hostelOccupancyPercentage: number;
  activeBusFleetCount: number;
  totalAssetsValue: number;
  openMaintenanceTickets: number;
  visitorsTodayCount: number;
  upcomingEventsCount: number;
}
