// Traduction automatique de TOUT le site.
//
// L'ancien widget JavaScript de Google (element.js) n'est plus initialisé par
// Google pour les nouveaux sites — le sélecteur caché n'existait jamais, la
// traduction ne se déclenchait donc pas.
//
// Méthode fiable utilisée ici : le MIROIR officiel de traduction Google
// (translate.goog) qui sert le site entièrement traduit, page après page :
//   https://www-samoumedia-com.translate.goog/article/xyz?_x_tr_sl=fr&_x_tr_tl=en&_x_tr_hl=fr
// Les liens internes continuent d'être servis traduits ; « FR » ramène au
// site original.

export const SITE_LANGUAGES = [
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'zh-CN', label: '中文', name: 'Chinois' },
  { code: 'ar', label: 'AR', name: 'Arabe' },
  { code: 'pt', label: 'PT', name: 'Português' },
];

/** Langue affichée actuellement (déduite de l'URL si on est sur le miroir traduit). */
export function detectCurrentLang(): string {
  if (typeof location === 'undefined') return 'fr';
  if (location.hostname.endsWith('.translate.goog')) {
    const tl = new URLSearchParams(location.search).get('_x_tr_tl');
    if (tl && SITE_LANGUAGES.some(l => l.code === tl)) return tl;
  }
  return 'fr';
}

/** Change la langue du site entier. 'fr' = retour au site original. */
export function translateSiteTo(code: string): void {
  const isProxied = location.hostname.endsWith('.translate.goog');

  // ── Retour au français : retour sur le vrai domaine ──
  if (code === 'fr') {
    if (isProxied) {
      // www-samoumedia-com → www.samoumedia.com
      const sub = location.hostname.replace(/\.translate\.goog$/, '');
      const originalHost = sub
        .replace(/--/g, '@')   // protège les tirets d'origine
        .replace(/-/g, '.')    // les points encodés
        .replace(/@/g, '-');
      location.href = `https://${originalHost}${location.pathname}`;
    }
    return; // déjà sur le site original
  }

  // ── Déjà sur le miroir : on change simplement la langue cible ──
  if (isProxied) {
    const url = new URL(location.href);
    url.searchParams.set('_x_tr_tl', code);
    location.href = url.toString();
    return;
  }

  // ── Premier passage : direction le miroir traduit par Google ──
  // Encodage du domaine : '.' → '-', '-' → '--'
  const mangled = location.hostname.replace(/-/g, '--').replace(/\./g, '-');
  const params = new URLSearchParams({
    _x_tr_sl: 'fr',   // langue source du site
    _x_tr_tl: code,   // langue cible
    _x_tr_hl: 'fr',
    _x_tr_pto: 'wapp'
  });
  const existingQuery = location.search ? location.search.substring(1) : '';
  location.href = `https://${mangled}.translate.goog${location.pathname}?${params.toString()}${existingQuery ? '&' + existingQuery : ''}`;
}
