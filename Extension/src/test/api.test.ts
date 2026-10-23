import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analyzeUrl, getApiConfig } from '../services/api';

describe('API Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reads API configuration with safe defaults', () => {
    const config = getApiConfig();
    expect(config.baseUrl).toBeTruthy();
    expect(config.endpoint).toBeTruthy();
    expect(config.timeoutMs).toBeGreaterThan(0);
  });

  it('rejects invalid or non-HTTP URLs before network dispatch', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    await expect(analyzeUrl('chrome://settings')).rejects.toMatchObject({
      message: expect.stringContaining('Restricted page'),
    });

    await expect(analyzeUrl('ftp://example.com/file')).rejects.toMatchObject({
      message: expect.stringContaining('Unsupported protocol'),
    });

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('sends standard POST payload and parses response successfully', async () => {
    const mockResponse = {
      url: 'https://example.com',
      verdict: 'SAFE',
      riskScore: 8,
      summary: 'Verified clean destination.',
      indicators: [],
      analyzedAt: '2026-10-24T10:00:00Z',
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    } as Response);

    const result = await analyzeUrl('https://example.com');
    expect(result.verdict).toBe('SAFE');
    expect(result.riskScore).toBe(8);
    expect(result.summary).toBe('Verified clean destination.');
  });

  it('handles backend HTTP 500 errors gracefully with informative error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Internal Sandbox Crash' }),
    } as Response);

    await expect(analyzeUrl('https://example.com')).rejects.toMatchObject({
      message: expect.stringContaining('HTTP 500'),
      details: expect.stringContaining('Internal Sandbox Crash'),
      isNetworkError: false,
    });
  });

  it('handles network connection failures and refuses to mark safe', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(analyzeUrl('https://example.com')).rejects.toMatchObject({
      message: expect.stringContaining('Network connection failed'),
      isNetworkError: true,
    });
  });

  it('supports user cancellation via AbortController signal', async () => {
    const controller = new AbortController();

    vi.spyOn(globalThis, 'fetch').mockImplementationOnce((_url, init) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          const err = new Error('Aborted');
          err.name = 'AbortError';
          reject(err);
        });
      });
    });

    const promise = analyzeUrl('https://example.com', controller.signal);
    controller.abort();

    await expect(promise).rejects.toMatchObject({
      message: expect.stringContaining('timed out or cancelled'),
    });
  });
});
