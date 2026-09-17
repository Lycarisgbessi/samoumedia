import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { Article } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Reveal } from '../components/Reveal';
import { motion, useScroll, useTransform } from 'motion/react';
import { Calendar, Clock, Share2, Check } from 'lucide-react';
import { AdSpace } from '../components/AdSpace';
import DOMPurify from 'dompurify';
import { useCategories } from '../lib/hooks';
import { normalizeArticle } from '../lib/text';
import { FALLBACK_IMAGE, getYouTubeId, getYouTubeThumb, onImageError } from '../lib/media';

export default function ArticleView() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { categories } = useCategories();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/articles/slug/${slug}`, { cache: 'no-store' })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setArticle(normalizeArticle(data));
        setLoading(false);
      })
      .catch(() => {
        setArticle(null);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-brand-dark font-mono text-sm tracking-widest uppercase">Chargement en cours...</div>;
  if (!article) return <div className="min-h-screen flex items-center justify-center text-brand-red font-mono text-sm tracking-widest uppercase">Article introuvable.</div>;

  const youtubeId = getYouTubeId(article.videoUrl);
  // Nom lisible de la rubrique (au lieu d'afficher l'identifiant brut en base)
  const categoryName = categories.find(c => c.id === article.categoryId)?.name || 'Actualité';

  // Bouton Partager : partage natif si disponible, sinon copie du lien dans le presse-papiers
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: article.title, text: article.excerpt || '', url });
        return;
      } catch {
        /* utilisateur a annulé */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* presse-papiers indisponible */
    }
  };

  return (
    <article className="min-h-screen bg-white">
      {/* Immersive Header */}
      <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden bg-brand-dark">
        <motion.div style={{ y, opacity }} className="absolute inset-0 origin-top">
          <img onError={onImageError}
            src={article.imageUrl || getYouTubeThumb(article.videoUrl) || FALLBACK_IMAGE}
            alt={article.title}
            className="w-full h-full object-cover opacity-60"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-transparent" />

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-16 pb-12">
          <div className="max-w-4xl mx-auto">
            <Reveal>
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="bg-brand-red text-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] rounded-sm shadow-lg flex items-center gap-2">
                  {youtubeId && <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>}
                  {categoryName}
                </span>
                <span className="text-gray-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDistanceToNow(new Date(article.date), { addSuffix: true, locale: fr })}
                </span>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-serif font-black text-white leading-[1.1] mb-4 md:mb-6 drop-shadow-xl break-words">
                {article.title}
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-base md:text-2xl text-gray-300 leading-relaxed font-medium max-w-3xl border-l-4 border-brand-red pl-4 md:pl-6 drop-shadow-md break-words">
                {article.excerpt}
              </p>
            </Reveal>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16 flex flex-col lg:flex-row gap-8 md:gap-12">
        <div className="flex-1 max-w-4xl">
          <Reveal delay={0.3}>
            <div className="hidden md:block mb-10">
              <AdSpace format="horizontal" className="rounded-xl h-24" />
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-100 pb-8 mb-12 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-brand-dark flex items-center justify-center font-bold text-white text-xl shadow-md">
                {article.author?.charAt(0) || 'S'}
              </div>
              <div className="flex flex-col">
                <p className="font-bold text-brand-dark text-lg">{article.author}</p>
                {article.readTime && (
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-2 mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    {article.readTime} de lecture
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleShare}
                title="Partager l'article"
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-brand-red hover:border-brand-red hover:bg-brand-red/5 transition-all duration-300 group"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.4}>
          {youtubeId && (
            <figure className="mb-12 w-full">
              <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-black" style={{ paddingTop: '56.25%' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title={`Vidéo : ${article.title}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="absolute top-0 left-0 w-full h-full border-0"
                ></iframe>
              </div>
              <figcaption className="mt-2 text-center text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
                Vidéo — SAMOU MÉDIA
              </figcaption>
            </figure>
          )}

          <div className="prose prose-base sm:prose-lg md:prose-xl prose-red max-w-none prose-p:leading-relaxed prose-p:text-gray-800 prose-headings:font-serif prose-headings:font-black">
            <div
              className="article-content font-serif text-lg sm:text-xl md:text-2xl leading-relaxed text-gray-800 mb-8 first-letter:text-5xl md:first-letter:text-6xl lg:first-letter:text-7xl first-letter:font-black first-letter:text-brand-red first-letter:mr-3 first-letter:float-left first-letter:leading-none"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
            />

            {article.tags && article.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-2">
                <span className="font-bold text-gray-500 mr-2 flex items-center">Tags :</span>
                {article.tags.map(tag => (
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

            <AdSpace format="in-article" className="rounded-xl" />
            <div className="mt-16 border-t border-gray-100 pt-12">
              <AdSpace format="horizontal" className="rounded-xl" />
            </div>
          </div>
        </Reveal>
        </div>

        {/* Sidebar Ads */}
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
