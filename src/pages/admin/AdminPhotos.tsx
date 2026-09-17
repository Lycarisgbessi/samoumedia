import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { Plus, Edit2, Trash2, X, Save, ImagePlus, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import { authFetch } from '../../lib/auth';
import { compressImage } from '../../utils/imageCompression';
import { onImageError } from '../../lib/media';

export default function AdminPhotos() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const fetchPhotos = () => {
    fetch('/api/photos?all=true', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setPhotos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const base64Image = await compressImage(file, 1400, 0.85);
      const res = await authFetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });
      const data = await res.json();
      if (data.url) {
        setCurrentPhoto(prev => ({ ...prev, imageUrl: data.url }));
      } else {
        alert('Erreur: ' + data.error);
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert("Erreur lors du téléchargement de l'image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentPhoto.imageUrl) {
      alert('Veuillez d\'abord téléverser une image.');
      return;
    }
    const method = currentPhoto.id ? 'PUT' : 'POST';
    const url = currentPhoto.id ? `/api/photos/${currentPhoto.id}` : '/api/photos';

    await authFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentPhoto)
    });

    setIsEditing(false);
    setCurrentPhoto(null);
    fetchPhotos();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer définitivement cette photo de la galerie ?')) {
      await authFetch(`/api/photos/${id}`, { method: 'DELETE' });
      fetchPhotos();
    }
  };

  const handleToggleActive = async (photo: any) => {
    await authFetch(`/api/photos/${photo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !photo.isActive })
    });
    fetchPhotos();
  };

  const handleMove = async (photo: any, direction: -1 | 1) => {
    const sorted = [...photos].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex(p => p.id === photo.id);
    const swapWith = sorted[index + direction];
    if (!swapWith) return;
    // Échange les positions
    await authFetch(`/api/photos/${photo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: swapWith.order })
    });
    await authFetch(`/api/photos/${swapWith.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: photo.order })
    });
    fetchPhotos();
  };

  if (loading) return <div>Chargement...</div>;

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl md:text-2xl font-serif font-black">{currentPhoto.id ? 'Modifier la photo' : 'Ajouter une photo'}</h2>
          <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Image *</label>
            <div className="flex flex-col gap-3">
              {currentPhoto.imageUrl && (
                <img src={currentPhoto.imageUrl} onError={onImageError} alt="Aperçu" className="max-h-48 object-contain bg-gray-100 rounded-lg" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="w-full px-4 py-2 border rounded-lg bg-white"
              />
              {uploading && <p className="text-xs text-gray-500">Téléversement en cours...</p>}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Légende (optionnel)</label>
            <input
              type="text"
              value={currentPhoto.caption || ''}
              onChange={e => setCurrentPhoto({ ...currentPhoto, caption: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="ex: Cérémonie d'inauguration à Samou Benty"
            />
          </div>
          <div className="flex gap-4 pt-2">
            <button type="submit" className="bg-brand-red text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2">
              <Save size={18} /> Enregistrer
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-bold">Annuler</button>
          </div>
        </form>
      </div>
    );
  }

  const sortedPhotos = [...photos].sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <h1 className="text-3xl font-serif font-black text-gray-900">Galerie Photos</h1>
        <button
          onClick={() => { setCurrentPhoto({ caption: '', isActive: true }); setIsEditing(true); }}
          className="flex items-center gap-2 bg-brand-red text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors"
        >
          <Plus size={18} />
          Ajouter une photo
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-6">Ces photos s'affichent dans la section « Galerie Photos » de la page d'accueil (masquée si la galerie est vide ou tout désactivé).</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {sortedPhotos.map((photo, index) => (
          <div key={photo.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${!photo.isActive ? 'opacity-60' : ''}`}>
            <div className="relative aspect-[4/3] bg-gray-100">
              <img src={photo.imageUrl} onError={onImageError} alt={photo.caption || ''} className="w-full h-full object-cover" />
              {!photo.isActive && (
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-gray-800 text-white rounded text-[10px] font-bold uppercase">Masquée</span>
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-gray-900 line-clamp-1 mb-2">{photo.caption || <span className="text-gray-400 italic">Sans légende</span>}</p>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => handleMove(photo, -1)} disabled={index === 0} className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30" title="Monter">
                  <ArrowUp size={14} />
                </button>
                <button onClick={() => handleMove(photo, 1)} disabled={index === sortedPhotos.length - 1} className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30" title="Descendre">
                  <ArrowDown size={14} />
                </button>
                <button onClick={() => handleToggleActive(photo)} className="p-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50" title={photo.isActive ? 'Masquer du site' : 'Afficher sur le site'}>
                  {photo.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button onClick={() => { setCurrentPhoto(photo); setIsEditing(true); }} className="p-2 rounded-lg border border-gray-200 text-blue-600 hover:bg-blue-50" title="Modifier">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(photo.id)} className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50" title="Supprimer">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {sortedPhotos.length === 0 && (
          <div className="col-span-full bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-500">
            <ImagePlus size={36} className="mx-auto mb-3 text-gray-300" />
            Aucune photo pour le moment. Cliquez sur « Ajouter une photo » pour alimenter la galerie de la page d'accueil.
          </div>
        )}
      </div>
    </div>
  );
}
