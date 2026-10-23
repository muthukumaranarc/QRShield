export type PayloadType = 'URL' | 'WIFI' | 'VCARD' | 'TEXT' | 'CUSTOM_SCHEME';

export interface ParsedPayload {
  type: PayloadType;
  raw: string;
  normalizedUrl?: string;
  domain?: string;
  scheme?: string;
  isValidWebUrl: boolean;
  errorMessage?: string;
}

/**
 * Parses and validates raw QR code or text input payloads
 */
export function parseAndValidatePayload(input: string): ParsedPayload {
  const trimmed = (input || '').trim();

  if (!trimmed) {
    return {
      type: 'TEXT',
      raw: trimmed,
      isValidWebUrl: false,
      errorMessage: 'Input cannot be empty.',
    };
  }

  // Check for Wi-Fi QR
  if (trimmed.startsWith('WIFI:')) {
    return {
      type: 'WIFI',
      raw: trimmed,
      isValidWebUrl: false,
      errorMessage: 'This QR code contains Wi-Fi network configuration, not a web link.',
    };
  }

  // Check for vCard contact
  if (trimmed.startsWith('BEGIN:VCARD')) {
    return {
      type: 'VCARD',
      raw: trimmed,
      isValidWebUrl: false,
      errorMessage: 'This QR code contains a contact card (vCard), not a web link.',
    };
  }

  // Check for dangerous or custom schemes
  const schemeMatch = trimmed.match(/^([a-zA-Z0-9+.-]+):/);
  if (schemeMatch) {
    const scheme = schemeMatch[1].toLowerCase();
    if (['javascript', 'data', 'file', 'vbscript', 'intent'].includes(scheme)) {
      return {
        type: 'CUSTOM_SCHEME',
        raw: trimmed,
        scheme,
        isValidWebUrl: false,
        errorMessage: `Unsafe or prohibited URL scheme detected (${scheme}:).`,
      };
    }

    if (scheme !== 'http' && scheme !== 'https') {
      return {
        type: 'CUSTOM_SCHEME',
        raw: trimmed,
        scheme,
        isValidWebUrl: false,
        errorMessage: `App / custom protocol link detected (${scheme}:). Web verification is limited.`,
      };
    }
  }

  // Attempt URL normalization
  let candidate = trimmed;
  if (!/^https?:\/\//i.test(candidate)) {
    // If it looks like a domain name e.g. "example.com/foo"
    if (/^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/i.test(candidate)) {
      candidate = `https://${candidate}`;
    } else {
      return {
        type: 'TEXT',
        raw: trimmed,
        isValidWebUrl: false,
        errorMessage: 'Content does not appear to be a valid web link.',
      };
    }
  }

  try {
    const parsed = new URL(candidate);
    const domain = parsed.hostname;
    const scheme = parsed.protocol.replace(':', '');

    return {
      type: 'URL',
      raw: trimmed,
      normalizedUrl: parsed.toString(),
      domain,
      scheme,
      isValidWebUrl: true,
    };
  } catch {
    return {
      type: 'TEXT',
      raw: trimmed,
      isValidWebUrl: false,
      errorMessage: 'Malformed or invalid URL syntax.',
    };
  }
}

/**
 * Formats a long URL nicely for display with clean domain emphasis
 */
export function formatUrlForDisplay(url: string, maxLength: number = 42): string {
  if (!url) return '';
  if (url.length <= maxLength) return url;
  try {
    const parsed = new URL(url);
    const domain = parsed.hostname;
    const path = parsed.pathname + parsed.search;
    if (domain.length + 10 >= maxLength) {
      return `${url.substring(0, maxLength - 3)}...`;
    }
    const remaining = maxLength - domain.length - 4;
    return `${domain}/...${path.slice(-remaining)}`;
  } catch {
    return `${url.substring(0, maxLength - 3)}...`;
  }
}
