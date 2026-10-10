import React, { useState } from 'react';
import {
  FormDefinition,
  FormSectionRecord,
  FormFieldRecord,
  FieldOptionRecord,
  FieldDependencyRecord,
  FormValidationRecord,
  FieldType,
} from '../../types/form-schema';
import {
  Plus,
  Trash2,
  Edit2,
  ChevronUp,
  ChevronDown,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Type,
  Hash,
  AlignLeft,
  ListFilter,
  CheckSquare,
  Calendar,
  ToggleLeft,
  Paperclip,
  Save,
  Eye,
  Sliders,
} from 'lucide-react';
import { FieldEditorModal } from './FieldEditorModal';
import { DependencyModal } from './DependencyModal';
import { ValidationModal } from './ValidationModal';

interface FormDesignerProps {
  formDefinition: FormDefinition;
  onSaveFormDefinition: (updated: FormDefinition) => void;
  onPreviewRenderer: () => void;
}

export const FormDesigner: React.FC<FormDesignerProps> = ({
  formDefinition,
  onSaveFormDefinition,
  onPreviewRenderer,
}) => {
  const [definition, setDefinition] = useState<FormDefinition>(formDefinition);
  const [activeSectionId, setActiveSectionId] = useState<string>(
    definition.sections[0]?.SectionID || ''
  );

  // Modals state
  const [editingField, setEditingField] = useState<FormFieldRecord | null | undefined>(
    undefined
  );
  const [showDependencyModal, setShowDependencyModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(false);

  // New Section Inline State
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionDesc, setNewSectionDesc] = useState('');

  const activeSection = definition.sections.find(
    (s) => s.SectionID === activeSectionId
  );
  const activeFields = definition.fields
    .filter((f) => f.SectionID === activeSectionId)
    .sort((a, b) => a.DisplayOrder - b.DisplayOrder);

  // Save changes to parent state & simulate SQL Server save
  const handleCommitDefinition = (newDef: FormDefinition) => {
    setDefinition(newDef);
    onSaveFormDefinition(newDef);
    setSaveSuccessMessage(true);
    setTimeout(() => setSaveSuccessMessage(false), 2500);
  };

  // Section Management
  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;

    const newSec: FormSectionRecord = {
      SectionID: `SEC-${Date.now().toString().slice(-4)}`,
      FormID: definition.form.FormID,
      SectionTitle: newSectionTitle.trim(),
      SectionOrder: definition.sections.length + 1,
      Description: newSectionDesc.trim(),
      IconName: 'Folder',
    };

    const updatedSections = [...definition.sections, newSec];
    const newDef = { ...definition, sections: updatedSections };
    handleCommitDefinition(newDef);
    setActiveSectionId(newSec.SectionID);
    setNewSectionTitle('');
    setNewSectionDesc('');
    setShowAddSection(false);
  };

  const handleDeleteSection = (secId: string) => {
    if (definition.sections.length <= 1) return;
    const updatedSections = definition.sections.filter((s) => s.SectionID !== secId);
    const updatedFields = definition.fields.filter((f) => f.SectionID !== secId);
    const newDef = { ...definition, sections: updatedSections, fields: updatedFields };
    handleCommitDefinition(newDef);
    if (activeSectionId === secId) {
      setActiveSectionId(updatedSections[0]?.SectionID || '');
    }
  };

  const handleMoveSection = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= definition.sections.length) return;

    const clone = [...definition.sections];
    const [moved] = clone.splice(idx, 1);
    clone.splice(targetIdx, 0, moved);

    const reordered = clone.map((sec, i) => ({ ...sec, SectionOrder: i + 1 }));
    handleCommitDefinition({ ...definition, sections: reordered });
  };

  // Field Management
  const handleSaveField = (field: FormFieldRecord, options: FieldOptionRecord[]) => {
    let updatedFields: FormFieldRecord[];
    const exists = definition.fields.some((f) => f.FieldID === field.FieldID);

    if (exists) {
      updatedFields = definition.fields.map((f) =>
        f.FieldID === field.FieldID ? field : f
      );
    } else {
      updatedFields = [...definition.fields, field];
    }

    // Update options for this field
    const otherOptions = definition.options.filter((o) => o.FieldID !== field.FieldID);
    const updatedOptions = [...otherOptions, ...options];

    const newDef = {
      ...definition,
      fields: updatedFields,
      options: updatedOptions,
    };
    handleCommitDefinition(newDef);
    setEditingField(undefined);
  };

  const handleDeleteField = (fieldId: string) => {
    const updatedFields = definition.fields.filter((f) => f.FieldID !== fieldId);
    const updatedOptions = definition.options.filter((o) => o.FieldID !== fieldId);
    const updatedDependencies = definition.dependencies.filter(
      (d) => d.TargetFieldID !== fieldId && d.SourceFieldID !== fieldId
    );
    const updatedValidations = definition.validations.filter(
      (v) => v.FieldID !== fieldId
    );

    const newDef = {
      ...definition,
      fields: updatedFields,
      options: updatedOptions,
      dependencies: updatedDependencies,
      validations: updatedValidations,
    };
    handleCommitDefinition(newDef);
  };

  const handleMoveField = (fieldId: string, direction: 'up' | 'down') => {
    const sectionFieldList = [...activeFields];
    const idx = sectionFieldList.findIndex((f) => f.FieldID === fieldId);
    if (idx === -1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sectionFieldList.length) return;

    const [moved] = sectionFieldList.splice(idx, 1);
    sectionFieldList.splice(targetIdx, 0, moved);

    // Re-assign display order within this section
    const orderMap = new Map<string, number>();
    sectionFieldList.forEach((f, i) => orderMap.set(f.FieldID, i + 1));

    const updatedFields = definition.fields.map((f) => {
      if (orderMap.has(f.FieldID)) {
        return { ...f, DisplayOrder: orderMap.get(f.FieldID)! };
      }
      return f;
    });

    handleCommitDefinition({ ...definition, fields: updatedFields });
  };

  // Quick palette add
  const handleQuickAddField = (type: FieldType) => {
    const newField: FormFieldRecord = {
      FieldID: `FLD-${Date.now().toString().slice(-4)}`,
      SectionID: activeSectionId,
      FieldName: `New${type.charAt(0).toUpperCase() + type.slice(1)}Field`,
      FieldLabel: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Input`,
      FieldType: type,
      DisplayOrder: activeFields.length + 1,
      ColumnSpan: type === 'textarea' ? 12 : 6,
      Placeholder: '',
      HelpText: '',
      IsRequired: false,
      IsReadOnly: false,
    };

    let newOptions: FieldOptionRecord[] = [];
    if (['select', 'radio', 'checkbox'].includes(type)) {
      newOptions = [
        {
          OptionID: `OPT-${Date.now().toString().slice(-4)}-1`,
          FieldID: newField.FieldID,
          OptionLabel: 'Option 1',
          OptionValue: 'Option 1',
          DisplayOrder: 1,
          IsDefault: true,
        },
        {
          OptionID: `OPT-${Date.now().toString().slice(-4)}-2`,
          FieldID: newField.FieldID,
          OptionLabel: 'Option 2',
          OptionValue: 'Option 2',
          DisplayOrder: 2,
          IsDefault: false,
        },
      ];
    }

    setEditingField(newField);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Designer Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              FORM DESIGNER
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-mono text-slate-500">
              Code: {definition.form.FormCode}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">
              v{definition.form.Version}.0
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            {definition.form.FormName}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
            {definition.form.Description}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {saveSuccessMessage && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Saved to SQL Relational Tables!</span>
            </div>
          )}

          <button
            onClick={() => setShowDependencyModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <GitBranch className="w-3.5 h-3.5 text-indigo-600" />
            <span>Dependencies ({definition.dependencies.length})</span>
          </button>

          <button
            onClick={() => setShowValidationModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Validations ({definition.validations.length})</span>
          </button>

          <button
            onClick={onPreviewRenderer}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Form</span>
          </button>
        </div>
      </div>

      {/* 3-Column Designer Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Sections List (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Sections ({definition.sections.length})
              </h2>
              <button
                onClick={() => setShowAddSection(true)}
                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                title="Add Section"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Sections items */}
            <div className="space-y-1.5">
              {definition.sections.map((sec, idx) => {
                const fieldCount = definition.fields.filter(
                  (f) => f.SectionID === sec.SectionID
                ).length;
                const isActive = sec.SectionID === activeSectionId;

                return (
                  <div
                    key={sec.SectionID}
                    onClick={() => setActiveSectionId(sec.SectionID)}
                    className={`group p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold truncate max-w-[170px]">
                        {sec.SectionTitle}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isActive
                            ? 'bg-slate-800 text-slate-200'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {fieldCount} fields
                      </span>
                    </div>

                    {/* Section Controls */}
                    <div
                      className={`flex items-center justify-between mt-2 pt-2 border-t ${
                        isActive ? 'border-slate-800' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveSection(idx, 'up');
                          }}
                          className={`p-0.5 rounded ${
                            isActive
                              ? 'text-slate-400 hover:text-white disabled:opacity-30'
                              : 'text-slate-400 hover:text-slate-900 disabled:opacity-30'
                          }`}
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === definition.sections.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveSection(idx, 'down');
                          }}
                          className={`p-0.5 rounded ${
                            isActive
                              ? 'text-slate-400 hover:text-white disabled:opacity-30'
                              : 'text-slate-400 hover:text-slate-900 disabled:opacity-30'
                          }`}
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {definition.sections.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSection(sec.SectionID);
                          }}
                          className={`p-0.5 rounded ${
                            isActive
                              ? 'text-slate-400 hover:text-rose-400'
                              : 'text-slate-400 hover:text-rose-600'
                          }`}
                          title="Delete Section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Section Form Inline */}
            {showAddSection && (
              <form
                onSubmit={handleAddSection}
                className="mt-3 p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs space-y-2 animate-in fade-in"
              >
                <div className="font-semibold text-slate-800">New Form Section</div>
                <input
                  type="text"
                  required
                  placeholder="Section Title (e.g. 6. Environmental Clearance)"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <textarea
                  rows={2}
                  placeholder="Short description..."
                  value={newSectionDesc}
                  onChange={(e) => setNewSectionDesc(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddSection(false)}
                    className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-2 py-1 bg-slate-900 text-white rounded hover:bg-slate-800"
                  >
                    Add
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-xs space-y-2">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Relational Schema Metrics
            </h3>
            <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
              <span>Total Form Sections:</span>
              <span className="font-mono font-semibold text-slate-900">
                {definition.sections.length}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
              <span>Total Fields Configured:</span>
              <span className="font-mono font-semibold text-slate-900">
                {definition.fields.length}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
              <span>Option Records:</span>
              <span className="font-mono font-semibold text-slate-900">
                {definition.options.length}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
              <span>Conditional Logic Rules:</span>
              <span className="font-mono font-semibold text-indigo-700">
                {definition.dependencies.length}
              </span>
            </div>
            <div className="flex justify-between py-1 text-slate-600">
              <span>Validation Constraints:</span>
              <span className="font-mono font-semibold text-emerald-700">
                {definition.validations.length}
              </span>
            </div>
          </div>
        </div>

        {/* Center Column: Section Canvas & Fields (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            {/* Active Section Header */}
            <div className="border-b border-slate-200 pb-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-slate-500 font-semibold uppercase tracking-wider">
                    Editing Section {activeSection?.SectionOrder} · ID: {activeSection?.SectionID}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                    {activeSection?.SectionTitle}
                  </h2>
                </div>
                <button
                  onClick={() => setEditingField(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Field</span>
                </button>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {activeSection?.Description}
              </p>
            </div>

            {/* Field Grid Canvas */}
            {activeFields.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-500 text-xs">
                <p className="font-semibold text-slate-700 mb-1">
                  No fields in this section yet.
                </p>
                <p>Click "Add Field" or choose from the Field Palette on the right.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeFields.map((field, idx) => {
                  const fieldOptions = definition.options.filter(
                    (o) => o.FieldID === field.FieldID
                  );
                  const dependencies = definition.dependencies.filter(
                    (d) => d.TargetFieldID === field.FieldID
                  );
                  const validations = definition.validations.filter(
                    (v) => v.FieldID === field.FieldID
                  );

                  return (
                    <div
                      key={field.FieldID}
                      className="group bg-slate-50 hover:bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs p-4 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Field Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[10px] text-slate-400">
                              #{idx + 1}
                            </span>
                            <span className="font-semibold text-sm text-slate-900">
                              {field.FieldLabel}
                            </span>
                            {field.IsRequired && (
                              <span className="text-rose-600 text-xs font-bold" title="Required">
                                *
                              </span>
                            )}
                            <span className="text-[10px] font-mono font-medium uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                              {field.FieldType}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                              {field.ColumnSpan}/12 col
                            </span>
                          </div>

                          <div className="mt-1 flex items-center gap-2 text-xs font-mono text-slate-500">
                            <span>col: {field.FieldName}</span>
                            <span>·</span>
                            <span>id: {field.FieldID}</span>
                          </div>

                          {field.HelpText && (
                            <p className="text-xs text-slate-500 mt-1 italic">
                              "{field.HelpText}"
                            </p>
                          )}

                          {/* Chips for Dependencies & Validations */}
                          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                            {dependencies.length > 0 && (
                              <span className="text-[10px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <GitBranch className="w-3 h-3" />
                                <span>{dependencies.length} Conditional Rule(s)</span>
                              </span>
                            )}

                            {validations.length > 0 && (
                              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                <span>{validations.length} Validation Rule(s)</span>
                              </span>
                            )}

                            {fieldOptions.length > 0 && (
                              <span className="text-[10px] text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                                {fieldOptions.length} Options
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveField(field.FieldID, 'up')}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100"
                            title="Move Up"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === activeFields.length - 1}
                            onClick={() => handleMoveField(field.FieldID, 'down')}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100"
                            title="Move Down"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingField(field)}
                            className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100"
                            title="Edit Field Properties"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteField(field.FieldID)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                            title="Delete Field"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Field Palette & Tooling (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Quick Field Palette */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Quick Field Palette
            </h2>
            <p className="text-[11px] text-slate-500 mb-3">
              Click to insert a pre-configured field into the current section.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickAddField('text')}
                className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 transition-colors"
              >
                <Type className="w-3.5 h-3.5 text-slate-500" />
                <span>Text Input</span>
              </button>

              <button
                onClick={() => handleQuickAddField('number')}
                className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 transition-colors"
              >
                <Hash className="w-3.5 h-3.5 text-slate-500" />
                <span>Numeric</span>
              </button>

              <button
                onClick={() => handleQuickAddField('textarea')}
                className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 transition-colors"
              >
                <AlignLeft className="w-3.5 h-3.5 text-slate-500" />
                <span>Text Area</span>
              </button>

              <button
                onClick={() => handleQuickAddField('select')}
                className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 transition-colors"
              >
                <ListFilter className="w-3.5 h-3.5 text-slate-500" />
                <span>Dropdown</span>
              </button>

              <button
                onClick={() => handleQuickAddField('radio')}
                className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                <span>Radio Group</span>
              </button>

              <button
                onClick={() => handleQuickAddField('checkbox')}
                className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 transition-colors"
              >
                <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
                <span>Checkbox</span>
              </button>

              <button
                onClick={() => handleQuickAddField('date')}
                className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Date Picker</span>
              </button>

              <button
                onClick={() => handleQuickAddField('boolean')}
                className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 transition-colors"
              >
                <ToggleLeft className="w-3.5 h-3.5 text-slate-500" />
                <span>Boolean</span>
              </button>

              <button
                onClick={() => handleQuickAddField('file')}
                className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 transition-colors col-span-2"
              >
                <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                <span>Document / File Upload</span>
              </button>
            </div>
          </div>

          {/* Architecture Mapping Card */}
          <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm text-xs space-y-2.5">
            <h3 className="font-bold uppercase tracking-wider text-[11px] text-slate-300">
              Architecture Sync
            </h3>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Every modification made in this visual canvas directly updates the normalized
              relational model in memory and regenerates the T-SQL relational scripts.
            </p>
            <div className="pt-2 border-t border-slate-800 space-y-1 font-mono text-[10px] text-slate-400">
              <div>→ Forms: 1 record</div>
              <div>→ FormSections: {definition.sections.length} records</div>
              <div>→ FormFields: {definition.fields.length} records</div>
              <div>→ FieldOptions: {definition.options.length} records</div>
              <div>→ FieldDependencies: {definition.dependencies.length} records</div>
              <div>→ FormValidations: {definition.validations.length} records</div>
            </div>
          </div>
        </div>
      </div>

      {/* Field Editor Modal */}
      {editingField !== undefined && (
        <FieldEditorModal
          field={editingField}
          sectionId={activeSectionId}
          existingOptions={definition.options}
          onSave={handleSaveField}
          onClose={() => setEditingField(undefined)}
        />
      )}

      {/* Dependency Modal */}
      {showDependencyModal && (
        <DependencyModal
          formId={definition.form.FormID}
          fields={definition.fields}
          dependencies={definition.dependencies}
          onSaveDependencies={(updated) => {
            handleCommitDefinition({ ...definition, dependencies: updated });
          }}
          onClose={() => setShowDependencyModal(false)}
        />
      )}

      {/* Validation Modal */}
      {showValidationModal && (
        <ValidationModal
          fields={definition.fields}
          validations={definition.validations}
          onSaveValidations={(updated) => {
            handleCommitDefinition({ ...definition, validations: updated });
          }}
          onClose={() => setShowValidationModal(false)}
        />
      )}
    </div>
  );
};
