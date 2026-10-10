import React, { useState } from 'react';
import {
  FieldDependencyRecord,
  FormFieldRecord,
  ConditionOperator,
  DependencyAction,
} from '../../types/form-schema';
import { X, Plus, Trash2, ArrowRight, GitBranch } from 'lucide-react';

interface DependencyModalProps {
  formId: string;
  fields: FormFieldRecord[];
  dependencies: FieldDependencyRecord[];
  onSaveDependencies: (updated: FieldDependencyRecord[]) => void;
  onClose: () => void;
}

export const DependencyModal: React.FC<DependencyModalProps> = ({
  formId,
  fields,
  dependencies,
  onSaveDependencies,
  onClose,
}) => {
  const [list, setList] = useState<FieldDependencyRecord[]>([...dependencies]);

  // New rule builder form state
  const [targetFieldId, setTargetFieldId] = useState(fields[0]?.FieldID || '');
  const [sourceFieldId, setSourceFieldId] = useState(fields[1]?.FieldID || fields[0]?.FieldID || '');
  const [operator, setOperator] = useState<ConditionOperator>('EQUALS');
  const [conditionValue, setConditionValue] = useState('');
  const [actionType, setActionType] = useState<DependencyAction>('SHOW');

  const getFieldLabel = (id: string) => {
    const f = fields.find((item) => item.FieldID === id);
    return f ? `${f.FieldLabel} (${f.FieldName})` : id;
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetFieldId || !sourceFieldId) return;

    const newDep: FieldDependencyRecord = {
      DependencyID: `DEP-${Date.now().toString().slice(-4)}`,
      FormID: formId,
      TargetFieldID: targetFieldId,
      SourceFieldID: sourceFieldId,
      ConditionOperator: operator,
      ConditionValue: conditionValue.trim(),
      ActionType: actionType,
    };

    setList([...list, newDep]);
    setConditionValue('');
  };

  const handleRemoveRule = (depId: string) => {
    setList(list.filter((d) => d.DependencyID !== depId));
  };

  const handleCommit = () => {
    onSaveDependencies(list);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Field Dependencies & Conditional Logic
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Persisted in SQL Server table: [dbo].[FieldDependencies]
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Active Rules List */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Configured Dependency Rules ({list.length})
            </h4>

            {list.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-xs text-slate-500">
                No conditional rules defined yet. Use the rule builder below to create logic.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {list.map((dep) => (
                  <div
                    key={dep.DependencyID}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-wrap flex-1">
                      <span className="font-mono text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {dep.DependencyID}
                      </span>
                      <span className="text-slate-500 font-medium">IF</span>
                      <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {getFieldLabel(dep.SourceFieldID)}
                      </span>
                      <span className="font-mono text-indigo-600 font-medium">
                        [{dep.ConditionOperator}]
                      </span>
                      <span className="font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                        "{dep.ConditionValue}"
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-500 font-medium">THEN</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          dep.ActionType === 'SHOW'
                            ? 'bg-emerald-100 text-emerald-800'
                            : dep.ActionType === 'HIDE'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {dep.ActionType}
                      </span>
                      <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {getFieldLabel(dep.TargetFieldID)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleRemoveRule(dep.DependencyID)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors shrink-0"
                      title="Remove Rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create New Dependency Form */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Add New Conditional Rule
            </h4>

            <form onSubmit={handleAddRule} className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Source Field */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    IF Source Field (Trigger):
                  </label>
                  <select
                    value={sourceFieldId}
                    onChange={(e) => setSourceFieldId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    {fields.map((f) => (
                      <option key={f.FieldID} value={f.FieldID}>
                        {f.FieldLabel} ({f.FieldName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Operator */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Condition Operator:
                  </label>
                  <select
                    value={operator}
                    onChange={(e) => setOperator(e.target.value as ConditionOperator)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  >
                    <option value="EQUALS">EQUALS (Exact Match)</option>
                    <option value="NOT_EQUALS">NOT_EQUALS (Different)</option>
                    <option value="CONTAINS">CONTAINS (Substring)</option>
                    <option value="IN">IN (Comma-separated values)</option>
                    <option value="GREATER_THAN">GREATER_THAN (&gt; Number)</option>
                    <option value="LESS_THAN">LESS_THAN (&lt; Number)</option>
                    <option value="IS_EMPTY">IS_EMPTY (No Value)</option>
                    <option value="IS_NOT_EMPTY">IS_NOT_EMPTY (Has Value)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Value to match */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Expected Value:
                  </label>
                  <input
                    type="text"
                    value={conditionValue}
                    onChange={(e) => setConditionValue(e.target.value)}
                    placeholder="e.g. YES, true, Company"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                {/* Action Type */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    THEN Action:
                  </label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value as DependencyAction)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-semibold"
                  >
                    <option value="SHOW">SHOW Target Field</option>
                    <option value="HIDE">HIDE Target Field</option>
                    <option value="ENABLE">ENABLE Target Field</option>
                    <option value="DISABLE">DISABLE Target Field</option>
                    <option value="REQUIRE">REQUIRE Target Field</option>
                  </select>
                </div>

                {/* Target Field */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Target Field (Impacted):
                  </label>
                  <select
                    value={targetFieldId}
                    onChange={(e) => setTargetFieldId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    {fields.map((f) => (
                      <option key={f.FieldID} value={f.FieldID}>
                        {f.FieldLabel} ({f.FieldName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Insert Dependency Rule</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <span className="text-xs text-slate-500 font-mono">
            {list.length} conditional dependency rules in memory
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCommit}
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Save Dependencies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
