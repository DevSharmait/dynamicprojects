import React, { useState } from 'react';
import {
  FormValidationRecord,
  FormFieldRecord,
  ValidationType,
} from '../../types/form-schema';
import { X, Plus, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';

interface ValidationModalProps {
  fields: FormFieldRecord[];
  validations: FormValidationRecord[];
  onSaveValidations: (updated: FormValidationRecord[]) => void;
  onClose: () => void;
}

export const ValidationModal: React.FC<ValidationModalProps> = ({
  fields,
  validations,
  onSaveValidations,
  onClose,
}) => {
  const [list, setList] = useState<FormValidationRecord[]>([...validations]);

  const [fieldId, setFieldId] = useState(fields[0]?.FieldID || '');
  const [valType, setValType] = useState<ValidationType>('REGEX');
  const [valRule, setValRule] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const getFieldLabel = (id: string) => {
    const f = fields.find((item) => item.FieldID === id);
    return f ? `${f.FieldLabel} (${f.FieldName})` : id;
  };

  const handleAddValidation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldId || !errorMessage.trim()) return;

    const newRec: FormValidationRecord = {
      ValidationID: `VAL-${Date.now().toString().slice(-4)}`,
      FieldID: fieldId,
      ValidationType: valType,
      ValidationRule: valRule.trim(),
      ErrorMessage: errorMessage.trim(),
    };

    setList([...list, newRec]);
    setValRule('');
    setErrorMessage('');
  };

  const handleRemoveValidation = (id: string) => {
    setList(list.filter((v) => v.ValidationID !== id));
  };

  const handleCommit = () => {
    onSaveValidations(list);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Form Validations & Constraints
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Persisted in SQL Server table: [dbo].[FormValidations]
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
              Configured Validations ({list.length})
            </h4>

            {list.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-xs text-slate-500">
                No custom validation rules defined yet. Add constraints below.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {list.map((v) => (
                  <div
                    key={v.ValidationID}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {v.ValidationID}
                        </span>
                        <span className="font-semibold text-slate-900">
                          {getFieldLabel(v.FieldID)}
                        </span>
                        <span className="font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded text-[10px] font-bold">
                          {v.ValidationType}
                        </span>
                        {v.ValidationRule && (
                          <span className="font-mono text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">
                            {v.ValidationRule}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-rose-700 font-medium text-[11px]">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>"{v.ErrorMessage}"</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveValidation(v.ValidationID)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors shrink-0"
                      title="Remove Validation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Validation Form */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Add New Validation Rule
            </h4>

            <form onSubmit={handleAddValidation} className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Field Selection */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Select Target Field:
                  </label>
                  <select
                    value={fieldId}
                    onChange={(e) => setFieldId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    {fields.map((f) => (
                      <option key={f.FieldID} value={f.FieldID}>
                        {f.FieldLabel} ({f.FieldName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Validation Type */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Validation Rule Type:
                  </label>
                  <select
                    value={valType}
                    onChange={(e) => setValType(e.target.value as ValidationType)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono font-medium"
                  >
                    <option value="REGEX">REGEX Pattern</option>
                    <option value="MIN_VALUE">MIN_VALUE (Numeric Threshold)</option>
                    <option value="MAX_VALUE">MAX_VALUE (Numeric Threshold)</option>
                    <option value="MIN_LENGTH">MIN_LENGTH (Characters)</option>
                    <option value="MAX_LENGTH">MAX_LENGTH (Characters)</option>
                    <option value="EMAIL">EMAIL (RFC Standard Pattern)</option>
                    <option value="PHONE">PHONE (Minimum Digits)</option>
                    <option value="REQUIRED">REQUIRED (Strict Non-Empty)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Rule expression */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Rule Expression / Parameter:
                  </label>
                  <input
                    type="text"
                    value={valRule}
                    onChange={(e) => setValRule(e.target.value)}
                    placeholder="e.g. ^[A-Z]{5}[0-9]{4}[A-Z]{1}$ or 100"
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                {/* Error message */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Display Error Message:
                  </label>
                  <input
                    type="text"
                    required
                    value={errorMessage}
                    onChange={(e) => setErrorMessage(e.target.value)}
                    placeholder="e.g. Please enter a valid registration ID."
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Insert Validation Rule</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <span className="text-xs text-slate-500 font-mono">
            {list.length} field validations active
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
              Save Validations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
