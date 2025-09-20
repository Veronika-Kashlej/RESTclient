import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useVariables } from '../hooks/useVariables';
import type { Variable, VariableFormData } from '../types/interfaces';

const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9)),
  },
});

const mockVariable: Variable = {
  id: 'test-id-1',
  key: 'API_URL',
  value: 'https://api.example.com',
  description: 'API base URL',
  createdAt: new Date('2023-01-01T00:00:00Z'),
  updatedAt: new Date('2023-01-01T00:00:00Z'),
};

const mockStoredVariables = [
  {
    ...mockVariable,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
];

describe('useVariables', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Loading', () => {
    it('initializes with loading state', async () => {
      const { result } = renderHook(() => useVariables());

      expect(result.current.variables).toEqual([]);
      expect(result.current.error).toBeNull();

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.loading).toBe(false);
    });

    it('loads variables from localStorage on mount', async () => {
      localStorageMock.setItem('rest-client-variables', JSON.stringify(mockStoredVariables));

      const { result } = renderHook(() => useVariables());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.variables).toHaveLength(1);
      expect(result.current.variables[0]).toEqual({
        ...mockVariable,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('handles empty localStorage', async () => {
      const { result } = renderHook(() => useVariables());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.variables).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('handles localStorage parsing errors', async () => {
      localStorageMock.setItem('rest-client-variables', 'invalid-json');

      const { result } = renderHook(() => useVariables());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.variables).toEqual([]);
      expect(result.current.error).toBe('Failed to load variables');
      expect(console.error).toHaveBeenCalled();
    });

    it('converts stored date strings to Date objects', async () => {
      localStorageMock.setItem('rest-client-variables', JSON.stringify(mockStoredVariables));

      const { result } = renderHook(() => useVariables());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const variable = result.current.variables[0];
      expect(variable.createdAt).toBeInstanceOf(Date);
      expect(variable.updatedAt).toBeInstanceOf(Date);
      expect(variable.createdAt.toISOString()).toBe('2023-01-01T00:00:00.000Z');
    });
  });

  describe('addVariable', () => {
    it('adds a new variable successfully', async () => {
      const { result } = renderHook(() => useVariables());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const newVariableData: VariableFormData = {
        key: 'NEW_VAR',
        value: 'new_value',
        description: 'New variable',
      };

      await act(async () => {
        result.current.addVariable(newVariableData);
      });

      expect(result.current.variables).toHaveLength(1);
      expect(result.current.variables[0]).toEqual({
        id: expect.any(String),
        key: 'NEW_VAR',
        value: 'new_value',
        description: 'New variable',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(result.current.error).toBeNull();
    });

    it('trims whitespace from form data', async () => {
      const { result } = renderHook(() => useVariables());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const newVariableData: VariableFormData = {
        key: '  TRIMMED_KEY  ',
        value: '  trimmed_value  ',
        description: '  trimmed description  ',
      };

      await act(async () => {
        result.current.addVariable(newVariableData);
      });

      const variable = result.current.variables[0];
      expect(variable.key).toBe('TRIMMED_KEY');
      expect(variable.value).toBe('trimmed_value');
      expect(variable.description).toBe('trimmed description');
    });

    it('handles empty description', async () => {
      const { result } = renderHook(() => useVariables());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const newVariableData: VariableFormData = {
        key: 'KEY_NO_DESC',
        value: 'value',
        description: '',
      };

      await act(async () => {
        result.current.addVariable(newVariableData);
      });

      expect(result.current.variables[0].description).toBe('');
    });

    it('handles undefined description', async () => {
      const { result } = renderHook(() => useVariables());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const newVariableData: VariableFormData = {
        key: 'KEY_NO_DESC',
        value: 'value',
      };

      await act(async () => {
        result.current.addVariable(newVariableData);
      });

      expect(result.current.variables[0].description).toBe('');
    });

    it('prevents adding duplicate keys', async () => {
      localStorageMock.setItem('rest-client-variables', JSON.stringify(mockStoredVariables));
      const { result } = renderHook(() => useVariables());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const duplicateVariableData: VariableFormData = {
        key: 'API_URL',
        value: 'different_value',
        description: 'Different description',
      };

      await act(async () => {
        result.current.addVariable(duplicateVariableData);
      });

      expect(result.current.variables).toHaveLength(1);
      expect(result.current.error).toBe('Variable with this key already exists');
    });

    it('saves variables to localStorage', async () => {
      const { result } = renderHook(() => useVariables());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const newVariableData: VariableFormData = {
        key: 'TEST_KEY',
        value: 'test_value',
        description: 'Test variable',
      };

      await act(async () => {
        result.current.addVariable(newVariableData);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'rest-client-variables',
        expect.any(String)
      );
    });
  });

  describe('updateVariable', () => {
    beforeEach(async () => {
      localStorageMock.setItem('rest-client-variables', JSON.stringify(mockStoredVariables));
    });

    it('updates an existing variable successfully', async () => {
      const { result } = renderHook(() => useVariables());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const updateData: VariableFormData = {
        key: 'UPDATED_API_URL',
        value: 'https://updated-api.example.com',
        description: 'Updated API URL',
      };

      await act(async () => {
        result.current.updateVariable('test-id-1', updateData);
      });

      expect(result.current.variables).toHaveLength(1);
      const updatedVariable = result.current.variables[0];
      expect(updatedVariable.key).toBe('UPDATED_API_URL');
      expect(updatedVariable.value).toBe('https://updated-api.example.com');
      expect(updatedVariable.description).toBe('Updated API URL');
      expect(updatedVariable.updatedAt).not.toEqual(mockVariable.updatedAt);
      expect(result.current.error).toBeNull();
    });

    it('trims whitespace from update data', async () => {
      const { result } = renderHook(() => useVariables());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const updateData: VariableFormData = {
        key: '  TRIMMED_UPDATE  ',
        value: '  trimmed_update_value  ',
        description: '  trimmed update description  ',
      };

      await act(async () => {
        result.current.updateVariable('test-id-1', updateData);
      });

      const variable = result.current.variables[0];
      expect(variable.key).toBe('TRIMMED_UPDATE');
      expect(variable.value).toBe('trimmed_update_value');
      expect(variable.description).toBe('trimmed update description');
    });

    it('prevents updating to duplicate key', async () => {
      const variables = [
        ...mockStoredVariables,
        {
          id: 'test-id-2',
          key: 'ANOTHER_KEY',
          value: 'another_value',
          description: 'Another variable',
          createdAt: '2023-01-02T00:00:00Z',
          updatedAt: '2023-01-02T00:00:00Z',
        },
      ];
      localStorageMock.setItem('rest-client-variables', JSON.stringify(variables));

      const { result } = renderHook(() => useVariables());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const updateData: VariableFormData = {
        key: 'ANOTHER_KEY',
        value: 'updated_value',
        description: 'Updated description',
      };

      await act(async () => {
        result.current.updateVariable('test-id-1', updateData);
      });

      const variable = result.current.variables.find((v) => v.id === 'test-id-1');
      expect(variable?.key).toBe('API_URL');
      expect(result.current.error).toBe('Variable with this key already exists');
    });

    it('allows updating to same key (no change)', async () => {
      const { result } = renderHook(() => useVariables());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const updateData: VariableFormData = {
        key: 'API_URL',
        value: 'updated_value',
        description: 'Updated description',
      };

      await act(async () => {
        result.current.updateVariable('test-id-1', updateData);
      });

      const variable = result.current.variables[0];
      expect(variable.key).toBe('API_URL');
      expect(variable.value).toBe('updated_value');
      expect(variable.description).toBe('Updated description');
      expect(result.current.error).toBeNull();
    });

    it('handles non-existent variable ID gracefully', async () => {
      const { result } = renderHook(() => useVariables());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const updateData: VariableFormData = {
        key: 'NON_EXISTENT',
        value: 'value',
        description: 'description',
      };

      await act(async () => {
        result.current.updateVariable('non-existent-id', updateData);
      });

      expect(result.current.variables).toHaveLength(1);
      expect(result.current.variables[0].key).toBe('API_URL');
    });

    it('handles empty description in update', async () => {
      const { result } = renderHook(() => useVariables());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const updateData: VariableFormData = {
        key: 'API_URL',
        value: 'updated_value',
        description: '',
      };

      await act(async () => {
        result.current.updateVariable('test-id-1', updateData);
      });

      expect(result.current.variables[0].description).toBe('');
    });
  });

  describe('deleteVariable', () => {
    beforeEach(async () => {
      localStorageMock.setItem('rest-client-variables', JSON.stringify(mockStoredVariables));
    });

    it('deletes an existing variable', async () => {
      const { result } = renderHook(() => useVariables());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.variables).toHaveLength(1);

      await act(async () => {
        result.current.deleteVariable('test-id-1');
      });

      expect(result.current.variables).toHaveLength(0);
      expect(result.current.error).toBeNull();
    });

    it('handles non-existent variable ID gracefully', async () => {
      const { result } = renderHook(() => useVariables());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.variables).toHaveLength(1);

      await act(async () => {
        result.current.deleteVariable('non-existent-id');
      });

      expect(result.current.variables).toHaveLength(1);
      expect(result.current.variables[0].id).toBe('test-id-1');
    });

    it('saves updated variables to localStorage after deletion', async () => {
      const { result } = renderHook(() => useVariables());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      await act(async () => {
        result.current.deleteVariable('test-id-1');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('rest-client-variables', '[]');
    });
  });

  describe('clearError', () => {
    it('clears the error state', async () => {
      const { result } = renderHook(() => useVariables());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      await act(async () => {
        result.current.addVariable({ key: 'KEY1', value: 'value1' });
      });
      await act(async () => {
        result.current.addVariable({ key: 'KEY1', value: 'value2' });
      });

      expect(result.current.error).toBe('Variable with this key already exists');

      await act(async () => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('reloadVariables', () => {
    it('reloads variables from localStorage', async () => {
      const { result } = renderHook(() => useVariables());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.variables).toHaveLength(0);

      localStorageMock.setItem('rest-client-variables', JSON.stringify(mockStoredVariables));

      await act(async () => {
        result.current.reloadVariables();
      });

      expect(result.current.variables).toHaveLength(1);
      expect(result.current.variables[0].key).toBe('API_URL');
    });
  });

  describe('localStorage save errors', () => {
    it('handles localStorage save errors gracefully', async () => {
      const { result } = renderHook(() => useVariables());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage quota exceeded');
      });

      await act(async () => {
        result.current.addVariable({
          key: 'TEST_KEY',
          value: 'test_value',
          description: 'Test variable',
        });
      });

      expect(result.current.error).toBe('Failed to save variables');
      expect(console.error).toHaveBeenCalledWith('Error saving variables:', expect.any(Error));
    });
  });
});
