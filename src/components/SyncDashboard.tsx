import { 
  FileSpreadsheet, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Download, 
  HardHat, 
  Camera, 
  MapPin, 
  Layers, 
  ShieldCheck, 
  Activity,
  Sliders
} from 'lucide-react';
import { SantiyeEntry, SyncConfig, SyncLogEvent } from '../types';
import { exportToExcelFile } from '../services/storageAndSync';
import SantiyeTable from './SantiyeTable';

interface SyncDashboardProps {
  entries: SantiyeEntry[];
  syncConfig: SyncConfig;
  syncLogs: SyncLogEvent[];
  isSyncing: boolean;
  onTriggerSync: () => void;
  onUpdateAutoSync: (enabled: boolean) => void;
  onOpenSettings?: () => void;
  onDeleteEntry?: (id: string) => void;
  onClearAll?: () => void;
}

export default function SyncDashboard({
  entries,
  syncConfig,
  syncLogs,
  isSyncing,
  onTriggerSync,
  onUpdateAutoSync,
  onOpenSettings,
  onDeleteEntry,
  onClearAll
}: SyncDashboardProps) {
  const totalEntries = entries.length;
  const syncedEntries = entries.filter(e => e.syncStatus === 'synced').length;
  const pendingEntries = totalEntries - syncedEntries;
  const photoEntries = entries.filter(e => e.beforePhoto || e.afterPhoto).length;
  const locationEntries = entries.filter(e => e.location).length;

  // Aggregate job poz counts
  const jobCounts: Record<string, { desc: string; count: number; unit: string }> = {};
  entries.forEach(e => {
    if (e.iscilikPoz) {
      if (!jobCounts[e.iscilikPoz]) {
        jobCounts[e.iscilikPoz] = { desc: e.iscilikAciklama, count: 0, unit: e.iscilikBirim };
      }
      jobCounts[e.iscilikPoz].count += 1;
    }
  });

  const topJobs = Object.entries(jobCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  // Aggregate material counts
  const materialCounts: Record<string, { name: string; count: number }> = {};
  entries.forEach(e => {
    if (e.malzemePoz && e.malzemePoz !== '-') {
      if (!materialCounts[e.malzemePoz]) {
        materialCounts[e.malzemePoz] = { name: e.malzemeAdi, count: 0 };
      }
      materialCounts[e.malzemePoz].count += 1;
    }
  });

  const topMaterials = Object.entries(materialCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner & Main Sync Control Widget */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Google Sheets Senkronizasyon Portalı
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
              Saha Verileri Senkronizasyon Durumu
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Şantiyeden girilen işçilik pozları, kullanılan malzemeler, öncesi/sonrası fotoğraflar ve GPS konumları Google E-Tabloya anında yansıtılır.
            </p>
          </div>

          {/* Sync Trigger Card */}
          <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-3 sm:gap-4 shrink-0 shadow-lg w-full lg:w-auto">
            <div className="text-center sm:text-left w-full sm:w-auto">
              <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                {isSyncing ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-blue-400">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Veriler İletiliyor...
                  </span>
                ) : pendingEntries === 0 ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> E-Tablo Güncel
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                    <Clock className="w-3.5 h-3.5" /> {pendingEntries} Kayıt Bekliyor
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Son Senkron: {syncConfig.lastSyncAttempt || 'Az önce'}
              </p>
            </div>

            <button
              type="button"
              onClick={onTriggerSync}
              disabled={isSyncing}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold transition shadow-lg shadow-blue-600/30 active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Senkronize Ediliyor...' : 'Şimdi Senkronize Et'}
            </button>
          </div>
        </div>

        {/* Sync Controls Bar */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-5 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={syncConfig.autoSync}
                onChange={e => onUpdateAutoSync(e.target.checked)}
                className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
              />
              <span className="font-semibold text-slate-200 text-xs">
                Otomatik Senkronizasyon (Her kayıtta ilet)
              </span>
            </label>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
            {syncConfig.googleSheetUrl && (
              <a
                href={syncConfig.googleSheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold transition text-xs"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Google E-Tablo <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {onOpenSettings && (
              <>
                <span className="text-slate-600 hidden sm:inline">|</span>
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="flex items-center gap-1 text-slate-300 hover:text-white font-medium transition text-xs cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Entegrasyon Ayarları
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Toplam Kayıt */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block">Toplam Saha Kaydı</span>
            <span className="text-xl sm:text-3xl font-black text-slate-900 mt-0.5 sm:mt-1 block">
              {totalEntries}
            </span>
            <span className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5 sm:mt-1">
              <CheckCircle2 className="w-3 h-3" /> {syncedEntries} E-Tabloda
            </span>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <HardHat className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Senkronize Edilen */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block">Senkron Oranı</span>
            <span className="text-xl sm:text-3xl font-black text-emerald-600 mt-0.5 sm:mt-1 block">
              %{totalEntries > 0 ? Math.round((syncedEntries / totalEntries) * 100) : 100}
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 sm:mt-1 block truncate">
              {pendingEntries > 0 ? `${pendingEntries} bekliyor` : 'Eşitlendi'}
            </span>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Fotoğraflı Kayıtlar */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block">Fotoğraflı Kayıt</span>
            <span className="text-xl sm:text-3xl font-black text-amber-600 mt-0.5 sm:mt-1 block">
              {photoEntries}
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 sm:mt-1 block">
              Görsel saha kanıtı
            </span>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* GPS Doğrulandı */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block">GPS Konumlu İmalat</span>
            <span className="text-xl sm:text-3xl font-black text-indigo-600 mt-0.5 sm:mt-1 block">
              {locationEntries}
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 sm:mt-1 block">
              Harita koordinatları aktif
            </span>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* Şantiye Defteri İmalat Kayıtları Tablosu & Kartları */}
      <SantiyeTable
        entries={entries}
        onDeleteEntry={onDeleteEntry}
        onClearAll={onClearAll}
        onTriggerSync={onTriggerSync}
        isSyncing={isSyncing}
      />

      {/* Analytics & Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* İşçilik Dağılımı */}
        <div className="lg:col-span-6 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3.5 sm:space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">En Çok Yapılan İşçilik Kalemleri</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">Toplam {Object.keys(jobCounts).length} Kalem</span>
          </div>

          <div className="space-y-3">
            {topJobs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Kayıt girildiğinde dağılım oluşacaktır.</p>
            ) : (
              topJobs.map(([poz, info]) => {
                const percentage = totalEntries > 0 ? Math.round((info.count / totalEntries) * 100) : 0;
                return (
                  <div key={poz} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-800 font-bold">
                        Poz {poz}: <span className="font-normal text-slate-600 truncate">{info.desc}</span>
                      </span>
                      <span className="text-emerald-700 font-bold shrink-0 ml-2">
                        {info.count} işlem ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Malzeme Tüketimi */}
        <div className="lg:col-span-6 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3.5 sm:space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm">Sahada Kullanılan Temel Malzemeler</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">Toplam {Object.keys(materialCounts).length} Malzeme</span>
          </div>

          <div className="space-y-3">
            {topMaterials.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Malzeme kaydı bulunmuyor.</p>
            ) : (
              topMaterials.map(([kod, info]) => {
                return (
                  <div key={kod} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="truncate pr-2">
                      <span className="font-bold text-blue-700 mr-2 font-mono">M.Poz {kod}</span>
                      <span className="text-slate-700 font-medium">{info.name}</span>
                    </div>
                    <span className="font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded shrink-0">
                      {info.count} kullanım
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Real-time Sync Event Log & Google Sheets Format Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Canlı Log Akışı */}
        <div className="lg:col-span-6 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3.5 sm:space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Canlı Senkronizasyon Olay Günlüğü</h3>
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Canlı İzleme
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {syncLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Henüz olay kaydedilmedi.</p>
            ) : (
              syncLogs.map(log => (
                <div
                  key={log.id}
                  className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                    log.type === 'success'
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : log.type === 'warning'
                      ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                      : log.type === 'error'
                      ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <span className="font-mono text-[10px] text-slate-500 bg-white/70 px-1.5 py-0.5 rounded shrink-0">
                    {log.timestamp}
                  </span>
                  <p className="font-medium text-xs leading-relaxed">{log.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Google Sheets Dosya Bağlantı & Dışa Aktarma Özeti */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Google E-Tablo Saklama Mimarisi</h3>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                21 Sütun + Drive Klasörü
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Şantiye defterinde girilen her imalat kaydı Google E-Tabloya satır satır aktarılırken; çekilen fotoğraflar Google Drive'ınızda otomatik olarak <strong>"Şantiye Fotoğrafları"</strong> klasörüne <strong>.jpg</strong> dosyası olarak kaydedilir. <strong>Bir Proje ID için öncesi ve sonrası birer fotoğraf Drive'a eklenir; aynı fotoğraflar alt satırlarda tekrarlanmaz.</strong>
            </p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-mono space-y-1 text-slate-700">
              <div className="flex justify-between">
                <span>Kolon A - E:</span>
                <span className="font-bold text-slate-900">Tarih, Proje ID, Santral, Saha, Kutu</span>
              </div>
              <div className="flex justify-between">
                <span>Kolon F - I:</span>
                <span className="font-bold text-emerald-800">İş Poz, Açıklama, Miktar, Birim</span>
              </div>
              <div className="flex justify-between">
                <span>Kolon J - M:</span>
                <span className="font-bold text-amber-800">M.Poz, Malzeme Adı, Miktar, Birim</span>
              </div>
              <div className="flex justify-between">
                <span>Kolon N - R:</span>
                <span className="font-bold text-blue-800">Öncesi/Sonrası Foto (Drive), Enlem, Boylam, Maps</span>
              </div>
              <div className="flex justify-between">
                <span>Kolon S - U:</span>
                <span className="font-bold text-purple-800">Ekleyen Personel, Kayıt Zamanı, Senkron</span>
              </div>
            </div>
          </div>

          <div className="pt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => exportToExcelFile(entries)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Tüm Kayıtları Excel (.xlsx) İndir
            </button>
            <button
              type="button"
              onClick={onOpenSettings}
              className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Webhook Ayarları
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
