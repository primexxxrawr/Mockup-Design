import React from 'react';
import { X, Maximize2 } from 'lucide-react';

interface FocusVisualModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const FocusVisualModal: React.FC<FocusVisualModalProps> = ({
  title,
  isOpen,
  onClose,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-[1px]">
      <div className="bg-white border border-[#E1DFDD] rounded-[3px] shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#FAF9F8] border-b border-[#E1DFDD]">
          <div className="flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-[#0078D4]" />
            <h2 className="text-[13px] font-bold text-[#323130]">
              Mode Fokus Visual: {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-[#EDEBE9] text-[#605E5C] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto bg-[#F3F2F1] flex items-center justify-center">
          <div className="w-full h-full bg-white border border-[#E1DFDD] rounded-[2px] p-4 flex flex-col shadow-sm">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-white border-t border-[#E1DFDD] flex items-center justify-between text-[11px] text-[#605E5C]">
          <span>Gunakan tombol Esc atau tanda silang untuk kembali ke kanvas laporan</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-[#0078D4] text-white font-medium rounded-[2px] hover:bg-[#106EBE] transition-colors"
          >
            Kembali ke Laporan
          </button>
        </div>
      </div>
    </div>
  );
};
