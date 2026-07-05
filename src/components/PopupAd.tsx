import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useAds } from '../lib/hooks';

export function PopupAd() {
  const [isVisible, setIsVisible] = useState(false);
  const { ads, loading } = useAds(undefined, 'popup');

  useEffect(() => {
    // Show after some time subtly
    const timer = setTimeout(() => {
      if (ads && ads.length > 0) {
        setIsVisible(true);
      }
    }, 12000);

    return () => clearTimeout(timer);
  }, [ads]);

  if (loading || ads.length === 0) return null;
  const ad = ads[0];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.4 } }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[100] w-[calc(100vw-32px)] md:w-80 max-w-sm bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden"
        >
          <div className="relative h-40 bg-gray-100 flex items-center justify-center">
            <img onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect fill='%23f3f4f6' width='800' height='600'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='30' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ESAMOU MEDIA%3C/text%3E%3C/svg%3E"; }} src={ad.imageUrl} alt={ad.name} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-3 right-3 w-8 h-8 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center transition-colors text-white"
            >
              <X size={16} />
            </button>
            <span className="absolute bottom-3 left-3 text-[10px] uppercase font-black text-white tracking-[0.2em] bg-brand-red px-2 py-1 shadow-md">Publicité</span>
          </div>
          <div className="p-6">
            <h3 className="font-bold text-brand-dark mb-2 text-sm">{ad.name}</h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">Découvrez cette offre partenaire de Samou Média.</p>
            <a 
              href={ad.targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsVisible(false)}
              className="block text-center w-full py-2.5 bg-brand-dark text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-red transition-colors duration-300"
            >
              En savoir plus
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
