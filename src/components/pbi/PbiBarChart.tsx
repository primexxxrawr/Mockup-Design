import React, { useState } from 'react';
import { PbiVisualHeader } from './PbiVisualHeader';
import { formatCompactRupiah, formatRupiah } from '../../data/mockData';

export interface TopDeviationItem {
  id: string;
  name: string;
  billingType: string;
  nominalDeviasi: number;
  persen: number;
}

interface PbiBarChartProps {
  title: string;
  subtitle?: string;
  data: TopDeviationItem[];
  accentColor?: string;
  onFocus?: () => void;
  onExportCsv?: () => void;
  className?: string;
}

export const PbiBarChart: React.FC<PbiBarChartProps> = ({
  title,
  subtitle,
  data,
  accentColor = '#D13438',
  onFocus,
  onExportCsv,
  className = '',
}) => {
  const [hoveredItem, setHoveredItem] = useState<{
    item: TopDeviationItem;
    x: number;
    y: number;
  } | null>(null);

  const maxDeviation = Math.max(...data.map((d) => Math.abs(d.nominalDeviasi)), 1000000);

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

      <div className="p-3 flex-1 overflow-y-auto space-y-2">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-[#8A8886] italic py-8">
            Tidak ada data deviasi pada filter ini
          </div>
        ) : (
          data.slice(0, 10).map((item, idx) => {
            const absVal = Math.abs(item.nominalDeviasi);
            const barWidth = Math.max(3, (absVal / maxDeviation) * 100);

            return (
              <div
                key={item.id || idx}
                className="group cursor-pointer text-[11px]"
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredItem({
                    item,
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                  });
                }}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[10px] text-[#8A8886] font-mono tabular-nums w-4 shrink-0">
                      {(idx + 1).toString().padStart(2, '0')}.
                    </span>
                    <span className="font-medium text-[#323130] truncate" title={item.name}>
                      {item.name}
                    </span>
                    <span className="text-[9.5px] text-[#8A8886] shrink-0">
                      ({item.billingType})
                    </span>
                  </div>
                  <span className="font-semibold text-[#D13438] tabular-nums shrink-0">
                    {formatCompactRupiah(item.nominalDeviasi)}
                  </span>
                </div>

                {/* Progress Bar Container */}
                <div className="h-2.5 bg-[#F3F2F1] rounded-[1px] overflow-hidden flex items-center">
                  <div
                    className="h-full rounded-[1px] transition-all duration-300"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: accentColor,
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Hover Tooltip */}
      {hoveredItem && (
        <div
          className="fixed z-50 pointer-events-none pbi-tooltip bg-[#252423] text-white text-[11px] p-2.5 rounded shadow-xl min-w-[220px]"
          style={{
            left: `${hoveredItem.x}px`,
            top: `${hoveredItem.y - 75}px`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="font-semibold text-[11px] text-[#EDEBE9] border-b border-[#3B3A39] pb-1 mb-1">
            {hoveredItem.item.name}
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-[#C8C6C4]">
              <span>Kategori:</span>
              <span className="font-medium text-white">{hoveredItem.item.billingType}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-[#C8C6C4]">
              <span>Nominal Deviasi:</span>
              <span className="font-bold text-[#D13438] tabular-nums">
                {formatRupiah(hoveredItem.item.nominalDeviasi)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-[#C8C6C4]">
              <span>Persentase Selisih:</span>
              <span className="font-bold text-white tabular-nums">
                {hoveredItem.item.persen.toFixed(2).replace('.', ',')}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
