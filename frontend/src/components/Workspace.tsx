import { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import apiClient from '../api/client';
import { Play, Circle, CheckCircle2, History, PanelRightClose, PanelRightOpen } from 'lucide-react';
import FormattedMessage from './FormattedMessage';
import PremiumModal from './PremiumModal';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SessionInfo {
  id: string;
  problem_name: string;
  created_at: string;
  finished: boolean;
  messages: Message[];
}

interface WorkspaceProps {
  onSessionFinished: () => void;
  onHintUsed: () => void;
}

export default function Workspace({ onSessionFinished, onHintUsed }: WorkspaceProps) {
  const [problemName, setProblemName] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState('');
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [previousSessions, setPreviousSessions] = useState<SessionInfo[]>([]);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [problemSource, setProblemSource] = useState<string | null>(null);
  const [problemDifficulty, setProblemDifficulty] = useState<string | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const isPremium = useSelector((state: any) => state.auth.isPremium);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchPreviousSessions = useCallback(async () => {
    try {
      const res = await apiClient.get('/chat/sessions');
      if (res.data.success) {
        setPreviousSessions(res.data.data);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchPreviousSessions();
  }, [fetchPreviousSessions]);

  const startSession = async () => {
    if (!problemName.trim()) return;
    setLoading(true);
    setError('');
    setIsReadOnly(false);
    try {
      const res = await apiClient.post('/chat/start', { problem_name: problemName.trim() });
      const newSession = res.data.data;
      setSessionId(newSession.id);
      setProblemName(newSession.problem_name);
      setProblemSource(newSession.problem_source || null);
      setProblemDifficulty(newSession.problem_difficulty || null);
      setMessages([]);
      setSessionStartTime(new Date());
      setTimeout(() => inputRef.current?.focus(), 100);
      fetchPreviousSessions();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to start session.');
    } finally {
      setLoading(false);
    }
  };

  const loadSession = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get(`/chat/sessions/${id}`);
      if (res.data.success) {
        const session = res.data.data;
        setSessionId(session.id);
        setProblemName(session.problem_name);
        setProblemSource(session.problem_source || null);
        setProblemDifficulty(session.problem_difficulty || null);
        setMessages(session.messages || []);
        setIsReadOnly(session.finished);
        setSessionStartTime(session.created_at ? new Date(session.created_at) : null);
      }
    } catch (err: any) {
       setError(err.response?.data?.detail || 'Failed to load session.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !sessionId || loading || isReadOnly) return;
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
        if (!isPremium) {
          setShowPremiumModal(true);
        } else {
          setError('Daily hint limit reached. (Mock: backend still enforcing limit)');
        }
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
      setSessionStartTime(null);
      setIsReadOnly(false);
      onSessionFinished();
      fetchPreviousSessions();
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

  const hintCount = messages.filter((m) => m.role === 'assistant').length;
  
  // Render Hint Dots (● ● ○ Tier 2)
  const renderHintProgress = () => {
    const totalDots = 3;
    const filledDots = Math.min(hintCount, totalDots);
    const emptyDots = totalDots - filledDots;
    
    return (
      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-light-border dark:border-dark-border">
        <div className="flex gap-1">
          {Array.from({ length: filledDots }).map((_, i) => (
            <div key={`filled-${i}`} className="w-2 h-2 rounded-full bg-light-text dark:bg-dark-text"></div>
          ))}
          {Array.from({ length: emptyDots }).map((_, i) => (
            <div key={`empty-${i}`} className="w-2 h-2 rounded-full border border-light-text dark:border-dark-text"></div>
          ))}
        </div>
        <span className="text-xs text-light-muted dark:text-dark-muted font-medium ml-1">
          Tier {Math.min(hintCount + 1, 3)}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-md overflow-hidden flex h-[500px] min-w-0">
      
      {/* Left Panel: Recent Sessions / Start Session */}
      <div className="w-56 shrink-0 border-r border-light-border dark:border-dark-border flex flex-col bg-light-bg/50 dark:bg-dark-bg/50">
        <div className="p-4 border-b border-light-border dark:border-dark-border">
          <h3 className="text-sm font-semibold text-light-text dark:text-dark-text mb-4">Workspace</h3>
          {!sessionId || isReadOnly ? (
            <div className="space-y-3">
              <input
                type="text"
                value={problemName}
                onChange={(e) => setProblemName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && startSession()}
                placeholder="Name, LC number, or URL..."
                className="w-full h-8 px-2.5 text-xs rounded-md border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text focus:outline-none focus:border-brand"
              />
              <button
                onClick={startSession}
                disabled={loading || !problemName.trim()}
                className="w-full h-8 flex items-center justify-center gap-1.5 text-xs font-medium rounded-md bg-brand text-white hover:bg-brand-hover disabled:opacity-50 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                {loading && !sessionId ? 'Starting...' : 'Start New Session'}
              </button>
            </div>
          ) : (
            <div className="p-2 bg-brand/10 border border-brand/20 rounded-md">
              <p className="text-xs font-medium text-brand">Active Session</p>
              <p className="text-sm text-light-text dark:text-dark-text truncate mt-0.5">{problemName}</p>
            </div>
          )}
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          {previousSessions.length > 0 ? (
            <>
              <p className="text-xs font-medium text-light-muted dark:text-dark-muted mb-3 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" /> Previous Sessions
              </p>
              <div className="space-y-2">
                {previousSessions.map((session) => (
                  <div 
                    key={session.id} 
                    onClick={() => loadSession(session.id)}
                    className={`p-2 rounded border transition-all cursor-pointer ${sessionId === session.id ? 'bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border' : 'border-transparent hover:bg-light-surface dark:hover:bg-dark-surface hover:border-light-border dark:hover:border-dark-border'}`}
                  >
                    <p className="text-xs font-medium text-light-text dark:text-dark-text truncate">{session.problem_name}</p>
                    <p className="text-[10px] text-light-muted dark:text-dark-muted mt-0.5">
                      {new Date(session.created_at).toLocaleDateString()} • {session.finished ? 'Finished' : 'Active'}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-xs font-medium text-light-muted dark:text-dark-muted mb-3 uppercase tracking-wider">How It Works</p>
              <div className="space-y-3 text-[11px] text-light-muted dark:text-dark-muted">
                <div className="flex gap-2">
                  <span className="text-brand font-bold">1.</span>
                  <span>Enter a problem name and start a session</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-brand font-bold">2.</span>
                  <span>Describe where you're stuck</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-brand font-bold">3.</span>
                  <span>Get tiered hints (never the full solution)</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-brand font-bold">4.</span>
                  <span>Finish session to auto-track progress</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Center Panel: Chat */}
      <div className="flex-1 flex flex-col relative">
        {/* Center Header */}
        <div className="h-12 border-b border-light-border dark:border-dark-border px-4 flex items-center justify-between shrink-0 bg-light-surface/50 dark:bg-dark-surface/50">
          <h3 className="text-sm font-medium text-light-text dark:text-dark-text">
            {sessionId ? problemName || 'Active Session' : 'Workspace'}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:bg-light-bg dark:hover:bg-dark-bg transition-colors"
            >
              {isDetailsOpen ? <PanelRightOpen className="w-3.5 h-3.5" /> : <PanelRightClose className="w-3.5 h-3.5" />}
              Details
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!sessionId ? (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <p className="text-sm text-light-muted dark:text-dark-muted">Select or start a session on the left to begin.</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-light-muted dark:text-dark-muted">Describe where you're stuck.</p>
            </div>
          ) : null}

          {messages.map((msg, idx) => (
            <div key={idx} className="flex flex-col">
              {msg.role === 'user' ? (
                <div className="self-end bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-text dark:text-dark-text px-4 py-3 rounded-md text-sm max-w-[80%] shadow-subtle">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-medium text-light-text dark:text-dark-text">You</span>
                  </div>
                  <FormattedMessage content={msg.content} role="user" />
                </div>
              ) : (
                <div className="self-start bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text px-4 py-3 rounded-md text-sm max-w-[85%] shadow-subtle">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-brand rounded-sm flex items-center justify-center">
                        <span className="text-white text-[9px] font-bold">A</span>
                      </div>
                      <span className="text-xs font-medium text-light-text dark:text-dark-text">AlgoAssist</span>
                    </div>
                  </div>
                  <FormattedMessage content={msg.content} role="assistant" />
                  
                  {/* Only show hint progress on the last assistant message */}
                  {idx === messages.length - 1 && renderHintProgress()}
                </div>
              )}
            </div>
          ))}
          
          {loading && (
            <div className="self-start bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border px-4 py-3 rounded-md text-sm shadow-subtle">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-brand rounded-sm flex items-center justify-center">
                  <span className="text-white text-[9px] font-bold">A</span>
                </div>
                <div className="flex gap-1 items-center h-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-light-muted dark:bg-dark-muted animate-pulse"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-light-muted dark:bg-dark-muted animate-pulse delay-75"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-light-muted dark:bg-dark-muted animate-pulse delay-150"></span>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-md">
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Minimal Input Box */}
        {sessionId && !isReadOnly && (
          <div className="p-4 bg-light-surface dark:bg-dark-surface border-t border-light-border dark:border-dark-border">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading || finishing}
              placeholder="Ask for a hint..."
              className="w-full h-10 px-4 text-sm rounded-md border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text placeholder:text-light-muted/60 dark:placeholder:text-dark-muted/60 focus:outline-none focus:border-brand transition-colors"
            />
          </div>
        )}
        {sessionId && isReadOnly && (
           <div className="p-4 bg-light-surface dark:bg-dark-surface border-t border-light-border dark:border-dark-border text-center">
             <p className="text-xs text-light-muted dark:text-dark-muted">This session is finished and read-only.</p>
           </div>
        )}
        
        {/* Right Panel: Session Details (Overlay) */}
        {isDetailsOpen && (
          <div className="absolute top-12 right-0 bottom-0 w-64 bg-light-surface/95 dark:bg-dark-surface/95 backdrop-blur-md border-l border-light-border dark:border-dark-border shadow-2xl flex flex-col z-20 animate-in slide-in-from-right-4 duration-200">
            <div className="p-4 border-b border-light-border dark:border-dark-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-light-text dark:text-dark-text">Session Details</h3>
            </div>
            
            {sessionId ? (
              <div className="p-4 flex-1 flex flex-col">
                <div className="space-y-4 flex-1">
                  <div>
                    <p className="text-xs text-light-muted dark:text-dark-muted mb-1">Start Time</p>
                    <p className="text-sm font-medium text-light-text dark:text-dark-text">
                      {sessionStartTime ? sessionStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </p>
                  </div>
                  {problemDifficulty && (
                    <div>
                      <p className="text-xs text-light-muted dark:text-dark-muted mb-1">Difficulty</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${
                        problemDifficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                        problemDifficulty === 'Medium' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' :
                        'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                      }`}>
                        {problemDifficulty}
                      </span>
                    </div>
                  )}
                  {problemSource && (
                    <div>
                      <p className="text-xs text-light-muted dark:text-dark-muted mb-1">Source</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text border-light-border dark:border-dark-border">
                        {problemSource}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-light-muted dark:text-dark-muted mb-1">Messages</p>
                    <p className="text-sm font-medium text-light-text dark:text-dark-text">{messages.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-light-muted dark:text-dark-muted mb-1">Hints Used</p>
                    <p className="text-sm font-medium text-light-text dark:text-dark-text">{hintCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-light-muted dark:text-dark-muted mb-1">Status</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${isReadOnly ? 'bg-light-surface dark:bg-dark-surface text-light-muted dark:text-dark-muted border-light-border dark:border-dark-border' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'}`}>
                      {isReadOnly ? 'Finished' : 'Active'}
                    </span>
                  </div>
                </div>

                {!isReadOnly && (
                  <button
                    onClick={finishSession}
                    disabled={finishing || messages.length === 0}
                    className="w-full mt-4 h-9 flex items-center justify-center gap-1.5 text-sm font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    {finishing ? (
                      <>
                        <Circle className="w-4 h-4 animate-spin" />
                        Analyzing Session...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Finish Session
                      </>
                    )}
                  </button>
                )}
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-xs text-light-muted dark:text-dark-muted">No active session.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <PremiumModal 
        isOpen={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)} 
        feature="Unlimited AI Hints"
      />
    </div>
  );
}
