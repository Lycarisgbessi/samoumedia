# SAMOU MÉDIA

Site d'actualités complet pour le média guinéen **SAMOU MÉDIA** (« Informer. Éclairer. Rassembler. ») : site public, backoffice d'administration et API.

## Stack

- **Frontend** : React 19, Vite 6, TypeScript, Tailwind CSS 4, React Router 7, Motion, React-Quill, DOMPurify
- **Backend** : Express (fichier unique `server.ts`), Prisma + PostgreSQL (Neon), JWT + bcrypt, Zod, Helmet, express-rate-limit
- **Images** : Cloudinary (repli local dans `public/uploads` en dev)
- **Déploiement** : Vercel (API serverless + SPA)

## Fonctionnalités

- Articles avec rubriques, mise en avant, brouillons, corbeille (soft delete), vues, tags, recherche
- Chroniques (éditoriaux) avec page publique dédiée
- Reportages vidéo : tout article avec une URL YouTube apparaît dans « Vidéos & Reportages »
- Espaces publicitaires gérés depuis l'admin (formats horizontal, vertical, carré, in-article, popup)
- Newsletter (abonnés) et paramètres du site (coordonnées, réseaux sociaux)
- SEO : métadonnées Open Graph/Twitter injectées côté serveur pour chaque article

## Démarrage local

```bash
npm install                 # installe les dépendances (prisma generate inclus)
cp .env.example .env        # puis renseigner DATABASE_URL, JWT_SECRET, Cloudinary
npm run dev                 # serveur Express + Vite sur http://localhost:3000
```

## Scripts utiles

| Commande | Rôle |
|---|---|
| `npm run dev` | Développement (Express + Vite) |
| `npm run build` | Build production (dist/ + server.cjs) |
| `npm start` | Lance le serveur buildé |
| `npm run lint` | Vérification TypeScript (`tsc --noEmit`) |
| `node create_admin.cjs [mot_de_passe]` | Crée/met à jour l'utilisateur admin |
| `node migrate_slugs.cjs` | Régénère les slugs manquants |
| `node migrate_images.cjs` | Migre les images locales vers Cloudinary |

## Variables d'environnement

Voir `.env.example`. En production, définir au minimum : `DATABASE_URL`, `JWT_SECRET`, et les clés `CLOUDINARY_*` (sinon le serveur refuse de démarrer sans `JWT_SECRET`).
