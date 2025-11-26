import './ErrorNotification.css';

interface ErrorNotificationProps {
  message: string;
  onDismiss: () => void;
}

export function ErrorNotification({ message, onDismiss }: ErrorNotificationProps) {
  return (
    <div className="error-notification">
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <div className="error-message">{message}</div>
        <button className="error-dismiss" onClick={onDismiss} aria-label="Dismiss error">
          ✕
        </button>
      </div>
    </div>
  );
}
