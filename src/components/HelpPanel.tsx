import './HelpPanel.css';

interface HelpPanelProps {
  onClose: () => void;
}

export function HelpPanel({ onClose }: HelpPanelProps) {
  return (
    <div className="help-overlay" onClick={onClose}>
      <div className="help-panel" onClick={(e) => e.stopPropagation()}>
        <div className="help-header">
          <h2>❓ Help & Guide</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="help-content">
          <section className="help-section">
            <h3>🎨 Weather-Based Themes</h3>
            <p>
              Sit or Live automatically changes your IDE and terminal themes based on the weather in your selected location.
            </p>
            <ul>
              <li>☀️ <strong>Daylight Survivor</strong> - Clear weather</li>
              <li>🌙 <strong>Vampire Night</strong> - Cloudy</li>
              <li>🌫️ <strong>Silent Hill</strong> - Foggy</li>
              <li>🌧️ <strong>Rainy Cemetery</strong> - Rainy</li>
              <li>❄️ <strong>Frozen Dead</strong> - Snowy</li>
              <li>⛈️ <strong>Frankenstein Lab</strong> - Stormy</li>
            </ul>
          </section>

          <section className="help-section">
            <h3>💪 Health Monitoring</h3>
            <p>
              Track your activity and take care of your health while coding:
            </p>
            <ul>
              <li><strong>Activity Intensity</strong> - Real-time activity level (0-100%)</li>
              <li><strong>Work Time</strong> - Total session duration</li>
              <li><strong>Idle Time</strong> - Time without keyboard/mouse activity</li>
              <li><strong>Zombie Warning</strong> - Alert after 30 minutes of inactivity</li>
            </ul>
          </section>

          <section className="help-section">
            <h3>👁️ Eye Health (20-20-20 Rule)</h3>
            <p>
              Every 20 minutes, look at something 20 feet away for 20 seconds.
            </p>
            <p><strong>Eye Strain Levels:</strong></p>
            <ul>
              <li>😊 <strong>Safe</strong> (0-30%) - You're doing great!</li>
              <li>👻 <strong>Ghost</strong> (30-60%) - Take a short break soon</li>
              <li>🧟 <strong>Zombie</strong> (60-80%) - Break recommended</li>
              <li>💀 <strong>Danger</strong> (80-100%) - Take a break now!</li>
            </ul>
          </section>

          <section className="help-section">
            <h3>📍 Location</h3>
            <p>
              Search for your city or select from 30 built-in major cities. The app fetches weather data every 30 minutes.
            </p>
          </section>

          <section className="help-section">
            <h3>⚙️ Settings</h3>
            <p>
              Configure your IDE, terminal, Discord notifications, and health monitoring preferences in the settings panel.
            </p>
          </section>

          <section className="help-section">
            <h3>🔔 Discord Integration</h3>
            <p>
              Get notifications in Discord when:
            </p>
            <ul>
              <li>Theme changes based on weather</li>
              <li>Zombie warning triggered</li>
              <li>Eye break reminder appears</li>
            </ul>
            <p className="help-note">
              <strong>Note:</strong> You need to create a webhook in your Discord server settings.
            </p>
          </section>

          <section className="help-section">
            <h3>⌨️ Keyboard Shortcuts</h3>
            <ul>
              <li><kbd>Esc</kbd> - Close modals</li>
              <li><kbd>Enter</kbd> - Search location</li>
            </ul>
          </section>

          <section className="help-section">
            <h3>🐛 Troubleshooting</h3>
            <p><strong>Theme not applying?</strong></p>
            <ul>
              <li>Make sure you selected your IDE/Terminal in settings</li>
              <li>Check that the IDE/Terminal is installed</li>
              <li>Restart your IDE/Terminal after theme change</li>
            </ul>
            <p><strong>Weather not updating?</strong></p>
            <ul>
              <li>Check your internet connection</li>
              <li>Try searching for a different city</li>
              <li>Weather updates every 30 minutes</li>
            </ul>
          </section>

          <section className="help-section">
            <h3>ℹ️ About</h3>
            <p>
              <strong>Sit or Live (앉거나 살거나)</strong><br />
              Version 1.0.0<br />
              Built for Kiroween Hackathon 2025<br />
              Frankenstein Category
            </p>
            <p className="help-note">
              Stay healthy while coding! 🧟💪
            </p>
          </section>
        </div>

        <div className="help-footer">
          <button className="button" onClick={onClose}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
