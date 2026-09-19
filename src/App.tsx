/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useTransition } from 'react';
import { SantiyeEntry, User, SyncConfig, SyncLogEvent } from './types';
import { 
  loadEntriesFromStorage, 
  saveEntriesToStorage, 
  loadSyncConfig, 
  saveSyncConfig,
  dispatchToGoogleSheetsWebhook,
  DEFAULT_SYNC_CONFIG,
  SYSTEM_USERS
} from './services/storageAndSync';
import LoginPanel from './components/LoginPanel';
import Navbar from './components/Navbar';
import SantiyeForm from './components/SantiyeForm';
import SantiyeTable from './components/SantiyeTable';
import SyncDashboard from './components/SyncDashboard';
import GoogleSheetPreview from './components/GoogleSheetPreview';
import GoogleSheetsSettingsModal from './components/GoogleSheetsSettingsModal';

export default function App() {
  // Authentication State with SYSTEM_USERS verification
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('santiye_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const matched = SYSTEM_USERS.find(
          u => u.username.toLowerCase() === parsed.username?.toLowerCase()
        );
        if (matched) return matched;
      } catch {
        // pass
      }
    }
    // Default to Sheff (Admin with all privileges)
    return SYSTEM_USERS[0];
  });

  // Active Tab determined by user role
  const [activeTab, setActiveTab] = useState<'entry' | 'dashboard' | 'sheet-preview'>(() => {
    const saved = localStorage.getItem('santiye_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const matched = SYSTEM_USERS.find(
          u => u.username.toLowerCase() === parsed.username?.toLowerCase()
        );
        if (matched && !matched.canCreateEntry && matched.canViewDashboard) {
          return 'dashboard';
        }
      } catch {
        // pass
      }
    }
    return 'entry';
  });

  // Entries State
  const [entries, setEntries] = useState<SantiyeEntry[]>(() => loadEntriesFromStorage());

  // Sync Config
  const [syncConfig, setSyncConfig] = useState<SyncConfig>(() => loadSyncConfig());

  // Sync Activity Logs
  const [syncLogs, setSyncLogs] = useState<SyncLogEvent[]>(() => [
    {
      id: 'log-init',
      timestamp: new Date().toLocaleTimeString('tr-TR'),
      message: 'Şantiye defteri ve Google Sheets anlık senkronizasyon motoru başlatıldı.',
      type: 'info'
    },
    {
      id: 'log-schema',
      timestamp: new Date().toLocaleTimeString('tr-TR'),
      message: 'Google E-Tablo sütun şablonu (A:U) doğrulandı.',
      type: 'success'
    }
  ]);

  // Sync Status
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [, startTransition] = useTransition();

  // Guard active tab against role permissions
  useEffect(() => {
    if (!currentUser) return;
    if (!currentUser.canCreateEntry && activeTab === 'entry') {
      setActiveTab('dashboard');
    } else if (!currentUser.canViewDashboard && (activeTab === 'dashboard' || activeTab === 'sheet-preview')) {
      setActiveTab('entry');
    }
  }, [currentUser, activeTab]);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    saveEntriesToStorage(entries);
  }, [entries]);

  // Save current user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('santiye_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('santiye_current_user');
    }
  }, [currentUser]);

  // Helper to add sync log
  const addLog = useCallback((message: string, type: SyncLogEvent['type'] = 'info') => {
    const newLog: SyncLogEvent = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('tr-TR'),
      message,
      type
    };
    setSyncLogs(prev => [newLog, ...prev.slice(0, 40)]);
  }, []);

  // Trigger Google Sheets Synchronization
  const handleTriggerSync = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);

    const pendingCount = entries.filter(e => e.syncStatus === 'pending').length;
    addLog(
      pendingCount > 0 
        ? `${pendingCount} bekleyen kayıt Google E-Tabloya iletiliyor...` 
        : 'Tüm şantiye kayıtları Google E-Tablo ile doğrulanıyor...', 
      'info'
    );

    try {
      const result = await dispatchToGoogleSheetsWebhook(entries, syncConfig);

      if (result.success) {
        // Mark all as synced
        setEntries(prev => prev.map(e => ({ ...e, syncStatus: 'synced' })));
        const nowStr = new Date().toLocaleTimeString('tr-TR');
        const updatedConfig = { ...syncConfig, lastSyncAttempt: nowStr };
        setSyncConfig(updatedConfig);
        saveSyncConfig(updatedConfig);
        addLog(`✅ Google Sheets senkronizasyonu tamamlandı (${entries.length} satır eşitlendi).`, 'success');
      } else {
        addLog(`⚠️ Senkron uyarısı: ${result.message}`, 'warning');
      }
    } catch (err: any) {
      addLog(`❌ Senkronizasyon hatası: ${err.message || 'Ağ hatası'}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  }, [entries, syncConfig, isSyncing, addLog]);

  // Auto-Sync Effect on new entries or periodic interval
  useEffect(() => {
    if (!syncConfig.autoSync) return;

    const intervalSeconds = (syncConfig.syncInterval || 15) * 1000;
    const timer = setInterval(() => {
      const hasPending = entries.some(e => e.syncStatus === 'pending');
      if (hasPending && !isSyncing) {
        handleTriggerSync();
      }
    }, intervalSeconds);

    return () => clearInterval(timer);
  }, [syncConfig.autoSync, syncConfig.syncInterval, entries, isSyncing, handleTriggerSync]);

  // Handle Add Entry
  const handleAddEntry = (newEntryDataList: Omit<SantiyeEntry, 'id' | 'createdAt' | 'syncStatus'>[]) => {
    if (currentUser && !currentUser.canCreateEntry) {
      alert('İmalat girişi yetkiniz bulunmamaktadır.');
      return;
    }

    const timestamp = new Date().toLocaleTimeString('tr-TR');
    const createdItems: SantiyeEntry[] = newEntryDataList.map((item, index) => ({
      ...item,
      id: `ENTRY-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: timestamp,
      syncStatus: syncConfig.autoSync ? 'pending' : 'synced'
    }));

    setEntries(prev => [...createdItems, ...prev]);

    addLog(
      `➕ ${createdItems.length} yeni imalat kaydı şantiye defterine eklendi (${createdItems[0].iscilikPoz}).`,
      'info'
    );

    // If auto-sync is on, immediately trigger sync
    if (syncConfig.autoSync) {
      setTimeout(() => {
        handleTriggerSync();
      }, 500);
    }
  };

  // Delete Entry (Admin only)
  const handleDeleteEntry = (id: string) => {
    if (currentUser && !currentUser.isAdmin) {
      alert('Kayıt silme yetkisi sadece Admin kullanıcısına aittir.');
      return;
    }
    const target = entries.find(e => e.id === id);
    setEntries(prev => prev.filter(e => e.id !== id));
    addLog(`🗑️ Satır silindi: ${target?.projeID || ''} - Poz ${target?.iscilikPoz || ''}`, 'warning');
  };

  // Clear All (Admin only)
  const handleClearAll = () => {
    if (currentUser && !currentUser.isAdmin) {
      alert('Tümünü silme yetkisi sadece Admin kullanıcısına aittir.');
      return;
    }
    setEntries([]);
    addLog('⚠️ Şantiye defteri temizlendi.', 'warning');
  };

  // Update Config (Admin only)
  const handleSaveConfig = (newConfig: SyncConfig) => {
    if (currentUser && !currentUser.canAccessSettings) {
      alert('Ayar güncelleme yetkiniz bulunmamaktadır.');
      return;
    }
    setSyncConfig(newConfig);
    saveSyncConfig(newConfig);
    addLog('⚙️ Google Sheets entegrasyon ayarları güncellendi.', 'success');
  };

  // Update Auto-Sync
  const handleUpdateAutoSync = (enabled: boolean) => {
    const updated = { ...syncConfig, autoSync: enabled };
    setSyncConfig(updated);
    saveSyncConfig(updated);
    addLog(
      enabled ? '🟢 Anlık otomatik senkronizasyon aktifleştirildi.' : '⚪ Otomatik senkron durduruldu (manuel mod).',
      'info'
    );
  };

  // Test Sync
  const handleTestSync = async () => {
    await handleTriggerSync();
  };

  // Logout handler
  const handleLogout = () => {
    startTransition(() => {
      setCurrentUser(null);
    });
  };

  // Login handler with role redirection
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (!user.canCreateEntry && user.canViewDashboard) {
      setActiveTab('dashboard');
    } else {
      setActiveTab('entry');
    }
  };

  // If user is not logged in, show Login Panel
  if (!currentUser) {
    return <LoginPanel onLoginSuccess={handleLoginSuccess} />;
  }

  const pendingCount = entries.filter(e => e.syncStatus === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        syncConfig={syncConfig}
        onOpenSettings={currentUser.canAccessSettings ? () => setIsSettingsModalOpen(true) : undefined}
        pendingCount={pendingCount}
        isSyncing={isSyncing}
        onTriggerSync={handleTriggerSync}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 sm:pb-8">
        {activeTab === 'entry' && (
          <div className="space-y-6">
            {/* Entry Form */}
            <SantiyeForm
              currentUser={currentUser}
              onAddEntry={handleAddEntry}
              onViewDashboard={currentUser.canViewDashboard ? () => setActiveTab('dashboard') : undefined}
              entriesCount={entries.length}
            />
          </div>
        )}

        {activeTab === 'dashboard' && currentUser.canViewDashboard && (
          <SyncDashboard
            entries={entries}
            syncConfig={syncConfig}
            syncLogs={syncLogs}
            isSyncing={isSyncing}
            onTriggerSync={handleTriggerSync}
            onUpdateAutoSync={handleUpdateAutoSync}
            onOpenSettings={currentUser.canAccessSettings ? () => setIsSettingsModalOpen(true) : undefined}
            onDeleteEntry={currentUser.isAdmin ? handleDeleteEntry : undefined}
            onClearAll={currentUser.isAdmin ? handleClearAll : undefined}
          />
        )}

        {activeTab === 'sheet-preview' && currentUser.canViewDashboard && (
          <GoogleSheetPreview
            entries={entries}
            syncConfig={syncConfig}
            onTriggerSync={handleTriggerSync}
            isSyncing={isSyncing}
          />
        )}
      </main>

      {/* Google Sheets Settings Modal (Admin only) */}
      {currentUser.canAccessSettings && (
        <GoogleSheetsSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          config={syncConfig}
          onSaveConfig={handleSaveConfig}
          onTestSync={handleTestSync}
          isTestingSync={isSyncing}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>Telekom Şantiye Defteri & Saha Takip Sistemi</strong> • Google Sheets Canlı Senkronizasyon
          </div>
          <div className="flex items-center gap-2.5 text-[11px] flex-wrap justify-center">
            <span>Kullanıcı: <strong className="text-slate-700">{currentUser.username}</strong></span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              currentUser.isAdmin 
                ? 'bg-amber-100 text-amber-800' 
                : currentUser.canViewDashboard 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {currentUser.authorizationLabel}
            </span>
            {currentUser.canAccessSettings && (
              <>
                <span>•</span>
                <button
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="text-blue-600 hover:underline cursor-pointer font-medium"
                >
                  Google E-Tablo Ayarları
                </button>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
