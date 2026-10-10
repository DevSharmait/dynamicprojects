import React, { useState } from 'react';
import {
  FormFieldRecord,
  FieldOptionRecord,
  FieldType,
} from '../../types/form-schema';
import { X, Plus, Trash2, Check, Info } from 'lucide-react';

interface FieldEditorModalProps {
  field?: FormFieldRecord | null;
  sectionId: string;
  existingOptions?: FieldOptionRecord[];
  onSave: (field: FormFieldRecord, options: FieldOptionRecord[]) => void;
  onClose: () => void;
}

export const FieldEditorModal: React.FC<FieldEditorModalProps> = ({
  field,
  sectionId,
  existingOptions = [],
  onSave,
  onClose,
}) => {
  const isEditing = !!field;

  const [fieldId] = useState(field?.FieldID || `FLD-${Date.now().toString().slice(-4)}`);
  const [fieldLabel, setFieldLabel] = useState(field?.FieldLabel || '');
  const [fieldName, setFieldName] = useState(
    field?.FieldName || ''
  );
  const [fieldType, setFieldType] = useState<FieldType>(field?.FieldType || 'text');
  const [columnSpan, setColumnSpan] = useState<4 | 6 | 8 | 12>(
    field?.ColumnSpan || 6
  );
  const [placeholder, setPlaceholder] = useState(field?.Placeholder || '');
  const [helpText, setHelpText] = useState(field?.HelpText || '');
  const [defaultValue, setDefaultValue] = useState(field?.DefaultValue || '');
  const [isRequired, setIsRequired] = useState(field?.IsRequired ?? false);
  const [isReadOnly, setIsReadOnly] = useState(field?.IsReadOnly ?? false);

  // Manage options for select, radio, checkbox
  const [options, setOptions] = useState<FieldOptionRecord[]>(
    existingOptions.filter((o) => o.FieldID === field?.FieldID)
  );
  const [newOptionLabel, setNewOptionLabel] = useState('');
  const [newOptionValue, setNewOptionValue] = useState('');

  // Auto-generate FieldName when Label is typed if creating new
  const handleLabelChange = (val: string) => {
    setFieldLabel(val);
    if (!isEditing && (!fieldName || fieldName === '')) {
      const sanitized = val
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join('');
      setFieldName(sanitized);
    }
  };

  const handleAddOption = () => {
    if (!newOptionLabel.trim()) return;
    const val = newOptionValue.trim() || newOptionLabel.trim();
    const newOpt: FieldOptionRecord = {
      OptionID: `OPT-${Date.now().toString().slice(-4)}`,
      FieldID: fieldId,
      OptionLabel: newOptionLabel.trim(),
      OptionValue: val,
      DisplayOrder: options.length + 1,
      IsDefault: options.length === 0,
    };
    setOptions([...options, newOpt]);
    setNewOptionLabel('');
    setNewOptionValue('');
  };

  const handleRemoveOption = (optId: string) => {
    setOptions(options.filter((o) => o.OptionID !== optId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldLabel.trim() || !fieldName.trim()) return;

    const savedField: FormFieldRecord = {
      FieldID: fieldId,
      SectionID: sectionId,
      FieldName: fieldName.trim(),
      FieldLabel: fieldLabel.trim(),
      FieldType: fieldType,
      DisplayOrder: field?.DisplayOrder || 99,
      ColumnSpan: columnSpan,
      Placeholder: placeholder.trim(),
      HelpText: helpText.trim(),
      DefaultValue: defaultValue,
      IsRequired: isRequired,
      IsReadOnly: isReadOnly,
    };

    onSave(savedField, options);
  };

  const needsOptions = ['select', 'radio', 'checkbox'].includes(fieldType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isEditing ? 'Configure Field' : 'Add New Form Field'}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              ID: {fieldId} · Section: {sectionId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Field Label (User Facing) *
              </label>
              <input
                type="text"
                required
                value={fieldLabel}
                onChange={(e) => handleLabelChange(e.target.value)}
                placeholder="e.g. Total Connected Electric Load"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Database Column Name (FieldName) *
              </label>
              <input
                type="text"
                required
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                placeholder="e.g. ConnectedElectricLoadHP"
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Field Type
              </label>
              <select
                value={fieldType}
                onChange={(e) => setFieldType(e.target.value as FieldType)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              >
                <option value="text">Single-line Text (text)</option>
                <option value="number">Numeric Value (number)</option>
                <option value="textarea">Multi-line Text (textarea)</option>
                <option value="select">Dropdown Select (select)</option>
                <option value="radio">Radio Choice Group (radio)</option>
                <option value="checkbox">Checkbox Group (checkbox)</option>
                <option value="date">Date Picker (date)</option>
                <option value="email">Email Address (email)</option>
                <option value="phone">Phone / Mobile (phone)</option>
                <option value="boolean">Boolean Switch / Affirmation (boolean)</option>
                <option value="file">Document / File Attachment (file)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Grid Column Width
              </label>
              <select
                value={columnSpan}
                onChange={(e) =>
                  setColumnSpan(Number(e.target.value) as 4 | 6 | 8 | 12)
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              >
                <option value={12}>Full Width (12 columns - 100%)</option>
                <option value={8}>Two Thirds (8 columns - 66%)</option>
                <option value={6}>Half Width (6 columns - 50%)</option>
                <option value={4}>One Third (4 columns - 33%)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Placeholder Text
              </label>
              <input
                type="text"
                value={placeholder}
                onChange={(e) => setPlaceholder(e.target.value)}
                placeholder="Hint inside empty input..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Value
              </label>
              <input
                type="text"
                value={defaultValue}
                onChange={(e) => setDefaultValue(e.target.value)}
                placeholder="Pre-populated default value..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Help / Tooltip Text
            </label>
            <input
              type="text"
              value={helpText}
              onChange={(e) => setHelpText(e.target.value)}
              placeholder="Explains statutory requirements or guidance to the user..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>

          {/* Flags */}
          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
                className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
              />
              <span className="text-xs font-semibold text-slate-800">
                Is Mandatory / Required Field
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isReadOnly}
                onChange={(e) => setIsReadOnly(e.target.checked)}
                className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
              />
              <span className="text-xs font-semibold text-slate-800">
                Read-Only Field
              </span>
            </label>
          </div>

          {/* Options Management (if applicable) */}
          {needsOptions && (
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Field Options ({options.length})
                </label>
                <span className="text-xs text-slate-500">
                  Values stored in FieldOptions SQL table
                </span>
              </div>

              {/* Existing Options List */}
              <div className="space-y-1.5 mb-3 max-h-40 overflow-y-auto">
                {options.map((opt, idx) => (
                  <div
                    key={opt.OptionID || idx}
                    className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400 text-[10px]">
                        #{idx + 1}
                      </span>
                      <span className="font-medium text-slate-900">
                        {opt.OptionLabel}
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className="font-mono text-slate-600">
                        "{opt.OptionValue}"
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(opt.OptionID)}
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {options.length === 0 && (
                  <div className="text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-xs text-slate-500">
                    No options defined yet. Add choices below.
                  </div>
                )}
              </div>

              {/* Add Option Inputs */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Option Label (e.g. High Pressure)"
                  value={newOptionLabel}
                  onChange={(e) => setNewOptionLabel(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <input
                  type="text"
                  placeholder="Option Value (e.g. HIGH_PRESS)"
                  value={newOptionValue}
                  onChange={(e) => setNewOptionValue(e.target.value)}
                  className="w-36 px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Option</span>
                </button>
              </div>
            </div>
          )}

          {/* Footer Action */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Save Changes' : 'Create Field'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
