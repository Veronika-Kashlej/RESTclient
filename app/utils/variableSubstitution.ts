import type { Variable } from '../types/interfaces';

export function substituteVariables(text: string, variables: Variable[]): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  const variableMap = new Map<string, string>();
  variables.forEach((variable) => {
    variableMap.set(variable.key, variable.value);
  });

  return text.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
    const trimmedVarName = varName.trim();
    const value = variableMap.get(trimmedVarName);

    if (value !== undefined) {
      return value;
    }

    console.warn(`Variable "${trimmedVarName}" not found in localStorage`);
    return match;
  });
}

export function substituteVariablesInHeaders(
  headers: Record<string, string>,
  variables: Variable[]
): Record<string, string> {
  const result: Record<string, string> = {};

  Object.entries(headers).forEach(([key, value]) => {
    result[key] = substituteVariables(value, variables);
  });

  return result;
}

export function substituteVariablesInJson(jsonString: string, variables: Variable[]): string {
  try {
    const parsed = JSON.parse(jsonString);
    const substituted = substituteVariablesInObject(parsed, variables);
    return JSON.stringify(substituted);
  } catch (error) {
    console.warn('Invalid JSON, treating as plain text:', error);
    return substituteVariables(jsonString, variables);
  }
}

function substituteVariablesInObject(obj: unknown, variables: Variable[]): unknown {
  if (typeof obj === 'string') {
    return substituteVariables(obj, variables);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => substituteVariablesInObject(item, variables));
  }

  if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    Object.keys(obj).forEach((key) => {
      result[key] = substituteVariablesInObject((obj as Record<string, unknown>)[key], variables);
    });
    return result;
  }

  return obj;
}

export function hasVariables(text: string): boolean {
  return /\{\{[^}]+\}\}/.test(text);
}

export function getUsedVariables(text: string): string[] {
  const matches = text.match(/\{\{([^}]+)\}\}/g);
  if (!matches) return [];

  return matches.map((match) => match.replace(/\{\{|\}\}/g, '').trim());
}
