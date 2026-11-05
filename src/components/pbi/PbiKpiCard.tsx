import React from 'react';
import { PbiVisualHeader } from './PbiVisualHeader';

interface PbiKpiCardProps {
  title: string;
  value: string;
  subtext?: string;
  trendText?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  accentColor?: string;
  onFocus?: () => void;
  className?: string;
}

export const PbiKpiCard: React.FC<PbiKpiCardProps> = ({
  title,
  value,
  subtext,
  trendText,
  trendType = 'neutral',
  accentColor,
  onFocus,
  className = '',
}) => {
  return (
    <div
      className={`bg-white border border-[#E1DFDD] rounded-[2px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col justify-between overflow-hidden relative group transition-all hover:border-[#C8C6C4] ${className}`}
    >
      {/* Visual Header */}
      <PbiVisualHeader title={title} onFocus={onFocus} />

      {/* Main KPI Callout Body */}
      <div className="px-3 pb-3 pt-0 flex-1 flex flex-col justify-center">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span
            className="text-[23px] font-bold tracking-tight text-[#323130] tabular-nums leading-none"
            style={accentColor ? { color: accentColor } : undefined}
          >
            {value}
          </span>
        </div>

        {/* Subtext and Trend Indicator */}
        {(subtext || trendText) && (
          <div className="flex items-center justify-between text-[11px] text-[#605E5C] mt-2 pt-1.5 border-t border-[#F3F2F1]">
            {subtext && <span className="truncate">{subtext}</span>}
            {trendText && (
              <span
                className={`text-[10px] font-medium ml-auto shrink-0 ${
                  trendType === 'positive'
                    ? 'text-[#107C41]'
                    : trendType === 'negative'
                    ? 'text-[#D13438]'
                    : 'text-[#605E5C]'
                }`}
              >
                {trendText}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Subtle bottom accent line if specified */}
      {accentColor && (
        <div
          className="h-[3px] w-full"
          style={{ backgroundColor: accentColor }}
        />
      )}
    </div>
  );
};
