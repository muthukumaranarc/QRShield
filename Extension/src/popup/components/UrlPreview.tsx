import React from 'react';
import { ActiveTabInfo } from '../../types/analysis';

interface UrlPreviewProps {
  tabInfo: ActiveTabInfo | null;
  onAnalyze: () => void;
  isLoading: boolean;
}

export const UrlPreview: React.FC<UrlPreviewProps> = ({ tabInfo, onAnalyze, isLoading }) => {
  if (!tabInfo) {
    return (
      <div className="card tab-empty-state">
        <div className="empty-icon" aria-hidden="true">🌐</div>
        <p className="empty-text">Detecting active tab in current window...</p>
      </div>
    );
  }

  // Handle restricted browser pages
  if (!tabInfo.isInspectable) {
    return (
      <div className="card restricted-card" role="alert">
        <div className="restricted-header">
          <span className="restricted-icon" aria-hidden="true">🔒</span>
          <div>
            <h2 className="restricted-title">Browser Protected Page</h2>
            <p className="restricted-subtext">This URL cannot be scanned</p>
          </div>
        </div>
        <p className="restricted-desc">
          {tabInfo.restrictionReason ||
            'Internal browser pages (e.g., chrome://, Web Store) are protected by the browser and cannot be analyzed by extensions.'}
        </p>
        <div className="sanitized-preview-box">
          <code>{tabInfo.sanitizedUrl}</code>
        </div>
      </div>
    );
  }

  return (
    <div className="card preview-card">
      <div className="preview-header">
        <div className="domain-pill">
          <span className="domain-icon" aria-hidden="true">🌐</span>
          <span className="domain-name" title={tabInfo.domain}>
            {tabInfo.domain}
          </span>
        </div>
        <span className="active-tag">Active Tab</span>
      </div>

      <div className="url-box" title={tabInfo.url}>
        <span className="url-label">Target URL:</span>
        <code className="sanitized-url">{tabInfo.sanitizedUrl}</code>
      </div>

      <p className="prompt-text">
        Click below to inspect this web destination for phishing, deceptive keywords, and malicious redirects before interacting.
      </p>

      <button
        type="button"
        className="btn-primary analyze-btn"
        onClick={onAnalyze}
        disabled={isLoading}
        aria-label={`Analyze ${tabInfo.domain}`}
      >
        <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
        <span>Analyze URL</span>
      </button>
    </div>
  );
};
