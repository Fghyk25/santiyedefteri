export interface User {
  username: string;
  name: string;
  role: string;
  email: string;
  avatar?: string;
  canCreateEntry?: boolean;
  canViewDashboard?: boolean;
  canAccessSettings?: boolean;
  isAdmin?: boolean;
  authorizationLabel?: string;
}

export interface SystemUser extends User {
  password: string;
  authorizationLabel: string;
  description: string;
}

export interface JobItem {
  poz: string;
  desc: string;
  unit: string;
}

export interface MalzemeItem {
  kod: string;
  ad: string;
}

export interface LocationData {
  lat: number;
  lng: number;
  accuracy?: number;
  address?: string;
  timestamp: string;
  mapsUrl: string;
}

export interface StagedPozLine {
  tempId: string;
  iscilikPoz: string;
  iscilikAciklama: string;
  iscilikMiktar: string;
  iscilikBirim: string;
  malzemePoz: string;
  malzemeAdi: string;
  malzemeMiktar: string;
  malzemeBirim: string;
}

export interface SantiyeEntry {
  id: string;
  date: string;
  projeID: string;
  santral: string;
  saha: string;
  kutu: string;
  iscilikPoz: string;
  iscilikAciklama: string;
  iscilikMiktar: string;
  iscilikBirim: string;
  malzemePoz: string;
  malzemeAdi: string;
  malzemeMiktar: string;
  malzemeBirim: string;
  beforePhoto?: string; // base64 or URL
  afterPhoto?: string; // base64 or URL
  location?: LocationData;
  createdBy: string;
  createdAt: string;
  syncStatus: 'synced' | 'pending' | 'failed';
  lastSyncedAt?: string;
}

export interface SyncConfig {
  googleSheetUrl: string;
  googleWebhookUrl: string;
  autoSync: boolean;
  syncInterval: number; // in seconds
  lastSyncAttempt?: string;
  lastSyncStatus?: 'success' | 'error' | 'idle' | 'syncing';
  lastSyncMessage?: string;
}

export interface SyncLogEvent {
  id: string;
  timestamp: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  recordCount?: number;
}
