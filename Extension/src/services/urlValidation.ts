/**
 * URL validation, normalization, and sanitization service
 */

export interface ValidationResult {
  isValid: boolean;
  normalizedUrl: string | null;
  domain: string | null;
  sanitizedPreview: string | null;
  isRestricted: boolean;
  errorMessage?: string;
}

/**
 * List of browser internal or restricted protocol prefixes
 */
const RESTRICTED_SCHEMES = [
  'chrome:',
  'chrome-extension:',
  'edge:',
  'brave:',
  'opera:',
  'about:',
  'view-source:',
  'file:',
  'data:',
  'javascript:',
  'blob:',
];

/**
 * Hostnames where Chrome strictly disallows extensions from inspecting or injecting
 */
const RESTRICTED_HOSTS = [
  'chromewebstore.google.com',
  'chrome.google.com',
  'microsoftedge.microsoft.com',
];

/**
 * Sensitive query parameter names that should be redacted from UI previews
 */
const SENSITIVE_QUERY_PARAMS = [
  'token',
  'access_token',
  'id_token',
  'auth',
  'key',
  'api_key',
  'apikey',
  'secret',
  'password',
  'passwd',
  'code',
  'session',
  'sig',
  'signature',
];

/**
 * Validates, normalizes, and sanitizes a candidate URL
 */
export function validateUrl(rawUrl: string | undefined | null): ValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      isValid: false,
      normalizedUrl: null,
      domain: null,
      sanitizedPreview: null,
      isRestricted: false,
      errorMessage: 'No active tab URL detected.',
    };
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return {
      isValid: false,
      normalizedUrl: null,
      domain: null,
      sanitizedPreview: null,
      isRestricted: false,
      errorMessage: 'Empty URL provided.',
    };
  }

  // 1. Check for browser internal / restricted protocols
  const lowerUrl = trimmed.toLowerCase();
  for (const scheme of RESTRICTED_SCHEMES) {
    if (lowerUrl.startsWith(scheme)) {
      return {
        isValid: false,
        normalizedUrl: null,
        domain: 'Internal Browser Page',
        sanitizedPreview: trimmed.split('?')[0],
        isRestricted: true,
        errorMessage: `Restricted page (${scheme}//). Browser internal pages cannot be analyzed.`,
      };
    }
  }

  // 2. Parse URL
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      isValid: false,
      normalizedUrl: null,
      domain: null,
      sanitizedPreview: null,
      isRestricted: false,
      errorMessage: 'Invalid URL structure or malformed address.',
    };
  }

  // 3. Ensure protocol is standard HTTP or HTTPS
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      isValid: false,
      normalizedUrl: null,
      domain: parsed.hostname || null,
      sanitizedPreview: null,
      isRestricted: false,
      errorMessage: `Unsupported protocol (${parsed.protocol}). Only HTTP and HTTPS links can be analyzed.`,
    };
  }

  // 4. Ensure hostname exists and is not empty
  const hostname = parsed.hostname.toLowerCase();
  if (!hostname || hostname.includes(' ')) {
    return {
      isValid: false,
      normalizedUrl: null,
      domain: null,
      sanitizedPreview: null,
      isRestricted: false,
      errorMessage: 'Invalid or missing domain name.',
    };
  }

  // 5. Check restricted hosts (e.g. Chrome Web Store)
  if (RESTRICTED_HOSTS.includes(hostname)) {
    return {
      isValid: false,
      normalizedUrl: null,
      domain: hostname,
      sanitizedPreview: `${parsed.protocol}//${hostname}${parsed.pathname}`,
      isRestricted: true,
      errorMessage: 'Chrome Web Store pages are protected by the browser and cannot be analyzed.',
    };
  }

  // 6. Generate sanitized preview (redacting sensitive query params and shortening long paths)
  const sanitized = sanitizeUrlForDisplay(parsed);

  return {
    isValid: true,
    normalizedUrl: parsed.href,
    domain: hostname,
    sanitizedPreview: sanitized,
    isRestricted: false,
  };
}

/**
 * Creates a sanitized, safe preview of a URL without leaking sensitive query tokens
 */
export function sanitizeUrlForDisplay(parsed: URL): string {
  try {
    const clone = new URL(parsed.href);

    // Redact sensitive query parameters
    let hasRedactions = false;
    for (const key of Array.from(clone.searchParams.keys())) {
      if (SENSITIVE_QUERY_PARAMS.includes(key.toLowerCase())) {
        clone.searchParams.set(key, '***');
        hasRedactions = true;
      }
    }

    // Build compact preview
    const base = `${clone.protocol}//${clone.hostname}${clone.port ? `:${clone.port}` : ''}`;
    let path = clone.pathname;
    if (path.length > 40) {
      path = `${path.substring(0, 25)}...${path.substring(path.length - 12)}`;
    }

    const query = hasRedactions ? clone.search : clone.search;
    const full = `${base}${path}${query ? (query.length > 30 ? `${query.substring(0, 30)}...` : query) : ''}`;
    return full;
  } catch {
    return `${parsed.protocol}//${parsed.hostname}`;
  }
}
