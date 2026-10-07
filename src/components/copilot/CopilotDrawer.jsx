import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { processCopilotMessage } from '../../services/aiAgentService';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Zap,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronRight,
  TrendingUp,
  UserPlus,
  Mail,
  Moon
} from 'lucide-react';

export default function CopilotDrawer() {
  const context = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'msg-welcome',
      sender: 'agent',
      text: [
        "Hi! I am your Nexus AI Copilot. I can answer all questions about this CRM and execute actions for you in real-time:",
        "1. Answer any question about CRM concepts (churn, retention, LTV, CAC, sales pipeline)",
        "2. Look up any customer, company, contact details, or account status",
        "3. Update customer details (change status, phone, email, company) and save them live",
        "4. Add new customer records or delete existing profiles",
        "5. Explain dashboard metrics, acquisition charts, and business health ratios",
        "6. Draft personalized outreach and re-engagement emails",
        "",
        "What question or task can I help you with?"
      ].join('\n'),
      toolCalled: null,
      badge: null,
      timestamp: new Date()
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isThinking]);

  const handleSend = async (textToSend) => {
    const query = typeof textToSend === 'string' ? textToSend : input;
    if (!query.trim() || isThinking) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      const response = await processCopilotMessage(query, context);
      const agentMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'agent',
        text: response.text,
        toolCalled: response.toolCalled,
        badge: response.badge,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, agentMessage]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          text: "I encountered an error executing that request. Please try again.",
          toolCalled: null,
          badge: null,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const quickPrompts = [
    { label: "❓ What is CRM?", prompt: "What is CRM and why do we use it?" },
    { label: "✏️ Mark Eleanor Inactive", prompt: "Change Eleanor Vance status to Inactive" },
    { label: "📊 Portfolio stats", prompt: "Summarize portfolio health and customer metrics" },
    { label: "👤 Who is Sophia Chen?", prompt: "Who is Sophia Chen?" },
    { label: "⚠️ List inactive clients", prompt: "List inactive customers" },
    { label: "➕ Add Sarah at Netflix", prompt: "Add customer Sarah Jenkins at Netflix, active, sarah@netflix.com, +1 555-0199" },
    { label: "✉️ Draft email for David", prompt: "Draft a re-engagement email for David Sterling" }
  ];

  return (
    <>
      {/* Floating Action Trigger Button */}
      {!isOpen && (
        <button
          id="open-copilot-btn"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-500 hover:to-violet-600 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-indigo-600/35 hover:shadow-indigo-600/50 hover:scale-105 active:scale-95 transition-all group"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 animate-spin-slow" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-indigo-900 animate-pulse" />
          </div>
          <span>Nexus AI Copilot</span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white uppercase tracking-wider">
            Agent
          </span>
        </button>
      )}

      {/* Floating Copilot Drawer Panel */}
      {isOpen && (
        <div
          id="copilot-drawer-panel"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[420px] h-[580px] max-h-[88vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl shadow-indigo-950/20 dark:shadow-black/60 flex flex-col overflow-hidden backdrop-blur-xl animate-scale-up"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight">Nexus AI Copilot</h3>
                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Agentic
                  </span>
                </div>
                <p className="text-[11px] text-indigo-200/80">Autonomous CRM Actions &amp; Tool Calling</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setMessages([messages[0]])}
                title="Clear Chat"
                className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                id="close-copilot-btn"
                onClick={() => setIsOpen(false)}
                title="Close Copilot"
                className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Starter Chips */}
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-[11px]">
            {quickPrompts.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip.prompt)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Message History */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs sm:text-sm">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[82%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-3 rounded-2xl leading-relaxed ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60'
                      }`}
                    >
                      {/* Point-by-point clean formatting (zero asterisks) */}
                      <div className="font-sans text-xs sm:text-xs space-y-1">
                        {msg.text.split('\n').map((rawLine, idx) => {
                          const line = rawLine.replace(/\*/g, '').trim();
                          if (!line) return <div key={idx} className="h-1" />;

                          // Numbered point: e.g. "1. Name: Sarah"
                          const isNumberedPoint = /^\d+\.\s/.test(line);
                          if (isNumberedPoint) {
                            const [pointNum, ...rest] = line.split('. ');
                            const pointContent = rest.join('. ');
                            return (
                              <div key={idx} className="flex items-start gap-2 py-0.5">
                                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-500/15 dark:bg-indigo-400/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold shrink-0 mt-0.5">
                                  {pointNum}
                                </span>
                                <span className="flex-1 text-slate-800 dark:text-slate-200 leading-snug">
                                  {pointContent}
                                </span>
                              </div>
                            );
                          }

                          // Section title or standalone text
                          const isHeader = line.endsWith(':');
                          return (
                            <p
                              key={idx}
                              className={isHeader ? "font-bold text-slate-900 dark:text-white pt-1 text-xs" : "text-slate-800 dark:text-slate-200"}
                            >
                              {line}
                            </p>
                          );
                        })}
                      </div>
                    </div>

                    {/* Customer Profile Card if profile was fetched */}
                    {msg.data && msg.data.avatar && (
                      <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm animate-fade-in">
                        <img
                          src={msg.data.avatar}
                          alt={msg.data.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {msg.data.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {msg.data.company}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`inline-block w-1.5 h-1.5 rounded-full ${msg.data.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">{msg.data.status} Account</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tool Execution Badge */}
                    {msg.badge && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold">
                        <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                        <span>Action: {msg.badge}</span>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Thinking / Tool Calling State Indicator */}
            {isThinking && (
              <div className="flex gap-2.5 items-start">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">Reasoning &amp; executing tools...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box Footer */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative flex items-center"
            >
              <input
                id="copilot-input-box"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask or instruct (e.g. 'Add client Sarah at Spotify')..."
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs sm:text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <button
                type="submit"
                id="copilot-send-btn"
                disabled={!input.trim() || isThinking}
                className="absolute right-1.5 p-1.5 rounded-xl bg-indigo-600 text-white disabled:opacity-40 hover:bg-indigo-500 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <p className="mt-1.5 text-center text-[10px] text-slate-400">
              Nexus AI Agent executes actions directly via React App State
            </p>
          </div>
        </div>
      )}
    </>
  );
}
