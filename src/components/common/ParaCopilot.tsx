import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { paraCopilot, ParaMessage, ParaExecutionContext } from '../../services/paraCopilotService';
import { useTheme } from '../../context/ThemeContext';
import { audio } from '../../services/audioService';
import { 
  Send, 
  X, 
  Minus, 
  Trash2, 
  Sparkles, 
  CheckCircle, 
  TrendingUp,
  ShieldAlert,
  Waves,
  PieChart,
  SunMoon,
  Zap
} from 'lucide-react';

interface ParaCopilotProps {
  executionContext: ParaExecutionContext;
}

export const ParaCopilot: React.FC<ParaCopilotProps> = ({ executionContext }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ParaMessage[]>(paraCopilot.getMessages());
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = paraCopilot.subscribe(msgs => {
      setMessages(msgs);
    });
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-para-copilot', handleOpen);
    return () => {
      unsub();
      window.removeEventListener('open-para-copilot', handleOpen);
    };
  }, []);

  const scrollToBottom = (smooth = true) => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom(false);
      const timer = setTimeout(() => scrollToBottom(true), 60);
      inputRef.current?.focus();
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom(true);
      const timer = setTimeout(() => scrollToBottom(true), 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isLoading, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setInputText('');
    setIsLoading(true);

    try {
      await paraCopilot.sendMessage(text, executionContext);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    { label: 'Debate rNVDA', prompt: 'Run dialectic debate on rNVDA', icon: <ShieldAlert className="w-3 h-3" /> },
    { label: 'Long $25k TSLA', prompt: 'Execute LONG trade on rTSLA for $25,000', icon: <TrendingUp className="w-3 h-3" /> },
    { label: 'Scan Vacuums', prompt: 'Scan order-book liquidity vacuums with CascadeGuard', icon: <Waves className="w-3 h-3" /> },
    { label: 'Portfolio & PnL', prompt: 'Show me my current portfolio status and realized PnL', icon: <PieChart className="w-3 h-3" /> },
    { label: 'Toggle Theme', prompt: 'Toggle theme mode', icon: <SunMoon className="w-3 h-3" /> },
  ];

  // Formatter to render clean text and resolve all asterisk/markdown formatting issues cleanly
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');

    return (
      <div className="space-y-1.5 leading-relaxed text-xs">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="h-1" />;
          }

          // Bullet list item
          if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
            const content = trimmed.replace(/^[-•*]\s+/, '');
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1 my-0.5">
                <span className="text-[#00C853] dark:text-[#00FF66] font-black text-sm leading-none mt-0.5">•</span>
                <span className="flex-1">{parseInlineMarkdown(content)}</span>
              </div>
            );
          }

          // Numbered list item
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1 my-0.5">
                <span className="font-extrabold text-[#00C853] dark:text-[#00FF66] text-[11px] min-w-[14px]">
                  {numMatch[1]}.
                </span>
                <span className="flex-1">{parseInlineMarkdown(numMatch[2])}</span>
              </div>
            );
          }

          return (
            <p key={idx}>
              {parseInlineMarkdown(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  // Parses **bold**, `code`, and removes stray raw asterisks cleanly
  const parseInlineMarkdown = (text: string) => {
    // Replace triple asterisks ***word*** with **word**
    const normalized = text.replace(/\*\*\*([^*]+)\*\*\*/g, '**$1**');

    // Split on **bold** and `code`
    const parts = normalized.split(/(\*\*.*?\*\*|`.*?`)/g);

    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        const content = part.slice(2, -2).trim();
        return (
          <strong
            key={idx}
            className="font-extrabold text-[#00B048] dark:text-[#00FF66] bg-black/5 dark:bg-black/40 px-1 py-0.5 rounded border border-black/15 mx-0.5 inline-block"
          >
            {content.replace(/\*/g, '')}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        const content = part.slice(1, -1).trim();
        return (
          <code
            key={idx}
            className="font-mono bg-black/10 dark:bg-black/50 px-1.5 py-0.5 text-[11px] font-bold border border-black/20 mx-0.5 inline-block"
          >
            {content}
          </code>
        );
      }
      // Any remaining stray single asterisks from italics or typos are cleanly stripped
      const cleaned = part.replace(/\*/g, '');
      return <React.Fragment key={idx}>{cleaned}</React.Fragment>;
    });
  };

  return (
    <>
      {/* Floating Trigger Widget (Bottom-Right) */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-50 select-none font-mono"
        >
          <button
            onClick={() => {
              audio.playClick();
              setIsOpen(true);
            }}
            className="flex items-center gap-3 p-2.5 bg-[#00FF66] hover:bg-[#20ff78] text-black border-3 border-black shadow-[5px_5px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_#000] transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 bg-black text-[#00FF66] border border-black flex items-center justify-center font-extrabold text-base shadow-[1px_1px_0px_#000] group-hover:rotate-12 transition-transform">
              <Zap className="w-4 h-4 text-[#00FF66] fill-[#00FF66]" />
            </div>
            <div className="text-left pr-1">
              <div className="text-xs font-black tracking-tight leading-none">
                PARA COPILOT
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-[10px] font-extrabold">
                <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                <span>AUTONOMOUS AGENT</span>
              </div>
            </div>
          </button>
        </motion.div>
      )}

      {/* Expanded Interactive Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`fixed bottom-5 right-5 z-50 w-[92vw] sm:w-[460px] h-[600px] max-h-[85vh] border-4 border-black shadow-[8px_8px_0px_#000] flex flex-col font-mono select-none overflow-hidden ${
              isLight ? 'bg-white text-black' : 'bg-[#101412] text-white'
            }`}
          >
            {/* Header */}
            <div className="bg-[#00FF66] text-black p-3 border-b-3 border-black flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-black text-[#00FF66] border border-black flex items-center justify-center font-black text-sm">
                  <Zap className="w-4 h-4 text-[#00FF66] fill-[#00FF66]" />
                </div>
                <div>
                  <div className="font-black text-sm tracking-tight leading-none">
                    PARA AUTONOMOUS COPILOT
                  </div>
                  <div className="text-[10px] font-extrabold text-black/80 flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-black" />
                    <span>QWEN 3.8-MAX MULTI-AGENT ENGINE</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    audio.playClick();
                    paraCopilot.clearHistory();
                  }}
                  title="Clear Log"
                  className="p-1 hover:bg-black/10 active:translate-y-0.5 transition-all border border-transparent hover:border-black cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    audio.playClick();
                    setIsOpen(false);
                  }}
                  title="Minimize"
                  className="p-1 hover:bg-black/10 active:translate-y-0.5 transition-all border border-transparent hover:border-black cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    audio.playClick();
                    setIsOpen(false);
                  }}
                  title="Close"
                  className="p-1 hover:bg-[#FF3366] hover:text-white transition-all border border-transparent hover:border-black cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div className={`p-2 border-b-2 border-black flex items-center gap-1.5 overflow-x-auto text-[10px] font-extrabold no-scrollbar ${
              isLight ? 'bg-[#F4F5F0]' : 'bg-[#181D1A]'
            }`}>
              <span className={`text-[9px] uppercase px-1 font-bold ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                QUICK:
              </span>
              {quickPrompts.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip.prompt)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 border border-black shadow-[1px_1px_0px_#000] whitespace-nowrap active:translate-x-0.5 active:translate-y-0.5 cursor-pointer transition-all ${
                    isLight ? 'bg-white hover:bg-[#00FF66] text-black' : 'bg-[#0E1110] hover:bg-[#00FF66] hover:text-black text-gray-200'
                  }`}
                >
                  {chip.icon}
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>

            {/* Message Thread */}
            <div 
              ref={chatContainerRef}
              className="flex-1 p-4 overflow-y-auto space-y-3.5 select-text"
            >
              {messages.map(msg => {
                const isUser = msg.sender === 'user';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold mb-1">
                      <span>{isUser ? 'YOU' : 'PARA COPILOT'}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[88%] p-3 border-2 border-black shadow-[3px_3px_0px_#000] ${
                        isUser
                          ? isLight
                            ? 'bg-[#FFE600] text-black'
                            : 'bg-[#FFE600] text-black'
                          : isLight
                          ? 'bg-[#F4F5F0] text-black'
                          : 'bg-[#161C19] text-gray-100'
                      }`}
                    >
                      {isUser ? (
                        <p className="text-xs font-bold">{msg.text}</p>
                      ) : (
                        renderFormattedText(msg.text)
                      )}
                    </div>

                    {/* Executed Action Receipt Card */}
                    {msg.action && msg.action.status === 'EXECUTED' && (
                      <div className={`mt-2 max-w-[88%] p-2.5 border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-mono flex items-start gap-2 ${
                        isLight ? 'bg-[#D4FCE3] text-black' : 'bg-[#00FF66]/15 text-[#00FF66] border-[#00FF66]'
                      }`}>
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-black dark:text-[#00FF66]" />
                        <div className="flex-1">
                          <div className="text-[10px] font-black uppercase text-black dark:text-white">
                            ACTION DISPATCHED : {msg.action.type}
                          </div>
                          <div className="font-extrabold text-black dark:text-white mt-0.5">
                            {msg.action.resultSummary}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-2 p-3 bg-black/10 dark:bg-white/10 border-2 border-black w-max">
                  <Sparkles className="w-4 h-4 animate-spin text-[#00FF66]" />
                  <span className="text-xs font-bold animate-pulse">
                    PARA is reasoning via Qwen 3.8-Max...
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className={`p-3 border-t-3 border-black flex items-center gap-2 ${
              isLight ? 'bg-[#F4F5F0]' : 'bg-[#141816]'
            }`}>
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Instruct PARA: trade, debate, audit, or navigate..."
                disabled={isLoading}
                className={`flex-1 neo-input text-xs font-bold ${
                  isLight ? 'bg-white text-black' : 'bg-[#0B0E0C] text-white'
                }`}
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !inputText.trim()}
                className={`p-2.5 border-2 border-black shadow-[2px_2px_0px_#000] font-black text-xs transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5 ${
                  inputText.trim() && !isLoading
                    ? 'bg-[#00FF66] text-black hover:bg-[#20ff78]'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
