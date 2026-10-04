import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SantiyeEntry } from '../types';
import { calculateLaborHours } from '../components/WeeklyPerformanceChart';

export interface ReportFilterOptions {
  startDate?: string;
  endDate?: string;
  projeTipi?: string;
  createdBy?: string;
  santral?: string;
  includeLaborBreakdown?: boolean;
  includeMaterialBreakdown?: boolean;
  includeDailyTimeline?: boolean;
  includeDetailedTable?: boolean;
  generatedBy?: string;
}

/**
 * Normalizes Turkish characters to ensure 100% clean rendering in standard PDF viewers
 * without encoding glitches or missing glyphs.
 */
export function trPdf(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'G')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'I')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 'S')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'O')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'U');
}

/**
 * Generates and downloads a corporate Weekly Summary PDF Report
 */
export function generateWeeklyPdfReport(
  entries: SantiyeEntry[],
  options: ReportFilterOptions = {}
): { success: boolean; fileName: string; recordCount: number } {
  // 1. Filter entries based on options
  const filtered = entries.filter(e => {
    if (!e) return false;
    const entryDate = e.date || (e.createdAt ? e.createdAt.slice(0, 10) : '');

    if (options.startDate && entryDate < options.startDate) return false;
    if (options.endDate && entryDate > options.endDate) return false;

    if (options.projeTipi && options.projeTipi !== 'all') {
      if ((e.projeTipi || '') !== options.projeTipi) return false;
    }

    if (options.createdBy && options.createdBy !== 'all') {
      if ((e.createdBy || '') !== options.createdBy) return false;
    }

    if (options.santral && options.santral !== 'all') {
      if ((e.santral || '').toLowerCase() !== options.santral.toLowerCase()) return false;
    }

    return true;
  });

  // Calculate aggregates
  const totalEntries = filtered.length;
  let totalLaborHours = 0;
  let totalMaterialQty = 0;
  let syncedCount = 0;
  let photoCount = 0;
  let gpsCount = 0;

  const jobAggregation: Record<string, { desc: string; count: number; hours: number; totalQty: number; unit: string }> = {};
  const materialAggregation: Record<string, { name: string; count: number; totalQty: number; unit: string }> = {};
  const dailyAggregation: Record<string, { date: string; entriesCount: number; laborHours: number; materialQty: number; projects: Set<string> }> = {};

  filtered.forEach(e => {
    const hours = calculateLaborHours(e);
    totalLaborHours += hours;

    if (e.syncStatus === 'synced') syncedCount++;
    if (e.beforePhoto || e.afterPhoto) photoCount++;
    if (e.location) gpsCount++;

    const dateKey = e.date || (e.createdAt ? e.createdAt.slice(0, 10) : 'Tarihsiz');
    if (!dailyAggregation[dateKey]) {
      dailyAggregation[dateKey] = {
        date: dateKey,
        entriesCount: 0,
        laborHours: 0,
        materialQty: 0,
        projects: new Set()
      };
    }
    dailyAggregation[dateKey].entriesCount += 1;
    dailyAggregation[dateKey].laborHours += hours;
    if (e.projeAdi) dailyAggregation[dateKey].projects.add(e.projeAdi);

    // Job breakdown
    if (e.iscilikPoz) {
      if (!jobAggregation[e.iscilikPoz]) {
        jobAggregation[e.iscilikPoz] = {
          desc: e.iscilikAciklama || 'Saha Isiligi',
          count: 0,
          hours: 0,
          totalQty: 0,
          unit: e.iscilikBirim || 'Ad.'
        };
      }
      jobAggregation[e.iscilikPoz].count += 1;
      jobAggregation[e.iscilikPoz].hours += hours;
      jobAggregation[e.iscilikPoz].totalQty += parseFloat(e.iscilikMiktar) || 0;
    }

    // Material breakdown
    if (e.malzemePoz && e.malzemePoz !== '-') {
      const mQty = parseFloat(e.malzemeMiktar) || 0;
      totalMaterialQty += mQty;
      dailyAggregation[dateKey].materialQty += mQty;

      if (!materialAggregation[e.malzemePoz]) {
        materialAggregation[e.malzemePoz] = {
          name: e.malzemeAdi || 'Saha Malzemesi',
          count: 0,
          totalQty: 0,
          unit: e.malzemeBirim || 'Ad.'
        };
      }
      materialAggregation[e.malzemePoz].count += 1;
      materialAggregation[e.malzemePoz].totalQty += mQty;
    }
  });

  // 2. Initialize PDF Document (A4, portrait, mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Header Banner Background
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Accent Line
  doc.setFillColor(37, 99, 235); // blue-600
  doc.rect(0, 28, pageWidth, 2, 'F');

  // Title Text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(trPdf('TELEKOM & FIBER OPTIK ALTYAPI SANTIYE HAFTALIK OZET RAPORU'), margin, 12);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(
    trPdf('Saha Imalat Kayitlari, Iscilik Saatleri ve Malzeme Sarfiyat Icmali | Google Sheets & Drive Entegrasyonu'),
    margin,
    18
  );

  // Report Meta Strip (Right aligned in header)
  const now = new Date();
  const genDateStr = now.toLocaleDateString('tr-TR') + ' ' + now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(trPdf(`Rapor No: TT-REP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`), pageWidth - margin, 12, { align: 'right' });
  doc.text(trPdf(`Uretim: ${genDateStr}`), pageWidth - margin, 18, { align: 'right' });

  let currentY = 36;

  // Metadata Panel
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85); // slate-700
  doc.text(trPdf('Rapor Kapsami:'), margin + 4, currentY + 6);
  doc.setFont('helvetica', 'normal');
  const scopeStr = options.startDate && options.endDate 
    ? `${options.startDate} ile ${options.endDate} arasi`
    : 'Son 7 Gunluk Saha Calismalari';
  doc.text(trPdf(scopeStr), margin + 30, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text(trPdf('Proje Tipi:'), margin + 85, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(trPdf(options.projeTipi && options.projeTipi !== 'all' ? options.projeTipi : 'Tumu (Hasar, Pasif, Bakim)'), margin + 104, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text(trPdf('Raporlayan:'), margin + 4, currentY + 13);
  doc.setFont('helvetica', 'normal');
  doc.text(trPdf(options.generatedBy || 'Sheff (Saha Sefi)'), margin + 30, currentY + 13);

  doc.setFont('helvetica', 'bold');
  doc.text(trPdf('Durum:'), margin + 85, currentY + 13);
  doc.setFont('helvetica', 'normal');
  doc.text(trPdf(`${totalEntries} Imalat Kaydi Filtrelendi`), margin + 104, currentY + 13);

  currentY += 24;

  // Executive KPI Summary Boxes
  const kpiBoxWidth = (pageWidth - margin * 2 - 9) / 4;
  const kpiBoxHeight = 16;

  // KPI 1: Toplam Imalat
  doc.setFillColor(239, 246, 255); // blue-50
  doc.setDrawColor(191, 219, 254); // blue-200
  doc.roundedRect(margin, currentY, kpiBoxWidth, kpiBoxHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 64, 175); // blue-800
  doc.text(trPdf('TOPLAM IMALAT'), margin + 3, currentY + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(trPdf(`${totalEntries} Kayit`), margin + 3, currentY + 12);

  // KPI 2: Toplam Iscilik Saati
  const kpi2X = margin + kpiBoxWidth + 3;
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(187, 247, 208); // emerald-200
  doc.roundedRect(kpi2X, currentY, kpiBoxWidth, kpiBoxHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(22, 101, 52); // emerald-800
  doc.text(trPdf('ISCILIK EFORU'), kpi2X + 3, currentY + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(trPdf(`${Math.round(totalLaborHours * 10) / 10} Saat`), kpi2X + 3, currentY + 12);

  // KPI 3: Toplam Malzeme
  const kpi3X = kpi2X + kpiBoxWidth + 3;
  doc.setFillColor(254, 243, 199); // amber-50
  doc.setDrawColor(253, 230, 138); // amber-200
  doc.roundedRect(kpi3X, currentY, kpiBoxWidth, kpiBoxHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(146, 64, 14); // amber-800
  doc.text(trPdf('MALZEME SARFIYATI'), kpi3X + 3, currentY + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(trPdf(`${Math.round(totalMaterialQty * 10) / 10} Birim`), kpi3X + 3, currentY + 12);

  // KPI 4: Senkron & Kanit
  const kpi4X = kpi3X + kpiBoxWidth + 3;
  doc.setFillColor(245, 243, 255); // purple-50
  doc.setDrawColor(221, 214, 254); // purple-200
  doc.roundedRect(kpi4X, currentY, kpiBoxWidth, kpiBoxHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(107, 33, 168); // purple-800
  doc.text(trPdf('FOTO & GPS KANITI'), kpi4X + 3, currentY + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(trPdf(`%${totalEntries > 0 ? Math.round((photoCount / totalEntries) * 100) : 100} Kanitli`), kpi4X + 3, currentY + 12);

  currentY += kpiBoxHeight + 8;

  // 3. Section: Günlük İmalat ve Efor Çizelgesi
  if (options.includeDailyTimeline !== false) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(trPdf('1. Gunluk Imalat, Iscilik Saati ve Malzeme Tuketim Cizelgesi'), margin, currentY);
    currentY += 3;

    const dailyRows = Object.values(dailyAggregation)
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(d => {
        const dateObj = new Date(d.date);
        const dayName = isNaN(dateObj.getTime()) ? '' : dateObj.toLocaleDateString('tr-TR', { weekday: 'long' });
        return [
          trPdf(d.date),
          trPdf(dayName),
          trPdf(`${d.entriesCount} Imalat`),
          trPdf(`${Math.round(d.laborHours * 10) / 10} Saat`),
          trPdf(`${Math.round(d.materialQty * 10) / 10} Birim`),
          trPdf(Array.from(d.projects).slice(0, 2).join(', ') || 'Saha Calismasi')
        ];
      });

    autoTable(doc, {
      startY: currentY,
      head: [['Tarih', 'Gun', 'Imalat Sayisi', 'Iscilik Eforu', 'Malzeme Miktari', 'Ilgili Projeler']],
      body: dailyRows.length > 0 ? dailyRows : [['-', '-', 'Kayit yok', '0', '0', '-']],
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59], // slate-800
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'left'
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        textColor: [51, 65, 85]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: margin, right: margin }
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // Check if we need page break
  if (currentY > pageHeight - 65) {
    doc.addPage();
    currentY = 16;
  }

  // 4. Section: İşçilik Poz Dağılımı
  if (options.includeLaborBreakdown !== false) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(trPdf('2. En Cok Gerceklestirilen Iscilik Pozlari Dagilimi'), margin, currentY);
    currentY += 3;

    const jobRows = Object.entries(jobAggregation)
      .sort((a, b) => b[1].hours - a[1].hours)
      .slice(0, 8)
      .map(([poz, item]) => {
        const pct = totalLaborHours > 0 ? Math.round((item.hours / totalLaborHours) * 100) : 0;
        return [
          trPdf(`Poz ${poz}`),
          trPdf(item.desc),
          trPdf(item.unit),
          trPdf(String(item.count)),
          trPdf(String(item.totalQty)),
          trPdf(`${Math.round(item.hours * 10) / 10} h`),
          trPdf(`%${pct}`)
        ];
      });

    autoTable(doc, {
      startY: currentY,
      head: [['Poz No', 'Iscilik Aciklamasi', 'Birim', 'Islem Adedi', 'Toplam Miktar', 'Iscilik Saati', 'Efor Payi']],
      body: jobRows.length > 0 ? jobRows : [['-', 'Kayit bulunmuyor', '-', '0', '0', '0', '0%']],
      theme: 'grid',
      headStyles: {
        fillColor: [29, 78, 216], // blue-700
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        textColor: [51, 65, 85]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: margin, right: margin }
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // Check if we need page break
  if (currentY > pageHeight - 65) {
    doc.addPage();
    currentY = 16;
  }

  // 5. Section: Malzeme Sarfiyatı Özeti
  if (options.includeMaterialBreakdown !== false) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(trPdf('3. Sahada Kullanilan Temel Malzemeler ve Sarfiyat Miktari'), margin, currentY);
    currentY += 3;

    const matRows = Object.entries(materialAggregation)
      .sort((a, b) => b[1].totalQty - a[1].totalQty)
      .slice(0, 8)
      .map(([kod, item]) => {
        return [
          trPdf(`M.${kod}`),
          trPdf(item.name),
          trPdf(String(item.count)),
          trPdf(`${item.totalQty} ${item.unit}`)
        ];
      });

    autoTable(doc, {
      startY: currentY,
      head: [['M.Poz', 'Malzeme Tanimi / Aciklamasi', 'Kullanim Sikligi', 'Toplam Sarf Edilen Miktar']],
      body: matRows.length > 0 ? matRows : [['-', 'Malzeme sarfiyati bulunmuyor', '0', '0']],
      theme: 'grid',
      headStyles: {
        fillColor: [217, 119, 6], // amber-600
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        textColor: [51, 65, 85]
      },
      alternateRowStyles: {
        fillColor: [255, 251, 235]
      },
      margin: { left: margin, right: margin }
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // 6. Section: Ayrıntılı İmalat Kayıtları Tablosu (Yeni Sayfada başlar)
  if (options.includeDetailedTable !== false && filtered.length > 0) {
    doc.addPage();
    currentY = 16;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(trPdf('4. Saha Imalat Defteri Ayintili Islem Kayitlari'), margin, currentY);
    currentY += 3;

    const detailRows = filtered.slice(0, 35).map(e => {
      const photoStatus = (e.beforePhoto && e.afterPhoto) 
        ? 'Oncesi & Sonrasi' 
        : e.beforePhoto 
        ? 'Oncesi Var' 
        : e.afterPhoto 
        ? 'Sonrasi Var' 
        : 'Yok';

      return [
        trPdf(e.date),
        trPdf(e.projeID || '-'),
        trPdf(e.projeTipi || '-'),
        trPdf(`${e.santral || ''} - ${e.saha || ''}`),
        trPdf(`Poz ${e.iscilikPoz}: ${e.iscilikMiktar} ${e.iscilikBirim}`),
        trPdf(e.malzemePoz && e.malzemePoz !== '-' ? `M.${e.malzemePoz}: ${e.malzemeMiktar} ${e.malzemeBirim}` : '-'),
        trPdf(photoStatus),
        trPdf(e.createdBy || 'Ekip')
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [['Tarih', 'Proje ID', 'Tip', 'Santral / Saha', 'Iscilik & Miktar', 'Malzeme & Miktar', 'Fotograf Kaniti', 'Ekip']],
      body: detailRows,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42], // slate-900
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 6.8,
        cellPadding: 1.8,
        textColor: [51, 65, 85]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: margin, right: margin }
    });
  }

  // 7. Add Page Numbers and Official Footer to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      trPdf('Santiye Defteri Mobil & Web Entegrasyon Portali | Resmi Saha Faaliyet ve Malzeme Icmali'),
      margin,
      pageHeight - 6
    );

    doc.text(
      trPdf(`Sayfa ${i} / ${totalPages}`),
      pageWidth - margin,
      pageHeight - 6,
      { align: 'right' }
    );
  }

  // 8. Download the PDF
  const dateTag = now.toISOString().slice(0, 10);
  const fileName = `Santiye_Haftalik_Ozet_Raporu_${dateTag}.pdf`;
  doc.save(fileName);

  return {
    success: true,
    fileName,
    recordCount: totalEntries
  };
}
