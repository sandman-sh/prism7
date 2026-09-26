import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { market } from '../../services/marketService';
import { bitgetTrading } from '../../services/bitgetTradingService';
import { BrutalistButton } from './BrutalistButton';
import { BrutalistBadge } from './BrutalistBadge';
import { useTheme } from '../../context/ThemeContext';
import { audio } from '../../services/audioService';
import confetti from 'canvas-confetti';
import { 
  X, 
  Layers, 
  Activity, 
  Sliders, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  Zap
} from 'lucide-react';

interface OrderBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSymbol?: string;
}

export const OrderBookModal: React.FC<OrderBookModalProps> = ({
  isOpen,
  onClose,
  initialSymbol = 'BTC/USDT',
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const tickers = market.getTickers();
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol);
  const [, setTick] = useState(0);
  const [orderSizeUSD, setOrderSizeUSD] = useState<number>(25000);
  const [direction, setDirection] = useState<'LONG' | 'SHORT'>('LONG');
  const [isExecuting, setIsExecuting] = useState(false);
  const [fillMessage, setFillMessage] = useState<string | null>(null);
  const [wsStatus, setWsStatus] = useState(() => market.getWsStatus());

  useEffect(() => {
    if (!isOpen) return;

    // Refresh book on market ticks
    const unsubMarket = market.subscribe(() => {
      setTick(t => t + 1);
    });

    const unsubWs = market.subscribeWsStatus(status => {
      setWsStatus(status);
    });

    return () => {
      unsubMarket();
      unsubWs();
    };
  }, [isOpen]);

  const orderBook = market.getOrderBook(selectedSymbol);

  if (!isOpen) return null;

  const currentTicker = market.getTicker(selectedSymbol) || tickers[0];
  const slippage = market.calculateSlippage(selectedSymbol, orderSizeUSD, direction);

  const bids = orderBook?.bids || [];
  const asks = orderBook?.asks || [];
  const maxUSD = Math.max(
    ...bids.map(b => b.totalUSD),
    ...asks.map(a => a.totalUSD),
    1
  );

  const handleExecute = async () => {
    setIsExecuting(true);
    audio.playClick();

    try {
      const res = await bitgetTrading.executeOrder(
        selectedSymbol,
        direction,
        orderSizeUSD,
        'dialectic',
        `L2 Depth Order Book Execution (${slippage.slippageBps} bps slippage)`
      );

      setFillMessage(res.message);
      audio.playSuccess();
      confetti({
        particleCount: 70,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#00FF66', '#00E5FF', '#FFE600', '#000000']
      });

      setTimeout(() => {
        setFillMessage(null);
      }, 5000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs font-mono">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.16 }}
          className={`w-full max-w-4xl border-4 border-black shadow-[8px_8px_0px_#000] overflow-hidden flex flex-col max-h-[92vh] ${
            isLight ? 'bg-white text-black' : 'bg-[#0E1110] text-white'
          }`}
        >
          {/* Modal Header */}
          <div className="p-4 bg-[#00E5FF] text-black border-b-3 border-black flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-black text-[#00E5FF] border border-black shadow-[2px_2px_0px_#000]">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase tracking-tight flex items-center gap-2">
                  L2 REAL-TIME ORDER BOOK & VWAP SLIPPAGE RADAR
                </h3>
                <p className="text-[11px] font-extrabold text-black/80">
                  {currentTicker.type === 'crypto' 
                    ? `Live Bitget Public WebSocket (Channel: books15) • Latency: ${wsStatus.latencyMs}ms`
                    : 'Continuous Synthesized 7×24 Off-Market Institutional Depth'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                audio.playClick();
                onClose();
              }}
              className="p-1.5 bg-white text-black border-2 border-black hover:bg-black hover:text-white transition-colors cursor-pointer shadow-[2px_2px_0px_#000]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Symbol Selector Bar */}
          <div className={`p-3 border-b-2 border-black flex items-center gap-2 overflow-x-auto ${
            isLight ? 'bg-[#F4F5F0]' : 'bg-[#151917]'
          }`}>
            <span className="text-[11px] font-extrabold uppercase shrink-0 text-gray-500">ASSET:</span>
            {tickers.map(t => {
              const active = t.symbol === selectedSymbol;
              return (
                <button
                  key={t.symbol}
                  onClick={() => {
                    audio.playClick();
                    setSelectedSymbol(t.symbol);
                  }}
                  className={`px-2.5 py-1 text-xs font-black border-2 border-black shrink-0 cursor-pointer transition-all ${
                    active
                      ? 'bg-[#00FF66] text-black shadow-[2px_2px_0px_#000] -translate-y-0.5'
                      : isLight
                      ? 'bg-white text-black hover:bg-gray-100 shadow-[1px_1px_0px_#000]'
                      : 'bg-[#1D2320] text-gray-300 hover:text-white shadow-[1px_1px_0px_#000]'
                  }`}
                >
                  {t.symbol}
                  <span className="ml-1.5 text-[10px] font-extrabold opacity-75">
                    ${t.price > 1000 ? t.price.toLocaleString() : t.price}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Main Content: Two Columns (Order Book Ladder + Slippage Calculator) */}
          <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-y-auto divide-y md:divide-y-0 md:divide-x-3 divide-black">
            
            {/* Left 7 Columns: Order Book Ladder */}
            <div className="md:col-span-7 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-black text-[11px] font-black uppercase text-gray-500">
                  <span className="w-1/3">PRICE (USD)</span>
                  <span className="w-1/3 text-right">SIZE (UNITS)</span>
                  <span className="w-1/3 text-right">DEPTH (USD)</span>
                </div>

                {/* Asks (Sells) - Reversed so highest ask is at top */}
                <div className="space-y-1 mb-2">
                  {asks.slice(0, 7).reverse().map((ask, idx) => {
                    const depthPct = Math.min(100, (ask.totalUSD / maxUSD) * 100);
                    return (
                      <div
                        key={`ask-${idx}`}
                        className="relative flex items-center justify-between text-xs py-1 px-2 border border-black/20 font-bold overflow-hidden"
                      >
                        <div
                          className="absolute right-0 top-0 bottom-0 bg-[#FF3366]/20 transition-all duration-200 pointer-events-none"
                          style={{ width: `${depthPct}%` }}
                        />
                        <span className="w-1/3 font-black text-[#FF3366] z-10">
                          ${ask.price.toFixed(ask.price > 100 ? 2 : 4)}
                        </span>
                        <span className="w-1/3 text-right text-gray-400 z-10">
                          {ask.size.toLocaleString()}
                        </span>
                        <span className="w-1/3 text-right font-black z-10">
                          ${ask.totalUSD.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Mid-Market Spread Banner */}
                <div className={`p-2.5 my-2 border-2 border-black flex items-center justify-between text-xs font-black shadow-[2px_2px_0px_#000] ${
                  isLight ? 'bg-[#FFE600] text-black' : 'bg-[#2A2400] text-[#FFE600] border-[#FFE600]'
                }`}>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 animate-pulse" />
                    <span>MID-MARKET SPREAD:</span>
                    <span className="font-extrabold">
                      ${orderBook?.spread.toFixed(4) || '0.00'} ({orderBook?.spreadPct.toFixed(3) || '0'}%)
                    </span>
                  </div>
                  <BrutalistBadge variant={orderBook && orderBook.spreadPct < 0.04 ? 'green' : 'yellow'}>
                    {orderBook && orderBook.spreadPct < 0.04 ? 'TIGHT SPREAD' : 'WIDE SPREAD'}
                  </BrutalistBadge>
                </div>

                {/* Bids (Buys) */}
                <div className="space-y-1 mt-2">
                  {bids.slice(0, 7).map((bid, idx) => {
                    const depthPct = Math.min(100, (bid.totalUSD / maxUSD) * 100);
                    return (
                      <div
                        key={`bid-${idx}`}
                        className="relative flex items-center justify-between text-xs py-1 px-2 border border-black/20 font-bold overflow-hidden"
                      >
                        <div
                          className="absolute right-0 top-0 bottom-0 bg-[#00FF66]/20 transition-all duration-200 pointer-events-none"
                          style={{ width: `${depthPct}%` }}
                        />
                        <span className="w-1/3 font-black text-[#00FF66] z-10">
                          ${bid.price.toFixed(bid.price > 100 ? 2 : 4)}
                        </span>
                        <span className="w-1/3 text-right text-gray-400 z-10">
                          {bid.size.toLocaleString()}
                        </span>
                        <span className="w-1/3 text-right font-black z-10">
                          ${bid.totalUSD.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Depth Summary */}
              <div className="mt-4 pt-3 border-t-2 border-black flex items-center justify-between text-xs font-bold text-gray-400">
                <span>TOTAL BID DEPTH: <strong className="text-white">${orderBook?.totalBidDepthUSD.toLocaleString() || 0}</strong></span>
                <span>TOTAL ASK DEPTH: <strong className="text-white">${orderBook?.totalAskDepthUSD.toLocaleString() || 0}</strong></span>
              </div>
            </div>

            {/* Right 5 Columns: VWAP Slippage Engine & Impact Simulator */}
            <div className={`md:col-span-5 p-4 flex flex-col justify-between ${
              isLight ? 'bg-[#FAFBF8]' : 'bg-[#111513]'
            }`}>
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b-2 border-black">
                  <Sliders className="w-4 h-4 text-[#00FF66]" />
                  <span className="text-xs font-black uppercase">EXECUTION IMPACT SIMULATOR</span>
                </div>

                {/* Direction Toggle */}
                <div>
                  <label className="text-[11px] font-black uppercase text-gray-500 block mb-1.5">
                    ORDER DIRECTION:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        audio.playClick();
                        setDirection('LONG');
                      }}
                      className={`flex items-center justify-center gap-1.5 py-2 border-2 border-black font-black text-xs cursor-pointer shadow-[2px_2px_0px_#000] ${
                        direction === 'LONG'
                          ? 'bg-[#00FF66] text-black'
                          : isLight ? 'bg-white text-gray-700' : 'bg-[#181C1A] text-gray-400'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4" />
                      BUY (LONG)
                    </button>

                    <button
                      onClick={() => {
                        audio.playClick();
                        setDirection('SHORT');
                      }}
                      className={`flex items-center justify-center gap-1.5 py-2 border-2 border-black font-black text-xs cursor-pointer shadow-[2px_2px_0px_#000] ${
                        direction === 'SHORT'
                          ? 'bg-[#FF3366] text-white'
                          : isLight ? 'bg-white text-gray-700' : 'bg-[#181C1A] text-gray-400'
                      }`}
                    >
                      <TrendingDown className="w-4 h-4" />
                      SELL (SHORT)
                    </button>
                  </div>
                </div>

                {/* Order Size Presets & Input */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-black uppercase text-gray-500 mb-1.5">
                    <span>NOTIONAL ORDER SIZE:</span>
                    <span className="text-black dark:text-white font-black">${orderSizeUSD.toLocaleString()}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 mb-2">
                    {[10000, 25000, 50000, 100000].map(sz => (
                      <button
                        key={sz}
                        onClick={() => {
                          audio.playClick();
                          setOrderSizeUSD(sz);
                        }}
                        className={`py-1 text-[11px] font-black border-2 border-black cursor-pointer ${
                          orderSizeUSD === sz
                            ? 'bg-black text-[#00FF66] shadow-[2px_2px_0px_#000]'
                            : isLight ? 'bg-white hover:bg-gray-100' : 'bg-[#1D2320] text-gray-300'
                        }`}
                      >
                        ${sz / 1000}k
                      </button>
                    ))}
                  </div>

                  <input
                    type="range"
                    min={2000}
                    max={250000}
                    step={2000}
                    value={orderSizeUSD}
                    onChange={e => setOrderSizeUSD(Number(e.target.value))}
                    className="w-full accent-[#00FF66] cursor-pointer"
                  />
                </div>

                {/* Quantitative Slippage Telemetry Cards */}
                <div className="p-3 border-2 border-black bg-black text-white space-y-2.5 shadow-[3px_3px_0px_#000]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-bold">BASE MID PRICE:</span>
                    <span className="font-mono font-black">${slippage.basePrice}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-bold">EXPECTED VWAP FILL:</span>
                    <span className="font-mono font-black text-[#00FF66]">${slippage.vwapPrice}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-bold">SLIPPAGE COST:</span>
                    <span className="font-mono font-black text-[#FFE600]">
                      {slippage.slippageBps} bps (${slippage.slippageUSD})
                    </span>
                  </div>

                  <div className="pt-2 border-t border-gray-700 flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-bold">FILL QUALITY:</span>
                    <BrutalistBadge
                      variant={
                        slippage.fillQuality === 'OPTIMAL'
                          ? 'green'
                          : slippage.fillQuality === 'ACCEPTABLE'
                          ? 'yellow'
                          : 'red'
                      }
                    >
                      {slippage.fillQuality}
                    </BrutalistBadge>
                  </div>
                </div>

                {fillMessage && (
                  <div className="p-2.5 border-2 border-black bg-[#00FF66] text-black text-xs font-black flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{fillMessage}</span>
                  </div>
                )}
              </div>

              {/* Execution Action Button */}
              <div className="pt-4 mt-4 border-t-2 border-black">
                <BrutalistButton
                  variant={direction === 'LONG' ? 'green' : 'red'}
                  size="lg"
                  onClick={handleExecute}
                  disabled={isExecuting}
                  className="w-full"
                  icon={<Zap className="w-4 h-4 fill-current" />}
                >
                  {isExecuting
                    ? 'ROUTING ORDER...'
                    : `EXECUTE ${direction} $${orderSizeUSD.toLocaleString()} @ VWAP`}
                </BrutalistButton>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
