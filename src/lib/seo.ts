// ─── Moteur SEO : analyse éditoriale d'un article ───────────────
// Analyse 100 % locale (aucune donnée envoyée) : score, mots-clés,
// mots accrocheurs, recommandations concrètes.

import { useEffect, useState } from 'react';

// Mots vides du français (à exclure de l'analyse de mots-clés)
const STOPWORDS = new Set(`alors au aucuns aussi autre avant avec avoir bon car ce cela ces ceux chaque ci comme comment dans des du dedans dehors depuis deux devrait doit donc dos droite début elle elles en encore essai est et eu fait faites fois font force haut hors ici il ils je juste la le les leur là ma maintenant mais mes mien moins mon mot même ni nommés notre nous nouveaux ou où par parce parole pas personnes peut peu pièce plupart pour pourquoi quand que quel quelle quelles quels qui sa sans ses seulement si sien son sont sous soyez sujet sur ta tandis tellement tels tes ton tous tout trop très tu valeur voie voient vont votre vous vu ça étaient état étions été être un une vos ce ceci cet cette on ont nos leurs elle lui même déjà encore également dont ainsi afin alors dès entre vers chez toute toutes aucun aucune chacune chaque on ne plus pas non oui si cela ceci celà où qu quand quant quasi que quel quelle quoi qui quoi dont durante selon durant alors aussi`.split(/\s+/));

// Mots à forte accroche (« power words ») pour les titres de presse
const POWER_WORDS = ['exclusif', 'exclusive', 'urgent', 'urgence', 'choc', 'révèle', 'révélation', 'enquête', 'secret', 'secrets', ' scandale', 'inédit', 'record', 'historique', 'dramatique', 'alerte', 'attention', 'décryptage', 'analyse', 'intégral', 'direct', 'breaking', 'première', 'mondial', 'gratuit', 'enfin', 'pourquoi', 'comment', 'combien', 'attention', 'danger', 'incroyable', 'exceptionnel', 'important', 'officiel', 'confirme', 'annonce', 'nouveau', 'nouvelle', 'victoire', 'Trésor', 'massif', 'hors', 'papier'];

export interface SeoAnalysis {
  score: number;                 // /100
  titleLength: number;
  excerptLength: number;
  contentWords: number;
  keywords: { word: string; count: number; inTitle: boolean }[];
  powerWordsFound: string[];
  checks: { label: string; ok: boolean; advice: string }[];
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

export function analyzeArticle(title: string, excerpt: string, content: string, tags: string[]): SeoAnalysis {
  const titleText = stripHtml(title || '');
  const excerptText = stripHtml(excerpt || '');
  const contentText = stripHtml(content || '');
  const contentLower = contentLowerSafe(contentText);
  const titleLower = titleText.toLowerCase();

  // ── Mots-clés : fréquence des mots significatifs du contenu ──
  const words = contentLower.split(/[^a-zà-ÿ0-9']+/).filter(w => w.length >= 4 && !STOPWORDS.has(w));
  const freq = new Map<string, number>();
  words.forEach(w => freq.set(w, (freq.get(w) || 0) + 1));
  const keywords = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word, count]) => ({ word, count, inTitle: titleLower.includes(word) }));

  // ── Mots accrocheurs présents ──
  const fullLower = (titleLower + ' ' + excerptText.toLowerCase() + ' ' + contentLower);
  const powerWordsFound = POWER_WORDS.filter(p => p.trim().length > 2 && fullLower.includes(p.trim()));

  // ── Le mot-clé principal apparaît-il en tête d'article ? ──
  const mainKeyword = keywords[0]?.word || '';
  const first150 = contentLower.split(' ').slice(0, 150).join(' ');
  const keywordEarly = mainKeyword ? first150.includes(mainKeyword) : false;

  // ── Contrôles ──
  const titleLength = titleText.length;
  const excerptLength = excerptText.length;
  const contentWords = contentText ? contentText.split(/\s+/).length : 0;
  const titleOk = titleLength >= 40 && titleLength <= 70;
  const excerptOk = excerptLength >= 100 && excerptLength <= 200;
  const contentOk = contentWords >= 250;
  const kwInTitle = keywords.slice(0, 3).some(k => k.inTitle);
  const hasNumber = /\d/.test(titleText);
  const hasPower = powerWordsFound.length >= 2;
  const hasTags = (tags || []).length >= 2;

  const checks = [
    { label: `Longueur du titre (${titleLength} car.)`, ok: titleOk, advice: 'Visez 40 à 70 caractères : assez pour Google, assez pour accrocher.' },
    { label: 'Mot-clé principal dans le titre', ok: kwInTitle, advice: 'Reprenez votre mot-clé n°1 dans le titre — c\'est le facteur n°1 pour être trouvé.' },
    { label: `Extrait / résumé (${excerptLength} car.)`, ok: excerptOk, advice: 'Visez 100 à 200 caractères : c\'est ce qui s\'affiche sur Google et les réseaux.' },
    { label: `Longueur du contenu (${contentWords} mots)`, ok: contentOk, advice: '250 mots minimum pour être bien référencé et vraiment lu.' },
    { label: 'Mot-clé présent en début d\'article', ok: keywordEarly, advice: 'Placez le mot-clé principal dans les 150 premiers mots.' },
    { label: 'Chiffre dans le titre', ok: hasNumber, advice: 'Un chiffre (ex: « 5 choses à savoir ») augmente nettement les clics.' },
    { label: `Mots accrocheurs (${powerWordsFound.length})`, ok: hasPower, advice: 'Utilisez au moins 2 mots forts : exclusif, révèle, enquête, record...' },
    { label: `Tags (${(tags || []).length})`, ok: hasTags, advice: 'Ajoutez au moins 2 tags reprenant vos mots-clés.' },
  ];

  const score = Math.round((checks.filter(c => c.ok).length / checks.length) * 100);

  return { score, titleLength, excerptLength, contentWords, keywords, powerWordsFound, checks };
}

function contentLowerSafe(s: string): string {
  return s.toLowerCase();
}

/** Hook React : analyse en temps réel (avec légère temporisation pour la saisie) */
export function useSeoAnalysis(title: string, excerpt: string, content: string, tags: string[], enabled: boolean) {
  const [analysis, setAnalysis] = useState<SeoAnalysis | null>(null);
  useEffect(() => {
    if (!enabled) { setAnalysis(null); return; }
    const t = setTimeout(() => {
      setAnalysis(analyzeArticle(title || '', excerpt || '', content || '', tags || []));
    }, 400);
    return () => clearTimeout(t);
  }, [title, excerpt, content, tags, enabled]);
  return analysis;
}
