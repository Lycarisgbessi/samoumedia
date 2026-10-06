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

/** Change la langue de tout le site : met ?lang= dans l'URL et recharge la page. */
export function setAppLang(code: string) {
  const url = new URL(window.location.href);
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
