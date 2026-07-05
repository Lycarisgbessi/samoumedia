import { useState, useEffect } from 'react';
import { Users, FileText, Layers, Image as ImageIcon } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    articles: 0,
    categories: 0,
    ads: 0,
    views: 0
  });

  useEffect(() => {
    // In a real app, this would be a single /api/stats endpoint
    Promise.all([
      fetch('/api/articles').then(res => res.json()),
      fetch('/api/categories').then(res => res.json()),
      fetch('/api/ads').then(res => res.json())
    ]).then(([articles, categories, ads]) => {
      setStats({
        articles: articles.length,
        categories: categories.length,
        ads: ads.length,
        views: articles.reduce((acc: number, cur: any) => acc + (cur.views || 0), 0)
      });
    });
  }, []);

  const statCards = [
    { label: 'Articles', value: stats.articles, icon: FileText, color: 'bg-blue-500' },
    { label: 'Catégories', value: stats.categories, icon: Layers, color: 'bg-green-500' },
    { label: 'Espaces Publicitaires', value: stats.ads, icon: ImageIcon, color: 'bg-purple-500' },
    { label: 'Vues Totales', value: stats.views.toLocaleString(), icon: Users, color: 'bg-brand-red' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-serif font-black text-gray-900 mb-8">Tableau de bord</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg ${stat.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Bienvenue sur votre espace d'administration</h2>
        <p className="text-gray-600 leading-relaxed max-w-3xl">
          Depuis cet espace, vous pouvez gérer en temps réel tous les contenus de votre site : articles, rubriques, informations de contact et surtout vos espaces publicitaires. Les modifications sont appliquées instantanément.
        </p>
      </div>
    </div>
  );
}
