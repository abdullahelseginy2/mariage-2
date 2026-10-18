import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { FiDownload, FiX } from 'react-icons/fi';
import RouteDataLoader from '../../../RouteDataLoader';
import { eidGreetingAPI } from '../../../../utils/api';
import { extractApiData, extractApiError } from '../../../../utils/apiHelpers';
import bannerImage from '../../../../assets/images/eid_mubarak_banner.png';
import { Rain, Hero, Wishes, Moments, Pulses, Instrument, Footer } from '../../sections';
import PlatformFooter from '../../../../components/PlatformFooter';
import './index.css';

const PRESET_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBMte0c4J0usWJFKQho8vFYOfvN1BVBU73ZBt8H18qcmexSSDuz1gJu2BnBwVltVyexAQDT2IRtBhjiesdh46itMJNvVI9cX8V4yPtkVze0eT3YXoRSxBonmBvHaNAWI8s9ye2HyLbdVNWbwE5r1t8gNbp-Zi-PYfeMtZGIPhN0ikUYztXdcrt4F6jP2-Cqo7wJNLwzxzYKyrtY5sD27Vgp9xuKvx3pSWH0bg2xatQhgsunoo0soHARJAyFVc1pR-4LasGSqAijKaBz',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCmWyDV1F3aO3Ra32jqyaTao2HThQ9CCL13boMDOey3u2YrTAHsrOjir4fKQLb-MRGSSErXMSDI-xvb9-xYm0KN6rkHHhdaizjssOhAqjecLQEBNePJSDf0mDWIcpzmclz688-SwTOHFwXJO59UqGCXVPpPhArSa5A2OzStAU9TFwXjrM1CamZJNLsoHqjyDmFG6mnab-kTXful6w0iLxS8OxvzIeMsjt06XwDSbdUmlMAGovWksMTIohjubfPg7pz0sb4wwKiBL61H',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA7g180mn12XLnUW8M5XqX9wIInzARszwZv-Lt6j_GvGcu3yh0IGOwXodg2qs-WA-QHp0yCEVW20nB1Ook5knGvp7JzrzvUH2xLVmm6Ybz_BRrcu3J9fI--dMyh-9X1ohRvnMO3gCyCRMlj-LY4hAHPSBJ3j3YGMN_JcmWqqEB7ZvP94q6hA2jY62WtibztqEf2SbJqbhfMagOWfGI7pIRRv_GLaOYWZlZWUoxwAyN2YZLsWVI-o4TG8XHsyWeNxMCHHhFLBk8NSQAX',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAw-j_jKONYs1rdfKs9sVP7ZjpyaogVw-ajLQwXO11nBJlc0hQEo--oMQnYOYdbgwnLzker2UcAOVW4Mel3WHwYZ2uVWCuusygSNSgniEfxLbaoxAM6vXI5EWOIq5BLDHclC1mJ-guNYcIuazPsmiKUEk1jHsN71sk4UWnKJla5RA9-DSXxSXfWzy4x_GdON_wcRtw7iUEb3QzA3IUS0XkBAU8BFYhsOUlHOUBirG3ccVNSZvcGRMwTXmZyFfZxjaRIvup7l7LctZVS',
];

const createParticles = (count = 56) => Array.from({ length: count }, (_, index) => ({
  id: `${index}-${Math.random()}`,
  left: Math.random() * 100,
  delay: Math.random() * 6,
  duration: Math.random() * 8 + 6,
  size: Math.random() * 22 + 14,
  rotation: Math.random() * 360,
  type: index % 4 === 0 ? 'rose' : index % 4 === 1 ? 'star' : 'heart',
}));

const withId = (items = [], prefix) => items.map((item, index) => ({ id: item.id || `${prefix}-${index}`, ...item }));

let audioCtx = null;
const playNote = (frequency, type = 'sine', duration = 0.8) => {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.22, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (error) {
    console.warn(error);
  }
};

const playWarmHarmony = () => [329.63, 392, 493.88, 587.33].forEach((note, index) => window.setTimeout(() => playNote(note, 'sine', 1.2), index * 130));

const MOCK_EID_GREETING = {
  locale: 'en',
  recipient_name: 'Our Friends',
  sender_name: 'WIL team',
  content: {
    hero: {
      banner_image: 'https://images.unsplash.com/photo-1564507592937-25994a9015b2?auto=format&fit=crop&q=80&w=1200',
      title: 'Eid Mubarak 🌙',
      subtitle: 'May this blessed day bring peace, joy, and prosperity to your home.'
    },
    wishes: {
      title: 'Eid Blessings 💖',
      items: [
        { text: 'Wishing you a peaceful and happy Eid al-Fitr filled with joy and laughter. ✨' },
        { text: 'May Allah bless you and your family with endless happiness and health. 🌹' },
        { text: 'Sending you warm greetings and sweet wishes on this holy occasion. 💫' }
      ]
    },
    moments: {
      title: 'Joyful Moments 📸',
      items: [
        { imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800' },
        { imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800' }
      ]
    },
    pulses: {
      title: 'Send Blessings ❤️'
    },
    instrument: {
      title: 'Play Eid Melodies 🎵'
    },
    footer: {
      text: 'WIL (Wanderful Interactive Links) 🌹'
    }
  }
};

const DefaultEidTemplate = () => {
  const { eidPath } = useParams();
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [greeting, setGreeting] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [loveCount, setLoveCount] = useState(72);
  const [lovePulses, setLovePulses] = useState([]);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const rainParticles = useMemo(() => createParticles(), []);

  useEffect(() => {
    if (eidPath !== 'demo') return undefined;
    const receiveStudioData = (event) => {
      if (event.data?.type !== 'wil-template-preview-data' || event.data?.category !== 'eid') return;
      setGreeting(event.data.data);
      setStatus('succeeded');
    };
    window.addEventListener('message', receiveStudioData);
    return () => window.removeEventListener('message', receiveStudioData);
  }, [eidPath]);

  useEffect(() => {
    if (eidPath === 'demo') {
      setGreeting(MOCK_EID_GREETING);
      setStatus('succeeded');
      return;
    }
    let active = true;
    setStatus('loading');
    eidGreetingAPI.getByPath(eidPath)
      .then((response) => {
        if (!active) return;
        setGreeting(extractApiData(response));
        setStatus('succeeded');
      })
      .catch((requestError) => {
        if (!active) return;
        setError(extractApiError(requestError, 'Eid greeting not found.'));
        setStatus('failed');
      });
    return () => { active = false; };
  }, [eidPath]);

  useEffect(() => {
    if (!greeting?.locale) return;
    document.documentElement.lang = greeting.locale;
    document.documentElement.dir = greeting.locale === 'ar' ? 'rtl' : 'ltr';
  }, [greeting?.locale]);

  const content = useMemo(() => greeting?.content || {}, [greeting]);
  const hero = content.hero || {};
  const wishes = useMemo(() => withId(content.wishes?.items || [], 'wish'), [content.wishes?.items]);
  const moments = useMemo(() => {
    const source = content.moments?.items || [];
    return withId(source, 'moment').map((moment, index) => ({
      ...moment,
      imageUrl: moment.imageUrl || PRESET_IMAGES[index % PRESET_IMAGES.length],
    }));
  }, [content.moments?.items]);
  const isArabic = greeting?.locale === 'ar';
  const cover = hero.banner_image || bannerImage;
  const displayNames = [greeting?.recipient_name, greeting?.sender_name].filter(Boolean).join(isArabic ? ' و ' : ' & ');
  const pageTitle = displayNames || 'WIL';
  const pulses = content.pulses || {};
  const instrument = content.instrument || {};

  const sendPulse = (senderName, messageText) => {
    setLoveCount((count) => count + 1);
    playWarmHarmony();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let message = '';
    if (senderName || messageText) {
      if (senderName && messageText) {
        message = `${senderName}: "${messageText}"`;
      } else if (senderName) {
        message = isArabic
          ? `نبضة محبة من ${senderName}`
          : `Warm pulse from ${senderName}`;
      } else {
        message = `"${messageText}"`;
      }
    } else {
      message = isArabic
        ? `تم إرسال نبضة محبة إلى ${greeting?.recipient_name || ''}`
        : `A warm pulse was sent to ${greeting?.recipient_name || 'you'}`;
    }
    
    setLovePulses((previous) => [{ id: `pulse-${Date.now()}`, message, timestamp: time }, ...previous].slice(0, 8));
  };

  const toggleMusic = () => {
    setIsMusicPlaying((playing) => !playing);
    playWarmHarmony();
  };

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  if (status === 'loading') return <RouteDataLoader />;
  if (status === 'failed' || !greeting) return <RouteDataLoader error={error} />;

  return (
    <main className="eid-template wil-font-theme" data-font-family={greeting?.font_family || 'elegant'} dir={isArabic ? 'rtl' : 'ltr'}>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      
      <Rain rainParticles={rainParticles} />

      <div className="eid-shell">
        <div className="eid-stack">
          <Hero
            displayNames={displayNames}
            cover={cover}
            hero={hero}
            wishesLength={wishes.length}
            momentsLength={moments.length}
            isArabic={isArabic}
          />

          <Wishes
            wishes={wishes}
            wishesTitle={content.wishes?.title}
            isArabic={isArabic}
          />

          <Moments
            moments={moments}
            momentsTitle={content.moments?.title}
            isArabic={isArabic}
            onPhotoClick={setSelectedPhoto}
          />

          <Pulses
            pulses={pulses}
            onSendPulse={sendPulse}
            onToggleMusic={toggleMusic}
            isMusicPlaying={isMusicPlaying}
            loveCount={loveCount}
            lovePulses={lovePulses}
            isArabic={isArabic}
          />

          <Instrument
            instrument={instrument}
            isArabic={isArabic}
            onPlayNote={playNote}
          />

          <Footer footerText={content.footer?.text} />
          <PlatformFooter locale={greeting.locale} theme="eid" />
        </div>
      </div>

      <AnimatePresence>
        {selectedPhoto ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="eid-modal" onClick={() => setSelectedPhoto(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="eid-modal-inner" onClick={(event) => event.stopPropagation()}>
              <button type="button" className="eid-modal-close" onClick={() => setSelectedPhoto(null)}><FiX /></button>
              <img src={selectedPhoto} alt="Eid memory" />
              <div className="eid-modal-caption"><FiDownload /> {isArabic ? 'معاينة ذكرى العيد' : 'Eid memory preview'}</div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
};

export default DefaultEidTemplate;
