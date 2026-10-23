import { describe, it, expect } from 'vitest';
import { validateAnalysisResponse, sanitizeText } from '../services/responseValidation';

describe('Response Validation & Sanitization Service', () => {
  describe('Standard Contract Parsing', () => {
    it('parses a valid proposed response schema correctly', () => {
      const raw = {
        url: 'https://example.com',
        verdict: 'SAFE',
        riskScore: 5,
        summary: 'No significant threats detected.',
        indicators: [
          {
            id: 'ind_1',
            title: 'TLS Valid',
            description: 'Valid certificate issued by Let\'s Encrypt',
            severity: 'LOW',
          },
        ],
        analyzedAt: '2026-10-24T10:00:00Z',
      };

      const parsed = validateAnalysisResponse(raw, 'https://example.com');
      expect(parsed.url).toBe('https://example.com');
      expect(parsed.verdict).toBe('SAFE');
      expect(parsed.riskScore).toBe(5);
      expect(parsed.summary).toBe('No significant threats detected.');
      expect(parsed.indicators).toHaveLength(1);
      expect(parsed.indicators[0].title).toBe('TLS Valid');
      expect(parsed.analyzedAt).toBe('2026-10-24T10:00:00.000Z');
    });

    it('parses SUSPICIOUS and MALICIOUS verdicts correctly', () => {
      expect(validateAnalysisResponse({ verdict: 'SUSPICIOUS' }, 'https://test.com').verdict).toBe('SUSPICIOUS');
      expect(validateAnalysisResponse({ verdict: 'MALICIOUS' }, 'https://test.com').verdict).toBe('MALICIOUS');
      expect(validateAnalysisResponse({ verdict: 'malicious' }, 'https://test.com').verdict).toBe('MALICIOUS');
    });
  });

  describe('Malformed and Unexpected Responses', () => {
    it('throws when payload is null or not an object', () => {
      expect(() => validateAnalysisResponse(null, 'https://x.com')).toThrow('Malformed API response');
      expect(() => validateAnalysisResponse('invalid-json-string', 'https://x.com')).toThrow('Malformed API response');
      expect(() => validateAnalysisResponse(12345, 'https://x.com')).toThrow('Malformed API response');
    });

    it('falls back to UNKNOWN verdict when verdict is missing or unrecognizable', () => {
      const raw = {
        url: 'https://unknown-response.com',
        verdict: 'SOME_WEIRD_VERDICT',
      };
      const parsed = validateAnalysisResponse(raw, 'https://unknown-response.com');
      expect(parsed.verdict).toBe('UNKNOWN');
    });

    it('handles invalid risk scores (negative, >100, NaN) by setting null', () => {
      expect(validateAnalysisResponse({ riskScore: -10 }, 'https://x.com').riskScore).toBeNull();
      expect(validateAnalysisResponse({ riskScore: 105 }, 'https://x.com').riskScore).toBeNull();
      expect(validateAnalysisResponse({ riskScore: NaN }, 'https://x.com').riskScore).toBeNull();
      expect(validateAnalysisResponse({ riskScore: 78.6 }, 'https://x.com').riskScore).toBe(79);
    });

    it('falls back to current timestamp if analyzedAt is invalid', () => {
      const parsed = validateAnalysisResponse({ analyzedAt: 'invalid-date' }, 'https://x.com');
      expect(new Date(parsed.analyzedAt).getTime()).not.toBeNaN();
    });
  });

  describe('Spring Boot QRShield Backend Schema Compatibility', () => {
    it('adapts riskCategory and status from QRShield backend', () => {
      const springBootPayload = {
        id: 'scan_123',
        originalUrl: 'https://paypa1-security.net',
        riskScore: 85,
        riskCategory: 'HIGH',
        status: 'DANGEROUS',
        warningSigns: [
          'Deceptive domain mimicking legitimate brand paypal',
          'High-risk top level domain',
        ],
        scannedAt: '2026-10-24T09:30:00',
      };

      const parsed = validateAnalysisResponse(springBootPayload, 'https://paypa1-security.net');
      expect(parsed.verdict).toBe('MALICIOUS');
      expect(parsed.riskScore).toBe(85);
      expect(parsed.indicators).toHaveLength(2);
      expect(parsed.indicators[0].title).toContain('Deceptive domain');
    });

    it('elevates unencrypted HTTP payload from SAFE to SUSPICIOUS with min score 50 (e.g. neverssl test case)', () => {
      const neverSslPayload = {
        domain: 'transcendentclearfinebirds.neverssl.com',
        https: false,
        protocol: 'HTTP',
        riskCategory: 'LOW',
        riskScore: 15,
        status: 'SAFE',
        warningSigns: [
          'Unencrypted HTTP Protocol: Link does not use HTTPS encryption. Traffic can be eavesdropped, altered, or intercepted via Man-in-the-Middle (MitM) attacks.',
        ],
      };

      const parsed = validateAnalysisResponse(
        neverSslPayload,
        'http://transcendentclearfinebirds.neverssl.com'
      );

      expect(parsed.verdict).toBe('SUSPICIOUS');
      expect(parsed.riskScore).toBe(50);
      expect(parsed.indicators.length).toBeGreaterThanOrEqual(1);
      expect(parsed.indicators[0].title).toContain('Unencrypted HTTP Protocol');
      expect(parsed.summary).toContain('Unencrypted HTTP Protocol');
    });

    it('ensures plain http URL without warning signs is also elevated to SUSPICIOUS', () => {
      const plainHttpSafe = {
        url: 'http://example.org',
        verdict: 'SAFE',
        riskScore: 10,
      };

      const parsed = validateAnalysisResponse(plainHttpSafe, 'http://example.org');
      expect(parsed.verdict).toBe('SUSPICIOUS');
      expect(parsed.riskScore).toBe(50);
      expect(parsed.indicators.some((i) => i.title.includes('HTTP'))).toBe(true);
    });

    it('correctly keeps SAFE verdict and 0 score when backend returns benign warningSigns (e.g. youtube.com)', () => {
      const youtubePayload = {
        domain: 'www.youtube.com',
        https: true,
        protocol: 'HTTPS',
        riskCategory: 'LOW',
        riskScore: 0,
        status: 'SAFE',
        warningSigns: [
          'No significant cybersecurity threats or deceptive patterns detected.',
        ],
      };

      const parsed = validateAnalysisResponse(youtubePayload, 'https://www.youtube.com');
      expect(parsed.verdict).toBe('SAFE');
      expect(parsed.riskScore).toBe(0);
      expect(parsed.indicators).toHaveLength(0);
      expect(parsed.summary).toBe('No significant cybersecurity threats or deceptive patterns detected.');
    });
  });

  describe('Untrusted Text Sanitization', () => {
    it('strips script tags and dangerous HTML from backend summaries and titles', () => {
      const raw = {
        verdict: 'SAFE',
        summary: '<script>alert("XSS")</script>Site is <b>legitimate</b>!',
        indicators: [
          {
            id: 'xss',
            title: '<img src=x onerror=alert(1)>Warning',
            description: '<a href="javascript:alert()">Click</a>',
            severity: 'HIGH',
          },
        ],
      };

      const parsed = validateAnalysisResponse(raw, 'https://x.com');
      expect(parsed.summary).toBe('Site is legitimate!');
      expect(parsed.indicators[0].title).toBe('Warning');
      expect(parsed.indicators[0].description).toBe('Click');
    });

    it('sanitizeText function removes control characters', () => {
      expect(sanitizeText('Hello\u0000World')).toBe('HelloWorld');
    });
  });
});
