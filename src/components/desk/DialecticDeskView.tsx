import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DialecticMessage, DialecticProposal } from '../../types';
import { qwen } from '../../services/qwenService';
import { market } from '../../services/marketService';
import { bitgetTrading } from '../../services/bitgetTradingService';
import { audio } from '../../services/audioService';
import { BrutalistButton } from '../common/BrutalistButton';
import { BrutalistBadge } from '../common/BrutalistBadge';
import { useTheme } from '../../context/ThemeContext';
import confetti from 'canvas-confetti';
import { 
  ShieldAlert, 
  ShieldX, 
  Zap, 
  RefreshCw, 
  CheckCircle, 
  Terminal,
  Cpu
} from 'lucide-react';

interface DialecticDeskViewProps {
  onNavigateToLedger?: () => void;
}

export const DialecticDeskView: React.FC<DialecticDeskViewProps> = ({ onNavigateToLedger }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const tickers = market.getTickers();
  const [selectedSymbol, setSelectedSymbol] = useState('rNVDA');
  const [isDebating, setIsDebating] = useState(false);
  const [proposal, setProposal] = useState<DialecticProposal | null>(null);
  const [messages, setMessages] = useState<DialecticMessage[]>([]);
  const [executionSuccess, setExecutionSuccess] = useState(false);
  const [executionMessage, setExecutionMessage] = useState('');

  const activeTicker = tickers.find(t => t.symbol === selectedSymbol) || tickers[0];

  const handleRunDebate = async () => {
    setIsDebating(true);
    setExecutionSuccess(false);
    audio.playPing();

    try {
      const context = `24h Change: ${activeTicker.change24h}%, 24h Vol: ${activeTicker.volume24h}, Order Book Depth: $${activeTicker.orderBookDepthUSD.toLocaleString()}, Market Status: TradFi Closed / 7x24 Tokenized Active.`;
      const result = await qwen.runDialecticDebate(activeTicker.symbol, activeTicker.price, context);
      setMessages(result.messages);
      setProposal(result.proposal);

      if (result.proposal.decisionStatus === 'VETOED') {
        audio.playAlert();
      } else {
        audio.playPing();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDebating(false);
    }
  };

  const handleExecuteTrade = async () => {
    if (!proposal || proposal.decisionStatus === 'VETOED') return;

    const finalSize = proposal.adjustedSizeUSD || proposal.recommendedSizeUSD;
    const res = await bitgetTrading.executeOrder(
      proposal.symbol,
      proposal.direction,
      finalSize,
      'dialectic',
      `Dialectic consensus: ${proposal.alphaRationale.slice(0, 120)}`
    );

    setExecutionMessage(res.message);
    setExecutionSuccess(true);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#00FF66', '#FFE600', '#00E5FF', '#000000']
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Asset Picker */}
      <div className={`p-4 border-3 border-black shadow-[4px_4px_0px_#000] flex flex-wrap items-center justify-between gap-4 font-mono transition-colors duration-150 ${
        isLight ? 'bg-white text-black' : 'bg-[#141715] text-white'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#00FF66] text-black border-2 border-black shadow-[2px_2px_0px_#000]">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className={`text-xl font-extrabold uppercase tracking-tight ${isLight ? 'text-black' : 'text-white'}`}>
              DIALECTIC ADVERSARIAL DESK
            </h2>
            <p className={`text-xs ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>
              Agent Alpha (Hunter) vs. Agent Omega (Chief Risk Comptroller) • Real-Time Consensus
            </p>
          </div>
        </div>

        {/* Asset Selector & Trigger */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_#000] ${
            isLight ? 'bg-[#F4F5F0]' : 'bg-[#0C0E0D]'
          }`}>
            <span className={`text-xs font-bold ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>ASSET:</span>
            <select
              value={selectedSymbol}
              onChange={e => {
                audio.playClick();
                setSelectedSymbol(e.target.value);
              }}
              className={`bg-transparent font-extrabold text-sm outline-none cursor-pointer ${
                isLight ? 'text-black' : 'text-white'
              }`}
            >
              {tickers.map(t => (
                <option key={t.symbol} value={t.symbol} className={isLight ? 'bg-white text-black' : 'bg-[#141715] text-white'}>
                  {t.symbol} (${t.price > 100 ? t.price.toFixed(2) : t.price.toFixed(3)})
                </option>
              ))}
            </select>
          </div>

          <BrutalistButton
            variant="green"
            onClick={handleRunDebate}
            disabled={isDebating}
            icon={isDebating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          >
            {isDebating ? 'AGENTS DEBATING...' : 'TRIGGER ADVERSARIAL DEBATE'}
          </BrutalistButton>
        </div>
      </div>

      {/* Main Dual-Agent Debate Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Agent: Alpha Hunter */}
        <div className={`lg:col-span-6 border-3 border-black shadow-[6px_6px_0px_#000] p-5 flex flex-col justify-between ${
          isLight ? 'bg-[#F0FFF4] text-black' : 'bg-[#121513] text-white'
        }`}>
          <div>
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-[#00FF66] text-black border-2 border-black font-extrabold flex items-center justify-center text-sm shadow-[2px_2px_0px_#000]">
                  α
                </div>
                <div>
                  <h3 className="font-extrabold text-base uppercase">AGENT ALPHA (THE HUNTER)</h3>
                  <p className="text-[11px] font-mono text-[#009933] dark:text-[#00FF66] font-bold">Alpha Discovery & Asymmetric Delta</p>
                </div>
              </div>
              <BrutalistBadge variant="green">
                ROLE: OPPORTUNIST
              </BrutalistBadge>
            </div>

            {/* Content / Proposal */}
            <div className={`border-2 border-black p-4 font-mono text-xs space-y-3 min-h-[180px] shadow-[2px_2px_0px_#000] ${
              isLight ? 'bg-white text-black' : 'bg-[#0A0C0B] text-white'
            }`}>
              {messages.find(m => m.speaker === 'alpha_hunter') ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#009933] dark:text-[#00FF66]">
                    <span>ARGUMENT • CONVICTION: 89%</span>
                    <span>{messages.find(m => m.speaker === 'alpha_hunter')?.timestamp}</span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    {messages.find(m => m.speaker === 'alpha_hunter')?.text}
                  </p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 py-8 text-center">
                  <Terminal className="w-8 h-8 mb-2 text-gray-500 animate-pulse" />
                  <span>Standing by. Click "TRIGGER ADVERSARIAL DEBATE" to run Alpha Hunter scan on {selectedSymbol}.</span>
                </div>
              )}
            </div>
          </div>

          {/* Hunter Trade Specs */}
          {proposal && (
            <div className="mt-4 pt-3 border-t-2 border-black grid grid-cols-3 gap-2 font-mono text-xs">
              <div className={`p-2 border border-black ${isLight ? 'bg-white' : 'bg-[#161B18]'}`}>
                <div className="text-[10px] text-gray-500 font-bold">DIRECTION</div>
                <div className={`font-extrabold text-sm ${proposal.direction === 'LONG' ? 'text-[#009933] dark:text-[#00FF66]' : 'text-[#FF3366]'}`}>
                  {proposal.direction}
                </div>
              </div>
              <div className={`p-2 border border-black ${isLight ? 'bg-white' : 'bg-[#161B18]'}`}>
                <div className="text-[10px] text-gray-500 font-bold">TARGET PROFIT</div>
                <div className="font-extrabold text-sm">${proposal.takeProfit}</div>
              </div>
              <div className={`p-2 border border-black ${isLight ? 'bg-white' : 'bg-[#161B18]'}`}>
                <div className="text-[10px] text-gray-500 font-bold">STOP LOSS</div>
                <div className="font-extrabold text-sm text-[#FF3366]">${proposal.stopLoss}</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Agent: Chief Risk Comptroller */}
        <div className={`lg:col-span-6 border-3 border-black shadow-[6px_6px_0px_#000] p-5 flex flex-col justify-between ${
          isLight ? 'bg-[#FFF5F5] text-black' : 'bg-[#161314] text-white'
        }`}>
          <div>
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-[#FF3366] text-white border-2 border-black font-extrabold flex items-center justify-center text-sm shadow-[2px_2px_0px_#000]">
                  Ω
                </div>
                <div>
                  <h3 className="font-extrabold text-base uppercase">AGENT OMEGA (RISK COMPTROLLER)</h3>
                  <p className="text-[11px] font-mono text-[#D90429] dark:text-[#FF3366] font-bold">Capital Preservation & VaR Stress Gate</p>
                </div>
              </div>
              <BrutalistBadge variant="red">
                ROLE: ADVERSARY
              </BrutalistBadge>
            </div>

            {/* Content / Critique */}
            <div className={`border-2 border-black p-4 font-mono text-xs space-y-3 min-h-[180px] shadow-[2px_2px_0px_#000] ${
              isLight ? 'bg-white text-black' : 'bg-[#0A0C0B] text-white'
            }`}>
              {messages.find(m => m.speaker === 'risk_comptroller') ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#D90429] dark:text-[#FF3366]">
                    <span>AUDIT VERDICT • STRESS TEST</span>
                    <span>{messages.find(m => m.speaker === 'risk_comptroller')?.timestamp}</span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    {messages.find(m => m.speaker === 'risk_comptroller')?.text}
                  </p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 py-8 text-center">
                  <ShieldX className="w-8 h-8 mb-2 text-gray-500" />
                  <span>Awaiting Alpha proposal to interrogate and stress-test tail-risk parameters.</span>
                </div>
              )}
            </div>
          </div>

          {/* Risk Specs */}
          {proposal && (
            <div className="mt-4 pt-3 border-t-2 border-black grid grid-cols-3 gap-2 font-mono text-xs">
              <div className={`p-2 border border-black ${isLight ? 'bg-white' : 'bg-[#1B1617]'}`}>
                <div className="text-[10px] text-gray-500 font-bold">TAIL RISK</div>
                <div className="font-extrabold text-sm text-[#FF9900]">{proposal.tailRiskPct}%</div>
              </div>
              <div className={`p-2 border border-black ${isLight ? 'bg-white' : 'bg-[#1B1617]'}`}>
                <div className="text-[10px] text-gray-500 font-bold">EST. SHARPE</div>
                <div className="font-extrabold text-sm text-[#009933] dark:text-[#00FF66]">{proposal.expectedSharpe}</div>
              </div>
              <div className={`p-2 border border-black ${isLight ? 'bg-white' : 'bg-[#1B1617]'}`}>
                <div className="text-[10px] text-gray-500 font-bold">SIZING HAIRCUT</div>
                <div className="font-extrabold text-sm">
                  {proposal.decisionStatus === 'DOWNSIZED' ? '-50%' : proposal.decisionStatus === 'VETOED' ? '-100%' : '0%'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Synthesis Arbiter Consensus Box */}
      {proposal && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-5 border-4 border-black shadow-[6px_6px_0px_#000] font-mono space-y-4 ${
            isLight ? 'bg-[#FFFBEB] text-black' : 'bg-[#141715] text-white'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_#000]">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-extrabold">SYNTHESIS ARBITER RULING:</h4>
                  <span
                    className={`px-2 py-0.5 border-2 border-black font-extrabold text-xs shadow-[2px_2px_0px_#000] ${
                      proposal.decisionStatus === 'APPROVED'
                        ? 'bg-[#00FF66] text-black'
                        : proposal.decisionStatus === 'DOWNSIZED'
                        ? 'bg-[#FFE600] text-black'
                        : 'bg-[#FF3366] text-white'
                    }`}
                  >
                    {proposal.decisionStatus}
                  </span>
                </div>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>
                  {messages.find(m => m.speaker === 'arbiter_system')?.text}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              {proposal.decisionStatus !== 'VETOED' && (
                <BrutalistButton
                  variant="green"
                  size="md"
                  onClick={handleExecuteTrade}
                  disabled={executionSuccess}
                  icon={<CheckCircle className="w-4 h-4" />}
                >
                  {executionSuccess ? 'ORDER DISPATCHED TO LEDGER' : `EXECUTE $${(proposal.adjustedSizeUSD || proposal.recommendedSizeUSD).toLocaleString()} POSITION`}
                </BrutalistButton>
              )}

              {proposal.decisionStatus === 'VETOED' && (
                <div className="flex items-center gap-2 p-2 bg-[#FF3366] text-white border-2 border-black text-xs font-extrabold shadow-[2px_2px_0px_#000]">
                  <ShieldX className="w-4 h-4" />
                  ORDER HARD-BLOCKED BY CHIEF RISK COMPTROLLER
                </div>
              )}
            </div>
          </div>

          {executionSuccess && (
            <div className="p-3 bg-[#00FF66] text-black border-2 border-black font-extrabold text-xs flex items-center justify-between shadow-[2px_2px_0px_#000]">
              <span>✓ {executionMessage || `Order filled at $${proposal.entryPrice}. Active trailing stop engaged.`}</span>
              <span 
                className="underline cursor-pointer hover:text-black/80 font-black" 
                onClick={() => {
                  if (onNavigateToLedger) {
                    onNavigateToLedger();
                  } else {
                    window.location.hash = '#ledger-preview';
                  }
                }}
              >
                View in Ledger →
              </span>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
