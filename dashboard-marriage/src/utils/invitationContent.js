import en from '../locales/en.json';
import ar from '../locales/ar.json';

export const CONTENT_LOCALES = ['en', 'ar'];
export const LOCALIZED_SECTIONS = new Set([
  'loading',
  'hero',
  'event',
  'love_story',
  'gallery',
  'countdown',
  'rsvp',
  'footer',
  'audio',
  'party_upload',
]);

const SHARED_FIELD_PATHS = new Set([
  'public_path',
  'requester_name',
  'requester_whatsapp',
  'order_date',
  'hero.is_enabled',
  'event.is_enabled',
  'love_story.is_enabled',
  'gallery.is_enabled',
  'countdown.is_enabled',
  'countdown.target_date',
  'footer.is_enabled',
  'audio.is_enabled',
  'event.map_url',
  'audio.src',
  'audio.volume',
  'gallery.image_urls_text',
  'rsvp.is_enabled',
  'party_upload.is_enabled',
  'party_upload.max_images',
]);

const clone = (value) => JSON.parse(JSON.stringify(value));

const isLocalizedBucket = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return 'en' in value || 'ar' in value;
};

const mapLoveStoryEventsToText = (events = []) => events
  .map((event) => `${event.date || ''} | ${event.title || ''} | ${event.desc || ''}`)
  .join('\n');

const buildLoveStoryLocale = (source = {}) => ({
  kicker: source.kicker || '',
  title: source.title || '',
  events_text: source.events_text || mapLoveStoryEventsToText(source.events),
});

const buildGalleryLocale = (source = {}) => ({
  title: source.title || '',
});

const buildAudioLocale = (source = {}) => ({
  play: source.play || '',
  pause: source.pause || '',
});

const buildPartyUploadLocale = (source = {}) => ({
  title: source.title || '',
  description: source.description || '',
  button_text: source.button_text || '',
  name_placeholder: source.name_placeholder || '',
});

const buildEventLocale = (source = {}) => ({
  kicker: source.kicker || '',
  title: source.title || '',
  day_label: source.day_label || '',
  date: source.date || '',
  description: source.description || '',
  time: source.time || '',
  venue_label: source.venue_label || '',
  venue: source.venue || '',
  location: source.location || '',
  address: source.address || '',
  landmark: source.landmark || '',
  landmark_value: source.landmark_value || '',
  open_location: source.open_location || '',
  map_title: source.map_title || '',
});

const buildLocalizedSection = (enSource = {}, arSource = {}, mapper = (value) => clone(value)) => ({
  en: mapper(enSource),
  ar: mapper(arSource),
});

export const createEmptyForm = () => ({
  groom_name: { en: '', ar: '' },
  bride_name: { en: '', ar: '' },
  couple_display_name: { en: '', ar: '' },
  requester_name: '',
  requester_whatsapp: '',
  order_date: new Date().toISOString().slice(0, 10),
  public_path: '',
  template: 'classic',
  font_family: 'elegant',
  font_sizes: {},
  locale: 'en',
  is_published: true,
  organizer_username: '',
  organizer_password: '',
  loading: buildLocalizedSection(en.loading, ar.loading),
  hero: {
    is_enabled: true,
    ...buildLocalizedSection(en.hero, ar.hero),
  },
  event: {
    is_enabled: true,
    ...buildLocalizedSection(en.event, ar.event, buildEventLocale),
    map_url: '',
  },
  countdown: {
    is_enabled: true,
    target_date: '2026-10-30T20:00:00',
    ...buildLocalizedSection(
      { title: en.countdown.title, finished: en.countdown.finished },
      { title: ar.countdown.title, finished: ar.countdown.finished },
    ),
  },
  love_story: {
    is_enabled: true,
    ...buildLocalizedSection(
      buildLoveStoryLocale({
        kicker: en.loveStory.kicker,
        title: en.loveStory.title,
        events: en.loveStory.events,
      }),
      buildLoveStoryLocale({
        kicker: ar.loveStory.kicker,
        title: ar.loveStory.title,
        events: ar.loveStory.events,
      }),
    ),
  },
  gallery: {
    is_enabled: true,
    image_urls_text: '',
    ...buildLocalizedSection(en.gallery, ar.gallery, buildGalleryLocale),
  },
  rsvp: {
    is_enabled: true,
    ...buildLocalizedSection(en.rsvp, ar.rsvp),
  },
  footer: {
    is_enabled: true,
    ...buildLocalizedSection(en.footer, ar.footer),
  },
  audio: {
    is_enabled: true,
    src: '',
    volume: '0.4',
    ...buildLocalizedSection(en.audio, ar.audio, buildAudioLocale),
  },
  party_upload: {
    is_enabled: false,
    max_images: '',
    ...buildLocalizedSection(en.party_upload, ar.party_upload, buildPartyUploadLocale),
  },
});

export const buildFormFieldPath = (path, locale) => {
  if (SHARED_FIELD_PATHS.has(path)) return path;
  if (path === 'groom_name' || path === 'bride_name' || path === 'couple_display_name') return `${path}.${locale}`;
  const [section, ...rest] = path.split('.');
  if (LOCALIZED_SECTIONS.has(section)) {
    return [section, locale, ...rest].join('.');
  }
  return path;
};

const hydrateLocalizedSection = (section, emptySection, mapper) => {
  if (isLocalizedBucket(section)) {
    return {
      en: { ...emptySection.en, ...mapper(section.en || {}) },
      ar: { ...emptySection.ar, ...mapper(section.ar || {}) },
    };
  }

  const flat = mapper(section || {});
  return {
    en: { ...emptySection.en, ...flat },
    ar: { ...emptySection.ar },
  };
};

export const hydrateInvitation = (invitation) => {
  const base = createEmptyForm();

  return {
    ...base,
    groom_name: isLocalizedBucket(invitation.groom_name)
      ? { ...base.groom_name, ...invitation.groom_name }
      : {
          en: invitation.groom_name || '',
          ar: invitation.groom_name || '',
        },
    bride_name: isLocalizedBucket(invitation.bride_name)
      ? { ...base.bride_name, ...invitation.bride_name }
      : {
          en: invitation.bride_name || '',
          ar: invitation.bride_name || '',
        },
    couple_display_name: isLocalizedBucket(invitation.couple_display_name)
      ? { ...base.couple_display_name, ...invitation.couple_display_name }
      : {
          en: invitation.couple_display_name || '',
          ar: invitation.couple_display_name || '',
        },
    organizer_username: invitation.organizer_username || '',
    organizer_password: invitation.organizer_password || '',
    requester_name: invitation.requester_name || '',
    requester_whatsapp: invitation.requester_whatsapp || '',
    order_date: invitation.order_date || '',
    public_path: invitation.public_path || '',
    template: invitation.template || 'classic',
    font_family: invitation.font_family || 'elegant',
    font_sizes: invitation.font_sizes && typeof invitation.font_sizes === 'object'
      ? { ...invitation.font_sizes }
      : {},
    locale: invitation.locale === 'ar' ? 'ar' : 'en',
    is_published: invitation.is_published ?? true,
    loading: hydrateLocalizedSection(invitation.loading, base.loading, (value) => value),
    hero: {
      is_enabled: invitation.hero?.is_enabled ?? true,
      ...hydrateLocalizedSection(
        invitation.hero,
        { en: base.hero.en, ar: base.hero.ar },
        (value) => value,
      ),
    },
    event: {
      is_enabled: invitation.event?.is_enabled ?? true,
      ...hydrateLocalizedSection(invitation.event, base.event, buildEventLocale),
      map_url: invitation.event?.map_url || invitation.event?.en?.map_url || invitation.event?.ar?.map_url || '',
    },
    countdown: {
      is_enabled: invitation.countdown?.is_enabled ?? true,
      target_date: invitation.countdown?.target_date || base.countdown.target_date,
      ...hydrateLocalizedSection(invitation.countdown, { en: base.countdown.en, ar: base.countdown.ar }, (value) => ({
        title: value.title || '',
        finished: value.finished || '',
      })),
    },
    love_story: {
      is_enabled: invitation.love_story?.is_enabled ?? true,
      ...hydrateLocalizedSection(
        invitation.love_story,
        { en: base.love_story.en, ar: base.love_story.ar },
        buildLoveStoryLocale,
      ),
    },
    gallery: {
      is_enabled: invitation.gallery?.is_enabled ?? true,
      image_urls_text: (invitation.gallery?.image_urls || []).join('\n'),
      ...hydrateLocalizedSection(invitation.gallery, { en: base.gallery.en, ar: base.gallery.ar }, buildGalleryLocale),
    },
    rsvp: {
      is_enabled: invitation.rsvp?.is_enabled ?? true,
      ...hydrateLocalizedSection(
        invitation.rsvp,
        { en: base.rsvp.en, ar: base.rsvp.ar },
        (value) => value,
      ),
    },
    footer: {
      is_enabled: invitation.footer?.is_enabled ?? true,
      ...hydrateLocalizedSection(
        invitation.footer,
        { en: base.footer.en, ar: base.footer.ar },
        (value) => value,
      ),
    },
    audio: {
      is_enabled: invitation.audio?.is_enabled ?? true,
      src: invitation.audio?.src || '',
      volume: invitation.audio?.volume || base.audio.volume,
      ...hydrateLocalizedSection(
        invitation.audio,
        { en: base.audio.en, ar: base.audio.ar },
        buildAudioLocale,
      ),
    },
    party_upload: {
      is_enabled: invitation.party_upload?.is_enabled ?? false,
      max_images: invitation.party_upload?.max_images ?? '',
      ...hydrateLocalizedSection(
        invitation.party_upload,
        { en: base.party_upload.en, ar: base.party_upload.ar },
        buildPartyUploadLocale,
      ),
    },
  };
};

const parseLines = (text, mapper) => text
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean)
  .map(mapper);

export const serializeInvitation = (form) => {
  const imageUrls = parseLines(form.gallery.image_urls_text, (line) => line);

  const fallbackGroomName = form.groom_name?.en || form.groom_name?.ar || '';
  const fallbackBrideName = form.bride_name?.en || form.bride_name?.ar || '';
  const fallbackCoupleName = `${fallbackGroomName} & ${fallbackBrideName}`.trim();

  return {
    groom_name: {
      en: form.groom_name?.en || fallbackGroomName,
      ar: form.groom_name?.ar || fallbackGroomName,
    },
    bride_name: {
      en: form.bride_name?.en || fallbackBrideName,
      ar: form.bride_name?.ar || fallbackBrideName,
    },
    couple_display_name: {
      en: form.couple_display_name?.en || fallbackCoupleName,
      ar: form.couple_display_name?.ar || form.couple_display_name?.en || fallbackCoupleName,
    },
    organizer_username: form.organizer_username,
    organizer_password: form.organizer_password,
    requester_name: form.requester_name || '',
    requester_whatsapp: form.requester_whatsapp || '',
    order_date: form.order_date || '',
    public_path: form.public_path,
    template: form.template,
    font_family: form.font_family || 'elegant',
    font_sizes: Object.fromEntries(
      Object.entries(form.font_sizes || {})
        .filter(([, size]) => Number.isInteger(Number(size)) && Number(size) >= 8 && Number(size) <= 120)
        .map(([path, size]) => [path, Number(size)]),
    ),
    locale: form.locale === 'ar' ? 'ar' : 'en',
    is_published: form.is_published,
    loading: form.loading,
    hero: {
      is_enabled: form.hero.is_enabled,
      en: form.hero.en,
      ar: form.hero.ar,
    },
    event: {
      is_enabled: form.event.is_enabled,
      en: { ...form.event.en, map_url: form.event.map_url },
      ar: { ...form.event.ar, map_url: form.event.map_url },
    },
    countdown: {
      is_enabled: form.countdown.is_enabled,
      target_date: form.countdown.target_date,
      en: form.countdown.en,
      ar: form.countdown.ar,
    },
    love_story: {
      is_enabled: form.love_story.is_enabled,
      en: {
        kicker: form.love_story.en.kicker,
        title: form.love_story.en.title,
        events: parseLines(form.love_story.en.events_text, (line) => {
          const [date = '', title = '', desc = ''] = line.split('|').map((part) => part.trim());
          return { date, title, desc };
        }),
      },
      ar: {
        kicker: form.love_story.ar.kicker,
        title: form.love_story.ar.title,
        events: parseLines(form.love_story.ar.events_text, (line) => {
          const [date = '', title = '', desc = ''] = line.split('|').map((part) => part.trim());
          return { date, title, desc };
        }),
      },
    },
    gallery: {
      is_enabled: form.gallery.is_enabled,
      image_urls: imageUrls,
      en: { ...form.gallery.en, image_urls: imageUrls },
      ar: { ...form.gallery.ar, image_urls: imageUrls },
    },
    rsvp: {
      is_enabled: form.rsvp.is_enabled,
      en: form.rsvp.en,
      ar: form.rsvp.ar,
    },
    footer: {
      is_enabled: form.footer.is_enabled,
      en: form.footer.en,
      ar: form.footer.ar,
    },
    audio: {
      is_enabled: form.audio.is_enabled,
      src: form.audio.src,
      volume: form.audio.volume,
      en: form.audio.en,
      ar: form.audio.ar,
    },
    party_upload: {
      is_enabled: form.party_upload.is_enabled,
      max_images: form.party_upload.max_images === '' ? null : Number(form.party_upload.max_images),
      en: form.party_upload.en,
      ar: form.party_upload.ar,
    },
  };
};
