import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  substituteVariables,
  substituteVariablesInHeaders,
  substituteVariablesInJson,
  hasVariables,
  getUsedVariables,
} from '../utils/variableSubstitution';
import type { Variable } from '../types/interfaces';

const mockVariables: Variable[] = [
  {
    id: '1',
    key: 'API_URL',
    value: 'https://api.example.com',
    description: 'API base URL',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    key: 'API_KEY',
    value: 'secret-api-key-123',
    description: 'API authentication key',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    key: 'VERSION',
    value: 'v1',
    description: 'API version',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    key: 'EMPTY_VALUE',
    value: '',
    description: 'Variable with empty value',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('variableSubstitution', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('substituteVariables', () => {
    it('substitutes single variable correctly', () => {
      const text = 'The API URL is {{API_URL}}';
      const result = substituteVariables(text, mockVariables);
      expect(result).toBe('The API URL is https://api.example.com');
    });

    it('substitutes multiple variables in one string', () => {
      const text = '{{API_URL}}/{{VERSION}}/users?key={{API_KEY}}';
      const result = substituteVariables(text, mockVariables);
      expect(result).toBe('https://api.example.com/v1/users?key=secret-api-key-123');
    });

    it('handles variables with whitespace in template', () => {
      const text = 'URL: {{ API_URL }}, Key: {{  API_KEY  }}';
      const result = substituteVariables(text, mockVariables);
      expect(result).toBe('URL: https://api.example.com, Key: secret-api-key-123');
    });

    it('returns original text when no variables are present', () => {
      const text = 'This is just plain text without variables';
      const result = substituteVariables(text, mockVariables);
      expect(result).toBe('This is just plain text without variables');
    });

    it('handles non-existent variables', () => {
      const text = 'This {{NON_EXISTENT}} variable does not exist';
      const result = substituteVariables(text, mockVariables);
      expect(result).toBe('This {{NON_EXISTENT}} variable does not exist');
      expect(console.warn).toHaveBeenCalledWith(
        'Variable "NON_EXISTENT" not found in localStorage'
      );
    });

    it('handles empty variable value', () => {
      const text = 'Empty value: {{EMPTY_VALUE}}';
      const result = substituteVariables(text, mockVariables);
      expect(result).toBe('Empty value: ');
    });

    it('handles malformed variable syntax', () => {
      const text = 'Malformed: {API_URL} and {{API_URL} and {{{API_URL}}}';
      const result = substituteVariables(text, mockVariables);
      expect(result).toBe('Malformed: {API_URL} and {{API_URL} and {{{API_URL}}}');
    });

    it('handles nested braces correctly', () => {
      const text = 'Nested: {{{API_URL}}} should work';
      const result = substituteVariables(text, mockVariables);
      expect(result).toBe('Nested: {{{API_URL}}} should work');
    });

    it('handles multiple occurrences of same variable', () => {
      const text = '{{API_URL}}/users and {{API_URL}}/posts';
      const result = substituteVariables(text, mockVariables);
      expect(result).toBe('https://api.example.com/users and https://api.example.com/posts');
    });

    it('handles empty input', () => {
      expect(substituteVariables('', mockVariables)).toBe('');
    });

    it('handles null input', () => {
      expect(substituteVariables(null as unknown as string, mockVariables)).toBe(null);
    });

    it('handles undefined input', () => {
      expect(substituteVariables(undefined as unknown as string, mockVariables)).toBe(undefined);
    });

    it('handles non-string input', () => {
      expect(substituteVariables(123 as unknown as string, mockVariables)).toBe(123);
    });

    it('handles empty variables array', () => {
      const text = 'This {{API_URL}} will not be substituted';
      const result = substituteVariables(text, []);
      expect(result).toBe('This {{API_URL}} will not be substituted');
      expect(console.warn).toHaveBeenCalledWith('Variable "API_URL" not found in localStorage');
    });

    it('handles variables with special characters in names', () => {
      const specialVariables: Variable[] = [
        {
          id: '1',
          key: 'API-URL',
          value: 'https://api.example.com',
          description: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          key: 'API_URL_2',
          value: 'https://api2.example.com',
          description: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const text = '{{API-URL}} and {{API_URL_2}}';
      const result = substituteVariables(text, specialVariables);
      expect(result).toBe('https://api.example.com and https://api2.example.com');
    });
  });

  describe('substituteVariablesInHeaders', () => {
    it('substitutes variables in header values', () => {
      const headers = {
        Authorization: 'Bearer {{API_KEY}}',
        'X-API-Version': '{{VERSION}}',
        'Content-Type': 'application/json',
      };

      const result = substituteVariablesInHeaders(headers, mockVariables);

      expect(result).toEqual({
        Authorization: 'Bearer secret-api-key-123',
        'X-API-Version': 'v1',
        'Content-Type': 'application/json',
      });
    });

    it('handles empty headers object', () => {
      const result = substituteVariablesInHeaders({}, mockVariables);
      expect(result).toEqual({});
    });

    it('preserves headers without variables', () => {
      const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      const result = substituteVariablesInHeaders(headers, mockVariables);
      expect(result).toEqual(headers);
    });

    it('handles headers with non-existent variables', () => {
      const headers = {
        Authorization: 'Bearer {{NON_EXISTENT_KEY}}',
      };

      const result = substituteVariablesInHeaders(headers, mockVariables);
      expect(result).toEqual({
        Authorization: 'Bearer {{NON_EXISTENT_KEY}}',
      });
    });

    it('handles multiple variables in single header value', () => {
      const headers = {
        'X-Custom-Header': '{{API_KEY}}-{{VERSION}}',
      };

      const result = substituteVariablesInHeaders(headers, mockVariables);
      expect(result).toEqual({
        'X-Custom-Header': 'secret-api-key-123-v1',
      });
    });
  });

  describe('substituteVariablesInJson', () => {
    it('substitutes variables in valid JSON string', () => {
      const jsonString = JSON.stringify({
        url: '{{API_URL}}',
        key: '{{API_KEY}}',
        version: '{{VERSION}}',
        static: 'value',
      });

      const result = substituteVariablesInJson(jsonString, mockVariables);
      const parsed = JSON.parse(result);

      expect(parsed).toEqual({
        url: 'https://api.example.com',
        key: 'secret-api-key-123',
        version: 'v1',
        static: 'value',
      });
    });

    it('handles nested objects in JSON', () => {
      const jsonString = JSON.stringify({
        config: {
          api: {
            url: '{{API_URL}}',
            key: '{{API_KEY}}',
          },
        },
        metadata: {
          version: '{{VERSION}}',
        },
      });

      const result = substituteVariablesInJson(jsonString, mockVariables);
      const parsed = JSON.parse(result);

      expect(parsed.config.api.url).toBe('https://api.example.com');
      expect(parsed.config.api.key).toBe('secret-api-key-123');
      expect(parsed.metadata.version).toBe('v1');
    });

    it('handles arrays in JSON', () => {
      const jsonString = JSON.stringify({
        urls: ['{{API_URL}}/users', '{{API_URL}}/posts'],
        keys: ['{{API_KEY}}', 'static-key'],
      });

      const result = substituteVariablesInJson(jsonString, mockVariables);
      const parsed = JSON.parse(result);

      expect(parsed.urls).toEqual([
        'https://api.example.com/users',
        'https://api.example.com/posts',
      ]);
      expect(parsed.keys).toEqual(['secret-api-key-123', 'static-key']);
    });

    it('handles invalid JSON by treating as plain text', () => {
      const invalidJson = 'This is not JSON but has {{API_URL}} variable';
      const result = substituteVariablesInJson(invalidJson, mockVariables);
      expect(result).toBe('This is not JSON but has https://api.example.com variable');
      expect(console.warn).toHaveBeenCalledWith(
        'Invalid JSON, treating as plain text:',
        expect.any(Error)
      );
    });

    it('handles JSON with non-string values', () => {
      const jsonString = JSON.stringify({
        url: '{{API_URL}}',
        port: 8080,
        enabled: true,
        config: null,
      });

      const result = substituteVariablesInJson(jsonString, mockVariables);
      const parsed = JSON.parse(result);

      expect(parsed).toEqual({
        url: 'https://api.example.com',
        port: 8080,
        enabled: true,
        config: null,
      });
    });

    it('handles empty JSON object', () => {
      const jsonString = '{}';
      const result = substituteVariablesInJson(jsonString, mockVariables);
      expect(result).toBe('{}');
    });

    it('handles JSON array at root level', () => {
      const jsonString = JSON.stringify(['{{API_URL}}', '{{API_KEY}}', 'static-value']);

      const result = substituteVariablesInJson(jsonString, mockVariables);
      const parsed = JSON.parse(result);

      expect(parsed).toEqual(['https://api.example.com', 'secret-api-key-123', 'static-value']);
    });
  });

  describe('hasVariables', () => {
    it('returns true when text contains variables', () => {
      expect(hasVariables('{{API_URL}}')).toBe(true);
      expect(hasVariables('Text with {{VARIABLE}} inside')).toBe(true);
      expect(hasVariables('Multiple {{VAR1}} and {{VAR2}}')).toBe(true);
      expect(hasVariables('{{ SPACED_VAR }}')).toBe(true);
    });

    it('returns false when text contains no variables', () => {
      expect(hasVariables('Plain text')).toBe(false);
      expect(hasVariables('Text with {single braces}')).toBe(false);
      expect(hasVariables('Text with {{{triple braces}}}')).toBe(true);
      expect(hasVariables('')).toBe(false);
      expect(hasVariables('{')).toBe(false);
      expect(hasVariables('}}')).toBe(false);
    });

    it('handles malformed variable syntax', () => {
      expect(hasVariables('{API_URL}')).toBe(false);
      expect(hasVariables('{{API_URL}')).toBe(false);
      expect(hasVariables('{API_URL}}')).toBe(false);
      expect(hasVariables('{{}}')).toBe(false);
    });
  });

  describe('getUsedVariables', () => {
    it('extracts variable names from text', () => {
      const text = 'URL: {{API_URL}}, Key: {{API_KEY}}';
      const result = getUsedVariables(text);
      expect(result).toEqual(['API_URL', 'API_KEY']);
    });

    it('trims whitespace from variable names', () => {
      const text = 'URL: {{ API_URL }}, Key: {{  API_KEY  }}';
      const result = getUsedVariables(text);
      expect(result).toEqual(['API_URL', 'API_KEY']);
    });

    it('handles duplicate variable names', () => {
      const text = '{{API_URL}} and {{API_URL}} again';
      const result = getUsedVariables(text);
      expect(result).toEqual(['API_URL', 'API_URL']);
    });

    it('returns empty array when no variables found', () => {
      const text = 'Plain text without variables';
      const result = getUsedVariables(text);
      expect(result).toEqual([]);
    });

    it('handles empty variable names', () => {
      const text = 'Empty: {{}} and normal: {{API_URL}}';
      const result = getUsedVariables(text);
      expect(result).toEqual(['API_URL']);
    });

    it('handles complex variable names', () => {
      const text = '{{API_URL_V2}} and {{api-key-prod}} and {{API.URL}}';
      const result = getUsedVariables(text);
      expect(result).toEqual(['API_URL_V2', 'api-key-prod', 'API.URL']);
    });

    it('handles nested braces correctly', () => {
      const text = '{{{API_URL}}} should extract API_URL';
      const result = getUsedVariables(text);
      expect(result).toEqual(['{API_URL']);
    });

    it('handles variables with special characters', () => {
      const text = '{{API-URL}} and {{API_KEY_123}} and {{@special}}';
      const result = getUsedVariables(text);
      expect(result).toEqual(['API-URL', 'API_KEY_123', '@special']);
    });
  });

  describe('Edge Cases', () => {
    it('handles very long variable names', () => {
      const longVariableName = 'A'.repeat(1000);
      const variables: Variable[] = [
        {
          id: '1',
          key: longVariableName,
          value: 'long-value',
          description: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const text = `{{${longVariableName}}}`;
      const result = substituteVariables(text, variables);
      expect(result).toBe('long-value');
    });

    it('handles variables with unicode characters', () => {
      const unicodeVariables: Variable[] = [
        {
          id: '1',
          key: 'UNICODE_VAR',
          value: '🚀 Unicode value! 中文',
          description: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const text = 'Value: {{UNICODE_VAR}}';
      const result = substituteVariables(text, unicodeVariables);
      expect(result).toBe('Value: 🚀 Unicode value! 中文');
    });

    it('handles variables with newlines in values', () => {
      const multilineVariables: Variable[] = [
        {
          id: '1',
          key: 'MULTILINE_VAR',
          value: 'Line 1\nLine 2\nLine 3',
          description: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const text = 'Content:\n{{MULTILINE_VAR}}';
      const result = substituteVariables(text, multilineVariables);
      expect(result).toBe('Content:\nLine 1\nLine 2\nLine 3');
    });

    it('handles recursive variable references (should not cause infinite loop)', () => {
      const recursiveVariables: Variable[] = [
        {
          id: '1',
          key: 'VAR1',
          value: '{{VAR2}}',
          description: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          key: 'VAR2',
          value: '{{VAR1}}',
          description: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const text = '{{VAR1}}';
      const result = substituteVariables(text, recursiveVariables);
      expect(result).toBe('{{VAR2}}');
    });

    it('performance test with many variables', () => {
      const manyVariables: Variable[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        key: `VAR_${i}`,
        value: `value_${i}`,
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const text = Array.from({ length: 100 }, (_, i) => `{{VAR_${i}}}`).join(' ');

      const startTime = Date.now();
      const result = substituteVariables(text, manyVariables);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);
      expect(result).toContain('value_0');
      expect(result).toContain('value_99');
    });
  });
});
