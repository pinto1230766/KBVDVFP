# Guide de création d'APK - Gestion Visiteurs TJ

## Prérequis nécessaires

### 1. Installation d'Android Studio
- Téléchargez Android Studio depuis : https://developer.android.com/studio
- Installez-le avec les composants par défaut (SDK, émulateur, etc.)

### 2. Configuration des variables d'environnement
Ajoutez ces chemins à votre PATH système :
```
C:\Users\[VOTRE_NOM]\AppData\Local\Android\Sdk\platform-tools
C:\Users\[VOTRE_NOM]\AppData\Local\Android\Sdk\tools
```

### 3. Installation de Java JDK 11 ou 17
- Téléchargez depuis : https://adoptium.net/
- Configurez JAVA_HOME dans les variables d'environnement

## Étapes de génération de l'APK

### Étape 1 : Construction de l'application web
```bash
npm run build
```

### Étape 2 : Initialisation de Capacitor (première fois seulement)
```bash
npx cap init "Gestion Visiteurs TJ" "com.tj.gestionvisiteurs"
```

### Étape 3 : Ajout de la plateforme Android (première fois seulement)
```bash
npx cap add android
```

### Étape 4 : Synchronisation des fichiers
```bash
npx cap sync
```

### Étape 5 : Ouverture dans Android Studio
```bash
npx cap open android
```

### Étape 6 : Génération de l'APK dans Android Studio
1. Dans Android Studio, allez dans **Build > Build Bundle(s) / APK(s) > Build APK(s)**
2. Attendez la compilation
3. L'APK sera généré dans : `android/app/build/outputs/apk/debug/app-debug.apk`

## Script automatisé
Utilisez cette commande pour tout faire en une fois :
```bash
npm run build:android
```

## Optimisations pour mobile

L'application est déjà optimisée avec :
- ✅ Design responsive (mobile-first)
- ✅ Navigation tactile adaptée
- ✅ Stockage local (localStorage)
- ✅ PWA ready (manifest.json)
- ✅ Icônes et splash screen configurés

## Signature de l'APK pour production

Pour créer un APK signé pour le Play Store :

1. Générez une clé de signature :
```bash
keytool -genkey -v -keystore my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000
```

2. Dans Android Studio : **Build > Generate Signed Bundle / APK**

## Dépannage

### Erreur "SDK not found"
- Vérifiez que Android Studio est installé
- Configurez ANDROID_HOME dans les variables d'environnement

### Erreur de compilation
- Assurez-vous que Java JDK 11+ est installé
- Redémarrez votre terminal après installation

### L'app ne démarre pas
- Vérifiez que le dossier `dist` contient les fichiers buildés
- Exécutez `npm run build` avant `npx cap sync`
