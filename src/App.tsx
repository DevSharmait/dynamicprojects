/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FormDefinition, FormSubmissionRecord } from './types/form-schema';
import { INITIAL_FACTORY_FORM, INITIAL_SUBMISSIONS } from './data/seed-forms';
import { Navigation, AppView } from './components/Navigation';
import { FormDesigner } from './components/designer/FormDesigner';
import { DynamicFormRenderer } from './components/renderer/DynamicFormRenderer';
import { SqlServerInspector } from './components/database/SqlServerInspector';
import { SubmissionsViewer } from './components/submissions/SubmissionsViewer';
import { ArchitectureView } from './components/ArchitectureDiagramModal';
import { generateSqlServerDDL, generateSqlServerInserts } from './utils/sql-generator';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('renderer');
  const [formDefinition, setFormDefinition] = useState<FormDefinition>(INITIAL_FACTORY_FORM);
  const [submissions, setSubmissions] = useState<FormSubmissionRecord[]>(INITIAL_SUBMISSIONS);

  // Handlers
  const handleSaveFormDefinition = (updated: FormDefinition) => {
    setFormDefinition(updated);
  };

  const handleSubmitSuccess = (newSubmission: FormSubmissionRecord) => {
    setSubmissions((prev) => [newSubmission, ...prev]);
  };

  const handleDeleteSubmission = (id: string) => {
    setSubmissions((prev) => prev.filter((s) => s.SubmissionID !== id));
  };

  const handleResetToDefault = () => {
    if (
      window.confirm(
        'Reset to initial Statutory Factory Registration (Form 1) template?'
      )
    ) {
      setFormDefinition(INITIAL_FACTORY_FORM);
      setSubmissions(INITIAL_SUBMISSIONS);
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(formDefinition, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formDefinition.form.FormCode}_definition.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportSql = () => {
    const sql = `${generateSqlServerDDL()}\n\n${generateSqlServerInserts(formDefinition)}`;
    const blob = new Blob([sql], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formDefinition.form.FormCode}_SqlServerSchema.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-slate-200">
      {/* 3-Zone Navigation Header adhering strictly to Top Bar Contract */}
      <Navigation
        currentView={currentView}
        onViewChange={setCurrentView}
        formTitle={formDefinition.form.FormName}
        formCode={formDefinition.form.FormCode}
        onResetToDefault={handleResetToDefault}
        onExportJson={handleExportJson}
        onExportSql={handleExportSql}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {currentView === 'designer' && (
          <FormDesigner
            formDefinition={formDefinition}
            onSaveFormDefinition={handleSaveFormDefinition}
            onPreviewRenderer={() => setCurrentView('renderer')}
          />
        )}

        {currentView === 'renderer' && (
          <DynamicFormRenderer
            formDefinition={formDefinition}
            onSubmitSuccess={handleSubmitSuccess}
            onNavigateToSql={() => setCurrentView('sql')}
            onEditInDesigner={() => setCurrentView('designer')}
          />
        )}

        {currentView === 'sql' && (
          <SqlServerInspector
            formDefinition={formDefinition}
            submissions={submissions}
          />
        )}

        {currentView === 'submissions' && (
          <SubmissionsViewer
            submissions={submissions}
            formDefinition={formDefinition}
            onDeleteSubmission={handleDeleteSubmission}
            onOpenRenderer={() => setCurrentView('renderer')}
          />
        )}

        {currentView === 'architecture' && (
          <ArchitectureView onNavigate={setCurrentView} />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">FormEngine Pipeline:</span>
            <span>Form Designer</span>
            <span aria-hidden="true">→</span>
            <span>SQL Server (Forms · FormSections · FormFields · FieldOptions · FieldDependencies · FormValidations)</span>
            <span aria-hidden="true">→</span>
            <span>DynamicFormRenderer</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('architecture')}
              className="text-slate-600 hover:text-slate-900 underline"
            >
              View System Flowchart
            </button>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px] text-slate-400">
              Form 1 Statutory Compliance
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
