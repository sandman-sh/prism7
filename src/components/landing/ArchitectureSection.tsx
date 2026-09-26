import React from 'react';
import { BrutalistBadge } from '../common/BrutalistBadge';
import { useTheme } from '../../context/ThemeContext';
import { Terminal, Shield, Cpu, Database } from 'lucide-react';

export const ArchitectureSection: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <section id="architecture" className={`py-20 px-4 sm:px-6 border-b-4 border-black transition-colors duration-150 ${
      isLight ? 'bg-[#FFFFFF]' : 'bg-[#0E1110]'
    }`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <BrutalistBadge variant="cyan" className="mb-3">
            TECHNICAL TOPOLOGY
          </BrutalistBadge>
          <h2 className={`text-3xl sm:text-5xl font-extrabold tracking-tight ${isLight ? 'text-black' : 'text-white'}`}>
            MULTI-AGENT <span className="bg-[#00FF66] text-black px-2.5 py-0.5 border-2 border-black shadow-[3px_3px_0px_#000]">PIPELINE</span>
          </h2>
          <p className={`text-sm font-mono font-bold mt-4 ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>
            End-to-end execution loop: From off-hours raw signal sensing to adversarial risk consensus and automated order routing.
          </p>
        </div>

        {/* 4-Stage Horizontal Pipeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono text-xs">
          {/* Stage 1: Perception */}
          <div className={`p-6 border-3 border-black shadow-[5px_5px_0px_#000] flex flex-col justify-between transition-transform hover:-translate-y-1 ${
            isLight ? 'bg-white text-black' : 'bg-[#141715] text-white'
          }`}>
            <div>
              <div className="flex items-center justify-between font-extrabold mb-3 pb-2 border-b-2 border-black">
                <span className="text-[#00B4D8] dark:text-[#00E5FF] bg-black dark:bg-transparent text-white px-1 py-0.5 font-bold">
                  01 • SENSING
                </span>
                <Database className="w-4 h-4 text-black dark:text-[#00E5FF]" />
              </div>
              <h4 className="font-extrabold text-base mb-2 uppercase">RAW TELEMETRY</h4>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>
                Continuous ingestion of weekend geopolitical feeds, 8-K filings, tokenized US stock order books, and cross-asset crypto tape.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t-2 border-black text-[10px] font-extrabold text-[#00B4D8] dark:text-[#00E5FF]">
              • SUB-SECOND LATENCY<br />
              • UNSTRUCTURED 8-K TEXT
            </div>
          </div>

          {/* Stage 2: Qwen Multi-Agent Reasoning */}
          <div className={`p-6 border-3 border-black shadow-[5px_5px_0px_#000] flex flex-col justify-between transition-transform hover:-translate-y-1 ${
            isLight ? 'bg-[#F0FFF4] text-black' : 'bg-[#172019] text-white'
          }`}>
            <div>
              <div className="flex items-center justify-between font-extrabold mb-3 pb-2 border-b-2 border-black">
                <span className="text-[#009933] dark:text-[#00FF66] bg-black text-[#00FF66] px-1 py-0.5 font-bold">
                  02 • REASONING
                </span>
                <Cpu className="w-4 h-4 text-black dark:text-[#00FF66]" />
              </div>
              <h4 className="font-extrabold text-base mb-2 uppercase">QWEN 3.8-MAX CORE</h4>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                Agent Alpha formulates trade hypotheses, calculates narrative lag across supply chains, and parses guidance hedging nuance.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t-2 border-black text-[10px] font-extrabold text-[#009933] dark:text-[#00FF66]">
              • NEURAL SYNAPSE PROBING<br />
              • ASYMMETRIC ALPHA DISCOVERY
            </div>
          </div>

          {/* Stage 3: Adversarial Risk Audit */}
          <div className={`p-6 border-3 border-black shadow-[5px_5px_0px_#000] flex flex-col justify-between transition-transform hover:-translate-y-1 ${
            isLight ? 'bg-[#FFF5F5] text-black' : 'bg-[#1E1618] text-white'
          }`}>
            <div>
              <div className="flex items-center justify-between font-extrabold mb-3 pb-2 border-b-2 border-black">
                <span className="text-[#D90429] dark:text-[#FF3366] bg-black text-white px-1 py-0.5 font-bold">
                  03 • ADVERSARIAL
                </span>
                <Shield className="w-4 h-4 text-black dark:text-[#FF3366]" />
              </div>
              <h4 className="font-extrabold text-base mb-2 uppercase">RISK COMPTROLLER</h4>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                Agent Omega stress-tests every hypothesis against VaR limits, thin-book liquidity traps, and tail-risk correlation anomalies.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t-2 border-black text-[10px] font-extrabold text-[#D90429] dark:text-[#FF3366]">
              • VETO / DOWNSIZE POWER<br />
              • ZERO HALLUCINATION DRIFT
            </div>
          </div>

          {/* Stage 4: Execution Router */}
          <div className={`p-6 border-3 border-black shadow-[5px_5px_0px_#000] flex flex-col justify-between transition-transform hover:-translate-y-1 ${
            isLight ? 'bg-[#FFFBEB] text-black' : 'bg-[#141715] text-white'
          }`}>
            <div>
              <div className="flex items-center justify-between font-extrabold mb-3 pb-2 border-b-2 border-black">
                <span className="text-black bg-[#FFE600] px-1 py-0.5 font-bold border border-black">
                  04 • ROUTING
                </span>
                <Terminal className="w-4 h-4 text-black dark:text-[#FFE600]" />
              </div>
              <h4 className="font-extrabold text-base mb-2 uppercase">EXECUTION LEDGER</h4>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>
                Synthesized orders route directly to paper execution ledger with automated limit ladders, stop barriers, and crypto delta hedges.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t-2 border-black text-[10px] font-extrabold text-black dark:text-[#FFE600]">
              • REAL-TIME SHARPE LOGGING<br />
              • ATOMIC PAPER SETTLEMENT
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
