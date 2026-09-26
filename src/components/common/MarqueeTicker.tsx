import React, { useEffect, useState } from 'react';
import { MarketTicker } from '../../types';
import { market } from '../../services/marketService';
import { useTheme } from '../../context/ThemeContext';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';

export const MarqueeTicker: React.FC = () => {
  const { theme } = useTheme();
  const [tickers, setTickers] = useState<MarketTicker[]>(market.getTickers());

  useEffect(() => {
    const unsub = market.subscribe(updated => {
      setTickers([...updated]);
    });
    return unsub;
  }, []);

  const isLight = theme === 'light';
  const displayItems = [...tickers, ...tickers];

  return (
    <div className={`w-full border-y-2 border-black overflow-hidden py-2 select-none transition-colors duration-150 ${
      isLight ? 'bg-[#F4F5F0]' : 'bg-[#080A09]'
    }`}>
      <div className="flex items-center">
        {/* Fixed Label on Left */}
        <div className="flex-shrink-0 bg-[#00FF66] text-black font-mono font-extrabold text-xs px-3 py-1 mr-3 border-r-2 border-black flex items-center gap-1.5 z-10 shadow-[2px_0px_0px_#000]">
          <Zap className="w-3.5 h-3.5 fill-current animate-pulse" />
          <span>7×24 TAPE</span>
        </div>

        {/* Scrolling Tickers */}
        <div className="flex animate-marquee gap-6 items-center text-xs font-mono font-bold tracking-wider">
          {displayItems.map((ticker, idx) => {
            const isPositive = ticker.change24h >= 0;
            return (
              <div
                key={`${ticker.symbol}-${idx}`}
                className={`flex items-center gap-2 px-3 py-1 border-2 border-black transition-transform hover:-translate-y-0.5 cursor-pointer ${
                  isLight
                    ? 'bg-[#FFFFFF] text-black shadow-[2px_2px_0px_#000]'
                    : 'bg-[#141816] text-white shadow-[2px_2px_0px_#000]'
                }`}
              >
                <span className={`font-extrabold ${
                  isLight
                    ? ticker.type === 'tokenized_equity' ? 'text-blue-700' : 'text-amber-700'
                    : ticker.type === 'tokenized_equity' ? 'text-[#00E5FF]' : 'text-[#FFE600]'
                }`}>
                  {ticker.symbol}
                </span>
                <span className="font-mono font-extrabold">
                  ${ticker.price > 100 ? ticker.price.toFixed(2) : ticker.price.toFixed(3)}
                </span>
                <span
                  className={`flex items-center text-[10px] px-1.5 py-0.5 font-bold border border-black ${
                    isPositive
                      ? 'bg-[#00FF66] text-black'
                      : 'bg-[#FF3366] text-white'
                  }`}
                >
                  {isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                  {isPositive ? '+' : ''}
                  {ticker.change24h.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
