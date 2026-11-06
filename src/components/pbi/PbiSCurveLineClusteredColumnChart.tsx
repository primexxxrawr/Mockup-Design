import React, { useState } from 'react';
import { PbiVisualHeader } from './PbiVisualHeader';
import {
  formatCompactRupiah,
  formatCompactVal,
  formatCurrencyVal,
  formatRupiah,
} from '../../data/mockData';
import { usdToIdr } from '../../types';

export interface SCurvePoint {
  period: string; // e.g. "Jan 2026"
  monthlyDeviasiIdr: number; // Monthly selisih in IDR
  cumVisaUsd: number; // Cumulative Fee Visa (USD)
  cumBmriUsd: number; // Cumulative Fee BMRI (USD)
  cumGapUsd: number; // Cumulative Gap (USD)
}

interface PbiSCurveLineClusteredColumnChartProps {
  title: string;
  subtitle?: string;
  caraMembaca?: string;
  data: SCurvePoint[];
  onFocus?: () => void;
  onExportCsv?: () => void;
  className?: string;
}

export const PbiSCurveLineClusteredColumnChart: React.FC<PbiSCurveLineClusteredColumnChartProps> = ({
  title,
  subtitle,
  caraMembaca = 'Dua garis menunjukkan akumulasi tagihan Visa dan hitungan Mandiri. Semakin lebar jarak kedua garis, semakin besar selisihnya.',
  data,
  onFocus,
  onExportCsv,
  className = '',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // 1. Left Y-Axis Scale: Cumulative USD values
  const maxCumUsd = Math.max(
    ...data.flatMap((d) => [d.cumVisaUsd, d.cumBmriUsd]),
    1000
  );
  const leftYMax = Math.ceil(maxCumUsd * 1.15);

  // 2. Right Y-Axis Scale: Monthly Deviation IDR values
  const maxDevIdr = Math.max(
    ...data.map((d) => Math.abs(d.monthlyDeviasiIdr)),
    1000000
  );
  const rightYMax = Math.ceil(maxDevIdr * 1.25);

  const chartHeight = 200;
  const chartWidth = 620;
  const paddingLeft = 56;
  const paddingRight = 62;
  const paddingTop = 24;
  const paddingBottom = 32;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const ticksCount = 4;
  const leftTicks = Array.from({ length: ticksCount + 1 }, (_, i) => (leftYMax / ticksCount) * (ticksCount - i));
  const rightTicks = Array.from({ length: ticksCount + 1 }, (_, i) => (rightYMax / ticksCount) * (ticksCount - i));

  const stepX = innerWidth / (data.length - 1 || 1);
  const barWidth = Math.min(22, stepX * 0.45);

  // Coordinates helper
  const getLeftY = (valUsd: number) => {
    return paddingTop + innerHeight - (valUsd / leftYMax) * innerHeight;
  };

  const getRightY = (valIdr: number) => {
    return paddingTop + innerHeight - (valIdr / rightYMax) * innerHeight;
  };

  // Build SVG Paths for Cumulative S-Curves
  const visaPath = data
    .map((d, idx) => {
      const x = paddingLeft + idx * stepX;
      const y = getLeftY(d.cumVisaUsd);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const bmriPath = data
    .map((d, idx) => {
      const x = paddingLeft + idx * stepX;
      const y = getLeftY(d.cumBmriUsd);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const activePoint = hoveredIdx !== null ? data[hoveredIdx] : null;

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

      {/* Power BI Standard Multi-Axis Legend */}
      <div className="flex flex-wrap items-center justify-between px-3.5 py-1.5 gap-2 text-[10.5px] text-[#6B7280] border-b border-[#F4F6F9]">
        <div className="flex items-center gap-3">
          {/* Secondary Axis Bar */}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#C62828] opacity-75 inline-block rounded-[1px]" />
            <span>Deviasi Bulanan (Sumbu Kanan: Rp)</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Primary Axis Lines */}
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 bg-[#2B6CB0] inline-block" />
            <span>Kumulatif Fee Visa (USD)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 bg-[#003A70] inline-block" />
            <span>Kumulatif Fee BMRI (USD)</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas with Dual Axis */}
      <div className="relative px-2 pt-1 pb-2 flex-1 flex items-center justify-center">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full max-h-[250px] select-none"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {/* Gridlines & Left Ticks (USD) */}
          {leftTicks.map((tickVal, idx) => {
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
                {/* Left Y Axis Label (USD) */}
                <text
                  x={paddingLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="8.5"
                  fill="#605E5C"
                  className="font-sans"
                >
                  {formatCompactVal(tickVal, 'USD')}
                </text>
              </g>
            );
          })}

          {/* Right Ticks (IDR) */}
          {rightTicks.map((tickVal, idx) => {
            const y = paddingTop + (idx / ticksCount) * innerHeight;
            return (
              <text
                key={idx}
                x={chartWidth - paddingRight + 6}
                y={y + 3}
                textAnchor="start"
                fontSize="8.5"
                fill="#8A8886"
                className="font-sans"
              >
                {formatCompactRupiah(tickVal)}
              </text>
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

          {/* Clustered Columns (Monthly Deviation IDR) on Secondary Right Axis */}
          {data.map((d, idx) => {
            const centerX = paddingLeft + idx * stepX;
            const barX = centerX - barWidth / 2;
            const barH = (d.monthlyDeviasiIdr / rightYMax) * innerHeight;
            const barY = paddingTop + innerHeight - barH;

            return (
              <g key={idx}>
                {/* Invisible hover trigger */}
                <rect
                  x={centerX - stepX / 2}
                  y={paddingTop}
                  width={stepX}
                  height={innerHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                />

                {/* Column */}
                <rect
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={Math.max(2, barH)}
                  fill="#C62828"
                  opacity={hoveredIdx === idx ? 0.95 : 0.65}
                  rx="1"
                  className="transition-opacity"
                />

                {/* X-axis Label */}
                <text
                  x={centerX}
                  y={paddingTop + innerHeight + 15}
                  textAnchor="middle"
                  fontSize="8.5"
                  fontWeight={hoveredIdx === idx ? '600' : '400'}
                  fill={hoveredIdx === idx ? '#003A70' : '#6B7280'}
                  className="font-sans"
                >
                  {d.period.split(' ')[0]}
                </text>
              </g>
            );
          })}

          {/* Cumulative S-Curve Lines on Primary Left Axis */}
          {/* BMRI Line (Cumulative) */}
          <path
            d={bmriPath}
            fill="none"
            stroke="#003A70"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="4 2"
          />

          {/* Visa Line (Cumulative) */}
          <path
            d={visaPath}
            fill="none"
            stroke="#2B6CB0"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Line Points */}
          {data.map((d, idx) => {
            const x = paddingLeft + idx * stepX;
            const yVisa = getLeftY(d.cumVisaUsd);
            const yBmri = getLeftY(d.cumBmriUsd);
            const isHovered = hoveredIdx === idx;

            return (
              <g key={idx}>
                {/* Visa Point */}
                <circle
                  cx={x}
                  cy={yVisa}
                  r={isHovered ? 5 : 3}
                  fill="#2B6CB0"
                  stroke="#FFFFFF"
                  strokeWidth={1.5}
                />
                {/* BMRI Point */}
                <circle
                  cx={x}
                  cy={yBmri}
                  r={isHovered ? 4.5 : 2.5}
                  fill="#003A70"
                  stroke="#FFFFFF"
                  strokeWidth={1.5}
                />

                {/* Hover guideline */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={paddingTop}
                    x2={x}
                    y2={paddingTop + innerHeight}
                    stroke="#003A70"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Box */}
        {activePoint && hoveredIdx !== null && (
          <div
            className="absolute z-50 pointer-events-none pbi-tooltip bg-[#252423] text-white text-[11px] p-2.5 rounded shadow-xl min-w-[210px]"
            style={{
              left: `${Math.min(
                Math.max(paddingLeft + hoveredIdx * stepX, 110),
                chartWidth - 110
              )}px`,
              top: '20px',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-semibold text-[11px] text-[#EDEBE9] border-b border-[#3B3A39] pb-1 mb-1.5 flex items-center justify-between">
              <span>Bulan:</span>
              <span className="text-[#0078D4] font-bold">{activePoint.period}</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between gap-3 text-[#C8C6C4]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-[1px] bg-[#1A1F71]" />
                  <span>Kumulatif Fee Visa:</span>
                </div>
                <span className="font-bold text-white tabular-nums">
                  {formatCurrencyVal(activePoint.cumVisaUsd, 'USD')}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 text-[#C8C6C4]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-[1px] bg-[#0078D4]" />
                  <span>Kumulatif Fee BMRI:</span>
                </div>
                <span className="font-bold text-white tabular-nums">
                  {formatCurrencyVal(activePoint.cumBmriUsd, 'USD')}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 text-[#C8C6C4] pt-0.5 border-t border-[#3B3A39]">
                <span>Gap Kumulatif:</span>
                <span className="font-bold text-[#F79E1B] tabular-nums">
                  {formatCurrencyVal(activePoint.cumGapUsd, 'USD')} ({formatCompactRupiah(usdToIdr(activePoint.cumGapUsd))})
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 pt-0.5 border-t border-[#3B3A39]">
                <div className="flex items-center gap-1.5 text-[#D13438]">
                  <span className="w-2 h-2 rounded-[1px] bg-[#D13438]" />
                  <span>Deviasi Bulanan (Rp):</span>
                </div>
                <span className="font-bold text-[#D13438] tabular-nums">
                  {formatRupiah(activePoint.monthlyDeviasiIdr)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
