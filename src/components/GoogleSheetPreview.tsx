import { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  ExternalLink, 
  Search, 
  CheckCircle2, 
  Share2, 
  RefreshCw,
  Eye,
  Camera,
  MapPin
} from 'lucide-react';
import { SantiyeEntry, SyncConfig } from '../types';
import { exportToExcelFile, mapEntriesToGoogleSheetRows } from '../services/storageAndSync';
import PhotoPreviewModal from './PhotoPreviewModal';

interface GoogleSheetPreviewProps {
  entries: SantiyeEntry[];
  syncConfig: SyncConfig;
  onTriggerSync: () => void;
  isSyncing: boolean;
}

export default function GoogleSheetPreview({
  entries,
  syncConfig,
  onTriggerSync,
  isSyncing
}: GoogleSheetPreviewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCell, setSelectedCell] = useState<string>('A1: Şantiye Defteri Google E-Tablosu');
  const [previewEntry, setPreviewEntry] = useState<SantiyeEntry | null>(null);

  const sheetRows = mapEntriesToGoogleSheetRows(entries);
  const columnHeaders = sheetRows.length > 0 ? Object.keys(sheetRows[0]) : [];

  const filteredEntries = entries.filter(e =>
    e.projeID.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.santral.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.saha.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.iscilikPoz.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.iscilikAciklama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.malzemePoz.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getColLetter = (index: number): string => {
    return String.fromCharCode(65 + (index % 26));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
      {/* Google Sheets Styled Top Bar */}
      <div className="bg-[#f9fbfd] border-b border-slate-200 px-3.5 py-3 sm:px-6 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">
                Şantiye_Defteri_Canli_Senkronizasyon
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                Google Sheets
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-[11px] text-slate-500">
              <span className="truncate">Dosya: <strong>Telekom_İmalat</strong></span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3 h-3" /> Eşitlendi
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
          {syncConfig.googleSheetUrl && (
            <a
              href={syncConfig.googleSheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition border border-emerald-200 min-h-[38px] sm:min-h-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              E-Tabloyu Aç
            </a>
          )}

          <button
            type="button"
            onClick={onTriggerSync}
            disabled={isSyncing}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 min-h-[38px] sm:min-h-0 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            Yenile & Eşitle
          </button>

          <button
            type="button"
            onClick={() => exportToExcelFile(entries)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition min-h-[38px] sm:min-h-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            İndir
          </button>
        </div>
      </div>

      {/* Formula Bar Simulation */}
      <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 text-xs font-mono text-slate-600">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-10 sm:w-14 font-bold text-slate-800 bg-white px-2 py-1 rounded border border-slate-300 text-center shrink-0">
            fx
          </div>
          <div className="flex-1 text-slate-700 font-sans truncate text-xs">
            {selectedCell}
          </div>
        </div>
        <div className="relative w-full sm:w-64 shrink-0 font-sans">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Tabloda filtrele..."
            className="w-full pl-8 pr-3 py-2 sm:py-1 text-xs bg-white border border-slate-200 rounded-md font-medium"
          />
        </div>
      </div>

      {/* Spreadsheet Grid Container */}
      <div className="overflow-x-auto max-h-[580px] select-text">
        <table className="w-full text-xs text-slate-800 border-collapse">
          {/* Header Row: Column Letters A, B, C, D... */}
          <thead className="bg-[#f3f4f6] text-slate-500 font-mono text-[11px] sticky top-0 z-10 select-none">
            <tr>
              <th className="w-10 py-1.5 px-2 bg-slate-200 text-center border-r border-b border-slate-300">#</th>
              {columnHeaders.map((col, idx) => (
                <th
                  key={col}
                  className="py-1 px-3 border-r border-b border-slate-300 text-center font-bold text-slate-600 min-w-[120px]"
                >
                  <div className="text-[10px] text-slate-400">{getColLetter(idx)}</div>
                  <div className="font-sans text-xs text-slate-800 font-bold truncate max-w-[160px] mx-auto">
                    {col}
                  </div>
                </th>
              ))}
              <th className="py-1 px-3 border-r border-b border-slate-300 text-center text-xs font-bold text-slate-700">
                Detay
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-sans">
            {filteredEntries.map((row, rIdx) => {
              const rowData = mapEntriesToGoogleSheetRows([row])[0];
              const isEven = rIdx % 2 === 0;

              return (
                <tr
                  key={row.id}
                  className={`hover:bg-blue-50/70 transition cursor-pointer ${isEven ? 'bg-white' : 'bg-[#fafbfc]'}`}
                  onClick={() => setSelectedCell(`Satır ${rIdx + 1}: ${row.projeID} - ${row.santral} (${row.iscilikPoz})`)}
                >
                  {/* Row Number */}
                  <td className="py-2 px-2 text-center font-mono text-[11px] text-slate-400 bg-slate-100 border-r border-slate-200 font-bold">
                    {rIdx + 1}
                  </td>

                  {/* Columns */}
                  <td className="py-2 px-3 border-r border-slate-200 font-mono text-slate-600 whitespace-nowrap">{rowData['Tarih']}</td>
                  <td className="py-2 px-3 border-r border-slate-200 font-bold text-blue-700 whitespace-nowrap">{rowData['Proje ID']}</td>
                  <td className="py-2 px-3 border-r border-slate-200 font-medium whitespace-nowrap">{rowData['Santral']}</td>
                  <td className="py-2 px-3 border-r border-slate-200 whitespace-nowrap">{rowData['Saha / Bölge']}</td>
                  <td className="py-2 px-3 border-r border-slate-200 font-mono whitespace-nowrap">{rowData['Kutu / Dolap No']}</td>
                  <td className="py-2 px-3 border-r border-slate-200 font-bold text-emerald-700 whitespace-nowrap">{rowData['İşçilik Poz']}</td>
                  <td className="py-2 px-3 border-r border-slate-200 max-w-[220px] truncate" title={rowData['İşçilik Açıklama']}>
                    {rowData['İşçilik Açıklama']}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 text-right font-bold">{rowData['İşçilik Miktar']}</td>
                  <td className="py-2 px-3 border-r border-slate-200 text-center">{rowData['İşçilik Birim']}</td>
                  <td className="py-2 px-3 border-r border-slate-200 font-mono text-center font-bold text-amber-800">
                    {rowData['Malzeme Poz']}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 max-w-[180px] truncate" title={rowData['Malzeme Adı']}>
                    {rowData['Malzeme Adı']}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 text-right font-semibold">{rowData['Malzeme Miktar']}</td>
                  <td className="py-2 px-3 border-r border-slate-200 text-center">{rowData['Malzeme Birim']}</td>

                  {/* Öncesi Fotoğraf */}
                  <td className="py-2 px-3 border-r border-slate-200 text-center whitespace-nowrap">
                    {row.beforePhoto ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        <Camera className="w-3 h-3" /> Öncesi Foto
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  {/* Sonrası Fotoğraf */}
                  <td className="py-2 px-3 border-r border-slate-200 text-center whitespace-nowrap">
                    {row.afterPhoto ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        <Camera className="w-3 h-3" /> Sonrası Foto
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  {/* Konum */}
                  <td className="py-2 px-3 border-r border-slate-200 font-mono text-[11px] text-center whitespace-nowrap">
                    {rowData['Konum (Enlem, Boylam)']}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 max-w-[180px] truncate" title={rowData['Konum Adresi']}>
                    {rowData['Konum Adresi']}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 text-center whitespace-nowrap">
                    {row.location ? (
                      <a
                        href={row.location.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center justify-center gap-1 text-[11px]"
                      >
                        <MapPin className="w-3 h-3" /> Harita Linki
                      </a>
                    ) : '-'}
                  </td>

                  <td className="py-2 px-3 border-r border-slate-200 whitespace-nowrap font-medium text-slate-700">{rowData['Ekleyen Kullanıcı']}</td>
                  <td className="py-2 px-3 border-r border-slate-200 whitespace-nowrap text-slate-500">{rowData['Kayıt Saati']}</td>
                  <td className="py-2 px-3 border-r border-slate-200 text-center whitespace-nowrap font-bold text-emerald-700 bg-emerald-50/50">
                    {rowData['Senkron Durumu']}
                  </td>

                  {/* Detay Aç Butonu */}
                  <td className="py-2 px-3 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewEntry(row);
                      }}
                      className="p-1 rounded text-blue-600 hover:bg-blue-100 transition"
                      title="Fotoğraf & Konum Kartını İncele"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Sheet Tab Bar at Bottom */}
      <div className="bg-[#f0f3f6] border-t border-slate-300 px-4 py-2 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-1">
          <div className="px-4 py-1 bg-white border-t-2 border-emerald-600 font-bold text-slate-900 rounded-t-md shadow-2xs">
            📄 Sayfa1 - Şantiye Kayıtları ({filteredEntries.length})
          </div>
        </div>
        <div className="text-[11px] text-slate-500 font-medium">
          Google Sheets Senkronizasyon Kuyruğu Aktif (21 Alan Eşlendi)
        </div>
      </div>

      {/* Preview Modal */}
      {previewEntry && (
        <PhotoPreviewModal
          entry={previewEntry}
          onClose={() => setPreviewEntry(null)}
        />
      )}
    </div>
  );
}
