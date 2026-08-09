import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import ProblemTable from '../components/ProblemTable';
import AddProblemModal from '../components/AddProblemModal';
import apiClient from '../api/client';
import { Plus, Filter, RefreshCw, ListTodo } from 'lucide-react';
import { useProblems } from '../hooks/useProblems';

export default function ProblemsPage() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const { problems, loading, fetchProblems, deleteProblem } = useProblems();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState(20);
  const [userName, setUserName] = useState('User');

  // Filters
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedConfidence, setSelectedConfidence] = useState<string>('All');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');

  // Sorting
  const [sortField, setSortField] = useState('solved_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

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

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = async (id: string) => {
    await deleteProblem(id);
  };

  // Get unique topics for filter dropdown
  const uniqueTopics = useMemo(() => {
    const topicsSet = new Set<string>();
    problems.forEach((p) => {
      if (p.topic) topicsSet.add(p.topic);
    });
    return Array.from(topicsSet);
  }, [problems]);

  // Filter & Sort
  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      if (selectedDifficulty !== 'All' && p.difficulty !== selectedDifficulty) return false;
      if (selectedConfidence !== 'All' && p.confidence !== selectedConfidence) return false;
      if (selectedTopic !== 'All' && p.topic !== selectedTopic) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (p.problem_name || '').toLowerCase().includes(q) ||
          (p.topic || '').toLowerCase().includes(q) ||
          (p.pattern || '').toLowerCase().includes(q) ||
          (p.difficulty || '').toLowerCase().includes(q) ||
          (p.source || '').toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => {
      const aVal = (a as any)[sortField];
      const bVal = (b as any)[sortField];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [problems, selectedDifficulty, selectedConfidence, selectedTopic, searchQuery, sortField, sortDirection]);

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
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-light-border dark:border-dark-border">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center">
                  <ListTodo className="w-4 h-4 text-brand" />
                </div>
                <h1 className="text-xl font-bold text-light-text dark:text-dark-text tracking-tight">
                  Problem Management
                </h1>
              </div>
              <p className="text-xs text-light-muted dark:text-dark-muted mt-1">
                View, filter, and track all your solved data structures & algorithms problems.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchProblems}
                className="p-2 rounded-md border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text bg-light-surface dark:bg-dark-surface transition-colors"
                title="Refresh problem list"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 h-9 rounded-md bg-brand text-white font-medium text-xs flex items-center gap-2 hover:bg-brand-hover transition-colors shadow-subtle"
              >
                <Plus className="w-4 h-4" />
                Add Problem Manually
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-light-muted dark:text-dark-muted font-medium mr-2">
                <Filter className="w-3.5 h-3.5" /> Filters:
              </div>

              {/* Difficulty Filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="h-8 px-2.5 text-xs rounded-md border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-brand"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              {/* Confidence Filter */}
              <select
                value={selectedConfidence}
                onChange={(e) => setSelectedConfidence(e.target.value)}
                className="h-8 px-2.5 text-xs rounded-md border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-brand"
              >
                <option value="All">All Confidence Levels</option>
                <option value="High">High Confidence</option>
                <option value="Medium">Medium Confidence</option>
                <option value="Low">Low Confidence</option>
              </select>

              {/* Topic Filter */}
              {uniqueTopics.length > 0 && (
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="h-8 px-2.5 text-xs rounded-md border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-brand"
                >
                  <option value="All">All Topics</option>
                  {uniqueTopics.map((topic) => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>
              )}

              {/* Reset filters */}
              {(selectedDifficulty !== 'All' || selectedConfidence !== 'All' || selectedTopic !== 'All') && (
                <button
                  onClick={() => {
                    setSelectedDifficulty('All');
                    setSelectedConfidence('All');
                    setSelectedTopic('All');
                  }}
                  className="text-xs text-brand hover:underline font-medium ml-1"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div className="text-xs text-light-muted dark:text-dark-muted font-medium">
              Showing <span className="text-light-text dark:text-dark-text font-bold">{filteredProblems.length}</span> of {problems.length} problems
            </div>
          </div>

          {/* Table Container */}
          <div>
            {loading ? (
              <div className="border border-light-border dark:border-dark-border rounded-md bg-light-surface dark:bg-dark-surface px-6 py-16 text-center">
                <p className="text-sm text-light-muted dark:text-dark-muted">Loading problems...</p>
              </div>
            ) : (
              <ProblemTable
                problems={filteredProblems}
                onDelete={handleDelete}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
            )}
          </div>
        </main>
      </div>

      {/* Add Problem Modal */}
      <AddProblemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProblemAdded={fetchProblems}
      />
    </div>
  );
}
