import React, { useState, useRef } from 'react';
import { parseUploadedFile, ParseResult } from '../../utils/fileParser';
import { Upload, FileArchive, FileSpreadsheet, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (result: ParseResult) => void;
}

export const ImportDataModal: React.FC<ImportDataModalProps> = ({
  isOpen,
  onClose,
  onDataLoaded,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<ParseResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await parseUploadedFile(file);
      if (result.mastercardRecords.length === 0 && result.visaRecords.length === 0) {
        setError('File berhasil dibuka, namun tidak ditemukan baris data tabel yang sesuai.');
      } else {
        setSuccessInfo(result);
        onDataLoaded(result);
      }
    } catch (err: any) {
      setError(err?.message || 'Gagal memproses file. Pastikan format file adalah .zip, .xlsx, atau .csv');
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-[1px]">
      <div className="bg-white border border-[#E1DFDD] rounded-[3px] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-[12px]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#FAF9F8] border-b border-[#E1DFDD]">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#0078D4]" />
            <h3 className="font-bold text-[#323130] text-[13px]">
              Impor File Data Rekonsiliasi (.ZIP / Excel / CSV)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-[#EDEBE9] text-[#605E5C]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <p className="text-[#605E5C] text-[11.5px] leading-relaxed">
            Anda dapat mengunggah file <strong>.ZIP</strong> (berisi file CSV/Excel tagihan Visa &amp; Mastercard), atau langsung mengunggah file <strong>.xlsx / .csv</strong>. Sistem akan mengekstrak dan memetakan kolom secara otomatis ke dasbor.
          </p>

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-[4px] p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-[#0078D4] bg-[#F0F6FF]'
                : 'border-[#C8C6C4] hover:border-[#0078D4] bg-[#FAF9F8]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,.xlsx,.xls,.csv,.tsv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />

            {isLoading ? (
              <div className="py-4 flex flex-col items-center gap-2 text-[#0078D4]">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="font-semibold text-[12px]">Sedang mengekstrak dan memproses file...</span>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-[#F3F2F1] flex items-center justify-center text-[#0078D4] mb-1">
                  <FileArchive className="w-6 h-6" />
                </div>
                <div className="font-semibold text-[#323130] text-[13px]">
                  Klik untuk pilih file atau seret file ke sini
                </div>
                <div className="text-[10.5px] text-[#8A8886]">
                  Mendukung: <strong>.ZIP</strong> (otomatis diekstrak), <strong>.xlsx</strong>, <strong>.xls</strong>, <strong>.csv</strong>
                </div>
              </>
            )}
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-3 bg-[#FDF3F3] border border-[#FAD2D2] rounded-[2px] flex items-start gap-2 text-[#D13438] text-[11px]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Notice */}
          {successInfo && (
            <div className="p-3 bg-[#F1F9F4] border border-[#D5EEDD] rounded-[2px] space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2 text-[#107C41] font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Data Berhasil Diimpor ke Dasbor!</span>
              </div>
              <p className="text-[#323130]">{successInfo.message}</p>
              <div className="text-[10px] text-[#605E5C] pt-1 border-t border-[#D5EEDD]">
                File yang diproses: {successInfo.fileNames.join(', ')}
              </div>
            </div>
          )}

          {/* Instruction on how to provide file in Chat */}
          <div className="bg-[#FAF9F8] p-3 rounded-[2px] border border-[#E1DFDD] text-[11px] text-[#605E5C] space-y-1">
            <span className="font-semibold text-[#323130] block">Cara Unggah via Chat AI Studio:</span>
            <p>
              Selain melalui tombol unggah ini, Anda juga dapat <strong>menyeret (drag &amp; drop)</strong> file ZIP langsung ke kotak chat prompt AI Studio, atau ekstrak isinya (file .csv / .xlsx) lalu lampirkan ke pesan berikutnya.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#FAF9F8] border-t border-[#E1DFDD] flex items-center justify-between">
          <span className="text-[10.5px] text-[#8A8886]">
            {successInfo ? 'Data langsung aktif di semua layar' : 'Pilih file data rekonsiliasi'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1 bg-[#0078D4] text-white font-medium rounded-[2px] hover:bg-[#106EBE] transition-colors"
          >
            {successInfo ? 'Tutup & Lihat Dasbor' : 'Batal'}
          </button>
        </div>
      </div>
    </div>
  );
};
