import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useERP } from '../hooks/useERP';
import { Phase9Service, logInfraAction } from '../services/phase9Service';
import {
  Building,
  Plus,
  Layers,
  GraduationCap,
  Users,
  Server,
  Wrench,
  PieChart,
  Shield,
  Clock,
  Cpu,
} from 'lucide-react';

type InfraTab = 'org-tree' | 'campus-buildings' | 'labs-inventory' | 'asset-depreciation' | 'facility-workorders';

export const OrgStructurePage: React.FC = () => {
  const { addToast } = useERP();
  const [activeTab, setActiveTab] = useState<InfraTab>('org-tree');

  const kpis = Phase9Service.getKPIs();
  const buildings = Phase9Service.getBuildings();
  const assets = Phase9Service.getAssets();
  const workOrders = Phase9Service.getWorkOrders();

  const handleAddAsset = () => {
    Phase9Service.addAsset({
      serialNumber: `SN-NV-${Math.floor(1000 + Math.random() * 9000)}`,
      name: 'High-Performance Workstation Node',
      category: 'COMPUTER',
      location: 'CS Lab 202',
      purchaseDate: new Date().toISOString().slice(0, 10),
      purchaseCost: 250000,
      currentDepreciatedValue: 225000,
      warrantyExpiry: '2028-09-30',
      amcContractNo: 'AMC-DELL-2026',
      amcVendor: 'Dell India Pvt Ltd',
      status: 'OPERATIONAL',
    });
    addToast('Asset Cataloged', 'Registered new Computer Workstation Node.', 'success');
  };

  return (
    <AppLayout>
      <div className="space-y-6 text-left">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Building className="w-7 h-7 text-indigo-600" /> Institutional Organization & Campus Infrastructure
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Phase 9 — Campuses, Academic Buildings, Lab Inventories, Asset Depreciation, AMC Contracts & Work Orders.
            </p>
          </div>

          <Button variant="primary" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-xs" onClick={handleAddAsset}>
            <Plus className="w-4 h-4 mr-1.5" /> Catalog Campus Asset
          </Button>
        </div>

        {/* Sub-system Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200">
          {[
            { id: 'org-tree', label: 'Org Tree & Departments', icon: <Layers className="w-4 h-4" /> },
            { id: 'campus-buildings', label: 'Campus Buildings & Blocks', icon: <Building className="w-4 h-4" /> },
            { id: 'labs-inventory', label: 'Labs & Supercomputers', icon: <Cpu className="w-4 h-4" /> },
            { id: 'asset-depreciation', label: 'Asset Register & AMC', icon: <Server className="w-4 h-4" /> },
            { id: 'facility-workorders', label: 'Work Orders & Maintenance', icon: <Wrench className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as InfraTab)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: ORG TREE */}
        {activeTab === 'org-tree' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 border-l-4 border-l-indigo-600">
                <p className="text-xs font-semibold text-slate-500 uppercase">Campuses</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">2 Campuses</h3>
                <span className="text-[11px] text-emerald-600 font-medium">Main & South City Campuses</span>
              </Card>
              <Card className="p-4 border-l-4 border-l-purple-600">
                <p className="text-xs font-semibold text-slate-500 uppercase">Campus Buildings</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{kpis.totalCampusBuildingsCount} Blocks</h3>
                <span className="text-[11px] text-purple-600 font-medium">Academic, Labs, Hostels</span>
              </Card>
              <Card className="p-4 border-l-4 border-l-emerald-600">
                <p className="text-xs font-semibold text-slate-500 uppercase">Total Asset Valuation</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">₹ 18.5 Cr</h3>
                <span className="text-[11px] text-emerald-600 font-medium">Depreciated Book Value</span>
              </Card>
              <Card className="p-4 border-l-4 border-l-amber-500">
                <p className="text-xs font-semibold text-slate-500 uppercase">Active Work Orders</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{kpis.openWorkOrdersCount} Open</h3>
                <span className="text-[11px] text-amber-600 font-medium">Facility maintenance</span>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: CAMPUS BUILDINGS */}
        {activeTab === 'campus-buildings' && (
          <div className="space-y-6">
            <Card className="p-0 overflow-hidden border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Building Code</th>
                    <th className="p-3.5">Building Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Floors / Rooms</th>
                    <th className="p-3.5">Total Area (Sq Ft)</th>
                    <th className="p-3.5">In-Charge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {buildings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80">
                      <td className="p-3.5 font-mono font-bold text-indigo-600">{b.buildingCode}</td>
                      <td className="p-3.5 font-semibold text-slate-900">{b.name}</td>
                      <td className="p-3.5"><Badge variant="info">{b.category}</Badge></td>
                      <td className="p-3.5">{b.totalFloors} Floors • {b.totalRooms} Rooms</td>
                      <td className="p-3.5 font-mono font-bold text-slate-800">{b.totalAreaSqFt.toLocaleString()} sq ft</td>
                      <td className="p-3.5 text-slate-700">{b.inChargeName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* TAB 4: ASSET REGISTER & DEPRECIATION */}
        {activeTab === 'asset-depreciation' && (
          <div className="space-y-6">
            <Card className="p-0 overflow-hidden border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Asset Code</th>
                    <th className="p-3.5">Asset Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5">Purchase Cost</th>
                    <th className="p-3.5">Depreciated Book Value</th>
                    <th className="p-3.5">AMC Vendor</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assets.map((ast) => (
                    <tr key={ast.id} className="hover:bg-slate-50/80">
                      <td className="p-3.5 font-mono font-bold text-indigo-600">{ast.assetCode}</td>
                      <td className="p-3.5 font-semibold text-slate-900">{ast.name}</td>
                      <td className="p-3.5"><Badge variant="purple">{ast.category}</Badge></td>
                      <td className="p-3.5 text-slate-700">{ast.location}</td>
                      <td className="p-3.5 font-mono">₹{ast.purchaseCost.toLocaleString('en-IN')}</td>
                      <td className="p-3.5 font-mono font-bold text-emerald-600">₹{ast.currentDepreciatedValue.toLocaleString('en-IN')}</td>
                      <td className="p-3.5 text-slate-600">{ast.amcVendor}</td>
                      <td className="p-3.5"><Badge variant="success">{ast.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* TAB 5: WORK ORDERS & AUDIT LOG STREAM */}
        {activeTab === 'facility-workorders' && (
          <div className="space-y-6">
            <Card className="p-4 bg-slate-950 text-slate-200 font-mono text-xs rounded-xl space-y-2 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span className="font-bold text-indigo-400">Live Spring Boot stdout Audit Stream</span>
                <span>Logger: InfrastructureController</span>
              </div>
              <div className="space-y-1 text-[11px] text-slate-300">
                <p><span className="text-indigo-400">[INFRASTRUCTURE]</span> User : Facility Manager | Action : Asset Logged | Asset : AST-2026-9012 | Location : AI Research Lab 301 | Status : SUCCESS | Duration : 30ms</p>
                <p><span className="text-indigo-400">[INFRASTRUCTURE]</span> User : Facility Tech | Action : Completed Work Order WO-2026-041 | Status : SUCCESS | Duration : 18ms</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
