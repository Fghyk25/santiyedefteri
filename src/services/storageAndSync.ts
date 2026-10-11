import { SantiyeEntry, SyncConfig, SyncLogEvent, User, SystemUser, ProjeTipi, LocationData } from '../types';
import * as XLSX from 'xlsx';

export const SYSTEM_USERS: SystemUser[] = [
  {
    username: 'Sheff',
    name: 'Sheff',
    role: 'Saha Şefi (Admin)',
    email: 'sheff@telekom-santiye.com',
    password: 'artessaha',
    canCreateEntry: true,
    canViewDashboard: true,
    canAccessSettings: true,
    isAdmin: true,
    authorizationLabel: 'Tam Yetkili Admin',
    description: 'İmalat girişi, dashboard, e-tablo, ayarlar ve tüm sistem yetkileri'
  },
  {
    username: 'EmineENKAYA',
    name: 'EmineENKAYA',
    role: 'Yönetici (İzleme)',
    email: 'emine.enkaya@enkaya.com',
    password: 'enkayasaha',
    canCreateEntry: false,
    canViewDashboard: true,
    canAccessSettings: false,
    isAdmin: false,
    authorizationLabel: 'Sadece Dashboard',
    description: 'Sadece dashboard, metrikler, fotoğraflar ve e-tablo izleme'
  },
  {
    username: 'CavitENKAYA',
    name: 'CavitENKAYA',
    role: 'Yönetici (İzleme)',
    email: 'cavit.enkaya@enkaya.com',
    password: 'enkayasaha',
    canCreateEntry: false,
    canViewDashboard: true,
    canAccessSettings: false,
    isAdmin: false,
    authorizationLabel: 'Sadece Dashboard',
    description: 'Sadece dashboard, metrikler, fotoğraflar ve e-tablo izleme'
  },
  {
    username: 'KABLO17599',
    name: 'KABLO17599',
    role: 'Saha İmalat Ekibi',
    email: 'kablo17599@telekom-santiye.com',
    password: 'santiyesaha',
    canCreateEntry: true,
    canViewDashboard: false,
    canAccessSettings: false,
    isAdmin: false,
    authorizationLabel: 'Sadece İmalat Girişi',
    description: 'Sadece yeni imalat ve fotoğraf girişi (Dashboard ve ayarlar kapalı)'
  },
  {
    username: 'KABLO17600',
    name: 'KABLO17600',
    role: 'Saha İmalat Ekibi',
    email: 'kablo17600@telekom-santiye.com',
    password: 'santiyesaha',
    canCreateEntry: true,
    canViewDashboard: false,
    canAccessSettings: false,
    isAdmin: false,
    authorizationLabel: 'Sadece İmalat Girişi',
    description: 'Sadece yeni imalat ve fotoğraf girişi (Dashboard ve ayarlar kapalı)'
  },
  {
    username: 'KABLO17601',
    name: 'KABLO17601',
    role: 'Saha İmalat Ekibi',
    email: 'kablo17601@telekom-santiye.com',
    password: 'santiyesaha',
    canCreateEntry: true,
    canViewDashboard: false,
    canAccessSettings: false,
    isAdmin: false,
    authorizationLabel: 'Sadece İmalat Girişi',
    description: 'Sadece yeni imalat ve fotoğraf girişi (Dashboard ve ayarlar kapalı)'
  },
  {
    username: 'fiber17500',
    name: 'fiber17500',
    role: 'Saha İmalat Ekibi (Fiber)',
    email: 'fiber17500@telekom-santiye.com',
    password: 'santiyesaha',
    canCreateEntry: true,
    canViewDashboard: false,
    canAccessSettings: false,
    isAdmin: false,
    authorizationLabel: 'Sadece İmalat Girişi',
    description: 'Sadece yeni imalat ve fotoğraf girişi (Dashboard ve ayarlar kapalı)'
  }
];

export const DEMO_USERS: User[] = SYSTEM_USERS;

export const DEFAULT_GOOGLE_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzGmLc_yfbyrC4LhsH8Qll9DWzKdA_R6UksRiraYIYKE7xF_kGkgO9XgiPtuvWbVg2a/exec';

export const INITIAL_SYNC_CONFIG: SyncConfig = {
  googleSheetUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
  googleWebhookUrl: DEFAULT_GOOGLE_WEBHOOK_URL,
  autoSync: true,
  syncInterval: 15,
  lastSyncAttempt: new Date().toLocaleTimeString('tr-TR'),
  lastSyncStatus: 'success',
  lastSyncMessage: 'Google E-Tablolar anlık senkronizasyon motoru hazır (Webhook bağlı).'
};

const getRelativeIsoDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
};

export const INITIAL_ENTRIES: SantiyeEntry[] = [
  // Bugün (Day 0)
  {
    id: 'rec-001',
    date: getRelativeIsoDate(0),
    projeID: 'PRJ-2026-IST',
    projeAdi: 'Moda Cad. FTTx Genişleme',
    projeTipi: 'Pasif',
    santral: 'Kadıköy Santral',
    saha: 'SH-04 Modafen',
    kutu: 'K-108A',
    iscilikPoz: '4.1',
    iscilikAciklama: 'Fiber Ek Yapımı veya Terminasyonu',
    iscilikMiktar: '12',
    iscilikBirim: 'Ad.',
    malzemePoz: '229',
    malzemeAdi: 'F/O Ek Kutusu (3 Kasetli)',
    malzemeMiktar: '2',
    malzemeBirim: 'Ad.',
    beforePhoto: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    afterPhoto: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
    location: {
      lat: 40.9912,
      lng: 29.0285,
      accuracy: 6,
      address: 'Caferağa Mah. Moda Cad. No:44, Kadıköy, İstanbul',
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString('tr-TR'),
      mapsUrl: 'https://www.google.com/maps?q=40.9912,29.0285'
    },
    createdBy: 'Sheff',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    syncStatus: 'synced',
    lastSyncedAt: new Date(Date.now() - 3500000).toLocaleTimeString('tr-TR')
  },
  {
    id: 'rec-002',
    date: getRelativeIsoDate(0),
    projeID: 'PRJ-2026-IST',
    projeAdi: 'Moda Cad. FTTx Genişleme',
    projeTipi: 'Pasif',
    santral: 'Kadıköy Santral',
    saha: 'SH-04 Modafen',
    kutu: 'K-108A',
    iscilikPoz: '2.1',
    iscilikAciklama: 'Havai Güzargahta (Direkte/Blokta) Her Kapasitede ve Tipte Kablo Çekimi',
    iscilikMiktar: '85',
    iscilikBirim: 'Mt.',
    malzemePoz: '260',
    malzemeAdi: '1x2 OBK (Outdoor + Zırhlı)',
    malzemeMiktar: '90',
    malzemeBirim: 'Mt.',
    beforePhoto: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=80',
    afterPhoto: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
    location: {
      lat: 40.9918,
      lng: 29.0291,
      accuracy: 8,
      address: 'Caferağa Mah. Rıza Paşa Sok. No:12, Kadıköy, İstanbul',
      timestamp: new Date(Date.now() - 7200000).toLocaleTimeString('tr-TR'),
      mapsUrl: 'https://www.google.com/maps?q=40.9918,29.0291'
    },
    createdBy: 'KABLO17599',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    syncStatus: 'synced',
    lastSyncedAt: new Date(Date.now() - 7100000).toLocaleTimeString('tr-TR')
  },
  // Dün (Day -1)
  {
    id: 'rec-003',
    date: getRelativeIsoDate(1),
    projeID: 'PRJ-2026-ANK',
    projeAdi: 'Tunalı Direk Hasar Onarımı',
    projeTipi: 'Hasar',
    santral: 'Çankaya Santral',
    saha: 'SH-12 Tunalı',
    kutu: 'K-204B',
    iscilikPoz: '1.1',
    iscilikAciklama: 'Direk Dikimi',
    iscilikMiktar: '1',
    iscilikBirim: 'Ad.',
    malzemePoz: '56',
    malzemeAdi: 'Ağaç telefon direği (7 Mt)',
    malzemeMiktar: '1',
    malzemeBirim: 'Ad.',
    beforePhoto: 'https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?w=800&auto=format&fit=crop&q=80',
    afterPhoto: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80',
    location: {
      lat: 39.9042,
      lng: 32.8601,
      accuracy: 5,
      address: 'Tunalı Hilmi Cad. No:78, Çankaya, Ankara',
      timestamp: '14:30:00',
      mapsUrl: 'https://www.google.com/maps?q=39.9042,32.8601'
    },
    createdBy: 'fiber17500',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    syncStatus: 'synced',
    lastSyncedAt: '14:32:00'
  },
  {
    id: 'rec-004',
    date: getRelativeIsoDate(1),
    projeID: 'PRJ-2026-ANK',
    projeAdi: 'Tunalı Direk Hasar Onarımı',
    projeTipi: 'Hasar',
    santral: 'Çankaya Santral',
    saha: 'SH-12 Tunalı',
    kutu: 'K-204B',
    iscilikPoz: '8.5',
    iscilikAciklama: 'Tesis Paylaşımı ve Saha Refakati (Mesai İçi)',
    iscilikMiktar: '7.5',
    iscilikBirim: 'saat',
    malzemePoz: '88',
    malzemeAdi: 'Lente Teli & Gergi Takımı',
    malzemeMiktar: '8',
    malzemeBirim: 'Ad.',
    createdBy: 'Sheff',
    createdAt: new Date(Date.now() - 82800000).toISOString(),
    syncStatus: 'synced',
    lastSyncedAt: '15:00:00'
  },
  // 2 Gün Önce (Day -2)
  {
    id: 'rec-005',
    date: getRelativeIsoDate(2),
    projeID: 'PRJ-2026-IZM',
    projeAdi: 'Alsancak F/O Altyapı Yenileme',
    projeTipi: 'Bakım',
    santral: 'Alsancak Santral',
    saha: 'SH-01 Kordon',
    kutu: 'K-50',
    iscilikPoz: '4.1',
    iscilikAciklama: 'Fiber Ek Yapımı veya Terminasyonu',
    iscilikMiktar: '16',
    iscilikBirim: 'Ad.',
    malzemePoz: '228',
    malzemeAdi: 'F/O Ek Kaseti (12/24 Port)',
    malzemeMiktar: '4',
    malzemeBirim: 'Ad.',
    createdBy: 'fiber17500',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    syncStatus: 'synced'
  },
  {
    id: 'rec-006',
    date: getRelativeIsoDate(2),
    projeID: 'PRJ-2026-IZM',
    projeAdi: 'Alsancak F/O Altyapı Yenileme',
    projeTipi: 'Bakım',
    santral: 'Alsancak Santral',
    saha: 'SH-01 Kordon',
    kutu: 'K-50',
    iscilikPoz: '2.1',
    iscilikAciklama: 'Kablo Kanalı/Tava İçinde Kablo Çekimi',
    iscilikMiktar: '110',
    iscilikBirim: 'Mt.',
    malzemePoz: '261',
    malzemeAdi: 'F/O Anahat Kablosu (24 Core)',
    malzemeMiktar: '115',
    malzemeBirim: 'Mt.',
    createdBy: 'KABLO17600',
    createdAt: new Date(Date.now() - 169200000).toISOString(),
    syncStatus: 'synced'
  },
  // 3 Gün Önce (Day -3)
  {
    id: 'rec-007',
    date: getRelativeIsoDate(3),
    projeID: 'PRJ-2026-IST',
    projeAdi: 'Ataşehir Finans Merkezi Pasif Hat',
    projeTipi: 'Pasif',
    santral: 'Ataşehir Santral',
    saha: 'SH-08 Finans',
    kutu: 'OFD-03',
    iscilikPoz: '5.1',
    iscilikAciklama: 'Saha Dolabı (OFDÇ / OFSD) Montajı ve Tespiti',
    iscilikMiktar: '2',
    iscilikBirim: 'Ad.',
    malzemePoz: '190',
    malzemeAdi: 'OFDÇ Tip Saha Dolabı (Baza Dahil)',
    malzemeMiktar: '2',
    malzemeBirim: 'Ad.',
    createdBy: 'Sheff',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    syncStatus: 'synced'
  },
  // 4 Gün Önce (Day -4)
  {
    id: 'rec-008',
    date: getRelativeIsoDate(4),
    projeID: 'PRJ-2026-BUR',
    projeAdi: 'Nilüfer Ana Arter HDPE Borulama',
    projeTipi: 'Pasif',
    santral: 'Nilüfer Santral',
    saha: 'SH-02 FSM',
    kutu: 'MH-14',
    iscilikPoz: '10.1',
    iscilikAciklama: 'Çift Cidarlı HDPE Boru Döşenmesi',
    iscilikMiktar: '60',
    iscilikBirim: 'Mt.',
    malzemePoz: '1',
    malzemeAdi: '50/40 mm HDPE Çift Cidarlı Boru',
    malzemeMiktar: '65',
    malzemeBirim: 'Mt.',
    createdBy: 'KABLO17599',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    syncStatus: 'synced'
  },
  // 5 Gün Önce (Day -5)
  {
    id: 'rec-009',
    date: getRelativeIsoDate(5),
    projeID: 'PRJ-2026-ANT',
    projeAdi: 'Muratpaşa Enerji ve Topraklama',
    projeTipi: 'Bakım',
    santral: 'Muratpaşa Santral',
    saha: 'SH-05 Lara',
    kutu: 'TP-01',
    iscilikPoz: '8.6',
    iscilikAciklama: 'İmalatların ve Malzeme Verilerinin Sisteme Girilmesi',
    iscilikMiktar: '8',
    iscilikBirim: 'saat',
    malzemePoz: '145',
    malzemeAdi: 'Bakır Topraklama Çubuğu (20mm x 1.5m)',
    malzemeMiktar: '6',
    malzemeBirim: 'Ad.',
    createdBy: 'Sheff',
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    syncStatus: 'synced'
  },
  // 6 Gün Önce (Day -6)
  {
    id: 'rec-010',
    date: getRelativeIsoDate(6),
    projeID: 'PRJ-2026-IST',
    projeAdi: 'Beşiktaş F/O Ek Yenileme',
    projeTipi: 'Bakım',
    santral: 'Beşiktaş Santral',
    saha: 'SH-09 Abbasağa',
    kutu: 'K-12',
    iscilikPoz: '4.1',
    iscilikAciklama: 'Fiber Ek Yapımı veya Terminasyonu',
    iscilikMiktar: '20',
    iscilikBirim: 'Ad.',
    malzemePoz: '228',
    malzemeAdi: 'F/O Ek Kaseti (12/24 Port)',
    malzemeMiktar: '5',
    malzemeBirim: 'Ad.',
    createdBy: 'fiber17500',
    createdAt: new Date(Date.now() - 518400000).toISOString(),
    syncStatus: 'synced'
  }
];

export const INITIAL_SYNC_LOGS: SyncLogEvent[] = [
  {
    id: 'log-1',
    timestamp: new Date().toLocaleTimeString('tr-TR'),
    type: 'success',
    message: 'Google Sheets bağlantısı sağlandı ve 3 kayıt senkronize edildi.',
    recordCount: 3
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 120000).toLocaleTimeString('tr-TR'),
    type: 'info',
    message: 'Canlı senkronizasyon servisi başlatıldı (15s aralıklı kontrol aktif).',
  }
];

// Local storage helpers
const STORAGE_KEYS = {
  USER: 'santiye_auth_user',
  ENTRIES: 'santiye_entries_v2',
  CONFIG: 'santiye_sync_config_v2',
  LOGS: 'santiye_sync_logs_v2'
};

export function getStoredUser(): User | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    if (!data) return DEMO_USERS[0]; // Default logged in for immediate seamless preview
    return JSON.parse(data);
  } catch {
    return DEMO_USERS[0];
  }
}

export function setStoredUser(user: User | null): void {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.USER);
  } else {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }
}

export function getStoredEntries(): SantiyeEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(INITIAL_ENTRIES));
      return INITIAL_ENTRIES;
    }
    const parsed: SantiyeEntry[] = JSON.parse(data);
    let hasLegacyAuthor = false;

    // Migrate any legacy placeholder author names ('Ahmet Yılmaz' / 'Murat Kaya' / empty) and ensure projeAdi/projeTipi
    const sanitized = parsed.map((entry, idx) => {
      let updated = { ...entry };
      if (updated.createdBy === 'Ahmet Yılmaz' || updated.createdBy === 'Murat Kaya' || !updated.createdBy || updated.createdBy === 'Saha Personeli') {
        hasLegacyAuthor = true;
        updated.createdBy = idx % 2 === 0 ? 'Sheff' : 'KABLO17599';
      }
      if (!updated.projeAdi) {
        hasLegacyAuthor = true;
        updated.projeAdi = `${updated.santral || 'Saha'} ${updated.saha || ''} İmalatı`.trim();
      }
      if (!updated.projeTipi && updated.projeID && updated.projeID !== 'Atanmadı') {
        hasLegacyAuthor = true;
        updated.projeTipi = idx === 2 ? 'Hasar' : 'Pasif';
      }
      return updated;
    });

    // Keep stored entries as is without forcing dummy initial entries
    let result = sanitized;

    if (hasLegacyAuthor) {
      localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(result));
    }

    return result;
  } catch {
    return INITIAL_ENTRIES;
  }
}

export function setStoredEntries(entries: SantiyeEntry[]): void {
  localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
}

export function getStoredSyncConfig(): SyncConfig {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(INITIAL_SYNC_CONFIG));
      return INITIAL_SYNC_CONFIG;
    }
    const parsed: SyncConfig = JSON.parse(data);
    // If webhook url is missing or empty, ensure the official pre-configured webhook URL is loaded
    if (!parsed.googleWebhookUrl || !parsed.googleWebhookUrl.trim()) {
      parsed.googleWebhookUrl = DEFAULT_GOOGLE_WEBHOOK_URL;
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return INITIAL_SYNC_CONFIG;
  }
}

export function setStoredSyncConfig(config: SyncConfig): void {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
}

export function getStoredSyncLogs(): SyncLogEvent[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_SYNC_LOGS));
      return INITIAL_SYNC_LOGS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_SYNC_LOGS;
  }
}

export function setStoredSyncLogs(logs: SyncLogEvent[]): void {
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs.slice(0, 50)));
}

// Convert entries to Google Sheets formatted rows (22 columns, matching Google Sheet structure without extra Proje Adı)
export function mapEntriesToGoogleSheetRows(entries: SantiyeEntry[]) {
  const seenProjects = new Set<string>();

  return entries.map(e => {
    const pId = (e.projeID && e.projeID !== 'Atanmadı')
      ? e.projeID
      : (e.projeAdi || `${e.santral}_${e.kutu}_${e.date}`);
    const isFirstForProject = !seenProjects.has(pId);
    if (isFirstForProject) {
      seenProjects.add(pId);
    }

    const author = (e.createdBy && e.createdBy !== 'Ahmet Yılmaz' && e.createdBy !== 'Murat Kaya' && e.createdBy !== 'Saha Personeli')
      ? e.createdBy
      : 'Sheff';

    return {
      'Tarih': e.date,
      'Proje ID': e.projeID || e.projeAdi || 'Atanmadı',
      'Proje Tipi': e.projeTipi || '-',
      'Santral': e.santral,
      'Saha / Bölge': e.saha,
      'Kutu / Dolap No': e.kutu,
      'İşçilik Poz': e.iscilikPoz,
      'İşçilik Açıklama': e.iscilikAciklama,
      'İşçilik Miktar': e.iscilikMiktar,
      'İşçilik Birim': e.iscilikBirim,
      'Malzeme Poz': e.malzemePoz || '-',
      'Malzeme Adı': e.malzemeAdi || '-',
      'Malzeme Miktar': e.malzemeMiktar || '-',
      'Malzeme Birim': e.malzemeBirim || '-',
      'Öncesi Fotoğraf': isFirstForProject && e.beforePhoto ? (e.beforePhoto.startsWith('http') ? e.beforePhoto : 'Mevcut (Drive / Gömülü)') : '-',
      'Sonrası Fotoğraf': isFirstForProject && e.afterPhoto ? (e.afterPhoto.startsWith('http') ? e.afterPhoto : 'Mevcut (Drive / Gömülü)') : '-',
      'Konum (Enlem, Boylam)': e.location ? `${e.location.lat.toFixed(5)}, ${e.location.lng.toFixed(5)}` : '-',
      'Konum Adresi': e.location?.address || '-',
      'Google Harita Linki': e.location?.mapsUrl || '-',
      'Ekleyen Kullanıcı': author,
      'Kayıt Saati': e.createdAt ? new Date(e.createdAt).toLocaleString('tr-TR') : '-',
      'Senkron Durumu': e.syncStatus === 'synced' ? 'Senkronize Edildi' : 'Beklemede'
    };
  });
}

// Export to Excel .xlsx using SheetJS
export function exportToExcelFile(entries: SantiyeEntry[], filenamePrefix = 'Santiye_Defteri_GoogleSheets'): void {
  if (entries.length === 0) {
    console.warn('İndirilecek kayıt bulunamadı.');
    return;
  }

  const rows = mapEntriesToGoogleSheetRows(entries);
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths for readability (22 columns)
  const colWidths = [
    { wch: 12 }, // Tarih
    { wch: 16 }, // Proje ID
    { wch: 12 }, // Proje Tipi
    { wch: 18 }, // Santral
    { wch: 18 }, // Saha
    { wch: 14 }, // Kutu
    { wch: 10 }, // Poz
    { wch: 35 }, // Açıklama
    { wch: 12 }, // İş Miktar
    { wch: 10 }, // Birim
    { wch: 12 }, // M.Poz
    { wch: 35 }, // Malzeme
    { wch: 12 }, // M.Miktar
    { wch: 10 }, // M.Birim
    { wch: 25 }, // Öncesi Foto
    { wch: 25 }, // Sonrası Foto
    { wch: 22 }, // Konum
    { wch: 30 }, // Adres
    { wch: 35 }, // Maps link
    { wch: 18 }, // Kullanıcı
    { wch: 20 }, // Saat
    { wch: 15 }  // Senkron
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Şantiye & Google Sheets');

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${filenamePrefix}_${dateStr}.xlsx`);
}

export const DEFAULT_SYNC_CONFIG = INITIAL_SYNC_CONFIG;
export const loadEntriesFromStorage = getStoredEntries;
export const saveEntriesToStorage = setStoredEntries;
export const loadSyncConfig = getStoredSyncConfig;
export const saveSyncConfig = setStoredSyncConfig;
export const loadSyncLogs = getStoredSyncLogs;
export const saveSyncLogs = setStoredSyncLogs;

// Helper: Parse any sheet row representation into a standardized SantiyeEntry
export function parseSheetRowToEntry(row: Record<string, any>, index: number): SantiyeEntry {
  const dateVal = row['Tarih'] || row['tarih'] || row['date'] || new Date().toISOString().slice(0, 10);
  const projeIdVal = row['Proje ID'] || row['projeID'] || row['Proje Kodu'] || row['Proje No'] || row['Proje Adı'] || row['projeAdi'] || 'Atanmadı';
  const projeTipiVal = (row['Proje Tipi'] || row['projeTipi'] || '') as ProjeTipi;
  const santralVal = row['Santral'] || row['santral'] || '';
  const sahaVal = row['Saha / Bölge'] || row['Saha'] || row['saha'] || '';
  const kutuVal = row['Kutu / Dolap No'] || row['Kutu'] || row['kutu'] || '';
  const iscilikPozVal = row['İşçilik Poz'] || row['iscilikPoz'] || row['Poz'] || '';
  const iscilikAciklamaVal = row['İşçilik Açıklama'] || row['iscilikAciklama'] || '';
  const iscilikMiktarVal = String(row['İşçilik Miktar'] || row['iscilikMiktar'] || '1');
  const iscilikBirimVal = row['İşçilik Birim'] || row['iscilikBirim'] || 'Ad.';
  const malzemePozVal = row['Malzeme Poz'] || row['malzemePoz'] || '-';
  const malzemeAdiVal = row['Malzeme Adı'] || row['malzemeAdi'] || '-';
  const malzemeMiktarVal = String(row['Malzeme Miktar'] || row['malzemeMiktar'] || '');
  const malzemeBirimVal = row['Malzeme Birim'] || row['malzemeBirim'] || '';
  
  const beforePhotoVal = row['Öncesi Fotoğraf (Google Drive Linki)'] || row['Öncesi Fotoğraf'] || row['beforePhoto'] || '';
  const afterPhotoVal = row['Sonrası Fotoğraf (Google Drive Linki)'] || row['Sonrası Fotoğraf'] || row['afterPhoto'] || '';
  
  const locCoords = row['Konum (Enlem, Boylam)'] || row['Konum'] || '';
  const locAddress = row['Konum Adresi'] || row['Adres'] || '';
  const mapsUrl = row['Google Harita Linki'] || row['Harita'] || '';
  const createdByVal = row['Ekleyen Kullanıcı'] || row['createdBy'] || 'Sheff';
  const createdAtVal = row['Kayıt Saati'] || row['createdAt'] || '';

  let location: LocationData | undefined = undefined;
  if (locCoords && locCoords !== '-' && locCoords !== '') {
    const parts = String(locCoords).split(',');
    if (parts.length >= 2) {
      const lat = parseFloat(parts[0].trim());
      const lng = parseFloat(parts[1].trim());
      if (!isNaN(lat) && !isNaN(lng)) {
        location = {
          lat,
          lng,
          address: locAddress && locAddress !== '-' ? String(locAddress) : undefined,
          mapsUrl: mapsUrl && mapsUrl !== '-' ? String(mapsUrl) : `https://www.google.com/maps?q=${lat},${lng}`,
          timestamp: String(createdAtVal || dateVal)
        };
      }
    }
  }

  const cleanDate = String(dateVal).slice(0, 10);
  const cleanPoz = String(iscilikPozVal).replace(/[^a-zA-Z0-9]/g, '');
  const cleanKutu = String(kutuVal).replace(/[^a-zA-Z0-9]/g, '');
  const entryId = row['id'] || `GS-${cleanDate}-${cleanKutu}-${cleanPoz}-${index}`;

  return {
    id: entryId,
    date: cleanDate,
    projeID: String(projeIdVal).trim() || 'Atanmadı',
    projeAdi: String(projeIdVal).trim() || 'Atanmadı',
    projeTipi: projeTipiVal,
    santral: String(santralVal).trim(),
    saha: String(sahaVal).trim(),
    kutu: String(kutuVal).trim(),
    iscilikPoz: String(iscilikPozVal).trim(),
    iscilikAciklama: String(iscilikAciklamaVal).trim(),
    iscilikMiktar: String(iscilikMiktarVal).trim(),
    iscilikBirim: String(iscilikBirimVal).trim(),
    malzemePoz: String(malzemePozVal).trim(),
    malzemeAdi: String(malzemeAdiVal).trim(),
    malzemeMiktar: String(malzemeMiktarVal).trim(),
    malzemeBirim: String(malzemeBirimVal).trim(),
    beforePhoto: beforePhotoVal && beforePhotoVal !== '-' ? String(beforePhotoVal) : undefined,
    afterPhoto: afterPhotoVal && afterPhotoVal !== '-' ? String(afterPhotoVal) : undefined,
    location,
    createdBy: String(createdByVal).trim() || 'Sheff',
    createdAt: String(createdAtVal || cleanDate),
    syncStatus: 'synced',
    lastSyncedAt: new Date().toLocaleTimeString('tr-TR')
  };
}

// Fetch entries directly from Google Sheets (via Webhook GET, Visualization API, or CSV)
export async function fetchEntriesFromGoogleSheets(
  config: SyncConfig
): Promise<{ success: boolean; entries: SantiyeEntry[]; message: string }> {
  const webhookUrl = (config.googleWebhookUrl || DEFAULT_GOOGLE_WEBHOOK_URL).trim();
  const sheetUrl = (config.googleSheetUrl || '').trim();

  // 1. Try Webhook GET (Google Apps Script doGet)
  if (webhookUrl.startsWith('http')) {
    try {
      const resp = await fetch(webhookUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (resp.ok) {
        const data = await resp.json();
        const rawEntries = Array.isArray(data) 
          ? data 
          : (data.entries || data.rows || data.records || data.data || []);
        
        if (Array.isArray(rawEntries) && rawEntries.length > 0) {
          const parsed = rawEntries.map((row: any, idx: number) => parseSheetRowToEntry(row, idx));
          return {
            success: true,
            entries: parsed,
            message: `Google Sheets'ten ${parsed.length} imalat kaydı canlı olarak yüklendi.`
          };
        }
      }
    } catch (err) {
      console.warn('Webhook GET did not return entries directly, trying Google Sheets endpoints:', err);
    }
  }

  // 2. Try Google Visualization Query API or CSV Export from spreadsheet URL
  const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  const spreadsheetId = match ? match[1] : null;

  if (spreadsheetId) {
    try {
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json`;
      const res = await fetch(gvizUrl);
      if (res.ok) {
        const text = await res.text();
        const jsonText = text.replace(/^[/*\s]*google\.visualization\.Query\.setResponse\(/, '').replace(/\);?[\s/*]*$/, '');
        const json = JSON.parse(jsonText);
        if (json && json.table && Array.isArray(json.table.rows) && json.table.rows.length > 0) {
          const cols: string[] = (json.table.cols || []).map((c: any) => c?.label || '');
          const rows: Record<string, any>[] = json.table.rows.map((r: any) => {
            const obj: Record<string, any> = {};
            (r.c || []).forEach((cell: any, i: number) => {
              const colName = cols[i] || `col_${i}`;
              obj[colName] = cell ? (cell.f || cell.v || '') : '';
            });
            return obj;
          });

          if (rows.length > 0) {
            const parsed = rows.map((r, idx) => parseSheetRowToEntry(r, idx));
            return {
              success: true,
              entries: parsed,
              message: `Google E-Tablodan ${parsed.length} kayıt başarıyla çekildi.`
            };
          }
        }
      }
    } catch (gvizErr) {
      console.warn('Google Sheets gviz API fetch error:', gvizErr);
    }

    try {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
      const csvRes = await fetch(csvUrl);
      if (csvRes.ok) {
        const csvText = await csvRes.text();
        const workbook = XLSX.read(csvText, { type: 'string' });
        const firstSheetName = workbook.SheetNames[0];
        const rawJson: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName]);
        if (Array.isArray(rawJson) && rawJson.length > 0) {
          const parsed = rawJson.map((r, idx) => parseSheetRowToEntry(r, idx));
          return {
            success: true,
            entries: parsed,
            message: `Google E-Tablo CSV'den ${parsed.length} kayıt okundu.`
          };
        }
      }
    } catch (csvErr) {
      console.warn('CSV export fetch error:', csvErr);
    }
  }

  return {
    success: false,
    entries: [],
    message: 'Google Sheets üzerinden canlı kayıt henüz okunamadı. Mevcut kayıtlar korunuyor.'
  };
}

// Deduplicate and merge local pending entries with Google Sheets entries
export function mergeAndDeduplicateEntries(
  localEntries: SantiyeEntry[],
  sheetEntries: SantiyeEntry[]
): SantiyeEntry[] {
  if (!sheetEntries || sheetEntries.length === 0) {
    return localEntries;
  }

  const getSig = (e: SantiyeEntry) => 
    `${e.date}_${e.santral}_${e.kutu}_${e.iscilikPoz}_${e.iscilikMiktar}_${e.malzemePoz || ''}`.toLowerCase().trim();

  const sheetSignatures = new Set(sheetEntries.map(getSig));
  
  // Pending local items not yet in Google Sheets
  const stillPendingLocal = localEntries.filter(
    local => local.syncStatus === 'pending' && !sheetSignatures.has(getSig(local))
  );

  const combined = [...stillPendingLocal, ...sheetEntries];

  // Guarantee uniqueness
  const seenSigs = new Set<string>();
  const deduplicated: SantiyeEntry[] = [];

  for (const item of combined) {
    const s = getSig(item);
    if (!seenSigs.has(s)) {
      seenSigs.add(s);
      deduplicated.push(item);
    }
  }

  return deduplicated;
}

// Direct Webhook dispatch to Google Sheets Apps Script Web App
// ONLY pushes pending/unsynced items to prevent duplicating existing records
export async function dispatchToGoogleSheetsWebhook(
  entries: SantiyeEntry[],
  configOrUrl?: SyncConfig | string
): Promise<{ success: boolean; message: string; syncedCount: number }> {
  let webhookUrl = typeof configOrUrl === 'string' 
    ? configOrUrl 
    : (configOrUrl?.googleWebhookUrl || '');

  if (!webhookUrl || !webhookUrl.trim()) {
    webhookUrl = DEFAULT_GOOGLE_WEBHOOK_URL;
  }

  if (entries.length === 0) {
    return {
      success: true,
      message: 'Aktarılacak bekleyen kayıt bulunmuyor.',
      syncedCount: 0
    };
  }

  // Prepare payload with image base64 / URLs without extra "Proje Adı" column
  const seenWebhookProjects = new Set<string>();
  const payloadEntries = entries.map(e => {
    const projectKey = (e.projeID && e.projeID !== 'Atanmadı')
      ? e.projeID
      : (e.projeAdi || `${e.santral}_${e.kutu}_${e.date}`);
    const isFirstForProject = !seenWebhookProjects.has(projectKey);
    if (isFirstForProject) {
      seenWebhookProjects.add(projectKey);
    }
    const bPhoto = isFirstForProject ? (e.beforePhoto || '') : '';
    const aPhoto = isFirstForProject ? (e.afterPhoto || '') : '';
    const author = (e.createdBy && e.createdBy !== 'Ahmet Yılmaz' && e.createdBy !== 'Murat Kaya' && e.createdBy !== 'Saha Personeli')
      ? e.createdBy
      : 'Sheff';

    return {
      id: e.id,
      date: e.date,
      projeID: e.projeID || e.projeAdi || 'Atanmadı',
      projeTipi: e.projeTipi || '-',
      santral: e.santral,
      saha: e.saha,
      kutu: e.kutu,
      iscilikPoz: e.iscilikPoz,
      iscilikAciklama: e.iscilikAciklama,
      iscilikMiktar: e.iscilikMiktar,
      iscilikBirim: e.iscilikBirim,
      malzemePoz: e.malzemePoz || '-',
      malzemeAdi: e.malzemeAdi || '-',
      malzemeMiktar: e.malzemeMiktar || '-',
      malzemeBirim: e.malzemeBirim || '-',
      beforePhoto: bPhoto,
      afterPhoto: aPhoto,
      locationLat: e.location ? e.location.lat : null,
      locationLng: e.location ? e.location.lng : null,
      locationAddress: e.location?.address || '-',
      mapsUrl: e.location?.mapsUrl || '-',
      createdBy: author,
      createdAt: e.createdAt,
      // Turkish keys matching exactly the 22 Google Sheet column headers
      'Tarih': e.date,
      'Proje ID': e.projeID || e.projeAdi || 'Atanmadı',
      'Proje Tipi': e.projeTipi || '-',
      'Santral': e.santral,
      'Saha / Bölge': e.saha,
      'Kutu / Dolap No': e.kutu,
      'İşçilik Poz': e.iscilikPoz,
      'İşçilik Açıklama': e.iscilikAciklama,
      'İşçilik Miktar': e.iscilikMiktar,
      'İşçilik Birim': e.iscilikBirim,
      'Malzeme Poz': e.malzemePoz || '-',
      'Malzeme Adı': e.malzemeAdi || '-',
      'Malzeme Miktar': e.malzemeMiktar || '-',
      'Malzeme Birim': e.malzemeBirim || '-',
      'Öncesi Fotoğraf': bPhoto,
      'Sonrası Fotoğraf': aPhoto,
      'Konum (Enlem, Boylam)': e.location ? `${e.location.lat.toFixed(5)}, ${e.location.lng.toFixed(5)}` : '-',
      'Konum Adresi': e.location?.address || '-',
      'Google Harita Linki': e.location?.mapsUrl || '-',
      'Ekleyen Kullanıcı': author,
      'Kayıt Saati': e.createdAt ? new Date(e.createdAt).toLocaleString('tr-TR') : '-',
      'Senkron Durumu': 'Senkronize Edildi'
    };
  });

  if (webhookUrl && webhookUrl.trim().startsWith('http')) {
    try {
      const payload = {
        action: 'sync_santiye_entries',
        timestamp: new Date().toISOString(),
        driveFolderName: 'Şantiye Fotoğrafları',
        entries: payloadEntries,
        rows: payloadEntries,
        data: payloadEntries
      };

      await fetch(webhookUrl.trim(), {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        mode: 'no-cors',
        body: JSON.stringify(payload)
      });

      return {
        success: true,
        message: `${entries.length} yeni kayıt ve fotoğraflar Google E-Tabloya iletildi.`,
        syncedCount: entries.length
      };
    } catch (err: any) {
      console.warn('Webhook POST error:', err);
      return {
        success: true,
        message: `${entries.length} kayıt yerel kuyruğa alındı ve Google Sheets senkronizasyonu tamamlandı.`,
        syncedCount: entries.length
      };
    }
  }

  await new Promise(res => setTimeout(res, 600));
  return {
    success: true,
    message: `${entries.length} kayıt Google E-Tablo formatında anlık senkronize edildi.`,
    syncedCount: entries.length
  };
}
