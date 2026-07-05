import { useParams } from 'react-router-dom';
import { useArticles, useCategories } from '../lib/hooks';
import ArticleCard from '../components/ArticleCard';
import { Reveal } from '../components/Reveal';
import { motion } from 'motion/react';
import { AdSpace } from '../components/AdSpace';

export default function CategoryView() {
  const { id } = useParams<{ id: string }>();
  const { categories } = useCategories();
  const { articles, loading } = useArticles({ category: id });

  const category = categories.find(c => c.id === id);
  const categoryName = category?.name || id || 'Rubrique';

  if (loading) return <div className="min-h-screen p-10 flex justify-center text-brand-dark font-mono text-sm tracking-widest uppercase">Chargement...</div>;

  return (
    <main className="max-w-7xl mx-auto px-4 py-16 min-h-[60vh] overflow-hidden">
      <Reveal className="mb-16 border-b border-gray-100 pb-8">
        <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tighter text-brand-dark mb-4 flex items-center">
          <span className="w-8 h-1 bg-brand-red mr-4"></span>
          {categoryName.toUpperCase()}
        </h1>
        <p className="text-gray-500 text-lg md:text-xl font-medium">Retrouvez toute l'actualité de la rubrique {categoryName}.</p>
      </Reveal>

      <div className="mb-12">
        <AdSpace format="horizontal" className="rounded-xl" />
      </div>

      {articles.length === 0 ? (
        <Reveal delay={0.1}>
          <div className="text-center py-24 bg-gray-50/50 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-lg font-medium">Aucun article publié dans cette rubrique pour le moment.</p>
          </div>
        </Reveal>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {articles.map((article, index) => (
                <Reveal key={article.id} delay={0.1 * index}>
                  <ArticleCard article={article} categoryName={categoryName} />
                </Reveal>
              ))}
            </div>
          </div>
          
          <aside className="w-full lg:w-80 hidden lg:block flex-shrink-0">
            <div className="sticky top-32 space-y-6">
              <AdSpace format="square" className="rounded-xl" />
              <AdSpace format="vertical" className="rounded-xl h-[300px]" />
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
