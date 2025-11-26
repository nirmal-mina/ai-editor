import { useState, useEffect } from 'react';
import './WelcomeModal.css';

interface WelcomeModalProps {
  onClose: () => void;
}

export function WelcomeModal({ onClose }: WelcomeModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className={`modal-overlay ${isVisible ? 'visible' : ''}`} onClick={handleClose}>
      <div
        className={`modal-content ${isVisible ? 'visible' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-modal-title"
      >
        <div className="modal-header">
          <div className="modal-icon">✨</div>
          <h2 id="welcome-modal-title">Welcome to AI Editor</h2>
          <button className="modal-close" onClick={handleClose} aria-label="Close">
            ✕
          </button>
        </div>
        
        <div className="modal-body">
          <p className="modal-intro">
            Transform your writing with AI-powered assistance.
          </p>
          
          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <div>
                <strong>Continue Writing</strong>
                <p>Press <kbd>Ctrl+Enter</kbd> to let AI continue your text</p>
              </div>
            </div>
            
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <div>
                <strong>Real-time Statistics</strong>
                <p>Track words, characters, and reading time as you write</p>
              </div>
            </div>
            
            <div className="feature-item">
              <span className="feature-icon">🎨</span>
              <div>
                <strong>Beautiful Themes</strong>
                <p>Switch between light and dark mode anytime</p>
              </div>
            </div>
            
            <div className="feature-item">
              <span className="feature-icon">💾</span>
              <div>
                <strong>Easy Export</strong>
                <p>Download your content with one click</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="modal-btn" onClick={handleClose}>
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
