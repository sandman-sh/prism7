import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { qwen } from '../../services/qwenService';
import { market } from '../../services/marketService';
import { BrutalistButton } from './BrutalistButton';
import { useTheme } from '../../context/ThemeContext';
import { ShieldCheck, CheckCircle, AlertTriangle, X, Cpu, Activity, Lock, RefreshCw, Zap } from 'lucide-react';

interface SystemStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemStatusModal: React.FC<SystemStatusModalProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);

  const wsStatus = market.getWsStatus();

  const handleTestQwen = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await qwen.testConnection();
    setTestResult(res);
    setTesting(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 15 }}
            className={`w-full max-w-lg border-3 border-black shadow-[8px_8px_0px_#000] p-6 relative font-mono ${
              isLight ? 'bg-white text-black' : 'bg-[#141715] text-white'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#00FF66] text-black border-2 border-black shadow-[2px_2px_0px_#000]">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight">PRISM 7 SYSTEM CORE & SECURITY</h3>
                  <p className={`text-xs ${isLight ? 'text-gray-700 font-bold' : 'text-[#00FF66]'}`}>
                    Zero-Trust Architecture • Server-Side Authentication
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 bg-[#FF3366] text-white border-2 border-black hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Zero-Trust Security Guarantee Banner */}
            <div className="p-3 border-2 border-black bg-[#00FF66]/15 text-black dark:text-white flex items-start gap-2.5 shadow-[2px_2px_0px_#000] mb-4">
              <ShieldCheck className="w-5 h-5 text-[#00AA44] shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-extrabold text-[#008833] dark:text-[#00FF66] block uppercase tracking-wider">
                  Zero Client-Side Credentials
                </span>
                <p className="text-[11px] text-gray-700 dark:text-gray-300 mt-0.5 leading-snug">
                  PRISM 7 never asks for or stores API keys, HMAC secrets, or tokens in browser storage. All AI reasoning is securely routed via encrypted server-side proxy.
                </p>
              </div>
            </div>

            {/* Subsystem Health Grid */}
            <div className="space-y-3">
              {/* 1. Qwen 3.8-Max AI Engine */}
              <div className={`p-3 border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-between ${
                isLight ? 'bg-[#F9FAF8]' : 'bg-[#181D1A]'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-pulse" />
                  <div>
                    <span className="text-xs font-black block">QWEN 3.8-MAX REASONING ENGINE</span>
                    <span className="text-[10px] text-gray-500 font-bold">Model: qwen3.8-max • Secure Proxy (/api/qwen)</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-[#00FF66] text-black border border-black text-[10px] font-extrabold shadow-[1px_1px_0px_#000]">
                  ACTIVE
                </span>
              </div>

              {/* 2. Bitget Real-Time Market Feed */}
              <div className={`p-3 border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-between ${
                isLight ? 'bg-[#F9FAF8]' : 'bg-[#181D1A]'
              }`}>
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-[#00E5FF]" />
                  <div>
                    <span className="text-xs font-black block">BITGET REAL-TIME FEED (WSS)</span>
                    <span className="text-[10px] text-gray-500 font-bold">
                      {wsStatus.connected ? `Connected • Latency: ${wsStatus.latencyMs}ms` : 'Connecting...'}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-[#00E5FF] text-black border border-black text-[10px] font-extrabold shadow-[1px_1px_0px_#000]">
                  BOOKS15 L2
                </span>
              </div>

              {/* 3. TradFi & SEC EDGAR Data Pipeline */}
              <div className={`p-3 border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-between ${
                isLight ? 'bg-[#F9FAF8]' : 'bg-[#181D1A]'
              }`}>
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-[#FFE600]" />
                  <div>
                    <span className="text-xs font-black block">SEC EDGAR & YAHOO FINANCE FEEDS</span>
                    <span className="text-[10px] text-gray-500 font-bold">Official 8-K Regulatory Wire & Cash Market Charts</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-[#FFE600] text-black border border-black text-[10px] font-extrabold shadow-[1px_1px_0px_#000]">
                  LIVE PROXY
                </span>
              </div>
            </div>

            {/* Test Connection Output */}
            {testResult && (
              <div className={`mt-4 p-2.5 border-2 border-black text-xs font-bold flex items-center gap-2 ${
                testResult.success ? 'bg-[#00FF66] text-black' : 'bg-[#FF3366] text-white'
              }`}>
                {testResult.success ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span className="truncate">{testResult.message}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between border-t-2 border-black pt-4 mt-5">
              <BrutalistButton
                variant="yellow"
                size="sm"
                onClick={handleTestQwen}
                disabled={testing}
                icon={testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              >
                {testing ? 'TESTING...' : 'PING QWEN 3.8-MAX'}
              </BrutalistButton>

              <BrutalistButton variant="white" size="sm" onClick={onClose}>
                CLOSE
              </BrutalistButton>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
