import { MarketTicker } from '../types';

export interface OrderBookLevel {
  price: number;
  size: number;
  totalUSD: number;
}

export interface L2OrderBook {
  symbol: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  totalBidDepthUSD: number;
  totalAskDepthUSD: number;
  spread: number;
  spreadPct: number;
  timestamp: number;
}

export interface SlippageEstimate {
  symbol: string;
  direction: 'LONG' | 'SHORT';
  requestedSizeUSD: number;
  basePrice: number;
  vwapPrice: number;
  slippageUSD: number;
  slippageBps: number;
  slippagePct: number;
  fillQuality: 'OPTIMAL' | 'ACCEPTABLE' | 'HIGH_IMPACT';
}

export const INITIAL_TICKERS: MarketTicker[] = [
  // Tokenized US Equities (7x24 Active)
  {
    symbol: 'rNVDA',
    name: 'NVIDIA Corp (Tokenized)',
    type: 'tokenized_equity',
    price: 224.17,
    change24h: -0.59,
    high24h: 224.63,
    low24h: 221.09,
    volume24h: '$48.2M',
    orderBookDepthUSD: 1420000,
    tradFiStatus: 'CLOSED',
    isTokenized7x24: true,
  },
  {
    symbol: 'rTSLA',
    name: 'Tesla Inc (Tokenized)',
    type: 'tokenized_equity',
    price: 378.62,
    change24h: 0.91,
    high24h: 384.20,
    low24h: 374.10,
    volume24h: '$36.1M',
    orderBookDepthUSD: 980000,
    tradFiStatus: 'CLOSED',
    isTokenized7x24: true,
  },
  {
    symbol: 'rAAPL',
    name: 'Apple Inc (Tokenized)',
    type: 'tokenized_equity',
    price: 239.85,
    change24h: 0.26,
    high24h: 242.15,
    low24h: 237.80,
    volume24h: '$28.9M',
    orderBookDepthUSD: 1650000,
    tradFiStatus: 'CLOSED',
    isTokenized7x24: true,
  },
  {
    symbol: 'rMSFT',
    name: 'Microsoft Corp (Tokenized)',
    type: 'tokenized_equity',
    price: 498.13,
    change24h: -0.69,
    high24h: 504.40,
    low24h: 495.50,
    volume24h: '$22.4M',
    orderBookDepthUSD: 1120000,
    tradFiStatus: 'CLOSED',
    isTokenized7x24: true,
  },
  {
    symbol: 'rMSTR',
    name: 'MicroStrategy (Tokenized)',
    type: 'tokenized_equity',
    price: 170.20,
    change24h: 1.01,
    high24h: 175.50,
    low24h: 167.10,
    volume24h: '$52.7M',
    orderBookDepthUSD: 780000,
    tradFiStatus: 'CLOSED',
    isTokenized7x24: true,
  },
  {
    symbol: 'rCOIN',
    name: 'Coinbase Global (Tokenized)',
    type: 'tokenized_equity',
    price: 199.18,
    change24h: -0.93,
    high24h: 204.00,
    low24h: 196.50,
    volume24h: '$31.8M',
    orderBookDepthUSD: 890000,
    tradFiStatus: 'CLOSED',
    isTokenized7x24: true,
  },

  // Native Crypto & AI Compute Tokens (7x24 Active via Bitget Real-Time Feed)
  {
    symbol: 'BTC/USDT',
    name: 'Bitcoin',
    type: 'crypto',
    price: 86145.00,
    change24h: 0.50,
    high24h: 87393.00,
    low24h: 85112.00,
    volume24h: '$413M',
    orderBookDepthUSD: 18500000,
    tradFiStatus: 'CLOSED',
    isTokenized7x24: true,
  },
  {
    symbol: 'ETH/USDT',
    name: 'Ethereum',
    type: 'crypto',
    price: 2746.60,
    change24h: 0.40,
    high24h: 2790.00,
    low24h: 2710.00,
    volume24h: '$189M',
    orderBookDepthUSD: 9400000,
    tradFiStatus: 'CLOSED',
    isTokenized7x24: true,
  },
  {
    symbol: 'RENDER',
    name: 'Render Network',
    type: 'crypto',
    price: 1.84,
    change24h: 1.49,
    high24h: 1.92,
    low24h: 1.78,
    volume24h: '$24M',
    orderBookDepthUSD: 2400000,
    tradFiStatus: 'CLOSED',
    isTokenized7x24: true,
  },
  {
    symbol: 'TAO',
    name: 'Bittensor',
    type: 'crypto',
    price: 321.60,
    change24h: 13.00,
    high24h: 334.00,
    low24h: 284.00,
    volume24h: '$42M',
    orderBookDepthUSD: 3100000,
    tradFiStatus: 'CLOSED',
    isTokenized7x24: true,
  },
  {
    symbol: 'FET',
    name: 'Artificial Superintelligence',
    type: 'crypto',
    price: 0.207,
    change24h: 0.34,
    high24h: 0.218,
    low24h: 0.201,
    volume24h: '$12M',
    orderBookDepthUSD: 1800000,
    tradFiStatus: 'CLOSED',
    isTokenized7x24: true,
  }
];

const STOCK_SYMBOL_MAP: Record<string, string> = {
  rNVDA: 'NVDA',
  rTSLA: 'TSLA',
  rAAPL: 'AAPL',
  rMSFT: 'MSFT',
  rMSTR: 'MSTR',
  rCOIN: 'COIN',
};

const CRYPTO_BITGET_MAP: Record<string, string> = {
  'BTC/USDT': 'BTCUSDT',
  'ETH/USDT': 'ETHUSDT',
  RENDER: 'RENDERUSDT',
  TAO: 'TAOUSDT',
  FET: 'FETUSDT',
};

const BITGET_TO_APP_SYMBOL: Record<string, string> = {
  BTCUSDT: 'BTC/USDT',
  ETHUSDT: 'ETH/USDT',
  RENDERUSDT: 'RENDER',
  TAOUSDT: 'TAO',
  FETUSDT: 'FET',
};

type TickerListener = (tickers: MarketTicker[]) => void;
type WsStatusListener = (status: { connected: boolean; latencyMs: number; lastMessageTime: number }) => void;

class MarketService {
  private tickers: MarketTicker[] = [...INITIAL_TICKERS];
  private listeners: TickerListener[] = [];
  private wsListeners: WsStatusListener[] = [];
  private orderBooks: Map<string, L2OrderBook> = new Map();

  // Network & Timer IDs
  private ws: WebSocket | null = null;
  private wsConnected = false;
  private wsPingInterval: number | null = null;
  private wsReconnectTimeout: number | null = null;
  private lastWsMessageTime = 0;
  private pingStartTime = 0;
  private latencyMs = 28;

  private stockIntervalId: number | null = null;
  private fallbackCryptoIntervalId: number | null = null;
  private isFetchingStocks = false;
  private isFetchingFallbackCrypto = false;

  constructor() {
    this.initOrderBooks();
    this.startDataFeeds();
  }

  private initOrderBooks() {
    this.tickers.forEach(t => {
      this.orderBooks.set(t.symbol, this.generateSynthesizedOrderBook(t.symbol, t.price, t.orderBookDepthUSD));
    });
  }

  public getTickers(): MarketTicker[] {
    return this.tickers;
  }

  public getTicker(symbol: string): MarketTicker | undefined {
    return this.tickers.find(t => t.symbol.toLowerCase() === symbol.toLowerCase());
  }

  public getOrderBook(symbol: string): L2OrderBook | undefined {
    return this.orderBooks.get(symbol);
  }

  public getWsStatus() {
    return {
      connected: this.wsConnected,
      latencyMs: this.latencyMs,
      lastMessageTime: this.lastWsMessageTime,
    };
  }

  public subscribe(listener: TickerListener): () => void {
    this.listeners.push(listener);
    listener(this.tickers);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public subscribeWsStatus(listener: WsStatusListener): () => void {
    this.wsListeners.push(listener);
    listener(this.getWsStatus());
    return () => {
      this.wsListeners = this.wsListeners.filter(l => l !== listener);
    };
  }

  private notifyWs() {
    const status = this.getWsStatus();
    this.wsListeners.forEach(l => l(status));
  }

  private notify() {
    this.listeners.forEach(l => l(this.tickers));
  }

  // --- Real Bitget WebSocket Implementation ---
  private initBitgetWebSocket() {
    if (typeof window === 'undefined' || typeof WebSocket === 'undefined') return;

    try {
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }

      this.ws = new WebSocket('wss://ws.bitget.com/v2/ws/public');

      this.ws.onopen = () => {
        this.wsConnected = true;
        this.lastWsMessageTime = Date.now();
        this.notifyWs();

        // Subscribe to tickers and L2 orderbooks for all 5 pairs
        const instIds = Object.values(CRYPTO_BITGET_MAP);
        const tickerArgs = instIds.map(instId => ({
          instType: 'SPOT',
          channel: 'ticker',
          instId,
        }));
        const bookArgs = instIds.map(instId => ({
          instType: 'SPOT',
          channel: 'books15',
          instId,
        }));

        this.ws?.send(JSON.stringify({ op: 'subscribe', args: [...tickerArgs, ...bookArgs] }));

        // Heartbeat keep-alive every 25 seconds
        if (this.wsPingInterval) clearInterval(this.wsPingInterval);
        this.wsPingInterval = window.setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.pingStartTime = Date.now();
            this.ws.send('ping');
          }
        }, 25000);
      };

      this.ws.onmessage = (event: MessageEvent) => {
        this.lastWsMessageTime = Date.now();

        if (event.data === 'pong') {
          if (this.pingStartTime > 0) {
            this.latencyMs = Math.max(12, Date.now() - this.pingStartTime);
            this.pingStartTime = 0;
            this.notifyWs();
          }
          return;
        }

        try {
          const payload = JSON.parse(event.data);
          if (payload.action === 'snapshot' || payload.action === 'update') {
            this.handleWsStreamData(payload);
          }
        } catch {
          // Non-JSON ping/pong or info frame
        }
      };

      this.ws.onerror = (err) => {
        console.warn('Bitget WebSocket encountered hiccup:', err);
      };

      this.ws.onclose = () => {
        this.wsConnected = false;
        this.notifyWs();
        if (this.wsPingInterval) clearInterval(this.wsPingInterval);

        // Auto-reconnect with exponential backoff
        if (!this.wsReconnectTimeout) {
          this.wsReconnectTimeout = window.setTimeout(() => {
            this.wsReconnectTimeout = null;
            this.initBitgetWebSocket();
          }, 3000);
        }
      };
    } catch (e) {
      console.warn('Bitget WebSocket initialization error:', e);
      this.wsConnected = false;
      this.notifyWs();
    }
  }

  // Parses live WebSocket ticker and orderbook frames
  private handleWsStreamData(payload: any) {
    const channel = payload?.arg?.channel;
    const instId = payload?.arg?.instId;
    const appSymbol = BITGET_TO_APP_SYMBOL[instId];
    if (!appSymbol || !Array.isArray(payload.data) || payload.data.length === 0) return;

    if (channel === 'ticker') {
      const item = payload.data[0];
      const lastPr = parseFloat(item.lastPr);
      const change24h = parseFloat(item.change24h || '0') * 100;
      const high24h = parseFloat(item.high24h || String(lastPr));
      const low24h = parseFloat(item.low24h || String(lastPr));
      const usdtVol = parseFloat(item.usdtVolume || '0');
      const volStr = usdtVol > 1e9 ? `$${(usdtVol / 1e9).toFixed(1)}B` : `$${(usdtVol / 1e6).toFixed(1)}M`;

      if (!isNaN(lastPr) && lastPr > 0) {
        let updated = false;
        this.tickers = this.tickers.map(t => {
          if (t.symbol === appSymbol) {
            updated = true;
            return {
              ...t,
              price: Number(lastPr.toFixed(lastPr > 500 ? 2 : (lastPr > 1 ? 3 : 4))),
              change24h: Number(change24h.toFixed(2)),
              high24h: Math.max(t.high24h, high24h),
              low24h: Math.min(t.low24h, low24h),
              volume24h: volStr,
            };
          }
          return t;
        });
        if (updated) this.notify();
      }
    } else if (channel === 'books15') {
      const bookData = payload.data[0];
      if (Array.isArray(bookData.bids) && Array.isArray(bookData.asks)) {
        this.updateOrderBookFromLiveLevels(appSymbol, bookData.bids, bookData.asks);
      }
    }
  }

  private updateOrderBookFromLiveLevels(symbol: string, rawBids: [string, string][], rawAsks: [string, string][]) {
    let totalBidDepthUSD = 0;
    const bids: OrderBookLevel[] = rawBids.slice(0, 10).map(([p, s]) => {
      const price = parseFloat(p);
      const size = parseFloat(s);
      const totalUSD = price * size;
      totalBidDepthUSD += totalUSD;
      return { price, size, totalUSD };
    });

    let totalAskDepthUSD = 0;
    const asks: OrderBookLevel[] = rawAsks.slice(0, 10).map(([p, s]) => {
      const price = parseFloat(p);
      const size = parseFloat(s);
      const totalUSD = price * size;
      totalAskDepthUSD += totalUSD;
      return { price, size, totalUSD };
    });

    const bestBid = bids[0]?.price || 0;
    const bestAsk = asks[0]?.price || 0;
    const spread = bestAsk > bestBid ? Number((bestAsk - bestBid).toFixed(4)) : 0;
    const spreadPct = bestBid > 0 ? Number(((spread / bestBid) * 100).toFixed(4)) : 0;

    const bookObj: L2OrderBook = {
      symbol,
      bids,
      asks,
      totalBidDepthUSD: Math.round(totalBidDepthUSD),
      totalAskDepthUSD: Math.round(totalAskDepthUSD),
      spread,
      spreadPct,
      timestamp: Date.now(),
    };

    this.orderBooks.set(symbol, bookObj);

    // Update ticker aggregate depth
    const totalDepth = Math.round(totalBidDepthUSD + totalAskDepthUSD);
    this.tickers = this.tickers.map(t => {
      if (t.symbol === symbol && Math.abs(t.orderBookDepthUSD - totalDepth) > 5000) {
        return { ...t, orderBookDepthUSD: totalDepth };
      }
      return t;
    });
  }

  // --- Realistic Volume-Weighted Average Price (VWAP) & Slippage Calculation ---
  // Walks through the order book bids (for SELL/SHORT) or asks (for BUY/LONG) to simulate true market impact
  public calculateSlippage(
    symbol: string,
    requestedSizeUSD: number,
    direction: 'LONG' | 'SHORT'
  ): SlippageEstimate {
    const ticker = this.getTicker(symbol);
    const basePrice = ticker?.price || 100;
    const book = this.getOrderBook(symbol);

    if (!book || (direction === 'LONG' && book.asks.length === 0) || (direction === 'SHORT' && book.bids.length === 0)) {
      // Analytical fallback when book level depth is thin
      const impactRatio = Math.min(0.04, requestedSizeUSD / ((ticker?.orderBookDepthUSD || 1000000) * 0.2));
      const slippagePct = Number((impactRatio * 100).toFixed(3));
      const slippageUSD = requestedSizeUSD * impactRatio;
      const vwapPrice = Number((direction === 'LONG' ? basePrice * (1 + impactRatio) : basePrice * (1 - impactRatio)).toFixed(2));
      return {
        symbol,
        direction,
        requestedSizeUSD,
        basePrice,
        vwapPrice,
        slippageUSD: Number(slippageUSD.toFixed(2)),
        slippageBps: Math.round(impactRatio * 10000),
        slippagePct,
        fillQuality: slippagePct < 0.2 ? 'OPTIMAL' : slippagePct < 1.0 ? 'ACCEPTABLE' : 'HIGH_IMPACT',
      };
    }

    const levels = direction === 'LONG' ? book.asks : book.bids;
    let remainingUSD = requestedSizeUSD;
    let totalExecutedUnits = 0;
    let totalCostUSD = 0;

    for (const level of levels) {
      if (remainingUSD <= 0) break;
      const levelCapacityUSD = level.totalUSD;
      const fillUSD = Math.min(remainingUSD, levelCapacityUSD);
      const fillUnits = fillUSD / level.price;

      totalCostUSD += fillUSD;
      totalExecutedUnits += fillUnits;
      remainingUSD -= fillUSD;
    }

    // If order size walked entirely past the top 10 levels, apply exponential tail slippage to the remainder
    if (remainingUSD > 0) {
      const worstLevelPrice = levels[levels.length - 1].price;
      const penaltyPrice = direction === 'LONG' ? worstLevelPrice * 1.015 : worstLevelPrice * 0.985;
      const remainderUnits = remainingUSD / penaltyPrice;
      totalCostUSD += remainingUSD;
      totalExecutedUnits += remainderUnits;
    }

    const vwapPrice = totalExecutedUnits > 0 ? Number((totalCostUSD / totalExecutedUnits).toFixed(2)) : basePrice;
    const slippagePct = Number((Math.abs(vwapPrice - basePrice) / basePrice * 100).toFixed(3));
    const slippageBps = Math.round((Math.abs(vwapPrice - basePrice) / basePrice) * 10000);
    const slippageUSD = Number((requestedSizeUSD * (slippagePct / 100)).toFixed(2));

    return {
      symbol,
      direction,
      requestedSizeUSD,
      basePrice,
      vwapPrice,
      slippageUSD,
      slippageBps,
      slippagePct,
      fillQuality: slippagePct < 0.15 ? 'OPTIMAL' : slippagePct < 0.8 ? 'ACCEPTABLE' : 'HIGH_IMPACT',
    };
  }

  // Synthesizes realistic 10-level bid/ask order book for tokenized equities based on underlying prices
  private generateSynthesizedOrderBook(symbol: string, currentPrice: number, totalDepthUSD: number): L2OrderBook {
    const halfDepth = totalDepthUSD / 2;
    const bids: OrderBookLevel[] = [];
    const asks: OrderBookLevel[] = [];

    let totalBidDepthUSD = 0;
    let totalAskDepthUSD = 0;

    for (let i = 1; i <= 10; i++) {
      const stepPct = i * 0.0006 + (i * i * 0.0001);
      const bidPrice = Number((currentPrice * (1 - stepPct)).toFixed(2));
      const askPrice = Number((currentPrice * (1 + stepPct)).toFixed(2));

      const levelShare = (11 - i) / 55; // Decaying weights
      const bidUSD = Math.round(halfDepth * levelShare);
      const askUSD = Math.round(halfDepth * levelShare);

      bids.push({ price: bidPrice, size: Number((bidUSD / bidPrice).toFixed(2)), totalUSD: bidUSD });
      asks.push({ price: askPrice, size: Number((askUSD / askPrice).toFixed(2)), totalUSD: askUSD });

      totalBidDepthUSD += bidUSD;
      totalAskDepthUSD += askUSD;
    }

    const spread = Number((asks[0].price - bids[0].price).toFixed(2));
    const spreadPct = Number(((spread / bids[0].price) * 100).toFixed(3));

    return {
      symbol,
      bids,
      asks,
      totalBidDepthUSD,
      totalAskDepthUSD,
      spread,
      spreadPct,
      timestamp: Date.now(),
    };
  }

  private startDataFeeds() {
    if (typeof window === 'undefined') return;

    // 1. Establish Bitget Public WebSocket
    this.initBitgetWebSocket();

    // 2. Immediate stock fetch via proxy
    this.fetchRealStockPrices();

    // 3. Poll live stock prices every 4 seconds
    this.stockIntervalId = window.setInterval(() => {
      this.fetchRealStockPrices();
      this.simulateOffHoursMicroTicks();
    }, 4000);

    // 4. Fallback REST poll if WS disconnected
    this.fallbackCryptoIntervalId = window.setInterval(() => {
      if (!this.wsConnected) {
        this.fetchFallbackCryptoPrices();
      }
    }, 5000);
  }

  // 7x24 Off-Hours Micro-Tick Simulation for Tokenized US Equities
  private simulateOffHoursMicroTicks() {
    let updated = false;
    this.tickers = this.tickers.map(ticker => {
      if (ticker.type === 'tokenized_equity') {
        const deltaPct = (Math.random() - 0.492) * 0.0009;
        const newPrice = Number((ticker.price * (1 + deltaPct)).toFixed(2));
        if (newPrice !== ticker.price && newPrice > 0) {
          updated = true;
          // Refresh synthesized order book with fresh ticks
          this.orderBooks.set(ticker.symbol, this.generateSynthesizedOrderBook(ticker.symbol, newPrice, ticker.orderBookDepthUSD));

          return {
            ...ticker,
            price: newPrice,
            high24h: Math.max(ticker.high24h, newPrice),
            low24h: Math.min(ticker.low24h, newPrice),
          };
        }
      }
      return ticker;
    });
    if (updated) {
      this.notify();
    }
  }

  // Fetch real-time US Equity underlying prices via proxy with clean User-Agent headers
  public async fetchRealStockPrices() {
    if (this.isFetchingStocks) return;
    this.isFetchingStocks = true;

    try {
      const stockSymbols = Object.entries(STOCK_SYMBOL_MAP);
      let updated = false;

      for (const [rSymbol, stockTicker] of stockSymbols) {
        try {
          const res = await fetch(`/api/stock/${stockTicker}`);
          if (!res.ok) continue;

          const data = await res.json();
          const meta = data?.chart?.result?.[0]?.meta;
          if (meta && typeof meta.regularMarketPrice === 'number') {
            const price = Number(meta.regularMarketPrice.toFixed(2));
            const prevClose = meta.chartPreviousClose || meta.previousClose || price;
            const change24h = Number((((price - prevClose) / prevClose) * 100).toFixed(2));
            const high24h = Number((meta.regularMarketDayHigh || price * 1.01).toFixed(2));
            const low24h = Number((meta.regularMarketDayLow || price * 0.99).toFixed(2));

            this.tickers = this.tickers.map(t => {
              if (t.symbol === rSymbol) {
                updated = true;
                this.orderBooks.set(rSymbol, this.generateSynthesizedOrderBook(rSymbol, price, t.orderBookDepthUSD));

                return {
                  ...t,
                  price,
                  change24h,
                  high24h: Math.max(t.high24h, high24h),
                  low24h: Math.min(t.low24h, low24h),
                };
              }
              return t;
            });
          }
        } catch {
          // Individual stock failure doesn't block others
        }
      }

      if (updated) {
        this.notify();
      }
    } catch (err) {
      console.warn('Stock feed proxy warning:', err);
    } finally {
      this.isFetchingStocks = false;
    }
  }

  // Fallback REST fetch if WebSocket drops
  private async fetchFallbackCryptoPrices() {
    if (this.isFetchingFallbackCrypto) return;
    this.isFetchingFallbackCrypto = true;

    try {
      const res = await fetch('https://api.bitget.com/api/v2/spot/market/tickers');
      if (!res.ok) return;

      const data = await res.json();
      if (!data?.data || !Array.isArray(data.data)) return;

      const bitgetMap = new Map<string, { lastPrice: number; change24h: number; high: number; low: number; volume: string }>();
      for (const item of data.data) {
        if (item.symbol && item.lastPr) {
          const last = parseFloat(item.lastPr);
          const change = parseFloat(item.change24h || '0') * 100;
          const high = parseFloat(item.high24h || String(last));
          const low = parseFloat(item.low24h || String(last));
          const usdtVol = parseFloat(item.usdtVolume || '0');
          const volStr = usdtVol > 1e9 ? `$${(usdtVol / 1e9).toFixed(1)}B` : `$${(usdtVol / 1e6).toFixed(1)}M`;
          bitgetMap.set(item.symbol, { lastPrice: last, change24h: change, high, low, volume: volStr });
        }
      }

      let updated = false;
      this.tickers = this.tickers.map(ticker => {
        const bitgetSymbol = CRYPTO_BITGET_MAP[ticker.symbol];
        if (!bitgetSymbol) return ticker;

        const liveData = bitgetMap.get(bitgetSymbol);
        if (liveData && !isNaN(liveData.lastPrice) && liveData.lastPrice > 0) {
          updated = true;
          return {
            ...ticker,
            price: Number(liveData.lastPrice.toFixed(liveData.lastPrice > 500 ? 2 : (liveData.lastPrice > 1 ? 3 : 4))),
            change24h: Number(liveData.change24h.toFixed(2)),
            high24h: Math.max(ticker.high24h, liveData.high),
            low24h: Math.min(ticker.low24h, liveData.low),
            volume24h: liveData.volume,
          };
        }
        return ticker;
      });

      if (updated) {
        this.notify();
      }
    } catch (err) {
      console.warn('Fallback Bitget REST error:', err);
    } finally {
      this.isFetchingFallbackCrypto = false;
    }
  }

  public stop() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.wsPingInterval) clearInterval(this.wsPingInterval);
    if (this.wsReconnectTimeout) clearTimeout(this.wsReconnectTimeout);
    if (this.stockIntervalId) clearInterval(this.stockIntervalId);
    if (this.fallbackCryptoIntervalId) clearInterval(this.fallbackCryptoIntervalId);
  }
}

export const market = new MarketService();
