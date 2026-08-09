import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import apiClient from '../api/client';
import { useTheme } from '../contexts/ThemeContext';
import { Settings as SettingsIcon, User, Zap, Sun, Moon, Download, CheckCircle2, Shield, Lock, Palette, Sparkles } from 'lucide-react';
import PremiumModal from '../components/PremiumModal';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState(20);
  const [userName, setUserName] = useState('User');
  const [message, setMessage] = useState('');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const isPremium = useSelector((state: any) => state.auth.isPremium);

  const [editName, setEditName] = useState('User');
  const [editEmail, setEditEmail] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const res = await apiClient.get('/auth/me');
      if (res.data.success) {
        const user = res.data.data;
        setHintsRemaining(20 - (user.daily_hint_count || 0));
        setUserName(user.name || 'User');
        setEditName(user.name || 'User');
        setEditEmail(user.email || '');
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleExportData = async () => {
    try {
      const res = await apiClient.get('/problems/');
      if (res.data.success) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data.data, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `algoassist_export_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        setMessage('Exported your tracked problems to JSON successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch {
      setMessage('Failed to export data.');
    }
  };

  const handleUpdateProfile = async () => {
    setIsUpdatingProfile(true);
    try {
      // Mock API call to update profile
      await new Promise(resolve => setTimeout(resolve, 800));
      setUserName(editName);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex">
      <Sidebar
        hintsRemaining={hintsRemaining}
        userName={userName}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <TopNav
          
        />

        <main className="flex-1 p-8 pt-20 max-w-[1400px] w-full mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-light-border dark:border-dark-border">
            <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center">
              <SettingsIcon className="w-4 h-4 text-brand" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-light-text dark:text-dark-text tracking-tight">
                Account & Settings
              </h1>
              <p className="text-xs text-light-muted dark:text-dark-muted">
                Manage your user profile, quota preferences, and data exports.
              </p>
            </div>
          </div>

          {message && (
            <div className="p-3 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Account Profile Card */}
            <div className="p-6 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border space-y-4">
              <h2 className="text-sm font-bold text-light-text dark:text-dark-text flex items-center gap-2">
                <User className="w-4 h-4 text-brand" /> User Profile
              </h2>

              <div className="p-4 rounded-md bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand/20 flex items-center justify-center text-brand text-lg font-bold shrink-0">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-light-text dark:text-dark-text">{userName}</h3>
                    <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded mt-1 ${isPremium ? 'text-brand bg-brand/10 border border-brand/20' : 'text-light-muted bg-light-surface border border-light-border'}`}>
                      {isPremium ? 'Pro Plan' : 'Free Plan'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-light-muted dark:text-dark-muted mb-1 block">Display Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full h-9 px-3 text-sm rounded-md border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-light-muted dark:text-dark-muted mb-1 block">Email Address</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full h-9 px-3 text-sm rounded-md border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text focus:outline-none focus:border-brand"
                    />
                  </div>
                  <button
                    onClick={handleUpdateProfile}
                    disabled={isUpdatingProfile || (!editName.trim() && !editEmail.trim())}
                    className="w-full h-9 mt-1 rounded-md bg-brand text-white text-xs font-medium hover:bg-brand-hover transition-colors disabled:opacity-50"
                  >
                    {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </div>

              {/* Hint Quota Detail */}
              <div className="p-4 rounded-md bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-light-text dark:text-dark-text flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-brand" /> Daily AI Hint Quota
                  </span>
                  <span className="text-light-muted dark:text-dark-muted">{hintsRemaining}/20 hints left</span>
                </div>
                <div className="w-full bg-light-surface dark:bg-dark-surface rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-brand h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(hintsRemaining / 20) * 100}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-light-muted dark:text-dark-muted">
                  Resets every 24 hours automatically.
                </p>
              </div>

              {/* Upgrade Promo */}
              {!isPremium && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-brand/10 to-purple-500/10 border border-brand/20 flex flex-col items-center text-center space-y-3">
                  <div className="w-10 h-10 bg-brand/20 rounded-full flex items-center justify-center text-brand">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-light-text dark:text-dark-text">Upgrade to AlgoAssist Pro</h3>
                    <p className="text-xs text-light-muted dark:text-dark-muted mt-1">Unlimited hints, custom roadmaps, and advanced AI notes analysis.</p>
                  </div>
                  <button
                    onClick={() => setShowPremiumModal(true)}
                    className="px-4 py-2 w-full rounded-md bg-gradient-to-r from-brand to-purple-600 text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    View Premium Plans
                  </button>
                </div>
              )}
            </div>

            {/* Appearance & Preferences */}
            <div className="p-6 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border space-y-4">
              <h2 className="text-sm font-bold text-light-text dark:text-dark-text flex items-center gap-2">
                <Shield className="w-4 h-4 text-brand" /> Preferences & Appearance
              </h2>

              <div className="p-4 rounded-md bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-light-text dark:text-dark-text flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5" /> Appearance Mode
                  </p>
                  <p className="text-[11px] text-light-muted dark:text-dark-muted mt-0.5">Toggle between light and dark themes.</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="px-3 py-1.5 rounded-md border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface hover:bg-light-bg dark:hover:bg-dark-bg transition-colors flex items-center gap-1.5 text-xs font-medium text-light-text dark:text-dark-text"
                >
                  {theme === 'dark' ? <><Moon className="w-3.5 h-3.5" /> Dark</> : <><Sun className="w-3.5 h-3.5" /> Light</>}
                </button>
              </div>

              {/* Custom Themes (Premium Gate) */}
              <div className="p-4 rounded-md bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-light-text dark:text-dark-text flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5" /> Custom Editor Themes
                    </p>
                    <p className="text-[11px] text-light-muted dark:text-dark-muted mt-0.5">Choose your preferred syntax highlighting.</p>
                  </div>
                  {!isPremium && (
                    <span className="text-[10px] font-semibold text-brand bg-brand/10 px-2 py-0.5 rounded border border-brand/20 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> PRO
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {['Ocean', 'Sunset', 'Midnight'].map((customTheme) => (
                    <button
                      key={customTheme}
                      onClick={() => !isPremium && setShowPremiumModal(true)}
                      className={`flex-1 py-1.5 text-[11px] font-medium rounded border ${isPremium ? 'border-light-border dark:border-dark-border hover:border-brand text-light-text dark:text-dark-text bg-light-surface dark:bg-dark-surface cursor-pointer' : 'border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted bg-light-surface/50 dark:bg-dark-surface/50 cursor-not-allowed'}`}
                    >
                      {customTheme}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Export */}
              <div className="p-4 rounded-md bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-light-text dark:text-dark-text">Export Practice Data</p>
                  <p className="text-[11px] text-light-muted dark:text-dark-muted">Download all tracked problems as a JSON file.</p>
                </div>
                <button
                  onClick={handleExportData}
                  className="px-3 py-1.5 rounded-md border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text text-xs font-medium flex items-center gap-1.5 hover:bg-light-bg dark:hover:bg-dark-bg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Export JSON
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>

      <PremiumModal 
        isOpen={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)}
        feature="Custom Editor Themes"
      />
    </div>
  );
}
