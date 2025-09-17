import { RequestData } from '@/types/interfaces';

export const generateCurl = (data: RequestData): string => {
  const { method, url, headers, body } = data;

  let curl = `curl -X ${method.toUpperCase()}`;

  Object.entries(headers).forEach(([key, value]) => {
    curl += ` \\\n  -H "${key}: ${value}"`;
  });

  if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    curl += ` \\\n  -d '${body}'`;
  }

  curl += ` \\\n  "${url}"`;

  return curl;
};

export const generateJavaScriptFetch = (data: RequestData): string => {
  const { method, url, headers, body } = data;

  const headersObj =
    Object.keys(headers).length > 0 ? `,\n  headers: ${JSON.stringify(headers, null, 2)}` : '';

  const bodyStr =
    body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())
      ? `,\n  body: ${JSON.stringify(body)}`
      : '';

  return `fetch('${url}', {
  method: '${method.toUpperCase()}'${headersObj}${bodyStr}
})
  .then(response => response.json())
  .then(data => {
    document.getElementById('result').textContent = JSON.stringify(data, null, 2);
  })
  .catch(error => {
    console.error('Error:', error);
  });`;
};

export const generateJavaScriptXHR = (data: RequestData): string => {
  const { method, url, headers, body } = data;

  const xhr = `const xhr = new XMLHttpRequest();
xhr.open('${method.toUpperCase()}', '${url}');

// Set headers
${Object.entries(headers)
  .map(([key, value]) => `xhr.setRequestHeader('${key}', '${value}');`)
  .join('\n')}

xhr.onreadystatechange = function() {
  if (xhr.readyState === 4) {
    if (xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);
      document.getElementById('result').textContent = JSON.stringify(data, null, 2);
    } else {
      console.error('Error:', xhr.status);
    }
  }
};

xhr.send(${body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) ? `'${body}'` : 'null'});`;

  return xhr;
};

export const generateNodeJS = (data: RequestData): string => {
  const { method, url, headers, body } = data;

  const headersObj =
    Object.keys(headers).length > 0 ? `,\n  headers: ${JSON.stringify(headers, null, 2)}` : '';

  const bodyStr =
    body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())
      ? `,\n  body: ${JSON.stringify(body)}`
      : '';

  return `const https = require('https');
const http = require('http');

const options = {
  method: '${method.toUpperCase()}'${headersObj}${bodyStr}
};

const req = ${url.startsWith('https') ? 'https' : 'http'}.request('${url}', options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    const responseData = JSON.parse(data);
    process.stdout.write(JSON.stringify(responseData, null, 2));
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();`;
};

export const generatePython = (data: RequestData): string => {
  const { method, url, headers, body } = data;

  const headersStr =
    Object.keys(headers).length > 0 ? `\nheaders = ${JSON.stringify(headers, null, 2)}` : '';

  const bodyStr =
    body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())
      ? `\ndata = ${JSON.stringify(body)}`
      : '';

  const paramsStr = headersStr || bodyStr ? ',' : '';

  return `import requests

${headersStr}${bodyStr}

response = requests.${method.toLowerCase()}('${url}'${paramsStr}${headersStr ? '\n    headers=headers' : ''}${bodyStr ? '\n    data=data' : ''})

print(response.json())`;
};

export const generateJava = (data: RequestData): string => {
  const { method, url, headers, body } = data;

  const headersCode = Object.entries(headers)
    .map(([key, value]) => `        connection.setRequestProperty("${key}", "${value}");`)
    .join('\n');

  const bodyCode =
    body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())
      ? `
        // Write body
        try (OutputStream os = connection.getOutputStream()) {
            byte[] input = "${body}".getBytes("utf-8");
            os.write(input, 0, input.length);
        }`
      : '';

  return `import java.io.*;
import java.net.*;

public class Request {
    public static void main(String[] args) throws Exception {
        URL url = new URL("${url}");
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("${method.toUpperCase()}");
        connection.setRequestProperty("Content-Type", "application/json");
${headersCode}
        connection.setDoOutput(true);
${bodyCode}
        
        int responseCode = connection.getResponseCode();
        System.out.println("Response Code: " + responseCode);
        
        BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
        String inputLine;
        StringBuffer response = new StringBuffer();
        
        while ((inputLine = in.readLine()) != null) {
            response.append(inputLine);
        }
        in.close();
        
        System.out.println(response.toString());
    }
}`;
};

export const generateCSharp = (data: RequestData): string => {
  const { method, url, headers, body } = data;

  const headersCode = Object.entries(headers)
    .map(([key, value]) => `            client.DefaultRequestHeaders.Add("${key}", "${value}");`)
    .join('\n');

  const bodyCode =
    body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())
      ? `            var content = new StringContent("${body}", Encoding.UTF8, "application/json");`
      : '';

  const methodCall =
    body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())
      ? `client.${method.charAt(0).toUpperCase() + method.slice(1).toLowerCase()}Async("${url}", content)`
      : `client.${method.charAt(0).toUpperCase() + method.slice(1).toLowerCase()}Async("${url}")`;

  return `using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        using var client = new HttpClient();
        client.DefaultRequestHeaders.Add("Content-Type", "application/json");
${headersCode}
${bodyCode}
        
        try
        {
            var response = await ${methodCall};
            var result = await response.Content.ReadAsStringAsync();
            Console.WriteLine(result);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}`;
};

export const generateGo = (data: RequestData): string => {
  const { method, url, headers, body } = data;

  const headersCode = Object.entries(headers)
    .map(([key, value]) => `    req.Header.Set("${key}", "${value}")`)
    .join('\n');

  const bodyCode =
    body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())
      ? `
    var jsonStr = []byte(\`${body}\`)
    req.Body = ioutil.NopCloser(bytes.NewBuffer(jsonStr))`
      : '';

  return `package main

import (
    "bytes"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    url := "${url}"
    method := "${method.toUpperCase()}"
    
    req, err := http.NewRequest(method, url, nil)
    if err != nil {
        panic(err)
    }
    
    req.Header.Set("Content-Type", "application/json")
${headersCode}${bodyCode}
    
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()
    
    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        panic(err)
    }
    
    fmt.Println(string(body))
}`;
};

export const generateCode = (data: RequestData, language: string): string => {
  switch (language) {
    case 'curl':
      return generateCurl(data);
    case 'javascript-fetch':
      return generateJavaScriptFetch(data);
    case 'javascript-xhr':
      return generateJavaScriptXHR(data);
    case 'nodejs':
      return generateNodeJS(data);
    case 'python':
      return generatePython(data);
    case 'java':
      return generateJava(data);
    case 'csharp':
      return generateCSharp(data);
    case 'go':
      return generateGo(data);
    default:
      return 'Unsupported language';
  }
};

export const getSupportedLanguages = () => [
  { value: 'curl', label: 'cURL' },
  { value: 'javascript-fetch', label: 'JavaScript (Fetch)' },
  { value: 'javascript-xhr', label: 'JavaScript (XHR)' },
  { value: 'nodejs', label: 'Node.js' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
];
