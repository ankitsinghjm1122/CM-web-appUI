import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { processCopilotMessage } from '../../services/aiAgentService';
import {
  sendCopilotChatApi,
  clearCopilotHistoryApi,
  saveCopilotMessageApi
} from '../../services/apiClient';
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
import CopilotCircularLogo from './CopilotCircularLogo';

export default function CopilotDrawer() {
  const context = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'msg-welcome',
      sender: 'agent',
      text: "Hello! How can I help you with your CRM today?",
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
      // 1. Process query with full conversational and CRM agent engine
      const response = await processCopilotMessage(query.trim(), context);

      // 2. Persist message exchange to SQLite backend if connected
      if (context.isBackendConnected) {
        saveCopilotMessageApi({ sender: 'user', text: query.trim() });
        if (response && response.text) {
          saveCopilotMessageApi({
            sender: 'agent',
            text: response.text,
            toolCalled: response.toolCalled,
            badge: response.badge
          });
        }
      }

      const agentMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'agent',
        text: response.text,
        toolCalled: response.toolCalled,
        badge: response.badge,
        data: response.data,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, agentMessage]);
    } catch (err) {
      console.error('[Copilot] Error processing message:', err);
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

  const handleClearChat = async () => {
    if (context.isBackendConnected) {
      try {
        await clearCopilotHistoryApi();
      } catch (err) {
        console.warn('Failed to clear backend chat history', err);
      }
    }
    setMessages([messages[0]]);
  };

  return (
    <>
      {/* Floating Action Trigger Button (Round) */}
      {!isOpen && (
        <button
          id="open-copilot-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Open Nexus AI Copilot"
          title="Open Nexus AI Copilot"
          className="fixed bottom-5 right-5 z-40 p-1 rounded-full bg-slate-900/90 dark:bg-slate-900/95 border border-indigo-500/40 shadow-2xl shadow-indigo-950/60 hover:shadow-indigo-500/50 hover:scale-110 active:scale-95 transition-all group cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
        >
          <CopilotCircularLogo size={44} showStatus={true} />
        </button>
      )}

      {/* Floating Copilot Drawer Panel */}
      {isOpen && (
        <div
          id="copilot-drawer-panel"
          className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-50 w-[88vw] sm:w-[310px] h-[410px] max-h-[68vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl shadow-indigo-950/20 dark:shadow-black/60 flex flex-col overflow-hidden backdrop-blur-xl animate-scale-up"
        >
          {/* Header */}
          <div className="px-3 py-2 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <CopilotCircularLogo size={24} showStatus={false} />
              <div>
                <h3 className="text-xs font-semibold tracking-tight">Nexus AI Copilot</h3>
              </div>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                onClick={handleClearChat}
                title="Clear Chat History"
                className="p-1 rounded text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                id="close-copilot-btn"
                onClick={() => setIsOpen(false)}
                title="Close Copilot"
                className="p-1 rounded text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Message History */}
          <div className="flex-1 p-2.5 overflow-y-auto space-y-2 text-[11px] sm:text-xs">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3 h-3" />
                    </div>
                  )}

                  <div className={`max-w-[85%] space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-2 rounded-xl leading-relaxed ${
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
                      <button
                        type="button"
                        onClick={() => context.openCustomerProfile(msg.data)}
                        className="w-full text-left flex items-center gap-3 p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group/card animate-fade-in"
                        title="Click to open full profile"
                      >
                        <img
                          src={msg.data.avatar}
                          alt={msg.data.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30 group-hover/card:scale-105 transition-transform shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-slate-900 dark:text-white truncate group-hover/card:text-indigo-600 dark:group-hover/card:text-indigo-400">
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
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover/card:text-indigo-600 group-hover/card:translate-x-0.5 transition-all" />
                      </button>
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
                    <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Thinking / Tool Calling State Indicator */}
            {isThinking && (
              <div className="flex gap-2 items-start">
                <div className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Bot className="w-3 h-3" />
                </div>
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px] flex items-center gap-1.5">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[10px] font-medium text-slate-500">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box Footer */}
          <div className="p-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
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
                placeholder="Ask or command (e.g. 'Marcus phone')..."
                className="w-full pl-2.5 pr-8 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <button
                type="submit"
                id="copilot-send-btn"
                disabled={!input.trim() || isThinking}
                className="absolute right-1 p-1 rounded-md bg-indigo-600 text-white disabled:opacity-40 hover:bg-indigo-500 transition-colors"
              >
                <Send className="w-3 h-3" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
