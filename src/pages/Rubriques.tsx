import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useCategories, useArticles } from '../lib/hooks';
import ArticleCard from '../components/ArticleCard';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Reveal } from '../components/Reveal';

export default function Rubriques() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { categories, loading: catLoading } = useCategories();
  const { articles, loading: artLoading } = useArticles();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Sync state with URL
  const selectedCategory = id || null;

  if (catLoading || artLoading) return <div className="min-h-screen p-20 flex justify-center items-center">
    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full" />
  </div>;

  const activeCategories = categories.filter(c => c.isActive);
  const activeCategoryName = selectedCategory 
    ? categories.find(c => c.id === selectedCategory)?.name || 'Rubrique inconnue'
    : 'Toutes les rubriques';

  const displayedArticles = selectedCategory
    ? articles.filter(a => a.categoryId === selectedCategory)
    : articles;

  const handleSelect = (catId: string | null) => {
    setIsDropdownOpen(false);
    if (catId) {
      navigate(`/rubriques/${catId}`);
    } else {
      navigate(`/rubriques`);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-16 min-h-[60vh]">
      <Reveal className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-2 border-gray-100 pb-8">
        <div>
          <motion.h1 
            key={activeCategoryName}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-5xl font-serif font-black tracking-tighter text-brand-dark mb-4 border-l-8 border-brand-red pl-4 uppercase"
          >
            {activeCategoryName}
          </motion.h1>
          <p className="text-gray-500 text-lg">Explorez l'actualité selon vos centres d'intérêt.</p>
        </div>
        
        {/* Animated Dropdown Menu */}
        <div className="relative z-30 w-full md:w-72">
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Sélectionnez une rubrique</label>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center justify-between w-full bg-white border-2 transition-colors duration-300 px-5 py-3.5 rounded-lg text-sm font-bold uppercase tracking-wider shadow-sm hover:shadow-md ${isDropdownOpen ? 'border-brand-red text-brand-red' : 'border-gray-200 hover:border-gray-300 text-gray-800'}`}
          >
            <span className="truncate">{activeCategoryName}</span>
            <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronDown size={18} />
            </motion.div>
          </button>
          
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={{ opacity: 0, y: -10, scaleY: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 shadow-2xl rounded-lg overflow-hidden flex flex-col origin-top max-h-[60vh] overflow-y-auto"
              >
                <button
                  onClick={() => handleSelect(null)}
                  className={`px-5 py-3.5 text-left text-sm font-semibold uppercase tracking-wider hover:bg-gray-50 transition-colors ${!selectedCategory ? 'text-brand-red bg-red-50/50' : 'text-gray-700'}`}
                >
                  Toutes les rubriques
                </button>
                {activeCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleSelect(cat.id)}
                    className={`px-5 py-3.5 text-left text-sm font-semibold uppercase tracking-wider hover:bg-gray-50 transition-colors border-t border-gray-100 ${selectedCategory === cat.id ? 'text-brand-red bg-red-50/50' : 'text-gray-700'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Reveal>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12"
      >
        <AnimatePresence mode="wait">
          {displayedArticles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.5), ease: [0.16, 1, 0.3, 1] }}
            >
              <ArticleCard article={article} categoryName={categories.find(c => c.id === article.categoryId)?.name} />
            </motion.div>
          ))}
          {displayedArticles.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="col-span-full text-center py-32 bg-gray-50 rounded-xl border border-gray-100 shadow-inner"
            >
              <p className="text-gray-500 text-xl font-medium">Aucun article publié dans cette rubrique pour le moment.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}
