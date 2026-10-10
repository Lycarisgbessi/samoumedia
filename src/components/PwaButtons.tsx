// Boutons PWA : installer l'application + activer les notifications push.
// L'installation s'appuie sur l'événement natif beforeinstallprompt quand le
// navigateur le permet ; sinon, un guide clair selon la plateforme remplace
// tout message d'erreur obscur (« vérifier la version de Chrome », etc.).

import { useEffect, useState } from 'react';
import { Download, Bell, BellRing, X, Smartphone, Share, Chrome, Monitor } from 'lucide-react';
import { apiUrl } from '../lib/api';
import { useI18n } from '../lib/lang';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export function PwaButtons() {
  const { t } = useI18n();
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [notificationState, setNotificationState] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    // Déjà installée ? (mode application autonome)
    if (window.matchMedia('(display-mode: standalone)').matches) setInstalled(true);
    // Déjà abonné aux notifications ?
    navigator.serviceWorker?.ready
      .then(reg => reg.pushManager.getSubscription())
      .then(sub => setSubscribed(!!sub))
      .catch(() => { });
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') setInstallPrompt(null);
    } else {
      // Le navigateur ne propose pas l'installation directe (iOS, navigateurs
      // intégrés, anciennes versions...) : on GUIDE au lieu d'échouer.
      setShowGuide(true);
    }
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

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {!installed && (
          <button
            onClick={handleInstall}
            className="flex items-center gap-2 px-4 py-2 bg-brand-dark text-white text-xs font-black uppercase tracking-wider rounded-lg hover:bg-brand-red transition-colors"
          >
            <Download size={14} />
            {t('installApp')}
          </button>
        )}
        {!subscribed && notificationState !== 'denied' && notificationState !== 'unsupported' && (
          <button
            onClick={handleSubscribe}
            disabled={busy}
            className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white text-xs font-black uppercase tracking-wider rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {subscribed ? <BellRing size={14} /> : <Bell size={14} />}
            {busy ? '…' : t('alerts')}
          </button>
        )}
      </div>

      {/* Guide d'installation selon la plateforme — remplace les erreurs */}
      {showGuide && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4" onClick={() => setShowGuide(false)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Smartphone size={20} className="text-brand-red" /> Installer l'application
              </h3>
              <button onClick={() => setShowGuide(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-sm text-gray-700">
                <p className="font-bold text-gray-900">Sur iPhone / iPad (Safari) :</p>
                <ol className="space-y-2 ml-1">
                  <li className="flex items-start gap-2"><span className="font-black">1.</span> <span>Appuyez sur le bouton <strong>Partager</strong> <Share size={14} className="inline mx-1 text-brand-blue" /> en bas de l'écran</span></li>
                  <li className="flex items-start gap-2"><span className="font-black">2.</span> <span>Faites défiler puis choisissez <strong>« Sur l'écran d'accueil »</strong></span></li>
                  <li className="flex items-start gap-2"><span className="font-black">3.</span> <span>Appuyez sur <strong>« Ajouter »</strong> — l'icône SAMOU MÉDIA apparaît sur votre écran d'accueil</span></li>
                </ol>
              </div>
            ) : /Android|Mobile/.test(navigator.userAgent) ? (
              <div className="space-y-3 text-sm text-gray-700">
                <p className="font-bold text-gray-900">Sur Android (Chrome) :</p>
                <ol className="space-y-2 ml-1">
                  <li className="flex items-start gap-2"><span className="font-black">1.</span> <span>Appuyez sur le menu <strong>⋮</strong> en haut à droite de Chrome</span></li>
                  <li className="flex items-start gap-2"><span className="font-black">2.</span> <span>Choisissez <strong>« Installer l'application »</strong> (ou « Ajouter à l'écran d'accueil »)</span></li>
                  <li className="flex items-start gap-2"><span className="font-black">3.</span> <span>Confirmez — l'application s'installe avec son icône</span></li>
                </ol>
                <p className="text-xs text-gray-400 flex items-start gap-1">
                  <Chrome size={13} className="mt-0.5 shrink-0" />
                  <span>Si l'option n'apparaît pas : mettez Chrome à jour (Play Store → Chrome → Mettre à jour) puis rechargez le site. Vérifiez aussi que vous n'êtes pas dans un navigateur intégré (WhatsApp/Facebook) — ouvrez le site directement dans Chrome.</span>
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-gray-700">
                <p className="font-bold text-gray-900">Sur ordinateur :</p>
                <ol className="space-y-2 ml-1">
                  <li className="flex items-start gap-2"><span className="font-black">1.</span> <span>Regardez la barre d'adresse de Chrome / Edge</span></li>
                  <li className="flex items-start gap-2"><span className="font-black">2.</span> <span>Cliquez sur l'icône d'installation <Monitor size={13} className="inline" /> (ou ⊕) à droite de l'adresse</span></li>
                  <li className="flex items-start gap-2"><span className="font-black">3.</span> <span>Cliquez sur <strong>« Installer »</strong></span></li>
                </ol>
                <p className="text-xs text-gray-400">Si l'icône n'apparaît pas : mettez votre navigateur à jour, ou ouvrez le site dans Chrome.</p>
              </div>
            )}

            <button
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full bg-brand-red text-white font-black uppercase text-sm tracking-wider py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              J'ai compris
            </button>
          </div>
        </div>
      )}
    </>
  );
}
