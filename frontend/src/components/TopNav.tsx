import { Search, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function TopNav({ hintsRemaining }: { hintsRemaining: number }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 border-b border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg flex items-center justify-between px-8 sticky top-0 z-10 ml-64">
      {/* Title */}
      <h1 className="text-xl font-semibold text-light-text dark:text-dark-text tracking-tight">
        Dashboard
      </h1>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative group hidden md:block">
          <Search className="w-4 h-4 text-light-muted dark:text-dark-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Problems or Docs..."
            className="w-72 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-sm rounded-md pl-9 pr-14 py-1.5 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand text-light-text dark:text-dark-text transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            <kbd className="hidden sm:inline-block border border-light-border dark:border-dark-border rounded px-1.5 text-[10px] font-medium text-light-muted dark:text-dark-muted bg-light-bg dark:bg-dark-bg">⌘</kbd>
            <kbd className="hidden sm:inline-block border border-light-border dark:border-dark-border rounded px-1.5 text-[10px] font-medium text-light-muted dark:text-dark-muted bg-light-bg dark:bg-dark-bg">K</kbd>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <div className="flex items-center gap-2 px-2 py-1 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-md">
            <span className="text-xs font-medium text-light-text dark:text-dark-text">Hint</span>
            <span className="bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{hintsRemaining}</span>
          </div>

          <div className="w-8 h-8 rounded-full bg-light-border dark:bg-dark-border overflow-hidden border border-light-border dark:border-dark-border">
            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=Aman&backgroundColor=e5e7eb`} alt="User avatar" />
          </div>
        </div>
      </div>
    </header>
  );
}
