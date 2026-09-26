// Autonomous Autopilot & Quantitative Execution Loop Service for PRISM 7
// Continuous multi-engine monitoring, automated agent execution, and VaR circuit breakers
import { EngineType } from '../types';
import { market } from './marketService';
import { ledger } from './paperTradingService';
import { bitgetTrading } from './bitgetTradingService';
import { statArb } from './statArbService';
import { qwen } from './qwenService';
import { audio } from './audioService';

export interface AutopilotDecision {
  id: string;
  timestamp: string;
  engine: EngineType;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  sizeUSD: number;
  status: 'EXECUTED' | 'VETOED' | 'SKIPPED' | 'CIRCUIT_BLOCKED';
  reason: string;
  vwapPrice?: number;
  slippageBps?: number;
}

export interface AutopilotConfig {
  isActive: boolean;
  cycleIntervalSeconds: number;
  maxCapitalPerTradeUSD: number;
  maxConcurrentPositions: number;
  maxDailyDrawdownPct: number;
  enabledEngines: EngineType[];
  circuitBreakerTripped: boolean;
  circuitBreakerReason?: string;
}

export interface AutopilotState extends AutopilotConfig {
  currentStage: 'IDLE' | 'HEALTH_CHECK' | 'SCANNING_DISLOCATIONS' | 'EVALUATING_STAT_ARB' | 'DEBATING_ALPHA' | 'COOLDOWN';
  lastCycleTimestamp: number;
  nextCycleCountdownSeconds: number;
  decisionsHistory: AutopilotDecision[];
  totalAutonomousTrades: number;
  totalAutonomousVolumeUSD: number;
}

class AutopilotService {
  private config: AutopilotConfig = {
    isActive: false,
    cycleIntervalSeconds: 25,
    maxCapitalPerTradeUSD: 25000,
    maxConcurrentPositions: 5,
    maxDailyDrawdownPct: 3.5,
    enabledEngines: ['dialectic', 'silicon', 'cascade', 'chronoarb'],
    circuitBreakerTripped: false,
    circuitBreakerReason: '',
  };

  private currentStage: AutopilotState['currentStage'] = 'IDLE';
  private lastCycleTimestamp = 0;
  private nextCycleCountdownSeconds = 25;
  private decisionsHistory: AutopilotDecision[] = [];
  private totalAutonomousTrades = 0;
  private totalAutonomousVolumeUSD = 0;

  private loopIntervalId: number | null = null;
  private countdownIntervalId: number | null = null;
  private isCycleRunning = false;
  private listeners: ((state: AutopilotState) => void)[] = [];

  constructor() {
    this.loadState();
  }

  private saveState() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('prism7_autopilot_config', JSON.stringify(this.config));
      localStorage.setItem('prism7_autopilot_decisions', JSON.stringify(this.decisionsHistory.slice(0, 50)));
    } catch {}
  }

  private loadState() {
    if (typeof window === 'undefined') return;
    try {
      const savedCfg = localStorage.getItem('prism7_autopilot_config') || localStorage.getItem('bitgate_autopilot_config');
      const savedDec = localStorage.getItem('prism7_autopilot_decisions') || localStorage.getItem('bitgate_autopilot_decisions');
      if (savedCfg) {
        const parsed = JSON.parse(savedCfg);
        this.config = { ...this.config, ...parsed, isActive: false }; // Always boot inactive for safety
      }
      if (savedDec) {
        const parsedDec = JSON.parse(savedDec);
        if (Array.isArray(parsedDec)) this.decisionsHistory = parsedDec;
      }
    } catch {}
  }

  public getState(): AutopilotState {
    return {
      ...this.config,
      currentStage: this.currentStage,
      lastCycleTimestamp: this.lastCycleTimestamp,
      nextCycleCountdownSeconds: this.nextCycleCountdownSeconds,
      decisionsHistory: [...this.decisionsHistory],
      totalAutonomousTrades: this.totalAutonomousTrades,
      totalAutonomousVolumeUSD: this.totalAutonomousVolumeUSD,
    };
  }

  public subscribe(listener: (state: AutopilotState) => void): () => void {
    this.listeners.push(listener);
    listener(this.getState());
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach(l => l(state));
  }

  public updateConfig(newConfig: Partial<AutopilotConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.saveState();
    this.notify();
  }

  public start() {
    if (this.config.circuitBreakerTripped) {
      audio.playAlert();
      return;
    }

    this.config.isActive = true;
    this.currentStage = 'HEALTH_CHECK';
    this.nextCycleCountdownSeconds = this.config.cycleIntervalSeconds;
    audio.playSuccess();
    this.saveState();
    this.notify();

    this.startTimers();

    // Trigger initial cycle immediately
    setTimeout(() => {
      this.runAutopilotCycle();
    }, 500);
  }

  public stop() {
    this.config.isActive = false;
    this.currentStage = 'IDLE';
    this.stopTimers();
    audio.playClick();
    this.saveState();
    this.notify();
  }

  public toggle(): boolean {
    if (this.config.isActive) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public resetCircuitBreaker() {
    this.config.circuitBreakerTripped = false;
    this.config.circuitBreakerReason = '';
    audio.playPing();
    this.saveState();
    this.notify();
  }

  public emergencyHaltAndLiquidate(): number {
    this.stop();
    this.config.circuitBreakerTripped = true;
    this.config.circuitBreakerReason = 'EMERGENCY USER OVERRIDE: All positions liquidated and execution halted';
    const closedCount = ledger.closeAllPositions();
    audio.playAlert();
    this.recordDecision({
      id: 'halt-' + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      engine: 'dialectic',
      symbol: 'PORTFOLIO',
      direction: 'SHORT',
      sizeUSD: 0,
      status: 'CIRCUIT_BLOCKED',
      reason: `Emergency halt initiated. ${closedCount} active positions liquidated.`,
    });
    this.saveState();
    this.notify();
    return closedCount;
  }

  private startTimers() {
    this.stopTimers();

    // 1-second countdown ticker
    this.countdownIntervalId = window.setInterval(() => {
      if (!this.config.isActive) return;
      if (this.nextCycleCountdownSeconds > 0) {
        this.nextCycleCountdownSeconds -= 1;
        this.notify();
      } else {
        this.nextCycleCountdownSeconds = this.config.cycleIntervalSeconds;
        this.runAutopilotCycle();
      }
    }, 1000);
  }

  private stopTimers() {
    if (this.countdownIntervalId) {
      clearInterval(this.countdownIntervalId);
      this.countdownIntervalId = null;
    }
    if (this.loopIntervalId) {
      clearInterval(this.loopIntervalId);
      this.loopIntervalId = null;
    }
  }

  private recordDecision(decision: AutopilotDecision) {
    this.decisionsHistory.unshift(decision);
    if (this.decisionsHistory.length > 60) {
      this.decisionsHistory = this.decisionsHistory.slice(0, 60);
    }
    this.saveState();
    this.notify();
  }

  // --- Core Autonomous Quant Execution Cycle ---
  public async runAutopilotCycle() {
    if (!this.config.isActive || this.isCycleRunning) return;
    this.isCycleRunning = true;
    this.lastCycleTimestamp = Date.now();

    try {
      // 1. HEALTH & VaR CIRCUIT BREAKER CHECK
      this.currentStage = 'HEALTH_CHECK';
      this.notify();

      const metrics = ledger.getMetrics();
      const currentDrawdown = metrics.maxDrawdownPct;

      if (currentDrawdown >= this.config.maxDailyDrawdownPct) {
        this.config.circuitBreakerTripped = true;
        this.config.circuitBreakerReason = `VaR Stop-Loss Tripped: Current Max Drawdown (${currentDrawdown}%) exceeded strict safety cap (${this.config.maxDailyDrawdownPct}%)`;
        this.config.isActive = false;
        this.currentStage = 'IDLE';
        this.stopTimers();
        audio.playAlert();

        this.recordDecision({
          id: 'breaker-' + Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          engine: 'dialectic',
          symbol: 'RISK_VAR',
          direction: 'SHORT',
          sizeUSD: 0,
          status: 'CIRCUIT_BLOCKED',
          reason: this.config.circuitBreakerReason,
        });

        return;
      }

      // Check Concurrent Positions Capacity
      const activePositions = ledger.getPositions();
      if (activePositions.length >= this.config.maxConcurrentPositions) {
        this.recordDecision({
          id: 'skip-cap-' + Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          engine: 'dialectic',
          symbol: 'PORTFOLIO',
          direction: 'LONG',
          sizeUSD: 0,
          status: 'SKIPPED',
          reason: `Max concurrent positions reached (${activePositions.length}/${this.config.maxConcurrentPositions}). Awaiting liquidation.`,
        });
        return;
      }

      // 2. STAGE: CASCADEGUARD LIQUIDITY VACUUM SWEEP
      if (this.config.enabledEngines.includes('cascade')) {
        this.currentStage = 'SCANNING_DISLOCATIONS';
        this.notify();

        const tickers = market.getTickers();
        const equities = tickers.filter(t => t.type === 'tokenized_equity');

        for (const eq of equities) {
          const depth = eq.orderBookDepthUSD;
          const book = market.getOrderBook(eq.symbol);
          const hasSpreadDislocation = book ? book.spreadPct > 0.06 : false;

          // If orderbook thinness is high or spread has dislocated or 24h change demonstrates volatility
          if (depth < 1200000 || hasSpreadDislocation || Math.abs(eq.change24h) > 1.2) {
            const hedgePair = eq.symbol === 'rMSTR' ? 'BTC/USDT' : 'ETH/USDT';
            const hedgeTicker = market.getTicker(hedgePair);

            if (hedgeTicker) {
              const tradeSize = Math.min(this.config.maxCapitalPerTradeUSD, 25000);

              // Deploy Leg 1: Sweep the thin equity book
              const leg1Res = await bitgetTrading.executeOrder(
                eq.symbol,
                'LONG',
                tradeSize,
                'cascade',
                `[AUTOPILOT CASCADEGUARD] Swept orderbook liquidity dislocation on ${eq.symbol} ($${depth.toLocaleString()} depth)`
              );

              // Deploy Leg 2: Correlated crypto delta hedge
              await bitgetTrading.executeOrder(
                hedgePair,
                'SHORT',
                tradeSize,
                'cascade',
                `[AUTOPILOT CASCADEGUARD] Correlated delta hedge: Short ${hedgePair} against ${eq.symbol}`
              );

              this.totalAutonomousTrades += 2;
              this.totalAutonomousVolumeUSD += tradeSize * 2;

              this.recordDecision({
                id: 'auto-casc-' + Date.now(),
                timestamp: new Date().toLocaleTimeString(),
                engine: 'cascade',
                symbol: eq.symbol,
                direction: 'LONG',
                sizeUSD: tradeSize,
                status: 'EXECUTED',
                reason: `Swept thin orderbook vacuum on ${eq.symbol} with ${hedgePair} delta hedge.`,
                vwapPrice: leg1Res.fillPrice,
                slippageBps: leg1Res.slippage.slippageBps,
              });

              audio.playPing();
              return; // Execute one high-conviction setup per cycle
            }
          }
        }
      }

      // 3. STAGE: SILICON SYMBIOSIS STAT-ARB CONVERGENCE
      if (this.config.enabledEngines.includes('silicon')) {
        this.currentStage = 'EVALUATING_STAT_ARB';
        this.notify();

        const pairs = statArb.getCachedPairs();
        const extremePair = pairs.find(p => Math.abs(p.spreadZScore) >= 2.0);

        if (extremePair) {
          const tradeSize = Math.min(this.config.maxCapitalPerTradeUSD, 25000);
          const isLongCrypto = extremePair.signalDirection === 'LONG_CRYPTO_SHORT_EQUITY';

          // Leg 1: Crypto Order
          const leg1 = await bitgetTrading.executeOrder(
            extremePair.cryptoAsset,
            isLongCrypto ? 'LONG' : 'SHORT',
            tradeSize,
            'silicon',
            `[AUTOPILOT SILICON] Statistical divergence mean-reversion (${extremePair.spreadZScore}σ)`
          );

          // Leg 2: Stock Order
          await bitgetTrading.executeOrder(
            extremePair.techStock,
            isLongCrypto ? 'SHORT' : 'LONG',
            tradeSize,
            'silicon',
            `[AUTOPILOT SILICON] Co-integration hedge leg against ${extremePair.cryptoAsset}`
          );

          this.totalAutonomousTrades += 2;
          this.totalAutonomousVolumeUSD += tradeSize * 2;

          this.recordDecision({
            id: 'auto-silicon-' + Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            engine: 'silicon',
            symbol: `${extremePair.techStock}/${extremePair.cryptoAsset}`,
            direction: isLongCrypto ? 'LONG' : 'SHORT',
            sizeUSD: tradeSize * 2,
            status: 'EXECUTED',
            reason: `Executed dual-leg stat-arb at ${extremePair.spreadZScore > 0 ? '+' : ''}${extremePair.spreadZScore}σ divergence (Pearson r=${extremePair.correlation30d}).`,
            vwapPrice: leg1.fillPrice,
            slippageBps: leg1.slippage.slippageBps,
          });

          audio.playPing();
          return;
        }
      }

      // 4. STAGE: DIALECTIC DESK MULTI-AGENT ADVERSARIAL DEBATE
      if (this.config.enabledEngines.includes('dialectic')) {
        this.currentStage = 'DEBATING_ALPHA';
        this.notify();

        const tickers = market.getTickers();
        // Pick asset with highest active 24h change
        const sortedByMove = [...tickers].sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h));
        const candidate = sortedByMove[0] || tickers[0];

        const context = `Autopilot cycle evaluation: 24h Change: ${candidate.change24h}%, 24h Volume: ${candidate.volume24h}, Order Book Depth: $${candidate.orderBookDepthUSD.toLocaleString()}.`;
        const debate = await qwen.runDialecticDebate(candidate.symbol, candidate.price, context);

        if (debate.proposal.decisionStatus === 'VETOED') {
          this.recordDecision({
            id: 'auto-veto-' + Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            engine: 'dialectic',
            symbol: candidate.symbol,
            direction: debate.proposal.direction,
            sizeUSD: debate.proposal.recommendedSizeUSD,
            status: 'VETOED',
            reason: `Risk Comptroller hard-vetoed: ${debate.proposal.riskVetoRationale || 'Excessive tail risk'}`,
          });
        } else {
          const finalSize = Math.min(
            this.config.maxCapitalPerTradeUSD,
            debate.proposal.adjustedSizeUSD || debate.proposal.recommendedSizeUSD
          );

          const execRes = await bitgetTrading.executeOrder(
            candidate.symbol,
            debate.proposal.direction,
            finalSize,
            'dialectic',
            `[AUTOPILOT DIALECTIC] Consensus: ${debate.proposal.decisionStatus} (${debate.proposal.expectedSharpe} Sharpe, ${debate.proposal.tailRiskPct}% VaR)`
          );

          this.totalAutonomousTrades += 1;
          this.totalAutonomousVolumeUSD += finalSize;

          this.recordDecision({
            id: 'auto-dialectic-' + Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            engine: 'dialectic',
            symbol: candidate.symbol,
            direction: debate.proposal.direction,
            sizeUSD: finalSize,
            status: 'EXECUTED',
            reason: `Arbiter consensus ruling: ${debate.proposal.decisionStatus}. Sharpe ${debate.proposal.expectedSharpe}, VaR ${debate.proposal.tailRiskPct}%.`,
            vwapPrice: execRes.fillPrice,
            slippageBps: execRes.slippage.slippageBps,
          });

          audio.playPing();
          return;
        }
      }

      // If no high-conviction triggers fired this cycle
      this.recordDecision({
        id: 'scan-pass-' + Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        engine: 'dialectic',
        symbol: 'MARKET_SCAN',
        direction: 'LONG',
        sizeUSD: 0,
        status: 'SKIPPED',
        reason: 'All monitored order books, spreads, and macro wires within risk tolerances. Capital preserved.',
      });
    } catch (err) {
      console.warn('Autopilot cycle exception:', err);
    } finally {
      this.isCycleRunning = false;
      this.currentStage = this.config.isActive ? 'COOLDOWN' : 'IDLE';
      this.notify();
    }
  }
}

export const autopilot = new AutopilotService();
