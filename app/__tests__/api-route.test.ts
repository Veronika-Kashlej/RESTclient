import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../api/request/route';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('/api/request POST handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 when method is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/request', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://api.example.com' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Method and URL are required');
  });

  it('should return 400 when URL is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/request', {
      method: 'POST',
      body: JSON.stringify({ method: 'GET' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Method and URL are required');
  });

  it('should make GET request successfully', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: new Headers({
        'content-type': 'application/json',
        'x-custom': 'value',
      }),
      json: () => Promise.resolve({ message: 'Success' }),
    };

    mockFetch.mockResolvedValueOnce(mockResponse);

    const request = new NextRequest('http://localhost:3000/api/request', {
      method: 'POST',
      body: JSON.stringify({
        method: 'GET',
        url: 'https://api.example.com/test',
        headers: { Authorization: 'Bearer token' },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe(200);
    expect(data.statusText).toBe('OK');
    expect(data.headers).toEqual({
      'content-type': 'application/json',
      'x-custom': 'value',
    });
    expect(data.data).toEqual({ message: 'Success' });
    expect(typeof data.time).toBe('number');

    expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/test', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token',
      },
    });
  });

  it('should make POST request with body', async () => {
    const mockResponse = {
      status: 201,
      statusText: 'Created',
      headers: new Headers({
        'content-type': 'application/json',
      }),
      json: () => Promise.resolve({ id: 1, created: true }),
    };

    mockFetch.mockResolvedValueOnce(mockResponse);

    const request = new NextRequest('http://localhost:3000/api/request', {
      method: 'POST',
      body: JSON.stringify({
        method: 'POST',
        url: 'https://api.example.com/posts',
        headers: { 'Content-Type': 'application/json' },
        body: '{"title": "Test Post"}',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe(201);
    expect(data.data).toEqual({ id: 1, created: true });

    expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: '{"title": "Test Post"}',
    });
  });

  it('should handle text response', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: new Headers({
        'content-type': 'text/plain',
      }),
      text: () => Promise.resolve('Plain text response'),
    };

    mockFetch.mockResolvedValueOnce(mockResponse);

    const request = new NextRequest('http://localhost:3000/api/request', {
      method: 'POST',
      body: JSON.stringify({
        method: 'GET',
        url: 'https://api.example.com/text',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toBe('Plain text response');
  });

  it('should handle PUT request with body', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ updated: true }),
    };

    mockFetch.mockResolvedValueOnce(mockResponse);

    const request = new NextRequest('http://localhost:3000/api/request', {
      method: 'POST',
      body: JSON.stringify({
        method: 'PUT',
        url: 'https://api.example.com/posts/1',
        body: '{"title": "Updated Post"}',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual({ updated: true });

    expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/posts/1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: '{"title": "Updated Post"}',
    });
  });

  it('should handle PATCH request with body', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ patched: true }),
    };

    mockFetch.mockResolvedValueOnce(mockResponse);

    const request = new NextRequest('http://localhost:3000/api/request', {
      method: 'POST',
      body: JSON.stringify({
        method: 'PATCH',
        url: 'https://api.example.com/posts/1',
        body: '{"title": "Patched Post"}',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual({ patched: true });

    expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/posts/1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: '{"title": "Patched Post"}',
    });
  });

  it('should not include body for GET request', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ data: 'test' }),
    };

    mockFetch.mockResolvedValueOnce(mockResponse);

    const request = new NextRequest('http://localhost:3000/api/request', {
      method: 'POST',
      body: JSON.stringify({
        method: 'GET',
        url: 'https://api.example.com/test',
        body: '{"should": "not be included"}',
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);

    expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/test', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  it('should handle fetch error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const request = new NextRequest('http://localhost:3000/api/request', {
      method: 'POST',
      body: JSON.stringify({
        method: 'GET',
        url: 'https://api.example.com/test',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Network error');
  });

  it('should handle non-Error exception', async () => {
    mockFetch.mockRejectedValueOnce('String error');

    const request = new NextRequest('http://localhost:3000/api/request', {
      method: 'POST',
      body: JSON.stringify({
        method: 'GET',
        url: 'https://api.example.com/test',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Request failed');
  });

  it('should measure request time', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ data: 'test' }),
    };

    const mockNow = vi.fn().mockReturnValueOnce(1000).mockReturnValueOnce(1150);

    vi.spyOn(Date, 'now').mockImplementation(mockNow);

    mockFetch.mockResolvedValueOnce(mockResponse);

    const request = new NextRequest('http://localhost:3000/api/request', {
      method: 'POST',
      body: JSON.stringify({
        method: 'GET',
        url: 'https://api.example.com/test',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.time).toBe(150);

    vi.restoreAllMocks();
  });
});
