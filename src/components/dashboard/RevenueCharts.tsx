import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { BarChart3, PieChart as PieIcon, Layers } from 'lucide-react';
import { Card } from '../ui/Card';
import { monthlyCollectionChartData, paymentModeChartData } from '../../constants/mockData';
import { useERP } from '../../hooks/useERP';

export const RevenueCharts: React.FC = () => {
  const { addToast } = useERP();
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [timeframe, setTimeframe] = useState<'monthly' | 'quarterly'>('monthly');

  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs text-left">
          <p className="font-bold text-slate-300">{label}</p>
          <div className="mt-1 space-y-1">
            {payload.map((entry: any, index: number) => (
              <p key={`item-${index}`} style={{ color: entry.color }} className="font-semibold">
                {entry.name}: ₹{entry.value} Lakhs
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Monthly Revenue & Collection Trend (2 Columns) */}
      <Card className="lg:col-span-2 flex flex-col justify-between">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-left">
            <BarChart3 className="w-5 h-5 text-brand-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Institutional Revenue & Dues Collection</h3>
              <p className="text-[11px] text-slate-500">Real-time monetary flow across academic months (in Lakhs)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-100 p-0.5 rounded-lg flex items-center text-xs font-semibold">
              <button
                onClick={() => setChartType('area')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  chartType === 'area' ? 'bg-white text-brand-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Area
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  chartType === 'bar' ? 'bg-white text-brand-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Bar
              </button>
            </div>

            <button
              onClick={() => {
                setTimeframe((prev) => (prev === 'monthly' ? 'quarterly' : 'monthly'));
                addToast('Timeframe Toggled', `Switched chart view to ${timeframe === 'monthly' ? 'Quarterly' : 'Monthly'}.`, 'info');
              }}
              className="p-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
              title="Toggle View Mode"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={monthlyCollectionChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val}L`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="collections"
                  name="Fee Collections (₹ Lakhs)"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorCollected)"
                />
                <Area
                  type="monotone"
                  dataKey="target"
                  name="Monthly Target (₹ Lakhs)"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTarget)"
                />
              </AreaChart>
            ) : (
              <BarChart data={monthlyCollectionChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val}L`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="collections" name="Fee Collections (₹ Lakhs)" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Monthly Target (₹ Lakhs)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 2. Payment Gateway Distribution (1 Column) */}
      <Card className="flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-left">
          <div className="flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Payment Gateway Share</h3>
              <p className="text-[11px] text-slate-500">Channel distribution of incoming tuition fees</p>
            </div>
          </div>
        </div>

        <div className="h-56 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={paymentModeChartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {paymentModeChartData.map((_entry: { name: string; value: number }, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value}% Share`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-1.5 border-t border-slate-100 pt-3">
          {paymentModeChartData.map((d: { name: string; value: number; amount: string }, i: number) => (
            <div key={d.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-left">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="font-semibold text-slate-700">{d.name}</span>
              </div>
              <span className="font-mono text-slate-500 font-bold">{d.amount} ({d.value}%)</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
