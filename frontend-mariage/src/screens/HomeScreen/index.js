import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { resolveInvitationContent } from '../../utils/invitationContent';
import RouteDataLoader from '../RouteDataLoader';
import ClassicTemplate from './InvitationsTemplates/ClassicTemplate';
import FloralButterflyTemplate from './InvitationsTemplates/FloralButterflyTemplate';
import LoveLetterTemplate from './InvitationsTemplates/LoveLetterTemplate';
import RoyalEntranceTemplate from './InvitationsTemplates/RoyalEntranceTemplate';
import SignatureTemplate from './InvitationsTemplates/SignatureTemplate';
import ModernMinimalistTemplate from './InvitationsTemplates/ModernMinimalistTemplate';
import BurgundyTemplate from './InvitationsTemplates/BurgundyTemplate';
import { clearInvitation, fetchInvitationByPath } from '../../store/invitationSlice';
import WilPortfolio from '../WilPortfolio';
import PlatformFooter from '../../components/PlatformFooter';
import { useCustomFontSizes } from '../../utils/customFontSizes';
import './index.css';

const MOCK_WEDDING_INVITATION = {
  locale: 'en',
  template: 'floral-butterfly',
  groom_name: 'Ahmed',
  bride_name: 'Sarah',
  couple_display_name: 'Ahmed & Sarah',
  hero: {
    kicker: 'Welcome to Our Big Day',
    save_the_date: 'Save the Date',
    body: 'We invite you to share our joy as we exchange wedding vows and celebrate our love.',
  },
  event: {
    date: 'Friday, September 4, 2026',
    time: '06:00 PM onwards',
    venue: 'Royal Gardens Hall',
    location: '123 Nile Road, Cairo, Egypt',
    open_location: 'Open Venue Location',
  },
  love_story: {
    title: 'Our Love Story',
    kicker: 'How it all started',
    events: [
      { title: 'First Meeting', date: '2022-05-12', desc: 'Our eyes met for the first time, and we knew something special had begun.' },
      { title: 'The Proposal', date: '2024-10-18', desc: 'Under the starry night sky, Ahmed asked the big question and Sarah said Yes!' },
      { title: 'Wedding Day', date: '2026-09-04', desc: 'The day we make our forever promise to each other.' }
    ]
  },
  gallery: {
    title: 'Our Beautiful Memories',
    image_urls: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=800',
    ]
  },
  countdown: {
    target_date: '2026-09-04T18:00:00.000Z',
    title: 'Countdown to the Big Day',
  },
  rsvp: {
    title: 'Are you attending?',
    kicker: 'Kindly reply by August 1st',
    thanks: 'Thank you, {{name}}!',
    yes_reply: 'We are thrilled to celebrate this day with you!',
    no_reply: 'We are sorry you cannot make it, but we appreciate your warm wishes.'
  },
  audio: {
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  footer: {
    text: 'Designed with love by WIL'
  }
};

const HomeScreen = () => {
  const { invitationPath } = useParams();
  const [searchParams] = useSearchParams();
  const { i18n } = useTranslation();
  const dispatch = useDispatch();
  const { data: invitation, status, error } = useSelector((state) => state.invitation);
  const [studioInvitation, setStudioInvitation] = useState(null);
  const [showCurtainLoader, setShowCurtainLoader] = useState(true);
  const [audioStartSignal, setAudioStartSignal] = useState(0);
  const invitationRootRef = useRef(null);

  const isDemo = invitationPath === 'demo';
  const previewTemplate = searchParams.get('template');
  const safePreviewTemplate = ['classic', 'signature', 'royal', 'love-letter', 'floral-butterfly', 'modern-minimal', 'burgundy'].includes(previewTemplate)
    ? previewTemplate
    : MOCK_WEDDING_INVITATION.template;
  const displayInvitation = useMemo(() => {
    if (!isDemo) return invitation;
    if (studioInvitation) return studioInvitation;
    return { ...MOCK_WEDDING_INVITATION, template: safePreviewTemplate };
  }, [isDemo, invitation, safePreviewTemplate, studioInvitation]);
  const displayStatus = isDemo ? 'succeeded' : status;

  const localizedInvitation = useMemo(
    () => resolveInvitationContent(displayInvitation, displayInvitation?.locale || 'en'),
    [displayInvitation],
  );
  const pageTitle = localizedInvitation?.couple_display_name
    || [localizedInvitation?.groom_name, localizedInvitation?.bride_name].filter(Boolean).join(' & ')
    || 'WIL';

  useCustomFontSizes(invitationRootRef, localizedInvitation);

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  useEffect(() => {
    if (!displayInvitation?.locale) return;
    i18n.changeLanguage(displayInvitation.locale);
  }, [i18n, displayInvitation?.locale]);

  useEffect(() => {
    if (!isDemo) return undefined;
    const receiveStudioData = (event) => {
      if (event.data?.type !== 'wil-template-preview-data' || event.data?.category !== 'invitation') return;
      setStudioInvitation(event.data.data);
    };
    window.addEventListener('message', receiveStudioData);
    return () => window.removeEventListener('message', receiveStudioData);
  }, [isDemo]);

  useEffect(() => {
    if (!invitationPath || invitationPath === 'home' || invitationPath === 'demo') return;
    setShowCurtainLoader(true);
    dispatch(fetchInvitationByPath(invitationPath));

    return () => {
      dispatch(clearInvitation());
    };
  }, [dispatch, invitationPath]);

  const handleLoaderFinished = useCallback(() => {
    setShowCurtainLoader(false);
  }, []);

  const handleCurtainsOpen = useCallback(() => {
    setAudioStartSignal((signal) => signal + 1);
  }, []);

  const handleInvitationOpen = useCallback(() => {
    setAudioStartSignal((signal) => signal + 1);
  }, []);

  if (!invitationPath || invitationPath === 'home') {
    return <WilPortfolio />;
  }

  if (displayStatus === 'idle' || displayStatus === 'loading') {
    return <RouteDataLoader />;
  }

  if (displayStatus === 'failed' || !displayInvitation || !localizedInvitation) {
    return <RouteDataLoader error={error || 'Invitation not found.'} />;
  }

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <div
        ref={invitationRootRef}
        className="home-screen wil-font-theme overflow-hidden"
        data-font-family={localizedInvitation.font_family || 'elegant'}
        data-template={localizedInvitation.template || 'classic'}
        dir={localizedInvitation.locale === 'ar' ? 'rtl' : 'ltr'}
      >
        {localizedInvitation.template === 'burgundy' ? (
          <BurgundyTemplate invitation={localizedInvitation} invitationPath={invitationPath} />
        ) : localizedInvitation.template === 'floral-butterfly' ? (
          <FloralButterflyTemplate invitation={localizedInvitation} invitationPath={invitationPath} />
        ) : localizedInvitation.template === 'modern-minimal' ? (
          <ModernMinimalistTemplate invitation={localizedInvitation} invitationPath={invitationPath} />
        ) : localizedInvitation.template === 'royal' ? (
          <RoyalEntranceTemplate
            invitation={localizedInvitation}
            invitationPath={invitationPath}
          />
        ) : localizedInvitation.template === 'love-letter' ? (
          <LoveLetterTemplate invitation={localizedInvitation} invitationPath={invitationPath} />
        ) : localizedInvitation.template === 'signature' ? (
          <SignatureTemplate invitation={localizedInvitation} invitationPath={invitationPath} />
        ) : (
          <ClassicTemplate
            audioStartSignal={audioStartSignal}
            invitation={localizedInvitation}
            invitationPath={invitationPath}
            onCurtainsOpen={handleCurtainsOpen}
            onInvitationOpen={handleInvitationOpen}
            onLoaderFinished={handleLoaderFinished}
            showCurtainLoader={showCurtainLoader}
          />
        )}
        <PlatformFooter
          locale={localizedInvitation.locale}
          theme={localizedInvitation.template || 'classic'}
        />
      </div>
    </>
  );
};

export default HomeScreen;
