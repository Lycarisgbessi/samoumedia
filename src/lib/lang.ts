// Langue du site : portée par l'URL (?lang=en), mémorisée, SANS aucune
// redirection externe — tout reste sur notre domaine.

import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tFor } from './i18n';

export function useLang(): string {
  const [searchParams] = useSearchParams();
  const lang = searchParams.get('lang') || '';
  const valid = ['en', 'es', 'zh-CN', 'ar', 'pt'];
  return valid.includes(lang) ? lang : 'fr';
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
