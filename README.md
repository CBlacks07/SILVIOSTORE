# SILVIO STORE

Boutique en ligne d'accessoires mobiles, ciblant la sous région (Togo, Bénin, Côte d'Ivoire, Burkina, Sénégal, Mali, Ghana, Niger, Guinée, Nigeria).

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- PostgreSQL local (base `store`) via `postgres` (postgres.js)
- Authentification maison : sessions JWT (`jose`) + mots de passe hachés (`bcryptjs`)
- FedaPay (Mobile Money + carte bancaire) via REST API
- E-mails transactionnels (réinitialisation mot de passe) via Resend API
- Zustand pour le panier (persisté en localStorage)
- Upload d'images local dans `public/uploads/products/`

## Démarrage

### 1. Installer les dépendances

```bash
npm install
```

### 2. Préparer la base Postgres

Sur un serveur Postgres local, créer une base `store` puis exécuter, dans l'ordre :

```bash
psql "postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/store" -f sql/schema.sql
psql "postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/store" -f sql/seed.sql
```

Le seed crée un compte administrateur initial :

- E-mail : `admin@silviostore.com`
- Mot de passe : `Admin2026!`

À changer après la première connexion (ou via SQL).

### 3. Configurer FedaPay

1. Créer un compte sur https://fedapay.com
2. Récupérer les clés sandbox (et plus tard live)
3. Dans le dashboard FedaPay, configurer l'URL de webhook sur : `https://<votre-domaine>/api/fedapay/webhook`

### 4. Variables d'environnement

Le fichier `.env.local` doit contenir :

```env
DATABASE_URL=postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/store
SESSION_SECRET=une-chaine-aleatoire-de-32-caracteres-minimum

FEDAPAY_PUBLIC_KEY=pk_sandbox_...
FEDAPAY_SECRET_KEY=sk_sandbox_...
FEDAPAY_ENVIRONMENT=sandbox

# E-mails reset mot de passe (Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL="SILVIO STORE <no-reply@votre-domaine.com>"

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`SESSION_SECRET` doit faire au moins 32 caractères. En production, générer une valeur aléatoire solide (`openssl rand -hex 32`).

### 5. Lancer en local

```bash
npm run dev
```

Site : http://localhost:3000 — Back-office : http://localhost:3000/admin

## Mot de passe oublié

- Page client : `/mot-de-passe-oublie`
- API : `/api/auth/forgot-password` puis `/api/auth/reset-password`
- En développement, si Resend n'est pas configuré, le lien de reset est renvoyé en `debugResetUrl` et loggé dans la console serveur.

## Promouvoir un utilisateur en administrateur

Option 1 — depuis le back-office : un administrateur déjà existant peut changer le rôle d'un utilisateur depuis `/admin/utilisateurs`.

Option 2 — en SQL :

```sql
update users set role = 'admin' where email = 'nouveau.admin@exemple.com';
```

## Structure

```text
src/
  app/                     Routes (App Router)
    admin/                 Back-office (multi-admin)
    api/                   Routes serveur (auth, checkout, webhooks, API admin, upload)
    catalogue/             Liste des produits avec filtres
    checkout/              Tunnel de paiement
    commande/[reference]/  Confirmation de commande
    compte/                Espace client
    connexion/ inscription/
    produit/[slug]/        Fiche produit
  components/              Composants UI réutilisables
  lib/                     db (postgres), auth (JWT + bcrypt), FedaPay, utilitaires
  store/                   Stores Zustand (panier)
sql/
  schema.sql               Schéma Postgres + triggers
  seed.sql                 Données de démonstration + admin initial
public/
  uploads/products/        Images produits uploadées (à conserver sur le volume)
```

## Sécurité

- Les mots de passe sont hachés avec `bcryptjs` (10 tours).
- Les sessions sont des JWT signés HS256 via `SESSION_SECRET`, posés dans un cookie httpOnly `silvio_session`.
- Le middleware Edge vérifie le JWT sans toucher à la base pour protéger `/compte/*` et `/admin/*`.
- Toutes les routes `/api/admin/*` revérifient côté serveur que l'utilisateur a le rôle `admin`.
- Le prix de chaque article est recalculé côté serveur au checkout pour empêcher toute altération depuis le panier client.

## Déploiement

L'app est prévue pour un déploiement sur une machine disposant d'un Postgres accessible.

1. Déployer Next.js (Vercel, VPS, Docker...)
2. S'assurer que `DATABASE_URL` pointe vers le Postgres de production
3. Renseigner les autres variables d'environnement (clés FedaPay `live` en production)
4. `NEXT_PUBLIC_SITE_URL` doit pointer vers le domaine de production
5. Configurer le webhook FedaPay vers `https://<domaine>/api/fedapay/webhook`
6. Monter un volume persistant pour `public/uploads/products/` (ou brancher un stockage objet en remplaçant `/api/admin/upload`)
