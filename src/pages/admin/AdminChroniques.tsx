import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { authFetch } from '../../lib/auth';

export default function AdminChroniques() {
  const [chroniques, setChroniques] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentChronique, setCurrentChronique] = useState<any>({});

  const fetchChroniques = async () => {
    const res = await fetch('/api/chroniques', { cache: 'no-store' });
    const data = await res.json();
    setChroniques(data);
  };

  useEffect(() => {
    fetchChroniques();
  }, []);

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
    if (confirm('Voulez-vous vraiment supprimer cette chronique ?')) {
      await authFetch(`/api/chroniques/${id}`, { method: 'DELETE' });
      fetchChroniques();
    }
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
        setCurrentChronique({...currentChronique, authorImage: data.url});
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert("Erreur lors du téléchargement de l'image");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-black text-gray-900">Gestion des Chroniques</h1>
        <button
          onClick={() => {
            setCurrentChronique({});
            setIsEditing(true);
          }}
          className="bg-brand-red text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700"
        >
          <Plus size={20} />
          Nouvelle Chronique
        </button>
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
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Contenu (Extrait / Texte)</label>
              <textarea required rows={4} value={currentChronique.excerpt || ''} onChange={e => setCurrentChronique({...currentChronique, excerpt: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            
            <div className="flex justify-end pt-4">
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
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase">Auteur</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase">Titre</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {chroniques.map((chronique) => (
                <tr key={chronique.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={chronique.authorImage} alt="" className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <div className="font-bold text-gray-900">{chronique.author}</div>
                        <div className="text-sm text-gray-500">{chronique.authorRole}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{chronique.title}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setCurrentChronique(chronique); setIsEditing(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(chronique.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {chroniques.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    Aucune chronique trouvée.
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
