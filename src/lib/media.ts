// Utilitaires médias partagés : miniature YouTube, image de secours, gestion d'erreur <img>.

export const FALLBACK_IMAGE = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect fill='%23f3f4f6' width='800' height='600'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='30' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ESAMOU MEDIA%3C/text%3E%3C/svg%3E";

export const onImageError = (e: { currentTarget: HTMLImageElement }) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = FALLBACK_IMAGE;
};

export function getYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function getYouTubeThumb(url?: string | null): string | null {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
}

/** Image d'un article : image explicite > miniature YouTube > image de secours. */
export function getArticleImage(article: { imageUrl?: string | null; videoUrl?: string | null }): string {
  return article?.imageUrl || getYouTubeThumb(article?.videoUrl) || FALLBACK_IMAGE;
}
