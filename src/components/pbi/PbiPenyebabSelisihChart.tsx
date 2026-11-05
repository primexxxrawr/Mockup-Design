import React, { useState } from 'react';
import { PbiVisualHeader } from './PbiVisualHeader';
import { formatCompactRupiah, formatPercentage, formatRupiah } from '../../data/mockData';

export interface CauseItem {
  id: string;
  name: string;
  nominal: number;
  color: string;
  keterangan: string;
}

interface PbiPenyebabSelisihChartProps {
  title: string;
  subtitle?: string;
  causes: CauseItem[];
  onFocus?: () => void;
  onExportCsv?: () => void;
  className?: string;
}

export const PbiPenyebabSelisihChart: React.FC<PbiPenyebabSelisihChartProps> = ({
  title,
  subtitle,
  causes,
  onFocus,
  onExportCsv,
  className = '',
}) => {
  const [hoveredCause, setHoveredCause] = useState<{
    item: CauseItem;
    x: number;
    y: number;
  } | null>(null);

  const total = causes.reduce((acc, c) => acc + c.nominal, 0) || 1;
  const maxVal = Math.max(...causes.map((c) => c.nominal), 100);

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

      <div className="p-3 flex-1 flex flex-col justify-around gap-3">
        {causes.map((item) => {
          const pctOfTotal = (item.nominal / total) * 100;
          const barWidth = Math.max(4, (item.nominal / maxVal) * 100);

          return (
            <div
              key={item.id}
              className="group cursor-pointer text-[11px]"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredCause({
                  item,
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                });
              }}
              onMouseLeave={() => setHoveredCause(null)}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-[1px] shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold text-[#323130]">{item.name}</span>
                  <span className="text-[10px] text-[#8A8886]">
                    ({formatPercentage(pctOfTotal)})
                  </span>
                </div>
                <span className="font-bold tabular-nums text-[#323130]">
                  {formatCompactRupiah(item.nominal)}
                </span>
              </div>

              {/* Bar */}
              <div className="h-3 bg-[#F3F2F1] rounded-[1px] overflow-hidden flex items-center">
                <div
                  className="h-full rounded-[1px] transition-all duration-300"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>

              <div className="text-[9.5px] text-[#8A8886] mt-0.5 truncate">
                {item.keterangan}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tooltip */}
      {hoveredCause && (
        <div
          className="fixed z-50 pointer-events-none pbi-tooltip bg-[#252423] text-white text-[11px] p-2.5 rounded shadow-xl min-w-[200px]"
          style={{
            left: `${hoveredCause.x}px`,
            top: `${hoveredCause.y - 70}px`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="font-semibold text-[11px] text-[#EDEBE9] border-b border-[#3B3A39] pb-1 mb-1">
            {hoveredCause.item.name}
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-[#C8C6C4]">
              <span>Nominal Kontribusi:</span>
              <span className="font-bold text-white tabular-nums">
                {formatRupiah(hoveredCause.item.nominal)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-[#C8C6C4]">
              <span>Porsi terhadap Selisih:</span>
              <span className="font-bold text-[#F79E1B] tabular-nums">
                {formatPercentage((hoveredCause.item.nominal / total) * 100)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
