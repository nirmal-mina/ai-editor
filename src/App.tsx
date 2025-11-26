import { useEffect, useCallback, useState } from 'react';
import { useMachine } from '@xstate/react';
import { editorMachine } from './machines/editorMachine';
import { aiService } from './services/aiService';
import { EditorComponent } from './components/EditorComponent';
import { Toolbar } from './components/Toolbar';
import { StatsPanel } from './components/StatsPanel';
import { ThemeToggle } from './components/ThemeToggle';
import { ErrorNotification } from './components/ErrorNotification';
import { ProgressBar } from './components/ProgressBar';
import { Toast } from './components/Toast';
import { WelcomeModal } from './components/WelcomeModal';
import './App.css';

/**
 * Main application component orchestrating the AI-assisted editor.
 * 
 * Architecture Overview:
 * - Uses XState for finite state machine-based state management
 * - Integrates ProseMirror editor through EditorComponent wrapper
 * - Handles bidirectional data flow: user edits → state machine → editor updates
 * - Manages UI feedback layers: progress, errors, toasts, welcome flow
 * 
 * State Management Pattern:
 * The app uses a unidirectional data flow with XState as the single source of truth:
 * 1. User interaction triggers event (CONTINUE_WRITING, UPDATE_CONTENT, etc.)
 * 2. State machine processes event through guards and actions
 * 3. Context update flows down to components via props
 * 4. Component re-renders reflect new state
 * 
 * This pattern prevents common React pitfalls like stale closures and race conditions
 * during async operations.
 */
function App() {
  // XState integration - provides deterministic state transitions
  const [state, send] = useMachine(editorMachine);
  const { content, error, isGenerating } = state.context;
  
  // Track user input length for visual separation
  const [userInputLength, setUserInputLength] = useState(0);
  
  // Local UI state (not part of business logic, hence not in state machine)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const [showWelcome, setShowWelcome] = useState(() => {
    // Lazy initialization - only check localStorage once on mount
    return !localStorage.getItem('ai-editor-visited');
  });

  /**
   * Handles AI content generation flow.
   * 
   * This async function demonstrates proper error handling with XState:
   * 1. Optimistically transition to 'generating' state for immediate UI feedback
   * 2. Attempt generation with try/catch boundary
   * 3. Send success/error events to state machine for deterministic state updates
   * 
   * Why send timestamp:
   * Tracking generation timestamps enables features like rate limiting,
   * analytics, and debugging generation patterns. While not currently displayed,
   * the infrastructure supports future enhancements like "last generated 5s ago".
   * 
   * Error handling strategy:
   * - Narrow Error type to extract message safely
   * - Provide fallback message for unknown error types
   * - Let state machine handle error state (don't set local error state)
   */
  const handleContinueWriting = useCallback(async () => {
    send({ type: 'CONTINUE_WRITING' });
    setUserInputLength(content.length); // Save where user input ends

    try {
      const newContent = await aiService.generateContinuation(content);
      const timestamp = Date.now();
      send({ type: 'GENERATION_SUCCESS', content: newContent, timestamp });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      send({ type: 'GENERATION_ERROR', error: errorMessage });
    }
  }, [send, content]);

  /**
   * Global keyboard shortcuts for power users.
   * 
   * Implementation notes:
   * - Uses window-level listener to catch shortcuts regardless of focus
   * - Prevents default to avoid browser conflicts (e.g., Ctrl+Enter in some browsers)
   * - Guards against invalid states (can't generate without content or while generating)
   * - Cleanup function prevents memory leaks on unmount
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to continue writing
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isGenerating && content.trim().length > 0) {
          handleContinueWriting();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGenerating, content, handleContinueWriting]);



  /**
   * Handles user edits from ProseMirror editor.
   * 
   * Wrapped in useCallback to prevent EditorComponent re-mounts.
   * ProseMirror view creation is expensive, so we need stable function references
   * to avoid triggering useEffect cleanup/re-initialization cycles in EditorComponent.
   * 
   * The send function from useMachine is stable, so it's safe as a dependency.
   */
  const handleContentChange = useCallback((newContent: string) => {
    send({ type: 'UPDATE_CONTENT', content: newContent });
  }, [send]);

  /**
   * Handles document reset with user confirmation.
   * 
   * Uses native confirm() for simplicity, though a custom modal would be more
   * consistent with the design system. The tradeoff: native confirm is accessible
   * by default and requires zero additional code.
   */
  const handleReset = () => {
    if (content.trim().length > 0) {
      if (confirm('Are you sure you want to clear all content?')) {
        send({ type: 'RESET' });
        setUserInputLength(0);
      }
    }
  };

  /**
   * Handles document export to .txt file.
   * 
   * Implementation uses Blob API for client-side file generation:
   * - Creates in-memory file from content string
   * - Generates temporary URL for download
   * - Programmatically triggers download via hidden <a> element
   * - Cleans up DOM and memory (removeChild, revokeObjectURL)
   * 
   * Filename strategy:
   * Pattern: ai-editor-YYYY-MM-DD.txt
   * Uses ISO date (not time) to avoid special characters in filename.
   * Multiple exports same day will overwrite (browser default behavior).
   * 
   * Why not use download attribute directly:
   * Creating and clicking an <a> element ensures cross-browser compatibility,
   * especially for dynamically generated content.
   */
  const handleExport = () => {
    if (content.trim().length === 0) {
      setToast({ message: 'No content to export', type: 'warning' });
      return;
    }

    // Create blob and trigger download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-editor-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    
    // Critical: cleanup to prevent memory leaks
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setToast({ message: 'Content exported successfully!', type: 'success' });
  };

  /**
   * Clears error state in state machine.
   * Triggered by user clicking "Dismiss" on error notification.
   */
  const handleDismissError = () => {
    send({ type: 'CLEAR_ERROR' });
  };

  /**
   * Closes welcome modal and marks app as visited.
   * Uses localStorage to persist across sessions.
   */
  const handleCloseWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('ai-editor-visited', 'true');
  };

  return (
    <div className="app">
      {showWelcome && <WelcomeModal onClose={handleCloseWelcome} />}
      
      <ProgressBar isActive={isGenerating} />
      
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo">✨</div>
            <div>
              <h1 className="app-title">AI Editor</h1>
              <p className="app-subtitle">Write smarter with AI assistance</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          <Toolbar
            onContinueWriting={handleContinueWriting}
            onReset={handleReset}
            onExport={handleExport}
            isGenerating={isGenerating}
            canGenerate={content.trim().length > 0}
          />

          <EditorComponent
            content={content}
            onContentChange={handleContentChange}
            isGenerating={isGenerating}
            placeholder="Start writing something amazing..."
            userInputLength={userInputLength}
          />

          <StatsPanel content={content} />

          <div className="shortcuts-hint">
            <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to continue writing • <kbd>Ctrl</kbd> + <kbd>Z</kbd> to undo
          </div>
        </div>
      </main>

      {error && (
        <ErrorNotification message={error} onDismiss={handleDismissError} />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <footer className="app-footer">
        <p>Built with React, TypeScript, XState & ProseMirror by Hansraj</p>
      </footer>
    </div>
  );
}

export default App;
