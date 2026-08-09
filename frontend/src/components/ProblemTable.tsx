import { TrashIcon } from '@heroicons/react/24/outline';

import { Problem } from '../types';

interface ProblemTableProps {
  problems: Problem[];
  onDelete: (id: string) => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
}

function DifficultyBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    Easy: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    Medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    Hard: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border ${styles[level] || styles.Medium}`}>
      {level}
    </span>
  );
}

function ConfidenceBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    Low: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    Medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    High: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border ${styles[level] || styles.Medium}`}>
      {level}
    </span>
  );
}

function SortIcon({ field, sortField, sortDirection }: { field: string; sortField: string; sortDirection: string }) {
  if (field !== sortField) {
    return (
      <svg className="w-3.5 h-3.5 text-light-muted/40 dark:text-dark-muted/40 ml-1" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 3l4 5H4l4-5zM8 13l-4-5h8l-4 5z" />
      </svg>
    );
  }
  return (
    <svg className="w-3.5 h-3.5 text-brand ml-1" viewBox="0 0 16 16" fill="currentColor">
      {sortDirection === 'asc' ? (
        <path d="M8 3l4 5H4l4-5z" />
      ) : (
        <path d="M8 13l-4-5h8l-4 5z" />
      )}
    </svg>
  );
}

function getRevisionStatus(problem: Problem) {
  if (!problem.solved_at) return { status: 'None', text: '-' };
  const solvedObj = new Date(problem.solved_at);
  const now = new Date();
  now.setHours(0,0,0,0);
  
  let intervals = [3, 7];
  if (problem.confidence === 'Low') intervals = [1, 3, 7];
  if (problem.confidence === 'High') intervals = [14];
  
  for (const days of intervals) {
    const reviewDate = new Date(solvedObj);
    reviewDate.setDate(reviewDate.getDate() + days);
    reviewDate.setHours(0,0,0,0);
    
    if (reviewDate.getTime() === now.getTime()) {
      return { status: 'Due', text: 'Due Today' };
    } else if (reviewDate > now) {
      const diffTime = Math.abs(reviewDate.getTime() - now.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { status: 'Pending', text: `In ${diffDays}d` };
    }
  }
  return { status: 'Done', text: 'Done' };
}

const columns = [
  { key: 'index', label: '#' },
  { key: 'problem_name', label: 'Problem' },
  { key: 'difficulty', label: 'Difficulty' },
  { key: 'topic', label: 'Topic' },
  { key: 'pattern', label: 'Pattern' },
  { key: 'confidence', label: 'Confidence' },
  { key: 'hint_needed', label: 'Hints' },
  { key: 'core_insight', label: 'Core Insight' },
  { key: 'interview_frequency', label: 'Freq.' },
  { key: 'source', label: 'Source' },
  { key: 'solved_at', label: 'Date' },
  { key: 'revision', label: 'Revision' },
];

export default function ProblemTable({ problems, onDelete, sortField, sortDirection, onSort }: ProblemTableProps) {
  if (problems.length === 0) {
    return (
      <div className="border border-light-border dark:border-dark-border rounded-md bg-light-surface dark:bg-dark-surface">
        <div className="px-6 py-16 text-center">
          <p className="text-sm text-light-muted dark:text-dark-muted">
            No problems tracked yet. Start a session below to begin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-light-text dark:text-dark-text">Problem Tracker</h2>
        <p className="text-xs text-light-muted dark:text-dark-muted">{problems.length} problem{problems.length !== 1 ? 's' : ''} tracked</p>
      </div>
      
      <div className="border border-light-border dark:border-dark-border rounded-md bg-light-surface dark:bg-dark-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-light-border dark:border-dark-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => onSort(col.key)}
                  className="px-4 py-2.5 text-left text-xs font-medium text-light-muted dark:text-dark-muted uppercase tracking-wider cursor-pointer select-none hover:text-light-text dark:hover:text-dark-text transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center">
                    {col.label}
                    <SortIcon field={col.key} sortField={sortField} sortDirection={sortDirection} />
                  </div>
                </th>
              ))}
              <th className="px-4 py-2.5 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-light-border/60 dark:divide-dark-border/60">
            {problems.map((problem, idx) => {
              const revStatus = getRevisionStatus(problem);
              return (
                <tr
                  key={problem.id}
                  className="hover:bg-light-bg/60 dark:hover:bg-dark-bg/40 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-light-muted dark:text-dark-muted whitespace-nowrap">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-light-text dark:text-dark-text whitespace-nowrap">
                    {problem.problem_name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <DifficultyBadge level={problem.difficulty} />
                  </td>
                  <td className="px-4 py-3 text-light-muted dark:text-dark-muted whitespace-nowrap">
                    {problem.topic}
                  </td>
                  <td className="px-4 py-3 text-light-muted dark:text-dark-muted whitespace-nowrap">
                    {problem.pattern}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <ConfidenceBadge level={problem.confidence} />
                  </td>
                  <td className="px-4 py-3 text-light-muted dark:text-dark-muted whitespace-nowrap">
                    {problem.hint_needed ? (
                      <span className="text-amber-600 dark:text-amber-400">Yes</span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-light-muted dark:text-dark-muted max-w-[200px] truncate" title={problem.core_insight}>
                    {problem.core_insight}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <ConfidenceBadge level={problem.interview_frequency} />
                  </td>
                  <td className="px-4 py-3 text-light-muted dark:text-dark-muted whitespace-nowrap">
                    {problem.source}
                  </td>
                  <td className="px-4 py-3 text-light-muted dark:text-dark-muted whitespace-nowrap">
                    {new Date(problem.solved_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      revStatus.status === 'Due' ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' :
                      revStatus.status === 'Pending' ? 'text-amber-500 bg-amber-500/10' :
                      'text-light-muted dark:text-dark-muted'
                    }`}>
                      {revStatus.text}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => onDelete(problem.id)}
                      className="p-1 rounded text-light-muted/50 dark:text-dark-muted/50 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      aria-label="Delete problem"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}
