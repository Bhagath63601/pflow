export interface Patient {
  patient_id: string;
  age: number;
  sex: 'M' | 'F' | 'Unknown';
  chronic_condition: string;
  home_area: string;
  insurance_type: string;
}

export interface Department {
  department_id: string;
  department_name: string;
  staff_count: number;
  bed_count: number;
  daily_capacity: number;
  service_type: string;
}

export interface Encounter {
  encounter_id: string;
  patient_id: string;
  arrival_time: string;
  department_id: string;
  visit_type: string;
  triage_level: 'Critical' | 'High' | 'Medium' | 'Low';
  outcome: 'Admitted' | 'Discharged' | 'Left before care' | 'Transferred';
  service_start_time: string;
  service_end_time: string;
  wait_minutes: number;
  service_minutes: number;
  discharge_time: string;
}

export interface DiagnosticTest {
  test_id: string;
  encounter_id: string;
  test_type: 'ECG' | 'X-ray' | 'Urine test' | 'CT scan' | 'MRI' | 'Blood test' | string;
  requested_time: string;
  completion_time: string;
  priority: 'Urgent' | 'Routine';
  turnaround_minutes?: number;
}

export interface DepartmentStats {
  department_id: string;
  department_name: string;
  service_type: string;
  staff_count: number;
  bed_count: number;
  daily_capacity: number;
  activePatients: number;
  totalEncounters: number;
  utilizationRate: number; // percentage (0 - 100+)
  isOverloaded: boolean; // utilization > 85%
  avgWaitMinutes: number;
  avgServiceMinutes: number;
  avgDwellMinutes: number;
  criticalCount: number;
  highCount: number;
}

export type PriorityBadgeType = 'Critical Delay' | 'Overdue Diagnostics' | 'Stable Flow';

export interface RootCauseFactor {
  category: 'department' | 'diagnostic' | 'triage' | 'system';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  metricImpact?: string;
}

export interface EnrichedPatientEncounter {
  encounter: Encounter;
  patient: Patient;
  department: Department;
  departmentStats: DepartmentStats;
  tests: DiagnosticTest[];
  
  // Bottleneck calculation metrics
  waitMinutes: number;
  departmentAvgWait: number;
  waitDeviation: number; // waitMinutes - departmentAvgWait
  diagnosticDelayPenalty: number;
  departmentOverloadMultiplier: number;
  bottleneckScore: number;
  
  // Categorization
  priority: PriorityBadgeType;
  triageLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  
  // Explainability
  rootCauses: RootCauseFactor[];
  recommendedAction: string;
  secondaryAction?: string;
  journeyStage: 'Arrival' | 'Triage' | 'Diagnostic Pending' | 'In Service' | 'Discharge Pending' | 'Discharged';
  
  // Operational state
  isActioned?: boolean;
  actionTaken?: string;
}

export interface HospitalFlowMetrics {
  totalActivePatients: number;
  totalEncounters: number;
  avgWaitTimeAllDepartments: number;
  overloadedDepartmentsCount: number;
  overloadedDepartmentNames: string[];
  flaggedBottleneckCount: number;
  criticalDelayCount: number;
  overdueDiagnosticsCount: number;
  stableFlowCount: number;
}

export interface FilterOptions {
  searchQuery: string;
  selectedDepartment: string;
  selectedPriority: string;
  selectedTriage: string;
  timeWindow: 'all' | 'peak' | 'recent';
}
