import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import apiClient from '../api/client';
import { useProblems } from '../hooks/useProblems';
import { Problem } from '../types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, RotateCcw, Plus } from 'lucide-react';
import PremiumModal from '../components/PremiumModal';

export default function CalendarPage() {
  const { problems, loading: _loading, fetchProblems } = useProblems();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState(20);
  const [userName, setUserName] = useState('User');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const isPremium = useSelector((state: any) => state.auth.isPremium);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

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

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Map problems to solved dates & review dates
  const calendarEvents = useMemo(() => {
    const events: Record<string, { solved: Problem[]; reviewDue: Problem[] }> = {};

    problems.forEach((p) => {
      if (p.solved_at) {
        const solvedDate = p.solved_at.split('T')[0];
        if (!events[solvedDate]) events[solvedDate] = { solved: [], reviewDue: [] };
        events[solvedDate].solved.push(p);

        // Schedule reviews based on confidence:
        // Low: review after 1 day and 3 days
        // Medium: review after 3 days and 7 days
        // High: review after 14 days
        const solvedObj = new Date(p.solved_at);

        let intervals = [3, 7];
        if (p.confidence === 'Low') intervals = [1, 3, 7];
        if (p.confidence === 'High') intervals = [14];

        intervals.forEach((days) => {
          const reviewObj = new Date(solvedObj);
          reviewObj.setDate(reviewObj.getDate() + days);
          const reviewDateStr = reviewObj.toISOString().split('T')[0];

          if (!events[reviewDateStr]) events[reviewDateStr] = { solved: [], reviewDue: [] };
          events[reviewDateStr].reviewDue.push(p);
        });
      }
    });

    return events;
  }, [problems]);

  const selectedDateEvents = calendarEvents[selectedDate] || { solved: [], reviewDue: [] };

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
          <div className="flex items-center justify-between pb-4 border-b border-light-border dark:border-dark-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 text-brand" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-light-text dark:text-dark-text tracking-tight">
                  Spaced Repetition Calendar
                </h1>
                <p className="text-xs text-light-muted dark:text-dark-muted">
                  Track when problems were solved and view your automated review schedule.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Calendar Grid Container */}
            <div className="lg:col-span-2 p-6 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border space-y-4">
              
              {/* Controls */}
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-light-text dark:text-dark-text">
                  {monthNames[month]} {year}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-md border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-bg dark:hover:bg-dark-bg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-2.5 py-1 text-xs font-medium rounded-md border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-bg dark:hover:bg-dark-bg transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-md border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-bg dark:hover:bg-dark-bg transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Days Header */}
              <div className="grid grid-cols-7 text-center text-xs font-medium text-light-muted dark:text-dark-muted py-2 border-b border-light-border dark:border-dark-border">
                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty slots before day 1 */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-20 bg-light-bg/30 dark:bg-dark-bg/30 rounded-md"></div>
                ))}

                {/* Days of month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const isSelected = dateStr === selectedDate;
                  const isToday = dateStr === new Date().toISOString().split('T')[0];
                  const events = calendarEvents[dateStr];

                  const hasSolved = events?.solved.length > 0;
                  const hasReview = events?.reviewDue.length > 0;

                  return (
                    <button
                      key={dayNum}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`h-20 p-2 rounded-md border transition-all text-left flex flex-col justify-between ${
                        isSelected
                          ? 'border-brand bg-brand/10 ring-1 ring-brand'
                          : isToday
                          ? 'border-brand/40 bg-light-surface dark:bg-dark-surface'
                          : 'border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface hover:bg-light-bg dark:hover:bg-dark-bg'
                      }`}
                    >
                      <span className={`text-xs font-semibold ${isToday ? 'text-brand font-bold' : 'text-light-text dark:text-dark-text'}`}>
                        {dayNum}
                      </span>

                      <div className="space-y-1">
                        {hasSolved && (
                          <div className="flex items-center gap-1 text-[9px] px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 truncate">
                            <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{events.solved.length} Solved</span>
                          </div>
                        )}
                        {hasReview && (
                          <div className="flex items-center gap-1 text-[9px] px-1 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 truncate">
                            <RotateCcw className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{events.reviewDue.length} Review</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Date Detail Panel */}
            <div className="p-6 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex flex-col h-full space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-light-text dark:text-dark-text">
                    Schedule for {selectedDate}
                  </h3>
                  <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                    Problems solved or scheduled for review on this day.
                  </p>
                </div>
                <button
                  onClick={() => !isPremium && setShowPremiumModal(true)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-brand/30 bg-brand/10 text-brand hover:bg-brand/20 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Reminder
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {/* Solved Problems */}
                <div>
                  <h4 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Solved on this day ({selectedDateEvents.solved.length})
                  </h4>
                  {selectedDateEvents.solved.length === 0 ? (
                    <p className="text-xs text-light-muted dark:text-dark-muted italic">No problems solved on this date.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedDateEvents.solved.map((p) => (
                        <div key={p.id} className="p-3 rounded-md bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border">
                          <p className="text-xs font-semibold text-light-text dark:text-dark-text">{p.problem_name}</p>
                          <div className="flex items-center justify-between text-[10px] text-light-muted dark:text-dark-muted mt-1">
                            <span>{p.topic} • {p.difficulty}</span>
                            <span className="text-brand font-medium">{p.confidence} Conf</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Review Due Problems */}
                <div className="pt-2 border-t border-light-border dark:border-dark-border">
                  <h4 className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5" /> Recommended Reviews ({selectedDateEvents.reviewDue.length})
                  </h4>
                  {selectedDateEvents.reviewDue.length === 0 ? (
                    <p className="text-xs text-light-muted dark:text-dark-muted italic">No reviews due on this date.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedDateEvents.reviewDue.map((p) => (
                        <div key={`rev-${p.id}`} className="p-3 rounded-md bg-light-bg dark:bg-dark-bg border border-amber-500/20">
                          <p className="text-xs font-semibold text-light-text dark:text-dark-text">{p.problem_name}</p>
                          <div className="flex items-center justify-between text-[10px] text-light-muted dark:text-dark-muted mt-1">
                            <span>{p.pattern}</span>
                            <span className="text-amber-500 font-medium">Review Due</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      <PremiumModal 
        isOpen={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)}
        feature="Custom Calendar Reminders"
      />
    </div>
  );
}
