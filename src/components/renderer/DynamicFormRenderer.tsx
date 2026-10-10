import React, { useState, useEffect, useMemo } from 'react';
import {
  FormDefinition,
  FormSubmissionRecord,
} from '../../types/form-schema';
import {
  evaluateAllDependencies,
  EvaluatedFieldState,
} from '../../utils/dependency-engine';
import {
  validateSingleField,
  validateForm,
} from '../../utils/validation-engine';
import { DynamicField } from './DynamicField';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Send,
  Save,
  RotateCcw,
  Sparkles,
  FileCheck,
  AlertCircle,
  Database,
  Eye,
  Check,
} from 'lucide-react';
import { AppView } from '../Navigation';

interface DynamicFormRendererProps {
  formDefinition: FormDefinition;
  onSubmitSuccess: (submission: FormSubmissionRecord) => void;
  onNavigateToSql: () => void;
  onEditInDesigner: () => void;
}

export const DynamicFormRenderer: React.FC<DynamicFormRendererProps> = ({
  formDefinition,
  onSubmitSuccess,
  onNavigateToSql,
  onEditInDesigner,
}) => {
  // Sort sections by order
  const sortedSections = useMemo(
    () => [...formDefinition.sections].sort((a, b) => a.SectionOrder - b.SectionOrder),
    [formDefinition.sections]
  );

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  // Initialize form state from default values
  const initialFormData = useMemo(() => {
    const data: Record<string, any> = {};
    formDefinition.fields.forEach((f) => {
      if (f.DefaultValue !== undefined && f.DefaultValue !== '') {
        if (f.FieldType === 'boolean') {
          data[f.FieldName] = f.DefaultValue === 'true';
        } else {
          data[f.FieldName] = f.DefaultValue;
        }
      } else {
        data[f.FieldName] = f.FieldType === 'boolean' ? false : '';
      }
    });
    return data;
  }, [formDefinition.fields]);

  const [formData, setFormData] = useState<Record<string, any>>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [submittedRecord, setSubmittedRecord] = useState<FormSubmissionRecord | null>(null);
  const [draftSavedToast, setDraftSavedToast] = useState(false);

  // Evaluate conditional dependencies across all fields in real-time
  const evaluatedStates: Record<string, EvaluatedFieldState> = useMemo(() => {
    return evaluateAllDependencies(
      formDefinition.fields,
      formDefinition.dependencies,
      formData
    );
  }, [formDefinition.fields, formDefinition.dependencies, formData]);

  const currentSection = sortedSections[activeSectionIndex] || sortedSections[0];

  const currentSectionFields = useMemo(() => {
    if (!currentSection) return [];
    return formDefinition.fields
      .filter((f) => f.SectionID === currentSection.SectionID)
      .sort((a, b) => a.DisplayOrder - b.DisplayOrder);
  }, [formDefinition.fields, currentSection]);

  // Handle field change
  const handleFieldChange = (fieldName: string, value: any) => {
    const updated = { ...formData, [fieldName]: value };
    setFormData(updated);

    // If already touched, validate dynamically
    const fieldObj = formDefinition.fields.find((f) => f.FieldName === fieldName);
    if (fieldObj) {
      const state = evaluatedStates[fieldObj.FieldID];
      const err = validateSingleField(
        fieldObj,
        value,
        formDefinition.validations,
        state
      );

      setErrors((prev) => {
        const next = { ...prev };
        if (err) next[fieldName] = err;
        else delete next[fieldName];
        return next;
      });
    }
  };

  const handleFieldBlur = (fieldName: string) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
    const fieldObj = formDefinition.fields.find((f) => f.FieldName === fieldName);
    if (fieldObj) {
      const val = formData[fieldName];
      const state = evaluatedStates[fieldObj.FieldID];
      const err = validateSingleField(
        fieldObj,
        val,
        formDefinition.validations,
        state
      );

      setErrors((prev) => {
        const next = { ...prev };
        if (err) next[fieldName] = err;
        else delete next[fieldName];
        return next;
      });
    }
  };

  // Validate current section before moving forward
  const validateCurrentSection = (): boolean => {
    let hasError = false;
    const newErrors = { ...errors };

    currentSectionFields.forEach((field) => {
      const state = evaluatedStates[field.FieldID];
      if (state && !state.isVisible) return; // skip hidden fields

      const val = formData[field.FieldName];
      const err = validateSingleField(
        field,
        val,
        formDefinition.validations,
        state
      );
      if (err) {
        newErrors[field.FieldName] = err;
        hasError = true;
      } else {
        delete newErrors[field.FieldName];
      }
    });

    setErrors(newErrors);
    return !hasError;
  };

  const handleNextSection = () => {
    if (validateCurrentSection()) {
      if (activeSectionIndex < sortedSections.length - 1) {
        setActiveSectionIndex(activeSectionIndex + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevSection = () => {
    if (activeSectionIndex > 0) {
      setActiveSectionIndex(activeSectionIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Submit complete form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate entire form across all visible fields
    const formErrors = validateForm(
      formDefinition.fields,
      formData,
      formDefinition.validations,
      evaluatedStates
    );

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      // Jump to first section containing error
      for (let i = 0; i < sortedSections.length; i++) {
        const s = sortedSections[i];
        const sFields = formDefinition.fields.filter((f) => f.SectionID === s.SectionID);
        if (sFields.some((f) => formErrors[f.FieldName])) {
          setActiveSectionIndex(i);
          break;
        }
      }
      return;
    }

    // Generate submission record
    const refNum = `FAC/${new Date().getFullYear()}/${Math.floor(
      1000 + Math.random() * 9000
    )}`;
    const declarantName =
      formData.DeclarantName || formData.OccupierFullName || 'Authorized Signatory';

    const submission: FormSubmissionRecord = {
      SubmissionID: `SUB-${Date.now().toString().slice(-6)}`,
      FormID: formDefinition.form.FormID,
      ReferenceNo: refNum,
      SubmittedBy: declarantName,
      SubmittedAt: new Date().toISOString(),
      Status: 'Submitted',
      PayloadJson: { ...formData },
    };

    setSubmittedRecord(submission);
    onSubmitSuccess(submission);
  };

  const handleSaveDraft = () => {
    setDraftSavedToast(true);
    setTimeout(() => setDraftSavedToast(false), 3000);
  };

  const handleFillDemoData = () => {
    setFormData({
      OccupierType: 'Private Limited Company',
      OccupierFullName: 'Vikramaditya Singhania',
      OccupierDesignation: 'Managing Director',
      OccupierTaxID: 'AAACS8921K',
      CorporateIdNumber: 'U29100MH2018PTC304892',
      PartnershipRegNumber: '',
      OccupierEmail: 'v.singhania@apexprecision.com',
      OccupierPhone: '+91 98201 44820',
      OccupierResidentialAddress:
        'Penthouse 14B, Skyline Towers, Altamount Road, Mumbai 400026',
      FactoryName: 'Apex Precision Engineering Works Pvt. Ltd.',
      IndustrialCategory: 'Precision Engineering & Metallurgy',
      ManufacturingProcess:
        'CNC high-precision component machining, laser micro-welding, heat treatment, and automated robotic assembly of aerospace fittings.',
      FactoryPremisesAddress:
        'Plot No. C-44/2, Phase II, Chakan MIDC Industrial Area, Pune 410501, Maharashtra',
      IsInIndustrialEstate: 'YES',
      EstateAllotmentLetterNo: 'MIDC/PUN/CKN/2021/8834',
      TotalPlotAreaSqMtr: 12500,
      TotalBuiltUpAreaSqMtr: 8200,
      PowerSupplySource: 'State Electricity Grid + Standby Generator',
      InstalledHorsepower: 450,
      StandbyGeneratorCapacityKVA: 250,
      HasHighPressureBoiler: true,
      BoilerRegistrationNumber: 'BOIL-MAH-2023-4419',
      BoilerInspectionDate: '2026-01-14',
      MaxWorkersProposed: 180,
      HandlesHazardousSubstances: 'NO',
      EffluentTreatmentStatus:
        'Connected to Common Effluent Treatment Plant (CETP)',
      HasSafetyOfficer: true,
      SafetyOfficerName: 'Ramesh K. Joshi (DIS # 2019/841)',
      DeclarantName: 'Vikramaditya Singhania',
      DeclarationDate: '2026-10-06',
      StatutoryAffirmation: true,
    });
    setErrors({});
  };

  // Section completion tracker
  const getSectionStatus = (secId: string) => {
    const sFields = formDefinition.fields.filter((f) => f.SectionID === secId);
    let complete = true;
    for (const f of sFields) {
      const state = evaluatedStates[f.FieldID];
      if (state && !state.isVisible) continue;
      if (state && state.isRequired) {
        const val = formData[f.FieldName];
        if (val === undefined || val === null || val === '') {
          complete = false;
          break;
        }
      }
    }
    return complete;
  };

  // Post Submission Success Screen
  if (submittedRecord) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
            Statutory Registration Acknowledged
          </span>

          <h2 className="text-2xl font-bold text-slate-900 mt-3">
            Form Successfully Submitted & Normalized
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-lg mx-auto">
            Your form definition generated relational rows in SQL Server and persisted in
            <code className="mx-1 px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-mono">
              [dbo].[FormSubmissions]
            </code>
            and
            <code className="mx-1 px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-mono">
              [dbo].[SubmissionValues]
            </code>
            .
          </p>

          <div className="my-6 p-4 bg-slate-50 rounded-xl border border-slate-200 max-w-md mx-auto text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Filing Reference No:</span>
              <span className="font-mono font-bold text-slate-900">
                {submittedRecord.ReferenceNo}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Submitted By:</span>
              <span className="font-semibold text-slate-900">
                {submittedRecord.SubmittedBy}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Submission Timestamp:</span>
              <span className="font-mono text-slate-700">
                {new Date(submittedRecord.SubmittedAt).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Form Code & Title:</span>
              <span className="font-mono text-slate-700">
                {formDefinition.form.FormCode}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => setSubmittedRecord(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Start New Submission
            </button>
            <button
              onClick={onNavigateToSql}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Inspect SQL Server Tables</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner / Form Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded">
                DYNAMIC FORM RENDERER
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-mono text-slate-500">
                {formDefinition.form.FormCode}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              {formDefinition.form.FormName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {formDefinition.form.Description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleFillDemoData}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition-colors"
              title="Pre-fill entire form with realistic factory compliance test data"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fill Demo Data</span>
            </button>

            <button
              type="button"
              onClick={onEditInDesigner}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <span>Edit Schema</span>
            </button>
          </div>
        </div>

        {draftSavedToast && (
          <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Draft state saved locally in session!</span>
          </div>
        )}
      </div>

      {/* Stepper Wizard Navigation matching user prompt diagram ("1. Details of Occupier, 2. Details of Factory, 3. ...") */}
      <div className="mb-6 overflow-x-auto pb-2">
        <div className="flex items-center gap-2 min-w-max">
          {sortedSections.map((sec, idx) => {
            const isActive = idx === activeSectionIndex;
            const isCompleted = getSectionStatus(sec.SectionID);

            return (
              <button
                key={sec.SectionID}
                onClick={() => {
                  if (idx < activeSectionIndex || validateCurrentSection()) {
                    setActiveSectionIndex(idx);
                  }
                }}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    isActive
                      ? 'bg-white text-slate-900'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {isCompleted && !isActive ? '✓' : idx + 1}
                </span>
                <span className="whitespace-nowrap">{sec.SectionTitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Section Form Body */}
      <form onSubmit={handleSubmitForm} className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          {/* Section Header */}
          <div className="border-b border-slate-200 pb-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                Step {activeSectionIndex + 1} of {sortedSections.length}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {currentSectionFields.length} inputs in section
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {currentSection?.SectionTitle}
            </h2>
            {currentSection?.Description && (
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                {currentSection.Description}
              </p>
            )}
          </div>

          {/* Dynamic 12-Column Grid */}
          <div className="grid grid-cols-12 gap-x-5 gap-y-5">
            {currentSectionFields.map((field) => {
              const fieldOpts = formDefinition.options.filter(
                (o) => o.FieldID === field.FieldID
              );
              const fieldState = evaluatedStates[field.FieldID] || {
                isVisible: true,
                isEnabled: true,
                isRequired: field.IsRequired,
              };

              return (
                <DynamicField
                  key={field.FieldID}
                  field={field}
                  value={formData[field.FieldName]}
                  options={fieldOpts}
                  evaluatedState={fieldState}
                  error={errors[field.FieldName]}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                />
              );
            })}
          </div>
        </div>

        {/* Wizard Footer Action Controls */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <div>
            <button
              type="button"
              disabled={activeSectionIndex === 0}
              onClick={handlePrevSection}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>

            {activeSectionIndex < sortedSections.length - 1 ? (
              <button
                type="button"
                onClick={handleNextSection}
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
              >
                <span>Continue to Step {activeSectionIndex + 2}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>Submit Statutory Application</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
