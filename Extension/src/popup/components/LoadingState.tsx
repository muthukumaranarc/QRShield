import React, { useState, useEffect } from 'react';

interface LoadingStateProps {
  onCancel?: () => void;
  domain?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ onCancel, domain }) => {
  const [step1Done, setStep1Done] = useState(false);
  const [step2Done, setStep2Done] = useState(false);
  const [step3Done, setStep3Done] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setStep1Done(true), 350);
    const t2 = setTimeout(() => setStep2Done(true), 750);
    const t3 = setTimeout(() => setStep3Done(true), 1200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="card loading-card" role="status" aria-live="polite">
      {/* Radar Shield Spinner */}
      <div className="radar-container" aria-hidden="true">
        <div className="radar-wave wave-1" />
        <div className="radar-wave wave-2" />
        <div className="radar-center">
          <svg className="shield-spin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
      </div>

      <h2 className="loading-title">Scanning for threats...</h2>
      <p className="loading-desc">
        {domain ? `Inspecting ${domain} across Spring Boot threat engine...` : 'Connecting to QRShield cybersecurity engine...'}
      </p>

      <ul className="loading-steps" aria-hidden="true">
        <li className={`step-item ${step1Done ? 'done' : 'active'}`}>
          {step1Done ? '✓' : '●'} URL Format & Protocol Security
        </li>
        <li className={`step-item ${step2Done ? 'done' : step1Done ? 'active' : ''}`}>
          {step2Done ? '✓' : step1Done ? '●' : '○'} Domain & Infrastructure Lookup
        </li>
        <li className={`step-item ${step3Done ? 'done' : step2Done ? 'active' : ''}`}>
          {step3Done ? '✓' : step2Done ? '●' : '○'} Threat Intelligence & Deception Rules
        </li>
        <li className={`step-item ${step3Done ? 'active' : ''}`}>
          {step3Done ? '●' : '○'} Redirect Chain & Payload Evaluation
        </li>
      </ul>

      {onCancel && (
        <button type="button" className="btn-secondary cancel-btn" onClick={onCancel} aria-label="Cancel analysis request">
          Cancel Request
        </button>
      )}
    </div>
  );
};
