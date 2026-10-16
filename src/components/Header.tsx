import React from 'react';
import { 
  HeartPulse, 
  UploadCloud, 
  Download, 
  RefreshCw, 
  SlidersHorizontal,
  FileSpreadsheet,
  Activity,
  Calendar
} from 'lucide-react';

interface HeaderProps {
  onOpenUploadModal: () => void;
  onExportCSV: () => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
  activeDatasetCount: number;
  timeWindow: 'all' | 'peak' | 'recent';
  onChangeTimeWindow: (window: 'all' | 'peak' | 'recent') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenUploadModal,
  onExportCSV,
  onRefreshData,
  isRefreshing,
  activeDatasetCount,
  timeWindow,
  onChangeTimeWindow
}) => {
  return (
    <header className="glass-panel border-b border-slate-800 sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-3.5 gap-3">
          
          {/* Logo & Clinical Title */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 font-extrabold shadow-glow-teal flex-shrink-0">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                  PULSE-OPS
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-700/80 font-bold uppercase">
                    v1.0 Datathon Edition
                  </span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  FLOW MONITOR
                </span>
              </div>
              <p className="text-xs text-slate-400 tracking-tight">
                "The Forgotten Patient" — Operational Bottleneck Intelligence & Intervention Engine
              </p>
            </div>
          </div>

          {/* Controls: Shift Filter, Upload, Export, Refresh */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            
            {/* Shift/Window selector */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
              <button
                onClick={() => onChangeTimeWindow('all')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  timeWindow === 'all'
                    ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Data
              </button>
              <button
                onClick={() => onChangeTimeWindow('peak')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  timeWindow === 'peak'
                    ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Filter to peak bottleneck snapshot"
              >
                <Calendar className="w-3 h-3" />
                Peak Surge
              </button>
              <button
                onClick={() => onChangeTimeWindow('recent')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  timeWindow === 'recent'
                    ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Emergency Only
              </button>
            </div>

            {/* Custom CSV Upload Modal trigger */}
            <button
              onClick={onOpenUploadModal}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all hover:border-slate-500"
              title="Upload custom dataset CSVs"
            >
              <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Load Custom CSVs</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={onExportCSV}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all hover:border-slate-500"
              title="Export prioritized patient action queue to CSV"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Export Priority CSV</span>
            </button>

            {/* Refresh */}
            <button
              onClick={onRefreshData}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-700 text-xs transition-all hover:text-white disabled:opacity-50"
              title="Recalculate Hospital Flow Metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-400' : ''}`} />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
