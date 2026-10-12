import { useState, useRef } from 'react';
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
  MapPin,
  Upload
} from 'lucide-react';
import { SantiyeEntry, SyncConfig } from '../types';
import { exportToExcelFile, mapEntriesToGoogleSheetRows, formatDisplayDate } from '../services/storageAndSync';
import PhotoPreviewModal from './PhotoPreviewModal';

interface GoogleSheetPreviewProps {
  entries: SantiyeEntry[];
  syncConfig: SyncConfig;
  onTriggerSync: () => void;
  onFetchFromGoogleSheets?: (customSheetUrl?: string) => Promise<void>;
  onImportFile?: (file: File) => Promise<void>;
  onUpdateSheetUrl?: (url: string) => void;
  isSyncing: boolean;
}

export default function GoogleSheetPreview({
  entries,
  syncConfig,
  onTriggerSync,
  onFetchFromGoogleSheets,
  onImportFile,
  onUpdateSheetUrl,
  isSyncing
}: GoogleSheetPreviewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCell, setSelectedCell] = useState<string>('A1: Şantiye Defteri Google E-Tablosu');
  const [previewEntry, setPreviewEntry] = useState<SantiyeEntry | null>(null);
  const [sheetUrlInput, setSheetUrlInput] = useState(syncConfig.googleSheetUrl || '');
  const [viewMode, setViewMode] = useState<'grid' | 'embed'>('grid');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const match = (syncConfig.googleSheetUrl || '').match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  const spreadsheetId = match ? match[1] : null;
  const isDummySheet = !spreadsheetId || spreadsheetId === '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';

  const handleSaveAndFetch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetUrlInput.trim()) return;
    if (onUpdateSheetUrl) {
      onUpdateSheetUrl(sheetUrlInput.trim());
    } else if (onFetchFromGoogleSheets) {
      onFetchFromGoogleSheets(sheetUrlInput.trim());
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportFile) {
      onImportFile(file);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const sheetRows = mapEntriesToGoogleSheetRows(entries);
  const columnHeaders = sheetRows.length > 0 ? Object.keys(sheetRows[0]) : [];

  const filteredEntries = entries.filter(e =>
    e.projeID.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.projeAdi && e.projeAdi.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (e.projeTipi && e.projeTipi.toLowerCase().includes(searchTerm.toLowerCase())) ||
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
              <span className={`font-semibold flex items-center gap-1 shrink-0 ${isDummySheet ? 'text-amber-700' : 'text-emerald-700'}`}>
                <CheckCircle2 className="w-3 h-3" /> {isDummySheet ? 'Özel URL Bekleniyor' : 'Canlı E-Tablo Bağlı'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions & View Modes */}
        <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
          {/* View Mode Toggle */}
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-md transition ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Tablo Görünümü ({filteredEntries.length})
            </button>
            <button
              type="button"
              onClick={() => setViewMode('embed')}
              className={`px-2.5 py-1 rounded-md transition ${viewMode === 'embed' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              title="Doğrudan Google Sheets arayüzünü görüntüle"
            >
              Canlı E-Tablo (Gömülü)
            </button>
          </div>

          {syncConfig.googleSheetUrl && (
            <a
              href={syncConfig.googleSheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition border border-emerald-200"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              E-Tabloyu Aç
            </a>
          )}

          <button
            type="button"
            onClick={() => onFetchFromGoogleSheets ? onFetchFromGoogleSheets() : onTriggerSync()}
            disabled={isSyncing}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
            title="Google E-Tablodan tüm satırları anlık oku"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            Canlı Oku
          </button>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".xlsx,.xls,.csv" 
            className="hidden" 
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSyncing}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition border border-slate-200 cursor-pointer"
            title="İndirilmiş .csv veya .xlsx tablosunu yükle"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            Dosya Yükle
          </button>

          <button
            type="button"
            onClick={() => exportToExcelFile(entries)}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            İndir
          </button>
        </div>
      </div>

      {/* Google Sheets URL Connection Form */}
      <div className={`px-4 py-2.5 border-b border-slate-200 ${isDummySheet ? 'bg-amber-50/70' : 'bg-slate-50/80'}`}>
        <form onSubmit={handleSaveAndFetch} className="flex flex-col sm:flex-row items-center gap-2">
          <div className="flex-1 w-full flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-700 shrink-0">
              {isDummySheet ? '🔗 E-Tablo Linkiniz:' : '🔗 Bağlı E-Tablo:'}
            </span>
            <input
              type="url"
              value={sheetUrlInput}
              onChange={e => setSheetUrlInput(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/.../edit"
              className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={isSyncing}
            className="w-full sm:w-auto px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            Bağla ve Canlı Çek
          </button>
        </form>
        {isDummySheet && (
          <p className="text-[10px] text-amber-800 mt-1 font-medium">
            💡 Bilgi: Şu an aşağıdaki tabloda gösterilen kayıtlar tarayıcınızdaki şantiye kayıtlarıdır. Gerçek Google E-Tablonuzdaki tüm satırları yüklemek için tablonuzun linkini yukarıya yapıştırıp "Bağla ve Canlı Çek" butonuna tıklayınız.
          </p>
        )}
      </div>

      {/* Content depending on View Mode */}
      {viewMode === 'embed' ? (
        <div className="w-full bg-slate-100 flex flex-col">
          {!isDummySheet && spreadsheetId ? (
            <div className="space-y-0">
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Canlı Google E-Tablo Görüntüsü (Iframe)</span>
                <a
                  href={syncConfig.googleSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  Tam Ekranda Aç <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <iframe
                src={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?rm=minimal`}
                title="Google Spreadsheet Ön İzleme"
                className="w-full h-[600px] border-0 bg-white"
                allow="clipboard-read; clipboard-write"
              />
            </div>
          ) : (
            <div className="p-8 text-center space-y-3 bg-white">
              <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">Özel Google E-Tablo Henüz Bağlanmadı</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Canlı Google E-Tablonuzu bu ekranda doğrudan görüntülemek için yukarıdaki alana kendi Google E-Tablo linkinizi yapıştırıp "Bağla ve Canlı Çek" butonuna basınız.
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
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

                  {/* Columns (22 Sütun, Proje ID doğrudan 2. sütundur) */}
                  <td className="py-2 px-3 border-r border-slate-200 font-mono text-slate-600 whitespace-nowrap" title={rowData['Tarih']}>
                    {formatDisplayDate(rowData['Tarih'])}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 font-bold text-blue-700 whitespace-nowrap">{rowData['Proje ID']}</td>
                  <td className="py-2 px-3 border-r border-slate-200 font-bold text-center whitespace-nowrap">{rowData['Proje Tipi']}</td>
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
        </>
      )}

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
