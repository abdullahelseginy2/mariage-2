import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HTMLFlipBook from 'react-pageflip';
import { gsap } from 'gsap';
import { FiArrowUpRight, FiCalendar, FiCheck, FiClock, FiHeart, FiMapPin, FiSend } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { submitInvitationRsvp } from '../../../../store/invitationSlice';
import PartyUpload from '../../sections/PartyUpload';
import AudioPlayer from '../../sections/AudioPlayer';
import CoupleName from '../../components/CoupleName';
import invitationFilm from '../../../../assets/videos/invitation-2.mp4';
import flowerBloom from '../../../../assets/images/flowers/flower_4.png';
import './index.css';

const reveal = { once: true, amount: 0.18 };
const rise = {
  hidden: { opacity: 0, y: 28, filter: 'blur(8px)' },
  shown: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};
const stagger = { hidden: {}, shown: { transition: { staggerChildren: 0.12 } } };
const units = ['days', 'hours', 'minutes', 'seconds'];

const calculateTime = (target) => {
  const diff = new Date(target).getTime() - Date.now();
  if (!target || diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor(diff / 3600000) % 24,
    minutes: Math.floor(diff / 60000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  };
};

const GoldDivider = () => (
  <div className="signature-gold-divider" aria-hidden="true">
    <i />
    <span>*</span>
    <i />
  </div>
);

const MarbleCorner = ({ className = '' }) => (
  <span className={`signature-corner ${className}`} aria-hidden="true">
    <i />
    <b>*</b>
  </span>
);

const SectionHeading = ({ kicker, title, align = '' }) => (
  <header className={`signature-heading ${align}`}>
    {kicker ? <p>{kicker}</p> : null}
    <h2>{title}</h2>
    <GoldDivider />
  </header>
);

const SignatureIntro = ({ couple, introState, onOpen, onVideoEnd, videoRef, introImage, introVideo, buttonLabel, playingLabel }) => (
  <motion.section
    className={`signature-video-intro is-${introState}`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, scale: 1.045, filter: 'blur(10px)', transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } }}
  >
    <div className="signature-intro-marble" />
    <MarbleCorner className="top-left" />
    <MarbleCorner className="top-right" />
    <MarbleCorner className="bottom-left" />
    <MarbleCorner className="bottom-right" />
    <div className="signature-intro-film">
      {introImage ? (
        <>
          <img className="signature-intro-backdrop" src={introImage} alt="" aria-hidden="true" />
          <img className="signature-intro-cover" src={introImage} alt={couple || 'Wedding invitation'} />
        </>
      ) : null}
      <video ref={videoRef} muted playsInline preload="auto" onEnded={onVideoEnd}>
        <source src={introVideo || invitationFilm} type="video/mp4" />
      </video>
    </div>
    <div className="signature-intro-controls">
      <p>{introState === 'playing' ? 'A moment made for forever' : 'You are invited to celebrate'}</p>
      {introState === 'ready' ? (
        <button type="button" onClick={onOpen} aria-label="Open the invitation">
          <FiHeart />
          {buttonLabel ? <span>{buttonLabel}</span> : null}
        </button>
      ) : (
        <span className="signature-intro-playing">{playingLabel || 'Playing your invitation'}</span>
      )}
    </div>
  </motion.section>
);

const SignatureFloralTimeline = ({ ready, weddingLine, groomName, brideName, couple, event }) => {
  const timelineRef = useRef(null);

  useLayoutEffect(() => {
    if (!ready || !timelineRef.current) return undefined;

    const context = gsap.context(() => {
      const root = timelineRef.current;
      const line = root.querySelector('.signature-wedding-line');
      const bloom = root.querySelector('.signature-growing-flower');
      const groom = root.querySelector('.signature-groom-name');
      const bride = root.querySelector('.signature-bride-name');
      const date = root.querySelector('.signature-date');

      gsap.set([line, bloom, groom, bride, date].filter(Boolean), { autoAlpha: 0 });

      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
      timeline
        .to(line, { autoAlpha: 1, y: 0, duration: 0.62 })
        .to(bloom, { autoAlpha: 1, scale: 1, rotate: 0, duration: 1.18, ease: 'back.out(1.5)' }, '>-0.06')
        .to(groom, { autoAlpha: 1, y: 0, duration: 0.58 }, '>-0.22')
        .to(bride, { autoAlpha: 1, y: 0, duration: 0.58 }, '>-0.12');

      if (date) {
        timeline.to(date, { autoAlpha: 1, y: 0, duration: 0.5 }, '>-0.02');
      }

      const branches = [groom, bride].filter(Boolean);
      gsap.set(branches, { transformOrigin: (index) => (index ? '0% 75%' : '100% 75%') });
      gsap.to(branches, {
        y: '+=3',
        rotation: (index) => (index ? 2.2 : -2.2),
        duration: 2.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        stagger: 0.2,
      });
    }, timelineRef);

    return () => context.revert();
  }, [ready]);

  return (
    <div ref={timelineRef} className="signature-hero-copy signature-bloom-timeline">
      <p className="signature-wedding-line">{weddingLine}</p>
      <div className="signature-bloom-tree">
        <img className="signature-growing-flower" src={flowerBloom} alt="" aria-hidden="true" />
        <h1 className="signature-groom-name">{groomName || couple}</h1>
        <h1 className="signature-bride-name">{brideName || couple}</h1>
      </div>
      {event.date ? (
        <p className="signature-date">
          {event.date}
          {event.time ? (
            <>
              <em>-</em>
              {event.time}
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  );
};

const BurgundyHeroCopy = ({ ready, weddingLine, groomName, brideName, couple, event, hero, isArabic }) => {
  const item = {
    hidden: { opacity: 0, y: 22, filter: 'blur(9px)' },
    shown: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } },
  };

  const hasBothNames = Boolean(groomName && brideName);

  return (
    <motion.div
      className="signature-hero-overlay-copy"
      initial="hidden"
      animate={ready ? 'shown' : 'hidden'}
      variants={{ shown: { transition: { staggerChildren: 0.2, delayChildren: 0.12 } } }}
    >
      <motion.p variants={item} className="signature-wedding-line">{hero?.kicker || weddingLine}</motion.p>
      {hasBothNames ? (
        <>
          <motion.h1 variants={item} className="signature-groom-name">{groomName}</motion.h1>
          <motion.span variants={item} className="burgundy-hero-ampersand" aria-hidden="true">{isArabic ? 'و' : '&'}</motion.span>
          <motion.h1 variants={item} className="signature-bride-name">{brideName}</motion.h1>
        </>
      ) : (
        <motion.h1 variants={item} className="signature-groom-name">{couple || groomName || brideName}</motion.h1>
      )}
      <motion.div variants={item} className="signature-gold-divider"><i /><span>◆</span><i /></motion.div>
      {hero?.body ? <motion.p variants={item} className="signature-hero-overlay-body">{hero.body}</motion.p> : null}
      {event.date || event.time ? (
        <motion.p variants={item} className="signature-date">
          {event.date}
          {event.date && event.time ? <em>•</em> : null}
          {event.time}
        </motion.p>
      ) : null}
    </motion.div>
  );
};

const SignatureCountdown = ({ countdown = {} }) => {
  const [time, setTime] = useState(() => calculateTime(countdown.target_date));

  useEffect(() => {
    setTime(calculateTime(countdown.target_date));
    const timer = window.setInterval(() => setTime(calculateTime(countdown.target_date)), 1000);
    return () => window.clearInterval(timer);
  }, [countdown.target_date]);

  if (countdown.is_enabled === false) return null;
  if (!countdown.target_date && !countdown.title) return null;

  return (
    <motion.section initial="hidden" whileInView="shown" viewport={reveal} variants={stagger} className="signature-countdown signature-section">
      <MarbleCorner className="top-left" />
      <MarbleCorner className="bottom-right" />
      <motion.div variants={rise}>
        <SectionHeading kicker="THE MOMENT AWAITS" title={countdown.title || 'Counting Down to Forever'} align="center" />
        <div className="signature-timer">
          {units.map((unit) => (
            <div key={unit}>
              <strong>{String(time[unit]).padStart(2, '0')}</strong>
              <span>{unit}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.section>
  );
};

const SignatureRsvp = ({ invitation, invitationPath }) => {
  const dispatch = useDispatch();
  const { rsvpStatus, rsvpError } = useSelector((state) => state.invitation);
  const copy = invitation?.rsvp || {};
  const key = invitation?.public_path || invitationPath;
  const [form, setForm] = useState({ name: '', attending: 'yes', message: '' });
  const [submitted, setSubmitted] = useState(() => localStorage.getItem(`rsvp_submitted_${key}`) === 'true');
  const [guestName, setGuestName] = useState(() => localStorage.getItem(`rsvp_guest_name_${key}`) || '');
  const [guestAttending, setGuestAttending] = useState(() => localStorage.getItem(`rsvp_attending_${key}`) || 'yes');

  if (copy.is_enabled === false) return null;

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;

    await dispatch(submitInvitationRsvp({
      invitation_path: key,
      full_name: form.name,
      attending: form.attending === 'yes',
      message: form.message,
      locale: invitation?.locale || 'en',
    })).unwrap();

    localStorage.setItem(`rsvp_submitted_${key}`, 'true');
    localStorage.setItem(`rsvp_guest_name_${key}`, form.name);
    localStorage.setItem(`rsvp_attending_${key}`, form.attending);
    setGuestName(form.name);
    setGuestAttending(form.attending);
    setSubmitted(true);
  };

  const ar = invitation?.locale === 'ar';
  const text = ar
    ? {
        kicker: 'تأكيد الحضور',
        title: 'هل ستشاركوننا فرحتنا؟',
        thanks: 'شكرا لك، {{name}}!',
        yesReply: 'وجودك ومشاركتك فرحتنا يعنيان لنا الكثير.',
        noReply: 'نقدر محبتك ونتمنى لك كل الخير.',
        name: 'الاسم',
        namePlaceholder: 'اكتب اسمك بالكامل',
        yes: 'سأحضر بكل سرور',
        no: 'أعتذر عن الحضور',
        note: 'رسالة للعروسين',
        notePlaceholder: 'اكتب أطيب أمنياتك',
        sending: 'جارٍ الإرسال...',
        submit: 'تأكيد الحضور',
      }
    : {
        kicker: 'KINDLY REPLY',
        title: 'Will You Join Us?',
        thanks: 'Thank you, {{name}}!',
        yesReply: 'Your presence and kind wishes mean the world to us.',
        noReply: 'We appreciate your warm wishes and will miss you.',
        name: 'Your name',
        namePlaceholder: 'Enter your full name',
        yes: 'Joyfully accepts',
        no: 'Respectfully declines',
        note: 'A note for the couple',
        notePlaceholder: 'Share your warm wishes',
        sending: 'Sending...',
        submit: 'Confirm attendance',
      };

  return (
    <motion.section initial="hidden" whileInView="shown" viewport={reveal} variants={stagger} className="signature-rsvp signature-section">
      <MarbleCorner className="top-right" />
      <MarbleCorner className="bottom-left" />
      <motion.div variants={rise} className="signature-rsvp-card">
        <SectionHeading kicker={copy.kicker || text.kicker} title={copy.title || text.title} align="center" />
        {submitted ? (
          <div className="signature-thanks">
            <FiCheck />
            <h3>{(copy.thanks || text.thanks).replace('{{name}}', guestName.split(' ')[0])}</h3>
            <p>{guestAttending === 'yes' ? (copy.yes_reply || text.yesReply) : (copy.no_reply || text.noReply)}</p>
          </div>
        ) : (
          <form onSubmit={submit}>
            <label>
              {copy.name_label || text.name}
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={copy.name_placeholder || text.namePlaceholder} />
            </label>
            <div className="signature-attendance">
              <button type="button" className={form.attending === 'yes' ? 'active' : ''} onClick={() => setForm({ ...form, attending: 'yes' })}>{text.yes}</button>
              <button type="button" className={form.attending === 'no' ? 'active' : ''} onClick={() => setForm({ ...form, attending: 'no' })}>{text.no}</button>
            </div>
            <label>
              {copy.message_label || text.note}
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={copy.message_placeholder || text.notePlaceholder} rows="4" />
            </label>
            {rsvpError ? <p className="signature-form-error">{rsvpError}</p> : null}
            <button className="signature-submit" disabled={rsvpStatus === 'loading'} type="submit">
              {rsvpStatus === 'loading' ? text.sending : (copy.submit || text.submit)} <FiSend />
            </button>
          </form>
        )}
      </motion.div>
    </motion.section>
  );
};

const GalleryPage = React.forwardRef(({ image, title, number }, ref) => (
  <article className="signature-flip-page" ref={ref}>
    <div className="signature-flip-page-inner">
      <img src={image} alt={`${title || 'Wedding memory'} ${number}`} loading={number === 1 ? 'eager' : 'lazy'} />
      <span>{String(number).padStart(2, '0')}</span>
    </div>
  </article>
));

GalleryPage.displayName = 'GalleryPage';

const SignatureGallery = ({ gallery = {} }) => {
  const images = gallery.image_urls || [];
  if (gallery.is_enabled === false) return null;
  if (!images.length) return null;

  return (
    <section className="signature-gallery signature-section">
      <motion.div initial="hidden" whileInView="shown" viewport={reveal} variants={stagger} className="signature-shell">
        <motion.div variants={rise}>
          <SectionHeading kicker="CHERISHED MOMENTS" title={gallery.title || 'Our Gallery'} align="center" />
        </motion.div>
        <motion.div variants={rise} className="signature-real-book-wrap">
          <HTMLFlipBook
            width={250}
            height={350}
            size="stretch"
            minWidth={150}
            maxWidth={330}
            minHeight={210}
            maxHeight={462}
            maxShadowOpacity={0.48}
            showCover={false}
            mobileScrollSupport={false}
            usePortrait={false}
            drawShadow
            flippingTime={850}
            useMouseEvents
            swipeDistance={28}
            className="signature-real-book"
          >
            {images.map((image, index) => (
              <GalleryPage key={`${image}-${index}`} image={image} title={gallery.title} number={index + 1} />
            ))}
          </HTMLFlipBook>
        </motion.div>
      </motion.div>
    </section>
  );
};

const SignaturePersonalMessage = ({ description }) => {
  const message = description?.trim();
  if (!message) return null;

  return (
    <motion.section
      initial="hidden"
      whileInView="shown"
      viewport={reveal}
      variants={stagger}
      className="signature-personal-message signature-section"
    >
      <MarbleCorner className="top-left" />
      <MarbleCorner className="bottom-right" />
      <motion.div variants={rise} className="signature-message-paper">
        <span className="signature-message-seal" aria-hidden="true"><FiHeart /></span>
        <span className="signature-message-stamp" aria-hidden="true">A NOTE</span>
        <p className="signature-message-kicker">WITH ALL OUR HEARTS</p>
        <GoldDivider />
        <p className="signature-message-copy">{message}</p>
        <span className="signature-message-signature" aria-hidden="true">Forever begins here</span>
      </motion.div>
    </motion.section>
  );
};

const SignatureTemplate = ({ invitation, invitationPath, introImage, introVideo, heroImage, variant = 'signature', introButtonLabel, introPlayingLabel }) => {
  const hero = invitation?.hero || {};
  const event = invitation?.event || {};
  const story = invitation?.love_story || {};
  const gallery = invitation?.gallery || {};
  const footer = invitation?.footer || {};
  const groomName = invitation?.groom_name || '';
  const brideName = invitation?.bride_name || '';
  const couple = invitation?.couple_display_name || [groomName, brideName].filter(Boolean).join(' & ');
  const weddingLine = invitation?.locale === 'ar' ? 'نحن على موعد مع زفاف' : 'We are getting married';
  const heroEnabled = hero.is_enabled !== false;
  const eventEnabled = event.is_enabled !== false;
  const storyEnabled = story.is_enabled !== false;
  const footerEnabled = footer.is_enabled !== false;
  const videoRef = useRef(null);
  const [introState, setIntroState] = useState('ready');
  const [interiorReady, setInteriorReady] = useState(false);
  const [audioStartSignal, setAudioStartSignal] = useState(0);

  const openInvitation = () => {
    setIntroState('playing');
    setAudioStartSignal((value) => value + 1);
    videoRef.current?.play().catch(() => setIntroState('complete'));
  };

  const finishInvitationIntro = () => {
    setIntroState('ending');
    window.setTimeout(() => setIntroState('complete'), 820);
  };

  useEffect(() => {
    if (introState === 'complete') return undefined;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [introState]);

  const storyEvents = useMemo(() => story.events || [], [story.events]);
  const mapsUrl = event.map_url || (event.location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([event.venue, event.location].filter(Boolean).join(', '))}` : '');

  return (
    <main
      className={`signature-marble ${variant === 'signature' ? '' : `${variant}-invitation`}`}
      dir={invitation?.locale === 'ar' ? 'rtl' : 'ltr'}
      style={heroImage ? { '--signature-hero-image': `url("${heroImage}")` } : undefined}
    >
      <AnimatePresence onExitComplete={() => { if (introState === 'complete') setInteriorReady(true); }}>
        {introState !== 'complete' ? (
          <SignatureIntro couple={couple} introState={introState} onOpen={openInvitation} onVideoEnd={finishInvitationIntro} videoRef={videoRef} introImage={introImage} introVideo={introVideo} buttonLabel={introButtonLabel} playingLabel={introPlayingLabel} />
        ) : null}
      </AnimatePresence>

      <div className="signature-particles" aria-hidden="true" />
      <AudioPlayer invitation={invitation} playSignal={audioStartSignal} />

      {heroEnabled ? (
        <section className="signature-hero signature-interior-hero">
          <MarbleCorner className="top-left" />
          <MarbleCorner className="top-right" />
          <MarbleCorner className="bottom-left" />
          <MarbleCorner className="bottom-right" />
          {variant === 'burgundy' ? (
            <BurgundyHeroCopy
              ready={interiorReady}
              weddingLine={weddingLine}
              groomName={groomName}
              brideName={brideName}
              couple={couple}
              event={event}
              hero={hero}
              isArabic={invitation?.locale === 'ar'}
            />
          ) : (
            <SignatureFloralTimeline ready={interiorReady} weddingLine={weddingLine} groomName={groomName} brideName={brideName} couple={couple} event={event} />
          )}
          <a className="signature-scroll-cue" href="#signature-details">
            {invitation?.locale === 'ar' ? 'اكتشف تفاصيل يومنا' : 'Discover our day'} <span>▾</span>
          </a>
        </section>
      ) : null}

      {eventEnabled ? (
        <section id="signature-details" className="signature-details signature-section">
          <MarbleCorner className="top-left" />
          <MarbleCorner className="bottom-right" />
          <motion.div initial="hidden" whileInView="shown" viewport={reveal} variants={stagger} className="signature-shell">
            <motion.div variants={rise}>
              <SectionHeading kicker={event.kicker || 'SAVE THE DATE'} title={event.title || 'The Wedding Details'} align="center" />
            </motion.div>
            <motion.div variants={rise} className="signature-detail-grid">
              <article className="signature-detail-row signature-detail-date">
                <span className="signature-detail-icon"><FiCalendar /></span>
                <div className="signature-detail-copy">
                  <span>DATE</span>
                  <strong>{event.date || 'To be announced'}</strong>
                </div>
              </article>
              <article className="signature-detail-row signature-detail-time">
                <span className="signature-detail-icon"><FiClock /></span>
                <div className="signature-detail-copy">
                  <span>TIME</span>
                  <strong>{event.time || 'To be announced'}</strong>
                </div>
              </article>
              <article className="signature-detail-venue">
                <span className="signature-detail-icon"><FiMapPin /></span>
                <div>
                  <span>{event.venue_label || 'VENUE'}</span>
                  <strong>{event.venue || 'To be announced'}</strong>
                  {event.location ? <p>{event.location}</p> : null}
                </div>
                {mapsUrl ? <a href={mapsUrl} target="_blank" rel="noreferrer">{event.open_location || 'View location'} <FiArrowUpRight /></a> : null}
              </article>
            </motion.div>
          </motion.div>
        </section>
      ) : null}

      {storyEnabled && storyEvents.length ? (
        <section className="signature-story signature-section">
          <MarbleCorner className="bottom-right" />
          <motion.div initial="hidden" whileInView="shown" viewport={reveal} variants={stagger} className="signature-shell">
            <motion.div variants={rise}>
              <SectionHeading kicker={story.kicker || 'OUR JOURNEY'} title={story.title || 'Our Love Story'} align="center" />
            </motion.div>
            <div className="signature-timeline">
              {storyEvents.map((item, index) => (
                <motion.article variants={rise} key={`${item.date}-${index}`}>
                  <span className="signature-timeline-number">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <time>{item.date}</time>
                    <h3>{item.title}</h3>
                    {item.desc ? <p>{item.desc}</p> : null}
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.div>
        </section>
      ) : null}

      <SignatureGallery gallery={gallery} />
      <SignaturePersonalMessage description={event.description} />
      <SignatureCountdown countdown={invitation?.countdown} />
      <SignatureRsvp invitation={invitation} invitationPath={invitationPath} />
      <PartyUpload invitation={invitation} invitationPath={invitationPath} />

      {footerEnabled ? (
        <footer className="signature-footer">
          <FiHeart />
          <strong>
            <CoupleName value={couple} ampersandClassName="text-[#c8a15a]" />
          </strong>
          <GoldDivider />
          <p>{[footer.date, footer.made_with, footer.for_day, footer.text].filter(Boolean).join(' ') || 'With love, we await your presence.'}</p>
        </footer>
      ) : null}
    </main>
  );
};

export default SignatureTemplate;
