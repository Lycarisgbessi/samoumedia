import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { useArticles, useCategories } from '../lib/hooks';
import ArticleCard from '../components/ArticleCard';
import { Reveal } from '../components/Reveal';
import { AdSpace } from '../components/AdSpace';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(q);
  const { categories } = useCategories();
  const { articles, loading } = useArticles(q ? { q } : undefined);

  useEffect(() => {
    setInputValue(q);
  }, [q]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const value = inputValue.trim();
    if (value) setSearchParams({ q: value });
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-16 min-h-[60vh]">
      <Reveal className="mb-12 border-b-2 border-gray-100 pb-8">
        <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tighter text-brand-dark mb-6 uppercase flex items-center gap-4">
          <SearchIcon className="text-brand-red w-10 h-10" />
          Recherche
        </h1>
        <form onSubmit={handleSubmit} className="flex max-w-2xl">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Rechercher un article, un sujet, un mot-clé..."
            autoFocus
            className="flex-1 px-5 py-3.5 border-2 border-r-0 border-gray-200 rounded-l-lg focus:outline-none focus:border-brand-red text-sm font-medium"
          />
          <button type="submit" className="px-8 bg-brand-red text-white font-bold text-sm uppercase tracking-wider rounded-r-lg hover:bg-red-700 transition-colors">
            Chercher
          </button>
        </form>
        {q && !loading && (
          <p className="mt-4 text-gray-500 text-sm">
            {articles.length} résultat(s) pour « <span className="font-bold text-brand-dark">{q}</span> »
          </p>
        )}
      </Reveal>

      {loading ? (
        <div className="py-24 text-center text-gray-400 font-bold uppercase tracking-widest text-sm">Recherche en cours...</div>
      ) : !q ? (
        <div className="py-24 text-center text-gray-500 bg-gray-50/50 rounded-2xl border border-gray-100">
          Saisissez un mot-clé pour lancer une recherche.
        </div>
      ) : articles.length === 0 ? (
        <div className="py-24 text-center text-gray-500 bg-gray-50/50 rounded-2xl border border-gray-100">
          Aucun article ne correspond à « {q} ».
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {articles.map((article, index) => (
                <Reveal key={article.id} delay={0.05 * index}>
                  <ArticleCard
                    article={article}
                    categoryName={categories.find(c => c.id === article.categoryId)?.name}
                  />
                </Reveal>
              ))}
            </div>
          </div>
          <aside className="w-full lg:w-80 hidden lg:block flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <AdSpace format="square" className="rounded-xl" />
              <AdSpace format="vertical" className="rounded-xl h-[300px]" />
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
