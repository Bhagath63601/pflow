import React, { useState } from 'react';
import Papa from 'papaparse';
import { 
  X, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  RefreshCcw,
  Sparkles
} from 'lucide-react';
import { Patient, Department, Encounter, DiagnosticTest } from '../types';

interface DataUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (data: {
    patients?: Patient[];
    departments?: Department[];
    encounters?: Encounter[];
    diagnosticTests?: DiagnosticTest[];
  }) => void;
  onResetToDefault: () => void;
  onLoadFallback: () => void;
}

export const DataUploadModal: React.FC<DataUploadModalProps> = ({
  isOpen,
  onClose,
  onDataLoaded,
  onResetToDefault,
  onLoadFallback
}) => {
  if (!isOpen) return null;

  const [uploadStatus, setUploadStatus] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'patients' | 'departments' | 'encounters' | 'diagnosticTests'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setUploadStatus(prev => ({ ...prev, [type]: 'Parsing...' }));

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        setIsProcessing(false);
        setUploadStatus(prev => ({ 
          ...prev, 
          [type]: `✓ Loaded ${results.data.length.toLocaleString()} rows` 
        }));
        onDataLoaded({ [type]: results.data as any });
      },
      error: (err) => {
        setIsProcessing(false);
        setUploadStatus(prev => ({ ...prev, [type]: `Error: ${err.message}` }));
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 z-10 animate-fade-in">
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 mb-5">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-cyan-400" />
              Dataset Source & CSV Importer
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Currently ingesting hospital datasets from <code className="text-teal-400 font-mono">./data/</code>. You can load custom test files or switch modes below.
            </p>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick presets buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => { onResetToDefault(); onClose(); }}
            className="p-3 rounded-xl bg-teal-950/60 border border-teal-800/80 hover:bg-teal-900/60 text-left transition-all group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-teal-300 mb-1">
              <span className="flex items-center gap-1.5">
                <RefreshCcw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform" />
                Reload Datathon Files
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Ingests 8,000 encounters, 2,000 patients, 12 departments, and 5,000 tests from ./data/
            </p>
          </button>

          <button
            onClick={() => { onLoadFallback(); onClose(); }}
            className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:bg-slate-800 text-left transition-all"
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-1">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Simulated Shift Fallback
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Instant synthetic active shift with pre-calibrated bottleneck outliers & tests.
            </p>
          </button>
        </div>

        {/* Upload custom CSVs section */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Upload Individual Evaluation CSVs
          </h4>

          {/* 1. Patients */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
            <div>
              <span className="font-mono font-bold text-slate-200 block">patients.csv</span>
              <span className="text-[11px] text-slate-500">patient_id, age, sex, chronic_condition...</span>
            </div>
            <div className="flex items-center gap-2">
              {uploadStatus.patients && (
                <span className="text-[11px] font-mono text-teal-300">{uploadStatus.patients}</span>
              )}
              <label className="cursor-pointer px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium">
                Browse
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={(e) => handleFileUpload(e, 'patients')} 
                  className="hidden" 
                />
              </label>
            </div>
          </div>

          {/* 2. Encounters */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
            <div>
              <span className="font-mono font-bold text-slate-200 block">encounters.csv</span>
              <span className="text-[11px] text-slate-500">encounter_id, arrival_time, department_id, wait_minutes...</span>
            </div>
            <div className="flex items-center gap-2">
              {uploadStatus.encounters && (
                <span className="text-[11px] font-mono text-teal-300">{uploadStatus.encounters}</span>
              )}
              <label className="cursor-pointer px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium">
                Browse
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={(e) => handleFileUpload(e, 'encounters')} 
                  className="hidden" 
                />
              </label>
            </div>
          </div>

          {/* 3. Departments */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
            <div>
              <span className="font-mono font-bold text-slate-200 block">departments.csv</span>
              <span className="text-[11px] text-slate-500">department_id, department_name, bed_count...</span>
            </div>
            <div className="flex items-center gap-2">
              {uploadStatus.departments && (
                <span className="text-[11px] font-mono text-teal-300">{uploadStatus.departments}</span>
              )}
              <label className="cursor-pointer px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium">
                Browse
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={(e) => handleFileUpload(e, 'departments')} 
                  className="hidden" 
                />
              </label>
            </div>
          </div>

          {/* 4. Diagnostic Tests */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
            <div>
              <span className="font-mono font-bold text-slate-200 block">diagnostic_tests.csv</span>
              <span className="text-[11px] text-slate-500">test_id, encounter_id, test_type, turnaround...</span>
            </div>
            <div className="flex items-center gap-2">
              {uploadStatus.diagnosticTests && (
                <span className="text-[11px] font-mono text-teal-300">{uploadStatus.diagnosticTests}</span>
              )}
              <label className="cursor-pointer px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium">
                Browse
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={(e) => handleFileUpload(e, 'diagnosticTests')} 
                  className="hidden" 
                />
              </label>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Apply & View Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
