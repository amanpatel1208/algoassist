import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import StatCard from '../components/StatCard';
import ProblemTable, { Problem } from '../components/ProblemTable';
import Workspace from '../components/Workspace';
import apiClient from '../api/client';
import { CheckCircle2, TrendingUp, Clock, Target } from 'lucide-react';

export default function Dashboard() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [sortField, setSortField] = useState('solved_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [hintsRemaining, setHintsRemaining] = useState(20);
  const [loading, setLoading] = useState(true);

  const fetchProblems = useCallback(async () => {
    try {
      const res = await apiClient.get('/problems/');
      if (res.data.success) {
        setProblems(res.data.data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const res = await apiClient.get('/auth/me');
      if (res.data.success) {
        const user = res.data.data;
        setHintsRemaining(20 - (user.daily_hint_count || 0));
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchProblems();
    fetchUser();
  }, [fetchProblems, fetchUser]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedProblems = [...problems].sort((a, b) => {
    const aVal = (a as any)[sortField];
    const bVal = (b as any)[sortField];
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    const cmp = String(aVal).localeCompare(String(bVal));
    return sortDirection === 'asc' ? cmp : -cmp;
  });

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/problems/${id}`);
      setProblems((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // silently fail
    }
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
      <Sidebar hintsRemaining={hintsRemaining} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <TopNav hintsRemaining={hintsRemaining} />

        {/* Main Content */}
        <main className="flex-1 p-8 ml-64 max-w-[1400px] w-full mx-auto space-y-8">
          
          {/* Section 1: Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Problems Solved" value={problems.length.toString()} icon={CheckCircle2} />
            <StatCard title="Avg Confidence" value="78%" icon={TrendingUp} />
            <StatCard title="Avg Solve Time" value="24m" icon={Clock} />
            <StatCard title="Interview Ready" value="82%" icon={Target} />
          </div>

          {/* Section 2: Problem Tracker */}
          <div>
            {loading ? (
              <div className="border border-light-border dark:border-dark-border rounded-md bg-light-surface dark:bg-dark-surface px-6 py-16 text-center">
                <p className="text-sm text-light-muted dark:text-dark-muted">Loading…</p>
              </div>
            ) : (
              <ProblemTable
                problems={sortedProblems}
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
