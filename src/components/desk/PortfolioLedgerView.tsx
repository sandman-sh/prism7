import React, { useState, useEffect } from 'react';
import { ledger, PerformanceMetrics } from '../../services/paperTradingService';
import { PaperPosition, TradeAuditLog } from '../../types';
import { BrutalistBadge } from '../common/BrutalistBadge';
import { useTheme } from '../../context/ThemeContext';
import { 
  PieChart, 
  FileText
} from 'lucide-react';

export const PortfolioLedgerView: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [positions, setPositions] = useState<PaperPosition[]>(ledger.getPositions());
  const [logs, setLogs] = useState<TradeAuditLog[]>(ledger.getLogs());
  const [metrics, setMetrics] = useState<PerformanceMetrics>(ledger.getMetrics());

  useEffect(() => {
    const unsub = ledger.subscribe(() => {
      setPositions(ledger.getPositions());
      setLogs(ledger.getLogs());
      setMetrics(ledger.getMetrics());
    });
    return unsub;
  }, []);

  const handleClosePosition = (id: string) => {
    ledger.closePosition(id);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner & KPI Stat Cards */}
      <div className={`p-5 border-3 border-black shadow-[4px_4px_0px_#000] flex flex-wrap items-center justify-between gap-4 transition-colors duration-150 ${
        isLight ? 'bg-white text-black' : 'bg-[#141715] text-white'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#00FF66] text-black border-2 border-black shadow-[2px_2px_0px_#000]">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <h2 className={`text-xl font-extrabold uppercase tracking-tight ${isLight ? 'text-black' : 'text-white'}`}>
              PAPER TRADING EXECUTION LEDGER
            </h2>
            <p className={`text-xs ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>
              Verifiable Atomic Transactions Across All 5 Multi-Agent Engines
            </p>
          </div>
        </div>

        <BrutalistBadge variant="green">
          AUDIT TRAIL VERIFIED
        </BrutalistBadge>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className={`p-3 border-2 border-black shadow-[3px_3px_0px_#000] ${isLight ? 'bg-white' : 'bg-[#141715]'}`}>
          <div className={`text-[10px] font-bold ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>TOTAL PORTFOLIO EQUITY</div>
          <div className={`text-lg font-black ${isLight ? 'text-[#008F39]' : 'text-[#00FF66]'}`}>
            ${metrics.totalEquityUSD.toLocaleString()}
          </div>
        </div>

        <div className={`p-3 border-2 border-black shadow-[3px_3px_0px_#000] ${isLight ? 'bg-white' : 'bg-[#141715]'}`}>
          <div className={`text-[10px] font-bold ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>REALIZED P&L</div>
          <div className={`text-lg font-black ${isLight ? 'text-black' : 'text-white'}`}>
            +${metrics.realizedPnlUSD.toLocaleString()}
          </div>
        </div>

        <div className={`p-3 border-2 border-black shadow-[3px_3px_0px_#000] ${isLight ? 'bg-white' : 'bg-[#141715]'}`}>
          <div className={`text-[10px] font-bold ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>UNREALIZED P&L</div>
          <div className={`text-lg font-black ${
            metrics.unrealizedPnlUSD >= 0 
              ? (isLight ? 'text-[#008F39]' : 'text-[#00FF66]')
              : 'text-[#FF3366]'
          }`}>
            {metrics.unrealizedPnlUSD >= 0 ? '+' : ''}${metrics.unrealizedPnlUSD.toLocaleString()}
          </div>
        </div>

        <div className={`p-3 border-2 border-black shadow-[3px_3px_0px_#000] ${isLight ? 'bg-white' : 'bg-[#141715]'}`}>
          <div className={`text-[10px] font-bold ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>SHARPE RATIO</div>
          <div className={`text-lg font-black ${isLight ? 'text-black' : 'text-[#FFE600]'}`}>
            {metrics.sharpeRatio}
          </div>
        </div>

        <div className={`p-3 border-2 border-black shadow-[3px_3px_0px_#000] ${isLight ? 'bg-white' : 'bg-[#141715]'}`}>
          <div className={`text-[10px] font-bold ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>WIN RATE</div>
          <div className={`text-lg font-black ${isLight ? 'text-[#007A9E]' : 'text-[#00E5FF]'}`}>
            {metrics.winRatePct}%
          </div>
        </div>

        <div className={`p-3 border-2 border-black shadow-[3px_3px_0px_#000] ${isLight ? 'bg-white' : 'bg-[#141715]'}`}>
          <div className={`text-[10px] font-bold ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>MAX DRAWDOWN</div>
          <div className="text-lg font-black text-[#FF3366]">
            {metrics.maxDrawdownPct}%
          </div>
        </div>
      </div>

      {/* Active Open Positions Table */}
      <div className={`border-3 border-black shadow-[5px_5px_0px_#000] p-5 space-y-4 ${
        isLight ? 'bg-white text-black' : 'bg-[#121513] text-white'
      }`}>
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#00FF66] border border-black inline-block animate-ping" />
            <h3 className={`font-extrabold text-base ${isLight ? 'text-black' : 'text-white'}`}>
              ACTIVE OPEN POSITIONS ({positions.length})
            </h3>
          </div>
          <span className={`text-xs font-bold ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>
            MARK-TO-MARKET TICK LOG
          </span>
        </div>

        {positions.length === 0 ? (
          <div className={`p-8 text-center text-xs font-bold ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            Zero active open positions. Execute setups from ChronoArb, Dialectic Desk, Silicon Symbiosis, ForensicAlpha, or CascadeGuard.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`border-b border-black text-[10px] uppercase font-bold ${
                isLight ? 'bg-[#F4F5F0] text-black' : 'bg-[#0B0D0C] text-gray-400'
              }`}>
                <tr>
                  <th className="p-2.5">SYMBOL</th>
                  <th className="p-2.5">DIR</th>
                  <th className="p-2.5">ENGINE ORIGIN</th>
                  <th className="p-2.5">ENTRY</th>
                  <th className="p-2.5">CURRENT</th>
                  <th className="p-2.5">SIZE (USD)</th>
                  <th className="p-2.5">PNL ($ / %)</th>
                  <th className="p-2.5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-gray-200' : 'divide-gray-800'}`}>
                {positions.map(pos => {
                  const isProfitable = pos.pnlUSD >= 0;
                  return (
                    <tr key={pos.id} className={`transition-colors ${isLight ? 'hover:bg-[#F8F9F6]' : 'hover:bg-[#181D1A]'}`}>
                      <td className={`p-2.5 font-black ${isLight ? 'text-black' : 'text-white'}`}>{pos.symbol}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-1.5 py-0.5 border border-black font-extrabold text-[10px] shadow-[1px_1px_0px_#000] ${
                            pos.direction === 'LONG' ? 'bg-[#00FF66] text-black' : 'bg-[#FF3366] text-white'
                          }`}
                        >
                          {pos.direction}
                        </span>
                      </td>
                      <td className={`p-2.5 uppercase font-bold text-[10px] ${isLight ? 'text-[#007A9E]' : 'text-[#00E5FF]'}`}>
                        {pos.engineOrigin}
                      </td>
                      <td className={`p-2.5 font-bold ${isLight ? 'text-gray-800' : 'text-gray-300'}`}>${pos.entryPrice}</td>
                      <td className={`p-2.5 font-black ${isLight ? 'text-black' : 'text-white'}`}>${pos.currentPrice}</td>
                      <td className={`p-2.5 font-bold ${isLight ? 'text-gray-800' : 'text-gray-300'}`}>${pos.sizeUSD.toLocaleString()}</td>
                      <td className="p-2.5">
                        <span className={`font-black ${
                          isProfitable 
                            ? (isLight ? 'text-[#008F39]' : 'text-[#00FF66]')
                            : 'text-[#FF3366]'
                        }`}>
                          {isProfitable ? '+' : ''}${pos.pnlUSD.toFixed(2)} ({isProfitable ? '+' : ''}{pos.pnlPercent.toFixed(2)}%)
                        </span>
                      </td>
                      <td className="p-2.5 text-right">
                        <button
                          onClick={() => handleClosePosition(pos.id)}
                          className="px-2 py-1 bg-[#FF3366] hover:bg-[#d90429] text-white border border-black text-[10px] font-bold transition-all shadow-[1px_1px_0px_#000] cursor-pointer"
                        >
                          LIQUIDATE
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Complete Historical Audit Logs */}
      <div className={`border-3 border-black shadow-[5px_5px_0px_#000] p-5 space-y-4 ${
        isLight ? 'bg-white text-black' : 'bg-[#121513] text-white'
      }`}>
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-black" />
            <h3 className={`font-extrabold text-base ${isLight ? 'text-black' : 'text-white'}`}>
              TRANSACTION AUDIT LOGS ({logs.length})
            </h3>
          </div>
          <span className={`text-xs font-bold ${isLight ? 'text-[#008F39]' : 'text-[#FFE600]'}`}>
            IMMUTABLE REASONING LOGS
          </span>
        </div>

        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          {logs.map(log => (
            <div
              key={log.id}
              className={`p-3 border border-black flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                isLight ? 'bg-[#F8F9F6]' : 'bg-[#0B0D0C]'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] ${isLight ? 'text-gray-600 font-bold' : 'text-gray-500'}`}>{log.timestamp}</span>
                  <span className="text-[#00FF66] font-bold uppercase text-[10px] bg-black px-1 border border-black">
                    {log.engineOrigin}
                  </span>
                  <span className={`font-extrabold ${isLight ? 'text-black' : 'text-white'}`}>{log.direction} {log.symbol}</span>
                  <span className={isLight ? 'text-gray-700 font-bold' : 'text-gray-400'}>@ ${log.price} (${log.sizeUSD.toLocaleString()})</span>
                </div>
                <p className={`text-[11px] ${isLight ? 'text-gray-800 font-medium' : 'text-gray-300'}`}>{log.rationale}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-[#00FF66] text-black border border-black text-[10px] font-black shadow-[1px_1px_0px_#000]">
                  {log.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
