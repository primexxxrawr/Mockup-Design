import React, { useState } from 'react';
import { PbiVisualHeader } from './PbiVisualHeader';
import { formatCompactRupiah, formatRupiah, formatCompactVal, formatCurrencyVal } from '../../data/mockData';

export interface GenericClusteredItem {
  category: string;
  val1: number;
  val2: number;
}

interface PbiClusteredColumnChartProps {
  title: string;
  subtitle?: string;
  data: GenericClusteredItem[];
  series1Name: string;
  series1Color: string;
  series2Name: string;
  series2Color: string;
  currency?: 'IDR' | 'USD';
  onFocus?: () => void;
  onExportCsv?: () => void;
  className?: string;
}

export const PbiClusteredColumnChart: React.FC<PbiClusteredColumnChartProps> = ({
  title,
  subtitle,
  data,
  series1Name,
  series1Color,
  series2Name,
  series2Color,
  currency = 'IDR',
  onFocus,
  onExportCsv,
  className = '',
}) => {
  const [hoveredBar, setHoveredBar] = useState<{
    category: string;
    series: string;
    value: number;
    color: string;
    x: number;
    y: number;
  } | null>(null);

  const maxValue = Math.max(
    ...data.flatMap((d) => [d.val1, d.val2]),
    100
  );
  const yMax = Math.ceil(maxValue * 1.15) || 100;

  const ticksCount = 4;
  const yTicks = Array.from({ length: ticksCount + 1 }, (_, i) => (yMax / ticksCount) * (ticksCount - i));

  const chartHeight = 180;
  const chartWidth = 520;
  const paddingLeft = currency === 'IDR' ? 62 : 54;
  const paddingRight = 16;
  const paddingTop = 20;
  const paddingBottom = 32;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const categoryWidth = innerWidth / (data.length || 1);
  const barWidth = Math.min(24, Math.max(8, (categoryWidth - 14) / 2));

  return (
    <div
      className={`bg-white border border-[#E1DFDD] rounded-[2px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col relative transition-all hover:border-[#C8C6C4] ${className}`}
    >
      <PbiVisualHeader
        title={title}
        subtitle={subtitle}
        onFocus={onFocus}
        onExportCsv={onExportCsv}
      />

      {/* Legend */}
      <div className="flex items-center justify-end px-3 py-1 gap-4 text-[11px] text-[#605E5C] border-b border-[#F3F2F1]">
        <div className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 inline-block rounded-[1px]"
            style={{ backgroundColor: series1Color }}
          />
          <span>{series1Name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 inline-block rounded-[1px]"
            style={{ backgroundColor: series2Color }}
          />
          <span>{series2Name}</span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative px-2 pt-2 pb-2 flex-1 flex items-center justify-center">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full max-h-[220px] select-none"
        >
          {/* Gridlines and Y-axis labels */}
          {yTicks.map((tickVal, idx) => {
            const y = paddingTop + (idx / ticksCount) * innerHeight;
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#EDEBE9"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <text
                  x={paddingLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="8.5"
                  fill="#8A8886"
                  className="font-sans"
                >
                  {currency === 'IDR' ? formatCompactRupiah(tickVal) : formatCompactVal(tickVal, 'USD')}
                </text>
              </g>
            );
          })}

          {/* Baseline */}
          <line
            x1={paddingLeft}
            y1={paddingTop + innerHeight}
            x2={chartWidth - paddingRight}
            y2={paddingTop + innerHeight}
            stroke="#C8C6C4"
            strokeWidth="1"
          />

          {/* Bars */}
          {data.map((item, idx) => {
            const groupX = paddingLeft + idx * categoryWidth;
            const centerX = groupX + categoryWidth / 2;

            const h1 = (item.val1 / yMax) * innerHeight;
            const h2 = (item.val2 / yMax) * innerHeight;

            const x1 = centerX - barWidth - 1;
            const x2 = centerX + 1;

            const y1 = paddingTop + innerHeight - h1;
            const y2 = paddingTop + innerHeight - h2;

            return (
              <g key={idx}>
                {/* Bar 1 */}
                <rect
                  x={x1}
                  y={y1}
                  width={barWidth}
                  height={Math.max(1, h1)}
                  fill={series1Color}
                  rx="1"
                  className="cursor-pointer transition-opacity hover:opacity-85"
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredBar({
                      category: item.category,
                      series: series1Name,
                      value: item.val1,
                      color: series1Color,
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                    });
                  }}
                  onMouseLeave={() => setHoveredBar(null)}
                />

                {/* Bar 2 */}
                <rect
                  x={x2}
                  y={y2}
                  width={barWidth}
                  height={Math.max(1, h2)}
                  fill={series2Color}
                  rx="1"
                  className="cursor-pointer transition-opacity hover:opacity-85"
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredBar({
                      category: item.category,
                      series: series2Name,
                      value: item.val2,
                      color: series2Color,
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                    });
                  }}
                  onMouseLeave={() => setHoveredBar(null)}
                />

                {/* X Category Label */}
                <text
                  x={centerX}
                  y={paddingTop + innerHeight + 15}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="500"
                  fill="#323130"
                  className="font-sans"
                >
                  {item.category}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredBar && (
          <div
            className="fixed z-50 pointer-events-none pbi-tooltip bg-[#252423] text-white text-[11px] p-2 rounded shadow-xl min-w-[150px]"
            style={{
              left: `${hoveredBar.x}px`,
              top: `${hoveredBar.y - 65}px`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-semibold text-[11px] text-[#C8C6C4] border-b border-[#3B3A39] pb-1 mb-1">
              {hoveredBar.category}
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-[1px] inline-block"
                  style={{ backgroundColor: hoveredBar.color }}
                />
                <span>{hoveredBar.series}:</span>
              </div>
              <span className="font-bold tabular-nums">
                {currency === 'IDR'
                  ? formatRupiah(hoveredBar.value)
                  : formatCurrencyVal(hoveredBar.value, 'USD')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
