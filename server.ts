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
import webpush from 'web-push';

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

const deleteImageFile = async (mediaUrl: string) => {
  if (!mediaUrl) return;
  if (mediaUrl.startsWith('http') && mediaUrl.includes('cloudinary.com')) {
    const parts = mediaUrl.split('/');
    const publicId = `${parts[parts.length - 2]}/${parts[parts.length - 1].split('.')[0]}`;
    // Les vidéos Cloudinary vivent sous /video/upload/, les images sous /image/upload/
    const resourceType = mediaUrl.includes('/video/upload/') ? 'video' : 'image';
    try { await cloudinary.uploader.destroy(publicId, { resource_type: resourceType as any }); } catch (err) { }
  } else if (mediaUrl.startsWith('/uploads/')) {
    const filepath = path.join(UPLOADS_DIR, mediaUrl.replace('/uploads/', ''));
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
  tags: z.array(z.string()).optional().default([]),
  titleFont: z.string().optional().nullable(),
  excerptFont: z.string().optional().nullable(),
  contentFont: z.string().optional().nullable()
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
    const token = jwt.sign({ role: 'admin', id: user.id }, JWT_SECRET, { expiresIn: '7d' });
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
      // resource_type 'auto' : détecte automatiquement images, GIF animés ET vidéos (mp4/webm).
      // Les GIF ne sont pas recompressés côté client pour préserver l'animation.
      const result = await cloudinary.uploader.upload(image, {
        resource_type: 'auto',
        folder: 'samou-media'
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
  const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } });
  // Traduction des noms de rubriques (?lang=...), mise en cache
  const lang = req.query.lang as string;
  if (lang && SUPPORTED_LANGS[lang]) {
    const toTranslate: { idx: number; name: string }[] = [];
    categories.forEach((cat: any, idx: number) => {
      const cached = cat.translations?.[lang]?.name;
      if (cached) cat.name = cached;
      else toTranslate.push({ idx, name: cat.name });
    });
    if (toTranslate.length) {
      const results = await translateTexts(toTranslate.map(t => t.name), lang);
      if (results) {
        toTranslate.forEach((t, i) => {
          const name = results[i] || t.name;
          categories[t.idx].name = name;
          categories[t.idx].translations = { ...((categories[t.idx].translations as any) || {}), [lang]: { name } };
          prisma.category.update({
            where: { id: categories[t.idx].id },
            data: { translations: categories[t.idx].translations }
          }).catch(() => { });
        });
      }
    }
  }
  res.json(categories);
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

  const chroniques = await prisma.chronique.findMany({ where, orderBy: { date: 'desc' } });

  // Traduction des titres/extraits (?lang=...), mise en cache
  const lang = req.query.lang as string;
  if (lang && SUPPORTED_LANGS[lang] && chroniques.length) {
    const toTranslate: { idx: number; title: string; excerpt: string }[] = [];
    chroniques.forEach((c: any, idx: number) => {
      const cached = c.translations?.[lang];
      if (cached?.title) {
        c.title = cached.title;
        if (cached.excerpt) c.excerpt = cached.excerpt;
      } else {
        toTranslate.push({ idx, title: c.title || '', excerpt: c.excerpt || '' });
      }
    });
    if (toTranslate.length) {
      const flat: string[] = [];
      toTranslate.forEach(t => { flat.push(t.title); if (t.excerpt) flat.push(t.excerpt); });
      const results = await translateTexts(flat, lang);
      if (results) {
        let r = 0;
        for (const t of toTranslate) {
          const title = results[r++] || t.title;
          const excerpt = t.excerpt ? (results[r++] || t.excerpt) : undefined;
          chroniques[t.idx].title = title;
          if (excerpt !== undefined) chroniques[t.idx].excerpt = excerpt;
          chroniques[t.idx].translations = { ...((chroniques[t.idx].translations as any) || {}), [lang]: { title, excerpt } };
          prisma.chronique.update({
            where: { id: chroniques[t.idx].id },
            data: { translations: chroniques[t.idx].translations }
          }).catch(() => { });
        }
      }
    }
  }

  res.json(chroniques);
}));
app.get('/api/chroniques/slug/:slug', asyncHandler(async (req: any, res: any) => {
  const chronique = await prisma.chronique.findUnique({ where: { slug: req.params.slug } });
  if (chronique && !chronique.isDeleted && chronique.status === 'PUBLISHED') {
    await prisma.chronique.update({ where: { id: chronique.id }, data: { views: { increment: 1 } } });
    chronique.views += 1;

    // Traduction complète à la demande (?lang=...), mise en cache
    const lang = req.query.lang as string;
    if (lang && SUPPORTED_LANGS[lang]) {
      const cached = (chronique.translations as any)?.[lang];
      if (cached?.content) {
        return res.json({ ...chronique, title: cached.title, excerpt: cached.excerpt, content: cached.content, translated: true });
      }
      const results = await translateTexts(
        [chronique.title || '', chronique.excerpt || '', chronique.content || ''].filter(Boolean),
        lang
      );
      if (results && results.some(r => r)) {
        let i = 0;
        const translation = {
          title: chronique.title ? (results[i++] || chronique.title) : chronique.title,
          excerpt: chronique.excerpt ? (results[i++] || chronique.excerpt) : chronique.excerpt,
          content: chronique.content ? (results[i++] || chronique.content) : chronique.content
        };
        await prisma.chronique.update({
          where: { id: chronique.id },
          data: { translations: { ...(chronique.translations as any || {}), [lang]: translation } }
        }).catch(() => { });
        return res.json({ ...chronique, ...translation, translated: true });
      }
    }

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
    // Statistiques internes : terme recherché (tendances de l'audience)
    if (search.length >= 2) {
      const term = search.toLowerCase().trim().substring(0, 80);
      prisma.searchTerm.upsert({
        where: { term },
        update: { count: { increment: 1 }, lastSearched: new Date() },
        create: { term }
      }).catch(() => { });
    }
  }
  const orderBy: any = sort === 'views' ? { views: 'desc' } : { date: 'desc' };
  const articles = await prisma.article.findMany({ where, orderBy, take: limit ? parseInt(limit as string, 10) : undefined });
  // Traduction des titres/extraits visibles (?lang=...), mise en cache.
  // (Requêtes admin : pas de traduction.)
  const lang = req.query.lang as string;
  if (lang && SUPPORTED_LANGS[lang] && where.status === 'PUBLISHED') {
    await translateArticleList(articles, lang);
  }
  res.json(articles);
}));
app.get('/api/articles/:id', asyncHandler(async (req: any, res: any) => {
  const article = await prisma.article.findUnique({ where: { id: req.params.id } });
  if (article && !article.isDeleted) {
    res.json(article);
  } else res.status(404).json({ error: 'Not found' });
}));
// ─── Moteur de traduction ───────────────────────────────────────
// Fournisseurs (par ordre de qualité) : DeepL → Gemini → MyMemory.
// Tout est mis en cache en base (translations Json) : chaque élément n'est
// traduit qu'UNE seule fois par langue.

const SUPPORTED_LANGS: Record<string, string> = {
  en: 'anglais', es: 'espagnol', 'zh-CN': 'chinois', ar: 'arabe', pt: 'portugais'
};
const DEEPL_CODES: Record<string, string> = { en: 'EN', es: 'ES', 'zh-CN': 'ZH', ar: 'AR', pt: 'PT' };

async function translateWithDeepL(texts: string[], langCode: string, html: boolean): Promise<string[] | null> {
  const key = process.env.DEEPL_API_KEY;
  if (!key || !DEEPL_CODES[langCode]) return null;
  const host = key.endsWith(':fx') ? 'https://api-free.deepl.com' : 'https://api.deepl.com';
  try {
    const res = await fetch(`${host}/v2/translate`, {
      method: 'POST',
      headers: { 'Authorization': `DeepL-Auth-Key ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: texts,
        target_lang: DEEPL_CODES[langCode],
        source_lang: 'FR',
        ...(html ? { tag_handling: 'html', preserve_formatting: true } : {})
      })
    });
    if (!res.ok) return null;
    const data = await res.json() as any;
    const out = (data?.translations || []).map((t: any) => t.text);
    return out.length === texts.length ? out : null;
  } catch {
    return null;
  }
}

async function translateWithGemini(texts: string[], langName: string): Promise<string[] | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Traduis chaque bloc suivant en ${langName}, en conservant exactement la mise en forme HTML et les balises. Réponds UNIQUEMENT par les blocs traduits, séparés par la ligne "|||".\n\n${texts.join('\n|||\n')}`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt
    });
    const out = (response.text || '').split('|||').map((s: string) => s.trim());
    return out.length === texts.length ? out : null;
  } catch {
    return null;
  }
}

async function translateWithMyMemory(text: string, target: string): Promise<string | null> {
  try {
    const limited = text.substring(0, 480);
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(limited)}&langpair=fr|${target}`;
    const res = await fetch(url);
    const data = await res.json() as any;
    const translated = data?.responseData?.translatedText;
    return typeof translated === 'string' && !translated.startsWith('MYMEMORY WARNING') ? translated : null;
  } catch {
    return null;
  }
}

/** Découpe un texte en segments ≤ 480 caractères (frontières de phrases). */
function chunkText(text: string, max = 480): string[] {
  const chunks: string[] = [];
  let rest = text.trim();
  while (rest.length > max) {
    let cut = rest.lastIndexOf('.', max);
    if (cut < max * 0.5) cut = rest.lastIndexOf(' ', max);
    if (cut <= 0) cut = max;
    chunks.push(rest.substring(0, cut + 1).trim());
    rest = rest.substring(cut + 1).trim();
  }
  if (rest) chunks.push(rest);
  return chunks;
}

/** Via MyMemory : traduit un contenu HTML SANS le tronquer ni perdre la mise
 *  en forme (blocs traduits par segments, balises conservées). */
async function translateHtmlMyMemory(html: string, target: string, maxChars = 6000): Promise<string | null> {
  if (html.length > maxChars) return null; // trop long pour le secours gratuit → français conservé
  const blocks = html.split(/(?=<\/?(?:p|h[1-3]|li|blockquote)[>\s])/).filter(b => b.trim());
  const out: string[] = [];
  for (const block of blocks) {
    const m = block.match(/^(<[^>]+>)([\s\S]*?)(<\/[^>]+>)$/);
    const inner = m ? m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : block.replace(/<[^>]+>/g, ' ').trim();
    if (!inner) { out.push(block); continue; }
    const chunks = chunkText(inner);
    const translatedChunks: string[] = [];
    for (const chunk of chunks) {
      const t = await translateWithMyMemory(chunk, target);
      translatedChunks.push(t || chunk);
    }
    const joined = translatedChunks.join(' ');
    out.push(m ? m[1] + joined + m[3] : joined);
  }
  return out.join('');
}

/** Traduit une liste de textes avec la chaîne de fournisseurs (retourne null si tout échoue). */
async function translateTexts(texts: string[], langCode: string): Promise<string[] | null> {
  if (texts.length === 0) return [];
  const langName = SUPPORTED_LANGS[langCode];
  if (!langName) return null;

  // 1. DeepL (meilleure qualité, HTML préservé)
  const viaDeepL = await translateWithDeepL(texts, langCode, texts.some(t => /[<>]/.test(t)));
  if (viaDeepL) return viaDeepL;

  // 2. Gemini
  const viaGemini = await translateWithGemini(texts, langName);
  if (viaGemini) return viaGemini;

  // 3. MyMemory (secours gratuit, quota journalier limité) :
  //    - textes longs/HTML découpés proprement, mise en forme conservée
  //    - appels en parallèle (6 à la fois) pour rester dans les délais
  //    - 24 textes max par requête : le reste reste en français et sera
  //      traduit au passage suivant grâce au cache
  const limited = texts.slice(0, 24);
  const results = await Promise.all(limited.map(async (text) => {
    if (!text.trim()) return text;
    if (/[<>]/.test(text) && text.length > 500) {
      return (await translateHtmlMyMemory(text, langCode)) || text;
    }
    const chunks = chunkText(text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    const translated: string[] = [];
    for (const chunk of chunks) {
      const t = await translateWithMyMemory(chunk, langCode);
      translated.push(t || chunk);
    }
    return translated.join(' ') || text;
  }));
  return [...results, ...texts.slice(24)];
}

/** Traduit les champs visibles d'une liste d'articles, avec cache en base. */
async function translateArticleList(items: any[], langCode: string) {
  if (!items.length) return;
  const toTranslate: { idx: number; title: string; excerpt: string }[] = [];
  items.forEach((item, idx) => {
    const cached = item.translations?.[langCode];
    if (cached?.title) {
      item.title = cached.title;
      if (cached.excerpt) item.excerpt = cached.excerpt;
    } else {
      toTranslate.push({ idx, title: item.title || '', excerpt: item.excerpt || '' });
    }
  });
  if (!toTranslate.length) return;

  const flat: string[] = [];
  toTranslate.forEach(t => { flat.push(t.title); if (t.excerpt) flat.push(t.excerpt); });
  const results = await translateTexts(flat, langCode);
  if (!results) return; // service indisponible → on sert le français

  let r = 0;
  for (const t of toTranslate) {
    const title = results[r++] || t.title;
    const excerpt = t.excerpt ? (results[r++] || t.excerpt) : undefined;
    items[t.idx].title = title;
    if (excerpt !== undefined) items[t.idx].excerpt = excerpt;
    // Mise en cache (sans le contenu : traduit séparément à l'ouverture)
    const item = items[t.idx];
    item.translations = { ...(item.translations || {}), [langCode]: { title, excerpt } };
    prisma.article.update({
      where: { id: item.id },
      data: { translations: item.translations }
    }).catch(() => { });
  }
}

app.get('/api/articles/slug/:slug', asyncHandler(async (req: any, res: any) => {
  const article = await prisma.article.findUnique({ where: { slug: req.params.slug } });
  if (article && !article.isDeleted) {
    await prisma.article.update({ where: { id: article.id }, data: { views: { increment: 1 } } });
    article.views += 1;

    // Traduction complète à la demande (?lang=...), mise en cache
    const lang = req.query.lang as string;
    if (lang && SUPPORTED_LANGS[lang]) {
      const cached = (article.translations as any)?.[lang];
      if (cached?.content) {
        return res.json({ ...article, title: cached.title, excerpt: cached.excerpt, content: cached.content, translated: true });
      }
      const results = await translateTexts(
        [article.title || '', article.excerpt || '', article.content || ''].filter(Boolean),
        lang
      );
      if (results && results.some(r => r)) {
        let i = 0;
        const translation = {
          title: article.title ? (results[i++] || article.title) : article.title,
          excerpt: article.excerpt ? (results[i++] || article.excerpt) : article.excerpt,
          content: article.content ? (results[i++] || article.content) : article.content
        };
        await prisma.article.update({
          where: { id: article.id },
          data: { translations: { ...(article.translations as any || {}), [lang]: translation } }
        }).catch(() => { });
        return res.json({ ...article, ...translation, translated: true });
      }
      return res.status(503).json({ error: 'Service de traduction momentanément indisponible. Réessayez plus tard.' });
    }

    res.json(article);
  } else res.status(404).json({ error: 'Not found' });
}));
app.post('/api/articles', authenticateToken, asyncHandler(async (req: any, res: any) => {
  const validData = articleSchema.parse(req.body);
  const slug = generateSlug(validData.title);
  const newArticle = await prisma.article.create({ data: { ...validData, slug, date: new Date(), views: 0 } });
  // Notification push à tous les abonnés dès qu'un article est PUBLIÉ
  if (validData.status === 'PUBLISHED') {
    notifyAllSubscribers(
      'SAMOU MÉDIA — Nouvel article',
      validData.title,
      `/article/${slug}`
    ).catch(() => { });
  }
  res.json(newArticle);
}));
app.put('/api/articles/:id', authenticateToken, asyncHandler(async (req: any, res: any) => {
  const validData = articleSchema.partial().parse(req.body);
  // Le slug n'est régénéré que si le titre a réellement changé,
  // pour ne pas casser les liens déjà partagés à chaque sauvegarde
  // (sinon un simple toggle "mis en avant" changeait l'URL de l'article).
  let slug = undefined;
  let previousStatus: string | undefined;
  if (validData.title || validData.status) {
    const current = await prisma.article.findUnique({
      where: { id: req.params.id },
      select: { title: true, status: true, slug: true }
    });
    if (current) {
      previousStatus = current.status;
      if (validData.title && current.title !== validData.title) slug = generateSlug(validData.title);
    }
  }
  await prisma.article.update({ where: { id: req.params.id }, data: { ...validData, slug } });

  // Notification push quand un article passe à PUBLIÉ (brouillon → publié),
  // mais pas lors des simples modifications d'un article déjà publié.
  if (validData.status === 'PUBLISHED' && previousStatus && previousStatus !== 'PUBLISHED') {
    const fresh = await prisma.article.findUnique({ where: { id: req.params.id }, select: { title: true, slug: true } });
    if (fresh) {
      notifyAllSubscribers('SAMOU MÉDIA — Nouvel article', fresh.title, `/article/${fresh.slug}`).catch(() => { });
    }
  }
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

// Photos (galerie d'accueil)
const photoSchema = z.object({
  imageUrl: z.string().min(1),
  caption: z.string().optional().nullable(),
  order: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true)
});

app.get('/api/photos', asyncHandler(async (req: any, res: any) => {
  const { all } = req.query;
  const where: any = all === 'true' ? {} : { isActive: true };
  res.json(await prisma.photo.findMany({ where, orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] }));
}));
app.post('/api/photos', authenticateToken, asyncHandler(async (req: any, res: any) => {
  const validData = photoSchema.parse(req.body);
  const count = await prisma.photo.count();
  res.json(await prisma.photo.create({ data: { ...validData, order: validData.order ?? count + 1 } }));
}));
app.put('/api/photos/:id', authenticateToken, asyncHandler(async (req: any, res: any) => {
  const validData = photoSchema.partial().parse(req.body);
  await prisma.photo.update({ where: { id: req.params.id }, data: validData });
  res.json({ success: true });
}));
app.delete('/api/photos/:id', authenticateToken, asyncHandler(async (req: any, res: any) => {
  const photo = await prisma.photo.findUnique({ where: { id: req.params.id } });
  if (photo?.imageUrl) await deleteImageFile(photo.imageUrl);
  await prisma.photo.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));

// Subscribers
app.post('/api/subscribe', asyncHandler(async (req: any, res: any) => {  const { email } = req.body;
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

// ─── Notifications push (Web Push / VAPID) ──────────────────────
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails('mailto:contact@samoumedia.com', vapidPublicKey, vapidPrivateKey);
}

app.get('/api/push/key', (req, res) => res.send(vapidPublicKey));

app.post('/api/push/subscribe', asyncHandler(async (req: any, res: any) => {
  const { endpoint, keys } = req.body || {};
  if (!endpoint || !keys?.p256dh || !keys?.auth) return res.status(400).json({ error: 'Abonnement invalide' });
  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { p256dh: keys.p256dh, auth: keys.auth },
    create: { endpoint, p256dh: keys.p256dh, auth: keys.auth }
  });
  res.json({ success: true });
}));

app.post('/api/push/unsubscribe', asyncHandler(async (req: any, res: any) => {
  const { endpoint } = req.body || {};
  if (endpoint) await prisma.pushSubscription.deleteMany({ where: { endpoint } });
  res.json({ success: true });
}));

/** Envoie une notification push à tous les abonnés (best effort). */
async function notifyAllSubscribers(title: string, body: string, url: string) {
  if (!vapidPublicKey || !vapidPrivateKey) return;
  const subs = await prisma.pushSubscription.findMany();
  await Promise.allSettled(subs.map(async (sub: any) => {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({ title, body, url })
      );
    } catch (err: any) {
      // Abonnement expiré/invalidé (410/404) → on le supprime
      if (err?.statusCode === 404 || err?.statusCode === 410) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => { });
      }
    }
  }));
}

// ─── Statistiques : collecte ────────────────────────────────────
const trackSchema = z.object({
  type: z.enum(['view', 'ad']),
  path: z.string().optional(),
  adId: z.string().optional(),
  adEvent: z.enum(['impression', 'click']).optional(),
  referrer: z.string().optional(),
  visitorId: z.string().optional()
});

app.post('/api/track', asyncHandler(async (req: any, res: any) => {
  const data = trackSchema.parse(req.body);

  if (data.type === 'ad' && data.adId && data.adEvent) {
    await prisma.adEvent.create({ data: { adId: data.adId, type: data.adEvent } });
  } else if (data.type === 'view' && data.path) {
    // Résolution de l'article pour /article/<slug> (permet les stats par article)
    let articleId: string | undefined;
    if (data.path.startsWith('/article/')) {
      const slug = data.path.split('/')[2];
      const article = await prisma.article.findUnique({ where: { slug }, select: { id: true } });
      articleId = article?.id;
    }
    await prisma.pageView.create({
      data: {
        path: data.path.substring(0, 200),
        articleId,
        referrer: data.referrer?.substring(0, 300) || null,
        visitorId: data.visitorId?.substring(0, 40) || null
      }
    });
  }
  res.json({ success: true });
}));

// ─── Statistiques : agrégation (tableau de bord) ────────────────
app.get('/api/stats/overview', authenticateToken, asyncHandler(async (req: any, res: any) => {
  const [totals] = await prisma.$queryRaw<any[]>`
    SELECT
      (SELECT COUNT(*) FROM "PageView" WHERE "createdAt" >= CURRENT_DATE)::int AS today,
      (SELECT COUNT(*) FROM "PageView" WHERE "createdAt" >= CURRENT_DATE - INTERVAL '7 days')::int AS week,
      (SELECT COUNT(*) FROM "PageView" WHERE "createdAt" >= CURRENT_DATE - INTERVAL '30 days')::int AS month,
      (SELECT COUNT(*) FROM "PageView")::int AS total,
      (SELECT COUNT(DISTINCT "visitorId") FROM "PageView" WHERE "createdAt" >= CURRENT_DATE)::int AS uniquesToday,
      (SELECT COUNT(DISTINCT "visitorId") FROM "PageView" WHERE "createdAt" >= CURRENT_DATE - INTERVAL '7 days')::int AS uniquesWeek,
      (SELECT COUNT(DISTINCT "visitorId") FROM "PageView" WHERE "createdAt" >= CURRENT_DATE - INTERVAL '30 days')::int AS uniquesMonth`;

  // Sources d'audience : domaines d'origine des visiteurs (30 jours)
  const sources = await prisma.$queryRaw<any[]>`
    SELECT
      CASE
        WHEN "referrer" IS NULL OR "referrer" = '' THEN 'Accès direct'
        WHEN "referrer" LIKE '%facebook.com%' OR "referrer" LIKE '%fb.me%' THEN 'Facebook'
        WHEN "referrer" LIKE '%whatsapp.com%' THEN 'WhatsApp'
        WHEN "referrer" LIKE '%twitter.com%' OR "referrer" LIKE '%t.co%' OR "referrer" LIKE '%x.com%' THEN 'X / Twitter'
        WHEN "referrer" LIKE '%google.%' THEN 'Google'
        WHEN "referrer" LIKE '%youtube.com%' THEN 'YouTube'
        WHEN "referrer" LIKE '%linkedin.com%' THEN 'LinkedIn'
        WHEN "referrer" LIKE '%tiktok.com%' THEN 'TikTok'
        ELSE split_part(split_part("referrer", '//', 2), '/', 1)
      END AS source,
      COUNT(*)::int AS visits
    FROM "PageView"
    WHERE "createdAt" >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY 1
    ORDER BY visits DESC
    LIMIT 6`;

  const byDay = await prisma.$queryRaw<any[]>`
    SELECT to_char("createdAt", 'YYYY-MM-DD') AS day, COUNT(*)::int AS count
    FROM "PageView" WHERE "createdAt" >= CURRENT_DATE - INTERVAL '13 days'
    GROUP BY 1 ORDER BY 1`;

  // Heat map : jour de la semaine (0=dimanche) × heure, sur 30 jours
  const heat = await prisma.$queryRaw<any[]>`
    SELECT EXTRACT(DOW FROM "createdAt")::int AS dow, EXTRACT(HOUR FROM "createdAt")::int AS hour, COUNT(*)::int AS count
    FROM "PageView" WHERE "createdAt" >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY 1, 2`;

  const topArticlesRaw = await prisma.$queryRaw<any[]>`
    SELECT pv."articleId" AS id, COUNT(*)::int AS recentViews
    FROM "PageView" pv
    WHERE pv."articleId" IS NOT NULL AND pv."createdAt" >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY 1 ORDER BY 2 DESC LIMIT 8`;
  const articleIds = topArticlesRaw.map((r: any) => r.id);
  const articles = await prisma.article.findMany({
    where: { id: { in: articleIds } },
    select: { id: true, title: true, slug: true, views: true, status: true }
  });
  const topArticles = topArticlesRaw.map((r: any) => {
    const a = articles.find(x => x.id === r.id);
    return a ? { ...a, recentViews: r.recentViews } : null;
  }).filter(Boolean);

  const adsRaw = await prisma.$queryRaw<any[]>`
    SELECT "adId" AS id,
      COUNT(*) FILTER (WHERE type = 'impression')::int AS impressions,
      COUNT(*) FILTER (WHERE type = 'click')::int AS clicks
    FROM "AdEvent" WHERE "createdAt" >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY 1 ORDER BY impressions DESC`;
  const adsList = await prisma.adSpace.findMany({
    where: { id: { in: adsRaw.map((r: any) => r.id) } },
    select: { id: true, name: true, format: true, location: true, isActive: true }
  });
  const ads = adsRaw.map((r: any) => {
    const ad = adsList.find(x => x.id === r.id);
    return ad ? { ...ad, impressions: r.impressions, clicks: r.clicks, ctr: r.impressions > 0 ? Math.round((r.clicks / r.impressions) * 1000) / 10 : 0 } : null;
  }).filter(Boolean);

  const topSearches = await prisma.searchTerm.findMany({
    orderBy: [{ count: 'desc' }], take: 8, select: { term: true, count: true }
  });

  const counts = {
    articles: await prisma.article.count({ where: { isDeleted: false } }),
    published: await prisma.article.count({ where: { isDeleted: false, status: 'PUBLISHED' } }),
    drafts: await prisma.article.count({ where: { isDeleted: false, status: 'DRAFT' } }),
    chroniques: await prisma.chronique.count({ where: { isDeleted: false } }),
    subscribers: await prisma.subscriber.count(),
    photos: await prisma.photo.count(),
    pushSubscribers: await prisma.pushSubscription.count()
  };

  res.json({ ...totals, sources, byDay, heat, topArticles, ads, topSearches, counts });
}));

// Termes recherchés par l'audience — utilisés par l'assistant SEO de l'éditeur.
// (Public et non sensible : uniquement des mots-clés anonymisés.)
app.get('/api/stats/searches', asyncHandler(async (req: any, res: any) => {
  const terms = await prisma.searchTerm.findMany({
    orderBy: [{ count: 'desc' }], take: 10, select: { term: true, count: true }
  });
  res.json(terms);
}));

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  import('vite').then(({ createServer }) => {
    createServer({ server: { middlewareMode: true }, appType: 'spa' }).then(vite => {
      app.use(vite.middlewares);
    });
  });
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath, { index: false }));

  // ─── SEO : robots.txt + sitemap.xml dynamiques ───────────────
  const SITE_ORIGIN = process.env.SITE_URL || 'https://www.samoumedia.com';

  app.get('/robots.txt', (req, res) => {
    res.type('text/plain').send(
      `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`
    );
  });

  app.get('/sitemap.xml', asyncHandler(async (req: any, res: any) => {
    const articles = await prisma.article.findMany({
      where: { isDeleted: false, status: 'PUBLISHED' },
      select: { slug: true, date: true },
      orderBy: { date: 'desc' },
      take: 1000
    });
    const staticPages = ['', '/rubriques', '/podcasts', '/reportages', '/contact', '/about', '/recherche'];
    const urls = [
      ...staticPages.map(p => `  <url><loc>${SITE_ORIGIN}${p}</loc><changefreq>${p === '' ? 'hourly' : 'weekly'}</changefreq><priority>${p === '' ? '1.0' : '0.7'}</priority></url>`),
      ...articles.map(a => `  <url><loc>${SITE_ORIGIN}/article/${a.slug}</loc><lastmod>${a.date.toISOString()}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>`)
    ];
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`);
  }));

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
    let jsonLd = '';

    if (req.path.startsWith('/article/')) {
      const slug = req.path.split('/')[2];
      const article = await prisma.article.findUnique({ where: { slug } });
      if (article) {
        title = `${article.title} - ${siteName}`;
        description = (article.excerpt || article.title).replace(/"/g, '&quot;');
        image = article.imageUrl || '';
        if (article.status === 'DRAFT') isDraft = true;

        // Données structurées NewsArticle (Google Actualités / résultats enrichis)
        const clean = (s: string) => (s || '').replace(/<[^>]+>/g, ' ').replace(/"/g, '&quot;').replace(/\s+/g, ' ').trim();
        jsonLd = JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          headline: clean(article.title).substring(0, 110),
          description: clean(article.excerpt || '').substring(0, 200),
          image: image ? [image] : undefined,
          datePublished: article.date instanceof Date ? article.date.toISOString() : String(article.date),
          dateModified: article.updatedAt instanceof Date ? article.updatedAt.toISOString() : String(article.updatedAt),
          author: { '@type': 'Organization', name: article.author || siteName },
          publisher: {
            '@type': 'NewsMediaOrganization',
            name: siteName,
            logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/icons/icon-512.png` }
          },
          mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_ORIGIN}/article/${article.slug}` },
          inLanguage: 'fr'
        }).replace(/</g, '\\u003c');
      }
    } else if (req.path === '/' || req.path === '') {
      // Données structurées du média (page d'accueil)
      jsonLd = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'NewsMediaOrganization',
        name: siteName,
        slogan: config?.slogan || undefined,
        url: SITE_ORIGIN,
        logo: `${SITE_ORIGIN}/icons/icon-512.png`,
        telephone: config?.phone || undefined,
        email: (config?.emails || [])[0],
        address: config?.address ? { '@type': 'PostalAddress', streetAddress: config.address, addressCountry: 'GN' } : undefined
      }).replace(/</g, '\\u003c');
    }

    const canonical = `${SITE_ORIGIN}${req.path === '/' ? '' : req.path}`;
    const ogType = req.path.startsWith('/article/') ? 'article' : 'website';

    const metaTags = `
    <title>${title}</title>
    ${isDraft ? '<meta name="robots" content="noindex" />' : ''}
    <link rel="canonical" href="${canonical}" />
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:site_name" content="${siteName}" />
    <meta property="og:locale" content="fr_FR" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    ${jsonLd ? `<script type="application/ld+json">${jsonLd}</script>` : ''}`;

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
