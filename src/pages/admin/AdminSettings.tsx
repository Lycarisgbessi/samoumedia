import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { authFetch } from '../../lib/auth';

export default function AdminSettings() {
  const [config, setConfig] = useState<any>({
    name: '',
    slogan: '',
    address: '',
    phone: '',
    emails: [],
    socials: {}
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    authFetch('/api/config')
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setSaving(true);
    try {
      await authFetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      setMessage('Paramètres enregistrés avec succès !');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Erreur lors de l\'enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif font-black text-gray-900">Paramètres globaux</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Nom du site</label>
              <input 
                type="text" 
                value={config.name} 
                onChange={(e) => setConfig({...config, name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Slogan</label>
              <input 
                type="text" 
                value={config.slogan} 
                onChange={(e) => setConfig({...config, slogan: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Adresse</label>
              <input 
                type="text" 
                value={config.address} 
                onChange={(e) => setConfig({...config, address: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Téléphone</label>
              <input 
                type="text" 
                value={config.phone} 
                onChange={(e) => setConfig({...config, phone: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
              />
            </div>
            
            {/* Socials */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Facebook (URL)</label>
              <input 
                type="url" 
                value={config.socials?.facebook || ''} 
                onChange={(e) => setConfig({...config, socials: {...config.socials, facebook: e.target.value}})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Twitter/X (URL)</label>
              <input 
                type="url" 
                value={config.socials?.twitter || ''} 
                onChange={(e) => setConfig({...config, socials: {...config.socials, twitter: e.target.value}})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">YouTube (URL)</label>
              <input 
                type="url" 
                value={config.socials?.youtube || ''} 
                onChange={(e) => setConfig({...config, socials: {...config.socials, youtube: e.target.value}})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">WhatsApp (URL)</label>
              <input 
                type="url" 
                value={config.socials?.whatsapp || ''} 
                onChange={(e) => setConfig({...config, socials: {...config.socials, whatsapp: e.target.value}})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="flex items-center gap-2 bg-brand-red text-white px-8 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors duration-300 disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
