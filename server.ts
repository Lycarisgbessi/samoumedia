import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

const prisma = new PrismaClient();
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const IS_SERVERLESS = !!process.env.VERCEL;

// JWT_SECRET : obligatoire en production pour éviter qu'une clé par défaut connue
// de tous permette de forger des tokens admin.
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET doit être défini en production (ex: chaîne aléatoire de 48+ caractères).');
}
const JWT_SECRET = process.env.JWT_SECRET || 'samou_media_dev_only_secret_key';
if (!process.env.JWT_SECRET) {
  console.warn('ATTENTION : JWT_SECRET non défini, utilisation d\'une clé de développement. Ne jamais déployer ainsi.');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// En serverless (Vercel), le système de fichiers est en lecture seule :
// toute tentative de mkdir/écriture au démarrage fait planter la fonction
// (FUNCTION_INVOCATION_FAILED). On ne crée le dossier qu'en local.
if (!IS_SERVERLESS && !fs.existsSync(UPLOADS_DIR)) {
  try { fs.mkdirSync(UPLOADS_DIR, { recursive: true }); } catch (err) { }
}

const deleteImageFile = async (imageUrl: string) => {
  if (!imageUrl) return;
  if (imageUrl.startsWith('http') && imageUrl.includes('cloudinary.com')) {
    const parts = imageUrl.split('/');
    const publicId = `${parts[parts.length - 2]}/${parts[parts.length - 1].split('.')[0]}`;
    try { await cloudinary.uploader.destroy(publicId); } catch (err) { }
  } else if (imageUrl.startsWith('/uploads/')) {
    const filepath = path.join(UPLOADS_DIR, imageUrl.replace('/uploads/', ''));
    if (fs.existsSync(filepath)) {
      try { fs.unlinkSync(filepath); } catch (err) { }
    }
  }
};

let storage;
if (process.env.CLOUDINARY_CLOUD_NAME) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: { folder: 'samou-media', allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'] } as any
  });
} else if (!IS_SERVERLESS) {
  // Stockage disque possible uniquement en local (Vercel = lecture seule).
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });
}

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Format non supporté : Seules les images sont autorisées.'));
};
const upload = multer({ storage, fileFilter });

const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Accès refusé' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalide' });
    next();
  });
};

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Trop de tentatives, réessayez plus tard.' }
});

const asyncHandler = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const generateSlug = (text: string) => {
  return text.toString()
    .normalize('NFD')                      // décompose les accents (É -> E + ́)
    .replace(/[\u0300-\u036f]/g, '')       // supprime les diacritiques
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '') + '-' + Math.random().toString(36).slice(2, 7);
};

// Validation Schemas
const articleSchema = z.object({
  title: z.string().min(1),
  excerpt: z.string().optional().nullable(),
  content: z.string(),
  imageUrl: z.string().optional().nullable(),
  videoUrl: z.string().optional().nullable(),
  categoryId: z.string(),
  author: z.string(), 
  readTime: z.string().optional().nullable(),
  isFeatured: z.boolean().optional().default(false),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional().default('PUBLISHED'),
  tags: z.array(z.string()).optional().default([])
});

const categorySchema = z.object({
  name: z.string().min(1),
  isActive: z.boolean().optional().default(true)
});

const adSpaceSchema = z.object({
  name: z.string().min(1),
  format: z.string(),
  location: z.string(),
  isActive: z.boolean().optional().default(true),
  imageUrl: z.string().optional().nullable(),
  targetUrl: z.string().optional().nullable()
});

const chroniqueSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  authorRole: z.string().optional().nullable(),
  authorImage: z.string().optional().nullable(),
  excerpt: z.string().optional().nullable(),
  content: z.string().optional().default(''),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional().default('PUBLISHED'),
  tags: z.array(z.string()).optional().default([])
});

const siteConfigSchema = z.object({
  name: z.string().min(1),
  slogan: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  emails: z.array(z.string()).optional(),
  socials: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
  flashInfo: z.string().optional().nullable()
});

// Routes
app.post('/api/login', loginLimiter, asyncHandler(async (req: any, res: any) => {
  const { username = 'admin', password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });
  if (user && await bcrypt.compare(password, user.passwordHash)) {
    const token = jwt.sign({ role: 'admin', id: user.id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, error: 'Identifiants incorrects' });
  }
}));

app.get('/api/verify', authenticateToken, (req, res) => res.json({ success: true }));

app.post('/api/upload', authenticateToken, asyncHandler(async (req: any, res: any) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'No image provided' });

    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      const result = await cloudinary.uploader.upload(image, {
        folder: 'samou-media',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
      });
      return res.json({ url: result.secure_url });
    }

    // Sans Cloudinary configuré : stockage disque possible uniquement en local.
    if (IS_SERVERLESS) {
      console.error('Upload refusé : CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET manquants côté serveur.');
      return res.status(500).json({
        error: 'Service d\'images non configuré : vérifiez les variables CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET.'
      });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const filename = Date.now() + '-upload.jpg';
    fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
    return res.json({ url: `/uploads/${filename}` });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed', details: error });
  }
}));

// Config
app.get('/api/config', asyncHandler(async (req: any, res: any) => {
  const config = await prisma.siteConfig.findUnique({ where: { id: 1 } });
  res.json(config || {});
}));
app.put('/api/config', authenticateToken, asyncHandler(async (req: any, res: any) => {
  // Validation stricte : empêche d'écrire des champs arbitraires en base.
  const validData = siteConfigSchema.partial().parse(req.body);
  const config = await prisma.siteConfig.upsert({ 
    where: { id: 1 }, 
    update: validData,
    create: { id: 1, name: validData.name || 'SAMOU MEDIA', ...validData }
  });
  res.json({ success: true, siteConfig: config });
}));

// Categories
app.get('/api/categories', asyncHandler(async (req: any, res: any) => {
  res.json(await prisma.category.findMany({ orderBy: { order: 'asc' } }));
}));
app.post('/api/categories', authenticateToken, asyncHandler(async (req: any, res: any) => {
  const validData = categorySchema.parse(req.body);
  const count = await prisma.category.count();
  const slug = generateSlug(validData.name);
  const newCategory = await prisma.category.create({
    data: { ...validData, slug, order: count + 1 }
  });
  res.json(newCategory);
}));
app.put('/api/categories/:id', authenticateToken, asyncHandler(async (req: any, res: any) => {
  const validData = categorySchema.partial().parse(req.body);
  let slug = undefined;
  if (validData.name) slug = generateSlug(validData.name);
  await prisma.category.update({ where: { id: req.params.id }, data: { ...validData, slug } });
  res.json({ success: true });
}));
app.delete('/api/categories/:id', authenticateToken, asyncHandler(async (req: any, res: any) => {
  const count = await prisma.article.count({ where: { categoryId: req.params.id } });
  if (count > 0) {
    return res.status(400).json({ error: `Impossible de supprimer : cette catégorie contient ${count} article(s).` });
  }
  await prisma.category.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));

// Chroniques
app.get('/api/chroniques', asyncHandler(async (req: any, res: any) => {
  const { status, trash } = req.query;
  const where: any = { isDeleted: trash === 'true' };
  
  if (status && status !== 'all') {
    where.status = status;
  } else if (!status) {
    where.status = 'PUBLISHED';
  }
  
  res.json(await prisma.chronique.findMany({ where, orderBy: { date: 'desc' } }));
}));
app.get('/api/chroniques/slug/:slug', asyncHandler(async (req: any, res: any) => {
  const chronique = await prisma.chronique.findUnique({ where: { slug: req.params.slug } });
  if (chronique && !chronique.isDeleted && chronique.status === 'PUBLISHED') {
    await prisma.chronique.update({ where: { id: chronique.id }, data: { views: { increment: 1 } } });
    chronique.views += 1;
    res.json(chronique);
  } else res.status(404).json({ error: 'Not found' });
}));
app.post('/api/chroniques', authenticateToken, asyncHandler(async (req: any, res: any) => {
  const validData = chroniqueSchema.parse(req.body);
  const slug = generateSlug(validData.title);
  const newChronique = await prisma.chronique.create({ data: { ...validData, slug, date: new Date() } });
  res.json(newChronique);
}));
app.put('/api/chroniques/:id', authenticateToken, asyncHandler(async (req: any, res: any) => {
  const validData = chroniqueSchema.partial().parse(req.body);
  // Le slug n'est régénéré que si le titre a réellement changé,
  // pour ne pas casser les liens déjà partagés à chaque sauvegarde.
  let slug = undefined;
  if (validData.title) {
    const current = await prisma.chronique.findUnique({ where: { id: req.params.id }, select: { title: true } });
    if (current && current.title !== validData.title) slug = generateSlug(validData.title);
  }
  await prisma.chronique.update({ where: { id: req.params.id }, data: { ...validData, slug } });
  res.json({ success: true });
}));
app.delete('/api/chroniques/:id', authenticateToken, asyncHandler(async (req: any, res: any) => {
  // Soft Delete
  await prisma.chronique.update({ where: { id: req.params.id }, data: { isDeleted: true } });
  res.json({ success: true });
}));
app.delete('/api/chroniques/:id/hard', authenticateToken, asyncHandler(async (req: any, res: any) => {
  // Hard Delete
  const chronique = await prisma.chronique.findUnique({ where: { id: req.params.id } });
  if (chronique?.authorImage) await deleteImageFile(chronique.authorImage);
  await prisma.chronique.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));
app.put('/api/chroniques/:id/restore', authenticateToken, asyncHandler(async (req: any, res: any) => {
  await prisma.chronique.update({ where: { id: req.params.id }, data: { isDeleted: false } });
  res.json({ success: true });
}));

// Ads API
app.get('/api/ads', asyncHandler(async (req: any, res: any) => {
  const { format, location } = req.query;
  const where: any = {};
  if (format) where.format = format as string;
  if (location) where.location = location as string;
  res.json(await prisma.adSpace.findMany({ where }));
}));
app.post('/api/ads', authenticateToken, asyncHandler(async (req: any, res: any) => {
  const validData = adSpaceSchema.parse(req.body);
  res.json(await prisma.adSpace.create({ data: validData }));
}));
app.put('/api/ads/:id', authenticateToken, asyncHandler(async (req: any, res: any) => {
  const validData = adSpaceSchema.partial().parse(req.body);
  await prisma.adSpace.update({ where: { id: req.params.id }, data: validData });
  res.json({ success: true });
}));
app.delete('/api/ads/:id', authenticateToken, asyncHandler(async (req: any, res: any) => {
  const ad = await prisma.adSpace.findUnique({ where: { id: req.params.id } });
  if (ad?.imageUrl) await deleteImageFile(ad.imageUrl);
  await prisma.adSpace.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));

// Articles
app.get('/api/articles', asyncHandler(async (req: any, res: any) => {
  const { category, featured, limit, sort, q, status, tag, trash } = req.query;
  const where: any = { isDeleted: trash === 'true' };
  
  // Filtering by status
  if (status && status !== 'all') {
    where.status = status;
  } else if (!status) {
    where.status = 'PUBLISHED';
  }

  // Filtering by tag
  if (tag) {
    where.tags = { has: tag as string };
  }

  if (category) where.categoryId = category as string;
  if (featured === 'true') where.isFeatured = true;
  if (q) {
    const search = q as string;
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } }
    ];
  }
  const orderBy: any = sort === 'views' ? { views: 'desc' } : { date: 'desc' };
  res.json(await prisma.article.findMany({ where, orderBy, take: limit ? parseInt(limit as string, 10) : undefined }));
}));
app.get('/api/articles/:id', asyncHandler(async (req: any, res: any) => {
  const article = await prisma.article.findUnique({ where: { id: req.params.id } });
  if (article && !article.isDeleted) {
    res.json(article);
  } else res.status(404).json({ error: 'Not found' });
}));
app.get('/api/articles/slug/:slug', asyncHandler(async (req: any, res: any) => {
  const article = await prisma.article.findUnique({ where: { slug: req.params.slug } });
  if (article && !article.isDeleted) {
    await prisma.article.update({ where: { id: article.id }, data: { views: { increment: 1 } } });
    article.views += 1;
    res.json(article);
  } else res.status(404).json({ error: 'Not found' });
}));
app.post('/api/articles', authenticateToken, asyncHandler(async (req: any, res: any) => {
  const validData = articleSchema.parse(req.body);
  const slug = generateSlug(validData.title);
  const newArticle = await prisma.article.create({ data: { ...validData, slug, date: new Date(), views: 0 } });
  res.json(newArticle);
}));
app.put('/api/articles/:id', authenticateToken, asyncHandler(async (req: any, res: any) => {
  const validData = articleSchema.partial().parse(req.body);
  // Le slug n'est régénéré que si le titre a réellement changé,
  // pour ne pas casser les liens déjà partagés à chaque sauvegarde
  // (sinon un simple toggle "mis en avant" changeait l'URL de l'article).
  let slug = undefined;
  if (validData.title) {
    const current = await prisma.article.findUnique({ where: { id: req.params.id }, select: { title: true } });
    if (current && current.title !== validData.title) slug = generateSlug(validData.title);
  }
  await prisma.article.update({ where: { id: req.params.id }, data: { ...validData, slug } });
  res.json({ success: true });
}));
app.delete('/api/articles/:id', authenticateToken, asyncHandler(async (req: any, res: any) => {
  // Soft Delete
  await prisma.article.update({ where: { id: req.params.id }, data: { isDeleted: true } });
  res.json({ success: true });
}));
app.delete('/api/articles/:id/hard', authenticateToken, asyncHandler(async (req: any, res: any) => {
  // Hard Delete
  const article = await prisma.article.findUnique({ where: { id: req.params.id } });
  if (article?.imageUrl) await deleteImageFile(article.imageUrl);
  await prisma.article.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));
app.put('/api/articles/:id/restore', authenticateToken, asyncHandler(async (req: any, res: any) => {
  await prisma.article.update({ where: { id: req.params.id }, data: { isDeleted: false } });
  res.json({ success: true });
}));

// Subscribers
app.post('/api/subscribe', asyncHandler(async (req: any, res: any) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'Email invalide' });
  try {
    await prisma.subscriber.upsert({
      where: { email },
      update: { isActive: true },
      create: { email }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
}));
app.get('/api/subscribers', authenticateToken, asyncHandler(async (req: any, res: any) => {
  res.json(await prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } }));
}));

// Error Handling Middleware
app.use((err: any, req: any, res: any, next: any) => {
  if (err instanceof z.ZodError) {
    return res.status(400).json({ error: 'Données invalides', details: err.issues });
  }
  console.error(err);
  res.status(500).json({ error: 'Une erreur interne est survenue' });
});

if (!process.env.VERCEL) {
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));
}

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  import('vite').then(({ createServer }) => {
    createServer({ server: { middlewareMode: true }, appType: 'spa' }).then(vite => {
      app.use(vite.middlewares);
    });
  });
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath, { index: false }));
  
  app.get('*', asyncHandler(async (req: any, res: any) => {
    // Anti-cache : oblige le navigateur à revalider le HTML à chaque visite.
    // Sans cet en-tête, les téléphones gardent l'ancienne page (et ses vieux
    // assets) en cache même après un déploiement → "ça marche en local mais
    // pas en prod". Les assets JS/CSS, eux, restent cacheables (noms hashés).
    res.set('Cache-Control', 'public, max-age=0, must-revalidate');
    let html = fs.readFileSync(path.join(distPath, 'index.html'), 'utf8');
    const config = await prisma.siteConfig.findUnique({ where: { id: 1 } });
    const siteName = config?.name || 'SAMOU MÉDIA';
    
    let title = siteName;
    let description = config?.slogan || 'Information en continu';
    let image = '';
    let isDraft = false;
    
    if (req.path.startsWith('/article/')) {
      const slug = req.path.split('/')[2];
      const article = await prisma.article.findUnique({ where: { slug } });
      if (article) {
        title = `${article.title} - ${siteName}`;
        description = (article.excerpt || article.title).replace(/"/g, '&quot;');
        image = article.imageUrl || '';
        if (article.status === 'DRAFT') isDraft = true;
      }
    }
    
    const metaTags = `
    <title>${title}</title>
    ${isDraft ? '<meta name="robots" content="noindex" />' : ''}
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:type" content="website" />
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:title" content="${title}" />
    <meta property="twitter:description" content="${description}" />
    <meta property="twitter:image" content="${image}" />`;
    
    // On retire d'abord les métadonnées par défaut du index.html statique,
    // puis on injecte celles de l'article (sinon balises description/og dupliquées).
    html = html
      .replace(/<meta name="description"[^>]*>/, '')
      .replace(/<meta property="og:(title|description|type)"[^>]*>/g, '')
      .replace('<title>SAMOU MÉDIA</title>', metaTags);
    res.send(html);
  }));
}

if (!process.env.VERCEL) {
  const PORT = parseInt(process.env.PORT || '3000', 10);
  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://localhost:${PORT}`));
}

export default app;
