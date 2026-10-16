import React, { useState, useMemo } from 'react';
import { 
  EnrichedPatientEncounter, 
  PriorityBadgeType 
} from '../types';
import { formatMinutes } from '../services/dataService';
import { 
  Search, 
  Filter, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  ArrowUpDown,
  Stethoscope,
  Microscope,
  HelpCircle,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';

interface PriorityActionQueueProps {
  encounters: EnrichedPatientEncounter[];
  selectedEncounter: EnrichedPatientEncounter | null;
  onSelectEncounter: (encounter: EnrichedPatientEncounter) => void;
  selectedDepartmentId: string;
  onSelectDepartment: (deptId: string) => void;
}

export const PriorityActionQueue: React.FC<PriorityActionQueueProps> = ({
  encounters,
  selectedEncounter,
  onSelectEncounter,
  selectedDepartmentId,
  onSelectDepartment
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [triageFilter, setTriageFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'score' | 'wait' | 'deviation'>('score');
  const [sortAsc, setSortAsc] = useState(false);
  const pageSize = 15;

  // Filter and sort the encounters list
  const filteredEncounters = useMemo(() => {
    return encounters.filter(item => {
      // 1. Department filter
      if (selectedDepartmentId && item.encounter.department_id !== selectedDepartmentId) {
        return false;
      }

      // 2. Priority filter
      if (priorityFilter !== 'ALL' && item.priority !== priorityFilter) {
        return false;
      }

      // 3. Triage filter
      if (triageFilter !== 'ALL' && item.encounter.triage_level !== triageFilter) {
        return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesPatientId = item.patient.patient_id.toLowerCase().includes(query);
        const matchesEncounterId = item.encounter.encounter_id.toLowerCase().includes(query);
        const matchesCondition = item.patient.chronic_condition.toLowerCase().includes(query);
        const matchesDept = item.department.department_name.toLowerCase().includes(query);
        const matchesArea = item.patient.home_area.toLowerCase().includes(query);
        return matchesPatientId || matchesEncounterId || matchesCondition || matchesDept || matchesArea;
      }

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortField === 'score') {
        comparison = b.bottleneckScore - a.bottleneckScore;
      } else if (sortField === 'wait') {
        comparison = b.waitMinutes - a.waitMinutes;
      } else if (sortField === 'deviation') {
        comparison = b.waitDeviation - a.waitDeviation;
      }
      return sortAsc ? -comparison : comparison;
    });
  }, [encounters, selectedDepartmentId, priorityFilter, triageFilter, searchQuery, sortField, sortAsc]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredEncounters.length / pageSize));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEncounters.slice(start, start + pageSize);
  }, [filteredEncounters, currentPage, pageSize]);

  // Priority badge styling
  const renderPriorityBadge = (priority: PriorityBadgeType) => {
    switch (priority) {
      case 'Critical Delay':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-rose-950/80 text-rose-300 border border-rose-700/80 shadow-glow-rose">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            Critical Delay
          </span>
        );
      case 'Overdue Diagnostics':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-amber-950/80 text-amber-300 border border-amber-700/80 shadow-glow-amber">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Overdue Diagnostics
          </span>
        );
      case 'Stable Flow':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Stable Flow
          </span>
        );
    }
  };

  // Triage badge styling
  const renderTriageBadge = (triage: string) => {
    switch (triage) {
      case 'Critical':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-950/80 text-red-300 border border-red-700">L1 Critical</span>;
      case 'High':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-orange-950/80 text-orange-300 border border-orange-700">L2 High</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-amber-950/60 text-amber-300 border border-amber-800">L3 Medium</span>;
      case 'Low':
      default:
        return <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-slate-800 text-slate-300 border border-slate-700">L4 Low</span>;
    }
  };

  // Department list for dropdown
  const uniqueDepartments = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of encounters) {
      if (e.encounter.department_id) {
        map.set(e.encounter.department_id, e.department.department_name);
      }
    }
    return Array.from(map.entries());
  }, [encounters]);

  const toggleSort = (field: 'score' | 'wait' | 'deviation') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
    setCurrentPage(1);
  };

  return (
    <div className="glass-panel rounded-xl border border-slate-800 shadow-xl overflow-hidden mb-8">
      {/* Header & Controls bar */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-900/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                "The Forgotten Patient" Priority Action Queue
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time algorithmic ranking of bottlenecked patients requiring operational intervention. Ranked by composite risk score.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">
              Showing <strong className="text-teal-400">{filteredEncounters.length}</strong> flagged patients
            </span>
          </div>
        </div>

        {/* Filter controls row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search Patient ID, condition, area..."
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-sans"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            )}
          </div>

          {/* 2. Department Filter */}
          <div>
            <select
              value={selectedDepartmentId}
              onChange={(e) => { onSelectDepartment(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500 transition-all font-sans"
            >
              <option value="">All Departments (12)</option>
              {uniqueDepartments.map(([id, name]) => (
                <option key={id} value={id}>
                  {id} - {name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Priority Level Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500 transition-all font-sans"
            >
              <option value="ALL">All Priority Levels</option>
              <option value="Critical Delay">🔴 Critical Delay Only</option>
              <option value="Overdue Diagnostics">🟡 Overdue Diagnostics Only</option>
              <option value="Stable Flow">🟢 Stable Flow Only</option>
            </select>
          </div>

          {/* 4. Triage Acuity Filter */}
          <div>
            <select
              value={triageFilter}
              onChange={(e) => { setTriageFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500 transition-all font-sans"
            >
              <option value="ALL">All Triage Tiers</option>
              <option value="Critical">L1 Critical Acuity</option>
              <option value="High">L2 High Acuity</option>
              <option value="Medium">L3 Medium Acuity</option>
              <option value="Low">L4 Low Acuity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Priority Status</th>
              <th className="py-3 px-4">Patient Profile</th>
              <th className="py-3 px-4">Department & Acuity</th>
              <th 
                className="py-3 px-4 cursor-pointer hover:text-teal-400 transition-colors"
                onClick={() => toggleSort('wait')}
              >
                <div className="flex items-center gap-1">
                  <span>Wait Time</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th 
                className="py-3 px-4 cursor-pointer hover:text-teal-400 transition-colors"
                onClick={() => toggleSort('deviation')}
              >
                <div className="flex items-center gap-1">
                  <span>Deviation vs Avg</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Diagnostics</th>
              <th 
                className="py-3 px-4 cursor-pointer hover:text-teal-400 transition-colors"
                onClick={() => toggleSort('score')}
              >
                <div className="flex items-center gap-1">
                  <span>Bottleneck Score</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 text-right">Operational Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {paginatedList.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-teal-400 mb-2 opacity-80" />
                    <p className="font-semibold text-slate-200">No matching patients in queue</p>
                    <p className="text-xs text-slate-500 mt-1">Try resetting the department or priority filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedList.map((item) => {
                const isSelected = selectedEncounter?.encounter.encounter_id === item.encounter.encounter_id;
                
                // Score gauge color
                let scoreColor = 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50';
                let scoreBar = 'bg-teal-400';
                if (item.bottleneckScore >= 60) {
                  scoreColor = 'text-rose-400 bg-rose-950/50 border-rose-800/80';
                  scoreBar = 'bg-rose-500';
                } else if (item.bottleneckScore >= 35) {
                  scoreColor = 'text-amber-400 bg-amber-950/50 border-amber-800/80';
                  scoreBar = 'bg-amber-400';
                }

                return (
                  <tr
                    key={item.encounter.encounter_id}
                    onClick={() => onSelectEncounter(item)}
                    className={`transition-all cursor-pointer group ${
                      isSelected 
                        ? 'bg-teal-950/40 border-l-4 border-l-teal-400' 
                        : 'hover:bg-slate-850/60'
                    }`}
                  >
                    {/* Priority Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {renderPriorityBadge(item.priority)}
                    </td>

                    {/* Patient Profile */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-100 flex items-center gap-1.5">
                        <span>{item.patient.patient_id}</span>
                        <span className="text-[11px] text-slate-400 font-normal">({item.patient.age}y, {item.patient.sex})</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[140px]" title={item.patient.chronic_condition}>
                        {item.patient.chronic_condition !== 'None' ? (
                          <span className="text-amber-300 font-medium">{item.patient.chronic_condition}</span>
                        ) : (
                          <span className="text-slate-500">No chronic history</span>
                        )}
                      </div>
                    </td>

                    {/* Department & Acuity */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-200">
                        {item.department.department_name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {renderTriageBadge(item.triageLevel)}
                        {item.departmentStats.isOverloaded && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 border border-rose-800">
                            &gt;85% LOAD
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Wait Time */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono">
                      <div className="font-bold text-slate-100 text-sm flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {formatMinutes(item.waitMinutes)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Arrived: {item.encounter.arrival_time ? item.encounter.arrival_time.substring(11, 16) : '--:--'}
                      </div>
                    </td>

                    {/* Deviation vs Avg */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono">
                      <span className={`inline-block font-bold text-xs px-2 py-0.5 rounded ${
                        item.waitDeviation > 25 
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-800' 
                          : item.waitDeviation > 0 
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950/40 text-emerald-300'
                      }`}>
                        {item.waitDeviation > 0 ? `+${item.waitDeviation}m` : `${item.waitDeviation}m`}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Dept Avg: {item.departmentAvgWait}m
                      </div>
                    </td>

                    {/* Diagnostics Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {item.tests.length === 0 ? (
                        <span className="text-slate-500 font-mono text-[11px]">None Ordered</span>
                      ) : (
                        <div>
                          <span className="font-mono font-medium text-slate-200 flex items-center gap-1">
                            <Microscope className="w-3 h-3 text-cyan-400" />
                            {item.tests[0].test_type}
                            {item.tests.length > 1 && ` (+${item.tests.length - 1})`}
                          </span>
                          {item.diagnosticDelayPenalty > 0 ? (
                            <span className="text-[10px] text-rose-400 font-mono font-semibold">
                              +{item.diagnosticDelayPenalty}m delay penalty
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-400 font-mono">
                              On schedule
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Bottleneck Score Gauge */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono">
                      <div className="flex items-center gap-2">
                        <span className={`font-extrabold text-sm px-2 py-0.5 rounded border ${scoreColor}`}>
                          {item.bottleneckScore}
                        </span>
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${scoreBar}`}
                            style={{ width: `${Math.min(100, (item.bottleneckScore / 100) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Operational Action Button */}
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEncounter(item);
                        }}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-teal-500 text-slate-950 shadow-glow-teal'
                            : 'bg-slate-800 hover:bg-teal-500/20 text-slate-200 hover:text-teal-300 border border-slate-700 hover:border-teal-500/50'
                        }`}
                      >
                        Inspect Root Cause
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div>
          Showing page <span className="font-bold text-slate-200 font-mono">{currentPage}</span> of{' '}
          <span className="font-bold text-slate-200 font-mono">{totalPages}</span> ({filteredEncounters.length} total records)
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 font-mono flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Prev
          </button>
          
          <span className="px-3 py-1.5 font-mono text-slate-400">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 font-mono flex items-center gap-1"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
