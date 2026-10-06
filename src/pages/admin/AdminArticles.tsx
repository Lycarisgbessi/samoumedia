import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';
import { Plus, Edit2, Trash2, X, Save, Star, Search, ChevronLeft, ChevronRight, Link2 } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useCategories } from '../../lib/hooks';
import { authFetch } from '../../lib/auth';
import { compressImage } from '../../utils/imageCompression';
import { FALLBACK_IMAGE, getYouTubeId, onImageError } from '../../lib/media';
import { FONT_OPTIONS } from '../../lib/fonts';
import { useSeoAnalysis } from '../../lib/seo';

const DRAFT_KEY = 'samou_draft_article';

export default function AdminArticles() {
  const [articles, setArticles] = useState<any[]>([]);
  const { categories } = useCategories();

  const [isEditing, setIsEditing] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<any>({});

  // Brouillon de secours : sauvegardé automatiquement pendant la rédaction.
  // Si la session expire ou que le navigateur se recharge (fréquent sur téléphone),
  // le contenu est proposé à la restauration au retour.
  const [recoverableDraft, setRecoverableDraft] = useState<any>(null);
  const quillRef = useRef<any>(null);

  // Moteur SEO : analyse en temps réel pendant la rédaction
  const seo = useSeoAnalysis(
    currentArticle?.title || '',
    currentArticle?.excerpt || '',
    currentArticle?.content || '',
    currentArticle?.tags || [],
    isEditing
  );

  // Search and Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewTrash, setViewTrash] = useState(false);
  const itemsPerPage = 10;

  // À l'ouverture : propose un éventuel brouillon non enregistré
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft && (draft.title || draft.content?.replace(/<[^>]*>/g, ''))) {
          setRecoverableDraft(draft);
        }
      }
    } catch { /* brouillon illisible, on ignore */ }
  }, []);

  // Sauvegarde automatique du brouillon pendant la rédaction
  useEffect(() => {
    if (isEditing && currentArticle?.title) {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(currentArticle)); } catch { }
    }
  }, [currentArticle, isEditing]);

  // Insertion d'IMAGE dans le corps de l'article (upload → Cloudinary → insertion)
  const handleEditorImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const base64Image = await compressImage(file, 1400, 0.85);
        const res = await authFetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image })
        });
        const data = await res.json();
        if (data.url && quillRef.current) {
          const editor = quillRef.current.getEditor();
          const range = editor.getSelection(true);
          editor.insertEmbed(range?.index ?? editor.getLength(), 'image', data.url);
        } else {
          alert('Erreur lors de l\'insertion de l\'image : ' + (data.error || 'réponse inattendue'));
        }
      } catch {
        alert("Erreur lors du téléversement de l'image. Votre texte reste intact : réessayez.");
      }
    };
    input.click();
  };

  // Insertion de VIDÉO YouTube dans le corps de l'article
  const handleEditorVideo = () => {
    const url = prompt('Collez le lien de la vidéo YouTube :\n(ex: https://www.youtube.com/watch?v=...)');
    if (!url) return;
    const videoId = getYouTubeId(url.trim());
    if (!videoId) {
      alert('Lien YouTube non reconnu. Vérifiez le lien (youtube.com ou youtu.be).');
      return;
    }
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection(true);
      editor.insertEmbed(range?.index ?? editor.getLength(), 'video', `https://www.youtube.com/embed/${videoId}`);
    }
  };

  // Toolbar de l'éditeur : mise en forme + LIENS + IMAGES + VIDÉOS
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['link', 'blockquote'],
        ['image', 'video'],
        ['clean']
      ],
      handlers: {
        image: handleEditorImage,
        video: handleEditorVideo
      }
    }
  };

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
    // Article enregistré : le brouillon de secours n'est plus utile
    try { localStorage.removeItem(DRAFT_KEY); } catch { }
    setRecoverableDraft(null);
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

      {/* Brouillon non enregistré retrouvé (session expirée, page rechargée...) */}
      {recoverableDraft && !isEditing && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-sm text-amber-800 flex-1">
            <strong>Brouillon retrouvé</strong> — « {String(recoverableDraft.title || 'Sans titre').substring(0, 60)} » n'a pas été enregistré. Voulez-vous le récupérer ?
          </p>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => {
                setCurrentArticle({ status: 'PUBLISHED', tags: [], ...recoverableDraft });
                setRecoverableDraft(null);
                setIsEditing(true);
              }}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-amber-700"
            >
              Récupérer le brouillon
            </button>
            <button
              onClick={() => {
                try { localStorage.removeItem(DRAFT_KEY); } catch { }
                setRecoverableDraft(null);
              }}
              className="bg-white border border-amber-300 text-amber-800 px-4 py-2 rounded-lg text-xs font-bold hover:bg-amber-100"
            >
              Supprimer
            </button>
          </div>
        </div>
      )}

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
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase shrink-0">Police du titre</label>
                <select
                  value={currentArticle.titleFont || ''}
                  onChange={e => setCurrentArticle({ ...currentArticle, titleFont: e.target.value || null })}
                  className="flex-1 px-3 py-1.5 border rounded-lg text-sm bg-white"
                  style={{ fontFamily: currentArticle.titleFont || undefined }}
                >
                  {FONT_OPTIONS.map(f => <option key={f.label} value={f.value}>{f.label}</option>)}
                </select>
              </div>
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
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase shrink-0">Police de l'extrait</label>
                <select
                  value={currentArticle.excerptFont || ''}
                  onChange={e => setCurrentArticle({ ...currentArticle, excerptFont: e.target.value || null })}
                  className="flex-1 px-3 py-1.5 border rounded-lg text-sm bg-white"
                  style={{ fontFamily: currentArticle.excerptFont || undefined }}
                >
                  {FONT_OPTIONS.map(f => <option key={f.label} value={f.value}>{f.label}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2 pb-12">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="text-sm font-bold text-gray-700">Contenu de l'article</label>
                <div className="flex items-center gap-2 sm:ml-auto">
                  <label className="text-xs font-bold text-gray-500 uppercase shrink-0">Police du contenu</label>
                  <select
                    value={currentArticle.contentFont || ''}
                    onChange={e => setCurrentArticle({ ...currentArticle, contentFont: e.target.value || null })}
                    className="px-3 py-1.5 border rounded-lg text-xs bg-white"
                    style={{ fontFamily: currentArticle.contentFont || undefined }}
                  >
                    {FONT_OPTIONS.map(f => <option key={f.label} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 flex items-center gap-1">
                <Link2 size={12} /> Pour insérer un lien : sélectionnez du texte puis cliquez sur l'icône chaîne 🔗 de la barre. Images 🖼 et vidéos YouTube ▶ intégrables à tout endroit du texte.
              </p>
              <ReactQuill
                {...{ ref: quillRef } as any}
                theme="snow"
                modules={modules}
                value={currentArticle.content || ''}
                onChange={(val) => setCurrentArticle({...currentArticle, content: val})}
                className="mb-12"
              />
            </div>
            <div className="flex items-center gap-2 pt-8">
              <input type="checkbox" id="featured" checked={currentArticle.isFeatured || false} onChange={e => setCurrentArticle({...currentArticle, isFeatured: e.target.checked})} className="rounded text-brand-red focus:ring-brand-red w-5 h-5" />
              <label htmlFor="featured" className="font-medium text-gray-700">Mettre à la Une (Carrousel principal)</label>
            </div>

            {/* ── Moteur SEO : analyse en temps réel ── */}
            {seo && (
              <div className="bg-gradient-to-br from-gray-50 to-blue-50/40 border border-gray-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-gray-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                    Assistant SEO — sera-t-il lu ?
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black tabular-nums" style={{ color: seo.score >= 75 ? '#16a34a' : seo.score >= 50 ? '#d97706' : '#dc2626' }}>{seo.score}</span>
                    <span className="text-xs text-gray-400 font-bold">/100</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mb-4">
                  {seo.checks.map(c => (
                    <div key={c.label} className={`flex items-start gap-2 text-xs ${c.ok ? 'text-green-700' : 'text-gray-600'}`} title={c.advice}>
                      <span className={`shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white mt-0.5 ${c.ok ? 'bg-green-500' : 'bg-gray-300'}`}>{c.ok ? '✓' : '!'}</span>
                      <span className="font-bold">{c.label}{!c.ok && <span className="block font-medium text-gray-400">{c.advice}</span>}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div>
                    <p className="text-xs font-black text-gray-700 uppercase tracking-wide mb-2">Mots-clés de votre article (à mettre en avant)</p>
                    <div className="flex flex-wrap gap-1.5">
                      {seo.keywords.map(k => (
                        <button
                          type="button"
                          key={k.word}
                          onClick={() => {
                            const title = currentArticle.title || '';
                            if (!title.toLowerCase().includes(k.word)) {
                              setCurrentArticle(prev => ({ ...prev, title: `${title} ${k.word.charAt(0).toUpperCase() + k.word.slice(1)}`.trim() }));
                            }
                          }}
                          title={k.inTitle ? 'Déjà dans le titre ✓ — cliquez pour l\'ajouter aux tags' : 'Cliquez pour ajouter au titre'}
                          className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${k.inTitle ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-gray-700 border-gray-200 hover:border-brand-red hover:text-brand-red'}`}
                        >
                          {k.word} <span className="opacity-50">×{k.count}</span>
                        </button>
                      ))}
                      {seo.keywords.length === 0 && <span className="text-xs text-gray-400 italic">Écrivez le contenu pour voir apparaître vos mots-clés.</span>}
                    </div>
                  </div>
                  {seo.powerWordsFound.length > 0 && (
                    <p className="text-xs text-gray-600">
                      <span className="font-black text-gray-700">Mots accrocheurs détectés :</span> {seo.powerWordsFound.slice(0, 8).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            )}

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
