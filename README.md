# Crypto Follow 🚀

> Plateforme de Surveillance et d'Analyse des Marchés de Cryptomonnaies

[![CI/CD](https://github.com/t-chahbi/crypto-follow/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/t-chahbi/crypto-follow/actions/workflows/ci-cd.yml)
[![Tests](https://img.shields.io/badge/tests-52%20passing-brightgreen)](./docs/sprints/sprint-7-review.md)
[![Next.js](https://img.shields.io/badge/Next.js-16-blue)](https://nextjs.org/)

## 📋 Description

Crypto Follow est une plateforme complète de suivi, d'analyse et de simulation d'investissement en cryptomonnaies. Elle permet aux utilisateurs de :

- 📊 **Visualiser** les données du marché en temps réel (prix, volumes, capitalisation)
- 📈 **Analyser** avec des indicateurs techniques (SMA 7j/30j, détection de croisements)
- 🔮 **Prévoir** les tendances via régression linéaire
- 🔔 **Configurer** des alertes de prix personnalisées
- 💼 **Simuler** un portefeuille virtuel avec calcul de P&L

## 🛠️ Stack Technique

| Catégorie | Technologie |
|-----------|-------------|
| Frontend | Next.js 16, React 19, TypeScript |
| UI | HeroUI, TailwindCSS 4, Recharts |
| Backend | Supabase (Auth, PostgreSQL, RLS) |
| API Externe | CoinGecko API |
| Tests | Jest, React Testing Library |
| CI/CD | GitHub Actions, Docker |
| Infra | Kubernetes (k8s), k0s |

## 🚀 Installation

### Prérequis

- Node.js 18+
- npm ou yarn
- Compte Supabase

### Installation locale

```bash
# Cloner le repository
git clone https://github.com/t-chahbi/crypto-follow.git
cd crypto-follow

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés Supabase

# Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### Variables d'environnement

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service (pour le cron)
CRON_SECRET=secret_pour_authentifier_le_cron
DISCORD_WEBHOOK_URL=webhook_discord_optionnel
```

## 📂 Structure du Projet

```
crypto-follow/
├── app/                    # Pages Next.js App Router
│   ├── alerts/             # Gestion des alertes
│   ├── api/cron/           # API routes (vérification alertes)
│   ├── crypto/[id]/        # Détail d'une crypto
│   ├── dashboard/          # Tableau de bord principal
│   ├── login/              # Authentification
│   └── portfolio/          # Portefeuille virtuel
├── components/             # Composants React réutilisables
├── utils/                  # Fonctions utilitaires
│   ├── coingecko.ts        # API CoinGecko
│   ├── technicalIndicators.ts  # Calculs SMA
│   ├── prediction.ts       # Régression linéaire
│   ├── portfolio.ts        # Calculs P&L
│   └── notifications.ts    # Envoi alertes
├── __tests__/              # Tests unitaires
├── k8s/                    # Manifests Kubernetes
├── supabase/               # Schéma SQL & Docker Compose
└── docs/sprints/           # Sprint Reviews
```

## 🧪 Tests

```bash
# Exécuter tous les tests
npm test

# Mode watch
npm run test:watch

# Avec couverture
npm test -- --coverage
```

**Couverture actuelle :** 52 tests (95% utils, 60% components)

## 📊 Fonctionnalités

### Dashboard
- Statistiques globales du marché
- Tableau des 20 premières cryptos
- Variation 24h, capitalisation, volume

### Graphiques Avancés
- Courbe de prix sur 7 jours
- **SMA 7 jours** (ligne bleue)
- **SMA 30 jours** (ligne orange)
- Détection automatique Golden Cross / Death Cross

### Prévisions IA
- Régression linéaire sur historique
- Prédiction J+1 à J+7
- Indicateur de confiance (R²)
- Tendance (bullish/bearish/neutral)

### Alertes
- Création d'alertes personnalisées
- Conditions : SUPÉRIEUR À / INFÉRIEUR À
- Notifications email et Discord
- Cron de vérification (GitHub Actions)

### Portefeuille Virtuel
- Simulation d'achats/ventes
- Calcul P&L par actif
- P&L total et rendement %
- Prix moyen d'achat

## 🚢 Déploiement

### Docker

```bash
# Build
docker build -t crypto-follow .

# Run
docker run -p 3000:3000 crypto-follow
```

### Kubernetes

```bash
# Appliquer les manifests
kubectl apply -f k8s/

# Vérifier le déploiement
kubectl get pods -l app=crypto-monitor
```

## 📅 Sprints

| Sprint | Période | Thème | Statut |
|--------|---------|-------|--------|
| Sprint 4 | 5-12 Déc 2025 | Indicateurs Techniques | ✅ |
| Sprint 5 | 13-20 Déc 2025 | Système d'Alertes | ✅ |
| Sprint 6 | 21-28 Déc 2025 | Portefeuille Virtuel | ✅ |
| Sprint 7 | 29 Déc - 5 Jan | Tests & Qualité | ✅ |
| Sprint 8 | 6-8 Jan 2026 | Documentation | ✅ |

Voir les [Sprint Reviews](./docs/sprints/) pour les détails.

## 🔗 Liens Utiles

- [Suivi Agile (Notion)](https://www.notion.so/Application-GLA-2bdcac58509880e19c0ef7ca129dd152)
- [Diagrammes UML](./diagrammes_mermaid.md)
- [Documentation CoinGecko API](https://docs.coingecko.com/reference/introduction)

## 👥 Équipe

- **Thaha** - Développeur Full Stack

## 📄 Licence

Ce projet est réalisé dans le cadre du cours Application GLA - M1 Informatique.