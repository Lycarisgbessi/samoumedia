import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import multer from 'multer';
import jwt from 'jsonwebtoken';

const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const JWT_SECRET = 'samou_media_super_secret_key_2026'; // À changer en prod via process.env

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// --- Default Data ---
const defaultCategories = [
  { id: 'national', name: 'National', isActive: true, order: 1 },
  { id: 'politique', name: 'Politique', isActive: true, order: 2 },
  { id: 'societe', name: 'Société', isActive: true, order: 3 },
  { id: 'economie', name: 'Économie', isActive: true, order: 4 },
  { id: 'justice', name: 'Justice', isActive: true, order: 5 },
  { id: 'mines', name: 'Mines', isActive: true, order: 6 },
  { id: 'culture', name: 'Culture', isActive: true, order: 7 },
  { id: 'sport', name: 'Sport', isActive: true, order: 8 },
  { id: 'education', name: 'Éducation', isActive: true, order: 9 },
  { id: 'sante', name: 'Santé', isActive: true, order: 10 },
  { id: 'environnement', name: 'Environnement', isActive: true, order: 11 },
  { id: 'samou-benty', name: 'Samou Benty', isActive: true, order: 12 },
  { id: 'forecariah', name: 'Forecariah', isActive: true, order: 13 },
  { id: 'international', name: 'International', isActive: true, order: 14 },
];

const defaultConfig = {
  name: "SAMOU MÉDIA",
  slogan: "Informer. Éclairer. Rassembler.",
  address: "Bonfi Niger, Matam",
  phone: "+224 625 80 87 66",
  emails: ["SAMOUMEDIA.@gmail.com", "Mohamedfof66@gmail.com"],
  socials: {
    facebook: "https://www.facebook.com/share/1DzmjJ8iAs/",
    twitter: "#",
    youtube: "#",
    whatsapp: "#"
  }
};

const defaultAds = [
  { id: '1', name: 'Header Ad', format: 'horizontal', location: 'home_top', isActive: true, imageUrl: 'https://picsum.photos/seed/ad_header/728/90', targetUrl: '#' }
];

const defaultChroniques = [
  {
    id: '1',
    title: 'La bonne gouvernance en question',
    author: 'Lansana Camara',
    authorRole: 'Éditorialiste',
    authorImage: 'https://picsum.photos/seed/a1/200/200',
    date: new Date().toISOString(),
    excerpt: 'L\'actualité récente nous pousse à nous interroger sur les pratiques de nos dirigeants...'
  }
];

// Helper functions for persistence
const loadData = (filename: string, defaultData: any) => {
  const filepath = path.join(DATA_DIR, filename);
  if (fs.existsSync(filepath)) {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  }
  fs.writeFileSync(filepath, JSON.stringify(defaultData, null, 2));
  return defaultData;
};

const saveData = (filename: string, data: any) => {
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
};

// Cleanup uploaded files
const deleteImageFile = (imageUrl: string) => {
  if (imageUrl && imageUrl.startsWith('/uploads/')) {
    const filename = imageUrl.replace('/uploads/', '');
    const filepath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filepath)) {
      try {
        fs.unlinkSync(filepath);
        console.log(`Fichier supprimé: ${filepath}`);
      } catch (err) {
        console.error(`Erreur lors de la suppression de ${filepath}:`, err);
      }
    }
  }
};

let categories = loadData('categories.json', defaultCategories);
let articles = loadData('articles.json', []);
let siteConfig = loadData('config.json', defaultConfig);
let adSpaces = loadData('ads.json', defaultAds);
let chroniques = loadData('chroniques.json', defaultChroniques);

// Generate some default articles if empty
if (articles.length === 0) {
  for (let i=1; i<=14; i++) {
    articles.push({
      id: i.toString(),
      title: `Article exemple ${i}`,
      excerpt: `Voici un extrait pour l'article ${i}.`,
      content: `Contenu complet de l'article ${i}.`,
      imageUrl: `https://picsum.photos/seed/samou${i}/800/600`,
      categoryId: defaultCategories[i % defaultCategories.length].id,
      author: 'Rédaction',
      date: new Date(Date.now() - i*86400000).toISOString(),
      readTime: '4 min',
      isFeatured: i <= 4,
      views: Math.floor(Math.random() * 2000)
    });
  }
  saveData('articles.json', articles);
}

// Config Multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Middleware Auth
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(401).json({ error: 'Accès refusé' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalide' });
    next();
  });
};

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // --- API Routes ---

  // Login
  app.post('/api/login', (req, res) => {
    const { password } = req.body;
    // Mot de passe administrateur basique (à changer en production)
    if (password === 'admin123') {
      const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ success: true, token });
    } else {
      res.status(401).json({ success: false, error: 'Mot de passe incorrect' });
    }
  });

  // Check Auth Status
  app.get('/api/verify', authenticateToken, (req, res) => {
    res.json({ success: true });
  });

  // Upload Route (Sécurisée)
  app.post('/api/upload', authenticateToken, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  });

  // Config (Lecture publique, Modification sécurisée)
  app.get('/api/config', (req, res) => res.json(siteConfig));
  
  app.put('/api/config', authenticateToken, (req, res) => {
    Object.assign(siteConfig, req.body);
    saveData('config.json', siteConfig);
    res.json({ success: true, siteConfig });
  });

  // Categories
  app.get('/api/categories', (req, res) => res.json(categories.sort((a, b) => a.order - b.order)));

  app.post('/api/categories', authenticateToken, (req, res) => {
    const newCategory = {
      ...req.body,
      id: req.body.id || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      order: categories.length + 1
    };
    categories.push(newCategory);
    saveData('categories.json', categories);
    res.json(newCategory);
  });

  app.put('/api/categories/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    categories = categories.map(c => c.id === id ? { ...c, ...req.body } : c);
    saveData('categories.json', categories);
    res.json({ success: true });
  });

  app.delete('/api/categories/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    categories = categories.filter(c => c.id !== id);
    saveData('categories.json', categories);
    res.json({ success: true });
  });

  // Chroniques
  app.get('/api/chroniques', (req, res) => res.json(chroniques));
  
  app.post('/api/chroniques', authenticateToken, (req, res) => {
    const newChronique = { ...req.body, id: Math.random().toString(36).substr(2, 9), date: new Date().toISOString() };
    chroniques.unshift(newChronique);
    saveData('chroniques.json', chroniques);
    res.json(newChronique);
  });

  app.put('/api/chroniques/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    chroniques = chroniques.map(c => c.id === id ? { ...c, ...req.body } : c);
    saveData('chroniques.json', chroniques);
    res.json({ success: true });
  });

  app.delete('/api/chroniques/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const chronique = chroniques.find(c => c.id === id);
    if (chronique) deleteImageFile(chronique.authorImage);
    chroniques = chroniques.filter(c => c.id !== id);
    saveData('chroniques.json', chroniques);
    res.json({ success: true });
  });

  // Ads API
  app.get('/api/ads', (req, res) => {
    const { format, location } = req.query;
    let result = [...adSpaces];
    if (format) result = result.filter(a => a.format === format);
    if (location) result = result.filter(a => a.location === location);
    res.json(result);
  });

  app.post('/api/ads', authenticateToken, (req, res) => {
    const newAd = { ...req.body, id: Math.random().toString(36).substr(2, 9) };
    adSpaces.push(newAd);
    saveData('ads.json', adSpaces);
    res.json(newAd);
  });

  app.put('/api/ads/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    adSpaces = adSpaces.map(a => a.id === id ? { ...a, ...req.body } : a);
    saveData('ads.json', adSpaces);
    res.json({ success: true });
  });

  app.delete('/api/ads/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const ad = adSpaces.find(a => a.id === id);
    if (ad) deleteImageFile(ad.imageUrl);
    adSpaces = adSpaces.filter(a => a.id !== id);
    saveData('ads.json', adSpaces);
    res.json({ success: true });
  });

  // Articles
  app.get('/api/articles', (req, res) => {
    const { category, featured, limit, sort, q } = req.query;
    let result = [...articles];

    // Recherche via q
    if (q) {
      const search = (q as string).toLowerCase();
      result = result.filter(a => a.title.toLowerCase().includes(search) || a.excerpt?.toLowerCase().includes(search));
    }

    if (category) result = result.filter(a => a.categoryId === category);
    if (featured === 'true') result = result.filter(a => a.isFeatured);
    if (sort === 'views') result.sort((a, b) => b.views - a.views);
    else result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (limit) result = result.slice(0, parseInt(limit as string, 10));

    res.json(result);
  });

  app.get('/api/articles/:id', (req, res) => {
    const article = articles.find(a => a.id === req.params.id);
    if (article) {
      article.views += 1;
      saveData('articles.json', articles);
      res.json(article);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  });

  app.post('/api/articles', authenticateToken, (req, res) => {
    const newArticle = {
      ...req.body,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      views: 0
    };
    articles.unshift(newArticle);
    saveData('articles.json', articles);
    res.json(newArticle);
  });

  app.put('/api/articles/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    articles = articles.map(a => a.id === id ? { ...a, ...req.body } : a);
    saveData('articles.json', articles);
    res.json({ success: true });
  });

  app.delete('/api/articles/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const article = articles.find(a => a.id === id);
    if (article) deleteImageFile(article.imageUrl);
    articles = articles.filter(a => a.id !== id);
    saveData('articles.json', articles);
    res.json({ success: true });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
