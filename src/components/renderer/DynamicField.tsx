import React from 'react';
import {
  FormFieldRecord,
  FieldOptionRecord,
} from '../../types/form-schema';
import { EvaluatedFieldState } from '../../utils/dependency-engine';
import { AlertCircle, HelpCircle, Upload, Check } from 'lucide-react';

interface DynamicFieldProps {
  field: FormFieldRecord;
  value: any;
  options: FieldOptionRecord[];
  evaluatedState: EvaluatedFieldState;
  error?: string | null;
  onChange: (fieldName: string, value: any) => void;
  onBlur?: (fieldName: string) => void;
}

export const DynamicField: React.FC<DynamicFieldProps> = ({
  field,
  value,
  options,
  evaluatedState,
  error,
  onChange,
  onBlur,
}) => {
  // If hidden by conditional logic, do not render in DOM
  if (!evaluatedState.isVisible) {
    return null;
  }

  const isRequired = evaluatedState.isRequired;
  const isEnabled = evaluatedState.isEnabled;

  // Compute CSS column span
  const getColSpanClass = () => {
    switch (field.ColumnSpan) {
      case 12:
        return 'col-span-12';
      case 8:
        return 'col-span-12 md:col-span-8';
      case 6:
        return 'col-span-12 md:col-span-6';
      case 4:
        return 'col-span-12 md:col-span-4';
      default:
        return 'col-span-12 md:col-span-6';
    }
  };

  const handleChange = (newVal: any) => {
    onChange(field.FieldName, newVal);
  };

  const handleBlur = () => {
    if (onBlur) {
      onBlur(field.FieldName);
    }
  };

  const strValue = value === undefined || value === null ? '' : String(value);

  return (
    <div className={`${getColSpanClass()} space-y-1.5 transition-all`}>
      {/* Label & Required Indicator */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={field.FieldID}
          className="text-xs font-semibold text-slate-800 flex items-center gap-1"
        >
          <span>{field.FieldLabel}</span>
          {isRequired && (
            <span className="text-rose-600 font-bold" title="Required Field">
              *
            </span>
          )}
        </label>
        {field.HelpText && (
          <span
            className="text-[11px] text-slate-400 cursor-help"
            title={field.HelpText}
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </span>
        )}
      </div>

      {/* Input Element based on FieldType */}
      <div>
        {/* TEXT */}
        {field.FieldType === 'text' && (
          <input
            id={field.FieldID}
            type="text"
            disabled={!isEnabled}
            value={strValue}
            placeholder={field.Placeholder || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 text-xs sm:text-sm bg-white border rounded-lg focus:outline-none transition-colors ${
              error
                ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                : 'border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent'
            } disabled:bg-slate-100 disabled:text-slate-500`}
          />
        )}

        {/* NUMBER */}
        {field.FieldType === 'number' && (
          <input
            id={field.FieldID}
            type="number"
            disabled={!isEnabled}
            value={strValue}
            placeholder={field.Placeholder || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 text-xs sm:text-sm font-mono bg-white border rounded-lg focus:outline-none transition-colors ${
              error
                ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                : 'border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent'
            } disabled:bg-slate-100 disabled:text-slate-500`}
          />
        )}

        {/* EMAIL */}
        {field.FieldType === 'email' && (
          <input
            id={field.FieldID}
            type="email"
            disabled={!isEnabled}
            value={strValue}
            placeholder={field.Placeholder || 'name@example.com'}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 text-xs sm:text-sm bg-white border rounded-lg focus:outline-none transition-colors ${
              error
                ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                : 'border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent'
            } disabled:bg-slate-100 disabled:text-slate-500`}
          />
        )}

        {/* PHONE */}
        {field.FieldType === 'phone' && (
          <input
            id={field.FieldID}
            type="tel"
            disabled={!isEnabled}
            value={strValue}
            placeholder={field.Placeholder || '+1 555-0199'}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 text-xs sm:text-sm font-mono bg-white border rounded-lg focus:outline-none transition-colors ${
              error
                ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                : 'border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent'
            } disabled:bg-slate-100 disabled:text-slate-500`}
          />
        )}

        {/* DATE */}
        {field.FieldType === 'date' && (
          <input
            id={field.FieldID}
            type="date"
            disabled={!isEnabled}
            value={strValue}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 text-xs sm:text-sm font-mono bg-white border rounded-lg focus:outline-none transition-colors ${
              error
                ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                : 'border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent'
            } disabled:bg-slate-100 disabled:text-slate-500`}
          />
        )}

        {/* TEXTAREA */}
        {field.FieldType === 'textarea' && (
          <textarea
            id={field.FieldID}
            rows={3}
            disabled={!isEnabled}
            value={strValue}
            placeholder={field.Placeholder || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 text-xs sm:text-sm bg-white border rounded-lg focus:outline-none transition-colors resize-y ${
              error
                ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                : 'border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent'
            } disabled:bg-slate-100 disabled:text-slate-500`}
          />
        )}

        {/* SELECT */}
        {field.FieldType === 'select' && (
          <select
            id={field.FieldID}
            disabled={!isEnabled}
            value={strValue}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 text-xs sm:text-sm bg-white border rounded-lg focus:outline-none transition-colors ${
              error
                ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                : 'border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent'
            } disabled:bg-slate-100 disabled:text-slate-500`}
          >
            <option value="">{field.Placeholder || '-- Select Option --'}</option>
            {options.map((opt) => (
              <option key={opt.OptionID} value={opt.OptionValue}>
                {opt.OptionLabel}
              </option>
            ))}
          </select>
        )}

        {/* RADIO */}
        {field.FieldType === 'radio' && (
          <div className="space-y-1.5 pt-1">
            {options.map((opt) => {
              const isChecked = strValue === opt.OptionValue;
              return (
                <label
                  key={opt.OptionID}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-slate-50 border-slate-900 text-slate-900 font-medium'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={field.FieldName}
                    disabled={!isEnabled}
                    value={opt.OptionValue}
                    checked={isChecked}
                    onChange={() => handleChange(opt.OptionValue)}
                    className="w-3.5 h-3.5 text-slate-900 border-slate-300 focus:ring-slate-900"
                  />
                  <span>{opt.OptionLabel}</span>
                </label>
              );
            })}
          </div>
        )}

        {/* CHECKBOX GROUP */}
        {field.FieldType === 'checkbox' && (
          <div className="space-y-1.5 pt-1">
            {options.map((opt) => {
              const selectedValues = Array.isArray(value)
                ? value
                : strValue
                ? strValue.split(',')
                : [];
              const isChecked = selectedValues.includes(opt.OptionValue);

              const toggleOption = () => {
                let updated: string[];
                if (isChecked) {
                  updated = selectedValues.filter((v) => v !== opt.OptionValue);
                } else {
                  updated = [...selectedValues, opt.OptionValue];
                }
                handleChange(updated.join(','));
              };

              return (
                <label
                  key={opt.OptionID}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-slate-50 border-slate-900 text-slate-900 font-medium'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    disabled={!isEnabled}
                    checked={isChecked}
                    onChange={toggleOption}
                    className="w-3.5 h-3.5 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
                  />
                  <span>{opt.OptionLabel}</span>
                </label>
              );
            })}
          </div>
        )}

        {/* BOOLEAN SWITCH / AFFIRMATION */}
        {field.FieldType === 'boolean' && (
          <div className="pt-1">
            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                id={field.FieldID}
                disabled={!isEnabled}
                checked={value === true || value === 'true'}
                onChange={(e) => handleChange(e.target.checked)}
                onBlur={handleBlur}
                className="w-4 h-4 mt-0.5 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
              />
              <div className="text-xs text-slate-700 leading-relaxed">
                <span className="font-medium text-slate-900">Affirmation: </span>
                {field.Placeholder || field.FieldLabel}
              </div>
            </label>
          </div>
        )}

        {/* FILE UPLOAD (SIMULATED) */}
        {field.FieldType === 'file' && (
          <div className="border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50 text-center hover:bg-slate-100 transition-colors">
            {strValue ? (
              <div className="flex items-center justify-between text-xs text-slate-800">
                <span className="font-mono text-emerald-700 font-medium truncate max-w-[200px]">
                  ✓ Attached: {strValue}
                </span>
                <button
                  type="button"
                  onClick={() => handleChange('')}
                  className="text-slate-400 hover:text-rose-600 text-xs ml-2"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center gap-1">
                <Upload className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-700">
                  Click to select file or drag documents
                </span>
                <span className="text-[10px] text-slate-400">
                  PDF, DOCX, JPG (Up to 15MB)
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleChange(f.name);
                  }}
                />
              </label>
            )}
          </div>
        )}
      </div>

      {/* Error Message Display */}
      {error && (
        <div className="flex items-center gap-1 text-[11px] text-rose-600 font-medium mt-1 animate-in fade-in">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
