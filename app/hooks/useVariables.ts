import { useState, useEffect, useCallback } from 'react';
import type { Variable, VariableFormData, VariablesState } from '../types/interfaces';

const STORAGE_KEY = 'rest-client-variables';

export function useVariables() {
  const [state, setState] = useState<VariablesState>({
    variables: [],
    loading: true,
    error: null,
  });

  const loadVariables = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const variables = JSON.parse(stored).map(
          (
            v: Omit<Variable, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string }
          ) => ({
            ...v,
            createdAt: new Date(v.createdAt),
            updatedAt: new Date(v.updatedAt),
          })
        );
        setState((prev) => ({ ...prev, variables, loading: false }));
      } else {
        setState((prev) => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error loading variables:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to load variables',
        loading: false,
      }));
    }
  }, []);

  const saveVariables = useCallback((variables: Variable[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(variables));
    } catch (error) {
      console.error('Error saving variables:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to save variables',
      }));
    }
  }, []);

  const addVariable = useCallback(
    (formData: VariableFormData) => {
      const newVariable: Variable = {
        id: crypto.randomUUID(),
        key: formData.key.trim(),
        value: formData.value.trim(),
        description: formData.description?.trim() || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setState((prev) => {
        const keyExists = prev.variables.some((v) => v.key === newVariable.key);
        if (keyExists) {
          return { ...prev, error: 'Variable with this key already exists' };
        }

        const updatedVariables = [...prev.variables, newVariable];
        saveVariables(updatedVariables);
        return { ...prev, variables: updatedVariables, error: null };
      });
    },
    [saveVariables]
  );

  const updateVariable = useCallback(
    (id: string, formData: VariableFormData) => {
      setState((prev) => {
        const updatedVariables = prev.variables.map((variable) => {
          if (variable.id === id) {
            const keyExists = prev.variables.some(
              (v) => v.key === formData.key.trim() && v.id !== id
            );
            if (keyExists) {
              return variable;
            }

            return {
              ...variable,
              key: formData.key.trim(),
              value: formData.value.trim(),
              description: formData.description?.trim() || '',
              updatedAt: new Date(),
            };
          }
          return variable;
        });

        const wasUpdated = updatedVariables.some(
          (v) =>
            v.id === id &&
            v.updatedAt > (prev.variables.find((v) => v.id === id)?.updatedAt ?? new Date(0))
        );
        if (!wasUpdated) {
          return { ...prev, error: 'Variable with this key already exists' };
        }

        saveVariables(updatedVariables);
        return { ...prev, variables: updatedVariables, error: null };
      });
    },
    [saveVariables]
  );

  const deleteVariable = useCallback(
    (id: string) => {
      setState((prev) => {
        const updatedVariables = prev.variables.filter((v) => v.id !== id);
        saveVariables(updatedVariables);
        return { ...prev, variables: updatedVariables, error: null };
      });
    },
    [saveVariables]
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    loadVariables();
  }, [loadVariables]);

  return {
    ...state,
    addVariable,
    updateVariable,
    deleteVariable,
    clearError,
    reloadVariables: loadVariables,
  };
}
