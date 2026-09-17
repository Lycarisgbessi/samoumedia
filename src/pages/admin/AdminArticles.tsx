import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { Plus, Edit2, Trash2, X, Save, Star, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useCategories } from '../../lib/hooks';
import { authFetch } from '../../lib/auth';
import { compressImage } from '../../utils/imageCompression';
import { FALLBACK_IMAGE, onImageError } from '../../lib/media';

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

  const handleSave = async (e: FormEvent) => {
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

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
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
                  status: 'PUBLISHED',
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
        <div>
          {/* Liste en cartes : boutons d'action toujours visibles, y compris sur téléphone */}
          <div className="grid grid-cols-1 gap-4">
            {paginatedArticles.map((article) => (
              <div key={article.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-4">
                <img
                  src={article.imageUrl || (article.videoUrl ? `https://img.youtube.com/vi/${(article.videoUrl.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/) || [])[1] || ''}/hqdefault.jpg` : FALLBACK_IMAGE)}
                  onError={onImageError}
                  alt=""
                  className="w-full sm:w-24 h-24 object-cover rounded-lg shrink-0 bg-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {article.status === 'DRAFT' ? (
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded text-[10px] font-bold uppercase tracking-wider">Brouillon</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase tracking-wider">Publié</span>
                    )}
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-wider">
                      {categories.find(c => c.id === article.categoryId)?.name || 'Inconnue'}
                    </span>
                    {article.isFeatured && (
                      <span className="px-2 py-0.5 bg-red-100 text-brand-red rounded text-[10px] font-bold uppercase tracking-wider">À la Une</span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 leading-snug mb-1 line-clamp-2">{article.title}</h3>
                  <div className="text-xs text-gray-500 flex flex-wrap gap-x-3">
                    <span>{article.author}</span>
                    <span>•</span>
                    <span>{new Date(article.date).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                <div className="flex sm:flex-col gap-2 shrink-0 justify-end">
                  {!viewTrash ? (
                    <>
                      <button
                        onClick={() => handleToggleFeatured(article)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${article.isFeatured ? 'bg-red-50 text-brand-red border-red-200' : 'text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                        title={article.isFeatured ? 'Retirer de la Une' : 'Mettre à la Une'}
                      >
                        <Star size={14} className={article.isFeatured ? 'fill-brand-red' : ''} />
                        {article.isFeatured ? 'Retirer Une' : 'Mettre Une'}
                      </button>
                      <button
                        onClick={() => { setCurrentArticle(article); setIsEditing(true); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors"
                        title="Modifier"
                      >
                        <Edit2 size={14} />
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border border-orange-200 text-orange-600 hover:bg-orange-50 transition-colors"
                        title="Mettre à la corbeille"
                      >
                        <Trash2 size={14} />
                        Corbeille
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleRestore(article.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border border-green-200 text-green-700 hover:bg-green-50 transition-colors"
                      >
                        Restaurer
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border border-red-200 text-red-700 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                        Détruire
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {articles.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-500">
                {viewTrash ? 'La corbeille est vide.' : 'Aucun article trouvé.'}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-4 px-4 sm:px-6 py-4 bg-white rounded-xl border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
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
