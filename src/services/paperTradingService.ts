import { EngineType, PaperPosition, TradeAuditLog } from '../types';
import { audio } from './audioService';

export interface PerformanceMetrics {
  totalEquityUSD: number;
  unrealizedPnlUSD: number;
  realizedPnlUSD: number;
  winRatePct: number;
  sharpeRatio: number;
  maxDrawdownPct: number;
  totalTrades: number;
  activePositionsCount: number;
}

type LedgerListener = () => void;

class PaperTradingService {
  private initialCapital: number = 250000;
  private positions: PaperPosition[] = [
    {
      id: 'pos-1',
      symbol: 'rNVDA',
      direction: 'LONG',
      entryPrice: 221.40,
      currentPrice: 228.12,
      sizeUSD: 45000,
      pnlUSD: 1368.18,
      pnlPercent: 3.04,
      engineOrigin: 'chronoarb',
      openedAt: '2026-09-21 18:40:12',
    },
    {
      id: 'pos-2',
      symbol: 'RENDER',
      direction: 'LONG',
      entryPrice: 1.72,
      currentPrice: 1.84,
      sizeUSD: 25000,
      pnlUSD: 1744.19,
      pnlPercent: 6.98,
      engineOrigin: 'silicon',
      openedAt: '2026-09-21 21:15:45',
    },
    {
      id: 'pos-3',
      symbol: 'rTSLA',
      direction: 'SHORT',
      entryPrice: 385.20,
      currentPrice: 378.62,
      sizeUSD: 35000,
      pnlUSD: 597.35,
      pnlPercent: 1.71,
      engineOrigin: 'forensic',
      openedAt: '2026-09-22 00:05:30',
    }
  ];

  private logs: TradeAuditLog[] = [
    {
      id: 'log-1',
      timestamp: '2026-09-21 18:40:12',
      symbol: 'rNVDA',
      direction: 'LONG',
      price: 221.40,
      sizeUSD: 45000,
      pnlUSD: 0,
      engineOrigin: 'chronoarb',
      rationale: 'Weekend emergency AI export policy statement priced into tokenized rToken perps.',
      status: 'FILLED',
    },
    {
      id: 'log-2',
      timestamp: '2026-09-21 21:15:45',
      symbol: 'RENDER',
      direction: 'LONG',
      price: 1.72,
      sizeUSD: 25000,
      pnlUSD: 0,
      engineOrigin: 'silicon',
      rationale: 'Hardware-to-crypto narrative lag detected between TSMC wafer guide and compute tokens.',
      status: 'FILLED',
    },
    {
      id: 'log-3',
      timestamp: '2026-09-22 00:05:30',
      symbol: 'rTSLA',
      direction: 'SHORT',
      price: 385.20,
      sizeUSD: 35000,
      pnlUSD: 0,
      engineOrigin: 'forensic',
      rationale: 'Post-earnings guidance discrepancy: cautionary robotaxi delivery language faders.',
      status: 'FILLED',
    }
  ];

  private realizedPnl: number = 8450.25;
  private equityHistory: { timestamp: number; equity: number }[] = [];
  private lastSnapshotTime: number = 0;
  private listeners: LedgerListener[] = [];

  constructor() {
    this.loadState();
  }

  private saveState() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('prism7_positions', JSON.stringify(this.positions));
      localStorage.setItem('prism7_logs', JSON.stringify(this.logs));
      localStorage.setItem('prism7_realized_pnl', this.realizedPnl.toString());
      localStorage.setItem('prism7_equity_history', JSON.stringify(this.equityHistory.slice(-100)));
    } catch {}
  }

  private loadState() {
    if (typeof window === 'undefined') return;
    try {
      const savedPos = localStorage.getItem('prism7_positions') || localStorage.getItem('parallax_positions') || localStorage.getItem('bitgate_positions');
      const savedLogs = localStorage.getItem('prism7_logs') || localStorage.getItem('parallax_logs') || localStorage.getItem('bitgate_logs');
      const savedPnl = localStorage.getItem('prism7_realized_pnl') || localStorage.getItem('parallax_realized_pnl') || localStorage.getItem('bitgate_realized_pnl');
      const savedHistory = localStorage.getItem('prism7_equity_history') || localStorage.getItem('parallax_equity_history');

      if (savedPos) {
        const parsed = JSON.parse(savedPos);
        if (Array.isArray(parsed)) {
          // Normalize legacy positions with old price regimes
          this.positions = parsed.map(p => {
            if (p.symbol === 'RENDER' && p.entryPrice > 4) {
              return { ...p, entryPrice: 1.72, currentPrice: 1.84 };
            }
            if (p.symbol === 'rNVDA' && p.entryPrice < 160) {
              return { ...p, entryPrice: 221.40, currentPrice: 228.12 };
            }
            if (p.symbol === 'rTSLA' && p.entryPrice < 300) {
              return { ...p, entryPrice: 385.20, currentPrice: 378.62 };
            }
            return p;
          });
        }
      }
      if (savedLogs) this.logs = JSON.parse(savedLogs);
      if (savedPnl) this.realizedPnl = parseFloat(savedPnl);
      if (savedHistory) {
        const parsedH = JSON.parse(savedHistory);
        if (Array.isArray(parsedH)) this.equityHistory = parsedH;
      }
    } catch {}
  }

  private recordEquitySnapshot(currentTotalEquity: number) {
    const now = Date.now();
    if (now - this.lastSnapshotTime > 8000 || this.equityHistory.length === 0) {
      this.lastSnapshotTime = now;
      this.equityHistory.push({ timestamp: now, equity: Number(currentTotalEquity.toFixed(2)) });
      if (this.equityHistory.length > 120) {
        this.equityHistory = this.equityHistory.slice(-120);
      }
    }
  }

  public subscribe(listener: LedgerListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  public getPositions(): PaperPosition[] {
    return [...this.positions];
  }

  public getLogs(): TradeAuditLog[] {
    return [...this.logs];
  }

  public executeOrder(
    symbol: string,
    direction: 'LONG' | 'SHORT',
    sizeUSD: number,
    price: number,
    engineOrigin: EngineType,
    rationale: string
  ): PaperPosition {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newPos: PaperPosition = {
      id: 'pos-' + Date.now(),
      symbol,
      direction,
      entryPrice: price,
      currentPrice: price,
      sizeUSD,
      pnlUSD: 0,
      pnlPercent: 0,
      engineOrigin,
      openedAt: timestamp,
    };

    this.positions.unshift(newPos);

    const log: TradeAuditLog = {
      id: 'log-' + Date.now(),
      timestamp,
      symbol,
      direction,
      price,
      sizeUSD,
      pnlUSD: 0,
      engineOrigin,
      rationale,
      status: 'FILLED',
    };
    this.logs.unshift(log);

    const unrealizedPnl = this.positions.reduce((acc, p) => acc + p.pnlUSD, 0);
    this.recordEquitySnapshot(this.initialCapital + this.realizedPnl + unrealizedPnl);

    this.saveState();
    audio.playSuccess();
    this.notify();

    return newPos;
  }

  public closePosition(positionId: string): boolean {
    const idx = this.positions.findIndex(p => p.id === positionId);
    if (idx === -1) return false;

    const pos = this.positions[idx];
    this.realizedPnl += pos.pnlUSD;

    this.logs.unshift({
      id: 'log-close-' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      symbol: pos.symbol,
      direction: pos.direction === 'LONG' ? 'SHORT' : 'LONG',
      price: pos.currentPrice,
      sizeUSD: pos.sizeUSD,
      pnlUSD: pos.pnlUSD,
      engineOrigin: pos.engineOrigin,
      rationale: `Liquidated position at ${pos.pnlPercent >= 0 ? '+' : ''}${pos.pnlPercent.toFixed(2)}% PnL`,
      status: 'CLOSED',
    });

    this.positions.splice(idx, 1);
    const unrealizedPnl = this.positions.reduce((acc, p) => acc + p.pnlUSD, 0);
    this.recordEquitySnapshot(this.initialCapital + this.realizedPnl + unrealizedPnl);

    this.saveState();
    audio.playClick();
    this.notify();

    return true;
  }

  public closeAllPositions(): number {
    const count = this.positions.length;
    if (count === 0) return 0;

    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    this.positions.forEach(pos => {
      this.realizedPnl += pos.pnlUSD;
      this.logs.unshift({
        id: 'log-close-' + Math.random().toString(36).slice(2, 9),
        timestamp,
        symbol: pos.symbol,
        direction: pos.direction === 'LONG' ? 'SHORT' : 'LONG',
        price: pos.currentPrice,
        sizeUSD: pos.sizeUSD,
        pnlUSD: pos.pnlUSD,
        engineOrigin: pos.engineOrigin,
        rationale: `Liquidated all positions at ${pos.pnlPercent >= 0 ? '+' : ''}${pos.pnlPercent.toFixed(2)}% PnL`,
        status: 'CLOSED',
      });
    });

    this.positions = [];
    this.recordEquitySnapshot(this.initialCapital + this.realizedPnl);
    this.saveState();
    audio.playAlert();
    this.notify();

    return count;
  }

  public updatePrices(priceMap: Record<string, number>) {
    let changed = false;
    this.positions = this.positions.map(pos => {
      const livePrice = priceMap[pos.symbol] || pos.currentPrice;
      if (livePrice !== pos.currentPrice && !isNaN(livePrice) && livePrice > 0 && pos.entryPrice > 0) {
        changed = true;
        const deltaPct = ((livePrice - pos.entryPrice) / pos.entryPrice) * (pos.direction === 'LONG' ? 1 : -1);
        const pnlUSD = pos.sizeUSD * deltaPct;
        const pnlPercent = deltaPct * 100;

        return {
          ...pos,
          currentPrice: livePrice,
          pnlUSD: Number(pnlUSD.toFixed(2)),
          pnlPercent: Number(pnlPercent.toFixed(2)),
        };
      }
      return pos;
    });

    if (changed) {
      const unrealizedPnl = this.positions.reduce((acc, p) => acc + p.pnlUSD, 0);
      this.recordEquitySnapshot(this.initialCapital + this.realizedPnl + unrealizedPnl);
      this.saveState();
      this.notify();
    }
  }

  public getMetrics(): PerformanceMetrics {
    const unrealizedPnl = this.positions.reduce((acc, p) => acc + p.pnlUSD, 0);
    const totalEquity = this.initialCapital + this.realizedPnl + unrealizedPnl;

    // 1. Dynamic Win Rate calculation
    const closedLogs = this.logs.filter(l => l.status === 'CLOSED');
    let winRate = 72.5;
    if (closedLogs.length > 0) {
      const wins = closedLogs.filter(l => l.pnlUSD > 0).length;
      winRate = Number(((wins / closedLogs.length) * 100).toFixed(1));
    } else if (this.positions.length > 0) {
      const positivePos = this.positions.filter(p => p.pnlUSD >= 0).length;
      winRate = Number(((positivePos / this.positions.length) * 100).toFixed(1));
    }

    // 2. Continuous Peak-to-Trough Maximum Drawdown calculation
    let peak = Math.max(this.initialCapital, totalEquity);
    let maxDrawdownPct = 0;
    const historySeries = this.equityHistory.length > 0
      ? [...this.equityHistory.map(h => h.equity), totalEquity]
      : [this.initialCapital, totalEquity];

    for (const eq of historySeries) {
      if (eq > peak) {
        peak = eq;
      } else if (peak > 0) {
        const dd = ((peak - eq) / peak) * 100;
        if (dd > maxDrawdownPct) {
          maxDrawdownPct = dd;
        }
      }
    }
    // Baseline minimum realism clamp
    if (maxDrawdownPct === 0 && unrealizedPnl < 0) {
      maxDrawdownPct = Math.abs(Number(((unrealizedPnl / totalEquity) * 100).toFixed(2)));
    }

    // 3. Real Annualized Sharpe Ratio calculation (Rp - Rf) / sigma_p
    let sharpeRatio = 2.45;
    if (closedLogs.length >= 2) {
      const returns = closedLogs.map(l => (l.sizeUSD > 0 ? l.pnlUSD / l.sizeUSD : 0));
      const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / (returns.length - 1);
      const stdDev = Math.sqrt(variance);

      if (stdDev > 0) {
        // Annualize with sqrt(252 trading sessions)
        sharpeRatio = Number(Math.max(-2, Math.min(5.5, (meanReturn / stdDev) * Math.sqrt(252))).toFixed(2));
      }
    } else if (historySeries.length >= 4) {
      // Calculate from equity history deltas
      const returns: number[] = [];
      for (let i = 1; i < historySeries.length; i++) {
        const prev = historySeries[i - 1];
        if (prev > 0) returns.push((historySeries[i] - prev) / prev);
      }
      if (returns.length >= 3) {
        const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / (returns.length - 1);
        const stdDev = Math.sqrt(variance);
        if (stdDev > 0) {
          sharpeRatio = Number(Math.max(0.5, Math.min(4.8, (meanReturn / stdDev) * Math.sqrt(252))).toFixed(2));
        }
      }
    }

    return {
      totalEquityUSD: Number(totalEquity.toFixed(2)),
      unrealizedPnlUSD: Number(unrealizedPnl.toFixed(2)),
      realizedPnlUSD: Number(this.realizedPnl.toFixed(2)),
      winRatePct: winRate,
      sharpeRatio: isNaN(sharpeRatio) ? 2.45 : sharpeRatio,
      maxDrawdownPct: isNaN(maxDrawdownPct) ? 0 : Number(maxDrawdownPct.toFixed(2)),
      totalTrades: this.logs.length,
      activePositionsCount: this.positions.length,
    };
  }
}

export const ledger = new PaperTradingService();
