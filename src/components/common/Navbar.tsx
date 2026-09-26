import React, { useState } from 'react';
import { audio } from '../../services/audioService';
import { BrutalistButton } from './BrutalistButton';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import { Volume2, VolumeX, ShieldCheck, Terminal, ArrowRight, Zap } from 'lucide-react';

import { EngineType } from '../../types';

interface NavbarProps {
  onLaunchApp: (engine?: EngineType | 'portfolio') => void;
  onOpenApiKeyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLaunchApp, onOpenApiKeyModal }) => {
  const { theme } = useTheme();
  const [muted, setMuted] = useState(audio.isMuted());

  const handleToggleMute = () => {
    const nextState = audio.toggleMute();
    setMuted(nextState);
  };

  const isLight = theme === 'light';

  return (
    <header className={`sticky top-0 z-40 border-b-4 border-black transition-colors duration-150 ${
      isLight ? 'bg-[#FFFFFF] text-black shadow-[0_4px_0px_#000000]' : 'bg-[#0E1110] text-white'
    }`}>
      {/* Top micro-bar */}
      <div className="bg-[#00FF66] text-black border-b-2 border-black px-4 py-1 flex items-center justify-between text-[11px] font-mono font-extrabold uppercase tracking-wider select-none">
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="flex items-center gap-1.5 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-black animate-ping" />
            LIVE PROTOCOL: 7×24 ACTIVE
          </span>
          <span className="hidden md:inline-block">|</span>
          <span className="hidden md:inline-block text-black/90">
            TRADFI US STOCKS: <span className="underline decoration-black">CLOSED</span>
          </span>
          <span className="hidden lg:inline-block">|</span>
          <span className="hidden lg:inline-block text-black">
            TOKENIZED rTOKENS: <span className="bg-black text-[#00FF66] px-1 py-0.5 border border-black font-extrabold">TRADING 24/7</span>
          </span>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <span className="hidden sm:inline">QWEN 3.8-MAX</span>
          <span className="bg-black text-[#00FF66] px-1.5 py-0.5 border border-black font-bold text-[10px]">14MS</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => onLaunchApp('dialectic')}
          className="flex items-center gap-3 cursor-pointer group select-none flex-shrink-0"
        >
          <div className="w-10 h-10 bg-[#00FF66] border-3 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center text-black font-extrabold text-xl group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
            <Zap className="w-5 h-5 text-black fill-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-black text-2xl tracking-tighter ${isLight ? 'text-black' : 'text-white'}`}>
                PRISM <span className={isLight ? 'bg-black text-[#00FF66] px-1.5 py-0.5 ml-0.5 border border-black shadow-[1.5px_1.5px_0px_#000]' : 'text-[#00FF66]'}>7</span>
              </span>
              <span className="bg-[#FFE600] text-black border-2 border-black text-[10px] font-mono px-1.5 py-0.5 font-extrabold shadow-[2px_2px_0px_#000]">
                7×24
              </span>
            </div>
            <p className={`text-[10px] font-mono font-bold tracking-wider ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>
              AUTONOMOUS CROSS-ASSET DESK
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className={`hidden lg:flex items-center gap-6 text-xs font-mono font-extrabold uppercase ${
          isLight ? 'text-black' : 'text-gray-300'
        }`}>
          <a
            href="#engines"
            className="hover:text-[#00C853] dark:hover:text-[#00FF66] transition-colors hover:underline decoration-2 underline-offset-4"
          >
            5 Engines
          </a>
          <a
            href="#tradfi-vs-rtoken"
            className="hover:text-[#00C853] dark:hover:text-[#00FF66] transition-colors hover:underline decoration-2 underline-offset-4"
          >
            TradFi vs 7×24
          </a>
          <a
            href="#architecture"
            className="hover:text-[#00C853] dark:hover:text-[#00FF66] transition-colors hover:underline decoration-2 underline-offset-4"
          >
            Multi-Agent Loop
          </a>
          <a
            href="#ledger-preview"
            onClick={(e) => { e.preventDefault(); onLaunchApp('portfolio'); }}
            className="hover:text-[#00C853] dark:hover:text-[#00FF66] transition-colors hover:underline decoration-2 underline-offset-4 cursor-pointer"
          >
            Live Ledger
          </a>
        </nav>

        {/* Right Controls - Unified Sleek h-8 Sizing */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Light / Dark Mode Toggle */}
          <ThemeToggle showLabel={false} />

          {/* Sound Toggle */}
          <button
            onClick={handleToggleMute}
            type="button"
            className={`h-8 w-8 border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all ${
              isLight ? 'bg-white hover:bg-gray-100' : 'bg-[#161A18] hover:bg-[#202722]'
            }`}
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-gray-400" /> : <Volume2 className="w-4 h-4 text-current" />}
          </button>

          {/* System Core Status Button (Zero-Trust Server-Side Backend) */}
          <button
            onClick={onOpenApiKeyModal}
            type="button"
            title="PRISM 7 Zero-Trust Core: Server-Side AI & WebSocket Active"
            className={`h-8 px-2.5 border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5 text-xs font-mono font-bold cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all ${
              isLight ? 'bg-[#D4FCE3] text-black border-black hover:bg-[#bbf7d0]' : 'bg-[#161A18] text-[#00FF66] border-[#00FF66] hover:bg-[#222925]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#00AA44] dark:text-[#00FF66]" />
            <span className="hidden sm:inline">CORE ONLINE</span>
            <span className="w-2 h-2 rounded-full bg-[#00FF66] border border-black" />
          </button>

          {/* Summon PARA Copilot */}
          <button
            onClick={() => {
              audio.playClick();
              window.dispatchEvent(new CustomEvent('open-para-copilot'));
            }}
            type="button"
            title="Summon PARA Autonomous AI Copilot"
            className="h-8 px-2.5 flex items-center gap-1.5 bg-[#00FF66] hover:bg-[#22ff7a] text-black border-2 border-black text-xs font-mono font-black shadow-[2px_2px_0px_#000] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-black fill-black" />
            <span className="hidden sm:inline">PARA</span>
          </button>

          {/* Launch Terminal CTA */}
          <BrutalistButton
            variant="green"
            size="sm"
            onClick={() => onLaunchApp('dialectic')}
            icon={<Terminal className="w-3.5 h-3.5" />}
          >
            <span className="hidden xs:inline">LAUNCH</span> DESK <ArrowRight className="w-3 h-3" />
          </BrutalistButton>
        </div>
      </div>
    </header>
  );
};
