import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, X, Search, Save, Power, CheckCircle, XCircle } from 'lucide-react';
import { authFetch } from '../../lib/auth';
import { compressImage } from '../../utils/imageCompression';

const LOCATION_LABELS: Record<string, string> = {
  header: 'En-tête du site',
  home: "Page d'accueil",
  article: 'Dans les articles',
  sidebar: 'Colonne latérale',
  popup: 'Pop-up flottant',
  '': 'Sans préférence (tous les emplacements du même format)',
};

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

    try {
      const base64Image = await compressImage(file, 1200, 0.8);
      const res = await authFetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });
      const data = await res.json();
      if (data.url) {
        setCurrentAd(prev => ({...prev, imageUrl: data.url}));
      } else {
        alert('Erreur: ' + data.error);
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert("Erreur lors du téléchargement de l'image (l'image est peut-être trop lourde ou mal formatée)");
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
              <label className="text-sm font-bold text-gray-700">Emplacement (où l'afficher en priorité)</label>
              <select required value={currentAd.location || ''} onChange={e => setCurrentAd({...currentAd, location: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white">
                <option value="">Sans préférence (tous les emplacements du même format)</option>
                <option value="header">En-tête du site (bannière sous le logo)</option>
                <option value="home">Page d'accueil</option>
                <option value="article">Dans les articles</option>
                <option value="sidebar">Colonne latérale</option>
                <option value="popup">Pop-up flottant</option>
              </select>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-serif font-black text-gray-900">Espaces Publicitaires</h1>
        <button
          onClick={() => { setCurrentAd({ format: 'horizontal', location: 'header', isActive: true }); setIsEditing(true); }}
          className="flex items-center gap-2 bg-brand-red text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors"
        >
          <Plus size={18} />
          Nouvelle Publicité
        </button>
      </div>

      {/* Guide */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-sm text-blue-900 space-y-1">
        <p className="font-bold">Comment fonctionne la publicité sur le site ?</p>
        <p>• Chaque <strong>format</strong> correspond à une forme d'emplacement : <strong>Horizontal</strong> (bannières larges), <strong>Vertical</strong> (colonnes latérales), <strong>Carré</strong>, <strong>Dans l'article</strong>, <strong>Pop-up</strong> (fenêtre flottante après 12 s).</p>
        <p>• L'<strong>emplacement</strong> précise où la publicité apparaît en priorité. Une publicité <em>générale</em> (Sans préférence) peut apparaître dans tous les emplacements de son format.</p>
        <p>• Un emplacement affiche « Votre publicité ici » tant qu'<strong>aucune publicité active</strong> ne correspond à son format. Désactivez ou supprimez une publicité pour la retirer du site.</p>
      </div>

      {/* Liste en cartes (responsive, actions visibles sur mobile) */}
      <div className="grid grid-cols-1 gap-4">
        {ads.map((ad) => (
          <div key={ad.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="h-16 w-28 bg-gray-100 rounded-lg overflow-hidden shrink-0">
              {ad.imageUrl && (
                <img
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect fill='%23f3f4f6' width='800' height='600'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='30' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ESAMOU MEDIA%3C/text%3E%3C/svg%3E"; }}
                  src={ad.imageUrl}
                  alt={ad.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-900">{ad.name}</div>
              <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-3">
                <span className="capitalize">Format : {ad.format}</span>
                <span>•</span>
                <span>Emplacement : {LOCATION_LABELS[ad.location] || ad.location}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <button
                onClick={() => handleToggleActive(ad)}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border transition-colors ${ad.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
              >
                {ad.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                {ad.isActive ? 'Actif' : 'Inactif'}
              </button>
              <button
                onClick={() => handleEdit(ad)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors"
              >
                <Edit2 size={14} />
                Modifier
              </button>
              <button
                onClick={() => handleDelete(ad.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border border-red-200 text-red-700 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={14} />
                Supprimer
              </button>
            </div>
          </div>
        ))}
        {ads.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-500">
            Aucune publicité pour le moment. Cliquez sur « Nouvelle Publicité » pour créer la première — elle remplacera les emplacements « Votre publicité ici » du site.
          </div>
        )}
      </div>
    </div>
  );
}
