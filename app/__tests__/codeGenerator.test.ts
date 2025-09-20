import { describe, it, expect } from 'vitest';
import {
  generateCurl,
  generateJavaScriptFetch,
  generateJavaScriptXHR,
  generateNodeJS,
  generatePython,
  generateJava,
  generateCSharp,
  generateGo,
  generateCode,
  getSupportedLanguages,
} from '../utils/codeGenerator';
import type { RequestData } from '../types/interfaces';

const baseRequestData: RequestData = {
  method: 'GET',
  url: 'https://api.example.com/users',
  headers: {},
  body: undefined,
};

const postRequestData: RequestData = {
  method: 'POST',
  url: 'https://api.example.com/users',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer token123',
  },
  body: '{"name": "John Doe", "email": "john@example.com"}',
};

const complexRequestData: RequestData = {
  method: 'PUT',
  url: 'https://api.example.com/users/123',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer token123',
    'X-API-Version': 'v1',
    'X-Custom-Header': 'custom-value',
  },
  body: '{"name": "Jane Doe", "email": "jane@example.com", "age": 30}',
};

describe('codeGenerator', () => {
  describe('generateCurl', () => {
    it('generates basic GET request', () => {
      const result = generateCurl(baseRequestData);
      expect(result).toBe('curl -X GET \\\n  "https://api.example.com/users"');
    });

    it('generates GET request with headers', () => {
      const requestWithHeaders: RequestData = {
        ...baseRequestData,
        headers: {
          Authorization: 'Bearer token123',
          Accept: 'application/json',
        },
      };

      const result = generateCurl(requestWithHeaders);
      expect(result).toContain('curl -X GET');
      expect(result).toContain('-H "Authorization: Bearer token123"');
      expect(result).toContain('-H "Accept: application/json"');
      expect(result).toContain('"https://api.example.com/users"');
    });

    it('generates POST request with body', () => {
      const result = generateCurl(postRequestData);
      expect(result).toContain('curl -X POST');
      expect(result).toContain('-H "Content-Type: application/json"');
      expect(result).toContain('-H "Authorization: Bearer token123"');
      expect(result).toContain('-d \'{"name": "John Doe", "email": "john@example.com"}\'');
      expect(result).toContain('"https://api.example.com/users"');
    });

    it('generates PUT request with body', () => {
      const result = generateCurl(complexRequestData);
      expect(result).toContain('curl -X PUT');
      expect(result).toContain(
        '-d \'{"name": "Jane Doe", "email": "jane@example.com", "age": 30}\''
      );
    });

    it('generates PATCH request with body', () => {
      const patchData: RequestData = {
        ...postRequestData,
        method: 'PATCH',
      };

      const result = generateCurl(patchData);
      expect(result).toContain('curl -X PATCH');
      expect(result).toContain('-d \'{"name": "John Doe", "email": "john@example.com"}\'');
    });

    it('does not include body for GET requests', () => {
      const result = generateCurl(baseRequestData);
      expect(result).not.toContain('-d');
    });

    it('does not include body for DELETE requests', () => {
      const deleteData: RequestData = {
        ...baseRequestData,
        method: 'DELETE',
      };

      const result = generateCurl(deleteData);
      expect(result).toContain('curl -X DELETE');
      expect(result).not.toContain('-d');
    });

    it('handles empty headers', () => {
      const result = generateCurl(baseRequestData);
      expect(result).not.toContain('-H');
    });

    it('handles case insensitive methods', () => {
      const lowerCaseMethod: RequestData = {
        ...postRequestData,
        method: 'post',
      };

      const result = generateCurl(lowerCaseMethod);
      expect(result).toContain('curl -X POST');
    });
  });

  describe('generateJavaScriptFetch', () => {
    it('generates basic GET request', () => {
      const result = generateJavaScriptFetch(baseRequestData);
      expect(result).toContain("fetch('https://api.example.com/users', {");
      expect(result).toContain("method: 'GET'");
      expect(result).toContain('.then(response => response.json())');
      expect(result).toContain('.catch(error => {');
      expect(result).not.toContain('headers:');
      expect(result).not.toContain('body:');
    });

    it('generates GET request with headers', () => {
      const requestWithHeaders: RequestData = {
        ...baseRequestData,
        headers: {
          Authorization: 'Bearer token123',
          Accept: 'application/json',
        },
      };

      const result = generateJavaScriptFetch(requestWithHeaders);
      expect(result).toContain('headers:');
      expect(result).toContain('"Authorization": "Bearer token123"');
      expect(result).toContain('"Accept": "application/json"');
    });

    it('generates POST request with body', () => {
      const result = generateJavaScriptFetch(postRequestData);
      expect(result).toContain("method: 'POST'");
      expect(result).toContain('headers:');
      expect(result).toContain('body:');
      expect(result).toContain(
        '"{\\"name\\": \\"John Doe\\", \\"email\\": \\"john@example.com\\"}"'
      );
    });

    it('handles empty headers correctly', () => {
      const result = generateJavaScriptFetch(baseRequestData);
      expect(result).not.toContain('headers:');
    });

    it('includes DOM manipulation code', () => {
      const result = generateJavaScriptFetch(baseRequestData);
      expect(result).toContain("document.getElementById('result')");
      expect(result).toContain('JSON.stringify(data, null, 2)');
    });

    it('handles PUT and PATCH methods with body', () => {
      const putResult = generateJavaScriptFetch({ ...postRequestData, method: 'PUT' });
      const patchResult = generateJavaScriptFetch({ ...postRequestData, method: 'PATCH' });

      expect(putResult).toContain("method: 'PUT'");
      expect(putResult).toContain('body:');
      expect(patchResult).toContain("method: 'PATCH'");
      expect(patchResult).toContain('body:');
    });
  });

  describe('generateJavaScriptXHR', () => {
    it('generates basic GET request', () => {
      const result = generateJavaScriptXHR(baseRequestData);
      expect(result).toContain('const xhr = new XMLHttpRequest();');
      expect(result).toContain("xhr.open('GET', 'https://api.example.com/users');");
      expect(result).toContain('xhr.onreadystatechange = function()');
      expect(result).toContain('xhr.send(null);');
    });

    it('generates request with headers', () => {
      const result = generateJavaScriptXHR(postRequestData);
      expect(result).toContain("xhr.setRequestHeader('Content-Type', 'application/json');");
      expect(result).toContain("xhr.setRequestHeader('Authorization', 'Bearer token123');");
    });

    it('generates POST request with body', () => {
      const result = generateJavaScriptXHR(postRequestData);
      expect(result).toContain("xhr.open('POST',");
      expect(result).toContain('xhr.send(\'{"name": "John Doe", "email": "john@example.com"}\');');
    });

    it('includes response handling code', () => {
      const result = generateJavaScriptXHR(baseRequestData);
      expect(result).toContain('if (xhr.readyState === 4)');
      expect(result).toContain('if (xhr.status === 200)');
      expect(result).toContain('JSON.parse(xhr.responseText)');
      expect(result).toContain("document.getElementById('result')");
    });

    it('handles methods without body', () => {
      const deleteData: RequestData = { ...baseRequestData, method: 'DELETE' };
      const result = generateJavaScriptXHR(deleteData);
      expect(result).toContain('xhr.send(null);');
    });
  });

  describe('generateNodeJS', () => {
    it('generates basic GET request', () => {
      const result = generateNodeJS(baseRequestData);
      expect(result).toContain("const https = require('https');");
      expect(result).toContain("const http = require('http');");
      expect(result).toContain("method: 'GET'");
      expect(result).toContain('const req = https.request(');
    });

    it('generates HTTP request for HTTP URLs', () => {
      const httpRequest: RequestData = {
        ...baseRequestData,
        url: 'http://api.example.com/users',
      };

      const result = generateNodeJS(httpRequest);
      expect(result).toContain('const req = http.request(');
    });

    it('generates request with headers', () => {
      const result = generateNodeJS(postRequestData);
      expect(result).toContain('headers:');
      expect(result).toContain('"Content-Type": "application/json"');
      expect(result).toContain('"Authorization": "Bearer token123"');
    });

    it('generates POST request with body', () => {
      const result = generateNodeJS(postRequestData);
      expect(result).toContain("method: 'POST'");
      expect(result).toContain('body:');
      expect(result).toContain(
        '"{\\"name\\": \\"John Doe\\", \\"email\\": \\"john@example.com\\"}"'
      );
    });

    it('includes response handling code', () => {
      const result = generateNodeJS(baseRequestData);
      expect(result).toContain("res.on('data', (chunk) => {");
      expect(result).toContain("res.on('end', () => {");
      expect(result).toContain('JSON.parse(data)');
      expect(result).toContain('process.stdout.write');
    });

    it('includes error handling', () => {
      const result = generateNodeJS(baseRequestData);
      expect(result).toContain("req.on('error', (error) => {");
      expect(result).toContain('req.end();');
    });
  });

  describe('generatePython', () => {
    it('generates basic GET request', () => {
      const result = generatePython(baseRequestData);
      expect(result).toContain('import requests');
      expect(result).toContain("response = requests.get('https://api.example.com/users')");
      expect(result).toContain('print(response.json())');
      expect(result).not.toContain('headers =');
      expect(result).not.toContain('data =');
    });

    it('generates request with headers', () => {
      const requestWithHeaders: RequestData = {
        ...baseRequestData,
        headers: {
          Authorization: 'Bearer token123',
        },
      };

      const result = generatePython(requestWithHeaders);
      expect(result).toContain('headers =');
      expect(result).toContain('"Authorization": "Bearer token123"');
      expect(result).toContain('headers=headers');
    });

    it('generates POST request with body', () => {
      const result = generatePython(postRequestData);
      expect(result).toContain('response = requests.post(');
      expect(result).toContain('data =');
      expect(result).toContain(
        '"{\\"name\\": \\"John Doe\\", \\"email\\": \\"john@example.com\\"}"'
      );
      expect(result).toContain('data=data');
    });

    it('generates PUT and PATCH requests correctly', () => {
      const putResult = generatePython({ ...postRequestData, method: 'PUT' });
      const patchResult = generatePython({ ...postRequestData, method: 'PATCH' });

      expect(putResult).toContain('response = requests.put(');
      expect(patchResult).toContain('response = requests.patch(');
    });

    it('handles case insensitive methods', () => {
      const result = generatePython({ ...postRequestData, method: 'POST' });
      expect(result).toContain('response = requests.post(');
    });

    it('formats parameters correctly', () => {
      const result = generatePython(complexRequestData);
      expect(result).toContain('headers =');
      expect(result).toContain('data =');
      expect(result).toContain('headers=headers');
      expect(result).toContain('data=data');
    });
  });

  describe('generateJava', () => {
    it('generates basic request structure', () => {
      const result = generateJava(baseRequestData);
      expect(result).toContain('import java.io.*;');
      expect(result).toContain('import java.net.*;');
      expect(result).toContain('public class Request');
      expect(result).toContain('public static void main(String[] args)');
      expect(result).toContain('new URL("https://api.example.com/users")');
      expect(result).toContain('connection.setRequestMethod("GET")');
    });

    it('generates request with headers', () => {
      const result = generateJava(postRequestData);
      expect(result).toContain('connection.setRequestProperty("Content-Type", "application/json")');
      expect(result).toContain('connection.setRequestProperty("Authorization", "Bearer token123")');
    });

    it('generates POST request with body', () => {
      const result = generateJava(postRequestData);
      expect(result).toContain('connection.setRequestMethod("POST")');
      expect(result).toContain('try (OutputStream os = connection.getOutputStream())');
      expect(result).toContain(
        'byte[] input = "{"name": "John Doe", "email": "john@example.com"}".getBytes("utf-8")'
      );
    });

    it('includes response handling', () => {
      const result = generateJava(baseRequestData);
      expect(result).toContain('int responseCode = connection.getResponseCode()');
      expect(result).toContain('BufferedReader in = new BufferedReader');
      expect(result).toContain('connection.getInputStream()');
    });

    it('does not include body for GET requests', () => {
      const result = generateJava(baseRequestData);
      expect(result).not.toContain('OutputStream os');
    });

    it('handles PUT and PATCH methods with body', () => {
      const putResult = generateJava({ ...postRequestData, method: 'PUT' });
      const patchResult = generateJava({ ...postRequestData, method: 'PATCH' });

      expect(putResult).toContain('connection.setRequestMethod("PUT")');
      expect(putResult).toContain('OutputStream os');
      expect(patchResult).toContain('connection.setRequestMethod("PATCH")');
      expect(patchResult).toContain('OutputStream os');
    });
  });

  describe('generateCSharp', () => {
    it('generates basic request structure', () => {
      const result = generateCSharp(baseRequestData);
      expect(result).toContain('using System;');
      expect(result).toContain('using System.Net.Http;');
      expect(result).toContain('class Program');
      expect(result).toContain('static async Task Main');
      expect(result).toContain('using var client = new HttpClient()');
    });

    it('generates GET request', () => {
      const result = generateCSharp(baseRequestData);
      expect(result).toContain('client.GetAsync("https://api.example.com/users")');
    });

    it('generates request with headers', () => {
      const result = generateCSharp(postRequestData);
      expect(result).toContain(
        'client.DefaultRequestHeaders.Add("Content-Type", "application/json")'
      );
      expect(result).toContain(
        'client.DefaultRequestHeaders.Add("Authorization", "Bearer token123")'
      );
    });

    it('generates POST request with body', () => {
      const result = generateCSharp(postRequestData);
      expect(result).toContain('var content = new StringContent');
      expect(result).toContain('client.PostAsync("https://api.example.com/users", content)');
    });

    it('generates PUT and PATCH requests', () => {
      const putResult = generateCSharp({ ...postRequestData, method: 'PUT' });
      const patchResult = generateCSharp({ ...postRequestData, method: 'PATCH' });

      expect(putResult).toContain('client.PutAsync');
      expect(patchResult).toContain('client.PatchAsync');
    });

    it('includes error handling', () => {
      const result = generateCSharp(baseRequestData);
      expect(result).toContain('try');
      expect(result).toContain('catch (Exception ex)');
      expect(result).toContain('Console.WriteLine($"Error: {ex.Message}")');
    });

    it('includes response reading', () => {
      const result = generateCSharp(baseRequestData);
      expect(result).toContain('response.Content.ReadAsStringAsync()');
      expect(result).toContain('Console.WriteLine(result)');
    });
  });

  describe('generateGo', () => {
    it('generates basic request structure', () => {
      const result = generateGo(baseRequestData);
      expect(result).toContain('package main');
      expect(result).toContain('import (');
      expect(result).toContain('"net/http"');
      expect(result).toContain('func main()');
      expect(result).toContain('url := "https://api.example.com/users"');
      expect(result).toContain('method := "GET"');
    });

    it('generates request with headers', () => {
      const result = generateGo(postRequestData);
      expect(result).toContain('req.Header.Set("Content-Type", "application/json")');
      expect(result).toContain('req.Header.Set("Authorization", "Bearer token123")');
    });

    it('generates POST request with body', () => {
      const result = generateGo(postRequestData);
      expect(result).toContain('method := "POST"');
      expect(result).toContain(
        'var jsonStr = []byte(`{"name": "John Doe", "email": "john@example.com"}`)'
      );
      expect(result).toContain('req.Body = ioutil.NopCloser(bytes.NewBuffer(jsonStr))');
    });

    it('includes HTTP client and response handling', () => {
      const result = generateGo(baseRequestData);
      expect(result).toContain('client := &http.Client{}');
      expect(result).toContain('resp, err := client.Do(req)');
      expect(result).toContain('defer resp.Body.Close()');
      expect(result).toContain('ioutil.ReadAll(resp.Body)');
      expect(result).toContain('fmt.Println(string(body))');
    });

    it('includes error handling', () => {
      const result = generateGo(baseRequestData);
      expect(result).toContain('if err != nil {');
      expect(result).toContain('panic(err)');
    });

    it('does not include body for GET requests', () => {
      const result = generateGo(baseRequestData);
      expect(result).not.toContain('var jsonStr');
      expect(result).not.toContain('req.Body =');
    });
  });

  describe('generateCode', () => {
    it('calls correct generator for each language', () => {
      expect(generateCode(baseRequestData, 'curl')).toContain('curl -X GET');
      expect(generateCode(baseRequestData, 'javascript-fetch')).toContain('fetch(');
      expect(generateCode(baseRequestData, 'javascript-xhr')).toContain('XMLHttpRequest');
      expect(generateCode(baseRequestData, 'nodejs')).toContain('require(');
      expect(generateCode(baseRequestData, 'python')).toContain('import requests');
      expect(generateCode(baseRequestData, 'java')).toContain('public class Request');
      expect(generateCode(baseRequestData, 'csharp')).toContain('using System');
      expect(generateCode(baseRequestData, 'go')).toContain('package main');
    });

    it('returns error message for unsupported language', () => {
      const result = generateCode(baseRequestData, 'unsupported-lang');
      expect(result).toBe('Unsupported language');
    });

    it('handles case sensitivity', () => {
      const result = generateCode(baseRequestData, 'CURL');
      expect(result).toBe('Unsupported language');
    });
  });

  describe('getSupportedLanguages', () => {
    it('returns array of supported languages', () => {
      const languages = getSupportedLanguages();
      expect(Array.isArray(languages)).toBe(true);
      expect(languages.length).toBeGreaterThan(0);
    });

    it('returns languages with correct structure', () => {
      const languages = getSupportedLanguages();
      languages.forEach((lang) => {
        expect(lang).toHaveProperty('value');
        expect(lang).toHaveProperty('label');
        expect(typeof lang.value).toBe('string');
        expect(typeof lang.label).toBe('string');
      });
    });

    it('includes all expected languages', () => {
      const languages = getSupportedLanguages();
      const values = languages.map((lang) => lang.value);

      expect(values).toContain('curl');
      expect(values).toContain('javascript-fetch');
      expect(values).toContain('javascript-xhr');
      expect(values).toContain('nodejs');
      expect(values).toContain('python');
      expect(values).toContain('java');
      expect(values).toContain('csharp');
      expect(values).toContain('go');
    });

    it('has readable labels', () => {
      const languages = getSupportedLanguages();
      const curlLang = languages.find((lang) => lang.value === 'curl');
      const jsLang = languages.find((lang) => lang.value === 'javascript-fetch');

      expect(curlLang?.label).toBe('cURL');
      expect(jsLang?.label).toBe('JavaScript (Fetch)');
    });
  });

  describe('Edge Cases and Special Characters', () => {
    it('handles URLs with special characters', () => {
      const specialUrlData: RequestData = {
        ...baseRequestData,
        url: 'https://api.example.com/users?name=John%20Doe&age=30',
      };

      const curlResult = generateCurl(specialUrlData);
      expect(curlResult).toContain('https://api.example.com/users?name=John%20Doe&age=30');
    });

    it('handles headers with special characters', () => {
      const specialHeadersData: RequestData = {
        ...baseRequestData,
        headers: {
          'X-Custom-Header': 'value with spaces and "quotes"',
          Authorization: 'Bearer token-with-special-chars!@#$%',
        },
      };

      const curlResult = generateCurl(specialHeadersData);
      expect(curlResult).toContain('value with spaces and "quotes"');
      expect(curlResult).toContain('Bearer token-with-special-chars!@#$%');
    });

    it('handles JSON body with special characters', () => {
      const specialBodyData: RequestData = {
        ...postRequestData,
        body: '{"message": "Hello \\"world\\"", "emoji": "🚀", "newline": "line1\\nline2"}',
      };

      const curlResult = generateCurl(specialBodyData);
      expect(curlResult).toContain('Hello \\"world\\"');
      expect(curlResult).toContain('🚀');
    });

    it('handles empty body', () => {
      const emptyBodyData: RequestData = {
        ...postRequestData,
        body: '',
      };

      const curlResult = generateCurl(emptyBodyData);
      expect(curlResult).not.toContain('-d');
    });

    it('handles undefined body', () => {
      const undefinedBodyData: RequestData = {
        ...postRequestData,
        body: undefined,
      };

      const curlResult = generateCurl(undefinedBodyData);
      expect(curlResult).not.toContain('-d');
    });

    it('handles very long URLs', () => {
      const longUrlData: RequestData = {
        ...baseRequestData,
        url: 'https://api.example.com/' + 'a'.repeat(1000),
      };

      const result = generateCurl(longUrlData);
      expect(result).toContain('https://api.example.com/' + 'a'.repeat(1000));
    });

    it('handles many headers', () => {
      const manyHeaders: Record<string, string> = {};
      for (let i = 0; i < 50; i++) {
        manyHeaders[`Header-${i}`] = `value-${i}`;
      }

      const manyHeadersData: RequestData = {
        ...baseRequestData,
        headers: manyHeaders,
      };

      const result = generateCurl(manyHeadersData);
      expect(result).toContain('Header-0: value-0');
      expect(result).toContain('Header-49: value-49');
    });
  });

  describe('Method Case Handling', () => {
    it('handles lowercase methods correctly', () => {
      const methods = ['get', 'post', 'put', 'patch', 'delete'];

      methods.forEach((method) => {
        const data: RequestData = {
          ...baseRequestData,
          method,
        };

        const curlResult = generateCurl(data);
        expect(curlResult).toContain(`curl -X ${method.toUpperCase()}`);
      });
    });

    it('handles mixed case methods correctly', () => {
      const data: RequestData = {
        ...baseRequestData,
        method: 'PoSt',
      };

      const curlResult = generateCurl(data);
      expect(curlResult).toContain('curl -X POST');
    });
  });

  describe('Integration Tests', () => {
    it('generates consistent output for same input', () => {
      const result1 = generateCurl(complexRequestData);
      const result2 = generateCurl(complexRequestData);
      expect(result1).toBe(result2);
    });

    it('all generators handle complex request data', () => {
      const languages = [
        'curl',
        'javascript-fetch',
        'javascript-xhr',
        'nodejs',
        'python',
        'java',
        'csharp',
        'go',
      ];

      languages.forEach((lang) => {
        const result = generateCode(complexRequestData, lang);
        expect(result).not.toBe('Unsupported language');
        expect(result.length).toBeGreaterThan(0);
        expect(result).toContain('https://api.example.com/users/123');
      });
    });

    it('all generators produce valid-looking code', () => {
      const languages = getSupportedLanguages();

      languages.forEach(({ value: lang }) => {
        const result = generateCode(postRequestData, lang);

        expect(result).toContain('https://api.example.com/users');
        expect(result.toUpperCase()).toContain('POST');
        expect(result).toContain('Bearer token123');
      });
    });
  });
});
