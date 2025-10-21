# Structure du Projet Commy

## 🏗️ Architecture Modulaire

Le projet Commy a été restructuré pour une meilleure organisation et maintenabilité :

### 📂 Dossiers Principaux

- **`cli/`** : Interface en ligne de commande
- **`web/`** : Interface web avec serveur Express
- **`src/`** : Code partagé et services métier

### 🔧 Services Core

- **`GitCommitsProcessor`** : Processeur principal
- **`GitService`** : Gestion des opérations Git
- **`MistralService`** : Intégration avec l'API Mistral AI

### 🌐 Routes Web Modulaires

- **`config.js`** : Gestion de la configuration (.env)
- **`process.js`** : Traitement des commits et génération
- **`report.js`** : Accès aux rapports générés

## 🚀 Scripts Disponibles

```bash
# Interface ligne de commande
npm run cli

# Interface web
npm run web

# Mode développement (avec auto-reload)
npm run dev
```

## 🎯 Avantages de cette Architecture

- ✅ **Séparation des responsabilités**
- ✅ **Code réutilisable entre CLI et Web**
- ✅ **Facilité de maintenance**
- ✅ **Extensibilité pour nouvelles fonctionnalités**
- ✅ **Structure propice aux tests**

## 🔄 Migration Effectuée

- ✅ Séparation CLI / Web
- ✅ Création des services métier
- ✅ Routes modulaires
- ✅ Configuration centralisée
- ✅ Documentation mise à jour