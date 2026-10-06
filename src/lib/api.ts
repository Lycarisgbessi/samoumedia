// URL d'appel API.
//
// Quand le visiteur navigue sur le site traduit par Google (miroir
// *.translate.goog), les appels relatifs "/api/..." passeraient par le proxy
// de traduction — qui altère/bloque les réponses JSON (d'où la disparition
// des articles). On réécrit donc tous les appels vers le VRAI domaine du
// site, autorisé côté serveur via CORS.

export function apiUrl(path: string): string {
  if (typeof location === 'undefined') return path;
  if (location.hostname.endsWith('.translate.goog')) {
    const sub = location.hostname.replace(/\.translate\.goog$/, '');
    const originalHost = sub
      .replace(/--/g, '@')  // protège les tirets d'origine
      .replace(/-/g, '.')   // les points encodés
      .replace(/@/g, '-');
    return `https://${originalHost}${path}`;
  }
  return path;
}
