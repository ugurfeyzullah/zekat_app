import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import './App.css';
import { getRates } from './services/currencyService';
import { getDatedRates, getTodayDateString, normalizeRequestedRateDate } from './services/datedRatesService';
import cloudSyncService from './services/cloudSyncService';
import { parseZakatExcelMatrix } from './utils/excelImport';

const STORAGE_KEY = 'zakat_tracker_simple_board_v3';
const SAVEBACK_KEY = 'zakat_tracker_simple_board_saveback_v1';
const AUTO_REFRESH_INTERVAL_MS = 15 * 60 * 1000;
const CLOUD_SYNC_DEBOUNCE_MS = 1500;
const ZAKAT_RATE = 0.025;
const NISAB_GOLD_GRAMS = 87.48;
const TROY_OUNCE_GRAMS = 31.1034768;

const ISLAMIC_MONTHS = [
  { en: 'Muharram', tr: 'Muharrem', ar: 'المحرم' },
  { en: 'Safar', tr: 'Safer', ar: 'صفر' },
  { en: "Rabi' al-Awwal", tr: 'Rebiulevvel', ar: 'ربيع الأول' },
  { en: "Rabi' al-Thani", tr: 'Rebiulahir', ar: 'ربيع الآخر' },
  { en: 'Jumada al-Awwal', tr: 'Cemaziyelevvel', ar: 'جمادى الأولى' },
  { en: 'Jumada al-Thani', tr: 'Cemaziyelahir', ar: 'جمادى الآخرة' },
  { en: 'Rajab', tr: 'Recep', ar: 'رجب' },
  { en: "Sha'ban", tr: 'Saban', ar: 'شعبان' },
  { en: 'Ramadan', tr: 'Ramazan', ar: 'رمضان' },
  { en: 'Shawwal', tr: 'Sevval', ar: 'شوال' },
  { en: "Dhu al-Qi'dah", tr: 'Zilkade', ar: 'ذو القعدة' },
  { en: 'Dhu al-Hijjah', tr: 'Zilhicce', ar: 'ذو الحجة' }
];

const WEALTH_TYPE_OPTIONS = [
  { key: 'BASE_CASH', kind: 'currency', currency: 'BASE' },
  { key: 'EUR_CASH', kind: 'currency', currency: 'EUR' },
  { key: 'USD_CASH', kind: 'currency', currency: 'USD' },
  { key: 'TRY_CASH', kind: 'currency', currency: 'TRY' },
  { key: 'GBP_CASH', kind: 'currency', currency: 'GBP' },
  { key: 'AED_CASH', kind: 'currency', currency: 'AED' },
  { key: 'SAR_CASH', kind: 'currency', currency: 'SAR' },
  { key: 'GOLD_GRAMS', kind: 'metal', metal: 'gold' },
  { key: 'SILVER_GRAMS', kind: 'metal', metal: 'silver' }
];

const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'ar', label: 'العربية' }
];

const TRANSLATIONS = {
  en: {
    appTitle: 'Zakat Tracker',
    appSubtitle: 'Simplified yearly Zakat board with base currency, Nisab, and payment tracking.',
    tabZakat: 'Zakat Board',
    tabCalendar: 'Islamic Calendar',
    settings: 'Settings',
    language: 'Language',
    baseCurrency: 'Base currency',
    zakatMonth: 'Zakat month (Hijri)',
    refreshRates: 'Refresh Rates',
    refreshing: 'Refreshing...',
    importExcel: 'Import Excel (.xlsx / .xls / .csv)',
    activeCycle: 'Active cycle',
    rateSource: 'Rate source',
    lastUpdate: 'Last update',
    notUpdatedYet: 'not updated yet',
    missingConversionFor: 'Missing conversion for:',
    wealthEntries: '1) Wealth Entries (by type)',
    addWealthRow: 'Add Wealth Row',
    type: 'Type',
    amount: 'Amount',
    converted: 'Converted',
    note: 'Note',
    optional: 'Optional',
    delete: 'Delete',
    missingRate: 'Missing rate',
    payments: '2) Payments (Current Zakat Year)',
    addPaymentRow: 'Add Payment Row',
    paidTo: 'Paid to',
    date: 'Date',
    currency: 'Currency',
    personInstitution: 'Person / institution',
    noPaymentsInCycle: 'No payment rows in this cycle yet. Use "Add Payment Row".',
    summary: '3) Summary',
    totalWealth: 'Total wealth',
    nisabThreshold: 'Nisab threshold (87.48g gold)',
    nisabUnavailable: 'Nisab unavailable',
    nisabStatus: 'Nisab status',
    nisabMet: 'Nisab met',
    belowNisab: 'Below Nisab',
    zakatDuty: 'Zakat duty this year (2.5%)',
    carryFromPrevYear: 'Carry from previous year',
    totalPaidThisYear: 'Total paid this year',
    remainingToPay: 'Remaining to pay',
    overpaidExtra: 'Overpaid / extra',
    calendarTitle: 'Islamic Calendar',
    todayHijri: 'Today (Hijri):',
    zakatMonthBadge: 'Zakat Month',
    sourceBackend: 'Backend API',
    sourceDirect: 'Online provider',
    sourceCache: 'Local cache',
    sourceUnknown: 'Unknown',
    rateUnavailable: 'Online rates are unavailable right now.',
    hijriDateUnavailable: 'Hijri date unavailable.',
    yearRolledNoCarry: 'Zakat year rolled over. No unpaid amount was carried.',
    yearRolledCarry: (amount, currency) =>
      `Zakat year rolled over. ${amount.toFixed(2)} ${currency} carried to the new year.`,
    importingFile: (name) => `Importing ${name} ...`,
    importNoWorksheet: 'Excel file does not contain any worksheet.',
    importedFromExcel: 'Imported from Excel',
    warningsPrefix: 'Warnings',
    importedSummary: (wealthCount, paymentCount, fileName, warningMessage) =>
      `Imported ${wealthCount} wealth rows and ${paymentCount} payment rows from ${fileName}.${warningMessage}`,
    importFailed: (message) => `Import failed: ${message}`,
    xauLabel: 'XAU (Gold grams)',
    wealthTypeLabels: {
      BASE_CASH: 'Cash (Base Currency)',
      EUR_CASH: 'Euro',
      USD_CASH: 'US Dollar',
      TRY_CASH: 'Turkish Lira',
      GBP_CASH: 'British Pound',
      AED_CASH: 'UAE Dirham',
      SAR_CASH: 'Saudi Riyal',
      GOLD_GRAMS: 'Gold (grams)',
      SILVER_GRAMS: 'Silver (grams)'
    },
    cycleSuffixes: {
      hijri: 'Hijri',
      fallback: 'Fallback'
    }
  },
  tr: {
    appTitle: 'Zekat Takip',
    appSubtitle: 'Temel para birimi, nisap ve ödeme takibi için sadeleştirilmiş yıllık zekat panosu.',
    tabZakat: 'Zekat Panosu',
    tabCalendar: 'Hicri Takvim',
    settings: 'Ayarlar',
    language: 'Dil',
    baseCurrency: 'Temel para birimi',
    zakatMonth: 'Zekat ayı (Hicri)',
    refreshRates: 'Kurları Yenile',
    refreshing: 'Yenileniyor...',
    importExcel: 'Excel içe aktar (.xlsx / .xls / .csv)',
    activeCycle: 'Aktif dönem',
    rateSource: 'Kur kaynağı',
    lastUpdate: 'Son güncelleme',
    notUpdatedYet: 'henüz güncellenmedi',
    missingConversionFor: 'Eksik dönüşüm:',
    wealthEntries: '1) Varlık Kayıtları (türe göre)',
    addWealthRow: 'Varlık Satırı Ekle',
    type: 'Tür',
    amount: 'Tutar',
    converted: 'Çevrilen',
    note: 'Not',
    optional: 'İsteğe bağlı',
    delete: 'Sil',
    missingRate: 'Kur yok',
    payments: '2) Ödemeler (Mevcut Zekat Yılı)',
    addPaymentRow: 'Ödeme Satırı Ekle',
    paidTo: 'Ödenen kişi/kurum',
    date: 'Tarih',
    currency: 'Para birimi',
    personInstitution: 'Kişi / kurum',
    noPaymentsInCycle: 'Bu dönemde henüz ödeme satırı yok. "Ödeme Satırı Ekle" kullanın.',
    summary: '3) Özet',
    totalWealth: 'Toplam varlık',
    nisabThreshold: 'Nisap eşiği (87.48g altın)',
    nisabUnavailable: 'Nisap kullanılamıyor',
    nisabStatus: 'Nisap durumu',
    nisabMet: 'Nisap aşıldı',
    belowNisab: 'Nisap altında',
    zakatDuty: 'Bu yıl zekat borcu (%2.5)',
    carryFromPrevYear: 'Önceki yıldan devir',
    totalPaidThisYear: 'Bu yıl toplam ödeme',
    remainingToPay: 'Kalan ödeme',
    overpaidExtra: 'Fazla ödeme',
    calendarTitle: 'Hicri Takvim',
    todayHijri: 'Bugün (Hicri):',
    zakatMonthBadge: 'Zekat Ayı',
    sourceBackend: 'Sunucu API',
    sourceDirect: 'Çevrimiçi sağlayıcı',
    sourceCache: 'Yerel önbellek',
    sourceUnknown: 'Bilinmiyor',
    rateUnavailable: 'Çevrimiçi kurlar şu anda alınamıyor.',
    hijriDateUnavailable: 'Hicri tarih kullanılamıyor.',
    yearRolledNoCarry: 'Zekat yılı devredildi. Taşınacak borç kalmadı.',
    yearRolledCarry: (amount, currency) =>
      `Zekat yılı devredildi. ${amount.toFixed(2)} ${currency} yeni yıla taşındı.`,
    importingFile: (name) => `${name} içe aktarılıyor ...`,
    importNoWorksheet: 'Excel dosyasında herhangi bir çalışma sayfası yok.',
    importedFromExcel: 'Excel dosyasından aktarıldı',
    warningsPrefix: 'Uyarılar',
    importedSummary: (wealthCount, paymentCount, fileName, warningMessage) =>
      `${fileName} dosyasından ${wealthCount} varlık satırı ve ${paymentCount} ödeme satırı aktarıldı.${warningMessage}`,
    importFailed: (message) => `İçe aktarma başarısız: ${message}`,
    xauLabel: 'XAU (Altın gram)',
    wealthTypeLabels: {
      BASE_CASH: 'Nakit (Temel Para Birimi)',
      EUR_CASH: 'Euro',
      USD_CASH: 'Amerikan Doları',
      TRY_CASH: 'Türk Lirası',
      GBP_CASH: 'İngiliz Sterlini',
      AED_CASH: 'BAE Dirhemi',
      SAR_CASH: 'Suudi Riyali',
      GOLD_GRAMS: 'Altın (gram)',
      SILVER_GRAMS: 'Gümüş (gram)'
    },
    cycleSuffixes: {
      hijri: 'Hicri',
      fallback: 'Yedek'
    }
  },
  ar: {
    appTitle: 'متابع الزكاة',
    appSubtitle: 'لوحة زكاة سنوية مبسطة مع العملة الأساسية والنصاب وتتبع الدفعات.',
    tabZakat: 'لوحة الزكاة',
    tabCalendar: 'التقويم الهجري',
    settings: 'الإعدادات',
    language: 'اللغة',
    baseCurrency: 'العملة الأساسية',
    zakatMonth: 'شهر الزكاة (هجري)',
    refreshRates: 'تحديث الأسعار',
    refreshing: 'جارٍ التحديث...',
    importExcel: 'استيراد إكسل (.xlsx / .xls / .csv)',
    activeCycle: 'الدورة الحالية',
    rateSource: 'مصدر السعر',
    lastUpdate: 'آخر تحديث',
    notUpdatedYet: 'لم يتم التحديث بعد',
    missingConversionFor: 'تحويل مفقود لـ:',
    wealthEntries: '1) إدخالات الثروة (حسب النوع)',
    addWealthRow: 'إضافة صف ثروة',
    type: 'النوع',
    amount: 'المبلغ',
    converted: 'المحوّل',
    note: 'ملاحظة',
    optional: 'اختياري',
    delete: 'حذف',
    missingRate: 'سعر مفقود',
    payments: '2) الدفعات (سنة الزكاة الحالية)',
    addPaymentRow: 'إضافة صف دفعة',
    paidTo: 'المدفوع له',
    date: 'التاريخ',
    currency: 'العملة',
    personInstitution: 'شخص / جهة',
    noPaymentsInCycle: 'لا توجد دفعات في هذه الدورة بعد. استخدم "إضافة صف دفعة".',
    summary: '3) الملخص',
    totalWealth: 'إجمالي الثروة',
    nisabThreshold: 'حد النصاب (87.48 غرام ذهب)',
    nisabUnavailable: 'النصاب غير متوفر',
    nisabStatus: 'حالة النصاب',
    nisabMet: 'تم بلوغ النصاب',
    belowNisab: 'أقل من النصاب',
    zakatDuty: 'زكاة هذا العام (2.5%)',
    carryFromPrevYear: 'المرحّل من العام السابق',
    totalPaidThisYear: 'إجمالي المدفوع هذا العام',
    remainingToPay: 'المتبقي للدفع',
    overpaidExtra: 'مدفوع زائد',
    calendarTitle: 'التقويم الهجري',
    todayHijri: 'اليوم (هجري):',
    zakatMonthBadge: 'شهر الزكاة',
    sourceBackend: 'واجهة الخادم',
    sourceDirect: 'مزود عبر الإنترنت',
    sourceCache: 'ذاكرة محلية',
    sourceUnknown: 'غير معروف',
    rateUnavailable: 'الأسعار عبر الإنترنت غير متاحة الآن.',
    hijriDateUnavailable: 'التاريخ الهجري غير متاح.',
    yearRolledNoCarry: 'تم ترحيل سنة الزكاة. لا يوجد مبلغ غير مدفوع تم نقله.',
    yearRolledCarry: (amount, currency) =>
      `تم ترحيل سنة الزكاة. تم نقل ${amount.toFixed(2)} ${currency} إلى السنة الجديدة.`,
    importingFile: (name) => `جارٍ استيراد ${name} ...`,
    importNoWorksheet: 'ملف إكسل لا يحتوي على أي ورقة عمل.',
    importedFromExcel: 'تم الاستيراد من إكسل',
    warningsPrefix: 'تحذيرات',
    importedSummary: (wealthCount, paymentCount, fileName, warningMessage) =>
      `تم استيراد ${wealthCount} صف ثروة و${paymentCount} صف دفعة من ${fileName}.${warningMessage}`,
    importFailed: (message) => `فشل الاستيراد: ${message}`,
    xauLabel: 'XAU (غرام ذهب)',
    wealthTypeLabels: {
      BASE_CASH: 'نقد (العملة الأساسية)',
      EUR_CASH: 'يورو',
      USD_CASH: 'دولار أمريكي',
      TRY_CASH: 'ليرة تركية',
      GBP_CASH: 'جنيه إسترليني',
      AED_CASH: 'درهم إماراتي',
      SAR_CASH: 'ريال سعودي',
      GOLD_GRAMS: 'ذهب (غرام)',
      SILVER_GRAMS: 'فضة (غرام)'
    },
    cycleSuffixes: {
      hijri: 'هجري',
      fallback: 'احتياطي'
    }
  }
};

const PAYMENT_CURRENCY_OPTIONS = ['EUR', 'USD', 'TRY', 'GBP', 'AED', 'SAR', 'PKR', 'INR', 'CAD', 'AUD', 'XAU'];
const DEFAULT_BASE_CURRENCY = 'EUR';
const BASE_CURRENCY_OPTIONS = PAYMENT_CURRENCY_OPTIONS.filter((currencyCode) => currencyCode !== 'XAU');

const QUICK_PANEL = {
  ACCOUNT: 'account',
  SETTINGS: 'settings'
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeBaseCurrency = (value) => {
  const normalized = String(value || '').trim().toUpperCase();
  return BASE_CURRENCY_OPTIONS.includes(normalized) ? normalized : DEFAULT_BASE_CURRENCY;
};

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const getHijriInfo = () => {
  try {
    const parts = new Intl.DateTimeFormat('en-u-ca-islamic', {
      month: 'numeric',
      year: 'numeric'
    }).formatToParts(new Date());

    const month = parseInt(parts.find((part) => part.type === 'month')?.value || '', 10);
    const year = parseInt(parts.find((part) => part.type === 'year')?.value || '', 10);

    if (!Number.isFinite(month) || !Number.isFinite(year)) {
      return null;
    }

    return { month, year };
  } catch (error) {
    return null;
  }
};

const normalizeLanguage = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  return LANGUAGE_OPTIONS.some((option) => option.code === normalized) ? normalized : 'en';
};

const getMonthName = (monthNumber, language = 'en') => {
  const month = ISLAMIC_MONTHS[monthNumber - 1];
  if (!month) {
    return '';
  }
  return month[language] || month.en;
};

const getHijriLocale = (language = 'en') => {
  if (language === 'tr') {
    return 'tr-TR-u-ca-islamic';
  }
  if (language === 'ar') {
    return 'ar-SA-u-ca-islamic';
  }
  return 'en-US-u-ca-islamic';
};

const getUiLocale = (language = 'en') => {
  if (language === 'tr') {
    return 'tr-TR';
  }
  if (language === 'ar') {
    return 'ar-SA';
  }
  return 'en-US';
};

const getHijriDateText = (language = 'en') => {
  try {
    return new Intl.DateTimeFormat(getHijriLocale(language), {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date());
  } catch (error) {
    return TRANSLATIONS[language]?.hijriDateUnavailable || TRANSLATIONS.en.hijriDateUnavailable;
  }
};

const getWealthType = (typeKey) =>
  WEALTH_TYPE_OPTIONS.find((option) => option.key === typeKey) || WEALTH_TYPE_OPTIONS[0];

const buildCycleMeta = (zakatMonth, language = 'en') => {
  const translations = TRANSLATIONS[language] || TRANSLATIONS.en;
  const monthLabel = getMonthName(zakatMonth, language);
  const hijri = getHijriInfo();
  if (hijri?.month && hijri?.year) {
    const startYear = hijri.month >= zakatMonth ? hijri.year : hijri.year - 1;
    return {
      key: `H-${startYear}-${zakatMonth}`,
      label: `${monthLabel} ${startYear} / ${startYear + 1} (${translations.cycleSuffixes.hijri})`
    };
  }

  const now = new Date();
  const startYear = now.getMonth() + 1 >= zakatMonth ? now.getFullYear() : now.getFullYear() - 1;
  return {
    key: `G-${startYear}-${zakatMonth}`,
    label: `${monthLabel} ${startYear} / ${startYear + 1} (${translations.cycleSuffixes.fallback})`
  };
};

const createWealthRow = (overrides = {}) => ({
  id: createId(),
  type: 'BASE_CASH',
  amount: '',
  note: '',
  ...overrides
});

const normalizePaymentDate = (dateText) => normalizeRequestedRateDate(dateText);
const buildPaymentRateMapKey = (baseCurrency, dateText) => `${baseCurrency}:${dateText}`;

const createPaymentRow = (cycleKey, overrides = {}) => ({
  id: createId(),
  cycleKey,
  paidTo: '',
  date: getTodayDateString(),
  amount: '',
  currency: 'EUR',
  ...overrides
});

const scrollContainerToBottom = (container) => {
  if (!container) {
    return;
  }
  container.scrollTop = container.scrollHeight;
};

const isPlainObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

const isValidStateSnapshot = (state) => {
  if (!isPlainObject(state)) {
    return false;
  }

  if (!Array.isArray(state.wealthRows)) {
    return false;
  }

  if (!Array.isArray(state.paymentRows)) {
    return false;
  }

  return true;
};

const readStorageSnapshot = (storageKey) => {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return isValidStateSnapshot(parsed) ? parsed : null;
  } catch (error) {
    return null;
  }
};

const writeStorageSnapshot = (storageKey, snapshot) => {
  if (!isValidStateSnapshot(snapshot)) {
    return false;
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(snapshot));
    return true;
  } catch (error) {
    return false;
  }
};

const readSavedState = () => {
  const primary = readStorageSnapshot(STORAGE_KEY);
  if (primary) {
    return primary;
  }

  const backup = readStorageSnapshot(SAVEBACK_KEY);
  if (backup) {
    return backup;
  }

  return null;
};

const saveSavebackSnapshot = (snapshot) => {
  if (!writeStorageSnapshot(SAVEBACK_KEY, snapshot)) {
    return null;
  }
  return snapshot;
};

const normalizeActiveTab = (value) => (value === 'calendar' ? 'calendar' : 'zakat');
const isValidZakatMonth = (value) => {
  const numeric = toNumber(value);
  return numeric >= 1 && numeric <= 12;
};

const normalizeBoardState = (state) => {
  const source = isPlainObject(state) ? state : {};
  const language = normalizeLanguage(source.language);
  const zakatMonth = isValidZakatMonth(source.zakatMonth) ? toNumber(source.zakatMonth) : 9;
  const baseCurrency = normalizeBaseCurrency(source.baseCurrency);
  const fallbackCycleKey = buildCycleMeta(zakatMonth, language).key;
  const activeCycleKey =
    typeof source.activeCycleKey === 'string' && source.activeCycleKey.trim()
      ? source.activeCycleKey.trim()
      : fallbackCycleKey;

  const wealthRows =
    Array.isArray(source.wealthRows) && source.wealthRows.length > 0
      ? source.wealthRows
      : [createWealthRow()];

  const paymentRowsSource =
    Array.isArray(source.paymentRows) && source.paymentRows.length > 0
      ? source.paymentRows
      : [createPaymentRow(activeCycleKey)];

  const paymentRows = paymentRowsSource.map((row) => ({
    ...row,
    cycleKey: row.cycleKey || activeCycleKey
  }));

  return {
    activeTab: normalizeActiveTab(source.activeTab),
    language,
    baseCurrency,
    zakatMonth,
    rates: source.rates || null,
    rateSource: source.rateSource || '',
    lastRateUpdate: source.lastRateUpdate || '',
    activeCycleKey,
    carryOverByCycle:
      source.carryOverByCycle && typeof source.carryOverByCycle === 'object'
        ? source.carryOverByCycle
        : {},
    wealthRows,
    paymentRows
  };
};

function App() {
  const savedState = useMemo(() => readSavedState(), []);
  const normalizedSavedState = useMemo(() => normalizeBoardState(savedState), [savedState]);
  const initialCloudSession = useMemo(() => cloudSyncService.getSession(), []);
  const initialCycleMeta = useMemo(
    () => buildCycleMeta(normalizedSavedState.zakatMonth, normalizedSavedState.language),
    [normalizedSavedState.language, normalizedSavedState.zakatMonth]
  );

  const [activeTab, setActiveTab] = useState(normalizedSavedState.activeTab);
  const [openQuickPanel, setOpenQuickPanel] = useState(null);
  const [language, setLanguage] = useState(normalizedSavedState.language);
  const [baseCurrency, setBaseCurrency] = useState(normalizedSavedState.baseCurrency);
  const [zakatMonth, setZakatMonth] = useState(normalizedSavedState.zakatMonth);
  const [rates, setRates] = useState(normalizedSavedState.rates);
  const [rateSource, setRateSource] = useState(normalizedSavedState.rateSource);
  const [lastRateUpdate, setLastRateUpdate] = useState(normalizedSavedState.lastRateUpdate);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState('');
  const [activeCycleKey, setActiveCycleKey] = useState(normalizedSavedState.activeCycleKey || initialCycleMeta.key);
  const [carryOverByCycle, setCarryOverByCycle] = useState(normalizedSavedState.carryOverByCycle);
  const [yearNote, setYearNote] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const [importStatusLevel, setImportStatusLevel] = useState('info');
  const [wealthRows, setWealthRows] = useState(normalizedSavedState.wealthRows);
  const [paymentRows, setPaymentRows] = useState(normalizedSavedState.paymentRows);
  const [paymentDateRates, setPaymentDateRates] = useState({});
  const quickPanelRef = useRef(null);
  const wealthTableWrapRef = useRef(null);
  const paymentTableWrapRef = useRef(null);
  const previousWealthRowCountRef = useRef(0);
  const previousPaymentRowCountRef = useRef(0);
  const [cloudSession, setCloudSession] = useState(initialCloudSession);
  const [accountUsername, setAccountUsername] = useState(initialCloudSession?.username || '');
  const [accountPassword, setAccountPassword] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [cloudBootstrapInProgress, setCloudBootstrapInProgress] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState(
    initialCloudSession?.token
      ? `Signed in as ${initialCloudSession.username}.`
      : 'Local-only mode. Sign in to sync across devices.'
  );
  const [cloudSyncStatusLevel, setCloudSyncStatusLevel] = useState('info');
  const skipNextCloudSaveRef = useRef(false);

  const t = useMemo(() => TRANSLATIONS[language] || TRANSLATIONS.en, [language]);
  const isRtl = language === 'ar';
  const normalizedBaseCurrency = normalizeBaseCurrency(baseCurrency);
  const cycleMeta = useMemo(() => buildCycleMeta(zakatMonth, language), [language, zakatMonth]);
  const persistedState = useMemo(
    () => ({
      activeTab,
      language,
      baseCurrency: normalizedBaseCurrency,
      zakatMonth,
      rates,
      rateSource,
      lastRateUpdate,
      activeCycleKey,
      carryOverByCycle,
      wealthRows,
      paymentRows
    }),
    [
      activeTab,
      language,
      normalizedBaseCurrency,
      zakatMonth,
      rates,
      rateSource,
      lastRateUpdate,
      activeCycleKey,
      carryOverByCycle,
      wealthRows,
      paymentRows
    ]
  );
  const persistedStateRef = useRef(persistedState);

  useEffect(() => {
    persistedStateRef.current = persistedState;
  }, [persistedState]);

  const toggleQuickPanel = useCallback((panelKey) => {
    setOpenQuickPanel((previous) => (previous === panelKey ? null : panelKey));
  }, []);

  const closeQuickPanel = useCallback(() => {
    setOpenQuickPanel(null);
  }, []);

  const applyCloudState = useCallback((nextState) => {
    const normalizedState = normalizeBoardState(nextState);
    setActiveTab(normalizedState.activeTab);
    setLanguage(normalizedState.language);
    setBaseCurrency(normalizedState.baseCurrency);
    setZakatMonth(normalizedState.zakatMonth);
    setRates(normalizedState.rates);
    setRateSource(normalizedState.rateSource);
    setLastRateUpdate(normalizedState.lastRateUpdate);
    setActiveCycleKey(normalizedState.activeCycleKey);
    setCarryOverByCycle(normalizedState.carryOverByCycle);
    setWealthRows(normalizedState.wealthRows);
    setPaymentRows(normalizedState.paymentRows);
  }, []);

  const handleCloudUnauthorized = useCallback(() => {
    cloudSyncService.clearSession();
    setCloudSession(null);
    setAccountPassword('');
    setCloudSyncStatus('Cloud session expired. Switched to local-only mode.');
    setCloudSyncStatusLevel('warning');
  }, []);

  useEffect(() => {
    writeStorageSnapshot(STORAGE_KEY, persistedState);
    saveSavebackSnapshot(persistedState);
  }, [persistedState]);

  const handleRestoreSaveback = useCallback(() => {
    const snapshot = readStorageSnapshot(SAVEBACK_KEY);
    if (!snapshot) {
      setCloudSyncStatus('No safe backup snapshot found yet.');
      setCloudSyncStatusLevel('warning');
      return;
    }

    skipNextCloudSaveRef.current = true;
    applyCloudState(snapshot);
    setCloudSyncStatus('Last safe snapshot restored.');
    setCloudSyncStatusLevel('info');
    closeQuickPanel();
  }, [applyCloudState, closeQuickPanel]);

  useEffect(() => {
    if (!openQuickPanel) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeQuickPanel();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [closeQuickPanel, openQuickPanel]);

  useEffect(() => {
    if (!openQuickPanel) {
      return undefined;
    }

    if (!window.matchMedia('(max-width: 768px)').matches) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [openQuickPanel]);

  useEffect(() => {
    if (!cloudSession?.token) {
      return undefined;
    }

    let cancelled = false;

    const pullCloudState = async () => {
      setCloudBootstrapInProgress(true);
      setCloudSyncStatus(`Signed in as ${cloudSession.username}. Syncing latest cloud state...`);
      setCloudSyncStatusLevel('info');

      try {
        saveSavebackSnapshot(persistedStateRef.current);
        const result = await cloudSyncService.getState();
        if (cancelled) {
          return;
        }

        if (result?.state) {
          if (!isValidStateSnapshot(result.state)) {
            const backup = readStorageSnapshot(SAVEBACK_KEY);
            if (backup) {
              skipNextCloudSaveRef.current = true;
              applyCloudState(backup);
              setCloudSyncStatus('Invalid cloud data detected. Last safe snapshot restored.');
              setCloudSyncStatusLevel('warning');
              return;
            }

            setCloudSyncStatus('Cloud data is invalid and no backup is available. Keeping local data.');
            setCloudSyncStatusLevel('warning');
            return;
          }

          skipNextCloudSaveRef.current = true;
          applyCloudState(result.state);
          setCloudSyncStatus(
            result.updatedAt ? `Cloud state downloaded (${result.updatedAt}).` : 'Cloud state downloaded.'
          );
          setCloudSyncStatusLevel('info');
        } else {
          await cloudSyncService.saveState(persistedStateRef.current);
          if (cancelled) {
            return;
          }
          saveSavebackSnapshot(persistedStateRef.current);
          setCloudSyncStatus('No cloud state found. Uploaded local data.');
          setCloudSyncStatusLevel('info');
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error.code === 'unauthorized') {
          handleCloudUnauthorized();
          return;
        }

        setCloudSyncStatus('Cloud sync unavailable. Local data remains active.');
        setCloudSyncStatusLevel('warning');
      } finally {
        if (!cancelled) {
          setCloudBootstrapInProgress(false);
        }
      }
    };

    pullCloudState();

    return () => {
      cancelled = true;
    };
  }, [applyCloudState, cloudSession?.token, cloudSession?.username, handleCloudUnauthorized]);

  useEffect(() => {
    if (!cloudSession?.token || cloudBootstrapInProgress) {
      return undefined;
    }

    if (skipNextCloudSaveRef.current) {
      skipNextCloudSaveRef.current = false;
      return undefined;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      try {
        await cloudSyncService.saveState(persistedState);
        if (cancelled) {
          return;
        }
        saveSavebackSnapshot(persistedState);
        setCloudSyncStatus(`Cloud synced at ${new Date().toLocaleTimeString(getUiLocale(language))}.`);
        setCloudSyncStatusLevel('info');
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error.code === 'unauthorized') {
          handleCloudUnauthorized();
          return;
        }

        setCloudSyncStatus('Cloud save failed. Keeping local-only data.');
        setCloudSyncStatusLevel('warning');
      }
    }, CLOUD_SYNC_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [cloudBootstrapInProgress, cloudSession?.token, handleCloudUnauthorized, language, persistedState]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [isRtl, language]);

  const fetchRates = useCallback(
    async ({ forceRefresh = false } = {}) => {
      setRateLoading(true);
      setRateError('');

      try {
        const result = await getRates(normalizedBaseCurrency, { forceRefresh });
        setRates(result.rates);
        setRateSource(result.source);
        setLastRateUpdate(new Date().toLocaleString(getUiLocale(language)));
      } catch (error) {
        setRateError(t.rateUnavailable);
      } finally {
        setRateLoading(false);
      }
    },
    [language, normalizedBaseCurrency, t.rateUnavailable]
  );

  useEffect(() => {
    fetchRates({ forceRefresh: false });
  }, [fetchRates]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      fetchRates({ forceRefresh: true });
    }, AUTO_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [fetchRates]);

  const convertCurrencyAmountWithRates = useCallback(
    (amount, sourceCurrency, activeRates) => {
      const amountValue = toNumber(amount);
      if (amountValue <= 0) {
        return 0;
      }

      const currencyCode = String(sourceCurrency || '').trim().toUpperCase();
      if (!currencyCode) {
        return amountValue;
      }

      // Treat precious metals in payment rows as grams so values like 0.5 Altin
      // convert correctly even when the FX feed doesn't include XAU/XAG.
      if (currencyCode === 'XAU' || currencyCode === 'XAG') {
        if (currencyCode === normalizedBaseCurrency) {
          return amountValue;
        }

        const fallbackUsdPerGram = currencyCode === 'XAU' ? 65 : 0.8;
        const commodityRate = toNumber(activeRates?.[currencyCode]);
        if (commodityRate > 0) {
          const oneOunceInBase = 1 / commodityRate;
          const pricePerGramInBase = oneOunceInBase / TROY_OUNCE_GRAMS;
          return amountValue * pricePerGramInBase;
        }

        if (normalizedBaseCurrency === 'USD') {
          return amountValue * fallbackUsdPerGram;
        }

        const usdRate = toNumber(activeRates?.USD);
        if (usdRate > 0) {
          return amountValue * (fallbackUsdPerGram / usdRate);
        }

        return null;
      }

      if (currencyCode === normalizedBaseCurrency) {
        return amountValue;
      }

      const quoteRate = toNumber(activeRates?.[currencyCode]);
      if (quoteRate <= 0) {
        return null;
      }

      return amountValue / quoteRate;
    },
    [normalizedBaseCurrency]
  );

  const convertCurrencyAmount = useCallback(
    (amount, sourceCurrency) => convertCurrencyAmountWithRates(amount, sourceCurrency, rates),
    [convertCurrencyAmountWithRates, rates]
  );

  const getMetalPricePerGramInBase = useCallback(
    (metalCode, fallbackUsdPerGram) => {
      const commodityRate = toNumber(rates?.[metalCode]);
      if (commodityRate > 0) {
        const oneOunceInBase = 1 / commodityRate;
        return oneOunceInBase / TROY_OUNCE_GRAMS;
      }

      if (normalizedBaseCurrency === 'USD') {
        return fallbackUsdPerGram;
      }

      const usdRate = toNumber(rates?.USD);
      if (usdRate > 0) {
        return fallbackUsdPerGram / usdRate;
      }

      return null;
    },
    [normalizedBaseCurrency, rates]
  );

  const goldPricePerGramInBase = useMemo(
    () => getMetalPricePerGramInBase('XAU', 65),
    [getMetalPricePerGramInBase]
  );
  const silverPricePerGramInBase = useMemo(
    () => getMetalPricePerGramInBase('XAG', 0.8),
    [getMetalPricePerGramInBase]
  );
  const getWealthTypeLabel = useCallback(
    (typeKey) => t.wealthTypeLabels[typeKey] || typeKey,
    [t.wealthTypeLabels]
  );

  const wealthComputedRows = useMemo(
    () =>
      wealthRows.map((row) => {
        const option = getWealthType(row.type);
        const typeLabel = getWealthTypeLabel(option.key);
        const amountValue = toNumber(row.amount);

        if (amountValue <= 0) {
          return { ...row, typeLabel, convertedAmount: 0, missingRate: false };
        }

        if (option.kind === 'currency') {
          const currencyCode = option.currency === 'BASE' ? normalizedBaseCurrency : option.currency;
          const convertedAmount = convertCurrencyAmount(amountValue, currencyCode);
          return {
            ...row,
            typeLabel,
            convertedAmount: convertedAmount || 0,
            missingRate: convertedAmount === null
          };
        }

        if (option.kind === 'metal') {
          const unitPrice = option.metal === 'gold' ? goldPricePerGramInBase : silverPricePerGramInBase;
          return {
            ...row,
            typeLabel,
            convertedAmount: unitPrice ? amountValue * unitPrice : 0,
            missingRate: unitPrice === null
          };
        }

        return { ...row, typeLabel, convertedAmount: 0, missingRate: true };
      }),
    [
      wealthRows,
      getWealthTypeLabel,
      normalizedBaseCurrency,
      convertCurrencyAmount,
      goldPricePerGramInBase,
      silverPricePerGramInBase
    ]
  );

  const paymentsForActiveCycle = useMemo(
    () => paymentRows.filter((row) => row.cycleKey === activeCycleKey),
    [paymentRows, activeCycleKey]
  );

  const paymentRateTargets = useMemo(() => {
    const uniqueDates = Array.from(new Set(paymentsForActiveCycle.map((row) => normalizePaymentDate(row.date))));
    return uniqueDates.map((dateText) => ({
      dateText,
      key: buildPaymentRateMapKey(normalizedBaseCurrency, dateText)
    }));
  }, [paymentsForActiveCycle, normalizedBaseCurrency]);

  useEffect(() => {
    const missingTargets = paymentRateTargets.filter((target) => !paymentDateRates[target.key]);
    if (missingTargets.length === 0) {
      return undefined;
    }

    let cancelled = false;

    Promise.all(
      missingTargets.map(async (target) => {
        try {
          const rateEntry = await getDatedRates(normalizedBaseCurrency, target.dateText);
          if (cancelled) {
            return;
          }

          setPaymentDateRates((previous) => {
            if (previous[target.key]) {
              return previous;
            }
            return {
              ...previous,
              [target.key]: rateEntry
            };
          });
        } catch (error) {
          if (cancelled) {
            return;
          }

          setPaymentDateRates((previous) => {
            if (previous[target.key]) {
              return previous;
            }
            return {
              ...previous,
              [target.key]: {
                rates: null,
                source: 'error',
                requestedDate: target.dateText
              }
            };
          });
        }
      })
    );

    return () => {
      cancelled = true;
    };
  }, [paymentRateTargets, paymentDateRates, normalizedBaseCurrency]);

  const paymentComputedRows = useMemo(
    () =>
      paymentsForActiveCycle.map((row) => {
        const rowDate = normalizePaymentDate(row.date);
        const rateKey = buildPaymentRateMapKey(normalizedBaseCurrency, rowDate);
        const rowDateRates = paymentDateRates[rateKey]?.rates || rates;
        const convertedAmount = convertCurrencyAmountWithRates(
          row.amount,
          row.currency || normalizedBaseCurrency,
          rowDateRates
        );
        return {
          ...row,
          convertedAmount: convertedAmount || 0,
          missingRate: convertedAmount === null
        };
      }),
    [paymentsForActiveCycle, normalizedBaseCurrency, paymentDateRates, rates, convertCurrencyAmountWithRates]
  );

  useEffect(() => {
    const currentRowCount = wealthComputedRows.length;
    if (currentRowCount <= previousWealthRowCountRef.current) {
      previousWealthRowCountRef.current = currentRowCount;
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      scrollContainerToBottom(wealthTableWrapRef.current);
    });
    previousWealthRowCountRef.current = currentRowCount;
    return () => window.cancelAnimationFrame(frameId);
  }, [wealthComputedRows.length]);

  useEffect(() => {
    const currentRowCount = paymentComputedRows.length;
    if (currentRowCount <= previousPaymentRowCountRef.current) {
      previousPaymentRowCountRef.current = currentRowCount;
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      scrollContainerToBottom(paymentTableWrapRef.current);
    });
    previousPaymentRowCountRef.current = currentRowCount;
    return () => window.cancelAnimationFrame(frameId);
  }, [paymentComputedRows.length, activeCycleKey]);

  const totalWealthInBase = useMemo(
    () => wealthComputedRows.reduce((sum, row) => sum + row.convertedAmount, 0),
    [wealthComputedRows]
  );

  const nisabThreshold = useMemo(() => {
    if (!goldPricePerGramInBase) {
      return 0;
    }
    return NISAB_GOLD_GRAMS * goldPricePerGramInBase;
  }, [goldPricePerGramInBase]);

  const nisabMet = nisabThreshold > 0 && totalWealthInBase >= nisabThreshold;
  const zakatDutyCurrentYear = nisabMet ? totalWealthInBase * ZAKAT_RATE : 0;

  const totalPaidCurrentCycle = useMemo(
    () => paymentComputedRows.reduce((sum, row) => sum + row.convertedAmount, 0),
    [paymentComputedRows]
  );

  const carryInAmount = toNumber(carryOverByCycle[activeCycleKey]);
  const totalDutyIncludingCarry = zakatDutyCurrentYear + carryInAmount;
  const remainingAmount = totalDutyIncludingCarry - totalPaidCurrentCycle;

  useEffect(() => {
    if (cycleMeta.key === activeCycleKey) {
      return;
    }

    const carryForward = Math.max(0, remainingAmount);
    if (carryForward > 0) {
      setCarryOverByCycle((previous) => {
        const existing = toNumber(previous[cycleMeta.key]);
        if (existing > 0) {
          return previous;
        }
        return {
          ...previous,
          [cycleMeta.key]: carryForward
        };
      });
      setYearNote(t.yearRolledCarry(carryForward, normalizedBaseCurrency));
    } else {
      setYearNote(t.yearRolledNoCarry);
    }

    setActiveCycleKey(cycleMeta.key);
  }, [cycleMeta.key, activeCycleKey, remainingAmount, normalizedBaseCurrency, t]);

  const missingRateItems = useMemo(() => {
    const missingWealth = wealthComputedRows.filter((row) => row.missingRate).map((row) => row.typeLabel);
    const missingPayments = paymentComputedRows
      .filter((row) => row.missingRate)
      .map((row) => (row.currency || '').toUpperCase());

    return Array.from(new Set([...missingWealth, ...missingPayments].filter(Boolean)));
  }, [wealthComputedRows, paymentComputedRows]);

  const sourceLabel = useMemo(() => {
    if (rateSource === 'server') {
      return t.sourceBackend;
    }
    if (rateSource === 'direct') {
      return t.sourceDirect;
    }
    if (rateSource === 'cache') {
      return t.sourceCache;
    }
    return t.sourceUnknown;
  }, [rateSource, t]);

  const formatMoney = (value) => `${toNumber(value).toFixed(2)} ${normalizedBaseCurrency}`;

  const updateWealthRow = (id, field, value) => {
    setWealthRows((previous) => previous.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const updatePaymentRow = (id, field, value) => {
    setPaymentRows((previous) => previous.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const addPaymentRow = () => {
    setPaymentRows((previous) => [...previous, createPaymentRow(activeCycleKey)]);
  };

  const handleRegister = async () => {
    const username = accountUsername.trim();
    const password = accountPassword;

    if (!username || !password) {
      setCloudSyncStatus('Username and password are required to register.');
      setCloudSyncStatusLevel('error');
      return;
    }

    setAuthBusy(true);
    try {
      await cloudSyncService.register(username, password);
      setCloudSyncStatus('Account created. You can now sign in on PC or phone.');
      setCloudSyncStatusLevel('info');
      setAccountPassword('');
    } catch (error) {
      setCloudSyncStatus(error.message || 'Registration failed.');
      setCloudSyncStatusLevel('error');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLogin = async () => {
    const username = accountUsername.trim();
    const password = accountPassword;

    if (!username || !password) {
      setCloudSyncStatus('Username and password are required to sign in.');
      setCloudSyncStatusLevel('error');
      return;
    }

    setAuthBusy(true);
    try {
      const session = await cloudSyncService.login(username, password);
      setCloudSession(session);
      setAccountUsername(session.username);
      setAccountPassword('');
    } catch (error) {
      setCloudSyncStatus(error.message || 'Login failed.');
      setCloudSyncStatusLevel('error');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLogout = async () => {
    setAuthBusy(true);
    try {
      await cloudSyncService.logout();
    } catch (error) {
      // Ignore network/server logout failures and clear local session anyway.
    } finally {
      cloudSyncService.clearSession();
      setCloudSession(null);
      setAccountPassword('');
      setAuthBusy(false);
      setCloudSyncStatus('Signed out. Local-only mode is active.');
      setCloudSyncStatusLevel('info');
    }
  };

  const handleExcelImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setImportStatus(t.importingFile(file.name));
    setImportStatusLevel('info');

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        throw new Error(t.importNoWorksheet);
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const matrix = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: false,
        defval: ''
      });

      const parsed = parseZakatExcelMatrix(matrix, normalizedBaseCurrency);

      if (parsed.detectedBaseCurrency) {
        setBaseCurrency(normalizeBaseCurrency(parsed.detectedBaseCurrency));
      }

      if (parsed.wealthRows.length > 0) {
        setWealthRows(
          parsed.wealthRows.map((row) =>
            createWealthRow({
              type: row.type,
              amount: String(row.amount),
              note: row.note || t.importedFromExcel
            })
          )
        );
      }

      if (parsed.paymentRows.length > 0) {
        setPaymentRows((previous) => {
          const otherCycles = previous.filter((row) => row.cycleKey !== activeCycleKey);
          const importedRows = parsed.paymentRows.map((row) =>
            createPaymentRow(activeCycleKey, {
              paidTo: row.paidTo,
              date: normalizePaymentDate(row.date || getTodayDateString()),
              amount: String(row.amount),
              currency: row.currency
            })
          );
          return [...otherCycles, ...importedRows];
        });
      }

      const warningMessage =
        parsed.warnings.length > 0 ? ` ${t.warningsPrefix}: ${parsed.warnings.join(' ')}` : '';

      setImportStatusLevel('info');
      setImportStatus(t.importedSummary(parsed.wealthRows.length, parsed.paymentRows.length, file.name, warningMessage));
    } catch (error) {
      setImportStatusLevel('error');
      setImportStatus(t.importFailed(error.message));
    } finally {
      // Allow importing the same file again.
      // eslint-disable-next-line no-param-reassign
      event.target.value = '';
    }
  };

  const currentHijriDate = useMemo(() => getHijriDateText(language), [language]);
  const currentHijriMonth = useMemo(() => getHijriInfo()?.month || null, []);
  const isQuickPanelOpen = Boolean(openQuickPanel);
  const quickPanelTitle = openQuickPanel === QUICK_PANEL.ACCOUNT ? 'Account & Cloud Sync' : t.settings;

  return (
    <div className={`simple-page ${isRtl ? 'rtl' : ''}`} dir={isRtl ? 'rtl' : 'ltr'} lang={language}>
      <header className="simple-header">
        <div className="header-top">
          <div className="header-title-wrap">
            <h1>{t.appTitle}</h1>
            <p>{t.appSubtitle}</p>
          </div>

          <div className="header-actions">
            <button
              className={`icon-trigger ${openQuickPanel === QUICK_PANEL.ACCOUNT ? 'is-active' : ''}`}
              type="button"
              aria-label="Open account panel"
              onClick={() => toggleQuickPanel(QUICK_PANEL.ACCOUNT)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0 2c-3.6 0-6.75 1.95-8.44 4.86A1 1 0 0 0 4.43 20h15.14a1 1 0 0 0 .87-1.14C18.75 15.95 15.6 14 12 14Z" />
              </svg>
            </button>

            <button
              className={`icon-trigger ${openQuickPanel === QUICK_PANEL.SETTINGS ? 'is-active' : ''}`}
              type="button"
              aria-label="Open settings panel"
              onClick={() => toggleQuickPanel(QUICK_PANEL.SETTINGS)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M11.2 2.07a1 1 0 0 1 1.6 0l1.24 1.56a8.5 8.5 0 0 1 1.56.65l1.91-.3a1 1 0 0 1 1.23.93l.2 1.98a8.36 8.36 0 0 1 1.1 1.25l1.92.47a1 1 0 0 1 .66 1.47l-.95 1.75c.03.32.04.64.03.96l.97 1.73a1 1 0 0 1-.64 1.48l-1.91.5a8.39 8.39 0 0 1-1.08 1.27l-.17 1.98a1 1 0 0 1-1.22.95l-1.91-.27a8.49 8.49 0 0 1-1.57.67l-1.22 1.58a1 1 0 0 1-1.6.02l-1.26-1.55a8.44 8.44 0 0 1-1.58-.64l-1.9.31a1 1 0 0 1-1.23-.92l-.2-1.98a8.37 8.37 0 0 1-1.11-1.24l-1.92-.47a1 1 0 0 1-.67-1.47l.95-1.75a8.9 8.9 0 0 1-.03-.96l-.98-1.73a1 1 0 0 1 .64-1.49l1.91-.5a8.3 8.3 0 0 1 1.08-1.27l.17-1.98a1 1 0 0 1 1.22-.95l1.92.27a8.43 8.43 0 0 1 1.57-.67Zm.8 6.68a3.25 3.25 0 1 0 3.25 3.25A3.25 3.25 0 0 0 12 8.75Z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <nav className="tab-nav">
        <button className={`tab-btn ${activeTab === 'zakat' ? 'active' : ''}`} onClick={() => setActiveTab('zakat')}>
          {t.tabZakat}
        </button>
        <button
          className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          {t.tabCalendar}
        </button>
      </nav>

      {isQuickPanelOpen && (
        <button
          className="quick-panel-overlay is-open"
          type="button"
          aria-label="Close panel"
          onClick={closeQuickPanel}
        />
      )}

      <aside
        ref={quickPanelRef}
        className={`quick-panel ${isQuickPanelOpen ? 'is-open' : ''}`}
        aria-hidden={!isQuickPanelOpen}
      >
        {isQuickPanelOpen && (
          <>
            <div className="quick-panel__header">
              <h2 className="quick-panel__title">{quickPanelTitle}</h2>
              <button className="quick-panel__close" type="button" aria-label="Close panel" onClick={closeQuickPanel}>
                x
              </button>
            </div>

            <div className="quick-panel__body">
              {openQuickPanel === QUICK_PANEL.ACCOUNT && (
                <div className="quick-panel__section">
                  <p className="muted quick-panel__meta">
                    {cloudSession?.username ? `Signed in as ${cloudSession.username}` : 'Not signed in'}
                  </p>
                  <div className="settings-grid account-settings-grid">
                    <div className="field">
                      <label>Username</label>
                      <input
                        value={accountUsername}
                        onChange={(event) => setAccountUsername(event.target.value)}
                        placeholder="username"
                        autoComplete="username"
                        disabled={authBusy || Boolean(cloudSession?.token)}
                      />
                    </div>

                    <div className="field">
                      <label>Password</label>
                      <input
                        type="password"
                        value={accountPassword}
                        onChange={(event) => setAccountPassword(event.target.value)}
                        placeholder="password"
                        autoComplete="current-password"
                        disabled={authBusy || Boolean(cloudSession?.token)}
                      />
                    </div>

                    <div className="field button-field account-action-buttons">
                      <button
                        className="btn secondary"
                        type="button"
                        onClick={handleRegister}
                        disabled={authBusy || Boolean(cloudSession?.token)}
                      >
                        Register
                      </button>
                      <button
                        className="btn"
                        type="button"
                        onClick={handleLogin}
                        disabled={authBusy || Boolean(cloudSession?.token)}
                      >
                        Login
                      </button>
                      <button className="btn danger" type="button" onClick={handleLogout} disabled={authBusy || !cloudSession?.token}>
                        Logout
                      </button>
                    </div>
                  </div>

                  {cloudSyncStatus && <div className={`alert ${cloudSyncStatusLevel}`}>{cloudSyncStatus}</div>}
                </div>
              )}

              {openQuickPanel === QUICK_PANEL.SETTINGS && (
                <div className="quick-panel__section">
                  <div className="settings-grid">
                    <div className="field">
                      <label>{t.language}</label>
                      <select value={language} onChange={(event) => setLanguage(normalizeLanguage(event.target.value))}>
                        {LANGUAGE_OPTIONS.map((option) => (
                          <option key={option.code} value={option.code}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label>{t.baseCurrency}</label>
                      <select value={normalizedBaseCurrency} onChange={(event) => setBaseCurrency(normalizeBaseCurrency(event.target.value))}>
                        {BASE_CURRENCY_OPTIONS.map((currencyCode) => (
                          <option key={currencyCode} value={currencyCode}>
                            {currencyCode}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label>{t.zakatMonth}</label>
                      <select value={zakatMonth} onChange={(event) => setZakatMonth(Number(event.target.value))}>
                        {ISLAMIC_MONTHS.map((month, index) => {
                          const localName = getMonthName(index + 1, language);
                          const secondaryName = language === 'en' ? month.tr : month.en;
                          return (
                            <option key={month.en} value={index + 1}>
                              {`${localName} (${secondaryName})`}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="field button-field">
                      <button className="btn" type="button" onClick={() => fetchRates({ forceRefresh: true })}>
                        {rateLoading ? t.refreshing : t.refreshRates}
                      </button>
                    </div>

                    <div className="field">
                      <label>{t.importExcel}</label>
                      <input type="file" accept=".xlsx,.xls,.csv" onChange={handleExcelImport} />
                    </div>

                    <div className="field button-field">
                      <button className="btn secondary" type="button" onClick={handleRestoreSaveback}>
                        Restore Last Snapshot
                      </button>
                    </div>
                  </div>

                  <p className="muted quick-panel__meta">
                    {t.activeCycle}: {cycleMeta.label} | {t.rateSource}: {sourceLabel} | {t.lastUpdate}:{' '}
                    {lastRateUpdate || t.notUpdatedYet}
                  </p>
                  {yearNote && <div className="alert info">{yearNote}</div>}
                  {importStatus && <div className={`alert ${importStatusLevel}`}>{importStatus}</div>}
                  {rateError && <div className="alert error">{rateError}</div>}
                  {missingRateItems.length > 0 && (
                    <div className="alert warning">
                      {t.missingConversionFor} {missingRateItems.join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </aside>

      {activeTab === 'zakat' && (
        <>
          <section className="panel">
            <div className="panel-header-row">
              <h2>{t.wealthEntries}</h2>
              <button className="btn secondary" type="button" onClick={() => setWealthRows((prev) => [...prev, createWealthRow()])}>
                {t.addWealthRow}
              </button>
            </div>

            <div className="table-wrap" ref={wealthTableWrapRef}>
              <table>
                <thead>
                  <tr>
                    <th>{t.type}</th>
                    <th>{t.amount}</th>
                    <th>{t.converted} ({normalizedBaseCurrency})</th>
                    <th>{t.note}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {wealthComputedRows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <select value={row.type} onChange={(event) => updateWealthRow(row.id, 'type', event.target.value)}>
                          {WEALTH_TYPE_OPTIONS.map((option) => (
                            <option key={option.key} value={option.key}>
                              {getWealthTypeLabel(option.key)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          value={row.amount}
                          onChange={(event) => updateWealthRow(row.id, 'amount', event.target.value)}
                          step="0.01"
                          min="0"
                        />
                      </td>
                      <td className={row.missingRate ? 'missing' : ''}>
                        {row.missingRate ? t.missingRate : row.convertedAmount.toFixed(2)}
                      </td>
                      <td>
                        <input
                          value={row.note}
                          onChange={(event) => updateWealthRow(row.id, 'note', event.target.value)}
                          placeholder={t.optional}
                        />
                      </td>
                      <td>
                        <button
                          className="btn danger"
                          type="button"
                          onClick={() => setWealthRows((prev) => prev.filter((item) => item.id !== row.id))}
                          disabled={wealthRows.length === 1}
                        >
                          {t.delete}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header-row">
              <h2>{t.payments}</h2>
              <button className="btn secondary" type="button" onClick={addPaymentRow}>
                {t.addPaymentRow}
              </button>
            </div>

            <div className="table-wrap" ref={paymentTableWrapRef}>
              <table>
                <thead>
                  <tr>
                    <th>{t.paidTo}</th>
                    <th>{t.date}</th>
                    <th>{t.amount}</th>
                    <th>{t.currency}</th>
                    <th>{t.converted} ({normalizedBaseCurrency})</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {paymentComputedRows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <input
                          value={row.paidTo}
                          onChange={(event) => updatePaymentRow(row.id, 'paidTo', event.target.value)}
                          placeholder={t.personInstitution}
                        />
                      </td>
                      <td>
                        <input type="date" value={row.date} onChange={(event) => updatePaymentRow(row.id, 'date', event.target.value)} />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={row.amount}
                          onChange={(event) => updatePaymentRow(row.id, 'amount', event.target.value)}
                          step="0.01"
                          min="0"
                        />
                      </td>
                      <td>
                        <select value={row.currency} onChange={(event) => updatePaymentRow(row.id, 'currency', event.target.value)}>
                          {PAYMENT_CURRENCY_OPTIONS.map((currency) => (
                            <option key={currency} value={currency}>
                              {currency === 'XAU' ? t.xauLabel : currency}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className={row.missingRate ? 'missing' : ''}>
                        {row.missingRate ? t.missingRate : row.convertedAmount.toFixed(2)}
                      </td>
                      <td>
                        <button
                          className="btn danger"
                          type="button"
                          onClick={() => setPaymentRows((prev) => prev.filter((item) => item.id !== row.id))}
                        >
                          {t.delete}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {paymentComputedRows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="muted-cell">
                        {t.noPaymentsInCycle}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel summary-panel">
            <h2>{t.summary}</h2>
            <div className="summary-grid">
              <div className="summary-item">
                <span>{t.totalWealth}</span>
                <strong>{formatMoney(totalWealthInBase)}</strong>
              </div>
              <div className="summary-item">
                <span>{t.nisabThreshold}</span>
                <strong>{nisabThreshold > 0 ? formatMoney(nisabThreshold) : t.nisabUnavailable}</strong>
              </div>
              <div className="summary-item">
                <span>{t.nisabStatus}</span>
                <strong>{nisabMet ? t.nisabMet : t.belowNisab}</strong>
              </div>
              <div className="summary-item">
                <span>{t.zakatDuty}</span>
                <strong>{formatMoney(zakatDutyCurrentYear)}</strong>
              </div>
              <div className="summary-item">
                <span>{t.carryFromPrevYear}</span>
                <strong>{formatMoney(carryInAmount)}</strong>
              </div>
              <div className="summary-item">
                <span>{t.totalPaidThisYear}</span>
                <strong>{formatMoney(totalPaidCurrentCycle)}</strong>
              </div>
              <div className={`summary-item ${remainingAmount > 0 ? 'remaining' : 'paid'}`}>
                <span>{remainingAmount > 0 ? t.remainingToPay : t.overpaidExtra}</span>
                <strong>{formatMoney(Math.abs(remainingAmount))}</strong>
              </div>
            </div>
          </section>
        </>
      )}

      {activeTab === 'calendar' && (
        <section className="panel">
          <h2>{t.calendarTitle}</h2>
          <p className="muted">
            {t.todayHijri} {currentHijriDate}
          </p>
          <div className="months-grid">
            {ISLAMIC_MONTHS.map((month, index) => (
              <div
                key={month.en}
                className={`month-chip ${currentHijriMonth === index + 1 ? 'current' : ''} ${
                  zakatMonth === index + 1 ? 'zakat-month' : ''
                }`}
              >
                <strong>{getMonthName(index + 1, language)}</strong>
                <span>{language === 'en' ? month.tr : month.en}</span>
                {zakatMonth === index + 1 && <em>{t.zakatMonthBadge}</em>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default App;

