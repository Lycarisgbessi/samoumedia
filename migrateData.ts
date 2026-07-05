import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const DATA_DIR = path.join(process.cwd(), 'data');

async function main() {
  console.log('Migrating data from JSON to PostgreSQL (Neon)...');

  // Migrate Categories
  const categoriesPath = path.join(DATA_DIR, 'categories.json');
  if (fs.existsSync(categoriesPath)) {
    const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
    const categories = categoriesData.categories || categoriesData;
    for (const cat of categories) {
      await prisma.category.upsert({
        where: { id: cat.id },
        update: {},
        create: {
          id: cat.id,
          name: cat.name,
          isActive: cat.isActive !== false,
          order: cat.order || 0
        }
      });
    }
    console.log(`Migrated ${categories.length} categories.`);
  }

  // Migrate Articles
  const articlesPath = path.join(DATA_DIR, 'articles.json');
  if (fs.existsSync(articlesPath)) {
    const articlesData = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
    const articles = articlesData.articles || articlesData;
    for (const art of articles) {
      await prisma.article.upsert({
        where: { id: art.id },
        update: {},
        create: {
          id: art.id,
          title: art.title,
          excerpt: art.excerpt || '',
          content: art.content || '',
          imageUrl: art.imageUrl || '',
          categoryId: art.categoryId || 'actualites',
          author: art.author || 'Samou Média',
          date: art.date ? new Date(art.date) : new Date(),
          readTime: art.readTime || '5 min',
          isFeatured: art.isFeatured || false,
          views: art.views || 0
        }
      });
    }
    console.log(`Migrated ${articles.length} articles.`);
  }

  // Migrate Chroniques
  const chroniquesPath = path.join(DATA_DIR, 'chroniques.json');
  if (fs.existsSync(chroniquesPath)) {
    const chroniquesData = JSON.parse(fs.readFileSync(chroniquesPath, 'utf8'));
    const chroniques = chroniquesData.chroniques || chroniquesData;
    for (const chron of chroniques) {
      await prisma.chronique.upsert({
        where: { id: chron.id },
        update: {},
        create: {
          id: chron.id,
          title: chron.title,
          author: chron.author || 'Samou Média',
          authorRole: chron.authorRole || '',
          authorImage: chron.authorImage || '',
          date: chron.date ? new Date(chron.date) : new Date(),
          excerpt: chron.excerpt || ''
        }
      });
    }
    console.log(`Migrated ${chroniques.length} chroniques.`);
  }

  // Migrate Ads
  const adsPath = path.join(DATA_DIR, 'ads.json');
  if (fs.existsSync(adsPath)) {
    const adsData = JSON.parse(fs.readFileSync(adsPath, 'utf8'));
    const ads = adsData.ads || adsData;
    for (const ad of ads) {
      await prisma.adSpace.upsert({
        where: { id: ad.id },
        update: {},
        create: {
          id: ad.id,
          name: ad.name || '',
          format: ad.format || 'square',
          location: ad.location || 'sidebar',
          isActive: ad.isActive !== false,
          imageUrl: ad.imageUrl || '',
          targetUrl: ad.targetUrl || ''
        }
      });
    }
    console.log(`Migrated ${ads.length} ads.`);
  }

  // Migrate Config
  const configPath = path.join(DATA_DIR, 'config.json');
  if (fs.existsSync(configPath)) {
    const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    await prisma.siteConfig.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: configData.name || 'SAMOU MEDIA',
        slogan: configData.slogan || '',
        address: configData.address || '',
        phone: configData.phone || '',
        emails: configData.emails || [],
        socials: configData.socials || {}
      }
    });
    console.log(`Migrated config.`);
  }

  console.log('Migration completed successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
