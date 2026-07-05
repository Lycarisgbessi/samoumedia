import { useState } from 'react';
import { useCategories } from '../lib/hooks';
import { CheckCircle2, XCircle, LayoutDashboard, Settings, FileText, Plus } from 'lucide-react';

export default function Dashboard() {
  const { categories, setCategories, loading } = useCategories();
  const [activeTab, setActiveTab] = useState('categories');

  const toggleCategory = async (id: string, currentState: boolean) => {
    // Optimistic UI update
    setCategories(categories.map(c => c.id === id ? { ...c, isActive: !currentState } : c));
    
    // API Call
    await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !currentState }),
    });
  };

  if (loading) return <div className="p-10">Chargement du dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 min-h-[70vh]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-brand-dark text-white">
            <h2 className="font-bold uppercase tracking-wider flex items-center gap-2">
              <LayoutDashboard size={18} /> Administration
            </h2>
          </div>
          <nav className="flex flex-col py-2">
            <button 
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-3 text-left text-sm font-medium transition-colors flex items-center gap-3 ${activeTab === 'categories' ? 'bg-red-50 text-brand-red border-l-4 border-brand-red' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Settings size={18} /> Gestion des Rubriques
            </button>
            <button 
              onClick={() => setActiveTab('articles')}
              className={`px-4 py-3 text-left text-sm font-medium transition-colors flex items-center gap-3 ${activeTab === 'articles' ? 'bg-red-50 text-brand-red border-l-4 border-brand-red' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <FileText size={18} /> Tous les Articles
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {activeTab === 'categories' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-2xl font-serif font-bold text-gray-900">Gestion des Rubriques</h1>
              <p className="text-sm text-gray-500 mt-1">Activez ou désactivez les rubriques qui apparaîtront dans le menu de navigation.</p>
            </div>
            <div className="p-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
                    <th className="py-3 px-6 font-medium">Nom de la rubrique</th>
                    <th className="py-3 px-6 font-medium">Statut</th>
                    <th className="py-3 px-6 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-900">{cat.name}</td>
                      <td className="py-4 px-6">
                        {cat.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle2 size={14} /> Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            <XCircle size={14} /> Inactif
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => toggleCategory(cat.id, cat.isActive)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2 ${cat.isActive ? 'bg-brand-green' : 'bg-gray-200'}`}
                          role="switch"
                          aria-checked={cat.isActive}
                        >
                          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${cat.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'articles' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <FileText size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Gestion des articles</h2>
            <p className="text-gray-500 mb-6 max-w-md">L'interface complète de rédaction et de gestion des articles sera disponible ici.</p>
            <button className="bg-brand-red text-white px-6 py-2 rounded-md font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
              <Plus size={18} /> Nouvel Article
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
