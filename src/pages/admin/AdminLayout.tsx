import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings, Layers, FileText, Image as ImageIcon, LogOut, Mic, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState, type MouseEvent } from 'react';
import { getToken, removeToken } from '../../lib/auth';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      navigate('/admin/login');
    }
  }, [navigate, location]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const links = [
    { name: 'Tableau de bord', path: '/admin', icon: LayoutDashboard },
    { name: 'Paramètres', path: '/admin/settings', icon: Settings },
    { name: 'Catégories', path: '/admin/categories', icon: Layers },
    { name: 'Articles', path: '/admin/articles', icon: FileText },
    { name: 'Chroniques', path: '/admin/chroniques', icon: Mic },
    { name: 'Publicités', path: '/admin/ads', icon: ImageIcon },
  ];

  const handleLogout = (e: MouseEvent) => {
    e.preventDefault();
    removeToken();
    navigate('/admin/login');
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-gray-800 flex justify-between items-center shrink-0">
        <div>
          <Link to="/" className="text-xl font-serif font-black tracking-widest uppercase">
            Samou<span className="text-brand-red">Média</span>
          </Link>
          <span className="block text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">Administration</span>
        </div>
        <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
          <X size={24} />
        </button>
      </div>
      
      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
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
      
      <div className="p-6 border-t border-gray-800 shrink-0">
        <button onClick={handleLogout} className="flex w-full items-center gap-3 text-gray-400 hover:text-white transition-colors duration-300 text-sm font-medium">
          <LogOut size={18} />
          Se déconnecter
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-brand-dark text-white p-4 flex justify-between items-center sticky top-0 z-40 shadow-md">
        <Link to="/" className="text-lg font-serif font-black tracking-widest uppercase">
          Samou<span className="text-brand-red">Média</span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -mr-2 text-gray-300 hover:text-white">
          <Menu size={28} />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-brand-dark text-white flex-col sticky top-0 h-screen shrink-0 overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-brand-dark text-white flex flex-col z-50 md:hidden shadow-2xl overflow-hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden relative min-h-screen">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8 lg:p-12">
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
