import { useEffect, useRef, useState } from 'react';
import { aiService } from '../services/aiService';
import './StatsPanel.css';

interface StatsPanelProps {
  content: string;
}

/**
 * AnimatedCounter Component
 * Smoothly animates number changes for better UX
 */
function AnimatedCounter({ value, duration = 300 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);

  useEffect(() => {
    const previousValue = previousValueRef.current;
    
    if (previousValue === value) return;

    const startTime = Date.now();
    const difference = value - previousValue;

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic function for smooth deceleration
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      
      const current = Math.round(previousValue + (difference * easeOutCubic));
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValueRef.current = value;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{displayValue.toLocaleString()}</>;
}

export function StatsPanel({ content }: StatsPanelProps) {
  const stats = aiService.getTextStats(content);

  const statItems = [
    { label: 'Words', value: stats.words, icon: '📝', color: '#5b5fc7' },
    { label: 'Characters', value: stats.characters, icon: '🔤', color: '#7c3aed' },
    { label: 'Sentences', value: stats.sentences, icon: '📄', color: '#ec4899' },
    { label: 'Paragraphs', value: stats.paragraphs, icon: '📋', color: '#10b981' },
  ];

  return (
    <div className="stats-panel">
      <h3 className="stats-title">
        📊 Document Statistics
      </h3>
      <div className="stats-grid">
        {statItems.map((item) => (
          <div key={item.label} className="stat-item" style={{ '--stat-color': item.color } as React.CSSProperties}>
            <div className="stat-icon">{item.icon}</div>
            <div className="stat-content">
              <div className="stat-value">
                <AnimatedCounter value={item.value} />
              </div>
              <div className="stat-label">{item.label}</div>
            </div>
          </div>
        ))}
        
        {/* Reading time - special formatting */}
        <div className="stat-item" style={{ '--stat-color': '#f59e0b' } as React.CSSProperties}>
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-value">
              {stats.readingTime > 0 ? (
                <>
                  <AnimatedCounter value={stats.readingTime} /> min
                </>
              ) : (
                '< 1 min'
              )}
            </div>
            <div className="stat-label">Reading Time</div>
          </div>
        </div>
      </div>
    </div>
  );
}
