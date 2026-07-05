import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const prisma = new PrismaClient();
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const JWT_SECRET = 'samou_media_super_secret_key_2026'; // À changer en prod via process.env

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Ensure directories exist
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Cleanup uploaded files
const deleteImageFile = async (imageUrl: string) => {
  if (!imageUrl) return;
  
  if (imageUrl.startsWith('http') && imageUrl.includes('cloudinary.com')) {
    const parts = imageUrl.split('/');
    const filename = parts[parts.length - 1];
    const folder = parts[parts.length - 2];
    const publicId = `${folder}/${filename.split('.')[0]}`;
    
    try {
      await cloudinary.uploader.destroy(publicId);
      console.log(`Fichier Cloudinary supprimé: ${publicId}`);
    } catch (err) {
      console.error(`Erreur lors de la suppression Cloudinary ${publicId}:`, err);
    }
  } else if (imageUrl.startsWith('/uploads/')) {
    const filename = imageUrl.replace('/uploads/', '');
    const filepath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filepath)) {
      try {
        fs.unlinkSync(filepath);
        console.log(`Fichier local supprimé: ${filepath}`);
      } catch (err) {
        console.error(`Erreur lors de la suppression de ${filepath}:`, err);
      }
    }
  }
};

// Config Multer pour l'upload d'images
let storage;
if (process.env.CLOUDINARY_CLOUD_NAME) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'samou-media',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
    } as any
  });
} else {
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });
}
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

const app = express();
app.use(express.json());

// --- API Routes ---

// Login
  app.post('/api/login', (req, res) => {
    const { password } = req.body;
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
    const url = process.env.CLOUDINARY_CLOUD_NAME ? req.file.path : `/uploads/${req.file.filename}`;
    res.json({ url });
  });

  // Config
  app.get('/api/config', async (req, res) => {
    const config = await prisma.siteConfig.findUnique({ where: { id: 1 } });
    res.json(config || {});
  });
  
  app.put('/api/config', authenticateToken, async (req, res) => {
    const config = await prisma.siteConfig.update({
      where: { id: 1 },
      data: req.body
    });
    res.json({ success: true, siteConfig: config });
  });

  // Categories
  app.get('/api/categories', async (req, res) => {
    const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } });
    res.json(categories);
  });

  app.post('/api/categories', authenticateToken, async (req, res) => {
    const id = req.body.id || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const count = await prisma.category.count();
    const newCategory = await prisma.category.create({
      data: {
        id,
        name: req.body.name,
        isActive: req.body.isActive ?? true,
        order: count + 1
      }
    });
    res.json(newCategory);
  });

  app.put('/api/categories/:id', authenticateToken, async (req, res) => {
    await prisma.category.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ success: true });
  });

  app.delete('/api/categories/:id', authenticateToken, async (req, res) => {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  });

  // Chroniques
  app.get('/api/chroniques', async (req, res) => {
    const chroniques = await prisma.chronique.findMany({ orderBy: { date: 'desc' } });
    res.json(chroniques);
  });
  
  app.post('/api/chroniques', authenticateToken, async (req, res) => {
    const newChronique = await prisma.chronique.create({
      data: {
        ...req.body,
        id: Math.random().toString(36).substr(2, 9),
        date: new Date()
      }
    });
    res.json(newChronique);
  });

  app.put('/api/chroniques/:id', authenticateToken, async (req, res) => {
    await prisma.chronique.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ success: true });
  });

  app.delete('/api/chroniques/:id', authenticateToken, async (req, res) => {
    const chronique = await prisma.chronique.findUnique({ where: { id: req.params.id } });
    if (chronique?.authorImage) deleteImageFile(chronique.authorImage);
    await prisma.chronique.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  });

  // Ads API
  app.get('/api/ads', async (req, res) => {
    const { format, location } = req.query;
    const where: any = {};
    if (format) where.format = format as string;
    if (location) where.location = location as string;
    
    const ads = await prisma.adSpace.findMany({ where });
    res.json(ads);
  });

  app.post('/api/ads', authenticateToken, async (req, res) => {
    const newAd = await prisma.adSpace.create({
      data: {
        ...req.body,
        id: Math.random().toString(36).substr(2, 9)
      }
    });
    res.json(newAd);
  });

  app.put('/api/ads/:id', authenticateToken, async (req, res) => {
    await prisma.adSpace.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ success: true });
  });

  app.delete('/api/ads/:id', authenticateToken, async (req, res) => {
    const ad = await prisma.adSpace.findUnique({ where: { id: req.params.id } });
    if (ad?.imageUrl) deleteImageFile(ad.imageUrl);
    await prisma.adSpace.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  });

  // Articles
  app.get('/api/articles', async (req, res) => {
    const { category, featured, limit, sort, q } = req.query;
    
    const where: any = {};
    if (category) where.categoryId = category as string;
    if (featured === 'true') where.isFeatured = true;
    
    if (q) {
      const search = (q as string);
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
      ];
    }

    const orderBy: any = sort === 'views' ? { views: 'desc' } : { date: 'desc' };
    
    const articles = await prisma.article.findMany({
      where,
      orderBy,
      take: limit ? parseInt(limit as string, 10) : undefined,
    });

    res.json(articles);
  });

  app.get('/api/articles/:id', async (req, res) => {
    const article = await prisma.article.findUnique({ where: { id: req.params.id } });
    if (article) {
      await prisma.article.update({
        where: { id: req.params.id },
        data: { views: { increment: 1 } }
      });
      article.views += 1;
      res.json(article);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  });

  app.post('/api/articles', authenticateToken, async (req, res) => {
    const newArticle = await prisma.article.create({
      data: {
        ...req.body,
        id: Math.random().toString(36).substr(2, 9),
        date: new Date(),
        views: 0
      }
    });
    res.json(newArticle);
  });

  app.put('/api/articles/:id', authenticateToken, async (req, res) => {
    await prisma.article.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ success: true });
  });

  app.delete('/api/articles/:id', authenticateToken, async (req, res) => {
    const article = await prisma.article.findUnique({ where: { id: req.params.id } });
    if (article?.imageUrl) deleteImageFile(article.imageUrl);
    await prisma.article.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  });

  // --- Vite Middleware (Local Only) ---
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    import('vite').then(({ createServer }) => {
      createServer({
        server: { middlewareMode: true },
        appType: 'spa',
      }).then(vite => {
        app.use(vite.middlewares);
      });
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }

export default app;
