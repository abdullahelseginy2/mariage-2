import React from 'react';
import { FiCheck } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import temp1Preview from '../../../assets/images/temp1.png';
import temp2Preview from '../../../assets/images/temp2.png';
import temp3Preview from '../../../assets/images/temp3.png';
import temp4Preview from '../../../assets/images/temp4.png';
import temp5Preview from '../../../assets/images/temp5.png';
import temp6Preview from '../../../assets/images/temp6.png';
import burgundyPreview from '../../../assets/images/burgundy-ring.png';

export const invitationTemplateOptions = [
  {
    globalId: 1,
    id: 'classic',
    image: temp2Preview,
    labelKey: 'dashboard.templates.one',
    descriptionKey: 'dashboard.templates.one_description',
  },
  {
    globalId: 2,
    id: 'signature',
    image: temp1Preview,
    labelKey: 'dashboard.templates.two',
    descriptionKey: 'dashboard.templates.two_description',
  },
  {
    globalId: 3,
    id: 'royal',
    image: temp3Preview,
    labelKey: 'dashboard.templates.three',
    descriptionKey: 'dashboard.templates.three_description',
  },
  {
    globalId: 4,
    id: 'love-letter',
    image: temp4Preview,
    labelKey: 'dashboard.templates.four',
    descriptionKey: 'dashboard.templates.four_description',
  },
  {
    globalId: 5,
    id: 'floral-butterfly',
    image: temp5Preview,
    labelKey: 'dashboard.templates.five',
    descriptionKey: 'dashboard.templates.five_description',
  },
  {
    globalId: 6,
    id: 'modern-minimal',
    image: temp6Preview,
    labelKey: 'dashboard.templates.six',
    descriptionKey: 'dashboard.templates.six_description',
  },
  {
    globalId: 12,
    id: 'burgundy',
    image: burgundyPreview,
    labelKey: 'dashboard.templates.burgundy',
    descriptionKey: 'dashboard.templates.burgundy_description',
  },
];

const TemplatePicker = ({ value, onChange }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  return (
    <div className="col-span-full">
      <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
        {t('dashboard.fields.template')}
      </p>
      <p className="mb-4 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        {t('dashboard.templates.picker_hint')}
      </p>

      <div
        role="radiogroup"
        aria-label={t('dashboard.fields.template')}
        className="grid gap-4 sm:grid-cols-2"
      >
        {invitationTemplateOptions.map((template) => {
          const isSelected = value === template.id;

          return (
            <button
              key={template.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(template.id)}
              className={`group relative overflow-hidden rounded-2xl border text-start transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6B15C] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0b131c] ${
                isSelected
                  ? 'border-[#b49344] bg-white shadow-[0_20px_50px_rgba(180,147,68,0.22)] ring-2 ring-[#D6B15C]/55 dark:border-gold dark:bg-[#0e1721] dark:shadow-[0_24px_60px_rgba(214,177,92,0.18)]'
                  : 'border-slate-200/90 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 hover:border-[#d4bc7a] hover:shadow-[0_18px_40px_rgba(15,23,42,0.1)] dark:border-[#2a3646] dark:bg-[#0e1721] dark:shadow-[0_18px_44px_rgba(0,0,0,0.28)] dark:hover:border-gold/70'
              }`}
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-[#15202b]">
                <img
                  src={template.image}
                  alt={t(template.labelKey)}
                  className={`h-full w-full object-cover object-top transition duration-500 ${
                    isSelected ? 'scale-[1.02]' : 'scale-100 group-hover:scale-[1.03]'
                  }`}
                  draggable={false}
                />
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b131c]/88 via-[#0b131c]/20 to-transparent transition-opacity duration-300 ${
                    isSelected ? 'opacity-100' : 'opacity-90 group-hover:opacity-100'
                  }`}
                />
                <span
                  className={`absolute top-3 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition duration-300 ${
                    isRTL ? 'left-3' : 'right-3'
                  } ${
                    isSelected
                      ? 'border-[#f0cf83] bg-[#D6B15C] text-[#111820] shadow-[0_8px_24px_rgba(214,177,92,0.45)]'
                      : 'border-white/25 bg-black/35 text-white/70 opacity-0 group-hover:opacity-100'
                  } ${isSelected ? 'opacity-100' : ''}`}
                  aria-hidden="true"
                >
                  <FiCheck className="text-lg" strokeWidth={3} />
                </span>
              </div>

              <div className="relative px-4 py-4 sm:px-5 sm:py-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8a6d2f] dark:text-gold">
                      {isSelected ? t('dashboard.templates.selected') : t('dashboard.templates.preview')}
                    </p>
                    <h3 className="mt-1 text-lg font-black tracking-tight text-slate-950 dark:text-white">
                      {t(template.labelKey)}
                    </h3>
                  </div>
                  <span
                    className={`mt-1 inline-flex shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${
                      isSelected
                        ? 'bg-[#111820] text-gold dark:bg-gold dark:text-[#111820]'
                        : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300'
                    }`}
                  >
                    ID {template.globalId}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {t(template.descriptionKey)}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TemplatePicker;
