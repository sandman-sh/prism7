import React, { useState, useEffect } from 'react';
import { EarningsForensic } from '../../types';
import { qwen } from '../../services/qwenService';
import { bitgetTrading } from '../../services/bitgetTradingService';
import { market } from '../../services/marketService';
import { newsService } from '../../services/newsService';
import { secEdgar, SecCompanyProfile, SecFiling } from '../../services/secEdgarService';
import { audio } from '../../services/audioService';
import { BrutalistButton } from '../common/BrutalistButton';
import { BrutalistBadge } from '../common/BrutalistBadge';
import { useTheme } from '../../context/ThemeContext';
import confetti from 'canvas-confetti';
import { 
  FileSearch, 
  RefreshCw, 
  Send, 
  Zap, 
  ExternalLink,
  Building2,
  FileText
} from 'lucide-react';

const TRACKED_SYMBOLS = ['rNVDA', 'rTSLA', 'rAAPL', 'rMSFT', 'rMSTR', 'rCOIN'];

export const ForensicAlphaView: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [selectedSymbol, setSelectedSymbol] = useState('rNVDA');
  const [secProfile, setSecProfile] = useState<SecCompanyProfile | null>(null);
  const [selectedFiling, setSelectedFiling] = useState<SecFiling | null>(null);
  const [loadingSec, setLoadingSec] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [disclosureExcerpt, setDisclosureExcerpt] = useState('');
  const [executedId, setExecutedId] = useState<string | null>(null);

  const [forensicReport, setForensicReport] = useState<EarningsForensic>({
    id: 'forensic-init',
    symbol: 'rNVDA',
    companyName: 'NVIDIA Corp',
    reportPeriod: 'Recent SEC Filing & Disclosure',
    reportedEPS: 0.81,
    consensusEPS: 0.74,
    headlineSurprisePct: 9.46,
    guidanceToneScore: -28,
    linguisticHedgingFreq: 24.5,
    divergenceIndex: 68.2,
    recommendation: 'FADE_THE_POP',
    summaryQuote: 'Live SEC EDGAR & financial news wire ingestion initialized.',
    executionStatus: 'FLAGGED',
  });

  // Automatically fetch SEC EDGAR and news disclosures whenever selected ticker changes
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoadingSec(true);
      const [profile, newsSnippets] = await Promise.all([
        secEdgar.fetchCompanyFilings(selectedSymbol),
        newsService.fetchTickerDisclosures(selectedSymbol),
      ]);

      if (!isMounted) return;

      if (profile) {
        setSecProfile(profile);
        if (profile.recentFilings.length > 0) {
          setSelectedFiling(profile.recentFilings[0]);
        }
      }

      let docExcerpt: string | null = null;
      if (profile?.recentFilings[0]?.secUrl) {
        try {
          docExcerpt = await secEdgar.fetchFilingDocumentExcerpt(profile.recentFilings[0].secUrl);
        } catch {
          // Graceful fallback
        }
      }

      const tickerObj = market.getTicker(selectedSymbol);
      const companyName = profile?.name || tickerObj?.name || selectedSymbol;

      const combinedText = [
        docExcerpt ? `[SEC Primary Filing Excerpt]: "${docExcerpt}"` : '',
        ...(newsSnippets || []),
        profile?.recentFilings[0] ? `Latest SEC Form ${profile.recentFilings[0].form} filed on ${profile.recentFilings[0].filingDate} (${profile.recentFilings[0].primaryDocDescription})` : '',
      ].filter(Boolean).join('. ');

      setDisclosureExcerpt(combinedText || `Recent corporate filing and news flow telemetry for ${companyName}.`);

      setForensicReport(prev => ({
        ...prev,
        symbol: selectedSymbol,
        companyName,
        reportPeriod: profile?.recentFilings[0] ? `Form ${profile.recentFilings[0].form} (${profile.recentFilings[0].filingDate})` : 'Recent SEC Filing',
      }));

      setLoadingSec(false);
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [selectedSymbol]);

  const handleRunAiAudit = async () => {
    if (!disclosureExcerpt.trim()) return;
    setAnalyzing(true);
    audio.playPing();

    try {
      const res = await qwen.analyzeEarningsGuidance(
        selectedSymbol,
        forensicReport.reportedEPS,
        forensicReport.consensusEPS,
        disclosureExcerpt
      );

      setForensicReport(prev => ({
        ...prev,
        divergenceIndex: res.divergenceIndex,
        guidanceToneScore: res.toneScore,
        recommendation: res.recommendation as any,
        summaryQuote: res.rationale || disclosureExcerpt,
      }));

      audio.playSuccess();
    } catch (e) {
      console.error('Forensic analysis error:', e);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExecuteOrder = async () => {
    const tickerObj = market.getTicker(selectedSymbol) || market.getTickers()[0];
    const direction = forensicReport.recommendation === 'FADE_THE_POP' ? 'SHORT' : 'LONG';
    const sizeUSD = 35000;

    await bitgetTrading.executeOrder(
      tickerObj.symbol,
      direction,
      sizeUSD,
      'forensic',
      `ForensicAlpha ${forensicReport.recommendation}: Divergence ${forensicReport.divergenceIndex}/100 on ${selectedSymbol}`
    );

    setExecutedId(selectedSymbol + '-' + Date.now());
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FF3366', '#00FF66', '#00E5FF', '#000000']
    });
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner */}
      <div className={`p-5 border-3 border-black shadow-[4px_4px_0px_#000] flex flex-wrap items-center justify-between gap-4 transition-colors duration-150 ${
        isLight ? 'bg-white text-black' : 'bg-[#141715] text-white'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#FF3366] text-white border-2 border-black shadow-[2px_2px_0px_#000]">
            <FileSearch className="w-6 h-6" />
          </div>
          <div>
            <h2 className={`text-xl font-extrabold uppercase tracking-tight ${isLight ? 'text-black' : 'text-white'}`}>
              FORENSICALPHA : SEC EDGAR 8-K & GUIDANCE RADAR
            </h2>
            <p className={`text-xs ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>
              Real SEC Regulatory Filings, Tone Divergence & 7×24 rToken Hedging
            </p>
          </div>
        </div>

        {/* Ticker Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold">ASSET:</span>
          <div className="flex items-center gap-1">
            {TRACKED_SYMBOLS.map(sym => (
              <button
                key={sym}
                onClick={() => {
                  audio.playClick();
                  setSelectedSymbol(sym);
                }}
                className={`px-2.5 py-1 text-xs font-black border-2 border-black transition-all cursor-pointer ${
                  selectedSymbol === sym
                    ? 'bg-[#FF3366] text-white shadow-[2px_2px_0px_#000]'
                    : isLight ? 'bg-gray-100 hover:bg-gray-200' : 'bg-[#1E2420] text-gray-300 hover:text-white'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Official SEC EDGAR Submissions Feed */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className={`uppercase font-extrabold flex items-center gap-1.5 ${isLight ? 'text-black' : 'text-white'}`}>
              <Building2 className="w-4 h-4 text-[#FF3366]" />
              OFFICIAL SEC EDGAR SUBMISSIONS (CIK: {secProfile?.cik || 'FETCHING...'})
            </span>
            <span className={isLight ? 'text-gray-600' : 'text-gray-400'}>
              {loadingSec ? 'STREAMING...' : `${secProfile?.recentFilings.length || 0} FILINGS LOADED`}
            </span>
          </div>

          <div className="space-y-2.5">
            {secProfile?.recentFilings.map(filing => {
              const isSelected = selectedFiling?.accessionNumber === filing.accessionNumber;

              return (
                <div
                  key={filing.accessionNumber}
                  onClick={() => {
                    audio.playClick();
                    setSelectedFiling(filing);
                    setDisclosureExcerpt(`SEC Form ${filing.form} filed by ${secProfile.name} on ${filing.filingDate}. Primary document: ${filing.primaryDocDescription}.`);
                  }}
                  className={`p-3.5 border-2 border-black transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FF3366]/15 border-[#FF3366] shadow-[3px_3px_0px_#FF3366]'
                      : isLight ? 'bg-white hover:bg-gray-50 shadow-[2px_2px_0px_#000]' : 'bg-[#141715] hover:bg-[#1a1f1c] shadow-[2px_2px_0px_#000]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 text-xs font-black bg-black text-[#00FF66] border border-black">
                        {filing.form}
                      </span>
                      <span className="text-xs font-bold">{filing.filingDate}</span>
                    </div>

                    <a
                      href={filing.secUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="flex items-center gap-1 text-[11px] text-[#00E5FF] hover:underline font-bold"
                    >
                      SEC.gov <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="text-xs font-bold leading-snug">
                    {filing.primaryDocDescription || `Regulatory Disclosure (${filing.form})`}
                  </div>

                  <div className="text-[10px] text-gray-500 font-mono mt-1">
                    ACCESSION: {filing.accessionNumber}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Wire Snippets Box */}
          <div className={`p-4 border-2 border-black shadow-[3px_3px_0px_#000] ${
            isLight ? 'bg-white' : 'bg-[#141715]'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#00E5FF]" />
                DISCLOSURE & NEWS WIRE TRANSCRIPT FOR QWEN FORENSICS
              </span>
              <button
                onClick={() => {
                  audio.playPing();
                  newsService.fetchTickerDisclosures(selectedSymbol).then(snips => {
                    if (snips.length > 0) setDisclosureExcerpt(snips.join('. '));
                  });
                }}
                className="text-[10px] text-[#00E5FF] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Sync News Wire
              </button>
            </div>

            <textarea
              value={disclosureExcerpt}
              onChange={e => setDisclosureExcerpt(e.target.value)}
              rows={4}
              className={`w-full p-2.5 border-2 border-black text-xs font-bold outline-none resize-none ${
                isLight ? 'bg-[#F4F5F0] text-black' : 'bg-[#0C0E0D] text-white'
              }`}
              placeholder="Paste or sync live corporate statement or 8-K excerpt..."
            />

            <div className="mt-3 flex items-center justify-end">
              <BrutalistButton
                variant="yellow"
                size="sm"
                onClick={handleRunAiAudit}
                disabled={analyzing || !disclosureExcerpt.trim()}
                icon={analyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              >
                {analyzing ? 'QWEN FORENSIC REASONING...' : 'RUN FORENSIC AI AUDIT'}
              </BrutalistButton>
            </div>
          </div>
        </div>

        {/* Right Column: Forensic Quantitative Assessment */}
        <div className="lg:col-span-6 space-y-4">
          <div className="text-xs font-bold uppercase tracking-tight">
            QUANTITATIVE FORENSIC SYNTHESIS
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-4 border-2 border-black shadow-[3px_3px_0px_#000] ${isLight ? 'bg-white' : 'bg-[#141715]'}`}>
              <div className="text-[10px] font-bold text-gray-500 uppercase">Divergence Index</div>
              <div className="text-2xl font-black text-[#FF3366] mt-0.5">
                {forensicReport.divergenceIndex}/100
              </div>
              <div className="w-full bg-black/10 dark:bg-white/10 h-2 border border-black mt-2">
                <div
                  className="bg-[#FF3366] h-full"
                  style={{ width: `${Math.min(100, forensicReport.divergenceIndex)}%` }}
                />
              </div>
            </div>

            <div className={`p-4 border-2 border-black shadow-[3px_3px_0px_#000] ${isLight ? 'bg-white' : 'bg-[#141715]'}`}>
              <div className="text-[10px] font-bold text-gray-500 uppercase">Guidance Tone Score</div>
              <div className={`text-2xl font-black mt-0.5 ${forensicReport.guidanceToneScore < 0 ? 'text-[#FF3366]' : 'text-[#00FF66]'}`}>
                {forensicReport.guidanceToneScore > 0 ? '+' : ''}{forensicReport.guidanceToneScore}
              </div>
              <p className="text-[10px] text-gray-500 mt-1">Linguistic hedging vs. beat</p>
            </div>
          </div>

          {/* Recommendation Verdict Box */}
          <div className={`p-5 border-3 border-black shadow-[4px_4px_0px_#000] ${
            isLight ? 'bg-white' : 'bg-[#141715]'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase text-gray-500">Forensic Action Verdict</span>
              <BrutalistBadge variant={forensicReport.recommendation === 'FADE_THE_POP' ? 'red' : 'green'}>
                {forensicReport.recommendation}
              </BrutalistBadge>
            </div>

            <div className={`p-3.5 border-2 border-black mb-4 text-xs font-bold leading-relaxed ${
              isLight ? 'bg-[#F4F5F0]' : 'bg-[#0C0E0D]'
            }`}>
              "{forensicReport.summaryQuote}"
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t-2 border-black">
              <div className="text-xs">
                <span className="text-gray-500 font-bold">PROPOSED ACTION:</span>{' '}
                <span className="font-black text-[#FF3366]">
                  {forensicReport.recommendation === 'FADE_THE_POP' ? `SHORT $35,000 ${selectedSymbol}` : `LONG $35,000 ${selectedSymbol}`}
                </span>
              </div>

              <BrutalistButton
                variant={executedId?.startsWith(selectedSymbol) ? 'yellow' : (forensicReport.recommendation === 'FADE_THE_POP' ? 'red' : 'green')}
                size="md"
                onClick={handleExecuteOrder}
                icon={<Zap className="w-4 h-4 fill-current" />}
              >
                {executedId?.startsWith(selectedSymbol) ? 'HEDGE POSITION ACTIVE' : 'EXECUTE FORENSIC FADE ORDER'}
              </BrutalistButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
