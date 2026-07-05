import { Play, Calendar, Eye, Video } from 'lucide-react';
import { Reveal } from '../components/Reveal';
import { motion } from 'motion/react';
import { AdSpace } from '../components/AdSpace';

const VIDEOS = [
  {
    id: 1,
    title: "Immersion : Le quotidien des pêcheurs de Samou Benty, entre tradition et défis climatiques",
    duration: "12:05",
    views: "2.4K",
    date: "10 Mai 2025",
    image: "https://picsum.photos/seed/samou23/800/600",
    category: "Société",
    featured: true
  },
  {
    id: 2,
    title: "Infrastructures : L'avancement des travaux de l'axe Forécariah",
    duration: "08:30",
    views: "1.2K",
    date: "08 Mai 2025",
    image: "https://picsum.photos/seed/samou24/800/600",
    category: "Infrastructures",
    featured: false
  },
  {
    id: 3,
    title: "Santé Publique : Remise de matériels médicaux à l'hôpital régional",
    duration: "04:15",
    views: "850",
    date: "05 Mai 2025",
    image: "https://picsum.photos/seed/samou25/800/600",
    category: "Santé",
    featured: false
  },
  {
    id: 4,
    title: "Éducation : Les préparatifs pour les examens nationaux",
    duration: "06:45",
    views: "3.1K",
    date: "02 Mai 2025",
    image: "https://picsum.photos/seed/samou26/800/600",
    category: "Éducation",
    featured: false
  },
  {
    id: 5,
    title: "Découverte : Le Kankou Mousso, identité culturelle forte",
    duration: "15:20",
    views: "5.5K",
    date: "28 Avril 2025",
    image: "https://picsum.photos/seed/samou27/800/600",
    category: "Culture",
    featured: false
  },
  {
    id: 6,
    title: "Interview : Le Maire de Samou Benty dresse son bilan",
    duration: "22:10",
    views: "1.8K",
    date: "20 Avril 2025",
    image: "https://picsum.photos/seed/samou28/800/600",
    category: "Politique",
    featured: false
  }
];

export default function Reportages() {
  const featuredVideo = VIDEOS.find(v => v.featured) || VIDEOS[0];
  const regularVideos = VIDEOS.filter(v => v.id !== featuredVideo.id);

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

      {/* Featured Video */}
      <Reveal delay={0.1} className="mb-20">
        <div className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-2xl aspect-[21/9] md:aspect-video bg-gray-900">
          <motion.img 
            src={featuredVideo.image} 
            alt={featuredVideo.title} 
            className="w-full h-full object-cover opacity-80" 
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500 flex items-center justify-center">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-brand-red/90 text-white rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-all duration-500 ease-out shadow-2xl backdrop-blur-sm">
              <Play className="w-10 h-10 md:w-14 md:h-14 ml-2 fill-white" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
            <span className="bg-brand-red text-white text-[10px] md:text-xs font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-sm mb-4 md:mb-6 inline-block shadow-lg">
              {featuredVideo.category}
            </span>
            <h2 className="text-2xl md:text-5xl font-serif font-bold text-white leading-[1.1] mb-6 max-w-4xl drop-shadow-lg">
              {featuredVideo.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 md:gap-8 text-gray-200 text-xs md:text-sm font-medium tracking-wider">
              <span className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10"><Calendar className="w-4 h-4" /> {featuredVideo.date}</span>
              <span className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10"><Eye className="w-4 h-4" /> {featuredVideo.views} vues</span>
              <span className="flex items-center gap-2 font-mono bg-brand-red/80 px-3 py-1.5 rounded-full shadow-inner">{featuredVideo.duration}</span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Video Grid */}
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
                <div className="group cursor-pointer flex flex-col h-full bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-500 border border-gray-100/50 hover:border-gray-200">
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                    <img onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect fill='%23f3f4f6' width='800' height='600'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='30' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ESAMOU MEDIA%3C/text%3E%3C/svg%3E"; }} src={video.image} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white text-brand-red rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-50 group-hover:scale-100 shadow-xl">
                        <Play className="w-6 h-6 ml-1 fill-brand-red" />
                      </div>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-sm tracking-wider">
                      {video.duration}
                    </div>
                    <div className="absolute top-3 left-3 bg-brand-red text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-sm shadow-md transform -translate-y-1 opacity-90 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      {video.category}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h4 className="font-serif font-bold text-xl text-gray-900 group-hover:text-brand-red transition-colors duration-300 line-clamp-2 mb-4 leading-tight">
                      {video.title}
                    </h4>
                    <div className="mt-auto flex items-center gap-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-300" /> {video.date}</span>
                      <span className="flex items-center gap-2"><Eye className="w-4 h-4 text-gray-300" /> {video.views}</span>
                    </div>
                  </div>
                </div>
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
    </main>
  );
}
