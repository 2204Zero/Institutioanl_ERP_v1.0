import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useERP } from '../hooks/useERP';
import { Phase9Service, logHostelAction } from '../services/phase9Service';
import {
  Home,
  Key,
  Users,
  CheckCircle2,
  ShieldAlert,
  PieChart,
  Utensils,
  UserCheck,
  Wrench,
  Shield,
  FileText,
  Plus,
  QrCode,
  AlertTriangle,
} from 'lucide-react';

type HostelTab =
  | 'overview'
  | 'structure-rooms'
  | 'allocation'
  | 'mess-management'
  | 'visitors'
  | 'maintenance'
  | 'security';

export const HostelPage: React.FC = () => {
  const { addToast } = useERP();
  const [activeTab, setActiveTab] = useState<HostelTab>('overview');

  const kpis = Phase9Service.getKPIs();
  const rooms = Phase9Service.getRooms();
  const profiles = Phase9Service.getStudentHostelProfiles();

  const handleAllocateBed = (roomNo: string) => {
    const success = Phase9Service.allocateRoomBed(roomNo, '2024CS110', 'Rahul Mehta');
    if (success) {
      addToast('Room Allocated Successfully', `Assigned bed in Room ${roomNo} to Rahul Mehta (2024CS110).`, 'success');
    } else {
      addToast('Allocation Failed', `Room ${roomNo} is already full or unavailable.`, 'error');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 text-left">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Home className="w-7 h-7 text-amber-600" /> Enterprise Hostel & Mess Management Suite
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Phase 9 — Room Allocation Matrix, Mess Meals, Gate Visitor QR Passes, Night Security & Work Orders.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 text-xs"
            onClick={() => handleAllocateBed('A-204')}
          >
            <Key className="w-4 h-4 mr-1.5" /> Auto-Allocate Waiting Student
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200">
          {[
            { id: 'overview', label: 'Hostel Dashboard', icon: <PieChart className="w-4 h-4" /> },
            { id: 'structure-rooms', label: 'Blocks & Room Structure', icon: <Home className="w-4 h-4" /> },
            { id: 'allocation', label: 'Student Allocations', icon: <Key className="w-4 h-4" /> },
            { id: 'mess-management', label: 'Mess & Meal Plans', icon: <Utensils className="w-4 h-4" /> },
            { id: 'visitors', label: 'Visitor Registration', icon: <UserCheck className="w-4 h-4" /> },
            { id: 'maintenance', label: 'Hostel Maintenance', icon: <Wrench className="w-4 h-4" /> },
            { id: 'security', label: 'Night Security & Gate Logs', icon: <Shield className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as HostelTab)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 border-l-4 border-l-amber-600">
                <p className="text-xs font-semibold text-slate-500 uppercase">Total Residential Capacity</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{kpis.totalHostelBeds} Beds</h3>
                <span className="text-[11px] text-emerald-600 font-medium">4 Hostel Blocks (Boys & Girls)</span>
              </Card>

              <Card className="p-4 border-l-4 border-l-emerald-600">
                <p className="text-xs font-semibold text-slate-500 uppercase">Occupancy Rate</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{kpis.hostelOccupancyPercentage}%</h3>
                <span className="text-[11px] text-emerald-600 font-medium">2,260 Active Residents</span>
              </Card>

              <Card className="p-4 border-l-4 border-l-purple-600">
                <p className="text-xs font-semibold text-slate-500 uppercase">Monthly Mess Revenue</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">₹ 1.56 Cr</h3>
                <span className="text-[11px] text-purple-600 font-medium">Synced with ERP Finance</span>
              </Card>

              <Card className="p-4 border-l-4 border-l-rose-500">
                <p className="text-xs font-semibold text-slate-500 uppercase">Open Maintenance Complaints</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{kpis.activeComplaintsCount}</h3>
                <span className="text-[11px] text-rose-600 font-medium">24-hour SLA active</span>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-5 border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm">Hostel Block Capacity Breakdown</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span>Boys Hostel Block A (Ramanujan)</span><span className="font-bold text-emerald-600">220 / 240 Beds</span></div>
                  <div className="flex justify-between"><span>Girls Hostel Block B (Kalpana Chawla)</span><span className="font-bold text-emerald-600">180 / 200 Beds</span></div>
                  <div className="flex justify-between"><span>International Scholars Block C</span><span className="font-bold text-emerald-600">95 / 100 Beds</span></div>
                </div>
              </Card>

              <Card className="p-5 border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm">Today's Mess Menu & Meal Attendance</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span>Breakfast</span><span className="font-semibold text-slate-700">Masala Dosa, Chutney, Coffee (1,840 Served)</span></div>
                  <div className="flex justify-between"><span>Lunch</span><span className="font-semibold text-slate-700">North Indian Thali, Paneer & Dal (2,100 Served)</span></div>
                  <div className="flex justify-between"><span>Dinner</span><span className="font-semibold text-slate-700">Roti, Subzi, Jeera Rice (Pending)</span></div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: ROOM MATRIX */}
        {activeTab === 'structure-rooms' && (
          <div className="space-y-6">
            <Card className="p-0 overflow-hidden border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Room #</th>
                    <th className="p-3.5">Block / Wing</th>
                    <th className="p-3.5">Floor</th>
                    <th className="p-3.5">Type & AC</th>
                    <th className="p-3.5 text-center">Occupancy</th>
                    <th className="p-3.5">Monthly Fee</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rooms.map((rm) => (
                    <tr key={rm.id} className="hover:bg-slate-50/80">
                      <td className="p-3.5 font-mono font-bold text-amber-600">{rm.roomNumber}</td>
                      <td className="p-3.5 font-semibold text-slate-900">{rm.blockCode} ({rm.wing})</td>
                      <td className="p-3.5">Floor {rm.floor}</td>
                      <td className="p-3.5"><Badge variant="neutral">{rm.roomType} • {rm.acStatus}</Badge></td>
                      <td className="p-3.5 text-center font-bold text-slate-800">{rm.occupancyCount} / {rm.capacity}</td>
                      <td className="p-3.5 font-medium text-emerald-600">₹{rm.monthlyFee.toLocaleString('en-IN')}</td>
                      <td className="p-3.5"><Badge variant={rm.status === 'FULL' ? 'purple' : 'success'}>{rm.status}</Badge></td>
                      <td className="p-3.5 text-right">
                        <Button
                          variant="primary"
                          size="sm"
                          className="bg-amber-600 hover:bg-amber-700 text-[11px]"
                          onClick={() => handleAllocateBed(rm.roomNumber)}
                          disabled={rm.occupancyCount >= rm.capacity}
                        >
                          Allocate Bed
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* TAB 3: ALLOCATIONS */}
        {activeTab === 'allocation' && (
          <div className="space-y-6">
            <Card className="p-0 overflow-hidden border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Hostel ID</th>
                    <th className="p-3.5">Student Details</th>
                    <th className="p-3.5">Room & Bed #</th>
                    <th className="p-3.5">Guardian Contact</th>
                    <th className="p-3.5">Mess Plan</th>
                    <th className="p-3.5">Fee Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {profiles.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80">
                      <td className="p-3.5 font-mono font-bold text-slate-700">{p.hostelId}</td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900">{p.studentName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{p.studentRollNo} • {p.department}</div>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-amber-600">{p.roomNumber} ({p.bedNumber})</td>
                      <td className="p-3.5 text-slate-700">{p.guardianName} ({p.guardianPhone})</td>
                      <td className="p-3.5"><Badge variant="info">{p.messPlan}</Badge></td>
                      <td className="p-3.5"><Badge variant="success">{p.feeStatus}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* TAB 7: AUDIT & SECURITY */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <Card className="p-4 bg-slate-950 text-slate-200 font-mono text-xs rounded-xl space-y-2 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span className="font-bold text-amber-400">Live Spring Boot stdout Audit Stream</span>
                <span>Logger: HostelController</span>
              </div>
              <div className="space-y-1 text-[11px] text-slate-300">
                <p><span className="text-amber-400">[HOSTEL]</span> User : Warden | Action : Room Allocation | Student : 2024CS110 | Room : A-203 | Status : SUCCESS | Duration : 28ms</p>
                <p><span className="text-amber-400">[HOSTEL]</span> User : Gate Security | Action : Scanned Visitor Pass HVP-2026-041 | Status : SUCCESS | Duration : 19ms</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
