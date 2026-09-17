import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, X, Search, Save } from 'lucide-react';
import { authFetch } from '../../lib/auth';
import { compressImage } from '../../utils/imageCompression';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function AdminChroniques() {
  const [chroniques, setChroniques] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentChronique, setCurrentChronique] = useState<any>({});
  const [viewTrash, setViewTrash] = useState(false);

  const modules = {
    toolbar: [
      [{ 'header': [2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'blockquote'],
      ['clean']
    ]
  };

  const fetchChroniques = async () => {
    const res = await fetch(`/api/chroniques?status=all&trash=${viewTrash}`, { cache: 'no-store' });
    const data = await res.json();
    setChroniques(data);
  };

  useEffect(() => {
    fetchChroniques();
  }, [viewTrash]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentChronique.id) {
      await authFetch(`/api/chroniques/${currentChronique.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentChronique)
      });
    } else {
      await authFetch('/api/chroniques', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentChronique)
      });
    }
    setIsEditing(false);
    fetchChroniques();
  };

  const handleDelete = async (id: string) => {
    if (confirm(viewTrash ? 'Supprimer définitivement cette chronique ?' : 'Mettre cette chronique à la corbeille ?')) {
      await authFetch(`/api/chroniques/${id}${viewTrash ? '/hard' : ''}`, { method: 'DELETE' });
      fetchChroniques();
    }
  };
  
  const handleRestore = async (id: string) => {
    await authFetch(`/api/chroniques/${id}/restore`, { method: 'PUT' });
    fetchChroniques();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64Image = await compressImage(file, 1200, 0.8);
      const res = await authFetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });
      const data = await res.json();
      if (data.url) {
        setCurrentChronique(prev => ({...prev, authorImage: data.url}));
      } else {
        alert('Erreur: ' + data.error);
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert("Erreur lors du téléchargement de l'image (l'image est peut-être trop lourde ou mal formatée)");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-serif font-black text-gray-900">Chroniques</h1>
          <button 
            onClick={() => setViewTrash(!viewTrash)}
            className={`px-3 py-1 text-sm font-bold rounded-lg border transition-colors ${viewTrash ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}`}
          >
            {viewTrash ? 'Voir Actifs' : 'Voir Corbeille'}
          </button>
        </div>
        {!viewTrash && (
          <button
            onClick={() => {
              setCurrentChronique({
                status: 'PUBLISHED',
                tags: []
              });
              setIsEditing(true);
            }}
            className="bg-brand-red text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700"
          >
            <Plus size={20} />
            Nouvelle Chronique
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{currentChronique.id ? 'Modifier' : 'Ajouter'} une chronique</h2>
            <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Titre de la chronique</label>
                <input type="text" required value={currentChronique.title || ''} onChange={e => setCurrentChronique({...currentChronique, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Nom de l'auteur</label>
                <input type="text" required value={currentChronique.author || ''} onChange={e => setCurrentChronique({...currentChronique, author: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Rôle de l'auteur (ex: Éditorialiste)</label>
                <input type="text" required value={currentChronique.authorRole || ''} onChange={e => setCurrentChronique({...currentChronique, authorRole: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Photo de l'auteur</label>
                <div className="flex flex-col gap-2">
                  {currentChronique.authorImage && (
                    <img src={currentChronique.authorImage} alt="Auteur" className="h-20 w-20 object-cover rounded-full bg-gray-100" />
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="w-full px-4 py-2 border rounded-lg bg-white" 
                    required={!currentChronique.authorImage}
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Statut</label>
                <select value={currentChronique.status || 'DRAFT'} onChange={e => setCurrentChronique({...currentChronique, status: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required>
                  <option value="DRAFT">Brouillon</option>
                  <option value="PUBLISHED">Publié</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Tags (séparés par des virgules)</label>
                <input type="text" value={(currentChronique.tags || []).join(', ')} onChange={e => setCurrentChronique({...currentChronique, tags: e.target.value.split(',').map((t: string) => t.trim()).filter(Boolean)})} className="w-full px-4 py-2 border rounded-lg" placeholder="ex: Politique, Elections" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Extrait (Résumé)</label>
              <textarea required rows={3} value={currentChronique.excerpt || ''} onChange={e => setCurrentChronique({...currentChronique, excerpt: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Contenu de la chronique</label>
              <div className="bg-white rounded-lg">
                <ReactQuill 
                  theme="snow"
                  modules={modules}
                  value={currentChronique.content || ''} 
                  onChange={content => setCurrentChronique({...currentChronique, content})} 
                  className="h-64 mb-12"
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-8">
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
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Auteur</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Titre</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 block md:table-row-group">
            {chroniques.map((chronique) => (
              <tr key={chronique.id} className="hover:bg-gray-50 transition-colors block md:table-row border-b md:border-b-0 p-4 md:p-0">
                <td className="md:px-6 md:py-4 block md:table-cell mb-4 md:mb-0">
                  <div className="flex items-center gap-3">
                    <img src={chronique.authorImage} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                    <div>
                      <div className="font-bold text-gray-900">{chronique.author}</div>
                      <div className="text-sm text-gray-500">{chronique.authorRole}</div>
                    </div>
                  </div>
                </td>
                <td className="md:px-6 md:py-4 font-medium text-gray-900 block md:table-cell mb-4 md:mb-0">
                  <div className="md:hidden text-xs text-gray-400 font-bold uppercase mb-1">Titre</div>
                  {chronique.title}
                </td>
                <td className="md:px-6 md:py-4 block md:table-cell">
                  <div className="flex items-center justify-end gap-2 bg-gray-50 md:bg-transparent -mx-4 -mb-4 p-4 md:m-0 md:p-0 border-t md:border-none">
                    {!viewTrash ? (
                      <>
                        <button onClick={() => { setCurrentChronique(chronique); setIsEditing(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg bg-white md:bg-transparent shadow-sm md:shadow-none" title="Modifier">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(chronique.id)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg bg-white md:bg-transparent shadow-sm md:shadow-none" title="Mettre à la corbeille">
                          <Trash2 size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleRestore(chronique.id)} className="px-3 py-1.5 text-xs font-bold text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors">
                          Restaurer
                        </button>
                        <button onClick={() => handleDelete(chronique.id)} className="px-3 py-1.5 text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors">
                          Détruire
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {chroniques.length === 0 && (
              <tr className="block md:table-row">
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500 block md:table-cell">
                  {viewTrash ? 'La corbeille est vide.' : 'Aucune chronique trouvée.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}
