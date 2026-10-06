import React from 'react';
import { Users, Bell, Search, PlusCircle, ArrowUpRight } from 'lucide-react';
import { apiClient } from '../config/api';
import { useQuery } from '@tanstack/react-query';
const mockChartData = [
    { name: 'Jan', enrollments: 40, dropouts: 24 },
    { name: 'Feb', enrollments: 30, dropouts: 13 },
    { name: 'Mar', enrollments: 20, dropouts: 48 },
    { name: 'Apr', enrollments: 27, dropouts: 39 },
    { name: 'May', enrollments: 18, dropouts: 48 },
    { name: 'Jun', enrollments: 23, dropouts: 38 },
    { name: 'Jul', enrollments: 34, dropouts: 43 },
];
export default function Dashboard() {
    const { data: studentsData, isLoading, isError } = useQuery({
        queryKey: ['students'],
        queryFn: async () => {
            const res = await apiClient.get('/students');
            return res.data?.data;
        }
    });
    const students = studentsData?.content || [];
    return (<div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input type="text" placeholder="Search here" className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"/>
          </div>
          <button className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-50">
            <Bell className="w-4 h-4"/>
          </button>
          <button onClick={() => navigate('/dashboard/admissions')} className="flex items-center space-x-2 bg-black text-white hover:bg-slate-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
            <span>New Admission</span>
            <PlusCircle className="w-4 h-4"/>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Dark Card */}
        <div className="bg-black text-white p-6 rounded-[32px] shadow-xl shadow-black/10 relative overflow-hidden">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-6">
            <Users className="w-5 h-5 text-white"/>
          </div>
          <div className="text-slate-400 text-sm mb-1">Total Active Students</div>
          <div className="text-3xl font-bold text-white mb-4">{studentsData?.totalElements || students.length || '--'}</div>
          <div className="text-xs text-slate-500 mt-2">Active enrollments</div>
          <button className="absolute top-6 right-6 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ArrowUpRight className="w-4 h-4 text-slate-300"/>
          </button>
        </div>

        {/* Light Cards */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm relative border border-slate-100">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-6">
            <Users className="w-5 h-5 text-black"/>
          </div>
          <div className="text-slate-500 text-sm mb-1">Pending Admissions</div>
          <div className="text-3xl font-bold text-slate-300 mb-4">
            --
          </div>
          <div className="text-xs text-slate-400 mt-2">API Missing</div>
        </div>

        <div className="bg-white p-6 rounded-[32px] shadow-sm relative border border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-slate-500 text-sm mb-1">Attendance Today</div>
            <div className="text-3xl font-bold text-slate-300 mb-4">
              --
            </div>
            <div className="text-xs text-slate-400 mt-2">API Missing</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[32px] shadow-sm relative border border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-slate-500 text-sm mb-1">Outstanding Fees</div>
            <div className="text-3xl font-bold text-slate-300 mb-4">--</div>
            <div className="text-xs text-slate-400 mt-2">API Missing</div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Chart Section */}
         <div className="lg:col-span-2 bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Fee Collection vs Outstanding</h3>
              <div className="flex items-center space-x-4 text-sm">
                 <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-[#000000] mr-2"></div>Collected</div>
                 <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-slate-300 mr-2"></div>Outstanding</div>
              </div>
           </div>
           
           <div className="h-[300px] w-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl">
             <div className="text-center text-slate-400">
               <div className="text-sm font-medium">No fee collection data available yet.</div>
               <div className="text-xs mt-1">Backend/API dependency</div>
             </div>
           </div>
         </div>

         {/* List Section */}
         <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col h-full">
           <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-lg">Recent Activity</h3>
             <button className="text-black font-semibold text-sm hover:underline" disabled>View All</button>
           </div>
           <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
             <div className="text-sm font-medium">No recent activity found.</div>
             <div className="text-xs mt-1">Audit API not yet integrated</div>
           </div>
         </div>
      </div>
    </div>);
}
