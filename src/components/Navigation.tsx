import React from 'react';
import {
  Layers,
  Database,
  FileText,
  ClipboardList,
  GitFork,
  Download,
  RotateCcw,
} from 'lucide-react';

export type AppView = 'designer' | 'renderer' | 'sql' | 'submissions' | 'architecture';

interface NavigationProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  formTitle: string;
  formCode: string;
  onResetToDefault: () => void;
  onExportJson: () => void;
  onExportSql: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onViewChange,
  formTitle,
  formCode,
  onResetToDefault,
  onExportJson,
  onExportSql,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single Brand Wordmark in display face */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <button
              onClick={() => onViewChange('renderer')}
              className="text-left group cursor-pointer"
            >
              <span className="text-base font-bold tracking-tight text-slate-900">
                FormEngine
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-mono text-slate-400">
                {formCode}
              </span>
            </button>
          </div>

          {/* Zone 2: 4-5 Navigation Links / View Selectors */}
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => onViewChange('designer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                currentView === 'designer'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Form Designer</span>
            </button>

            <button
              onClick={() => onViewChange('renderer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                currentView === 'renderer'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>User Form (Renderer)</span>
            </button>

            <button
              onClick={() => onViewChange('sql')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                currentView === 'sql'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>SQL Server (Tables & DDL)</span>
            </button>

            <button
              onClick={() => onViewChange('submissions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                currentView === 'submissions'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Submissions</span>
            </button>

            <button
              onClick={() => onViewChange('architecture')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                currentView === 'architecture'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Architecture</span>
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onResetToDefault}
              title="Reset to Factory Compliance Template"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onExportSql}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export T-SQL</span>
            </button>

            <button
              onClick={() => onViewChange(currentView === 'designer' ? 'renderer' : 'designer')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shadow-sm"
            >
              {currentView === 'designer' ? (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  <span>Preview User Form</span>
                </>
              ) : (
                <>
                  <Layers className="w-3.5 h-3.5" />
                  <span>Edit in Designer</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
