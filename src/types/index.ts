// PRISM 7 Types Definition

export type EngineType = 'chronoarb' | 'dialectic' | 'silicon' | 'forensic' | 'cascade';

export interface MarketTicker {
  symbol: string;
  name: string;
  type: 'tokenized_equity' | 'crypto' | 'index';
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  orderBookDepthUSD: number;
  tradFiStatus: 'CLOSED' | 'OPEN';
  isTokenized7x24: boolean;
}

// 1. ChronoArb Types
export interface MacroEvent {
  id: string;
  headline: string;
  source: string;
  timestamp: string;
  category: 'GEOPOLITICAL' | 'CENTRAL_BANK' | 'REGULATORY' | 'MACRO_DATA' | 'EARNINGS';
  affectedTickers: string[];
  impliedGapPercent: number; // e.g. +1.8% or -2.4% on Monday open
  urgency: 'HIGH' | 'CRITICAL' | 'MODERATE';
  hedgingAction: 'LONG_RTOKEN' | 'SHORT_RTOKEN' | 'DELTA_NEUTRAL' | 'MONITORING';
  executedStatus: 'PENDING' | 'POSITION_OPEN' | 'SCALED_OUT';
  analysis: string;
}

// 2. Dialectic Desk Types
export type DialecticSpeaker = 'alpha_hunter' | 'risk_comptroller' | 'arbiter_system';

export interface DialecticMessage {
  id: string;
  speaker: DialecticSpeaker;
  speakerTitle: string;
  timestamp: string;
  text: string;
  score?: number; // e.g. alpha conviction 88% or risk flag 75%
  isLiveTyping?: boolean;
}

export interface DialecticProposal {
  id: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  takeProfit: number;
  stopLoss: number;
  recommendedSizeUSD: number;
  leverage: number;
  alphaRationale: string;
  riskVetoRationale?: string;
  decisionStatus: 'DEBATING' | 'APPROVED' | 'VETOED' | 'DOWNSIZED' | 'EXECUTED';
  adjustedSizeUSD?: number;
  expectedSharpe: number;
  tailRiskPct: number;
}

// 3. Silicon Symbiosis Types
export interface SupplyChainPair {
  id: string;
  techStock: string;      // e.g. "rNVDA"
  cryptoAsset: string;    // e.g. "RENDER"
  segment: 'GPU_COMPUTE' | 'AI_DATA_STORAGE' | 'SEMICONDUCTOR_FOUNDRY' | 'AI_AGENT_PLATFORM';
  correlation30d: number; // e.g. 0.84
  spreadZScore: number;   // e.g. +2.4 (Statistically divergent)
  narrativeLagMinutes: number;
  signalDirection: 'LONG_CRYPTO_SHORT_EQUITY' | 'LONG_EQUITY_SHORT_CRYPTO' | 'COINTEGRATION_HOLD';
  catalyst: string;
  pnlYieldExpectedPct: number;
  status: 'ACTIVE' | 'NEUTRAL';
}

// 4. ForensicAlpha Types
export interface EarningsForensic {
  id: string;
  symbol: string;
  companyName: string;
  reportPeriod: string;
  reportedEPS: number;
  consensusEPS: number;
  headlineSurprisePct: number;
  guidanceToneScore: number; // -100 to +100
  linguisticHedgingFreq: number; // Words/1000 ("headwinds", "adverse", "cautious")
  divergenceIndex: number; // Disparity between headline beat and forward tone
  recommendation: 'FADE_THE_POP' | 'BUY_THE_DIP' | 'MOMENTUM_CONFIRMATION';
  summaryQuote: string;
  executionStatus: 'FLAGGED' | 'POSITIONED' | 'EXPIRED';
}

// 5. CascadeGuard Types
export interface MicrostructureIncident {
  id: string;
  symbol: string;
  dropPercentage: number;
  timeWindowSeconds: number;
  orderBookDepthThinPct: number;
  isLiquidityVacuum: boolean; // True = flash crash anomaly, False = real macro dump
  fairSyntheticNAV: number;
  currentDislocatedPrice: number;
  discountPct: number;
  ladderBids: { price: number; size: number }[];
  cryptoDeltaHedgePair: string; // e.g. "BTC-PERP"
  status: 'VACUUM_DETECTED' | 'LADDER_DEPLOYED' | 'SNAP_BACK_CAPTURED' | 'CLOSED';
}

// Paper Trading & Portfolio Ledger
export interface PaperPosition {
  id: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  currentPrice: number;
  sizeUSD: number;
  pnlUSD: number;
  pnlPercent: number;
  engineOrigin: EngineType;
  openedAt: string;
}

export interface TradeAuditLog {
  id: string;
  timestamp: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  price: number;
  sizeUSD: number;
  pnlUSD: number;
  engineOrigin: EngineType;
  rationale: string;
  status: 'FILLED' | 'CLOSED' | 'CANCELLED';
}

// Global System Configuration
export interface SystemConfig {
  apiKey: string;
  endpointUrl: string;
  modelName: string;
  soundMuted: boolean;
  autoPilot: boolean;
}
