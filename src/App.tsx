import React, { useState, useEffect, useCallback } from 'react';
import { 
  Patient, 
  Department, 
  Encounter, 
  DiagnosticTest, 
  EnrichedPatientEncounter, 
  DepartmentStats, 
  HospitalFlowMetrics 
} from './types';
import { 
  loadAllDatasets,
  generateFallbackData, 
  analyzeHospitalFlow,
  FALLBACK_DEPARTMENTS 
} from './services/dataService';
import { Header } from './components/Header';
import { KPISection } from './components/KPISection';
import { DepartmentHeatmap } from './components/DepartmentHeatmap';
import { PriorityActionQueue } from './components/PriorityActionQueue';
import { InspectionDrawer } from './components/InspectionDrawer';
import { DataUploadModal } from './components/DataUploadModal';
import { 
  Loader2, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  FileSpreadsheet,
  Activity,
  Layers
} from 'lucide-react';

export const App: React.FC = () => {
  // Raw Data State
  const [patients, setPatients] = useState<Patient[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [diagnosticTests, setDiagnosticTests] = useState<DiagnosticTest[]>([]);

  // Computed Analytical State
  const [enrichedEncounters, setEnrichedEncounters] = useState<EnrichedPatientEncounter[]>([]);
  const [departmentStats, setDepartmentStats] = useState<Record<string, DepartmentStats>>({});
  const [metrics, setMetrics] = useState<HospitalFlowMetrics | null>(null);

  // UI Interactive State
  const [selectedEncounter, setSelectedEncounter] = useState<EnrichedPatientEncounter | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [timeWindow, setTimeWindow] = useState<'all' | 'peak' | 'recent'>('peak');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState<'CSV' | 'Fallback'>('CSV');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Run analytical calculations whenever datasets or time window change
  const computeAnalytics = useCallback((
    rawPatients: Patient[],
    rawDepartments: Department[],
    rawEncounters: Encounter[],
    rawTests: DiagnosticTest[],
    windowMode: 'all' | 'peak' | 'recent'
  ) => {
    let filteredEncounters = [...rawEncounters];

    // Apply Time Window / Shift Filter
    if (windowMode === 'peak') {
      // Focus on peak surge window (e.g. Encounters with high activity or late 2025 surge)
      filteredEncounters = rawEncounters.filter(e => {
        const arr = e.arrival_time || '';
        return arr.startsWith('2025-12') || arr.startsWith('2025-11') || arr.startsWith('2025-10');
      });
      if (filteredEncounters.length === 0) {
        filteredEncounters = rawEncounters.slice(0, 1500);
      }
    } else if (windowMode === 'recent') {
      // Focus on Emergency & Critical Acuity
      filteredEncounters = rawEncounters.filter(e => 
        e.department_id === 'D01' || e.triage_level === 'Critical' || e.triage_level === 'High'
      );
    }

    const result = analyzeHospitalFlow(
      rawPatients,
      rawDepartments,
      filteredEncounters,
      rawTests
    );

    setEnrichedEncounters(result.enrichedEncounters);
    setDepartmentStats(result.departmentStats);
    setMetrics(result.metrics);

    // If currently selected encounter is not in filtered list, keep it or clear
    if (selectedEncounter) {
      const updated = result.enrichedEncounters.find(
        e => e.encounter.encounter_id === selectedEncounter.encounter.encounter_id
      );
      if (updated) setSelectedEncounter(updated);
    }
  }, [selectedEncounter]);

  // Load Initial Data from precomputed JSON or CSV files
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const { departments: deptData, patients: patientData, encounters: encData, diagnosticTests: testData, source } = await loadAllDatasets();

      setDepartments(deptData);
      setPatients(patientData);
      setEncounters(encData);
      setDiagnosticTests(testData);
      setDataSource(source);

      computeAnalytics(patientData, deptData, encData, testData, timeWindow);
      showToast(`Successfully loaded ${encData.length.toLocaleString()} encounters & 12 departments.`);
    } catch (err) {
      console.warn('Could not load from datasets directly, falling back to simulated high-fidelity hospital data:', err);
      // Fallback data generator
      const fallback = generateFallbackData();
      setDepartments(fallback.departments);
      setPatients(fallback.patients);
      setEncounters(fallback.encounters);
      setDiagnosticTests(fallback.diagnosticTests);
      setDataSource('Fallback');

      computeAnalytics(
        fallback.patients,
        fallback.departments,
        fallback.encounters,
        fallback.diagnosticTests,
        timeWindow
      );
      showToast('Loaded active hospital clinical flow simulation.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Handle Time Window / Shift Change
  const handleTimeWindowChange = (newWindow: 'all' | 'peak' | 'recent') => {
    setTimeWindow(newWindow);
    computeAnalytics(patients, departments, encounters, diagnosticTests, newWindow);
  };

  // Handle manual data refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      computeAnalytics(patients, departments, encounters, diagnosticTests, timeWindow);
      setIsRefreshing(false);
      showToast('Hospital flow metrics recalculated.');
    }, 400);
  };

  // Handle custom data ingestion from modal
  const handleCustomDataLoaded = (partialData: {
    patients?: Patient[];
    departments?: Department[];
    encounters?: Encounter[];
    diagnosticTests?: DiagnosticTest[];
  }) => {
    const updatedPatients = partialData.patients || patients;
    const updatedDepartments = partialData.departments || departments;
    const updatedEncounters = partialData.encounters || encounters;
    const updatedTests = partialData.diagnosticTests || diagnosticTests;

    if (partialData.patients) setPatients(partialData.patients);
    if (partialData.departments) setDepartments(partialData.departments);
    if (partialData.encounters) setEncounters(partialData.encounters);
    if (partialData.diagnosticTests) setDiagnosticTests(partialData.diagnosticTests);

    computeAnalytics(
      updatedPatients,
      updatedDepartments,
      updatedEncounters,
      updatedTests,
      timeWindow
    );
    showToast('Custom dataset ingested and analyzed.');
  };

  // Handle Action Execution in Inspection Drawer
  const handleExecuteAction = (encounterId: string, actionName: string) => {
    setEnrichedEncounters(prev => prev.map(item => {
      if (item.encounter.encounter_id === encounterId) {
        return {
          ...item,
          isActioned: true,
          actionTaken: actionName,
          // Mitigate bottleneck score upon intervention
          bottleneckScore: Math.max(0, item.bottleneckScore - 25),
          priority: item.priority === 'Critical Delay' ? 'Overdue Diagnostics' : 'Stable Flow'
        };
      }
      return item;
    }));

    if (selectedEncounter && selectedEncounter.encounter.encounter_id === encounterId) {
      setSelectedEncounter(prev => prev ? {
        ...prev,
        isActioned: true,
        actionTaken: actionName,
        bottleneckScore: Math.max(0, prev.bottleneckScore - 25),
        priority: prev.priority === 'Critical Delay' ? 'Overdue Diagnostics' : 'Stable Flow'
      } : null);
    }
  };

  // Export Priority Queue to CSV
  const handleExportCSV = () => {
    if (enrichedEncounters.length === 0) return;

    const headers = [
      'Rank',
      'Patient ID',
      'Encounter ID',
      'Age',
      'Sex',
      'Chronic Condition',
      'Department',
      'Triage Level',
      'Wait Minutes',
      'Dept Avg Wait',
      'Wait Deviation',
      'Diagnostic Penalty',
      'Overload Multiplier',
      'Bottleneck Risk Score',
      'Priority Badge',
      'Recommended Action'
    ];

    const rows = enrichedEncounters.map((item, idx) => [
      idx + 1,
      item.patient.patient_id,
      item.encounter.encounter_id,
      item.patient.age,
      item.patient.sex,
      item.patient.chronic_condition,
      item.department.department_name,
      item.triageLevel,
      item.waitMinutes,
      item.departmentAvgWait,
      item.waitDeviation,
      item.diagnosticDelayPenalty,
      Math.round(item.departmentOverloadMultiplier),
      item.bottleneckScore,
      item.priority,
      `"${item.recommendedAction.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `the_forgotten_patient_priority_queue_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported priority action queue CSV successfully.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 bg-slate-900 border border-teal-500/80 rounded-xl shadow-glow-teal text-xs text-slate-100 flex items-center gap-2.5 animate-fade-in font-medium">
          <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Header */}
      <Header
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onExportCSV={handleExportCSV}
        onRefreshData={handleRefresh}
        isRefreshing={isRefreshing}
        activeDatasetCount={enrichedEncounters.length}
        timeWindow={timeWindow}
        onChangeTimeWindow={handleTimeWindowChange}
      />

      {/* Main Operational Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {isLoading ? (
          <div className="h-[60vh] flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-teal-400 animate-spin mb-4" />
            <h2 className="text-lg font-bold text-white">Ingesting Hospital Datasets...</h2>
            <p className="text-xs text-slate-400 mt-1">
              Parsing patients.csv, encounters.csv, departments.csv & diagnostic_tests.csv
            </p>
          </div>
        ) : (
          <>
            {/* VIEW 1: High-Level Metrics & Department Load View */}
            {metrics && (
              <KPISection
                metrics={metrics}
                onFilterOverloaded={() => {
                  const overloaded = Object.values(departmentStats).find(d => d.isOverloaded);
                  if (overloaded) setSelectedDepartmentId(overloaded.department_id);
                }}
                onFilterCritical={() => {
                  // Focus table on critical delays
                  const el = document.getElementById('priority-queue-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            )}

            {/* Department Grid / Heatmap for all 12 departments */}
            <DepartmentHeatmap
              departmentStats={departmentStats}
              selectedDepartmentId={selectedDepartmentId}
              onSelectDepartment={setSelectedDepartmentId}
            />

            {/* VIEW 2: 'The Forgotten Patient' Priority Action Queue */}
            <div id="priority-queue-section">
              <PriorityActionQueue
                encounters={enrichedEncounters}
                selectedEncounter={selectedEncounter}
                onSelectEncounter={setSelectedEncounter}
                selectedDepartmentId={selectedDepartmentId}
                onSelectDepartment={setSelectedDepartmentId}
              />
            </div>

            {/* VIEW 3: Explainability & Root-Cause Inspection Drawer */}
            <InspectionDrawer
              encounter={selectedEncounter}
              onClose={() => setSelectedEncounter(null)}
              onExecuteAction={handleExecuteAction}
            />

            {/* Dataset Uploader / Ingestion Modal */}
            <DataUploadModal
              isOpen={isUploadModalOpen}
              onClose={() => setIsUploadModalOpen(false)}
              onDataLoaded={handleCustomDataLoaded}
              onResetToDefault={loadInitialData}
              onLoadFallback={() => {
                const fallback = generateFallbackData();
                setDepartments(fallback.departments);
                setPatients(fallback.patients);
                setEncounters(fallback.encounters);
                setDiagnosticTests(fallback.diagnosticTests);
                setDataSource('Fallback');
                computeAnalytics(
                  fallback.patients,
                  fallback.departments,
                  fallback.encounters,
                  fallback.diagnosticTests,
                  timeWindow
                );
                showToast('Switched to simulated shift dataset.');
              }}
            />
          </>
        )}
      </main>

      {/* Modern Clinical Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-teal-400" />
          <span>PULSE-OPS • Healthcare Operations Intelligence</span>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-slate-400">Dataset Source: {dataSource} ({encounters.length.toLocaleString()} encounters)</span>
        </div>
        <div className="font-mono text-[11px] text-slate-400">
          Formula: <span className="text-teal-400">(Wait - DeptAvg)</span> + <span className="text-cyan-400">DiagnosticDelay</span> + <span className="text-rose-400">OverloadMultiplier</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
