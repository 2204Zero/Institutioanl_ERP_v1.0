import React from 'react';
import { Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const AttendancePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Calendar className="w-7 h-7 text-emerald-600" />
          Attendance Portal
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Daily roll-call tracking, section attendance logs, and automated threshold alerts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Average Attendance Rate</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">92.4%</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Classes Conducted Today</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">48</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Low Attendance Warnings (&lt;75%)</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">14 Students</h3>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
