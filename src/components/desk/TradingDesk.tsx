import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EngineType } from '../../types';
import { DeskHeader } from './DeskHeader';
import { MarqueeTicker } from '../common/MarqueeTicker';
import { DialecticDeskView } from './DialecticDeskView';
import { ChronoArbView } from './ChronoArbView';
import { SiliconSymbiosisView } from './SiliconSymbiosisView';
import { ForensicAlphaView } from './ForensicAlphaView';
import { CascadeGuardView } from './CascadeGuardView';
import { PortfolioLedgerView } from './PortfolioLedgerView';
import { SystemStatusModal } from '../common/SystemStatusModal';
import { AutopilotModal } from '../common/AutopilotModal';
import { OrderBookModal } from '../common/OrderBookModal';
import { market } from '../../services/marketService';
import { ledger } from '../../services/paperTradingService';

import { useTheme } from '../../context/ThemeContext';

interface TradingDeskProps {
  activeEngine: EngineType | 'portfolio';
  onSelectEngine: (engine: EngineType | 'portfolio') => void;
  onReturnToHome: () => void;
}

export const TradingDesk: React.FC<TradingDeskProps> = ({
  activeEngine = 'dialectic',
  onSelectEngine,
  onReturnToHome,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isAutopilotModalOpen, setIsAutopilotModalOpen] = useState(false);
  const [isOrderBookModalOpen, setIsOrderBookModalOpen] = useState(false);

  // Sync market ticks with open paper positions and listen for modal open events
  useEffect(() => {
    const unsub = market.subscribe(tickers => {
      const priceMap: Record<string, number> = {};
      tickers.forEach(t => {
        priceMap[t.symbol] = t.price;
      });
      ledger.updatePrices(priceMap);
    });

    const handleOpenAutopilot = () => setIsAutopilotModalOpen(true);
    const handleOpenOrderBook = () => setIsOrderBookModalOpen(true);

    window.addEventListener('open-autopilot-modal', handleOpenAutopilot);
    window.addEventListener('open-orderbook-modal', handleOpenOrderBook);

    return () => {
      unsub();
      window.removeEventListener('open-autopilot-modal', handleOpenAutopilot);
      window.removeEventListener('open-orderbook-modal', handleOpenOrderBook);
    };
  }, []);

  return (
    <div className={`min-h-screen flex flex-col selection:bg-[#00FF66] selection:text-black transition-colors duration-150 ${
      isLight ? 'bg-white text-black' : 'bg-[#0A0C0B] text-white'
    }`}>
      {/* Desk Header */}
      <DeskHeader
        activeEngine={activeEngine}
        onSelectEngine={onSelectEngine}
        onReturnToHome={onReturnToHome}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenAutopilotModal={() => setIsAutopilotModalOpen(true)}
        onOpenOrderBookModal={() => setIsOrderBookModalOpen(true)}
      />

      {/* Live Running Ticker */}
      <MarqueeTicker />

      {/* Main Engine Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeEngine}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
          >
            {activeEngine === 'dialectic' && (
              <DialecticDeskView onNavigateToLedger={() => onSelectEngine('portfolio')} />
            )}
            {activeEngine === 'chronoarb' && <ChronoArbView />}
            {activeEngine === 'silicon' && <SiliconSymbiosisView />}
            {activeEngine === 'forensic' && <ForensicAlphaView />}
            {activeEngine === 'cascade' && <CascadeGuardView />}
            {activeEngine === 'portfolio' && <PortfolioLedgerView />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* PRISM 7 System Core & Security Status Modal */}
      <SystemStatusModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />

      {/* Autonomous Autopilot & VaR Breakers Modal */}
      <AutopilotModal
        isOpen={isAutopilotModalOpen}
        onClose={() => setIsAutopilotModalOpen(false)}
      />

      {/* Real-Time L2 Order Book & VWAP Slippage Radar Modal */}
      <OrderBookModal
        isOpen={isOrderBookModalOpen}
        onClose={() => setIsOrderBookModalOpen(false)}
      />
    </div>
  );
};
