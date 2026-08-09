import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import apiClient from '../api/client';
import { Map, CheckCircle2, Circle, Lock } from 'lucide-react';

interface RoadmapTopic {
  id: string;
  name: string;
  description: string;
  status: 'locked' | 'current' | 'completed';
  problems: { name: string; completed: boolean }[];
}

const PREMIUM_ROADMAP: RoadmapTopic[] = [
  {
    id: '1',
    name: 'Arrays & Hashing',
    description: 'The foundation of data structures. Learn to manipulate arrays and use hash maps for O(1) lookups.',
    status: 'completed',
    problems: [
      { name: 'Two Sum', completed: true },
      { name: 'Valid Anagram', completed: true },
      { name: 'Contains Duplicate', completed: true },
    ]
  },
  {
    id: '2',
    name: 'Two Pointers',
    description: 'A technique for searching pairs in sorted arrays or linked lists.',
    status: 'current',
    problems: [
      { name: 'Valid Palindrome', completed: true },
      { name: '3Sum', completed: false },
      { name: 'Container With Most Water', completed: false },
    ]
  },
  {
    id: '3',
    name: 'Sliding Window',
    description: 'Track a subset of data in an array/string by maintaining a window.',
    status: 'locked',
    problems: [
      { name: 'Best Time to Buy and Sell Stock', completed: false },
      { name: 'Longest Substring Without Repeating Characters', completed: false },
    ]
  },
  {
    id: '4',
    name: 'Trees & Graphs',
    description: 'Hierarchical data structures. Master BFS and DFS traversal techniques.',
    status: 'locked',
    problems: [
      { name: 'Invert Binary Tree', completed: false },
      { name: 'Number of Islands', completed: false },
    ]
  }
];

export default function RoadmapPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState(20);
  const [userName, setUserName] = useState('User');
  
  const isPremium = useSelector((state: any) => state.auth.isPremium);
  const navigate = useNavigate();

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
    fetchUser();
    if (!isPremium) {
      navigate('/dashboard');
    }
  }, [fetchUser, isPremium, navigate]);

  if (!isPremium) return null;

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

        <main className="flex-1 p-8 pt-20 max-w-[1000px] w-full mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-light-border dark:border-dark-border">
            <div className="w-10 h-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center">
              <Map className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-light-text dark:text-dark-text tracking-tight flex items-center gap-2">
                Premium Custom Roadmap
                <span className="text-[10px] font-semibold text-brand bg-brand/10 px-2 py-0.5 rounded border border-brand/20 flex items-center gap-1">
                  PRO
                </span>
              </h1>
              <p className="text-sm text-light-muted dark:text-dark-muted">
                Your personalized AI-curated path to mastering Data Structures and Algorithms.
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative border-l-2 border-light-border dark:border-dark-border ml-4 space-y-12 pb-12">
            {PREMIUM_ROADMAP.map((topic, index) => (
              <div key={topic.id} className="relative pl-8">
                {/* Timeline dot */}
                <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-light-bg dark:bg-dark-bg ${
                  topic.status === 'completed' ? 'border-brand' : 
                  topic.status === 'current' ? 'border-brand shadow-[0_0_8px_rgba(var(--color-brand),0.5)]' : 
                  'border-light-border dark:border-dark-border'
                }`}>
                  {topic.status === 'completed' && <div className="w-full h-full rounded-full bg-brand p-0.5"></div>}
                  {topic.status === 'current' && <div className="w-full h-full rounded-full bg-brand/20"></div>}
                </div>

                <div className={`p-6 rounded-lg border ${
                  topic.status === 'current' ? 'bg-brand/5 border-brand/30' : 
                  topic.status === 'completed' ? 'bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border' :
                  'bg-light-surface/50 dark:bg-dark-surface/50 border-light-border/50 dark:border-dark-border/50 opacity-60'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-bold text-light-text dark:text-dark-text flex items-center gap-2">
                      <span className="text-sm text-brand font-mono">Phase {index + 1}</span>
                      {topic.name}
                      {topic.status === 'locked' && <Lock className="w-4 h-4 ml-2 text-light-muted dark:text-dark-muted" />}
                    </h2>
                    {topic.status === 'completed' && <span className="text-xs font-semibold text-brand bg-brand/10 px-2 py-1 rounded-md">Completed</span>}
                    {topic.status === 'current' && <span className="text-xs font-semibold text-brand bg-brand/10 px-2 py-1 rounded-md border border-brand/20">In Progress</span>}
                  </div>
                  
                  <p className="text-sm text-light-muted dark:text-dark-muted mb-4">{topic.description}</p>
                  
                  <div className="space-y-2">
                    {topic.problems.map((prob, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        {prob.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-brand" />
                        ) : (
                          <Circle className="w-4 h-4 text-light-muted dark:text-dark-muted" />
                        )}
                        <span className={prob.completed ? 'text-light-muted dark:text-dark-muted line-through' : 'text-light-text dark:text-dark-text'}>
                          {prob.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </main>
      </div>
    </div>
  );
}
