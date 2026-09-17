const { PrismaClient } = require('@prisma/client');
const { v2: cloudinary } = require('cloudinary');
const path = require('path');
const fs = require('fs');

// Les identifiants sont lus depuis l'environnement (.env) — jamais en dur dans le code.
require('dotenv').config();

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error('Erreur : CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET doivent être définis dans .env');
  process.exit(1);
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET
});

const prisma = new PrismaClient();
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

async function migrate() {
  const articles = await prisma.article.findMany({ where: { isDeleted: false } });
  let migrated = 0, skipped = 0, missing = 0;

  for (const art of articles) {
    if (!art.imageUrl || !art.imageUrl.startsWith('/uploads/')) {
      skipped++;
      continue;
    }
    const filename = art.imageUrl.replace('/uploads/', '');
    const filepath = path.join(UPLOADS_DIR, filename);
    if (!fs.existsSync(filepath)) {
      console.log('MISSING FILE: ' + filepath);
      missing++;
      continue;
    }
    try {
      const result = await cloudinary.uploader.upload(filepath, { folder: 'samou-media' });
      await prisma.article.update({ where: { id: art.id }, data: { imageUrl: result.secure_url } });
      console.log('OK: ' + art.title.substring(0, 40));
      migrated++;
    } catch(e) {
      console.error('ERR: ' + art.title + ' => ' + e.message);
    }
  }

  console.log('\nDONE. Migrated: ' + migrated + ', Skipped (already cloud): ' + skipped + ', Missing on disk: ' + missing);
  await prisma.$disconnect();
}

migrate().catch(console.error);
