export type FieldType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'email'
  | 'phone'
  | 'boolean'
  | 'file';

export type ConditionOperator =
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'CONTAINS'
  | 'IN'
  | 'GREATER_THAN'
  | 'LESS_THAN'
  | 'IS_EMPTY'
  | 'IS_NOT_EMPTY';

export type DependencyAction =
  | 'SHOW'
  | 'HIDE'
  | 'ENABLE'
  | 'DISABLE'
  | 'REQUIRE';

export type ValidationType =
  | 'REQUIRED'
  | 'REGEX'
  | 'MIN_LENGTH'
  | 'MAX_LENGTH'
  | 'MIN_VALUE'
  | 'MAX_VALUE'
  | 'EMAIL'
  | 'PHONE';

// Relational DB: Forms Table
export interface FormRecord {
  FormID: string;
  FormCode: string;
  FormName: string;
  Description: string;
  Category: string;
  Version: number;
  IsPublished: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

// Relational DB: FormSections Table
export interface FormSectionRecord {
  SectionID: string;
  FormID: string;
  SectionTitle: string;
  SectionOrder: number;
  Description: string;
  IconName?: string;
}

// Relational DB: FormFields Table
export interface FormFieldRecord {
  FieldID: string;
  SectionID: string;
  FieldName: string; // Database column name (e.g. "OccupierPanNumber")
  FieldLabel: string; // User-facing label
  FieldType: FieldType;
  DisplayOrder: number;
  ColumnSpan: 4 | 6 | 8 | 12; // Grid width (out of 12)
  DefaultValue?: string;
  Placeholder?: string;
  HelpText?: string;
  IsRequired: boolean;
  IsReadOnly: boolean;
}

// Relational DB: FieldOptions Table
export interface FieldOptionRecord {
  OptionID: string;
  FieldID: string;
  OptionLabel: string;
  OptionValue: string;
  DisplayOrder: number;
  IsDefault: boolean;
}

// Relational DB: FieldDependencies Table
export interface FieldDependencyRecord {
  DependencyID: string;
  FormID: string;
  TargetFieldID: string; // Field impacted by rule
  SourceFieldID: string; // Field that triggers rule
  ConditionOperator: ConditionOperator;
  ConditionValue: string; // Value to compare
  ActionType: DependencyAction;
}

// Relational DB: FormValidations Table
export interface FormValidationRecord {
  ValidationID: string;
  FieldID: string;
  ValidationType: ValidationType;
  ValidationRule: string; // regex pattern or numeric threshold
  ErrorMessage: string;
}

// Relational DB: FormSubmissions Table
export interface FormSubmissionRecord {
  SubmissionID: string;
  FormID: string;
  ReferenceNo: string;
  SubmittedBy: string;
  SubmittedAt: string;
  Status: 'Draft' | 'Submitted' | 'Approved' | 'Flagged';
  PayloadJson: Record<string, any>;
}

// Relational DB: SubmissionValues Table (EAV normalized)
export interface SubmissionValueRecord {
  ValueID: string;
  SubmissionID: string;
  FieldID: string;
  FieldName: string;
  FieldValue: string;
}

// Full Composite Form Definition (Used by API & DynamicFormRenderer)
export interface FormDefinition {
  form: FormRecord;
  sections: FormSectionRecord[];
  fields: FormFieldRecord[];
  options: FieldOptionRecord[];
  dependencies: FieldDependencyRecord[];
  validations: FormValidationRecord[];
}
