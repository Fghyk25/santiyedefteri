import React, { useState, useMemo } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  Clock, 
  Package, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  ChevronRight,
  HardHat,
  FileSpreadsheet
} from 'lucide-react';
import { ProjeTipi, SantiyeEntry } from '../types';
import { generateWeeklyPdfReport, ReportFilterOptions } from '../services/pdfReportGenerator';
import { calculateLaborHours } from './WeeklyPerformanceChart';

interface WeeklyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: SantiyeEntry[];
  currentUserName?: string;
}

export default function WeeklyReportModal({
  isOpen,
  onClose,
  entries,
  currentUserName = 'Sheff'
}: WeeklyReportModalProps) {
  // Preset date ranges
  const [datePreset, setDatePreset] = useState<'7days' | '14days' | '30days' | 'all'>('7days');
  const [selectedProjeTipi, setSelectedProjeTipi] = useState<string>('all');
  const [selectedCreatedBy, setSelectedCreatedBy] = useState<string>('all');
  const [includeLabor, setIncludeLabor] = useState(true);
  const [includeMaterial, setIncludeMaterial] = useState(true);
  const [includeTimeline, setIncludeTimeline] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Compute date range based on preset
  const dateRange = useMemo(() => {
    const today = new Date();
    const endIso = today.toISOString().slice(0, 10);

    if (datePreset === 'all') {
      return { startIso: '', endIso: '' };
    }

    const daysBack = datePreset === '7days' ? 6 : datePreset === '14days' ? 13 : 29;
    const start = new Date();
    start.setDate(today.getDate() - daysBack);
    const startIso = start.toISOString().slice(0, 10);

    return { startIso, endIso };
  }, [datePreset]);

  // Unique createdBy options
  const createdByOptions = useMemo(() => {
    const set = new Set<string>();
    entries.forEach(e => {
      if (e.createdBy) set.add(e.createdBy);
    });
    return Array.from(set);
  }, [entries]);

  // Live filtered entries count and statistics
  const previewStats = useMemo(() => {
    const filtered = entries.filter(e => {
      if (!e) return false;
      const entryDate = e.date || (e.createdAt ? e.createdAt.slice(0, 10) : '');

      if (dateRange.startIso && entryDate < dateRange.startIso) return false;
      if (dateRange.endIso && entryDate > dateRange.endIso) return false;

      if (selectedProjeTipi !== 'all') {
        if ((e.projeTipi || '') !== selectedProjeTipi) return false;
      }

      if (selectedCreatedBy !== 'all') {
        if ((e.createdBy || '') !== selectedCreatedBy) return false;
      }

      return true;
    });

    let totalLabor = 0;
    let totalMaterial = 0;

    filtered.forEach(e => {
      totalLabor += calculateLaborHours(e);
      if (e.malzemePoz && e.malzemePoz !== '-') {
        totalMaterial += parseFloat(e.malzemeMiktar) || 0;
      }
    });

    return {
      count: filtered.length,
      laborHours: Math.round(totalLabor * 10) / 10,
      materialQty: Math.round(totalMaterial * 10) / 10,
      filtered
    };
  }, [entries, dateRange, selectedProjeTipi, selectedCreatedBy]);

  const handleDownloadPdf = () => {
    setIsGenerating(true);
    setSuccessMsg(null);

    setTimeout(() => {
      try {
        const options: ReportFilterOptions = {
          startDate: dateRange.startIso || undefined,
          endDate: dateRange.endIso || undefined,
          projeTipi: selectedProjeTipi,
          createdBy: selectedCreatedBy,
          includeLaborBreakdown: includeLabor,
          includeMaterialBreakdown: includeMaterial,
          includeDailyTimeline: includeTimeline,
          includeDetailedTable: includeDetails,
          generatedBy: currentUserName
        };

        const result = generateWeeklyPdfReport(entries, options);
        if (result.success) {
          setSuccessMsg(`PDF Raporu başarıyla oluşturuldu ve indirildi (${result.recordCount} Kayıt)`);
          setTimeout(() => {
            onClose();
            setSuccessMsg(null);
          }, 1800);
        }
      } catch (err: any) {
        console.error('PDF report generation error:', err);
      } finally {
        setIsGenerating(false);
      }
    }, 250);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-t-2xl sm:rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Resmi İcmal ve Yönetici Özeti
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                Haftalık Şantiye PDF Raporu Oluştur
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* Success Banner */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. Date Range Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              Rapor Dönemi Seçimi
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setDatePreset('7days')}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                  datePreset === '7days'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Son 7 Gün (Haftalık)
                <span className="block text-[10px] font-normal opacity-80 mt-0.5">Varsayılan İcmal</span>
              </button>

              <button
                type="button"
                onClick={() => setDatePreset('14days')}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                  datePreset === '14days'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Son 14 Gün
                <span className="block text-[10px] font-normal opacity-80 mt-0.5">2 Haftalık Dönem</span>
              </button>

              <button
                type="button"
                onClick={() => setDatePreset('30days')}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                  datePreset === '30days'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Son 30 Gün
                <span className="block text-[10px] font-normal opacity-80 mt-0.5">Aylık İcmal</span>
              </button>

              <button
                type="button"
                onClick={() => setDatePreset('all')}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                  datePreset === 'all'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Tüm Kayıtlar
                <span className="block text-[10px] font-normal opacity-80 mt-0.5">Kapsamlı Arşiv</span>
              </button>
            </div>
          </div>

          {/* 2. Filters (Proje Tipi & Ekip) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                Proje Tipi Filtresi
              </label>
              <select
                value={selectedProjeTipi}
                onChange={e => setSelectedProjeTipi(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">Tüm Proje Tipleri (Hasar + Pasif + Bakım)</option>
                <option value="Hasar">Sadece Hasar Onarımları</option>
                <option value="Pasif">Sadece Pasif FTTx İmalatları</option>
                <option value="Bakım">Sadece Bakım & Revizyon</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <HardHat className="w-3.5 h-3.5 text-blue-600" />
                Ekip / Kaydeden Personel
              </label>
              <select
                value={selectedCreatedBy}
                onChange={e => setSelectedCreatedBy(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">Tüm Ekipler ve Personeller</option>
                {createdByOptions.map(author => (
                  <option key={author} value={author}>{author}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Section Toggles */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Rapora Dahil Edilecek Bölümler
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTimeline}
                  onChange={e => setIncludeTimeline(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-800">1. Günlük İmalat Çizelgesi</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLabor}
                  onChange={e => setIncludeLabor(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-800">2. İşçilik Pozları ve Saat Dağılımı</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeMaterial}
                  onChange={e => setIncludeMaterial(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-800">3. Malzeme Tüketim & Sarfiyat İcmali</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDetails}
                  onChange={e => setIncludeDetails(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-800">4. Ayrıntılı Saha Defteri Tablosu</span>
              </label>
            </div>
          </div>

          {/* 4. Live Summary Card of What will be printed */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs space-y-2">
            <div className="flex items-center justify-between text-blue-950 font-bold">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Oluşturulacak PDF Rapor Özeti
              </span>
              <span className="font-mono text-blue-800 font-bold">
                A4 Resmi İcmal
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 font-mono tabular-nums">
              <div className="bg-white p-2 rounded-lg border border-blue-100 text-center">
                <span className="text-[10px] text-slate-500 block font-sans">İmalat Kaydı</span>
                <span className="text-base font-extrabold text-slate-900">{previewStats.count}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-blue-100 text-center">
                <span className="text-[10px] text-slate-500 block font-sans">İşçilik Eforu</span>
                <span className="text-base font-extrabold text-blue-700">{previewStats.laborHours}h</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-blue-100 text-center">
                <span className="text-[10px] text-slate-500 block font-sans">Malzeme</span>
                <span className="text-base font-extrabold text-amber-700">{previewStats.materialQty} Ad./Mt.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl sm:rounded-b-3xl flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            Vazgeç
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGenerating || previewStats.count === 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white text-xs font-bold transition shadow-lg shadow-blue-600/25 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isGenerating ? 'PDF Hazırlanıyor...' : `PDF Raporu İndir (${previewStats.count} Kayıt)`}
          </button>
        </div>
      </div>
    </div>
  );
}
