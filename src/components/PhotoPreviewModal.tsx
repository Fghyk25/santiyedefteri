import { X, MapPin, ExternalLink, Calendar, UserCheck, CheckCircle2 } from 'lucide-react';
import { SantiyeEntry } from '../types';

interface PhotoPreviewModalProps {
  entry: SantiyeEntry | null;
  onClose: () => void;
}

export default function PhotoPreviewModal({ entry, onClose }: PhotoPreviewModalProps) {
  if (!entry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                {entry.projeID}
              </span>
              <span className="text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                {entry.santral} - {entry.saha}
              </span>
              <span className="text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                Kutu: {entry.kutu}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-lg mt-1 leading-snug">
              Poz {entry.iscilikPoz}: {entry.iscilikAciklama}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Before & After Photo Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Before Photo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-amber-600 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Çalışma Öncesi Fotoğraf
                </span>
                {entry.beforePhoto ? (
                  <span className="text-[11px] sm:text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Mevcut</span>
                ) : (
                  <span className="text-[11px] sm:text-xs text-rose-500 bg-rose-50 px-2 py-0.5 rounded">Yüklenmedi</span>
                )}
              </div>
              <div className="aspect-4/3 rounded-xl border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center relative group">
                {entry.beforePhoto ? (
                  <img
                    src={entry.beforePhoto}
                    alt="Çalışma Öncesi"
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-102"
                  />
                ) : (
                  <div className="text-center p-6 text-slate-400">
                    <p className="text-sm font-medium">Öncesi fotoğrafı bulunamadı</p>
                  </div>
                )}
              </div>
            </div>

            {/* After Photo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Çalışma Sonrası Fotoğraf
                </span>
                {entry.afterPhoto ? (
                  <span className="text-[11px] sm:text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Tamamlandı
                  </span>
                ) : (
                  <span className="text-[11px] sm:text-xs text-rose-500 bg-rose-50 px-2 py-0.5 rounded">Yüklenmedi</span>
                )}
              </div>
              <div className="aspect-4/3 rounded-xl border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center relative group">
                {entry.afterPhoto ? (
                  <img
                    src={entry.afterPhoto}
                    alt="Çalışma Sonrası"
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-102"
                  />
                ) : (
                  <div className="text-center p-6 text-slate-400">
                    <p className="text-sm font-medium">Sonrası fotoğrafı bulunamadı</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Location Details Box */}
          {entry.location ? (
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 sm:p-4 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-blue-900 font-semibold text-xs sm:text-sm">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  GPS Konum Koordinatları
                </div>
                <a
                  href={entry.location.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 px-3 py-2 sm:py-1.5 rounded-lg transition min-h-[36px]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Google Haritalar'da Aç
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs text-slate-700 pt-1">
                <div>
                  <span className="text-slate-500 block">Koordinatlar:</span>
                  <span className="font-mono font-medium">{entry.location.lat.toFixed(6)}, {entry.location.lng.toFixed(6)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">GPS Doğruluk:</span>
                  <span className="font-medium">±{entry.location.accuracy || 5} metre</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Adres / Saha:</span>
                  <span className="font-medium">{entry.location.address || `${entry.santral} - ${entry.saha}`}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              Bu kayıt için GPS konumu kaydedilmemiş.
            </div>
          )}

          {/* Record Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700">
            <div>
              <span className="text-slate-500 block">İşçilik Miktarı</span>
              <span className="font-bold text-slate-900 text-sm">{entry.iscilikMiktar} {entry.iscilikBirim}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Kullanılan Malzeme</span>
              <span className="font-bold text-slate-900 text-sm">
                {entry.malzemePoz ? `${entry.malzemePoz} - ${entry.malzemeMiktar} ${entry.malzemeBirim}` : 'Malzeme Yok'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" /> Tarih
              </span>
              <span className="font-medium text-slate-900">{entry.date}</span>
            </div>
            <div>
              <span className="text-slate-500 block flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-slate-400" /> Ekleyen
              </span>
              <span className="font-semibold text-slate-900">{entry.createdBy || 'Sheff'}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
