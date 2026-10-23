import React, { useState, useEffect, useRef } from 'react';
import { ActiveTabInfo, AnalysisStatus, UrlAnalysisResponse, AnalysisError } from '../types/analysis';
import { getActiveTab } from '../services/tabService';
import {
  analyzeUrl,
  getApiConfig,
  checkBackendHealth,
  saveApiBaseUrl,
  resetApiBaseUrl,
  simulateLocalAnalysis,
} from '../services/api';
import { UrlPreview } from './components/UrlPreview';
import { LoadingState } from './components/LoadingState';
import { AnalysisResult } from './components/AnalysisResult';
import { ErrorState } from './components/ErrorState';

export const App: React.FC = () => {
  const [tabInfo, setTabInfo] = useState<ActiveTabInfo | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>('INITIAL');
  const [analysisResult, setAnalysisResult] = useState<UrlAnalysisResponse | null>(null);
  const [error, setError] = useState<AnalysisError | null>(null);

  // Server health state
  const [isServerUp, setIsServerUp] = useState<boolean | null>(null);
  const [config, setConfig] = useState(getApiConfig());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState(config.baseUrl);

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleAnalyzeForTab = async (info: ActiveTabInfo) => {
    if (!info || !info.isInspectable) return;

    setStatus('LOADING');
    setError(null);
    setAnalysisResult(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await analyzeUrl(info.url, controller.signal);
      setAnalysisResult(response);
      setStatus(response.verdict);
      setIsServerUp(true);
    } catch (err: unknown) {
      if (controller.signal.aborted) {
        setStatus('INITIAL');
        return;
      }

      const analysisErr = err as AnalysisError;
      setError(analysisErr);
      setStatus('ERROR');
      if (analysisErr.isNetworkError) {
        setIsServerUp(false);
      }
    } finally {
      abortControllerRef.current = null;
    }
  };

  // Ping health & auto-load live analysis on mount
  useEffect(() => {
    let isMounted = true;

    getActiveTab().then(async (info) => {
      if (!isMounted) return;
      setTabInfo(info);

      if (info.isInspectable) {
        // Trigger live scan directly with Spring Boot backend matching mobile client
        handleAnalyzeForTab(info);
      }
    });

    checkBackendHealth(config.baseUrl).then((res) => {
      if (isMounted) setIsServerUp(res.isUp);
    });

    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [config.baseUrl]);

  const handleAnalyze = async () => {
    if (tabInfo) {
      handleAnalyzeForTab(tabInfo);
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStatus('INITIAL');
  };

  const handleAnalyzeAgain = async () => {
    setStatus('INITIAL');
    setAnalysisResult(null);
    setError(null);
    const freshTab = await getActiveTab();
    setTabInfo(freshTab);
    if (freshTab.isInspectable) {
      handleAnalyzeForTab(freshTab);
    }
  };

  const handleSimulateLocal = () => {
    if (!tabInfo) return;
    const simulated = simulateLocalAnalysis(tabInfo.url);
    setAnalysisResult(simulated);
    setStatus(simulated.verdict);
    setError(null);
  };

  const handleSaveConfig = () => {
    if (!customUrlInput.trim()) return;
    saveApiBaseUrl(customUrlInput.trim());
    const updated = getApiConfig();
    setConfig(updated);
    setIsSettingsOpen(false);
    checkBackendHealth(updated.baseUrl).then(res => setIsServerUp(res.isUp));
  };

  const handleResetConfig = () => {
    resetApiBaseUrl();
    const updated = getApiConfig();
    setConfig(updated);
    setCustomUrlInput(updated.baseUrl);
    setIsSettingsOpen(false);
    checkBackendHealth(updated.baseUrl).then(res => setIsServerUp(res.isUp));
  };

  return (
    <div className="popup-container">
      {/* Extension Header */}
      <header className="popup-header">
        <div className="brand-group">
          <div className="logo-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="logo-svg">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <div className="brand-titles">
            <div className="brand-title-row">
              <h1 className="brand-name">QRShield</h1>
              <span className="app-badge">Inspector</span>
            </div>
            <span className="brand-sub">Active Tab Security</span>
          </div>
        </div>

        <div className="header-right-actions">
          <button
            type="button"
            className="server-pill-btn"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            title={`Backend: ${config.baseUrl} (Click to configure)`}
            aria-label="Server status and settings"
          >
            <span className={`server-dot ${isServerUp === true ? 'online' : isServerUp === false ? 'offline' : 'checking'}`} />
            <span className="server-label">
              {isServerUp === true ? 'Online' : isServerUp === false ? 'Offline' : 'API'}
            </span>
            <span className="settings-gear" aria-hidden="true">⚙️</span>
          </button>
        </div>
      </header>

      {/* Settings Panel Drawer */}
      {isSettingsOpen && (
        <div className="settings-drawer card" role="dialog" aria-label="Backend Configuration">
          <div className="settings-header">
            <span className="settings-title">Backend Connection Settings</span>
            <button type="button" className="close-btn" onClick={() => setIsSettingsOpen(false)}>✕</button>
          </div>

          <label className="settings-input-label">Backend Host URL:</label>
          <input
            type="text"
            className="settings-input"
            value={customUrlInput}
            onChange={e => setCustomUrlInput(e.target.value)}
            placeholder="http://localhost:8080"
          />

          <div className="quick-presets-row">
            <button
              type="button"
              className="preset-chip"
              onClick={() => setCustomUrlInput('http://localhost:8080')}
            >
              localhost:8080
            </button>
            <button
              type="button"
              className="preset-chip"
              onClick={() => setCustomUrlInput('http://60.8.4.223:8080')}
            >
              60.8.4.223:8080
            </button>
          </div>

          <div className="settings-btn-row">
            <button type="button" className="btn-secondary" onClick={handleResetConfig}>
              Reset
            </button>
            <button type="button" className="btn-primary" onClick={handleSaveConfig}>
              Save & Test
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="popup-main">
        {status === 'INITIAL' && (
          <UrlPreview
            tabInfo={tabInfo}
            onAnalyze={handleAnalyze}
            isLoading={false}
          />
        )}

        {status === 'LOADING' && (
          <LoadingState
            onCancel={handleCancel}
            domain={tabInfo?.domain}
          />
        )}

        {(status === 'SAFE' || status === 'SUSPICIOUS' || status === 'MALICIOUS' || status === 'UNKNOWN') &&
          analysisResult && (
            <AnalysisResult
              result={analysisResult}
              domain={tabInfo?.domain || 'Active Tab'}
              onAnalyzeAgain={handleAnalyzeAgain}
            />
          )}

        {status === 'ERROR' && error && (
          <ErrorState
            error={error}
            onRetry={handleAnalyze}
            onSimulateLocal={handleSimulateLocal}
            onOpenSettings={() => setIsSettingsOpen(true)}
            domain={tabInfo?.domain}
          />
        )}
      </main>

      {/* Extension Footer */}
      <footer className="popup-footer">
        <span className="privacy-guarantee">🔒 No automated background scans</span>
        <span className="build-ver">{config.baseUrl.replace(/^https?:\/\//, '')}</span>
      </footer>
    </div>
  );
};
