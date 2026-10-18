const defaultWishesEn = [
  'Happy Birthday to the one who makes my world complete. May your year be filled with love and joy! | Forever Love ✨, Growing Together ❤️',
  'Wishing you a lifetime of laughter, shared dreams, and endless happiness by my side. | My Beautiful World 🌱, My Support & Companion 🙌',
  'You are the light of my life and the joy in my heart. Happy Birthday, my dearest one. | Endless Love 🌹, Light of My Eyes 💫',
  'You are not just a blessing for today, but for a lifetime. Happy Birthday to my favorite person. | One Beat 💞, Heart and Soul 🔗'
];

const defaultWishesAr = [
  'كل سنة وأنتِ جوة قلبي، كل عام وأنتِ حبي الأول والأخير وروحي وسر ضحكتي وسعادتي يا كل حياتي... | حبي الأبدي ✨, حبنا بيكبر ❤️',
  'يا رب يباركلي في عمرك يا حبيبتي، ويخلي أيامنا كلها حب وضحكة حلوة وراحة بال على طول سوا. | دنيتي الجميلة 🌱, سند وعمر 🙌',
  'يا نور عيني ويا حتة من روحي، كل سنة وأنتِ طيبة ومعايا وجنبي، ومنورالي حياتي يا أغلى وأجمل ما عندي في الدنيا. | عشق ملوش آخر 🌹, نور عيوني 💫',
  'أنتِ مش بس فرحة يوم ميلادك، أنتِ فرحة العمر كله اللي كنت بتمناها، ربنا يديمك ليا يا أحلى حاجة حصلتلي. | نبض واحد 💞, حبيبة قلبي 🔗'
];



const contentDefaults = {
  en: {
    basic: {
      passcode: '942026',
    },
    hero: {
      kicker: 'Celebrating Your Special Day 💖',
      quote: '"Your new year and my life are incomplete without the light of your eyes and the laughter of your pure heart."',
      birthdate: '11 • 06 • 2009',
      banner_image: '/assets/images/birthday_banner.png',
      avatar_image: '',
      avatar_title: 'Sweetheart',
      avatar_subtitle: 'The secret to my happiness and life 🌹',
    },
    countdown: {
      target_date: '2026-06-11T00:00:00+03:00',
      title: 'THE BIRTHDAY COUNTDOWN • The Awaited Moment',
      pending_text: 'Time remaining until the birthday of the most beautiful person in the universe 💖',
      completed_title: '🎉🎂 Happy Birthday, My Love! 🎂🎉',
      completed_text: 'Your happy birthday has started now.. May all your days be filled with joy by my side! 💖✨',
    },
    wishes: {
      title: 'A PERSONAL WISH • A Special Dedication',
      items_text: defaultWishesEn.join('\n'),
    },
    album: {
      title: 'ALBUM OF MEMORIES • Our Beautiful Moments',
      description: 'Photos carved in the heart, and unforgettable moments with beautiful details. Click any photo to zoom in 🌹',
      images_text: '',
    },
    letter: {
      title: 'A Secret Love Letter Dedicated to You 💖',
      description: 'Click the seal in the middle to open the private letter and listen to the music 💌',
      letter_title: 'Happy Birthday to the most beautiful person in the world.. 🎂✨',
      letter_content: 'Happy Birthday to the best thing that ever happened to me in my life. Today is not just your birthday, it is a special day because the most precious person in my life was born.\n\nHappy Birthday, my love, my friend, my daughter, and the most beautiful destiny God wrote for me. Happy Birthday to you beside me, my support, and my joy.\n\nMay God make your heart happy just as you make my heart happy every day. I hope to spend my whole life seeing the joy in your eyes and being the reason for your smile. I hope we celebrate all your birthdays together achieving our dreams.',
      love_phrase: 'I love you so much 💗💗💗',
    },
    audio: {
      url: '',
    },
    footer: {
      text: 'Thank you for sharing your happy moments with us 🌹',
      whatsapp: '201066787955',
    },
  },
  ar: {
    basic: {
      passcode: '942026',
    },
    hero: {
      kicker: 'احتفالاً بيوم ميلادك المميز 💖',
      quote: '"عامك الجديد وعمري ما يكملوش غير بنور عينيكي وضحكة قلبك الصافية"',
      birthdate: '11 • 06 • 2009',
      banner_image: '/assets/images/birthday_banner.png',
      avatar_image: '',
      avatar_title: 'سامية',
      avatar_subtitle: 'سامية سر سعادتي وعمري 🌹',
    },
    countdown: {
      target_date: '2026-06-11T00:00:00+03:00',
      title: 'THE BIRTHDAY COUNTDOWN • العد التنازلي المنتظر',
      pending_text: 'الوقت المتبقي على عيد ميلاد اجمل انسانه في الكون 💖',
      completed_title: '🎉🎂 كل عام وأنتِ أسعد وأجمل يا سامية! 🎂🎉',
      completed_text: 'يوم ميلادكِ السعيد بدأ الآن.. جعل الله كل أيامكِ فرحة وسروراً بجانبي ونبضات حبنا لا تنتهي أبداً! 💖✨',
    },
    wishes: {
      title: 'A PERSONAL WISH • أمنية خاصة',
      items_text: defaultWishesAr.join('\n'),
    },
    album: {
      title: 'ALBUM OF MEMORIES • ألبوم الذكريات',
      description: 'صور محفورة في القلب، ولحظات لا تُنسى بتفاصيلها الجميلة. اضغطي على أي صورة لرؤيتها بوضوح وحفظها كذكرى مخلدة 🌹',
      images_text: '',
    },
    letter: {
      title: 'رسالة حب سرية مخصصة لسمسة 💖',
      description: 'اضغطي على الختم في المنتصف لفتح الرسالة الخاصة والاستماع للألحان 💌',
      letter_title: 'عيد ميلاد أحلى وأجمل وأطيب 17 في الدنيا كلها.. 🎂✨',
      letter_content: 'كل سنة وأنتِ طيبة يا أجمل حاجة حصلتلي في حياتي. النهار ده مش مجرد عيد ميلادك، ده يوم مميز عشان اتولدت فيه أغلى إنسانة في حياتي.\n\nكل سنة وأنتِ حبيبتي، وصاحبتي، وبنتي، وأجمل قدر ربنا كتبهولي. كل سنة وأنتِ جنبي، وسندي، وفرحتي. ربنا يديم ضحكتك السكر اللي بموت فيها دي وتفضل تنور أي مكان.\n\nربنا يسعد قلبك زي ما بتسعدي قلبي كل يوم. يا رب أفضل طول العمر أشوف الفرحة في عينيكي وأكون سبب في ابتسامتك. نفسي والله كل أعياد ميلادك نحتفل بيها سوا وإحنا بنحقق أحلامنا، وبإذن الله في يوم من الأيام أكون موجود جنبك ونحتفل بيه مع بعض.',
      love_phrase: 'بحبكككككككككككككك 💗💗💗',
    },
    audio: {
      url: '',
    },
    footer: {
      text: 'شكراً لمشاركتنا لحظاتكم السعيدة 🌹',
      whatsapp: '201066787955',
    },
  },
};

export const createEmptyBirthdayForm = (locale = 'en') => ({
  recipient_name: '',
  sender_name: '',
  requester_name: '',
  requester_whatsapp: '',
  order_date: new Date().toISOString().slice(0, 10),
  public_path: '',
  locale,
  template: 'default',
  font_family: 'elegant',
  is_published: true,
  content: {
    basic: { ...contentDefaults[locale].basic },
    hero: { ...contentDefaults[locale].hero },
    countdown: { ...contentDefaults[locale].countdown },
    wishes: { ...contentDefaults[locale].wishes },
    album: { ...contentDefaults[locale].album },
    letter: { ...contentDefaults[locale].letter },
    audio: { ...contentDefaults[locale].audio },
    footer: { ...contentDefaults[locale].footer },
  },
});

const parseLines = (text, mapper) => String(text || '').split('\n').map((line) => line.trim()).filter(Boolean).map(mapper);

export const serializeBirthdayGreeting = (form) => ({
  recipient_name: form.recipient_name,
  sender_name: form.sender_name,
  requester_name: form.requester_name || '',
  requester_whatsapp: form.requester_whatsapp || '',
  order_date: form.order_date || '',
  public_path: form.public_path,
  locale: form.locale === 'ar' ? 'ar' : 'en',
  template: form.template || 'default',
  font_family: form.font_family || 'elegant',
  is_published: form.is_published,
  content: {
    ...form.content,
    wishes: {
      ...form.content.wishes,
      items: parseLines(form.content.wishes?.items_text || '', (line) => {
        const [text = '', tags = ''] = line.split('|').map((part) => part.trim());
        return { text, tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean) };
      }),
    },
    album: {
      ...form.content.album,
      images: parseLines(form.content.album?.images_text || '', (line) => line),
    },
  },
});

export const hydrateBirthdayGreeting = (greeting) => {
  const base = createEmptyBirthdayForm(greeting?.locale === 'ar' ? 'ar' : 'en');
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
    template: greeting?.template || 'default',
    font_family: greeting?.font_family || 'elegant',
    is_published: greeting?.is_published ?? true,
    content: {
      basic: { ...base.content.basic, ...(content.basic || {}) },
      hero: { ...base.content.hero, ...(content.hero || {}) },
      countdown: { ...base.content.countdown, ...(content.countdown || {}) },
      wishes: {
        ...base.content.wishes,
        ...(content.wishes || {}),
        items_text: (Array.isArray(content.wishes?.items) ? content.wishes.items : []).map((wish) => `${wish?.text || ''} | ${Array.isArray(wish?.tags) ? wish.tags.join(', ') : ''}`).join('\n') || content.wishes?.items_text || base.content.wishes.items_text,
      },
      album: {
        ...base.content.album,
        ...(content.album || {}),
        images_text: (Array.isArray(content.album?.images) ? content.album.images : []).join('\n') || content.album?.images_text || base.content.album.images_text,
      },
      letter: { ...base.content.letter, ...(content.letter || {}) },
      audio: { ...base.content.audio, ...(content.audio || {}) },
      footer: { ...base.content.footer, ...(content.footer || {}) },
    },
  };
};
