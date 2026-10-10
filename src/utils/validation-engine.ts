import { FormFieldRecord, FormValidationRecord } from '../types/form-schema';
import { EvaluatedFieldState } from './dependency-engine';

export interface FieldValidationError {
  fieldId: string;
  fieldName: string;
  message: string;
}

export function validateSingleField(
  field: FormFieldRecord,
  value: any,
  validations: FormValidationRecord[],
  evaluatedState?: EvaluatedFieldState
): string | null {
  // If field is hidden, skip validation
  if (evaluatedState && !evaluatedState.isVisible) {
    return null;
  }

  const isRequired = evaluatedState ? evaluatedState.isRequired : field.IsRequired;
  const strVal = value === undefined || value === null ? '' : String(value).trim();

  // Required Check
  if (isRequired) {
    if (field.FieldType === 'boolean') {
      if (value !== true && value !== 'true') {
        return `${field.FieldLabel} must be accepted.`;
      }
    } else if (strVal === '') {
      return `${field.FieldLabel} is required.`;
    }
  }

  // If value is empty and not required, pass
  if (strVal === '') {
    return null;
  }

  // Check specific validations configured for this field
  const fieldRules = validations.filter((v) => v.FieldID === field.FieldID);
  for (const rule of fieldRules) {
    switch (rule.ValidationType) {
      case 'REQUIRED':
        if (strVal === '') {
          return rule.ErrorMessage || `${field.FieldLabel} is required.`;
        }
        break;

      case 'REGEX':
        try {
          const regex = new RegExp(rule.ValidationRule);
          if (!regex.test(strVal)) {
            return rule.ErrorMessage || `Invalid format for ${field.FieldLabel}.`;
          }
        } catch {
          // ignore invalid regex configuration
        }
        break;

      case 'EMAIL': {
        const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(strVal)) {
          return rule.ErrorMessage || 'Please enter a valid email address.';
        }
        break;
      }

      case 'PHONE': {
        const phoneDigits = strVal.replace(/[^0-9]/g, '');
        if (phoneDigits.length < 7) {
          return rule.ErrorMessage || 'Please enter a valid phone number.';
        }
        break;
      }

      case 'MIN_LENGTH': {
        const min = parseInt(rule.ValidationRule, 10);
        if (!isNaN(min) && strVal.length < min) {
          return (
            rule.ErrorMessage ||
            `${field.FieldLabel} must be at least ${min} characters.`
          );
        }
        break;
      }

      case 'MAX_LENGTH': {
        const max = parseInt(rule.ValidationRule, 10);
        if (!isNaN(max) && strVal.length > max) {
          return (
            rule.ErrorMessage ||
            `${field.FieldLabel} cannot exceed ${max} characters.`
          );
        }
        break;
      }

      case 'MIN_VALUE': {
        const numVal = parseFloat(strVal);
        const minVal = parseFloat(rule.ValidationRule);
        if (!isNaN(numVal) && !isNaN(minVal) && numVal < minVal) {
          return (
            rule.ErrorMessage ||
            `${field.FieldLabel} must be at least ${minVal}.`
          );
        }
        break;
      }

      case 'MAX_VALUE': {
        const numVal = parseFloat(strVal);
        const maxVal = parseFloat(rule.ValidationRule);
        if (!isNaN(numVal) && !isNaN(maxVal) && numVal > maxVal) {
          return (
            rule.ErrorMessage ||
            `${field.FieldLabel} cannot exceed ${maxVal}.`
          );
        }
        break;
      }

      default:
        break;
    }
  }

  return null;
}

export function validateForm(
  fields: FormFieldRecord[],
  formData: Record<string, any>,
  validations: FormValidationRecord[],
  evaluatedStates: Record<string, EvaluatedFieldState>
): Record<string, string> {
  const errors: Record<string, string> = {};

  fields.forEach((field) => {
    const val = formData[field.FieldName] ?? field.DefaultValue ?? '';
    const state = evaluatedStates[field.FieldID];
    const error = validateSingleField(field, val, validations, state);
    if (error) {
      errors[field.FieldName] = error;
    }
  });

  return errors;
}
