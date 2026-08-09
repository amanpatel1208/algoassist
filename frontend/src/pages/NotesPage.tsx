import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import apiClient from '../api/client';
import { StickyNote, BookOpen, Edit3, Save, Sparkles, Code2, Copy, Check, Wand2 } from 'lucide-react';
import PremiumModal from '../components/PremiumModal';

interface CheatSheet {
  id: string;
  title: string;
  category: string;
  summary: string;
  whenToUse: string[];
  codeTemplate: string;
}

const BUILT_IN_CHEAT_SHEETS: CheatSheet[] = [
  {
    id: 'two-pointers',
    title: 'Two Pointers Pattern',
    category: 'Arrays & Strings',
    summary: 'Use two pointers searching from opposite ends or moving together to solve search problems in sorted arrays.',
    whenToUse: [
      'Array or string is sorted',
      'Searching for pairs that satisfy a condition (e.g., Two Sum II)',
      'Comparing elements from start and end (e.g., Valid Palindrome)'
    ],
    codeTemplate: `vector<int> twoPointers(vector<int>& arr, int target) {\n    int left = 0, right = arr.size() - 1;\n    while (left < right) {\n        int sum = arr[left] + arr[right];\n        if (sum == target) return {left, right};\n        else if (sum < target) left++;\n        else right--;\n    }\n    return {};\n}`
  },
  {
    id: 'sliding-window',
    title: 'Sliding Window Pattern',
    category: 'Subarrays & Substrings',
    summary: 'Maintain a contiguous window over an array/string and expand/contract it to find optimal subarrays.',
    whenToUse: [
      'Problem asks for longest/shortest subarray/substring satisfying a condition',
      'Contiguous sequence requirement',
      'Examples: Maximum Sum Subarray of Size K'
    ],
    codeTemplate: `int slidingWindow(string s) {\n    unordered_map<char, int> window_map;\n    int left = 0, max_len = 0;\n    for (int right = 0; right < s.length(); right++) {\n        window_map[s[right]]++;\n        while (!isValid(window_map)) {\n            window_map[s[left]]--;\n            if (window_map[s[left]] == 0) window_map.erase(s[left]);\n            left++;\n        }\n        max_len = max(max_len, right - left + 1);\n    }\n    return max_len;\n}`
  },
  {
    id: 'fast-slow-pointers',
    title: 'Fast & Slow Pointers (Floyd’s Cycle)',
    category: 'Linked Lists & Sequences',
    summary: 'Use two pointers moving at different speeds to detect cycles or find middle elements.',
    whenToUse: [
      'Detecting cycles in Linked Lists or Arrays',
      'Finding the middle node of a Linked List in one pass',
      'Examples: Linked List Cycle'
    ],
    codeTemplate: `bool hasCycle(ListNode *head) {\n    ListNode *slow = head, *fast = head;\n    while (fast && fast->next) {\n        slow = slow->next;\n        fast = fast->next->next;\n        if (slow == fast) return true;\n    }\n    return false;\n}`
  },
  {
    id: 'monotonic-stack',
    title: 'Monotonic Stack Pattern',
    category: 'Stack & Arrays',
    summary: 'Maintain elements in strictly increasing or decreasing order to find next greater or smaller elements in O(N).',
    whenToUse: [
      'Finding next greater / previous smaller element',
      'Histogram / trapping rainwater calculations',
      'Examples: Next Greater Element, Daily Temperatures'
    ],
    codeTemplate: `vector<int> nextGreaterElement(vector<int>& nums) {\n    vector<int> result(nums.size(), -1);\n    stack<int> s; // stores indices\n    for (int i = 0; i < nums.size(); i++) {\n        while (!s.empty() && nums[i] > nums[s.top()]) {\n            result[s.top()] = nums[i];\n            s.pop();\n        }\n        s.push(i);\n    }\n    return result;\n}`
  },
  {
    id: 'binary-search',
    title: 'Modified Binary Search',
    category: 'Searching',
    summary: 'Efficiently search in sorted arrays or search spaces by repeatedly halving the search domain.',
    whenToUse: [
      'Search space is sorted or monotonic',
      'Finding boundary/first/last occurrence',
      'Examples: Search in Rotated Sorted Array'
    ],
    codeTemplate: `int binarySearch(vector<int>& arr, int target) {\n    int low = 0, high = arr.size() - 1;\n    while (low <= high) {\n        int mid = low + (high - low) / 2;\n        if (arr[mid] == target) return mid;\n        else if (arr[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    return -1;\n}`
  },
  {
    id: 'top-k-elements',
    title: 'Top K Elements (Min/Max Heap)',
    category: 'Heaps & Priorities',
    summary: 'Use a heap of size K to maintain top/frequent elements without sorting the entire dataset.',
    whenToUse: [
      'Finding K largest or K smallest elements',
      'Top K Frequent elements',
      'Examples: Kth Largest Element in an Array'
    ],
    codeTemplate: `#include <queue>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nvector<int> topKFrequent(vector<int>& nums, int k) {\n    unordered_map<int, int> count;\n    for (int n : nums) count[n]++;\n    \n    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> min_heap;\n    for (auto& p : count) {\n        min_heap.push({p.second, p.first});\n        if (min_heap.size() > k) min_heap.pop();\n    }\n    \n    vector<int> res;\n    while (!min_heap.empty()) {\n        res.push_back(min_heap.top().second);\n        min_heap.pop();\n    }\n    return res;\n}`
  }
];

export default function NotesPage() {
  const [activeTab, setActiveTab] = useState<'cheat-sheets' | 'personal-notes'>('cheat-sheets');
  const [selectedSheet, setSelectedSheet] = useState<CheatSheet>(BUILT_IN_CHEAT_SHEETS[0]);
  const [personalNotes, setPersonalNotes] = useState<string>(() => {
    return localStorage.getItem('algoassist_personal_notes') || 
`# My DSA Prep Notes & Reminders

## 📌 Edge Cases Checklist
- Empty array / single element array
- Array with all negative numbers
- Duplicates present in search space
- Integer overflow bounds

## 💡 Quick Tips
- Always ask if the input array is sorted before choosing Two Pointers vs Hash Table.
- For tree problems, check if DFS (recursion) or BFS (queue level-order) is cleaner.
`;
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

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
    fetchUser();
  }, [fetchUser]);

  const handleSaveNotes = () => {
    localStorage.setItem('algoassist_personal_notes', personalNotes);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
          
          {/* Header & Tabs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-light-border dark:border-dark-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center">
                <StickyNote className="w-4 h-4 text-brand" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-light-text dark:text-dark-text tracking-tight">
                  Pattern Cheat Sheets & Notes
                </h1>
                <p className="text-xs text-light-muted dark:text-dark-muted">
                  Quick algorithmic references and your personal DSA notes repository.
                </p>
              </div>
            </div>

            {/* Tab Buttons */}
            <div className="flex items-center gap-1 bg-light-surface dark:bg-dark-surface p-1 rounded-lg border border-light-border dark:border-dark-border">
              <button
                onClick={() => setActiveTab('cheat-sheets')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'cheat-sheets'
                    ? 'bg-brand text-white'
                    : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> Pattern Cheat Sheets
              </button>
              <button
                onClick={() => setActiveTab('personal-notes')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'personal-notes'
                    ? 'bg-brand text-white'
                    : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" /> Personal Notes
              </button>
            </div>
          </div>

          {/* TAB 1: CHEAT SHEETS */}
          {activeTab === 'cheat-sheets' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Pattern List */}
              <div className="p-4 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border space-y-2">
                <p className="text-xs font-medium text-light-muted dark:text-dark-muted uppercase tracking-wider px-2 mb-2">
                  Select Pattern
                </p>
                {BUILT_IN_CHEAT_SHEETS.map((sheet) => (
                  <button
                    key={sheet.id}
                    onClick={() => setSelectedSheet(sheet)}
                    className={`w-full p-3 rounded-md border text-left transition-all ${
                      selectedSheet.id === sheet.id
                        ? 'border-brand bg-brand/10 text-light-text dark:text-dark-text'
                        : 'border-transparent hover:bg-light-bg dark:hover:bg-dark-bg text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
                    }`}
                  >
                    <p className="text-xs font-semibold">{sheet.title}</p>
                    <p className="text-[10px] opacity-75 mt-0.5">{sheet.category}</p>
                  </button>
                ))}
              </div>

              {/* Pattern Details Panel */}
              <div className="lg:col-span-2 p-6 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border space-y-6">
                
                {/* Title & Category */}
                <div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-brand/10 text-brand border border-brand/20">
                    {selectedSheet.category}
                  </span>
                  <h2 className="text-lg font-bold text-light-text dark:text-dark-text mt-2">
                    {selectedSheet.title}
                  </h2>
                  <p className="text-xs text-light-muted dark:text-dark-muted mt-1 leading-relaxed">
                    {selectedSheet.summary}
                  </p>
                </div>

                {/* When to use */}
                <div className="p-4 rounded-md bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border">
                  <h3 className="text-xs font-semibold text-light-text dark:text-dark-text mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand" /> When to Use This Pattern:
                  </h3>
                  <ul className="space-y-1.5 text-xs text-light-muted dark:text-dark-muted list-disc list-inside">
                    {selectedSheet.whenToUse.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Code Template */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-light-text dark:text-dark-text flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-brand" /> C++ Code Template
                    </span>
                    <button
                      onClick={() => handleCopyCode(selectedSheet.codeTemplate, selectedSheet.id)}
                      className="px-2.5 py-1 rounded text-xs text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-bg dark:hover:bg-dark-bg transition-colors flex items-center gap-1 border border-light-border dark:border-dark-border"
                    >
                      {copiedId === selectedSheet.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="p-4 rounded-md bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border font-mono text-xs text-light-text dark:text-dark-text overflow-x-auto leading-relaxed">
                    {selectedSheet.codeTemplate}
                  </pre>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: PERSONAL NOTES */}
          {activeTab === 'personal-notes' && (
            <div className="p-6 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-light-text dark:text-dark-text">Personal Notebook</h2>
                  <p className="text-xs text-light-muted dark:text-dark-muted">Save your custom notes, formulas, and reminders. Automatically persisted in your browser.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => !isPremium && setShowPremiumModal(true)}
                    className="px-4 h-9 rounded-md bg-gradient-to-r from-brand to-purple-600 text-white font-medium text-xs flex items-center gap-1.5 hover:from-brand-hover hover:to-purple-700 transition-colors shadow-subtle"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    AI Analyze
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    className="px-4 h-9 rounded-md bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text font-medium text-xs flex items-center gap-1.5 hover:bg-light-bg dark:hover:bg-dark-bg transition-colors shadow-subtle"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {saved ? 'Saved!' : 'Save'}
                  </button>
                </div>
              </div>

              <textarea
                value={personalNotes}
                onChange={(e) => setPersonalNotes(e.target.value)}
                rows={18}
                placeholder="Write your markdown notes here..."
                className="w-full p-4 text-xs font-mono rounded-md border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:border-brand resize-y leading-relaxed"
              />
            </div>
          )}

        </main>
      </div>

      <PremiumModal 
        isOpen={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)}
        feature="AI Note Analysis"
      />
    </div>
  );
}
