import React from 'react';
import { AnalysisError } from '../../types/analysis';

interface ErrorStateProps {
  error: AnalysisError;
  onRetry: () => void;
  onSimulateLocal?: () => void;
  onOpenSettings?: () => void;
  domain?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  onSimulateLocal,
  onOpenSettings,
  domain,
}) => {
  return (
    <div className="card error-card" role="alert">
      <div className="error-icon-wrapper" aria-hidden="true">
        <svg className="error-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h2 className="error-title">Analysis Failed</h2>
      <p className="error-message">{error.message}</p>

      {error.details && (
        <div className="error-details-box">
          <span className="details-label">Details:</span>
          <p className="details-text">{error.details}</p>
        </div>
      )}

      <div className="security-notice warning-notice">
        <strong>⚠️ Security Notice:</strong> This URL could not be evaluated. A failed analysis does not indicate the website is safe. Proceed with caution.
      </div>

      <div className="error-actions-group">
        <button
          type="button"
          className="btn-primary retry-btn"
          onClick={onRetry}
          aria-label={`Retry analysis ${domain ? `for ${domain}` : ''}`}
        >
          <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          <span>Retry Analysis</span>
        </button>

        {onSimulateLocal && (
          <button
            type="button"
            className="btn-secondary simulate-btn"
            onClick={onSimulateLocal}
            aria-label="Run client-side heuristic inspection"
          >
            <span aria-hidden="true">⚡</span>
            <span>Run Local Simulation (Offline)</span>
          </button>
        )}

        {onOpenSettings && (
          <button
            type="button"
            className="btn-link settings-link-btn"
            onClick={onOpenSettings}
            aria-label="Change backend API configuration"
          >
            ⚙️ Change Backend URL
          </button>
        )}
      </div>
    </div>
  );
};
