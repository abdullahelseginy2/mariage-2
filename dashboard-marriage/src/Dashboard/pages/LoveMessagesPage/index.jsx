import React, { useCallback, useEffect, useState } from 'react';
import { FiCopy, FiEdit2, FiExternalLink, FiImage, FiMusic, FiSave, FiTrash2, FiUpload } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../DashboardLayout';
import Field from '../../components/Field';
import ContentLocaleSwitcher from '../../components/ContentLocaleSwitcher';
import FontFamilyPicker from '../../components/FontFamilyPicker';
import { ConfirmationDialog, CustomBottom, CustomInput, CustomModal, Loading, Pagination } from '../../../components';
import { useToast } from '../../../components/ToastProvider';
import { uploadMedia } from '../../../utils/mediaUploadApi';
import { getBackendMode, getBackendUrl, getFrontendUrl } from '../../../utils/apiConfig';
import { loveMessagesApi } from '../../../utils/loveMessagesApi';
import { createEmptyLoveMessageForm, hydrateLoveMessage, serializeLoveMessage } from '../../../utils/loveMessageContent';
import { getTemplateGlobalId } from '../../../utils/templateRegistry';
import id11Preview from '../../../assets/images/id11.png';

const sections = [
  ['basic', 'Basics'], ['intro', 'Mystery Intro'], ['countdown_reveal', 'Countdown Reveal'],
  ['reasons', 'Reasons'], ['gallery', 'Memory Gallery'], ['letter', 'Love Letter'],
  ['secret_boxes', 'Secret Boxes'], ['love_timer', 'Love Timer'],
  ['final_surprise', 'Final Surprise'], ['audio', 'Audio'],
];

const fields = {
  basic: [
    ['recipient_name', 'Recipient Name'],
    ['sender_name', 'Sender Name'],
    ['public_path', 'Route Path'],
    ['requester_name', 'Requester Name (optional)'],
    ['requester_whatsapp', 'WhatsApp Number (optional)', false, 'tel'],
    ['order_date', 'Order Date (optional)', false, 'date'],
  ],
  intro: [['content.intro.teaser', 'Intro Text'], ['content.intro.revealed_message', 'Revealed Message'], ['content.intro.open_button', 'Open Button']],
  countdown_reveal: [['content.countdown_reveal.lines_text', 'Countdown sentences, 10 to 1 (one per line)', true]],
  reasons: [['content.reasons.title', 'Section Title'], ['content.reasons.items_text', 'Reasons (one per line)', true]],
  gallery: [['content.gallery.title', 'Gallery Title']],
  letter: [['content.letter.title', 'Letter Title'], ['content.letter.message', 'Letter Message', true], ['content.letter.signature', 'Signature']],
  secret_boxes: [['content.secret_boxes.items_text', 'Boxes: Title | Hidden content', true]],
  love_timer: [['content.love_timer.title', 'Timer Title'], ['content.love_timer.start_date', 'Relationship Start Date (ISO)']],
  final_surprise: [['content.final_surprise.prompt', 'Prompt'], ['content.final_surprise.message', 'Final Message'], ['content.final_surprise.subtitle', 'Subtitle']],
  audio: [],
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
const splitLines = (value) => String(value || '').split('\n').map((line) => line.trim()).filter(Boolean);
const getYouTubeId = (url) => {
  const match = String(url || '').match(/^.*(?:youtu.be\/|embed\/|watch\?v=|&v=)([^#&?]{11}).*/);
  return match?.[1] || null;
};
const normalizeMediaUrl = (url) => {
  if (!url || !url.startsWith('http://localhost/storage/')) return url;
  try {
    return url.replace('http://localhost', new URL(getBackendUrl()).origin);
  } catch {
    return url;
  }
};

export default function LoveMessagesPage({ embedded = false, active = true, studioMode = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const isEditor = location.pathname === '/love-messages/new';
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState('');
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [status, setStatus] = useState('Checking database connection...');
  const [activeSection, setActiveSection] = useState('basic');
  const [form, setForm] = useState(() => createEmptyLoveMessageForm());
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [editLoadingId, setEditLoadingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [templateFilter, setTemplateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('latest');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const isDemoValue = typeFilter === 'demo' ? 'true' : (typeFilter === 'real' ? 'false' : '');
      const response = await loveMessagesApi.list(page, {
        search: searchQuery,
        template: templateFilter,
        is_demo: isDemoValue,
        date: dateFilter,
        sort: sortOrder,
      });
      setMessages(response.data || []);
      setPagination(response.meta || null);
      setStatus('Operational');
    } catch (error) {
      setStatus('Offline');
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [dateFilter, page, searchQuery, sortOrder, templateFilter, toast, typeFilter]);

  useEffect(() => { setPage(1); }, [searchQuery, templateFilter, typeFilter, dateFilter, sortOrder]);
  useEffect(() => { if (!isEditor && (!embedded || active)) load(); }, [active, embedded, isEditor, load]);
  useEffect(() => {
    if (isEditor) {
      setEditingId(null);
      const isTemplatePreview = new URLSearchParams(location.search).get('templatePreview') === '1';
      const nextForm = createEmptyLoveMessageForm();
      if (isTemplatePreview) {
        const routeCode = createCode();
        nextForm.recipient_name = 'Someone Special';
        nextForm.sender_name = 'Your Favorite Person';
        nextForm.public_path = `someone-special-your-favorite-person-${routeCode}`;
      }
      setForm(nextForm);
      setActiveSection('basic');
      setStatus('Creating new Love Message');
    }
  }, [isEditor, location.search]);

  useEffect(() => {
    if (!studioMode || window.parent === window) return undefined;
    window.parent.postMessage({
      type: 'wil-template-preview-data',
      category: 'love',
      data: serializeLoveMessage(form),
    }, '*');
    return undefined;
  }, [form, studioMode]);

  useEffect(() => {
    if (!studioMode) return undefined;
    const handleStudioMessage = (event) => {
      if (event.data?.type !== 'wil-template-language') return;
      const locale = event.data.locale === 'ar' ? 'ar' : 'en';
      setForm((current) => ({
        ...createEmptyLoveMessageForm(locale),
        recipient_name: locale === 'ar' ? 'شخص مميز' : 'Someone Special',
        sender_name: locale === 'ar' ? 'الشخص المفضل لديك' : 'Your Favorite Person',
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

  const update = (path, value) => {
    setForm((current) => {
      const next = setValue(current, path, value);
      if (path === 'recipient_name' || path === 'sender_name') {
        const routeCode = String(current.public_path || '').split('-').at(-1) || createCode();
        next.public_path = `${slugPart(next.recipient_name, 'recipient')}-${slugPart(next.sender_name, 'sender')}-${routeCode}`;
      }
      return next;
    });
  };

  const save = async () => {
    if (!form.recipient_name.trim() || !form.sender_name.trim() || !form.public_path.trim()) {
      toast.error('Recipient, sender, and route are required.');
      return;
    }
    setSaving(true);
    setStatus('Saving Love Message...');
    try {
      const payload = serializeLoveMessage(form);
      editingId ? await loveMessagesApi.update(editingId, payload) : await loveMessagesApi.create(payload);
      toast.success(editingId ? 'Love Message updated.' : 'Love Message created.');
      setStatus('Love Message saved');
      setModalOpen(false);
      isEditor ? navigate('/completed') : load();
    } catch (error) {
      setStatus(error.message);
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const edit = async (message) => {
    setEditLoadingId(message.id);
    setStatus('Loading Love Message...');
    try {
      const response = await loveMessagesApi.show(message.id);
      setEditingId(message.id);
      setForm(hydrateLoveMessage(response.data));
      setActiveSection('basic');
      setModalOpen(true);
      setStatus('Operational');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setEditLoadingId(null);
    }
  };

  const remove = async () => {
    setLoading(true);
    try {
      await loveMessagesApi.remove(deleteCandidate.id);
      setDeleteCandidate(null);
      toast.success('Love Message deleted.');
      load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadFiles = async (event, type, targetPath) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploadingTarget(targetPath);
    setUploadProgress({ current: 0, total: files.length });
    setStatus(`Preparing ${type === 'audio' ? 'audio' : 'images'}...`);
    const uploads = [];
    try {
      for (const [index, file] of files.entries()) {
        setUploadProgress({ current: index + 1, total: files.length });
        setStatus(`Uploading ${index + 1} of ${files.length}: ${file.name}`);
        const upload = await uploadMedia(file, type);
        uploads.push(upload);
      }

      if (targetPath === 'content.gallery.items_text') {
        const rows = uploads.map(({ url }) => `${url} |  |  | `);
        update(targetPath, [getValue(form, targetPath), ...rows].filter(Boolean).join('\n'));
      } else {
        update(targetPath, uploads[0]?.url || '');
      }
      setStatus('Upload complete. Save to publish.');
      toast.success(`${uploads.length} file(s) uploaded.`);
    } catch (error) {
      if (uploads.length && targetPath === 'content.gallery.items_text') {
        const rows = uploads.map(({ url }) => `${url} |  |  | `);
        update(targetPath, [getValue(form, targetPath), ...rows].filter(Boolean).join('\n'));
      }
      const message = uploads.length
        ? `${uploads.length} file(s) uploaded before the failure. ${error.message}`
        : error.message;
      setStatus(message);
      toast.error(message);
    } finally {
      setUploadingTarget('');
      setUploadProgress({ current: 0, total: 0 });
      event.target.value = '';
    }
  };

  const removeGalleryImage = (index) => {
    const rows = splitLines(form.content.gallery.items_text);
    update('content.gallery.items_text', rows.filter((_, itemIndex) => itemIndex !== index).join('\n'));
  };

  const updateGalleryCaption = (index, caption) => {
    const rows = splitLines(form.content.gallery.items_text);
    const parts = String(rows[index] || '').split('|').map((part) => part.trim());
    parts[1] = caption;
    rows[index] = [parts[0] || '', parts[1] || '', parts[2] || '', parts[3] || ''].join(' | ');
    update('content.gallery.items_text', rows.join('\n'));
  };

  const backendMode = getBackendMode();
  const querySuffix = backendMode === 'local' ? '?backend=local' : '';
  const publicUrl = form.public_path ? `${getFrontendUrl()}/love/${form.public_path}${querySuffix}` : '';
  const galleryRows = splitLines(form.content.gallery.items_text);
  const finalPhoto = form.content.final_surprise.couple_photo || '';
  const audioUrl = form.content.audio.url || '';
  const youtubeId = getYouTubeId(audioUrl);
  const activeFields = fields[activeSection] || [];
  const isGalleryUploading = uploadingTarget === 'content.gallery.items_text';
  const isFinalPhotoUploading = uploadingTarget === 'content.final_surprise.couple_photo';
  const isAudioUploading = uploadingTarget === 'content.audio.url';
  const uploadCounter = uploadProgress.total > 1
    ? ` ${uploadProgress.current}/${uploadProgress.total}`
    : '';

  const mediaPanel = activeSection === 'gallery' ? (
    <div className="col-span-full grid gap-4">
      <label className={`grid gap-3 rounded-lg border border-dashed border-[#b49344]/60 bg-[#fff8e6] p-4 dark:border-gold/50 dark:bg-gold/10 ${isGalleryUploading ? 'cursor-wait opacity-80' : 'cursor-pointer'}`}>
        <span className="flex items-center gap-2 text-sm font-black"><FiImage /> Upload memory images from device</span>
        <span className="text-xs text-slate-500 dark:text-slate-300">Images are stored by Laravel and their URLs are added to the gallery.</span>
        <span className="inline-flex min-h-11 min-w-36 items-center justify-center gap-2 rounded-lg bg-[#111820] px-4 text-sm font-black text-white dark:bg-gold dark:text-[#111820]">
          {isGalleryUploading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> Uploading{uploadCounter}</> : <><FiUpload /> Choose images</>}
        </span>
        <input className="sr-only" type="file" accept="image/*" multiple disabled={Boolean(uploadingTarget)} onChange={(event) => uploadFiles(event, 'gallery', 'content.gallery.items_text')} />
      </label>
      {galleryRows.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">{galleryRows.map((row, index) => {
        const [url, caption] = row.split('|').map((part) => part.trim());
        return <div key={`${url}-${index}`} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-[#273445] dark:bg-[#0b131c]"><div className="group relative aspect-square overflow-hidden bg-slate-100"><img src={normalizeMediaUrl(url)} alt={`Memory ${index + 1}`} className="h-full w-full object-cover transition duration-300 group-hover:scale-110" /><div className="absolute inset-0 grid place-items-center bg-black/45 opacity-0 transition group-hover:opacity-100"><button type="button" onClick={() => removeGalleryImage(index)} className="grid h-9 w-9 place-items-center rounded-full bg-rose-600 text-white"><FiTrash2 /></button></div></div><div className="p-3"><label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-500">Small message</label><input type="text" value={caption || ''} onChange={(event) => updateGalleryCaption(index, event.target.value)} placeholder="A beautiful moment with you..." className="min-h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-gold dark:border-[#344458] dark:bg-[#101923] dark:text-white" /></div></div>;
      })}</div> : <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500 dark:border-[#344458]">No images uploaded yet.</div>}
    </div>
  ) : activeSection === 'final_surprise' ? (
    <div className="col-span-full grid gap-4">
      <label className={`inline-flex min-h-11 min-w-48 items-center justify-center gap-2 rounded-lg bg-[#111820] px-4 text-sm font-black text-white dark:bg-gold dark:text-[#111820] ${isFinalPhotoUploading ? 'cursor-wait opacity-80' : 'cursor-pointer'}`}>
        {isFinalPhotoUploading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> Uploading...</> : <><FiUpload /><FiImage /> Upload couple photo</>}
        <input className="sr-only" type="file" accept="image/*" disabled={Boolean(uploadingTarget)} onChange={(event) => uploadFiles(event, 'gallery', 'content.final_surprise.couple_photo')} />
      </label>
      {finalPhoto && <div className="relative aspect-[4/3] max-w-sm overflow-hidden rounded-lg border"><img src={normalizeMediaUrl(finalPhoto)} alt="Final couple" className="h-full w-full object-cover" /><button type="button" onClick={() => update('content.final_surprise.couple_photo', '')} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-rose-600 text-white"><FiTrash2 /></button></div>}
    </div>
  ) : activeSection === 'audio' ? (
    <div className="col-span-full grid gap-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-[#273445] dark:bg-[#101923]"><Field label="YouTube or direct audio URL" value={audioUrl} onChange={(value) => update('content.audio.url', value)} /><p className="mt-2 text-xs text-slate-500">Paste a YouTube link or upload MP3, WAV, OGG, M4A, MP4, or AAC.</p></div>
      <label className={`inline-flex min-h-11 min-w-40 items-center justify-center gap-2 rounded-lg bg-[#111820] px-4 text-sm font-black text-white dark:bg-gold dark:text-[#111820] ${isAudioUploading ? 'cursor-wait opacity-80' : 'cursor-pointer'}`}>
        {isAudioUploading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> Uploading...</> : <><FiUpload /><FiMusic /> Upload audio</>}
        <input className="sr-only" type="file" accept="audio/*,.m4a,.mp4,.aac" disabled={Boolean(uploadingTarget)} onChange={(event) => uploadFiles(event, 'audio', 'content.audio.url')} />
      </label>
      {audioUrl && <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-[#273445] dark:bg-[#101923]">{youtubeId ? <div className="aspect-video max-w-lg overflow-hidden rounded-lg"><iframe title="Audio preview" src={`https://www.youtube.com/embed/${youtubeId}`} className="h-full w-full" allow="autoplay; encrypted-media" /></div> : <audio controls src={normalizeMediaUrl(audioUrl)} className="w-full" />}<button type="button" onClick={() => update('content.audio.url', '')} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg bg-rose-950 px-4 text-sm font-black text-white"><FiTrash2 /> Remove Audio</button></div>}
    </div>
  ) : null;

  const templatePicker = activeSection === 'basic' ? (
    <div className="col-span-full">
      <FontFamilyPicker value={form.font_family} onChange={(value) => update('font_family', value)} />
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Love Message Template</p>
      <button type="button" onClick={() => update('template', 'happy-message')} className="w-full max-w-xl overflow-hidden rounded-lg border border-gold bg-white text-start shadow-[0_18px_40px_rgba(214,177,92,0.16)] ring-2 ring-gold/40 dark:bg-[#0e1721]">
        <div className="aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-[#15202b]">
          <img src={id11Preview} alt="Happy Message template preview" className="h-full w-full object-cover object-top" draggable={false} />
        </div>
        <div className="grid gap-3 p-4">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-[#8a6d2f] dark:text-gold">Selected template</span>
        <div className="flex items-center justify-between gap-3">
          <strong className="text-xl font-black text-slate-950 dark:text-white">Happy Message</strong>
          <span className="rounded-full bg-[#111820] px-3 py-1 text-xs font-black text-gold dark:bg-gold dark:text-[#111820]">ID 11</span>
        </div>
        <span className="text-sm leading-6 text-slate-500 dark:text-slate-300">Mystery gift, cinematic countdown, reasons, memories, love letter, secret boxes, timer, and final surprise.</span>
        </div>
      </button>
    </div>
  ) : null;

  const modalActions = (
    <div className="mobile-stack-actions flex w-full items-center justify-between gap-2">
      <span className="truncate rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 dark:border-[#344458] dark:bg-[#101923] dark:text-slate-300">{status}</span>
      <CustomBottom text="Save" onClick={save} loading={saving} loadingText="Saving..." rightIcon={<FiSave />} buttonStyles="min-h-10 px-4 py-2.5 text-sm bg-[#111820] text-white dark:bg-gold dark:text-[#111820] font-black" styles="w-fit shrink-0" />
    </div>
  );

  const editor = (
    <>
      <header className={modalOpen ? 'hidden' : 'mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'}>
        <div><p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-[#8a6d2f]">Love Message template editor</p><h1 className="text-3xl font-black text-slate-950 dark:text-white sm:text-4xl">Manage Happy Message data</h1></div>
        <div className="flex flex-wrap gap-2"><span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 dark:border-[#344458] dark:bg-[#101923] dark:text-slate-300">{status}</span><CustomBottom text="Save" onClick={save} loading={saving} loadingText="Saving..." rightIcon={<FiSave />} buttonStyles="min-h-10 px-4 bg-[#111820] text-white dark:bg-gold dark:text-[#111820] font-black" styles="w-fit" /></div>
      </header>
      {publicUrl && <div className="mb-4 flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-2 dark:border-[#263547] dark:bg-[#0e1721] sm:flex-row"><span className="min-w-0 flex-1 truncate px-2 py-2 text-sm" dir="ltr">{publicUrl}</span><button type="button" onClick={() => navigator.clipboard?.writeText(publicUrl)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gold px-4 text-sm font-black text-[#111820]"><FiCopy /> Copy</button><a href={publicUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-black"><FiExternalLink /> Open</a></div>}
      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-[#263547] dark:bg-[#0b131c]"><ContentLocaleSwitcher value={form.locale} onChange={(locale) => setForm({ ...createEmptyLoveMessageForm(locale), recipient_name: form.recipient_name, sender_name: form.sender_name, public_path: form.public_path, requester_name: form.requester_name, requester_whatsapp: form.requester_whatsapp, order_date: form.order_date, template: form.template, font_family: form.font_family, is_published: form.is_published })} /></div>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-[#263547] dark:bg-[#0b131c]">
        <nav className="overflow-x-auto border-b border-slate-100 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-[#101923]"><div className="flex min-w-max gap-2">{sections.map(([id, label], index) => <button key={id} type="button" onClick={() => setActiveSection(id)} className={`min-h-12 rounded-lg border px-3 text-sm font-black ${activeSection === id ? 'border-[#111820] bg-[#111820] text-white dark:border-gold dark:bg-gold dark:text-[#111820]' : 'border-slate-200 bg-white text-slate-500 dark:border-[#344458] dark:bg-[#0b131c] dark:text-slate-300'}`}>{index + 1}. {label}</button>)}</div></nav>
        <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-2">{activeFields.map(([path, label, textarea, type]) => <Field key={path} label={label} value={getValue(form, path) || ''} textarea={textarea} type={type} onChange={(value) => update(path, value)} />)}{mediaPanel}{templatePicker}{activeSection === 'basic' && <label className="col-span-full flex min-h-12 w-fit items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 text-xs font-black uppercase tracking-[0.14em] dark:border-[#344458] dark:bg-[#101923]"><input className="h-4 w-4 accent-[#D6B15C]" type="checkbox" checked={form.is_published} onChange={(event) => update('is_published', event.target.checked)} /> Published</label>}</div>
      </div>
    </>
  );

  const overview = (
    <>
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-[#8a6d2f]">{backendMode === 'local' ? 'Local Database | قاعدة بيانات محلية' : 'Global Database | قاعدة بيانات عامة'}</p><h1 className="flex flex-wrap items-center gap-3 text-4xl font-black text-slate-950 dark:text-white">Love Messages<span className={`rounded-full px-3 py-1 text-xs ${backendMode === 'local' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/45 dark:text-amber-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-950/45 dark:text-blue-400'}`}>{backendMode === 'local' ? 'LOCAL DB | محلي' : 'GLOBAL DB | عام'}</span></h1></div><span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 dark:border-[#2a3646] dark:bg-[#101923]">{status}</span></header>
      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-[#253141] dark:bg-[#0b131c]">
        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <div className="md:col-span-2 lg:col-span-2">
            <CustomInput
              label="Search"
              labelClassName="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400"
              placeholder="Search by recipient, sender, path..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              inputClassName="w-full border-slate-200 bg-slate-50 py-2 text-slate-900 placeholder:text-slate-400 dark:border-[#273445] dark:bg-[#101923] dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Template</label>
            <select value={templateFilter} onChange={(event) => setTemplateFilter(event.target.value)} className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-gold dark:border-[#273445] dark:bg-[#101923] dark:text-white">
              <option value="">All Templates</option>
              <option value="happy-message">Happy Message - ID 11</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Type</label>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-gold dark:border-[#273445] dark:bg-[#101923] dark:text-white">
              <option value="">All Types</option>
              <option value="real">Client Templates</option>
              <option value="demo">Demos</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Date</label>
            <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-gold dark:border-[#273445] dark:bg-[#101923] dark:text-white" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Sort By</label>
            <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-gold dark:border-[#273445] dark:bg-[#101923] dark:text-white">
              <option value="latest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </section>
      {messages.some((message) => message.is_demo || message.public_path?.startsWith('demo')) && <><h2 className="mb-4 text-sm font-black uppercase tracking-[0.14em] text-slate-500">Template Live Demos</h2>
      <section className="mb-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-[#253141] dark:bg-[#0b131c]"><div className="grid gap-3 p-4 sm:p-5 xl:grid-cols-2">{messages.filter((message) => message.is_demo || message.public_path?.startsWith('demo')).map((message) => {
        const url = `${getFrontendUrl()}/love/${message.public_path}${querySuffix}`;
        const isEditLoading = editLoadingId === message.id;
        return <article key={message.id} className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-[#273445] dark:bg-[#101923]"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><strong className="block truncate text-base font-black">{message.recipient_name}</strong><span className="mt-1 block truncate text-xs font-bold text-slate-500" dir="ltr">{message.public_path}</span><p className="mt-1 text-xs text-slate-500">From: {message.sender_name}</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-gold/25 px-2.5 py-1 text-xs font-black text-[#8a6d2f] dark:text-gold">DEMO</span><span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-black text-slate-700 dark:bg-white/10 dark:text-slate-200">ID {getTemplateGlobalId('love-message', message.template || 'happy-message')}</span><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200">Published</span></div></div><div className="flex flex-wrap gap-2"><button type="button" disabled={isEditLoading} onClick={() => edit(message)} className="inline-flex min-h-11 min-w-[5.5rem] items-center justify-center gap-2 rounded-lg bg-[#111820] px-4 text-sm font-black text-white disabled:cursor-wait disabled:opacity-80 dark:bg-gold dark:text-[#111820]">{isEditLoading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> Loading</> : <><FiEdit2 /> Edit</>}</button><a href={url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-lg border bg-white px-4 text-sm font-black dark:bg-[#0b131c]"><FiExternalLink /> Open</a><button type="button" onClick={() => { navigator.clipboard?.writeText(url); toast.success('Link copied.'); }} className="inline-flex min-h-11 items-center gap-2 rounded-lg border bg-white px-4 text-sm font-black dark:bg-[#0b131c]"><FiCopy /> Copy</button></div></article>;
      })}</div></section></>}
      <h2 className="mb-4 text-sm font-black uppercase tracking-[0.14em] text-slate-500">Your Created Love Messages</h2>
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-[#253141] dark:bg-[#0b131c]"><div className="grid gap-3 p-4 sm:p-5 xl:grid-cols-2">{loading ? <div className="col-span-full"><Loading message="Loading Love Messages..." /></div> : messages.some((message) => !(message.is_demo || message.public_path?.startsWith('demo'))) ? messages.filter((message) => !(message.is_demo || message.public_path?.startsWith('demo'))).map((message) => {
        const url = `${getFrontendUrl()}/love/${message.public_path}${querySuffix}`;
        const isEditLoading = editLoadingId === message.id;
        return <article key={message.id} className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-[#273445] dark:bg-[#101923]"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><strong className="block truncate text-base font-black">{message.recipient_name}</strong><span className="mt-1 block truncate text-xs font-bold text-slate-500" dir="ltr">{message.public_path}</span><p className="mt-1 text-xs text-slate-500">From: {message.sender_name}</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-black text-slate-700 dark:bg-white/10 dark:text-slate-200">ID {getTemplateGlobalId('love-message', message.template || 'happy-message')}</span><span className={`rounded-full px-2.5 py-1 text-xs font-black ${message.is_published ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200' : 'bg-slate-200 text-slate-600 dark:bg-white/10'}`}>{message.is_published ? 'Published' : 'Draft'}</span><button type="button" onClick={() => setDeleteCandidate(message)} className="grid h-9 w-9 place-items-center rounded-lg border border-rose-200 bg-white text-rose-600 dark:bg-[#0b131c]"><FiTrash2 /></button></div></div><div className="flex flex-wrap gap-2"><button type="button" disabled={isEditLoading} onClick={() => edit(message)} className="inline-flex min-h-11 min-w-[5.5rem] items-center justify-center gap-2 rounded-lg bg-[#111820] px-4 text-sm font-black text-white disabled:cursor-wait disabled:opacity-80 dark:bg-gold dark:text-[#111820]">{isEditLoading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> Loading</> : <><FiEdit2 /> Edit</>}</button><a href={url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-lg border bg-white px-4 text-sm font-black dark:bg-[#0b131c]"><FiExternalLink /> Open</a><button type="button" onClick={() => { navigator.clipboard?.writeText(url); toast.success('Link copied.'); }} className="inline-flex min-h-11 items-center gap-2 rounded-lg border bg-white px-4 text-sm font-black dark:bg-[#0b131c]"><FiCopy /> Copy</button></div></article>;
      }) : <div className="col-span-full rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500 dark:border-[#344458] dark:bg-[#101923]">No Love Messages yet.</div>}</div>{pagination?.last_page > 1 && <div className="border-t p-4"><Pagination currentPage={pagination.current_page} totalPages={pagination.last_page} onPageChange={setPage} /></div>}</section>
    </>
  );

  const dialogs = <><CustomModal isOpen={modalOpen} onClose={() => setModalOpen(false)} eyebrow="Love Message editor" title="Edit Love Message" headerActions={modalActions}>{editor}</CustomModal><ConfirmationDialog isOpen={Boolean(deleteCandidate)} onClose={() => setDeleteCandidate(null)} onConfirm={remove} confirmLoading={loading} title="Delete Love Message?" message={`Delete ${deleteCandidate?.recipient_name || ''}?`} confirmText="Delete" cancelText="Close" /></>;
  if (embedded) return <>{isEditor ? editor : overview}{dialogs}</>;
  return <DashboardLayout activeView={isEditor ? 'love-editor' : 'love'} onCreate={() => navigate('/invitations/new')} onShowCompleted={() => navigate('/completed')} onCreateEid={() => navigate('/eid-greetings/new')} onCreateBirthday={() => navigate('/birthday-greetings/new')} onCreateLove={() => navigate('/love-messages/new')} onShowSettings={() => navigate('/settings')}>{isEditor ? editor : overview}{dialogs}</DashboardLayout>;
}
