import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { RootState } from '../store';
import { logout } from '../store/authSlice';
import ThemeToggle from './ThemeToggle';
import {
  ArrowRightStartOnRectangleIcon,
  CommandLineIcon,
} from '@heroicons/react/24/outline';

export default function Navbar() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-light-border dark:border-dark-border bg-light-surface/80 dark:bg-dark-surface/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-md bg-brand flex items-center justify-center">
            <CommandLineIcon className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-light-text dark:text-dark-text tracking-tight">
            AlgoAssist
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="ml-2 flex items-center gap-1.5 px-3 py-1.5 text-sm text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text rounded-md hover:bg-light-border/50 dark:hover:bg-dark-border/50 transition-colors"
            >
              <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
              <span>Log out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
