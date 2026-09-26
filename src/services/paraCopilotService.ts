// PARA Autonomous AI Copilot Service for PRISM 7
// Direct integration with Qwen 3.8-Max multi-agent reasoning and app feature control
import { market } from './marketService';
import { ledger } from './paperTradingService';
import { qwen } from './qwenService';
import { audio } from './audioService';
import { bitgetTrading } from './bitgetTradingService';
import { autopilot } from './autopilotService';
import { EngineType } from '../types';

export type ParaActionType =
  | 'NAVIGATE'
  | 'TRADE'
  | 'LIQUIDATE'
  | 'DIALECTIC'
  | 'MACRO'
  | 'SUPPLY_CHAIN'
  | 'FORENSIC'
  | 'CASCADE'
  | 'THEME'
  | 'MUTE'
  | 'QUERY_STATUS'
  | 'AUTOPILOT'
  | 'ORDER_BOOK';

export interface ParaAction {
  type: ParaActionType;
  params: Record<string, any>;
  resultSummary?: string;
  status: 'PENDING' | 'EXECUTED' | 'FAILED';
}

export interface ParaMessage {
  id: string;
  sender: 'user' | 'para';
  text: string;
  timestamp: string;
  action?: ParaAction;
}

export interface ParaExecutionContext {
  currentView: 'landing' | 'desk';
  activeEngine: EngineType | 'portfolio';
  theme: 'light' | 'dark';
  navigateToEngine: (engine: EngineType | 'portfolio') => void;
  navigateToLanding: () => void;
  toggleTheme: () => void;
  onTradeExecuted?: () => void;
}

// Normalizes conversational asset names to registered platform tickers
export function resolveTicker(query?: string): string {
  if (!query) return 'rNVDA';
  const clean = String(query).toUpperCase().trim().replace(/[$#]/g, '');

  if (clean.includes('NVDA') || clean.includes('NVIDIA')) return 'rNVDA';
  if (clean.includes('TSLA') || clean.includes('TESLA')) return 'rTSLA';
  if (clean.includes('AAPL') || clean.includes('APPLE')) return 'rAAPL';
  if (clean.includes('MSFT') || clean.includes('MICROSOFT')) return 'rMSFT';
  if (clean.includes('MSTR') || clean.includes('MICROSTRATEGY')) return 'rMSTR';
  if (clean.includes('COIN') || clean.includes('COINBASE')) return 'rCOIN';
  if (clean.includes('BTC') || clean.includes('BITCOIN')) return 'BTC/USDT';
  if (clean.includes('ETH') || clean.includes('ETHEREUM')) return 'ETH/USDT';
  if (clean.includes('RENDER') || clean.includes('RNDR')) return 'RENDER';
  if (clean.includes('TAO') || clean.includes('BITTENSOR')) return 'TAO';
  if (clean.includes('FET') || clean.includes('ASI') || clean.includes('SUPERINTELLIGENCE')) return 'FET';

  const exact = market.getTicker(query) || market.getTicker('r' + query);
  if (exact) return exact.symbol;

  return 'rNVDA';
}

class ParaCopilotService {
  private messages: ParaMessage[] = [
    {
      id: 'para-welcome',
      sender: 'para',
      text: "I am PARA, your Chief Autonomous Quant Copilot. I have full systemic control over the PRISM 7 trading desk.\n\nYou can speak to me in plain English to execute orders, initiate adversarial Alpha vs. Omega debates, frontrun weekend macro gaps, audit corporate 8-Ks, scan thin-book liquidity vacuums, or manage your portfolio.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ];

  private listeners: ((messages: ParaMessage[]) => void)[] = [];

  public getMessages(): ParaMessage[] {
    return [...this.messages];
  }

  public subscribe(listener: (messages: ParaMessage[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.messages);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.messages));
  }

  public clearHistory() {
    this.messages = [
      {
        id: 'para-welcome-' + Date.now(),
        sender: 'para',
        text: "Terminal log cleared. Ready for your next command.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ];
    this.notify();
  }

  // Sanitizes asterisks, roleplay artifacts, and markdown glitches for pristine typography
  public sanitizeFormatting(raw: string): string {
    if (!raw) return '';
    let text = raw.replace(/\r\n/g, '\n');

    // 1. Convert asterisk bullet lists ("* item") to standard dash lists ("- item")
    text = text.replace(/^\s*\*\s+/gm, '- ');

    // 2. Normalize triple asterisks ***bold italic*** to **bold**
    text = text.replace(/\*\*\*([^*]+)\*\*\*/g, '**$1**');

    // 3. Remove roleplay phrases like *thinks to self*, *adjusts glasses*, *analyzes telemetry*
    text = text.replace(/(?<!\*)\*\s*(?:thinks|thinking|analyzes|analyzing|nods|nodding|adjusts|chuckles|smiles|sighs)[^*]*\*(?!\*)/gi, '');

    // 4. For any SINGLE-asterisk emphasis *word*, preserve the text without raw asterisks
    // Using negative lookbehind and lookahead so **bold** is completely untouched!
    // e.g., *PARA* -> PARA, *TSLA* -> TSLA
    text = text.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '$1');

    // 5. Auto-close dangling unclosed bold tags if odd count
    const boldTags = text.match(/\*\*/g) || [];
    if (boldTags.length % 2 !== 0) {
      text += '**';
    }

    // 6. Fix accidental word concatenations like forPRISM7
    text = text.replace(/forPRISM7|forBitGate/gi, 'for PRISM 7');

    // 7. Remove any unwanted '//' separators from generated output
    text = text.replace(/\s*\/\/\s*/g, ' • ');

    return text.trim();
  }

  public async sendMessage(userText: string, ctx: ParaExecutionContext): Promise<ParaMessage> {
    const userMsgId = 'user-' + Date.now();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage: ParaMessage = {
      id: userMsgId,
      sender: 'user',
      text: userText.trim(),
      timestamp: now,
    };

    this.messages.push(userMessage);
    this.notify();
    audio.playClick();

    // Prepare system prompt with current state telemetry
    const tickers = market.getTickers();
    const positions = ledger.getPositions();
    const metrics = ledger.getMetrics();

    const tickerContext = tickers
      .map(t => `${t.symbol}: $${t.price} (${t.change24h > 0 ? '+' : ''}${t.change24h}%)`)
      .join(', ');

    const positionContext = positions.length > 0
      ? positions.map(p => `${p.direction} ${p.symbol} ($${p.sizeUSD}, PnL: $${p.pnlUSD})`).join('; ')
      : 'None';

    const apState = autopilot.getState();
    const systemPrompt = `You are PARA, the ultra-competent institutional autonomous quant trading copilot for PRISM 7.
You control all desk modules via natural language:
1. Dialectic Adversarial Desk (Alpha Hunter vs Risk Comptroller debate)
2. ChronoArb 7×24 (frontrunning Monday cash open gaps using off-hours macro news)
3. Silicon Symbiosis (semiconductor hardware vs crypto compute stat-arb)
4. ForensicAlpha (auditing 8-K guidance discrepancies & tone)
5. CascadeGuard (sweeping thin-book phantom discount liquidity vacuums)
6. Live Ledger (paper trading execution, PnL, risk metrics)
7. Autonomous Autopilot (7×24 background scanner loop & VaR circuit breaker)
8. System Settings (theme, audio, navigation)

CURRENT APP TELEMETRY:
- Active View: ${ctx.currentView === 'desk' ? ctx.activeEngine : 'landing'}
- Live Assets: ${tickerContext}
- Open Positions: ${positionContext}
- Portfolio: Equity $${metrics.totalEquityUSD}, Realized PnL $${metrics.realizedPnlUSD}, Sharpe ${metrics.sharpeRatio}
- Autopilot: ${apState.isActive ? 'ACTIVE' : 'STANDBY'} (Stage: ${apState.currentStage}, Circuit: ${apState.circuitBreakerTripped ? 'TRIPPED' : 'CLEAR'})
- Theme: ${ctx.theme}

INSTRUCTION:
Analyze the user command. Determine if an action should be executed.
Respond in this STRICT format:
[ACTION: {"type": "NAVIGATE" | "TRADE" | "LIQUIDATE" | "DIALECTIC" | "MACRO" | "SUPPLY_CHAIN" | "FORENSIC" | "CASCADE" | "AUTOPILOT" | "THEME" | "MUTE" | "QUERY_STATUS" | "ORDER_BOOK", "params": {...}}]
[RESPONSE]
Your concise, quantitative, professional response to the user.

ACTION TYPES & PARAMETERS:
- "NAVIGATE": {"view": "dialectic" | "chronoarb" | "silicon" | "forensic" | "cascade" | "portfolio" | "landing"}
- "TRADE": {"symbol": "rNVDA" | "rTSLA" | "rAAPL" | "rMSFT" | "rMSTR" | "rCOIN" | "BTC/USDT" | "ETH/USDT" | "RENDER" | "TAO" | "FET", "direction": "LONG" | "SHORT", "sizeUSD": number, "rationale": string}
- "LIQUIDATE": {"all": boolean, "symbol"?: string}
- "AUTOPILOT": {"command": "start" | "stop" | "toggle" | "status" | "open_modal" | "reset_circuit" | "emergency_halt"}
- "ORDER_BOOK": {"symbol"?: string}
- "DIALECTIC": {"symbol": string}
- "MACRO": {"headline": string, "ticker": string}
- "SUPPLY_CHAIN": {"stock": string, "crypto": string}
- "FORENSIC": {"symbol": string, "excerpt"?: string}
- "CASCADE": {"symbol": string}
- "THEME": {"mode": "light" | "dark" | "toggle"}
- "MUTE": {}
- "QUERY_STATUS": {}

FORMATTING RULES:
- When asked who you are or for your identity, explicitly say: "I am PARA, the institutional autonomous quant trading copilot for PRISM 7."
- Never omit your name or wrap your name in asterisks.
- Never use '//' in responses; use '•' or bullet lists instead.
- Never use roleplay asterisks like *analyzing* or *nodding*.
- Use bold text **like this** for key metrics and tickers.
- Keep the response authoritative, institutional, and punchy.`;

    try {
      // Call Qwen 3.8-Max with conversational context
      const conversationHistory = [
        { role: 'system', content: systemPrompt },
        ...this.messages.slice(-6).map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        })),
        { role: 'user', content: userText }
      ];

      const rawResponse = await qwen.callChatCompletion(conversationHistory, 0.25, 450);

      // Parse Action & Clean Response
      let actionObj: ParaAction | undefined = undefined;
      let replyText = rawResponse;

      const actionMatch = rawResponse.match(/\[ACTION:\s*(\{[\s\S]*?\})\]/i);
      if (actionMatch) {
        try {
          const parsed = JSON.parse(actionMatch[1]);
          actionObj = {
            type: parsed.type,
            params: parsed.params || {},
            status: 'PENDING',
          };
        } catch (e) {
          console.warn('Action parse failed:', e);
        }
      }

      const responseMatch = rawResponse.match(/\[RESPONSE\]([\s\S]*)/i);
      if (responseMatch) {
        replyText = responseMatch[1].trim();
      } else {
        replyText = rawResponse.replace(/\[ACTION:[\s\S]*?\]/gi, '').trim();
      }

      replyText = this.sanitizeFormatting(replyText);

      // Execute Action against live app context
      if (actionObj) {
        actionObj = await this.executeAction(actionObj, ctx);
      }

      const botMessage: ParaMessage = {
        id: 'para-' + Date.now(),
        sender: 'para',
        text: replyText || 'Command processed and executed across desk ledger.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: actionObj,
      };

      this.messages.push(botMessage);
      this.notify();
      audio.playPing();
      return botMessage;
    } catch (err: unknown) {
      console.error('PARA copilot error:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);

      // Resilient fallback intent execution if Qwen encounters temporary connectivity hiccup
      const localAction = this.extractLocalIntent(userText);
      let executedAction: ParaAction | undefined = undefined;
      if (localAction) {
        executedAction = await this.executeAction(localAction, ctx);
      }

      const fallbackMsg: ParaMessage = {
        id: 'para-err-' + Date.now(),
        sender: 'para',
        text: executedAction
          ? `Executed local directive: **${executedAction.resultSummary}**.`
          : `Institutional engine error: ${errorMsg}. Please re-issue your command.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: executedAction,
      };

      this.messages.push(fallbackMsg);
      this.notify();
      return fallbackMsg;
    }
  }

  // Execute parsed tool action directly on the active desk state
  private async executeAction(action: ParaAction, ctx: ParaExecutionContext): Promise<ParaAction> {
    try {
      switch (action.type) {
        case 'NAVIGATE': {
          const rawTarget = String(
            action.params.view || action.params.target || action.params.engine || action.params.page || action.params.destination || ''
          ).toLowerCase();

          if (rawTarget === 'landing' || rawTarget === 'home') {
            ctx.navigateToLanding();
            action.resultSummary = 'Navigated to Landing Page';
          } else {
            const engineMap: Record<string, EngineType | 'portfolio'> = {
              dialectic: 'dialectic',
              debate: 'dialectic',
              alpha: 'dialectic',
              omega: 'dialectic',
              chronoarb: 'chronoarb',
              chrono: 'chronoarb',
              macro: 'chronoarb',
              gap: 'chronoarb',
              silicon: 'silicon',
              symbiosis: 'silicon',
              supply: 'silicon',
              semiconductor: 'silicon',
              forensic: 'forensic',
              forensicalpha: 'forensic',
              earnings: 'forensic',
              '8-k': 'forensic',
              cascade: 'cascade',
              cascadeguard: 'cascade',
              vacuum: 'cascade',
              liquidity: 'cascade',
              portfolio: 'portfolio',
              ledger: 'portfolio',
              pnl: 'portfolio',
            };
            const engine = engineMap[rawTarget] || 'dialectic';
            ctx.navigateToEngine(engine);
            action.resultSummary = `Switched workspace to ${engine.toUpperCase()} engine`;
          }
          action.status = 'EXECUTED';
          audio.playClick();
          break;
        }

        case 'TRADE': {
          const rawSymbol = action.params.symbol || action.params.ticker || action.params.instrument || action.params.asset;
          const symbol = resolveTicker(rawSymbol);

          const rawDirection = String(action.params.direction || action.params.side || action.params.action || action.params.orderType || 'LONG').toUpperCase();
          const direction: 'LONG' | 'SHORT' = (rawDirection === 'SHORT' || rawDirection === 'SELL') ? 'SHORT' : 'LONG';

          const sizeUSD = Number(action.params.sizeUSD || action.params.notional_usd || action.params.notional || action.params.amount || action.params.size || action.params.value) || 25000;
          const ticker = market.getTicker(symbol) || market.getTickers()[0];
          const rationale = action.params.rationale || `PARA Copilot autonomous natural language order execution for ${symbol}`;

          const res = await bitgetTrading.executeOrder(
            ticker.symbol,
            direction,
            sizeUSD,
            ctx.activeEngine === 'portfolio' ? 'dialectic' : ctx.activeEngine,
            rationale
          );

          action.resultSummary = res.message;
          action.status = 'EXECUTED';
          audio.playSuccess();
          if (ctx.onTradeExecuted) ctx.onTradeExecuted();
          break;
        }

        case 'LIQUIDATE': {
          const positions = ledger.getPositions();
          const targetRaw = action.params.symbol || action.params.ticker || action.params.instrument;
          const isAll = action.params.all === true || action.params.all === 'true' || String(action.params.scope || '').includes('all') || !targetRaw;

          if (isAll) {
            const count = ledger.closeAllPositions();
            action.resultSummary = `Liquidated all ${count} active open positions into cash equity`;
          } else {
            const resolved = resolveTicker(targetRaw);
            const match = positions.find(p => p.symbol.toLowerCase() === resolved.toLowerCase());
            if (match) {
              ledger.closePosition(match.id);
              action.resultSummary = `Liquidated ${match.direction} position in ${match.symbol} ($${match.sizeUSD.toLocaleString()})`;
            } else {
              action.resultSummary = `No active open position found for ${resolved}`;
            }
          }
          action.status = 'EXECUTED';
          audio.playAlert();
          break;
        }

        case 'DIALECTIC': {
          const symbol = resolveTicker(action.params.symbol || action.params.ticker || action.params.asset || action.params.instrument);
          ctx.navigateToEngine('dialectic');
          const ticker = market.getTicker(symbol) || market.getTickers()[0];
          action.resultSummary = `Dispatched Alpha vs. Omega debate on ${ticker.symbol} @ $${ticker.price}`;
          action.status = 'EXECUTED';
          audio.playPing();
          break;
        }

        case 'MACRO': {
          ctx.navigateToEngine('chronoarb');
          const headline = action.params.headline || action.params.catalyst || action.params.event || action.params.news || 'Off-Hours Catalyst';
          action.resultSummary = `Routed off-hours macro catalyst "${headline}" to ChronoArb`;
          action.status = 'EXECUTED';
          break;
        }

        case 'SUPPLY_CHAIN': {
          ctx.navigateToEngine('silicon');
          const stock = resolveTicker(action.params.stock || action.params.equity || 'rNVDA');
          const crypto = resolveTicker(action.params.crypto || action.params.token || 'RENDER');
          action.resultSummary = `Loaded ${stock} ↔ ${crypto} co-integration spread`;
          action.status = 'EXECUTED';
          break;
        }

        case 'FORENSIC': {
          ctx.navigateToEngine('forensic');
          const symbol = resolveTicker(action.params.symbol || action.params.ticker || action.params.company || 'rTSLA');
          action.resultSummary = `Loaded ForensicAlpha 8-K guidance radar for ${symbol}`;
          action.status = 'EXECUTED';
          break;
        }

        case 'CASCADE': {
          ctx.navigateToEngine('cascade');
          const symbol = resolveTicker(action.params.symbol || action.params.ticker || 'rMSTR');
          action.resultSummary = `Triggered CascadeGuard thin-book liquidity scan for ${symbol}`;
          action.status = 'EXECUTED';
          break;
        }

        case 'THEME': {
          const rawMode = String(action.params.mode || action.params.theme || 'toggle').toLowerCase();
          // Check if user or LLM mistakenly emitted a desk view name under THEME
          if (rawMode.includes('chrono') || rawMode.includes('dialectic') || rawMode.includes('silicon') || rawMode.includes('forensic') || rawMode.includes('cascade') || rawMode.includes('portfolio') || rawMode.includes('landing')) {
            return this.executeAction({ type: 'NAVIGATE', params: { view: rawMode }, status: 'PENDING' }, ctx);
          }

          if (rawMode === 'light' && ctx.theme !== 'light') {
            ctx.toggleTheme();
          } else if (rawMode === 'dark' && ctx.theme !== 'dark') {
            ctx.toggleTheme();
          } else {
            ctx.toggleTheme();
          }
          action.resultSummary = `Toggled display theme mode`;
          action.status = 'EXECUTED';
          break;
        }

        case 'MUTE': {
          const muted = audio.toggleMute();
          action.resultSummary = muted ? 'Muted audio system' : 'Unmuted audio telemetry';
          action.status = 'EXECUTED';
          break;
        }

        case 'QUERY_STATUS': {
          const metrics = ledger.getMetrics();
          action.resultSummary = `Ledger Equity: $${metrics.totalEquityUSD.toLocaleString()} | Sharpe: ${metrics.sharpeRatio} | Realized PnL: +$${metrics.realizedPnlUSD.toLocaleString()}`;
          action.status = 'EXECUTED';
          break;
        }

        case 'AUTOPILOT': {
          const cmd = String(action.params.command || action.params.action || action.params.state || '').toLowerCase();
          if (cmd === 'start' || cmd === 'on' || cmd === 'enable' || cmd === 'engage') {
            autopilot.start();
            action.resultSummary = 'Engaged Autonomous Autopilot loop. Multi-engine scans & VaR limits active.';
          } else if (cmd === 'stop' || cmd === 'off' || cmd === 'disable' || cmd === 'disengage' || cmd === 'pause') {
            autopilot.stop();
            action.resultSummary = 'Autopilot execution loop suspended. Desk in manual mode.';
          } else if (cmd === 'toggle') {
            const active = autopilot.toggle();
            action.resultSummary = active ? 'Autopilot engaged.' : 'Autopilot suspended.';
          } else if (cmd === 'reset_circuit' || cmd === 'reset') {
            autopilot.resetCircuitBreaker();
            action.resultSummary = 'VaR circuit breaker reset. Autonomous scanning restored.';
          } else if (cmd === 'emergency_halt' || cmd === 'halt') {
            const closed = autopilot.emergencyHaltAndLiquidate();
            action.resultSummary = `EMERGENCY HALT: Autopilot killed and ${closed} positions liquidated.`;
          } else if (cmd === 'open_modal' || cmd === 'configure' || cmd === 'config' || cmd === 'settings') {
            window.dispatchEvent(new CustomEvent('open-autopilot-modal'));
            action.resultSummary = 'Opened Autopilot Configuration Console.';
          } else {
            const st = autopilot.getState();
            action.resultSummary = `Autopilot is ${st.isActive ? 'ACTIVE' : 'STANDBY'} (Stage: ${st.currentStage}, Cycle: ${st.nextCycleCountdownSeconds}s, Trades: ${st.totalAutonomousTrades}, Breaker: ${st.circuitBreakerTripped ? 'TRIPPED' : 'CLEAR'})`;
          }
          action.status = 'EXECUTED';
          audio.playSuccess();
          break;
        }

        case 'ORDER_BOOK': {
          window.dispatchEvent(new CustomEvent('open-orderbook-modal'));
          action.resultSummary = 'Opened Live L2 Order Book & VWAP Slippage Radar.';
          action.status = 'EXECUTED';
          audio.playClick();
          break;
        }
      }
    } catch (e) {
      console.error('Action execution failed:', e);
      action.status = 'FAILED';
      action.resultSummary = 'Failed to execute command on local desk';
    }

    return action;
  }

  // Fast offline regex intent extractor for instant fallback
  private extractLocalIntent(text: string): ParaAction | null {
    const lower = text.toLowerCase();

    // Order Book commands
    if (lower.includes('order book') || lower.includes('orderbook') || lower.includes('depth ladder') || lower.includes('slippage radar') || lower.includes('l2 depth') || lower.includes('bids') || lower.includes('asks')) {
      return { type: 'ORDER_BOOK', params: {}, status: 'PENDING' };
    }

    // Theme commands
    if (lower.includes('dark mode') || lower.includes('light mode') || lower.includes('theme')) {
      return { type: 'THEME', params: {}, status: 'PENDING' };
    }

    // Mute commands
    if (lower.includes('mute') || lower.includes('unmute') || lower.includes('sound') || lower.includes('audio')) {
      return { type: 'MUTE', params: {}, status: 'PENDING' };
    }

    // Autopilot commands
    if (lower.includes('autopilot') || lower.includes('autonomous mode') || lower.includes('auto pilot')) {
      if (lower.includes('start') || lower.includes('on') || lower.includes('enable') || lower.includes('engage') || lower.includes('run') || lower.includes('activate')) {
        return { type: 'AUTOPILOT', params: { command: 'start' }, status: 'PENDING' };
      }
      if (lower.includes('stop') || lower.includes('off') || lower.includes('disable') || lower.includes('pause') || lower.includes('halt') || lower.includes('deactivate')) {
        return { type: 'AUTOPILOT', params: { command: 'stop' }, status: 'PENDING' };
      }
      if (lower.includes('status') || lower.includes('check') || lower.includes('health') || lower.includes('report') || lower.includes('state')) {
        return { type: 'AUTOPILOT', params: { command: 'status' }, status: 'PENDING' };
      }
      if (lower.includes('reset') || lower.includes('clear')) {
        return { type: 'AUTOPILOT', params: { command: 'reset_circuit' }, status: 'PENDING' };
      }
      return { type: 'AUTOPILOT', params: { command: 'open_modal' }, status: 'PENDING' };
    }

    // Liquidate commands
    if (lower.includes('liquidate') || lower.includes('close all') || lower.includes('close position') || lower.includes('sell all')) {
      return { type: 'LIQUIDATE', params: { all: true }, status: 'PENDING' };
    }

    // Trade commands
    if (lower.includes('buy') || lower.includes('long') || lower.includes('short') || lower.includes('sell')) {
      const isShort = lower.includes('short') || lower.includes('sell');
      const resolved = resolveTicker(text);
      const sizeMatch = text.match(/\$?(\d+[\d,]*)/);
      const size = sizeMatch ? parseInt(sizeMatch[1].replace(/,/g, ''), 10) : 25000;

      return {
        type: 'TRADE',
        params: {
          symbol: resolved,
          direction: isShort ? 'SHORT' : 'LONG',
          sizeUSD: size,
          rationale: 'Direct autonomous execution',
        },
        status: 'PENDING'
      };
    }

    // Navigation commands
    if (lower.includes('dialectic') || lower.includes('alpha') || lower.includes('omega') || lower.includes('debate')) {
      return { type: 'NAVIGATE', params: { view: 'dialectic' }, status: 'PENDING' };
    }
    if (lower.includes('chrono') || lower.includes('macro') || lower.includes('gap')) {
      return { type: 'NAVIGATE', params: { view: 'chronoarb' }, status: 'PENDING' };
    }
    if (lower.includes('silicon') || lower.includes('symbiosis') || lower.includes('supply chain')) {
      return { type: 'NAVIGATE', params: { view: 'silicon' }, status: 'PENDING' };
    }
    if (lower.includes('forensic') || lower.includes('earnings') || lower.includes('8-k') || lower.includes('tone')) {
      return { type: 'NAVIGATE', params: { view: 'forensic' }, status: 'PENDING' };
    }
    if (lower.includes('cascade') || lower.includes('vacuum') || lower.includes('dislocation')) {
      return { type: 'NAVIGATE', params: { view: 'cascade' }, status: 'PENDING' };
    }
    if (lower.includes('portfolio') || lower.includes('ledger') || lower.includes('pnl') || lower.includes('status')) {
      return { type: 'NAVIGATE', params: { view: 'portfolio' }, status: 'PENDING' };
    }

    return null;
  }
}

export const paraCopilot = new ParaCopilotService();
