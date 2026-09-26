import React from 'react';
import { Terminal, ArrowUp, Zap } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { audio } from '../../services/audioService';

import { EngineType } from '../../types';

interface FooterProps {
  onLaunchTerminal: () => void;
  onSelectEngine?: (engine: EngineType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onLaunchTerminal, onSelectEngine }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const scrollToTop = () => {
    audio.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEngineClick = (engine: EngineType) => {
    audio.playClick();
    if (onSelectEngine) {
      onSelectEngine(engine);
    } else {
      onLaunchTerminal();
    }
  };

  return (
    <footer className={`border-t-4 border-black font-mono py-12 px-4 sm:px-6 transition-colors duration-150 ${
      isLight ? 'bg-white text-black' : 'bg-[#0A0C0B] text-white'
    }`}>
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b-2 border-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00FF66] border-3 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center text-black font-extrabold text-xl">
              <Zap className="w-5 h-5 text-black fill-black" />
            </div>
            <div>
              <div className="font-extrabold text-2xl tracking-tighter">
                PARA<span className={isLight ? 'bg-black text-[#00FF66] px-1 ml-0.5 border border-black' : 'text-[#00FF66]'}>LLAX</span> 7×24
              </div>
              <p className={`text-[11px] font-bold ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>
                AUTONOMOUS CROSS-ASSET INSTITUTIONAL TRADING DESK
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onLaunchTerminal}
              className="neo-btn neo-btn-green text-xs"
            >
              <Terminal className="w-4 h-4" />
              LAUNCH TRADING TERMINAL
            </button>
            <button
              onClick={scrollToTop}
              className={`p-2.5 border-2 border-black shadow-[2px_2px_0px_#000] transition-all cursor-pointer ${
                isLight ? 'bg-white text-black hover:bg-gray-100' : 'bg-[#161A18] text-gray-300 hover:text-[#00FF66]'
              }`}
              title="Return to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs ${
          isLight ? 'text-gray-700' : 'text-gray-400'
        }`}>
          <div>
            <div className={`font-extrabold uppercase mb-2 text-sm ${isLight ? 'text-black' : 'text-white'}`}>
              ENGINES
            </div>
            <ul className="space-y-1.5 font-bold">
              <li 
                onClick={() => handleEngineClick('chronoarb')}
                className="hover:text-[#00C853] dark:hover:text-[#00FF66] cursor-pointer"
              >
                ChronoArb 7×24
              </li>
              <li 
                onClick={() => handleEngineClick('dialectic')}
                className="hover:text-[#00C853] dark:hover:text-[#00FF66] cursor-pointer"
              >
                Dialectic Desk
              </li>
              <li 
                onClick={() => handleEngineClick('silicon')}
                className="hover:text-[#00C853] dark:hover:text-[#00FF66] cursor-pointer"
              >
                Silicon Symbiosis
              </li>
              <li 
                onClick={() => handleEngineClick('forensic')}
                className="hover:text-[#00C853] dark:hover:text-[#00FF66] cursor-pointer"
              >
                ForensicAlpha
              </li>
              <li 
                onClick={() => handleEngineClick('cascade')}
                className="hover:text-[#00C853] dark:hover:text-[#00FF66] cursor-pointer"
              >
                CascadeGuard
              </li>
            </ul>
          </div>

          <div>
            <div className={`font-extrabold uppercase mb-2 text-sm ${isLight ? 'text-black' : 'text-white'}`}>
              INTELLIGENCE
            </div>
            <ul className="space-y-1.5 font-medium">
              <li>Qwen 3.8-Max Neural Engine</li>
              <li>Adversarial Risk Comptroller</li>
              <li>Linguistic 8-K Tone Extractor</li>
              <li>Cross-Asset Cointegration</li>
              <li>Sub-Second Order Routing</li>
            </ul>
          </div>

          <div>
            <div className={`font-extrabold uppercase mb-2 text-sm ${isLight ? 'text-black' : 'text-white'}`}>
              MARKET COVERAGE
            </div>
            <ul className="space-y-1.5 font-medium">
              <li>rNVDA, rTSLA, rAAPL, rMSFT</li>
              <li>rCOIN, rMSTR Tokenized Equities</li>
              <li>BTC, ETH, SOL Perpetual Swaps</li>
              <li>RENDER, TAO, FET Compute Assets</li>
              <li>168 Hours / Week Zero-Downtime</li>
            </ul>
          </div>

          <div>
            <div className={`font-extrabold uppercase mb-2 text-sm ${isLight ? 'text-black' : 'text-white'}`}>
              SECURITY & STATUS
            </div>
            <div className={`p-3 border-2 border-black space-y-2 shadow-[2px_2px_0px_#000] ${
              isLight ? 'bg-[#F4F5F0] text-black' : 'bg-[#121513] text-white'
            }`}>
              <div className="flex items-center gap-2 text-[#00C853] dark:text-[#00FF66] font-extrabold">
                <span className="w-2 h-2 rounded-full bg-[#00FF66] border border-black animate-ping" />
                SYSTEM OPERATIONAL 7×24
              </div>
              <p className={`text-[10px] ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                Client-side API key encryption. Hard-barrier VaR circuit breakers enabled.
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t-2 border-black text-[11px] flex flex-col sm:flex-row items-center justify-between gap-4 font-bold">
          <div className={isLight ? 'text-gray-700' : 'text-gray-400'}>
            © 2026 PRISM 7 Institutional Desk. Built for 7×24 continuous market alpha.
          </div>
          <div className="flex items-center gap-2">
            <span className={isLight ? 'text-black' : 'text-[#00FF66]'}>PRIMARY ENGINE:</span>
            <span className="bg-[#FFE600] text-black px-2 py-0.5 border border-black font-extrabold shadow-[1px_1px_0px_#000]">
              QWEN 3.8-MAX
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
