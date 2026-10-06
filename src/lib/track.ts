// Collecte de statistiques d'audience (visites de pages, pubs).
// Envoi via sendBeacon quand possible (survit à la navigation).

export function trackPageView(path: string, referrer?: string) {
  try {
    const body = JSON.stringify({ type: 'view', path, referrer: referrer || document.referrer || '' });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
    } else {
      fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true });
    }
  } catch { /* les statistiques ne doivent jamais casser la navigation */ }
}

export function trackAdEvent(adId: string, event: 'impression' | 'click') {
  try {
    const body = JSON.stringify({ type: 'ad', adId, adEvent: event });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
    } else {
      fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true });
    }
  } catch { /* silencieux */ }
}
