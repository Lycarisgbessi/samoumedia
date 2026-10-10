import { useEffect, useRef } from 'react';
import { useAds } from '../lib/hooks';
import { trackAdEvent } from '../lib/track';
import { useI18n } from '../lib/lang';

interface AdSpaceProps {
  format?: 'horizontal' | 'vertical' | 'square' | 'in-article';
  location?: string;
  className?: string;
}

/** Une publicité est une vidéo si son URL pointe vers un fichier vidéo (upload mp4/webm ou Cloudinary vidéo). */
export function isVideoAd(url?: string | null): boolean {
  if (!url) return false;
  return /\.(mp4|webm)(\?|$)/i.test(url) || url.includes('/video/upload/');
}

export function AdSpace({ format = 'horizontal', location, className = '' }: AdSpaceProps) {
  const { ads, loading } = useAds(location, format);
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const countedRef = useRef<string | null>(null);

  // Statistiques : l'impression n'est comptée QUE lorsque la publicité est
  // réellement VISIBLE à l'écran (au moins 40 % affichée) — jamais pour une
  // publicité hors champ ou placée sous le pli.
  useEffect(() => {
    if (loading || ads.length === 0 || !ads[0].id) return;
    if (countedRef.current === ads[0].id) return; // une seule impression par montage
    const element = containerRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      trackAdEvent(ads[0].id, 'impression');
      countedRef.current = ads[0].id;
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          trackAdEvent(ads[0].id, 'impression');
          countedRef.current = ads[0].id;
          observer.disconnect();
        }
      });
    }, { threshold: 0.4 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [loading, ads]);

  // Dimensions du conteneur de repli (« Votre publicité ici ») et hauteurs max
  // par format. Les créations réelles s'affichent ENTIÈRES (object-contain,
  // hauteur automatique) : jamais rognées, jamais débordantes.
  const placeholderDimensions = {
    horizontal: 'w-full h-24 md:h-28',
    vertical: 'w-full md:w-64 h-full min-h-[300px]',
    square: 'w-full aspect-square',
    'in-article': 'w-full h-28',
  };
  const maxHeights = {
    horizontal: 'max-h-24 md:max-h-28',
    vertical: 'max-h-[560px]',
    square: 'max-h-80',
    'in-article': 'max-h-32',
  };

  return (
    <div ref={containerRef} className="w-full">
      {!loading && ads.length > 0 ? (
        <a
          href={ad_href(ads[0])}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackAdEvent(ads[0].id, 'click')}
          className={`block overflow-hidden relative group z-20 w-full bg-white ${className}`}
        >
          {isVideoAd(ads[0].imageUrl) ? (
            <video
              src={ads[0].imageUrl || undefined}
              autoPlay
              muted
              loop
              playsInline
              className={`w-full h-auto object-contain mx-auto ${maxHeights[format]}`}
            />
          ) : (
            <img
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect fill='%23f3f4f6' width='800' height='600'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='30' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ESAMOU MEDIA%3C/text%3E%3C/svg%3E"; }}
              src={ads[0].imageUrl || "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect fill='%23f3f4f6' width='800' height='600'%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='30' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ESAMOU MEDIA%3C/text%3E%3C/svg%3E"}
              alt={ads[0].name}
              className={`w-full h-auto object-contain mx-auto ${maxHeights[format]}`}
            />
          )}
          <span className="absolute top-0 right-0 bg-black/50 text-white text-[8px] uppercase px-1 m-1 rounded-sm backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">{t('ad')}</span>
        </a>
      ) : (
        <div className={`bg-gray-50 border border-gray-200 flex flex-col items-center justify-center text-gray-400 overflow-hidden relative group z-20 ${placeholderDimensions[format]} ${className}`}>
          <span className="text-xs uppercase tracking-widest font-bold mb-2 z-10 relative">{t('adSpace')}</span>
          <span className="text-[10px] uppercase z-10 relative">{t('yourAdHere')}</span>
          <div className="absolute inset-0 bg-brand-red/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      )}
    </div>
  );
}

function ad_href(ad: { targetUrl?: string | null }): string {
  return ad.targetUrl || '#';
}
