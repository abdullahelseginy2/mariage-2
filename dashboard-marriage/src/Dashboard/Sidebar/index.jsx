import React from 'react';
import { FiGrid, FiHeart, FiList, FiPlus, FiSettings, FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LanguageSwitcher, ThemeToggle } from '../../components';
import { getBackendMode } from '../../utils/apiConfig';

const Sidebar = ({ activeView, invitationsCount, eidCount, birthdayCount, loveCount, onCreate, onShowCompleted, onCreateEid, onCreateBirthday, onCreateLove, onShowSettings, mobileOpen = false, onMobileClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const isItemActive = (id) => {
    if (id === 'completed') {
      return activeView === 'completed' || activeView === 'invitations' || activeView === 'eid' || activeView === 'birthday';
    }
    return activeView === id;
  };

  const navItems = [
    {
      id: 'completed',
      label: t('dashboard.sidebar.completed_work', 'Completed templates'),
      icon: FiList,
      total: (invitationsCount || 0) + (eidCount || 0) + (birthdayCount || 0) + (loveCount || 0),
      path: '/completed',
      onClick: onShowCompleted,
    },
    {
      id: 'templates',
      label: t('dashboard.sidebar.templates_gallery', 'Templates'),
      icon: FiGrid,
      path: '/templates',
    },
    {
      id: 'editor',
      label: t('dashboard.actions.new_invitation'),
      icon: FiPlus,
      path: '/invitations/new',
      onClick: onCreate,
    },
    {
      id: 'eid-editor',
      label: t('dashboard.eid.new'),
      icon: FiPlus,
      path: '/eid-greetings/new',
      onClick: onCreateEid,
    },
    {
      id: 'birthday-editor',
      label: t('dashboard.birthday.new', 'New Birthday Greeting'),
      icon: FiPlus,
      path: '/birthday-greetings/new',
      onClick: onCreateBirthday,
    },
    {
      id: 'love-editor',
      label: 'New Love Message',
      icon: FiHeart,
      path: '/love-messages/new',
      onClick: onCreateLove,
    },
    {
      id: 'settings',
      label: t('dashboard.sidebar.settings', 'Admin Settings'),
      icon: FiSettings,
      path: '/settings',
      onClick: onShowSettings,
    },
  ];

  return (
    <aside className={`dashboard-sidebar fixed inset-y-0 start-0 z-50 flex min-h-screen w-[min(19rem,calc(100vw-2.75rem))] flex-col gap-5 overflow-y-auto overflow-x-hidden border-e border-slate-200 bg-white px-4 py-5 text-slate-950 shadow-2xl transition-transform duration-300 dark:border-white/10 dark:bg-[#111820] dark:text-white md:relative md:z-auto md:h-screen md:min-h-0 md:w-auto md:translate-x-0 md:px-4 md:py-5 md:shadow-none lg:px-5 lg:py-6 ${mobileOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'}`}>
      <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(214,177,92,0.18),transparent_68%)] dark:bg-[radial-gradient(circle_at_top,rgba(214,177,92,0.22),transparent_66%)]" />
      <div className="relative flex w-full items-center gap-3 border-b border-slate-200 pb-5 dark:border-white/10">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-gold/35 bg-gold/15 text-[#8a6d2f] shadow-[0_12px_30px_rgba(15,23,42,0.1)] dark:text-gold dark:shadow-[0_12px_30px_rgba(0,0,0,0.18)]"><FiHeart className="text-xl" /></span>
        <div className="min-w-0">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-[#8a6d2f] dark:text-gold/80">{t('dashboard.brand.kicker')}</p>
          <strong className="block truncate text-lg font-black tracking-normal">{t('dashboard.brand.title')}</strong>
          <div className="mt-1 flex items-center">
            {getBackendMode() === 'local' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Local DB | محلي
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-black text-amber-600 dark:bg-amber-500/20 dark:text-gold border border-amber-500/20 shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Global DB | عام
              </span>
            )}
          </div>
        </div>
        <button type="button" onClick={onMobileClose} className="ms-auto grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-slate-200 text-lg text-slate-500 dark:border-white/10 dark:text-slate-300 md:hidden" aria-label="Close dashboard navigation"><FiX /></button>
      </div>
      <nav className="relative grid gap-2">
        {navItems.map(({ id, label, icon: Icon, total, path, onClick }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              onMobileClose?.();
              if (path) {
                navigate(path);
                return;
              }
              onClick?.();
            }}
            className={`grid min-h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border px-3 text-start transition ${isItemActive(id) ? 'border-gold bg-gold text-[#111820] shadow-[0_18px_36px_rgba(214,177,92,0.18)]' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-gold/60 hover:bg-amber-50/70 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.045] dark:text-white dark:hover:border-gold/40 dark:hover:bg-white/[0.08]'}`}
          >
            <Icon className="text-lg" />
            <span className="truncate text-sm font-black">{label}</span>
            {typeof total === 'number' ? <span className={`rounded-full px-2 py-0.5 text-xs font-black ${isItemActive(id) ? 'bg-[#111820]/10' : 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-white/70'}`}>{total}</span> : null}
          </button>
        ))}
      </nav>
      <div className="relative mt-auto grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-t border-slate-200 pt-4 dark:border-white/10">
        <LanguageSwitcher className="!static !left-auto !top-auto !z-auto w-full justify-center rounded-lg !border-slate-200 !bg-slate-50 !text-slate-700 px-3 hover:!border-gold hover:!bg-amber-50/70 dark:!border-white/10 dark:!bg-white/10 dark:!text-[#F7EBD2] dark:hover:!bg-white/15" />
        <ThemeToggle compact className="bg-slate-50 dark:bg-white/10" />
      </div>
    </aside>
  );
};

export default Sidebar;
