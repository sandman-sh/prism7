import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { autopilot, AutopilotState } from '../../services/autopilotService';
import { BrutalistButton } from './BrutalistButton';
import { BrutalistBadge } from './BrutalistBadge';
import { useTheme } from '../../context/ThemeContext';
import { audio } from '../../services/audioService';
import { EngineType } from '../../types';
import { 
  Bot, 
  X, 
  Play, 
  Square, 
  Activity, 
  AlertOctagon, 
  RefreshCw, 
  Sliders
} from 'lucide-react';

interface AutopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AutopilotModal: React.FC<AutopilotModalProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [state, setState] = useState<AutopilotState>(autopilot.getState());
  const [cycleInterval, setCycleInterval] = useState(state.cycleIntervalSeconds);
  const [maxTradeCapital, setMaxTradeCapital] = useState(state.maxCapitalPerTradeUSD);
  const [maxPositions, setMaxPositions] = useState(state.maxConcurrentPositions);
  const [maxDrawdown, setMaxDrawdown] = useState(state.maxDailyDrawdownPct);
  const [enabledEngines, setEnabledEngines] = useState<EngineType[]>(state.enabledEngines);

  useEffect(() => {
    const unsub = autopilot.subscribe(newState => {
      setState(newState);
      setCycleInterval(newState.cycleIntervalSeconds);
      setMaxTradeCapital(newState.maxCapitalPerTradeUSD);
      setMaxPositions(newState.maxConcurrentPositions);
      setMaxDrawdown(newState.maxDailyDrawdownPct);
      setEnabledEngines(newState.enabledEngines);
    });
    return unsub;
  }, []);

  const handleToggleAutopilot = () => {
    autopilot.toggle();
  };

  const handleApplyConfig = () => {
    autopilot.updateConfig({
      cycleIntervalSeconds: cycleInterval,
      maxCapitalPerTradeUSD: maxTradeCapital,
      maxConcurrentPositions: maxPositions,
      maxDailyDrawdownPct: maxDrawdown,
      enabledEngines,
    });
    audio.playSuccess();
  };

  const toggleEngine = (engine: EngineType) => {
    const updated = enabledEngines.includes(engine)
      ? enabledEngines.filter(e => e !== engine)
      : [...enabledEngines, engine];
    setEnabledEngines(updated);
    autopilot.updateConfig({ enabledEngines: updated });
  };

  const handleEmergencyHalt = () => {
    if (window.confirm('WARNING: Liquidate ALL open positions and trigger emergency circuit breaker?')) {
      autopilot.emergencyHaltAndLiquidate();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm font-mono select-none">
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 20 }}
            className={`w-full max-w-4xl max-h-[90vh] flex flex-col border-4 border-black shadow-[10px_10px_0px_#000] p-6 relative ${
              isLight ? 'bg-white text-black' : 'bg-[#141715] text-white'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#00FF66] text-black border-2 border-black shadow-[2px_2px_0px_#000]">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black uppercase tracking-tight">
                      AUTONOMOUS QUANT AUTOPILOT ENGINE
                    </h3>
                    <BrutalistBadge variant={state.isActive ? 'green' : 'yellow'}>
                      {state.isActive ? 'RUNNING (LIVE)' : 'STANDBY'}
                    </BrutalistBadge>
                  </div>
                  <p className={`text-xs ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>
                    Continuous Sub-Second Market Evaluation, Multi-Agent Arbitration & VaR Circuit Breakers
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 bg-[#FF3366] text-white border-2 border-black hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Circuit Breaker Alert Banner if Tripped */}
            {state.circuitBreakerTripped && (
              <div className="mb-4 p-4 border-3 border-black bg-[#FF3366] text-white flex items-center justify-between shadow-[4px_4px_0px_#000]">
                <div className="flex items-center gap-3">
                  <AlertOctagon className="w-7 h-7 text-white animate-bounce shrink-0" />
                  <div>
                    <h4 className="font-black text-sm uppercase">CIRCUIT BREAKER TRIPPED : EXECUTION HARD-STOPPED</h4>
                    <p className="text-xs text-white/90 font-bold">{state.circuitBreakerReason || 'Risk threshold breached.'}</p>
                  </div>
                </div>

                <BrutalistButton
                  variant="white"
                  size="sm"
                  onClick={() => autopilot.resetCircuitBreaker()}
                >
                  RESET CIRCUIT BREAKER
                </BrutalistButton>
              </div>
            )}

            {/* Master Control & Telemetry Bar */}
            <div className={`p-4 border-2 border-black shadow-[3px_3px_0px_#000] mb-4 flex flex-wrap items-center justify-between gap-4 ${
              state.isActive ? (isLight ? 'bg-[#EBFDF3]' : 'bg-[#132219]') : (isLight ? 'bg-[#F4F5F0]' : 'bg-[#0C0E0D]')
            }`}>
              {/* Giant Toggle Button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleAutopilot}
                  className={`flex items-center gap-2 px-6 py-3 border-3 border-black font-black text-sm shadow-[4px_4px_0px_#000] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all ${
                    state.isActive
                      ? 'bg-[#FF3366] text-white hover:bg-rose-600'
                      : 'bg-[#00FF66] text-black hover:bg-[#22ff7a]'
                  }`}
                >
                  {state.isActive ? (
                    <>
                      <Square className="w-4 h-4 fill-current" />
                      <span>DISENGAGE AUTOPILOT</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>ENGAGE AUTONOMOUS AUTOPILOT</span>
                    </>
                  )}
                </button>

                {state.isActive && (
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="w-3 h-3 rounded-full bg-[#00FF66] animate-ping" />
                    <span className="text-[#00FF66] font-black uppercase">
                      CYCLE IN: {state.nextCycleCountdownSeconds}s
                    </span>
                  </div>
                )}
              </div>

              {/* Status Metrics */}
              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="text-right">
                  <span className="text-gray-500 block text-[10px] uppercase">Current Pipeline Stage</span>
                  <span className="font-black text-[#00E5FF]">{state.currentStage.replace(/_/g, ' ')}</span>
                </div>
                <div className="border-l-2 border-black pl-4 text-right">
                  <span className="text-gray-500 block text-[10px] uppercase">Autonomous Trades</span>
                  <span className="font-black text-[#00FF66]">{state.totalAutonomousTrades} FILLS (${state.totalAutonomousVolumeUSD.toLocaleString()})</span>
                </div>
              </div>
            </div>

            {/* Scrollable Center Body: Configuration & Live Audit Trail */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left Col: Autonomous Risk & Engine Configuration */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase">
                    <Sliders className="w-4 h-4 text-[#FFE600]" />
                    <span>AUTONOMOUS RISK PARAMETERS</span>
                  </div>

                  <div className={`p-4 border-2 border-black space-y-3 ${isLight ? 'bg-white' : 'bg-[#111413]'}`}>
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>EVALUATION FREQUENCY:</span>
                        <span className="text-[#00E5FF] font-extrabold">{cycleInterval}s</span>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="60"
                        step="5"
                        value={cycleInterval}
                        onChange={e => setCycleInterval(Number(e.target.value))}
                        className="w-full cursor-pointer accent-[#00E5FF]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>MAX CAPITAL PER FILL:</span>
                        <span className="text-[#00FF66] font-extrabold">${maxTradeCapital.toLocaleString()}</span>
                      </div>
                      <input
                        type="range"
                        min="5000"
                        max="50000"
                        step="5000"
                        value={maxTradeCapital}
                        onChange={e => setMaxTradeCapital(Number(e.target.value))}
                        className="w-full cursor-pointer accent-[#00FF66]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>MAX CONCURRENT POSITIONS:</span>
                        <span className="text-[#FFE600] font-extrabold">{maxPositions}</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="10"
                        step="1"
                        value={maxPositions}
                        onChange={e => setMaxPositions(Number(e.target.value))}
                        className="w-full cursor-pointer accent-[#FFE600]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>VaR CIRCUIT BREAKER STOP-LOSS:</span>
                        <span className="text-[#FF3366] font-extrabold">-{maxDrawdown}% MAX DD</span>
                      </div>
                      <input
                        type="range"
                        min="1.5"
                        max="6.0"
                        step="0.5"
                        value={maxDrawdown}
                        onChange={e => setMaxDrawdown(Number(e.target.value))}
                        className="w-full cursor-pointer accent-[#FF3366]"
                      />
                    </div>

                    <BrutalistButton
                      variant="yellow"
                      size="sm"
                      fullWidth
                      onClick={handleApplyConfig}
                    >
                      APPLY RISK LIMITS
                    </BrutalistButton>
                  </div>

                  {/* Engine Delegation Toggles */}
                  <div className="space-y-2">
                    <span className="text-xs font-extrabold uppercase block">
                      PERMITTED AUTONOMOUS STRATEGIES:
                    </span>
                    {(['cascade', 'silicon', 'dialectic', 'chronoarb'] as EngineType[]).map(eng => {
                      const isEngActive = enabledEngines.includes(eng);
                      const labels: Record<string, string> = {
                        cascade: 'CascadeGuard Liquidity Sweeper',
                        silicon: 'Silicon Symbiosis Stat-Arb',
                        dialectic: 'Dialectic Multi-Agent Debate',
                        chronoarb: 'ChronoArb Macro Gap Hedge',
                      };

                      return (
                        <div
                          key={eng}
                          onClick={() => toggleEngine(eng)}
                          className={`p-2.5 border-2 border-black flex items-center justify-between text-xs font-bold cursor-pointer transition-colors ${
                            isEngActive
                              ? isLight ? 'bg-[#00FF66]/20 border-black' : 'bg-[#00FF66]/15 border-[#00FF66]'
                              : isLight ? 'bg-gray-100 opacity-60' : 'bg-black/30 opacity-60'
                          }`}
                        >
                          <span>{labels[eng]}</span>
                          <input
                            type="checkbox"
                            checked={isEngActive}
                            onChange={() => {}}
                            className="w-4 h-4 cursor-pointer accent-[#00FF66]"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Col: Live Autonomous Audit Trail */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center justify-between text-xs font-extrabold uppercase">
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-[#00E5FF]" />
                      AUTONOMOUS AGENT DECISION STREAM ({state.decisionsHistory.length})
                    </span>
                    <button
                      onClick={() => autopilot.runAutopilotCycle()}
                      disabled={!state.isActive}
                      className="text-[10px] text-[#00FF66] hover:underline flex items-center gap-1 cursor-pointer font-bold disabled:opacity-30"
                    >
                      <RefreshCw className="w-3 h-3" /> Force Scan Now
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {state.decisionsHistory.length === 0 ? (
                      <div className="p-8 border-2 border-black text-center text-xs text-gray-500">
                        Engage Autopilot to start autonomous continuous multi-engine scanning.
                      </div>
                    ) : (
                      state.decisionsHistory.map(dec => {
                        return (
                          <div
                            key={dec.id}
                            className={`p-3 border-2 border-black space-y-1.5 transition-colors ${
                              dec.status === 'EXECUTED'
                                ? isLight ? 'bg-[#D4FCE3]' : 'bg-[#15281C] border-[#00FF66]'
                                : dec.status === 'VETOED'
                                ? isLight ? 'bg-[#FFEBEB]' : 'bg-[#29171A] border-[#FF3366]'
                                : isLight ? 'bg-white' : 'bg-[#111413]'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className={`px-1.5 py-0.5 text-[10px] font-black border border-black ${
                                  dec.status === 'EXECUTED'
                                    ? 'bg-[#00FF66] text-black'
                                    : dec.status === 'VETOED'
                                    ? 'bg-[#FF3366] text-white'
                                    : dec.status === 'CIRCUIT_BLOCKED'
                                    ? 'bg-[#FFE600] text-black'
                                    : 'bg-gray-300 text-black'
                                }`}>
                                  {dec.status}
                                </span>
                                <span className="font-extrabold uppercase text-[11px]">{dec.symbol}</span>
                                <span className="text-[10px] text-gray-500">[{dec.engine.toUpperCase()}]</span>
                              </div>

                              <span className="text-[10px] text-gray-500 font-mono">{dec.timestamp}</span>
                            </div>

                            <p className="text-xs font-bold leading-snug">
                              {dec.reason}
                            </p>

                            {dec.vwapPrice && (
                              <div className="text-[10px] font-mono text-gray-600 dark:text-gray-400 pt-1 border-t border-black/10 flex items-center justify-between">
                                <span>VWAP FILL: ${dec.vwapPrice}</span>
                                <span>SLIPPAGE: {dec.slippageBps} bps</span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions & Emergency Killswitch */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-black pt-4 mt-4">
              <button
                onClick={handleEmergencyHalt}
                className="px-3 py-2 bg-[#FF3366] text-white border-2 border-black font-black text-xs shadow-[2px_2px_0px_#000] hover:bg-rose-700 active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <AlertOctagon className="w-4 h-4" />
                EMERGENCY HALT & LIQUIDATE ALL
              </button>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-gray-500 font-bold">
                  AUTONOMOUS VA-R POLICY: ACTIVE
                </span>
                <BrutalistButton variant="dark" size="sm" onClick={onClose}>
                  CLOSE PANEL
                </BrutalistButton>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
