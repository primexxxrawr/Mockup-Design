import React, { useState } from 'react';
import { MastercardRecord, VisaRecord } from '../../types';
import { PbiFullMatrixTable } from '../pbi/PbiFullMatrixTable';

interface DetailDeviasiScreenProps {
  filteredVisa: VisaRecord[];
  filteredMc: MastercardRecord[];
  onSelectVisaRow: (row: VisaRecord) => void;
  onSelectMcRow: (row: MastercardRecord) => void;
  onOpenFocus: (title: string, content: React.ReactNode) => void;
  onExportCsv: (visualName: string) => void;
}

export const DetailDeviasiScreen: React.FC<DetailDeviasiScreenProps> = ({
  filteredVisa,
  filteredMc,
  onSelectVisaRow,
  onSelectMcRow,
  onOpenFocus,
  onExportCsv,
}) => {
  const [activePrincipal, setActivePrincipal] = useState<'Visa' | 'Mastercard'>('Mastercard');

  return (
    <div className="space-y-3">
      {/* Full Matrix Table */}
      <PbiFullMatrixTable
        principalMode={activePrincipal}
        onTogglePrincipal={setActivePrincipal}
        visaRecords={filteredVisa}
        mcRecords={filteredMc}
        onSelectVisaRow={onSelectVisaRow}
        onSelectMcRow={onSelectMcRow}
        onFocus={() =>
          onOpenFocus(
            `Matriks Seluruh Kolom ${activePrincipal}`,
            <PbiFullMatrixTable
              principalMode={activePrincipal}
              onTogglePrincipal={setActivePrincipal}
              visaRecords={filteredVisa}
              mcRecords={filteredMc}
              onSelectVisaRow={onSelectVisaRow}
              onSelectMcRow={onSelectMcRow}
              className="w-full h-full border-0 shadow-none"
            />
          )
        }
        onExportCsv={() => onExportCsv(`Detail_Deviasi_Full_${activePrincipal}`)}
      />
    </div>
  );
};
