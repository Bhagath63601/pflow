import React, { useState } from 'react';
import { EnrichedPatientEncounter } from '../types';
import { formatMinutes, DIAGNOSTIC_BENCHMARKS } from '../services/dataService';
import { 
  X, 
  AlertTriangle, 
  Clock, 
  Building2, 
  Microscope, 
  CheckCircle2, 
  ArrowRight, 
  Send, 
  UserCheck, 
  FileText, 
  HeartPulse, 
  MapPin, 
  ShieldAlert,
  Sparkles,
  Zap
} from 'lucide-react';

interface InspectionDrawerProps {
  encounter: EnrichedPatientEncounter | null;
  onClose: () => void;
  onExecuteAction: (encounterId: string, actionName: string) => void;
}

export const InspectionDrawer: React.FC<InspectionDrawerProps> = ({
  encounter,
  onClose,
  onExecuteAction
}) => {
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  if (!encounter) return null;

  const handleActionClick = (actionName: string) => {
    onExecuteAction(encounter.encounter.encounter_id, actionName);
    setActionSuccess(`Action Executed: "${actionName}" logged into Hospital Operations Audit Trail.`);
    setTimeout(() => {
      setActionSuccess(null);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Dark backdrop overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-in drawer container */}
      <div className="relative w-full max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full z-10 animate-slide-in-right overflow-y-auto">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-teal-400 bg-teal-950/80 border border-teal-800/80 px-2 py-0.5 rounded">
                ENCOUNTER #{encounter.encounter.encounter_id}
              </span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                encounter.priority === 'Critical Delay' 
                  ? 'bg-rose-950 text-rose-300 border-rose-800' 
                  : encounter.priority === 'Overdue Diagnostics'
                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-800'
              }`}>
                {encounter.priority}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Patient: <span className="font-mono text-teal-300">{encounter.patient.patient_id}</span>
              <span className="text-sm font-normal text-slate-400">
                ({encounter.patient.age}y, {encounter.patient.sex})
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Current Location: <strong className="text-slate-200">{encounter.department.department_name}</strong> • Stage: <span className="text-teal-400 font-semibold">{encounter.journeyStage}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action success alert toast */}
        {actionSuccess && (
          <div className="m-5 mb-0 p-3 bg-emerald-950/90 border border-emerald-700 rounded-lg text-xs text-emerald-200 flex items-center gap-2 animate-fade-in font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        <div className="p-6 space-y-6 flex-1">
          {/* Patient Quick Profile Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Acuity Tier</span>
              <span className="font-mono font-bold text-slate-200">Level {encounter.triageLevel}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Chronic Condition</span>
              <span className="font-semibold text-amber-300">{encounter.patient.chronic_condition}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Home Area</span>
              <span className="font-mono text-slate-300">{encounter.patient.home_area}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Insurance</span>
              <span className="text-slate-300">{encounter.patient.insurance_type}</span>
            </div>
          </div>

          {/* 1. Patient Journey Timeline */}
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-400" />
              Patient Flow Journey & Milestones
            </h3>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {/* Arrival */}
              <div className="relative">
                <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-teal-400 ring-4 ring-slate-900" />
                <div className="text-xs">
                  <div className="font-mono font-bold text-slate-200">
                    Arrival & Check-in: {encounter.encounter.arrival_time}
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Visit Type: {encounter.encounter.visit_type} • Checked in at admissions triage
                  </div>
                </div>
              </div>

              {/* Triage & Wait Stage */}
              <div className="relative">
                <span className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ${
                  encounter.waitDeviation > 30 ? 'bg-rose-500 animate-ping' : 'bg-amber-400'
                } ring-4 ring-slate-900`} />
                <div className="text-xs">
                  <div className="flex items-center justify-between font-mono font-bold">
                    <span className="text-slate-200">Waiting Room Stage</span>
                    <span className="text-rose-400">{formatMinutes(encounter.waitMinutes)} elapsed</span>
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Department Baseline: <strong className="text-slate-300 font-mono">{encounter.departmentAvgWait} mins</strong>
                    {' '}• Deviation: <strong className="text-rose-400 font-mono">+{encounter.waitDeviation} mins</strong>
                  </div>
                </div>
              </div>

              {/* Diagnostics */}
              {encounter.tests.length > 0 && (
                <div className="relative">
                  <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-slate-900" />
                  <div className="text-xs">
                    <div className="font-mono font-bold text-cyan-300">
                      Diagnostics Ordered ({encounter.tests.length} tests)
                    </div>
                    {encounter.tests.map((t) => (
                      <div key={t.test_id} className="text-[11px] text-slate-300 mt-1 pl-2 border-l border-cyan-800/60">
                        • <strong>{t.test_type}</strong> (#{t.test_id}) — Priority: <span className="font-mono font-semibold">{t.priority}</span>
                        <br />
                        <span className="text-slate-400">
                          Turnaround: {t.turnaround_minutes || 0}m (Benchmark: {DIAGNOSTIC_BENCHMARKS[t.test_type] || 45}m)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Service & Disposition */}
              <div className="relative">
                <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-slate-600 ring-4 ring-slate-900" />
                <div className="text-xs">
                  <div className="font-mono font-bold text-slate-300">
                    Disposition Outcome
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Status: <strong className="text-teal-300">{encounter.encounter.outcome || 'Awaiting Bed/Discharge'}</strong> • Service duration: {encounter.encounter.service_minutes || 0}m
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Bottleneck Score Formula Breakdown Card */}
          <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                Bottleneck Risk Score Formula Breakdown
              </span>
              <span className="font-mono text-base font-extrabold text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded border border-amber-800">
                {encounter.bottleneckScore} PTS
              </span>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-300 space-y-1.5">
              <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800 text-[10px]">
                <span>FORMULA FACTOR</span>
                <span>VALUE CONTRIBUTION</span>
              </div>
              <div className="flex justify-between">
                <span>(Wait Time - Dept Avg Wait):</span>
                <span className="font-bold text-teal-300">
                  {encounter.waitMinutes}m - {encounter.departmentAvgWait}m = +{encounter.waitDeviation}
                </span>
              </div>
              <div className="flex justify-between">
                <span>+ Diagnostic Delay Penalty:</span>
                <span className="font-bold text-cyan-300">+{encounter.diagnosticDelayPenalty} pts</span>
              </div>
              <div className="flex justify-between">
                <span>+ Department Overload Multiplier:</span>
                <span className="font-bold text-rose-400">+{Math.round(encounter.departmentOverloadMultiplier)} pts</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>+ Acuity & Vulnerability Weight:</span>
                <span className="font-mono">+{Math.max(0, encounter.bottleneckScore - encounter.waitDeviation - encounter.diagnosticDelayPenalty - Math.round(encounter.departmentOverloadMultiplier))} pts</span>
              </div>
              <div className="pt-1.5 border-t border-slate-800 flex justify-between font-bold text-xs text-white">
                <span>Total Composite Risk Score:</span>
                <span className="text-amber-400 font-mono">{encounter.bottleneckScore} Points</span>
              </div>
            </div>
          </div>

          {/* 3. Root-Cause Breakdown */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Root-Cause Breakdown & Operational Bottlenecks
            </h3>

            <div className="space-y-2.5">
              {encounter.rootCauses.map((rc, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                    rc.severity === 'critical'
                      ? 'bg-rose-950/40 border-rose-900/80'
                      : rc.severity === 'warning'
                        ? 'bg-amber-950/40 border-amber-900/80'
                        : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="mt-0.5">
                    {rc.severity === 'critical' ? (
                      <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    ) : rc.severity === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-100">{rc.title}</h4>
                      {rc.metricImpact && (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.2 rounded bg-slate-900/90 text-slate-300 border border-slate-700">
                          {rc.metricImpact}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {rc.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Diagnostic Tests Detail Table */}
          {encounter.tests.length > 0 && (
            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                <Microscope className="w-4 h-4 text-cyan-400" />
                Diagnostic Tests Breakdown ({encounter.tests.length})
              </h3>

              <div className="space-y-2">
                {encounter.tests.map(test => {
                  const benchmark = DIAGNOSTIC_BENCHMARKS[test.test_type] || 45;
                  const duration = test.turnaround_minutes || 0;
                  const isLate = duration > benchmark;

                  return (
                    <div key={test.test_id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-mono font-bold text-slate-200 flex items-center gap-1.5">
                          <span>{test.test_type}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({test.test_id})</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Priority: <strong className={test.priority === 'Urgent' ? 'text-rose-400' : 'text-slate-300'}>{test.priority}</strong>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <div className={`font-bold ${isLate ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {duration} mins
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Benchmark: {benchmark} mins {isLate && `(+${duration - benchmark}m late)`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. Recommended Operational Next Action */}
          <div className="bg-gradient-to-br from-teal-950/60 to-slate-900 border border-teal-500/40 rounded-xl p-4 shadow-glow-teal">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-300">
                Recommended Next Operational Intervention
              </h3>
            </div>

            <p className="text-sm font-semibold text-slate-100 leading-snug mb-3">
              {encounter.recommendedAction}
            </p>

            {encounter.secondaryAction && (
              <p className="text-xs text-slate-400 mb-4 pl-3 border-l-2 border-teal-500/50">
                Secondary action: {encounter.secondaryAction}
              </p>
            )}

            {/* Operational Execution Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-teal-900/60">
              <button
                onClick={() => handleActionClick(`Execute Primary: ${encounter.recommendedAction.substring(0, 40)}...`)}
                className="w-full px-3 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <Zap className="w-3.5 h-3.5" />
                Execute Intervention Now
              </button>

              <button
                onClick={() => handleActionClick(`Escalated to Charge Nurse (${encounter.department.department_name})`)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700 active:scale-95"
              >
                <Send className="w-3.5 h-3.5 text-teal-400" />
                Escalate to Shift Lead
              </button>
            </div>
          </div>
        </div>

        {/* Drawer Sticky Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400 sticky bottom-0">
          <span className="font-mono">PULSE-OPS Audit Desk</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors font-medium"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
