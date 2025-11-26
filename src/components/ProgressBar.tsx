import './ProgressBar.css';

interface ProgressBarProps {
  isActive: boolean;
}

export function ProgressBar({ isActive }: ProgressBarProps) {
  if (!isActive) return null;

  return (
    <div className="progress-bar-container">
      <div className="progress-bar">
        <div className="progress-bar-fill"></div>
      </div>
    </div>
  );
}
