import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { FiCopy, FiEdit2, FiExternalLink, FiSave, FiTrash2, FiImage, FiUpload } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import { uploadMedia } from '../../../utils/mediaUploadApi';
import Field from '../../components/Field';
import DashboardLayout from '../../DashboardLayout';
import ContentLocaleSwitcher from '../../components/ContentLocaleSwitcher';
import BirthdayTemplatePicker from '../../components/BirthdayTemplatePicker';
import FontFamilyPicker from '../../components/FontFamilyPicker';
import { ConfirmationDialog, CustomModal, Pagination, CustomBottom, Loading, CustomInput } from '../../../components';
import { useToast } from '../../../components/ToastProvider';
import { birthdayGreetingsApi } from '../../../utils/birthdayGreetingsApi';
import { invitationsApi } from '../../../utils/invitationsApi';
import { eidGreetingsApi } from '../../../utils/eidGreetingsApi';
import { createEmptyBirthdayForm, hydrateBirthdayGreeting, serializeBirthdayGreeting } from '../../../utils/birthdayContent';
import { useDocumentTitle } from '../../../utils/useDocumentTitle';
import { getBackendUrl, getFrontendUrl, getBackendMode } from '../../../utils/apiConfig';
import { getTemplateGlobalId } from '../../../utils/templateRegistry';

const sections = [
  { id: 'basic', label: 'Basics' },
  { id: 'hero', label: 'Hero' },
  { id: 'countdown', label: 'Countdown' },
  { id: 'wishes', label: 'Wishes' },
  { id: 'album', label: 'Album' },
  { id: 'letter', label: 'Envelope Letter' },
  { id: 'audio', label: 'Audio' },
  { id: 'footer', label: 'Footer' },
];

const fields = {
  basic: [
    ['recipient_name', 'Recipient Name'],
    ['sender_name', 'Sender Name'],
    ['public_path', 'Route Path'],
    ['requester_name', 'Requester Name (optional)'],
    ['requester_whatsapp', 'WhatsApp Number (optional)', false, 'tel'],
    ['order_date', 'Order Date (optional)', false, 'date'],
    ['content.basic.passcode', 'Unlock Passcode'],
  ],
  hero: [
    ['content.hero.kicker', 'Kicker Text'],
    ['content.hero.quote', 'Quote Message', true],
    ['content.hero.birthdate', 'Birthdate (e.g. 11 • 06 • 2009)'],
    ['content.hero.avatar_subtitle', 'Polaroid Avatar Caption Description'],
  ],
  countdown: [
    ['content.countdown.target_date', 'Target Date (ISO e.g. 2026-06-11T00:00:00+03:00)'],
    ['content.countdown.title', 'Section Title Label'],
    ['content.countdown.pending_text', 'Pending Message Text'],
    ['content.countdown.completed_title', 'Completed Birthday Title'],
    ['content.countdown.completed_text', 'Completed Celebration Description', true],
  ],
  wishes: [
    ['content.wishes.title', 'Section Header Title'],
    ['content.wishes.items_text', 'Wishes (one per line): Text | Tag1, Tag2', true],
  ],
  album: [
    ['content.album.title', 'Section Header Title'],
    ['content.album.description', 'Section Description Header', true],
    ['content.album.images_text', 'Memory Photo URLs (one per line)', true],
  ],
  letter: [
    ['content.letter.title', 'Envelope Seal Button Label'],
    ['content.letter.description', 'Envelope Outer Helper Text'],
    ['content.letter.letter_title', 'Inner Letter Subject Header'],
    ['content.letter.letter_content', 'Letter Paragraph Content (multi-line)', true],
    ['content.letter.love_phrase', 'Signature Love Expression Note'],
  ],
  audio: [
    ['content.audio.url', 'Background Music Link (MP3 url or YouTube link)'],
  ],
  footer: [
    ['content.footer.text', 'Footer Main Text Description'],
    ['content.footer.whatsapp', 'Support WhatsApp Mobile Number'],
  ],
};

const getValue = (source, path) => path.split('.').reduce((value, key) => value?.[key], source);
const setValue = (source, path, value) => {
  const next = structuredClone(source);
  const keys = path.split('.');
  let target = next;
  keys.slice(0, -1).forEach((key) => { target[key] = target[key] || {}; target = target[key]; });
  target[keys.at(-1)] = value;
  return next;
};
const createCode = () => String(Math.floor(Math.random() * 10000)).padStart(4, '0');
const slugPart = (value, fallback) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || fallback;
const createPath = (recipient, sender, code) => `${slugPart(recipient, 'recipient')}-${slugPart(sender, 'sender')}-${code}`;

const normalizeMediaUrl = (url) => {
  if (!url) return '';
  if (typeof url !== 'string') return url;
  if (url.startsWith('http://localhost/storage/')) {
    const apiBase = getBackendUrl();
    try {
      const urlObj = new URL(apiBase);
      const apiHost = urlObj.origin;
      return url.replace('http://localhost', apiHost);
    } catch (e) {
      return url;
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

const appendLines = (text, newLines) => {
  const current = String(text || '').trim();
  const added = newLines.join('\n');
  return current ? `${current}\n${added}` : added;
};


const BirthdayOverview = ({
  greetings,
  loading,
  onDelete,
  onEdit,
  onPageChange,
  pagination,
  publicBaseUrl,
  status,
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
  const demoGreetings = greetings.filter((inv) => inv.is_demo || (inv.public_path && inv.public_path.startsWith('demo')));
  const clientGreetings = greetings.filter((inv) => !(inv.is_demo || (inv.public_path && inv.public_path.startsWith('demo'))));

  const renderGreetingCard = (greeting) => {
    const backendMode = getBackendMode();
    const querySuffix = backendMode === 'local' ? '?backend=local' : '';
    const publicUrl = greeting.public_path ? `${publicBaseUrl}/birthday/${greeting.public_path}${querySuffix}` : '';
    const isDemo = greeting.is_demo || (greeting.public_path && greeting.public_path.startsWith('demo'));
    const isEditLoading = editLoadingId === greeting.id;

    return (
      <article key={greeting.id} className="relative flex flex-col justify-between gap-5 rounded-xl border border-slate-200 bg-white p-4 dark:border-[#253141] dark:bg-[#0d1620] sm:p-5">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-700 dark:bg-white/10 dark:text-slate-200">
              ID {getTemplateGlobalId('birthday', greeting.template || 'default')}
            </span>
            {isDemo && (
              <span className="rounded-md bg-gold/25 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-gold">DEMO</span>
            )}
            <span className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${greeting.is_published ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/45 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/45 dark:text-rose-400'}`}>{greeting.is_published ? 'Published' : 'Draft'}</span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:bg-white/5 dark:text-slate-400">{greeting.locale || 'en'}</span>
          </div>
          <strong className="block truncate text-lg font-black">{greeting.recipient_name}</strong>
          <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">From: {greeting.sender_name}</p>
          {publicUrl ? <a href={publicUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 truncate text-xs font-semibold text-gold hover:underline" dir="ltr"><FiExternalLink /> {publicUrl}</a> : null}
        </div>
        <div className="mobile-card-actions flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-white/5">
          <button type="button" onClick={() => onEdit(greeting)} disabled={isEditLoading} className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 hover:border-gold hover:text-[#8a6d2f] dark:border-[#2a3646] dark:bg-[#101923] dark:text-slate-300 dark:hover:text-gold">
            {isEditLoading ? (
              <svg className="animate-spin h-3.5 w-3.5 text-slate-500 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : <FiEdit2 className="mr-1" />}
            Edit
          </button>
          {publicUrl ? <button type="button" onClick={() => navigator.clipboard?.writeText(publicUrl)} className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 hover:border-gold hover:text-[#8a6d2f] dark:border-[#2a3646] dark:bg-[#101923] dark:text-slate-300 dark:hover:text-gold"><FiCopy /> Copy Link</button> : null}
          <button type="button" onClick={() => onDelete(greeting)} className="ms-auto inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-rose-50 px-3 text-xs font-black text-rose-700 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-950/45"><FiTrash2 /> Delete</button>
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
            Birthday greetings
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-black tracking-normal ${getBackendMode() === 'local' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/45 dark:text-amber-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-950/45 dark:text-blue-400'}`}>
              {getBackendMode() === 'local' ? 'LOCAL DB | محلي' : 'GLOBAL DB | عام'}
            </span>
          </h1>
        </div>
        <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 dark:border-[#2a3646] dark:bg-[#101923] dark:text-slate-300">{status}</span>
      </header>

      {/* Search & Filter Controls */}
      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-[#253141] dark:bg-[#0b131c]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
          <div className="lg:col-span-2 md:col-span-2">
            <CustomInput
              label="Search"
              labelClassName="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block"
              placeholder="Search by recipient, sender, path..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              inputClassName="w-full text-slate-900 border-slate-200 bg-slate-50 placeholder:text-slate-400 dark:bg-[#101923] dark:border-[#273445] dark:text-white py-2"
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
              Template
            </label>
            <select
              value={templateFilter}
              onChange={(e) => setTemplateFilter(e.target.value)}
              className="w-full h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-gold dark:border-[#273445] dark:bg-[#101923] dark:text-white"
            >
              <option value="">All Templates</option>
              <option value="default">Default</option>
              <option value="romantic">Love & Velvet</option>
              <option value="neon">Neon</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-gold dark:border-[#273445] dark:bg-[#101923] dark:text-white"
            >
              <option value="">All Types</option>
              <option value="real">Client Templates</option>
              <option value="demo">Demos</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
              Date
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
              Sort By
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-gold dark:border-[#273445] dark:bg-[#101923] dark:text-white"
            >
              <option value="latest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </section>

      {/* Seeded Database Demos Section */}
      {demoGreetings.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-sm font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            Template Live Demos
          </h2>
          <div className="grid gap-3 p-4 sm:p-5 xl:grid-cols-2 rounded-lg border border-slate-200 bg-white shadow-sm dark:border-[#253141] dark:bg-[#0b131c]">
            {demoGreetings.map((greeting) => renderGreetingCard(greeting))}
          </div>
        </section>
      )}

      <h2 className="mb-4 text-sm font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
        Your Created Greetings
      </h2>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-[#253141] dark:bg-[#0b131c]">
        <div className="grid gap-3 p-4 sm:p-5 xl:grid-cols-2">
          {loading ? (
            <div className="col-span-full">
              <Loading message="Working..." />
            </div>
          ) : clientGreetings.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-[#344458]">No birthday greetings yet.</div>
          ) : clientGreetings.map((greeting) => renderGreetingCard(greeting))}
        </div>
        {pagination && pagination.last_page > 1 ? (
          <div className="border-t border-slate-200 p-4 dark:border-[#253141]">
            <Pagination currentPage={pagination.current_page} totalPages={pagination.last_page} onPageChange={onPageChange} />
          </div>
        ) : null}
      </section>
    </>
  );
};

export default function BirthdayGreetingsPage({ embedded = false, active = true, studioMode = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [activeSection, setActiveSection] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Checking database connection...');
  const [greetings, setGreetings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(() => createEmptyBirthdayForm());
  const [saveLoading, setSaveLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [templateFilter, setTemplateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('latest');
  const [editLoadingId, setEditLoadingId] = useState(null);

  const handleAlbumUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setLoading(true);
    setStatus('Uploading album images...');
    try {
      const uploads = await Promise.all(files.map((file) => uploadMedia(file, 'gallery')));
      const urls = uploads.map((upload) => upload.url).filter(Boolean);

      update('content.album.images_text', appendLines(getValue(form, 'content.album.images_text'), urls));
      setStatus(`Uploaded ${urls.length} image(s). Save the greeting to publish.`);
      toast.success(`Uploaded ${urls.length} image(s). Save to publish.`);
    } catch (error) {
      setStatus(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  const handleRemoveAlbumImage = (indexToRemove) => {
    const imageUrls = String(getValue(form, 'content.album.images_text') || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const filtered = imageUrls.filter((_, idx) => idx !== indexToRemove);
    update('content.album.images_text', filtered.join('\n'));
  };

  const renderAlbumUploadControls = () => {
    if (activeSection !== 'album') return null;

    const imageUrls = String(getValue(form, 'content.album.images_text') || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    return (
      <div className="col-span-full grid gap-4">
        {/* File Input and Drag area */}
        <label className="grid gap-3 rounded-lg border border-dashed border-[#b49344]/60 bg-[#fff8e6] p-4 text-sm font-bold text-slate-700 dark:border-gold/50 dark:bg-gold/10 dark:text-slate-100 cursor-pointer">
          <span className="flex items-center gap-2 text-sm font-black text-slate-950 dark:text-white"><FiImage /> Upload album images from device</span>
          <span className="text-xs leading-6 text-slate-500 dark:text-slate-300">Select one or more images. Their uploaded URLs will be added to the album.</span>
          <span className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-lg bg-[#111820] px-4 text-sm font-black text-white transition hover:bg-[#22303d] dark:bg-gold dark:text-[#111820] dark:hover:bg-[#f0cf83]">
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
          <input className="sr-only" type="file" accept="image/*" multiple disabled={loading} onChange={handleAlbumUpload} />
        </label>

        {/* Gallery Preview */}
        <div>
          <h3 className="mb-3 text-sm font-black text-slate-950 dark:text-white">
            Album Images Preview
          </h3>
          {imageUrls.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-[#344458] dark:bg-[#101923] dark:text-slate-400">
              No images uploaded yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {imageUrls.map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm dark:border-[#273445] dark:bg-[#0b131c]"
                >
                  <img
                    src={normalizeMediaUrl(url)}
                    alt={`Album item ${index + 1}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/150?text=Broken+Image';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveAlbumImage(index)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-600 text-white transition hover:bg-rose-700"
                      title="Delete"
                    >
                      <FiTrash2 className="text-base" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAudioPreview = () => {
    if (activeSection !== 'audio') return null;

    const src = getValue(form, 'content.audio.url') || '';
    const youtubeId = getYouTubeId(src);

    return (
      <div className="col-span-full grid gap-4">
        {src && (
          <div>
            <h3 className="mb-3 text-sm font-black text-slate-950 dark:text-white">
              Audio Player Preview
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
                onClick={() => update('content.audio.url', '')}
                className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-lg bg-rose-950 px-4 text-sm font-black text-rose-50 transition hover:bg-rose-900"
              >
                <FiTrash2 /> Remove Audio Link
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const activeFieldsFiltered = useMemo(() => {
    const activeFieldsList = fields[activeSection] || [];
    return activeFieldsList.filter(([path]) => {
      if (activeSection === 'album' && path === 'content.album.images_text') return false;
      return true;
    });
  }, [activeSection]);

  const [invitationsCount, setInvitationsCount] = useState(0);
  const [eidCount, setEidCount] = useState(0);

  const view = useMemo(() => {
    if (location.pathname === '/birthday-greetings/new') return 'birthday-editor';
    return 'birthday';
  }, [location.pathname]);

  const loadSidebarCounts = useCallback(async () => {
    try {
      const invResponse = await invitationsApi.list(1);
      setInvitationsCount(invResponse.meta?.total || invResponse.data?.length || 0);
    } catch (err) {
      console.error(err);
    }

    try {
      const eidResponse = await eidGreetingsApi.list(1);
      setEidCount(eidResponse.meta?.total || eidResponse.data?.length || 0);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadGreetings = useCallback(async () => {
    setLoading(true);
    try {
      const isDemoValue = typeFilter === 'demo' ? 'true' : (typeFilter === 'real' ? 'false' : '');
      const response = await birthdayGreetingsApi.list(page, {
        search: searchQuery,
        template: templateFilter,
        is_demo: isDemoValue,
        date: dateFilter,
        sort: sortOrder,
      });
      setGreetings(response.data || []);
      setPagination(response.meta || null);
      setStatus('Operational');
    } catch (err) {
      console.error(err);
      setStatus('Offline');
      toast.error('Failed to load birthday greetings.');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, templateFilter, typeFilter, dateFilter, sortOrder, toast]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, templateFilter, typeFilter, dateFilter, sortOrder]);

  useEffect(() => {
    if (view !== 'birthday-editor') {
      if (!embedded || active) {
        loadGreetings();
      }
    }
    if (!embedded) {
      loadSidebarCounts();
    }
  }, [loadGreetings, loadSidebarCounts, embedded, active, view]);

  const startNew = (templateId) => {
    const targetTemplate = typeof templateId === 'string' ? templateId : 'default';
    setEditingId(null);
    setForm({
      ...createEmptyBirthdayForm('en'),
      template: targetTemplate
    });
    setActiveSection('basic');
    navigate(`/birthday-greetings/new?template=${targetTemplate}`);
    setStatus('Creating new Birthday greeting');
  };

  useEffect(() => {
    if (view === 'birthday-editor') {
      const queryParams = new URLSearchParams(location.search);
      const template = queryParams.get('template');
      const isTemplatePreview = queryParams.get('templatePreview') === '1';
      const previewCode = createCode();
      setEditingId(null);
      setForm(prev => ({
        ...createEmptyBirthdayForm('en'),
        template: template || (prev && prev.template ? prev.template : 'default'),
        ...(isTemplatePreview ? {
          recipient_name: 'Birthday Star',
          sender_name: 'Someone Special',
          public_path: createPath('Birthday Star', 'Someone Special', previewCode),
        } : {}),
      }));
      setActiveSection('basic');
      setStatus('Creating new Birthday greeting');
    }
  }, [view, location.search]);

  useEffect(() => {
    if (!studioMode || window.parent === window) return undefined;
    window.parent.postMessage({
      type: 'wil-template-preview-data',
      category: 'birthday',
      data: serializeBirthdayGreeting(form),
    }, '*');
    return undefined;
  }, [form, studioMode]);

  useEffect(() => {
    if (!studioMode) return undefined;
    const handleStudioMessage = (event) => {
      if (event.data?.type !== 'wil-template-language') return;
      const locale = event.data.locale === 'ar' ? 'ar' : 'en';
      setForm((current) => ({
        ...createEmptyBirthdayForm(locale),
        recipient_name: locale === 'ar' ? 'نجمة عيد الميلاد' : 'Birthday Star',
        sender_name: locale === 'ar' ? 'شخص مميز' : 'Someone Special',
        public_path: current.public_path,
        requester_name: current.requester_name,
        requester_whatsapp: current.requester_whatsapp,
        order_date: current.order_date,
        template: current.template,
        font_family: current.font_family,
        is_published: current.is_published,
      }));
    };
    window.addEventListener('message', handleStudioMessage);
    return () => window.removeEventListener('message', handleStudioMessage);
  }, [studioMode]);

  const editGreeting = async (greeting) => {
    setEditLoadingId(greeting.id);
    setStatus('Loading Birthday greeting...');
    try {
      const response = await birthdayGreetingsApi.show(greeting.id);
      const fullGreeting = response?.data || greeting;
      setEditingId(greeting.id);
      setForm(hydrateBirthdayGreeting(fullGreeting));
      setActiveSection('basic');
      setIsEditModalOpen(true);
      setStatus('Operational');
    } catch (err) {
      console.error(err);
      setStatus(err.message || 'Failed to load Birthday greeting.');
      toast.error(err.message || 'Failed to load Birthday greeting.');
    } finally {
      setEditLoadingId(null);
    }
  };

  const removeGreeting = async (greeting) => {
    setLoading(true);
    try {
      await birthdayGreetingsApi.remove(greeting.id);
      toast.success('Birthday greeting deleted.');
      setDeleteCandidate(null);
      loadGreetings();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete greeting.');
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    const recipientName = form.recipient_name?.trim();
    const senderName = form.sender_name?.trim();
    const publicPath = form.public_path?.trim();

    if (!recipientName) {
      toast.error('Recipient name is required.');
      return;
    }
    if (!senderName) {
      toast.error('Sender name is required.');
      return;
    }
    if (!publicPath) {
      toast.error('Route name (public path) is required.');
      return;
    }

    setSaveLoading(true);
    setStatus('Saving Birthday greeting...');
    const payload = serializeBirthdayGreeting(form);
    try {
      if (editingId) {
        await birthdayGreetingsApi.update(editingId, payload);
        toast.success('Birthday greeting updated.');
      } else {
        await birthdayGreetingsApi.create(payload);
        toast.success('Birthday greeting created.');
      }
      setStatus('Birthday greeting saved');
      setIsEditModalOpen(false);
      if (view === 'birthday-editor') {
        navigate('/completed');
      } else {
        loadGreetings();
      }
    } catch (err) {
      console.error(err);
      setStatus(err.message || 'Failed to save birthday greeting.');
      toast.error(err.message || 'Failed to save birthday greeting.');
    } finally {
      setSaveLoading(false);
    }
  };

  const update = (path, value) => {
    setForm((current) => {
      let next = setValue(current, path, value);
      if (path === 'recipient_name' || path === 'sender_name') {
        const routeCode = String(current.public_path || '').split('-').at(-1) || createCode();
        next.public_path = createPath(next.recipient_name, next.sender_name, routeCode);
      }
      return next;
    });
  };

  const backendMode = getBackendMode();
  const publicBaseUrl = getFrontendUrl();
  const querySuffix = backendMode === 'local' ? '?backend=local' : '';
  const publicUrl = form.public_path ? `${publicBaseUrl}/birthday/${form.public_path}${querySuffix}` : '';
  const pageTitle = view === 'birthday-editor' ? 'Create Birthday greeting | WIL' : 'Birthday greetings | WIL';
  useDocumentTitle(pageTitle);


  const modalActions = (
    <div className="mobile-stack-actions flex w-full items-center justify-between gap-2">
      <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 dark:border-[#344458] dark:bg-[#101923] dark:text-slate-300">{status}</span>
      <CustomBottom
        text="Save"
        onClick={save}
        loading={saveLoading}
        loadingText="Saving..."
        buttonStyles="min-h-10 py-2.5 px-4 text-sm normal-case tracking-normal bg-[#111820] text-white hover:bg-[#22303d] dark:bg-gold dark:text-[#111820] font-black transition hover:scale-[1.02] cursor-pointer"
        styles="w-fit"
        rightIcon={<FiSave />}
      />
    </div>
  );

  const editor = (
    <>
      <header className="mb-5 flex flex-col gap-4 lg:mb-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-[#8a6d2f]">Birthday template editor</p>
          <h1 className="text-4xl font-black text-slate-950 dark:text-white">Manage Birthday greeting data</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 dark:border-[#344458] dark:bg-[#101923] dark:text-slate-300">{status}</span>
          <CustomBottom
            text="Save"
            onClick={save}
            loading={saveLoading}
            loadingText="Saving..."
            buttonStyles="min-h-10 py-2.5 px-4 text-sm normal-case tracking-normal bg-[#111820] text-white hover:bg-[#22303d] dark:bg-gold dark:text-[#111820] font-black transition hover:scale-[1.02] cursor-pointer"
            styles="w-fit"
            rightIcon={<FiSave />}
          />
        </div>
      </header>
      {publicUrl ? (
        <div className="mb-4 flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-2 dark:border-[#263547] dark:bg-[#0e1721] sm:flex-row sm:items-center">
          <span className="min-w-0 flex-1 truncate px-2 text-sm text-slate-600 dark:text-slate-300" dir="ltr">
            {publicUrl}
          </span>
          <button type="button" onClick={() => navigator.clipboard?.writeText(publicUrl)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gold px-4 text-sm font-black text-[#111820]">
            <FiCopy /> Copy
          </button>
        </div>
      ) : null}
      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-[#263547] dark:bg-[#0b131c]">
        <ContentLocaleSwitcher
          value={form.locale}
          onChange={(locale) => setForm({
            ...createEmptyBirthdayForm(locale),
            recipient_name: form.recipient_name,
            sender_name: form.sender_name,
            public_path: form.public_path,
            requester_name: form.requester_name,
            requester_whatsapp: form.requester_whatsapp,
            order_date: form.order_date,
            template: form.template,
            font_family: form.font_family,
            is_published: form.is_published,
          })}
        />
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-[#263547] dark:bg-[#0b131c]">
        <nav className="overflow-x-auto border-b border-slate-100 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-[#101923]">
          <ol className="flex min-w-max items-center gap-2">
            {sections.map((section, index) => (
              <li key={section.id} className="flex items-center gap-2">
                <button type="button" onClick={() => setActiveSection(section.id)} className={`grid min-h-12 grid-cols-[auto_1fr] items-center gap-2 rounded-lg border px-3 text-start text-sm font-black transition ${activeSection === section.id ? 'border-[#111820] bg-[#111820] text-white dark:border-gold dark:bg-gold dark:text-[#111820]' : 'border-slate-200 bg-white text-slate-500 dark:border-[#344458] dark:bg-[#0b131c] dark:text-slate-300'}`}>
                  <span className="grid h-7 w-7 place-items-center rounded-full text-xs">{index + 1}</span>
                  <span>{section.label}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <div className={`grid gap-4 p-4 sm:p-5 ${activeSection === 'wishes' || activeSection === 'album' ? '' : 'md:grid-cols-2'}`}>
          {activeFieldsFiltered.map(([path, label, textarea, type]) => <Field key={path} label={label} value={getValue(form, path)} textarea={textarea} type={type} onChange={(value) => update(path, value)} />)}
          {activeSection === 'album' && renderAlbumUploadControls()}
          {activeSection === 'audio' && renderAudioPreview()}
          {activeSection === 'basic' ? (
            <>
              <FontFamilyPicker value={form.font_family} onChange={(value) => update('font_family', value)} />
              <BirthdayTemplatePicker value={form.template} onChange={(value) => update('template', value)} />
              <label className="col-span-full flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:border-[#344458] dark:bg-[#101923] dark:text-slate-200 sm:w-fit"><input className="h-4 w-4 accent-[#D6B15C]" type="checkbox" checked={form.is_published} onChange={(event) => update('is_published', event.target.checked)} /> Published</label>
            </>
          ) : null}
        </div>
      </div>
    </>
  );

  const isEditorView = view === 'birthday-editor';

  if (embedded) {
    return (
      <>
        {isEditorView ? editor : <BirthdayOverview greetings={greetings} loading={loading} onDelete={setDeleteCandidate} onEdit={editGreeting} onPageChange={setPage} pagination={pagination} publicBaseUrl={publicBaseUrl} status={status} onCreateNew={startNew} editLoadingId={editLoadingId} searchQuery={searchQuery} setSearchQuery={setSearchQuery} templateFilter={templateFilter} setTemplateFilter={setTemplateFilter} typeFilter={typeFilter} setTypeFilter={setTypeFilter} dateFilter={dateFilter} setDateFilter={setDateFilter} sortOrder={sortOrder} setSortOrder={setSortOrder} />}
        <CustomModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          eyebrow="Birthday template editor"
          title="Edit Birthday greeting"
          headerActions={modalActions}
        >
          {publicUrl ? <div className="mb-4 flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-2 dark:border-[#263547] dark:bg-[#0e1721] sm:flex-row sm:items-center"><span className="min-w-0 flex-1 truncate px-2 text-sm text-slate-600 dark:text-slate-300" dir="ltr">{publicUrl}</span><button type="button" onClick={() => navigator.clipboard?.writeText(publicUrl)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gold px-4 text-sm font-black text-[#111820]"><FiCopy /> Copy</button></div> : null}
          <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-[#263547] dark:bg-[#0b131c]">
            <ContentLocaleSwitcher
              value={form.locale}
              onChange={(locale) => setForm({
                ...createEmptyBirthdayForm(locale),
                recipient_name: form.recipient_name,
                sender_name: form.sender_name,
                public_path: form.public_path,
                requester_name: form.requester_name,
                requester_whatsapp: form.requester_whatsapp,
                order_date: form.order_date,
                font_family: form.font_family,
                is_published: form.is_published,
              })}
            />
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-[#263547] dark:bg-[#0b131c]">
            <nav className="overflow-x-auto border-b border-slate-100 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-[#101923]"><ol className="flex min-w-max items-center gap-2">{sections.map((section, index) => <li key={section.id} className="flex items-center gap-2"><button type="button" onClick={() => setActiveSection(section.id)} className={`grid min-h-12 grid-cols-[auto_1fr] items-center gap-2 rounded-lg border px-3 text-start text-sm font-black transition ${activeSection === section.id ? 'border-[#111820] bg-[#111820] text-white dark:border-gold dark:bg-gold dark:text-[#111820]' : 'border-slate-200 bg-white text-slate-500 dark:border-[#344458] dark:bg-[#0b131c] dark:text-slate-300'}`}><span className="grid h-7 w-7 place-items-center rounded-full text-xs">{index + 1}</span><span>{section.label}</span></button></li>)}</ol></nav>
            <div className={`grid gap-4 p-4 sm:p-5 ${activeSection === 'wishes' || activeSection === 'album' ? '' : 'md:grid-cols-2'}`}>
              {activeFieldsFiltered.map(([path, label, textarea, type]) => <Field key={path} label={label} value={getValue(form, path)} textarea={textarea} type={type} onChange={(value) => update(path, value)} />)}
              {activeSection === 'album' && renderAlbumUploadControls()}
              {activeSection === 'audio' && renderAudioPreview()}
              {activeSection === 'basic' ? (
                <>
                  <FontFamilyPicker value={form.font_family} onChange={(value) => update('font_family', value)} />
                  <BirthdayTemplatePicker value={form.template} onChange={(value) => update('template', value)} />
                  <label className="col-span-full flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:border-[#344458] dark:bg-[#101923] dark:text-slate-200 sm:w-fit"><input className="h-4 w-4 accent-[#D6B15C]" type="checkbox" checked={form.is_published} onChange={(event) => update('is_published', event.target.checked)} /> Published</label>
                </>
              ) : null}
            </div>
          </div>
        </CustomModal>
        <ConfirmationDialog isOpen={Boolean(deleteCandidate)} onClose={() => setDeleteCandidate(null)} onConfirm={() => removeGreeting(deleteCandidate)} confirmLoading={loading} title="Delete Birthday greeting?" message={`Delete ${deleteCandidate?.recipient_name || ''}?`} confirmText="Delete" cancelText="Close" />
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
        invitationsCount={invitationsCount}
        eidCount={eidCount}
        birthdayCount={greetings.length}
        onCreate={() => navigate('/invitations/new')}
        onShowCompleted={() => navigate('/completed')}
        onCreateEid={() => navigate('/eid-greetings/new')}
        onCreateBirthday={startNew}
        onShowSettings={() => navigate('/settings')}
      >
        {isEditorView ? editor : <BirthdayOverview greetings={greetings} loading={loading} onDelete={setDeleteCandidate} onEdit={editGreeting} onPageChange={setPage} pagination={pagination} publicBaseUrl={publicBaseUrl} status={status} onCreateNew={startNew} editLoadingId={editLoadingId} searchQuery={searchQuery} setSearchQuery={setSearchQuery} templateFilter={templateFilter} setTemplateFilter={setTemplateFilter} typeFilter={typeFilter} setTypeFilter={setTypeFilter} dateFilter={dateFilter} setDateFilter={setDateFilter} sortOrder={sortOrder} setSortOrder={setSortOrder} />}
      </DashboardLayout>
      <CustomModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} eyebrow="Birthday template editor" title="Edit Birthday greeting" headerActions={modalActions}>
        {publicUrl ? <div className="mb-4 flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-2 dark:border-[#263547] dark:bg-[#0e1721] sm:flex-row sm:items-center"><span className="min-w-0 flex-1 truncate px-2 text-sm text-slate-600 dark:text-slate-300" dir="ltr">{publicUrl}</span><button type="button" onClick={() => navigator.clipboard?.writeText(publicUrl)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gold px-4 text-sm font-black text-[#111820]"><FiCopy /> Copy</button></div> : null}
        <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-[#263547] dark:bg-[#0b131c]">
          <ContentLocaleSwitcher
            value={form.locale}
            onChange={(locale) => setForm({
              ...createEmptyBirthdayForm(locale),
              recipient_name: form.recipient_name,
              sender_name: form.sender_name,
              public_path: form.public_path,
              requester_name: form.requester_name,
              requester_whatsapp: form.requester_whatsapp,
              order_date: form.order_date,
              font_family: form.font_family,
              is_published: form.is_published,
            })}
          />
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-[#263547] dark:bg-[#0b131c]">
          <nav className="overflow-x-auto border-b border-slate-100 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-[#101923]"><ol className="flex min-w-max items-center gap-2">{sections.map((section, index) => <li key={section.id} className="flex items-center gap-2"><button type="button" onClick={() => setActiveSection(section.id)} className={`grid min-h-12 grid-cols-[auto_1fr] items-center gap-2 rounded-lg border px-3 text-start text-sm font-black transition ${activeSection === section.id ? 'border-[#111820] bg-[#111820] text-white dark:border-gold dark:bg-gold dark:text-[#111820]' : 'border-slate-200 bg-white text-slate-500 dark:border-[#344458] dark:bg-[#0b131c] dark:text-slate-300'}`}><span className="grid h-7 w-7 place-items-center rounded-full text-xs">{index + 1}</span><span>{section.label}</span></button></li>)}</ol></nav>
          <div className={`grid gap-4 p-4 sm:p-5 ${activeSection === 'wishes' || activeSection === 'album' ? '' : 'md:grid-cols-2'}`}>
            {activeFieldsFiltered.map(([path, label, textarea, type]) => <Field key={path} label={label} value={getValue(form, path)} textarea={textarea} type={type} onChange={(value) => update(path, value)} />)}
            {activeSection === 'album' && renderAlbumUploadControls()}
            {activeSection === 'audio' && renderAudioPreview()}
            {activeSection === 'basic' ? (
              <>
                <FontFamilyPicker value={form.font_family} onChange={(value) => update('font_family', value)} />
                <BirthdayTemplatePicker value={form.template} onChange={(value) => update('template', value)} />
                <label className="col-span-full flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:border-[#344458] dark:bg-[#101923] dark:text-slate-200 sm:w-fit"><input className="h-4 w-4 accent-[#D6B15C]" type="checkbox" checked={form.is_published} onChange={(event) => update('is_published', event.target.checked)} /> Published</label>
              </>
            ) : null}
          </div>
        </div>
      </CustomModal>
      <ConfirmationDialog isOpen={Boolean(deleteCandidate)} onClose={() => setDeleteCandidate(null)} onConfirm={() => removeGreeting(deleteCandidate)} confirmLoading={loading} title="Delete Birthday greeting?" message={`Delete ${deleteCandidate?.recipient_name || ''}?`} confirmText="Delete" cancelText="Close" />
    </>
  );
}
