import React from 'react';
import { PbiVisualHeader } from './PbiVisualHeader';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PbiKpiCardProps {
  title: string;
  value: string;
  plainExplanation?: string;
  subtext?: string;
  comparisonText?: string;
  comparisonDirection?: 'up' | 'down' | 'flat';
  isDeviationMetric?: boolean;
  accentColor?: string;
  caraMembaca?: string;
  onFocus?: () => void;
  className?: string;
}

export const PbiKpiCard: React.FC<PbiKpiCardProps> = ({
  title,
  value,
  plainExplanation,
  subtext,
  comparisonText,
  comparisonDirection = 'flat',
  isDeviationMetric = false,
  accentColor,
  caraMembaca,
  onFocus,
  className = '',
}) => {
  // Arrow coloring: strictly neutral #6B7280 unless it is a deviation measure
  let comparisonColorClass = 'text-[#6B7280]';
  if (isDeviationMetric) {
    if (comparisonDirection === 'up') comparisonColorClass = 'text-[#C62828]';
    if (comparisonDirection === 'down') comparisonColorClass = 'text-[#1E8E5A]';
  }

  return (
    <div
      className={`bg-white border border-[#E1E5EB] rounded-[2px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between overflow-hidden relative group transition-all hover:border-[#CBD5E1] ${className}`}
    >
      {/* Visual Header with Title and Optional "i" Info */}
      <PbiVisualHeader
        title={title}
        caraMembaca={caraMembaca}
        onFocus={onFocus}
      />

      {/* Main KPI Body */}
      <div className="px-3.5 pb-3 pt-0 flex-1 flex flex-col justify-between">
        {/* One-line plain explanation under KPI title */}
        {plainExplanation && (
          <p className="text-[11px] text-[#6B7280] leading-tight mb-2">
            {plainExplanation}
          </p>
        )}

        {/* Large Value Callout (28-30px semibold) */}
        <div className="flex items-baseline my-1">
          <span
            className="text-[28px] font-semibold tracking-tight text-[#1F2937] tabular-nums leading-none"
            style={accentColor ? { color: accentColor } : undefined}
          >
            {value}
          </span>
        </div>

        {/* Footer: Subtext & Neutral Comparison to Previous Period */}
        {(subtext || comparisonText) && (
          <div className="flex items-center justify-between text-[11px] text-[#6B7280] mt-2 pt-1.5 border-t border-[#F4F6F9]">
            {subtext && <span className="truncate">{subtext}</span>}
            {comparisonText && (
              <div className={`flex items-center gap-1 font-medium ml-auto shrink-0 ${comparisonColorClass}`}>
                {comparisonDirection === 'up' && <TrendingUp className="w-3 h-3" />}
                {comparisonDirection === 'down' && <TrendingDown className="w-3 h-3" />}
                {comparisonDirection === 'flat' && <Minus className="w-3 h-3" />}
                <span>{comparisonText}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Subtle bottom accent line */}
      {accentColor && (
        <div
          className="h-[2px] w-full"
          style={{ backgroundColor: accentColor }}
        />
      )}
    </div>
  );
};

