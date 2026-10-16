import React from 'react';
import { DepartmentStats } from '../types';
import { formatMinutes } from '../services/dataService';
import { 
  Building2, 
  Users, 
  Clock, 
  Bed, 
  AlertCircle, 
  Stethoscope,
  Activity,
  Filter
} from 'lucide-react';

interface DepartmentHeatmapProps {
  departmentStats: Record<string, DepartmentStats>;
  selectedDepartmentId: string;
  onSelectDepartment: (deptId: string) => void;
}

export const DepartmentHeatmap: React.FC<DepartmentHeatmapProps> = ({
  departmentStats,
  selectedDepartmentId,
  onSelectDepartment
}) => {
  const departments = Object.values(departmentStats);

  // Get color schemes based on utilization rate
  const getUtilizationTheme = (rate: number, isOverloaded: boolean) => {
    if (isOverloaded || rate >= 85) {
      return {
        badgeBg: 'bg-rose-950/80 text-rose-300 border-rose-800/80',
        progressBar: 'bg-gradient-to-r from-rose-500 to-red-500 shadow-glow-rose',
        border: 'border-rose-900/60 hover:border-rose-500/70',
        cardBg: 'bg-slate-900/90 hover:bg-slate-850',
        glow: 'shadow-glow-rose',
        indicatorText: 'OVERLOADED (>85%)',
        accentColor: 'text-rose-400'
      };
    } else if (rate >= 70) {
      return {
        badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-800/80',
        progressBar: 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-glow-amber',
        border: 'border-amber-900/60 hover:border-amber-500/70',
        cardBg: 'bg-slate-900/90 hover:bg-slate-850',
        glow: 'shadow-glow-amber',
        indicatorText: 'ELEVATED FLOW',
        accentColor: 'text-amber-400'
      };
    } else {
      return {
        badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80',
        progressBar: 'bg-gradient-to-r from-teal-500 to-emerald-400 shadow-glow-teal',
        border: 'border-slate-800 hover:border-teal-500/60',
        cardBg: 'bg-slate-900/80 hover:bg-slate-850',
        glow: '',
        indicatorText: 'NORMAL FLOW',
        accentColor: 'text-teal-400'
      };
    }
  };

  const getServiceTypeBadge = (type: string) => {
    switch (type) {
      case 'Emergency':
        return 'bg-red-950/60 text-red-400 border-red-900/40';
      case 'Diagnostics':
        return 'bg-cyan-950/60 text-cyan-400 border-cyan-900/40';
      case 'Support':
        return 'bg-purple-950/60 text-purple-400 border-purple-900/40';
      case 'Admin':
        return 'bg-slate-800/60 text-slate-300 border-slate-700/40';
      default:
        return 'bg-blue-950/60 text-blue-400 border-blue-900/40';
    }
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-400" />
            Department Load & Capacity Heatmap
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time visual monitoring of all 12 operational departments. Click any card to filter patient queue.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {selectedDepartmentId && (
            <button
              onClick={() => onSelectDepartment('')}
              className="px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30 flex items-center gap-1.5 transition-all"
            >
              <Filter className="w-3 h-3" />
              Showing: <span className="font-semibold">{departmentStats[selectedDepartmentId]?.department_name || selectedDepartmentId}</span>
              <span className="text-slate-400 hover:text-white ml-1 font-mono">✕</span>
            </button>
          )}

          <div className="hidden md:flex items-center gap-3 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> &lt;70% Optimal
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> 70-85% High
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> &gt;85% Overloaded
            </span>
          </div>
        </div>
      </div>

      {/* Grid of 12 department cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {departments.map((dept) => {
          const isSelected = selectedDepartmentId === dept.department_id;
          const theme = getUtilizationTheme(dept.utilizationRate, dept.isOverloaded);

          return (
            <div
              key={dept.department_id}
              onClick={() => onSelectDepartment(isSelected ? '' : dept.department_id)}
              className={`rounded-xl p-4 border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                theme.cardBg
              } ${
                isSelected 
                  ? 'border-teal-400 ring-2 ring-teal-500/30 shadow-lg scale-[1.01]' 
                  : theme.border
              }`}
            >
              {/* Header: Dept Name, Code, and Service Type */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {dept.department_id}
                      </span>
                      <h3 className="font-semibold text-slate-100 text-sm tracking-tight truncate max-w-[150px]" title={dept.department_name}>
                        {dept.department_name}
                      </h3>
                    </div>
                    <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full border mt-1 ${getServiceTypeBadge(dept.service_type)}`}>
                      {dept.service_type}
                    </span>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${theme.badgeBg}`}>
                    {dept.utilizationRate}%
                  </span>
                </div>

                {/* Utilization Progress Bar */}
                <div className="mt-2 mb-3">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-mono">
                    <span className="flex items-center gap-1">
                      Capacity Utilization
                    </span>
                    <span className={dept.isOverloaded ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                      {theme.indicatorText}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${theme.progressBar}`}
                      style={{ width: `${Math.min(100, Math.max(5, dept.utilizationRate))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Department Statistics Metrics */}
              <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-800/80 text-xs">
                {/* Active Queue & Beds */}
                <div className="bg-slate-950/50 rounded-lg p-2 border border-slate-800/60">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-0.5">
                    <Users className="w-3 h-3 text-slate-400" />
                    Active Queue
                  </div>
                  <div className="font-mono font-bold text-slate-100 flex items-baseline gap-1">
                    <span>{dept.activePatients}</span>
                    <span className="text-[10px] text-slate-400 font-normal">/ {dept.bed_count} beds</span>
                  </div>
                </div>

                {/* Average Dwell Time */}
                <div className="bg-slate-950/50 rounded-lg p-2 border border-slate-800/60">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Avg Dwell
                  </div>
                  <div className="font-mono font-bold text-slate-100">
                    {formatMinutes(dept.avgDwellMinutes)}
                  </div>
                </div>
              </div>

              {/* Bottom footer: Wait vs Service breakdown & staff */}
              <div className="mt-2 pt-2 border-t border-slate-800/40 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Wait: <strong className="text-slate-200">{dept.avgWaitMinutes}m</strong></span>
                <span>Staff: <strong className="text-slate-300">{dept.staff_count}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
