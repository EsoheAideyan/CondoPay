import { useTheme } from '../context/ThemeContext';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      className="rounded-full border border-[#d9dce7] bg-white/80 px-3 py-1.5 text-sm font-medium text-[#2c5282] shadow-sm backdrop-blur-sm hover:bg-[#f0eff4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c5282] dark:border-slate-600 dark:bg-slate-800/80 dark:text-[#a9c8ed] dark:hover:bg-slate-700"
    >
      {isDark ? 'Light mode' : 'Dark mode'}
    </button>
  );
}
