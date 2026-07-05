import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import Home from './pages/Home.tsx';
import Dashboard from './pages/Dashboard.tsx';
import CategoryView from './pages/CategoryView.tsx';
import ArticleView from './pages/ArticleView.tsx';
import About from './pages/About.tsx';
import Contact from './pages/Contact.tsx';
import Podcasts from './pages/Podcasts.tsx';
import Reportages from './pages/Reportages.tsx';
import Rubriques from './pages/Rubriques.tsx';

// Admin imports
import AdminLayout from './pages/admin/AdminLayout.tsx';
import AdminDashboard from './pages/admin/AdminDashboard.tsx';
import AdminSettings from './pages/admin/AdminSettings.tsx';
import AdminCategories from './pages/admin/AdminCategories.tsx';
import AdminArticles from './pages/admin/AdminArticles.tsx';
import AdminAds from './pages/admin/AdminAds.tsx';
import AdminLogin from './pages/admin/AdminLogin.tsx';
import AdminChroniques from './pages/admin/AdminChroniques.tsx';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Admin Login Route */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="articles" element={<AdminArticles />} />
          <Route path="chroniques" element={<AdminChroniques />} />
          <Route path="ads" element={<AdminAds />} />
        </Route>

        {/* Public App Routes */}
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="rubriques" element={<Rubriques />} />
          <Route path="rubriques/:id" element={<CategoryView />} />
          <Route path="article/:id" element={<ArticleView />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="podcasts" element={<Podcasts />} />
          <Route path="reportages" element={<Reportages />} />
          {/* Fallbacks for undefined routes in this prototype */}
          <Route path="*" element={<div className="p-20 text-center text-2xl font-serif">Page en construction</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
