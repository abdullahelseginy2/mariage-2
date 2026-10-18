const englishDefaults = {
  intro: {
    teaser: 'Someone left something special for you...',
    revealed_message: 'You have received a secret message',
    open_button: 'Open My Message',
  },
  countdown_reveal: {
    lines_text: [
      'I have something to tell you',
      'Something I wanted to say for a long time',
      'You make my days brighter',
      'You make me smile',
      'You make life beautiful',
      'You are special',
      'Very special',
      'More than you know',
      'Almost there',
      'Love',
    ].join('\n'),
  },
  reasons: {
    title: 'Why do I love you?',
    items_text: [
      'Because your smile changes everything.',
      'Because talking to you feels like home.',
      'Because you make ordinary moments magical.',
      'Because you are simply you.',
    ].join('\n'),
  },
  gallery: {
    title: 'Our Memories',
    items_text: '',
  },
  letter: {
    title: 'A Letter for You',
    message: 'My love,\n\nThere are so many things I feel whenever I think of you, but words never seem large enough to hold them all. You have become the calm in my busiest days, the smile that appears without a reason, and the beautiful detail that makes every ordinary moment worth remembering.\n\nThank you for being exactly who you are, for every conversation, every laugh, and every memory we continue to create together. If I could choose my favorite place in this world, it would always be wherever you are.\n\nI hope this little message reminds you that you are deeply loved, endlessly appreciated, and forever close to my heart.',
    signature: 'Forever yours',
  },
  secret_boxes: {
    items_text: [
      'The first time I saw you | ',
      'My favorite thing about you | ',
      'Our future | ',
      'My heart | ',
    ].join('\n'),
  },
  love_timer: {
    title: 'We have been making memories together for',
    start_date: '',
  },
  final_surprise: {
    prompt: 'One last thing...',
    message: 'I Love You',
    subtitle: 'You are my favorite chapter.',
    couple_photo: '',
  },
  audio: {
    url: '',
  },
};

const arabicDefaults = {
  intro: {
    teaser: 'هناك شخص ترك لك شيئًا مميزًا...',
    revealed_message: 'لقد وصلت إليك رسالة سرية',
    open_button: 'افتح رسالتي',
  },
  countdown_reveal: {
    lines_text: [
      'لدي شيء أريد أن أخبرك به',
      'شيء أردت قوله منذ وقت طويل',
      'أنت تجعل أيامي أكثر إشراقًا',
      'أنت سبب ابتسامتي',
      'أنت تجعل الحياة أجمل',
      'أنت شخص مميز',
      'مميز جدًا',
      'أكثر مما تتخيل',
      'اقتربنا',
      'حب',
    ].join('\n'),
  },
  reasons: {
    title: 'لماذا أحبك؟',
    items_text: [
      'لأن ابتسامتك تغير كل شيء.',
      'لأن الحديث معك يشبه العودة إلى البيت.',
      'لأنك تجعل اللحظات العادية ساحرة.',
      'لأنك ببساطة أنت.',
    ].join('\n'),
  },
  gallery: { title: 'ذكرياتنا', items_text: '' },
  letter: {
    title: 'رسالة من قلبي إليك',
    message: 'حبيبي،\n\nهناك مشاعر كثيرة تسكن قلبي كلما فكرت فيك، لكن الكلمات دائمًا تبدو أصغر من أن تحملها كلها. أصبحت أنت الهدوء في أكثر أيامي ازدحامًا، والابتسامة التي تظهر على وجهي دون سبب، والتفصيلة الجميلة التي تجعل اللحظات العادية ذكريات لا تُنسى.\n\nشكرًا لأنك أنت، بكل ما فيك من جمال وصدق ودفء. شكرًا لكل حديث جمعنا، ولكل ضحكة، ولكل لحظة صنعتها معي وما زلنا نصنعها معًا. لو كان لي أن أختار مكاني المفضل في هذا العالم، فسيكون دائمًا المكان الذي تكون فيه.\n\nأتمنى أن تذكّرك هذه الرسالة الصغيرة بأنك محبوب بصدق، ومقدّر بلا حدود، وقريب من قلبي أكثر مما تستطيع الكلمات أن تصف.',
    signature: 'لك دائمًا وبكل الحب',
  },
  secret_boxes: {
    items_text: [
      'أول مرة رأيتك فيها | ',
      'أكثر شيء أحبه فيك | ',
      'مستقبلنا | ',
      'قلبي | ',
    ].join('\n'),
  },
  love_timer: { title: 'نحن نصنع الذكريات معًا منذ', start_date: '' },
  final_surprise: {
    prompt: 'شيء أخير...',
    message: 'أحبك',
    subtitle: 'أنت فصلي المفضل.',
    couple_photo: '',
  },
  audio: { url: '' },
};

const lines = (value) => String(value || '').split('\n').map((line) => line.trim()).filter(Boolean);

export const createEmptyLoveMessageForm = (locale = 'en') => ({
  recipient_name: '',
  sender_name: '',
  requester_name: '',
  requester_whatsapp: '',
  order_date: new Date().toISOString().slice(0, 10),
  public_path: '',
  locale,
  template: 'happy-message',
  font_family: 'elegant',
  is_published: true,
  content: structuredClone(locale === 'ar' ? arabicDefaults : englishDefaults),
});

export const serializeLoveMessage = (form) => ({
  ...form,
  content: {
    ...form.content,
    countdown_reveal: {
      ...form.content.countdown_reveal,
      lines: lines(form.content.countdown_reveal?.lines_text),
    },
    reasons: {
      ...form.content.reasons,
      items: lines(form.content.reasons?.items_text),
    },
    gallery: {
      ...form.content.gallery,
      items: lines(form.content.gallery?.items_text).map((line) => {
        const [image = '', title = '', description = '', date = ''] = line.split('|').map((part) => part.trim());
        return { image, title, description, date };
      }),
    },
    secret_boxes: {
      ...form.content.secret_boxes,
      items: lines(form.content.secret_boxes?.items_text).map((line) => {
        const [title = '', content = ''] = line.split('|').map((part) => part.trim());
        return { title, content };
      }),
    },
  },
});

export const hydrateLoveMessage = (message) => {
  const base = createEmptyLoveMessageForm(message?.locale === 'ar' ? 'ar' : 'en');
  const content = message?.content || {};

  return {
    ...base,
    ...message,
    content: {
      ...base.content,
      ...content,
      countdown_reveal: {
        ...base.content.countdown_reveal,
        ...(content.countdown_reveal || {}),
        lines_text: (content.countdown_reveal?.lines || []).join('\n') || content.countdown_reveal?.lines_text || '',
      },
      reasons: {
        ...base.content.reasons,
        ...(content.reasons || {}),
        items_text: (content.reasons?.items || []).join('\n') || content.reasons?.items_text || '',
      },
      gallery: {
        ...base.content.gallery,
        ...(content.gallery || {}),
        items_text: (content.gallery?.items || []).map((item) => `${item.image || ''} | ${item.title || ''} | ${item.description || ''} | ${item.date || ''}`).join('\n') || content.gallery?.items_text || '',
      },
      secret_boxes: {
        ...base.content.secret_boxes,
        ...(content.secret_boxes || {}),
        items_text: (content.secret_boxes?.items || []).map((item) => `${item.title || ''} | ${item.content || ''}`).join('\n') || content.secret_boxes?.items_text || '',
      },
    },
  };
};
