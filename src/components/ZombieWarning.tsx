import { useEffect, useState } from 'react';
import './ZombieWarning.css';

interface ZombieWarningProps {
  onClose: () => void;
  idleMinutes?: number;
}

const getZombieMessages = (minutes: number) => [
  `🧟 You've been idle for ${minutes} minutes!`,
  "🧟‍♂️ Move! Before you become a zombie!",
  "🧟‍♀️ Stand up and stretch!",
  "💀 Sitting kills! Time to move!",
  "🦴 Your back is getting stiff...",
  `👻 ${minutes} minutes of no movement!`,
  "🧟 Zombie mode activated! Move now!",
  "💀 Your body needs movement!",
];

export function ZombieWarning({ onClose, idleMinutes = 30 }: ZombieWarningProps) {
  const [message] = useState(() => {
    const messages = getZombieMessages(idleMinutes);
    return messages[Math.floor(Math.random() * messages.length)];
  });
  
  useEffect(() => {
    // Auto-close after 10 seconds
    const timer = setTimeout(onClose, 10000);
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className="zombie-warning-overlay" onClick={onClose}>
      <div className="zombie-warning" onClick={(e) => e.stopPropagation()}>
        <div className="zombie-emoji">🧟</div>
        <h2 className="zombie-message">{message}</h2>
        <p className="zombie-advice">
          Take a break! Walk around, stretch, or do some exercises.
          Your body will thank you! 💪
        </p>
        <button className="zombie-button" onClick={onClose}>
          I'm moving! 🏃
        </button>
        <p className="zombie-auto-close">
          Auto-closes in 10 seconds...
        </p>
      </div>
    </div>
  );
}
