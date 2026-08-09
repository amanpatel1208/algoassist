import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { LayoutDashboard, ListTodo, BarChart2, Calendar, StickyNote, Settings, Zap, LogOut, ChevronLeft, ChevronRight, Sparkles, MoreVertical, Map, Lock } from 'lucide-react';
import PremiumModal from './PremiumModal';

interface SidebarProps {
  hintsRemaining: number;
  userName: string;
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ hintsRemaining, userName, collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const isPremium = useSelector((state: any) => state.auth.isPremium);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Roadmap', path: '/roadmap', icon: Map, isPremium: true },
    { name: 'Problems', path: '/problems', icon: ListTodo },
    { name: 'Statistics', path: '/statistics', icon: BarChart2 },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Notes', path: '/notes', icon: StickyNote },
  ];

  return (
    <div className={`border-r border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg h-screen fixed left-0 top-0 flex flex-col z-20 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo & Toggle */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-transparent">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 shrink-0 bg-brand rounded flex items-center justify-center">
            <span className="text-white text-sm font-bold">A</span>
          </div>
          {!collapsed && <span className="font-semibold text-light-text dark:text-dark-text tracking-tight whitespace-nowrap">AlgoAssist</span>}
        </div>
        <button 
          onClick={onToggle}
          className={`p-1 rounded-md text-light-muted dark:text-dark-muted hover:bg-light-surface dark:hover:bg-dark-surface transition-colors ${collapsed ? 'absolute -right-3 top-5 bg-light-border dark:bg-dark-border border border-light-border dark:border-dark-border rounded-full' : ''}`}
        >
          {collapsed ? <ChevronRight className="w-4 h-4 bg-light-surface dark:bg-dark-surface rounded-full" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isRestricted = item.isPremium && !isPremium;

          return (
            <button
              key={item.name}
              onClick={() => {
                if (isRestricted) {
                  setShowPremiumModal(true);
                } else {
                  navigate(item.path);
                }
              }}
              title={collapsed ? item.name : undefined}
              className={`w-full flex items-center gap-3 p-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-brand text-white font-medium'
                  : 'text-light-muted dark:text-dark-muted hover:bg-light-surface dark:hover:bg-dark-surface hover:text-light-text dark:hover:text-dark-text cursor-pointer'
              } ${collapsed ? 'justify-center' : 'px-3'}`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : ''} ${isRestricted ? 'opacity-70' : ''}`} />
              {!collapsed && (
                <div className="flex items-center justify-between flex-1">
                  <span className={isRestricted ? 'opacity-70' : ''}>{item.name}</span>
                  {isRestricted && <Lock className="w-3.5 h-3.5 text-brand" />}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-2 border-t border-light-border dark:border-dark-border">
        {/* Progress */}
        <div className={`border border-light-border dark:border-dark-border rounded-md bg-light-surface dark:bg-dark-surface mb-2 transition-all ${collapsed ? 'p-2 flex flex-col items-center justify-center gap-1' : 'p-3'}`}>
           {collapsed ? (
             <>
               <Zap className="w-4 h-4 text-brand" />
               <span className="text-xs font-bold text-light-text dark:text-dark-text" title="Today's Progress">{hintsRemaining}</span>
             </>
           ) : (
             <>
                <p className="text-xs font-medium text-light-text dark:text-dark-text flex items-center gap-1.5 mb-2">
                  <Zap className="w-3 h-3 text-brand" /> Today's Progress
                </p>
                <div className="w-full bg-light-border dark:bg-dark-border rounded-full h-1.5 mb-1.5 overflow-hidden">
                  <div 
                    className="bg-brand h-1.5 rounded-full transition-all duration-300" 
                    style={{ width: `${(hintsRemaining / 20) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-light-muted dark:text-dark-muted">{hintsRemaining}/20 hints remaining</p>
             </>
           )}
        </div>

        {/* User Dropdown relative container */}
        <div className="relative">
          {isUserMenuOpen && (
            <div className={`absolute bottom-full mb-2 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg shadow-lg overflow-hidden flex flex-col z-50 ${collapsed ? 'left-2 w-48' : 'left-0 right-0 w-full'}`}>
              {!isPremium && (
                <button 
                  onClick={() => { setIsUserMenuOpen(false); setShowPremiumModal(true); }}
                  className="w-full flex items-center gap-2.5 p-3 text-sm font-medium bg-gradient-to-r from-brand/10 to-purple-600/10 hover:from-brand/20 hover:to-purple-600/20 text-brand transition-colors text-left border-b border-light-border dark:border-dark-border"
                >
                  <Sparkles className="w-4 h-4" />
                  Upgrade to Pro
                </button>
              )}
              <button 
                onClick={() => { setIsUserMenuOpen(false); navigate('/settings'); }}
                className="w-full flex items-center gap-2.5 p-3 text-sm font-medium text-light-text dark:text-dark-text hover:bg-light-bg dark:hover:bg-dark-bg transition-colors text-left"
              >
                <Settings className="w-4 h-4 text-light-muted dark:text-dark-muted" />
                Settings
              </button>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 p-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors text-left border-t border-light-border dark:border-dark-border"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          )}

          {/* User Button */}
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={`w-full flex items-center gap-3 p-2 rounded-md hover:bg-light-surface dark:hover:bg-dark-surface transition-colors cursor-pointer ${collapsed ? 'justify-center flex-col' : ''}`}
          >
            <div className="w-8 h-8 shrink-0 rounded-full bg-brand/20 flex items-center justify-center overflow-hidden">
              <span className="text-brand text-sm font-semibold">{userName.charAt(0).toUpperCase()}</span>
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-light-text dark:text-dark-text truncate">{userName}</p>
                  <p className={`text-[10px] uppercase font-bold tracking-wider truncate ${isPremium ? 'text-brand' : 'text-light-muted dark:text-dark-muted'}`}>
                    {isPremium ? 'Pro Plan' : 'Free Plan'}
                  </p>
                </div>
                <MoreVertical className="w-4 h-4 text-light-muted dark:text-dark-muted shrink-0" />
              </>
            )}
          </button>
        </div>
      </div>

      <PremiumModal 
        isOpen={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)}
      />
    </div>
  );
}
