// Boutons PWA : installer l'application + activer les notifications push

import { useEffect, useState } from 'react';
import { Download, Bell, BellRing } from 'lucide-react';
import { apiUrl } from '../lib/api';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export function PwaButtons() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [notificationState, setNotificationState] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    // Déjà abonné ?
    navigator.serviceWorker?.ready
      .then(reg => reg.pushManager.getSubscription())
      .then(sub => setSubscribed(!!sub))
      .catch(() => { });
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstallPrompt(null);
  };

  const handleSubscribe = async () => {
    if (notificationState === 'unsupported' || !('serviceWorker' in navigator)) {
      alert('Les notifications ne sont pas supportées par ce navigateur.');
      return;
    }
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      setNotificationState(permission);
      if (permission !== 'granted') return;

      const keyRes = await fetch(apiUrl('/api/push/key'));
      const vapidKey = await keyRes.text();
      if (!vapidKey) {
        alert('Notifications non configurées sur le serveur.');
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey)
        });
      }

      await fetch(apiUrl('/api/push/subscribe'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON())
      });
      setSubscribed(true);
    } catch (e: any) {
      alert('Impossible d\'activer les notifications : ' + (e.message || 'erreur inconnue'));
    } finally {
      setBusy(false);
    }
  };

  const showInstall = !!installPrompt;

  if (!showInstall && (subscribed || notificationState === 'denied' || notificationState === 'unsupported')) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {showInstall && (
        <button
          onClick={handleInstall}
          className="flex items-center gap-2 px-4 py-2 bg-brand-dark text-white text-xs font-black uppercase tracking-wider rounded-lg hover:bg-brand-red transition-colors"
        >
          <Download size={14} />
          Installer l'application
        </button>
      )}
      {!subscribed && notificationState !== 'denied' && notificationState !== 'unsupported' && (
        <button
          onClick={handleSubscribe}
          disabled={busy}
          className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white text-xs font-black uppercase tracking-wider rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {subscribed ? <BellRing size={14} /> : <Bell size={14} />}
          {busy ? 'Activation…' : 'Alertes nouveaux articles'}
        </button>
      )}
    </div>
  );
}
