const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generateSlug = (text) => {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '') + '-' + Math.random().toString(36).substr(2, 5);
};

async function main() {
  console.log('Migrating Articles...');
  const articles = await prisma.article.findMany();
  for (const article of articles) {
    if (!article.slug || article.slug.length < 3) {
      await prisma.article.update({
        where: { id: article.id },
        data: { slug: generateSlug(article.title) }
      });
    }
  }

  console.log('Migrating Categories...');
  const categories = await prisma.category.findMany();
  for (const cat of categories) {
    if (!cat.slug || cat.slug.length < 3) {
      await prisma.category.update({
        where: { id: cat.id },
        data: { slug: generateSlug(cat.name) }
      });
    }
  }

  console.log('Migrating Chroniques...');
  const chroniques = await prisma.chronique.findMany();
  for (const chr of chroniques) {
    if (!chr.slug || chr.slug.length < 3) {
      await prisma.chronique.update({
        where: { id: chr.id },
        data: { slug: generateSlug(chr.title) }
      });
    }
  }

  console.log('Done!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
