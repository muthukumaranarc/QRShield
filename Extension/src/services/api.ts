import { UrlAnalysisResponse, AnalysisError } from '../types/analysis';
import { validateUrl } from './urlValidation';
import { validateAnalysisResponse } from './responseValidation';
import { setStoredBaseUrl } from './storage';

export interface ApiConfig {
  baseUrl: string;
  endpoint: string;
  timeoutMs: number;
}

const STORAGE_API_BASE_URL_KEY = 'qrshield_api_base_url_v1';
const STORAGE_API_ENDPOINT_KEY = 'qrshield_api_endpoint_v1';

/**
 * Resolves API configuration:
 * 1. Checks user-saved override in localStorage
 * 2. Falls back to Vite environment variables
 * 3. Defaults to http://60.8.4.223:8080 with endpoint /api/scan/analyze
 */
export function getApiConfig(): ApiConfig {
  let savedBaseUrl: string | null = null;
  let savedEndpoint: string | null = null;

  try {
    if (typeof localStorage !== 'undefined') {
      savedBaseUrl = localStorage.getItem(STORAGE_API_BASE_URL_KEY);
      savedEndpoint = localStorage.getItem(STORAGE_API_ENDPOINT_KEY);
      // Clean up legacy non-existent route from storage
      if (savedEndpoint === '/api/v1/url-analysis') {
        savedEndpoint = null;
        localStorage.removeItem(STORAGE_API_ENDPOINT_KEY);
      }
    }
  } catch {}

  const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env || {};

  const baseUrl = (savedBaseUrl || env.VITE_API_BASE_URL || 'http://60.8.4.223:8080').replace(/\/+$/, '');
  const rawEndpoint = savedEndpoint || env.VITE_API_ENDPOINT || '/api/scan/analyze';
  const endpoint = rawEndpoint.startsWith('/') ? rawEndpoint : `/${rawEndpoint}`;
  const timeoutMs = parseInt(env.VITE_API_TIMEOUT_MS || '6000', 10) || 6000;

  return { baseUrl, endpoint, timeoutMs };
}

/**
 * Saves a custom backend URL override
 */
export function saveApiBaseUrl(newBaseUrl: string): void {
  try {
    const cleaned = newBaseUrl.trim().replace(/\/+$/, '');
    localStorage.setItem(STORAGE_API_BASE_URL_KEY, cleaned);
    setStoredBaseUrl(cleaned).catch(() => {});
  } catch {}
}

/**
 * Clears custom override and resets to default
 */
export function resetApiBaseUrl(): void {
  try {
    localStorage.removeItem(STORAGE_API_BASE_URL_KEY);
    localStorage.removeItem(STORAGE_API_ENDPOINT_KEY);
  } catch {}
}

/**
 * Checks if the backend server health endpoint is responding
 */
export async function checkBackendHealth(targetBaseUrl?: string): Promise<{ isUp: boolean; version?: string }> {
  const config = getApiConfig();
  const base = (targetBaseUrl || config.baseUrl).replace(/\/+$/, '');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${base}/api/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return { isUp: true, version: data.version };
    }
  } catch {
    // Offline or timed out
  }

  return { isUp: false };
}

/**
 * Sends a URL to the backend security analysis endpoint.
 * Supports fallback between `/api/scan/analyze` and `/api/v1/url-analysis`.
 */
export async function analyzeUrl(
  url: string,
  userSignal?: AbortSignal
): Promise<UrlAnalysisResponse> {
  // 1. Client-side URL Validation
  const validation = validateUrl(url);
  if (!validation.isValid) {
    const error: AnalysisError = {
      message: validation.errorMessage || 'Invalid URL cannot be analyzed.',
      details: 'Please ensure the link is a valid HTTP or HTTPS web address.',
    };
    throw error;
  }

  const targetUrl = validation.normalizedUrl!;
  const config = getApiConfig();

  // 2. Setup Timeout & Abort Controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(new Error(`Analysis request timed out after ${config.timeoutMs / 1000}s`));
  }, config.timeoutMs);

  if (userSignal) {
    userSignal.addEventListener('abort', () => controller.abort(userSignal.reason));
  }

  // 3. Try primary endpoint (/api/scan/analyze), with automatic fallback
  const endpointsToTry = [
    '/api/scan/analyze',
    config.endpoint !== '/api/scan/analyze' ? config.endpoint : '/api/v1/url-analysis',
  ];

  let lastError: AnalysisError | null = null;

  for (const endpoint of endpointsToTry) {
    const requestUrl = `${config.baseUrl}${endpoint}`;

    try {
      const startTime = performance.now();
      const payload = {
        url: targetUrl,
        source: 'MANUAL_URL',
        notes: 'Submitted from QRShield Chrome Extension',
      };

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const latencyMs = Math.round(performance.now() - startTime);

      // If route does not exist on server (Spring Boot 404 or 500 "No static resource"), try fallback route
      if (!response.ok) {
        let errorBody = '';
        try {
          const errorJson = await response.json();
          errorBody = errorJson.message || errorJson.error || JSON.stringify(errorJson);
        } catch {
          errorBody = await response.text().catch(() => '');
        }

        const isRouteNotFound =
          response.status === 404 ||
          (response.status === 500 && (errorBody.includes('No static resource') || errorBody.includes('not found')));

        if (isRouteNotFound && endpoint !== endpointsToTry[endpointsToTry.length - 1]) {
          continue;
        }

        clearTimeout(timeoutId);

        const error: AnalysisError = {
          message: `Backend analysis service returned HTTP ${response.status}`,
          details: errorBody || `The server at ${config.baseUrl}${endpoint} returned status ${response.status}.`,
          isNetworkError: false,
        };
        throw error;
      }

      const rawData = await response.json();

      // Explicit developer log proving live backend communication
      console.log(
        `%c[QRShield Backend API]%c POST ${requestUrl} -> HTTP ${response.status} (${latencyMs}ms)`,
        'color: #3b82f6; font-weight: bold;',
        'color: inherit;',
        {
          url: targetUrl,
          scanId: rawData.id || rawData.scanId,
          status: rawData.status,
          riskScore: rawData.riskScore,
          provider: rawData.providerName,
          ip: rawData.ipAddress,
        }
      );

      clearTimeout(timeoutId);
      return validateAnalysisResponse(rawData, targetUrl, {
        latencyMs,
        sourceServer: config.baseUrl,
        fromCache: false,
      });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'isNetworkError' in err && (err as AnalysisError).isNetworkError === false) {
        throw err;
      }
      if (controller.signal.aborted) {
        clearTimeout(timeoutId);
        const error: AnalysisError = {
          message: 'Request timed out or cancelled.',
          details: `The server took longer than ${config.timeoutMs / 1000}s to respond. Check if the backend is running at ${config.baseUrl}.`,
          isNetworkError: true,
        };
        throw error;
      }

      const standardErr = err as Error;
      if (standardErr.name === 'AbortError') {
        clearTimeout(timeoutId);
        const error: AnalysisError = {
          message: 'Request timed out or cancelled.',
          details: `The server took longer than ${config.timeoutMs / 1000}s to respond. Check if the backend is running at ${config.baseUrl}.`,
          isNetworkError: true,
        };
        throw error;
      }

      // If it's already a formatted AnalysisError, keep it
      if (err && typeof err === 'object' && 'message' in err && !('name' in err)) {
        lastError = err as AnalysisError;
      } else {
        lastError = {
          message: 'Network connection failed.',
          details: `Could not connect to ${config.baseUrl}. Please verify the host IP is reachable from this machine or switch to localhost:8080 in Settings.`,
          isNetworkError: true,
        };
      }
    }
  }

  clearTimeout(timeoutId);
  throw (
    lastError || {
      message: 'Network connection failed.',
      details: `Could not reach ${config.baseUrl}.`,
      isNetworkError: true,
    }
  );
}

/**
 * Deterministic client-side heuristic evaluation for offline testing & demonstration
 */
export function simulateLocalAnalysis(rawUrl: string): UrlAnalysisResponse {
  const parsed = new URL(rawUrl);
  const domain = parsed.hostname.toLowerCase();
  const lowerUrl = rawUrl.toLowerCase();
  const isHttps = parsed.protocol === 'https:';

  let riskScore = 10;
  let verdict: UrlAnalysisResponse['verdict'] = 'SAFE';
  const indicators: UrlAnalysisResponse['indicators'] = [];

  // Check IP host
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(domain)) {
    riskScore = 88;
    verdict = 'MALICIOUS';
    indicators.push({
      id: 'ip_host',
      title: 'Direct IP Address Host',
      description: 'The URL connects directly to a numerical IP address instead of a recognized domain.',
      severity: 'HIGH',
    });
  }

  // Check deceptive keywords
  const keywords = ['login-verify', 'verify-account', 'paypal-security', 'bank-update', 'wallet-connect', 'malware'];
  const matched = keywords.find(kw => lowerUrl.includes(kw));
  if (matched) {
    riskScore = 85;
    verdict = 'MALICIOUS';
    indicators.push({
      id: 'deceptive_kw',
      title: 'Deceptive Credential Keyword',
      description: `URL contains phishing keywords ("${matched}") mimicking trusted authentication services.`,
      severity: 'HIGH',
    });
  }

  // Check URL shorteners
  const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'is.gd', 'rb.gy'];
  if (shorteners.some(s => domain.includes(s))) {
    riskScore = Math.max(riskScore, 55);
    if (verdict !== 'MALICIOUS') verdict = 'SUSPICIOUS';
    indicators.push({
      id: 'shortener',
      title: 'Shortened URL Obfuscation',
      description: 'Destination domain is obscured through a shortlink redirection service.',
      severity: 'MEDIUM',
    });
  }

  // Check plain HTTP
  if (!isHttps) {
    riskScore = Math.max(riskScore, 50);
    if (verdict !== 'MALICIOUS') verdict = 'SUSPICIOUS';
    indicators.push({
      id: 'unencrypted_http',
      title: 'Unencrypted HTTP Protocol',
      description: 'Connection uses plain unencrypted HTTP. Data in transit can be intercepted.',
      severity: 'MEDIUM',
    });
  }

  let summary = '';
  if (verdict === 'MALICIOUS') {
    summary = 'Multiple high-risk indicators detected. This site exhibits signs of credential theft or deception.';
  } else if (verdict === 'SUSPICIOUS') {
    summary = 'Potential risk indicators identified. Proceed with caution and verify the domain address.';
  } else {
    summary = 'No deceptive patterns or known threats detected in domain structure.';
  }

  return {
    url: rawUrl,
    verdict,
    riskScore,
    summary,
    indicators,
    analyzedAt: new Date().toISOString(),
  };
}
