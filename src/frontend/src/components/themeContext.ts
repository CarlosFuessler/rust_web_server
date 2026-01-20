import { createContext } from 'react';

export type Season = 'spring' | 'summer' | 'fall' | 'winter';

export interface ThemeContextType {
  season: Season;
  setSeason: (season: Season) => void;
  backgroundImage: string;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Season-Hintergründe
export const SEASON_BACKGROUNDS: Record<Season, string> = {
  spring: 'spring.jpg',
  summer: 'summer.jpg',
  fall: 'fall.jpg',
  winter: 'winter.jpg',
};

export const SEASON_LABELS: Record<Season, string> = {
  spring: '🌸 Frühling',
  summer: '☀️ Sommer',
  fall: '🍂 Herbst',
  winter: '❄️ Winter',
};

// LocalStorage Schlüssel
export const THEME_STORAGE_KEY = 'app_theme_season';

// Default Season
export const DEFAULT_SEASON: Season = 'winter';

// Funktion um Season aus localStorage zu laden
export const loadSeason = (): Season => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && ['spring', 'summer', 'fall', 'winter'].includes(stored)) {
      return stored as Season;
    }
  } catch (e) {
    console.warn('Failed to load theme from localStorage:', e);
  }
  return DEFAULT_SEASON;
};

// Funktion um Season in localStorage zu speichern
export const saveSeason = (season: Season): void => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, season);
    console.log(`🎨 Season changed to: ${season}`);
  } catch (e) {
    console.warn('Failed to save theme to localStorage:', e);
  }
};
