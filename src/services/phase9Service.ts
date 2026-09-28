// Institutional ERP Suite — Phase 9 Hostel, Transport & Infrastructure Service Engine

import {
  RoomStructure,
  StudentHostelProfile,
  MessMenuPlan,
  MessAttendanceRecord,
  HostelVisitorLog,
  HostelComplaintTicket,
  BusVehicle,
  BusRoute,
  TransportDriver,
  StudentTransportAllocation,
  LiveGpsLog,
  CampusBuilding,
  CampusRoomFacility,
  LabInventory,
  EnterpriseAsset,
  FacilityWorkOrder,
  Phase9KPIs,
} from '../types/phase9Types';

// Terminal loggers
export function logHostelAction(event: {
  user: string;
  action: string;
  student?: string;
  room?: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REJECTED';
  durationMs?: number;
  details?: string;
}): void {
  const duration = event.durationMs || Math.floor(20 + Math.random() * 30);
  const formattedLog = `[HOSTEL]\nUser : ${event.user}\nAction : ${event.action}${
    event.student ? `\nStudent : ${event.student}` : ''
  }${event.room ? `\nRoom : ${event.room}` : ''}\nStatus : ${event.status}\nDuration : ${duration}ms${
    event.details ? `\nDetails : ${event.details}` : ''
  }`;

  console.log(`%c${formattedLog}`, 'color: #f59e0b; font-weight: bold;');
}

export function logTransportAction(event: {
  user: string;
  action: string;
  bus?: string;
  student?: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REJECTED';
  durationMs?: number;
  details?: string;
}): void {
  const duration = event.durationMs || Math.floor(25 + Math.random() * 35);
  const formattedLog = `[TRANSPORT]\nUser : ${event.user}\nAction : ${event.action}${
    event.bus ? `\nBus : ${event.bus}` : ''
  }${event.student ? `\nStudent : ${event.student}` : ''}\nStatus : ${event.status}\nDuration : ${duration}ms${
    event.details ? `\nDetails : ${event.details}` : ''
  }`;

  console.log(`%c${formattedLog}`, 'color: #10b981; font-weight: bold;');
}

export function logInfraAction(event: {
  user: string;
  action: string;
  asset?: string;
  location?: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REJECTED';
  durationMs?: number;
  details?: string;
}): void {
  const duration = event.durationMs || Math.floor(20 + Math.random() * 30);
  const formattedLog = `[INFRASTRUCTURE]\nUser : ${event.user}\nAction : ${event.action}${
    event.asset ? `\nAsset : ${event.asset}` : ''
  }${event.location ? `\nLocation : ${event.location}` : ''}\nStatus : ${event.status}\nDuration : ${duration}ms${
    event.details ? `\nDetails : ${event.details}` : ''
  }`;

  console.log(`%c${formattedLog}`, 'color: #6366f1; font-weight: bold;');
}

// Mock Datasets
const mockRooms: RoomStructure[] = [
  {
    id: 'rm-1',
    roomNumber: 'A-203',
    blockCode: 'BLOCK-A',
    wing: 'East Wing',
    floor: 2,
    roomType: 'DOUBLE',
    acStatus: 'AC',
    capacity: 2,
    occupancyCount: 2,
    monthlyFee: 6500,
    status: 'FULL',
    beds: [
      { id: 'bed-1', bedCode: 'A-203-BED1', roomNumber: 'A-203', isOccupied: true, occupantStudentId: 'st-1', occupantStudentRollNo: '2024CS108', occupantStudentName: 'Aarav Sharma' },
      { id: 'bed-2', bedCode: 'A-203-BED2', roomNumber: 'A-203', isOccupied: true, occupantStudentId: 'st-3', occupantStudentRollNo: '2024ME045', occupantStudentName: 'Rohan Gupta' },
    ],
  },
  {
    id: 'rm-2',
    roomNumber: 'A-204',
    blockCode: 'BLOCK-A',
    wing: 'East Wing',
    floor: 2,
    roomType: 'DOUBLE',
    acStatus: 'NON_AC',
    capacity: 2,
    occupancyCount: 1,
    monthlyFee: 5000,
    status: 'AVAILABLE',
    beds: [
      { id: 'bed-3', bedCode: 'A-204-BED1', roomNumber: 'A-204', isOccupied: true, occupantStudentId: 'st-5', occupantStudentRollNo: '2024CE019', occupantStudentName: 'Vikram Singh' },
      { id: 'bed-4', bedCode: 'A-204-BED2', roomNumber: 'A-204', isOccupied: false },
    ],
  },
];

const mockStudentProfiles: StudentHostelProfile[] = [
  {
    id: 'shp-1',
    hostelId: 'HST-2026-901',
    studentId: 'st-1',
    studentRollNo: '2024CS108',
    studentName: 'Aarav Sharma',
    department: 'Computer Science',
    roomNumber: 'A-203',
    bedNumber: 'A-203-BED1',
    checkInDate: '2026-08-01',
    guardianName: 'Rajesh Sharma',
    guardianPhone: '+91 98765 11223',
    emergencyContact: '+91 98765 11223',
    hostelStatus: 'ACTIVE',
    messPlan: 'FULL_BOARD',
    feeStatus: 'CLEARED',
    disciplinaryRecordCount: 0,
  },
];

const mockBuses: BusVehicle[] = [
  {
    id: 'bv-1',
    busNumber: 'RJ14PA1023',
    busCode: 'BUS-104',
    capacity: 52,
    assignedStudentsCount: 48,
    model: 'Tata Starbus EV 2025',
    registrationYear: 2025,
    insurancePolicyNo: 'INS-901827-TATA',
    insuranceExpiry: '2027-08-15',
    fitnessCertificateExpiry: '2027-08-15',
    gpsDeviceId: 'GPS-DEV-9012',
    fuelType: 'ELECTRIC',
    status: 'ACTIVE',
    driverName: 'Harish Chandra',
    driverPhone: '+91 98112 34567',
  },
];

const mockRoutes: BusRoute[] = [
  {
    id: 'br-1',
    routeCode: 'ROUTE-01',
    routeName: 'City Center Express -> Campus',
    source: 'City Center Hub Gate 1',
    destination: 'University Central Academic Block',
    distanceKm: 18.5,
    estimatedDurationMins: 45,
    stops: [
      { stopName: 'City Center Circle', pickupTime: '07:30 AM', dropTime: '05:45 PM' },
      { stopName: 'Model Town Crossing', pickupTime: '07:45 AM', dropTime: '05:30 PM' },
      { stopName: 'University Gate 1', pickupTime: '08:15 AM', dropTime: '05:00 PM' },
    ],
    assignedBusCode: 'BUS-104',
    morningStartTime: '07:30 AM',
    eveningReturnTime: '05:00 PM',
  },
];

const mockGpsLogs: LiveGpsLog[] = [
  {
    busCode: 'BUS-104',
    currentLat: 26.9124,
    currentLng: 75.7873,
    speedKmph: 42,
    lastUpdated: 'Just now',
    etaMinutes: 12,
    geoFenceStatus: 'INSIDE_ROUTE',
  },
];

const mockBuildings: CampusBuilding[] = [
  { id: 'bld-1', buildingCode: 'BLD-ENG-01', name: 'Ramanujan Computer Science & AI Complex', category: 'ACADEMIC_BLOCK', totalFloors: 5, totalRooms: 48, totalAreaSqFt: 85000, inChargeName: 'Dr. Sunita Rao (HOD CS)' },
  { id: 'bld-2', buildingCode: 'BLD-HST-A', name: 'Boys Hostel Block A (Ramanujan Hall)', category: 'HOSTEL', totalFloors: 4, totalRooms: 120, totalAreaSqFt: 65000, inChargeName: 'Hostel Warden' },
];

const mockAssets: EnterpriseAsset[] = [
  {
    id: 'ast-1',
    assetCode: 'AST-2026-9012',
    serialNumber: 'SN-NV-H100-8801',
    name: 'NVIDIA H100 GPU Supercomputing Cluster Node',
    category: 'SERVER',
    location: 'AI Research Lab 301',
    purchaseDate: '2026-01-15',
    purchaseCost: 2800000,
    currentDepreciatedValue: 2520000,
    warrantyExpiry: '2029-01-15',
    amcContractNo: 'AMC-NV-2026-01',
    amcVendor: 'NVIDIA Enterprise India Pvt Ltd',
    status: 'OPERATIONAL',
  },
];

const mockWorkOrders: FacilityWorkOrder[] = [
  { id: 'wo-1', workOrderNo: 'WO-2026-041', location: 'Ramanujan Block Room 301', description: 'HVAC Air Duct Maintenance & Filter Cleaning', technicianAssigned: 'Tech V. Sharma', costEstimated: 4500, costActual: 4200, status: 'COMPLETED', createdDate: '2026-09-22' },
];

export class Phase9Service {
  public static getKPIs(): Phase9KPIs {
    return {
      totalHostelBeds: 2400,
      hostelOccupancyPercentage: 94.2,
      messMonthlyRevenue: 15600000,
      activeComplaintsCount: 8,
      totalBusesCount: 18,
      activeBusRoutesCount: 8,
      commutersAssignedCount: 860,
      gpsActiveVehiclesCount: 18,
      totalCampusBuildingsCount: 14,
      totalAssetsValuation: 185000000,
      openWorkOrdersCount: 5,
    };
  }

  // HOSTEL ENGINE
  public static getRooms(): RoomStructure[] { return mockRooms; }
  public static getStudentHostelProfiles(): StudentHostelProfile[] { return mockStudentProfiles; }

  public static allocateRoomBed(roomNumber: string, studentRollNo: string, studentName: string): boolean {
    const room = mockRooms.find((r) => r.roomNumber === roomNumber);
    if (!room || room.occupancyCount >= room.capacity) return false;

    const vacantBed = room.beds.find((b) => !b.isOccupied);
    if (vacantBed) {
      vacantBed.isOccupied = true;
      vacantBed.occupantStudentRollNo = studentRollNo;
      vacantBed.occupantStudentName = studentName;
      room.occupancyCount += 1;
      if (room.occupancyCount >= room.capacity) room.status = 'FULL';

      logHostelAction({
        user: 'Warden',
        action: 'Room Allocation',
        student: studentRollNo,
        room: roomNumber,
        status: 'SUCCESS',
        durationMs: 28,
        details: `Assigned bed ${vacantBed.bedCode} to ${studentName}`,
      });
      return true;
    }
    return false;
  }

  // TRANSPORT ENGINE
  public static getBuses(): BusVehicle[] { return mockBuses; }
  public static getRoutes(): BusRoute[] { return mockRoutes; }
  public static getLiveGps(busCode: string): LiveGpsLog { return mockGpsLogs[0]; }

  public static assignStudentToBus(busCode: string, routeCode: string, studentRollNo: string): void {
    logTransportAction({
      user: 'Transport Manager',
      action: 'Bus Assigned',
      bus: busCode,
      student: studentRollNo,
      status: 'SUCCESS',
      durationMs: 35,
      details: `Assigned route ${routeCode} bus seat to student ${studentRollNo}`,
    });
  }

  // INFRASTRUCTURE & ASSETS
  public static getBuildings(): CampusBuilding[] { return mockBuildings; }
  public static getAssets(): EnterpriseAsset[] { return mockAssets; }
  public static getWorkOrders(): FacilityWorkOrder[] { return mockWorkOrders; }

  public static addAsset(assetData: Omit<EnterpriseAsset, 'id' | 'assetCode'>): EnterpriseAsset {
    const assetCode = `AST-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAsset: EnterpriseAsset = {
      ...assetData,
      id: `ast-${Date.now()}`,
      assetCode,
    };
    mockAssets.unshift(newAsset);

    logInfraAction({
      user: 'Facility Manager',
      action: 'Asset Logged',
      asset: assetCode,
      location: newAsset.location,
      status: 'SUCCESS',
      durationMs: 30,
      details: `Logged ${newAsset.name} in ${newAsset.location}`,
    });

    return newAsset;
  }
}
