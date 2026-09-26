import React from 'react';
import { motion } from 'framer-motion';
import { EngineType } from '../../types';
import { BrutalistButton } from '../common/BrutalistButton';
import { BrutalistBadge } from '../common/BrutalistBadge';
import { useTheme } from '../../context/ThemeContext';
import { Clock, ShieldAlert, Cpu, FileSearch, Waves, ArrowRight, CheckCircle2 } from 'lucide-react';

interface EngineGridProps {
  onSelectEngine: (engine: EngineType) => void;
}

export const EngineGrid: React.FC<EngineGridProps> = ({ onSelectEngine }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const engines = [
    {
      id: 'chronoarb' as EngineType,
      title: 'CHRONOARB',
      subtitle: '7×24 Weekend Macro Gap Frontrunner',
      icon: <Clock className="w-6 h-6 text-black" />,
      badge: 'OFF-HOURS ALPHA',
      badgeVariant: 'cyan' as const,
      description:
        'TradFi US equity markets close from Friday 4 PM to Monday 9:30 AM EST. ChronoArb autonomously ingests off-hours geopolitical alerts and central bank declarations, calculating the Implied Monday Opening Gap and executing pre-emptive rToken hedges.',
      capabilities: [
        'Live countdown to Monday 9:30 AM TradFi opening bell',
        'Implied Monday Cash Open Gap (IMCOG) predictive model',
        'Pre-market tokenized perpetual positioning & automated scale-out',
      ],
      targetMarket: 'rNVDA, rTSLA, rAAPL, rMSFT',
    },
    {
      id: 'dialectic' as EngineType,
      title: 'DIALECTIC DESK',
      subtitle: 'Dual-Agent Adversarial System',
      icon: <ShieldAlert className="w-6 h-6 text-black" />,
      badge: 'ADVERSARIAL CONSENSUS',
      badgeVariant: 'green' as const,
      description:
        'Eliminates LLM hallucination and conviction drift through real-time adversarial debate. Agent Alpha (The Hunter) proposes setups, while Agent Omega (Chief Risk Comptroller) stress-tests the trade against VaR, tail-risk, and liquidity depth before approval.',
      capabilities: [
        'Real-time Alpha Hunter vs Risk Comptroller multi-turn debate',
        'Transparent step-by-step decision audit log with veto triggers',
        'Automated sizing haircuts and hard stop-loss circuit breakers',
      ],
      targetMarket: 'Cross-Asset rTokens & Crypto Perps',
    },
    {
      id: 'silicon' as EngineType,
      title: 'SILICON SYMBIOSIS',
      subtitle: 'Cross-Asset AI Supply Chain Arbitrage',
      icon: <Cpu className="w-6 h-6 text-black" />,
      badge: 'SUPPLY CHAIN LAG',
      badgeVariant: 'yellow' as const,
      description:
        'Capitalizes on the structural narrative and liquidity lag between US semiconductor mega-caps (NVDA, TSM, ASML) and decentralized AI compute tokens (RENDER, TAO, FET). Quantifies statistical divergence and executes co-integration mean-reversion pairs.',
      capabilities: [
        '30-day statistical spread Z-Score tracking across chip cycles',
        'Hardware guidance to decentralized GPU token lag detection',
        'Multi-leg automated delta-neutral pair execution',
      ],
      targetMarket: 'rNVDA ↔ RENDER, rMSFT ↔ TAO',
    },
    {
      id: 'forensic' as EngineType,
      title: 'FORENSICALPHA',
      subtitle: 'Post-Earnings Guidance & Tone Forensics',
      icon: <FileSearch className="w-6 h-6 text-white" />,
      badge: 'NLP FORENSICS',
      badgeVariant: 'red' as const,
      description:
        'Automated bots trade headline EPS numbers, creating initial retail fakeouts. ForensicAlpha ingests earnings conference calls, measures linguistic hedging (frequency of cautionary words vs prior quarters), and systematically fades the headline pop.',
      capabilities: [
        'Guidance-to-Beat Divergence Index calculation',
        'Executive modal-verb linguistic hedging frequency analysis',
        'Fade-the-Pop structured options and perp triggers',
      ],
      targetMarket: 'US Earnings Calendar & rTokens',
    },
    {
      id: 'cascade' as EngineType,
      title: 'CASCADEGUARD',
      subtitle: 'Microstructure Liquidity Sweep & Flash Reversion',
      icon: <Waves className="w-6 h-6 text-black" />,
      badge: 'MICROSTRUCTURE DEFENSE',
      badgeVariant: 'cyan' as const,
      description:
        'Tokenized US equities have thinner order books during weekend off-hours, making them prone to non-fundamental liquidation wicks. CascadeGuard distinguishes between macro repricing and pure liquidity vacuums, deploying algorithmic laddered bids.',
      capabilities: [
        'Sub-second order book depth & spread wick monitor',
        'Synthetic fair NAV vs dislocated price comparator',
        'Dynamic passive bid laddering with instant crypto hedge',
      ],
      targetMarket: 'Thin Off-Hours rToken Books',
    },
  ];

  return (
    <section id="engines" className={`py-20 px-4 sm:px-6 border-b-4 border-black transition-colors duration-150 ${
      isLight ? 'bg-[#F9FAF7]' : 'bg-[#0E1110]'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6 pb-6 border-b-3 border-black">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 bg-[#00FF66] border-2 border-black inline-block shadow-[1px_1px_0px_#000]" />
              <span className="text-xs font-mono font-extrabold tracking-widest uppercase bg-[#FFE600] text-black px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000]">
                INTELLIGENCE SUITE
              </span>
            </div>
            <h2 className={`text-3xl sm:text-5xl font-extrabold tracking-tight ${isLight ? 'text-black' : 'text-white'}`}>
              5 AUTONOMOUS <span className="bg-[#00FF66] text-black px-2.5 py-0.5 border-2 border-black shadow-[3px_3px_0px_#000]">TRADING ENGINES</span>
            </h2>
          </div>
          <p className={`text-sm font-mono font-bold max-w-md ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>
            Each engine addresses a distinct structural market asymmetry across 7×24 tokenized US equities and digital assets.
          </p>
        </div>

        {/* 5 Engine Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {engines.map((engine, idx) => (
            <motion.div
              key={engine.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.12 }}
              className={`border-3 border-black shadow-[6px_6px_0px_#000] p-6 flex flex-col justify-between transition-all ${
                isLight ? 'bg-white text-black' : 'bg-[#141715] text-white'
              } ${idx === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}
            >
              <div>
                {/* Card Top: Icon & Badge */}
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className={`w-12 h-12 border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center ${
                    engine.id === 'chronoarb' ? 'bg-[#00E5FF]' :
                    engine.id === 'dialectic' ? 'bg-[#00FF66]' :
                    engine.id === 'silicon' ? 'bg-[#FFE600]' :
                    engine.id === 'forensic' ? 'bg-[#FF3366]' : 'bg-[#B388FF]'
                  }`}>
                    {engine.icon}
                  </div>
                  <BrutalistBadge variant={engine.badgeVariant}>
                    {engine.badge}
                  </BrutalistBadge>
                </div>

                {/* Card Title & Subtitle */}
                <h3 className={`text-2xl font-extrabold tracking-tight mb-1.5 ${isLight ? 'text-black' : 'text-white'}`}>
                  {engine.title}
                </h3>
                <h4 className={`text-xs font-mono font-extrabold uppercase mb-4 ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>
                  {engine.subtitle}
                </h4>

                {/* Description */}
                <p className={`text-sm font-medium leading-relaxed mb-6 ${isLight ? 'text-gray-800' : 'text-gray-300'}`}>
                  {engine.description}
                </p>

                {/* Capabilities List */}
                <div className="space-y-2 mb-6 font-mono text-xs">
                  {engine.capabilities.map((cap, cIdx) => (
                    <div key={cIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00C853] flex-shrink-0 mt-0.5" />
                      <span className={isLight ? 'text-gray-800' : 'text-gray-300'}>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer: Target Assets & Action */}
              <div className="pt-4 border-t-2 border-black space-y-3">
                <div className={`p-2 border border-black font-mono text-xs font-bold flex items-center justify-between ${
                  isLight ? 'bg-[#F4F5F0]' : 'bg-[#1D221F]'
                }`}>
                  <span className="text-gray-500 uppercase text-[10px]">MARKETS:</span>
                  <span className={isLight ? 'text-black' : 'text-[#00FF66]'}>{engine.targetMarket}</span>
                </div>

                <BrutalistButton
                  variant="green"
                  size="md"
                  className="w-full"
                  onClick={() => onSelectEngine(engine.id)}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  ACTIVATE {engine.title}
                </BrutalistButton>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
