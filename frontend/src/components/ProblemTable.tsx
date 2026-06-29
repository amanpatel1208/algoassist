import { TrashIcon } from '@heroicons/react/24/outline';

export interface Problem {
  id: string;
  problem_name: string;
  difficulty: string;
  topic: string;
  pattern: string;
  confidence: string;
  hint_needed: boolean;
  core_insight: string;
  interview_frequency: string;
  source: string;
  solved_at: string;
  notes?: string;
  solve_time?: number;
}

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

const columns = [
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
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg className="w-4 h-4 text-light-muted dark:text-dark-muted absolute left-2.5 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-xs rounded-md pl-8 pr-3 py-1.5 focus:outline-none focus:border-brand text-light-text dark:text-dark-text"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface rounded-md text-xs font-medium text-light-text dark:text-dark-text hover:bg-light-bg dark:hover:bg-dark-bg transition-colors">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filter
          </button>
        </div>
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
            {problems.map((problem) => (
              <tr
                key={problem.id}
                className="hover:bg-light-bg/60 dark:hover:bg-dark-bg/40 transition-colors"
              >
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
                  <button
                    onClick={() => onDelete(problem.id)}
                    className="p-1 rounded text-light-muted/50 dark:text-dark-muted/50 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    aria-label="Delete problem"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}
