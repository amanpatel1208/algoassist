import { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import StatCard from '../components/StatCard';
import ProblemTable from '../components/ProblemTable';
import Workspace from '../components/Workspace';
import apiClient from '../api/client';
import { CheckCircle2, TrendingUp, Clock, Target } from 'lucide-react';
import { useProblems } from '../hooks/useProblems';

export default function Dashboard() {
  const { problems, loading, fetchProblems, deleteProblem } = useProblems();
  const [sortField, setSortField] = useState('solved_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [hintsRemaining, setHintsRemaining] = useState(20);
  const [userName, setUserName] = useState('User');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  // Compute real stats from problem data
  const stats = useMemo(() => {
    if (problems.length === 0) {
      return { avgConfidence: '—', avgSolveTime: '—', interviewReady: '—' };
    }

    const confidenceMap: Record<string, number> = { Low: 33, Medium: 66, High: 100 };
    const confidenceValues = problems
      .map((p) => confidenceMap[p.confidence] ?? 50)
    const avgConfidence = Math.round(
      confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length
    );

    const solveTimes = problems
      .filter((p) => p.solve_time != null && p.solve_time > 0)
      .map((p) => p.solve_time!);
    const avgSolveTime =
      solveTimes.length > 0
        ? Math.round(solveTimes.reduce((a, b) => a + b, 0) / solveTimes.length)
        : 0;

    const highConfCount = problems.filter((p) => p.confidence === 'High').length;
    const interviewReady = Math.round((highConfCount / problems.length) * 100);

    return {
      avgConfidence: `${avgConfidence}%`,
      avgSolveTime: avgSolveTime > 0 ? `${avgSolveTime}m` : '—',
      interviewReady: `${interviewReady}%`,
    };
  }, [problems]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter + sort problems
  const filteredAndSortedProblems = useMemo(() => {
    let filtered = problems;
    return [...filtered].sort((a, b) => {
      const aVal = (a as any)[sortField];
      const bVal = (b as any)[sortField];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [problems, sortField, sortDirection]);

  const handleDelete = async (id: string) => {
    await deleteProblem(id);
  };

  const handleSessionFinished = () => {
    fetchProblems();
  };

  const handleHintUsed = () => {
    setHintsRemaining((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex">
      {/* Sidebar */}
      <Sidebar 
        hintsRemaining={hintsRemaining} 
        userName={userName} 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Top Navbar */}
        <TopNav 
          
        />

        {/* Main Content — pt-20 pushes below the sticky TopNav */}
        <main className="flex-1 p-8 pt-20 max-w-[1400px] w-full mx-auto space-y-8">
          
          {/* Section 1: Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Problems Solved" value={problems.length.toString()} icon={CheckCircle2} />
            <StatCard title="Avg Confidence" value={stats.avgConfidence} icon={TrendingUp} />
            <StatCard title="Avg Solve Time" value={stats.avgSolveTime} icon={Clock} />
            <StatCard title="Interview Ready" value={stats.interviewReady} icon={Target} />
          </div>

          {/* Section 2: Problem Tracker */}
          <div>
            {loading ? (
              <div className="border border-light-border dark:border-dark-border rounded-md bg-light-surface dark:bg-dark-surface px-6 py-16 text-center">
                <p className="text-sm text-light-muted dark:text-dark-muted">Loading…</p>
              </div>
            ) : (
              <ProblemTable
                problems={filteredAndSortedProblems}
                onDelete={handleDelete}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
            )}
          </div>

          {/* Section 3: Workspace */}
          <div>
            <Workspace
              onSessionFinished={handleSessionFinished}
              onHintUsed={handleHintUsed}
            />
          </div>

        </main>
      </div>
    </div>
  );
}
