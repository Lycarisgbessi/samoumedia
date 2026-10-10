// Collecte de statistiques d'audience (visites de pages, pubs).
// Envoi via sendBeacon quand possible (survit à la navigation).

import { apiUrl } from './api';

/** Identifiant anonyme stocké localement — sert aux « visiteurs uniques ». */
function getVisitorId(): string {
  try {
    let vid = localStorage.getItem('samou_vid');
    if (!vid) {
      vid = 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
      localStorage.setItem('samou_vid', vid);
    }
    return vid;
  } catch {
    return '';
  }
}

export function trackPageView(path: string, referrer?: string) {
  try {
    const body = JSON.stringify({ type: 'view', path, referrer: referrer || document.referrer || '', visitorId: getVisitorId() });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(apiUrl('/api/track'), new Blob([body], { type: 'application/json' }));
    } else {
      fetch(apiUrl('/api/track'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true });
    }
  } catch { /* les statistiques ne doivent jamais casser la navigation */ }
}

export function trackAdEvent(adId: string, event: 'impression' | 'click') {
  try {
    const body = JSON.stringify({ type: 'ad', adId, adEvent: event });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(apiUrl('/api/track'), new Blob([body], { type: 'application/json' }));
    } else {
      fetch(apiUrl('/api/track'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true });
    }
  } catch { /* silencieux */ }
}
