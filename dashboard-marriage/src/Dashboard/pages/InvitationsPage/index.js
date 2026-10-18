import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { FiCalendar, FiCopy, FiEdit2, FiExternalLink, FiGlobe, FiImage, FiMapPin, FiSave, FiTrash2, FiUpload } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import Field from '../../components/Field';
import { ConfirmationDialog, CustomModal, Pagination, CustomBottom, Loading, CustomInput } from '../../../components';
import DashboardLayout from '../../DashboardLayout';
import TemplatePicker from '../../components/TemplatePicker';
import ContentLocaleSwitcher from '../../components/ContentLocaleSwitcher';
import FontFamilyPicker from '../../components/FontFamilyPicker';
import { useToast } from '../../../components/ToastProvider';
import { useDocumentTitle } from '../../../utils/useDocumentTitle';
import { invitationsApi } from '../../../utils/invitationsApi';
import { eidGreetingsApi } from '../../../utils/eidGreetingsApi';
import { birthdayGreetingsApi } from '../../../utils/birthdayGreetingsApi';
import { uploadMedia } from '../../../utils/mediaUploadApi';
import { getBackendUrl, getFrontendUrl, getBackendMode } from '../../../utils/apiConfig';
import { getTemplateGlobalId } from '../../../utils/templateRegistry';
import {
  buildFormFieldPath,
  createEmptyForm,
  hydrateInvitation,
  serializeInvitation,
} from '../../../utils/invitationContent';

const EDITOR_SECTION_STORAGE_KEY = 'dashboard-editor-section';
const EDITOR_CONTENT_LOCALE_KEY = 'dashboard-editor-content-locale';

const normalizeMediaUrl = (url) => {
  if (!url) return '';
  if (typeof url !== 'string') return url;
  if (url.startsWith('http://localhost/storage/')) {
    const apiBase = getBackendUrl();
    try {
      const urlObj = new URL(apiBase);
      const apiHost = urlObj.origin;
      return url.replace('http://localhost', apiHost);
    } catch {
      return url.replace('http://localhost', 'https://adequate-blessing-production-4ffe.up.railway.app');
    }
  }
  return url;
};

const getYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};


const sections = [
  { id: 'couple', label: 'dashboard.sections.couple' },
  { id: 'hero', label: 'dashboard.sections.invitation' },
  { id: 'event', label: 'dashboard.sections.event' },
  { id: 'story', label: 'dashboard.sections.story' },
  { id: 'gallery', label: 'dashboard.sections.gallery' },
  { id: 'countdown', label: 'dashboard.sections.countdown' },
  { id: 'audio', label: 'dashboard.sections.audio' },
  { id: 'party_upload', label: 'dashboard.sections.party_upload' },
  { id: 'rsvp', label: 'dashboard.sections.rsvp' },
  { id: 'footer', label: 'dashboard.sections.footer' },
];

const fieldGroups = {
  couple: [
    ['groom_name', 'dashboard.fields.groom_name'],
    ['bride_name', 'dashboard.fields.bride_name'],
    ['couple_display_name', 'dashboard.fields.display_name', true],
    ['public_path', 'dashboard.fields.route_name'],
    ['requester_name', 'Requester Name (optional)'],
    ['requester_whatsapp', 'WhatsApp Number (optional)', false, 'tel'],
    ['order_date', 'Order Date (optional)', false, 'date'],
    ['organizer_username', 'dashboard.fields.organizer_username'],
    ['organizer_password', 'dashboard.fields.organizer_password'],
  ],
  hero: [
    ['loading.prompt_kicker', 'dashboard.fields.loading_kicker'],
    ['loading.open_prompt', 'dashboard.fields.loading_prompt'],
    ['hero.open_invitation', 'dashboard.fields.open_invitation'],
    ['hero.kicker', 'dashboard.fields.hero_kicker'],
    ['hero.open', 'dashboard.fields.open_button'],
    ['hero.view_details', 'dashboard.fields.view_details'],
    ['hero.save_date', 'dashboard.fields.save_date'],
    ['hero.body', 'dashboard.fields.hero_body', true],
  ],
  event: [
    ['event.kicker', 'dashboard.fields.event_kicker'],
    ['event.title', 'dashboard.fields.event_title'],
    ['event.day_label', 'dashboard.fields.day_label'],
    ['event.date', 'dashboard.fields.event_date'],
    ['event.time', 'dashboard.fields.event_time'],
    ['event.venue_label', 'dashboard.fields.venue_label'],
    ['event.venue', 'dashboard.fields.venue'],
    ['event.location', 'dashboard.fields.location'],
    ['event.address', 'dashboard.fields.address'],
    ['event.landmark', 'dashboard.fields.landmark_label'],
    ['event.landmark_value', 'dashboard.fields.landmark'],
    ['event.map_url', 'dashboard.fields.map_url'],
    ['event.map_title', 'dashboard.fields.map_title'],
    ['event.open_location', 'dashboard.fields.open_location'],
    ['event.description', 'dashboard.fields.description', true],
  ],
  story: [
    ['love_story.kicker', 'dashboard.fields.story_kicker'],
    ['love_story.title', 'dashboard.fields.story_title'],
    ['love_story.events_text', 'dashboard.fields.timeline_events', true],
  ],
  gallery: [
    ['gallery.title', 'dashboard.fields.gallery_title'],
    ['gallery.image_urls_text', 'dashboard.fields.image_urls', true],
  ],
  countdown: [
    ['countdown.title', 'dashboard.fields.countdown_title'],
    ['countdown.target_date', 'dashboard.fields.target_date'],
    ['countdown.finished', 'dashboard.fields.finished_text'],
  ],
  audio: [
    ['audio.src', 'dashboard.fields.audio_src'],
    ['audio.play', 'dashboard.fields.audio_play'],
    ['audio.pause', 'dashboard.fields.audio_pause'],
    ['audio.volume', 'dashboard.fields.audio_volume'],
  ],
  party_upload: [
    ['party_upload.max_images', 'dashboard.fields.party_upload_max_images'],
    ['party_upload.title', 'dashboard.fields.party_upload_title'],
    ['party_upload.button_text', 'dashboard.fields.party_upload_button_text'],
    ['party_upload.name_placeholder', 'dashboard.fields.party_upload_name_placeholder'],
    ['party_upload.description', 'dashboard.fields.party_upload_description', true],
  ],
  rsvp: [
    ['rsvp.kicker', 'dashboard.fields.rsvp_kicker'],
    ['rsvp.title', 'dashboard.fields.rsvp_title'],
    ['rsvp.name', 'dashboard.fields.rsvp_name'],
    ['rsvp.name_placeholder', 'dashboard.fields.rsvp_name_placeholder'],
    ['rsvp.attending', 'dashboard.fields.attending_label'],
    ['rsvp.submit', 'dashboard.fields.submit_text'],
    ['rsvp.yes', 'dashboard.fields.yes_option'],
    ['rsvp.no', 'dashboard.fields.no_option'],
    ['rsvp.message', 'dashboard.fields.message_label'],
    ['rsvp.message_placeholder', 'dashboard.fields.message_placeholder'],
    ['rsvp.thanks', 'dashboard.fields.thanks_text'],
    ['rsvp.yes_reply', 'dashboard.fields.yes_reply', true],
    ['rsvp.no_reply', 'dashboard.fields.no_reply', true],
  ],
  footer: [
    ['footer.date', 'dashboard.fields.footer_date'],
    ['footer.made_with', 'dashboard.fields.made_with'],
    ['footer.for_day', 'dashboard.fields.for_day'],
  ],
};

const NON_TYPOGRAPHY_FIELDS = new Set([
  'public_path',
  'requester_name',
  'requester_whatsapp',
  'order_date',
  'organizer_username',
  'organizer_password',
  'event.map_url',
  'gallery.image_urls_text',
  'countdown.target_date',
  'audio.src',
  'audio.volume',
  'party_upload.max_images',
]);

const clampFontSize = (value) => Math.min(120, Math.max(8, Math.round(Number(value) || 16)));

const FontSizeControl = ({ value, onChange, locale }) => {
  const customSize = value !== null && value !== '' && Number.isFinite(Number(value)) ? Number(value) : null;
  const isArabic = locale === 'ar';
  const adjust = (amount) => onChange(clampFontSize((customSize ?? 16) + amount));
  const [draftSize, setDraftSize] = useState(customSize ?? '');

  useEffect(() => {
    setDraftSize(customSize ?? '');
  }, [customSize]);

  const commitDraftSize = () => {
    if (draftSize === '') onChange(null);
    else onChange(clampFontSize(draftSize));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[#d9c58f]/60 bg-[#fffaf0] px-3 py-2 dark:border-gold/25 dark:bg-gold/5">
      <span className="text-xs font-black text-[#725b25] dark:text-gold">
        {isArabic ? 'حجم الخط' : 'Font size'}
      </span>
      <button type="button" onClick={() => adjust(-1)} className="h-8 w-8 rounded-md border border-slate-300 bg-white text-lg font-black text-slate-800 dark:border-[#425168] dark:bg-[#101923] dark:text-white" aria-label={isArabic ? 'تصغير الخط' : 'Decrease font size'}>−</button>
      <input
        type="range"
        min="8"
        max="120"
        value={customSize ?? 16}
        onChange={(event) => onChange(clampFontSize(event.target.value))}
        className="h-2 min-w-28 flex-1 cursor-pointer accent-[#b49344]"
        aria-label={isArabic ? 'حجم الخط بالبكسل' : 'Font size in pixels'}
      />
      <button type="button" onClick={() => adjust(1)} className="h-8 w-8 rounded-md border border-slate-300 bg-white text-lg font-black text-slate-800 dark:border-[#425168] dark:bg-[#101923] dark:text-white" aria-label={isArabic ? 'تكبير الخط' : 'Increase font size'}>+</button>
      <div className="flex items-center gap-1">
        <input
          type="number"
          min="8"
          max="120"
          value={draftSize}
          placeholder="Auto"
          onChange={(event) => setDraftSize(event.target.value)}
          onBlur={commitDraftSize}
          onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); }}
          className="h-8 w-20 rounded-md border border-slate-300 bg-white px-2 text-center text-xs font-bold text-slate-900 dark:border-[#425168] dark:bg-[#101923] dark:text-white"
        />
        <span className="text-[11px] font-bold text-slate-500">px</span>
      </div>
      {customSize !== null && (
        <button type="button" onClick={() => onChange(null)} className="rounded-md px-2 py-1 text-xs font-black text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/30">
          {isArabic ? 'تلقائي' : 'Reset'}
        </button>
      )}
    </div>
  );
};

const SECTION_VISIBILITY_CONFIG = {
  hero: { path: 'hero.is_enabled', label: 'dashboard.fields.hero_is_enabled', defaultValue: true },
  event: { path: 'event.is_enabled', label: 'dashboard.fields.event_is_enabled', defaultValue: true },
  story: { path: 'love_story.is_enabled', label: 'dashboard.fields.story_is_enabled', defaultValue: true },
  gallery: { path: 'gallery.is_enabled', label: 'dashboard.fields.gallery_is_enabled', defaultValue: true },
  countdown: { path: 'countdown.is_enabled', label: 'dashboard.fields.countdown_is_enabled', defaultValue: true },
  audio: { path: 'audio.is_enabled', label: 'dashboard.fields.audio_is_enabled', defaultValue: true },
  party_upload: { path: 'party_upload.is_enabled', label: 'dashboard.fields.party_upload_is_enabled', defaultValue: false },
  rsvp: { path: 'rsvp.is_enabled', label: 'dashboard.fields.rsvp_is_enabled', defaultValue: true },
  footer: { path: 'footer.is_enabled', label: 'dashboard.fields.footer_is_enabled', defaultValue: true },
};

const getValue = (source, path) => path.split('.').reduce((value, key) => value?.[key], source);
const renderSectionVisibilityToggle = (activeSection, form, update, t, textColorClass = 'text-slate-500') => {
  const config = SECTION_VISIBILITY_CONFIG[activeSection];
  if (!config) return null;

  const checked = getValue(form, config.path) ?? config.defaultValue;

  return (
    <label className={`col-span-full flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 text-xs font-black uppercase tracking-[0.14em] ${textColorClass} dark:border-[#344458] dark:bg-[#101923] dark:text-slate-200 sm:w-fit`}>
      <input className="h-4 w-4 accent-[#D6B15C]" type="checkbox" checked={checked} onChange={(event) => update(config.path, event.target.checked)} />
      {t(config.label)}
    </label>
  );
};

const appendLines = (currentValue, lines) => {
  const currentLines = String(currentValue || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return [...currentLines, ...lines].join('\n');
};

const createRouteCode = () => String(Math.floor(Math.random() * 10000)).padStart(4, '0');
const slugifyRoutePart = (value, fallback) => value
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '') || fallback;
const createInvitationPath = (groomName, brideName, code) => `${slugifyRoutePart(groomName, 'bridegroom')}-${slugifyRoutePart(brideName, 'bride')}-${code}`;
const normalizeLocale = (language) => (language?.startsWith('ar') ? 'ar' : 'en');
const parseMaybeJson = (value) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed.startsWith('{')) return value;

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
};
const localizedText = (value, language, fallback = '') => {
  const parsed = parseMaybeJson(value);
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const locale = normalizeLocale(language);
    return parsed[locale] || parsed.en || parsed.ar || fallback;
  }

  return parsed || fallback;
};
const routeName = (value) => {
  const parsed = parseMaybeJson(value);
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    return parsed.en || parsed.ar || '';
  }

  return parsed || '';
};

const ActionButton = ({ children, tone = 'dark', ...props }) => (
  <button
    type="button"
    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-black transition ${tone === 'danger' ? 'bg-rose-950 text-rose-50 hover:bg-rose-900' : 'bg-[#111820] text-white hover:bg-[#22303d] dark:bg-gold dark:text-[#111820] dark:hover:bg-[#f0cf83]'}`}
    {...props}
  >
    {children}
  </button>
);

const StatTiles = ({ stats, t }) => (
  <div className="mb-4 grid gap-3 sm:grid-cols-3">
    {[[FiCalendar, 'dashboard.stats.total', stats.total], [FiGlobe, 'dashboard.stats.published', stats.published], [FiMapPin, 'dashboard.stats.rsvps', stats.rsvps]].map(([Icon, label, total]) => (
      <div key={label} className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-[#253141] dark:bg-[#0e1721] dark:shadow-[0_18px_44px_rgba(0,0,0,0.24)]">
        <Icon className="row-span-2 text-xl text-[#b49344]" />
        <span className="text-xs font-bold text-slate-500 dark:text-slate-300">{t(label)}</span>
        <strong className="text-2xl font-black">{total}</strong>
      </div>
    ))}
  </div>
);

const InvitationsOverview = ({
  invitations,
  language,
  loading,
  onDelete,
  onEdit,
  onPageChange,
  pagination,
  demoInvitations,
  publicBaseUrl,
  stats,
  status,
  t,
  onCreateNew,
  editLoadingId,
  searchQuery,
  setSearchQuery,
  templateFilter,
  setTemplateFilter,
  typeFilter,
  setTypeFilter,
  dateFilter,
  setDateFilter,
  sortOrder,
  setSortOrder,
}) => {
  const toast = useToast();

  const clientInvitations = invitations.filter((inv) => !(inv.is_demo || (inv.public_path && inv.public_path.startsWith('demo'))));

  const renderInvitationCard = (invitation) => {
    const backendMode = getBackendMode();
    const querySuffix = backendMode === 'local' ? '?backend=local' : '';
    const publicUrl = invitation.public_path ? `${publicBaseUrl}/${invitation.public_path}${querySuffix}` : '';
    const organizerUrl = invitation.public_path ? `${publicBaseUrl}/${invitation.public_path}/organizer${querySuffix}` : '';
    const fallbackName = `${localizedText(invitation.groom_name, language)} & ${localizedText(invitation.bride_name, language)}`;
    const coupleName = localizedText(invitation.couple_display_name, language, fallbackName);
    const isDemo = invitation.is_demo || (invitation.public_path && invitation.public_path.startsWith('demo'));
    const isEditLoading = editLoadingId === invitation.id;

    return (
      <article key={invitation.id} className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-[#273445] dark:bg-[#101923]">
        <div className="mobile-wrap-summary flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <strong className="block truncate text-base font-black text-slate-950 dark:text-white">{coupleName}</strong>
            <span className="mt-1 block truncate text-xs font-bold text-slate-500 dark:text-slate-400" dir="ltr">{invitation.public_path}</span>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-black text-slate-700 dark:bg-white/10 dark:text-slate-200">
              ID {getTemplateGlobalId('invitation', invitation.template || 'classic')}
            </span>
            {isDemo && (
              <span className="rounded-full bg-gold/25 text-[#b49344] px-2.5 py-1 text-xs font-black">DEMO</span>
            )}
            <span className={`rounded-full px-2.5 py-1 text-xs font-black ${invitation.is_published ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200' : 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300'}`}>{t(invitation.is_published ? 'dashboard.status.published' : 'dashboard.status.draft')}</span>
            <button type="button" onClick={() => onDelete(invitation)} className="grid h-9 w-9 place-items-center rounded-lg border border-rose-200 bg-white text-rose-600 transition hover:border-rose-400 hover:bg-rose-50 dark:border-rose-400/25 dark:bg-[#0b131c] dark:text-rose-300 dark:hover:border-rose-300" aria-label={t('dashboard.actions.delete')} title={t('dashboard.actions.delete')}><FiTrash2 /></button>
          </div>
        </div>
        <div className="mobile-card-actions flex flex-wrap gap-2">
          <ActionButton onClick={() => onEdit(invitation)} disabled={isEditLoading}>
            {isEditLoading ? (
              <span className="flex items-center gap-1.5">
                <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : (
              <><FiEdit2 /> {t('dashboard.actions.edit')}</>
            )}
          </ActionButton>
          {publicUrl ? (
            <>
              <a href={publicUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-gold hover:text-[#8a6d2f] dark:border-[#344458] dark:bg-[#0b131c] dark:text-white dark:hover:border-gold dark:hover:text-gold"><FiExternalLink /> {t('dashboard.actions.open')}</a>
              <a href={organizerUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#b49344] bg-[#fff8e6] px-4 text-sm font-black text-[#8a6d2f] transition hover:bg-[#b49344] hover:text-white dark:border-gold/50 dark:bg-gold/10 dark:text-gold dark:hover:bg-gold dark:hover:text-[#111820]"><FiCalendar /> {t('dashboard.actions.organizer', 'Organizer')}</a>
              <button type="button" onClick={() => { navigator.clipboard?.writeText(organizerUrl); toast.success(t('dashboard.status.copied_organizer', 'Organizer link copied!')); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-gold hover:text-[#8a6d2f] dark:border-[#344458] dark:bg-[#0b131c] dark:text-white dark:hover:border-gold dark:hover:text-gold"><FiCopy /> {t('dashboard.actions.copy_organizer', 'Copy Organizer')}</button>
            </>
          ) : null}
        </div>
      </article>
    );
  };

  return (
    <>
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-[#8a6d2f]">{getBackendMode() === 'local' ? 'Local Database | قاعدة بيانات محلية' : 'Global Database | قاعدة بيانات عامة'}</p>
          <h1 className="flex flex-wrap items-center gap-3 text-4xl font-black text-slate-950 dark:text-white">
            {t('dashboard.overview.title', 'Wedding Invitations')}
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-black tracking-normal ${getBackendMode() === 'local' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/45 dark:text-amber-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-950/45 dark:text-blue-400'}`}>
              {getBackendMode() === 'local' ? 'LOCAL DB | محلي' : 'GLOBAL DB | عام'}
            </span>
          </h1>
        </div>
        <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 dark:border-[#2a3646] dark:bg-[#101923] dark:text-slate-300">{status}</span>
      </header>

      <StatTiles stats={stats} t={t} />

      {/* Search & Filter Controls */}
      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-[#253141] dark:bg-[#0b131c]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
          <div className="lg:col-span-2 md:col-span-2">
            <CustomInput
              label={t('dashboard.search.label', 'Search')}
              labelClassName="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block"
              placeholder={t('dashboard.search.placeholder', 'Search by names, path...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              inputClassName="w-full text-slate-900 border-slate-200 bg-slate-50 placeholder:text-slate-400 dark:bg-[#101923] dark:border-[#273445] dark:text-white py-2"
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
              {t('dashboard.filter.template', 'Template')}
            </label>
            <select
              value={templateFilter}
              onChange={(e) => setTemplateFilter(e.target.value)}
              className="w-full h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-gold dark:border-[#273445] dark:bg-[#101923] dark:text-white"
            >
              <option value="">{t('dashboard.filter.all_templates', 'All Templates')}</option>
              <option value="classic">Classic</option>
              <option value="signature">Signature</option>
              <option value="royal">Royal</option>
              <option value="love-letter">Love Letter</option>
              <option value="floral-butterfly">Floral Butterfly</option>
              <option value="modern-minimal">Modern Minimalist</option>
              <option value="burgundy">Burgundy</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
              {t('dashboard.filter.type', 'Type')}
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-gold dark:border-[#273445] dark:bg-[#101923] dark:text-white"
            >
              <option value="">{t('dashboard.filter.all_types', 'All Types')}</option>
              <option value="real">{t('dashboard.filter.real_clients', 'Client Templates')}</option>
              <option value="demo">{t('dashboard.filter.demos', 'Demos')}</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
              {t('dashboard.filter.date', 'Date')}
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-gold dark:border-[#273445] dark:bg-[#101923] dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
              {t('dashboard.filter.sort', 'Sort By')}
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-gold dark:border-[#273445] dark:bg-[#101923] dark:text-white"
            >
              <option value="latest">{t('dashboard.filter.latest', 'Newest First')}</option>
              <option value="oldest">{t('dashboard.filter.oldest', 'Oldest First')}</option>
            </select>
          </div>
        </div>
      </section>

      {/* Seeded Database Demos Section */}
      {demoInvitations.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-sm font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            {t('dashboard.overview.template_demos', 'Template Live Demos')}
          </h2>
          <div className="grid gap-3 p-4 sm:p-5 xl:grid-cols-2 rounded-lg border border-slate-200 bg-white shadow-sm dark:border-[#253141] dark:bg-[#0b131c]">
            {demoInvitations.map((invitation) => renderInvitationCard(invitation))}
          </div>
        </section>
      )}

      <h2 className="mb-4 text-sm font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
        Your Created Invitations
      </h2>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.06)] dark:border-[#253141] dark:bg-[#0b131c] dark:shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
        <div className="grid gap-3 p-4 sm:p-5 xl:grid-cols-2">
          {loading ? (
            <div className="col-span-full">
              <Loading message={t('dashboard.status.working', 'Working...')} />
            </div>
          ) : clientInvitations.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-7 text-slate-500 dark:border-[#344458] dark:bg-[#101923] dark:text-slate-300">{t('dashboard.sidebar.empty')}</div>
          ) : clientInvitations.map((invitation) => renderInvitationCard(invitation))}
        </div>
        <div className="border-t border-slate-100 px-4 pb-5 dark:border-white/10 sm:px-5">
          <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={onPageChange} />
        </div>
      </section>
    </>
  );
};

export default function InvitationsPage({ embedded = false, active = true, studioMode = false }) {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditorView = location.pathname.endsWith('/new');
  const view = isEditorView ? 'editor' : 'invitations';
  const [invitations, setInvitations] = useState([]);
  const [demoInvitations, setDemoInvitations] = useState([]);
  const [invitationPage, setInvitationPage] = useState(1);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [selected, setSelected] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [form, setForm] = useState(createEmptyForm);
  const [editorLocale, setEditorLocale] = useState(() => {
    const savedLocale = sessionStorage.getItem(EDITOR_CONTENT_LOCALE_KEY);
    if (savedLocale === 'ar' || savedLocale === 'en') return savedLocale;
    return i18n.language?.startsWith('ar') ? 'ar' : 'en';
  });
  const [routeCode, setRouteCode] = useState(createRouteCode);
  const [routeTouched, setRouteTouched] = useState(false);
  const [activeSection, setActiveSection] = useState(() => {
    const savedSection = sessionStorage.getItem(EDITOR_SECTION_STORAGE_KEY);
    return sections.some((section) => section.id === savedSection) ? savedSection : 'couple';
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [eidCount, setEidCount] = useState(0);
  const [birthdayCount, setBirthdayCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [templateFilter, setTemplateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('latest');
  const [editLoadingId, setEditLoadingId] = useState(null);

  const backendMode = getBackendMode();
  const publicBaseUrl = getFrontendUrl();
  const querySuffix = backendMode === 'local' ? '?backend=local' : '';
  const publicUrl = selected?.public_path ? `${publicBaseUrl}/${selected.public_path}${querySuffix}` : '';
  const stats = useMemo(() => ({ total: invitations.length, published: invitations.filter((item) => item.is_published).length, rsvps: invitations.reduce((sum, item) => sum + (item.rsvps_count || 0), 0) }), [invitations]);
  const pageTitle = isEditModalOpen
    ? `${t('dashboard.editor.edit_title')} | Marriage Admin`
    : `${view === 'editor' ? t('dashboard.editor.add_title') : t('dashboard.overview.title')} | Marriage Admin`;
  useDocumentTitle(pageTitle);

  const loadSidebarCounts = useCallback(async () => {
    try {
      const eidResponse = await eidGreetingsApi.list(1);
      setEidCount(eidResponse.meta?.total || eidResponse.data?.length || 0);
    } catch (err) {
      console.error(err);
    }
    try {
      const birthdayResponse = await birthdayGreetingsApi.list(1);
      setBirthdayCount(birthdayResponse.meta?.total || birthdayResponse.data?.length || 0);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (!embedded) {
      loadSidebarCounts();
    }
  }, [embedded, loadSidebarCounts]);

  const loadAllMatchingInvitations = useCallback(async (filters) => {
    const firstPage = await invitationsApi.list(1, filters);
    const totalPages = firstPage.meta?.last_page || 1;
    if (totalPages === 1) return firstPage.data || [];

    const remainingPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) => invitationsApi.list(index + 2, filters))
    );

    return [
      ...(firstPage.data || []),
      ...remainingPages.flatMap((response) => response.data || []),
    ];
  }, []);

  const loadInvitations = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        search: searchQuery,
        template: templateFilter,
        date: dateFilter,
        sort: sortOrder,
      };
      const isDemoInvitation = (invitation) => invitation.public_path?.startsWith('demo-');

      if (typeFilter) {
        const allMatching = await loadAllMatchingInvitations(filters);
        const filteredInvitations = allMatching.filter((invitation) => (
          typeFilter === 'demo' ? isDemoInvitation(invitation) : !isDemoInvitation(invitation)
        ));
        setInvitations(filteredInvitations);
        setDemoInvitations([]);
        setPagination({ currentPage: 1, totalPages: 1 });
      } else {
        const [response, allMatching] = await Promise.all([
          invitationsApi.list(invitationPage, filters),
          loadAllMatchingInvitations(filters),
        ]);
        setInvitations(response.data || []);
        setDemoInvitations(allMatching.filter(isDemoInvitation));
        setPagination({ currentPage: response.meta?.current_page || invitationPage, totalPages: response.meta?.last_page || 1 });
      }
      setStatus(t('dashboard.status.synced'));
    } catch (error) {
      setStatus(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [invitationPage, searchQuery, templateFilter, typeFilter, dateFilter, sortOrder, loadAllMatchingInvitations, t, toast]);

  useEffect(() => {
    setInvitationPage(1);
  }, [searchQuery, templateFilter, typeFilter, dateFilter, sortOrder]);

  useEffect(() => {
    if (view !== 'editor') {
      if (!embedded || active) {
        loadInvitations();
      }
    }
  }, [loadInvitations, embedded, active, view]);

  useEffect(() => {
    sessionStorage.setItem(EDITOR_SECTION_STORAGE_KEY, activeSection);
  }, [activeSection]);

  useEffect(() => {
    sessionStorage.setItem(EDITOR_CONTENT_LOCALE_KEY, editorLocale);
  }, [editorLocale]);

  useEffect(() => {
    setForm((current) => ({ ...current, locale: editorLocale }));
  }, [editorLocale]);

  useEffect(() => {
    if (!studioMode || window.parent === window) return undefined;
    window.parent.postMessage({
      type: 'wil-template-preview-data',
      category: 'invitation',
      data: { ...serializeInvitation(form), locale: editorLocale },
    }, '*');
    return undefined;
  }, [editorLocale, form, studioMode]);

  useEffect(() => {
    if (!studioMode) return undefined;
    const handleStudioMessage = (event) => {
      if (event.data?.type !== 'wil-template-language') return;
      setEditorLocale(event.data.locale === 'ar' ? 'ar' : 'en');
    };
    window.addEventListener('message', handleStudioMessage);
    return () => window.removeEventListener('message', handleStudioMessage);
  }, [studioMode]);

  useEffect(() => {
    if (!isEditorView) return;

    setForm((current) => {
      const queryParams = new URLSearchParams(location.search);
      const template = queryParams.get('template');
      const isTemplatePreview = queryParams.get('templatePreview') === '1';
      let next = current;
      if (template && current.template !== template) {
        next = { ...next, template };
      }
      if (isTemplatePreview && !routeName(next.groom_name) && !routeName(next.bride_name)) {
        next = {
          ...next,
          groom_name: { en: 'Demo Groom', ar: 'العريس التجريبي' },
          bride_name: { en: 'Demo Bride', ar: 'العروس التجريبية' },
          couple_display_name: { en: 'Demo Groom & Demo Bride', ar: 'العريس والعروس' },
        };
      }
      if (next.public_path) return next;
      return { ...next, public_path: createInvitationPath(routeName(next.groom_name), routeName(next.bride_name), routeCode) };
    });
  }, [isEditorView, routeCode, location.search]);

  const update = (path, value) => {
    if (path === 'public_path') {
      setRouteTouched(true);
    }

    setForm((current) => {
      const next = structuredClone(current);
      const keys = path.split('.');
      let target = next;
      keys.slice(0, -1).forEach((key) => { target[key] = target[key] || {}; target = target[key]; });
      target[keys.at(-1)] = value;

      if (!routeTouched && (path === 'groom_name.en' || path === 'bride_name.en' || path === 'groom_name.ar' || path === 'bride_name.ar')) {
        next.public_path = createInvitationPath(routeName(next.groom_name), routeName(next.bride_name), routeCode);
      }

      return next;
    });
  };

  const updateFontSize = (path, value) => {
    setForm((current) => {
      const fontSizes = { ...(current.font_sizes || {}) };
      if (value === null || value === '') delete fontSizes[path];
      else fontSizes[path] = clampFontSize(value);
      return { ...current, font_sizes: fontSizes };
    });
  };

  const showCompleted = () => {
    navigate('/completed');
    setStatus(t('dashboard.status.synced'));
  };
  const startNew = (templateId) => {
    const code = createRouteCode();
    const targetTemplate = typeof templateId === 'string' ? templateId : 'classic';
    setIsEditModalOpen(false);
    setSelected(null);
    setRouteCode(code);
    setRouteTouched(false);
    setForm({
      ...createEmptyForm(),
      locale: editorLocale,
      template: targetTemplate,
      public_path: createInvitationPath('', '', code)
    });
    setActiveSection('couple');
    navigate(`/invitations/new?template=${targetTemplate}`);
    setStatus(t('dashboard.status.creating'));
  };
  const editInvitation = async (invitation) => {
    if (!invitation?.id) return;
    setEditLoadingId(invitation.id);
    setStatus(t('dashboard.status.working', 'Working...'));
    try {
      const response = await invitationsApi.show(invitation.id);
      const fullInvitation = response.data || invitation;
      const hydrated = hydrateInvitation(fullInvitation);
      setSelected(fullInvitation);
      setRouteCode(fullInvitation.code || createRouteCode());
      setRouteTouched(true);
      setEditorLocale(hydrated.locale);
      setForm(hydrated);
      setActiveSection('couple');
      setIsEditModalOpen(true);
      setStatus(t('dashboard.status.editing', { path: fullInvitation.public_path }));
    } catch (error) {
      setStatus(error.message);
      toast.error(error.message);
    } finally {
      setEditLoadingId(null);
    }
  };
  const save = async () => {
    // Frontend Validation
    const groomNameEn = form.groom_name?.en?.trim();
    const groomNameAr = form.groom_name?.ar?.trim();
    const brideNameEn = form.bride_name?.en?.trim();
    const brideNameAr = form.bride_name?.ar?.trim();
    const publicPath = form.public_path?.trim();

    if (!groomNameEn && !groomNameAr) {
      toast.error(t('dashboard.validation.groom_name_required', 'Groom Name is required.'));
      return;
    }
    if (!brideNameEn && !brideNameAr) {
      toast.error(t('dashboard.validation.bride_name_required', 'Bride Name is required.'));
      return;
    }
    if (!publicPath) {
      toast.error(t('dashboard.validation.public_path_required', 'Route name (public path) is required.'));
      return;
    }

    setSaveLoading(true);
    try {
      const response = selected ? await invitationsApi.update(selected.id, serializeInvitation(form)) : await invitationsApi.create(serializeInvitation(form));
      setSelected(response.data);
      setForm(hydrateInvitation(response.data));
      await loadInvitations();
      setStatus(t('dashboard.status.saved'));
      toast.success(t('dashboard.status.saved'));
      setIsEditModalOpen(false);
    } catch (error) { setStatus(error.message); toast.error(error.message); } finally { setSaveLoading(false); }
  };
  const handleGalleryUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setLoading(true);
    try {
      const uploads = await Promise.all(files.map((file) => uploadMedia(file, 'gallery')));
      const urls = uploads.map((upload) => upload.url).filter(Boolean);

      setForm((current) => {
        const next = structuredClone(current);
        next.gallery = next.gallery || {};
        next.gallery.image_urls_text = appendLines(next.gallery.image_urls_text, urls);
        return next;
      });
      setStatus(`Uploaded ${urls.length} gallery image${urls.length === 1 ? '' : 's'}. Save the invitation to publish this change.`);
      toast.success(`Uploaded ${urls.length} gallery image${urls.length === 1 ? '' : 's'}. Save the invitation to publish this change.`);
    } catch (error) {
      setStatus(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  const renderMediaUploadControls = () => {
    if (activeSection === 'gallery') {
      return (
        <label className="col-span-full grid gap-3 rounded-lg border border-dashed border-[#b49344]/60 bg-[#fff8e6] p-4 text-sm font-bold text-slate-700 dark:border-gold/50 dark:bg-gold/10 dark:text-slate-100">
          <span className="flex items-center gap-2 text-sm font-black text-slate-950 dark:text-white"><FiImage /> Upload gallery images from device</span>
          <span className="text-xs leading-6 text-slate-500 dark:text-slate-300">Select one or more images. Their uploaded URLs will be added to the image list above.</span>
          <span className="inline-flex min-h-11 w-fit cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#111820] px-4 text-sm font-black text-white transition hover:bg-[#22303d] dark:bg-gold dark:text-[#111820] dark:hover:bg-[#f0cf83]">
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white dark:text-[#111820]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <FiUpload /> Choose images
              </>
            )}
          </span>
          <input className="sr-only" type="file" accept="image/*" multiple disabled={loading} onChange={handleGalleryUpload} />
        </label>
      );
    }

    if (activeSection === 'audio') {
      return null;
    }

    return null;
  };
  const renderGalleryPreviews = () => {
    const imageUrls = String(form.gallery?.image_urls_text || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const handleRemoveImage = (indexToRemove) => {
      const filtered = imageUrls.filter((_, idx) => idx !== indexToRemove);
      update('gallery.image_urls_text', filtered.join('\n'));
    };

    return (
      <div className="col-span-full">
        <h3 className="mb-3 text-sm font-black text-slate-950 dark:text-white">
          {t('dashboard.fields.gallery_preview', 'Gallery Images Preview')}
        </h3>
        {imageUrls.length === 0 ? (
          <div className="mb-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-[#344458] dark:bg-[#101923] dark:text-slate-400">
            {t('dashboard.gallery.no_images', 'No images uploaded yet.')}
          </div>
        ) : (
          <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {imageUrls.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm dark:border-[#273445] dark:bg-[#0b131c]"
              >
                <img
                  src={normalizeMediaUrl(url)}
                  alt={`Gallery item ${index + 1}`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/150?text=Broken+Image';
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-600 text-white transition hover:bg-rose-700"
                    title={t('dashboard.actions.delete')}
                  >
                    <FiTrash2 className="text-base" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderAudioPreview = () => {
    const src = form.audio?.src || '';
    const youtubeId = getYouTubeId(src);

    const handleRemoveAudio = () => {
      update('audio.src', '');
    };

    return (
      <div className="col-span-full grid gap-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-[#273445] dark:bg-[#101923]">
          <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
            {t('dashboard.fields.youtube_url', 'YouTube Background Music Link')}
          </label>
          <input
            type="text"
            className="w-full min-h-11 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition focus:border-gold focus:outline-none dark:border-[#344458] dark:bg-[#0e1721] dark:text-white"
            placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            value={src}
            onChange={(e) => update('audio.src', e.target.value)}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {t('dashboard.audio.youtube_desc', 'Paste a YouTube video link. The audio will play in the background on the invitation site.')}
          </p>
        </div>

        {src && (
          <div>
            <h3 className="mb-3 text-sm font-black text-slate-950 dark:text-white">
              {t('dashboard.fields.audio_preview', 'Audio Preview')}
            </h3>
            <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-[#273445] dark:bg-[#101923]">
              {youtubeId ? (
                <div className="aspect-video w-full max-w-lg overflow-hidden rounded-lg border border-slate-200 dark:border-[#273445]">
                  <iframe
                    title="YouTube Audio Preview"
                    className="h-full w-full"
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="flex-1 w-full">
                  <audio
                    controls
                    src={normalizeMediaUrl(src)}
                    className="w-full"
                    onError={(e) => {
                      console.error("Audio failed to load:", src);
                    }}
                  />
                </div>
              )}
              <button
                type="button"
                onClick={handleRemoveAudio}
                className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-lg bg-rose-950 px-4 text-sm font-black text-rose-50 transition hover:bg-rose-900"
              >
                <FiTrash2 /> {t('dashboard.actions.remove_audio', 'Remove Audio')}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderEditorFields = () => {
    return fieldGroups[activeSection]
      .filter(([path]) => {
        if (activeSection === 'gallery' && path === 'gallery.image_urls_text') return false;
        if (activeSection === 'audio' && path === 'audio.src') return false;
        return true;
      })
      .map(([path, label, textarea, type]) => {
        const fieldPath = buildFormFieldPath(path, editorLocale);

        return (
          <div key={fieldPath} className="grid gap-2">
            <Field
              label={t(label)}
              value={getValue(form, fieldPath)}
              textarea={textarea}
              type={type}
              onChange={(value) => update(fieldPath, value)}
            />
            {!NON_TYPOGRAPHY_FIELDS.has(path) && (
              <FontSizeControl
                value={form.font_sizes?.[fieldPath]}
                onChange={(value) => updateFontSize(fieldPath, value)}
                locale={editorLocale}
              />
            )}
          </div>
        );
      });
  };


  const removeInvitation = async (invitation) => {
    if (!invitation) return;
    setLoading(true);
    try {
      await invitationsApi.remove(invitation.id);
      if (selected?.id === invitation.id) {
        setSelected(null);
        setForm(createEmptyForm());
        setIsEditModalOpen(false);
      }
      setDeleteCandidate(null);
      navigate('/invitations');
      if (invitations.length === 1 && invitationPage > 1) {
        setInvitationPage((current) => current - 1);
      } else {
        await loadInvitations();
      }
      setStatus(t('dashboard.status.deleted'));
      toast.success(t('dashboard.status.deleted'));
    } catch (error) { setStatus(error.message); toast.error(error.message); } finally { setLoading(false); }
  };

  const editorContent = (
    <>
      <header className="mb-5 flex flex-col gap-4 lg:mb-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-[#8a6d2f]">{t(selected ? 'dashboard.editor.edit_kicker' : 'dashboard.editor.add_kicker')}</p>
          <h1 className="max-w-4xl text-3xl font-black leading-none tracking-normal text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">{t(selected ? 'dashboard.editor.edit_title' : 'dashboard.editor.add_title')}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 dark:border-[#344458] dark:bg-[#101923] dark:text-slate-300">{status}</span>
          <CustomBottom
            text={t('dashboard.actions.save')}
            onClick={save}
            loading={saveLoading}
            loadingText={t('dashboard.status.working')}
            buttonStyles="min-h-10 py-2.5 px-4 text-sm normal-case tracking-normal bg-[#111820] text-white hover:bg-[#22303d] dark:bg-gold dark:text-[#111820] font-black transition hover:scale-[1.02] cursor-pointer"
            styles="w-fit"
            rightIcon={<FiSave />}
          />
        </div>
      </header>

      {publicUrl && <div className="mb-4 flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm dark:border-[#263547] dark:bg-[#0e1721] sm:flex-row sm:items-center"><span className="min-w-0 flex-1 truncate px-2 text-sm text-slate-600 dark:text-slate-300" dir="ltr">{publicUrl}</span><button type="button" onClick={() => navigator.clipboard?.writeText(publicUrl)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gold px-4 text-sm font-black text-[#111820] transition hover:bg-[#f0cf83]"><FiCopy /> {t('dashboard.actions.copy')}</button><a href={publicUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-gold hover:text-[#8a6d2f] dark:border-[#344458] dark:bg-[#101923] dark:text-white dark:hover:text-gold"><FiExternalLink /> {t('dashboard.actions.open')}</a></div>}

      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-[#263547] dark:bg-[#0b131c]">
        <ContentLocaleSwitcher value={editorLocale} onChange={setEditorLocale} />
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.06)] dark:border-[#263547] dark:bg-[#0b131c] dark:shadow-[0_24px_72px_rgba(0,0,0,0.34)]">
        <nav className="overflow-x-auto border-b border-slate-100 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-[#101923]">
          <ol className="flex min-w-max items-center gap-2">
            {sections.map((section, index) => (
              <li key={section.id} className="flex items-center gap-2">
                <button type="button" className={`grid min-h-12 grid-cols-[auto_1fr] items-center gap-2 rounded-lg border px-3 text-start text-sm font-black transition ${activeSection === section.id ? 'border-[#111820] bg-[#111820] text-white dark:border-gold dark:bg-gold dark:text-[#111820]' : 'border-slate-200 bg-white text-slate-500 hover:border-gold hover:text-slate-900 dark:border-[#344458] dark:bg-[#0b131c] dark:text-slate-300 dark:hover:border-gold dark:hover:text-white'}`} onClick={() => setActiveSection(section.id)}>
                  <span className={`grid h-7 w-7 place-items-center rounded-full text-xs ${activeSection === section.id ? 'bg-white/15 dark:bg-[#111820]/15' : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-200'}`}>{index + 1}</span>
                  <span>{t(section.label)}</span>
                </button>
                {index < sections.length - 1 ? <span className="h-px w-6 bg-slate-200 dark:bg-[#344458]" /> : null}
              </li>
            ))}
          </ol>
        </nav>
        <div className={`grid gap-4 p-4 sm:p-5 ${activeSection === 'story' || activeSection === 'gallery' ? '' : 'md:grid-cols-2'}`}>
          {renderEditorFields()}
          {activeSection === 'gallery' && renderGalleryPreviews()}
          {activeSection === 'audio' && renderAudioPreview()}
          {renderMediaUploadControls()}
          {activeSection === 'couple' && (
            <>
              <FontFamilyPicker value={form.font_family} onChange={(value) => update('font_family', value)} />
              <TemplatePicker value={form.template} onChange={(value) => update('template', value)} />
              <label className="col-span-full flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:border-[#344458] dark:bg-[#101923] dark:text-slate-200 sm:w-fit">
                <input className="h-4 w-4 accent-[#D6B15C]" type="checkbox" checked={form.is_published} onChange={(event) => update('is_published', event.target.checked)} />
                {t('dashboard.fields.published')}
              </label>
            </>
          )}
          {renderSectionVisibilityToggle(activeSection, form, update, t)}
        </div>
      </div>
    </>
  );

  const modalActions = (
    <div className="mobile-stack-actions flex w-full items-center justify-between gap-2">
      <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 dark:border-[#344458] dark:bg-[#101923] dark:text-slate-300">{status}</span>
      <CustomBottom
        text={t('dashboard.actions.save')}
        onClick={save}
        loading={saveLoading}
        loadingText={t('dashboard.status.working')}
        buttonStyles="min-h-10 py-2.5 px-4 text-sm normal-case tracking-normal bg-gradient-to-r from-gold to-[#f0cf83] text-[#111820] font-black transition hover:scale-[1.02] cursor-pointer"
        styles="w-fit"
        rightIcon={<FiSave />}
      />
    </div>
  );

  if (embedded) {
    return (
      <>
        {view === 'invitations' ? (
          <InvitationsOverview invitations={invitations} demoInvitations={demoInvitations} language={i18n.resolvedLanguage || i18n.language} loading={loading} onDelete={setDeleteCandidate} onEdit={editInvitation} onPageChange={setInvitationPage} pagination={pagination} publicBaseUrl={publicBaseUrl} stats={stats} status={status} t={t} onCreateNew={startNew} editLoadingId={editLoadingId} searchQuery={searchQuery} setSearchQuery={setSearchQuery} templateFilter={templateFilter} setTemplateFilter={setTemplateFilter} typeFilter={typeFilter} setTypeFilter={setTypeFilter} dateFilter={dateFilter} setDateFilter={setDateFilter} sortOrder={sortOrder} setSortOrder={setSortOrder} />
        ) : (
          editorContent
        )}
        <CustomModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          eyebrow={t('dashboard.editor.edit_kicker')}
          title={t('dashboard.editor.edit_title')}
          headerActions={modalActions}
        >
          {publicUrl && <div className="mb-4 flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm dark:border-[#263547] dark:bg-[#0e1721] sm:flex-row sm:items-center"><span className="min-w-0 flex-1 truncate px-2 text-sm text-slate-600 dark:text-slate-300" dir="ltr">{publicUrl}</span><button type="button" onClick={() => navigator.clipboard?.writeText(publicUrl)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gold px-4 text-sm font-black text-[#111820] transition hover:bg-[#f0cf83]"><FiCopy /> {t('dashboard.actions.copy')}</button><a href={publicUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-gold hover:text-[#8a6d2f] dark:border-[#344458] dark:bg-[#101923] dark:text-white dark:hover:text-gold"><FiExternalLink /> {t('dashboard.actions.open')}</a></div>}
          <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-[#263445] dark:bg-[#0b131c]">
            <ContentLocaleSwitcher value={editorLocale} onChange={setEditorLocale} />
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-[#263445] dark:bg-[#0b131c]">
            <nav className="overflow-x-auto border-b border-slate-100 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-[#101923]">
              <ol className="flex min-w-max items-center gap-2">
                {sections.map((section, index) => (
                  <li key={section.id} className="flex items-center gap-2">
                    <button type="button" className={`grid min-h-12 grid-cols-[auto_1fr] items-center gap-2 rounded-lg border px-3 text-start text-sm font-black transition ${activeSection === section.id ? 'border-[#111820] bg-[#111820] text-white dark:border-gold dark:bg-gold dark:text-[#111820]' : 'border-slate-200 bg-white text-slate-500 hover:border-gold hover:text-slate-900 dark:border-[#344458] dark:bg-[#0b131c] dark:text-slate-300 dark:hover:border-gold dark:hover:text-white'}`} onClick={() => setActiveSection(section.id)}>
                      <span className={`grid h-7 w-7 place-items-center rounded-full text-xs ${activeSection === section.id ? 'bg-white/15 dark:bg-[#111820]/15' : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-200'}`}>{index + 1}</span>
                      <span>{t(section.label)}</span>
                    </button>
                    {index < sections.length - 1 ? <span className="h-px w-6 bg-slate-200 dark:bg-[#344458]" /> : null}
                  </li>
                ))}
              </ol>
            </nav>
            <div className={`grid gap-4 p-4 sm:p-5 ${activeSection === 'story' || activeSection === 'gallery' ? '' : 'md:grid-cols-2'}`}>
              {renderEditorFields()}
              {activeSection === 'gallery' && renderGalleryPreviews()}
              {activeSection === 'audio' && renderAudioPreview()}
              {renderMediaUploadControls()}
              {activeSection === 'couple' && (
                <>
                  <FontFamilyPicker value={form.font_family} onChange={(value) => update('font_family', value)} />
                  <TemplatePicker value={form.template} onChange={(value) => update('template', value)} />
                  <label className="col-span-full flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:border-[#344458] dark:bg-[#101923] dark:text-slate-200 sm:w-fit">
                    <input className="h-4 w-4 accent-[#D6B15C]" type="checkbox" checked={form.is_published} onChange={(event) => update('is_published', event.target.checked)} />
                    {t('dashboard.fields.published')}
                  </label>
                </>
              )}
              {renderSectionVisibilityToggle(activeSection, form, update, t)}
            </div>
          </div>
        </CustomModal>
        <ConfirmationDialog
          isOpen={Boolean(deleteCandidate)}
          onClose={() => setDeleteCandidate(null)}
          onConfirm={() => removeInvitation(deleteCandidate)}
          confirmLoading={loading}
          title={t('dashboard.confirm_delete.title')}
          message={t('dashboard.confirm_delete.message', { name: localizedText(deleteCandidate?.couple_display_name, i18n.resolvedLanguage || i18n.language, '') })}
          confirmText={t('dashboard.actions.delete')}
          cancelText={t('common.close')}
        />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <DashboardLayout
        activeView={view}
        invitationsCount={invitations.length}
        eidCount={eidCount}
        birthdayCount={birthdayCount}
        onCreate={startNew}
        onShowCompleted={showCompleted}
        onCreateEid={() => navigate('/eid-greetings/new')}
        onCreateBirthday={() => navigate('/birthday-greetings/new')}
        onShowSettings={() => navigate('/settings')}
      >
        {view === 'invitations' ? (
          <InvitationsOverview invitations={invitations} demoInvitations={demoInvitations} language={i18n.resolvedLanguage || i18n.language} loading={loading} onDelete={setDeleteCandidate} onEdit={editInvitation} onPageChange={setInvitationPage} pagination={pagination} publicBaseUrl={publicBaseUrl} stats={stats} status={status} t={t} onCreateNew={startNew} editLoadingId={editLoadingId} searchQuery={searchQuery} setSearchQuery={setSearchQuery} templateFilter={templateFilter} setTemplateFilter={setTemplateFilter} typeFilter={typeFilter} setTypeFilter={setTypeFilter} dateFilter={dateFilter} setDateFilter={setDateFilter} sortOrder={sortOrder} setSortOrder={setSortOrder} />
        ) : (
          editorContent
        )}
      </DashboardLayout>
      <CustomModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        eyebrow={t('dashboard.editor.edit_kicker')}
        title={t('dashboard.editor.edit_title')}
        headerActions={modalActions}
      >
        {publicUrl && <div className="mb-4 flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm dark:border-[#263547] dark:bg-[#0e1721] sm:flex-row sm:items-center"><span className="min-w-0 flex-1 truncate px-2 text-sm text-slate-600 dark:text-slate-300" dir="ltr">{publicUrl}</span><button type="button" onClick={() => navigator.clipboard?.writeText(publicUrl)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gold px-4 text-sm font-black text-[#111820] transition hover:bg-[#f0cf83]"><FiCopy /> {t('dashboard.actions.copy')}</button><a href={publicUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-gold hover:text-[#8a6d2f] dark:border-[#344458] dark:bg-[#101923] dark:text-white dark:hover:text-gold"><FiExternalLink /> {t('dashboard.actions.open')}</a></div>}
        <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-[#263547] dark:bg-[#0b131c]">
          <ContentLocaleSwitcher value={editorLocale} onChange={setEditorLocale} />
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-[#263547] dark:bg-[#0b131c]">
          <nav className="overflow-x-auto border-b border-slate-100 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-[#101923]">
            <ol className="flex min-w-max items-center gap-2">
              {sections.map((section, index) => (
                <li key={section.id} className="flex items-center gap-2">
                  <button type="button" className={`grid min-h-12 grid-cols-[auto_1fr] items-center gap-2 rounded-lg border px-3 text-start text-sm font-black transition ${activeSection === section.id ? 'border-[#111820] bg-[#111820] text-white dark:border-gold dark:bg-gold dark:text-[#111820]' : 'border-slate-200 bg-white text-slate-500 hover:border-gold hover:text-slate-900 dark:border-[#344458] dark:bg-[#0b131c] dark:text-slate-300 dark:hover:border-gold dark:hover:text-white'}`} onClick={() => setActiveSection(section.id)}>
                    <span className={`grid h-7 w-7 place-items-center rounded-full text-xs ${activeSection === section.id ? 'bg-white/15 dark:bg-[#111820]/15' : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-200'}`}>{index + 1}</span>
                    <span>{t(section.label)}</span>
                  </button>
                  {index < sections.length - 1 ? <span className="h-px w-6 bg-slate-200 dark:bg-[#344458]" /> : null}
                </li>
              ))}
            </ol>
          </nav>
          <div className={`grid gap-4 p-4 sm:p-5 ${activeSection === 'story' || activeSection === 'gallery' ? '' : 'md:grid-cols-2'}`}>
            {renderEditorFields()}
            {activeSection === 'gallery' && renderGalleryPreviews()}
            {activeSection === 'audio' && renderAudioPreview()}
            {renderMediaUploadControls()}
            {activeSection === 'couple' && (
              <>
                <FontFamilyPicker value={form.font_family} onChange={(value) => update('font_family', value)} />
                <TemplatePicker value={form.template} onChange={(value) => update('template', value)} />
                <label className="col-span-full flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:border-[#344458] dark:bg-[#101923] dark:text-slate-200 sm:w-fit">
                  <input className="h-4 w-4 accent-[#D6B15C]" type="checkbox" checked={form.is_published} onChange={(event) => update('is_published', event.target.checked)} />
                  {t('dashboard.fields.published')}
                </label>
              </>
            )}
            {renderSectionVisibilityToggle(activeSection, form, update, t, 'text-[#D6B15C]')}
          </div>
        </div>
      </CustomModal>
      <ConfirmationDialog
        isOpen={Boolean(deleteCandidate)}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={() => removeInvitation(deleteCandidate)}
        confirmLoading={loading}
        title={t('dashboard.confirm_delete.title')}
        message={t('dashboard.confirm_delete.message', { name: localizedText(deleteCandidate?.couple_display_name, i18n.resolvedLanguage || i18n.language, '') })}
        confirmText={t('dashboard.actions.delete')}
        cancelText={t('common.close')}
      />
    </>
  );
}
