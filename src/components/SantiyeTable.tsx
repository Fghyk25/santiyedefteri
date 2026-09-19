import { useState } from 'react';
import { 
  FileSpreadsheet, 
  Trash2, 
  Eye, 
  Search, 
  MapPin, 
  Camera, 
  Download, 
  CheckCircle2, 
  Clock, 
  Filter,
  ExternalLink
} from 'lucide-react';
import { SantiyeEntry } from '../types';
import { exportToExcelFile } from '../services/storageAndSync';
import PhotoPreviewModal from './PhotoPreviewModal';

interface SantiyeTableProps {
  entries: SantiyeEntry[];
  onDeleteEntry?: (id: string) => void;
  onClearAll?: () => void;
  onTriggerSync: () => void;
  isSyncing: boolean;
}

export default function SantiyeTable({
  entries,
  onDeleteEntry,
  onClearAll,
  onTriggerSync,
  isSyncing
}: SantiyeTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSantral, setFilterSantral] = useState('ALL');
  const [previewEntry, setPreviewEntry] = useState<SantiyeEntry | null>(null);
  const [isConfirmingClearAll, setIsConfirmingClearAll] = useState(false);

  // Unique santrals for filter dropdown
  const santralList = Array.from(new Set(entries.map(e => e.santral).filter(Boolean)));

  // Filtered rows
  const filteredEntries = entries.filter(e => {
    const matchesSearch = 
      e.projeID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.santral.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.saha.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.kutu.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.iscilikPoz.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.iscilikAciklama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.malzemePoz.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.malzemeAdi.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSantral = filterSantral === 'ALL' || e.santral === filterSantral;

    return matchesSearch && matchesSantral;
  });

  const totalEntries = entries.length;
  const totalIscilik = entries.filter(e => e.iscilikPoz).length;
  const totalMalzeme = entries.filter(e => e.malzemePoz).length;
  const totalWithPhotos = entries.filter(e => e.beforePhoto || e.afterPhoto).length;
  const totalWithLocation = entries.filter(e => e.location).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-3.5 sm:p-6 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Şantiye Defteri İmalat Kayıtları</h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {filteredEntries.length} / {totalEntries} Satır
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tüm işçilik, malzeme, öncesi/sonrası fotoğraflar ve GPS koordinat dökümü
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={() => exportToExcelFile(entries)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 min-h-[40px] sm:min-h-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Excel İndir
          </button>

          <button
            type="button"
            onClick={onTriggerSync}
            disabled={isSyncing}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 min-h-[40px] sm:min-h-0 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            E-Tabloya Gönder
          </button>

          {onClearAll && (
            isConfirmingClearAll ? (
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-1.5 bg-rose-50 border border-rose-300 rounded-xl px-2.5 py-1.5">
                <span className="text-[11px] font-bold text-rose-700">Tüm tablo silinsin mi?</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      onClearAll();
                      setIsConfirmingClearAll(false);
                    }}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold transition shadow-xs cursor-pointer"
                  >
                    Evet, Sil
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingClearAll(false)}
                    className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[11px] font-medium transition cursor-pointer"
                  >
                    Vazgeç
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsConfirmingClearAll(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-2 min-h-[40px] sm:min-h-0 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Tabloyu Temizle
              </button>
            )
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 sm:p-4 border-b border-slate-200 bg-white grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 sm:top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Proje, santral, kutu, poz no veya malzeme adı ile ara..."
            className="w-full pl-9 pr-4 py-2.5 sm:py-1.5 text-sm sm:text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        <div className="sm:col-span-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterSantral}
            onChange={e => setFilterSantral(e.target.value)}
            className="w-full px-3 py-2.5 sm:py-1.5 text-sm sm:text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:bg-white"
          >
            <option value="ALL">Tüm Santraller ({santralList.length})</option>
            {santralList.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile Card List View (Visible on phones & small tablets) */}
      <div className="block md:hidden divide-y divide-slate-200 bg-slate-50/40">
        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <p className="text-sm font-semibold">Kayıt bulunamadı</p>
            <p className="text-xs">Yukarıdaki formdan yeni imalat kaydı ekleyebilirsiniz.</p>
          </div>
        ) : (
          filteredEntries.map(row => {
            const hasPhotos = Boolean(row.beforePhoto || row.afterPhoto);
            const hasBothPhotos = Boolean(row.beforePhoto && row.afterPhoto);
            const parentProjectEntry = !hasPhotos 
              ? entries.find(e => e.projeID === row.projeID && (e.beforePhoto || e.afterPhoto))
              : null;
            const previewTarget = parentProjectEntry 
              ? { ...row, beforePhoto: parentProjectEntry.beforePhoto, afterPhoto: parentProjectEntry.afterPhoto }
              : row;

            return (
              <div key={row.id} className="p-3.5 bg-white space-y-2.5">
                {/* Header row: Project ID, Date & Delete button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-800 text-xs bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                      {row.projeID}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">{row.date}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewEntry(previewTarget)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 transition cursor-pointer"
                      title="Detay & Fotoğraflar"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {onDeleteEntry && (
                      <button
                        type="button"
                        onClick={() => onDeleteEntry(row.id)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                        title="Poz Satırını Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Location & Box Details */}
                <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-bold text-slate-800">{row.santral}</span>
                  <span>•</span>
                  <span>{row.saha}</span>
                  <span>•</span>
                  <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                    Kutu: {row.kutu}
                  </span>
                </div>

                {/* Labor Info */}
                <div className="bg-emerald-50/60 border border-emerald-200/70 p-2.5 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-emerald-800 text-xs">
                      Poz: {row.iscilikPoz}
                    </span>
                    <span className="font-bold text-slate-900 text-xs">
                      {row.iscilikMiktar} {row.iscilikBirim}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-snug">
                    {row.iscilikAciklama}
                  </p>
                </div>

                {/* Material Info (if present) */}
                {row.malzemePoz && (
                  <div className="bg-amber-50/60 border border-amber-200/70 p-2 rounded-xl text-xs space-y-0.5">
                    <div className="flex items-center justify-between font-medium">
                      <span className="font-mono font-bold text-amber-900">
                        📦 {row.malzemePoz}
                      </span>
                      <span className="font-bold text-slate-800">
                        {row.malzemeMiktar} {row.malzemeBirim}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 truncate">{row.malzemeAdi}</p>
                  </div>
                )}

                {/* Badges: Photos, GPS, Sync status */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    {hasPhotos ? (
                      <button
                        type="button"
                        onClick={() => setPreviewEntry(row)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition shadow-2xs ${
                          hasBothPhotos 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>{hasBothPhotos ? '2 Foto' : '1 Foto'}</span>
                      </button>
                    ) : parentProjectEntry ? (
                      <button
                        type="button"
                        onClick={() => setPreviewEntry(previewTarget)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                        title="Proje ana fotoğrafı ilk satırdadır (Görüntülemek için tıklayın)"
                      >
                        <Camera className="w-3 h-3 text-blue-600" />
                        <span>Proje Fotosu</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Fotosuz</span>
                    )}

                    {row.location && (
                      <a
                        href={row.location.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>GPS</span>
                      </a>
                    )}
                  </div>

                  <div>
                    {row.syncStatus === 'synced' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> E-Tablo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" /> Kuyrukta
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table View (Hidden on small mobile screens) */}
      <div className="hidden md:block overflow-x-auto max-h-[560px]">
        <table className="w-full text-left text-xs text-slate-700 border-collapse">
          <thead className="bg-slate-900 text-white text-[11px] uppercase tracking-wider sticky top-0 z-10 font-bold">
            <tr>
              <th className="py-3 px-3">Tarih</th>
              <th className="py-3 px-3">Proje ID</th>
              <th className="py-3 px-3">Santral / Saha</th>
              <th className="py-3 px-2">Kutu</th>
              <th className="py-3 px-2">İş Poz</th>
              <th className="py-3 px-3 min-w-[180px]">İş Açıklaması</th>
              <th className="py-3 px-2 text-right">İş Miktar</th>
              <th className="py-3 px-2">Birim</th>
              <th className="py-3 px-2">M.Poz</th>
              <th className="py-3 px-3 min-w-[160px]">Malzeme Adı</th>
              <th className="py-3 px-2 text-right">Miktar</th>
              <th className="py-3 px-2">Birim</th>
              <th className="py-3 px-2 text-center">Fotoğraf</th>
              <th className="py-3 px-2 text-center">GPS Konum</th>
              <th className="py-3 px-2 text-center">Senkron</th>
              <th className="py-3 px-3 text-center">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-medium">
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={16} className="py-12 text-center text-slate-400">
                  <p className="text-sm font-semibold">Kayıt bulunamadı</p>
                  <p className="text-xs">Yukarıdaki formdan yeni imalat kaydı ekleyebilirsiniz.</p>
                </td>
              </tr>
            ) : (
              filteredEntries.map((row) => {
                const hasPhotos = Boolean(row.beforePhoto || row.afterPhoto);
                const hasBothPhotos = Boolean(row.beforePhoto && row.afterPhoto);
                const parentProjectEntry = !hasPhotos 
                  ? entries.find(e => e.projeID === row.projeID && (e.beforePhoto || e.afterPhoto))
                  : null;
                const previewTarget = parentProjectEntry 
                  ? { ...row, beforePhoto: parentProjectEntry.beforePhoto, afterPhoto: parentProjectEntry.afterPhoto }
                  : row;

                return (
                  <tr key={row.id} className="hover:bg-blue-50/40 transition">
                    <td className="py-2.5 px-3 font-mono whitespace-nowrap text-slate-600">{row.date}</td>
                    <td className="py-2.5 px-3 font-bold text-blue-700 whitespace-nowrap">{row.projeID}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{row.santral}</div>
                      <div className="text-[11px] text-slate-500">{row.saha}</div>
                    </td>
                    <td className="py-2.5 px-2 font-mono text-slate-800 whitespace-nowrap">{row.kutu}</td>
                    <td className="py-2.5 px-2 font-bold text-emerald-700 whitespace-nowrap">{row.iscilikPoz}</td>
                    <td className="py-2.5 px-3 text-slate-800 leading-tight">{row.iscilikAciklama}</td>
                    <td className="py-2.5 px-2 text-right font-bold text-slate-900">{row.iscilikMiktar}</td>
                    <td className="py-2.5 px-2 text-slate-500">{row.iscilikBirim}</td>
                    <td className="py-2.5 px-2 whitespace-nowrap">
                      {row.malzemePoz ? (
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono font-bold text-[11px]">
                          {row.malzemePoz}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 leading-tight">
                      {row.malzemeAdi || '-'}
                    </td>
                    <td className="py-2.5 px-2 text-right font-semibold text-slate-800">
                      {row.malzemeMiktar || '-'}
                    </td>
                    <td className="py-2.5 px-2 text-slate-500">{row.malzemeBirim || '-'}</td>

                    {/* Fotoğraf Kolonu */}
                    <td className="py-2.5 px-2 text-center">
                      {hasPhotos ? (
                        <button
                          type="button"
                          onClick={() => setPreviewEntry(row)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition shadow-2xs ${
                            hasBothPhotos 
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                          title="Fotoğrafları Görüntüle"
                        >
                          <Camera className="w-3 h-3" />
                          {hasBothPhotos ? '2 Foto' : '1 Foto'}
                        </button>
                      ) : parentProjectEntry ? (
                        <button
                          type="button"
                          onClick={() => setPreviewEntry(previewTarget)}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 transition"
                          title="Proje ana fotoğrafı ilk satırdadır (Görüntülemek için tıklayın)"
                        >
                          <Camera className="w-3 h-3 text-slate-500" />
                          <span>Proje Fotosu</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>

                    {/* GPS Konum Kolonu */}
                    <td className="py-2.5 px-2 text-center">
                      {row.location ? (
                        <a
                          href={row.location.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-100 text-blue-800 hover:bg-blue-200 text-[11px] font-bold transition"
                          title={`${row.location.lat.toFixed(4)}, ${row.location.lng.toFixed(4)} - Haritada Aç`}
                        >
                          <MapPin className="w-3 h-3" />
                          GPS
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>

                    {/* Senkron Durumu Kolonu */}
                    <td className="py-2.5 px-2 text-center">
                      {row.syncStatus === 'synced' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> E-Tablo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" /> Kuyrukta
                        </span>
                      )}
                    </td>

                    {/* İşlem Butonları */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewEntry(row)}
                          className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                          title="Detay & Fotoğraf Karşılaştırma"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {onDeleteEntry && (
                          <button
                            type="button"
                            onClick={() => onDeleteEntry(row.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Hatalı Poz Satırını Sil"
                            aria-label="Hatalı Poz Satırını Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Summary Bar */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-4 font-medium">
          <span>Toplam Kayıt: <strong className="text-slate-900">{totalEntries}</strong></span>
          <span className="text-slate-300">|</span>
          <span>İşçilik Kalemi: <strong className="text-emerald-700">{totalIscilik}</strong></span>
          <span className="text-slate-300">|</span>
          <span>Malzeme Kalemi: <strong className="text-amber-700">{totalMalzeme}</strong></span>
          <span className="text-slate-300">|</span>
          <span>Fotoğraflı: <strong className="text-blue-700">{totalWithPhotos}</strong></span>
          <span className="text-slate-300">|</span>
          <span>GPS Konumlu: <strong className="text-indigo-700">{totalWithLocation}</strong></span>
        </div>

        <div className="text-[11px] text-slate-500 font-mono">
          Google Sheets Sütun Eşlemesi: A:U (21 Alan)
        </div>
      </div>

      {/* Photo Preview Modal */}
      {previewEntry && (
        <PhotoPreviewModal
          entry={previewEntry}
          onClose={() => setPreviewEntry(null)}
        />
      )}
    </div>
  );
}
