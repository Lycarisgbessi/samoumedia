import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Play, ChevronLeft, ChevronRight, Facebook, Twitter, Youtube, X } from 'lucide-react';
import { AdSpace } from '../components/AdSpace';
import { SectionRibbon } from '../components/SectionRibbon';
import { useArticles, useCategories, useChroniques, useConfig } from '../lib/hooks';
import { FALLBACK_IMAGE, getArticleImage, onImageError } from '../lib/media';

export default function Home() {
  const { articles, loading: articlesLoading } = useArticles();
  const { categories } = useCategories();
  const { chroniques } = useChroniques();
  const { config } = useConfig();

  // Filtre actif de la rangée "Dernières actualités" (null = TOUTES)
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);
  // Tag éventuel venant d'un lien ?tag= (depuis les articles)
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTag = searchParams.get('tag');

  if (articlesLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || id;

  // Articles filtrés par tag si présent dans l'URL (?tag=XXX)
  const tagFilteredArticles = activeTag
    ? articles.filter(a => a.tags?.includes(activeTag))
    : articles;

  const featuredArticles = tagFilteredArticles.filter(a => a.isFeatured);
  const mainFeatured = featuredArticles[0];
  const subFeatured = featuredArticles.slice(1, 5);

  // Onglets de filtre dynamiques : construits depuis les vraies rubriques actives
  const activeCategories = categories.filter(c => c.isActive);
  const filterTabs = activeCategories.slice(0, 7);

  const latestArticles = tagFilteredArticles
    .filter(a => a.id !== mainFeatured?.id)
    .filter(a => !activeCategoryFilter || a.categoryId === activeCategoryFilter)
    .slice(0, 8);

  const mostRead = [...tagFilteredArticles].sort((a, b) => b.views - a.views).slice(0, 5);

  // Rubrique "Samou Benty" : résolue de façon robuste (id, slug ou nom)
  const samouBentyCategory = activeCategories.find(
    c => c.id === 'samou-benty' || c.slug?.startsWith('samou-benty') || c.name.toLowerCase() === 'samou benty'
  );
  const samouBentyArticles = samouBentyCategory
    ? tagFilteredArticles.filter(a => a.categoryId === samouBentyCategory.id).slice(0, 4)
    : [];

  // Vidéos : articles réels disposant d'une vidéo YouTube (plus de fausses cartes)
  const videoArticles = tagFilteredArticles.filter(a => a.videoUrl).slice(0, 4);
  const mainVideo = videoArticles[0];
  const smallVideos = videoArticles.slice(1, 4);

  const clearTag = () => {
    searchParams.delete('tag');
    setSearchParams(searchParams, { replace: true });
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">

      {/* Bandeau de filtrage par tag */}
      {activeTag && (
        <div className="mb-6 flex items-center justify-between bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm font-bold text-brand-red uppercase tracking-wide">
            Articles tagués « {activeTag} » — {tagFilteredArticles.length} résultat(s)
          </p>
          <button onClick={clearTag} className="p-1 text-gray-500 hover:text-brand-red" title="Retirer le filtre">
            <X size={18} />
          </button>
        </div>
      )}

      {/* ROW 1: A LA UNE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Main Featured */}
        {mainFeatured && (
          <div className="lg:col-span-8 relative group overflow-hidden">
            <Link to={`/article/${mainFeatured.slug}`} className="block w-full h-[400px] md:h-[500px]">
              <img src={getArticleImage(mainFeatured)} onError={onImageError} alt={mainFeatured.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <span className="bg-brand-red text-white text-xs font-bold uppercase px-3 py-1 mb-4 inline-block">
                  {getCategoryName(mainFeatured.categoryId)}
                </span>
                <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight mb-2">
                  {mainFeatured.title}
                </h2>
                <p className="text-gray-200 text-sm md:text-base line-clamp-2 mb-3">
                  {mainFeatured.excerpt}
                </p>
                <div className="flex items-center text-gray-300 text-xs">
                  <span className="uppercase">{mainFeatured.author}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(mainFeatured.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-red"></div>
                <div className="w-2 h-2 rounded-full bg-white/50"></div>
                <div className="w-2 h-2 rounded-full bg-white/50"></div>
              </div>
            </Link>
          </div>
        )}

        {/* Sub Featured */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          {subFeatured.map((article) => (
            <Link to={`/article/${article.slug}`} key={article.id} className="flex gap-4 group mb-4 last:mb-0 bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-1/3 aspect-[4/3] shrink-0 overflow-hidden">
                <img src={getArticleImage(article)} onError={onImageError} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="flex flex-col py-1 pr-2 w-2/3">
                <span className="text-[10px] font-bold text-brand-red uppercase mb-1">
                  {getCategoryName(article.categoryId)}
                </span>
                <h3 className="font-bold text-brand-dark text-sm leading-snug line-clamp-3 group-hover:text-brand-red transition-colors">
                  {article.title}
                </h3>
                <span className="text-[10px] text-gray-500 mt-auto pt-2 uppercase">
                  {new Date(article.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Ad Space */}
      <div className="mb-10 w-full bg-gray-100 flex justify-center py-4">
        <AdSpace format="horizontal" />
      </div>

      {/* ROW 2: DERNIERES ACTUALITES + LES PLUS LUS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">

        <div className="lg:col-span-8">
          <SectionRibbon color="red" rightLink={{text: '', url: '#'}}>
            DERNIÈRES ACTUALITÉS
          </SectionRibbon>

          {/* Onglets de filtre fonctionnels, générés depuis les rubriques réelles */}
          <div className="flex gap-4 text-xs font-bold uppercase mb-6 text-gray-500 border-b border-gray-200 pb-2 overflow-x-auto hide-scrollbar">
            <span
              onClick={() => setActiveCategoryFilter(null)}
              className={`pb-2 whitespace-nowrap cursor-pointer ${!activeCategoryFilter ? 'text-brand-red border-b-2 border-brand-red' : 'hover:text-brand-dark'}`}
            >
              TOUTES
            </span>
            {filterTabs.map(cat => (
              <span
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`pb-2 whitespace-nowrap cursor-pointer ${activeCategoryFilter === cat.id ? 'text-brand-red border-b-2 border-brand-red' : 'hover:text-brand-dark'}`}
              >
                {cat.name.toUpperCase()}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {latestArticles.map((article) => (
              <Link to={`/article/${article.slug}`} key={article.id} className="group">
                <div className="relative aspect-[4/3] mb-3 overflow-hidden">
                  <img src={getArticleImage(article)} onError={onImageError} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute bottom-0 left-0 bg-brand-blue text-white text-[10px] font-bold uppercase px-2 py-0.5">
                    {getCategoryName(article.categoryId)}
                  </div>
                </div>
                <h3 className="font-bold text-sm leading-tight text-brand-dark group-hover:text-brand-red transition-colors mb-2 line-clamp-3">
                  {article.title}
                </h3>
                <span className="text-[10px] text-gray-500 uppercase">
                  {new Date(article.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Sidebar: Les plus lus */}
        <div className="lg:col-span-4">
          <SectionRibbon color="green">
            LES PLUS LUS
          </SectionRibbon>

          <div className="flex flex-col gap-4">
            {mostRead.map((article, index) => (
              <Link to={`/article/${article.slug}`} key={article.id} className="flex gap-3 group items-start border-b border-gray-100 pb-4 last:border-0">
                <div className="w-8 h-8 shrink-0 bg-brand-red text-white flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-brand-dark group-hover:text-brand-red transition-colors leading-snug line-clamp-2">
                    {article.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 3: SAMOU BENTY EN DIRECT + VIDEOS A LA UNE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">

        <div className="lg:col-span-8">
          <SectionRibbon color="green">
            SAMOU BENTY EN DIRECT
          </SectionRibbon>

          <div className="relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {samouBentyArticles.map((article) => (
                <Link to={`/article/${article.slug}`} key={article.id} className="group">
                  <div className="aspect-[4/3] overflow-hidden mb-2">
                    <img src={getArticleImage(article)} onError={onImageError} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <h3 className="font-bold text-xs leading-snug text-brand-dark group-hover:text-brand-green line-clamp-3">
                    {article.title}
                  </h3>
                </Link>
              ))}
            </div>
            {/* Carousel Arrows */}
            <button className="absolute top-1/3 -left-4 w-8 h-8 bg-brand-green text-white flex items-center justify-center shadow-md z-10 hidden md:flex hover:bg-green-700">
              <ChevronLeft size={20} />
            </button>
            <button className="absolute top-1/3 -right-4 w-8 h-8 bg-brand-green text-white flex items-center justify-center shadow-md z-10 hidden md:flex hover:bg-green-700">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="lg:col-span-4">
          <SectionRibbon color="red" rightLink={{ text: 'VOIR TOUT', url: '/reportages' }}>
            VIDÉOS À LA UNE
          </SectionRibbon>

          <div className="flex flex-col gap-4">
            {/* Vidéo principale : premier article vidéo réel */}
            {mainVideo ? (
              <Link to={`/article/${mainVideo.slug}`} className="relative group cursor-pointer aspect-video bg-gray-900 overflow-hidden">
                <img src={getArticleImage(mainVideo)} onError={onImageError} alt={mainVideo.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center text-white border-2 border-white/80">
                    <Play size={24} className="ml-1 fill-white" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-white font-bold text-sm leading-tight line-clamp-2">{mainVideo.title}</h3>
                </div>
              </Link>
            ) : (
              <div className="relative aspect-video bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold uppercase">
                Aucune vidéo pour le moment
              </div>
            )}
            {/* Petites vidéos */}
            <div className="grid grid-cols-3 gap-2">
              {smallVideos.map((video) => (
                <Link to={`/article/${video.slug}`} key={video.id} className="relative group cursor-pointer aspect-video bg-gray-900 overflow-hidden">
                  <img src={getArticleImage(video)} onError={onImageError} alt={video.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white border border-white/80">
                      <Play size={12} className="ml-0.5 fill-white" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ROW 4: CHRONIQUES, GALERIE, RESTEZ CONNECTÉ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Chroniques */}
        <div>
          <SectionRibbon color="yellow">
            CHRONIQUES & ANALYSES
          </SectionRibbon>
          <div className="flex flex-col gap-4">
            {chroniques.map((item) => (
              <Link to={`/chronique/${item.slug}`} key={item.id} className="flex gap-4 items-center group border-b border-gray-100 pb-4 last:border-0">
                <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 bg-gray-100">
                  <img src={item.authorImage || FALLBACK_IMAGE} onError={onImageError} alt={item.author} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-brand-dark group-hover:text-brand-yellow transition-colors leading-snug mb-1">
                    {item.title}
                  </h4>
                  <div className="text-xs text-gray-500 font-bold uppercase">
                    Par <span className="text-brand-dark">{item.author}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Galerie */}
        <div>
          <SectionRibbon color="red">
            GALERIE PHOTOS
          </SectionRibbon>
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-1 row-span-2 relative group overflow-hidden aspect-[1/2]">
              <img src={FALLBACK_IMAGE} alt="Galerie SAMOU MÉDIA" className="w-full h-full object-cover" />
            </div>
            <div className="col-span-1 relative group overflow-hidden aspect-square">
              <img src={FALLBACK_IMAGE} alt="Galerie SAMOU MÉDIA" className="w-full h-full object-cover" />
            </div>
            <div className="col-span-1 relative group overflow-hidden aspect-square">
              <img src={FALLBACK_IMAGE} alt="Galerie SAMOU MÉDIA" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Restez Connecté */}
        <div>
          <SectionRibbon color="green">
            RESTEZ CONNECTÉ
          </SectionRibbon>
          <div className="grid grid-cols-2 gap-4">
            {/* FB */}
            <a href={config?.socials?.facebook || '#'} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-200 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] group transition-colors">
              <Facebook size={24} className="text-[#1877F2] group-hover:text-white mb-2" />
              <span className="font-bold text-lg">Facebook</span>
              <span className="text-[10px] uppercase font-bold text-gray-500 group-hover:text-white/80">Rejoignez-nous</span>
            </a>
            {/* X */}
            <a href={config?.socials?.twitter || '#'} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-200 hover:bg-black hover:text-white hover:border-black group transition-colors">
              <Twitter size={24} className="text-black group-hover:text-white mb-2" />
              <span className="font-bold text-lg">X / Twitter</span>
              <span className="text-[10px] uppercase font-bold text-gray-500 group-hover:text-white/80">Suivez-nous</span>
            </a>
            {/* YT */}
            <a href={config?.socials?.youtube || '#'} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-200 hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000] group transition-colors">
              <Youtube size={24} className="text-[#FF0000] group-hover:text-white mb-2" />
              <span className="font-bold text-lg">YouTube</span>
              <span className="text-[10px] uppercase font-bold text-gray-500 group-hover:text-white/80">Abonnez-vous</span>
            </a>
            {/* WA */}
            <a href={config?.socials?.whatsapp || '#'} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-200 hover:bg-[#25D366] hover:text-white hover:border-[#25D366] group transition-colors">
              <div className="w-6 h-6 rounded-full bg-[#25D366] text-white flex items-center justify-center font-bold text-xs mb-2 group-hover:bg-white group-hover:text-[#25D366]">W</div>
              <span className="font-bold text-[11px] text-center leading-tight">Rejoignez-nous<br/>sur WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

    </main>
  );
}
