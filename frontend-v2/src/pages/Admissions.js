import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { UserCheck, Search, Loader2, FileText, AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
export default function Admissions() {
    const [activeTab, setActiveTab] = useState('applications');
    // We intentionally call endpoints that don't exist yet to serve as a contract for the backend team.
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['admissions', activeTab],
        queryFn: async () => {
            const res = await apiClient.get(`/admissions/${activeTab}`);
            return res.data?.data;
        },
        retry: false
    });
    return (<div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Admissions Workflow</h1>
          <p className="text-slate-500 text-sm">Manage inquiries, applications, and enrollments.</p>
        </div>
        <Button className="bg-black text-white hover:bg-slate-800 rounded-full px-6">
          <UserCheck className="w-4 h-4 mr-2"/> New Application
        </Button>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 pt-4 space-x-8">
          {['inquiries', 'applications', 'verification', 'decisions'].map((tab) => (<button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 text-sm font-semibold capitalize transition-colors border-b-2 ${activeTab === tab
                ? 'border-black text-black'
                : 'border-transparent text-slate-400 hover:text-slate-700'}`}>
              {tab.replace('-', ' ')}
            </button>))}
        </div>

        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <Input type="text" placeholder={`Search ${activeTab}...`} className="pl-9 pr-4 py-2 bg-white border-slate-200 rounded-full text-sm w-72 h-10" disabled/>
          </div>
          <div className="text-sm text-slate-500 font-medium">
            0 records
          </div>
        </div>

        {/* Table Area */}
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold px-6 py-4">Applicant</TableHead>
              <TableHead className="font-semibold px-6 py-4">Applied Program</TableHead>
              <TableHead className="font-semibold px-6 py-4">Date</TableHead>
              <TableHead className="font-semibold px-6 py-4">Status</TableHead>
              <TableHead className="font-semibold px-6 py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (<TableRow>
                <TableCell colSpan={5} className="h-48 text-center text-slate-500">
                  <div className="flex justify-center items-center">
                    <Loader2 className="w-6 h-6 animate-spin text-black"/>
                  </div>
                </TableCell>
              </TableRow>) : isError ? (<TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <AlertCircle className="w-8 h-8 text-slate-300 mb-2"/>
                    <div className="font-medium text-slate-900">Backend API Missing</div>
                    <div className="text-sm mt-1 max-w-md">
                      Endpoint <code className="bg-slate-100 px-1 py-0.5 rounded text-red-500">GET /api/v1/admissions/{activeTab}</code> not found. 
                      Waiting for backend team integration.
                    </div>
                  </div>
                </TableCell>
              </TableRow>) : data?.length === 0 ? (<TableRow>
                <TableCell colSpan={5} className="h-48 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="w-8 h-8 text-slate-300 mb-2"/>
                    <div className="font-medium text-slate-900">No {activeTab} found.</div>
                    <div className="text-sm mt-1">There are currently no records in this stage.</div>
                  </div>
                </TableCell>
              </TableRow>) : null}
          </TableBody>
        </Table>
      </div>
    </div>);
}
