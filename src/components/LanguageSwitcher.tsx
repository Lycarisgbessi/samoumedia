// Sélecteur de langue du site — bouton bien visible dans la barre rouge du haut.
// Traduit TOUT le site (voir lib/translate.ts).

import { useState } from 'react';
import { Languages, Check, ChevronDown } from 'lucide-react';
import { SITE_LANGUAGES, translateSiteTo } from '../lib/translate';

export function LanguageSwitcher({ current, onChange }: { current: string; onChange: (code: string) => void }) {
  const [open, setOpen] = useState(false);
  const active = SITE_LANGUAGES.find(l => l.code === current) || SITE_LANGUAGES[0];

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen(!open)}
        title="Changer la langue du site"
        aria-label="Changer la langue du site"
        className="flex items-center gap-1.5 bg-white text-brand-red rounded-full pl-3 pr-2.5 py-1.5 shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-95 transition-all"
      >
        <Languages size={16} strokeWidth={2.5} />
        <span className="text-[11px] font-black tracking-wider uppercase leading-none">{active.label}</span>
        <ChevronDown size={12} strokeWidth={3} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[59]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[60] min-w-[200px]">
            <p className="px-4 pt-3 pb-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50">
              🌍 Langue du site
            </p>
            {SITE_LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => { onChange(lang.code); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center justify-between gap-3 transition-colors ${current === lang.code ? 'bg-red-50 text-brand-red' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <span className="flex items-baseline gap-2">
                  <span className="w-8 font-black">{lang.label}</span>
                  <span className="text-gray-500 font-medium">{lang.name}</span>
                </span>
                {current === lang.code && <Check size={15} strokeWidth={3} className="text-brand-red shrink-0" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export { translateSiteTo };
