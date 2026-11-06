import React, { useState } from 'react';
import { PbiVisualHeader } from './PbiVisualHeader';
import { formatNumber, formatPercentage } from '../../data/mockData';
import { getStatusDisplayLabel, DeviationStatus } from '../../types';

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface PbiDonutChartProps {
  title: string;
  subtitle?: string;
  caraMembaca?: string;
  data: DonutSlice[];
  centerLabel?: string;
  centerValue?: string;
  onFocus?: () => void;
  onExportCsv?: () => void;
  className?: string;
}

export const PbiDonutChart: React.FC<PbiDonutChartProps> = ({
  title,
  subtitle,
  caraMembaca,
  data,
  centerLabel = 'Total Records',
  centerValue,
  onFocus,
  onExportCsv,
  className = '',
}) => {
  const [hoveredSlice, setHoveredSlice] = useState<DonutSlice | null>(null);

  const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1;

  // SVG coordinate calculations for annular pie
  const size = 180;
  const center = size / 2;
  const outerRadius = 72;
  const innerRadius = 46;

  let cumulativeAngle = -Math.PI / 2; // start from top (-90 deg)

  const slicesWithAngles = data.map((slice) => {
    const angle = (slice.value / total) * 2 * Math.PI;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;

    // Outer arc coords
    const x1 = center + outerRadius * Math.cos(startAngle);
    const y1 = center + outerRadius * Math.sin(startAngle);
    const x2 = center + outerRadius * Math.cos(endAngle);
    const y2 = center + outerRadius * Math.sin(endAngle);

    // Inner arc coords
    const x3 = center + innerRadius * Math.cos(endAngle);
    const y3 = center + innerRadius * Math.sin(endAngle);
    const x4 = center + innerRadius * Math.cos(startAngle);
    const y4 = center + innerRadius * Math.sin(startAngle);

    const largeArcFlag = angle > Math.PI ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
      'Z',
    ].join(' ');

    const percentage = (slice.value / total) * 100;

    return {
      ...slice,
      pathData,
      percentage,
    };
  });

  return (
    <div
      className={`bg-white border border-[#E1E5EB] rounded-[2px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col relative transition-all hover:border-[#CBD5E1] ${className}`}
    >
      <PbiVisualHeader
        title={title}
        subtitle={subtitle}
        caraMembaca={caraMembaca}
        onFocus={onFocus}
        onExportCsv={onExportCsv}
      />

      <div className="flex flex-col sm:flex-row items-center justify-center p-3 gap-3 flex-1 min-h-[190px]">
        {/* Donut SVG Ring */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="overflow-visible select-none"
          >
            {slicesWithAngles.map((slice, idx) => {
              const isHovered = hoveredSlice?.label === slice.label;
              return (
                <path
                  key={idx}
                  d={slice.pathData}
                  fill={slice.color}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  className="cursor-pointer transition-transform duration-150 origin-center hover:opacity-90"
                  style={{
                    transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                    transformOrigin: `${center}px ${center}px`,
                  }}
                  onMouseEnter={() => setHoveredSlice(slice)}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
              );
            })}
          </svg>

          {/* Center Callout Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
            <span className="text-[17px] font-bold text-[#323130] leading-tight tabular-nums">
              {centerValue || formatNumber(total)}
            </span>
            <span className="text-[10px] text-[#605E5C] leading-none mt-0.5">
              {centerLabel}
            </span>
          </div>
        </div>

        {/* Power BI Legend with Metric Breakdown */}
        <div className="flex flex-col gap-2 min-w-[150px] w-full sm:w-auto text-[11px] border-t sm:border-t-0 sm:border-l border-[#F3F2F1] pt-2 sm:pt-0 sm:pl-3">
          {slicesWithAngles.map((slice, idx) => {
            const isHovered = hoveredSlice?.label === slice.label;
            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredSlice(slice)}
                onMouseLeave={() => setHoveredSlice(null)}
                className={`flex items-center justify-between gap-3 p-1 rounded cursor-pointer transition-colors ${
                  isHovered ? 'bg-[#F3F2F1]' : 'hover:bg-[#FAF9F8]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-[1px] shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="text-[#323130] font-medium truncate">
                    {slice.label}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-semibold text-[#323130] tabular-nums mr-1.5">
                    {formatNumber(slice.value)}
                  </span>
                  <span className="text-[#8A8886] tabular-nums text-[10px]">
                    ({formatPercentage(slice.percentage)})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
