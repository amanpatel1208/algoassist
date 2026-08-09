import { Search, Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { logout } from '../store/authSlice';

interface TopNavProps {}

export default function TopNav({}: TopNavProps = {}) {
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const handleSearchChange = (query: string) => {
    if (location.pathname !== '/problems') {
      navigate(`/problems?q=${encodeURIComponent(query)}`);
    } else {
      setSearchParams(query ? { q: query } : {});
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg flex items-center justify-between px-8 sticky top-0 z-10 transition-all duration-300">
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
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search tracked problems..."
            className="w-72 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-sm rounded-md pl-9 pr-14 py-1.5 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand text-light-text dark:text-dark-text transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text"
            >
              ✕
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-light-muted dark:text-dark-muted hover:text-red-500 dark:hover:text-red-400 rounded-md hover:bg-red-500/10 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
