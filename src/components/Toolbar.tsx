import './Toolbar.css';

interface ToolbarProps {
  onContinueWriting: () => void;
  onReset: () => void;
  onExport: () => void;
  isGenerating: boolean;
  canGenerate: boolean;
}

export function Toolbar({
  onContinueWriting,
  onReset,
  onExport,
  isGenerating,
  canGenerate,
}: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <button
          className="btn btn-primary btn-continue"
          onClick={onContinueWriting}
          disabled={isGenerating || !canGenerate}
          title={!canGenerate ? 'Start typing to enable AI continuation' : 'Continue writing with AI (Ctrl+Enter)'}
        >
          {isGenerating ? (
            <>
              <span className="btn-spinner"></span>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span>Continue Writing</span>
            </>
          )}
        </button>
      </div>

      <div className="toolbar-section toolbar-actions">
        <button
          className="btn btn-secondary btn-icon-only"
          onClick={onExport}
          disabled={isGenerating}
          title="Export content"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
        
        <button
          className="btn btn-secondary btn-icon-only"
          onClick={onReset}
          disabled={isGenerating}
          title="Clear all content"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </button>
      </div>
    </div>
  );
}
