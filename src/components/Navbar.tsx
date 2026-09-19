import { HardHat, FileSpreadsheet, Activity, Table, LogOut, Settings, RefreshCw, PlusCircle, LayoutDashboard } from 'lucide-react';
import { SyncConfig, User } from '../types';

interface NavbarProps {
  activeTab: 'entry' | 'dashboard' | 'sheet-preview';
  setActiveTab: (tab: 'entry' | 'dashboard' | 'sheet-preview') => void;
  currentUser: User | null;
  onLogout: () => void;
  syncConfig: SyncConfig;
  onOpenSettings?: () => void;
  pendingCount: number;
  isSyncing: boolean;
  onTriggerSync: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  onOpenSettings,
  pendingCount,
  isSyncing,
  onTriggerSync
}: NavbarProps) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
              <HardHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">Şantiye Defteri</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-300 border border-blue-500/30">
                  Google Sheets Entegre
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">İşçilik, Malzeme, Fotoğraf & GPS Takip Portalı</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            {currentUser?.canCreateEntry && (
              <button
                onClick={() => setActiveTab('entry')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'entry'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                Yeni İmalat Girişi
              </button>
            )}

            {currentUser?.canViewDashboard && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard & İmalat Defteri
                {pendingCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>
            )}

            {currentUser?.canViewDashboard && (
              <button
                onClick={() => setActiveTab('sheet-preview')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'sheet-preview'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                Google E-Tablo Önizleme
              </button>
            )}
          </div>

          {/* Right Controls: Sync Pill & User */}
          <div className="flex items-center gap-2.5">
            {/* Live Sync Badge / Button */}
            <button
              onClick={onTriggerSync}
              disabled={isSyncing}
              title="Google Sheets senkronizasyonunu tetikle"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                isSyncing
                  ? 'bg-blue-900/60 text-blue-200 border-blue-700'
                  : pendingCount > 0
                  ? 'bg-amber-900/40 text-amber-200 border-amber-600/50 hover:bg-amber-800/60'
                  : 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50 hover:bg-emerald-900/60'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-400' : pendingCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`} />
              <span className="hidden sm:inline">
                {isSyncing
                  ? 'Senkronize Ediliyor...'
                  : pendingCount > 0
                  ? `${pendingCount} Bekleyen Senkron`
                  : 'Anlık Senkron: Aktif'}
              </span>
            </button>

            {/* Google Sheets Settings Cog - ONLY for Admin Sheff */}
            {currentUser?.canAccessSettings && (
              <button
                onClick={onOpenSettings}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
                title="Google Sheets Bağlantı Ayarları (Admin)"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}

            {/* Current User Profile Pill & Logout */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
                <div className="hidden lg:flex flex-col text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="text-xs font-bold text-slate-200 leading-tight">
                      {currentUser.name}
                    </span>
                    {currentUser.isAdmin ? (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded border border-amber-400/30">
                        Admin
                      </span>
                    ) : currentUser.canViewDashboard ? (
                      <span className="text-[9px] bg-purple-500/20 text-purple-300 font-bold px-1.5 py-0.2 rounded border border-purple-400/30">
                        İzleme
                      </span>
                    ) : (
                      <span className="text-[9px] bg-blue-500/20 text-blue-300 font-bold px-1.5 py-0.2 rounded border border-blue-400/30">
                        İmalat
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {currentUser.role}
                  </span>
                </div>
                <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-xs ${
                  currentUser.isAdmin ? 'bg-amber-600' : currentUser.canViewDashboard ? 'bg-purple-600' : 'bg-blue-600'
                }`}>
                  {currentUser.isAdmin ? '👑' : currentUser.name.charAt(0)}
                </div>
                <button
                  onClick={onLogout}
                  title="Oturumu Kapat"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Fixed Bottom Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 pb-[env(safe-area-inset-bottom)] shadow-2xl">
          <div className="flex items-center justify-around h-16">
            {currentUser?.canCreateEntry && (
              <button
                type="button"
                onClick={() => setActiveTab('entry')}
                className={`flex-1 flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                  activeTab === 'entry' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1 rounded-lg ${activeTab === 'entry' ? 'bg-blue-600/20' : ''}`}>
                  <PlusCircle className="w-5 h-5" />
                </div>
                <span className="text-[11px] leading-none">Yeni Giriş</span>
              </button>
            )}

            {currentUser?.canViewDashboard && (
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={`flex-1 flex flex-col items-center justify-center gap-1 relative transition cursor-pointer ${
                  activeTab === 'dashboard' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1 rounded-lg relative ${activeTab === 'dashboard' ? 'bg-blue-600/20' : ''}`}>
                  <LayoutDashboard className="w-5 h-5" />
                  {pendingCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </div>
                <span className="text-[11px] leading-none">Dashboard</span>
              </button>
            )}

            {currentUser?.canViewDashboard && (
              <button
                type="button"
                onClick={() => setActiveTab('sheet-preview')}
                className={`flex-1 flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                  activeTab === 'sheet-preview' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1 rounded-lg ${activeTab === 'sheet-preview' ? 'bg-emerald-600/20' : ''}`}>
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <span className="text-[11px] leading-none">E-Tablo</span>
              </button>
            )}

            {currentUser?.canAccessSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                <div className="p-1 rounded-lg">
                  <Settings className="w-5 h-5" />
                </div>
                <span className="text-[11px] leading-none">Ayarlar</span>
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
