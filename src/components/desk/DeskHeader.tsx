import React, { useState, useEffect } from 'react';
import { EngineType } from '../../types';
import { audio } from '../../services/audioService';
import { qwen } from '../../services/qwenService';
import { market } from '../../services/marketService';
import { bitgetTrading } from '../../services/bitgetTradingService';
import { ledger, PerformanceMetrics } from '../../services/paperTradingService';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { 
  Clock, 
  ShieldAlert, 
  Cpu, 
  FileSearch, 
  Waves, 
  PieChart, 
  Volume2, 
  VolumeX, 
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Bot
} from 'lucide-react';
import { autopilot, AutopilotState } from '../../services/autopilotService';

interface DeskHeaderProps {
  activeEngine: EngineType | 'portfolio';
  onSelectEngine: (engine: EngineType | 'portfolio') => void;
  onReturnToHome: () => void;
  onOpenApiKeyModal: () => void;
  onOpenAutopilotModal: () => void;
  onOpenOrderBookModal: () => void;
}

export const DeskHeader: React.FC<DeskHeaderProps> = ({
  activeEngine,
  onSelectEngine,
  onReturnToHome,
  onOpenApiKeyModal,
  onOpenAutopilotModal,
  onOpenOrderBookModal,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [muted, setMuted] = useState(audio.isMuted());
  const [hasApiKey, setHasApiKey] = useState(qwen.hasValidKey());
  const [metrics, setMetrics] = useState<PerformanceMetrics>(ledger.getMetrics());
  const [wsStatus, setWsStatus] = useState(market.getWsStatus());
  const [execMode, setExecMode] = useState(bitgetTrading.getExecutionMode());
  const [autopilotState, setAutopilotState] = useState<AutopilotState>(autopilot.getState());

  useEffect(() => {
    const handleKeyChange = () => setHasApiKey(qwen.hasValidKey());
    window.addEventListener('storage', handleKeyChange);

    const unsubLedger = ledger.subscribe(() => {
      setMetrics(ledger.getMetrics());
    });

    const unsubWs = market.subscribeWsStatus(status => {
      setWsStatus(status);
    });

    const unsubBitget = bitgetTrading.subscribe(() => {
      setExecMode(bitgetTrading.getExecutionMode());
    });

    const unsubAutopilot = autopilot.subscribe(st => {
      setAutopilotState(st);
    });

    return () => {
      window.removeEventListener('storage', handleKeyChange);
      unsubLedger();
      unsubWs();
      unsubBitget();
      unsubAutopilot();
    };
  }, []);

  const handleToggleMute = () => {
    const state = audio.toggleMute();
    setMuted(state);
  };

  const navItems = [
    { id: 'dialectic', label: 'DIALECTIC DESK', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
    { id: 'chronoarb', label: 'CHRONOARB 7×24', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'silicon', label: 'SILICON SYMBIOSIS', icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: 'forensic', label: 'FORENSICALPHA', icon: <FileSearch className="w-3.5 h-3.5" /> },
    { id: 'cascade', label: 'CASCADEGUARD', icon: <Waves className="w-3.5 h-3.5" /> },
    { id: 'portfolio', label: 'LIVE LEDGER', icon: <PieChart className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className={`border-b-4 border-black font-mono select-none sticky top-0 z-40 transition-colors duration-150 ${
      isLight ? 'bg-white text-black shadow-[0_4px_0px_#000000]' : 'bg-[#0A0C0B] text-white'
    }`}>
      {/* Upper Status Ribbon */}
      <div className="bg-[#00FF66] text-black px-4 py-1 text-[11px] font-extrabold flex items-center justify-between border-b-2 border-black tracking-wide">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-black animate-ping" />
            PRISM 7 AUTONOMOUS DESK • 7×24 STREAM
          </span>
          <span className="hidden md:inline">|</span>
          <button
            onClick={() => {
              audio.playClick();
              onOpenOrderBookModal();
            }}
            className="hidden lg:inline flex items-center gap-1 hover:opacity-85 transition-opacity cursor-pointer"
            title="Inspect Live L2 Order Book & VWAP Slippage"
          >
            <Activity className="w-3.5 h-3.5 text-black" />
            BITGET WS L2: <span className="bg-black text-[#00FF66] px-1 py-0.5 rounded font-mono font-black">{wsStatus.connected ? `LIVE (${wsStatus.latencyMs}ms)` : 'CONNECTING...'}</span>
          </button>
          <span className="hidden md:inline">|</span>
          <button
            onClick={() => {
              audio.playClick();
              onOpenOrderBookModal();
            }}
            className="hidden sm:inline flex items-center gap-1 hover:opacity-85 transition-opacity cursor-pointer"
            title="Inspect Live L2 Order Book & Depth Ladder"
          >
            <Layers className="w-3.5 h-3.5 text-black" />
            L2 DEPTH: <span className="bg-black text-[#FFE600] px-1 py-0.5 rounded font-mono font-black">INSPECT</span>
          </button>
          <span className="hidden md:inline">|</span>
          <span className="hidden lg:inline flex items-center gap-1">
            <span className="font-extrabold text-black">ROUTING:</span>
            <span className={`px-1 py-0.5 rounded font-black ${execMode === 'LIVE_BITGET' ? 'bg-[#FF3366] text-white' : 'bg-black text-[#00E5FF]'}`}>
              {execMode === 'LIVE_BITGET' ? 'LIVE BITGET SPOT' : 'PAPER VWAP'}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              audio.playClick();
              onOpenAutopilotModal();
            }}
            className={`flex items-center gap-1.5 px-2 py-0.5 border border-black text-[10px] font-black cursor-pointer transition-transform active:scale-95 shadow-[1px_1px_0px_#000] ${
              autopilotState.circuitBreakerTripped
                ? 'bg-[#FF3366] text-white animate-pulse'
                : autopilotState.isActive
                ? 'bg-black text-[#00FF66]'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
            title="Configure Autonomous Autopilot & VaR Breakers"
          >
            <Bot className="w-3 h-3" />
            <span>
              AUTOPILOT: {autopilotState.circuitBreakerTripped ? 'CIRCUIT TRIPPED' : autopilotState.isActive ? `ACTIVE (${autopilotState.nextCycleCountdownSeconds}s)` : 'STANDBY'}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full ${
              autopilotState.circuitBreakerTripped ? 'bg-white' : autopilotState.isActive ? 'bg-[#00FF66] animate-ping' : 'bg-gray-400'
            }`} />
          </button>
          <span className="font-extrabold hidden sm:inline">EQUITY: ${metrics.totalEquityUSD.toLocaleString()}</span>
          <span className="text-black bg-white px-1.5 py-0.5 border-2 border-black font-extrabold shadow-[1px_1px_0px_#000]">
            SHARPE: {metrics.sharpeRatio}
          </span>
        </div>
      </div>

      {/* Main Controls Header */}
      <div className={`px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b-2 border-black ${
        isLight ? 'bg-[#F4F5F0]' : 'bg-[#111413]'
      }`}>
        {/* Left: Brand / Logo with Click to Return to Homepage */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              audio.playClick();
              onReturnToHome();
            }}
            title="Return to Homepage"
            className={`h-8 px-2.5 flex items-center gap-2 group border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer ${
              isLight ? 'bg-white hover:bg-gray-100' : 'bg-[#1A201C] hover:bg-[#252C28]'
            }`}
          >
            <div className="w-5 h-5 bg-[#00FF66] border border-black flex items-center justify-center text-black shrink-0">
              <Zap className="w-3.5 h-3.5 text-black fill-current" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`font-black text-xs tracking-tight ${isLight ? 'text-black' : 'text-white'}`}>
                PRISM
              </span>
              <span className={`px-1 py-0.2 text-[9px] font-black border border-black ${
                isLight ? 'bg-black text-[#00FF66]' : 'bg-[#00FF66] text-black'
              }`}>
                7
              </span>
            </div>
            <span className={`text-[9px] font-bold border-l border-black/30 dark:border-white/30 pl-2 tracking-wider ${
              isLight ? 'text-gray-600' : 'text-gray-400'
            }`}>
              ← HOME
            </span>
          </button>
        </div>

        {/* Center: Module Switcher Tabs */}
        <nav className="flex flex-wrap items-center gap-1.5 text-xs">
          {navItems.map(item => {
            const isActive = activeEngine === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  audio.playClick();
                  onSelectEngine(item.id as EngineType | 'portfolio');
                }}
                className={`h-8 px-2.5 flex items-center gap-1.5 border-2 border-black text-[11px] font-extrabold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#00FF66] text-black shadow-[2px_2px_0px_#000] -translate-x-0.5 -translate-y-0.5'
                    : isLight
                    ? 'bg-white text-black hover:bg-[#E6E8E2] shadow-[1px_1px_0px_#000]'
                    : 'bg-[#181C1A] text-gray-300 hover:text-white hover:bg-[#252C28]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Tools: Theme Toggle, Audio Mute, Core Status & PARA Copilot */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              audio.playClick();
              window.dispatchEvent(new CustomEvent('open-para-copilot'));
            }}
            title="Summon PARA Autonomous AI Copilot"
            className="h-8 px-2.5 flex items-center gap-1.5 bg-[#00FF66] hover:bg-[#22ff7a] text-black border-2 border-black text-xs font-black shadow-[2px_2px_0px_#000] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-black fill-black" />
            <span className="hidden md:inline">PARA</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              onOpenAutopilotModal();
            }}
            title="Configure 7×24 Autonomous Autopilot & VaR Breakers"
            className={`h-8 px-2.5 flex items-center gap-1.5 border-2 border-black text-xs font-black shadow-[2px_2px_0px_#000] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all ${
              autopilotState.circuitBreakerTripped
                ? 'bg-[#FF3366] text-white animate-pulse'
                : autopilotState.isActive
                ? 'bg-[#00FF66] text-black shadow-[2px_2px_0px_#000]'
                : isLight
                ? 'bg-white text-black hover:bg-gray-100'
                : 'bg-[#181C1A] text-gray-300 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">AUTOPILOT</span>
            <span className={`px-1 py-0.2 text-[9px] font-black border border-black ${
              autopilotState.circuitBreakerTripped
                ? 'bg-white text-[#FF3366]'
                : autopilotState.isActive
                ? 'bg-black text-[#00FF66]'
                : 'bg-gray-200 text-black'
            }`}>
              {autopilotState.circuitBreakerTripped ? 'TRIPPED' : autopilotState.isActive ? 'ACTIVE' : 'OFF'}
            </span>
          </button>

          <ThemeToggle showLabel={false} />

          <button
            onClick={handleToggleMute}
            title={muted ? 'Unmute Audio' : 'Mute Audio'}
            className={`h-8 w-8 border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center cursor-pointer ${
              isLight ? 'bg-white text-black hover:bg-gray-100' : 'bg-[#181C1A] text-gray-300 hover:text-[#00FF66]'
            }`}
          >
            {muted ? <VolumeX className="w-4 h-4 text-gray-400" /> : <Volume2 className="w-4 h-4 text-current" />}
          </button>

          {/* Core System Status Button */}
          <button
            onClick={onOpenApiKeyModal}
            title="PRISM 7 Zero-Trust Core: Server-Side AI & WebSocket Status"
            className={`h-8 px-2.5 border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
              hasApiKey
                ? isLight ? 'bg-[#D4FCE3] text-black hover:bg-[#bbf7d0]' : 'bg-[#181C1A] text-[#00FF66] border-[#00FF66] hover:bg-[#202722]'
                : 'bg-[#FFE600] text-black hover:bg-yellow-400'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#00AA44] dark:text-[#00FF66]" />
            <span className="hidden md:inline">CORE ONLINE</span>
            <span className={`w-2 h-2 rounded-full border border-black ${wsStatus.connected ? 'bg-[#00FF66]' : 'bg-[#FFE600]'}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
