import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Star, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useCategories } from '../../lib/hooks';
import { authFetch } from '../../lib/auth';
import { compressImage } from '../../utils/imageCompression';

export default function AdminArticles() {
  const [articles, setArticles] = useState<any[]>([]);
  const { categories } = useCategories();
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<any>({});
  
  // Search and Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewTrash, setViewTrash] = useState(false);
  const itemsPerPage = 10;

  const fetchArticles = async () => {
    let url = `/api/articles?status=all&trash=${viewTrash}&`;
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
  }, [searchTerm, viewTrash]);

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
    if (confirm(viewTrash ? 'Voulez-vous vraiment détruire cet article définitivement ?' : 'Mettre cet article à la corbeille ?')) {
      await authFetch(`/api/articles/${id}${viewTrash ? '/hard' : ''}`, { method: 'DELETE' });
      fetchArticles();
    }
  };
  
  const handleRestore = async (id: string) => {
    await authFetch(`/api/articles/${id}/restore`, { method: 'PUT' });
    fetchArticles();
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

    try {
      // Compresse l'image à 1200px max et qualité 80%
      const base64Image = await compressImage(file, 1200, 0.8);
      
      const res = await authFetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });
      const data = await res.json();
      if (data.url) {
        setCurrentArticle(prev => ({...prev, imageUrl: data.url}));
      } else {
        alert('Erreur: ' + data.error);
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert("Erreur lors du téléchargement de l'image (l'image est peut-être trop lourde ou mal formatée)");
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
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-serif font-black text-gray-900">Articles</h1>
          <button 
            onClick={() => setViewTrash(!viewTrash)}
            className={`px-3 py-1 text-sm font-bold rounded-lg border transition-colors ${viewTrash ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}`}
          >
            {viewTrash ? 'Voir Actifs' : 'Voir Corbeille'}
          </button>
        </div>
        
        {!isEditing && !viewTrash && (
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
                  videoUrl: '',
                  author: 'Rédaction',
                  readTime: '3 min',
                  isFeatured: false,
                  status: 'DRAFT',
                  tags: []
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
                    required={!currentArticle.imageUrl && !currentArticle.videoUrl}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Lien YouTube (Optionnel pour les reportages)</label>
                <input type="url" value={currentArticle.videoUrl || ''} onChange={e => setCurrentArticle({...currentArticle, videoUrl: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="ex: https://youtu.be/..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:col-span-2">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Auteur</label>
                  <input type="text" required value={currentArticle.author || ''} onChange={e => setCurrentArticle({...currentArticle, author: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Temps de lecture</label>
                  <input type="text" value={currentArticle.readTime || ''} onChange={e => setCurrentArticle({...currentArticle, readTime: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="ex: 4 min" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Statut</label>
                  <select value={currentArticle.status || 'DRAFT'} onChange={e => setCurrentArticle({...currentArticle, status: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required>
                    <option value="DRAFT">Brouillon</option>
                    <option value="PUBLISHED">Publié</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Tags (séparés par des virgules)</label>
                  <input type="text" value={(currentArticle.tags || []).join(', ')} onChange={e => setCurrentArticle({...currentArticle, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})} className="w-full px-4 py-2 border rounded-lg" placeholder="ex: Politique, Elections" />
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
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 hidden md:table-header-group">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Article</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Catégorie</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 block md:table-row-group">
            {paginatedArticles.map((article) => (
              <tr key={article.id} className="hover:bg-gray-50 transition-colors block md:table-row border-b md:border-b-0 p-4 md:p-0">
                <td className="md:px-6 md:py-4 block md:table-cell mb-4 md:mb-0">
                  <div className="flex items-center gap-4">
                    <img src={article.imageUrl} alt="" className="w-16 h-16 object-cover rounded-lg shrink-0" />
                    <div>
                      <div className="font-bold text-gray-900 line-clamp-2 md:line-clamp-1 flex items-center gap-2">
                        {article.status === 'DRAFT' ? (
                          <span className="w-2 h-2 rounded-full bg-orange-400" title="Brouillon"></span>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-green-500" title="Publié"></span>
                        )}
                        {article.title}
                      </div>
                      <div className="text-sm text-gray-500 flex flex-wrap items-center gap-2 mt-1">
                        <span>{article.author}</span>
                        <span className="hidden md:inline">•</span>
                        <span className="flex items-center gap-1 text-xs">
                          <Star size={12} className={article.isFeatured ? "fill-brand-red text-brand-red" : "text-gray-300"} />
                          {article.isFeatured ? "À la Une" : "Standard"}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="md:px-6 md:py-4 block md:table-cell mb-2 md:mb-0">
                  <div className="md:hidden text-xs text-gray-400 font-bold uppercase mb-1">Catégorie</div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase tracking-wider">
                    {categories.find(c => c.id === article.categoryId)?.name || 'Inconnue'}
                  </span>
                </td>
                <td className="md:px-6 md:py-4 text-sm text-gray-500 block md:table-cell mb-4 md:mb-0">
                  <div className="md:hidden text-xs text-gray-400 font-bold uppercase mb-1">Date</div>
                  {new Date(article.date).toLocaleDateString('fr-FR')}
                </td>
                <td className="md:px-6 md:py-4 block md:table-cell">
                  <div className="flex items-center justify-end gap-2 bg-gray-50 md:bg-transparent -mx-4 -mb-4 p-4 md:m-0 md:p-0 border-t md:border-none">
                    {!viewTrash ? (
                      <>
                        <button onClick={() => handleToggleFeatured(article)} className={`p-2 rounded-lg bg-white md:bg-transparent shadow-sm md:shadow-none ${article.isFeatured ? 'text-brand-red md:bg-red-50' : 'text-gray-400 hover:bg-gray-100'}`} title={article.isFeatured ? "Retirer de la Une" : "Mettre à la Une"}>
                          <Star size={18} className={article.isFeatured ? "fill-brand-red" : ""} />
                        </button>
                        <button onClick={() => { setCurrentArticle(article); setIsEditing(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg bg-white md:bg-transparent shadow-sm md:shadow-none" title="Modifier">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(article.id)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg bg-white md:bg-transparent shadow-sm md:shadow-none" title="Mettre à la corbeille">
                          <Trash2 size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleRestore(article.id)} className="px-3 py-1.5 text-xs font-bold text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors">
                          Restaurer
                        </button>
                        <button onClick={() => handleDelete(article.id)} className="px-3 py-1.5 text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors">
                          Détruire
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr className="block md:table-row">
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 block md:table-cell">
                  {viewTrash ? 'La corbeille est vide.' : 'Aucun article trouvé.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <span className="text-sm text-gray-500">
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, articles.length)} sur {articles.length} articles
              </span>
              <div className="flex gap-2 flex-wrap justify-center">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-1 items-center px-1 sm:px-2 flex-wrap justify-center">
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
