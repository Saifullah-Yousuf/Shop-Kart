import { createContext, useContext, useEffect, useState } from 'react';
import { useSettings } from './SettingsContext';

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

const systemTheme = () => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

// The visitor's own choice wins; otherwise use the default the admin picked in Settings
export function ThemeProvider({ children }) {
  const { settings } = useSettings();
  const [choice, setChoice] = useState(() => localStorage.getItem('theme'));

  const fallback = settings.defaultTheme === 'light' || settings.defaultTheme === 'dark' ? settings.defaultTheme : systemTheme();
  const theme = choice === 'light' || choice === 'dark' ? choice : fallback;

  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    setChoice(next);
  };

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}
