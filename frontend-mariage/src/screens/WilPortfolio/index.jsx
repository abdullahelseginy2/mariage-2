import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import { 
  Heart, 
  Gift, 
  Sparkles, 
  ArrowRight, 
  CircleDollarSign,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  ChevronRight,
  Play,
  MessageCircleHeart,
  UsersRound,
  Moon,
  Sun
} from 'lucide-react';
import wilLogo from '../../assets/images/WIL_logo.jpeg';
import classic1 from '../../assets/images/templates/classic-1.jpg';
import classic2 from '../../assets/images/templates/classic-2.jpg';
import signature1 from '../../assets/images/templates/signature-1.jpg';
import signature2 from '../../assets/images/templates/signature-2.jpg';
import royal1 from '../../assets/images/templates/royal-1.jpg';
import royal2 from '../../assets/images/templates/royal-2.jpg';
import loveLetter1 from '../../assets/images/templates/love-letter-1.jpg';
import loveLetter2 from '../../assets/images/templates/love-letter-2.jpg';
import floralButterfly1 from '../../assets/images/templates/floral-butterfly-1.jpg';
import floralButterfly2 from '../../assets/images/templates/floral-butterfly-2.jpg';
import modernMinimal1 from '../../assets/images/templates/modern-minimal-1.jpg';
import modernMinimal2 from '../../assets/images/templates/modern-minimal-2.jpg';
import burgundyRing from '../../assets/images/begandy-demo/ring-cover.png';
import birthdayClassic1 from '../../assets/images/templates/birthday- Classic Romantic-1.jpg';
import birthdayClassic2 from '../../assets/images/templates/birthday- Classic Romantic-2.jpg';
import birthdayVelvet1 from '../../assets/images/templates/birthday-Love&Velvet-1.jpg';
import birthdayVelvet2 from '../../assets/images/templates/birthday-Love&Velvet-2.jpg';
import birthdayNeon1 from '../../assets/images/templates/birthday-Neon Galaxy-1.jpg';
import birthdayNeon2 from '../../assets/images/templates/birthday-Neon Galaxy-2.jpg';
import happyMessage1 from '../../assets/images/templates/happy-message-1.jpg';
import happyMessage2 from '../../assets/images/templates/happy-message-2.jpg';
import LanguageSwitcher from '../../components/LanguageSwitcher/LanguageSwitcher';
import { getBackendUrl } from '../../utils/apiConfig';
import './index.css';

// Floating background particles generator
function generatePortfolioParticles(count = 12) {
  const colors = ['cyan', 'violet', 'pink'];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 6 + 4,
    delay: Math.random() * 5,
    duration: Math.random() * 15 + 10,
    color: colors[i % 3],
    drift: (Math.random() - 0.5) * 60,
  }));
}

const AutoScrollRail = ({ children, className = '' }) => {
  const slides = React.Children.toArray(children);
  const repetitions = slides.length > 3 ? 2 : slides.length > 1 ? 3 : 1;
  const repeatedSlides = Array.from({ length: repetitions }, (_, repetition) => (
    slides.map((slide, index) => ({ slide, key: `${slide.key || index}-${repetition}` }))
  )).flat();

  return (
    <Swiper
      modules={[Autoplay, FreeMode]}
      className={className}
      dir="ltr"
      slidesPerView="auto"
      spaceBetween={18}
      loop={slides.length > 1}
      speed={5200}
      freeMode={{ enabled: true, momentum: false, sticky: false }}
      autoplay={slides.length > 1 ? {
        delay: 0,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
        waitForTransition: true,
      } : false}
      centeredSlides={slides.length === 1}
      grabCursor
    >
      {repeatedSlides.map(({ slide, key }) => (
        <SwiperSlide className="clothesline-slide" key={key}>{slide}</SwiperSlide>
      ))}
    </Swiper>
  );
};

const FALLBACK_DEMOS = {
  invitations: [{ category: 'invitation', template: 'floral-butterfly', path: 'demo' }],
  birthdays: [{ category: 'birthday', template: 'neon', path: 'demo' }],
  love: [{ category: 'love', template: 'happy-message', path: 'demo-happy-message-0011' }],
};

const STATIC_CUSTOMER_SHOWCASE = {
  invitations: [
    {
      category: 'invitation',
      path: 'ibrahim-wesam-9727',
      url: 'https://marriage-five-pi.vercel.app/ibrahim-wesam-9727',
      name: { en: 'Ibrahim & Wesam', ar: '\u0625\u0628\u0631\u0627\u0647\u064a\u0645 \u0648\u0648\u0633\u0627\u0645' },
    },
    {
      category: 'invitation',
      path: 'alaa-ahmed-3541',
      url: 'https://marriage-five-pi.vercel.app/alaa-ahmed-3541',
      name: { en: 'Alaa & Ahmed', ar: '\u0622\u0644\u0627\u0621 \u0648\u0623\u062d\u0645\u062f' },
    },
    {
      category: 'invitation',
      path: 'aya-mahmoud-1222',
      url: 'https://marriage-five-pi.vercel.app/aya-mahmoud-1222',
      name: { en: 'Aya & Mahmoud', ar: '\u0622\u064a\u0629 \u0648\u0645\u062d\u0645\u0648\u062f' },
    },
    {
      category: 'invitation',
      path: 'yasmeen-islam-2445',
      url: 'https://marriage-five-pi.vercel.app/yasmeen-islam-2445',
      name: { en: 'Yasmeen & Islam', ar: '\u064a\u0627\u0633\u0645\u064a\u0646 \u0648\u0625\u0633\u0644\u0627\u0645' },
    },
  ],
  birthdays: [
    {
      category: 'birthday',
      path: 'basbosa-mahmoud-0210',
      url: 'https://marriage-five-pi.vercel.app/birthday/basbosa-mahmoud-0210',
      name: { en: 'Basbosa', ar: '\u0628\u0633\u0628\u0648\u0633\u0629' },
    },
    {
      category: 'birthday',
      path: 'roaa-meratamo-1623',
      url: 'https://marriage-five-pi.vercel.app/birthday/roaa-meratamo-1623',
      name: { en: 'Roaa', ar: '\u0631\u0624\u0649' },
    },
    {
      category: 'birthday',
      path: 'fatima-amro-9728',
      url: 'https://marriage-five-pi.vercel.app/birthday/fatima-amro-9728',
      name: { en: 'Fatima', ar: '\u0641\u0627\u0637\u0645\u0629' },
    },
  ],
  love: [
    {
      category: 'love',
      template: 'happy-message',
      path: 'hager-ahmed-8180',
      url: 'https://marriage-five-pi.vercel.app/love/hager-ahmed-8180',
      name: { en: 'Hager & Ahmed', ar: '\u0647\u0627\u062c\u0631 \u0648\u0623\u062d\u0645\u062f' },
    },
    {
      category: 'love',
      template: 'happy-message',
      path: 'abdelrahman-noran-8120',
      url: 'https://marriage-five-pi.vercel.app/love/abdelrahman-noran-8120',
      name: { en: 'Abdelrahman & Noran', ar: '\u0639\u0628\u062f\u0627\u0644\u0631\u062d\u0645\u0646 \u0648\u0646\u0648\u0631\u0627\u0646' },
    },
    {
      category: 'love',
      template: 'happy-message',
      path: 'nahed-hossam-4808',
      url: 'https://marriage-five-pi.vercel.app/love/nahed-hossam-4808',
      name: { en: 'Nahed & Hossam', ar: '\u0646\u0627\u0647\u062f \u0648\u062d\u0633\u0627\u0645' },
    },
  ],
};

const CUSTOMER_GROUPS = [
  { id: 'invitations', icon: Heart, accent: 'rose' },
  { id: 'birthdays', icon: Gift, accent: 'cyan' },
  { id: 'love', icon: MessageCircleHeart, accent: 'violet' },
];

const TEMPLATE_NAMES = {
  classic: 'Classic',
  signature: 'Signature',
  royal: 'Royal Entrance',
  'love-letter': 'Love Letter',
  'floral-butterfly': 'Floral Butterfly',
  'modern-minimal': 'Modern Minimalist',
  burgundy: 'Burgundy Romance',
  default: 'Classic Celebration',
  romantic: 'Love & Velvet',
  neon: 'Neon Galaxy',
  'happy-message': 'Happy Message',
};

const SERVICE_CONFIG = [
  { id: 'invitations', titleKey: 'portfolio.wedding_title', descriptionKey: 'portfolio.wedding_desc', icon: Heart, accent: 'rose' },
  { id: 'birthdays', titleKey: 'portfolio.birthday_title', descriptionKey: 'portfolio.birthday_desc', icon: Gift, accent: 'cyan' },
  { id: 'love', title: 'Love Messages', description: 'A personal interactive surprise, made to be opened and remembered.', icon: MessageCircleHeart, accent: 'rose' },
];


const TEMPLATE_CATALOG = {
  invitations: [
    { template: 'burgundy', path: 'demo?template=burgundy', label: 'Burgundy Romance', screenshots: [burgundyRing, burgundyRing] },
    { template: 'royal', path: 'demo-royal-0000', url: 'https://marriage-five-pi.vercel.app/demo-royal-0000', label: 'Royal Entrance', screenshots: [royal1, royal2] },
    { template: 'love-letter', path: 'demo-love-letter-0000', url: 'https://marriage-five-pi.vercel.app/demo-love-letter-0000', label: 'Love Letter', screenshots: [loveLetter1, loveLetter2] },
    { template: 'floral-butterfly', path: 'demo-floral-butterfly-0000', url: 'https://marriage-five-pi.vercel.app/demo-floral-butterfly-0000', label: 'Floral Butterfly', screenshots: [floralButterfly1, floralButterfly2] },
    { template: 'modern-minimal', path: 'demo-modern-minimal-0000', url: 'https://marriage-five-pi.vercel.app/demo-modern-minimal-0000', label: 'Modern Minimalist', screenshots: [modernMinimal1, modernMinimal2] },
    { template: 'classic', path: 'demo-classic-0000', url: 'https://marriage-five-pi.vercel.app/demo-classic-0000', label: 'Classic', screenshots: [classic1, classic2] },
    { template: 'signature', path: 'demo-signature-0000', url: 'https://marriage-five-pi.vercel.app/demo-signature-0000', label: 'Signature', screenshots: [signature1, signature2] },
  ],
  birthdays: [
    { template: 'default', path: 'demo', url: 'https://marriage-five-pi.vercel.app/birthday/demo-default-0000', label: 'Classic Romantic', screenshots: [birthdayClassic1, birthdayClassic2] },
    { template: 'romantic', path: 'laila-omar-0009', url: 'https://marriage-five-pi.vercel.app/birthday/laila-omar-0009', label: 'Love & Velvet', screenshots: [birthdayVelvet1, birthdayVelvet2] },
    { template: 'neon', path: 'demo-abdullah-0001', url: 'https://marriage-five-pi.vercel.app/birthday/demo-abdullah-0001', label: 'Neon Galaxy', screenshots: [birthdayNeon1, birthdayNeon2] },
  ],
  love: [{ template: 'happy-message', path: 'mariem-someone-special-0011', url: 'https://marriage-five-pi.vercel.app/love/mariem-someone-special-0011', label: 'Happy Message', screenshots: [happyMessage1, happyMessage2] }],
};
const HERO_TEMPLATE_SCREENS = [
  { image: burgundyRing, label: 'Burgundy Romance' },
  { image: royal1, label: 'Royal Entrance' },
  { image: loveLetter1, label: 'Love Letter' },
  { image: floralButterfly1, label: 'Floral Butterfly' },
  { image: modernMinimal1, label: 'Modern Minimalist' },
  { image: classic1, label: 'Classic' },
  { image: signature1, label: 'Signature' },
  { image: birthdayClassic1, label: 'Classic Romantic' },
  { image: birthdayVelvet1, label: 'Love & Velvet' },
  { image: birthdayNeon1, label: 'Neon Galaxy' },
  { image: happyMessage1, label: 'Happy Message' },
];
const PRICING_GROUPS = [
  { id: 'invitations', originalPrice: 800, price: 400, title: 'Wedding invitations', arabicTitle: '\u062f\u0639\u0648\u0627\u062a \u0627\u0644\u0632\u0641\u0627\u0641' },
  { id: 'birthdays', originalPrice: 400, price: 200, title: 'Birthday greetings', arabicTitle: '\u062a\u0647\u0627\u0646\u064a \u0623\u0639\u064a\u0627\u062f \u0627\u0644\u0645\u064a\u0644\u0627\u062f' },
  { id: 'love', originalPrice: 400, price: 200, title: 'Love messages & surprises', arabicTitle: '\u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u062d\u0628 \u0648\u0627\u0644\u0645\u0641\u0627\u062c\u0622\u062a' },
];
const WilPortfolio = () => {
  const { t, i18n } = useTranslation();
  const [particles, setParticles] = useState([]);
  const [showDemosMenu, setShowDemosMenu] = useState(false);
  const [selectedService, setSelectedService] = useState('invitations');
  const [portfolioDemos, setPortfolioDemos] = useState(FALLBACK_DEMOS);
  const soldCustomers = STATIC_CUSTOMER_SHOWCASE;
  const [isLightMode, setIsLightMode] = useState(() => typeof window !== 'undefined' && localStorage.getItem('wil-portfolio-theme') === 'light');
  const [heroScreenIndex, setHeroScreenIndex] = useState(0);
  const isRtl = i18n.dir() === 'rtl';

  useEffect(() => {
    setParticles(generatePortfolioParticles(15));
  }, []);

  useEffect(() => {
    localStorage.setItem('wil-portfolio-theme', isLightMode ? 'light' : 'dark');
  }, [isLightMode]);

  useEffect(() => {
    const interval = window.setInterval(() => setHeroScreenIndex((current) => (current + 1) % HERO_TEMPLATE_SCREENS.length), 2500);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let active = true;
    fetch(`${getBackendUrl()}/portfolio-demos`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('Unable to load demos'))))
      .then((response) => {
        if (!active || !response?.data) return;
        setPortfolioDemos((current) => ({
          invitations: response.data.invitations?.length ? response.data.invitations : current.invitations,
          birthdays: response.data.birthdays?.length ? response.data.birthdays : current.birthdays,
          love: response.data.love?.length ? response.data.love : current.love,
        }));
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const activeService = SERVICE_CONFIG.find((service) => service.id === selectedService) || SERVICE_CONFIG[0];
  const activeHeroScreen = HERO_TEMPLATE_SCREENS[heroScreenIndex];
  const activeDemos = (TEMPLATE_CATALOG[selectedService] || []).map((template) => ({
    ...(portfolioDemos[selectedService] || []).find((demo) => demo.template === template.template),
    ...template,
  }));
  const getDemoUrl = (demo, serviceId = selectedService) => {
    if (demo.url) return demo.url;
    if (serviceId === 'birthdays') return `/birthday/${demo.path}`;
    if (serviceId === 'eid') return `/eid/${demo.path}`;
    if (serviceId === 'love') return `/love/${demo.path}`;
    return `/${demo.path}`;
  };

  const getCustomerName = (customer) => {
    if (typeof customer.name === 'string') return customer.name;
    return customer.name?.[isRtl ? 'ar' : 'en'] || customer.name?.en || customer.name?.ar || (isRtl ? 'عميل WIL' : 'WIL customer');
  };

  const customerGroupTitle = (groupId) => {
    if (groupId === 'invitations') return isRtl ? 'دعوات الزفاف' : 'Wedding invitations';
    if (groupId === 'birthdays') return isRtl ? 'مفاجآت أعياد الميلاد' : 'Birthday surprises';
    return isRtl ? 'رسائل الحب' : 'Love messages';
  };


  const selectServicePreview = (serviceId) => {
    setSelectedService(serviceId);
    setShowDemosMenu(false);
    window.setTimeout(() => document.getElementById('template-gallery')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
  };  return (
    <div className={`wil-portfolio ${isLightMode ? 'portfolio-light' : 'portfolio-dark'}`} dir={isRtl ? 'rtl' : 'ltr'} lang={isRtl ? 'ar' : 'en'}>
      <Helmet>
        <title>WIL | Wanderful Interactive Links</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Aref+Ruqaa+Ink:wght@400;700&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,600;1,700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Helmet>

      {/* Aurora Background Orbs */}
      <div className="aurora-bg" aria-hidden="true">
        <div className="aurora-accent-1" />
        <div className="aurora-accent-2" />
        <div className="aurora-accent-3" />
      </div>

      {/* Floating Particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className={`portfolio-particle particle-${p.color}`}
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animation: `float-particle-portfolio ${p.duration}s ${p.delay}s ease-in-out infinite alternate`,
            '--drift': `${p.drift}px`,
          }}
        />
      ))}

      {/* Navigation Header */}
      <header className="portfolio-header glass-panel">
        <div className="nav-container max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="logo-container overflow-hidden rounded-xl border border-white/20 shadow-lg shadow-violet-500/10">
              <img src={wilLogo} alt="WIL Logo" className="w-10 h-10 object-cover" />
            </div>
            <div>
              <span className="logo-text text-xl font-black tracking-wider text-white">WIL</span>
              <span className="logo-subtext text-[9px] block text-violet-400 font-bold uppercase tracking-widest">Wanderful Links</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-neutral-300">
            <a href="#services" className="hover:text-white transition-colors">{t('portfolio.our_services')}</a>
            <a href="#customers" className="hover:text-white transition-colors">{isRtl ? 'أعمالنا' : 'Customer stories'}</a>
            <a href="#features" className="hover:text-white transition-colors">{isRtl ? '\u0627\u0644\u0623\u0633\u0639\u0627\u0631' : 'Pricing'}</a>
            <a href="#about" className="hover:text-white transition-colors">{t('portfolio.why_wil')}</a>
          </nav>
          <div className="flex items-center gap-4">
            <LanguageSwitcher className="portfolio-lang-header" />
            <button
              type="button"
              onClick={() => setIsLightMode((current) => !current)}
              className="portfolio-theme-toggle"
              aria-label={isLightMode ? (isRtl ? '\u062a\u062d\u0648\u064a\u0644 \u0644\u0644\u0648\u0636\u0639 \u0627\u0644\u062f\u0627\u0643\u0646' : 'Switch to dark mode') : (isRtl ? '\u062a\u062d\u0648\u064a\u0644 \u0644\u0644\u0648\u0636\u0639 \u0627\u0644\u0641\u0627\u062a\u062d' : 'Switch to light mode')}
            >
              {isLightMode ? <Moon size={16} /> : <Sun size={16} />}
              <span>{isLightMode ? (isRtl ? '\u062f\u0627\u0643\u0646' : 'Dark') : (isRtl ? '\u0641\u0627\u062a\u062d' : 'Light')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Redesigned Hero Section */}
      <section className="portfolio-hero-container relative z-10">
        <div className="portfolio-hero-grid">
          {/* Hero Text Content */}
          <motion.div
            initial={{ opacity: 0, x: isRtl ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="portfolio-hero-content flex flex-col items-center lg:items-start"
          >
            <div className="portfolio-hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/5 mb-6">
              <Sparkles size={14} className="text-violet-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-violet-300">
                {t('portfolio.kicker')}
              </span>
            </div>

            <h1 className="portfolio-hero-title text-4xl sm:text-6xl font-black text-white leading-tight mb-6">
              {isRtl ? (
                <>
                  روابط تفاعلية <span className="gradient-text-hero">رائعة</span> لمناسباتكم
                </>
              ) : (
                <>
                  Wanderful <span className="gradient-text-hero">Interactive Links</span>
                </>
              )}
            </h1>

            <p className="portfolio-hero-desc text-base sm:text-lg font-light text-neutral-400 mb-8 leading-relaxed max-w-lg">
              {t('portfolio.desc')}
            </p>

            <div className="portfolio-hero-ctas flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <a
                href="https://wa.me/201557517718"
                target="_blank"
                rel="noreferrer"
                className="portfolio-hero-btn-primary px-8 py-3.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 w-full sm:w-auto text-white shadow-lg shadow-violet-500/20"
              >
                {t('portfolio.cta_primary')}
                <ArrowRight size={16} className={isRtl ? 'rotate-180' : ''} />
              </a>
              <a
                href="#services"
                className="portfolio-hero-btn-secondary px-8 py-3.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 w-full sm:w-auto text-neutral-300"
              >
                {t('portfolio.cta_secondary')}
              </a>
            </div>
          </motion.div>

          {/* Hero Visual Mockup Column */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="portfolio-hero-visual flex justify-center relative animate-float"
          >
            {/* Ambient Aurora behind the phone */}
            <div className="visual-glow absolute inset-0 -z-10 bg-gradient-to-tr from-violet-600/20 via-pink-600/10 to-cyan-500/20 blur-3xl rounded-full transform scale-75 animate-pulse" />
            
            {/* Rotating live template preview */}
            <div className="phone-mockup border-[8px] border-neutral-800 bg-[#070913] rounded-[38px] shadow-2xl relative overflow-hidden w-[260px] h-[520px]">
              <div className="phone-notch absolute top-2 left-1/2 transform -translate-x-1/2 w-28 h-3.5 bg-neutral-800 rounded-full z-20" />
              <div className="phone-template-screen">
                <img key={heroScreenIndex} src={activeHeroScreen.image} alt={activeHeroScreen.label} className="phone-template-image" />
                <div className="phone-template-overlay">
                  <span>{isRtl ? '\u0645\u0639\u0627\u064a\u0646\u0629 \u0642\u0627\u0644\u0628 \u062d\u064a\u0629' : 'Live template preview'}</span>
                  <strong>{activeHeroScreen.label}</strong>
                  <div className="phone-template-dots">{HERO_TEMPLATE_SCREENS.map((screen, index) => <i key={screen.label} className={index === heroScreenIndex ? 'is-active' : ''} />)}</div>
                </div>
              </div>
            </div>          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section max-w-6xl mx-auto px-6 py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="section-title text-3xl sm:text-5xl font-black text-white mb-4">{t('portfolio.services_title')}</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-violet-500 to-pink-500 mx-auto rounded-full" />
          <p className="section-subtitle text-sm sm:text-base text-neutral-400 mt-4 max-w-lg mx-auto">
            {t('portfolio.services_subtitle')}
          </p>
        </div>

        <div className="services-grid grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Wedding Cards */}
          <motion.div
            whileHover={{ y: -8 }}
            className="service-card glass-panel flex flex-col justify-between p-8"
          >
            <div>
              <div className="icon-badge bg-pink-500/10 text-pink-400 mb-6 animate-pulse">
                <Heart size={28} className="fill-current" />
              </div>
              <h3 className="service-card-title text-2xl font-bold text-white mb-3">{t('portfolio.wedding_title')}</h3>
              <p className="service-card-desc text-sm text-neutral-400 leading-relaxed mb-6">
                {t('portfolio.wedding_desc')}
              </p>
              <ul className="feature-bullets space-y-2 mb-8">
                <li className="flex items-center gap-2 text-xs text-neutral-300">
                  <CheckCircle2 size={14} className="text-pink-400" />
                  {t('portfolio.wedding_bullet_1')}
                </li>
                <li className="flex items-center gap-2 text-xs text-neutral-300">
                  <CheckCircle2 size={14} className="text-pink-400" />
                  {t('portfolio.wedding_bullet_2')}
                </li>
                <li className="flex items-center gap-2 text-xs text-neutral-300">
                  <CheckCircle2 size={14} className="text-pink-400" />
                  {t('portfolio.wedding_bullet_3')}
                </li>
              </ul>
            </div>
            <div className="service-card-footer flex flex-col sm:flex-row gap-3 mt-4 border-t border-white/5 pt-6 w-full">
              <a
                href="/demo-classic-0000"
                target="_blank"
                rel="noreferrer"
                className="service-cta-demo flex-1 text-center py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/20 hover:border-pink-500/40 transition duration-300 flex items-center justify-center gap-1.5"
              >
                {t('portfolio.live_demo')} <ExternalLink size={12} />
              </a>
              <a
                href="https://wa.me/201557517718?text=Hi! I am interested in creating a custom Wedding Invitation Link."
                target="_blank"
                rel="noreferrer"
                className="service-cta-order flex-1 text-center py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/5 transition duration-300"
              >
                {t('portfolio.order_now')}
              </a>
            </div>
          </motion.div>

          {/* Birthday Pages */}
          <motion.div
            whileHover={{ y: -8 }}
            className="service-card glass-panel flex flex-col justify-between p-8"
          >
            <div>
              <div className="icon-badge bg-cyan-500/10 text-cyan-400 mb-6 animate-pulse">
                <Gift size={28} />
              </div>
              <h3 className="service-card-title text-2xl font-bold text-white mb-3">{t('portfolio.birthday_title')}</h3>
              <p className="service-card-desc text-sm text-neutral-400 leading-relaxed mb-6">
                {t('portfolio.birthday_desc')}
              </p>
              <ul className="feature-bullets space-y-2 mb-8">
                <li className="flex items-center gap-2 text-xs text-neutral-300">
                  <CheckCircle2 size={14} className="text-cyan-400" />
                  {t('portfolio.birthday_bullet_1')}
                </li>
                <li className="flex items-center gap-2 text-xs text-neutral-300">
                  <CheckCircle2 size={14} className="text-cyan-400" />
                  {t('portfolio.birthday_bullet_2')}
                </li>
                <li className="flex items-center gap-2 text-xs text-neutral-300">
                  <CheckCircle2 size={14} className="text-cyan-400" />
                  {t('portfolio.birthday_bullet_3')}
                </li>
              </ul>
            </div>
            <div className="service-card-footer flex flex-col sm:flex-row gap-3 mt-4 border-t border-white/5 pt-6 w-full">
              <a
                href="/birthday/demo-default-0000"
                target="_blank"
                rel="noreferrer"
                className="service-cta-demo flex-1 text-center py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 hover:border-cyan-500/40 transition duration-300 flex items-center justify-center gap-1.5"
              >
                {t('portfolio.live_demo')} <ExternalLink size={12} />
              </a>
              <a
                href="https://wa.me/201557517718?text=Hi! I am interested in creating a custom Birthday Link."
                target="_blank"
                rel="noreferrer"
                className="service-cta-order flex-1 text-center py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/5 transition duration-300"
              >
                {t('portfolio.order_now')}
              </a>
            </div>
          </motion.div>

          {/* Eid & Holidays */}
          <motion.div
            whileHover={{ y: -8 }}
            className="service-card glass-panel flex flex-col justify-between p-8"
          >
            <div>
              <div className="icon-badge bg-violet-500/10 text-violet-400 mb-6 animate-pulse">
                <Sparkles size={28} />
              </div>
              <h3 className="service-card-title text-2xl font-bold text-white mb-3">{isRtl ? '\u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u062d\u0628 \u0648\u0627\u0644\u0645\u0641\u0627\u062c\u0622\u062a' : 'Love Messages'}</h3>
              <p className="service-card-desc text-sm text-neutral-400 leading-relaxed mb-6">
                {t('portfolio.eid_desc')}
              </p>
              <ul className="feature-bullets space-y-2 mb-8">
                <li className="flex items-center gap-2 text-xs text-neutral-300">
                  <CheckCircle2 size={14} className="text-violet-400" />
                  {t('portfolio.eid_bullet_1')}
                </li>
                <li className="flex items-center gap-2 text-xs text-neutral-300">
                  <CheckCircle2 size={14} className="text-violet-400" />
                  {t('portfolio.eid_bullet_2')}
                </li>
                <li className="flex items-center gap-2 text-xs text-neutral-300">
                  <CheckCircle2 size={14} className="text-violet-400" />
                  {t('portfolio.eid_bullet_3')}
                </li>
              </ul>
            </div>
            <div className="service-card-footer flex flex-col sm:flex-row gap-3 mt-4 border-t border-white/5 pt-6 w-full">
              <a
                href="/eid/demo-0000"
                target="_blank"
                rel="noreferrer"
                className="service-cta-demo flex-1 text-center py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/20 hover:border-violet-500/40 transition duration-300 flex items-center justify-center gap-1.5"
              >
                {t('portfolio.live_demo')} <ExternalLink size={12} />
              </a>
              <a
                href="https://wa.me/201557517718?text=Hi! I am interested in creating a custom Holiday Greeting Link."
                target="_blank"
                rel="noreferrer"
                className="service-cta-order flex-1 text-center py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/5 transition duration-300"
              >
                {t('portfolio.order_now')}
              </a>
            </div>
          </motion.div>
        </div>

        <div className="service-showcase">
          <div className="service-selector" role="tablist" aria-label="Services">
            {SERVICE_CONFIG.map((service) => {
              const Icon = service.icon;
              const isActive = service.id === selectedService;
              return (
                <button key={service.id} type="button" role="tab" aria-selected={isActive} onClick={() => setSelectedService(service.id)} className={'service-selector-card ' + service.accent + (isActive ? ' is-active' : '')}>
                  <span className="service-selector-icon"><Icon size={22} fill={service.id === 'invitations' ? 'currentColor' : 'none'} /></span>
                  <span className="service-selector-copy"><strong>{service.id === 'love' ? (isRtl ? '\u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u062d\u0628 \u0648\u0627\u0644\u0645\u0641\u0627\u062c\u0622\u062a' : service.title) : t(service.titleKey)}</strong><small>{TEMPLATE_CATALOG[service.id]?.length || 0} {isRtl ? '\u0646\u0645\u0627\u0630\u062c \u0644\u0644\u0645\u0639\u0627\u064a\u0646\u0629' : 'live templates'}</small></span>
                  <ChevronRight size={18} className={isRtl ? 'rotate-180' : ''} />
                </button>
              );
            })}
          </div>
          <motion.div id="template-gallery" key={selectedService} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }} className={'template-gallery-panel clothesline-panel ' + activeService.accent}>
            <AutoScrollRail className="template-gallery-grid clothesline-rail">{activeDemos.map((demo, index) => (
              <article key={demo.path + '-' + demo.template} className="template-demo-card" role="link" tabIndex={0} onClick={() => window.open(getDemoUrl(demo), '_blank', 'noopener,noreferrer')} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') window.open(getDemoUrl(demo), '_blank', 'noopener,noreferrer'); }}>
                <div className={'template-demo-preview preview-' + (demo.template || 'default').replace(/[^a-z0-9]/g, '-')}><span className="template-demo-number">0{index + 1}</span><span className="template-demo-screens">{demo.screenshots.map((screen, imageIndex) => <img key={screen} src={screen} alt="" className={'template-demo-screen screen-' + imageIndex} />)}</span><span className="template-demo-play"><Play size={16} fill="currentColor" /></span></div>
                <div className="template-demo-content"><div className="template-demo-name-row"><span>{TEMPLATE_NAMES[demo.template] || demo.template || 'Template'}</span><a href={getDemoUrl(demo)} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="template-demo-preview-button">{isRtl ? '\u0645\u0639\u0627\u064a\u0646\u0629' : 'Preview'} <ExternalLink size={12} /></a></div></div>
              </article>
            ))}</AutoScrollRail>
          </motion.div>
        </div>
      </section>

      {/* Published customer work — populated from dashboard records */}
      <section id="customers" className="customer-showcase-section relative z-10">
        <div className="customer-showcase-shell">
          <motion.header
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            className="customer-showcase-heading"
          >
            <span><UsersRound size={16} /> {isRtl ? 'روابط حقيقية صنعت لعملائنا' : 'Real links made for real moments'}</span>
            <h2>{isRtl ? 'من أعمالنا التي أصبحت جزءًا من حكاياتهم' : 'Made for our customers, remembered forever'}</h2>
            <p>{isRtl ? 'كل بطاقة هنا مرتبطة بدعوة أو مفاجأة حقيقية منشورة من لوحة التحكم، ويمكنك فتحها وتجربة تفاصيلها.' : 'Every card below is a real published invitation or surprise from the dashboard. Open any one to experience the finished result.'}</p>
          </motion.header>

          <div className="customer-showcase-groups">
            {CUSTOMER_GROUPS.map((group, groupIndex) => {
              const Icon = group.icon;
              const customers = soldCustomers[group.id] || [];
              return (
                <motion.article
                  key={group.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.18 }}
                  transition={{ delay: groupIndex * 0.08 }}
                  className={`customer-showcase-group ${group.accent}`}
                >
                  <div className="customer-group-heading">
                    <span><Icon size={18} /></span>
                    <div>
                      <h3>{customerGroupTitle(group.id)}</h3>
                      <p>{customers.length} {isRtl ? 'روابط منشورة' : 'published links'}</p>
                    </div>
                  </div>

                  <div className="customer-link-list">
                    {customers.length ? customers.map((customer, index) => (
                      <a
                        key={`${customer.path}-${index}`}
                        href={getDemoUrl(customer, group.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="customer-link-card"
                      >
                        <span className="customer-link-index">{String(index + 1).padStart(2, '0')}</span>
                        <span className="customer-link-copy">
                          <strong>{getCustomerName(customer)}</strong>
                          <small>{TEMPLATE_NAMES[customer.template] || customer.template || (isRtl ? 'تصميم مخصص' : 'Custom design')}</small>
                        </span>
                        <ExternalLink size={16} />
                      </a>
                    )) : (
                      <div className="customer-link-empty">
                        {isRtl ? 'ستظهر أحدث الأعمال المنشورة هنا تلقائيًا.' : 'The latest published work will appear here automatically.'}
                      </div>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Template pricing */}
      <section id="features" className="pricing-section max-w-6xl mx-auto px-6 py-20 relative z-10">
        <header className="pricing-section-heading pricing-section-heading-compact">
          <span>{isRtl ? 'الأسعار' : 'Pricing'}</span>
          <h2>{isRtl ? 'أسعار تصميمات WIL التفاعلية' : 'WIL interactive design pricing'}</h2>
        </header>
        <div className="pricing-groups">
          {PRICING_GROUPS.map((group) => (
            <div className="pricing-group" key={group.id}>
              <div className="pricing-group-heading"><div><p>{isRtl ? group.arabicTitle : group.title}</p><span>{TEMPLATE_CATALOG[group.id].length} {isRtl ? '\u0642\u0648\u0627\u0644\u0628 \u0645\u062a\u0627\u062d\u0629' : 'templates available'}</span></div><strong className="pricing-price-badge"><small>{isRtl ? '\u0628\u0639\u062f \u0627\u0644\u062e\u0635\u0645' : 'After discount'}</small><del>{group.originalPrice}</del>{group.price} <em>{isRtl ? '\u062c' : 'EGP'}</em></strong></div>
              <AutoScrollRail className="pricing-template-grid clothesline-rail pricing-clothesline">
                {TEMPLATE_CATALOG[group.id].map((template) => (
                  <article key={template.template} className="pricing-template-card">
                    <div className="pricing-template-visual"><img src={template.screenshots[0]} alt="" /><img src={template.screenshots[1]} alt="" /></div>
                    <div className="pricing-template-meta"><div className="pricing-template-name-row"><span>{TEMPLATE_NAMES[template.template] || template.label}</span><a href={getDemoUrl(template, group.id)} target="_blank" rel="noreferrer" className="pricing-preview-button">{isRtl ? '\u0645\u0639\u0627\u064a\u0646\u0629' : 'Preview'} <ExternalLink size={13} /></a></div></div>
                  </article>
                ))}
              </AutoScrollRail>
            </div>
          ))}
        </div>
      </section>

      {/* Redesigned Footer Section */}
      <footer id="about" className="portfolio-footer-redesign relative z-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="footer-main-grid grid grid-cols-1 md:grid-cols-4 gap-10 mb-12 text-center md:text-start justify-items-center md:justify-items-start">
            {/* Brand Column */}
            <div className="footer-brand md:col-span-2 flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="logo-container overflow-hidden rounded-xl border border-white/20 shadow-lg shadow-violet-500/10 w-12 h-12">
                  <img src={wilLogo} alt="WIL Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="logo-text text-xl font-black tracking-wider text-white">WIL</span>
                  <span className="logo-subtext text-[9px] block text-violet-400 font-bold uppercase tracking-widest">Wanderful Links</span>
                </div>
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed max-w-sm text-center md:text-start">
                {t('portfolio.desc')}
              </p>
            </div>

            {/* Links Column */}
            <div className="flex flex-col items-center md:items-start gap-4">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider">{t('portfolio.our_services')}</h4>
              <div className="flex flex-col items-center md:items-start gap-2.5 text-sm text-neutral-400">
                <a href="#services" className="hover:text-white transition-colors">{t('portfolio.wedding_title')}</a>
                <a href="#services" className="hover:text-white transition-colors">{t('portfolio.birthday_title')}</a>
                <a href="#services" className="hover:text-white transition-colors">{isRtl ? '\u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u062d\u0628 \u0648\u0627\u0644\u0645\u0641\u0627\u062c\u0622\u062a' : 'Love Messages'}</a>
              </div>
            </div>

            {/* Call to Action Column */}
            <div className="flex flex-col items-center md:items-start gap-4">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider">{t('portfolio.footer_title')}</h4>
              <p className="text-neutral-400 text-sm leading-relaxed text-center md:text-start">
                {t('portfolio.footer_desc')}
              </p>
              <a
                href="https://wa.me/201557517718"
                target="_blank"
                rel="noreferrer"
                className="footer-whatsapp-btn px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-105"
              >
                <MessageCircle size={14} />
                {t('portfolio.footer_cta')}
              </a>
            </div>
          </div>

          {/* Copyright & Socials bottom bar */}
          <div className="footer-bottom flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-neutral-500 text-xs">
              {t('portfolio.copyright', { year: new Date().getFullYear() })}
            </p>
            <div className="flex items-center gap-4 text-xs text-neutral-400">
              <a href="#services" className="hover:text-white transition-colors">{t('portfolio.our_services')}</a>
              <span>&middot;</span>
              <a href="#features" className="hover:text-white transition-colors">{isRtl ? '\u0627\u0644\u0623\u0633\u0639\u0627\u0631' : 'Pricing'}</a>
              <span>&middot;</span>
              <a href="#about" className="hover:text-white transition-colors">{t('portfolio.why_wil')}</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Fast Links Overlay & Menu */}
      {showDemosMenu && (
        <div className="fast-links-overlay" onClick={() => setShowDemosMenu(false)} />
      )}



      <div className="mobile-fast-links-container md:hidden">
        {showDemosMenu && (
          <div className="demos-dropdown-menu glass-panel">
            <div className="dropdown-header">
              <span>{isRtl ? '\u0627\u062e\u062a\u0631 \u0627\u0644\u0642\u0648\u0627\u0644\u0628' : 'Choose templates'}</span>
            </div>
            <button type="button" onClick={() => selectServicePreview('invitations')} className="dropdown-item">
              <Heart size={16} className="dropdown-icon dropdown-icon-rose" fill="currentColor" /> {isRtl ? '\u062f\u0639\u0648\u0627\u062a \u0627\u0644\u0632\u0641\u0627\u0641' : 'Wedding Invitations'}
            </button>
            <button type="button" onClick={() => selectServicePreview('birthdays')} className="dropdown-item">
              <Gift size={16} className="dropdown-icon dropdown-icon-cyan" /> {isRtl ? '\u062a\u0647\u0627\u0646\u064a \u0623\u0639\u064a\u0627\u062f \u0627\u0644\u0645\u064a\u0644\u0627\u062f' : 'Birthday Greetings'}
            </button>
            <button type="button" onClick={() => selectServicePreview('love')} className="dropdown-item">
              <MessageCircleHeart size={16} className="dropdown-icon dropdown-icon-rose" /> {isRtl ? '\u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u062d\u0628 \u0648\u0627\u0644\u0645\u0641\u0627\u062c\u0622\u062a' : 'Love Messages & Surprises'}
            </button>
          </div>
        )}
        <div className="mobile-fast-links-bar glass-panel">
          <a href="#services" className="fast-link-item" onClick={() => setShowDemosMenu(false)}>
            <Sparkles size={20} />
            <span>{t('portfolio.our_services')}</span>
          </a>
          <a href="#features" className="fast-link-item" onClick={() => setShowDemosMenu(false)}>
            <CircleDollarSign size={20} />
            <span>{isRtl ? '\u0627\u0644\u0623\u0633\u0639\u0627\u0631' : 'Pricing'}</span>
          </a>
          <a href="#customers" className="fast-link-item" onClick={() => setShowDemosMenu(false)}>
            <UsersRound size={20} />
            <span>{isRtl ? '\u0623\u0639\u0645\u0627\u0644\u0646\u0627' : 'Our work'}</span>
          </a>
          <button
            type="button"
            className={`fast-link-item ${showDemosMenu ? 'active' : ''}`}
            onClick={() => setShowDemosMenu(!showDemosMenu)}
          >
            <ExternalLink size={20} />
            <span>{isRtl ? '\u0627\u0644\u0645\u0639\u0627\u064a\u0646\u0627\u062a' : 'Demos'}</span>
          </button>
          <a
            href="https://wa.me/201557517718"
            target="_blank"
            rel="noreferrer"
            className="fast-link-item contact-accent"
            onClick={() => setShowDemosMenu(false)}
          >
            <MessageCircle size={20} />
            <span>{isRtl ? '\u0648\u0627\u062a\u0633\u0627\u0628' : 'WhatsApp'}</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default WilPortfolio;
