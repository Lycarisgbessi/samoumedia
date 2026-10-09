// Langue du site : portée par l'URL (?lang=en), mémorisée, SANS aucune
// redirection externe — tout reste sur notre domaine.

import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tFor } from './i18n';
import { fr, enUS, es, zhCN, ar, pt } from 'date-fns/locale';
import type { Locale } from 'date-fns';

const VALID_LANGS = ['en', 'es', 'zh-CN', 'ar', 'pt'];

export function useLang(): string {
  const [searchParams] = useSearchParams();
  // L'administration reste toujours en français
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) return 'fr';
  const urlLang = searchParams.get('lang') || '';
  if (VALID_LANGS.includes(urlLang)) return urlLang;
  // Pas de ?lang= dans l'URL (navigation interne entre pages) : on reprend
  // la langue choisie et mémorisée — sinon la langue serait perdue à chaque clic.
  try {
    const saved = localStorage.getItem('samou_lang');
    if (saved && VALID_LANGS.includes(saved)) return saved;
  } catch { }
  return 'fr';
}

/** Code de locale BCP47 adapté à la langue (dates, nombres). */
export function localeTag(lang: string): string {
  return ({ en: 'en-GB', es: 'es-ES', 'zh-CN': 'zh-CN', ar: 'ar', pt: 'pt-PT' } as Record<string, string>)[lang] || 'fr-FR';
}

/** Locale date-fns adaptée à la langue (dates relatives : « il y a 2 h » / « 2h ago »). */
export function dateLocale(lang: string): Locale {
  return ({ en: enUS, es, 'zh-CN': zhCN, ar, pt } as Record<string, Locale>)[lang] || fr;
}

/** Change la langue de tout le site : met ?lang= dans l'URL et recharge la page.
 *  Si le visiteur est encore sur l'ancien miroir Google, il est ramené sur le vrai domaine. */
export function setAppLang(code: string) {
  let origin = window.location.origin;
  let pathname = window.location.pathname;
  if (window.location.hostname.endsWith('.translate.goog')) {
    const sub = window.location.hostname.replace(/\.translate\.goog$/, '');
    const realHost = sub.replace(/--/g, '@').replace(/-/g, '.').replace(/@/g, '-');
    origin = `https://${realHost}`;
  }
  const url = new URL(`${origin}${pathname}`);
  if (code === 'fr') {
    url.searchParams.delete('lang');
    localStorage.removeItem('samou_lang');
  } else {
    url.searchParams.set('lang', code);
    localStorage.setItem('samou_lang', code);
  }
  window.location.href = url.toString();
}

/** Hook complet : langue courante + fonction t() de traduction de l'interface. */
export function useI18n() {
  const lang = useLang();
  const t = tFor(lang);

  // Sens de lecture (droite → gauche pour l'arabe) + mémorisation
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  return { lang, t };
}
