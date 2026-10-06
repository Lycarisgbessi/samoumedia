// Traduction automatique de TOUT le site (Google Translate).
// Le widget Google est chargé caché dans index.html ; ce module le pilote
// depuis notre propre sélecteur de langue, en haut du site.

export const SITE_LANGUAGES = [
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'zh-CN', label: '中文', name: 'Chinois' },
  { code: 'ar', label: 'العربية', name: 'Arabe' },
  { code: 'pt', label: 'PT', name: 'Português' },
];

/** Change la langue du site entier. 'fr' = retour à l'original. */
export function translateSiteTo(code: string): void {
  const setCombo = (value: string) => {
    const combo = document.querySelector<HTMLSelectElement>('select.goog-te-combo');
    if (combo) {
      combo.value = value;
      combo.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  if (code === 'fr') {
    // Retour à la langue d'origine
    const iframe = document.querySelector<HTMLIFrameElement>('.goog-te-banner-frame');
    setCombo('fr');
    // Force la restauration même si le sélecteur n'est pas encore prêt
    if (iframe?.contentWindow) {
      try { iframe.contentWindow.postMessage({ frame: 'Google Translate' }, '*'); } catch { }
    }
    // Nettoie le cookie de traduction
    document.cookie = 'googtrans=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
    document.cookie = 'googtrans=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=.' + location.hostname;
    setTimeout(() => window.location.reload(), 150);
    return;
  }

  // Le widget peut mettre un instant à s'initialiser : on réessaie proprement.
  let attempts = 0;
  const trySet = () => {
    const combo = document.querySelector<HTMLSelectElement>('select.goog-te-combo');
    if (combo) {
      setCombo(code);
    } else if (++attempts < 20) {
      setTimeout(trySet, 250);
    }
  };
  trySet();
}
