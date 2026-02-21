# Les Vidéos de Chris — Site web officiel

Site web complet et production-ready pour la chaîne YouTube [Les Vidéos de Chris](https://www.youtube.com/@lesvideosdechris).

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 15 (App Router, Server Components, ISR) |
| Langage | TypeScript strict |
| Style | TailwindCSS 4 + composants personnalisés |
| Base de données | PostgreSQL 16 via Prisma |
| Auth | NextAuth.js v5 (JWT httpOnly, bcrypt, brute force protection) |
| Paiement | Stripe Checkout + Webhooks + Customer Portal |
| Stockage | Cloudflare R2 / S3-compatible (vidéos exclusives avec URLs signées) |
| Email | Resend (transactionnel) |
| Déploiement | Docker + docker-compose |

## Prérequis

- Node.js 20+
- PostgreSQL 16+
- Compte [Stripe](https://stripe.com) (test ou production)
- Clé API [YouTube Data API v3](https://console.cloud.google.com)
- Compte [Resend](https://resend.com) pour les emails
- Bucket Cloudflare R2 ou S3-compatible (optionnel pour vidéos exclusives)

## Installation locale

### 1. Cloner et installer

```bash
git clone <repo-url> lesvideosdechris
cd lesvideosdechris
npm install
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
# Éditer .env avec vos valeurs
```

Variables obligatoires pour le développement :
- `DATABASE_URL` — URL PostgreSQL
- `NEXTAUTH_SECRET` — Clé secrète (générer avec `openssl rand -base64 32`)
- `NEXTAUTH_URL` — `http://localhost:3000`

### 3. Initialiser la base de données

```bash
# Créer les tables
npx prisma migrate dev --name init

# Générer le client Prisma
npx prisma generate

# Créer le compte admin et les tags de base
ADMIN_EMAIL=chris@votredomaine.fr npx prisma db seed
```

Le seed affiche le mot de passe admin en console. **Changez-le immédiatement !**

### 4. Lancer en développement

```bash
npm run dev
# → http://localhost:3000
```

## Configuration Stripe

### 1. Créer un produit et un prix

Dans le dashboard Stripe (mode test) :
1. Produit : "Les Vidéos de Chris — Premium"
2. Prix : abonnement mensuel récurrent
3. Copier l'ID du prix → `STRIPE_PRICE_ID`

### 2. Configurer le webhook local (développement)

```bash
# Installer Stripe CLI
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
# → Copier le secret dans STRIPE_WEBHOOK_SECRET
```

### 3. Configurer le portail client Stripe

Dans Stripe Dashboard → Customer portal → Activer et configurer les options d'annulation.

## Synchronisation YouTube

1. Configurer `YOUTUBE_API_KEY` et `YOUTUBE_CHANNEL_ID` dans `.env`
2. Aller dans l'administration → Dashboard → Cliquer sur "Synchroniser YouTube"
3. Les vidéos de la chaîne sont importées automatiquement

## Build et déploiement Docker

### Build et démarrage

```bash
# Copier et configurer les variables d'environnement
cp .env.example .env.production
# Éditer .env.production

# Lancer avec docker-compose
docker-compose --env-file .env.production up -d

# Appliquer les migrations
docker-compose exec app npx prisma migrate deploy

# Seed initial (une seule fois)
docker-compose exec app npx prisma db seed
```

### Structure Docker

- `app` : Application Next.js (port 3000)
- `postgres` : Base de données PostgreSQL (port 5432)

## Recommandations sécurité production

### Reverse proxy (Nginx/Caddy)
```nginx
server {
    listen 443 ssl http2;
    server_name votredomaine.fr;

    ssl_certificate /etc/ssl/certs/votredomaine.crt;
    ssl_certificate_key /etc/ssl/private/votredomaine.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Sécurité système
- Exposer uniquement le port 443 (HTTPS) publiquement
- Ne pas exposer le port 5432 (PostgreSQL) publiquement
- Activer fail2ban pour limiter les tentatives de connexion SSH
- Configurer des sauvegardes automatiques PostgreSQL (pg_dump quotidien)
- Mettre à jour régulièrement les dépendances (`npm audit`)

### Variables d'environnement production
- `NEXTAUTH_SECRET` : générer avec `openssl rand -base64 32`
- `POSTGRES_PASSWORD` : mot de passe fort et unique
- Ne jamais committer le fichier `.env`

## Architecture

```
src/
├── app/
│   ├── page.tsx              # Accueil (route "/")
│   ├── (public)/             # Routes publiques avec Header/Footer
│   │   ├── videos/           # Catalogue vidéos
│   │   ├── premium/          # Page de vente premium
│   │   └── */                # Pages légales
│   ├── (auth)/               # Pages d'authentification
│   ├── (member)/             # Espace membre (protégé)
│   ├── (admin)/              # Back-office admin (protégé)
│   └── api/                  # Routes API
├── components/               # Composants React
├── lib/                      # Services (auth, stripe, youtube, etc.)
└── types/                    # Types TypeScript
```

## Fonctionnalités principales

- **Authentification** : JWT httpOnly, refresh token, protection brute force, email de vérification
- **Vidéos** : Synchronisation YouTube automatique, vidéos exclusives avec stockage sécurisé
- **Premium** : Stripe Checkout, webhooks, portail client, gestion des abonnements
- **Admin** : Dashboard stats, gestion vidéos/utilisateurs/abonnements, logs d'activité
- **RGPD** : Bannière cookies, export données, suppression compte, pages légales

## Licence

Tous droits réservés — Les Vidéos de Chris
