import React from 'react';
import {
  Layers,
  Database,
  Code2,
  FileCheck2,
  ArrowDown,
  ArrowRight,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { AppView } from './Navigation';

interface ArchitectureViewProps {
  onNavigate: (view: AppView) => void;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      {/* Title & Context */}
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
          System Architecture Pipeline
        </h1>
        <p className="text-sm text-slate-600">
          Normalized Relational Data Flow from Visual Studio to SQL Server T-SQL Schema,
          REST API Contract, and Dynamic Multi-Step Form Rendering.
        </p>
      </div>

      {/* Visual Pipeline Flow */}
      <div className="space-y-6">
        {/* Step 1: Form Designer */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-indigo-600 font-semibold uppercase tracking-wider">
                    Tier 1 · Visual Studio
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500 font-mono">React 19 + TypeScript</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  Form Designer
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Drag-and-drop structural section builder, field property editor, dynamic 12-column grid layout,
                  conditional dependency rule engine, and validation rule orchestrator.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('designer')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors shrink-0"
            >
              <span>Open Form Designer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Transition arrow */}
        <div className="flex justify-center -my-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-mono text-slate-600">
            <ArrowDown className="w-3.5 h-3.5" />
            <span>Save Form Definition & Normalize Relational Records</span>
          </div>
        </div>

        {/* Step 2: SQL Server Database */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-amber-600 font-semibold uppercase tracking-wider">
                    Tier 2 · Normalized Relational Layer
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500 font-mono">Microsoft SQL Server (T-SQL)</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  SQL Server Relational Data Model
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Strictly 3NF-normalized relational tables enforcing foreign key referential integrity, indexes, and check constraints.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('sql')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors shrink-0"
            >
              <span>Inspect SQL Server Tables</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Diagram's 6 specific tables */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs font-mono font-bold text-slate-900 block">Forms</span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Form master, version & published flags</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs font-mono font-bold text-slate-900 block">FormSections</span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Stepper steps & section ordering</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs font-mono font-bold text-slate-900 block">FormFields</span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Input attributes, spans & column types</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs font-mono font-bold text-slate-900 block">FieldOptions</span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Dropdown & radio select items</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs font-mono font-bold text-slate-900 block">FieldDependencies</span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">SHOW/HIDE/REQUIRE rules</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs font-mono font-bold text-slate-900 block">FormValidations</span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Regex & range validation bounds</span>
            </div>
          </div>
        </div>

        {/* Transition arrow */}
        <div className="flex justify-center -my-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-mono text-slate-600">
            <ArrowDown className="w-3.5 h-3.5" />
            <span>REST API Endpoint / JSON Composite Payload</span>
          </div>
        </div>

        {/* Step 3: DynamicFormRenderer */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-emerald-600 font-semibold uppercase tracking-wider">
                    Tier 3 · Runtime Engine
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500 font-mono">React + TypeScript</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  DynamicFormRenderer
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Declarative React engine that consumes the API JSON payload, initializes responsive layout grids,
                  evaluates real-time field dependencies, monitors form changes, and runs client-side validation rules.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('renderer')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors shrink-0"
            >
              <span>Test Dynamic Renderer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Transition arrow */}
        <div className="flex justify-center -my-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-mono text-slate-600">
            <ArrowDown className="w-3.5 h-3.5" />
            <span>Renders Multi-Step Compliant User Experience</span>
          </div>
        </div>

        {/* Step 4: User Form */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center shrink-0">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-sky-600 font-semibold uppercase tracking-wider">
                    Tier 4 · End-User Experience
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500 font-mono">Statutory Factory Registration</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  User Form (Multi-Step Statutory Wizard)
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Sequential, step-by-step submission experience with live field dependencies and instant validation feedback.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('renderer')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
            >
              <span>Fill Form Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper items matching user diagram */}
          <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 font-mono text-xs">
            <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg text-slate-800">
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">1</span>
              <span className="font-semibold">Details of Occupier</span>
              <span className="text-slate-400 text-xs hidden sm:inline">Entity Category, Name, Designation, Tax PAN, CIN, Address</span>
            </div>
            <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg text-slate-800">
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">2</span>
              <span className="font-semibold">Details of Factory</span>
              <span className="text-slate-400 text-xs hidden sm:inline">Factory Name, Industrial Class, Process Brief, Premises Cadastral Address, Area</span>
            </div>
            <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg text-slate-800">
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">3</span>
              <span className="font-semibold">Power & Machinery Installation</span>
              <span className="text-slate-400 text-xs hidden sm:inline">Installed Motive HP, Standby Generator, High-Pressure Steam Boiler</span>
            </div>
            <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg text-slate-800">
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">4</span>
              <span className="font-semibold">Workforce & Safety Provisions</span>
              <span className="text-slate-400 text-xs hidden sm:inline">Max Shift Staff, Toxic Substances, Effluent Treatment ETP, Safety Officer</span>
            </div>
            <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg text-slate-800">
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">5</span>
              <span className="font-semibold">Statutory Declaration</span>
              <span className="text-slate-400 text-xs hidden sm:inline">Declarant Signatory, Execution Date, Solemn Affirmation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
