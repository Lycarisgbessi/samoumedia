import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import DOMPurify from 'dompurify';
import { Calendar, Clock, Eye } from 'lucide-react';
import { Reveal } from '../components/Reveal';
import { AdSpace } from '../components/AdSpace';
import { normalizeArticle } from '../lib/text';
import { FALLBACK_IMAGE, onImageError } from '../lib/media';
import type { Chronique } from '../types';

export default function ChroniqueView() {
  const { slug } = useParams<{ slug: string }>();
  const [chronique, setChronique] = useState<Chronique | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/chroniques/slug/${slug}`, { cache: 'no-store' })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setChronique(normalizeArticle(data)))
      .catch(() => setChronique(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-brand-dark font-mono text-sm tracking-widest uppercase">Chargement en cours...</div>;

  if (!chronique) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-brand-red font-mono text-sm tracking-widest uppercase">Chronique introuvable.</p>
        <Link to="/" className="text-sm font-bold text-brand-dark hover:text-brand-red underline">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-white">
      {/* En-tête */}
      <div className="bg-brand-dark text-white">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <Reveal>
            <span className="bg-brand-yellow text-brand-dark text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-sm mb-6 inline-block">
              Chronique
            </span>
            <h1 className="text-3xl md:text-5xl font-serif font-black leading-[1.1] mb-6">
              {chronique.title}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed border-l-4 border-brand-yellow pl-6">
              {chronique.excerpt}
            </p>
          </Reveal>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-12">
        <div className="flex-1 max-w-4xl">
          {/* Auteur */}
          <Reveal>
            <div className="flex items-center justify-between border-b border-gray-100 pb-8 mb-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 shrink-0">
                  <img src={chronique.authorImage || FALLBACK_IMAGE} onError={onImageError} alt={chronique.author} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <p className="font-bold text-brand-dark text-lg">{chronique.author}</p>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">
                    {chronique.authorRole}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 text-xs text-gray-400 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {formatDistanceToNow(new Date(chronique.date), { addSuffix: true, locale: fr })}</span>
                <span className="flex items-center gap-2"><Eye className="w-3.5 h-3.5" /> {chronique.views} vues</span>
              </div>
            </div>
          </Reveal>

          {/* Contenu */}
          <Reveal delay={0.1}>
          {chronique.content ? (
            <div
              className="article-content prose prose-base sm:prose-lg max-w-none prose-p:leading-relaxed prose-p:text-gray-800 prose-headings:font-serif prose-headings:font-black font-serif text-lg sm:text-xl leading-relaxed text-gray-800 first-letter:text-5xl md:first-letter:text-6xl first-letter:font-black first-letter:text-brand-red first-letter:mr-3 first-letter:float-left first-letter:leading-none"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(chronique.content) }}
            />
          ) : (
              <p className="text-gray-500 italic">Le contenu de cette chronique n'est pas encore disponible.</p>
            )}

            {chronique.tags && chronique.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-2">
                <span className="font-bold text-gray-500 mr-2 flex items-center"><Clock className="w-4 h-4 mr-1" /> Tags :</span>
                {chronique.tags.map(tag => (
                  <a
                    href={`/?tag=${encodeURIComponent(tag)}`}
                    key={tag}
                    className="px-4 py-1.5 bg-gray-100 hover:bg-brand-red hover:text-white text-gray-700 text-xs font-bold uppercase tracking-wider rounded-full transition-colors cursor-pointer"
                  >
                    #{tag}
                  </a>
                ))}
              </div>
            )}

            <div className="mt-12">
              <AdSpace format="horizontal" className="rounded-xl" />
            </div>
          </Reveal>
        </div>

        {/* Publicités latérales */}
        <aside className="w-full lg:w-80 hidden lg:block flex-shrink-0 z-10">
          <div className="sticky top-24 space-y-6">
            <AdSpace format="square" className="rounded-xl" />
            <AdSpace format="vertical" className="rounded-xl h-[300px]" />
          </div>
        </aside>
      </div>
    </article>
  );
}
