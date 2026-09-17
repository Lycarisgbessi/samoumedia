import { Play, Calendar, Eye, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Reveal } from '../components/Reveal';
import { AdSpace } from '../components/AdSpace';
import { useArticles, useCategories } from '../lib/hooks';
import { getArticleImage, onImageError } from '../lib/media';

export default function Reportages() {
  const { articles, loading } = useArticles();
  const { categories } = useCategories();

  // Les reportages sont les articles disposant d'une vidéo (YouTube).
  const videoArticles = articles.filter(a => a.videoUrl);
  const featuredVideo = videoArticles[0];
  const regularVideos = videoArticles.slice(1);

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || '';

  return (
    <main className="max-w-7xl mx-auto px-4 py-16 min-h-[60vh] overflow-hidden">
      <Reveal className="mb-16 border-b-2 border-gray-100 pb-8">
        <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tighter text-brand-dark mb-4 uppercase flex items-center gap-4">
          <Video className="text-brand-red w-12 h-12" />
          Vidéos & Reportages
        </h1>
        <p className="text-gray-500 text-lg md:text-xl">Nos reportages exclusifs, interviews et immersions sur le terrain.</p>
      </Reveal>

      <div className="mb-12">
        <AdSpace format="horizontal" className="rounded-2xl" />
      </div>

      {loading ? (
        <div className="py-24 text-center text-gray-400 font-bold uppercase tracking-widest text-sm">Chargement des vidéos...</div>
      ) : videoArticles.length === 0 ? (
        <div className="py-24 text-center text-gray-500 bg-gray-50/50 rounded-2xl border border-gray-100">
          Aucune vidéo publiée pour le moment. Revenez bientôt !
        </div>
      ) : (
        <>
          {/* Vidéo principale */}
          {featuredVideo && (
            <Reveal delay={0.1} className="mb-20">
              <Link to={`/article/${featuredVideo.slug}`} className="block relative rounded-2xl overflow-hidden group cursor-pointer shadow-2xl aspect-[21/9] md:aspect-video bg-gray-900">
                <img
                  src={getArticleImage(featuredVideo)}
                  onError={onImageError}
                  alt={featuredVideo.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500 flex items-center justify-center">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-brand-red/90 text-white rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-all duration-500 ease-out shadow-2xl backdrop-blur-sm">
                    <Play className="w-10 h-10 md:w-14 md:h-14 ml-2 fill-white" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                  {getCategoryName(featuredVideo.categoryId) && (
                    <span className="bg-brand-red text-white text-[10px] md:text-xs font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-sm mb-4 md:mb-6 inline-block shadow-lg">
                      {getCategoryName(featuredVideo.categoryId)}
                    </span>
                  )}
                  <h2 className="text-2xl md:text-5xl font-serif font-bold text-white leading-[1.1] mb-6 max-w-4xl drop-shadow-lg">
                    {featuredVideo.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 md:gap-8 text-gray-200 text-xs md:text-sm font-medium tracking-wider">
                    <span className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                      <Calendar className="w-4 h-4" /> {new Date(featuredVideo.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                      <Eye className="w-4 h-4" /> {featuredVideo.views} vues
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          )}

          {/* Grille des autres vidéos */}
          <section className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1">
              <Reveal delay={0.2}>
                <h3 className="text-2xl font-serif font-black tracking-wide uppercase text-brand-dark mb-10 flex items-center">
                  <span className="w-8 h-1 bg-brand-red mr-4"></span>
                  Dernières publications
                </h3>
              </Reveal>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                {regularVideos.map((video, index) => (
                  <Reveal key={video.id} delay={0.1 * index}>
                    <Link to={`/article/${video.slug}`} className="group cursor-pointer flex flex-col h-full bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-500 border border-gray-100/50 hover:border-gray-200">
                      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                        <img
                          src={getArticleImage(video)}
                          onError={onImageError}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500 flex items-center justify-center">
                          <div className="w-16 h-16 bg-white text-brand-red rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-50 group-hover:scale-100 shadow-xl">
                            <Play className="w-6 h-6 ml-1 fill-brand-red" />
                          </div>
                        </div>
                        {getCategoryName(video.categoryId) && (
                          <div className="absolute top-3 left-3 bg-brand-red text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-sm shadow-md">
                            {getCategoryName(video.categoryId)}
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <h4 className="font-serif font-bold text-xl text-gray-900 group-hover:text-brand-red transition-colors duration-300 line-clamp-2 mb-4 leading-tight">
                          {video.title}
                        </h4>
                        <div className="mt-auto flex items-center gap-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-300" /> {new Date(video.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          <span className="flex items-center gap-2"><Eye className="w-4 h-4 text-gray-300" /> {video.views}</span>
                        </div>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>

            <aside className="w-full lg:w-80 hidden lg:block flex-shrink-0 z-10">
              <div className="sticky top-24 space-y-6">
                <AdSpace format="square" className="rounded-xl" />
                <AdSpace format="vertical" className="rounded-xl h-[300px]" />
              </div>
            </aside>
          </section>
        </>
      )}
    </main>
  );
}
