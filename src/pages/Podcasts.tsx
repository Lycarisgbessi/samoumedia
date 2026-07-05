import { Play, Clock, Calendar, Headphones } from 'lucide-react';
import { Reveal } from '../components/Reveal';
import { motion } from 'motion/react';
import { AdSpace } from '../components/AdSpace';

const PODCASTS = [
  {
    id: 1,
    title: "L'Heure de Vérité : Les enjeux de la transition",
    description: "Dans ce premier épisode, nous décryptons les défis de la transition politique en Guinée avec nos invités spéciaux.",
    duration: "45:20",
    date: "12 Mai 2025",
    category: "Politique",
    image: "https://picsum.photos/seed/samou19/800/600",
  },
  {
    id: 2,
    title: "Économie Locale : Le potentiel agricole de Forécariah",
    description: "Comment les agriculteurs locaux transforment l'économie de la région malgré les difficultés climatiques.",
    duration: "32:15",
    date: "05 Mai 2025",
    category: "Économie",
    image: "https://picsum.photos/seed/samou20/800/600",
  },
  {
    id: 3,
    title: "Paroles de Jeunes : L'éducation et l'emploi",
    description: "Un panel de jeunes diplômés discutent de leurs perspectives d'avenir et des initiatives communautaires.",
    duration: "50:05",
    date: "28 Avril 2025",
    category: "Société",
    image: "https://picsum.photos/seed/samou21/800/600",
  },
  {
    id: 4,
    title: "Héritage : La culture Kankou Mousso",
    description: "Plongée sonore au cœur des traditions et des valeurs transmises de génération en génération.",
    duration: "28:40",
    date: "15 Avril 2025",
    category: "Culture",
    image: "https://picsum.photos/seed/samou22/800/600",
  },
  {
    id: 5,
    title: "Le journal des sports: Retour sur le week-end",
    duration: "18:45",
    date: "10 Avril 2025",
    category: "Sport",
    image: "https://picsum.photos/seed/samou21_b/800/600",
  },
  {
    id: 6,
    title: "Analyse : Les défis de l'éducation en zone rurale",
    duration: "42:10",
    date: "02 Avril 2025",
    category: "Éducation",
    image: "https://picsum.photos/seed/samou22_b/800/600",
  }
];

export default function Podcasts() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-16 min-h-[60vh] overflow-hidden">
      <Reveal className="mb-16 border-b-2 border-gray-100 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tighter text-brand-dark mb-4 uppercase flex items-center gap-4">
            <Headphones className="text-brand-yellow w-12 h-12" />
            Nos Podcasts
          </h1>
          <p className="text-gray-500 text-lg md:text-xl">Écoutez nos analyses, débats et reportages en format audio.</p>
        </div>
        <div className="hidden md:block bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Disponible sur</p>
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-black rounded-full shadow-inner hover:scale-110 transition-transform cursor-pointer"></div>
            <div className="w-10 h-10 bg-green-500 rounded-full shadow-inner hover:scale-110 transition-transform cursor-pointer"></div>
            <div className="w-10 h-10 bg-purple-500 rounded-full shadow-inner hover:scale-110 transition-transform cursor-pointer"></div>
          </div>
        </div>
      </Reveal>

      <div className="mb-12">
        <AdSpace format="horizontal" className="rounded-2xl" />
      </div>

      {/* Featured Podcast */}
      <Reveal delay={0.1}>
        <div className="bg-brand-dark rounded-2xl overflow-hidden shadow-2xl mb-20 flex flex-col md:flex-row text-white group">
          <div className="md:w-5/12 relative overflow-hidden">
            <motion.img 
              src={PODCASTS[0].image} 
              alt={PODCASTS[0].title} 
              className="w-full h-full object-cover min-h-[350px] opacity-90"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent md:bg-gradient-to-r" />
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-24 h-24 bg-brand-yellow text-brand-dark rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-500 ease-out shadow-xl backdrop-blur-sm">
                <Play className="w-10 h-10 ml-2 fill-brand-dark" />
              </button>
            </div>
          </div>
          <div className="md:w-7/12 p-8 md:p-12 flex flex-col justify-center relative z-10">
            <span className="bg-brand-yellow text-brand-dark text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm self-start mb-6 shadow-sm">À la une • {PODCASTS[0].category}</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6 leading-[1.1]">{PODCASTS[0].title}</h2>
            <p className="text-gray-400 mb-8 text-lg md:text-xl leading-relaxed">{PODCASTS[0].description}</p>
            <div className="flex items-center gap-8 text-sm font-bold tracking-wider text-gray-500 uppercase">
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /> {PODCASTS[0].date}</span>
              <span className="flex items-center gap-2 text-brand-yellow"><Clock className="w-4 h-4" /> {PODCASTS[0].duration}</span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Podcast List */}
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
            {PODCASTS.slice(1).map((podcast, index) => (
              <Reveal key={podcast.id} delay={0.1 * index}>
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-xl transition-all duration-500 p-6 flex flex-col group h-full">
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-6 bg-gray-100">
                    <img onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect fill='%23f3f4f6' width='800' height='600'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='30' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ESAMOU MEDIA%3C/text%3E%3C/svg%3E"; }} src={podcast.image} alt={podcast.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500 flex items-center justify-center">
                      <button className="w-16 h-16 bg-brand-yellow text-brand-dark rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-50 group-hover:scale-100 shadow-xl">
                        <Play className="w-6 h-6 ml-1 fill-brand-dark" />
                      </button>
                    </div>
                    <span className="absolute top-3 left-3 bg-brand-yellow text-brand-dark text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-sm shadow-md transform -translate-y-1 opacity-90 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      {podcast.category}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-serif font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-brand-yellow transition-colors duration-300">{podcast.title}</h3>
                  <p className="text-gray-500 mb-6 line-clamp-2 flex-1 leading-relaxed text-sm">{podcast.description}</p>
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider pt-5 border-t border-gray-100">
                    <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-300" /> {podcast.date}</span>
                    <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-300" /> {podcast.duration}</span>
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
      </div>
    </main>
  );
}
