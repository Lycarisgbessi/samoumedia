import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings, Layers, FileText, Image as ImageIcon, LogOut, Mic } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect } from 'react';
import { getToken, removeToken } from '../../lib/auth';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!getToken()) {
      navigate('/admin/login');
    }
  }, [navigate, location]);

  const links = [
    { name: 'Tableau de bord', path: '/admin', icon: LayoutDashboard },
    { name: 'Paramètres', path: '/admin/settings', icon: Settings },
    { name: 'Catégories', path: '/admin/categories', icon: Layers },
    { name: 'Articles', path: '/admin/articles', icon: FileText },
    { name: 'Chroniques', path: '/admin/chroniques', icon: Mic },
    { name: 'Publicités', path: '/admin/ads', icon: ImageIcon },
  ];

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    removeToken();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-brand-dark text-white flex flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-800">
          <Link to="/" className="text-xl font-serif font-black tracking-widest uppercase">
            Samou<span className="text-brand-red">Média</span>
          </Link>
          <span className="block text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">Administration</span>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-300 font-medium ${
                  isActive 
                    ? 'bg-brand-red text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                {link.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-6 border-t border-gray-800">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 text-gray-400 hover:text-white transition-colors duration-300 text-sm font-medium">
            <LogOut size={18} />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden relative">
        <div className="max-w-6xl mx-auto p-8 md:p-12">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
