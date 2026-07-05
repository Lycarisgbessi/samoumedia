import { useArticles, useCategories, useChroniques, useConfig } from '../lib/hooks';
import { Link } from 'react-router-dom';
import { Play, ChevronLeft, ChevronRight, Facebook, Twitter, Youtube } from 'lucide-react';
import { AdSpace } from '../components/AdSpace';
import { SectionRibbon } from '../components/SectionRibbon';

export default function Home() {
  const { articles, loading: articlesLoading } = useArticles();
  const { categories } = useCategories();
  const { chroniques } = useChroniques();
  const { config } = useConfig();

  if (articlesLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || id;

  const featuredArticles = articles.filter(a => a.isFeatured);
  const mainFeatured = featuredArticles[0];
  const subFeatured = featuredArticles.slice(1, 5);
  
  const latestArticles = articles.filter(a => a.id !== mainFeatured?.id).slice(0, 4);
  const mostRead = [...articles].sort((a, b) => b.views - a.views).slice(0, 5);
  const samouBentyArticles = articles.filter(a => a.categoryId === 'samou-benty').slice(0, 4);
  
  const gallery = [
    "https://picsum.photos/seed/samou15/800/600",
    "https://picsum.photos/seed/samou16/800/600",
    "https://picsum.photos/seed/samou17/800/600",
    "https://picsum.photos/seed/samou18/800/600",
    "https://picsum.photos/seed/samou19/800/600",
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      
      {/* ROW 1: A LA UNE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Main Featured */}
        {mainFeatured && (
          <div className="lg:col-span-8 relative group overflow-hidden">
            <Link to={`/article/${mainFeatured.id}`} className="block w-full h-[400px] md:h-[500px]">
              <img src={mainFeatured.imageUrl} alt={mainFeatured.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
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
            <Link to={`/article/${article.id}`} key={article.id} className="flex gap-4 group mb-4 last:mb-0 bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-1/3 aspect-[4/3] shrink-0 overflow-hidden">
                <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
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
          
          <div className="flex gap-4 text-xs font-bold uppercase mb-6 text-gray-500 border-b border-gray-200 pb-2 overflow-x-auto hide-scrollbar">
            <span className="text-brand-red border-b-2 border-brand-red pb-2 whitespace-nowrap cursor-pointer">TOUTES</span>
            <span className="hover:text-brand-dark cursor-pointer whitespace-nowrap">NATIONAL</span>
            <span className="hover:text-brand-dark cursor-pointer whitespace-nowrap">POLITIQUE</span>
            <span className="hover:text-brand-dark cursor-pointer whitespace-nowrap">SOCIÉTÉ</span>
            <span className="hover:text-brand-dark cursor-pointer whitespace-nowrap">ÉCONOMIE</span>
            <span className="hover:text-brand-dark cursor-pointer whitespace-nowrap">SPORT</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {latestArticles.map((article) => (
              <Link to={`/article/${article.id}`} key={article.id} className="group">
                <div className="relative aspect-[4/3] mb-3 overflow-hidden">
                  <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
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
              <Link to={`/article/${article.id}`} key={article.id} className="flex gap-3 group items-start border-b border-gray-100 pb-4 last:border-0">
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
                <Link to={`/article/${article.id}`} key={article.id} className="group">
                  <div className="aspect-[4/3] overflow-hidden mb-2">
                    <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
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
            {/* Main Video */}
            <div className="relative group cursor-pointer aspect-video bg-gray-900">
              <img src={gallery[0]} alt="Video Thumbnail" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center text-white border-2 border-white/80">
                  <Play size={24} className="ml-1 fill-white" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-white font-bold text-sm leading-tight line-clamp-2">Reportage sur la relance économique à Forécariah</h3>
              </div>
            </div>
            {/* Small Videos */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="relative group cursor-pointer aspect-video bg-gray-900">
                  <img src={gallery[i]} alt="Mini Video" className="w-full h-full object-cover opacity-70 group-hover:opacity-100" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white border border-white/80">
                      <Play size={12} className="ml-0.5 fill-white" />
                    </div>
                  </div>
                </div>
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
              <div key={item.id} className="flex gap-4 items-center group cursor-pointer border-b border-gray-100 pb-4 last:border-0">
                <div className="w-16 h-16 rounded-full overflow-hidden shrink-0">
                  <img src={item.authorAvatar} alt={item.author} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-brand-dark group-hover:text-brand-yellow transition-colors leading-snug mb-1">
                    {item.title}
                  </h4>
                  <div className="text-xs text-gray-500 font-bold uppercase">
                    Par <span className="text-brand-dark">{item.author}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Galerie */}
        <div>
          <SectionRibbon color="red">
            GALERIE PHOTOS
          </SectionRibbon>
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-1 row-span-2 relative group cursor-pointer overflow-hidden aspect-[1/2]">
              <img src={gallery[2]} alt="Gallery Main" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            </div>
            <div className="col-span-1 relative group cursor-pointer overflow-hidden aspect-square">
              <img src={gallery[3]} alt="Gallery 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            </div>
            <div className="col-span-1 relative group cursor-pointer overflow-hidden aspect-square">
              <img src={gallery[4]} alt="Gallery 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
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
            <a href={config?.socials?.facebook} className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-200 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] group transition-colors">
              <Facebook size={24} className="text-[#1877F2] group-hover:text-white mb-2" />
              <span className="font-bold text-lg">{config?.socialStats?.facebook || '12.5K'}</span>
              <span className="text-[10px] uppercase font-bold text-gray-500 group-hover:text-white/80">Fans</span>
            </a>
            {/* X */}
            <a href={config?.socials?.twitter} className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-200 hover:bg-black hover:text-white hover:border-black group transition-colors">
              <Twitter size={24} className="text-black group-hover:text-white mb-2" />
              <span className="font-bold text-lg">{config?.socialStats?.twitter || '8.2K'}</span>
              <span className="text-[10px] uppercase font-bold text-gray-500 group-hover:text-white/80">Abonnés</span>
            </a>
            {/* YT */}
            <a href={config?.socials?.youtube} className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-200 hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000] group transition-colors">
              <Youtube size={24} className="text-[#FF0000] group-hover:text-white mb-2" />
              <span className="font-bold text-lg">{config?.socialStats?.youtube || '5.7K'}</span>
              <span className="text-[10px] uppercase font-bold text-gray-500 group-hover:text-white/80">Abonnés</span>
            </a>
            {/* WA */}
            <a href={config?.socials?.whatsapp} className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-200 hover:bg-[#25D366] hover:text-white hover:border-[#25D366] group transition-colors">
              <div className="w-6 h-6 rounded-full bg-[#25D366] text-white flex items-center justify-center font-bold text-xs mb-2 group-hover:bg-white group-hover:text-[#25D366]">W</div>
              <span className="font-bold text-[11px] text-center leading-tight">Rejoignez-nous<br/>sur WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

    </main>
  );
}
