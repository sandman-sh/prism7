import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SupplyChainPair } from '../../types';
import { qwen } from '../../services/qwenService';
import { bitgetTrading } from '../../services/bitgetTradingService';
import { market } from '../../services/marketService';
import { statArb } from '../../services/statArbService';
import { audio } from '../../services/audioService';
import { BrutalistButton } from '../common/BrutalistButton';
import { BrutalistBadge } from '../common/BrutalistBadge';
import { FinancialChart } from '../common/FinancialChart';
import { useTheme } from '../../context/ThemeContext';
import confetti from 'canvas-confetti';
import { 
  Cpu, 
  GitCompare, 
  RefreshCw, 
  Zap,
  Activity
} from 'lucide-react';

const INITIAL_PAIRS: SupplyChainPair[] = [
  {
    id: 'pair-1',
    techStock: 'rNVDA',
    cryptoAsset: 'RENDER',
    segment: 'GPU_COMPUTE',
    correlation30d: 0.86,
    spreadZScore: 2.84,
    narrativeLagMinutes: 48,
    signalDirection: 'LONG_CRYPTO_SHORT_EQUITY',
    catalyst: 'TSMC high-density wafer allocation beat guidance; decentralized GPU compute token pricing lagging by 48 mins.',
    pnlYieldExpectedPct: 5.4,
    status: 'ACTIVE'
  },
  {
    id: 'pair-2',
    techStock: 'rMSFT',
    cryptoAsset: 'TAO',
    segment: 'AI_AGENT_PLATFORM',
    correlation30d: 0.79,
    spreadZScore: -2.15,
    narrativeLagMinutes: 32,
    signalDirection: 'LONG_EQUITY_SHORT_CRYPTO',
    catalyst: 'Hyperscaler cloud agent enterprise adoption announcements outpaced subnet decentralized registration growth.',
    pnlYieldExpectedPct: 4.2,
    status: 'ACTIVE'
  },
  {
    id: 'pair-3',
    techStock: 'rCOIN',
    cryptoAsset: 'FET',
    segment: 'AI_DATA_STORAGE',
    correlation30d: 0.72,
    spreadZScore: 1.95,
    narrativeLagMinutes: 65,
    signalDirection: 'LONG_CRYPTO_SHORT_EQUITY',
    catalyst: 'AI autonomous transaction protocol integrations surged; tokenized exchange proxy overbought relative to native utility.',
    pnlYieldExpectedPct: 3.8,
    status: 'ACTIVE'
  }
];

export const SiliconSymbiosisView: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [pairs, setPairs] = useState<SupplyChainPair[]>(() => {
    const cached = statArb.getCachedPairs();
    return cached.length > 0 ? cached : INITIAL_PAIRS;
  });
  const [selectedPair, setSelectedPair] = useState<SupplyChainPair>(pairs[0]);
  const [analyzing, setAnalyzing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [aiVerdict, setAiVerdict] = useState<string | null>(null);

  const chartData = useMemo(() => {
    return statArb.getPairChartData(selectedPair.id);
  }, [selectedPair.id]);

  const handleRecalculate = useCallback(async () => {
    setIsSyncing(true);
    audio.playPing();
    try {
      const livePairs = await statArb.calculateAllPairs();
      if (livePairs.length > 0) {
        setPairs(livePairs);
        setSelectedPair(prev => livePairs.find(p => p.id === prev.id) || livePairs[0]);
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (e) {
      console.error('Co-integration sync error:', e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    const unsub = statArb.subscribe(updatedPairs => {
      if (updatedPairs.length > 0) {
        setPairs(updatedPairs);
        setSelectedPair(prev => updatedPairs.find(p => p.id === prev.id) || updatedPairs[0]);
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    });

    // Auto-calculate on initial mount
    const timer = setTimeout(() => {
      handleRecalculate();
    }, 100);

    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, [handleRecalculate]);

  const handleRunAiAnalysis = async (pair: SupplyChainPair) => {
    setAnalyzing(true);
    setAiVerdict(null);
    audio.playPing();

    try {
      const res = await qwen.analyzeSupplyChainDivergence(pair.techStock, pair.cryptoAsset, pair.spreadZScore);
      setAiVerdict(res.reasoning);
      audio.playSuccess();
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExecuteArbitrage = async (pair: SupplyChainPair) => {
    const stockTicker = market.getTicker(pair.techStock) || 
      market.getTickers().find(t => t.type === 'tokenized_equity') || 
      market.getTickers()[0];
    const cryptoTicker = market.getTicker(pair.cryptoAsset) || 
      market.getTickers().find(t => t.type === 'crypto') || 
      market.getTickers()[0];

    const isLongCrypto = pair.signalDirection === 'LONG_CRYPTO_SHORT_EQUITY';

    // Leg 1: Crypto Order via bitgetTrading
    await bitgetTrading.executeOrder(
      cryptoTicker.symbol,
      isLongCrypto ? 'LONG' : 'SHORT',
      25000,
      'silicon',
      `Silicon Symbiosis Leg 1: ${pair.cryptoAsset} against ${pair.techStock} (Z=${pair.spreadZScore}σ)`
    );

    // Leg 2: Tokenized Stock Order via bitgetTrading
    await bitgetTrading.executeOrder(
      stockTicker.symbol,
      isLongCrypto ? 'SHORT' : 'LONG',
      25000,
      'silicon',
      `Silicon Symbiosis Leg 2: ${pair.techStock} hedge against ${pair.cryptoAsset}`
    );

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FFE600', '#00FF66', '#000000']
    });
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner */}
      <div className={`p-5 border-3 border-black shadow-[4px_4px_0px_#000] flex flex-wrap items-center justify-between gap-4 transition-colors duration-150 ${
        isLight ? 'bg-white text-black' : 'bg-[#141715] text-white'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_#000]">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className={`text-xl font-extrabold uppercase tracking-tight ${isLight ? 'text-black' : 'text-white'}`}>
              SILICON SYMBIOSIS : CROSS-ASSET AI ARBITRAGE
            </h2>
            <p className={`text-xs ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>
              Hardware-to-Token Narrative Contagion & 30-Day Real Co-Integration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRecalculate}
            disabled={isSyncing}
            className="px-3 py-1.5 border-2 border-black font-extrabold text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_#000] cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 bg-[#FFE600] text-black hover:bg-[#FFF066]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'CALCULATING 30D...' : 'RECALCULATE 30D STATS'}
          </button>
          <BrutalistBadge variant="yellow">
            PAIRED DELTA NEUTRAL
          </BrutalistBadge>
          {lastSyncTime && (
            <span className={`text-[10px] font-bold ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              SYNC: {lastSyncTime}
            </span>
          )}
        </div>
      </div>

      {/* Interactive Financial Chart Section */}
      <FinancialChart
        title={`${selectedPair.techStock} vs. ${selectedPair.cryptoAsset} Co-Integration Spread`}
        subtitle={`30-Day Pearson Correlation r = ${selectedPair.correlation30d} • Current Spread Z-Score: ${selectedPair.spreadZScore > 0 ? '+' : ''}${selectedPair.spreadZScore}σ`}
        symbol={`${selectedPair.techStock} / ${selectedPair.cryptoAsset}`}
        data={chartData}
        showSpreadMode={true}
        spreadThreshold={2.0}
        height={260}
      />

      {/* Main Grid: Pair List & Detailed Analyzer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Co-integration Pairs */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className={`font-extrabold uppercase ${isLight ? 'text-black' : 'text-white'}`}>
              MONITORED SUPPLY CHAIN PAIRS (LIVE KLINE & CHART FEED)
            </span>
            <span className={isLight ? 'text-gray-600' : 'text-gray-400'}>
              SHOWING {pairs.length} ACTIVE PAIRS
            </span>
          </div>

          <div className="space-y-3">
            {pairs.map(pair => {
              const isSelected = selectedPair.id === pair.id;
              const isExtremeZ = Math.abs(pair.spreadZScore) >= 2.0;

              return (
                <div
                  key={pair.id}
                  onClick={() => {
                    audio.playClick();
                    setSelectedPair(pair);
                    setAiVerdict(null);
                  }}
                  className={`p-4 border-3 border-black cursor-pointer transition-all ${
                    isSelected
                      ? isLight
                        ? 'bg-[#FFFDE6] shadow-[5px_5px_0px_#000] -translate-x-0.5 -translate-y-0.5'
                        : 'bg-[#18201B] shadow-[5px_5px_0px_#FFE600] -translate-x-0.5 -translate-y-0.5'
                      : isLight
                      ? 'bg-white shadow-[3px_3px_0px_#000] hover:bg-[#F8F9F6]'
                      : 'bg-[#121513] shadow-[3px_3px_0px_#000] hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-black pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-extrabold ${isLight ? 'text-black' : 'text-white'}`}>{pair.techStock}</span>
                      <GitCompare className="w-4 h-4 text-black" />
                      <span className="text-sm font-extrabold text-[#00E5FF]">{pair.cryptoAsset}</span>
                      <span className="text-[10px] text-gray-500">[{pair.segment}]</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500">30d r: {pair.correlation30d}</span>
                      <BrutalistBadge variant={isExtremeZ ? 'red' : 'yellow'}>
                        {pair.spreadZScore > 0 ? '+' : ''}{pair.spreadZScore}σ
                      </BrutalistBadge>
                    </div>
                  </div>

                  <p className={`text-xs font-bold leading-relaxed mb-3 ${isLight ? 'text-gray-800' : 'text-gray-300'}`}>
                    {pair.catalyst}
                  </p>

                  <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-black/20">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">LAG: <span className={isLight ? 'text-black font-extrabold' : 'text-white font-extrabold'}>{pair.narrativeLagMinutes}m</span></span>
                      <span className="text-gray-500">EXPECTED ALPHA: <span className="text-[#00FF66] font-extrabold">+{pair.pnlYieldExpectedPct}%</span></span>
                    </div>

                    <span className={`text-[11px] font-black px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000] ${
                      pair.signalDirection === 'LONG_CRYPTO_SHORT_EQUITY'
                        ? 'bg-[#00FF66] text-black'
                        : pair.signalDirection === 'LONG_EQUITY_SHORT_CRYPTO'
                        ? 'bg-[#00E5FF] text-black'
                        : 'bg-gray-300 text-black'
                    }`}>
                      {pair.signalDirection.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Pair Deep Dive & Execution */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-bold uppercase tracking-tight">
            SELECTED PAIR EXECUTION & REASONING
          </div>

          <div className={`p-5 border-3 border-black shadow-[4px_4px_0px_#000] space-y-4 ${
            isLight ? 'bg-white' : 'bg-[#141715]'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">PAIR DESIGNATION</span>
              <span className="text-sm font-black">{selectedPair.techStock} / {selectedPair.cryptoAsset}</span>
            </div>

            <div className={`p-3 border-2 border-black space-y-2 text-xs font-bold ${
              isLight ? 'bg-[#F4F5F0]' : 'bg-[#0C0E0D]'
            }`}>
              <div className="flex justify-between">
                <span className="text-gray-500">CO-INTEGRATION Z-SCORE:</span>
                <span className={`font-black ${Math.abs(selectedPair.spreadZScore) >= 2.0 ? 'text-[#FF3366]' : 'text-[#00FF66]'}`}>
                  {selectedPair.spreadZScore > 0 ? '+' : ''}{selectedPair.spreadZScore}σ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">SIGNAL DIRECTION:</span>
                <span className="font-black text-[#00E5FF]">{selectedPair.signalDirection}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">DUAL-LEG NOTIONAL:</span>
                <span>$25,000 / $25,000 ($50,000 Total)</span>
              </div>
            </div>

            {/* Qwen Reasoning Section */}
            {aiVerdict && (
              <div className="p-3 border-2 border-black bg-[#FFE600]/15 text-xs font-bold leading-relaxed">
                <span className="text-[#00FF66] font-black block mb-1">QWEN 3.8-MAX SYNTHESIS:</span>
                "{aiVerdict}"
              </div>
            )}

            <div className="space-y-2.5 pt-2">
              <BrutalistButton
                variant="yellow"
                size="sm"
                fullWidth
                onClick={() => handleRunAiAnalysis(selectedPair)}
                disabled={analyzing}
                icon={analyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
              >
                {analyzing ? 'AI AUDITING SPREAD...' : 'RUN QWEN SPREAD REASONING'}
              </BrutalistButton>

              <BrutalistButton
                variant="green"
                size="md"
                fullWidth
                onClick={() => handleExecuteArbitrage(selectedPair)}
                icon={<Zap className="w-4 h-4 fill-current" />}
              >
                DEPLOY STAT-ARB DUAL-LEG ORDER
              </BrutalistButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
