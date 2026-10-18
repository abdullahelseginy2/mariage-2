import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import RouteDataLoader from '../RouteDataLoader';
import { birthdayGreetingAPI } from '../../utils/api';
import { extractApiData, extractApiError } from '../../utils/apiHelpers';
import DefaultBirthdayTemplate from './templates/DefaultBirthdayTemplate';
import NeonBirthdayTemplate from './templates/NeonBirthdayTemplate';
import RomanticBirthdayTemplate from './templates/RomanticBirthdayTemplate';
import PlatformFooter from '../../components/PlatformFooter';
import { normalizeContentMedia } from '../../utils/invitationContent';

const MOCK_BIRTHDAY_GREETING = {
  locale: 'en',
  template: 'neon',
  recipient_name: 'Menna',
  sender_name: 'Ahmed',
  content: {
    basic: {
      passcode: '492026',
    },
    hero: {
      kicker: '🎂 Celebrating You, Menna',
      quote: '"You are the light of my life and the reason I smile every day"',
      birthdate: '2026-09-04',
    },
    countdown: {
      target_date: '2026-09-04T00:00:00.000Z',
      title: 'Time Until Birthday 🎉',
    },
    wishes: {
      title: 'Special Wishes 💖',
      items: [
        { text: 'Happy Birthday Menna! May your year overflow with joy, love, and magic. ✨', tags: ['Forever Love ✨'] },
        { text: 'Wishing you a lifetime of laughter, beautiful dreams, and endless happiness. 🌹', tags: ['My Dearest 🌱'] },
        { text: 'You are the most precious thing in my world. Happy Birthday, my love. 💫', tags: ['Light of My Eyes 💫'] },
      ]
    },
    album: {
      title: 'Our Beautiful Memories 📸',
      description: 'Moments carved in our hearts forever 🌹',
      images: [
        'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
      ]
    },
    letter: {
      title: 'A Letter for Menna 💌',
      description: 'Tap to open the secret letter 🔐',
      letter_title: 'On Your Beautiful Birthday...',
      letter_content: 'Dear Menna, this is your special day. You are the most precious person in my life and I\'m so grateful you exist. May this year bring you endless joy and beautiful moments.',
      love_phrase: 'I love you so much 💗',
    },
    audio: {
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    },
    footer: {
      text: 'Thank you for sharing this moment 🌹'
    }
  }
};

const BirthdayTemplates = () => {
  const { birthdayPath } = useParams();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [greeting, setGreeting] = useState(null);

  useEffect(() => {
    if (birthdayPath !== 'demo') return undefined;
    const receiveStudioData = (event) => {
      if (event.data?.type !== 'wil-template-preview-data' || event.data?.category !== 'birthday') return;
      setGreeting(event.data.data);
      setStatus('succeeded');
    };
    window.addEventListener('message', receiveStudioData);
    return () => window.removeEventListener('message', receiveStudioData);
  }, [birthdayPath]);

  useEffect(() => {
    if (birthdayPath === 'demo') {
      const requestedTemplate = searchParams.get('template');
      const template = ['default', 'romantic', 'neon'].includes(requestedTemplate)
        ? requestedTemplate
        : MOCK_BIRTHDAY_GREETING.template;
      setGreeting({ ...MOCK_BIRTHDAY_GREETING, template });
      setStatus('succeeded');
      return;
    }
    let active = true;
    setStatus('loading');
    birthdayGreetingAPI.getByPath(birthdayPath)
      .then((response) => {
        if (!active) return;
        setGreeting(extractApiData(response));
        setStatus('succeeded');
      })
      .catch((requestError) => {
        if (!active) return;
        setError(extractApiError(requestError, 'Birthday greeting not found.'));
        setStatus('failed');
      });
    return () => { active = false; };
  }, [birthdayPath, searchParams]);

  useEffect(() => {
    if (!greeting?.locale) return;
    document.documentElement.lang = greeting.locale;
    document.documentElement.dir = greeting.locale === 'ar' ? 'rtl' : 'ltr';
  }, [greeting?.locale]);

  const normalizedGreeting = useMemo(() => greeting ? ({
    ...greeting,
    content: normalizeContentMedia(greeting.content || {}),
  }) : null, [greeting]);

  if (status === 'loading') return <RouteDataLoader />;
  if (status === 'failed' || !greeting) return <RouteDataLoader error={error} />;

  // Route to the correct template based on the saved template field
  const template = normalizedGreeting.template || 'default';
  let templateElement = <DefaultBirthdayTemplate greeting={normalizedGreeting} />;
  if (template === 'romantic') templateElement = <RomanticBirthdayTemplate greeting={normalizedGreeting} />;
  if (template === 'neon') templateElement = <NeonBirthdayTemplate greeting={normalizedGreeting} />;

  return (
    <div
      className="wil-font-theme"
      data-font-family={normalizedGreeting.font_family || 'elegant'}
      dir={normalizedGreeting.locale === 'ar' ? 'rtl' : 'ltr'}
    >
      {templateElement}
      <PlatformFooter locale={normalizedGreeting.locale} theme={`birthday-${template}`} />
    </div>
  );
};

export default BirthdayTemplates;
