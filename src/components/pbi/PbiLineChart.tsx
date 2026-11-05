import React, { useState } from 'react';
import { PbiVisualHeader } from './PbiVisualHeader';
import { formatCompactRupiah, formatRupiah } from '../../data/mockData';

export interface LineChartPoint {
  period: string;
  visaValue?: number;
  mcValue?: number;
  singleValue?: number;
}

interface PbiLineChartProps {
  title: string;
  subtitle?: string;
  data: LineChartPoint[];
  mode?: 'dual' | 'visa-only' | 'mc-only';
  onFocus?: () => void;
  onExportCsv?: () => void;
  className?: string;
}

export const PbiLineChart: React.FC<PbiLineChartProps> = ({
  title,
  subtitle,
  data,
  mode = 'dual',
  onFocus,
  onExportCsv,
  className = '',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Compute maximum across values
  const allValues = data.flatMap((d) => {
    const vals: number[] = [];
    if (d.visaValue !== undefined) vals.push(d.visaValue);
    if (d.mcValue !== undefined) vals.push(d.mcValue);
    if (d.singleValue !== undefined) vals.push(d.singleValue);
    return vals;
  });

  const rawMax = Math.max(...allValues, 1000000);
  const yMax = Math.ceil(rawMax * 1.15);

  const chartHeight = 180;
  const chartWidth = 520;
  const paddingLeft = 56;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 32;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const stepX = innerWidth / (data.length - 1 || 1);

  const ticksCount = 4;
  const yTicks = Array.from({ length: ticksCount + 1 }, (_, i) => (yMax / ticksCount) * (ticksCount - i));

  // Build SVG paths
  const getCoordinates = (val: number, idx: number) => {
    const x = paddingLeft + idx * stepX;
    const y = paddingTop + innerHeight - (val / yMax) * innerHeight;
    return { x, y };
  };

  const buildPath = (key: 'visaValue' | 'mcValue' | 'singleValue') => {
    return data
      .map((d, idx) => {
        const val = d[key] ?? 0;
        const { x, y } = getCoordinates(val, idx);
        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  const visaPath = buildPath('visaValue');
  const mcPath = buildPath('mcValue');
  const singlePath = buildPath('singleValue');

  const activeDataPoint = hoveredIndex !== null ? data[hoveredIndex] : null;

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

      {/* Power BI Legend */}
      <div className="flex items-center justify-end px-3 py-1 gap-4 text-[11px] text-[#605E5C] border-b border-[#F3F2F1]">
        {mode === 'dual' && (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#1A1F71] inline-block" />
              <span>Visa Deviasi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#F79E1B] inline-block" />
              <span>Mastercard Deviasi</span>
            </div>
          </>
        )}
        {mode === 'visa-only' && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#1A1F71] inline-block" />
            <span>Tren Deviasi Visa</span>
          </div>
        )}
        {mode === 'mc-only' && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#EB001B] inline-block" />
            <span>Tren Deviasi Mastercard</span>
          </div>
        )}
      </div>

      {/* SVG Canvas */}
      <div className="relative px-2 pt-2 pb-2 flex-1 flex items-center justify-center">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full max-h-[220px] select-none"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Y-axis Ticks and Gridlines */}
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
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="#8A8886"
                  className="font-sans"
                >
                  {formatCompactRupiah(tickVal)}
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

          {/* Paths */}
          {mode === 'dual' && (
            <>
              {/* Visa Line */}
              <path
                d={visaPath}
                fill="none"
                stroke="#1A1F71"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Mastercard Line */}
              <path
                d={mcPath}
                fill="none"
                stroke="#F79E1B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {mode === 'visa-only' && (
            <path
              d={singlePath}
              fill="none"
              stroke="#1A1F71"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {mode === 'mc-only' && (
            <path
              d={singlePath}
              fill="none"
              stroke="#EB001B"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive vertical hover guide and points */}
          {data.map((d, idx) => {
            const x = paddingLeft + idx * stepX;
            const isHovered = hoveredIndex === idx;

            return (
              <g key={idx}>
                {/* Invisible hover trigger column */}
                <rect
                  x={x - stepX / 2}
                  y={paddingTop}
                  width={stepX}
                  height={innerHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                />

                {/* X-axis Label */}
                <text
                  x={x}
                  y={paddingTop + innerHeight + 15}
                  textAnchor="middle"
                  fontSize="8.5"
                  fill={isHovered ? '#0078D4' : '#605E5C'}
                  fontWeight={isHovered ? '600' : '400'}
                  className="font-sans"
                >
                  {d.period.split(' ')[0]}
                </text>

                {/* Data point dots */}
                {mode === 'dual' && (
                  <>
                    <circle
                      cx={x}
                      cy={getCoordinates(d.visaValue || 0, idx).y}
                      r={isHovered ? 4.5 : 2.5}
                      fill="#1A1F71"
                      stroke="#FFFFFF"
                      strokeWidth={1.5}
                    />
                    <circle
                      cx={x}
                      cy={getCoordinates(d.mcValue || 0, idx).y}
                      r={isHovered ? 4.5 : 2.5}
                      fill="#F79E1B"
                      stroke="#FFFFFF"
                      strokeWidth={1.5}
                    />
                  </>
                )}

                {(mode === 'visa-only' || mode === 'mc-only') && (
                  <circle
                    cx={x}
                    cy={getCoordinates(d.singleValue || 0, idx).y}
                    r={isHovered ? 5 : 3}
                    fill={mode === 'visa-only' ? '#1A1F71' : '#EB001B'}
                    stroke="#FFFFFF"
                    strokeWidth={1.5}
                  />
                )}

                {/* Hover line */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={paddingTop}
                    x2={x}
                    y2={paddingTop + innerHeight}
                    stroke="#0078D4"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Box */}
        {activeDataPoint && hoveredIndex !== null && (
          <div
            className="absolute z-50 pointer-events-none pbi-tooltip bg-[#252423] text-white text-[11px] p-2.5 rounded shadow-xl min-w-[160px]"
            style={{
              left: `${Math.min(
                Math.max(paddingLeft + hoveredIndex * stepX, 90),
                chartWidth - 90
              )}px`,
              top: '25px',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-semibold text-[11px] text-[#EDEBE9] border-b border-[#3B3A39] pb-1 mb-1.5 flex items-center justify-between">
              <span>Periode:</span>
              <span className="text-[#0078D4]">{activeDataPoint.period}</span>
            </div>

            {mode === 'dual' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-[1px] bg-[#1A1F71]" />
                    <span className="text-[#C8C6C4]">Visa:</span>
                  </div>
                  <span className="font-bold tabular-nums">
                    {formatRupiah(activeDataPoint.visaValue || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-[1px] bg-[#F79E1B]" />
                    <span className="text-[#C8C6C4]">Mastercard:</span>
                  </div>
                  <span className="font-bold tabular-nums">
                    {formatRupiah(activeDataPoint.mcValue || 0)}
                  </span>
                </div>
              </div>
            )}

            {(mode === 'visa-only' || mode === 'mc-only') && (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-[1px]"
                    style={{
                      backgroundColor:
                        mode === 'visa-only' ? '#1A1F71' : '#EB001B',
                    }}
                  />
                  <span className="text-[#C8C6C4]">Deviasi:</span>
                </div>
                <span className="font-bold tabular-nums">
                  {formatRupiah(activeDataPoint.singleValue || 0)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
