import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import apiClient from '../api/client';
import { useProblems } from '../hooks/useProblems';
import { BarChart2, TrendingUp, Target, ShieldCheck, Flame, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import PremiumModal from '../components/PremiumModal';

export default function StatisticsPage() {
  const { problems, fetchProblems } = useProblems();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState(20);
  const [userName, setUserName] = useState('User');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const isPremium = useSelector((state: any) => state.auth.isPremium);

  const fetchUser = useCallback(async () => {
    try {
      const res = await apiClient.get('/auth/me');
      if (res.data.success) {
        const user = res.data.data;
        setHintsRemaining(20 - (user.daily_hint_count || 0));
        setUserName(user.name || 'User');
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchProblems();
    fetchUser();
  }, [fetchProblems, fetchUser]);

  // Compute Statistics
  const analytics = useMemo(() => {
    if (!isPremium) {
      return {
        total: 156,
        easyCount: 45,
        mediumCount: 89,
        hardCount: 22,
        highConfCount: 110,
        medConfCount: 30,
        lowConfCount: 16,
        topicStats: [
          { topic: 'Arrays', count: 45, percentage: 90, mastery: 80 },
          { topic: 'Dynamic Programming', count: 32, percentage: 65, mastery: 40 },
          { topic: 'Graphs', count: 21, percentage: 40, mastery: 50 },
        ],
        avgSolveTime: 24,
        readinessScore: 78,
      };
    }

    const total = problems.length;
    if (total === 0) {
      return {
        total: 0,
        easyCount: 0,
        mediumCount: 0,
        hardCount: 0,
        highConfCount: 0,
        medConfCount: 0,
        lowConfCount: 0,
        topicStats: [],
        avgSolveTime: 0,
        readinessScore: 0,
      };
    }

    const easyCount = problems.filter((p) => p.difficulty === 'Easy').length;
    const mediumCount = problems.filter((p) => p.difficulty === 'Medium').length;
    const hardCount = problems.filter((p) => p.difficulty === 'Hard').length;

    const highConfCount = problems.filter((p) => p.confidence === 'High').length;
    const medConfCount = problems.filter((p) => p.confidence === 'Medium').length;
    const lowConfCount = problems.filter((p) => p.confidence === 'Low').length;

    const solveTimes = problems.filter((p) => p.solve_time != null && p.solve_time > 0).map((p) => p.solve_time!);
    const avgSolveTime = solveTimes.length > 0 ? Math.round(solveTimes.reduce((a, b) => a + b, 0) / solveTimes.length) : 0;

    // Topic Breakdown
    const topicMap: Record<string, { count: number; highConf: number }> = {};
    problems.forEach((p) => {
      const t = p.topic || 'General';
      if (!topicMap[t]) topicMap[t] = { count: 0, highConf: 0 };
      topicMap[t].count += 1;
      if (p.confidence === 'High') topicMap[t].highConf += 1;
    });

    const topicStats = Object.entries(topicMap)
      .map(([topic, data]) => ({
        topic,
        count: data.count,
        percentage: Math.round((data.count / total) * 100),
        mastery: Math.round((data.highConf / data.count) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    const readinessScore = Math.round((highConfCount / total) * 100);

    return {
      total,
      easyCount,
      mediumCount,
      hardCount,
      highConfCount,
      medConfCount,
      lowConfCount,
      topicStats,
      avgSolveTime,
      readinessScore,
    };
  }, [problems]);

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
              <BarChart2 className="w-4 h-4 text-brand" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-light-text dark:text-dark-text tracking-tight flex items-center gap-2">
                Statistics & Analytics
                {!isPremium && (
                  <span className="text-[10px] font-semibold text-brand bg-brand/10 px-2 py-0.5 rounded border border-brand/20 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> PRO
                  </span>
                )}
              </h1>
              <p className="text-xs text-light-muted dark:text-dark-muted">
                Insights into your DSA problem distribution, confidence levels, and topic mastery.
              </p>
            </div>
          </div>

          <div className="relative">
            {!isPremium && (
              <div className="absolute inset-0 z-10 bg-light-bg/60 dark:bg-dark-bg/60 backdrop-blur-[3px] flex flex-col items-center justify-center rounded-lg border border-light-border dark:border-dark-border">
                <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-xl border border-brand/30 shadow-2xl text-center max-w-sm">
                  <div className="w-12 h-12 bg-brand/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-6 h-6 text-brand" />
                  </div>
                  <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">Unlock Advanced Analytics</h3>
                  <p className="text-sm text-light-muted dark:text-dark-muted mb-6">
                    Get deep insights into your readiness score, solve times, and topic mastery with AlgoAssist Pro.
                  </p>
                  <button
                    onClick={() => setShowPremiumModal(true)}
                    className="w-full py-2 bg-gradient-to-r from-brand to-purple-600 text-white rounded-md font-semibold text-sm hover:from-brand-hover hover:to-purple-700 transition-colors shadow-lg flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" /> Upgrade to Pro
                  </button>
                </div>
              </div>
            )}

            <div className={`space-y-6 ${!isPremium ? 'opacity-40 select-none pointer-events-none' : ''}`}>
              {/* Overview Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-light-muted dark:text-dark-muted">Total Solved</span>
                <CheckCircle2 className="w-4 h-4 text-brand" />
              </div>
              <p className="text-2xl font-bold text-light-text dark:text-dark-text mt-2">{analytics.total}</p>
              <p className="text-[11px] text-light-muted dark:text-dark-muted mt-1">Tracked DSA problems</p>
            </div>

            <div className="p-5 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-light-muted dark:text-dark-muted">Interview Readiness</span>
                <Target className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-light-text dark:text-dark-text mt-2">{analytics.readinessScore}%</p>
              <p className="text-[11px] text-light-muted dark:text-dark-muted mt-1">Based on high confidence ratio</p>
            </div>

            <div className="p-5 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-light-muted dark:text-dark-muted">Avg Solve Time</span>
                <TrendingUp className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-light-text dark:text-dark-text mt-2">
                {analytics.avgSolveTime > 0 ? `${analytics.avgSolveTime} mins` : '—'}
              </p>
              <p className="text-[11px] text-light-muted dark:text-dark-muted mt-1">Per problem average</p>
            </div>

            <div className="p-5 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-light-muted dark:text-dark-muted">High Confidence</span>
                <ShieldCheck className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-light-text dark:text-dark-text mt-2">{analytics.highConfCount}</p>
              <p className="text-[11px] text-light-muted dark:text-dark-muted mt-1">Problems ready for interview</p>
            </div>
          </div>

          {/* Grid Section 2: Difficulty & Confidence Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Difficulty Bar */}
            <div className="p-6 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border space-y-4">
              <h3 className="text-sm font-semibold text-light-text dark:text-dark-text flex items-center gap-2">
                <Flame className="w-4 h-4 text-brand" /> Difficulty Breakdown
              </h3>

              {analytics.total === 0 ? (
                <p className="text-xs text-light-muted dark:text-dark-muted py-4">No problem data available yet.</p>
              ) : (
                <div className="space-y-3">
                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-light-bg dark:bg-dark-bg rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${(analytics.easyCount / analytics.total) * 100}%` }}
                      title={`Easy: ${analytics.easyCount}`}
                    ></div>
                    <div
                      className="bg-amber-500 h-full transition-all duration-500"
                      style={{ width: `${(analytics.mediumCount / analytics.total) * 100}%` }}
                      title={`Medium: ${analytics.mediumCount}`}
                    ></div>
                    <div
                      className="bg-red-500 h-full transition-all duration-500"
                      style={{ width: `${(analytics.hardCount / analytics.total) * 100}%` }}
                      title={`Hard: ${analytics.hardCount}`}
                    ></div>
                  </div>

                  {/* Legend & Details */}
                  <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                    <div className="p-2.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">Easy</p>
                      <p className="text-base font-bold text-light-text dark:text-dark-text mt-1">{analytics.easyCount}</p>
                      <p className="text-[10px] text-light-muted dark:text-dark-muted">
                        {Math.round((analytics.easyCount / analytics.total) * 100)}% of total
                      </p>
                    </div>

                    <div className="p-2.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                      <p className="font-semibold text-amber-600 dark:text-amber-400">Medium</p>
                      <p className="text-base font-bold text-light-text dark:text-dark-text mt-1">{analytics.mediumCount}</p>
                      <p className="text-[10px] text-light-muted dark:text-dark-muted">
                        {Math.round((analytics.mediumCount / analytics.total) * 100)}% of total
                      </p>
                    </div>

                    <div className="p-2.5 rounded-md bg-red-500/10 border border-red-500/20">
                      <p className="font-semibold text-red-600 dark:text-red-400">Hard</p>
                      <p className="text-base font-bold text-light-text dark:text-dark-text mt-1">{analytics.hardCount}</p>
                      <p className="text-[10px] text-light-muted dark:text-dark-muted">
                        {Math.round((analytics.hardCount / analytics.total) * 100)}% of total
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confidence Levels */}
            <div className="p-6 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border space-y-4">
              <h3 className="text-sm font-semibold text-light-text dark:text-dark-text flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-500" /> Confidence Distribution
              </h3>

              {analytics.total === 0 ? (
                <p className="text-xs text-light-muted dark:text-dark-muted py-4">No problem data available yet.</p>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-emerald-500">High Confidence</span>
                        <span className="text-light-text dark:text-dark-text">{analytics.highConfCount} ({Math.round((analytics.highConfCount / analytics.total) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-light-bg dark:bg-dark-bg rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${(analytics.highConfCount / analytics.total) * 100}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-amber-500">Medium Confidence</span>
                        <span className="text-light-text dark:text-dark-text">{analytics.medConfCount} ({Math.round((analytics.medConfCount / analytics.total) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-light-bg dark:bg-dark-bg rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full transition-all duration-500" style={{ width: `${(analytics.medConfCount / analytics.total) * 100}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-red-500">Low Confidence (Needs Review)</span>
                        <span className="text-light-text dark:text-dark-text">{analytics.lowConfCount} ({Math.round((analytics.lowConfCount / analytics.total) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-light-bg dark:bg-dark-bg rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full transition-all duration-500" style={{ width: `${(analytics.lowConfCount / analytics.total) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Topic Mastery List */}
          <div className="p-6 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border space-y-4">
            <h3 className="text-sm font-semibold text-light-text dark:text-dark-text">Topic Mastery & Volume</h3>
            
            {analytics.topicStats.length === 0 ? (
              <p className="text-xs text-light-muted dark:text-dark-muted">No topics tracked yet. Solve problems to see your topic breakdown.</p>
            ) : (
              <div className="space-y-3">
                {analytics.topicStats.map((item) => (
                  <div key={item.topic} className="p-3 rounded-md bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border">
                    <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                      <span className="text-light-text dark:text-dark-text font-semibold">{item.topic}</span>
                      <span className="text-light-muted dark:text-dark-muted">
                        {item.count} problem{item.count > 1 ? 's' : ''} ({item.mastery}% High Conf)
                      </span>
                    </div>
                    <div className="w-full bg-light-surface dark:bg-dark-surface rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-brand h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
            </div>
          </div>
        </main>
      </div>

      <PremiumModal 
        isOpen={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)}
        feature="Advanced Analytics"
      />
    </div>
  );
}
