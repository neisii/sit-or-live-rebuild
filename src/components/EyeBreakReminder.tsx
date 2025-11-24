import { useState, useEffect } from 'react';
import './EyeBreakReminder.css';

interface EyeBreakReminderProps {
  onComplete: () => void;
  onSkip: () => void;
  breakDuration: number; // seconds
  character: { emoji: string; title: string; message: string };
}

export function EyeBreakReminder({ 
  onComplete, 
  onSkip, 
  breakDuration, 
  character 
}: EyeBreakReminderProps) {
  const [timeLeft, setTimeLeft] = useState(breakDuration);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="eye-break-overlay" onClick={onSkip}>
      <div className="eye-break-reminder" onClick={(e) => e.stopPropagation()}>
        <div className="character-emoji">{character.emoji}</div>
        <h2 className="character-title">{character.title}</h2>
        <p className="character-message">{character.message}</p>
        
        <div className="countdown-circle">
          <div className="countdown-number">{timeLeft}</div>
          <div className="countdown-label">seconds</div>
        </div>
        
        <div className="break-instructions">
          <h3>👁️ 20-20-20 Rule</h3>
          <p>Look at something 20 feet (6 meters) away for 20 seconds</p>
          <ul>
            <li>Reduces eye strain</li>
            <li>Prevents dry eyes</li>
            <li>Improves focus</li>
          </ul>
        </div>
        
        <div className="break-actions">
          <button className="complete-button" onClick={onComplete}>
            ✅ Complete Break
          </button>
          <button className="skip-button" onClick={onSkip}>
            Skip (not recommended)
          </button>
        </div>
      </div>
    </div>
  );
}
