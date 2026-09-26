import React from 'react';
import { BrutalistBadge } from '../common/BrutalistBadge';
import { useTheme } from '../../context/ThemeContext';
import { ShieldX, ShieldCheck, AlertOctagon, CheckCircle } from 'lucide-react';

export const TradFiVsTokenizedSection: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <section id="tradfi-vs-rtoken" className={`py-20 px-4 sm:px-6 border-b-4 border-black transition-colors duration-150 ${
      isLight ? 'bg-white' : 'bg-[#121513]'
    }`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <BrutalistBadge variant="yellow" className="mb-3">
            MARKET ASYMMETRY COMPARISON
          </BrutalistBadge>
          <h2 className={`text-3xl sm:text-5xl font-extrabold tracking-tight ${isLight ? 'text-black' : 'text-white'}`}>
            TRADFI BLINDSPOTS <br />
            <span className="bg-[#00FF66] text-black px-2 py-0.5 border-2 border-black shadow-[3px_3px_0px_#000] inline-block mt-2">
              VS 7×24 AGENTIC EXECUTION
            </span>
          </h2>
          <p className={`text-sm font-mono font-bold mt-4 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
            TradFi markets close for 128 hours out of every 168-hour week. When geopolitical shocks or central bank emergency meetings hit on weekends, traditional brokers offer zero execution.
          </p>
        </div>

        {/* Comparison Table Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* TradFi Card */}
          <div className={`border-4 border-black shadow-[7px_7px_0px_#000] p-6 space-y-6 ${
            isLight ? 'bg-[#FFF5F5] text-black' : 'bg-[#181B19] text-white'
          }`}>
            <div className="flex items-center justify-between border-b-3 border-black pb-4">
              <div>
                <h3 className="text-xl font-extrabold tracking-tight">TRADITIONAL US EQUITIES</h3>
                <p className={`text-xs font-mono font-extrabold ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>
                  NYSE / NASDAQ / BROKERAGE
                </p>
              </div>
              <span className="p-2 bg-[#FF3366] text-white border-2 border-black font-mono text-xs font-extrabold shadow-[2px_2px_0px_#000]">
                32.5 HRS / WK
              </span>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className={`flex items-start gap-3 p-3.5 border-2 border-black shadow-[2px_2px_0px_#000] ${
                isLight ? 'bg-white text-black' : 'bg-[#111312] text-gray-300'
              }`}>
                <ShieldX className="w-5 h-5 text-[#FF3366] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block mb-1 uppercase">Weekend Blackout:</span>
                  Markets fully lock up from Friday 4:00 PM to Monday 9:30 AM EST. Zero order placement or risk reduction.
                </div>
              </div>

              <div className={`flex items-start gap-3 p-3.5 border-2 border-black shadow-[2px_2px_0px_#000] ${
                isLight ? 'bg-white text-black' : 'bg-[#111312] text-gray-300'
              }`}>
                <AlertOctagon className="w-5 h-5 text-[#FF3366] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block mb-1 uppercase">Gap Risk Vulnerability:</span>
                  Sunday macro news causes Monday opening gaps with severe slippage and unavoidable gap-down liquidations.
                </div>
              </div>

              <div className={`flex items-start gap-3 p-3.5 border-2 border-black shadow-[2px_2px_0px_#000] ${
                isLight ? 'bg-white text-black' : 'bg-[#111312] text-gray-300'
              }`}>
                <ShieldX className="w-5 h-5 text-[#FF3366] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block mb-1 uppercase">Human Fatigue Limits:</span>
                  Human traders sleep, commute, and take days off. Fast-moving breaking macro events go unmanaged for hours.
                </div>
              </div>
            </div>
          </div>

          {/* PRISM 7 Tokenized rToken Card */}
          <div className={`border-4 border-black shadow-[7px_7px_0px_#000] p-6 space-y-6 ${
            isLight ? 'bg-[#F0FFF4] text-black' : 'bg-[#152019] text-white'
          }`}>
            <div className="flex items-center justify-between border-b-3 border-black pb-4">
              <div>
                <h3 className={`text-xl font-extrabold tracking-tight ${isLight ? 'text-black' : 'text-[#00FF66]'}`}>
                  PRISM 7 TOKENIZED DESK
                </h3>
                <p className={`text-xs font-mono font-extrabold ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                  rTOKEN 7×24 PERPETUALS + QWEN 3.8
                </p>
              </div>
              <span className="p-2 bg-[#00FF66] text-black border-2 border-black font-mono text-xs font-extrabold shadow-[2px_2px_0px_#000]">
                168 HRS / WK (100%)
              </span>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className={`flex items-start gap-3 p-3.5 border-2 border-black shadow-[2px_2px_0px_#000] ${
                isLight ? 'bg-white text-black' : 'bg-[#0C140F] text-gray-200'
              }`}>
                <CheckCircle className="w-5 h-5 text-[#00C853] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block mb-1 uppercase text-[#00C853] dark:text-[#00FF66]">
                    7×24 Continuous Liquidity:
                  </span>
                  Tokenized US stocks trade 24 hours a day, 7 days a week, 365 days a year without market closures.
                </div>
              </div>

              <div className={`flex items-start gap-3 p-3.5 border-2 border-black shadow-[2px_2px_0px_#000] ${
                isLight ? 'bg-white text-black' : 'bg-[#0C140F] text-gray-200'
              }`}>
                <ShieldCheck className="w-5 h-5 text-[#00C853] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block mb-1 uppercase text-[#00C853] dark:text-[#00FF66]">
                    Pre-Gap Frontrunning:
                  </span>
                  ChronoArb prices geopolitical macro events instantly on Sunday and scales out before Monday opening bells.
                </div>
              </div>

              <div className={`flex items-start gap-3 p-3.5 border-2 border-black shadow-[2px_2px_0px_#000] ${
                isLight ? 'bg-white text-black' : 'bg-[#0C140F] text-gray-200'
              }`}>
                <CheckCircle className="w-5 h-5 text-[#00C853] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block mb-1 uppercase text-[#00C853] dark:text-[#00FF66]">
                    Autonomous Neural Agents:
                  </span>
                  Qwen 3.8-Max agents monitor order books, earnings transcripts, and supply chains 24/7 with zero human fatigue.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
