import { useState, useRef, useEffect } from 'react';
import {
  PaperAirplaneIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import apiClient from '../api/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatWindowProps {
  onSessionFinished: () => void;
  hintsRemaining: number;
  onHintUsed: () => void;
}

export default function ChatWindow({ onSessionFinished, hintsRemaining, onHintUsed }: ChatWindowProps) {
  const [problemName, setProblemName] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startSession = async () => {
    if (!problemName.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.post('/chat/start', { problem_name: problemName.trim() });
      setSessionId(res.data.data.session_id);
      setMessages([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to start session.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !sessionId || loading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.post('/chat/message', {
        session_id: sessionId,
        message: userMessage,
      });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.data.data.hint },
      ]);
      onHintUsed();
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError('Daily hint limit reached (20/20). Come back tomorrow!');
      } else {
        setError(err.response?.data?.detail || 'Failed to get hint.');
      }
    } finally {
      setLoading(false);
    }
  };

  const finishSession = async () => {
    if (!sessionId || finishing) return;
    setFinishing(true);
    setError('');
    try {
      await apiClient.post('/chat/finish', { session_id: sessionId });
      setSessionId(null);
      setMessages([]);
      setProblemName('');
      onSessionFinished();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to finish session.');
    } finally {
      setFinishing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetSession = () => {
    setSessionId(null);
    setMessages([]);
    setProblemName('');
    setError('');
  };

  return (
    <div className="border border-light-border dark:border-dark-border rounded-md bg-light-surface dark:bg-dark-surface flex flex-col" style={{ height: '480px' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-light-border dark:border-dark-border shrink-0">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-light-text dark:text-dark-text">
            {sessionId ? `Session: ${problemName}` : 'Practice Session'}
          </h3>
          {sessionId && (
            <span className="text-xs text-light-muted dark:text-dark-muted">
              {messages.filter((m) => m.role === 'assistant').length} hint(s) used
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-light-muted dark:text-dark-muted tabular-nums">
            {hintsRemaining}/20 remaining
          </span>
          {sessionId && (
            <>
              <button
                onClick={resetSession}
                className="px-2.5 py-1 text-xs font-medium rounded-md border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:border-light-text/20 dark:hover:border-dark-text/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={finishSession}
                disabled={finishing || messages.length === 0}
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                {finishing ? (
                  <>
                    <ArrowPathIcon className="w-3 h-3 animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    Finish
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Messages area */}
      {!sessionId ? (
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-md space-y-3">
            <label className="block text-sm font-medium text-light-text dark:text-dark-text">
              What problem are you working on?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={problemName}
                onChange={(e) => setProblemName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && startSession()}
                placeholder="e.g. Two Sum, Merge Intervals…"
                className="flex-1 h-9 px-3 text-sm rounded-md border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text placeholder:text-light-muted/60 dark:placeholder:text-dark-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors"
              />
              <button
                onClick={startSession}
                disabled={loading || !problemName.trim()}
                className="px-4 h-9 text-sm font-medium rounded-md bg-brand text-white hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Starting…' : 'Start'}
              </button>
            </div>
            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}
            <p className="text-xs text-light-muted dark:text-dark-muted">
              You'll get nudge-style hints — never the full solution.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-light-muted dark:text-dark-muted">
                  Describe where you're stuck and I'll nudge you in the right direction.
                </p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-3.5 py-2.5 rounded-md text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand text-white'
                      : 'bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-text dark:text-dark-text'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-3.5 py-2.5 rounded-md bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border">
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-light-muted dark:bg-dark-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-light-muted dark:bg-dark-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-light-muted dark:bg-dark-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-md text-xs bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
                  {error}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-light-border dark:border-dark-border shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading || finishing}
                placeholder="Ask for a hint…"
                className="flex-1 h-9 px-3 text-sm rounded-md border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text placeholder:text-light-muted/60 dark:placeholder:text-dark-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand disabled:opacity-50 transition-colors"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim() || finishing}
                className="h-9 w-9 flex items-center justify-center rounded-md bg-brand text-white hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                aria-label="Send message"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
