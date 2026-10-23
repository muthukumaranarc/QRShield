import { UrlAnalysisResponse, Verdict } from '../types/analysis';
import { analyzeUrl } from '../services/api';
import { saveCachedAnalysis, getCachedAnalysis, clearScanCache } from '../services/storage';
import { ExtensionRuntimeMessage } from '../types/messages';

// Keep track of active analysis promises to prevent duplicate simultaneous scans for the same URL
const inflightScans = new Map<string, Promise<UrlAnalysisResponse>>();

/**
 * Checks if a URL is eligible for security analysis (only standard http/https websites)
 */
function isInspectableUrl(url: string | undefined): boolean {
  if (!url) return false;
  const lower = url.trim().toLowerCase();
  if (!lower.startsWith('http://') && !lower.startsWith('https://')) {
    return false;
  }
  if (
    lower.startsWith('chrome://') ||
    lower.startsWith('chrome-extension://') ||
    lower.startsWith('devtools://') ||
    lower.startsWith('edge://') ||
    lower.startsWith('about:') ||
    lower.startsWith('view-source:')
  ) {
    return false;
  }
  return true;
}

/**
 * Updates the Chrome toolbar badge and tooltip for a tab
 */
function updateTabBadge(tabId: number, verdict: Verdict, riskScore: number | null) {
  if (typeof chrome === 'undefined' || !chrome.action) return;

  let text = '';
  let color = '#64748b';

  switch (verdict) {
    case 'SAFE':
      text = '✓';
      color = '#10b981';
      break;
    case 'SUSPICIOUS':
      text = '!';
      color = '#f59e0b';
      break;
    case 'MALICIOUS':
      text = '✕';
      color = '#ef4444';
      break;
    case 'UNKNOWN':
    default:
      text = '?';
      color = '#64748b';
      break;
  }

  chrome.action.setBadgeText({ tabId, text }).catch(() => {});
  chrome.action.setBadgeBackgroundColor({ tabId, color }).catch(() => {});
  chrome.action
    .setTitle({
      tabId,
      title: `QRShield: ${verdict} ${riskScore !== null ? `(${riskScore}/100)` : ''}`,
    })
    .catch(() => {});
}

/**
 * Core automatic scan routine for a tab and URL
 */
async function processTabAnalysis(
  tabId: number,
  url: string,
  force = false
): Promise<UrlAnalysisResponse | null> {
  if (!isInspectableUrl(url)) {
    chrome.action.setBadgeText({ tabId, text: '' }).catch(() => {});
    return null;
  }

  const cleanUrl = url.split('#')[0];

  // 1. Check cached analysis unless forced
  if (!force) {
    const cached = await getCachedAnalysis(tabId, cleanUrl);
    if (cached) {
      updateTabBadge(tabId, cached.verdict, cached.riskScore);
      // Notify content script of cached result
      chrome.tabs
        .sendMessage(tabId, {
          type: 'QRSHIELD_PAGE_ANALYSIS',
          payload: cached,
        })
        .catch(() => {});
      return cached;
    }
  }

  // 2. Set temporary '...' analyzing badge
  chrome.action.setBadgeText({ tabId, text: '...' }).catch(() => {});
  chrome.action.setBadgeBackgroundColor({ tabId, color: '#3b82f6' }).catch(() => {});

  // 3. Deduplicate in-flight requests for the same URL
  let scanPromise = inflightScans.get(cleanUrl);
  if (!scanPromise || force) {
    scanPromise = analyzeUrl(cleanUrl).finally(() => {
      inflightScans.delete(cleanUrl);
    });
    inflightScans.set(cleanUrl, scanPromise);
  }

  try {
    const result = await scanPromise;

    // 4. Cache & update badge
    await saveCachedAnalysis(tabId, cleanUrl, result);
    updateTabBadge(tabId, result.verdict, result.riskScore);

    // 5. Send report to content script for on-page display
    chrome.tabs
      .sendMessage(tabId, {
        type: 'QRSHIELD_PAGE_ANALYSIS',
        payload: result,
      })
      .catch(() => {
        // Tab might still be rendering or script not yet injected
      });

    return result;
  } catch (err) {
    console.warn('QRShield background analysis error for URL:', cleanUrl, err);
    chrome.action.setBadgeText({ tabId, text: '!' }).catch(() => {});
    chrome.action.setBadgeBackgroundColor({ tabId, color: '#94a3b8' }).catch(() => {});
    return null;
  }
}

// -------------------------------------------------------------
// Chrome Extension Event Listeners
// -------------------------------------------------------------

// Clear stale scan cache on install/update so fresh scan rules apply
if (typeof chrome !== 'undefined' && chrome.runtime?.onInstalled) {
  chrome.runtime.onInstalled.addListener(() => {
    clearScanCache().catch(() => {});
  });
}

// Listen to webNavigation onCompleted (Top-level frame navigations)
if (typeof chrome !== 'undefined' && chrome.webNavigation?.onCompleted) {
  chrome.webNavigation.onCompleted.addListener((details) => {
    if (details.frameId === 0 && details.tabId > 0 && details.url) {
      processTabAnalysis(details.tabId, details.url).catch(() => {});
    }
  });
}

// Listen to tabs onUpdated
if (typeof chrome !== 'undefined' && chrome.tabs?.onUpdated) {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tabId > 0) {
      processTabAnalysis(tabId, tab.url).catch(() => {});
    }
  });
}

// Listen to tab activation (switching tabs updates the toolbar badge)
if (typeof chrome !== 'undefined' && chrome.tabs?.onActivated) {
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
      const tab = await chrome.tabs.get(activeInfo.tabId);
      if (tab?.url && isInspectableUrl(tab.url)) {
        const cached = await getCachedAnalysis(activeInfo.tabId, tab.url);
        if (cached) {
          updateTabBadge(activeInfo.tabId, cached.verdict, cached.riskScore);
        } else {
          processTabAnalysis(activeInfo.tabId, tab.url).catch(() => {});
        }
      } else {
        chrome.action.setBadgeText({ tabId: activeInfo.tabId, text: '' }).catch(() => {});
      }
    } catch {}
  });
}

// Listen for messages from content scripts or popup
if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener(
    (message: ExtensionRuntimeMessage, sender, sendResponse) => {
      if (message.type === 'GET_ANALYSIS_FOR_URL') {
        const tabId = message.tabId || sender.tab?.id || 0;
        getCachedAnalysis(tabId, message.url).then((cached) => {
          if (cached) {
            sendResponse({ status: 'SUCCESS', result: cached });
          } else if (tabId > 0 && message.url) {
            // Trigger automatic scan and reply
            processTabAnalysis(tabId, message.url).then((fresh) => {
              sendResponse({ status: fresh ? 'SUCCESS' : 'FAILED', result: fresh });
            });
          } else {
            sendResponse({ status: 'NOT_FOUND' });
          }
        });
        return true; // Keep message port open for async response
      }

      if (message.type === 'REANALYZE_URL') {
        const tabId = message.tabId || sender.tab?.id || 0;
        if (tabId > 0 && message.url) {
          processTabAnalysis(tabId, message.url, true).then((fresh) => {
            sendResponse({ status: fresh ? 'SUCCESS' : 'FAILED', result: fresh });
          });
          return true;
        }
      }
    }
  );
}
