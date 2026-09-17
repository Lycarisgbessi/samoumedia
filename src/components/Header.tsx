import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, Home } from 'lucide-react';
import { useArticles, useCategories, useConfig } from '../lib/hooks';
import { AdSpace } from './AdSpace';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, type FormEvent } from 'react';

export default function Header() {
  const { categories } = useCategories();
  const { config } = useConfig();
  const { articles } = useArticles({ limit: 6 });
  const activeCategories = categories.filter(c => c.isActive);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Recherche : navigation vers la page de résultats /recherche?q=...
  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) navigate(`/recherche?q=${encodeURIComponent(q)}`);
  };

  // Alimentation du FLASH INFO :
  // 1. message personnalisé défini dans l'admin (Réglages) s'il existe ;
  // 2. sinon, les titres des derniers articles publiés ;
  // 3. sinon, le slogan du site.
  const flashInfoText = (config?.flashInfo || '').trim() ||
    articles.map(a => a.title).filter(Boolean).join('  •  ') ||
    config?.slogan ||
    'Informer. Éclairer. Rassembler.';

  // Style commun des liens de navigation (le soulignement actif sera géré plus tard si besoin)
  const navLinkClass = "relative block py-3 px-3 text-[13px] font-bold uppercase whitespace-nowrap text-white hover:text-brand-yellow transition-colors";

  return (
    <header className="w-full bg-white flex flex-col z-50 relative">
      {/* Top Bar - Flash Info & Socials */}
      <div className="bg-brand-red text-white flex items-center px-4 py-1 text-sm overflow-hidden h-10">
        <div className="bg-white text-brand-red px-3 py-1 text-xs font-black mr-4 shrink-0 uppercase">
          FLASH INFO
        </div>
        <div className="flex-1 overflow-hidden relative h-5 flex items-center">
          <motion.div
            className="absolute whitespace-nowrap text-sm font-medium"
            animate={{ x: ['100%', '-100%'] }}
            transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
          >
            {flashInfoText}
          </motion.div>
        </div>
        <div className="hidden md:flex items-center gap-4 shrink-0 text-xs font-bold uppercase ml-4">
          <span>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <div className="flex gap-1 ml-4">
            <a href={config?.socials?.facebook} className="w-6 h-6 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-xs font-bold">f</a>
            <a href={config?.socials?.twitter} className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">X</a>
            <a href={config?.socials?.youtube} className="w-6 h-6 rounded-full bg-[#FF0000] text-white flex items-center justify-center text-xs font-bold">▶</a>
            <a href={config?.socials?.whatsapp} className="w-6 h-6 rounded-full bg-[#25D366] text-white flex items-center justify-center text-xs font-bold">W</a>
          </div>
        </div>
      </div>

      {/* Main Header - Logo, Ad, Search */}
      <div className="max-w-7xl mx-auto w-full px-4 py-4 flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <img src="/logo.jpg" alt="SAMOU MEDIA" className="w-16 h-16 object-contain mr-3" />
          <div className="flex flex-col justify-center">
            <div className="text-3xl sm:text-4xl font-sans font-black tracking-tighter leading-none text-brand-red">
              SAMOU MÉDIA
            </div>
            <span className="hidden sm:block text-xs font-medium text-gray-700 italic mt-1">
              La voix de Samou, le regard sur le monde
            </span>
          </div>
        </Link>

        {/* Bannière publicitaire gérée depuis l'admin (Publicités → format Horizontal, emplacement En-tête) */}
        <div className="hidden lg:flex flex-1 justify-center px-4">
          <AdSpace format="horizontal" location="header" />
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex relative w-64 shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Recherche..."
            aria-label="Rechercher un article"
            className="w-full pl-4 pr-10 py-2 border border-gray-300 bg-gray-50 focus:outline-none focus:border-brand-red text-sm"
          />
          <button type="submit" className="absolute right-0 top-0 h-full px-3 text-white bg-brand-red" title="Rechercher">
            <Search size={18} />
          </button>
        </form>
        
        {/* Mobile menu toggle */}
        <button 
          className="lg:hidden absolute right-4 top-16 p-2 text-gray-800" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu size={28} />
        </button>
      </div>

      {/* Navigation Bar */}
      <nav className="bg-brand-dark w-full">
        <div className="max-w-7xl mx-auto flex items-center relative h-12">
          {/* Home Icon (Red Square) */}
          <Link to="/" className="bg-brand-red h-full w-12 flex items-center justify-center shrink-0 hover:bg-red-700 transition-colors">
            <Home size={20} className="text-white" />
          </Link>

          <div className="hidden lg:flex items-center flex-1 overflow-x-auto overflow-y-hidden hide-scrollbar px-2">
            {activeCategories.map(cat => (
              <Link key={cat.id} to={`/rubriques/${cat.slug}`} className={navLinkClass}>
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Dropdown */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="absolute top-12 left-0 right-0 bg-brand-dark z-50 border-t border-gray-800 lg:hidden shadow-xl"
              >
                <div className="flex flex-col py-2">
                  {activeCategories.map(cat => (
                    <Link 
                      key={cat.id}
                      to={`/rubriques/${cat.slug}`} 
                      className="py-3 px-6 text-sm font-bold uppercase text-white hover:text-brand-yellow border-b border-gray-800"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </header>
  );
}
