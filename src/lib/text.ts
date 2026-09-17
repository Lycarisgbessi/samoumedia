// Normalisation du texte éditorial.
// Les copier-coller depuis Word / WhatsApp / PDF insèrent souvent des espaces
// insécables (&nbsp;) entre TOUS les mots : le paragraphe devient alors un bloc
// unique impossible à couper, et le navigateur casse les mots au caractère
// près (ex. « con-çu »). On les reconvertit en espaces normales à l'affichage.

export function normalizeText(text?: string | null): string {
  if (!text) return '';
  return text.replace(/&nbsp;/gi, ' ').replace(/\u00A0/g, ' ');
}

export function normalizeArticle<T extends { title?: string | null; excerpt?: string | null; content?: string | null }>(item: T): T {
  return {
    ...item,
    title: normalizeText(item.title),
    excerpt: normalizeText(item.excerpt),
    content: normalizeText(item.content),
  };
}
