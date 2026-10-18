import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { FiCopy, FiEdit2, FiExternalLink, FiSave, FiTrash2 } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import Field from '../../components/Field';
import DashboardLayout from '../../DashboardLayout';
import ContentLocaleSwitcher from '../../components/ContentLocaleSwitcher';
import FontFamilyPicker from '../../components/FontFamilyPicker';
import { ConfirmationDialog, CustomModal, Pagination, CustomBottom, Loading, CustomInput } from '../../../components';
import { useToast } from '../../../components/ToastProvider';
import { eidGreetingsApi } from '../../../utils/eidGreetingsApi';
import { invitationsApi } from '../../../utils/invitationsApi';
import { birthdayGreetingsApi } from '../../../utils/birthdayGreetingsApi';
import { createEmptyEidForm, hydrateEidGreeting, serializeEidGreeting } from '../../../utils/eidContent';
import { useDocumentTitle } from '../../../utils/useDocumentTitle';
import { getFrontendUrl, getBackendMode } from '../../../utils/apiConfig';
import { getTemplateGlobalId } from '../../../utils/templateRegistry';

const sections = [
  { id: 'basic', label: 'Basics' },
  { id: 'hero', label: 'Hero' },
  { id: 'wishes', label: 'Wishes' },
  { id: 'moments', label: 'Moments' },
  { id: 'pulses', label: 'Pulses' },
  { id: 'instrument', label: 'Instrument' },
  { id: 'footer', label: 'Footer' },
];

const fields = {
  basic: [
    ['recipient_name', 'Recipient name'],
    ['sender_name', 'Sender name'],
    ['public_path', 'Eid route'],
    ['requester_name', 'Requester Name (optional)'],
    ['requester_whatsapp', 'WhatsApp Number (optional)', false, 'tel'],
    ['order_date', 'Order Date (optional)', false, 'date'],
  ],
  hero: [
    ['content.hero.kicker', 'Kicker'],
    ['content.hero.title', 'Title'],
    ['content.hero.subtitle', 'Subtitle', true],
    ['content.hero.primary_button', 'Primary button'],
    ['content.hero.secondary_button', 'Secondary button'],
    ['content.hero.banner_image', 'Banner image URL'],
  ],
  wishes: [
    ['content.wishes.title', 'Wishes title'],
    ['content.wishes.items_text', 'Wishes: text | tag 1, tag 2', true],
  ],
  moments: [
    ['content.moments.title', 'Moments title'],
    ['content.moments.items_text', 'Moments: title | date | category | description | image URL | likes', true],
  ],
  pulses: [
    ['content.pulses.title', 'Pulses title'],
    ['content.pulses.description', 'Pulses description', true],
    ['content.pulses.button', 'Pulse button'],
    ['content.pulses.music_on', 'Music on text'],
    ['content.pulses.music_off', 'Music off text'],
    ['content.pulses.empty', 'Empty log text'],
  ],
  instrument: [
    ['content.instrument.title', 'Instrument title'],
    ['content.instrument.description', 'Instrument description', true],
  ],
  footer: [
    ['content.footer.text', 'Footer text'],
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
const normalizeLocale = (value) => (value === 'ar' ? 'ar' : 'en');

const EidOverview = ({
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
    const publicUrl = greeting.public_path ? `${publicBaseUrl}/eid/${greeting.public_path}${querySuffix}` : '';
    const isDemo = greeting.is_demo || (greeting.public_path && greeting.public_path.startsWith('demo'));
    const isEditLoading = editLoadingId === greeting.id;

    return (
      <article key={greeting.id} className="relative flex flex-col justify-between gap-5 rounded-xl border border-slate-200 bg-white p-4 dark:border-[#253141] dark:bg-[#0d1620] sm:p-5">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-700 dark:bg-white/10 dark:text-slate-200">
              ID {getTemplateGlobalId('eid', 'default')}
            </span>
            {isDemo && (
              <span className="rounded-md bg-gold/25 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-gold">DEMO</span>
            )}
            <span className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${greeting.is_published ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/45 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/45 dark:text-rose-400'}`}>{greeting.is_published ? 'Published' : 'Draft'}</span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:bg-white/5 dark:text-slate-400">{normalizeLocale(greeting.locale)}</span>
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
            Eid greetings
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
              <option value="classic">Classic</option>
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
            <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-[#344458]">No Eid greetings yet.</div>
          ) : clientGreetings.map((greeting) => renderGreetingCard(greeting))}
        </div>
        <div className="border-t border-slate-100 px-4 pb-5 dark:border-white/10 sm:px-5"><Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={onPageChange} /></div>
      </section>
    </>
  );
};

export default function EidGreetingsPage({ embedded = false, active = true, studioMode = false }) {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditorView = location.pathname.endsWith('/new');
  const [greetings, setGreetings] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [selected, setSelected] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [form, setForm] = useState(createEmptyEidForm);
  const [code, setCode] = useState(createCode);
  const [routeTouched, setRouteTouched] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const [status, setStatus] = useState('Dashboard synced');
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [invitationsCount, setInvitationsCount] = useState(0);
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
  const publicUrl = selected?.public_path ? `${publicBaseUrl}/eid/${selected.public_path}${querySuffix}` : '';
  const view = isEditorView ? 'eid-editor' : 'eid';
  const activeFields = useMemo(() => fields[activeSection] || fields.basic, [activeSection]);
  const pageTitle = `${isEditModalOpen ? 'Edit Eid greeting' : isEditorView ? 'New Eid greeting' : 'Eid greetings'} | Marriage Admin`;
  useDocumentTitle(pageTitle);

  const loadSidebarCounts = useCallback(async () => {
    try {
      const response = await invitationsApi.list(1);
      setInvitationsCount(response.meta?.total || response.data?.length || 0);
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

  const loadGreetings = useCallback(async () => {
    setLoading(true);
    try {
      const isDemoValue = typeFilter === 'demo' ? 'true' : (typeFilter === 'real' ? 'false' : '');
      const response = await eidGreetingsApi.list(page, {
        search: searchQuery,
        is_demo: isDemoValue,
        date: dateFilter,
        sort: sortOrder,
      });
      setGreetings(response.data || []);
      setPagination({ currentPage: response.meta?.current_page || page, totalPages: response.meta?.last_page || 1 });
      setStatus('Dashboard synced');
    } catch (error) {
      setStatus(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, typeFilter, dateFilter, sortOrder, toast]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, templateFilter, typeFilter, dateFilter, sortOrder]);

  useEffect(() => {
    if (view !== 'eid-editor') {
      if (!embedded || active) {
        loadGreetings();
      }
    }
  }, [loadGreetings, embedded, active, view]);

  useEffect(() => {
    if (view !== 'eid-editor') return;
    const isTemplatePreview = new URLSearchParams(location.search).get('templatePreview') === '1';
    if (!isTemplatePreview) return;
    const nextCode = createCode();
    setSelected(null);
    setCode(nextCode);
    setRouteTouched(false);
    setForm({
      ...createEmptyEidForm('en'),
      recipient_name: 'Someone Special',
      sender_name: 'WIL Demo',
      public_path: createPath('Someone Special', 'WIL Demo', nextCode),
    });
    setActiveSection('basic');
    setStatus('Editing template demo data');
  }, [location.search, view]);

  useEffect(() => {
    if (!studioMode || window.parent === window) return undefined;
    window.parent.postMessage({
      type: 'wil-template-preview-data',
      category: 'eid',
      data: serializeEidGreeting(form),
    }, '*');
    return undefined;
  }, [form, studioMode]);

  useEffect(() => {
    if (!studioMode) return undefined;
    const handleStudioMessage = (event) => {
      if (event.data?.type !== 'wil-template-language') return;
      const locale = event.data.locale === 'ar' ? 'ar' : 'en';
      setForm((current) => ({
        ...createEmptyEidForm(locale),
        recipient_name: locale === 'ar' ? 'شخص مميز' : 'Someone Special',
        sender_name: locale === 'ar' ? 'معاينة WIL' : 'WIL Demo',
        public_path: current.public_path,
        requester_name: current.requester_name,
        requester_whatsapp: current.requester_whatsapp,
        order_date: current.order_date,
        font_family: current.font_family,
        is_published: current.is_published,
      }));
    };
    window.addEventListener('message', handleStudioMessage);
    return () => window.removeEventListener('message', handleStudioMessage);
  }, [studioMode]);

  const update = (path, value) => {
    if (path === 'public_path') setRouteTouched(true);
    setForm((current) => {
      const next = setValue(current, path, value);
      if (!routeTouched && (path === 'recipient_name' || path === 'sender_name')) {
        next.public_path = createPath(next.recipient_name, next.sender_name, code);
      }
      return next;
    });
  };

  const startNew = () => {
    const nextCode = createCode();
    setSelected(null);
    setCode(nextCode);
    setRouteTouched(false);
    setForm({ ...createEmptyEidForm(form.locale), public_path: createPath('', '', nextCode) });
    setActiveSection('basic');
    navigate('/eid-greetings/new');
    setStatus('Creating new Eid greeting');
  };

  const editGreeting = async (greeting) => {
    if (!greeting?.id) return;
    setEditLoadingId(greeting.id);
    setStatus('Loading Eid greeting...');
    try {
      const response = await eidGreetingsApi.show(greeting.id);
      const fullGreeting = response?.data || greeting;
      setSelected(fullGreeting);
      setCode(fullGreeting.code || createCode());
      setRouteTouched(true);
      setForm(hydrateEidGreeting(fullGreeting));
      setActiveSection('basic');
      setIsEditModalOpen(true);
      setStatus('Operational');
    } catch (error) {
      setStatus(error.message);
      toast.error(error.message);
    } finally {
      setEditLoadingId(null);
    }
  };

  const save = async () => {
    // Frontend Validation
    const recipientName = form.recipient_name?.trim();
    const senderName = form.sender_name?.trim();
    const publicPath = form.public_path?.trim();

    if (!recipientName) {
      toast.error('Recipient Name is required.');
      return;
    }
    if (!senderName) {
      toast.error('Sender Name is required.');
      return;
    }
    if (!publicPath) {
      toast.error('Route name (public path) is required.');
      return;
    }

    setSaveLoading(true);
    try {
      const response = selected ? await eidGreetingsApi.update(selected.id, serializeEidGreeting(form)) : await eidGreetingsApi.create(serializeEidGreeting(form));
      setSelected(response.data);
      setForm(hydrateEidGreeting(response.data));
      await loadGreetings();
      setStatus('Eid greeting saved');
      toast.success('Eid greeting saved');
      setIsEditModalOpen(false);
    } catch (error) { setStatus(error.message); toast.error(error.message); } finally { setSaveLoading(false); }
  };

  const removeGreeting = async (greeting) => {
    if (!greeting) return;
    setLoading(true);
    try {
      await eidGreetingsApi.remove(greeting.id);
      setDeleteCandidate(null);
      await loadGreetings();
      setStatus('Eid greeting deleted');
      toast.success('Eid greeting deleted');
    } catch (error) { setStatus(error.message); toast.error(error.message); } finally { setLoading(false); }
  };

  const editor = (
    <>
      <header className="mb-5 flex flex-col gap-4 lg:mb-6 lg:flex-row lg:items-start lg:justify-between">
        <div><p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-[#8a6d2f]">Eid template editor</p><h1 className="text-4xl font-black text-slate-950 dark:text-white">Default Eid <span className="text-lg text-gold">ID 7</span></h1></div>
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
      {publicUrl ? <div className="mb-4 flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-2 dark:border-[#263547] dark:bg-[#0e1721] sm:flex-row sm:items-center"><span className="min-w-0 flex-1 truncate px-2 text-sm text-slate-600 dark:text-slate-300" dir="ltr">{publicUrl}</span><button type="button" onClick={() => navigator.clipboard?.writeText(publicUrl)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gold px-4 text-sm font-black text-[#111820]"><FiCopy /> Copy</button></div> : null}
      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-[#263547] dark:bg-[#0b131c]">
        <ContentLocaleSwitcher
          value={form.locale}
          onChange={(locale) => setForm({
            ...createEmptyEidForm(locale),
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
        <div className={`grid gap-4 p-4 sm:p-5 ${activeSection === 'wishes' || activeSection === 'moments' ? '' : 'md:grid-cols-2'}`}>
          {activeFields.map(([path, label, textarea, type]) => <Field key={path} label={label} value={getValue(form, path)} textarea={textarea} type={type} onChange={(value) => update(path, value)} />)}
          {activeSection === 'basic' ? <><FontFamilyPicker value={form.font_family} onChange={(value) => update('font_family', value)} /><label className="col-span-full flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:border-[#344458] dark:bg-[#101923] dark:text-slate-200 sm:w-fit"><input className="h-4 w-4 accent-[#D6B15C]" type="checkbox" checked={form.is_published} onChange={(event) => update('is_published', event.target.checked)} /> Published</label></> : null}
        </div>
      </div>
    </>
  );

  const modalActions = (
    <div className="mobile-stack-actions flex w-full items-center justify-between gap-2">
      <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 dark:border-[#344458] dark:bg-[#101923] dark:text-slate-300">{status}</span>
      <CustomBottom
        text="Save"
        onClick={save}
        loading={saveLoading}
        loadingText="Saving..."
        buttonStyles="min-h-10 py-2.5 px-4 text-sm normal-case tracking-normal bg-gradient-to-r from-gold to-[#f0cf83] text-[#111820] font-black transition hover:scale-[1.02] cursor-pointer"
        styles="w-fit"
        rightIcon={<FiSave />}
      />
    </div>
  );

  if (embedded) {
    return (
      <>
        {isEditorView ? editor : (
          <EidOverview
            greetings={greetings}
            loading={loading}
            onDelete={setDeleteCandidate}
            onEdit={editGreeting}
            onPageChange={setPage}
            pagination={pagination}
            publicBaseUrl={publicBaseUrl}
            status={status}
            onCreateNew={startNew}
            editLoadingId={editLoadingId}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            templateFilter={templateFilter}
            setTemplateFilter={setTemplateFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
        )}
        <CustomModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          eyebrow="Eid template editor"
          title="Edit Default Eid — ID 7"
          headerActions={modalActions}
        >
          {publicUrl ? <div className="mb-4 flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-2 dark:border-[#263547] dark:bg-[#0e1721] sm:flex-row sm:items-center"><span className="min-w-0 flex-1 truncate px-2 text-sm text-slate-600 dark:text-slate-300" dir="ltr">{publicUrl}</span><button type="button" onClick={() => navigator.clipboard?.writeText(publicUrl)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gold px-4 text-sm font-black text-[#111820]"><FiCopy /> Copy</button></div> : null}
          <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-[#263547] dark:bg-[#0b131c]">
            <ContentLocaleSwitcher
              value={form.locale}
              onChange={(locale) => setForm({
                ...createEmptyEidForm(locale),
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
            <div className={`grid gap-4 p-4 sm:p-5 ${activeSection === 'wishes' || activeSection === 'moments' ? '' : 'md:grid-cols-2'}`}>
              {activeFields.map(([path, label, textarea, type]) => <Field key={path} label={label} value={getValue(form, path)} textarea={textarea} type={type} onChange={(value) => update(path, value)} />)}
              {activeSection === 'basic' ? <><FontFamilyPicker value={form.font_family} onChange={(value) => update('font_family', value)} /><label className="col-span-full flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:border-[#344458] dark:bg-[#101923] dark:text-slate-200 sm:w-fit"><input className="h-4 w-4 accent-[#D6B15C]" type="checkbox" checked={form.is_published} onChange={(event) => update('is_published', event.target.checked)} /> Published</label></> : null}
            </div>
          </div>
        </CustomModal>
        <ConfirmationDialog isOpen={Boolean(deleteCandidate)} onClose={() => setDeleteCandidate(null)} onConfirm={() => removeGreeting(deleteCandidate)} confirmLoading={loading} title="Delete Eid greeting?" message={`Delete ${deleteCandidate?.recipient_name || ''}?`} confirmText="Delete" cancelText="Close" />
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
        eidCount={greetings.length}
        birthdayCount={birthdayCount}
        onCreate={() => navigate('/invitations/new')}
        onShowCompleted={() => navigate('/completed')}
        onCreateEid={startNew}
        onCreateBirthday={() => navigate('/birthday-greetings/new')}
        onShowSettings={() => navigate('/settings')}
      >
        {isEditorView ? editor : (
          <EidOverview
            greetings={greetings}
            loading={loading}
            onDelete={setDeleteCandidate}
            onEdit={editGreeting}
            onPageChange={setPage}
            pagination={pagination}
            publicBaseUrl={publicBaseUrl}
            status={status}
            onCreateNew={startNew}
            editLoadingId={editLoadingId}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            templateFilter={templateFilter}
            setTemplateFilter={setTemplateFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
        )}
      </DashboardLayout>
      <CustomModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} eyebrow="Eid template editor" title="Edit Default Eid — ID 7" headerActions={modalActions}>
        {publicUrl ? <div className="mb-4 flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-2 dark:border-[#263547] dark:bg-[#0e1721] sm:flex-row sm:items-center"><span className="min-w-0 flex-1 truncate px-2 text-sm text-slate-600 dark:text-slate-300" dir="ltr">{publicUrl}</span><button type="button" onClick={() => navigator.clipboard?.writeText(publicUrl)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gold px-4 text-sm font-black text-[#111820]"><FiCopy /> Copy</button></div> : null}
        <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-[#263547] dark:bg-[#0b131c]">
          <ContentLocaleSwitcher
            value={form.locale}
            onChange={(locale) => setForm({
              ...createEmptyEidForm(locale),
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
          <div className={`grid gap-4 p-4 sm:p-5 ${activeSection === 'wishes' || activeSection === 'moments' ? '' : 'md:grid-cols-2'}`}>
            {activeFields.map(([path, label, textarea, type]) => <Field key={path} label={label} value={getValue(form, path)} textarea={textarea} type={type} onChange={(value) => update(path, value)} />)}
            {activeSection === 'basic' ? <><FontFamilyPicker value={form.font_family} onChange={(value) => update('font_family', value)} /><label className="col-span-full flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:border-[#344458] dark:bg-[#101923] dark:text-slate-200 sm:w-fit"><input className="h-4 w-4 accent-[#D6B15C]" type="checkbox" checked={form.is_published} onChange={(event) => update('is_published', event.target.checked)} /> Published</label></> : null}
          </div>
        </div>
      </CustomModal>
      <ConfirmationDialog isOpen={Boolean(deleteCandidate)} onClose={() => setDeleteCandidate(null)} onConfirm={() => removeGreeting(deleteCandidate)} confirmLoading={loading} title="Delete Eid greeting?" message={`Delete ${deleteCandidate?.recipient_name || ''}?`} confirmText="Delete" cancelText="Close" />
    </>
  );
}
