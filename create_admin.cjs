/**
 * Crée ou met à jour l'utilisateur admin.
 *
 * Usage :
 *   node create_admin.cjs                       -> mot de passe aléatoire affiché une seule fois
 *   node create_admin.cjs <mot_de_passe>        -> mot de passe imposé (min. 8 caractères)
 *   ADMIN_PASSWORD=xxx node create_admin.cjs    -> via variable d'environnement
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

const username = process.env.ADMIN_USERNAME || 'admin';
const password = process.argv[2] || process.env.ADMIN_PASSWORD || crypto.randomBytes(12).toString('base64url');

if (password.length < 8) {
  console.error('Erreur : le mot de passe doit contenir au moins 8 caractères.');
  process.exit(1);
}

async function main() {
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash }
  });

  console.log(`Utilisateur "${username}" créé / mis à jour avec succès.`);
  if (!process.argv[2] && !process.env.ADMIN_PASSWORD) {
    console.log('\nMot de passe généré (conservez-le maintenant, il ne sera plus affiché) :\n');
    console.log(`  ${password}\n`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
