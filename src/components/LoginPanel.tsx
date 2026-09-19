import { useState } from 'react';
import { HardHat, Lock, User as UserIcon, Eye, EyeOff, ShieldCheck, ArrowRight, CheckCircle2, ShieldAlert, Users, Wrench, BarChart3, Crown } from 'lucide-react';
import { User, SystemUser } from '../types';
import { SYSTEM_USERS } from '../services/storageAndSync';

interface LoginPanelProps {
  onLoginSuccess: (user: User) => void;
}

export default function LoginPanel({ onLoginSuccess }: LoginPanelProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Find currently matched user preview for UI authorization badge
  const matchedUser = SYSTEM_USERS.find(
    u => u.username.toLowerCase() === username.toLowerCase().trim()
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setErrorMessage('Lütfen kullanıcı adınızı giriniz.');
      return;
    }
    if (!password) {
      setErrorMessage('Lütfen şifrenizi giriniz.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Find matching system user (case-insensitive)
      const user = SYSTEM_USERS.find(
        u => u.username.toLowerCase() === cleanUsername.toLowerCase()
      );

      if (!user) {
        setIsLoading(false);
        setErrorMessage('Kullanıcı bulunamadı! Lütfen geçerli bir kullanıcı adı giriniz.');
        return;
      }

      if (user.password !== password) {
        setIsLoading(false);
        setErrorMessage('Girdiğiniz şifre hatalı. Lütfen tekrar deneyiniz.');
        return;
      }

      setIsLoading(false);
      onLoginSuccess(user);
    }, 300);
  };

  const handleSelectUsername = (user: SystemUser) => {
    setUsername(user.username);
    setPassword('');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex flex-col justify-center items-center p-3 sm:p-6 text-slate-100">
      {/* Background visual accents */}
      <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

      <div className="w-full max-w-lg z-10 space-y-5 sm:space-y-6 my-4">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-xl shadow-amber-500/20 mb-1">
            <HardHat className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Şantiye Defteri Sistemi
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            Saha İmalat, GPS, Fotoğraf & Google Sheets Yetkilendirilmiş Giriş Kapısı
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white text-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-7 border border-slate-100 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Kullanıcı Girişi</h2>
              <p className="text-xs text-slate-500">Hesap bilgilerinizi manuel olarak girerek oturum açın</p>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" /> Güvenli Giriş
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Kullanıcı Adı
                </label>
                {matchedUser && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    matchedUser.isAdmin 
                      ? 'bg-amber-100 text-amber-800' 
                      : matchedUser.canViewDashboard 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {matchedUser.authorizationLabel}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Kullanıcı adınızı giriniz"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition font-medium min-h-[44px]"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password - Manual Entry */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Şifre
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  Manuel giriş zorunludur
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Şifrenizi giriniz"
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition font-medium min-h-[44px]"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer min-h-[44px] min-w-[44px] justify-center"
                  title={showPassword ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 min-h-[46px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 text-sm transition active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Doğrulanıyor...
                </>
              ) : (
                <>
                  Giriş Yap
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Defined Accounts (Only fills username, NEVER reveals or autofills password) */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Sistemde Tanımlı Kullanıcılar
              </span>
              <span className="text-[11px] text-slate-400">Tıklayarak adı seçebilirsiniz</span>
            </div>

            {/* Admin Section */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700">
                <Crown className="w-3.5 h-3.5" />
                <span>Admin Yetkisi</span>
              </div>
              {SYSTEM_USERS.filter(u => u.isAdmin).map(u => (
                <button
                  key={u.username}
                  type="button"
                  onClick={() => handleSelectUsername(u)}
                  className={`w-full p-2.5 rounded-xl border transition flex items-center justify-between text-left cursor-pointer ${
                    username.toLowerCase() === u.username.toLowerCase()
                      ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-300'
                      : 'bg-amber-50/50 hover:bg-amber-100/70 border-amber-200'
                  }`}
                  title="Kullanıcı adını forma aktar"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      👑
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {u.username}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {u.name} • {u.description}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                    {u.authorizationLabel}
                  </span>
                </button>
              ))}
            </div>

            {/* Management - Dashboard Only */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-[11px] font-bold text-purple-700">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Yönetim / İzleme Ekibi</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SYSTEM_USERS.filter(u => !u.isAdmin && u.canViewDashboard).map(u => (
                  <button
                    key={u.username}
                    type="button"
                    onClick={() => handleSelectUsername(u)}
                    className={`p-2.5 rounded-xl border transition text-left cursor-pointer ${
                      username.toLowerCase() === u.username.toLowerCase()
                        ? 'bg-purple-100 border-purple-400 ring-2 ring-purple-300'
                        : 'bg-purple-50/50 hover:bg-purple-100/70 border-purple-200'
                    }`}
                    title="Kullanıcı adını forma aktar"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">
                        {u.username}
                      </span>
                      <span className="text-[9px] font-semibold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                        İzleme
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {u.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Field Teams - Entry Only */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-[11px] font-bold text-blue-700">
                <Wrench className="w-3.5 h-3.5" />
                <span>Saha İmalat Ekipleri</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SYSTEM_USERS.filter(u => u.canCreateEntry && !u.canViewDashboard).map(u => (
                  <button
                    key={u.username}
                    type="button"
                    onClick={() => handleSelectUsername(u)}
                    className={`p-2.5 rounded-xl border transition text-left cursor-pointer ${
                      username.toLowerCase() === u.username.toLowerCase()
                        ? 'bg-blue-100 border-blue-400 ring-2 ring-blue-300'
                        : 'bg-slate-50 hover:bg-blue-50 border-slate-200'
                    }`}
                    title="Kullanıcı adını forma aktar"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {u.username}
                      </span>
                      <span className="text-[9px] font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                        İmalat
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {u.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Feature Badges Footer */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Google Sheets Entegre
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> GPS & Konum Kaydı
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Güvenli Kimlik Denetimi
          </span>
        </div>
      </div>
    </div>
  );
}

