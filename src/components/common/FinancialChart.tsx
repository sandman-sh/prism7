import React, { useRef, useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { BrutalistBadge } from './BrutalistBadge';

export interface CandleDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  spreadZ?: number;
}

interface FinancialChartProps {
  title: string;
  subtitle?: string;
  symbol: string;
  data: CandleDataPoint[];
  showSpreadMode?: boolean;
  spreadThreshold?: number;
  height?: number;
}

export const FinancialChart: React.FC<FinancialChartProps> = ({
  title,
  subtitle,
  symbol,
  data,
  showSpreadMode = false,
  spreadThreshold = 2.0,
  height = 320,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [activeMode, setActiveMode] = useState<'candles' | 'spread'>(showSpreadMode ? 'spread' : 'candles');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    // Clear background
    ctx.clearRect(0, 0, w, h);

    const padding = { top: 20, right: 65, bottom: 45, left: 15 };
    const chartWidth = w - padding.left - padding.right;
    const chartHeight = h - padding.top - padding.bottom;

    if (activeMode === 'candles') {
      // 1. Candlestick & Volume Chart
      const priceMin = Math.min(...data.map(d => d.low)) * 0.998;
      const priceMax = Math.max(...data.map(d => d.high)) * 1.002;
      const priceRange = priceMax - priceMin || 1;

      const maxVol = Math.max(...data.map(d => d.volume)) || 1;
      const volAreaHeight = chartHeight * 0.22;
      const candleAreaHeight = chartHeight * 0.75;

      // Draw Gridlines
      ctx.strokeStyle = isLight ? '#E5E7EB' : '#1F2421';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      const gridSteps = 4;
      for (let i = 0; i <= gridSteps; i++) {
        const y = padding.top + (candleAreaHeight / gridSteps) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(w - padding.right, y);
        ctx.stroke();

        // Price label on right
        const priceVal = priceMax - (priceRange / gridSteps) * i;
        ctx.fillStyle = isLight ? '#6B7280' : '#9CA3AF';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`$${priceVal.toFixed(2)}`, w - padding.right + 6, y + 3);
      }
      ctx.setLineDash([]);

      const barStep = chartWidth / data.length;
      const barWidth = Math.max(3, barStep * 0.7);

      data.forEach((d, idx) => {
        const isBull = d.close >= d.open;
        const x = padding.left + idx * barStep + barStep / 2;

        // Volume Bar
        const volH = (d.volume / maxVol) * volAreaHeight;
        const volY = padding.top + chartHeight - volH;
        ctx.fillStyle = isBull
          ? (isLight ? 'rgba(0, 180, 80, 0.25)' : 'rgba(0, 255, 102, 0.25)')
          : (isLight ? 'rgba(230, 40, 70, 0.25)' : 'rgba(255, 51, 102, 0.25)');
        ctx.fillRect(x - barWidth / 2, volY, barWidth, volH);

        // Candle Wick
        const highY = padding.top + ((priceMax - d.high) / priceRange) * candleAreaHeight;
        const lowY = padding.top + ((priceMax - d.low) / priceRange) * candleAreaHeight;

        ctx.strokeStyle = isBull ? (isLight ? '#00A344' : '#00FF66') : '#FF3366';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Candle Body
        const openY = padding.top + ((priceMax - d.open) / priceRange) * candleAreaHeight;
        const closeY = padding.top + ((priceMax - d.close) / priceRange) * candleAreaHeight;
        const bodyY = Math.min(openY, closeY);
        const bodyH = Math.max(2, Math.abs(closeY - openY));

        ctx.fillStyle = isBull ? (isLight ? '#00C853' : '#00FF66') : '#FF3366';
        ctx.fillRect(x - barWidth / 2, bodyY, barWidth, bodyH);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - barWidth / 2, bodyY, barWidth, bodyH);
      });

      // Time axis labels
      ctx.fillStyle = isLight ? '#6B7280' : '#9CA3AF';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      const labelInterval = Math.max(1, Math.floor(data.length / 5));
      for (let i = 0; i < data.length; i += labelInterval) {
        const x = padding.left + i * barStep + barStep / 2;
        ctx.fillText(data[i].time, x, h - padding.bottom + 18);
      }
    } else {
      // 2. Co-Integration Spread Z-Score Oscillator Chart
      const zValues = data.map(d => d.spreadZ ?? 0);
      const zMin = Math.min(-3.0, ...zValues) * 1.1;
      const zMax = Math.max(3.0, ...zValues) * 1.1;
      const zRange = zMax - zMin || 1;

      // Threshold Bands (+2σ and -2σ)
      const upperY = padding.top + ((zMax - spreadThreshold) / zRange) * chartHeight;
      const lowerY = padding.top + ((zMax - (-spreadThreshold)) / zRange) * chartHeight;
      const zeroY = padding.top + ((zMax - 0) / zRange) * chartHeight;

      // Shaded Oversold / Overbought Zones
      ctx.fillStyle = isLight ? 'rgba(255, 51, 102, 0.08)' : 'rgba(255, 51, 102, 0.12)';
      ctx.fillRect(padding.left, padding.top, chartWidth, upperY - padding.top);
      ctx.fillStyle = isLight ? 'rgba(0, 200, 83, 0.08)' : 'rgba(0, 255, 102, 0.12)';
      ctx.fillRect(padding.left, lowerY, chartWidth, h - padding.bottom - lowerY);

      // Lines for +2σ, 0, -2σ
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);

      ctx.strokeStyle = '#FF3366';
      ctx.beginPath();
      ctx.moveTo(padding.left, upperY);
      ctx.lineTo(w - padding.right, upperY);
      ctx.stroke();

      ctx.strokeStyle = isLight ? '#9CA3AF' : '#4B5563';
      ctx.beginPath();
      ctx.moveTo(padding.left, zeroY);
      ctx.lineTo(w - padding.right, zeroY);
      ctx.stroke();

      ctx.strokeStyle = '#00FF66';
      ctx.beginPath();
      ctx.moveTo(padding.left, lowerY);
      ctx.lineTo(w - padding.right, lowerY);
      ctx.stroke();

      ctx.setLineDash([]);

      // Z-Score Labels
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#FF3366';
      ctx.fillText(`+${spreadThreshold}σ (SHORT)`, w - padding.right + 6, upperY + 3);
      ctx.fillStyle = isLight ? '#6B7280' : '#9CA3AF';
      ctx.fillText(`0.0σ (MEAN)`, w - padding.right + 6, zeroY + 3);
      ctx.fillStyle = '#00FF66';
      ctx.fillText(`-${spreadThreshold}σ (LONG)`, w - padding.right + 6, lowerY + 3);

      // Plot Z-Score Line
      const barStep = chartWidth / (data.length - 1 || 1);
      ctx.beginPath();
      data.forEach((d, i) => {
        const z = d.spreadZ ?? 0;
        const x = padding.left + i * barStep;
        const y = padding.top + ((zMax - z) / zRange) * chartHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = isLight ? '#007A9E' : '#00E5FF';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Dot markers
      data.forEach((d, i) => {
        const z = d.spreadZ ?? 0;
        const x = padding.left + i * barStep;
        const y = padding.top + ((zMax - z) / zRange) * chartHeight;

        ctx.fillStyle = Math.abs(z) >= spreadThreshold ? (z > 0 ? '#FF3366' : '#00FF66') : (isLight ? '#007A9E' : '#00E5FF');
        ctx.beginPath();
        ctx.arc(x, y, Math.abs(z) >= spreadThreshold ? 4.5 : 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Time axis
      ctx.fillStyle = isLight ? '#6B7280' : '#9CA3AF';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      const labelInterval = Math.max(1, Math.floor(data.length / 5));
      for (let i = 0; i < data.length; i += labelInterval) {
        const x = padding.left + i * barStep;
        ctx.fillText(data[i].time, x, h - padding.bottom + 18);
      }
    }

    // Crosshair on hover
    if (hoverIndex !== null && data[hoverIndex]) {
      const barStep = chartWidth / (data.length > 1 ? data.length - 1 : 1);
      const x = padding.left + hoverIndex * barStep;

      ctx.strokeStyle = isLight ? '#000000' : '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, h - padding.bottom);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [data, isLight, activeMode, spreadThreshold, hoverIndex]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const paddingLeft = 15;
    const paddingRight = 65;
    const chartWidth = rect.width - paddingLeft - paddingRight;

    const relX = Math.max(0, Math.min(chartWidth, x - paddingLeft));
    const idx = Math.min(data.length - 1, Math.floor((relX / chartWidth) * data.length));
    setHoverIndex(idx);
  };

  const activePoint = hoverIndex !== null && data[hoverIndex] ? data[hoverIndex] : data[data.length - 1];

  return (
    <div
      ref={containerRef}
      className={`border-3 border-black p-4 shadow-[4px_4px_0px_#000] font-mono transition-colors duration-150 ${
        isLight ? 'bg-white text-black' : 'bg-[#141715] text-white'
      }`}
    >
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-black tracking-tight">{title}</span>
            <BrutalistBadge variant="yellow">{symbol}</BrutalistBadge>
          </div>
          {subtitle && (
            <p className={`text-xs mt-0.5 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              {subtitle}
            </p>
          )}
        </div>

        {/* View Switcher */}
        {showSpreadMode && (
          <div className="flex items-center gap-1 border-2 border-black p-0.5 bg-black/10">
            <button
              onClick={() => setActiveMode('candles')}
              className={`px-2.5 py-1 text-xs font-bold transition-colors ${
                activeMode === 'candles' ? 'bg-[#FFE600] text-black border border-black' : 'text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              CANDLES & VOL
            </button>
            <button
              onClick={() => setActiveMode('spread')}
              className={`px-2.5 py-1 text-xs font-bold transition-colors ${
                activeMode === 'spread' ? 'bg-[#00E5FF] text-black border border-black' : 'text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              SPREAD Z-SCORE (σ)
            </button>
          </div>
        )}
      </div>

      {/* Hover Telemetry Bar */}
      {activePoint && (
        <div className={`flex flex-wrap items-center gap-3 text-xs py-1.5 px-3 border border-black mb-3 ${
          isLight ? 'bg-[#F4F5F0]' : 'bg-[#0C0E0D]'
        }`}>
          <span className="font-bold text-gray-500">DATE: <span className={isLight ? 'text-black font-extrabold' : 'text-white font-extrabold'}>{activePoint.time}</span></span>
          <span className="font-bold text-gray-500">O: <span className="font-extrabold text-blue-400">${activePoint.open.toFixed(2)}</span></span>
          <span className="font-bold text-gray-500">H: <span className="font-extrabold text-emerald-400">${activePoint.high.toFixed(2)}</span></span>
          <span className="font-bold text-gray-500">L: <span className="font-extrabold text-rose-400">${activePoint.low.toFixed(2)}</span></span>
          <span className="font-bold text-gray-500">C: <span className={`font-extrabold ${activePoint.close >= activePoint.open ? 'text-[#00FF66]' : 'text-[#FF3366]'}`}>${activePoint.close.toFixed(2)}</span></span>
          {activePoint.spreadZ !== undefined && (
            <span className="font-bold text-gray-500">Z-SCORE: <span className={`font-black ${Math.abs(activePoint.spreadZ) >= spreadThreshold ? (activePoint.spreadZ > 0 ? 'text-[#FF3366]' : 'text-[#00FF66]') : 'text-[#00E5FF]'}`}>
              {activePoint.spreadZ > 0 ? '+' : ''}{activePoint.spreadZ.toFixed(2)}σ
            </span></span>
          )}
          <span className="font-bold text-gray-500">VOL: <span className={isLight ? 'text-black' : 'text-white'}>{activePoint.volume.toLocaleString()}</span></span>
        </div>
      )}

      {/* Canvas */}
      <div className="relative w-full" style={{ height: `${height}px` }}>
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
          className="w-full h-full cursor-crosshair"
        />
      </div>
    </div>
  );
};
