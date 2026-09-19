import { useState } from 'react';
import { X, FileSpreadsheet, Check, Copy, ExternalLink, RefreshCw, Send, HelpCircle, ShieldCheck, FolderCheck, Image as ImageIcon } from 'lucide-react';
import { SyncConfig } from '../types';

interface GoogleSheetsSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SyncConfig;
  onSaveConfig: (config: SyncConfig) => void;
  onTestSync: () => Promise<void>;
  isTestingSync: boolean;
}

export default function GoogleSheetsSettingsModal({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onTestSync,
  isTestingSync
}: GoogleSheetsSettingsModalProps) {
  const [sheetUrl, setSheetUrl] = useState(config.googleSheetUrl);
  const [webhookUrl, setWebhookUrl] = useState(config.googleWebhookUrl);
  const [autoSync, setAutoSync] = useState(config.autoSync);
  const [syncInterval, setSyncInterval] = useState(config.syncInterval || 15);
  const [copiedCode, setCopiedCode] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const sampleAppsScript = `// ============================================================================
// TELEKOM ŞANTİYE DEFTERİ - GOOGLE SHEETS & GOOGLE DRIVE ENTEGRASYON KODU
// ============================================================================
// KURULUM:
// 1. Google E-Tablonuzda: "Uzantılar" > "Apps Script" menüsünü açın.
// 2. Mevcut kodları silip bu kodun tamamını yapıştırın ve Kaydet simgesine basın.
// 3. Sağ üstteki "Dağıt" (Deploy) > "Yeni Dağıtım" (New deployment) seçin.
// 4. Tür: "Web uygulaması" (Web app) seçin.
// 5. "Erişimi olanlar" (Who has access): "Herkes" (Anyone) olarak ayarlayın.
// 6. "Dağıt" butonuna basıp çıkan Web Uygulaması URL'sini kopyalayın ve uygulamaya yapıştırın.
//
// ÖZELLİK:
// - Gönderilen fotoğraflar otomatik olarak Google Drive'da "Şantiye Fotoğrafları" klasörüne .jpg olarak kaydedilir.
// - BİR PROJE ID İÇİN ÖNCESİ VE SONRASI İÇİN BİRER FOTOĞRAF YÜKLENİR.
// - Aynı Proje ID'ye ait çoklu poz satırlarında fotoğraflar Drive'a tekrar yüklenmez ve E-Tabloda tekrarlanmaz.
// ============================================================================

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    var entries = data.entries || [];
    
    // 1. Google Drive'da "Şantiye Fotoğrafları" klasörünü bul veya oluştur
    var folderName = "Şantiye Fotoğrafları";
    var folders = DriveApp.getFoldersByName(folderName);
    var targetFolder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
    
    // 2. Tablo başlıkları henüz yoksa ekle ve biçimlendir
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Tarih', 'Proje ID', 'Santral', 'Saha / Bölge', 'Kutu / Dolap No',
        'İşçilik Poz', 'İşçilik Açıklama', 'İşçilik Miktar', 'İşçilik Birim',
        'Malzeme Poz', 'Malzeme Adı', 'Malzeme Miktar', 'Malzeme Birim',
        'Öncesi Fotoğraf (Google Drive Linki)', 'Sonrası Fotoğraf (Google Drive Linki)', 'Konum (Enlem, Boylam)',
        'Konum Adresi', 'Google Harita Linki', 'Ekleyen Kullanıcı', 'Kayıt Saati', 'Senkron Durumu'
      ]);
      var headerRange = sheet.getRange(1, 1, 1, 21);
      headerRange.setBackground('#1e293b').setFontColor('#ffffff').setFontWeight('bold');
    }
    
    // 3. Fotoğrafı Google Drive'a .jpg formatında kaydeden fonksiyon
    function savePhotoToDrive(photoData, tag, row) {
      if (!photoData || photoData === '-' || photoData === 'Mevcut (Gömülü Görsel)') {
        return '-';
      }
      try {
        var blob;
        var pId = (row['Proje ID'] || row.projeID || 'PROJE').toString().replace(/[^a-zA-Z0-9_-]/g, '_');
        var kNo = (row['Kutu / Dolap No'] || row.kutu || 'KUTU').toString().replace(/[^a-zA-Z0-9_-]/g, '_');
        var timeStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'GMT+3', 'yyyyMMdd_HHmmss');
        var fileName = pId + '_' + kNo + '_' + tag + '_' + timeStr + '.jpg';
        
        if (photoData.indexOf('data:image') === 0 || photoData.indexOf(';base64,') > -1) {
          // Base64 Data URL (kamera veya dosya yükleme)
          var base64Part = photoData.split(';base64,')[1] || photoData;
          var decodedBytes = Utilities.base64Decode(base64Part);
          blob = Utilities.newBlob(decodedBytes, 'image/jpeg', fileName);
        } else if (photoData.indexOf('http://') === 0 || photoData.indexOf('https://') === 0) {
          // Harici web URL'i ise indirip Drive'a aktar
          var resp = UrlFetchApp.fetch(photoData, { muteHttpExceptions: true });
          if (resp.getResponseCode() === 200) {
            blob = resp.getBlob().setName(fileName).setContentType('image/jpeg');
          } else {
            return photoData;
          }
        } else if (photoData.length > 100) {
          // Ham Base64
          var decodedBytes = Utilities.base64Decode(photoData);
          blob = Utilities.newBlob(decodedBytes, 'image/jpeg', fileName);
        } else {
          return photoData;
        }
        
        // "Şantiye Fotoğrafları" klasörüne dosyayı oluştur ve herkese açık görüntüleme linki ata
        var driveFile = targetFolder.createFile(blob);
        driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        return driveFile.getUrl();
      } catch (err) {
        return 'Drive Hatası: ' + err.toString();
      }
    }
    
    // 4. Her satırı işle ve Google E-Tabloya yaz
    // BİR PROJE ID İÇİN ÖNCESİ VE SONRASI İÇİN BİRER FOTOĞRAF YETERLİDİR.
    // Proje ID'ye göre fotoğraflar hafızaya alınır; aynı projenin alt satırlarında fotoğraflar tekrarlanmaz.
    var processedProjects = {};

    entries.forEach(function(row) {
      var pId = (row['Proje ID'] || row.projeID || 'PROJE').toString().trim();
      var rawBefore = row['beforePhoto'] || row['Öncesi Fotoğraf'];
      var rawAfter = row['afterPhoto'] || row['Sonrası Fotoğraf'];
      
      var beforeDriveLink = '-';
      var afterDriveLink = '-';

      // Bu Proje ID ilk kez geliyorsa fotoğrafları Google Drive'a yükle
      if (!processedProjects[pId]) {
        if (rawBefore && rawBefore !== '-' && rawBefore !== 'Mevcut (Gömülü Görsel)') {
          beforeDriveLink = savePhotoToDrive(rawBefore, 'ONCESI', row);
        }
        if (rawAfter && rawAfter !== '-' && rawAfter !== 'Mevcut (Gömülü Görsel)') {
          afterDriveLink = savePhotoToDrive(rawAfter, 'SONRASI', row);
        }
        processedProjects[pId] = true;
      } else {
        // Bu Proje ID için fotoğraflar ilk satırda zaten eklendi.
        // Alt satırlarda aynı fotolar tekrarlanmaz:
        beforeDriveLink = '-';
        afterDriveLink = '-';
      }
      
      sheet.appendRow([
        row['Tarih'] || row.date || '',
        row['Proje ID'] || row.projeID || '',
        row['Santral'] || row.santral || '',
        row['Saha / Bölge'] || row.saha || '',
        row['Kutu / Dolap No'] || row.kutu || '',
        row['İşçilik Poz'] || row.iscilikPoz || '',
        row['İşçilik Açıklama'] || row.iscilikAciklama || '',
        row['İşçilik Miktar'] || row.iscilikMiktar || '',
        row['İşçilik Birim'] || row.iscilikBirim || '',
        row['Malzeme Poz'] || row.malzemePoz || '-',
        row['Malzeme Adı'] || row.malzemeAdi || '-',
        row['Malzeme Miktar'] || row.malzemeMiktar || '-',
        row['Malzeme Birim'] || row.malzemeBirim || '-',
        beforeDriveLink,
        afterDriveLink,
        row['Konum (Enlem, Boylam)'] || (row.locationLat ? (row.locationLat + ', ' + row.locationLng) : '-'),
        row['Konum Adresi'] || row.locationAddress || '-',
        row['Google Harita Linki'] || row.mapsUrl || '-',
        row['Ekleyen Kullanıcı'] || row.createdBy || '',
        row['Kayıt Saati'] || (new Date().toLocaleTimeString('tr-TR')),
        'Senkronize Edildi'
      ]);
    });
    
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'success', 
      count: entries.length,
      folder: folderName,
      message: entries.length + ' satır işlendi. Fotoğraflar Proje ID başına tekil olarak Google Drive ' + folderName + ' klasörüne kaydedildi.'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (globalErr) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'error', 
      message: globalErr.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Tarayıcıdan test amaçlı tıklandığında servis durumunu döndürür
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'active',
    service: 'Telekom Şantiye Google Sheets & Drive Webhook Aktif',
    targetDriveFolder: 'Şantiye Fotoğrafları',
    photoRule: 'Proje ID başına tekil öncesi ve sonrası fotoğraf kaydedilir'
  })).setMimeType(ContentService.MimeType.JSON);
}`;

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveConfig({
      ...config,
      googleSheetUrl: sheetUrl,
      googleWebhookUrl: webhookUrl,
      autoSync,
      syncInterval
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sampleAppsScript);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-2 sm:p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Google Sheets Senkronizasyon Ayarları</h3>
              <p className="text-[11px] sm:text-xs text-slate-500">Şantiye kayıtları ve fotoğraflar Google E-Tabloya yazılır.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 text-sm">
          {/* Status Alert */}
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 sm:p-3.5 flex items-start gap-2.5 sm:gap-3">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 mt-0.5 shrink-0" />
            <div className="text-xs text-emerald-900 space-y-1">
              <p className="font-semibold">Anlık Senkronizasyon Motoru Aktif</p>
              <p className="text-emerald-700 leading-relaxed">
                Eklenen her şantiye defteri kaydı (işçilik, malzeme, fotoğraflar, GPS koordinatları) Google Sheets formatına dönüştürülüp hafızaya ve bağlı tabloya işlenir.
              </p>
            </div>
          </div>

          {/* Google Drive Fotoğraf Bilgilendirmesi */}
          <div className="rounded-xl bg-blue-50/80 border border-blue-200 p-3 sm:p-3.5 flex items-start gap-2.5 sm:gap-3">
            <FolderCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-xs text-blue-950 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-blue-900">
                <span>Google Drive "Şantiye Fotoğrafları" Klasör Depolaması</span>
                <span className="text-[10px] bg-blue-200/80 text-blue-800 px-2 py-0.5 rounded-full font-semibold">
                  Tekil .JPG &amp; Sütun Tasarrufu
                </span>
              </p>
              <p className="text-blue-800 leading-relaxed text-[11px] sm:text-xs">
                Aşağıdaki Apps Script Webhook kodu kullanıldığında; formdan eklenen fotoğraflar Google Drive'ınızda <strong>"Şantiye Fotoğrafları"</strong> klasörüne <strong>.jpg</strong> dosyası olarak kaydedilir. <strong>Bir Proje ID için öncesi ve sonrası birer fotoğraf yüklenir; aynı fotoğrafların alt satırlarda tekrarlanması önlenir.</strong> E-Tablonuzdaki ilk satıra doğrudan Google Drive linkleri atanır.
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Google E-Tablo (Spreadsheet) Linki veya ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sheetUrl}
                  onChange={e => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                  className="w-full px-3.5 py-2.5 sm:py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono min-h-[42px] sm:min-h-0"
                />
                {sheetUrl && (
                  <a
                    href={sheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-1 text-xs font-semibold shrink-0 transition min-h-[42px] sm:min-h-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Aç
                  </a>
                )}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Verilerinizin görüntülendiği veya aktarıldığı Google Sheets dosyasının bağlantısı.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Google Apps Script Webhook URL (Canlı API Bağlantısı)
              </label>
              <input
                type="text"
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec (İsteğe Bağlı)"
                className="w-full px-3.5 py-2.5 sm:py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono min-h-[42px] sm:min-h-0"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Webhook URL girdiğinizde her yeni kayıt otomatik olarak Google E-Tabloya POST edilir.
              </span>
            </div>

            {/* Sync Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={e => setAutoSync(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Otomatik Anlık Senkronizasyon</span>
                  <span className="text-[11px] text-slate-500">Her kayıt eklendiğinde hemen senkronize et</span>
                </div>
              </label>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Periyodik Kontrol Aralığı
                </label>
                <select
                  value={syncInterval}
                  onChange={e => setSyncInterval(Number(e.target.value))}
                  className="w-full px-2.5 py-2 sm:py-1.5 text-xs border border-slate-300 rounded-lg bg-white min-h-[38px] sm:min-h-0"
                >
                  <option value={10}>Her 10 saniyede bir</option>
                  <option value={15}>Her 15 saniyede bir (Önerilen)</option>
                  <option value={30}>Her 30 saniyede bir</option>
                  <option value={60}>Her 1 dakikada bir</option>
                </select>
              </div>
            </div>
          </div>

          {/* Setup Guide Accordion */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 bg-slate-100/80 flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                Google Drive & Sheets Apps Script Webhook Kodu
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-md border border-slate-200 transition shadow-xs shrink-0 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? 'Kopyalandı!' : 'Kodu Kopyala'}
              </button>
            </div>
            <div className="p-3 sm:p-4 bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-48">
              <pre>{sampleAppsScript}</pre>
            </div>
            <div className="px-3 sm:px-4 py-2.5 bg-slate-50 text-[11px] text-slate-600 border-t border-slate-200 space-y-1">
              <div>
                <strong>Kurulum Adımları:</strong> Google E-Tablonuzu açın &gt; <strong>Uzantılar &gt; Apps Script</strong> menüsüne girin &gt; Yukarıdaki kodu yapıştırıp kaydedin &gt; Sağ üstten <strong>Dağıt &gt; Yeni Dağıtım &gt; Web Uygulaması</strong> seçin &gt; Erişim: <em>"Herkes" (Anyone)</em> yapıp Dağıt'a basın ve üretilen URL'yi yukarıdaki Webhook URL alanına yapıştırın.
              </div>
              <div className="text-blue-700 font-medium">
                💡 Kod çalıştığında Google Drive'ınızda <strong>"Şantiye Fotoğrafları"</strong> klasörü otomatik açılır ve resimler <code>.jpg</code> olarak saklanır.
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-slate-200 bg-slate-50 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-0">
          <button
            type="button"
            onClick={onTestSync}
            disabled={isTestingSync}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition disabled:opacity-50 min-h-[42px] sm:min-h-0 cursor-pointer"
          >
            {isTestingSync ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-blue-600" />}
            {isTestingSync ? 'Test Ediliyor...' : 'Bağlantıyı Test Et'}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 sm:py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition min-h-[42px] sm:min-h-0 cursor-pointer"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm min-h-[42px] sm:min-h-0 cursor-pointer"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-white" /> : null}
              {savedSuccess ? 'Kaydedildi!' : 'Ayarları Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
