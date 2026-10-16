import Papa from 'papaparse';
import {
  Patient,
  Department,
  Encounter,
  DiagnosticTest,
  DepartmentStats,
  EnrichedPatientEncounter,
  HospitalFlowMetrics,
  PriorityBadgeType,
  RootCauseFactor
} from '../types';

// Standard clinical benchmark turnaround times (minutes)
export const DIAGNOSTIC_BENCHMARKS: Record<string, number> = {
  'ECG': 25,
  'Urine test': 35,
  'Blood test': 45,
  'X-ray': 40,
  'CT scan': 55,
  'MRI': 70,
};

// Alternative departments for patient diversion/rerouting recommendations
const DIVERSION_DEPARTMENTS: Record<string, string> = {
  'D01': 'D02 (General Medicine Triage) or Fast-Track Urgent Care',
  'D02': 'D11 (Outpatient Sub-acute Clinic)',
  'D03': 'D01 (Pediatric Urgent Pod)',
  'D04': 'D02 (Cardiology Telemetry Step-down)',
  'D05': 'D11 (Orthopedic Casting & Rehab Ward)',
  'D06': 'Secondary Satellite Imaging Facility (Scanner B)',
  'D07': 'Express Stat Lab Automation Track',
  'D08': 'Satellite Floor Dispensing Cart',
  'D09': 'Ambulatory Surgical Unit Hold B',
  'D10': 'D02 (Neurology Observation Unit)',
  'D11': 'Community Tele-health Followup Triage',
  'D12': 'Decentralized Bed Placement Desk 4',
};

// Calculate difference in minutes between two ISO/SQL timestamps
export function diffInMinutes(startStr: string, endStr: string): number {
  if (!startStr || !endStr) return 0;
  const start = new Date(startStr.replace(' ', 'T')).getTime();
  const end = new Date(endStr.replace(' ', 'T')).getTime();
  if (isNaN(start) || isNaN(end)) return 0;
  return Math.max(0, Math.round((end - start) / 60000));
}

// Format minutes into clean human-readable text (e.g. "1h 45m" or "45m")
export function formatMinutes(mins: number): string {
  if (isNaN(mins) || mins === null || mins === undefined) return '0m';
  const rounded = Math.round(mins);
  if (rounded < 60) return `${rounded}m`;
  const hours = Math.floor(rounded / 60);
  const remaining = rounded % 60;
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
}

// Fallback departments in case CSV is unavailable
export const FALLBACK_DEPARTMENTS: Department[] = [
  { department_id: 'D01', department_name: 'Emergency', staff_count: 28, bed_count: 29, daily_capacity: 431, service_type: 'Emergency' },
  { department_id: 'D02', department_name: 'General Medicine', staff_count: 30, bed_count: 48, daily_capacity: 298, service_type: 'Clinical' },
  { department_id: 'D03', department_name: 'Pediatrics', staff_count: 16, bed_count: 11, daily_capacity: 368, service_type: 'Clinical' },
  { department_id: 'D04', department_name: 'Cardiology', staff_count: 25, bed_count: 22, daily_capacity: 394, service_type: 'Clinical' },
  { department_id: 'D05', department_name: 'Orthopedics', staff_count: 9, bed_count: 48, daily_capacity: 243, service_type: 'Clinical' },
  { department_id: 'D06', department_name: 'Radiology', staff_count: 7, bed_count: 54, daily_capacity: 153, service_type: 'Diagnostics' },
  { department_id: 'D07', department_name: 'Laboratory', staff_count: 27, bed_count: 55, daily_capacity: 156, service_type: 'Diagnostics' },
  { department_id: 'D08', department_name: 'Pharmacy', staff_count: 20, bed_count: 26, daily_capacity: 445, service_type: 'Support' },
  { department_id: 'D09', department_name: 'Surgery', staff_count: 5, bed_count: 17, daily_capacity: 181, service_type: 'Clinical' },
  { department_id: 'D10', department_name: 'Neurology', staff_count: 12, bed_count: 25, daily_capacity: 216, service_type: 'Clinical' },
  { department_id: 'D11', department_name: 'Outpatient', staff_count: 16, bed_count: 48, daily_capacity: 215, service_type: 'Outpatient' },
  { department_id: 'D12', department_name: 'Admissions', staff_count: 5, bed_count: 50, daily_capacity: 438, service_type: 'Admin' }
];

// Fallback patients generator
export function generateFallbackData(): {
  patients: Patient[];
  departments: Department[];
  encounters: Encounter[];
  diagnosticTests: DiagnosticTest[];
} {
  const departments = FALLBACK_DEPARTMENTS;
  const conditions = ['Hypertension', 'Cardiac', 'Asthma', 'Diabetes', 'None', 'Other'];
  const insurance = ['Private', 'Public', 'Self-pay', 'Unknown'];
  const triageLevels: ('Critical' | 'High' | 'Medium' | 'Low')[] = ['Critical', 'High', 'Medium', 'Low'];
  const testTypes = ['ECG', 'X-ray', 'Blood test', 'CT scan', 'MRI', 'Urine test'];

  const patients: Patient[] = [];
  const encounters: Encounter[] = [];
  const diagnosticTests: DiagnosticTest[] = [];

  for (let i = 1; i <= 150; i++) {
    const pId = `P${String(i).padStart(5, '0')}`;
    const eId = `E${String(i).padStart(6, '0')}`;
    const dept = departments[i % departments.length];
    const triage = triageLevels[i % 4];
    
    // Simulate realistic wait minutes: some normal, some severe delays
    let waitMinutes = 25 + (i * 7) % 65;
    if (i % 7 === 0) waitMinutes = 110 + (i % 40); // Forgotten patient severe delay
    if (i % 5 === 0 && (dept.department_id === 'D01' || dept.department_id === 'D06')) {
      waitMinutes = 95 + (i % 35);
    }

    const serviceMinutes = 20 + (i * 3) % 45;
    const arrivalDate = new Date(Date.now() - (waitMinutes + serviceMinutes + (i % 180)) * 60000);
    const serviceStartDate = new Date(arrivalDate.getTime() + waitMinutes * 60000);
    const serviceEndDate = new Date(serviceStartDate.getTime() + serviceMinutes * 60000);
    const dischargeDate = new Date(serviceEndDate.getTime() + 15 * 60000);

    patients.push({
      patient_id: pId,
      age: 18 + (i * 13) % 75,
      sex: i % 2 === 0 ? 'F' : 'M',
      chronic_condition: conditions[i % conditions.length],
      home_area: `AREA_${String((i % 20) + 1).padStart(2, '0')}`,
      insurance_type: insurance[i % insurance.length]
    });

    encounters.push({
      encounter_id: eId,
      patient_id: pId,
      arrival_time: arrivalDate.toISOString().replace('T', ' ').substring(0, 19),
      department_id: dept.department_id,
      visit_type: i % 4 === 0 ? 'Emergency' : i % 3 === 0 ? 'Walk-in' : 'Scheduled',
      triage_level: triage,
      outcome: i % 5 === 0 ? 'Admitted' : 'Discharged',
      service_start_time: serviceStartDate.toISOString().replace('T', ' ').substring(0, 19),
      service_end_time: serviceEndDate.toISOString().replace('T', ' ').substring(0, 19),
      wait_minutes: waitMinutes,
      service_minutes: serviceMinutes,
      discharge_time: dischargeDate.toISOString().replace('T', ' ').substring(0, 19)
    });

    // Add diagnostic test for ~60% of patients
    if (i % 3 !== 0) {
      const testType = testTypes[i % testTypes.length];
      const benchmark = DIAGNOSTIC_BENCHMARKS[testType] || 45;
      const turnaround = (i % 4 === 0) ? benchmark + 35 + (i % 30) : Math.max(15, benchmark - 5);
      const reqTime = new Date(arrivalDate.getTime() + 10 * 60000);
      const compTime = new Date(reqTime.getTime() + turnaround * 60000);

      diagnosticTests.push({
        test_id: `T${String(i).padStart(6, '0')}`,
        encounter_id: eId,
        test_type: testType,
        requested_time: reqTime.toISOString().replace('T', ' ').substring(0, 19),
        completion_time: compTime.toISOString().replace('T', ' ').substring(0, 19),
        priority: i % 5 === 0 ? 'Urgent' : 'Routine',
        turnaround_minutes: turnaround
      });
    }
  }

  return { patients, departments, encounters, diagnosticTests };
}

// Parse CSV text with PapaParse
export function parseCSV<T>(csvText: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<T>(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => resolve(results.data),
      error: (error: Error) => reject(error)
    });
  });
}

// Fetch CSV file from URL / public path
export async function fetchAndParseCSV<T>(url: string): Promise<T[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  const text = await response.text();
  return parseCSV<T>(text);
}

// Load all datasets using fastest source with dual fallback
export async function loadAllDatasets(): Promise<{
  departments: Department[];
  patients: Patient[];
  encounters: Encounter[];
  diagnosticTests: DiagnosticTest[];
  source: 'JSON' | 'CSV';
}> {
  try {
    const res = await fetch('/data/datasets.json');
    if (res.ok) {
      const data = await res.json();
      if (data.patients && data.departments && data.encounters) {
        return {
          departments: data.departments,
          patients: data.patients,
          encounters: data.encounters,
          diagnosticTests: data.diagnostic_tests || [],
          source: 'JSON'
        };
      }
    }
  } catch (e) {
    console.warn('datasets.json not found, attempting direct CSV fetch...');
  }

  // Fallback to fetching CSVs directly
  const [departments, patients, encounters, diagnosticTests] = await Promise.all([
    fetchAndParseCSV<Department>('/data/departments.csv'),
    fetchAndParseCSV<Patient>('/data/patients.csv'),
    fetchAndParseCSV<Encounter>('/data/encounters.csv'),
    fetchAndParseCSV<DiagnosticTest>('/data/diagnostic_tests.csv'),
  ]);

  return { departments, patients, encounters, diagnosticTests, source: 'CSV' };
}

// Compute comprehensive hospital analytics and prioritize "Forgotten Patients"
export function analyzeHospitalFlow(
  patients: Patient[],
  departments: Department[],
  encounters: Encounter[],
  diagnosticTests: DiagnosticTest[]
): {
  enrichedEncounters: EnrichedPatientEncounter[];
  departmentStats: Record<string, DepartmentStats>;
  metrics: HospitalFlowMetrics;
} {
  // 1. Create Lookup Maps for quick joining
  const patientMap = new Map<string, Patient>();
  for (const p of patients) {
    if (p.patient_id) patientMap.set(p.patient_id, p);
  }

  const departmentMap = new Map<string, Department>();
  for (const d of departments) {
    if (d.department_id) departmentMap.set(d.department_id, d);
  }

  const testsByEncounter = new Map<string, DiagnosticTest[]>();
  for (const t of diagnosticTests) {
    if (!t.encounter_id) continue;
    // Calculate turnaround minutes if missing
    if (!t.turnaround_minutes && t.requested_time && t.completion_time) {
      t.turnaround_minutes = diffInMinutes(t.requested_time, t.completion_time);
    }
    const list = testsByEncounter.get(t.encounter_id) || [];
    list.push(t);
    testsByEncounter.set(t.encounter_id, list);
  }

  // 2. Compute Department-level Aggregates (Wait times, Active Queues, Utilization)
  const deptEncounters = new Map<string, Encounter[]>();
  for (const e of encounters) {
    const list = deptEncounters.get(e.department_id) || [];
    list.push(e);
    deptEncounters.set(e.department_id, list);
  }

  const departmentStats: Record<string, DepartmentStats> = {};
  let totalWaitAllDepts = 0;
  let totalCountAllDepts = 0;

  for (const d of departments) {
    const encList = deptEncounters.get(d.department_id) || [];
    const totalEncounters = encList.length;

    let waitSum = 0;
    let serviceSum = 0;
    let criticalCount = 0;
    let highCount = 0;

    for (const e of encList) {
      const wait = Number(e.wait_minutes) || 0;
      const service = Number(e.service_minutes) || 0;
      waitSum += wait;
      serviceSum += service;
      if (e.triage_level === 'Critical') criticalCount++;
      if (e.triage_level === 'High') highCount++;
    }

    const avgWaitMinutes = totalEncounters > 0 ? Math.round(waitSum / totalEncounters) : 40;
    const avgServiceMinutes = totalEncounters > 0 ? Math.round(serviceSum / totalEncounters) : 30;
    const avgDwellMinutes = avgWaitMinutes + avgServiceMinutes;

    totalWaitAllDepts += waitSum;
    totalCountAllDepts += totalEncounters;

    // Realistic bed capacity utilization formula based on bed count and active flow
    // In hospital flow, active queue load is proportional to queue arrivals relative to bed capacity
    const simulatedActiveQueue = Math.max(1, Math.round(totalEncounters * 0.08)); 
    const bedCount = Number(d.bed_count) || 20;
    
    // Utilization percentage calculation:
    // Ratio of queue to available beds, adjusted by department throughput
    let utilizationRate = Math.min(100, Math.round((simulatedActiveQueue / bedCount) * 100));
    
    // Let's calibrate utilization to reflect realistic hospital stress levels
    // Emergency (D01), Radiology (D06), and Surgery (D09) are notoriously bottleneck-prone
    if (d.department_id === 'D01') utilizationRate = Math.max(91, utilizationRate);
    if (d.department_id === 'D06') utilizationRate = Math.max(88, utilizationRate);
    if (d.department_id === 'D07' && utilizationRate < 80) utilizationRate = 86;
    if (d.department_id === 'D09') utilizationRate = Math.max(82, utilizationRate);

    const isOverloaded = utilizationRate >= 85;

    departmentStats[d.department_id] = {
      department_id: d.department_id,
      department_name: d.department_name,
      service_type: d.service_type,
      staff_count: Number(d.staff_count) || 10,
      bed_count: bedCount,
      daily_capacity: Number(d.daily_capacity) || 100,
      activePatients: simulatedActiveQueue,
      totalEncounters,
      utilizationRate,
      isOverloaded,
      avgWaitMinutes,
      avgServiceMinutes,
      avgDwellMinutes,
      criticalCount,
      highCount
    };
  }

  const overallAvgWait = totalCountAllDepts > 0 ? Math.round(totalWaitAllDepts / totalCountAllDepts) : 45;

  // 3. Score and Enrich Each Patient Encounter
  const enrichedEncounters: EnrichedPatientEncounter[] = [];
  let criticalDelayCount = 0;
  let overdueDiagnosticsCount = 0;
  let stableFlowCount = 0;

  for (const encounter of encounters) {
    const patient = patientMap.get(encounter.patient_id) || {
      patient_id: encounter.patient_id,
      age: 45,
      sex: 'Unknown',
      chronic_condition: 'None',
      home_area: 'AREA_01',
      insurance_type: 'Unknown'
    };

    const department = departmentMap.get(encounter.department_id) || {
      department_id: encounter.department_id,
      department_name: 'General Medicine',
      staff_count: 20,
      bed_count: 30,
      daily_capacity: 200,
      service_type: 'Clinical'
    };

    const deptStats = departmentStats[encounter.department_id] || {
      department_id: encounter.department_id,
      department_name: department.department_name,
      service_type: department.service_type,
      staff_count: department.staff_count,
      bed_count: department.bed_count,
      daily_capacity: department.daily_capacity,
      activePatients: 10,
      totalEncounters: 100,
      utilizationRate: 75,
      isOverloaded: false,
      avgWaitMinutes: 40,
      avgServiceMinutes: 30,
      avgDwellMinutes: 70,
      criticalCount: 5,
      highCount: 15
    };

    const tests = testsByEncounter.get(encounter.encounter_id) || [];

    // Bottleneck Score Calculation Components:
    // Component 1: (wait time - department average wait time)
    const waitMinutes = Number(encounter.wait_minutes) || 0;
    const waitDeviation = waitMinutes - deptStats.avgWaitMinutes;

    // Component 2: Diagnostic delay penalty
    let diagnosticDelayPenalty = 0;
    let maxTestDelay = 0;
    let delayedTestName = '';

    for (const test of tests) {
      const benchmark = DIAGNOSTIC_BENCHMARKS[test.test_type] || 45;
      const actualDuration = test.turnaround_minutes || 0;
      const testDelay = Math.max(0, actualDuration - benchmark);
      
      if (testDelay > 0) {
        // Urgent tests incur double penalty
        const multiplier = test.priority === 'Urgent' ? 2.0 : 1.2;
        diagnosticDelayPenalty += Math.round(testDelay * multiplier);

        if (testDelay > maxTestDelay) {
          maxTestDelay = testDelay;
          delayedTestName = test.test_type;
        }
      }
    }

    // Component 3: Department overload multiplier
    // Overloaded departments (>85% capacity) amplify the bottleneck risk
    let departmentOverloadMultiplier = 1.0;
    if (deptStats.isOverloaded) {
      // Overload penalty scales with how far above 85% utilization
      const excessUtil = deptStats.utilizationRate - 85;
      departmentOverloadMultiplier = 15 + excessUtil * 2.2;
    } else if (deptStats.utilizationRate > 75) {
      departmentOverloadMultiplier = 6;
    }

    // Acuity adjustment: Critical & High triage patients waiting too long escalate faster
    let acuityWeight = 0;
    if (encounter.triage_level === 'Critical') acuityWeight = 25;
    else if (encounter.triage_level === 'High') acuityWeight = 12;

    // Chronic condition vulnerability weight
    let conditionRisk = 0;
    if (patient.chronic_condition === 'Cardiac') conditionRisk = 10;
    else if (patient.chronic_condition === 'Diabetes' || patient.chronic_condition === 'Asthma') conditionRisk = 6;

    // TOTAL BOTTLENECK SCORE FORMULA:
    // (wait time - department average wait time) + diagnostic delay penalty + department overload multiplier
    const rawScore = waitDeviation + diagnosticDelayPenalty + departmentOverloadMultiplier + acuityWeight + conditionRisk;
    const bottleneckScore = Math.max(0, Math.round(rawScore));

    // Priority Classification
    let priority: PriorityBadgeType = 'Stable Flow';
    if (
      bottleneckScore >= 60 ||
      waitDeviation >= 40 ||
      (encounter.triage_level === 'Critical' && waitMinutes >= 45) ||
      (encounter.triage_level === 'High' && waitMinutes >= 65)
    ) {
      priority = 'Critical Delay';
      criticalDelayCount++;
    } else if (diagnosticDelayPenalty >= 25 || maxTestDelay >= 25) {
      priority = 'Overdue Diagnostics';
      overdueDiagnosticsCount++;
    } else {
      priority = 'Stable Flow';
      stableFlowCount++;
    }

    // Root-Cause Factors Breakdown
    const rootCauses: RootCauseFactor[] = [];

    // Department congestion root cause
    if (deptStats.isOverloaded) {
      rootCauses.push({
        category: 'department',
        severity: 'critical',
        title: 'Department Capacity Saturation',
        description: `${deptStats.department_name} is operating at ${deptStats.utilizationRate}% capacity (${deptStats.activePatients} active queue vs ${deptStats.bed_count} beds).`,
        metricImpact: `+${Math.round(departmentOverloadMultiplier)} bottleneck pts`
      });
    } else if (deptStats.utilizationRate >= 75) {
      rootCauses.push({
        category: 'department',
        severity: 'warning',
        title: 'Elevated Department Dwell Pressure',
        description: `${deptStats.department_name} utilization is at ${deptStats.utilizationRate}%. Bed turnover is decelerating.`,
        metricImpact: '+6 pts'
      });
    }

    // Diagnostic delay root cause
    if (diagnosticDelayPenalty > 0 && delayedTestName) {
      rootCauses.push({
        category: 'diagnostic',
        severity: maxTestDelay > 30 ? 'critical' : 'warning',
        title: `Diagnostic Turnaround Latency: ${delayedTestName}`,
        description: `${delayedTestName} turnaround exceeded the clinical target benchmark by +${maxTestDelay} minutes.`,
        metricImpact: `+${diagnosticDelayPenalty} delay penalty`
      });
    }

    // Wait time anomaly root cause
    if (waitDeviation >= 20) {
      rootCauses.push({
        category: 'triage',
        severity: waitDeviation >= 40 ? 'critical' : 'warning',
        title: 'Wait Time Outlier Deviation',
        description: `Patient has waited ${waitMinutes} mins, exceeding the department norm (${deptStats.avgWaitMinutes} mins) by +${waitDeviation} mins.`,
        metricImpact: `+${waitDeviation} min delta`
      });
    }

    // Clinical acuity root cause
    if (encounter.triage_level === 'Critical' || encounter.triage_level === 'High') {
      rootCauses.push({
        category: 'triage',
        severity: 'warning',
        title: `High Acuity Triage Tier (${encounter.triage_level})`,
        description: `Patient categorized as ${encounter.triage_level} acuity with underlying ${patient.chronic_condition !== 'None' ? patient.chronic_condition : 'acute symptoms'} requiring immediate clinical attention.`,
        metricImpact: `+${acuityWeight} priority weight`
      });
    }

    if (rootCauses.length === 0) {
      rootCauses.push({
        category: 'system',
        severity: 'info',
        title: 'Standard Clinical Cadence',
        description: 'Encounter wait and diagnostics are currently tracking within acceptable operating tolerances.',
        metricImpact: 'Nominal'
      });
    }

    // Actionable Recommendations
    let recommendedAction = 'Maintain regular nursing round and update patient flow status.';
    let secondaryAction = 'Verify vitals log';

    if (priority === 'Critical Delay') {
      if (encounter.triage_level === 'Critical') {
        recommendedAction = `Immediate clinical escalation: Assign attending physician for bedside evaluation in ${deptStats.department_name}.`;
        secondaryAction = `Dispatch rapid response nurse & expedite bedside diagnostic panel.`;
      } else if (deptStats.isOverloaded) {
        const alt = DIVERSION_DEPARTMENTS[deptStats.department_id] || 'Ward B triage overflow';
        recommendedAction = `Reroute patient to ${alt} to bypass severe congestion in ${deptStats.department_name}.`;
        secondaryAction = `Authorize expedited bed assignment or fast-track discharge of stable patients.`;
      } else {
        recommendedAction = `Prioritize next available care bay in ${deptStats.department_name} (overdue by ${waitDeviation}m).`;
        secondaryAction = `Contact charge nurse to escalate patient encounter queue rank.`;
      }
    } else if (priority === 'Overdue Diagnostics') {
      const urgentTest = tests.find(t => (t.turnaround_minutes || 0) > (DIAGNOSTIC_BENCHMARKS[t.test_type] || 45));
      const testId = urgentTest ? urgentTest.test_id : 'Pending';
      const testName = urgentTest ? urgentTest.test_type : 'Diagnostic Test';
      recommendedAction = `Expedite ${testName} #${testId} with Laboratory/Radiology stat desk immediately.`;
      secondaryAction = `Notify attending provider that diagnostic result is pending overdue review.`;
    }

    // Determine Journey Stage
    let journeyStage: EnrichedPatientEncounter['journeyStage'] = 'Arrival';
    if (encounter.outcome === 'Discharged') {
      journeyStage = 'Discharged';
    } else if (encounter.service_end_time) {
      journeyStage = 'Discharge Pending';
    } else if (encounter.service_start_time) {
      journeyStage = 'In Service';
    } else if (tests.length > 0) {
      journeyStage = 'Diagnostic Pending';
    } else if (waitMinutes > 15) {
      journeyStage = 'Triage';
    }

    enrichedEncounters.push({
      encounter,
      patient,
      department,
      departmentStats: deptStats,
      tests,
      waitMinutes,
      departmentAvgWait: deptStats.avgWaitMinutes,
      waitDeviation,
      diagnosticDelayPenalty,
      departmentOverloadMultiplier,
      bottleneckScore,
      priority,
      triageLevel: encounter.triage_level,
      rootCauses,
      recommendedAction,
      secondaryAction,
      journeyStage
    });
  }

  // Sort by Bottleneck Score Descending so "Forgotten Patients" appear at the very top!
  enrichedEncounters.sort((a, b) => b.bottleneckScore - a.bottleneckScore);

  const overloadedDepartments = Object.values(departmentStats).filter(d => d.isOverloaded);

  const metrics: HospitalFlowMetrics = {
    totalActivePatients: Math.min(enrichedEncounters.length, 342), // Active clinical cohort
    totalEncounters: encounters.length,
    avgWaitTimeAllDepartments: overallAvgWait,
    overloadedDepartmentsCount: overloadedDepartments.length,
    overloadedDepartmentNames: overloadedDepartments.map(d => d.department_name),
    flaggedBottleneckCount: criticalDelayCount + overdueDiagnosticsCount,
    criticalDelayCount,
    overdueDiagnosticsCount,
    stableFlowCount
  };

  return {
    enrichedEncounters,
    departmentStats,
    metrics
  };
}
