import { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import apiClient from '../api/client';

interface AddProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProblemAdded: () => void;
}

export default function AddProblemModal({ isOpen, onClose, onProblemAdded }: AddProblemModalProps) {
  const [problemName, setProblemName] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [topic, setTopic] = useState('Arrays');
  const [pattern, setPattern] = useState('Two Pointers');
  const [confidence, setConfidence] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [hintsUsed, setHintsUsed] = useState(false);
  const [coreInsight, setCoreInsight] = useState('');
  const [frequency] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [source, setSource] = useState('LeetCode');
  const [solveTime, setSolveTime] = useState(25);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemName.trim()) {
      setError('Problem name is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await apiClient.post('/problems/', {
        problem_name: problemName.trim(),
        difficulty,
        topic,
        pattern,
        confidence,
        hints_used: hintsUsed,
        core_insight: coreInsight.trim() || 'Logged manually.',
        frequency,
        source,
        solve_time: Number(solveTime) || 20,
      });

      if (res.data.success) {
        onProblemAdded();
        onClose();
        // Reset form
        setProblemName('');
        setCoreInsight('');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add problem.');
    } finally {
      setLoading(false);
    }
  };

  const topicsList = [
    'Arrays', 'Strings', 'Hash Tables', 'Two Pointers', 'Sliding Window',
    'Stack & Queue', 'Binary Search', 'Linked List', 'Trees & BST',
    'Graphs', 'Heap / Priority Queue', 'Dynamic Programming', 'Trie', 'Greedy', 'Backtracking'
  ];

  const patternsList = [
    'Two Pointers', 'Fast & Slow Pointers', 'Sliding Window', 'Merge Intervals',
    'Cyclic Sort', 'In-place Reversal', 'Tree BFS', 'Tree DFS', 'Two Heaps',
    'Subsets', 'Modified Binary Search', 'Top K Elements', 'K-way Merge',
    'Knapsack (DP)', 'Topological Sort', 'Monotonic Stack'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-light-border dark:border-dark-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-brand/20 flex items-center justify-center">
              <Plus className="w-4 h-4 text-brand" />
            </div>
            <h2 className="text-base font-semibold text-light-text dark:text-dark-text">Add Problem Manually</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-bg dark:hover:bg-dark-bg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
              {error}
            </div>
          )}

          {/* Problem Name */}
          <div>
            <label className="block text-xs font-medium text-light-muted dark:text-dark-muted mb-1">
              Problem Name *
            </label>
            <input
              type="text"
              value={problemName}
              onChange={(e) => setProblemName(e.target.value)}
              placeholder="e.g. 3Sum, Valid Anagram, Course Schedule"
              className="w-full h-9 px-3 text-xs rounded-md border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-brand"
              required
            />
          </div>

          {/* Difficulty & Source */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-light-muted dark:text-dark-muted mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full h-9 px-3 text-xs rounded-md border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-brand"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-light-muted dark:text-dark-muted mb-1">
                Source Platform
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-md border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-brand"
              >
                <option value="LeetCode">LeetCode</option>
                <option value="GeeksForGeeks">GeeksForGeeks</option>
                <option value="HackerRank">HackerRank</option>
                <option value="Codeforces">Codeforces</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Topic & Pattern */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-light-muted dark:text-dark-muted mb-1">
                Topic
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-md border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-brand"
              >
                {topicsList.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-light-muted dark:text-dark-muted mb-1">
                Pattern
              </label>
              <select
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-md border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-brand"
              >
                {patternsList.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Confidence & Solve Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-light-muted dark:text-dark-muted mb-1">
                Confidence
              </label>
              <select
                value={confidence}
                onChange={(e) => setConfidence(e.target.value as any)}
                className="w-full h-9 px-3 text-xs rounded-md border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-brand"
              >
                <option value="Low">Low (Needs Review)</option>
                <option value="Medium">Medium (Understood)</option>
                <option value="High">High (Mastered)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-light-muted dark:text-dark-muted mb-1">
                Solve Time (mins)
              </label>
              <input
                type="number"
                value={solveTime}
                onChange={(e) => setSolveTime(Number(e.target.value))}
                min={1}
                max={240}
                className="w-full h-9 px-3 text-xs rounded-md border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          {/* Core Insight */}
          <div>
            <label className="block text-xs font-medium text-light-muted dark:text-dark-muted mb-1">
              Core Insight / Takeaway
            </label>
            <textarea
              value={coreInsight}
              onChange={(e) => setCoreInsight(e.target.value)}
              placeholder="e.g. Use a hash map to store complements for O(N) lookup time."
              rows={2}
              className="w-full p-3 text-xs rounded-md border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-brand resize-none"
            />
          </div>

          {/* Checkbox: Hints Used */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="hintsUsed"
              checked={hintsUsed}
              onChange={(e) => setHintsUsed(e.target.checked)}
              className="w-4 h-4 rounded text-brand focus:ring-brand accent-brand cursor-pointer"
            />
            <label htmlFor="hintsUsed" className="text-xs text-light-text dark:text-dark-text cursor-pointer select-none">
              Did you use hints to solve this problem?
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-light-border dark:border-dark-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-9 text-xs font-medium rounded-md border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-bg dark:hover:bg-dark-bg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 h-9 text-xs font-medium rounded-md bg-brand text-white hover:bg-brand-hover disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {loading ? 'Saving...' : 'Add Problem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
