import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EngineType } from './types';
import { LandingPage } from './components/landing/LandingPage';
import { TradingDesk } from './components/desk/TradingDesk';
import { useTheme } from './context/ThemeContext';
import { ParaCopilot } from './components/common/ParaCopilot';
import { ParaExecutionContext } from './services/paraCopilotService';

export function App() {
  const { theme, toggleTheme } = useTheme();
  // Initial page is explicitly the Homepage (Landing Page)
  const [currentView, setCurrentView] = useState<'landing' | 'desk'>('landing');
  const [targetEngine, setTargetEngine] = useState<EngineType | 'portfolio'>('dialectic');

  const handleLaunchApp = (engine: EngineType | 'portfolio' = 'dialectic') => {
    setTargetEngine(engine);
    setCurrentView('desk');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReturnToHome = () => {
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const executionContext: ParaExecutionContext = {
    currentView,
    activeEngine: targetEngine,
    theme,
    navigateToEngine: (engine: EngineType | 'portfolio') => {
      setTargetEngine(engine);
      setCurrentView('desk');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    navigateToLanding: handleReturnToHome,
    toggleTheme,
  };

  return (
    <div className={`min-h-screen transition-colors duration-150 ${
      theme === 'dark' ? 'bg-[#0A0C0B] text-white' : 'bg-[#FFFFFF] text-black'
    }`}>
      <AnimatePresence mode="wait">
        {currentView === 'landing' ? (
          <motion.div
            key="landing-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <LandingPage onLaunchApp={handleLaunchApp} />
          </motion.div>
        ) : (
          <motion.div
            key="desk-view"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.2 }}
          >
            <TradingDesk
              activeEngine={targetEngine}
              onSelectEngine={setTargetEngine}
              onReturnToHome={handleReturnToHome}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Autonomous AI Copilot PARA */}
      <ParaCopilot executionContext={executionContext} />
    </div>
  );
}

export default App;
