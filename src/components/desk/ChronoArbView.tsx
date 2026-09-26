import React, { useState, useEffect } from 'react';
import { MacroEvent } from '../../types';
import { qwen } from '../../services/qwenService';
import { bitgetTrading } from '../../services/bitgetTradingService';
import { market } from '../../services/marketService';
import { newsService } from '../../services/newsService';
import { audio } from '../../services/audioService';
import { BrutalistButton } from '../common/BrutalistButton';
import { BrutalistBadge } from '../common/BrutalistBadge';
import { useTheme } from '../../context/ThemeContext';
import confetti from 'canvas-confetti';
import { 
  Clock, 
  Globe, 
  Zap, 
  RefreshCw,
  Send,
  Newspaper,
  Radio
} from 'lucide-react';

export const ChronoArbView: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [events, setEvents] = useState<MacroEvent[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [isSyncingNews, setIsSyncingNews] = useState(false);
  const [customHeadline, setCustomHeadline] = useState('');
  const [selectedTicker, setSelectedTicker] = useState('rNVDA');
  const [countdown, setCountdown] = useState({ hours: 42, minutes: 18, seconds: 35 });

  const handleSyncLiveNews = async () => {
    setIsSyncingNews(true);
    audio.playPing();
    try {
      const liveEvents = await newsService.fetchLiveMacroEvents();
      if (liveEvents.length > 0) {
        setEvents(prev => {
          const existingHeadlines = new Set(prev.map(e => e.headline.toLowerCase().trim()));
          const newUnique = liveEvents.filter(e => !existingHeadlines.has(e.headline.toLowerCase().trim()));
          return [...newUnique, ...prev];
        });
        audio.playSuccess();
      }
    } catch (e) {
      console.error('Failed to sync live news wire:', e);
    } finally {
      setIsSyncingNews(false);
    }
  };

  // Auto-sync live breaking news wire on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSyncLiveNews();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Countdown timer to Monday 9:30 AM EST
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleExecuteHedge = async (event: MacroEvent) => {
    const tickerObj = market.getTicker(event.affectedTickers[0]) || market.getTickers()[0];
    const direction = event.hedgingAction === 'SHORT_RTOKEN' || (event.hedgingAction !== 'LONG_RTOKEN' && event.impliedGapPercent < 0)
      ? 'SHORT' 
      : 'LONG';

    await bitgetTrading.executeOrder(
      tickerObj.symbol,
      direction,
      35000,
      'chronoarb',
      `ChronoArb 7x24: Frontrunning ${event.impliedGapPercent > 0 ? '+' : ''}${event.impliedGapPercent}% Monday gap on ${event.affectedTickers.join(', ')}`
    );

    setEvents(prev =>
      prev.map(e => (e.id === event.id ? { ...e, executedStatus: 'POSITION_OPEN' } : e))
    );

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#00FF66', '#00E5FF', '#000000']
    });
  };

  const handleAnalyzeCustom = async () => {
    if (!customHeadline.trim()) return;
    setAnalyzing(true);
    audio.playPing();

    try {
      const res = await qwen.analyzeMacroEvent(customHeadline, [selectedTicker]);
      const newEvent: MacroEvent = {
        id: 'macro-custom-' + Date.now(),
        headline: customHeadline,
        source: 'User Telemetry Ingest',
        timestamp: 'Live Feed',
        category: 'GEOPOLITICAL',
        affectedTickers: [selectedTicker],
        impliedGapPercent: res.impliedGap,
        urgency: Math.abs(res.impliedGap) > 2.5 ? 'CRITICAL' : 'HIGH',
        hedgingAction: res.recommendation as any,
        executedStatus: 'PENDING',
        analysis: res.reasoning,
      };

      setEvents(prev => [newEvent, ...prev]);
      setCustomHeadline('');
      audio.playSuccess();
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner & Countdown Clock */}
      <div className={`p-5 border-3 border-black shadow-[4px_4px_0px_#000] flex flex-wrap items-center justify-between gap-4 transition-colors duration-150 ${
        isLight ? 'bg-white text-black' : 'bg-[#141715] text-white'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#00FF66] text-black border-2 border-black shadow-[2px_2px_0px_#000]">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className={`text-xl font-extrabold uppercase tracking-tight ${isLight ? 'text-black' : 'text-white'}`}>
              CHRONOARB 7×24 : MONDAY OPEN GAP FRONTRUNNER
            </h2>
            <p className={`text-xs ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>
              Pricing Weekend Macro News Wire into 7×24 Tokenized Equity Perps
            </p>
          </div>
        </div>

        {/* TradFi Open Countdown Timer */}
        <div className="flex items-center gap-3">
          <div className={`border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_#000] flex items-center gap-2 ${
            isLight ? 'bg-[#FFE600] text-black' : 'bg-[#FFE600] text-black'
          }`}>
            <Globe className="w-4 h-4" />
            <div className="text-xs">
              <span className="font-bold uppercase text-[10px] block">TRADFI CASH OPEN IN:</span>
              <span className="font-black text-sm tracking-widest">
                {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>

          <BrutalistButton
            variant="cyan"
            size="sm"
            onClick={handleSyncLiveNews}
            disabled={isSyncingNews}
            icon={<RefreshCw className={`w-4 h-4 ${isSyncingNews ? 'animate-spin' : ''}`} />}
          >
            {isSyncingNews ? 'SYNCING WIRE...' : 'SYNC LIVE NEWS WIRE'}
          </BrutalistButton>
        </div>
      </div>

      {/* Custom Macro Event Injection Panel */}
      <div className={`p-4 border-2 border-black shadow-[3px_3px_0px_#000] ${
        isLight ? 'bg-white' : 'bg-[#141715]'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <Radio className="w-4 h-4 text-[#00FF66] animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider">
            INJECT LIVE BREAKING WIRE HEADLINE TO EVALUATE CASH OPEN GAP
          </span>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-2">
          <select
            value={selectedTicker}
            onChange={e => setSelectedTicker(e.target.value)}
            className={`px-3 py-2 border-2 border-black text-xs font-bold outline-none cursor-pointer ${
              isLight ? 'bg-[#F4F5F0] text-black' : 'bg-[#0C0E0D] text-white'
            }`}
          >
            {market.getTickers().map(t => (
              <option key={t.symbol} value={t.symbol} className={isLight ? 'bg-white text-black' : 'bg-[#141715] text-white'}>
                {t.symbol} ({t.name})
              </option>
            ))}
          </select>

          <input
            type="text"
            value={customHeadline}
            onChange={e => setCustomHeadline(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAnalyzeCustom()}
            placeholder="e.g. White House announces surprise emergency tariff on foreign semiconductor substrates..."
            className={`flex-1 p-2 border-2 border-black text-xs font-bold outline-none ${
              isLight ? 'bg-[#F4F5F0] text-black' : 'bg-[#0C0E0D] text-white'
            }`}
          />

          <BrutalistButton
            variant="yellow"
            size="sm"
            onClick={handleAnalyzeCustom}
            disabled={analyzing || !customHeadline.trim()}
            icon={analyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          >
            {analyzing ? 'AUDITING...' : 'AI EVALUATE GAP'}
          </BrutalistButton>
        </div>
      </div>

      {/* Macro Wire Event Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className={`uppercase font-extrabold flex items-center gap-1.5 ${isLight ? 'text-black' : 'text-white'}`}>
            <Newspaper className="w-4 h-4 text-[#00E5FF]" />
            LIVE BREAKING WIRE SIGNALS ({events.length} TELEMETRY FEEDS)
          </span>
          <span className={isLight ? 'text-gray-600' : 'text-gray-400'}>
            REAL-TIME INGESTION VIA FINANCIAL WIRE PROXY
          </span>
        </div>

        {events.map(ev => {
          const isNegative = ev.impliedGapPercent < 0;

          return (
            <div
              key={ev.id}
              className={`p-4 border-3 border-black shadow-[4px_4px_0px_#000] space-y-3 transition-colors ${
                isLight ? 'bg-white hover:bg-gray-50' : 'bg-[#141715] hover:bg-[#1a1f1c]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black pb-2">
                <div className="flex items-center gap-2">
                  <BrutalistBadge variant={ev.urgency === 'CRITICAL' ? 'red' : 'yellow'}>
                    {ev.urgency} URGENCY
                  </BrutalistBadge>
                  <span className="text-xs font-extrabold text-[#00E5FF]">[{ev.category}]</span>
                  <span className="text-xs font-bold text-gray-500">{ev.source}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold">TIME: {ev.timestamp}</span>
                  <span className={`text-sm font-black px-2 py-0.5 border border-black ${
                    isNegative ? 'bg-[#FF3366] text-white' : 'bg-[#00FF66] text-black'
                  }`}>
                    IMPLIED GAP: {isNegative ? '' : '+'}{ev.impliedGapPercent}%
                  </span>
                </div>
              </div>

              <h3 className="text-sm font-black leading-snug">
                {ev.headline}
              </h3>

              <div className={`p-2.5 border-2 border-black text-xs font-bold ${
                isLight ? 'bg-[#F4F5F0]' : 'bg-[#0C0E0D]'
              }`}>
                <span className="text-[#00FF66] font-black">7×24 DELTA ANALYSIS:</span> {ev.analysis}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-black/20">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="text-gray-500">AFFECTED ASSETS:</span>
                  {ev.affectedTickers.map(sym => (
                    <span key={sym} className="px-1.5 py-0.5 border border-black bg-black/10 dark:bg-white/10 text-xs font-black">
                      {sym}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black px-2 py-1 border border-black ${
                    ev.hedgingAction === 'LONG_RTOKEN' ? 'bg-[#00FF66] text-black' : 'bg-[#FF3366] text-white'
                  }`}>
                    {ev.hedgingAction.replace(/_/g, ' ')}
                  </span>

                  <BrutalistButton
                    variant={ev.executedStatus === 'POSITION_OPEN' ? 'cyan' : 'green'}
                    size="sm"
                    disabled={ev.executedStatus === 'POSITION_OPEN'}
                    onClick={() => handleExecuteHedge(ev)}
                    icon={<Zap className="w-3.5 h-3.5 fill-current" />}
                  >
                    {ev.executedStatus === 'POSITION_OPEN' ? 'HEDGE POSITION ACTIVE' : 'FRONTRUN MONDAY GAP'}
                  </BrutalistButton>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
