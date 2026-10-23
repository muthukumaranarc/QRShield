import { UrlAnalysisResponse, Verdict } from '../types/analysis';

// Ensure we only execute in the top-level window frame
if (window.top === window) {
  initContentInspector();
}

function initContentInspector() {
  const HOST_ID = 'qrshield-security-inspector-host';

  // Prevent multiple injections
  if (document.getElementById(HOST_ID)) return;

  const host = document.createElement('div');
  host.id = HOST_ID;
  host.style.position = 'fixed';
  host.style.bottom = '20px';
  host.style.right = '20px';
  host.style.zIndex = '2147483647'; // Highest possible z-index
  host.style.pointerEvents = 'none'; // Child elements will re-enable pointer-events

  const shadow = host.attachShadow({ mode: 'open' });
  document.documentElement.appendChild(host);

  let currentAnalysis: UrlAnalysisResponse | null = null;
  let viewState: 'PILL' | 'EXPANDED' | 'MINIMIZED' | 'DISMISSED' = 'PILL';
  let autoMinimizeTimer: ReturnType<typeof setTimeout> | null = null;

  // Render initial loading state
  renderUI();

  // Request analysis from background service worker
  try {
    chrome.runtime.sendMessage(
      {
        type: 'GET_ANALYSIS_FOR_URL',
        url: window.location.href,
      },
      (response) => {
        if (response && response.status === 'SUCCESS' && response.result) {
          handleNewAnalysis(response.result);
        }
      }
    );
  } catch {}

  // Listen for push notifications from background service worker
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'QRSHIELD_PAGE_ANALYSIS' && message.payload) {
      handleNewAnalysis(message.payload);
    }
  });

  function handleNewAnalysis(analysis: UrlAnalysisResponse) {
    currentAnalysis = analysis;
    if (viewState === 'DISMISSED') return;

    viewState = 'PILL';
    renderUI();

    // Auto-collapse if SAFE after 7 seconds to prevent obstructing normal reading
    if (analysis.verdict === 'SAFE') {
      if (autoMinimizeTimer) clearTimeout(autoMinimizeTimer);
      autoMinimizeTimer = setTimeout(() => {
        if (viewState === 'PILL') {
          viewState = 'MINIMIZED';
          renderUI();
        }
      }, 7000);
    }
  }

  function getVerdictColors(verdict?: Verdict) {
    switch (verdict) {
      case 'SAFE':
        return {
          bg: '#064e3b',
          border: '#059669',
          badgeBg: '#10b981',
          text: '#ecfdf5',
          pillBg: 'rgba(6, 78, 59, 0.94)',
        };
      case 'SUSPICIOUS':
        return {
          bg: '#78350f',
          border: '#d97706',
          badgeBg: '#f59e0b',
          text: '#fffbeb',
          pillBg: 'rgba(120, 53, 15, 0.94)',
        };
      case 'MALICIOUS':
        return {
          bg: '#7f1d1d',
          border: '#dc2626',
          badgeBg: '#ef4444',
          text: '#fef2f2',
          pillBg: 'rgba(127, 29, 29, 0.95)',
        };
      case 'UNKNOWN':
      default:
        return {
          bg: '#1e293b',
          border: '#475569',
          badgeBg: '#64748b',
          text: '#f8fafc',
          pillBg: 'rgba(30, 41, 59, 0.92)',
        };
    }
  }

  function renderUI() {
    if (viewState === 'DISMISSED') {
      shadow.innerHTML = '';
      return;
    }

    const colors = getVerdictColors(currentAnalysis?.verdict);
    const domain = window.location.hostname;

    let contentHtml = '';

    if (viewState === 'MINIMIZED') {
      // 1. Minimized floating dot
      contentHtml = `
        <button id="qrshield-min-btn" class="minimized-pill" title="QRShield: ${currentAnalysis?.verdict || 'Inspecting'} - Click to expand report">
          <svg class="shield-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span class="status-dot dot-${(currentAnalysis?.verdict || 'loading').toLowerCase()}"></span>
        </button>
      `;
    } else if (viewState === 'PILL') {
      // 2. Compact security pill
      if (!currentAnalysis) {
        contentHtml = `
          <div class="pill-container pill-loading">
            <div class="pill-left">
              <svg class="shield-icon spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-linecap="round"/>
              </svg>
              <span class="pill-title">QRShield: Inspecting site...</span>
            </div>
            <button id="qrshield-close-btn" class="icon-btn" title="Dismiss">✕</button>
          </div>
        `;
      } else {
        const scoreLabel = currentAnalysis.riskScore !== null ? `(${currentAnalysis.riskScore}/100)` : '';
        contentHtml = `
          <div class="pill-container pill-${currentAnalysis.verdict.toLowerCase()}">
            <div class="pill-left" id="qrshield-open-report">
              <span class="verdict-icon">
                ${currentAnalysis.verdict === 'SAFE' ? '🛡️' : currentAnalysis.verdict === 'SUSPICIOUS' ? '⚠️' : '⛔'}
              </span>
              <div class="pill-text-group">
                <span class="pill-brand">QRShield</span>
                <span class="pill-status">${currentAnalysis.verdict} ${scoreLabel}</span>
              </div>
            </div>
            <div class="pill-actions">
              <button id="qrshield-expand-btn" class="action-btn" title="View Full Analysis Report">Report ↗</button>
              <button id="qrshield-min-toggle" class="icon-btn" title="Minimize to icon">—</button>
              <button id="qrshield-close-btn" class="icon-btn" title="Dismiss">✕</button>
            </div>
          </div>
        `;
      }
    } else if (viewState === 'EXPANDED' && currentAnalysis) {
      // 3. Full interactive report card
      const indicators = currentAnalysis.indicators || [];
      const scoreBadge = currentAnalysis.riskScore !== null
        ? `<div class="score-badge">${currentAnalysis.riskScore}<span class="score-denom">/100</span></div>`
        : '';

      const indicatorsList = indicators.length > 0
        ? `<div class="section-title">Detected Indicators (${indicators.length})</div>
           <ul class="indicators-list">
             ${indicators
               .map(
                 (ind) => `
               <li class="indicator-item sev-${ind.severity.toLowerCase()}">
                 <span class="ind-tag">${ind.severity}</span>
                 <span class="ind-title">${escapeHtml(ind.title)}</span>
               </li>
             `
               )
               .join('')}
           </ul>`
        : '';

      contentHtml = `
        <div class="modal-card">
          <div class="modal-header verdict-header-${currentAnalysis.verdict.toLowerCase()}">
            <div class="header-left">
              <span class="header-icon">
                ${currentAnalysis.verdict === 'SAFE' ? '🛡️' : currentAnalysis.verdict === 'SUSPICIOUS' ? '⚠️' : '⛔'}
              </span>
              <div>
                <div class="header-subtitle">QRShield Security Report</div>
                <div class="header-title">${currentAnalysis.verdict}</div>
              </div>
            </div>
            ${scoreBadge}
            <button id="qrshield-card-close" class="modal-close-btn" title="Close">✕</button>
          </div>

          <div class="modal-body">
            <div class="domain-row">
              <span class="domain-label">Domain:</span>
              <span class="domain-value">${escapeHtml(domain)}</span>
            </div>

            ${
              currentAnalysis.backendScanId || currentAnalysis.ipAddress
                ? `
              <div class="domain-row telemetry-row">
                <span class="domain-label">Backend ID:</span>
                <span class="domain-value mono">${escapeHtml(
                  currentAnalysis.backendScanId
                    ? currentAnalysis.backendScanId.substring(0, 16) + '...'
                    : 'Verified'
                )}</span>
              </div>
              ${
                currentAnalysis.ipAddress
                  ? `
                <div class="domain-row telemetry-row">
                  <span class="domain-label">Server IP:</span>
                  <span class="domain-value">${escapeHtml(currentAnalysis.ipAddress)} ${
                      currentAnalysis.providerName ? `(${escapeHtml(currentAnalysis.providerName)})` : ''
                    }</span>
                </div>
              `
                  : ''
              }
              ${
                currentAnalysis.latencyMs !== undefined
                  ? `
                <div class="domain-row telemetry-row">
                  <span class="domain-label">API Speed:</span>
                  <span class="domain-value">${currentAnalysis.latencyMs} ms (${
                      currentAnalysis.fromCache ? 'Pre-fetched' : 'Live Request'
                    })</span>
                </div>
              `
                  : ''
              }
            `
                : ''
            }

            <div class="summary-box">
              <div class="section-title">Analysis Summary</div>
              <p class="summary-text">${escapeHtml(currentAnalysis.summary)}</p>
            </div>

            ${
              currentAnalysis.checks && currentAnalysis.checks.length > 0
                ? `
              <div class="summary-box">
                <div class="section-title">Checks Performed (${currentAnalysis.checks.length})</div>
                <div style="display:flex; flex-direction:column; gap:4px; margin-top:4px;">
                  ${currentAnalysis.checks
                    .map(
                      (c) => `
                    <div style="display:flex; justify-content:space-between; align-items:center; background:#1e293b; padding:4px 8px; border-radius:6px; font-size:11px;">
                      <span style="color:#cbd5e1; font-weight:600;">${escapeHtml(c.name)}</span>
                      <span style="font-size:9.5px; font-weight:800; padding:1px 5px; border-radius:4px; ${
                        c.status === 'PASSED'
                          ? 'background:#064e3b; color:#a7f3d0;'
                          : c.status === 'WARNING'
                          ? 'background:#78350f; color:#fde68a;'
                          : 'background:#7f1d1d; color:#fca5a5;'
                      }">${c.status}</span>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              </div>
            `
                : ''
            }

            ${indicatorsList}

            <div class="disclaimer-banner">
              ${
                currentAnalysis.verdict === 'MALICIOUS'
                  ? '⛔ High risk detected. Do not submit credentials, passwords, or personal data on this site.'
                  : currentAnalysis.verdict === 'SUSPICIOUS'
                  ? '⚠️ Unencrypted HTTP or risk patterns detected. Proceed with extreme caution.'
                  : '🛡️ No active phishing or deceptive elements found. Always verify site credentials.'
              }
            </div>

            <div class="modal-footer">
              <button id="qrshield-recheck-btn" class="btn-secondary">Re-Analyze</button>
              <button id="qrshield-minimize-btn" class="btn-primary">Minimize</button>
            </div>
          </div>
        </div>
      `;
    }

    shadow.innerHTML = `
      <style>
        :host {
          all: initial;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: 13px;
          line-height: 1.4;
          box-sizing: border-box;
          color: #f1f5f9;
        }

        *, *::before, *::after {
          box-sizing: border-box;
        }

        /* Minimized floating button */
        .minimized-pill {
          pointer-events: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: ${colors.pillBg};
          border: 1.5px solid ${colors.border};
          color: #ffffff;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4), 0 0 10px ${colors.border}44;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          position: relative;
        }
        .minimized-pill:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.5), 0 0 14px ${colors.border}88;
        }
        .shield-icon {
          width: 20px;
          height: 20px;
        }
        .status-dot {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          border: 1.5px solid #0f172a;
        }
        .dot-safe { background: #10b981; }
        .dot-suspicious { background: #f59e0b; }
        .dot-malicious { background: #ef4444; }
        .dot-loading { background: #3b82f6; }

        /* Compact Pill */
        .pill-container {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 14px;
          background: ${colors.pillBg};
          border: 1.5px solid ${colors.border};
          border-radius: 30px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45), 0 0 12px ${colors.border}33;
          backdrop-filter: blur(8px);
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pill-left {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
        }
        .pill-brand {
          font-weight: 700;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #94a3b8;
          display: block;
          line-height: 1;
        }
        .pill-status {
          font-weight: 700;
          font-size: 13px;
          color: ${colors.text};
          line-height: 1.2;
        }
        .pill-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .action-btn {
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #ffffff;
          padding: 4px 9px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .action-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .icon-btn {
          background: transparent;
          border: none;
          color: #cbd5e1;
          font-size: 14px;
          cursor: pointer;
          padding: 2px 5px;
          border-radius: 6px;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .icon-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #ffffff;
        }

        /* Spin animation */
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }

        /* Expanded Modal Card */
        .modal-card {
          pointer-events: auto;
          width: 340px;
          max-width: calc(100vw - 40px);
          background: #0f172a;
          border: 1.5px solid ${colors.border};
          border-radius: 16px;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.65), 0 0 20px ${colors.border}44;
          overflow: hidden;
          animation: popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          background: ${colors.bg};
          border-bottom: 1px solid ${colors.border};
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .header-icon {
          font-size: 24px;
        }
        .header-subtitle {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #cbd5e1;
        }
        .header-title {
          font-size: 18px;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.1;
        }
        .score-badge {
          background: rgba(0, 0, 0, 0.4);
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 800;
          color: #ffffff;
        }
        .score-denom {
          font-size: 10px;
          color: #cbd5e1;
          margin-left: 1px;
        }
        .modal-close-btn {
          background: transparent;
          border: none;
          color: #e2e8f0;
          font-size: 16px;
          cursor: pointer;
          padding: 4px 6px;
          border-radius: 6px;
        }
        .modal-close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .modal-body {
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 440px;
          overflow-y: auto;
        }
        .domain-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          background: #1e293b;
          padding: 6px 10px;
          border-radius: 8px;
          border: 1px solid #334155;
        }
        .domain-label {
          color: #94a3b8;
          font-weight: 500;
        }
        .domain-value {
          color: #38bdf8;
          font-family: monospace;
          font-weight: 700;
        }
        .section-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #94a3b8;
          margin-bottom: 4px;
        }
        .summary-text {
          margin: 0;
          font-size: 12px;
          color: #e2e8f0;
          line-height: 1.45;
        }
        .indicators-list {
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .indicator-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          background: #1e293b;
          padding: 7px 10px;
          border-radius: 8px;
          border-left: 3px solid #64748b;
          font-size: 11.5px;
        }
        .ind-tag {
          font-size: 9.5px;
          font-weight: 800;
          padding: 2px 5px;
          border-radius: 4px;
          background: #334155;
          color: #cbd5e1;
        }
        .sev-high, .sev-critical { border-left-color: #ef4444; }
        .sev-high .ind-tag, .sev-critical .ind-tag { background: #7f1d1d; color: #fca5a5; }
        .sev-medium { border-left-color: #f59e0b; }
        .sev-medium .ind-tag { background: #78350f; color: #fde68a; }
        .sev-low { border-left-color: #10b981; }
        .sev-low .ind-tag { background: #064e3b; color: #a7f3d0; }

        .disclaimer-banner {
          font-size: 11px;
          padding: 8px 10px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          color: #cbd5e1;
          border: 1px dashed #334155;
          line-height: 1.4;
        }
        .modal-footer {
          display: flex;
          gap: 8px;
          margin-top: 4px;
        }
        .btn-primary, .btn-secondary {
          flex: 1;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: filter 0.15s ease;
        }
        .btn-primary {
          background: #3b82f6;
          color: #ffffff;
        }
        .btn-secondary {
          background: #334155;
          color: #f1f5f9;
        }
        .btn-primary:hover, .btn-secondary:hover {
          filter: brightness(1.15);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      </style>
      ${contentHtml}
    `;

    attachListeners();
  }

  function attachListeners() {
    const minBtn = shadow.getElementById('qrshield-min-btn');
    if (minBtn) {
      minBtn.addEventListener('click', () => {
        viewState = 'PILL';
        renderUI();
      });
    }

    const expandBtn = shadow.getElementById('qrshield-expand-btn');
    const pillOpen = shadow.getElementById('qrshield-open-report');
    const openCardHandler = () => {
      viewState = 'EXPANDED';
      renderUI();
    };
    if (expandBtn) expandBtn.addEventListener('click', openCardHandler);
    if (pillOpen) pillOpen.addEventListener('click', openCardHandler);

    const minToggle = shadow.getElementById('qrshield-min-toggle');
    const cardMinimizeBtn = shadow.getElementById('qrshield-minimize-btn');
    const minimizeHandler = () => {
      viewState = 'MINIMIZED';
      renderUI();
    };
    if (minToggle) minToggle.addEventListener('click', minimizeHandler);
    if (cardMinimizeBtn) cardMinimizeBtn.addEventListener('click', minimizeHandler);

    const closeBtn = shadow.getElementById('qrshield-close-btn');
    const cardClose = shadow.getElementById('qrshield-card-close');
    const closeHandler = () => {
      viewState = 'DISMISSED';
      renderUI();
    };
    if (closeBtn) closeBtn.addEventListener('click', closeHandler);
    if (cardClose) cardClose.addEventListener('click', closeHandler);

    const recheckBtn = shadow.getElementById('qrshield-recheck-btn');
    if (recheckBtn) {
      recheckBtn.addEventListener('click', () => {
        currentAnalysis = null;
        viewState = 'PILL';
        renderUI();
        chrome.runtime.sendMessage({
          type: 'REANALYZE_URL',
          url: window.location.href,
        });
      });
    }
  }

  function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }
}
