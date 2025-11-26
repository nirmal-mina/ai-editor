import { useEffect, useState } from 'react';
import './Toast.css';

interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'warning';
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`toast toast-${type} ${isVisible ? 'toast-visible' : 'toast-hidden'}`}>
      <div className="toast-icon">
        {type === 'success' && '✓'}
        {type === 'info' && 'ℹ'}
        {type === 'warning' && '⚠'}
      </div>
      <span className="toast-message">{message}</span>
    </div>
  );
}
