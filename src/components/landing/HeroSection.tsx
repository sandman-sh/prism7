import React, { useState } from 'react';
import { BrutalistButton } from '../common/BrutalistButton';
import { BrutalistBadge } from '../common/BrutalistBadge';
import { useTheme } from '../../context/ThemeContext';
import { Terminal, Zap, Cpu, ArrowRight } from 'lucide-react';
import { audio } from '../../services/audioService';

interface HeroSectionProps {
  onLaunchTerminal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onLaunchTerminal }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'chrono' | 'dialectic' | 'silicon' | 'forensic' | 'cascade'>('dialectic');

  const isLight = theme === 'light';

  return (
    <section className={`relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 border-b-4 border-black transition-colors duration-150 ${
      isLight ? 'bg-white bg-grid-pattern' : 'bg-[#0E1110] bg-grid-pattern'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Top Eyebrow Tag */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <BrutalistBadge variant="green" icon={<Zap className="w-3.5 h-3.5 fill-current" />}>
            AUTONOMOUS MULTI-AGENT QUANT DESK
          </BrutalistBadge>
          <span className={`text-xs font-mono font-bold tracking-wider ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>
            TOKENIZED US EQUITIES (rTOKEN) + DIGITAL ASSETS 7×24
          </span>
        </div>

        {/* Hero Main Headline & Terminal Sandbox Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Headlines & Pitch */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className={`text-4xl sm:text-6xl xl:text-7xl font-extrabold leading-[0.98] tracking-tight ${
              isLight ? 'text-black' : 'text-white'
            }`}>
              WHEN TRADFI <br />
              <span className="text-[#FF3366] line-through decoration-4 decoration-black inline-block">SLEEPS</span>, <br />
              <span className="bg-[#00FF66] text-black px-3 py-1 shadow-[5px_5px_0px_#000] border-3 border-black inline-block mt-2">
                PRISM 7 EXECUTES.
              </span>
            </h1>

            <p className={`text-base sm:text-lg font-medium max-w-2xl leading-relaxed ${
              isLight ? 'text-gray-800' : 'text-gray-300'
            }`}>
              TradFi US markets lock up for <span className="bg-[#FFE600] text-black px-1.5 py-0.5 border border-black font-mono font-extrabold">128 hours every week</span>. 
              PRISM 7 deploys <span className="font-extrabold underline decoration-2">Qwen 3.8-Max multi-agent intelligence</span> to trade 7×24 tokenized US equities and crypto—capturing off-market weekend macro gaps, AI supply chain narrative contagion, and thin-book liquidity cascades with adversarial risk guardrails.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <BrutalistButton
                variant="green"
                size="lg"
                onClick={onLaunchTerminal}
                icon={<Terminal className="w-5 h-5" />}
              >
                LAUNCH AUTONOMOUS DESK →
              </BrutalistButton>

              <a href="#engines">
                <BrutalistButton
                  variant={isLight ? 'white' : 'dark'}
                  size="lg"
                  icon={<Cpu className="w-5 h-5" />}
                >
                  EXPLORE 5 ENGINES
                </BrutalistButton>
              </a>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 font-mono">
              <div className={`p-3 border-3 border-black shadow-[4px_4px_0px_#000] transition-transform hover:-translate-y-0.5 ${
                isLight ? 'bg-white' : 'bg-[#141715]'
              }`}>
                <div className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  TRADING WINDOW
                </div>
                <div className="text-lg font-extrabold text-[#000000] bg-[#00FF66] px-1 border border-black inline-block mt-0.5">
                  7×24 ACTIVE
                </div>
              </div>

              <div className={`p-3 border-3 border-black shadow-[4px_4px_0px_#000] transition-transform hover:-translate-y-0.5 ${
                isLight ? 'bg-white' : 'bg-[#141715]'
              }`}>
                <div className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  DECISION LATENCY
                </div>
                <div className={`text-lg font-extrabold mt-0.5 ${isLight ? 'text-black' : 'text-white'}`}>
                  18.4 MS
                </div>
              </div>

              <div className={`p-3 border-3 border-black shadow-[4px_4px_0px_#000] transition-transform hover:-translate-y-0.5 ${
                isLight ? 'bg-white' : 'bg-[#141715]'
              }`}>
                <div className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  HISTORICAL SHARPE
                </div>
                <div className="text-lg font-extrabold text-[#000000] bg-[#FFE600] px-1 border border-black inline-block mt-0.5">
                  2.84
                </div>
              </div>

              <div className={`p-3 border-3 border-black shadow-[4px_4px_0px_#000] transition-transform hover:-translate-y-0.5 ${
                isLight ? 'bg-white' : 'bg-[#141715]'
              }`}>
                <div className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  AI CORE
                </div>
                <div className="text-lg font-extrabold text-[#000000] bg-[#00E5FF] px-1 border border-black inline-block mt-0.5">
                  QWEN 3.8
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Hero Terminal Sandbox */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-[#000000] border-4 border-black shadow-[8px_8px_0px_#000000] p-4 text-white font-mono">
              {/* Terminal Title Bar */}
              <div className="flex items-center justify-between border-b-2 border-[#333333] pb-3 mb-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#FF3366] border border-black inline-block" />
                  <span className="w-3 h-3 bg-[#FFE600] border border-black inline-block" />
                  <span className="w-3 h-3 bg-[#00FF66] border border-black inline-block" />
                  <span className="text-gray-200 font-extrabold ml-1.5">PRISM7_SHELL.LOG</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#00FF66] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-ping" />
                  <span>ONLINE 7×24</span>
                </div>
              </div>

              {/* Engine Selector Tabs */}
              <div className="grid grid-cols-5 gap-1 mb-3 text-[10px] font-extrabold uppercase">
                {(['dialectic', 'chrono', 'silicon', 'forensic', 'cascade'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => { audio.playClick(); setActiveTab(tab); }}
                    type="button"
                    className={`py-1 px-0.5 border border-black text-center transition-all cursor-pointer ${
                      activeTab === tab
                        ? 'bg-[#00FF66] text-black font-extrabold shadow-[2px_2px_0px_#00FF66]'
                        : 'bg-[#181C1A] text-gray-400 hover:text-white hover:bg-[#252C28]'
                    }`}
                  >
                    {tab === 'dialectic' ? 'DIALECTIC' :
                     tab === 'chrono' ? 'CHRONO' :
                     tab === 'silicon' ? 'SILICON' :
                     tab === 'forensic' ? 'FORENSIC' : 'CASCADE'}
                  </button>
                ))}
              </div>

              {/* Live Terminal Output Screen */}
              <div className="bg-[#0B0E0C] border-2 border-[#26302B] p-3 text-xs leading-relaxed space-y-2.5 min-h-[170px]">
                {activeTab === 'dialectic' && (
                  <div>
                    <div className="text-[#FFE600] font-bold flex items-center justify-between mb-1 pb-1 border-b border-[#222]">
                      <span>ALPHA HUNTER vs CHIEF RISK COMPTROLLER</span>
                      <span className="text-[10px] text-[#00FF66]">ADVERSARIAL SYNC</span>
                    </div>
                    <p className="text-[#00FF66]">
                      &gt; AGENT ALPHA [PROPOSAL]:<br />
                      "Long rNVDA @ $138.45. Pre-open order book shows +4.2% liquidity bid bias off-hours. Target: $146.20."
                    </p>
                    <p className="text-[#FF9999] mt-1.5">
                      &gt; AGENT OMEGA [COMPTROLLER AUDIT]:<br />
                      "APPROVED WITH 50% SIZING HAIRCUT. Weekend volatility index elevated. Maximum allowed VaR buffer capped at $15,000."
                    </p>
                  </div>
                )}

                {activeTab === 'chrono' && (
                  <div>
                    <div className="text-[#00E5FF] font-bold flex items-center justify-between mb-1 pb-1 border-b border-[#222]">
                      <span>WEEKEND MACRO GAP PREDICTOR</span>
                      <span className="text-[10px] text-white">IMCOG: +2.18%</span>
                    </div>
                    <p className="text-gray-300">
                      &gt; SENSING: Sunday 03:14 UTC Geopolitical emergency statement released.<br />
                      &gt; MODEL: rTSLA implied opening delta calculated at -3.4% on Monday 9:30 AM EST.<br />
                      &gt; ACTION: Pre-hedged with 250 contracts short perpetual before TradFi open.
                    </p>
                  </div>
                )}

                {activeTab === 'silicon' && (
                  <div>
                    <div className="text-[#FFE600] font-bold flex items-center justify-between mb-1 pb-1 border-b border-[#222]">
                      <span>SEMICONDUCTOR ↔ DECENTRALIZED AI PAIR</span>
                      <span className="text-[10px] text-[#FFE600]">Z-SCORE: +2.41</span>
                    </div>
                    <p className="text-gray-300">
                      &gt; PAIR: rNVDA (Equity) vs RENDER (Compute Token).<br />
                      &gt; DIVERGENCE: NVDA guidance beat +18% while decentralized GPU token lagged by 6.2 hours.<br />
                      &gt; TRADE: Long RENDER / Short rNVDA cointegration spread locked.
                    </p>
                  </div>
                )}

                {activeTab === 'forensic' && (
                  <div>
                    <div className="text-[#FF3366] font-bold flex items-center justify-between mb-1 pb-1 border-b border-[#222]">
                      <span>EARNINGS CALL LINGUISTIC FORENSICS</span>
                      <span className="text-[10px] text-[#FF3366]">FADE THE POP</span>
                    </div>
                    <p className="text-gray-300">
                      &gt; ASSET: rMSFT Q3 Conference Call Transcript.<br />
                      &gt; NLP TELEMETRY: Headline beat EPS by $0.08, but CFO tone score dropped -42 points (hedging words: "cloud deceleration").<br />
                      &gt; EXECUTION: Systematic fade short executed at post-market peak.
                    </p>
                  </div>
                )}

                {activeTab === 'cascade' && (
                  <div>
                    <div className="text-[#B388FF] font-bold flex items-center justify-between mb-1 pb-1 border-b border-[#222]">
                      <span>MICROSTRUCTURE FLASH SWEEP DEFENSE</span>
                      <span className="text-[10px] text-[#00FF66]">WICK SNIPED</span>
                    </div>
                    <p className="text-gray-300">
                      &gt; EVENT: Thin Sunday night book triggered 6.8% flash liquidation on rAAPL.<br />
                      &gt; VERIFICATION: Zero fundamental macro shift detected.<br />
                      &gt; SNIPE: Limit ladder absorbed depth at 94.2% discount, instantly delta-hedged on CME basis.
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Shell Action Button */}
              <button
                onClick={onLaunchTerminal}
                type="button"
                className="w-full mt-3 py-2 bg-[#00FF66] text-black font-extrabold text-xs border-2 border-black hover:bg-[#24FF7C] active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000]"
              >
                <span>&gt;_ OPEN FULL INTERACTIVE DESK</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
