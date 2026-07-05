import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { authFetch } from '../../lib/auth';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCat, setCurrentCat] = useState<any>(null);

  const fetchCategories = () => {
    authFetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (cat: any) => {
    setCurrentCat(cat);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer cette rubrique ?')) {
      await authFetch(`/api/categories/${id}`, { method: 'DELETE' });
      fetchCategories();
    }
  };

  const handleToggleActive = async (cat: any) => {
    await authFetch(`/api/categories/${cat.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !cat.isActive })
    });
    fetchCategories();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = currentCat.id && categories.find(c => c.id === currentCat.id) ? 'PUT' : 'POST';
    const url = method === 'PUT' ? `/api/categories/${currentCat.id}` : '/api/categories';
    
    await authFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentCat)
    });
    
    setIsEditing(false);
    setCurrentCat(null);
    fetchCategories();
  };

  if (loading) return <div>Chargement...</div>;

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-serif font-black mb-8">{currentCat.id ? 'Modifier la rubrique' : 'Nouvelle rubrique'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Nom de la rubrique</label>
            <input type="text" required value={currentCat.name || ''} onChange={e => setCurrentCat({...currentCat, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div className="flex gap-4 pt-6">
            <button type="submit" className="bg-brand-red text-white px-6 py-2 rounded-lg font-bold">Enregistrer</button>
            <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-bold">Annuler</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif font-black text-gray-900">Rubriques</h1>
        <button 
          onClick={() => { setCurrentCat({ name: '', isActive: true }); setIsEditing(true); }}
          className="flex items-center gap-2 bg-brand-red text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors"
        >
          <Plus size={18} />
          Nouvelle Rubrique
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{cat.name}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleToggleActive(cat)} className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full w-max ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {cat.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {cat.isActive ? 'Actif' : 'Inactif'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(cat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
