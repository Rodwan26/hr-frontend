'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { helpdeskService, Ticket } from '@/services/helpdeskService';

export default function HelpDeskPage() {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    fetchHistoryWithRetry();
  }, []);

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Robust fetch with exponential backoff
  const fetchHistoryWithRetry = async (retries = 3, delay = 1000) => {
    try {
      const data = await helpdeskService.getHistory();
      setHistory(data);
      setFetching(false);
    } catch (err) {
      if (retries > 0) {
        // console.log(`Retrying... attempts left: ${retries}`);
        await wait(delay);
        return fetchHistoryWithRetry(retries - 1, delay * 2);
      }
      console.error('Failed to fetch history after multiple attempts', err);
      // Don't show error on initial fetch failure, just show empty state or stale data
      setFetching(false);
    }
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const currentQuestion = question;
    const tempId = Date.now();

    // 1. Optimistic Update
    const tempTicket: Ticket = {
      id: tempId,
      question: currentQuestion,
      ai_response: "Thinking...",
      created_at: new Date().toISOString(),
      status: 'pending' // You might need to add 'pending' to Ticket status type or just handle it purely UI side
    };

    setHistory(prev => [tempTicket, ...prev]);
    setQuestion('');
    setLoading(true);
    setError(null);

    // 2. API Call with Timeout Handling
    try {
      // The API has a 15s timeout from api.ts
      const result = await helpdeskService.ask(currentQuestion);

      // Update UI with the actual answer right away if the service returns it
      // if result.content is available (TrustedAIResponse format)
      if (result && result.content) {
        setHistory(prev => prev.map(t => t.id === tempId ? { ...t, ai_response: result.content, status: 'resolved' } : t));
      } else {
        // Fallback to re-fetching
        await fetchHistoryWithRetry(2, 500);
      }

    } catch (err: any) {
      // Revert optimistic update on failure
      setHistory(prev => prev.filter(t => t.id !== tempId));

      const errorMessage = err.response?.data?.errors?.[0]?.msg ||
        (err.code === 'ECONNABORTED' ? 'AI took too long to respond. It helps to ask simpler questions.' : 'Failed to get AI response.');

      setError(errorMessage);
      setQuestion(currentQuestion); // Restore their text so they don't lose it
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">AI Help Desk</h1>
        <p className="text-gray-500 font-medium italic">Instant answers to all your company policy and HR questions.</p>
      </div>

      <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 border-none shadow-2xl shadow-blue-500/20 text-white overflow-visible relative">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />

        <form onSubmit={handleAsk} className="relative space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-bold opacity-90">How can I help you today?</h3>
            <div className="relative group">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question here (e.g. What is the remote work policy?)..."
                className="w-full h-32 px-5 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-blue-100/50 focus:outline-none focus:ring-4 focus:ring-white/10 focus:bg-white/20 transition-all resize-none shadow-inner"
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleAsk(e);
                  }
                }}
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-3">
                <span className="text-[10px] uppercase font-bold tracking-widest opacity-50 hidden sm:inline">Ctrl + Enter to send</span>
                <Button
                  type="submit"
                  variant="primary"
                  className="bg-white text-blue-700 hover:bg-blue-50 h-10 px-6 rounded-xl font-bold shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  loading={loading}
                  disabled={!question.trim() || loading}
                >
                  {loading ? 'Thinking...' : 'Ask AI'}
                </Button>
              </div>
            </div>
          </div>
          {error && <Alert variant="error" className="bg-red-500/20 border-red-400/30 text-white font-medium">{error}</Alert>}
        </form>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Recent Conversations
            {!fetching && history.length > 0 && <Badge variant="info" className="ml-1 bg-blue-50 text-blue-600">{history.length}</Badge>}
          </h2>
          <Button variant="ghost" size="sm" onClick={() => { setFetching(true); fetchHistoryWithRetry(); }} disabled={fetching}>
            <svg className={`w-4 h-4 mr-2 ${fetching ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
        </div>

        {fetching && history.length === 0 ? (
          <div className="space-y-4">
            {/* Skeleton Loader */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm animate-pulse">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="space-y-3 w-full">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/4"></div>
                  </div>
                  <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-lg bg-gray-200 flex-shrink-0"></div>
                  <div className="space-y-2 w-full">
                    <div className="h-3 bg-gray-100 rounded w-full"></div>
                    <div className="h-3 bg-gray-100 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 select-none">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 grayscale opacity-50">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No conversations yet.</p>
            <p className="text-gray-400 text-sm">Start by asking a question above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {history.map((ticket) => (
              <Card key={ticket.id} className={`hover:shadow-md transition-shadow group cursor-default ${ticket.ai_response === 'Thinking...' ? 'opacity-70 border-blue-200 bg-blue-50/10' : ''}`}>
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{ticket.question}</p>
                      <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {ticket.created_at ? new Date(ticket.created_at).toLocaleString() : 'Just now'}
                      </p>
                    </div>
                    <Badge variant={ticket.status === 'pending' || ticket.ai_response === 'Thinking...' ? 'warning' : 'success'}>
                      {ticket.ai_response === 'Thinking...' ? 'Processing' : 'Resolved'}
                    </Badge>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 group-hover:bg-blue-50/30 group-hover:border-blue-100/50 transition-colors">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-lg bg-indigo-600 flex-shrink-0 flex items-center justify-center text-[10px] font-black text-white shadow-sm ring-4 ring-indigo-50 leading-none pb-0.5">AI</div>
                      <p className={`text-sm text-gray-700 leading-relaxed font-medium ${ticket.ai_response === 'Thinking...' ? 'animate-pulse text-indigo-500' : ''}`}>
                        {ticket.ai_response}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
