import React, { useState } from 'react';
import { useTheme } from './ThemeProvider';
import { SEASON_LABELS, type Season } from './themeContext';
import './ThemeSwitcher.css';

const ThemeSwitcher: React.FC = () => {
  const { season, setSeason } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const seasons: Season[] = ['spring', 'summer', 'fall', 'winter'];

  return (
    <div className="theme-switcher-container">
      <button
        className="theme-switcher-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Theme wechseln"
      >
        <span className="theme-icon">🎨</span>
        <span className="theme-label">{SEASON_LABELS[season]}</span>
      </button>

      {isOpen && (
        <div className="theme-switcher-menu">
          {seasons.map((s) => (
            <button
              key={s}
              className={`theme-option ${season === s ? 'active' : ''}`}
              onClick={() => {
                setSeason(s);
                setIsOpen(false);
              }}
            >
              <span className="season-emoji">
                {s === 'spring' && '🌸'}
                {s === 'summer' && '☀️'}
                {s === 'fall' && '🍂'}
                {s === 'winter' && '❄️'}
              </span>
              <span className="season-name">{SEASON_LABELS[s]}</span>
              {season === s && <span className="check-mark">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
