import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme';

/** Bouton clair/sombre réutilisable (topbar, pages de login, portails…). */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle-button icon-button ${className}`}
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={isDark ? 'Mode clair' : 'Mode sombre'}
      data-testid="button-theme-toggle"
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
