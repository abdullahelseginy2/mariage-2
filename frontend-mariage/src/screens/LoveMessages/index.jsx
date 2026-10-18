import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loveMessageAPI } from '../../utils/api';
import { extractApiData, extractApiError } from '../../utils/apiHelpers';
import RouteDataLoader from '../RouteDataLoader';
import HappyMessageTemplate from './templates/HappyMessageTemplate';
import PlatformFooter from '../../components/PlatformFooter';
import { normalizeContentMedia, normalizeLocale } from '../../utils/invitationContent';
import romanceOne from '../../assets/images/romance1.jpeg';
import romanceTwo from '../../assets/images/romance2.jpeg';
import romanceThree from '../../assets/images/romance3.jpeg';

const MOCK_LOVE_MESSAGE = {
  id: 'preview',
  recipient_name: 'Someone Special',
  sender_name: 'Your Favorite Person',
  locale: 'en',
  font_family: 'romantic',
  template: 'happy-message',
  content: {
    intro: {
      teaser: 'Someone left something special for you...',
      revealed_message: 'You have received a secret message',
      open_button: 'Open My Message',
    },
    countdown_reveal: {
      lines: ['You make my days brighter', 'You make me smile', 'You make life beautiful', 'You are special', 'Very special', 'More than you know', 'Almost there', 'Love', 'Love', 'Love'],
    },
    reasons: {
      title: 'Why do I love you?',
      items: ['Because your smile changes everything.', 'Because talking to you feels like home.', 'Because you make ordinary moments magical.', 'Because you are simply you.'],
    },
    gallery: {
      title: 'Our Memories',
      items: [
        { image: romanceOne, title: 'Our first beautiful memory', date: 'A day to remember' },
        { image: romanceTwo, title: 'The happiest little moments', date: 'Together' },
        { image: romanceThree, title: 'My favorite chapter', date: 'Forever' },
      ],
    },
    letter: {
      title: 'A Letter for You',
      message: 'You have become the calm in my busiest days and the beautiful detail that makes every ordinary moment worth remembering.',
      signature: 'Forever yours',
    },
    secret_boxes: {
      items: [
        { title: 'Your smile', content: 'It changes everything.' },
        { title: 'Your heart', content: 'It always feels like home.' },
        { title: 'Our story', content: 'My favorite one.' },
        { title: 'Our future', content: 'The best is yet to come.' },
      ],
    },
    love_timer: {
      start_date: '2024-02-14T00:00:00Z',
      title: 'We have been making memories together for',
    },
    final_surprise: {
      prompt: 'One last thing...',
      message: 'I Love You',
      subtitle: 'You are my favorite chapter.',
      couple_photo: romanceOne,
    },
    audio: { url: '' },
  },
};

const LoveMessages = () => {
  const { loveMessagePath } = useParams();
  const { i18n } = useTranslation();
  const initializedLanguage = useRef(false);
  const [message, setMessage] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (loveMessagePath !== 'demo') return undefined;
    const receiveStudioData = (event) => {
      if (event.data?.type !== 'wil-template-preview-data' || event.data?.category !== 'love') return;
      setMessage(event.data.data);
      setStatus('succeeded');
      i18n.changeLanguage(event.data.data?.locale || 'en');
    };
    window.addEventListener('message', receiveStudioData);
    return () => window.removeEventListener('message', receiveStudioData);
  }, [i18n, loveMessagePath]);

  useEffect(() => {
    if (loveMessagePath === 'demo') {
      setMessage(MOCK_LOVE_MESSAGE);
      setStatus('succeeded');
      return undefined;
    }

    let active = true;
    setStatus('loading');

    loveMessageAPI.getByPath(loveMessagePath)
      .then((response) => {
        if (!active) return;
        setMessage(extractApiData(response));
        setStatus('succeeded');
      })
      .catch((requestError) => {
        if (!active) return;
        setError(extractApiError(requestError, 'Love message not found.'));
        setStatus('failed');
      });

    return () => {
      active = false;
    };
  }, [loveMessagePath]);

  useEffect(() => {
    if (!message?.locale) return;
    if (!initializedLanguage.current) {
      i18n.changeLanguage(message.locale);
      initializedLanguage.current = true;
    }
  }, [i18n, message?.locale]);

  const activeLocale = normalizeLocale(i18n.resolvedLanguage || i18n.language || message?.locale);

  useEffect(() => {
    document.documentElement.lang = activeLocale;
    document.documentElement.dir = activeLocale === 'ar' ? 'rtl' : 'ltr';
  }, [activeLocale]);

  const normalizedMessage = useMemo(() => message ? ({
    ...message,
    content: normalizeContentMedia(message.content || {}),
  }) : null, [message]);

  if (status === 'loading') return <RouteDataLoader />;
  if (status === 'failed' || !message) return <RouteDataLoader error={error} />;

  const template = normalizedMessage.template || 'happy-message';

  if (template === 'happy-message') {
    return (
      <div className="wil-font-theme" data-font-family={normalizedMessage.font_family || 'elegant'} dir={activeLocale === 'ar' ? 'rtl' : 'ltr'}>
        <HappyMessageTemplate message={normalizedMessage} />
        <PlatformFooter locale={activeLocale} theme="love-message" />
      </div>
    );
  }

  return (
    <>
      <HappyMessageTemplate message={normalizedMessage} />
      <PlatformFooter locale={activeLocale} theme="love-message" />
    </>
  );
};

export default LoveMessages;
