import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  Camera, 
  Upload, 
  Trash2, 
  Check, 
  Copy, 
  Navigation, 
  ExternalLink,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ListPlus,
  Layers,
  ArrowDown,
  ArrowRight,
  LayoutDashboard,
  Filter,
  Star,
  PackageCheck,
  FolderKanban,
  X,
  Lock,
  ShieldCheck,
  Tag,
  Loader2
} from 'lucide-react';
import { 
  JOB_ITEMS, 
  MALZEME_ITEMS, 
  MALZEME_GROUPS, 
  JOB_CATEGORY_TITLES,
  getRecommendedMaterialsForJob 
} from '../data/jobAndMalzemeData';
import { JobItem, LocationData, MalzemeItem, ProjeTipi, SantiyeEntry, StagedPozLine, User } from '../types';
import CameraCaptureModal from './CameraCaptureModal';
import { compressImage, getImageSizeDisplay, formatBytes } from '../utils/imageCompressor';

interface SantiyeFormProps {
  currentUser: User | null;
  onAddEntry: (newEntries: Omit<SantiyeEntry, 'id' | 'createdAt' | 'syncStatus'>[]) => void;
  onViewDashboard?: () => void;
  entriesCount?: number;
}

const PROJE_TIPLERI: { value: Exclude<ProjeTipi, ''>; label: string; badgeClass: string; activeClass: string }[] = [
  {
    value: 'Hasar',
    label: 'Hasar',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    activeClass: 'bg-rose-600 text-white border-rose-600 shadow-xs'
  },
  {
    value: 'Pasif',
    label: 'Pasif',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    activeClass: 'bg-blue-600 text-white border-blue-600 shadow-xs'
  },
  {
    value: 'Bakım',
    label: 'Bakım',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    activeClass: 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
  }
];

export default function SantiyeForm({ currentUser, onAddEntry, onViewDashboard, entriesCount }: SantiyeFormProps) {
  const isSheff = Boolean(
    currentUser?.username?.toLowerCase() === 'sheff' || currentUser?.isAdmin
  );

  // Proje ve Lokasyon State
  const [projeAdi, setProjeAdi] = useState('Moda Cad. FTTx Genişleme');
  const [projeID, setProjeID] = useState(() => (isSheff ? 'PRJ-2026-IST' : 'Atanmadı'));
  const [projeTipi, setProjeTipi] = useState<ProjeTipi>(() => (isSheff ? 'Pasif' : ''));
  const [santral, setSantral] = useState('Kadıköy Santral');
  const [saha, setSaha] = useState('SH-04 Modafen');
  const [kutu, setKutu] = useState('K-108A');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [createdBy, setCreatedBy] = useState<string>(
    currentUser?.username || currentUser?.name || 'Sheff'
  );

  useEffect(() => {
    if (currentUser?.username) {
      setCreatedBy(currentUser.username);
    } else if (currentUser?.name) {
      setCreatedBy(currentUser.name);
    }
    const userIsSheff = Boolean(
      currentUser?.username?.toLowerCase() === 'sheff' || currentUser?.isAdmin
    );
    if (!userIsSheff) {
      setProjeID('Atanmadı');
      setProjeTipi('');
    } else {
      setProjeID(prev => (prev === 'Atanmadı' || !prev ? 'PRJ-2026-IST' : prev));
      setProjeTipi(prev => (!prev ? 'Pasif' : prev));
    }
  }, [currentUser]);

  // Fotoğraflar State (Öncesi / Sonrası)
  const [beforePhoto, setBeforePhoto] = useState<string>('https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80');
  const [afterPhoto, setAfterPhoto] = useState<string>('https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80');
  const [cameraTarget, setCameraTarget] = useState<'before' | 'after' | null>(null);

  // Fotoğraf Boyut ve Sıkıştırma State'leri (~1MB optimizasyonu)
  const [isCompressingBefore, setIsCompressingBefore] = useState(false);
  const [isCompressingAfter, setIsCompressingAfter] = useState(false);
  const [beforePhotoInfo, setBeforePhotoInfo] = useState<{ sizeFormatted: string; originalFormatted?: string } | null>({
    sizeFormatted: '820 KB (~1MB Optimize)'
  });
  const [afterPhotoInfo, setAfterPhotoInfo] = useState<{ sizeFormatted: string; originalFormatted?: string } | null>({
    sizeFormatted: '790 KB (~1MB Optimize)'
  });

  // GPS ve Lokasyon State
  const [location, setLocation] = useState<LocationData | null>({
    lat: 40.9915,
    lng: 29.0289,
    accuracy: 6,
    address: 'Caferağa Mah. Moda Cad. No:44, Kadıköy, İstanbul',
    timestamp: new Date().toLocaleTimeString('tr-TR'),
    mapsUrl: 'https://www.google.com/maps?q=40.9915,29.0289'
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationMsg, setLocationMsg] = useState<string>('Varsayılan saha GPS konumu tanımlandı.');

  // Staged Poz Satırları (Senkronizasyon öncesi geçici liste)
  const [stagedLines, setStagedLines] = useState<StagedPozLine[]>([
    {
      tempId: 'staged-1',
      iscilikPoz: '4.1',
      iscilikAciklama: 'Fiber Ek Yapımı veya Terminasyonu',
      iscilikMiktar: '16',
      iscilikBirim: 'Ad.',
      malzemePoz: '229',
      malzemeAdi: 'F/O Ek Kutusu (3 Kasetli)',
      malzemeMiktar: '2',
      malzemeBirim: 'Ad.'
    },
    {
      tempId: 'staged-2',
      iscilikPoz: '2.1',
      iscilikAciklama: 'Havai Güzargahta (Direkte/Blokta) Her Kapasitede ve Tipte Kablo Çekimi',
      iscilikMiktar: '120',
      iscilikBirim: 'Mt.',
      malzemePoz: '260',
      malzemeAdi: '1x2 OBK (Outdoor + Zırhlı)',
      malzemeMiktar: '125',
      malzemeBirim: 'Mt.'
    }
  ]);

  // Giriş Satırı (İşçilik State)
  const [iscilikSearch, setIscilikSearch] = useState('');
  const [activeJobCategory, setActiveJobCategory] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [iscilikQty, setIscilikQty] = useState('');
  const [iscilikError, setIscilikError] = useState('');
  const [isIscilikDropdownOpen, setIsIscilikDropdownOpen] = useState(false);

  // Giriş Satırı (Malzeme State & İşçiliğe Göre Gruplama)
  const [malzemeSearch, setMalzemeSearch] = useState('');
  const [selectedMalzemeler, setSelectedMalzemeler] = useState<string[]>([]);
  const [malzemeQty, setMalzemeQty] = useState('');
  const [malzemeUnit, setMalzemeUnit] = useState('Ad.');
  const [malzemeViewMode, setMalzemeViewMode] = useState<'recommended' | 'all'>('recommended');
  const [activeMalzemeGroup, setActiveMalzemeGroup] = useState<string>('all');
  const [isConfirmingClearStaged, setIsConfirmingClearStaged] = useState(false);

  const [notificationMsg, setNotificationMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const fileInputBeforeRef = useRef<HTMLInputElement | null>(null);
  const fileInputAfterRef = useRef<HTMLInputElement | null>(null);

  const showNotification = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotificationMsg({ text, type });
    setTimeout(() => {
      setNotificationMsg(null);
    }, 4000);
  };

  // Filter İşçilik
  const filteredJobs = useMemo(() => {
    return JOB_ITEMS.filter(item => {
      const matchesCat = activeJobCategory === 'all' || item.categoryCode === activeJobCategory;
      const q = iscilikSearch.trim().toLowerCase();
      const matchesQuery =
        !q ||
        item.poz.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    }).slice(0, 30);
  }, [iscilikSearch, activeJobCategory]);

  // Seçilen işçiliğe göre önerilen malzeme grupları ve öncelikli malzemeler
  const activeJobForMaterials = useMemo(() => {
    if (selectedJob) return selectedJob;
    const exact = JOB_ITEMS.find(j => j.poz.toLowerCase() === iscilikSearch.trim().toLowerCase());
    return exact || null;
  }, [selectedJob, iscilikSearch]);

  const jobMaterialRecommendation = useMemo(() => {
    if (!activeJobForMaterials) return null;
    return getRecommendedMaterialsForJob(activeJobForMaterials.poz);
  }, [activeJobForMaterials]);

  const priorityCodeSet = useMemo(() => {
    return new Set(jobMaterialRecommendation?.priorityCodes || []);
  }, [jobMaterialRecommendation]);

  // Gösterilecek malzeme grupları (Seçilen işçiliğe özel gruplar veya tüm gruplar)
  const displayedMalzemeGroups = useMemo(() => {
    if (activeJobForMaterials && malzemeViewMode === 'recommended' && jobMaterialRecommendation) {
      return jobMaterialRecommendation.recommendedGroups;
    }
    return MALZEME_GROUPS;
  }, [activeJobForMaterials, malzemeViewMode, jobMaterialRecommendation]);

  // Seçilen işçiliğe, aktif malzeme grubuna ve arama kelimesine göre filtrelenmiş malzemeler
  const filteredMalzemeler = useMemo(() => {
    const q = malzemeSearch.trim().toLowerCase();
    const basePool: MalzemeItem[] =
      activeJobForMaterials && malzemeViewMode === 'recommended' && jobMaterialRecommendation
        ? jobMaterialRecommendation.materials
        : MALZEME_ITEMS;

    return basePool.filter(m => {
      if (activeMalzemeGroup === 'priority') {
        if (!priorityCodeSet.has(m.kod)) return false;
      } else if (activeMalzemeGroup !== 'all') {
        if (m.groupId !== activeMalzemeGroup) return false;
      }

      if (!q) return true;
      return (
        m.kod.toLowerCase().includes(q) ||
        m.ad.toLowerCase().includes(q) ||
        m.groupTitle.toLowerCase().includes(q)
      );
    }).slice(0, 90);
  }, [activeJobForMaterials, malzemeViewMode, jobMaterialRecommendation, activeMalzemeGroup, malzemeSearch, priorityCodeSet]);

  // Malzemeleri grup başlıklarına göre grupla (UI'da düzenli grup görünümü için)
  const groupedFilteredMalzemeler = useMemo(() => {
    const map = new Map<string, { groupId: string; groupTitle: string; items: MalzemeItem[] }>();
    filteredMalzemeler.forEach(item => {
      const existing = map.get(item.groupId);
      if (existing) {
        existing.items.push(item);
      } else {
        map.set(item.groupId, {
          groupId: item.groupId,
          groupTitle: item.groupTitle,
          items: [item],
        });
      }
    });
    return Array.from(map.values());
  }, [filteredMalzemeler]);

  // Select İşçilik
  const handleSelectJob = (job: JobItem) => {
    setSelectedJob(job);
    setIscilikSearch(job.poz);
    setIscilikError('');
    setIsIscilikDropdownOpen(false);
    setMalzemeViewMode('recommended');
    setActiveMalzemeGroup('all');
    if (job.unit) {
      setMalzemeUnit(job.unit);
    }
  };

  // Toggle Malzeme
  const handleToggleMalzeme = (kod: string) => {
    const malz = MALZEME_ITEMS.find(m => m.kod === kod);
    if (selectedMalzemeler.includes(kod)) {
      setSelectedMalzemeler(prev => prev.filter(k => k !== kod));
    } else {
      setSelectedMalzemeler(prev => [...prev, kod]);
      if (malz?.defaultUnit) {
        setMalzemeUnit(malz.defaultUnit);
      }
    }
  };

  // Copy Iscilik Qty to Malzeme Qty
  const copyQtyToMalzeme = () => {
    if (iscilikQty) {
      setMalzemeQty(iscilikQty);
      if (selectedJob?.unit) {
        setMalzemeUnit(selectedJob.unit);
      }
    } else {
      showNotification('⚠️ Lütfen önce işçilik miktarını giriniz!', 'error');
    }
  };

  // Handle Photo Upload from file with ~1MB compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const originalSizeStr = formatBytes(file.size);
    if (target === 'before') {
      setIsCompressingBefore(true);
    } else {
      setIsCompressingAfter(true);
    }

    try {
      // Compress to ~1MB (target max 1024KB, max dimension 1920px Full HD)
      const result = await compressImage(file, { maxSizeKb: 1024, maxDimension: 1920 });
      if (target === 'before') {
        setBeforePhoto(result.dataUrl);
        setBeforePhotoInfo({
          sizeFormatted: result.sizeFormatted,
          originalFormatted: originalSizeStr
        });
        showNotification(`📸 Öncesi fotoğrafı ~1MB boyutuna optimize edildi (${result.sizeFormatted})`, 'success');
      } else {
        setAfterPhoto(result.dataUrl);
        setAfterPhotoInfo({
          sizeFormatted: result.sizeFormatted,
          originalFormatted: originalSizeStr
        });
        showNotification(`📸 Sonrası fotoğrafı ~1MB boyutuna optimize edildi (${result.sizeFormatted})`, 'success');
      }
    } catch (err: any) {
      console.error('Fotoğraf sıkıştırma hatası:', err);
      // Fallback: standard FileReader
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (target === 'before') {
          setBeforePhoto(dataUrl);
          setBeforePhotoInfo({ sizeFormatted: formatBytes(file.size) });
        } else {
          setAfterPhoto(dataUrl);
          setAfterPhotoInfo({ sizeFormatted: formatBytes(file.size) });
        }
      };
      reader.readAsDataURL(file);
      showNotification('⚠️ Fotoğraf yüklendi fakat sıkıştırma esnasında uyarı oluştu.', 'info');
    } finally {
      if (target === 'before') {
        setIsCompressingBefore(false);
      } else {
        setIsCompressingAfter(false);
      }
      e.target.value = '';
    }
  };

  // Get Current GPS Location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationMsg('Tarayıcınız GPS Geolocation özelliğini desteklemiyor.');
      return;
    }

    setIsGettingLocation(true);
    setLocationMsg('GPS uydularına bağlanılıyor...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy);

        let address = `${santral} - ${saha} (GPS Koordinatı)`;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
          if (res.ok) {
            const data = await res.json();
            if (data.display_name) {
              address = data.display_name.split(',').slice(0, 3).join(',');
            }
          }
        } catch {
          // fallback
        }

        const newLoc: LocationData = {
          lat,
          lng,
          accuracy,
          address,
          timestamp: new Date().toLocaleTimeString('tr-TR'),
          mapsUrl: `https://www.google.com/maps?q=${lat},${lng}`
        };

        setLocation(newLoc);
        setIsGettingLocation(false);
        setLocationMsg(`✅ Konum başarıyla alındı (±${accuracy}m hassasiyet)`);
      },
      (err) => {
        setIsGettingLocation(false);
        console.warn('Geolocation error:', err.message);
        setLocationMsg('⚠️ GPS izni verilmedi veya zaman aşımına uğradı. Saha konumu varsayılan olarak ayarlandı.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Poz Satırını Hazırlık Listesine Ekle (Staging)
  const handleAddPozLineToStaging = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedJob && !iscilikSearch.trim()) {
      setIscilikError('⚠️ Lütfen geçerli bir işçilik pozu seçiniz!');
      return;
    }

    if (!iscilikQty.trim() || Number(iscilikQty) <= 0) {
      setIscilikError('⚠️ Lütfen geçerli bir işçilik miktarı giriniz!');
      return;
    }

    const currentJob = activeJobForMaterials || selectedJob || {
      poz: iscilikSearch.trim(),
      desc: 'Saha Özel İmalatı',
      unit: 'Ad.'
    };

    const newLines: StagedPozLine[] = [];

    if (selectedMalzemeler.length > 0) {
      selectedMalzemeler.forEach(kod => {
        const malz = MALZEME_ITEMS.find(m => m.kod === kod);
        newLines.push({
          tempId: `stage-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          iscilikPoz: currentJob.poz,
          iscilikAciklama: currentJob.desc,
          iscilikMiktar: iscilikQty,
          iscilikBirim: currentJob.unit,
          malzemePoz: kod,
          malzemeAdi: malz ? malz.ad : 'Malzeme',
          malzemeMiktar: malzemeQty || iscilikQty,
          malzemeBirim: malzemeUnit || malz?.defaultUnit || currentJob.unit
        });
      });
    } else {
      newLines.push({
        tempId: `stage-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        iscilikPoz: currentJob.poz,
        iscilikAciklama: currentJob.desc,
        iscilikMiktar: iscilikQty,
        iscilikBirim: currentJob.unit,
        malzemePoz: '',
        malzemeAdi: '',
        malzemeMiktar: '',
        malzemeBirim: ''
      });
    }

    setStagedLines(prev => [...prev, ...newLines]);
    showNotification(`➕ ${newLines.length} adet poz satırı listeye eklendi. Hatalı ise senkronizasyondan önce silebilirsiniz.`, 'info');

    // Reset inputs for next poz
    setSelectedJob(null);
    setIscilikSearch('');
    setIscilikQty('');
    setSelectedMalzemeler([]);
    setMalzemeQty('');
    setMalzemeSearch('');
    setActiveMalzemeGroup('all');
    setIscilikError('');
  };

  // Senkronizasyon Öncesi Hatalı Pozu Sil
  const handleDeleteStagedLine = (tempId: string) => {
    setStagedLines(prev => prev.filter(l => l.tempId !== tempId));
    showNotification('🗑️ Hatalı poz satırı senkronizasyon öncesi listeden silindi.', 'error');
  };

  // Tüm Hazırlık Listesini Temizle
  const handleClearStagedLines = () => {
    setStagedLines([]);
    setIsConfirmingClearStaged(false);
    showNotification('🗑️ Hazırlanan tüm poz satırları listeden temizlendi.', 'info');
  };

  // Tüm Paketi Şantiye Defterine ve Google Sheets'e Kaydet
  const handleFinalSaveAndSync = () => {
    if (stagedLines.length === 0) {
      showNotification('⚠️ Senkronizasyon için en az bir işçilik ve malzeme poz satırı eklemelisiniz!', 'error');
      return;
    }

    if (!projeAdi.trim()) {
      showNotification('⚠️ Lütfen Proje Adı bilgisini giriniz!', 'error');
      return;
    }

    if (isSheff && !projeID.trim()) {
      showNotification('⚠️ Sheff olarak lütfen Proje ID bilgisini giriniz!', 'error');
      return;
    }

    if (isSheff && !projeTipi) {
      showNotification('⚠️ Sheff olarak lütfen Proje Tipini (Hasar, Pasif, Bakım) seçiniz!', 'error');
      return;
    }

    const finalProjeID = isSheff ? projeID.trim() : 'Atanmadı';
    const finalProjeTipi: ProjeTipi = isSheff ? projeTipi : '';

    // Bir proje ID için öncesi ve sonrası için birer foto yeterlidir (yalnızca ilk poz satırına kaydedilir)
    const newEntries: Omit<SantiyeEntry, 'id' | 'createdAt' | 'syncStatus'>[] = stagedLines.map((line, index) => ({
      date,
      projeAdi: projeAdi.trim(),
      projeID: finalProjeID,
      projeTipi: finalProjeTipi,
      santral: santral.trim(),
      saha: saha.trim(),
      kutu: kutu.trim(),
      iscilikPoz: line.iscilikPoz,
      iscilikAciklama: line.iscilikAciklama,
      iscilikMiktar: line.iscilikMiktar,
      iscilikBirim: line.iscilikBirim,
      malzemePoz: line.malzemePoz,
      malzemeAdi: line.malzemeAdi,
      malzemeMiktar: line.malzemeMiktar,
      malzemeBirim: line.malzemeBirim,
      beforePhoto: index === 0 ? (beforePhoto || undefined) : undefined,
      afterPhoto: index === 0 ? (afterPhoto || undefined) : undefined,
      location: location || undefined,
      createdBy: (createdBy || currentUser?.username || currentUser?.name || 'Sheff').trim()
    }));

    onAddEntry(newEntries);
    showNotification(`✅ ${newEntries.length} adet poz satırı kaydedildi! Tüm kayıtları incelemek için Dashboard sekmesine geçebilirsiniz.`, 'success');

    // Clear staged list
    setStagedLines([]);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      {/* Header */}
      <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex flex-wrap items-center gap-2">
              Proje & Saha İmalat Paketi Girişi
              <span className="text-[10px] bg-blue-600/40 text-blue-200 border border-blue-400/30 px-2 py-0.5 rounded-full font-semibold">
                Çoklu Poz Desteği
              </span>
            </h2>
            <p className="text-xs text-slate-300">
              Fotoğraflar ve konumu belirledikten sonra işçilik ve malzeme pozlarını ekleyebilirsiniz.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 text-xs text-slate-300 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-700/60">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-amber-400">Personel:</span>
            <span className="bg-slate-800 px-2.5 py-1 rounded-lg text-white font-medium border border-slate-700">
              {currentUser?.name || 'Saha Personeli'}
            </span>
          </div>

          {onViewDashboard && (
            <button
              type="button"
              onClick={onViewDashboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer shadow-xs"
              title="Dashboard & Şantiye Defteri İmalat Kayıtlarına Git"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard & Defter</span>
              {typeof entriesCount === 'number' && (
                <span className="bg-blue-900/80 text-blue-200 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                  {entriesCount}
                </span>
              )}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Floating Notification */}
      {notificationMsg && (
        <div className={`mx-3 sm:mx-6 mt-3 sm:mt-4 p-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-between transition ${
          notificationMsg.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : notificationMsg.type === 'error'
            ? 'bg-rose-50 text-rose-800 border-rose-200'
            : 'bg-blue-50 text-blue-800 border-blue-200'
        }`}>
          <span>{notificationMsg.text}</span>
          <button onClick={() => setNotificationMsg(null)} className="text-xs underline ml-2 font-bold cursor-pointer">Tamam</button>
        </div>
      )}

      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* ADIM 1: PROJE VE LOKASYON BİLGİLERİ */}
        <div className="p-3.5 sm:p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-950 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
              Proje & Saha Bilgileri
            </div>
            <div className="flex items-center gap-2">
              {isSheff ? (
                <span className="text-[10px] sm:text-[11px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  Sheff Yetkisi: Proje ID ve Proje Tipi (Hasar / Pasif / Bakım) Aktif
                </span>
              ) : (
                <span className="text-[10px] sm:text-[11px] bg-blue-100 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <Lock className="w-3 h-3 text-blue-700" />
                  Kablo Ekibi: Proje Adı girilebilir • Proje ID ve Tipi Sheff tarafından atanır
                </span>
              )}
            </div>
          </div>

          {/* Üst Satır: Proje Adı, Proje ID (Sadece Sheff), Proje Tipi (Sadece Sheff) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3 bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
            {/* Proje Adı - Kablo Ekipleri ve Sheff Girebilir */}
            <div className="md:col-span-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  Proje Adı
                </span>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded">
                  Kablo Ekibi / Sheff
                </span>
              </label>
              <input
                type="text"
                value={projeAdi}
                onChange={e => setProjeAdi(e.target.value)}
                placeholder="Proje adını giriniz (Örn: Moda Cad. Abone Tesisi)"
                className="w-full px-3 py-2.5 sm:py-1.5 text-sm sm:text-xs bg-white border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
              />
            </div>

            {/* Proje ID - Sadece Sheff Girebilir */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Proje ID</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5 ${
                  isSheff
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {!isSheff && <Lock className="w-2.5 h-2.5" />}
                  Sadece Sheff
                </span>
              </label>
              {isSheff ? (
                <input
                  type="text"
                  value={projeID}
                  onChange={e => setProjeID(e.target.value)}
                  placeholder="Örn: PRJ-2026-IST"
                  className="w-full px-3 py-2.5 sm:py-1.5 text-sm sm:text-xs bg-amber-50/40 border border-amber-400 rounded-lg focus:ring-2 focus:ring-amber-500 font-mono font-bold text-slate-900"
                />
              ) : (
                <div
                  className="w-full px-3 py-2.5 sm:py-1.5 text-sm sm:text-xs bg-slate-100 border border-slate-300 rounded-lg text-slate-500 font-medium flex items-center justify-between cursor-not-allowed select-none"
                  title="Proje ID girişi sadece Sheff tarafından yapılabilir"
                >
                  <span>Sheff Tarafından Girilecek</span>
                  <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </div>
              )}
            </div>

            {/* Proje Tipi (Hasar / Pasif / Bakım) - Sadece Sheff Seçebilir */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Proje Tipi (Hasar / Pasif / Bakım)</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5 ${
                  isSheff
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {!isSheff && <Lock className="w-2.5 h-2.5" />}
                  Sadece Sheff
                </span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {PROJE_TIPLERI.map(tip => {
                  const isSelected = isSheff && projeTipi === tip.value;
                  return (
                    <button
                      key={tip.value}
                      type="button"
                      disabled={!isSheff}
                      onClick={() => {
                        if (isSheff) setProjeTipi(tip.value);
                      }}
                      title={
                        isSheff
                          ? `Proje tipini '${tip.label}' olarak seç`
                          : 'Proje tipi seçimi sadece Sheff tarafından yapılabilir'
                      }
                      className={`py-2 sm:py-1.5 px-2 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-1 ${
                        !isSheff
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                          : isSelected
                          ? `${tip.activeClass} cursor-pointer`
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      <span>{tip.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Alt Satır: Santral, Saha, Kutu, Tarih, Ekleyen Kullanıcı */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 sm:gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Santral</label>
              <input
                type="text"
                value={santral}
                onChange={e => setSantral(e.target.value)}
                placeholder="Santral Adı"
                className="w-full px-3 py-2.5 sm:py-1.5 text-sm sm:text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Saha / Bölge</label>
              <input
                type="text"
                value={saha}
                onChange={e => setSaha(e.target.value)}
                placeholder="Saha Kodu"
                className="w-full px-3 py-2.5 sm:py-1.5 text-sm sm:text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kutu / Dolap No</label>
              <input
                type="text"
                value={kutu}
                onChange={e => setKutu(e.target.value)}
                placeholder="Kutu No"
                className="w-full px-3 py-2.5 sm:py-1.5 text-sm sm:text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">İmalat Tarihi</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2.5 sm:py-1.5 text-sm sm:text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Ekleyen Kullanıcı</span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1 rounded">E-Tablo</span>
              </label>
              <input
                type="text"
                value={createdBy}
                onChange={e => setCreatedBy(e.target.value)}
                placeholder="Örn: Sheff / KABLO17599"
                title="Google E-Tabloda 'Ekleyen Kullanıcı' sütununa kaydedilecek kullanıcı adı"
                className="w-full px-3 py-2.5 sm:py-1.5 text-sm sm:text-xs bg-emerald-50/60 border border-emerald-300 text-emerald-950 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold"
              />
            </div>
          </div>
        </div>

        {/* ADIM 2: ÇALIŞMA ÖNCESİ / SONRASI FOTOĞRAFLAR & GPS KONUM */}
        <div className="p-3.5 sm:p-4 bg-blue-50/40 rounded-xl border border-blue-200">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-950 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
              Fotoğraflar ve GPS Konum
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] sm:text-[11px] text-blue-800 font-bold bg-blue-100 px-2 py-0.5 rounded-full">
                Saha Kanıtları
              </span>
              <span className="text-[10px] sm:text-[11px] text-emerald-800 font-bold bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs" title="Fotoğraflar otomatik olarak Full HD kalitede ~1MB boyutuna küçültülür">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                ~1MB Otomatik Sıkıştırma
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
            {/* Öncesi Resim */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Çalışma Öncesi Fotoğraf
                  </span>
                  {beforePhoto && (
                    <button
                      type="button"
                      onClick={() => {
                        setBeforePhoto('');
                        setBeforePhotoInfo(null);
                      }}
                      className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 cursor-pointer"
                      title="Fotoğrafı Kaldır"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {isCompressingBefore ? (
                  <div className="aspect-video rounded-lg border-2 border-dashed border-amber-300 flex flex-col items-center justify-center text-amber-800 mb-2 bg-amber-50/60 p-3 text-center">
                    <Loader2 className="w-7 h-7 mb-1.5 animate-spin text-amber-600" />
                    <span className="text-xs font-bold">Fotoğraf ~1MB boyutuna küçültülüyor...</span>
                    <span className="text-[11px] text-amber-700/80 mt-0.5">Saha detayları korunuyor</span>
                  </div>
                ) : beforePhoto ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 mb-2 group">
                    <img src={beforePhoto} alt="Öncesi" className="w-full h-full object-cover" />
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold bg-slate-950/85 backdrop-blur-xs text-white px-2 py-0.5 rounded-md border border-amber-400/50 shadow-xs">
                        <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>{beforePhotoInfo?.sizeFormatted || '820 KB (~1MB Optimize)'}</span>
                        {beforePhotoInfo?.originalFormatted && (
                          <span className="text-amber-200/90 text-[10px] hidden sm:inline">({beforePhotoInfo.originalFormatted} ➔ ~1MB)</span>
                        )}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 mb-2 bg-slate-50/50">
                    <Camera className="w-7 h-7 mb-1 opacity-50" />
                    <span className="text-xs">Öncesi fotoğrafı yükleyin</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">(Otomatik ~1MB'a küçültülür)</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-1">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputBeforeRef}
                  onChange={e => handleFileUpload(e, 'before')}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputBeforeRef.current?.click()}
                  disabled={isCompressingBefore}
                  className="flex-1 flex items-center justify-center gap-1.5 min-h-[42px] py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-xs font-bold transition cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  Dosya Seç
                </button>
                <button
                  type="button"
                  onClick={() => setCameraTarget('before')}
                  disabled={isCompressingBefore}
                  className="flex-1 flex items-center justify-center gap-1.5 min-h-[42px] py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs sm:text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  Kamera Aç
                </button>
              </div>
            </div>

            {/* Sonrası Resim */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Çalışma Sonrası Fotoğraf
                  </span>
                  {afterPhoto && (
                    <button
                      type="button"
                      onClick={() => {
                        setAfterPhoto('');
                        setAfterPhotoInfo(null);
                      }}
                      className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 cursor-pointer"
                      title="Fotoğrafı Kaldır"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {isCompressingAfter ? (
                  <div className="aspect-video rounded-lg border-2 border-dashed border-emerald-300 flex flex-col items-center justify-center text-emerald-800 mb-2 bg-emerald-50/60 p-3 text-center">
                    <Loader2 className="w-7 h-7 mb-1.5 animate-spin text-emerald-600" />
                    <span className="text-xs font-bold">Fotoğraf ~1MB boyutuna küçültülüyor...</span>
                    <span className="text-[11px] text-emerald-700/80 mt-0.5">Saha detayları korunuyor</span>
                  </div>
                ) : afterPhoto ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 mb-2 group">
                    <img src={afterPhoto} alt="Sonrası" className="w-full h-full object-cover" />
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold bg-slate-950/85 backdrop-blur-xs text-white px-2 py-0.5 rounded-md border border-emerald-400/50 shadow-xs">
                        <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{afterPhotoInfo?.sizeFormatted || '790 KB (~1MB Optimize)'}</span>
                        {afterPhotoInfo?.originalFormatted && (
                          <span className="text-emerald-200/90 text-[10px] hidden sm:inline">({afterPhotoInfo.originalFormatted} ➔ ~1MB)</span>
                        )}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 mb-2 bg-slate-50/50">
                    <Camera className="w-7 h-7 mb-1 opacity-50" />
                    <span className="text-xs">Sonrası fotoğrafı yükleyin</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">(Otomatik ~1MB'a küçültülür)</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-1">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputAfterRef}
                  onChange={e => handleFileUpload(e, 'after')}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputAfterRef.current?.click()}
                  disabled={isCompressingAfter}
                  className="flex-1 flex items-center justify-center gap-1.5 min-h-[42px] py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-xs font-bold transition cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  Dosya Seç
                </button>
                <button
                  type="button"
                  onClick={() => setCameraTarget('after')}
                  disabled={isCompressingAfter}
                  className="flex-1 flex items-center justify-center gap-1.5 min-h-[42px] py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  Kamera Aç
                </button>
              </div>
            </div>

            {/* GPS Konum Kartı */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    GPS Saha Konumu
                  </span>
                  {location && (
                    <a
                      href={location.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-0.5 font-semibold"
                    >
                      Harita <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {location ? (
                    <>
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-slate-500">Koordinat:</span>
                        <span className="font-bold text-slate-900">{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Doğruluk:</span>
                        <span className="text-emerald-700 font-semibold">±{location.accuracy || 6} metre</span>
                      </div>
                      <div className="text-[11px] text-slate-600 truncate" title={location.address}>
                        {location.address || `${santral} Sahası`}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-2.5 text-slate-400 text-xs">
                      Konum henüz kaydedilmedi.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-2 space-y-1.5">
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                  className="w-full flex items-center justify-center gap-1.5 min-h-[44px] py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Navigation className={`w-4 h-4 ${isGettingLocation ? 'animate-spin' : ''}`} />
                  {isGettingLocation ? 'GPS Konumu Alınıyor...' : '📍 GPS Konumumu Al'}
                </button>
                <p className="text-[10px] text-slate-500 text-center truncate">{locationMsg}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ADIM 3: İŞÇİLİK VE MALZEME POZU EKLEME FORMU */}
        <form onSubmit={handleAddPozLineToStaging} className="space-y-4">
          <div className="p-3.5 sm:p-4 bg-emerald-50/40 rounded-xl border border-emerald-200 space-y-3.5 sm:space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">3</span>
                İşçilik ve Malzeme Poz Satırı Ekle
              </div>
              {iscilikError && (
                <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {iscilikError}
                </span>
              )}
            </div>

            {/* İşçilik Ana Grubu Hızlı Filtre Butonları */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                  <FolderKanban className="w-3.5 h-3.5 text-emerald-700" />
                  İşçilik Ana Grubu (Hızlı Seçim):
                </span>
                {activeJobCategory !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setActiveJobCategory('all')}
                    className="text-[11px] text-emerald-700 hover:underline font-semibold cursor-pointer"
                  >
                    Tüm İşçilik Gruplarını Göster
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveJobCategory('all');
                    setIsIscilikDropdownOpen(true);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition border cursor-pointer ${
                    activeJobCategory === 'all'
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                  }`}
                >
                  Tümü ({JOB_ITEMS.length})
                </button>
                {Object.entries(JOB_CATEGORY_TITLES).map(([code, title]) => {
                  const isActive = activeJobCategory === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        setActiveJobCategory(code);
                        setIscilikSearch('');
                        setIsIscilikDropdownOpen(true);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition border cursor-pointer ${
                        isActive
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs font-bold'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                      }`}
                    >
                      {title}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* İşçilik Alanları */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3">
              <div className="sm:col-span-4 relative">
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>İşçilik Poz No (Ara / Seç)</span>
                  {selectedJob && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                      Seçildi: {selectedJob.poz}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={iscilikSearch}
                    onChange={e => {
                      setIscilikSearch(e.target.value);
                      setIsIscilikDropdownOpen(true);
                      if (selectedJob && selectedJob.poz !== e.target.value) {
                        setSelectedJob(null);
                      }
                    }}
                    onFocus={() => setIsIscilikDropdownOpen(true)}
                    placeholder="örn: 4.1, 2.1, 10.1, Direk..."
                    className="w-full px-3 py-2.5 sm:py-1.5 pr-8 text-sm sm:text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                  {iscilikSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setIscilikSearch('');
                        setSelectedJob(null);
                        setIsIscilikDropdownOpen(true);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      title="Aramayı temizle"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {isIscilikDropdownOpen && filteredJobs.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-white border border-slate-300 rounded-xl shadow-xl z-20">
                    <div className="sticky top-0 bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-600 flex items-center justify-between border-b border-slate-200">
                      <span>
                        {activeJobCategory === 'all'
                          ? 'İşçilik Poz Listesi'
                          : JOB_CATEGORY_TITLES[activeJobCategory]}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsIscilikDropdownOpen(false)}
                        className="text-slate-500 hover:text-slate-800 underline cursor-pointer"
                      >
                        Kapat
                      </button>
                    </div>
                    {filteredJobs.map(job => (
                      <button
                        key={job.poz + job.desc}
                        type="button"
                        onClick={() => handleSelectJob(job)}
                        className="w-full text-left px-3.5 py-2.5 sm:py-2 text-xs hover:bg-emerald-50 flex items-center justify-between gap-2 border-b border-slate-100 last:border-b-0 cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-bold text-emerald-800 font-mono bg-emerald-100/80 px-1.5 py-0.5 rounded text-xs">
                            {job.poz}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">({job.unit})</span>
                        </div>
                        <span className="text-slate-700 truncate text-right text-xs font-medium">{job.desc}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="sm:col-span-5">
                <label className="block text-xs font-semibold text-slate-700 mb-1">İş Açıklaması (Otomatik)</label>
                <input
                  type="text"
                  readOnly
                  value={activeJobForMaterials ? activeJobForMaterials.desc : (iscilikSearch ? 'İşçilik pozu seçildiğinde dolar' : '')}
                  placeholder="Poz seçildiğinde otomatik gelir"
                  className="w-full px-3 py-2.5 sm:py-1.5 text-sm sm:text-xs bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-medium cursor-not-allowed truncate"
                />
              </div>

              <div className="grid grid-cols-3 sm:col-span-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">İşçilik Miktarı</label>
                  <input
                    type="number"
                    step="any"
                    value={iscilikQty}
                    onChange={e => {
                      setIscilikQty(e.target.value);
                      if (!malzemeQty && selectedMalzemeler.length > 0) {
                        setMalzemeQty(e.target.value);
                      }
                    }}
                    placeholder="0"
                    className="w-full px-3 py-2.5 sm:py-1.5 text-base sm:text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Birim</label>
                  <input
                    type="text"
                    readOnly
                    value={activeJobForMaterials ? activeJobForMaterials.unit : '-'}
                    className="w-full px-2 py-2.5 sm:py-1.5 text-sm sm:text-xs bg-slate-100 border border-slate-300 rounded-lg text-slate-700 text-center font-bold cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Malzeme Seçimi (İşçiliğe Göre Otomatik Gruplanmış) */}
            <div className="border-t border-emerald-200/60 pt-3.5 space-y-2.5">
              {/* Başlık & Mod Seçimi */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <PackageCheck className="w-4 h-4 text-amber-600" />
                    Seçilen İşçiliğe Göre Gruplanmış Malzeme Listesi
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {activeJobForMaterials && jobMaterialRecommendation && (
                    <div className="inline-flex rounded-lg border border-amber-300 bg-white p-0.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          setMalzemeViewMode('recommended');
                          setActiveMalzemeGroup('all');
                        }}
                        className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer flex items-center gap-1 ${
                          malzemeViewMode === 'recommended'
                            ? 'bg-amber-500 text-slate-950 shadow-2xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Star className="w-3 h-3" />
                        İşçiliğe Uygun ({jobMaterialRecommendation.materials.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMalzemeViewMode('all');
                          setActiveMalzemeGroup('all');
                        }}
                        className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer flex items-center gap-1 ${
                          malzemeViewMode === 'all'
                            ? 'bg-slate-800 text-white shadow-2xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Filter className="w-3 h-3" />
                        Tüm Malzemeler ({MALZEME_ITEMS.length})
                      </button>
                    </div>
                  )}

                  <span className="text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg">
                    Seçili Malzeme: {selectedMalzemeler.length}
                  </span>
                  {selectedMalzemeler.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedMalzemeler([])}
                      className="text-[11px] text-rose-600 hover:underline font-bold cursor-pointer"
                    >
                      Seçimi Temizle
                    </button>
                  )}
                </div>
              </div>

              {/* Seçilen İşçiliğe Özel Malzeme Grubu Bilgi Kartı */}
              {activeJobForMaterials && jobMaterialRecommendation ? (
                <div className="p-2.5 sm:p-3 rounded-xl bg-amber-50/90 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-amber-950">
                      <span className="bg-emerald-700 text-white font-mono px-2 py-0.5 rounded text-[11px]">
                        Poz {activeJobForMaterials.poz}
                      </span>
                      <span>{activeJobForMaterials.desc}</span>
                    </div>
                    <p className="text-[11px] text-amber-900/90 font-medium">
                      💡 {jobMaterialRecommendation.helperNote}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold bg-white text-amber-900 border border-amber-300 px-2 py-1 rounded-lg">
                      {jobMaterialRecommendation.recommendedGroups.length} Uygun Grup Hazır
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                  <span>
                    ℹ️ Yukarıdan bir <strong>İşçilik Pozu</strong> seçtiğinizde, o işçiliğe ait malzeme grupları otomatik olarak filtrelenir ve seçime hazır gelir.
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 shrink-0 ml-2">
                    {MALZEME_GROUPS.length} Malzeme Grubu
                  </span>
                </div>
              )}

              {/* Malzeme Alt Grup Sekmeleri (Seçilen İşçiliğin Grupları veya Tüm Gruplar) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setActiveMalzemeGroup('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition border cursor-pointer ${
                    activeMalzemeGroup === 'all'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                  }`}
                >
                  {activeJobForMaterials && malzemeViewMode === 'recommended'
                    ? `Tüm Uygun Gruplar (${jobMaterialRecommendation?.materials.length || 0})`
                    : `Tüm Gruplar (${MALZEME_ITEMS.length})`}
                </button>

                {activeJobForMaterials &&
                  malzemeViewMode === 'recommended' &&
                  jobMaterialRecommendation &&
                  jobMaterialRecommendation.priorityCodes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveMalzemeGroup('priority')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition border flex items-center gap-1 cursor-pointer ${
                        activeMalzemeGroup === 'priority'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                          : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      <Star className="w-3 h-3 fill-current" />
                      Doğrudan İlişkili ({jobMaterialRecommendation.priorityCodes.length})
                    </button>
                  )}

                {displayedMalzemeGroups.map(grp => {
                  const count = (
                    activeJobForMaterials && malzemeViewMode === 'recommended' && jobMaterialRecommendation
                      ? jobMaterialRecommendation.materials
                      : MALZEME_ITEMS
                  ).filter(m => m.groupId === grp.id).length;

                  if (count === 0) return null;
                  const isActive = activeMalzemeGroup === grp.id;

                  return (
                    <button
                      key={grp.id}
                      type="button"
                      onClick={() => setActiveMalzemeGroup(grp.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition border cursor-pointer ${
                        isActive
                          ? 'bg-amber-600 text-white border-amber-600 shadow-2xs font-bold'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                      }`}
                      title={grp.title}
                    >
                      {grp.shortTitle} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Seçilmiş Malzemelerin Hızlı Özet Çipleri */}
              {selectedMalzemeler.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-amber-100/60 border border-amber-300">
                  <span className="text-[11px] font-bold text-amber-950 mr-1">Seçilenler:</span>
                  {selectedMalzemeler.map(kod => {
                    const m = MALZEME_ITEMS.find(item => item.kod === kod);
                    return (
                      <span
                        key={kod}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-amber-400 text-[11px] font-semibold text-slate-800 shadow-2xs"
                      >
                        <strong className="font-mono text-amber-800">{kod}</strong>
                        <span className="max-w-[180px] truncate">{m?.ad}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleMalzeme(kod)}
                          className="text-rose-500 hover:text-rose-700 ml-0.5 cursor-pointer"
                          title="Seçimi kaldır"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Malzeme Arama, Miktar ve Birim Alanları */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3">
                <div className="sm:col-span-4 relative">
                  <input
                    type="text"
                    value={malzemeSearch}
                    onChange={e => setMalzemeSearch(e.target.value)}
                    placeholder="Bu grupta malzeme poz veya adı ara..."
                    className="w-full px-3 py-2.5 sm:py-1.5 pr-7 text-sm sm:text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                  {malzemeSearch && (
                    <button
                      type="button"
                      onClick={() => setMalzemeSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="sm:col-span-4 flex items-center gap-2">
                  <input
                    type="number"
                    step="any"
                    value={malzemeQty}
                    onChange={e => setMalzemeQty(e.target.value)}
                    placeholder="Malzeme Miktarı"
                    className="w-full px-3 py-2.5 sm:py-1.5 text-base sm:text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-bold"
                  />
                  <button
                    type="button"
                    onClick={copyQtyToMalzeme}
                    className="px-3 py-2.5 sm:py-1.5 min-h-[42px] sm:min-h-0 bg-slate-100 hover:bg-slate-200 text-blue-700 text-xs font-bold rounded-lg shrink-0 flex items-center gap-1 cursor-pointer"
                    title="İşçilik miktarını kopyala"
                  >
                    <Copy className="w-3.5 h-3.5" /> Eşitle
                  </button>
                </div>

                <div className="sm:col-span-4">
                  <input
                    type="text"
                    value={malzemeUnit}
                    onChange={e => setMalzemeUnit(e.target.value)}
                    placeholder="Birim (Ad./Mt.)"
                    className="w-full px-3 py-2.5 sm:py-1.5 text-sm sm:text-xs bg-white border border-slate-300 rounded-lg font-medium"
                  />
                </div>
              </div>

              {/* Gruplanmış Malzeme Seçim Listesi */}
              <div className="bg-white border border-slate-200 rounded-xl p-2.5 max-h-64 overflow-y-auto space-y-3">
                {groupedFilteredMalzemeler.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 space-y-1.5">
                    <p>Aranan kriterde malzeme bulunamadı.</p>
                    {malzemeViewMode === 'recommended' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMalzemeViewMode('all');
                          setActiveMalzemeGroup('all');
                        }}
                        className="text-blue-600 hover:underline font-bold cursor-pointer"
                      >
                        Tüm Malzeme Gruplarında Ara ({MALZEME_ITEMS.length} Malzeme)
                      </button>
                    )}
                  </div>
                ) : (
                  groupedFilteredMalzemeler.map(groupBlock => (
                    <div key={groupBlock.groupId} className="space-y-1.5">
                      <div className="sticky top-0 z-10 bg-slate-100/95 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          {groupBlock.groupTitle}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {groupBlock.items.length} malzeme
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                        {groupBlock.items.map(m => {
                          const isSelected = selectedMalzemeler.includes(m.kod);
                          const isPriority = priorityCodeSet.has(m.kod);
                          return (
                            <button
                              key={m.kod}
                              type="button"
                              onClick={() => handleToggleMalzeme(m.kod)}
                              className={`text-left px-3 py-2 sm:py-1.5 rounded-lg text-xs transition border flex items-center justify-between gap-1.5 min-h-[38px] cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-100/95 border-amber-500 text-amber-950 font-bold shadow-2xs'
                                  : isPriority
                                  ? 'bg-emerald-50/60 border-emerald-200 hover:bg-emerald-100/60 text-slate-800 font-medium'
                                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 font-medium'
                              }`}
                            >
                              <span className="truncate pr-1 flex items-center gap-1">
                                <strong className="text-blue-700 font-mono shrink-0">{m.kod}</strong>
                                <span className="truncate">{m.ad}</span>
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                {isPriority && !isSelected && (
                                  <span
                                    className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded"
                                    title="Seçilen işçilik pozu için birinci dereceden önerilen malzeme"
                                  >
                                    Önerilen
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-400 font-mono">{m.defaultUnit}</span>
                                {isSelected && <Check className="w-4 h-4 text-amber-700 shrink-0" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Satırı Pakete Ekle Butonu */}
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 sm:py-2.5 min-h-[46px] sm:min-h-0 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm sm:text-xs shadow-md transition active:scale-98 cursor-pointer"
              >
                <ListPlus className="w-4 h-4" />
                Bu Poz Satırını Proje Listesine Ekle
              </button>
            </div>
          </div>
        </form>

        {/* ADIM 4: HAZIRLANAN İMALAT VE MALZEME POZLARI (SENKRONİZASYON ÖNCESİ KONTROL & SİLME LİSTESİ) */}
        <div className="p-3.5 sm:p-5 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border-2 border-dashed border-blue-300/80 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex flex-wrap items-center gap-2">
                  Hazırlanan İmalat Pozları
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                    {stagedLines.length} Poz Satırı
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Hatalı satırları senkronizasyondan önce <strong>kırmızı silme butonuyla</strong> kaldırabilirsiniz.
                </p>
              </div>
            </div>

            {stagedLines.length > 0 && (
              isConfirmingClearStaged ? (
                <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-300 rounded-lg px-2.5 py-1">
                  <span className="text-[11px] font-bold text-rose-700">Tüm pozlar silinsin mi?</span>
                  <button
                    type="button"
                    onClick={handleClearStagedLines}
                    className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold transition shadow-xs cursor-pointer"
                  >
                    Evet, Temizle
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingClearStaged(false)}
                    className="px-2 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[11px] font-medium transition cursor-pointer"
                  >
                    Vazgeç
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingClearStaged(true)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-rose-50 border border-rose-200 transition flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Tüm Pozları Temizle
                </button>
              )
            )}
          </div>

          {stagedLines.length === 0 ? (
            <div className="py-8 text-center text-slate-400 bg-white/60 rounded-xl border border-slate-200">
              <ArrowDown className="w-6 h-6 mx-auto mb-1 text-slate-400 animate-bounce" />
              <p className="text-xs font-semibold text-slate-700">Henüz eklenmiş bir poz satırı yok</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Yukarıdaki "3. İşçilik ve Malzeme Poz Satırı Ekle" alanından bu projeye ait pozları ekleyiniz.
              </p>
            </div>
          ) : (
            <>
              {/* MOBILE CARD VIEW FOR SMARTPHONES (Optimized for field usage) */}
              <div className="block md:hidden space-y-2.5">
                {stagedLines.map((line, idx) => (
                  <div key={line.tempId} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-xs">
                          Poz {line.iscilikPoz}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteStagedLine(line.tempId)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition cursor-pointer min-h-[36px]"
                        title="Hatalı poz satırını listeden sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Pozu Sil</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-800 font-medium leading-snug">
                      {line.iscilikAciklama}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
                      <span className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded-md font-bold">
                        İş: {line.iscilikMiktar} {line.iscilikBirim}
                      </span>

                      {line.malzemePoz && (
                        <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-md font-medium text-[11px]">
                          📦 <strong className="font-mono font-bold">{line.malzemePoz}</strong> {line.malzemeAdi} ({line.malzemeMiktar} {line.malzemeBirim})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP TABLE VIEW */}
              <div className="hidden md:block overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-2xs">
                <table className="w-full text-left text-xs text-slate-700 border-collapse">
                  <thead className="bg-slate-900 text-white text-[11px] uppercase font-bold">
                    <tr>
                      <th className="py-2.5 px-3 w-8 text-center">#</th>
                      <th className="py-2.5 px-3">İşçilik Pozu</th>
                      <th className="py-2.5 px-3">İş Açıklaması</th>
                      <th className="py-2.5 px-3 text-right">İş Miktarı</th>
                      <th className="py-2.5 px-3">Birim</th>
                      <th className="py-2.5 px-3">Malzeme Pozu</th>
                      <th className="py-2.5 px-3">Malzeme Adı</th>
                      <th className="py-2.5 px-3 text-right">M.Miktar</th>
                      <th className="py-2.5 px-3">Birim</th>
                      <th className="py-2.5 px-3 text-center bg-rose-900/90 text-white">Hata / Sil</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {stagedLines.map((line, idx) => (
                      <tr key={line.tempId} className="hover:bg-blue-50/50 transition group">
                        <td className="py-2 px-3 text-center font-mono text-slate-400 font-bold">{idx + 1}</td>
                        <td className="py-2 px-3 font-bold text-emerald-700 whitespace-nowrap font-mono">{line.iscilikPoz}</td>
                        <td className="py-2 px-3 text-slate-800 leading-tight">{line.iscilikAciklama}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">{line.iscilikMiktar}</td>
                        <td className="py-2 px-3 text-slate-500">{line.iscilikBirim}</td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          {line.malzemePoz ? (
                            <span className="font-mono font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded text-[11px]">
                              {line.malzemePoz}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-700 leading-tight">
                          {line.malzemeAdi || '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-semibold text-slate-800">
                          {line.malzemeMiktar || '-'}
                        </td>
                        <td className="py-2 px-3 text-slate-500">{line.malzemeBirim || '-'}</td>

                        {/* Senkronizasyon Öncesi Silme Butonu */}
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteStagedLine(line.tempId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600 text-[11px] font-bold transition shadow-2xs group-hover:scale-102 cursor-pointer"
                            title="Bu hatalı poz satırını senkronizasyondan önce sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Sil</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* FINAL SUBMIT BUTTON: Save and Sync to Google Sheets */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
            <div className="text-xs text-slate-600 space-y-0.5">
              <div className="flex flex-wrap items-center gap-1.5 font-bold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Proje: {projeAdi || 'Belirtilmedi'} • ID: {isSheff ? (projeID || '-') : 'Sheff Atayacak'}
                  {isSheff && projeTipi ? ` (${projeTipi})` : ''} • {santral || 'Santral'} • Kutu {kutu || '-'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Fotoğraflar ve GPS konumu, listedeki <strong>{stagedLines.length} poz satırına</strong> birlikte işlenecektir.
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinalSaveAndSync}
              disabled={stagedLines.length === 0}
              className={`w-full sm:w-auto min-h-[50px] justify-center flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm shadow-lg transition active:scale-98 ${
                stagedLines.length > 0
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-blue-600/30 cursor-pointer'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
              <span>Tüm Pozları ({stagedLines.length} Satır) Kaydet & Senkronize Et</span>
            </button>
          </div>
        </div>
      </div>

      {/* Camera Capture Modal */}
      {cameraTarget && (
        <CameraCaptureModal
          isOpen={Boolean(cameraTarget)}
          onClose={() => setCameraTarget(null)}
          onCapture={(dataUrl) => {
            const display = getImageSizeDisplay(dataUrl);
            if (cameraTarget === 'before') {
              setBeforePhoto(dataUrl);
              setBeforePhotoInfo({
                sizeFormatted: `${display.sizeFormatted} (~1MB Optimize)`
              });
              showNotification(`📸 Öncesi fotoğrafı kameradan kaydedildi (${display.sizeFormatted})`, 'success');
            } else {
              setAfterPhoto(dataUrl);
              setAfterPhotoInfo({
                sizeFormatted: `${display.sizeFormatted} (~1MB Optimize)`
              });
              showNotification(`📸 Sonrası fotoğrafı kameradan kaydedildi (${display.sizeFormatted})`, 'success');
            }
          }}
          title={cameraTarget === 'before' ? 'Çalışma Öncesi Fotoğrafı Çek' : 'Çalışma Sonrası Fotoğrafı Çek'}
        />
      )}
    </div>
  );
}
