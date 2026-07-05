import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { Article } from '../types';
import { articles as mockArticles } from '../lib/mockData'; // à supprimer
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Reveal } from '../components/Reveal';
import { motion, useScroll, useTransform } from 'motion/react';
import { Calendar, Clock, Share2 } from 'lucide-react';
import { AdSpace } from '../components/AdSpace';

export default function ArticleView() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    fetch(`/api/articles/${id}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setArticle(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-brand-dark font-mono text-sm tracking-widest uppercase">Chargement en cours...</div>;
  if (!article) return <div className="min-h-screen flex items-center justify-center text-brand-red font-mono text-sm tracking-widest uppercase">Article introuvable.</div>;

  return (
    <article className="min-h-screen bg-white">
      {/* Immersive Header */}
      <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden bg-brand-dark">
        <motion.div style={{ y, opacity }} className="absolute inset-0 origin-top">
          <img onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect fill='%23f3f4f6' width='800' height='600'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='30' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ESAMOU MEDIA%3C/text%3E%3C/svg%3E"; }} 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-full object-cover opacity-60"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-16 pb-12">
          <div className="max-w-4xl mx-auto">
            <Reveal>
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="bg-brand-red text-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] rounded-sm shadow-lg">
                  {article.categoryId}
                </span>
                <span className="text-gray-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDistanceToNow(new Date(article.date), { addSuffix: true, locale: fr })}
                </span>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-black text-white leading-[1.1] mb-6 drop-shadow-xl">
                {article.title}
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-xl md:text-2xl text-gray-300 leading-relaxed font-medium max-w-3xl border-l-4 border-brand-red pl-6 drop-shadow-md">
                {article.excerpt}
              </p>
            </Reveal>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col lg:flex-row gap-12">
        <div className="flex-1 max-w-4xl">
          <Reveal delay={0.3}>
            <div className="hidden md:block mb-10">
              <AdSpace format="horizontal" className="rounded-xl h-24" />
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-100 pb-8 mb-12 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-brand-dark flex items-center justify-center font-bold text-white text-xl shadow-md">
                {article.author.charAt(0)}
              </div>
              <div className="flex flex-col">
                <p className="font-bold text-brand-dark text-lg">{article.author}</p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-2 mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  {article.readTime} de lecture
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-brand-red hover:border-brand-red hover:bg-brand-red/5 transition-all duration-300 group">
                <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.4}>
          <div className="prose prose-lg md:prose-xl prose-red max-w-none prose-p:leading-relaxed prose-p:text-gray-800 prose-headings:font-serif prose-headings:font-black">
            <div 
              className="whitespace-pre-wrap font-serif text-2xl leading-relaxed text-gray-800 mb-8 first-letter:text-7xl first-letter:font-black first-letter:text-brand-red first-letter:mr-3 first-letter:float-left first-letter:leading-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
            
            <AdSpace format="in-article" className="rounded-xl" />

            <p className="whitespace-pre-wrap text-gray-800 leading-relaxed mt-8 font-medium">
              {/* Mock extra content for better visual presentation */}
              Ce reportage s'inscrit dans notre volonté continue de mettre en lumière les réalités du terrain. Les témoignages recueillis démontrent une résilience extraordinaire de la population face aux défis quotidiens. Nous continuerons à suivre de près l'évolution de cette situation dans nos prochaines éditions.
            </p>
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
