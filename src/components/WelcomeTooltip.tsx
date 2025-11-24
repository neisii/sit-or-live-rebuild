import { useEffect, useState } from 'react';
import './WelcomeTooltip.css';

interface WelcomeTooltipProps {
  onClose: () => void;
}

export function WelcomeTooltip({ onClose }: WelcomeTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Delay for smooth animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  return (
    <div className={`welcome-tooltip-overlay ${isVisible ? 'visible' : ''}`}>
      <div className="welcome-tooltip">
        <button className="tooltip-close" onClick={handleClose}>
          ✕
        </button>
        
        <h2>Welcome to sit-or-live! 🧟</h2>
        <p className="tooltip-subtitle">앉거나 살거나!</p>
        
        <div className="tooltip-content">
          <div className="tooltip-section">
            <h3>🌤️ Weather & Theme</h3>
            <p>Auto theme switching based on weather:</p>
            <ul>
              <li>Search for your city or use quick select</li>
              <li>6 Halloween themes based on weather conditions</li>
              <li>Syncs to your system dark mode</li>
            </ul>
          </div>
          
          <div className="tooltip-section">
            <h3>💪 Health Monitor</h3>
            <p>Track your health while coding:</p>
            <ul>
              <li><strong>Activity Level</strong>: Real-time keyboard/mouse tracking</li>
              <li><strong>Idle Time</strong>: How long since last activity</li>
              <li><strong>Session Duration</strong>: Total time working</li>
              <li><strong>Zombie Warnings</strong>: Alerts after 30 min idle</li>
            </ul>
          </div>
          
          <div className="tooltip-section">
            <h3>👁️ Eye Health</h3>
            <p>Follow the 20-20-20 rule:</p>
            <ul>
              <li>Every 20 minutes of work</li>
              <li>Look at something 20 feet away</li>
              <li>For 20 seconds</li>
            </ul>
          </div>
        </div>
        
        <button className="tooltip-button" onClick={handleClose}>
          Got it! Let's start 🚀
        </button>
      </div>
    </div>
  );
}
