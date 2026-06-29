import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ListTodo, History, BarChart2, Calendar, StickyNote, Settings, Zap } from 'lucide-react';

export default function Sidebar({ hintsRemaining }: { hintsRemaining: number }) {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Problems', path: '#', icon: ListTodo },
    { name: 'Sessions', path: '#', icon: History },
    { name: 'Statistics', path: '#', icon: BarChart2 },
    { name: 'Calendar', path: '#', icon: Calendar },
    { name: 'Notes', path: '#', icon: StickyNote },
    { name: 'Settings', path: '#', icon: Settings },
  ];

  return (
    <div className="w-64 border-r border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg h-screen fixed left-0 top-0 flex flex-col z-20">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-transparent">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-brand rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <span className="font-semibold text-light-text dark:text-dark-text tracking-tight">AlgoAssist</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-brand text-white'
                  : 'text-light-muted dark:text-dark-muted hover:bg-light-surface dark:hover:bg-dark-surface hover:text-light-text dark:hover:text-dark-text'
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-light-border dark:border-dark-border">
        <div className="border border-light-border dark:border-dark-border rounded-md p-3 bg-light-surface dark:bg-dark-surface mb-4">
          <p className="text-xs font-medium text-light-text dark:text-dark-text flex items-center gap-1.5 mb-2">
            <Zap className="w-3 h-3 text-brand" /> Today's Progress
          </p>
          <div className="w-full bg-light-border dark:bg-dark-border rounded-full h-1.5 mb-1.5 overflow-hidden">
            <div 
              className="bg-brand h-1.5 rounded-full" 
              style={{ width: `${(hintsRemaining / 20) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-light-muted dark:text-dark-muted">{hintsRemaining}/20 hints remaining</p>
        </div>

        <div className="flex items-center gap-3 px-2 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-light-border dark:bg-dark-border flex items-center justify-center overflow-hidden">
            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=Aman&backgroundColor=e5e7eb`} alt="User" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-light-text dark:text-dark-text truncate">User</p>
            <p className="text-xs text-light-muted dark:text-dark-muted truncate">Pro Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
