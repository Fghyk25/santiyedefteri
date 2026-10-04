import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Clock, 
  Package, 
  CalendarDays, 
  TrendingUp, 
  Layers, 
  CheckCircle2, 
  HardHat, 
  Info,
  Sparkles,
  ArrowUpRight,
  FileText
} from 'lucide-react';
import { SantiyeEntry } from '../types';

interface WeeklyPerformanceChartProps {
  entries: SantiyeEntry[];
  onOpenReportModal?: () => void;
}

export interface DayMetric {
  dateStr: string;
  isoDate: string;
  dayName: string;
  dayShort: string;
  dayNumber: number;
  monthName: string;
  isToday: boolean;
  laborHours: number;
  materialQty: number;
  entriesCount: number;
  entries: SantiyeEntry[];
  topLabor: { poz: string; desc: string; hours: number; count: number }[];
  topMaterials: { kod: string; name: string; qty: number; unit: string }[];
}

/**
 * Calculates standard labor hours for a field entry.
 * If unit is explicitly 'Saat' / 'h', uses direct quantity.
 * Otherwise, applies standard industry telecom labor norms (e.g. fiber splicing, cabling, pole erection).
 */
export function calculateLaborHours(entry: SantiyeEntry): number {
  const qty = parseFloat(entry.iscilikMiktar) || 0;
  if (qty <= 0) return 0;
  const unit = (entry.iscilikBirim || '').toLowerCase().trim();

  // If unit is directly hour / saat
  if (unit.includes('saat') || unit === 'h' || unit === 'hr') {
    return Math.round(qty * 10) / 10;
  }

  const poz = (entry.iscilikPoz || '').trim();
  // Poz-based realistic field effort calculation:
  if (poz.startsWith('4.')) {
    // Fiber splicing / termination: ~0.5 hour per core
    return Math.round(qty * 0.5 * 10) / 10;
  }
  if (poz.startsWith('1.')) {
    // Pole erection & stay wire: ~3.5 - 4 hours per pole
    return Math.round(qty * 3.5 * 10) / 10;
  }
  if (poz.startsWith('2.')) {
    // Cable pulling: ~0.08 hour per meter (8h per 100m)
    return Math.round(qty * 0.08 * 10) / 10;
  }
  if (poz.startsWith('3.')) {
    // Copper jointing: ~0.75 hour per splice
    return Math.round(qty * 0.75 * 10) / 10;
  }
  if (poz.startsWith('5.') || poz.startsWith('7.')) {
    // Cabinet, ODF, splitter box: ~2.5 hours per unit
    return Math.round(qty * 2.5 * 10) / 10;
  }
  if (poz.startsWith('8.')) {
    // Operator escort / inspection / survey
    return Math.round(Math.max(1, qty * 1.0) * 10) / 10;
  }
  if (poz.startsWith('10.')) {
    // Trench / HDPE pipe works: ~0.1 hour per meter
    return Math.round(qty * 0.1 * 10) / 10;
  }

  // General fallback: realistic task duration between 1.0 and 8.0 hours
  return Math.round(Math.min(8, Math.max(1, qty * 0.25)) * 10) / 10;
}

export default function WeeklyPerformanceChart({ entries, onOpenReportModal }: WeeklyPerformanceChartProps) {
  const [activeMetric, setActiveMetric] = useState<'both' | 'labor' | 'material'>('both');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(6); // Default to today (index 6)
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  // Compute 7 days up to today
  const weekData = useMemo<DayMetric[]>(() => {
    const today = new Date();
    const days: DayMetric[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const isoDate = d.toISOString().slice(0, 10);
      const dayName = d.toLocaleDateString('tr-TR', { weekday: 'long' });
      const dayShort = d.toLocaleDateString('tr-TR', { weekday: 'short' });
      const dayNumber = d.getDate();
      const monthName = d.toLocaleDateString('tr-TR', { month: 'short' });
      const dateStr = `${dayNumber} ${monthName}`;
      const isToday = i === 0;

      // Filter entries matching this date (either e.date or e.createdAt starting with isoDate)
      const dayEntries = entries.filter(e => {
        if (!e) return false;
        if (e.date === isoDate) return true;
        if (e.createdAt && e.createdAt.startsWith(isoDate)) return true;
        return false;
      });

      let laborHours = 0;
      let materialQty = 0;
      const laborMap: Record<string, { desc: string; hours: number; count: number }> = {};
      const matMap: Record<string, { name: string; qty: number; unit: string }> = {};

      dayEntries.forEach(entry => {
        const hours = calculateLaborHours(entry);
        laborHours += hours;

        if (entry.iscilikPoz) {
          if (!laborMap[entry.iscilikPoz]) {
            laborMap[entry.iscilikPoz] = {
              desc: entry.iscilikAciklama || 'Saha İmalatı',
              hours: 0,
              count: 0
            };
          }
          laborMap[entry.iscilikPoz].hours += hours;
          laborMap[entry.iscilikPoz].count += 1;
        }

        if (entry.malzemePoz && entry.malzemePoz !== '-') {
          const qty = parseFloat(entry.malzemeMiktar) || 0;
          materialQty += qty;
          if (!matMap[entry.malzemePoz]) {
            matMap[entry.malzemePoz] = {
              name: entry.malzemeAdi || 'Saha Malzemesi',
              qty: 0,
              unit: entry.malzemeBirim || 'Ad.'
            };
          }
          matMap[entry.malzemePoz].qty += qty;
        }
      });

      const topLabor = Object.entries(laborMap)
        .map(([poz, val]) => ({ poz, desc: val.desc, hours: Math.round(val.hours * 10) / 10, count: val.count }))
        .sort((a, b) => b.hours - a.hours);

      const topMaterials = Object.entries(matMap)
        .map(([kod, val]) => ({ kod, name: val.name, qty: Math.round(val.qty * 10) / 10, unit: val.unit }))
        .sort((a, b) => b.qty - a.qty);

      days.push({
        dateStr,
        isoDate,
        dayName,
        dayShort,
        dayNumber,
        monthName,
        isToday,
        laborHours: Math.round(laborHours * 10) / 10,
        materialQty: Math.round(materialQty * 10) / 10,
        entriesCount: dayEntries.length,
        entries: dayEntries,
        topLabor,
        topMaterials
      });
    }

    return days;
  }, [entries]);

  // Aggregate stats across 7 days
  const totals = useMemo(() => {
    const totalLabor = weekData.reduce((acc, d) => acc + d.laborHours, 0);
    const totalMaterial = weekData.reduce((acc, d) => acc + d.materialQty, 0);
    const totalEntriesCount = weekData.reduce((acc, d) => acc + d.entriesCount, 0);
    const avgDailyLabor = (totalLabor / 7).toFixed(1);
    const avgDailyMaterial = Math.round(totalMaterial / 7);

    // Peak day
    let peakDay = weekData[0];
    weekData.forEach(d => {
      if (d.laborHours > peakDay.laborHours) {
        peakDay = d;
      }
    });

    // Max values for chart scaling
    const maxLabor = Math.max(...weekData.map(d => d.laborHours), 10);
    const maxMaterial = Math.max(...weekData.map(d => d.materialQty), 10);

    return {
      totalLabor: Math.round(totalLabor * 10) / 10,
      totalMaterial: Math.round(totalMaterial * 10) / 10,
      totalEntriesCount,
      avgDailyLabor,
      avgDailyMaterial,
      peakDay,
      maxLabor,
      maxMaterial
    };
  }, [weekData]);

  const activeDay = weekData[hoveredDayIndex !== null ? hoveredDayIndex : selectedDayIndex] || weekData[6];

  // SVG Chart Geometry Constants
  const chartHeight = 160;
  const chartWidth = 560;
  const barSlotWidth = chartWidth / 7;
  const barWidth = 22; // Individual bar width

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header with Title and Mode Controls */}
      <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              Son 7 Günlük İşçilik Saati ve Malzeme Tüketimi
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Saha ekiplerinin günlük toplam işçilik eforu (saat) ile tüketilen malzeme miktarlarının karşılaştırmalı analizi
          </p>
        </div>

        {/* Metric Mode Filter Tabs & Report Button */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0">
          <div className="flex items-center p-1 bg-slate-100/90 rounded-xl text-xs font-semibold border border-slate-200/60">
            <button
              type="button"
              onClick={() => setActiveMetric('both')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeMetric === 'both'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kombine Grafik
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric('labor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeMetric === 'labor'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3 h-3" />
              İşçilik Saati
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric('material')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeMetric === 'material'
                  ? 'bg-amber-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-3 h-3" />
              Malzeme Miktarı
            </button>
          </div>

          {onOpenReportModal && (
            <button
              type="button"
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              title="Haftalık verileri filtreleyip PDF raporu olarak indir"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Rapor İndir (PDF)</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 sm:p-6 bg-slate-50/70 border-b border-slate-100 text-slate-700">
        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-600" />
            Son 7 Gün İşçilik
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-blue-700 font-mono tabular-nums">
              {totals.totalLabor}
            </span>
            <span className="text-xs font-semibold text-slate-500">Saat</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Ort. {totals.avgDailyLabor} Saat/gün
          </span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
            <Package className="w-3 h-3 text-amber-600" />
            Son 7 Gün Malzeme
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-amber-700 font-mono tabular-nums">
              {totals.totalMaterial}
            </span>
            <span className="text-xs font-semibold text-slate-500">Birim</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Ort. {totals.avgDailyMaterial} Ad./Mt. gün
          </span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
            <CalendarDays className="w-3 h-3 text-indigo-600" />
            En Yoğun Gün
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-bold text-slate-900 truncate">
              {totals.peakDay.dayName}
            </span>
          </div>
          <span className="text-[10px] text-indigo-600 font-medium mt-0.5 block font-mono tabular-nums">
            {totals.peakDay.laborHours} Saat · {totals.peakDay.materialQty} Malzeme
          </span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            Toplam İmalat Kaydı
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-emerald-700 font-mono tabular-nums">
              {totals.totalEntriesCount}
            </span>
            <span className="text-xs font-semibold text-slate-500">İşlem</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block flex items-center gap-0.5">
            <CheckCircle2 className="w-2.5 h-2.5" /> Saha Defteri Eşleşti
          </span>
        </div>
      </div>

      {/* Main Chart Canvas Area */}
      <div className="p-4 sm:p-6 space-y-4">
        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-4">
            {(activeMetric === 'both' || activeMetric === 'labor') && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-blue-600" />
                <span className="font-semibold text-slate-700">İşçilik Saati (Saat)</span>
              </div>
            )}
            {(activeMetric === 'both' || activeMetric === 'material') && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-amber-500" />
                <span className="font-semibold text-slate-700">Malzeme Miktarı (Ad./Mt.)</span>
              </div>
            )}
          </div>

          <span className="text-[11px] text-slate-400">
            Detayları görmek için gün çubuklarına tıklayabilirsiniz
          </span>
        </div>

        {/* SVG Dual-Bar Chart */}
        <div className="relative w-full overflow-x-auto pt-4 pb-2">
          <div className="min-w-[580px]">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`}
              className="w-full h-48 sm:h-56 select-none"
            >
              <defs>
                {/* Blue Gradient for Labor */}
                <linearGradient id="laborBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#1D4ED8" />
                </linearGradient>
                {/* Amber Gradient for Material */}
                <linearGradient id="materialBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
                {/* Active Highlight Gradient */}
                <linearGradient id="activeSlotGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {/* Background Horizontal Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                const y = chartHeight - pct * (chartHeight - 20) + 10;
                return (
                  <g key={i}>
                    <line
                      x1="0"
                      y1={y}
                      x2={chartWidth}
                      y2={y}
                      stroke="#E2E8F0"
                      strokeDasharray={pct === 0 ? '0' : '4 4'}
                      strokeWidth="1"
                    />
                  </g>
                );
              })}

              {/* Day Columns */}
              {weekData.map((d, idx) => {
                const slotX = idx * barSlotWidth;
                const isSelected = selectedDayIndex === idx;
                const isHovered = hoveredDayIndex === idx;

                // Scale bar heights (min 4px if >0 so bar is visible)
                const laborHeight = d.laborHours > 0 
                  ? Math.max(4, (d.laborHours / totals.maxLabor) * (chartHeight - 35))
                  : 0;

                const materialHeight = d.materialQty > 0
                  ? Math.max(4, (d.materialQty / totals.maxMaterial) * (chartHeight - 35))
                  : 0;

                // Coordinates for bars based on mode
                let laborX = slotX + (barSlotWidth - barWidth * 2 - 4) / 2;
                let materialX = laborX + barWidth + 4;

                if (activeMetric === 'labor') {
                  laborX = slotX + (barSlotWidth - barWidth * 1.5) / 2;
                } else if (activeMetric === 'material') {
                  materialX = slotX + (barSlotWidth - barWidth * 1.5) / 2;
                }

                const laborY = chartHeight + 10 - laborHeight;
                const materialY = chartHeight + 10 - materialHeight;

                return (
                  <g
                    key={d.isoDate}
                    className="cursor-pointer transition-all"
                    onClick={() => setSelectedDayIndex(idx)}
                    onMouseEnter={() => setHoveredDayIndex(idx)}
                    onMouseLeave={() => setHoveredDayIndex(null)}
                  >
                    {/* Background Slot Highlight */}
                    {(isSelected || isHovered) && (
                      <rect
                        x={slotX + 4}
                        y="6"
                        width={barSlotWidth - 8}
                        height={chartHeight + 10}
                        rx="8"
                        fill="url(#activeSlotGlow)"
                        stroke={isSelected ? '#3B82F6' : '#94A3B8'}
                        strokeWidth="1"
                        strokeDasharray={isSelected ? '0' : '2 2'}
                      />
                    )}

                    {/* Labor Hours Bar */}
                    {(activeMetric === 'both' || activeMetric === 'labor') && (
                      <g>
                        <rect
                          x={laborX}
                          y={laborY}
                          width={activeMetric === 'labor' ? barWidth * 1.5 : barWidth}
                          height={laborHeight}
                          rx="4"
                          fill="url(#laborBarGrad)"
                          className="transition-all duration-300"
                        />
                        {/* Number on top if > 0 */}
                        {d.laborHours > 0 && (
                          <text
                            x={laborX + (activeMetric === 'labor' ? barWidth * 0.75 : barWidth / 2)}
                            y={laborY - 4}
                            textAnchor="middle"
                            className="text-[10px] font-mono font-bold fill-blue-800"
                          >
                            {d.laborHours}h
                          </text>
                        )}
                      </g>
                    )}

                    {/* Material Quantity Bar */}
                    {(activeMetric === 'both' || activeMetric === 'material') && (
                      <g>
                        <rect
                          x={materialX}
                          y={materialY}
                          width={activeMetric === 'material' ? barWidth * 1.5 : barWidth}
                          height={materialHeight}
                          rx="4"
                          fill="url(#materialBarGrad)"
                          className="transition-all duration-300"
                        />
                        {/* Number on top if > 0 */}
                        {d.materialQty > 0 && (
                          <text
                            x={materialX + (activeMetric === 'material' ? barWidth * 0.75 : barWidth / 2)}
                            y={materialY - 4}
                            textAnchor="middle"
                            className="text-[10px] font-mono font-bold fill-amber-800"
                          >
                            {d.materialQty}
                          </text>
                        )}
                      </g>
                    )}

                    {/* X-Axis Day Labels */}
                    <text
                      x={slotX + barSlotWidth / 2}
                      y={chartHeight + 26}
                      textAnchor="middle"
                      className={`text-xs ${
                        isSelected
                          ? 'font-black fill-blue-700'
                          : d.isToday
                          ? 'font-bold fill-slate-900'
                          : 'font-medium fill-slate-600'
                      }`}
                    >
                      {d.dayShort}
                    </text>

                    <text
                      x={slotX + barSlotWidth / 2}
                      y={chartHeight + 38}
                      textAnchor="middle"
                      className={`text-[10px] ${
                        isSelected ? 'font-bold fill-blue-600' : 'fill-slate-400 font-mono'
                      }`}
                    >
                      {d.dateStr}
                    </text>

                    {/* Today marker dot */}
                    {d.isToday && (
                      <circle
                        cx={slotX + barSlotWidth / 2}
                        cy={chartHeight + 43}
                        r="2.5"
                        fill="#2563EB"
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* 7-Day Quick Selector Cards */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-2">
          {weekData.map((d, idx) => {
            const isSelected = selectedDayIndex === idx;
            return (
              <button
                key={d.isoDate}
                type="button"
                onClick={() => setSelectedDayIndex(idx)}
                className={`p-2 rounded-xl text-center transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <span className={`block text-[11px] sm:text-xs uppercase font-bold ${isSelected ? 'text-blue-700' : 'text-slate-600'}`}>
                  {d.dayShort}
                </span>
                <span className="block text-[10px] text-slate-400 font-mono">
                  {d.dayNumber} {d.monthName}
                </span>
                <div className="mt-1 space-y-0.5">
                  <span className={`block text-[11px] sm:text-xs font-mono font-bold ${d.laborHours > 0 ? 'text-blue-700' : 'text-slate-300'}`}>
                    {d.laborHours > 0 ? `${d.laborHours}h` : '0h'}
                  </span>
                  <span className={`block text-[10px] font-mono ${d.materialQty > 0 ? 'text-amber-700 font-semibold' : 'text-slate-300'}`}>
                    {d.materialQty > 0 ? `${d.materialQty}` : '0'}
                  </span>
                </div>
                {d.isToday && (
                  <span className="inline-block mt-1 text-[9px] font-bold text-blue-700 bg-blue-100 px-1 rounded">
                    Bugün
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Detail Drawer */}
      <div className="p-4 sm:p-6 bg-slate-50/90 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">
              {activeDay.dayName}, {activeDay.dateStr} İmalat Detayları
            </span>
            {activeDay.isToday && (
              <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                Bugün
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs font-mono tabular-nums">
            <span className="font-semibold text-blue-700">
              Toplam: <strong>{activeDay.laborHours} Saat</strong> İşçilik
            </span>
            <span className="text-slate-300">|</span>
            <span className="font-semibold text-amber-700">
              Toplam: <strong>{activeDay.materialQty} Birim</strong> Malzeme
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-medium">
              {activeDay.entriesCount} Kayıt
            </span>
          </div>
        </div>

        {activeDay.entriesCount === 0 ? (
          <div className="bg-white rounded-xl p-6 border border-slate-200/80 text-center text-slate-400">
            <Info className="w-6 h-6 mx-auto mb-1.5 opacity-40 text-slate-500" />
            <p className="text-xs font-medium">Bu tarihe ait kayıtlı saha imalatı bulunmuyor.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Şantiye Defteri formundan girilen imalatlar otomatik olarak buraya yansır.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* Day's Labor Breakdown */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Günün İşçilik Kalemleri
                </span>
                <span className="text-[11px] font-mono font-bold text-blue-700">
                  {activeDay.laborHours} Saat
                </span>
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {activeDay.topLabor.map(item => (
                  <div key={item.poz} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="truncate mr-2">
                      <span className="font-bold text-blue-700 font-mono mr-1.5">Poz {item.poz}</span>
                      <span className="text-slate-700">{item.desc}</span>
                    </div>
                    <span className="font-bold text-slate-900 font-mono shrink-0 ml-1">
                      {item.hours}h ({item.count} işlem)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Day's Material Breakdown */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-amber-600" />
                  Günün Malzeme Sarfiyatı
                </span>
                <span className="text-[11px] font-mono font-bold text-amber-700">
                  {activeDay.materialQty} Toplam Birim
                </span>
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {activeDay.topMaterials.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2 text-center">Bu tarihte malzeme kaydı girilmedi.</p>
                ) : (
                  activeDay.topMaterials.map(item => (
                    <div key={item.kod} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="truncate mr-2">
                        <span className="font-bold text-amber-800 font-mono mr-1.5">M.{item.kod}</span>
                        <span className="text-slate-700">{item.name}</span>
                      </div>
                      <span className="font-bold text-amber-900 font-mono shrink-0 ml-1">
                        {item.qty} {item.unit}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
