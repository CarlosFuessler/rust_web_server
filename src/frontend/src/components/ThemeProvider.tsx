import React, { useState, useMemo, useEffect } from 'react';
import { ThemeContext, type Season, loadSeason, saveSeason } from './themeContext';

// Import season images directly
import springImg from '../assets/spring.jpg';
import summerImg from '../assets/summer.jpg';
import fallImg from '../assets/fall.jpg';
import winterImg from '../assets/winter.jpg';

const SEASON_IMAGES: Record<Season, string> = {
  spring: springImg,
  summer: summerImg,
  fall: fallImg,
  winter: winterImg,
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [season, setSeasonState] = useState<Season>('winter');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load season from localStorage on mount
  useEffect(() => {
    const savedSeason = loadSeason();
    setSeasonState(savedSeason);
    setIsLoaded(true);
  }, []);

  const setSeason = (newSeason: Season) => {
    setSeasonState(newSeason);
    saveSeason(newSeason);
  };

  const backgroundImage = useMemo(() => {
    return SEASON_IMAGES[season];
  }, [season]);

  const value = {
    season,
    setSeason,
    backgroundImage,
  };

  // Always render with ThemeContext.Provider
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom Hook für Theme-Kontext
export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
