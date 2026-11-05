import React from 'react';
import { PipelineStep, PipelineStatus } from '../../types';
import { CheckCircle2, Clock, PlayCircle, RefreshCw } from 'lucide-react';

interface PbiProcessStripProps {
  steps: PipelineStep[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export const PbiProcessStrip: React.FC<PbiProcessStripProps> = ({
  steps,
  onRefresh,
  isRefreshing = false,
  className = '',
}) => {
  const renderStatusBadge = (status: PipelineStatus) => {
    switch (status) {
      case 'Selesai':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#107C41] bg-[#F1F9F4] px-1.5 py-0.5 rounded-[2px] border border-[#D5EEDD]">
            <CheckCircle2 className="w-2.5 h-2.5" />
            Selesai
          </span>
        );
      case 'Berjalan':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#0078D4] bg-[#F0F6FF] px-1.5 py-0.5 rounded-[2px] border border-[#CCE4F7] animate-pulse">
            <PlayCircle className="w-2.5 h-2.5" />
            Berjalan
          </span>
        );
      case 'Menunggu':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#605E5C] bg-[#F3F2F1] px-1.5 py-0.5 rounded-[2px] border border-[#E1DFDD]">
            <Clock className="w-2.5 h-2.5" />
            Menunggu
          </span>
        );
    }
  };

  return (
    <div className={`bg-white border border-[#E1DFDD] rounded-[2px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] px-3 py-2 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-[#323130] uppercase tracking-wider">
            Status Pipeline Data Rekonsiliasi
          </span>
          <span className="text-[10px] text-[#8A8886]">
            (Tahapan pipeline data dummy)
          </span>
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1 text-[10px] text-[#0078D4] hover:text-[#106EBE] hover:underline transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Sinkronisasi...' : 'Sinkronkan Pipeline'}</span>
          </button>
        )}
      </div>

      {/* 4 Steps Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {steps.map((step, idx) => (
          <div
            key={step.id || idx}
            className="bg-[#FAF9F8] border border-[#EDEBE9] rounded-[2px] p-2 flex flex-col justify-between hover:border-[#C8C6C4] transition-colors"
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[11px] font-semibold text-[#323130] truncate">
                {step.name}
              </span>
              {renderStatusBadge(step.status)}
            </div>

            <div className="text-[12px] font-bold text-[#323130] truncate tabular-nums">
              {step.primaryMetric}
            </div>

            <div className="text-[9.5px] text-[#605E5C] truncate mt-0.5" title={step.secondaryInfo}>
              {step.secondaryInfo}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
