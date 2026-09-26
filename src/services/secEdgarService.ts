// Official SEC EDGAR Submissions & Corporate Disclosures Service for ForensicAlpha
// Ingests real 8-K, 10-Q, and 10-K regulatory filings directly from the SEC EDGAR API
export interface SecFiling {
  accessionNumber: string;
  form: string;
  filingDate: string;
  reportDate: string;
  primaryDocDescription: string;
  primaryDocument: string;
  secUrl: string;
}

export interface SecCompanyProfile {
  cik: string;
  name: string;
  ticker: string;
  sicDescription: string;
  recentFilings: SecFiling[];
  lastFilingDate: string;
}

const SYMBOL_TO_CIK: Record<string, { cik: string; name: string }> = {
  rTSLA: { cik: '0001318605', name: 'Tesla, Inc.' },
  TSLA: { cik: '0001318605', name: 'Tesla, Inc.' },
  rNVDA: { cik: '0001045810', name: 'NVIDIA Corp' },
  NVDA: { cik: '0001045810', name: 'NVIDIA Corp' },
  rAAPL: { cik: '0000320193', name: 'Apple Inc.' },
  AAPL: { cik: '0000320193', name: 'Apple Inc.' },
  rMSFT: { cik: '0000789019', name: 'Microsoft Corp' },
  MSFT: { cik: '0000789019', name: 'Microsoft Corp' },
  rMSTR: { cik: '0001050446', name: 'MicroStrategy Inc' },
  MSTR: { cik: '0001050446', name: 'MicroStrategy Inc' },
  rCOIN: { cik: '0001679788', name: 'Coinbase Global, Inc.' },
  COIN: { cik: '0001679788', name: 'Coinbase Global, Inc.' },
};

class SecEdgarService {
  private cache: Map<string, SecCompanyProfile> = new Map();

  public getCikInfo(symbol: string) {
    const clean = symbol.trim();
    return SYMBOL_TO_CIK[clean] || SYMBOL_TO_CIK[clean.replace(/^r/, '')] || { cik: '0001045810', name: symbol };
  }

  // Fetches live SEC EDGAR submissions through the proxy with registered User-Agent
  public async fetchCompanyFilings(symbol: string): Promise<SecCompanyProfile | null> {
    const info = this.getCikInfo(symbol);
    if (this.cache.has(info.cik)) {
      return this.cache.get(info.cik)!;
    }

    try {
      const res = await fetch(`/api/sec/submissions/CIK${info.cik}.json`);
      if (!res.ok) {
        console.warn(`SEC EDGAR returned status ${res.status} for CIK ${info.cik}`);
        return null;
      }

      const data = await res.json();
      const recent = data?.filings?.recent;
      if (!recent || !Array.isArray(recent.form)) {
        return null;
      }

      const filings: SecFiling[] = [];
      const len = recent.form.length;

      for (let i = 0; i < len && filings.length < 8; i++) {
        const form = recent.form[i];
        if (['8-K', '10-Q', '10-K', '8-K/A', '10-Q/A'].includes(form)) {
          const accNum = recent.accessionNumber[i];
          const accWithoutDashes = accNum.replace(/-/g, '');
          const primaryDoc = recent.primaryDocument[i] || '';
          const secUrl = `https://www.sec.gov/Archives/edgar/data/${parseInt(info.cik, 10)}/${accWithoutDashes}/${primaryDoc}`;

          filings.push({
            accessionNumber: accNum,
            form,
            filingDate: recent.filingDate[i] || '',
            reportDate: recent.reportDate[i] || recent.filingDate[i] || '',
            primaryDocDescription: recent.primaryDocDescription[i] || form,
            primaryDocument: primaryDoc,
            secUrl,
          });
        }
      }

      const profile: SecCompanyProfile = {
        cik: info.cik,
        name: data.name || info.name,
        ticker: symbol,
        sicDescription: data.sicDescription || 'Technology',
        recentFilings: filings,
        lastFilingDate: filings[0]?.filingDate || recent.filingDate[0] || 'Recent',
      };

      this.cache.set(info.cik, profile);
      return profile;
    } catch (err) {
      console.warn(`SEC EDGAR fetch error for ${symbol}:`, err);
      return null;
    }
  }

  // Fetches and extracts text excerpt directly from official SEC filing document archives
  public async fetchFilingDocumentExcerpt(secUrl: string): Promise<string | null> {
    if (!secUrl) return null;
    try {
      const proxyPath = secUrl.replace(/^https?:\/\/(?:www\.)?sec\.gov/, '/api/sec-doc');
      const res = await fetch(proxyPath);
      if (!res.ok) return null;
      const htmlOrText = await res.text();

      // Clean HTML tags and extract readable prose
      const text = htmlOrText
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();

      // Prioritize Item 2.02 / 7.01 / 8.01 or Forward-Looking Statements
      const itemMatch = text.match(/(?:Item\s+(?:2\.02|7\.01|8\.01)[\s\S]{100,1000}|Forward-Looking\s+Statements[\s\S]{100,900})/i);
      if (itemMatch) {
        return itemMatch[0].trim();
      }

      if (text.length > 200) {
        return text.slice(0, 650).trim() + '...';
      }
      return null;
    } catch (e) {
      console.warn('Failed to extract SEC document excerpt:', e);
      return null;
    }
  }
}

export const secEdgar = new SecEdgarService();
