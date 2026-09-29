import React from 'react';
import { DataPoint, SeriesData, ChartType } from '../../types/analyticsTypes';

interface ChartEngineProps {
  type: ChartType;
  title?: string;
  subtitle?: string;
  data: DataPoint[];
  series?: SeriesData[];
  height?: number;
  showLegend?: boolean;
}

export const EnterpriseChartEngine: React.FC<ChartEngineProps> = ({
  type,
  title,
  subtitle,
  data,
  series,
  height = 280,
  showLegend = true,
}) => {

  // Maximum value calculation helper
  const maxValue = Math.max(...data.map((d) => d.value), 10);

  // Render Bar & Stacked Bar Chart
  const renderBarChart = () => (
    <div className="w-full flex flex-col justify-end gap-3 pt-4" style={{ height: `${height}px` }}>
      <div className="flex-1 flex items-end justify-between gap-2 border-b border-slate-700/60 pb-2 px-2">
        {data.map((item, idx) => {
          const heightPercent = Math.min(Math.max((item.value / maxValue) * 100, 8), 100);
          const barColor = item.color || (idx % 2 === 0 ? '#3B82F6' : '#10B981');
          return (
            <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
              {/* Tooltip */}
              <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs py-1 px-2.5 rounded border border-slate-700 shadow-xl pointer-events-none whitespace-nowrap z-20">
                {item.label}: <span className="font-bold">{item.value.toLocaleString()}</span>
              </div>
              {/* Bar element */}
              <div
                className="w-full max-w-[48px] rounded-t transition-all duration-500 ease-out hover:brightness-110 shadow-sm"
                style={{
                  height: `${heightPercent}%`,
                  backgroundColor: barColor,
                }}
              />
              <span className="text-[11px] font-medium text-slate-400 mt-2 truncate max-w-full text-center">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render Line & Area Chart
  const renderLineChart = () => {
    const points = data
      .map((item, idx) => {
        const x = (idx / (data.length - 1 || 1)) * 100;
        const y = 100 - (item.value / maxValue) * 80;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <div className="w-full pt-4 flex flex-col justify-between" style={{ height: `${height}px` }}>
        <div className="flex-1 relative w-full border-b border-slate-700/60 pb-2">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Area gradient */}
            {type === 'area' && (
              <polygon
                points={`0,100 ${points} 100,100`}
                fill="url(#chartGradient)"
                opacity="0.25"
              />
            )}
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <polyline
              fill="none"
              stroke="#3B82F6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
        {/* X-axis labels */}
        <div className="flex justify-between px-2 pt-2 text-[11px] text-slate-400 font-medium">
          {data.map((d, i) => (
            <span key={i}>{d.label}</span>
          ))}
        </div>
      </div>
    );
  };

  // Render Donut & Pie Chart
  const renderDonutChart = () => {
    const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1;
    let accumulatedPercent = 0;
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

    return (
      <div className="w-full flex items-center justify-around gap-6 pt-2" style={{ height: `${height}px` }}>
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            {data.map((item, idx) => {
              const percent = (item.value / total) * 100;
              const strokeDasharray = `${percent} ${100 - percent}`;
              const strokeDashoffset = -accumulatedPercent;
              accumulatedPercent += percent;
              const sliceColor = item.color || colors[idx % colors.length];

              return (
                <circle
                  key={idx}
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke={sliceColor}
                  strokeWidth="4.5"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                />
              );
            })}
          </svg>
          {type === 'donut' && (
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xs text-slate-400 font-medium">Total</span>
              <span className="text-lg font-bold text-white">{total.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2">
            {data.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-300">
                <span
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{ backgroundColor: item.color || colors[idx % colors.length] }}
                />
                <span className="truncate max-w-[120px] font-medium">{item.label}</span>
                <span className="text-slate-400 font-mono ml-auto">
                  {Math.round((item.value / total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render Gauge Chart
  const renderGauge = () => {
    const value = data[0]?.value || 75;
    const color = value > 80 ? '#10B981' : value > 50 ? '#F59E0B' : '#EF4444';
    return (
      <div className="w-full flex flex-col items-center justify-center pt-2" style={{ height: `${height}px` }}>
        <div className="relative w-44 h-24 overflow-hidden flex justify-center items-end">
          <div className="w-44 h-44 rounded-full border-[14px] border-slate-800 border-t-emerald-500 border-r-emerald-500 transform -rotate-45" />
          <div className="absolute text-center bottom-2">
            <span className="text-3xl font-bold text-white" style={{ color }}>
              {value}%
            </span>
            <p className="text-xs text-slate-400 mt-1 font-medium">{data[0]?.label || 'Performance Index'}</p>
          </div>
        </div>
      </div>
    );
  };

  // Render Data Table Fallback View
  const renderDataTable = () => (
    <div className="w-full overflow-x-auto pt-2" style={{ height: `${height}px` }}>
      <table className="w-full text-left text-xs text-slate-300 border-collapse">
        <thead>
          <tr className="border-b border-slate-700 bg-slate-800/60 text-slate-400 uppercase tracking-wider font-semibold">
            <th className="py-2.5 px-3">Metric Category</th>
            <th className="py-2.5 px-3 text-right">Value</th>
            <th className="py-2.5 px-3 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-slate-800/40 transition-colors">
              <td className="py-2.5 px-3 font-medium text-slate-200">{row.label}</td>
              <td className="py-2.5 px-3 text-right font-mono font-semibold text-brand-400">
                {row.value.toLocaleString()}
              </td>
              <td className="py-2.5 px-3 text-right">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Optimal
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 shadow-lg flex flex-col justify-between backdrop-blur-sm">
      {(title || subtitle) && (
        <div className="mb-2">
          {title && <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      )}

      {type === 'line' || type === 'area'
        ? renderLineChart()
        : type === 'pie' || type === 'donut'
        ? renderDonutChart()
        : type === 'gauge'
        ? renderGauge()
        : type === 'dataTable'
        ? renderDataTable()
        : renderBarChart()}
    </div>
  );
};
