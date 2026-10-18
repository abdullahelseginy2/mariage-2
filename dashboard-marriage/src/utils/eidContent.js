const defaultMoments = [
  'Eid lights | First Eid night | Eid memories | Lanterns, warmth, and a quiet promise of a brighter year. | | 42',
  'The red roses | Eid morning | Love gift | A little bouquet carrying a lot of tenderness. | | 56',
];

const defaultWishes = [
  'Every Eid, you are the joy I keep returning to. | Eternal joy, Warm wishes',
  'May this Eid bring us peace, tenderness, and a love that keeps blooming. | Blessings, New love',
];

const defaultMomentsAr = [
  'أضواء العيد | ليلة العيد الأولى | ذكريات العيد | فوانيس ودفء وأمنيات هادئة بعام أجمل. | | 42',
  'الورد الأحمر | صباح العيد | هدية حب | باقة صغيرة تحمل الكثير من الود. | | 56',
];

const defaultWishesAr = [
  'كل عيد وأنت الفرحة التي أعود إليها. | فرحة دائمة, أمنيات دافئة',
  'أسأل الله أن يحمل لنا هذا العيد سلاماً ووداً ومحبة تكبر كل يوم. | بركة, محبة جديدة',
];

const contentDefaults = {
  en: {
    hero: {
      kicker: 'Eid Mubarak',
      title: 'A warm Eid greeting made just for you',
      subtitle: 'A small digital celebration full of wishes, memories, and affection.',
      primary_button: 'Read wishes',
      secondary_button: 'Explore memories',
      banner_image: '',
    },
    wishes: {
      title: 'Eid wishes',
      items_text: defaultWishes.join('\n'),
    },
    moments: {
      title: 'Eid memories',
      items_text: defaultMoments.join('\n'),
    },
    pulses: {
      title: 'Love pulses board',
      description: 'Send a warm pulse and fill the greeting with floating hearts and petals.',
      button: 'Send warm pulse',
      music_on: 'Pause Eid melody',
      music_off: 'Play Eid melody',
      empty: 'No pulses yet. Send the first one.',
    },
    instrument: {
      title: 'Interactive instrument',
      description: 'Tap the notes to play a tiny festive melody.',
    },
    footer: {
      text: 'Made with love for Eid.',
    },
  },
  ar: {
    hero: {
      kicker: 'عيد مبارك',
      title: 'تهنئة عيد دافئة صُنعت خصيصاً لك',
      subtitle: 'مساحة صغيرة مليئة بالأمنيات والذكريات والمودة.',
      primary_button: 'قراءة الأمنيات',
      secondary_button: 'استعراض الذكريات',
      banner_image: '',
    },
    wishes: {
      title: 'أمنيات العيد',
      items_text: defaultWishesAr.join('\n'),
    },
    moments: {
      title: 'ذكريات العيد',
      items_text: defaultMomentsAr.join('\n'),
    },
    pulses: {
      title: 'لوحة نبضات المحبة',
      description: 'أرسل نبضة دافئة لتملأ التهنئة بالقلوب والبهجة.',
      button: 'أرسل نبضة محبة',
      music_on: 'إيقاف لحن العيد',
      music_off: 'تشغيل لحن العيد',
      empty: 'لا توجد نبضات بعد. أرسل الأولى.',
    },
    instrument: {
      title: 'آلة موسيقية تفاعلية',
      description: 'اضغط على النغمات لعزف لحن عيد صغير.',
    },
    footer: {
      text: 'صُنع بكل حب لأجل العيد.',
    },
  },
};

export const createEmptyEidForm = (locale = 'en') => ({
  recipient_name: '',
  sender_name: '',
  requester_name: '',
  requester_whatsapp: '',
  order_date: new Date().toISOString().slice(0, 10),
  public_path: '',
  locale,
  font_family: 'elegant',
  is_published: true,
  content: {
    hero: { ...contentDefaults[locale].hero },
    wishes: { ...contentDefaults[locale].wishes },
    moments: { ...contentDefaults[locale].moments },
    pulses: { ...contentDefaults[locale].pulses },
    instrument: { ...contentDefaults[locale].instrument },
    footer: { ...contentDefaults[locale].footer },
  },
});

const parseLines = (text, mapper) => String(text || '').split('\n').map((line) => line.trim()).filter(Boolean).map(mapper);

export const serializeEidGreeting = (form) => ({
  recipient_name: form.recipient_name,
  sender_name: form.sender_name,
  requester_name: form.requester_name || '',
  requester_whatsapp: form.requester_whatsapp || '',
  order_date: form.order_date || '',
  public_path: form.public_path,
  locale: form.locale === 'ar' ? 'ar' : 'en',
  font_family: form.font_family || 'elegant',
  is_published: form.is_published,
  content: {
    ...form.content,
    wishes: {
      ...form.content.wishes,
      items: parseLines(form.content.wishes.items_text, (line) => {
        const [text = '', tags = ''] = line.split('|').map((part) => part.trim());
        return { text, tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean) };
      }),
    },
    moments: {
      ...form.content.moments,
      items: parseLines(form.content.moments.items_text, (line) => {
        const [title = '', date = '', category = '', description = '', imageUrl = '', likes = '0'] = line.split('|').map((part) => part.trim());
        return { title, date, category, description, imageUrl, likes: Number(likes) || 0 };
      }),
    },
  },
});

export const hydrateEidGreeting = (greeting) => {
  const base = createEmptyEidForm(greeting?.locale === 'ar' ? 'ar' : 'en');
  const content = greeting?.content || {};

  return {
    ...base,
    recipient_name: greeting?.recipient_name || '',
    sender_name: greeting?.sender_name || '',
    requester_name: greeting?.requester_name || '',
    requester_whatsapp: greeting?.requester_whatsapp || '',
    order_date: greeting?.order_date || '',
    public_path: greeting?.public_path || '',
    locale: greeting?.locale === 'ar' ? 'ar' : 'en',
    font_family: greeting?.font_family || 'elegant',
    is_published: greeting?.is_published ?? true,
    content: {
      hero: { ...base.content.hero, ...(content.hero || {}) },
      wishes: {
        ...base.content.wishes,
        ...(content.wishes || {}),
        items_text: (content.wishes?.items || []).map((wish) => `${wish.text || ''} | ${(wish.tags || []).join(', ')}`).join('\n') || content.wishes?.items_text || base.content.wishes.items_text,
      },
      moments: {
        ...base.content.moments,
        ...(content.moments || {}),
        items_text: (content.moments?.items || []).map((moment) => `${moment.title || ''} | ${moment.date || ''} | ${moment.category || ''} | ${moment.description || ''} | ${moment.imageUrl || ''} | ${moment.likes || 0}`).join('\n') || content.moments?.items_text || base.content.moments.items_text,
      },
      pulses: { ...base.content.pulses, ...(content.pulses || {}) },
      instrument: { ...base.content.instrument, ...(content.instrument || {}) },
      footer: { ...base.content.footer, ...(content.footer || {}) },
    },
  };
};
