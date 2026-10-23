import '@testing-library/jest-dom';

const storageMock: Record<string, unknown> = {};

// Ensure chrome namespace is mocked in test environment
const mockChrome = {
  tabs: {
    query: (
      _queryInfo: chrome.tabs.QueryInfo,
      callback: (result: chrome.tabs.Tab[]) => void
    ) => {
      callback([
        {
          id: 1,
          index: 0,
          pinned: false,
          highlighted: true,
          windowId: 1,
          active: true,
          incognito: false,
          selected: true,
          discarded: false,
          autoDiscardable: true,
          groupId: -1,
          url: 'https://paypal-security-update.account-alert.net/login',
          title: 'PayPal Login Verification',
        } as chrome.tabs.Tab,
      ]);
    },
    get: (_tabId: number) =>
      Promise.resolve({
        id: 1,
        url: 'https://paypal-security-update.account-alert.net/login',
        title: 'PayPal Login Verification',
      } as chrome.tabs.Tab),
    sendMessage: () => Promise.resolve(),
    onUpdated: { addListener: () => {} },
    onActivated: { addListener: () => {} },
  },
  webNavigation: {
    onCompleted: { addListener: () => {} },
  },
  action: {
    setBadgeText: () => Promise.resolve(),
    setBadgeBackgroundColor: () => Promise.resolve(),
    setTitle: () => Promise.resolve(),
  },
  storage: {
    local: {
      get: (keys: unknown) => {
        const result: Record<string, unknown> = {};
        if (typeof keys === 'string') {
          result[keys] = storageMock[keys];
        } else if (Array.isArray(keys)) {
          keys.forEach((k) => {
            result[k] = storageMock[k];
          });
        } else if (keys && typeof keys === 'object') {
          Object.keys(keys as Record<string, unknown>).forEach((k) => {
            result[k] =
              storageMock[k] !== undefined
                ? storageMock[k]
                : (keys as Record<string, unknown>)[k];
          });
        }
        return Promise.resolve(result);
      },
      set: (items: Record<string, unknown>) => {
        Object.assign(storageMock, items);
        return Promise.resolve();
      },
      remove: (keys: string | string[]) => {
        if (typeof keys === 'string') delete storageMock[keys];
        else if (Array.isArray(keys)) keys.forEach((k) => delete storageMock[k]);
        return Promise.resolve();
      },
      clear: () => {
        Object.keys(storageMock).forEach((k) => delete storageMock[k]);
        return Promise.resolve();
      },
    },
  },
  runtime: {
    lastError: undefined,
    sendMessage: () => Promise.resolve(),
    onMessage: { addListener: () => {} },
  },
};

(globalThis as unknown as { chrome: unknown }).chrome = mockChrome;
