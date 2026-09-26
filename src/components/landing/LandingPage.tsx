import React, { useState } from 'react';
import { EngineType } from '../../types';
import { Navbar } from '../common/Navbar';
import { MarqueeTicker } from '../common/MarqueeTicker';
import { HeroSection } from './HeroSection';
import { EngineGrid } from './EngineGrid';
import { TradFiVsTokenizedSection } from './TradFiVsTokenizedSection';
import { ArchitectureSection } from './ArchitectureSection';
import { Footer } from './Footer';
import { SystemStatusModal } from '../common/SystemStatusModal';

import { useTheme } from '../../context/ThemeContext';

interface LandingPageProps {
  onLaunchApp: (engine?: EngineType | 'portfolio') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  return (
    <div className={`min-h-screen selection:bg-[#00FF66] selection:text-black transition-colors duration-150 ${
      isLight ? 'bg-white text-black' : 'bg-[#0E1110] text-white'
    }`}>
      {/* Homepage Navbar */}
      <Navbar
        onLaunchApp={(engine = 'dialectic') => onLaunchApp(engine)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      {/* Live 7x24 Ticker */}
      <MarqueeTicker />

      {/* Hero Section */}
      <HeroSection
        onLaunchTerminal={() => onLaunchApp('dialectic')}
      />

      {/* 5 Engines Showcase */}
      <EngineGrid
        onSelectEngine={(engine) => onLaunchApp(engine)}
      />

      {/* TradFi vs 7x24 rToken Dislocation */}
      <TradFiVsTokenizedSection />

      {/* Multi-Agent Architecture */}
      <ArchitectureSection />

      {/* Footer */}
      <Footer
        onLaunchTerminal={() => onLaunchApp('dialectic')}
        onSelectEngine={(engine) => onLaunchApp(engine)}
      />

      {/* PRISM 7 System Core & Security Status Modal */}
      <SystemStatusModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />
    </div>
  );
};
