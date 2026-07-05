import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { authFetch } from '../../lib/auth';

export default function AdminAds() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAd, setCurrentAd] = useState<any>(null);

  const fetchAds = () => {
    fetch('/api/ads', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setAds(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleEdit = (ad: any) => {
    setCurrentAd(ad);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer cet espace publicitaire ?')) {
      await authFetch(`/api/ads/${id}`, { method: 'DELETE' });
      fetchAds();
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
        setCurrentAd({...currentAd, imageUrl: data.url});
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert("Erreur lors du téléchargement de l'image");
    }
  };

  const handleToggleActive = async (ad: any) => {
    await authFetch(`/api/ads/${ad.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !ad.isActive })
    });
    fetchAds();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = currentAd.id ? 'PUT' : 'POST';
    const url = currentAd.id ? `/api/ads/${currentAd.id}` : '/api/ads';
    
    await authFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentAd)
    });
    
    setIsEditing(false);
    setCurrentAd(null);
    fetchAds();
  };

  if (loading) return <div>Chargement...</div>;

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-serif font-black mb-8">{currentAd.id ? 'Modifier l\'espace publicitaire' : 'Nouvel espace publicitaire'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Nom de l'espace</label>
              <input type="text" required value={currentAd.name || ''} onChange={e => setCurrentAd({...currentAd, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Format</label>
              <select required value={currentAd.format || 'horizontal'} onChange={e => setCurrentAd({...currentAd, format: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                <option value="horizontal">Horizontal (Bannière)</option>
                <option value="vertical">Vertical (Sidebar)</option>
                <option value="square">Carré</option>
                <option value="in-article">Dans l'article</option>
                <option value="popup">Pop-up</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Emplacement (ID)</label>
              <input type="text" required value={currentAd.location || ''} onChange={e => setCurrentAd({...currentAd, location: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="ex: home_top, article_middle..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Image</label>
              <div className="flex flex-col gap-2">
                {currentAd.imageUrl && (
                  <img src={currentAd.imageUrl} alt="Aperçu" className="h-20 object-contain bg-gray-100 rounded" />
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="w-full px-4 py-2 border rounded-lg bg-white" 
                  required={!currentAd.imageUrl}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Lien cible (URL)</label>
              <input type="url" required value={currentAd.targetUrl || ''} onChange={e => setCurrentAd({...currentAd, targetUrl: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
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
        <h1 className="text-3xl font-serif font-black text-gray-900">Espaces Publicitaires</h1>
        <button 
          onClick={() => { setCurrentAd({ format: 'horizontal', location: '', isActive: true }); setIsEditing(true); }}
          className="flex items-center gap-2 bg-brand-red text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors"
        >
          <Plus size={18} />
          Nouvel Espace
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Format</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Aperçu</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ads.map((ad) => (
              <tr key={ad.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {ad.name}
                  <span className="block text-xs text-gray-500 font-mono mt-1">{ad.location}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 capitalize">{ad.format}</td>
                <td className="px-6 py-4">
                  <div className="h-10 w-20 bg-gray-200 rounded overflow-hidden">
                    {ad.imageUrl && <img onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect fill='%23f3f4f6' width='800' height='600'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='30' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ESAMOU MEDIA%3C/text%3E%3C/svg%3E"; }} src={ad.imageUrl} alt="Ad" className="w-full h-full object-cover" />}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => handleToggleActive(ad)} className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${ad.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {ad.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {ad.isActive ? 'Actif' : 'Inactif'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(ad)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(ad.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
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
