// Institutional ERP Suite — Phase 9 Hostel, Transport & Infrastructure Management System Types

// -------------------------------------------------------------
// 1. HOSTEL ERP TYPES
// -------------------------------------------------------------
export type RoomType = 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'DORMITORY';
export type RoomAcStatus = 'AC' | 'NON_AC';
export type RoomStatus = 'AVAILABLE' | 'FULL' | 'MAINTENANCE' | 'RESERVED';

export interface Bed {
  id: string;
  bedCode: string; // 'A-203-BED1'
  roomNumber: string;
  isOccupied: boolean;
  occupantStudentId?: string;
  occupantStudentRollNo?: string;
  occupantStudentName?: string;
}

export interface RoomStructure {
  id: string;
  roomNumber: string; // 'A-203'
  blockCode: string; // 'BLOCK-A'
  wing: string; // 'East Wing'
  floor: number;
  roomType: RoomType;
  acStatus: RoomAcStatus;
  capacity: number;
  occupancyCount: number;
  monthlyFee: number;
  status: RoomStatus;
  beds: Bed[];
}

export interface StudentHostelProfile {
  id: string;
  hostelId: string; // 'HST-2026-901'
  studentId: string;
  studentRollNo: string;
  studentName: string;
  department: string;
  roomNumber: string;
  bedNumber: string;
  checkInDate: string;
  checkOutDate?: string;
  guardianName: string;
  guardianPhone: string;
  emergencyContact: string;
  medicalConditions?: string;
  hostelStatus: 'ACTIVE' | 'CHECKED_OUT' | 'SUSPENDED';
  messPlan: 'FULL_BOARD' | 'LUNCH_DINNER' | 'BREAKFAST_ONLY';
  feeStatus: 'CLEARED' | 'PENDING' | 'OVERDUE';
  disciplinaryRecordCount: number;
}

export interface MessMenuPlan {
  id: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  breakfast: string;
  lunch: string;
  dinner: string;
  specialDietOption?: string;
}

export interface MessAttendanceRecord {
  id: string;
  studentRollNo: string;
  studentName: string;
  date: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER';
  verifiedVia: 'BIOMETRIC' | 'QR_COUPON' | 'RFID';
  timestamp: string;
}

export interface HostelVisitorLog {
  id: string;
  passNumber: string; // 'HVP-2026-041'
  visitorName: string;
  visitorPhone: string;
  studentRollNo: string;
  studentName: string;
  roomNumber: string;
  relation: string;
  checkInTime: string;
  checkOutTime?: string;
  qrPassPayload: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'CHECKED_OUT' | 'REJECTED';
}

export interface HostelComplaintTicket {
  id: string;
  ticketNo: string; // 'CMP-2026-801'
  roomNumber: string;
  studentRollNo: string;
  category: 'ELECTRICAL' | 'PLUMBING' | 'FURNITURE' | 'CLEANING' | 'INTERNET' | 'AC';
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  assignedStaff?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
}

// -------------------------------------------------------------
// 2. TRANSPORT ERP TYPES
// -------------------------------------------------------------
export interface BusVehicle {
  id: string;
  busNumber: string; // 'RJ14PA1023'
  busCode: string; // 'BUS-104'
  capacity: number;
  assignedStudentsCount: number;
  model: string;
  registrationYear: number;
  insurancePolicyNo: string;
  insuranceExpiry: string;
  fitnessCertificateExpiry: string;
  gpsDeviceId: string;
  fuelType: 'DIESEL' | 'ELECTRIC' | 'CNG';
  status: 'ACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
  driverName: string;
  driverPhone: string;
}

export interface BusRoute {
  id: string;
  routeCode: string; // 'ROUTE-01'
  routeName: string; // 'City Center -> Main Campus'
  source: string;
  destination: string;
  distanceKm: number;
  estimatedDurationMins: number;
  stops: { stopName: string; pickupTime: string; dropTime: string }[];
  assignedBusCode: string;
  morningStartTime: string;
  eveningReturnTime: string;
}

export interface TransportDriver {
  id: string;
  driverCode: string; // 'DRV-801'
  employeeId: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  medicalFitnessStatus: 'FIT' | 'UNDER_REVIEW';
  assignedBusCode: string;
  monthlySalary: number;
}

export interface StudentTransportAllocation {
  id: string;
  passNumber: string; // 'TP-2026-9012'
  studentRollNo: string;
  studentName: string;
  department: string;
  routeCode: string;
  pickupStop: string;
  dropStop: string;
  assignedBusCode: string;
  seatNumber: string;
  feeStatus: 'PAID' | 'PENDING';
  qrBusPassPayload: string;
}

export interface LiveGpsLog {
  busCode: string;
  currentLat: number;
  currentLng: number;
  speedKmph: number;
  lastUpdated: string;
  etaMinutes: number;
  geoFenceStatus: 'INSIDE_ROUTE' | 'DEVIATED' | 'AT_STOP';
}

// -------------------------------------------------------------
// 3. INFRASTRUCTURE & ASSETS TYPES
// -------------------------------------------------------------
export type BuildingCategory = 'ACADEMIC_BLOCK' | 'HOSTEL' | 'LIBRARY' | 'LABORATORY' | 'AUDITORIUM' | 'SPORTS_COMPLEX';

export interface CampusBuilding {
  id: string;
  buildingCode: string; // 'BLD-ENG-01'
  name: string; // 'Ramanujan Computer Science Block'
  category: BuildingCategory;
  totalFloors: number;
  totalRooms: number;
  totalAreaSqFt: number;
  inChargeName: string;
}

export interface CampusRoomFacility {
  id: string;
  roomCode: string; // 'SEM-301'
  buildingCode: string;
  name: string;
  capacity: number;
  hasProjector: boolean;
  hasSmartBoard: boolean;
  hasAC: boolean;
  hasHighSpeedWifi: boolean;
  timetableOccupied: boolean;
  status: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE';
}

export interface LabInventory {
  id: string;
  labCode: string; // 'LAB-AI-301'
  labName: string; // 'Advanced AI & Supercomputing Lab'
  department: string;
  labAssistantName: string;
  totalWorkstations: number;
  installedGpus: number;
  consumablesStockLevel: string;
}

export interface EnterpriseAsset {
  id: string;
  assetCode: string; // 'AST-2026-9012'
  serialNumber: string;
  name: string;
  category: 'COMPUTER' | 'SERVER' | 'PRINTER' | 'PROJECTOR' | 'NETWORKING' | 'CCTV' | 'BIOMETRIC' | 'AC' | 'FURNITURE';
  location: string; // Room / Lab Code
  purchaseDate: string;
  purchaseCost: number;
  currentDepreciatedValue: number;
  warrantyExpiry: string;
  amcContractNo: string;
  amcVendor: string;
  status: 'OPERATIONAL' | 'REPAIR_NEEDED' | 'DISPOSED';
}

export interface FacilityWorkOrder {
  id: string;
  workOrderNo: string; // 'WO-2026-041'
  location: string;
  description: string;
  technicianAssigned: string;
  costEstimated: number;
  costActual: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdDate: string;
}

// KPI Dashboard Aggregates
export interface Phase9KPIs {
  totalHostelBeds: number;
  hostelOccupancyPercentage: number;
  messMonthlyRevenue: number;
  activeComplaintsCount: number;
  totalBusesCount: number;
  activeBusRoutesCount: number;
  commutersAssignedCount: number;
  gpsActiveVehiclesCount: number;
  totalCampusBuildingsCount: number;
  totalAssetsValuation: number;
  openWorkOrdersCount: number;
}
