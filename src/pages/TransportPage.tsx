import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useERP } from '../hooks/useERP';
import { Phase9Service, logTransportAction } from '../services/phase9Service';
import {
  Bus,
  MapPin,
  Users,
  ShieldCheck,
  Ticket,
  PieChart,
  Navigation,
  Fuel,
  Wrench,
  QrCode,
  Compass,
} from 'lucide-react';

type TransportTab =
  | 'overview'
  | 'fleet-buses'
  | 'routes-stops'
  | 'live-gps'
  | 'student-passes'
  | 'fuel-maintenance';

export const TransportPage: React.FC = () => {
  const { addToast } = useERP();
  const [activeTab, setActiveTab] = useState<TransportTab>('overview');

  const kpis = Phase9Service.getKPIs();
  const buses = Phase9Service.getBuses();
  const routes = Phase9Service.getRoutes();
  const liveGps = Phase9Service.getLiveGps('BUS-104');

  const handleIssueBusPass = (routeCode: string) => {
    Phase9Service.assignStudentToBus('BUS-104', routeCode, '2024CS108');
    addToast('Bus Pass Generated', `Digital QR Bus Pass generated for Route ${routeCode}.`, 'success');
  };

  return (
    <AppLayout>
      <div className="space-y-6 text-left">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Bus className="w-7 h-7 text-emerald-600" /> Enterprise Transport & Live GPS Fleet Suite
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Phase 9 — Fleet EV Buses, Route Optimization, Live GPS Tracking, Driver Scheduling & Digital QR Passes.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-xs"
            onClick={() => handleIssueBusPass('ROUTE-01')}
          >
            <Ticket className="w-4 h-4 mr-1.5" /> Issue Digital Bus Pass
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200">
          {[
            { id: 'overview', label: 'Transport Dashboard', icon: <PieChart className="w-4 h-4" /> },
            { id: 'fleet-buses', label: 'Bus Fleet Management', icon: <Bus className="w-4 h-4" /> },
            { id: 'routes-stops', label: 'Routes & Pickup Stops', icon: <Navigation className="w-4 h-4" /> },
            { id: 'live-gps', label: 'Live GPS & Geo-Fencing', icon: <Compass className="w-4 h-4" /> },
            { id: 'student-passes', label: 'Student Bus Passes', icon: <QrCode className="w-4 h-4" /> },
            { id: 'fuel-maintenance', label: 'Fuel & Maintenance Logs', icon: <Fuel className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TransportTab)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
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
              <Card className="p-4 border-l-4 border-l-emerald-600">
                <p className="text-xs font-semibold text-slate-500 uppercase">Active Bus Fleet</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{kpis.totalBusesCount} Vehicles</h3>
                <span className="text-[11px] text-emerald-600 font-medium">{kpis.gpsActiveVehiclesCount} GPS Live Tracked</span>
              </Card>

              <Card className="p-4 border-l-4 border-l-brand-600">
                <p className="text-xs font-semibold text-slate-500 uppercase">Active Transport Routes</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{kpis.activeBusRoutesCount} Routes</h3>
                <span className="text-[11px] text-emerald-600 font-medium">Morning & Evening Loops</span>
              </Card>

              <Card className="p-4 border-l-4 border-l-purple-600">
                <p className="text-xs font-semibold text-slate-500 uppercase">Commuters Assigned</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{kpis.commutersAssignedCount} Students</h3>
                <span className="text-[11px] text-purple-600 font-medium">QR Bus Passes Validated</span>
              </Card>

              <Card className="p-4 border-l-4 border-l-amber-500">
                <p className="text-xs font-semibold text-slate-500 uppercase">Fleet GPS Health Status</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">100% Online</h3>
                <span className="text-[11px] text-emerald-600 font-medium">Zero Route Deviations</span>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-5 border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm">Active Fleet Schedule</h3>
                <div className="space-y-2 text-xs">
                  {buses.map((b) => (
                    <div key={b.id} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <div>
                        <span className="font-bold text-slate-900">{b.busNumber}</span> ({b.busCode})
                        <div className="text-[11px] text-slate-500">Driver: {b.driverName}</div>
                      </div>
                      <Badge variant="success">{b.status}</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5 border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm">Live GPS Position Stream</h3>
                <div className="p-3 bg-slate-900 text-white rounded-lg font-mono text-xs space-y-1">
                  <div className="flex justify-between text-emerald-400"><span>Vehicle: BUS-104</span><span>Status: {liveGps.geoFenceStatus}</span></div>
                  <div>Coordinates: Lat {liveGps.currentLat}, Lng {liveGps.currentLng}</div>
                  <div>Current Speed: {liveGps.speedKmph} km/h • ETA to Campus: {liveGps.etaMinutes} Mins</div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 4: LIVE GPS */}
        {activeTab === 'live-gps' && (
          <div className="space-y-6">
            <Card className="p-5 bg-slate-900 text-white rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-6 h-6 text-emerald-400 animate-spin" />
                  <h3 className="text-lg font-bold">Real-Time Vehicle GPS Telemetry</h3>
                </div>
                <Badge variant="success">GPS LIVE 10Hz</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-3 bg-slate-800/80 rounded border border-slate-700">
                  <span className="text-slate-400">Vehicle Identifier</span>
                  <div className="text-base font-bold text-emerald-400 mt-1">BUS-104 (RJ14PA1023)</div>
                </div>

                <div className="p-3 bg-slate-800/80 rounded border border-slate-700">
                  <span className="text-slate-400">Telemetry Speed</span>
                  <div className="text-base font-bold text-sky-400 mt-1">42.5 km/h</div>
                </div>

                <div className="p-3 bg-slate-800/80 rounded border border-slate-700">
                  <span className="text-slate-400">Geo-Fence Status</span>
                  <div className="text-base font-bold text-purple-400 mt-1">INSIDE_ROUTE_BOUNDS</div>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-slate-950 text-slate-200 font-mono text-xs rounded-xl space-y-2 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span className="font-bold text-emerald-400">Live Spring Boot stdout Audit Stream</span>
                <span>Logger: TransportController</span>
              </div>
              <div className="space-y-1 text-[11px] text-slate-300">
                <p><span className="text-emerald-400">[TRANSPORT]</span> User : Transport Manager | Action : Bus Assigned | Bus : RJ14PA1023 | Student : 2024CS110 | Status : SUCCESS | Duration : 35ms</p>
                <p><span className="text-emerald-400">[TRANSPORT]</span> User : System Engine | Action : Telemetry Update BUS-104 | Status : SUCCESS | Duration : 14ms</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
