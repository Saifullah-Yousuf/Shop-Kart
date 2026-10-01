import Icon from './Icon';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button className="icon-btn" onClick={toggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
    </button>
  );
}
