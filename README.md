# 🏛️ Gestion des Visiteurs TJ - DV.FP

![GHBanner](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

Application complète de gestion des orateurs visiteurs pour les congrégations des Témoins de Jéhovah, développée pour le Groupe Témoin de Jéhovah Capverdien - Lyon.

## ✨ Fonctionnalités principales

### 📅 Gestion des visites

- **Planification avancée** : Programmez des visites avec types (Présentiel, Zoom, Streaming)
- **Filtres intelligents** : Actives, En attente, Confirmé, Annulé
- **Calendrier intégré** : Vue mensuelle avec navigation intuitive
- **Statuts dynamiques** : Suivi en temps réel de l'état des visites

### 👥 Base de données des orateurs

- **Profils complets** : Nom, congrégation, téléphone, notes
- **Historique des discours** : Suivi des interventions passées
- **Disponibilités** : Gestion des créneaux disponibles
- **Import Google Sheets** : Synchronisation automatique

### 🏠 Attribution d'hôtes

- **Assignment automatique** : Algorithme intelligent d'attribution
- **Gestion des hébergements** : Logement, repas, transport
- **Profils d'hôtes** : Capacités, préférences, disponibilités
- **Notifications** : Alertes automatiques aux hôtes

### 💬 Système de messagerie bilingue

- **Français & Capverdien** : Support complet des deux langues
- **5 types de messages** :
  - 📋 Besoins (collecte d'informations)
  - 📚 Préparation (instructions pré-visite)
  - ⏰ Rappel 7 jours (confirmation)
  - 🔔 Rappel 2 jours (dernière ligne droite)
  - 🙏 Remerciements (post-visite)
- **Personnalisation** : Templates modifiables avec signature
- **Génération automatique** : Messages adaptés au contexte

### 📱 Application mobile native

- **APK Android** : Installation directe sur mobile
- **Icône JW.ORG/DV.FP** : Design officiel avec couleurs thématiques
- **Fonctionnement hors ligne** : Stockage local complet
- **Interface responsive** : Optimisée pour tous les écrans

### 🔄 Synchronisation Google Sheets

- **Import automatique** : Lecture des onglets multiples
- **Prévention des doublons** : Algorithme de détection intelligent
- **Mise à jour temps réel** : Synchronisation bidirectionnelle
- **Configuration simple** : Paramétrage via interface

## 🚀 Installation et déploiement

### Prérequis

- **Node.js** 18+
- **npm** ou **yarn**
- **Android Studio** (pour APK)
- **Compte Google Cloud** (pour Google Sheets API)

### Installation locale

```bash
# Cloner le dépôt
git clone https://github.com/pinto1230766/KBVDVFP.git
cd KBVDVFP

# Installer les dépendances
npm install

# Configuration (optionnel)
cp .env.example .env
# Éditer .env avec vos paramètres Google

# Lancer en développement
npm run dev
```

### Configuration Google Sheets API

1. **Google Cloud Console** : [console.cloud.google.com](https://console.cloud.google.com/)
2. **Créer un projet** ou sélectionner existant
3. **Activer l'API** : Google Sheets API
4. **Créer une clé API** : Identifiants > Créer des identifiants > Clé API
5. **Configurer dans l'app** : Paramètres > Synchronisation Google Sheets

### Génération APK Android

```bash
# Build production
npm run build

# Synchronisation Capacitor
npm run cap:sync

# Ouverture Android Studio
npm run cap:open android

# Ou commande complète
npm run build:android
```

Dans Android Studio :

1. **Build > Build Bundle(s) / APK(s) > Build APK(s)**
2. Attendre la compilation (2-5 minutes)
3. Récupérer l'APK dans `android/app/build/outputs/apk/debug/`

## 🏗️ Architecture technique

### Stack technologique

- **Frontend** : React 19.1.1 + TypeScript
- **Build** : Vite 6.2.0
- **Styling** : Tailwind CSS (CDN)
- **Mobile** : Capacitor 7.4.3
- **Icons** : Font Awesome + SVG personnalisés
- **Stockage** : localStorage (persistance locale)

### Structure du projet

```text
├── components/              # Composants React
│   ├── Dashboard.tsx       # Tableau de bord principal
│   ├── UpcomingVisits.tsx  # Liste des visites
│   ├── ScheduleVisitModal.tsx # Planification
│   ├── MessageGeneratorModal.tsx # Génération messages
│   ├── CalendarView.tsx    # Vue calendrier
│   ├── Icons.tsx           # Icônes personnalisées
│   └── ...
├── contexts/               # Gestion d'état global
│   ├── DataContext.tsx     # Données principales
│   ├── ToastContext.tsx    # Notifications
│   └── ConfirmContext.tsx  # Confirmations
├── hooks/                  # Hooks personnalisés
│   ├── useLocalStorage.ts  # Persistance locale
│   └── useVisitNotifications.ts # Notifications
├── utils/                  # Utilitaires
├── assets/                 # Ressources statiques
├── public/                 # Fichiers publics
│   ├── icons/             # Icônes PWA
│   └── favicon.svg        # Favicon JW.ORG/DV.FP
├── android/               # Projet Android Capacitor
├── capacitor.config.ts    # Configuration Capacitor
├── manifest.json          # Manifest PWA
└── README.md             # Documentation
```

### Fonctionnalités avancées

- **PWA** : Progressive Web App avec manifest
- **Thème adaptatif** : Mode sombre/clair automatique
- **Stockage résilient** : Sauvegarde locale + synchronisation cloud
- **Interface multilingue** : Français/Capverdien intégré
- **Notifications** : Système de toast et confirmations
- **Accessibilité** : Attributs ARIA complets

## 🎨 Design et UX

### Identité visuelle JW.ORG/DV.FP

- **Couleurs principales** : Bleu #2E5A87, Or #D4AF37
- **Icône officielle** : Couronne de laurier, épis de blé, texte JW/DV.FP
- **Typographie** : Serif pour titres, Sans-serif pour contenu
- **Thème cohérent** : Respect des guidelines JW.ORG

### Interface utilisateur

- **Navigation intuitive** : Onglets clairs et logiques
- **Responsive design** : Adaptation mobile/desktop
- **Feedback visuel** : Animations CSS, états de chargement
- **Accessibilité** : Contraste, navigation clavier, lecteurs d'écran

## 📊 Données et persistance

### Stockage local (localStorage)

- **Orateurs** : Profils complets avec historique
- **Visites** : Planification et statuts
- **Hôtes** : Informations et disponibilités
- **Templates** : Messages personnalisés
- **Paramètres** : Configuration utilisateur

### Synchronisation Google Sheets

- **Lecture multi-onglets** : Support de structures complexes
- **Détection des doublons** : Évite les conflits de données
- **Mise à jour incrémentale** : Optimisation des performances
- **Gestion d'erreurs** : Retry automatique, fallback local

## 🔧 Configuration et personnalisation

### Variables d'environnement (.env)

```env
# Google Sheets API
VITE_GOOGLE_API_KEY=votre_cle_api
VITE_GOOGLE_SHEET_ID=votre_sheet_id

# Gemini AI (optionnel)
GEMINI_API_KEY=votre_cle_gemini
```

### Paramètres intégrés

- **Google Sheet ID** : `1drIzPPi6AohCroSyUkF1UmMFxuEtMACBF4XATDjBOcg`
- **Google API Key** : Pré-configurée pour déploiement
- **Thème** : JW.ORG officiel avec couleurs adaptées
- **Langues** : Français (principal), Capverdien (secondaire)

## 📱 Déploiement mobile

### APK Android

- **Nom d'app** : "Gestion Visiteurs TJ - DV.FP"
- **Package ID** : `com.tj.gestionvisiteurs`
- **Icône** : Design JW.ORG/DV.FP officiel
- **Permissions** : Internet (synchronisation), Stockage (données)
- **Taille** : ~15 MB (optimisée)

### Installation utilisateur

1. **Télécharger l'APK** depuis les releases GitHub
2. **Autoriser sources inconnues** dans Android
3. **Installer l'application**
4. **Première ouverture** : Configuration automatique
5. **Synchronisation** : Connexion Google Sheets immédiate

## 🤝 Contribution et support

### Développement

- **Issues** : Rapporter bugs et suggestions
- **Pull Requests** : Contributions bienvenues
- **Code Style** : TypeScript strict, ESLint, Prettier
- **Tests** : Couverture recommandée pour nouvelles fonctionnalités

### Support utilisateur

- **Documentation** : Guide utilisateur intégré
- **Formation** : Sessions de prise en main disponibles
- **Maintenance** : Mises à jour régulières
- **Assistance** : Support technique dédié

## 📄 Licence et crédits

### Licence

Ce projet est sous **licence MIT** - voir le fichier [LICENSE](LICENSE) pour détails.

### Crédits

- **Développement** : Équipe technique DV.FP
- **Design** : Basé sur les guidelines JW.ORG
- **Communauté** : Groupe Témoin de Jéhovah Capverdien - Lyon
- **Technologies** : React, Capacitor, Google APIs

---

### 🏛️ Développé avec ❤️ pour la communauté des Témoins de Jéhovah

Application officielle du Groupe Témoin de Jéhovah Capverdien - Lyon (DV.FP)
#   K B V D V F P 
 
 

