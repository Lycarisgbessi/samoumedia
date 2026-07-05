import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Star, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useCategories } from '../../lib/hooks';
import { authFetch } from '../../lib/auth';

export default function AdminArticles() {
  const [articles, setArticles] = useState<any[]>([]);
  const { categories } = useCategories();
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<any>({});
  
  // Search and Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchArticles = async () => {
    let url = '/api/articles?';
    if (searchTerm) url += `q=${encodeURIComponent(searchTerm)}&`;
    
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    setArticles(data);
    setCurrentPage(1); // Reset to first page on search
  };

  useEffect(() => {
    // Debounce search slightly
    const delayDebounceFn = setTimeout(() => {
      fetchArticles();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentArticle.id) {
      await authFetch(`/api/articles/${currentArticle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentArticle)
      });
    } else {
      await authFetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentArticle)
      });
    }
    setIsEditing(false);
    fetchArticles();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer cet article ?')) {
      await authFetch(`/api/articles/${id}`, { method: 'DELETE' });
      fetchArticles();
    }
  };

  const handleToggleFeatured = async (article: any) => {
    await authFetch(`/api/articles/${article.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...article, isFeatured: !article.isFeatured })
    });
    fetchArticles();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await authFetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        setCurrentArticle({...currentArticle, imageUrl: data.url});
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert("Erreur lors du téléchargement de l'image");
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(articles.length / itemsPerPage);
  const paginatedArticles = articles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-serif font-black text-gray-900">Articles</h1>
        
        {!isEditing && (
          <div className="flex w-full md:w-auto gap-4">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-brand-red focus:border-brand-red"
              />
            </div>
            <button
              onClick={() => {
                setCurrentArticle({
                  title: '',
                  excerpt: '',
                  content: '',
                  categoryId: categories[0]?.id || '',
                  author: 'Rédaction',
                  readTime: '3 min',
                  isFeatured: false
                });
                setIsEditing(true);
              }}
              className="bg-brand-red text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 whitespace-nowrap"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Nouvel Article</span>
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{currentArticle.id ? 'Modifier' : 'Créer'} un article</h2>
            <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Titre</label>
                <input type="text" required value={currentArticle.title || ''} onChange={e => setCurrentArticle({...currentArticle, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Catégorie</label>
                <select value={currentArticle.categoryId || ''} onChange={e => setCurrentArticle({...currentArticle, categoryId: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required>
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Image</label>
                <div className="flex flex-col gap-2">
                  {currentArticle.imageUrl && (
                    <img src={currentArticle.imageUrl} alt="Aperçu" className="h-20 object-contain bg-gray-100 rounded" />
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="w-full px-4 py-2 border rounded-lg bg-white" 
                    required={!currentArticle.imageUrl}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Auteur</label>
                  <input type="text" required value={currentArticle.author || ''} onChange={e => setCurrentArticle({...currentArticle, author: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Temps de lecture</label>
                  <input type="text" value={currentArticle.readTime || ''} onChange={e => setCurrentArticle({...currentArticle, readTime: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="ex: 4 min" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Extrait (Résumé court)</label>
              <textarea required rows={2} value={currentArticle.excerpt || ''} onChange={e => setCurrentArticle({...currentArticle, excerpt: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div className="space-y-2 pb-12">
              <label className="text-sm font-bold text-gray-700">Contenu de l'article</label>
              <ReactQuill 
                theme="snow" 
                value={currentArticle.content || ''} 
                onChange={(val) => setCurrentArticle({...currentArticle, content: val})} 
                className="h-64 mb-12"
              />
            </div>
            <div className="flex items-center gap-2 pt-8">
              <input type="checkbox" id="featured" checked={currentArticle.isFeatured || false} onChange={e => setCurrentArticle({...currentArticle, isFeatured: e.target.checked})} className="rounded text-brand-red focus:ring-brand-red w-5 h-5" />
              <label htmlFor="featured" className="font-medium text-gray-700">Mettre à la Une (Carrousel principal)</label>
            </div>
            <div className="flex justify-end pt-4 border-t">
              <button type="submit" className="bg-brand-red text-white px-6 py-2 rounded-lg flex items-center gap-2">
                <Save size={20} />
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase">Article</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase">Catégorie</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={article.imageUrl} alt="" className="w-16 h-16 object-cover rounded-lg" />
                        <div>
                          <div className="font-bold text-gray-900 line-clamp-1">{article.title}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <span>{article.author}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-xs">
                              <Star size={12} className={article.isFeatured ? "fill-brand-red text-brand-red" : "text-gray-300"} />
                              {article.isFeatured ? "À la Une" : "Standard"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase tracking-wider">
                        {categories.find(c => c.id === article.categoryId)?.name || 'Inconnue'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(article.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleToggleFeatured(article)} className={`p-2 rounded-lg ${article.isFeatured ? 'text-brand-red bg-red-50' : 'text-gray-400 hover:bg-gray-100'}`} title={article.isFeatured ? "Retirer de la Une" : "Mettre à la Une"}>
                          <Star size={18} className={article.isFeatured ? "fill-brand-red" : ""} />
                        </button>
                        <button onClick={() => { setCurrentArticle(article); setIsEditing(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(article.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {articles.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      Aucun article trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, articles.length)} sur {articles.length} articles
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-1 items-center px-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium ${currentPage === i + 1 ? 'bg-brand-red text-white' : 'hover:bg-gray-100'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
