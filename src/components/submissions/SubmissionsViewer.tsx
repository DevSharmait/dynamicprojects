import React, { useState } from 'react';
import {
  FormSubmissionRecord,
  FormDefinition,
} from '../../types/form-schema';
import {
  FileText,
  Eye,
  Trash2,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  X,
  Search,
} from 'lucide-react';

interface SubmissionsViewerProps {
  submissions: FormSubmissionRecord[];
  formDefinition: FormDefinition;
  onDeleteSubmission: (id: string) => void;
  onOpenRenderer: () => void;
}

export const SubmissionsViewer: React.FC<SubmissionsViewerProps> = ({
  submissions,
  formDefinition,
  onDeleteSubmission,
  onOpenRenderer,
}) => {
  const [selectedSub, setSelectedSub] = useState<FormSubmissionRecord | null>(null);
  const [filterText, setFilterText] = useState('');

  const filtered = submissions.filter((s) => {
    if (!filterText.trim()) return true;
    const q = filterText.toLowerCase();
    return (
      s.ReferenceNo.toLowerCase().includes(q) ||
      s.SubmittedBy.toLowerCase().includes(q) ||
      s.Status.toLowerCase().includes(q)
    );
  });

  const handleExportJson = (sub: FormSubmissionRecord) => {
    const blob = new Blob([JSON.stringify(sub, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Submission_${sub.ReferenceNo.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              RELATIONAL FORM SUBMISSIONS
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-mono text-slate-500">
              [dbo].[FormSubmissions]
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Submitted Statutory Applications ({submissions.length})
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Normalized records saved from DynamicFormRenderer into SQL Server table storage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search reference or applicant..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 w-56"
            />
          </div>

          <button
            onClick={onOpenRenderer}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
          >
            + New Application
          </button>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs">
            <p className="font-semibold text-slate-700 mb-1">
              No submissions found.
            </p>
            <p>Fill and submit a form in the Dynamic Renderer to create records.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono text-[11px]">
                  <th className="p-3.5 font-semibold">Reference No</th>
                  <th className="p-3.5 font-semibold">Submitted By</th>
                  <th className="p-3.5 font-semibold">Submission Date</th>
                  <th className="p-3.5 font-semibold">Status</th>
                  <th className="p-3.5 font-semibold">Form Code</th>
                  <th className="p-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((sub) => (
                  <tr key={sub.SubmissionID} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      {sub.ReferenceNo}
                    </td>
                    <td className="p-3.5 font-medium text-slate-800">
                      {sub.SubmittedBy}
                    </td>
                    <td className="p-3.5 font-mono text-slate-500">
                      {new Date(sub.SubmittedAt).toLocaleString()}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          sub.Status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : sub.Status === 'Submitted'
                            ? 'bg-sky-50 text-sky-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{sub.Status}</span>
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-500">
                      {sub.FormID}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedSub(sub)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleExportJson(sub)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          title="Download Payload JSON"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteSubmission(sub.SubmissionID)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Drawer Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {selectedSub.ReferenceNo}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500 font-mono">
                    ID: {selectedSub.SubmissionID}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Submitted by {selectedSub.SubmittedBy} on{' '}
                  {new Date(selectedSub.SubmittedAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body - Field values breakdown */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Normalized Field Responses (EAV Breakdown)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {Object.entries(selectedSub.PayloadJson || {}).map(([key, val]) => {
                  const fieldDef = formDefinition.fields.find((f) => f.FieldName === key);
                  const str =
                    val === null || val === undefined
                      ? 'N/A'
                      : typeof val === 'boolean'
                      ? val
                        ? 'Yes / True'
                        : 'No / False'
                      : String(val);

                  return (
                    <div
                      key={key}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <span className="text-[10px] font-mono text-slate-400 block">
                        {key} {fieldDef ? `· ${fieldDef.FieldLabel}` : ''}
                      </span>
                      <span className="font-medium text-slate-900 mt-1 block break-words">
                        {str || <span className="text-slate-400 italic">Empty</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
              <button
                onClick={() => handleExportJson(selectedSub)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON Payload</span>
              </button>

              <button
                onClick={() => setSelectedSub(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
