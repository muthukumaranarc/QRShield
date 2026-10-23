import { describe, it, expect } from 'vitest';
import { validateUrl, sanitizeUrlForDisplay } from '../services/urlValidation';

describe('URL Validation & Sanitization Service', () => {
  describe('Valid HTTP and HTTPS URLs', () => {
    it('accepts standard HTTPS web addresses', () => {
      const result = validateUrl('https://example.com/login');
      expect(result.isValid).toBe(true);
      expect(result.isRestricted).toBe(false);
      expect(result.domain).toBe('example.com');
      expect(result.normalizedUrl).toBe('https://example.com/login');
    });

    it('accepts valid HTTP web addresses and normalizes casing', () => {
      const result = validateUrl('HTTP://SUBDOMAIN.EXAMPLE.ORG/PATH');
      expect(result.isValid).toBe(true);
      expect(result.domain).toBe('subdomain.example.org');
      expect(result.normalizedUrl).toBe('http://subdomain.example.org/PATH');
    });

    it('accepts URLs with ports and parameters', () => {
      const result = validateUrl('https://localhost:8080/dashboard?view=compact');
      expect(result.isValid).toBe(true);
      expect(result.domain).toBe('localhost');
    });
  });

  describe('Invalid URL Strings', () => {
    it('rejects undefined, null, or empty string', () => {
      expect(validateUrl(undefined).isValid).toBe(false);
      expect(validateUrl(null).isValid).toBe(false);
      expect(validateUrl('').isValid).toBe(false);
      expect(validateUrl('   ').isValid).toBe(false);
    });

    it('rejects unparseable random strings', () => {
      const result = validateUrl('not a url at all');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('Invalid URL structure');
    });
  });

  describe('Unsupported Protocols', () => {
    it('rejects javascript: pseudo-protocols', () => {
      const result = validateUrl('javascript:alert(1)');
      expect(result.isValid).toBe(false);
      expect(result.isRestricted).toBe(true);
    });

    it('rejects data: URIs', () => {
      const result = validateUrl('data:text/html,<h1>Hello</h1>');
      expect(result.isValid).toBe(false);
      expect(result.isRestricted).toBe(true);
    });

    it('rejects file: protocol', () => {
      const result = validateUrl('file:///C:/Windows/System32');
      expect(result.isValid).toBe(false);
      expect(result.isRestricted).toBe(true);
    });

    it('rejects ftp: protocol with informative message', () => {
      const result = validateUrl('ftp://ftp.is.co.za/linux');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('Unsupported protocol (ftp:)');
    });
  });

  describe('Browser-Internal & Restricted URLs', () => {
    it('identifies chrome:// extension settings pages as restricted', () => {
      const result = validateUrl('chrome://extensions/');
      expect(result.isValid).toBe(false);
      expect(result.isRestricted).toBe(true);
      expect(result.errorMessage).toContain('Restricted page (chrome://)');
    });

    it('identifies chrome-extension:// URLs as restricted', () => {
      const result = validateUrl('chrome-extension://abcdefghijklmnop/popup.html');
      expect(result.isValid).toBe(false);
      expect(result.isRestricted).toBe(true);
    });

    it('identifies about:blank as restricted', () => {
      const result = validateUrl('about:blank');
      expect(result.isValid).toBe(false);
      expect(result.isRestricted).toBe(true);
    });

    it('identifies Chrome Web Store pages as browser protected', () => {
      const result = validateUrl('https://chromewebstore.google.com/detail/some-extension/1234');
      expect(result.isValid).toBe(false);
      expect(result.isRestricted).toBe(true);
      expect(result.errorMessage).toContain('Chrome Web Store pages are protected');
    });
  });

  describe('Sensitive Query Parameter Sanitization', () => {
    it('redacts auth tokens and credentials from display preview', () => {
      const url = new URL('https://bank.com/transfer?account=123&token=secret_jwt_xyz&key=super_api_key');
      const preview = sanitizeUrlForDisplay(url);

      expect(preview).not.toContain('secret_jwt_xyz');
      expect(preview).not.toContain('super_api_key');
      expect(preview).toContain('token=***');
      expect(preview).toContain('key=***');
      expect(preview).toContain('account=123');
    });

    it('truncates excessively long URL paths cleanly in preview', () => {
      const url = new URL('https://example.com/very/long/nested/path/that/stretches/on/and/on/into/the/abyss/file.html');
      const preview = sanitizeUrlForDisplay(url);
      expect(preview).toContain('...');
    });
  });
});
