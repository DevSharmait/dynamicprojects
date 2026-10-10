import { FormDefinition, FormSubmissionRecord } from '../types/form-schema';

export function generateSqlServerDDL(): string {
  return `-- =========================================================================
-- MICROSOFT SQL SERVER (T-SQL) DATABASE SCHEMA
-- ENTERPRISE DYNAMIC FORM ENGINE & RELATIONAL STORE
-- Tables: Forms, FormSections, FormFields, FieldOptions, FieldDependencies, FormValidations, FormSubmissions, SubmissionValues
-- =========================================================================

-- 1. Forms Master Table
CREATE TABLE [dbo].[Forms] (
    [FormID] NVARCHAR(50) NOT NULL,
    [FormCode] NVARCHAR(100) NOT NULL,
    [FormName] NVARCHAR(255) NOT NULL,
    [Description] NVARCHAR(1000) NULL,
    [Category] NVARCHAR(100) NOT NULL DEFAULT 'General',
    [Version] INT NOT NULL DEFAULT 1,
    [IsPublished] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    [UpdatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT [PK_Forms] PRIMARY KEY CLUSTERED ([FormID] ASC),
    CONSTRAINT [UQ_Forms_FormCode] UNIQUE NONCLUSTERED ([FormCode] ASC)
);
GO

-- 2. FormSections Table
CREATE TABLE [dbo].[FormSections] (
    [SectionID] NVARCHAR(50) NOT NULL,
    [FormID] NVARCHAR(50) NOT NULL,
    [SectionTitle] NVARCHAR(255) NOT NULL,
    [SectionOrder] INT NOT NULL DEFAULT 1,
    [Description] NVARCHAR(1000) NULL,
    [IconName] NVARCHAR(50) NULL,
    CONSTRAINT [PK_FormSections] PRIMARY KEY CLUSTERED ([SectionID] ASC),
    CONSTRAINT [FK_FormSections_Forms] FOREIGN KEY ([FormID]) 
        REFERENCES [dbo].[Forms] ([FormID]) ON DELETE CASCADE
);
CREATE NONCLUSTERED INDEX [IX_FormSections_FormID_Order] 
    ON [dbo].[FormSections] ([FormID] ASC, [SectionOrder] ASC);
GO

-- 3. FormFields Table
CREATE TABLE [dbo].[FormFields] (
    [FieldID] NVARCHAR(50) NOT NULL,
    [SectionID] NVARCHAR(50) NOT NULL,
    [FieldName] NVARCHAR(100) NOT NULL,
    [FieldLabel] NVARCHAR(255) NOT NULL,
    [FieldType] NVARCHAR(50) NOT NULL,
    [DisplayOrder] INT NOT NULL DEFAULT 1,
    [ColumnSpan] INT NOT NULL DEFAULT 6,
    [DefaultValue] NVARCHAR(MAX) NULL,
    [Placeholder] NVARCHAR(255) NULL,
    [HelpText] NVARCHAR(1000) NULL,
    [IsRequired] BIT NOT NULL DEFAULT 0,
    [IsReadOnly] BIT NOT NULL DEFAULT 0,
    CONSTRAINT [PK_FormFields] PRIMARY KEY CLUSTERED ([FieldID] ASC),
    CONSTRAINT [FK_FormFields_FormSections] FOREIGN KEY ([SectionID]) 
        REFERENCES [dbo].[FormSections] ([SectionID]) ON DELETE CASCADE,
    CONSTRAINT [CK_FormFields_ColumnSpan] CHECK ([ColumnSpan] IN (4, 6, 8, 12))
);
CREATE NONCLUSTERED INDEX [IX_FormFields_SectionID_Order] 
    ON [dbo].[FormFields] ([SectionID] ASC, [DisplayOrder] ASC);
GO

-- 4. FieldOptions Table
CREATE TABLE [dbo].[FieldOptions] (
    [OptionID] NVARCHAR(50) NOT NULL,
    [FieldID] NVARCHAR(50) NOT NULL,
    [OptionLabel] NVARCHAR(255) NOT NULL,
    [OptionValue] NVARCHAR(255) NOT NULL,
    [DisplayOrder] INT NOT NULL DEFAULT 1,
    [IsDefault] BIT NOT NULL DEFAULT 0,
    CONSTRAINT [PK_FieldOptions] PRIMARY KEY CLUSTERED ([OptionID] ASC),
    CONSTRAINT [FK_FieldOptions_FormFields] FOREIGN KEY ([FieldID]) 
        REFERENCES [dbo].[FormFields] ([FieldID]) ON DELETE CASCADE
);
CREATE NONCLUSTERED INDEX [IX_FieldOptions_FieldID_Order] 
    ON [dbo].[FieldOptions] ([FieldID] ASC, [DisplayOrder] ASC);
GO

-- 5. FieldDependencies Table (Conditional Logic Engine)
CREATE TABLE [dbo].[FieldDependencies] (
    [DependencyID] NVARCHAR(50) NOT NULL,
    [FormID] NVARCHAR(50) NOT NULL,
    [TargetFieldID] NVARCHAR(50) NOT NULL,
    [SourceFieldID] NVARCHAR(50) NOT NULL,
    [ConditionOperator] NVARCHAR(50) NOT NULL,
    [ConditionValue] NVARCHAR(255) NOT NULL,
    [ActionType] NVARCHAR(50) NOT NULL,
    CONSTRAINT [PK_FieldDependencies] PRIMARY KEY CLUSTERED ([DependencyID] ASC),
    CONSTRAINT [FK_FieldDependencies_Forms] FOREIGN KEY ([FormID]) 
        REFERENCES [dbo].[Forms] ([FormID]),
    CONSTRAINT [FK_FieldDependencies_TargetField] FOREIGN KEY ([TargetFieldID]) 
        REFERENCES [dbo].[FormFields] ([FieldID]),
    CONSTRAINT [FK_FieldDependencies_SourceField] FOREIGN KEY ([SourceFieldID]) 
        REFERENCES [dbo].[FormFields] ([FieldID])
);
CREATE NONCLUSTERED INDEX [IX_FieldDependencies_TargetFieldID] 
    ON [dbo].[FieldDependencies] ([TargetFieldID] ASC);
CREATE NONCLUSTERED INDEX [IX_FieldDependencies_SourceFieldID] 
    ON [dbo].[FieldDependencies] ([SourceFieldID] ASC);
GO

-- 6. FormValidations Table (Field Validation Rules)
CREATE TABLE [dbo].[FormValidations] (
    [ValidationID] NVARCHAR(50) NOT NULL,
    [FieldID] NVARCHAR(50) NOT NULL,
    [ValidationType] NVARCHAR(50) NOT NULL,
    [ValidationRule] NVARCHAR(1000) NOT NULL,
    [ErrorMessage] NVARCHAR(500) NOT NULL,
    CONSTRAINT [PK_FormValidations] PRIMARY KEY CLUSTERED ([ValidationID] ASC),
    CONSTRAINT [FK_FormValidations_FormFields] FOREIGN KEY ([FieldID]) 
        REFERENCES [dbo].[FormFields] ([FieldID]) ON DELETE CASCADE
);
CREATE NONCLUSTERED INDEX [IX_FormValidations_FieldID] 
    ON [dbo].[FormValidations] ([FieldID] ASC);
GO

-- 7. FormSubmissions Table
CREATE TABLE [dbo].[FormSubmissions] (
    [SubmissionID] NVARCHAR(50) NOT NULL,
    [FormID] NVARCHAR(50) NOT NULL,
    [ReferenceNo] NVARCHAR(100) NOT NULL,
    [SubmittedBy] NVARCHAR(255) NOT NULL,
    [SubmittedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    [Status] NVARCHAR(50) NOT NULL DEFAULT 'Submitted',
    [PayloadJson] NVARCHAR(MAX) NOT NULL,
    CONSTRAINT [PK_FormSubmissions] PRIMARY KEY CLUSTERED ([SubmissionID] ASC),
    CONSTRAINT [FK_FormSubmissions_Forms] FOREIGN KEY ([FormID]) 
        REFERENCES [dbo].[Forms] ([FormID])
);
CREATE NONCLUSTERED INDEX [IX_FormSubmissions_FormID] 
    ON [dbo].[FormSubmissions] ([FormID] ASC);
GO

-- 8. SubmissionValues Table (Normalized Field-Level Responses)
CREATE TABLE [dbo].[SubmissionValues] (
    [ValueID] NVARCHAR(50) NOT NULL,
    [SubmissionID] NVARCHAR(50) NOT NULL,
    [FieldID] NVARCHAR(50) NOT NULL,
    [FieldName] NVARCHAR(100) NOT NULL,
    [FieldValue] NVARCHAR(MAX) NULL,
    CONSTRAINT [PK_SubmissionValues] PRIMARY KEY CLUSTERED ([ValueID] ASC),
    CONSTRAINT [FK_SubmissionValues_Submission] FOREIGN KEY ([SubmissionID]) 
        REFERENCES [dbo].[FormSubmissions] ([SubmissionID]) ON DELETE CASCADE,
    CONSTRAINT [FK_SubmissionValues_Field] FOREIGN KEY ([FieldID]) 
        REFERENCES [dbo].[FormFields] ([FieldID])
);
CREATE NONCLUSTERED INDEX [IX_SubmissionValues_SubmissionID] 
    ON [dbo].[SubmissionValues] ([SubmissionID] ASC);
GO`;
}

export function generateSqlServerInserts(definition: FormDefinition): string {
  const escapeSql = (str: string | undefined | null) => {
    if (str === undefined || str === null) return 'NULL';
    return `N'${str.replace(/'/g, "''")}'`;
  };

  const lines: string[] = [];
  lines.push(`-- =========================================================================`);
  lines.push(`-- SEED DATA INSERTS FOR FORM: ${definition.form.FormCode}`);
  lines.push(`-- =========================================================================\n`);

  // Insert Form
  const f = definition.form;
  lines.push(
    `INSERT INTO [dbo].[Forms] ([FormID], [FormCode], [FormName], [Description], [Category], [Version], [IsPublished])\n` +
      `VALUES (${escapeSql(f.FormID)}, ${escapeSql(f.FormCode)}, ${escapeSql(f.FormName)}, ${escapeSql(f.Description)}, ${escapeSql(f.Category)}, ${f.Version}, ${f.IsPublished ? 1 : 0});\n`
  );

  // Insert Sections
  lines.push(`-- Insert FormSections`);
  definition.sections.forEach((s) => {
    lines.push(
      `INSERT INTO [dbo].[FormSections] ([SectionID], [FormID], [SectionTitle], [SectionOrder], [Description], [IconName])\n` +
        `VALUES (${escapeSql(s.SectionID)}, ${escapeSql(s.FormID)}, ${escapeSql(s.SectionTitle)}, ${s.SectionOrder}, ${escapeSql(s.Description)}, ${escapeSql(s.IconName)});\n`
    );
  });

  // Insert Fields
  lines.push(`-- Insert FormFields`);
  definition.fields.forEach((fld) => {
    lines.push(
      `INSERT INTO [dbo].[FormFields] ([FieldID], [SectionID], [FieldName], [FieldLabel], [FieldType], [DisplayOrder], [ColumnSpan], [DefaultValue], [Placeholder], [HelpText], [IsRequired], [IsReadOnly])\n` +
        `VALUES (${escapeSql(fld.FieldID)}, ${escapeSql(fld.SectionID)}, ${escapeSql(fld.FieldName)}, ${escapeSql(fld.FieldLabel)}, ${escapeSql(fld.FieldType)}, ${fld.DisplayOrder}, ${fld.ColumnSpan}, ${escapeSql(fld.DefaultValue)}, ${escapeSql(fld.Placeholder)}, ${escapeSql(fld.HelpText)}, ${fld.IsRequired ? 1 : 0}, ${fld.IsReadOnly ? 1 : 0});`
    );
  });
  lines.push('');

  // Insert Field Options
  if (definition.options.length > 0) {
    lines.push(`-- Insert FieldOptions`);
    definition.options.forEach((opt) => {
      lines.push(
        `INSERT INTO [dbo].[FieldOptions] ([OptionID], [FieldID], [OptionLabel], [OptionValue], [DisplayOrder], [IsDefault])\n` +
          `VALUES (${escapeSql(opt.OptionID)}, ${escapeSql(opt.FieldID)}, ${escapeSql(opt.OptionLabel)}, ${escapeSql(opt.OptionValue)}, ${opt.DisplayOrder}, ${opt.IsDefault ? 1 : 0});`
      );
    });
    lines.push('');
  }

  // Insert Field Dependencies
  if (definition.dependencies.length > 0) {
    lines.push(`-- Insert FieldDependencies`);
    definition.dependencies.forEach((dep) => {
      lines.push(
        `INSERT INTO [dbo].[FieldDependencies] ([DependencyID], [FormID], [TargetFieldID], [SourceFieldID], [ConditionOperator], [ConditionValue], [ActionType])\n` +
          `VALUES (${escapeSql(dep.DependencyID)}, ${escapeSql(dep.FormID)}, ${escapeSql(dep.TargetFieldID)}, ${escapeSql(dep.SourceFieldID)}, ${escapeSql(dep.ConditionOperator)}, ${escapeSql(dep.ConditionValue)}, ${escapeSql(dep.ActionType)});`
      );
    });
    lines.push('');
  }

  // Insert Form Validations
  if (definition.validations.length > 0) {
    lines.push(`-- Insert FormValidations`);
    definition.validations.forEach((val) => {
      lines.push(
        `INSERT INTO [dbo].[FormValidations] ([ValidationID], [FieldID], [ValidationType], [ValidationRule], [ErrorMessage])\n` +
          `VALUES (${escapeSql(val.ValidationID)}, ${escapeSql(val.FieldID)}, ${escapeSql(val.ValidationType)}, ${escapeSql(val.ValidationRule)}, ${escapeSql(val.ErrorMessage)});`
      );
    });
    lines.push('');
  }

  return lines.join('\n');
}

export interface ERDTable {
  name: string;
  columns: {
    name: string;
    type: string;
    isPk?: boolean;
    isFk?: boolean;
    fkRef?: string;
  }[];
}

export const SQL_ERD_SCHEMA: ERDTable[] = [
  {
    name: 'Forms',
    columns: [
      { name: 'FormID', type: 'NVARCHAR(50)', isPk: true },
      { name: 'FormCode', type: 'NVARCHAR(100)' },
      { name: 'FormName', type: 'NVARCHAR(255)' },
      { name: 'Description', type: 'NVARCHAR(1000)' },
      { name: 'Category', type: 'NVARCHAR(100)' },
      { name: 'Version', type: 'INT' },
      { name: 'IsPublished', type: 'BIT' },
      { name: 'CreatedAt', type: 'DATETIMEOFFSET' },
    ],
  },
  {
    name: 'FormSections',
    columns: [
      { name: 'SectionID', type: 'NVARCHAR(50)', isPk: true },
      { name: 'FormID', type: 'NVARCHAR(50)', isFk: true, fkRef: 'Forms.FormID' },
      { name: 'SectionTitle', type: 'NVARCHAR(255)' },
      { name: 'SectionOrder', type: 'INT' },
      { name: 'Description', type: 'NVARCHAR(1000)' },
      { name: 'IconName', type: 'NVARCHAR(50)' },
    ],
  },
  {
    name: 'FormFields',
    columns: [
      { name: 'FieldID', type: 'NVARCHAR(50)', isPk: true },
      { name: 'SectionID', type: 'NVARCHAR(50)', isFk: true, fkRef: 'FormSections.SectionID' },
      { name: 'FieldName', type: 'NVARCHAR(100)' },
      { name: 'FieldLabel', type: 'NVARCHAR(255)' },
      { name: 'FieldType', type: 'NVARCHAR(50)' },
      { name: 'DisplayOrder', type: 'INT' },
      { name: 'ColumnSpan', type: 'INT' },
      { name: 'DefaultValue', type: 'NVARCHAR(MAX)' },
      { name: 'IsRequired', type: 'BIT' },
    ],
  },
  {
    name: 'FieldOptions',
    columns: [
      { name: 'OptionID', type: 'NVARCHAR(50)', isPk: true },
      { name: 'FieldID', type: 'NVARCHAR(50)', isFk: true, fkRef: 'FormFields.FieldID' },
      { name: 'OptionLabel', type: 'NVARCHAR(255)' },
      { name: 'OptionValue', type: 'NVARCHAR(255)' },
      { name: 'DisplayOrder', type: 'INT' },
      { name: 'IsDefault', type: 'BIT' },
    ],
  },
  {
    name: 'FieldDependencies',
    columns: [
      { name: 'DependencyID', type: 'NVARCHAR(50)', isPk: true },
      { name: 'FormID', type: 'NVARCHAR(50)', isFk: true, fkRef: 'Forms.FormID' },
      { name: 'TargetFieldID', type: 'NVARCHAR(50)', isFk: true, fkRef: 'FormFields.FieldID' },
      { name: 'SourceFieldID', type: 'NVARCHAR(50)', isFk: true, fkRef: 'FormFields.FieldID' },
      { name: 'ConditionOperator', type: 'NVARCHAR(50)' },
      { name: 'ConditionValue', type: 'NVARCHAR(255)' },
      { name: 'ActionType', type: 'NVARCHAR(50)' },
    ],
  },
  {
    name: 'FormValidations',
    columns: [
      { name: 'ValidationID', type: 'NVARCHAR(50)', isPk: true },
      { name: 'FieldID', type: 'NVARCHAR(50)', isFk: true, fkRef: 'FormFields.FieldID' },
      { name: 'ValidationType', type: 'NVARCHAR(50)' },
      { name: 'ValidationRule', type: 'NVARCHAR(1000)' },
      { name: 'ErrorMessage', type: 'NVARCHAR(500)' },
    ],
  },
  {
    name: 'FormSubmissions',
    columns: [
      { name: 'SubmissionID', type: 'NVARCHAR(50)', isPk: true },
      { name: 'FormID', type: 'NVARCHAR(50)', isFk: true, fkRef: 'Forms.FormID' },
      { name: 'ReferenceNo', type: 'NVARCHAR(100)' },
      { name: 'SubmittedBy', type: 'NVARCHAR(255)' },
      { name: 'SubmittedAt', type: 'DATETIMEOFFSET' },
      { name: 'Status', type: 'NVARCHAR(50)' },
      { name: 'PayloadJson', type: 'NVARCHAR(MAX)' },
    ],
  },
  {
    name: 'SubmissionValues',
    columns: [
      { name: 'ValueID', type: 'NVARCHAR(50)', isPk: true },
      { name: 'SubmissionID', type: 'NVARCHAR(50)', isFk: true, fkRef: 'FormSubmissions.SubmissionID' },
      { name: 'FieldID', type: 'NVARCHAR(50)', isFk: true, fkRef: 'FormFields.FieldID' },
      { name: 'FieldName', type: 'NVARCHAR(100)' },
      { name: 'FieldValue', type: 'NVARCHAR(MAX)' },
    ],
  },
];
