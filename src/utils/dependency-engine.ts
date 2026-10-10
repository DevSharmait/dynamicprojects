import {
  FieldDependencyRecord,
  FormFieldRecord,
} from '../types/form-schema';

export interface EvaluatedFieldState {
  isVisible: boolean;
  isEnabled: boolean;
  isRequired: boolean;
}

export function evaluateCondition(
  sourceValue: any,
  operator: string,
  targetValue: string
): boolean {
  const strSource = sourceValue === undefined || sourceValue === null ? '' : String(sourceValue).trim();
  const strTarget = (targetValue || '').trim();

  switch (operator) {
    case 'EQUALS':
      return strSource.toLowerCase() === strTarget.toLowerCase();

    case 'NOT_EQUALS':
      return strSource.toLowerCase() !== strTarget.toLowerCase();

    case 'CONTAINS':
      return strSource.toLowerCase().includes(strTarget.toLowerCase());

    case 'IN': {
      const allowed = strTarget.split(',').map((s) => s.trim().toLowerCase());
      return allowed.includes(strSource.toLowerCase());
    }

    case 'GREATER_THAN': {
      const numSource = parseFloat(strSource);
      const numTarget = parseFloat(strTarget);
      return !isNaN(numSource) && !isNaN(numTarget) && numSource > numTarget;
    }

    case 'LESS_THAN': {
      const numSource = parseFloat(strSource);
      const numTarget = parseFloat(strTarget);
      return !isNaN(numSource) && !isNaN(numTarget) && numSource < numTarget;
    }

    case 'IS_EMPTY':
      return strSource === '' || strSource === 'false';

    case 'IS_NOT_EMPTY':
      return strSource !== '' && strSource !== 'false';

    default:
      return false;
  }
}

export function evaluateAllDependencies(
  fields: FormFieldRecord[],
  dependencies: FieldDependencyRecord[],
  formData: Record<string, any>
): Record<string, EvaluatedFieldState> {
  // Map field code / name to ID and vice versa for easy lookup
  const fieldById = new Map<string, FormFieldRecord>();
  const fieldByName = new Map<string, FormFieldRecord>();

  fields.forEach((f) => {
    fieldById.set(f.FieldID, f);
    fieldByName.set(f.FieldName, f);
  });

  // Default state for each field
  const stateMap: Record<string, EvaluatedFieldState> = {};
  fields.forEach((f) => {
    stateMap[f.FieldID] = {
      isVisible: true,
      isEnabled: !f.IsReadOnly,
      isRequired: f.IsRequired,
    };
  });

  // Check if any rule targets this field
  // Group dependencies by target field
  const depsByTarget = new Map<string, FieldDependencyRecord[]>();
  dependencies.forEach((d) => {
    const list = depsByTarget.get(d.TargetFieldID) || [];
    list.push(d);
    depsByTarget.set(d.TargetFieldID, list);
  });

  depsByTarget.forEach((rules, targetId) => {
    const targetField = fieldById.get(targetId);
    if (!targetField) return;

    let isVisible = true;
    let isEnabled = !targetField.IsReadOnly;
    let isRequired = targetField.IsRequired;

    // If there is any 'SHOW' dependency on this field, default visibility becomes false unless condition is met
    const showRules = rules.filter((r) => r.ActionType === 'SHOW');
    if (showRules.length > 0) {
      // Any matching SHOW rule triggers visibility
      const anyShowSatisfied = showRules.some((rule) => {
        const sourceField = fieldById.get(rule.SourceFieldID);
        if (!sourceField) return false;
        const sourceVal = formData[sourceField.FieldName] ?? sourceField.DefaultValue ?? '';
        return evaluateCondition(sourceVal, rule.ConditionOperator, rule.ConditionValue);
      });
      isVisible = anyShowSatisfied;
    }

    const hideRules = rules.filter((r) => r.ActionType === 'HIDE');
    if (hideRules.length > 0) {
      const anyHideSatisfied = hideRules.some((rule) => {
        const sourceField = fieldById.get(rule.SourceFieldID);
        if (!sourceField) return false;
        const sourceVal = formData[sourceField.FieldName] ?? sourceField.DefaultValue ?? '';
        return evaluateCondition(sourceVal, rule.ConditionOperator, rule.ConditionValue);
      });
      if (anyHideSatisfied) isVisible = false;
    }

    const enableRules = rules.filter((r) => r.ActionType === 'ENABLE');
    if (enableRules.length > 0) {
      const anyEnableSatisfied = enableRules.some((rule) => {
        const sourceField = fieldById.get(rule.SourceFieldID);
        if (!sourceField) return false;
        const sourceVal = formData[sourceField.FieldName] ?? sourceField.DefaultValue ?? '';
        return evaluateCondition(sourceVal, rule.ConditionOperator, rule.ConditionValue);
      });
      isEnabled = anyEnableSatisfied;
    }

    const disableRules = rules.filter((r) => r.ActionType === 'DISABLE');
    if (disableRules.length > 0) {
      const anyDisableSatisfied = disableRules.some((rule) => {
        const sourceField = fieldById.get(rule.SourceFieldID);
        if (!sourceField) return false;
        const sourceVal = formData[sourceField.FieldName] ?? sourceField.DefaultValue ?? '';
        return evaluateCondition(sourceVal, rule.ConditionOperator, rule.ConditionValue);
      });
      if (anyDisableSatisfied) isEnabled = false;
    }

    const requireRules = rules.filter((r) => r.ActionType === 'REQUIRE');
    if (requireRules.length > 0) {
      const anyRequireSatisfied = requireRules.some((rule) => {
        const sourceField = fieldById.get(rule.SourceFieldID);
        if (!sourceField) return false;
        const sourceVal = formData[sourceField.FieldName] ?? sourceField.DefaultValue ?? '';
        return evaluateCondition(sourceVal, rule.ConditionOperator, rule.ConditionValue);
      });
      if (anyRequireSatisfied) isRequired = true;
    }

    stateMap[targetId] = {
      isVisible,
      isEnabled,
      isRequired,
    };
  });

  return stateMap;
}
