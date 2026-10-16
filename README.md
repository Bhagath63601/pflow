# PulseFlow 🏥

**Intelligent Hospital-Flow & Bottleneck Prevention Engine**

> Turning Hospital Data into Zero Forgotten Patients

PulseFlow is a real-time operational decision support system that eliminates patient journey bottlenecks. Built for hospital charge nurses, bed coordinators, and emergency triage staff to identify overloaded departments, monitor patient waiting times, prioritize cases for investigation, and understand why delays occur.

![Phase Badge](https://img.shields.io/badge/Phase-1%20to%204-00F090?style=flat-square)
![Track](https://img.shields.io/badge/Track-Health-FF3B30?style=flat-square)
![Status](https://img.shields.io/badge/Status-Production%20Ready-00F090?style=flat-square)

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/pulseflow.git
cd pulseflow

# Install dependencies
npm install

# Start the server
node server.js

# Open in browser
# http://localhost:3000/dashboard.html
```

---

## 📋 Features by Phase

### Phase 1 · Foundation — Hospital Flow Intelligence
- **Dashboard Overview**: Real-time KPI cards (bed occupancy, avg wait time, critical patients, overloaded departments)
- **Admissions & Discharges Trend Chart**: Monthly line chart with Chart.js
- **Visit Type Distribution**: Doughnut chart breakdown
- **Department Capacity Heatmap**: 12-department visual grid with utilization rates
- **Patient Management**: Add new patients, discharge, filter by department/status, paginated table
- **Department Overview**: Staff counts, bed counts, utilization bars, comparison charts
- **Investigate First Queue**: Composite bottleneck risk scoring with transparent formula:
  ```
  Score = (Wait − DeptAvg) + DiagPenalty + OverloadBonus + TriageWeight + ChronicWeight
  ```
- **Root Cause Drawer**: Journey timeline, score breakdown, diagnostic tests, 1-click escalation
- **LocalStorage Persistence**: Patient additions, discharges, and settings survive page reloads

### Phase 2 · Predictive ML — FlowCast Engine
- **Gradient Boosted Trees**: Ensemble of 50 decision stumps trained on 8,000 historical encounters
- **10 Engineered Features**: Department, triage level, visit type, age, chronic condition, hour of day, day of week, dept avg wait, staff count, bed count
- **80/20 Train-Test Split**: Proper evaluation on unseen data
- **Performance Metrics**: MAE, RMSE, R² score with KPI cards
- **Feature Importance Chart**: Horizontal bar chart showing model feature weights
- **Predicted vs Actual Scatter Plot**: Visual model accuracy assessment
- **Live Predictions Table**: Real-time delay risk predictions for all active patients

### Phase 3 · FlowCast AI — Recommendations & Simulation
- **AI-Generated Recommendations**: Automatic staffing and bed-capacity suggestions based on current load
- **Simulation Engine**: Configure additional beds (default: 8), additional staff (default: 2), and target department
- **Before/After Comparison Charts**: Side-by-side wait times and utilization bars
- **New Department Evaluation**: Toggle to assess whether a new overflow department is justified
- **Impact KPIs**: Utilization reduction %, overload alerts eliminated, wait time improvement

### Phase 4 · Automation & Integration
- **Alert Rules Engine**: Configurable rules for utilization thresholds, wait time limits, critical patient monitoring
- **3-Level Escalation Workflow**: Auto-Notify → Supervisor → Critical Escalation (CMO/Admin)
- **Live Alerts Feed**: Real-time violation detection with severity badges
- **FHIR R4 Integration**: Resource mapping for Patient, Encounter, Location, DiagnosticReport
- **Reports & Analytics**: Operational Summary, Bottleneck Analysis, ML Performance — all exportable as CSV

---

## 🗂 Dataset

| File | Records | Description |
|------|---------|-------------|
| `data/patients.csv` | 2,000 | Patient demographics (age, sex, chronic conditions, insurance) |
| `data/encounters.csv` | 8,000 | Hospital encounters (arrival, wait, service, discharge times) |
| `data/departments.csv` | 12 | Department definitions (staff, beds, capacity, type) |
| `data/diagnostic_tests.csv` | 5,000 | Diagnostic test orders and turnaround times |

### Join Keys
- `patients.csv` ↔ `encounters.csv` via `patient_id`
- `encounters.csv` ↔ `departments.csv` via `department_id`
- `encounters.csv` ↔ `diagnostic_tests.csv` via `encounter_id`

---

## 🏗 Architecture

```
PulseFlow/
├── dashboard.html          # Main application (single-page app)
├── server.js               # Node.js static file server
├── package.json            # Dependencies
├── data/
│   ├── patients.csv        # 2,000 patient records
│   ├── encounters.csv      # 8,000 encounter records
│   ├── departments.csv     # 12 departments
│   ├── diagnostic_tests.csv # 5,000 diagnostic tests
│   └── README.txt          # Dataset documentation
└── README.md
```

### Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | HTML5, Tailwind CSS (CDN), Vanilla JavaScript |
| Charts | Chart.js 4.4 |
| Icons | Lucide Icons |
| ML Engine | Custom Gradient Boosted Trees (pure JS) |
| Server | Node.js (zero dependencies) |
| Persistence | LocalStorage |
| Fonts | Inter (Google Fonts) |

---

## 🧠 ML Model — FlowCast

FlowCast implements a **Gradient Boosted Decision Tree** ensemble from scratch in JavaScript:

1. **Feature Engineering**: 10 features extracted per encounter (department encoding, triage level, visit type, patient age, chronic condition flag, arrival hour, day of week, department average wait, staff count, bed count)
2. **Training**: 50 sequential decision stumps with learning rate 0.1, minimizing MSE on residuals
3. **Prediction**: Summing leaf values across all stumps for wait time estimation
4. **Evaluation**: MAE, RMSE, and R² computed on held-out 20% test set

---

## 📊 Key Formulas

### Bottleneck Risk Score
```
RiskScore = WaitDeviation + DiagnosticPenalty + OverloadBonus + TriageWeight + ChronicWeight

Where:
  WaitDeviation = max(0, PatientWait − DeptAvgWait)
  DiagnosticPenalty = Σ(TAT > 60min → 20, TAT > 30min → 10)
  OverloadBonus = Util > 85% → 20, Util > 70% → 10
  TriageWeight = Critical:40, High:25, Medium:10, Low:0
  ChronicWeight = HasCondition → 15, None → 0
```

### Department Utilization
```
Utilization% = (ActivePatients / BedCount) × 100
Overloaded if Utilization > ConfigurableThreshold (default: 85%)
```

---

## 🎨 Design System

| Token | Hex | Usage |
|-------|-----|-------|
| Primary Ground | `#FFFFFF` | Canvas background |
| Biomedical Mint | `#00F090` | Accents, health-tech highlights |
| Mint-Slate | `#F1F6F3` | Card backgrounds, table fills |
| Vitals Rose | `#FF3B30` | Critical alerts, overload warnings |
| Vital Amber | `#FF9F1C` | Warning states, capacity limits |
| Sidebar Dark | `#0F172A` | Navigation background |

---

## 📄 License

MIT License — Built for Datathon 2025

---

*PulseFlow — Because no patient should be forgotten.*
