import { ActiveTabInfo } from '../types/analysis';
import { validateUrl } from './urlValidation';

/**
 * Retrieves the currently active browser tab URL in the current window.
 * Strictly uses the least-privilege `activeTab` permission.
 * Includes graceful fallback for local development browser testing.
 */
export async function getActiveTab(): Promise<ActiveTabInfo> {
  // Check if running inside actual Chrome extension environment
  if (typeof chrome !== 'undefined' && chrome.tabs && typeof chrome.tabs.query === 'function') {
    return new Promise(resolve => {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (chrome.runtime.lastError) {
          resolve(createFallbackTab(undefined, 'Chrome tab query failed: ' + chrome.runtime.lastError.message));
          return;
        }

        if (!tabs || tabs.length === 0) {
          resolve(createFallbackTab(undefined, 'No active tab found in current window.'));
          return;
        }

        const activeTab = tabs[0];
        const validation = validateUrl(activeTab.url);

        resolve({
          id: activeTab.id,
          url: activeTab.url || '',
          domain: validation.domain || 'Unknown Domain',
          sanitizedUrl: validation.sanitizedPreview || activeTab.url || '',
          isInspectable: validation.isValid,
          restrictionReason: validation.isRestricted || !validation.isValid ? validation.errorMessage : undefined,
          title: activeTab.title,
          favIconUrl: activeTab.favIconUrl,
        });
      });
    });
  }

  // Local development / mock browser preview fallback
  const mockUrl = 'https://example.com/login-verify?session_id=abc123xyz&ref=partner';
  const validation = validateUrl(mockUrl);

  return {
    url: mockUrl,
    domain: validation.domain || 'example.com',
    sanitizedUrl: validation.sanitizedPreview || mockUrl,
    isInspectable: true,
    title: 'Example Domain (Local Development Preview)',
  };
}

function createFallbackTab(url?: string, restrictionReason?: string): ActiveTabInfo {
  return {
    url: url || '',
    domain: 'N/A',
    sanitizedUrl: url || 'No URL detected',
    isInspectable: false,
    restrictionReason: restrictionReason || 'Unable to inspect current tab.',
  };
}
