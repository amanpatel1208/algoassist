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

export interface User {
  id: string;
  name: string;
  email: string;
  daily_hint_count: number;
  last_reset_date: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  problem_name: string;
  messages: ChatMessage[];
  finished: boolean;
  created_at: string;
  problem_source?: string;
  problem_difficulty?: string;
  problem_topics?: string[];
  problem_description?: string;
}
