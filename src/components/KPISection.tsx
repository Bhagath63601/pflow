import React from 'react';
import { HospitalFlowMetrics } from '../types';
import { formatMinutes } from '../services/dataService';
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  Flame, 
  TrendingUp, 
  Activity,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';

interface KPISectionProps {
  metrics: HospitalFlowMetrics;
  onFilterOverloaded?: () => void;
  onFilterCritical?: () => void;
}

export const KPISection: React.FC<KPISectionProps> = ({
  metrics,
  onFilterOverloaded,
  onFilterCritical
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Total Active Patients */}
      <div className="glass-panel rounded-xl p-5 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-teal-500/40 transition-all">
        <div className="absolute top-0 right-0 w-28 h-28 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all -mr-10 -mt-10" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-teal-400" />
            Total Active Patients
          </span>
          <span className="flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-teal-950/80 text-teal-300 border border-teal-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
            LIVE FLOW
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
            {metrics.totalActivePatients.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 font-normal">
            active in hospital
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-slate-500" />
            Total Encounters:
          </span>
          <span className="font-mono font-semibold text-slate-200">
            {metrics.totalEncounters.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 2. Average Waiting Time */}
      <div className="glass-panel rounded-xl p-5 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-cyan-500/40 transition-all">
        <div className="absolute top-0 right-0 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all -mr-10 -mt-10" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyan-400" />
            Average Waiting Time
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            SLA: &lt; 30m
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-cyan-300 tracking-tight font-mono">
            {formatMinutes(metrics.avgWaitTimeAllDepartments)}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            ({metrics.avgWaitTimeAllDepartments} mins avg)
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            Department Baseline:
          </span>
          <span className={`font-mono font-semibold ${metrics.avgWaitTimeAllDepartments > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {metrics.avgWaitTimeAllDepartments > 30 ? `+${metrics.avgWaitTimeAllDepartments - 30}m over target` : 'Within Target'}
          </span>
        </div>
      </div>

      {/* 3. Overloaded Departments (>85% capacity) */}
      <div 
        onClick={onFilterOverloaded}
        className="glass-panel rounded-xl p-5 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-rose-500/40 transition-all cursor-pointer"
        title="Click to view overloaded departments"
      >
        <div className="absolute top-0 right-0 w-28 h-28 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all -mr-10 -mt-10" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
            Overloaded Depts (&gt;85%)
          </span>
          <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
            metrics.overloadedDepartmentsCount > 0 
              ? 'bg-rose-950/80 text-rose-300 border-rose-800/80' 
              : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
          }`}>
            {metrics.overloadedDepartmentsCount > 0 ? 'CAPACITY ALERT' : 'OPTIMAL'}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-rose-400 tracking-tight font-mono">
            {metrics.overloadedDepartmentsCount}
          </span>
          <span className="text-xs text-slate-400 font-normal">
            of 12 departments
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400 truncate max-w-[170px]" title={metrics.overloadedDepartmentNames.join(', ')}>
            {metrics.overloadedDepartmentNames.length > 0 ? metrics.overloadedDepartmentNames.slice(0, 2).join(', ') : 'All within safe capacity'}
          </span>
          <span className="text-rose-400 font-mono text-[11px] font-semibold underline">
            Inspect
          </span>
        </div>
      </div>

      {/* 4. Flagged Bottleneck Alerts */}
      <div 
        onClick={onFilterCritical}
        className="glass-panel rounded-xl p-5 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all cursor-pointer"
        title="Click to view bottleneck action queue"
      >
        <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all -mr-10 -mt-10" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Bottleneck Action Alerts
          </span>
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/80">
            ACTION QUEUE
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-amber-300 tracking-tight font-mono">
            {metrics.flaggedBottleneckCount}
          </span>
          <span className="text-xs text-slate-400 font-normal">
            forgotten patients
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-rose-400 font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            {metrics.criticalDelayCount} Critical
          </span>
          <span className="flex items-center gap-1 text-amber-400 font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            {metrics.overdueDiagnosticsCount} Diagnostics
          </span>
        </div>
      </div>
    </div>
  );
};
