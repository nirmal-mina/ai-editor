import { useState, useEffect } from 'react';
import './ThemeToggle.css';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <button
      className="theme-toggle"
      onClick={() => setIsDark(!isDark)}
      aria-label="Toggle theme"
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className={`toggle-track ${isDark ? 'dark' : 'light'}`}>
        <div className="toggle-thumb">
          {isDark ? '🌙' : '☀️'}
        </div>
      </div>
    </button>
  );
}
