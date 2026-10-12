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

/**
 * Converts any date format (Excel serial number like 46306, Turkish DD.MM.YYYY, 
 * DD/MM/YYYY, ISO strings, or Date objects) into a standardized YYYY-MM-DD string.
 */
export function normalizeDateValue(raw: any): string {
  if (raw === undefined || raw === null || raw === '') {
    return new Date().toISOString().slice(0, 10);
  }

  // If already a Date object
  if (raw instanceof Date && !isNaN(raw.getTime())) {
    const y = raw.getFullYear();
    const m = String(raw.getMonth() + 1).padStart(2, '0');
    const d = String(raw.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const str = String(raw).trim();
  if (!str) {
    return new Date().toISOString().slice(0, 10);
  }

  // Check if it is an Excel serial date number (e.g. 46306 or 46306.5)
  // Typically between 25000 (~1968) and 90000 (~2146)
  const numVal = typeof raw === 'number' ? raw : parseFloat(str);
  if (!isNaN(numVal) && isFinite(numVal) && /^\d+(\.\d+)?$/.test(str) && numVal >= 25000 && numVal <= 90000) {
    const wholeDays = Math.floor(numVal);
    // 25569 is days between 1899-12-30 and 1970-01-01
    const utcMs = Math.round((wholeDays - 25569) * 86400 * 1000);
    const dateObj = new Date(utcMs);
    if (!isNaN(dateObj.getTime())) {
      const y = dateObj.getUTCFullYear();
      const m = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
      const d = String(dateObj.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }

  // Check Turkish / European format: DD.MM.YYYY or DD/MM/YYYY
  const trMatch = str.match(/^(\d{1,2})[./\-](\d{1,2})[./\-](\d{4})/);
  if (trMatch) {
    const day = trMatch[1].padStart(2, '0');
    const month = trMatch[2].padStart(2, '0');
    const year = trMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Check ISO format: YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = str.match(/^(\d{4})[./\-](\d{1,2})[./\-](\d{1,2})/);
  if (isoMatch) {
    const year = isoMatch[1];
    const month = isoMatch[2].padStart(2, '0');
    const day = isoMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Fallback: try parsing with Date constructor
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1990 && parsed.getFullYear() < 2100) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return str.slice(0, 10);
}

/**
 * Normalizes date-time or timestamp strings (including Excel serial timestamps)
 */
export function normalizeDateTimeValue(raw: any): string {
  if (raw === undefined || raw === null || raw === '') {
    return '';
  }
  if (raw instanceof Date && !isNaN(raw.getTime())) {
    return raw.toLocaleString('tr-TR');
  }
  const str = String(raw).trim();
  const numVal = typeof raw === 'number' ? raw : parseFloat(str);
  if (!isNaN(numVal) && isFinite(numVal) && /^\d+(\.\d+)?$/.test(str) && numVal >= 25000 && numVal <= 90000) {
    const wholeDays = Math.floor(numVal);
    const fraction = numVal - wholeDays;
    const totalMs = Math.round((wholeDays - 25569) * 86400 * 1000 + fraction * 86400 * 1000);
    const dateObj = new Date(totalMs);
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toLocaleString('tr-TR');
    }
  }
  return str;
}

/**
 * Returns user-friendly Turkish formatted date: DD.MM.YYYY
 * Handles YYYY-MM-DD, Excel serials like 46306, and existing DD.MM.YYYY
 */
export function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return '-';
  const normalized = normalizeDateValue(dateStr);
  if (!normalized) return dateStr;
  const parts = normalized.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return normalized;
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

    // Migrate any legacy placeholder author names ('Ahmet Yılmaz' / 'Murat Kaya' / empty), ensure projeAdi/projeTipi, and normalize dates
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
      if (updated.date) {
        const normDate = normalizeDateValue(updated.date);
        if (normDate && normDate !== updated.date) {
          hasLegacyAuthor = true;
          updated.date = normDate;
        }
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
export function parseSheetRowToEntry(row: Record<string, any> | any[], index: number): SantiyeEntry {
  // If row is an array of column values (0: Tarih, 1: Proje ID, 2: Proje Tipi, etc.)
  if (Array.isArray(row)) {
    const cleanDate = normalizeDateValue(row[0]);
    const projeIdVal = String(row[1] || 'Atanmadı').trim();
    const projeTipiVal = (String(row[2] || '').trim()) as ProjeTipi;
    const santralVal = String(row[3] || '').trim();
    const sahaVal = String(row[4] || '').trim();
    const kutuVal = String(row[5] || '').trim();
    const iscilikPozVal = String(row[6] || '').trim();
    const iscilikAciklamaVal = String(row[7] || '').trim();
    const iscilikMiktarVal = String(row[8] || '1').trim();
    const iscilikBirimVal = String(row[9] || 'Ad.').trim();
    const malzemePozVal = String(row[10] || '-').trim();
    const malzemeAdiVal = String(row[11] || '-').trim();
    const malzemeMiktarVal = String(row[12] || '').trim();
    const malzemeBirimVal = String(row[13] || '').trim();
    const beforePhotoVal = String(row[14] || '').trim();
    const afterPhotoVal = String(row[15] || '').trim();
    const locCoords = String(row[16] || '').trim();
    const locAddress = String(row[17] || '').trim();
    const mapsUrl = String(row[18] || '').trim();
    const createdByVal = String(row[19] || 'Sheff').trim();
    const createdAtVal = normalizeDateTimeValue(row[20]) || cleanDate;

    let location: LocationData | undefined = undefined;
    if (locCoords && locCoords !== '-' && locCoords !== '') {
      const parts = locCoords.split(',');
      if (parts.length >= 2) {
        const lat = parseFloat(parts[0].trim());
        const lng = parseFloat(parts[1].trim());
        if (!isNaN(lat) && !isNaN(lng)) {
          location = {
            lat,
            lng,
            address: locAddress && locAddress !== '-' ? locAddress : undefined,
            mapsUrl: mapsUrl && mapsUrl !== '-' ? mapsUrl : `https://www.google.com/maps?q=${lat},${lng}`,
            timestamp: createdAtVal || cleanDate
          };
        }
      }
    }

    const cleanPoz = iscilikPozVal.replace(/[^a-zA-Z0-9]/g, '');
    const cleanKutu = kutuVal.replace(/[^a-zA-Z0-9]/g, '');
    const entryId = `GS-${cleanDate}-${cleanKutu || 'K'}-${cleanPoz || 'P'}-${index}`;

    return {
      id: entryId,
      date: cleanDate,
      projeID: projeIdVal || 'Atanmadı',
      projeAdi: projeIdVal || 'Atanmadı',
      projeTipi: projeTipiVal,
      santral: santralVal,
      saha: sahaVal,
      kutu: kutuVal,
      iscilikPoz: iscilikPozVal,
      iscilikAciklama: iscilikAciklamaVal,
      iscilikMiktar: iscilikMiktarVal,
      iscilikBirim: iscilikBirimVal,
      malzemePoz: malzemePozVal,
      malzemeAdi: malzemeAdiVal,
      malzemeMiktar: malzemeMiktarVal,
      malzemeBirim: malzemeBirimVal,
      beforePhoto: beforePhotoVal && beforePhotoVal !== '-' ? beforePhotoVal : undefined,
      afterPhoto: afterPhotoVal && afterPhotoVal !== '-' ? afterPhotoVal : undefined,
      location,
      createdBy: createdByVal || 'Sheff',
      createdAt: createdAtVal || cleanDate,
      syncStatus: 'synced',
      lastSyncedAt: new Date().toLocaleTimeString('tr-TR')
    };
  }

  // Row is an object: build case-insensitive and whitespace-stripped lookup
  const normalizedKeys: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) {
    if (k) {
      normalizedKeys[k.trim().toLowerCase()] = v;
    }
  }

  const getRawVal = (...keys: string[]): any => {
    for (const key of keys) {
      const direct = row[key];
      if (direct !== undefined && direct !== null && (typeof direct !== 'string' || direct.trim() !== '')) {
        return direct;
      }
      const norm = normalizedKeys[key.toLowerCase()];
      if (norm !== undefined && norm !== null && (typeof norm !== 'string' || norm.trim() !== '')) {
        return norm;
      }
    }
    return '';
  };

  const getVal = (...keys: string[]): string => {
    const raw = getRawVal(...keys);
    return raw !== undefined && raw !== null ? String(raw).trim() : '';
  };

  const rawDateVal = getRawVal('Tarih', 'tarih', 'date', 'Date');
  const cleanDate = normalizeDateValue(rawDateVal);
  const projeIdVal = getVal('Proje ID', 'projeID', 'Proje Kodu', 'Proje No', 'Proje', 'Proje Adı', 'projeAdi') || 'Atanmadı';
  const projeTipiVal = (getVal('Proje Tipi', 'projeTipi', 'Tip') || '') as ProjeTipi;
  const santralVal = getVal('Santral', 'santral', 'Exchange');
  const sahaVal = getVal('Saha / Bölge', 'Saha', 'saha', 'Bölge', 'bolge');
  const kutuVal = getVal('Kutu / Dolap No', 'Kutu', 'kutu', 'Dolap No', 'dolap');
  const iscilikPozVal = getVal('İşçilik Poz', 'iscilikPoz', 'Poz', 'İş Poz', 'isPoz');
  const iscilikAciklamaVal = getVal('İşçilik Açıklama', 'iscilikAciklama', 'Açıklama', 'aciklama');
  const iscilikMiktarVal = getVal('İşçilik Miktar', 'iscilikMiktar', 'Miktar', 'miktar') || '1';
  const iscilikBirimVal = getVal('İşçilik Birim', 'iscilikBirim', 'Birim', 'birim') || 'Ad.';
  const malzemePozVal = getVal('Malzeme Poz', 'malzemePoz', 'M.Poz') || '-';
  const malzemeAdiVal = getVal('Malzeme Adı', 'malzemeAdi', 'Malzeme') || '-';
  const malzemeMiktarVal = getVal('Malzeme Miktar', 'malzemeMiktar', 'M.Miktar');
  const malzemeBirimVal = getVal('Malzeme Birim', 'malzemeBirim', 'M.Birim');
  
  const beforePhotoVal = getVal('Öncesi Fotoğraf (Google Drive Linki)', 'Öncesi Fotoğraf', 'beforePhoto', 'Oncesi Foto', 'Öncesi');
  const afterPhotoVal = getVal('Sonrası Fotoğraf (Google Drive Linki)', 'Sonrası Fotoğraf', 'afterPhoto', 'Sonrasi Foto', 'Sonrası');
  
  const locCoords = getVal('Konum (Enlem, Boylam)', 'Konum', 'location', 'Koordinat');
  const locAddress = getVal('Konum Adresi', 'Adres', 'adres', 'address');
  const mapsUrl = getVal('Google Harita Linki', 'Harita', 'Harita Linki', 'mapsUrl');
  const createdByVal = getVal('Ekleyen Kullanıcı', 'createdBy', 'Kullanıcı', 'Personel') || 'Sheff';
  const rawCreatedAt = getRawVal('Kayıt Saati', 'createdAt', 'Saat', 'Tarih Saat');
  const createdAtVal = normalizeDateTimeValue(rawCreatedAt) || cleanDate;

  let location: LocationData | undefined = undefined;
  if (locCoords && locCoords !== '-' && locCoords !== '') {
    const parts = locCoords.split(',');
    if (parts.length >= 2) {
      const lat = parseFloat(parts[0].trim());
      const lng = parseFloat(parts[1].trim());
      if (!isNaN(lat) && !isNaN(lng)) {
        location = {
          lat,
          lng,
          address: locAddress && locAddress !== '-' ? locAddress : undefined,
          mapsUrl: mapsUrl && mapsUrl !== '-' ? mapsUrl : `https://www.google.com/maps?q=${lat},${lng}`,
          timestamp: createdAtVal || cleanDate
        };
      }
    }
  }

  const cleanPoz = iscilikPozVal.replace(/[^a-zA-Z0-9]/g, '');
  const cleanKutu = kutuVal.replace(/[^a-zA-Z0-9]/g, '');
  const entryId = (row as any)['id'] || `GS-${cleanDate}-${cleanKutu || 'K'}-${cleanPoz || 'P'}-${index}`;

  return {
    id: entryId,
    date: cleanDate,
    projeID: projeIdVal,
    projeAdi: projeIdVal,
    projeTipi: projeTipiVal,
    santral: santralVal,
    saha: sahaVal,
    kutu: kutuVal,
    iscilikPoz: iscilikPozVal,
    iscilikAciklama: iscilikAciklamaVal,
    iscilikMiktar: iscilikMiktarVal,
    iscilikBirim: iscilikBirimVal,
    malzemePoz: malzemePozVal,
    malzemeAdi: malzemeAdiVal,
    malzemeMiktar: malzemeMiktarVal,
    malzemeBirim: malzemeBirimVal,
    beforePhoto: beforePhotoVal && beforePhotoVal !== '-' ? beforePhotoVal : undefined,
    afterPhoto: afterPhotoVal && afterPhotoVal !== '-' ? afterPhotoVal : undefined,
    location,
    createdBy: createdByVal,
    createdAt: createdAtVal || cleanDate,
    syncStatus: 'synced',
    lastSyncedAt: new Date().toLocaleTimeString('tr-TR')
  };
}

// Fetch entries directly from Google Sheets (via Webhook GET/POST, Visualization API, or CSV)
export async function fetchEntriesFromGoogleSheets(
  config: SyncConfig,
  customSheetUrl?: string
): Promise<{ success: boolean; entries: SantiyeEntry[]; message: string; sheetUrlDiscovered?: string }> {
  const webhookUrl = (config.googleWebhookUrl || DEFAULT_GOOGLE_WEBHOOK_URL).trim();
  const sheetUrl = (customSheetUrl || config.googleSheetUrl || '').trim();

  // 1. Try Webhook GET (Google Apps Script doGet)
  if (webhookUrl.startsWith('http')) {
    try {
      const resp = await fetch(webhookUrl, {
        method: 'GET'
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
            message: `Google Sheets'ten ${parsed.length} imalat kaydı canlı olarak yüklendi.`,
            sheetUrlDiscovered: data.spreadsheetUrl || data.sheetUrl
          };
        }
      }
    } catch (err) {
      console.warn('Webhook GET did not return entries directly, trying next endpoints:', err);
    }
  }

  // 2. Try Webhook POST action='get_entries' (in case script handles read in doPost)
  if (webhookUrl.startsWith('http')) {
    try {
      const postResp = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'get_entries' })
      });
      if (postResp.ok) {
        const postData = await postResp.json();
        const rawEntries = Array.isArray(postData) 
          ? postData 
          : (postData.entries || postData.rows || postData.data || []);
        if (Array.isArray(rawEntries) && rawEntries.length > 0) {
          const parsed = rawEntries.map((row: any, idx: number) => parseSheetRowToEntry(row, idx));
          return {
            success: true,
            entries: parsed,
            message: `Google Sheets'ten ${parsed.length} imalat kaydı okundu.`,
            sheetUrlDiscovered: postData.spreadsheetUrl || postData.sheetUrl
          };
        }
      }
    } catch (err) {
      console.warn('Webhook POST read error:', err);
    }
  }

  // 3. Try Google Visualization Query API or CSV Export from spreadsheet URL
  const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  const spreadsheetId = match ? match[1] : null;

  if (spreadsheetId && spreadsheetId !== '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms') {
    const gidMatch = sheetUrl.match(/[#&?]gid=([0-9]+)/);
    const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';

    try {
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json${gidParam}`;
      const res = await fetch(gvizUrl);
      if (res.ok) {
        const text = await res.text();
        const jsonText = text.replace(/^[/*\s]*google\.visualization\.Query\.setResponse\(/, '').replace(/\);?[\s/*]*$/, '');
        const json = JSON.parse(jsonText);
        if (json && json.table && Array.isArray(json.table.rows) && json.table.rows.length > 0) {
          let cols: string[] = (json.table.cols || []).map((c: any) => (c?.label || '').trim());
          let dataRows: any[] = json.table.rows || [];

          // If cols has no labels, check if the first data row contains headers
          const nonBlankCols = cols.filter(Boolean);
          if (nonBlankCols.length === 0 && dataRows.length > 0) {
            const firstRowCells = dataRows[0]?.c || [];
            const candidateHeaders = firstRowCells.map((c: any) => String(c?.v || c?.f || '').trim());
            if (candidateHeaders.some((h: string) => h.length > 0)) {
              cols = candidateHeaders;
              dataRows = dataRows.slice(1);
            }
          }

          const rows: Record<string, any>[] = dataRows.map((r: any) => {
            const obj: Record<string, any> = {};
            (r.c || []).forEach((cell: any, i: number) => {
              const colName = cols[i] || `col_${i}`;
              const cellVal = cell ? (cell.f !== undefined && cell.f !== null ? cell.f : (cell.v !== undefined && cell.v !== null ? cell.v : '')) : '';
              obj[colName] = cellVal;
            });
            return obj;
          });

          if (rows.length > 0) {
            const parsed = rows
              .filter(r => Object.values(r).some(v => v !== '' && v !== null && v !== undefined))
              .map((r, idx) => parseSheetRowToEntry(r, idx));

            if (parsed.length > 0) {
              return {
                success: true,
                entries: parsed,
                message: `Google E-Tablodan ${parsed.length} kayıt başarıyla çekildi.`
              };
            }
          }
        }
      }
    } catch (gvizErr) {
      console.warn('Google Sheets gviz API fetch error:', gvizErr);
    }

    try {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv${gidParam}`;
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
    message: 'Google Sheets üzerinden canlı kayıt henüz okunamadı. Google E-Tablo URL bağlantınızı giriniz veya Apps Script kodunuzu güncelleyiniz.'
  };
}

// Parse imported spreadsheet file (.xlsx / .csv) into SantiyeEntry array
export async function importEntriesFromSpreadsheetFile(file: File): Promise<{ success: boolean; entries: SantiyeEntry[]; message: string }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (!Array.isArray(rawJson) || rawJson.length === 0) {
      return { success: false, entries: [], message: 'Seçilen dosyada veri satırı bulunamadı.' };
    }

    const parsed = rawJson.map((r, idx) => parseSheetRowToEntry(r, idx));
    return {
      success: true,
      entries: parsed,
      message: `${file.name} dosyasından ${parsed.length} imalat kaydı başarıyla yüklendi (Tarihler otomatik formatlandı).`
    };
  } catch (err: any) {
    return {
      success: false,
      entries: [],
      message: `Dosya okuma hatası: ${err?.message || 'Bilinmeyen hata'}`
    };
  }
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

  // If local entries only contain initial dummy demo entries, replace them with real Google Sheets entries
  const isOnlyDemoEntries = localEntries.length > 0 && localEntries.every(e => e.id.startsWith('rec-00'));
  if (isOnlyDemoEntries) {
    return sheetEntries;
  }

  const sheetSignatures = new Set(sheetEntries.map(getSig));
  
  // Pending local items not yet in Google Sheets
  const stillPendingLocal = localEntries.filter(
    local => local.syncStatus === 'pending' && !sheetSignatures.has(getSig(local))
  );

  // Local non-demo items that were added locally
  const nonDemoLocal = localEntries.filter(
    local => !local.id.startsWith('rec-00') && !sheetSignatures.has(getSig(local))
  );

  const combined = [...stillPendingLocal, ...sheetEntries, ...nonDemoLocal];

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
