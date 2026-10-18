import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FiArrowLeft, FiEdit2, FiExternalLink, FiGrid, FiRefreshCw } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../DashboardLayout';
import { invitationTemplateOptions } from '../../components/TemplatePicker';
import { birthdayTemplateOptions } from '../../components/BirthdayTemplatePicker';
import { getFrontendUrl } from '../../../utils/apiConfig';
import eidPreview from '../../../assets/images/eid_mubarak_banner.png';
import lovePreview from '../../../assets/images/id11.png';

const categoryLabels = {
  all: { en: 'All templates', ar: 'كل القوالب' },
  invitation: { en: 'Invitations', ar: 'دعوات الزفاف' },
  eid: { en: 'Eid', ar: 'تهاني العيد' },
  birthday: { en: 'Birthday', ar: 'أعياد الميلاد' },
  love: { en: 'Love messages', ar: 'رسائل الحب' },
};

const TemplatesPage = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');
  const language = isArabic ? 'ar' : 'en';
  const [category, setCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [previewLocale, setPreviewLocale] = useState('en');
  const editorFrameRef = useRef(null);
  const previewFrameRef = useRef(null);

  const templates = useMemo(() => [
    ...invitationTemplateOptions.map((template) => ({
      id: template.globalId,
      key: template.id,
      category: 'invitation',
      name: t(template.labelKey),
      description: t(template.descriptionKey),
      image: template.image,
      previewPath: `/demo?template=${template.id}`,
      editPath: `/invitations/new?template=${template.id}&templatePreview=1`,
    })),
    {
      id: 7,
      key: 'default',
      category: 'eid',
      name: isArabic ? 'تهنئة العيد' : 'Eid Greeting',
      description: isArabic
        ? 'تجربة عيد تفاعلية بالأمنيات والذكريات والمؤثرات الاحتفالية.'
        : 'An interactive Eid experience with wishes, memories, and festive effects.',
      image: eidPreview,
      previewPath: '/eid/demo',
      editPath: '/eid-greetings/new?templatePreview=1',
    },
    ...birthdayTemplateOptions.map((template) => ({
      id: template.globalId,
      key: template.id,
      category: 'birthday',
      name: template.label,
      description: template.description,
      image: template.image,
      previewPath: `/birthday/demo?template=${template.id}`,
      editPath: `/birthday-greetings/new?template=${template.id}&templatePreview=1`,
    })),
    {
      id: 11,
      key: 'happy-message',
      category: 'love',
      name: isArabic ? 'رسالة حب سعيدة' : 'Happy Message',
      description: isArabic
        ? 'رسالة حب سينمائية تفاعلية بها هدية وذكريات وخطاب ومفاجأة أخيرة.'
        : 'A cinematic love message with a gift, memories, letter, and final surprise.',
      image: lovePreview,
      previewPath: '/love/demo',
      editPath: '/love-messages/new?templatePreview=1',
    },
  ], [isArabic, t]);

  const visibleTemplates = category === 'all'
    ? templates
    : templates.filter((template) => template.category === category);
  const frontendUrl = getFrontendUrl().replace(/\/$/, '');

  useEffect(() => {
    const receiveEditorData = (event) => {
      if (event.data?.type !== 'wil-template-preview-data') return;
      setPreviewData(event.data);
      previewFrameRef.current?.contentWindow?.postMessage(event.data, '*');
    };
    window.addEventListener('message', receiveEditorData);
    return () => window.removeEventListener('message', receiveEditorData);
  }, []);

  useEffect(() => {
    if (!previewData) return;
    previewFrameRef.current?.contentWindow?.postMessage(previewData, '*');
  }, [previewData]);

  const openStudio = (template) => {
    setPreviewLocale('en');
    setPreviewData(null);
    setSelectedTemplate(template);
  };

  const changePreviewLanguage = (locale) => {
    setPreviewLocale(locale);
    editorFrameRef.current?.contentWindow?.postMessage({
      type: 'wil-template-language',
      locale,
    }, '*');
  };

  if (selectedTemplate) {
    const editorJoin = selectedTemplate.editPath.includes('?') ? '&' : '?';
    const previewJoin = selectedTemplate.previewPath.includes('?') ? '&' : '?';
    const editorUrl = `${window.location.origin}${selectedTemplate.editPath}${editorJoin}studio=1`;
    const previewUrl = `${frontendUrl}${selectedTemplate.previewPath}${previewJoin}studio=1`;

    return (
      <DashboardLayout activeView="templates">
        <div className="mx-auto max-w-[1800px]">
          <header className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0e1721] lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" onClick={() => setSelectedTemplate(null)} className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-gold dark:border-white/10 dark:bg-white/[0.05] dark:text-white" aria-label="Back to templates">
                <FiArrowLeft className={isArabic ? 'rotate-180' : ''} />
              </button>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#8a6d2f] dark:text-gold">{isArabic ? 'استوديو القالب' : 'Template studio'}</p>
                <h1 className="truncate text-xl font-black text-slate-950 dark:text-white">{selectedTemplate.name} · ID {selectedTemplate.id}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden text-xs font-bold text-slate-500 sm:inline dark:text-slate-400">{isArabic ? 'لغة بيانات المعاينة:' : 'Preview data language:'}</span>
              {['en', 'ar'].map((locale) => (
                <button key={locale} type="button" onClick={() => changePreviewLanguage(locale)} className={`min-h-11 rounded-lg px-4 text-sm font-black transition ${previewLocale === locale ? 'bg-gold text-[#111820]' : 'border border-slate-200 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200'}`}>
                  {locale === 'ar' ? 'العربية' : 'English'}
                </button>
              ))}
            </div>
          </header>

          <div className="grid gap-4 xl:grid-cols-[minmax(440px,0.9fr)_minmax(520px,1.1fr)]">
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-[#080d13]">
              <div className="flex h-11 items-center justify-between border-b border-slate-200 bg-white px-4 text-xs font-black text-slate-600 dark:border-white/10 dark:bg-[#101923] dark:text-slate-300">
                <span>{isArabic ? 'تعديل البيانات' : 'Edit data'}</span>
                <FiEdit2 />
              </div>
              <iframe ref={editorFrameRef} src={editorUrl} title={`${selectedTemplate.name} editor`} className="h-[calc(100vh-12.5rem)] min-h-[680px] w-full bg-slate-100 dark:bg-[#080d13]" />
            </section>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900 dark:border-white/10">
              <div className="flex h-11 items-center justify-between border-b border-white/10 bg-[#101923] px-4 text-xs font-black text-slate-200">
                <span className="inline-flex items-center gap-2"><FiRefreshCw className="text-emerald-400" /> {isArabic ? 'المعاينة الحية' : 'Live preview'}</span>
                <a href={previewUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-gold">{isArabic ? 'ملء الشاشة' : 'Full screen'} <FiExternalLink /></a>
              </div>
              <iframe
                ref={previewFrameRef}
                src={previewUrl}
                title={`${selectedTemplate.name} live preview`}
                onLoad={() => previewData && previewFrameRef.current?.contentWindow?.postMessage(previewData, '*')}
                className="h-[calc(100vh-12.5rem)] min-h-[680px] w-full bg-white"
              />
            </section>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeView="templates">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[#8a6d2f] dark:text-gold">
              <FiGrid />
              <span className="text-[11px] font-black uppercase tracking-[0.18em]">
                {isArabic ? 'مكتبة المعاينات' : 'Preview library'}
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white lg:text-4xl">
              {isArabic ? 'كل القوالب' : 'All Templates'}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500 dark:text-slate-400">
              {isArabic
                ? 'افتح أي قالب ببيانات تجريبية وشاهد تصميمه الحقيقي. أثناء التطوير، أي تعديل في كود القالب يظهر في صفحة المعاينة مباشرة.'
                : 'Open any template with demo data and inspect its real experience. During development, changes to the template code appear directly in the preview.'}
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <FiRefreshCw className="animate-spin [animation-duration:3s]" />
            {isArabic ? 'معاينة حية من الكود الحالي' : 'Live preview from current code'}
          </div>
        </header>

        <nav className="mb-6 flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white/70 p-1.5 shadow-sm dark:border-white/10 dark:bg-[#0e1721]/60" aria-label="Template categories">
          {Object.entries(categoryLabels).map(([id, labels]) => (
            <button
              key={id}
              type="button"
              onClick={() => setCategory(id)}
              className={`min-h-11 shrink-0 rounded-lg px-4 text-xs font-black transition ${category === id
                ? 'bg-gold text-[#111820] shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.06]'}`}
            >
              {labels[language]}
            </button>
          ))}
        </nav>

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visibleTemplates.map((template) => {
            const previewUrl = `${frontendUrl}${template.previewPath}`;
            return (
              <article key={template.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_38px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:border-gold/70 hover:shadow-[0_22px_48px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-[#0e1721] dark:shadow-[0_18px_45px_rgba(0,0,0,0.28)]">
                <a href={previewUrl} target="_blank" rel="noreferrer" className="relative block aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-[#15202b]">
                  <img src={template.image} alt={template.name} className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-[1.04]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071019]/90 via-transparent to-transparent" />
                  <span className="absolute end-3 top-3 rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-[10px] font-black text-white backdrop-blur-md">ID {template.id}</span>
                  <span className="absolute bottom-3 start-3 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white backdrop-blur-md">
                    {categoryLabels[template.category][language]}
                  </span>
                </a>
                <div className="p-5">
                  <h2 className="text-xl font-black text-slate-950 dark:text-white">{template.name}</h2>
                  <p className="mt-2 min-h-[3rem] text-sm leading-6 text-slate-500 dark:text-slate-400">{template.description}</p>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => openStudio(template)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gold px-3 text-sm font-black text-[#111820] transition hover:bg-[#e6c675]">
                      <FiEdit2 />
                      {isArabic ? 'تعديل' : 'Edit'}
                    </button>
                    <a href={previewUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#111820] px-3 text-sm font-black text-gold transition hover:bg-[#1d2a38] dark:border dark:border-white/10">
                      {isArabic ? 'معاينة' : 'Preview'}
                      <FiExternalLink />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default TemplatesPage;
