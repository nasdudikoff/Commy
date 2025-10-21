# Commy - Assistant de Création de rapport à partir de commits avec Mistral AI

🚀 **Nouvelle Interface Graphique Disponible !** 🚀

Commy propose maintenant une interface web moderne et intuitive pour générer vos rapports d'activité Git, en plus du mode ligne de commande traditionnel.

## Prérequis

- Un compte [Mistral AI](https://console.mistral.ai/)
- Node.js installé sur votre machine

## Installation

1. **Créez un compte Mistral AI**

   - Rendez-vous sur [https://console.mistral.ai/](https://console.mistral.ai/)
   - Une fois connecté, allez sur [https://console.mistral.ai/api-keys](https://console.mistral.ai/api-keys)
   - Créez une nouvelle clé API

2. **Installez les dépendances**

   ```bash
   npm install
   ```

3. **Configurez l'environnement**

   - Créez un fichier `.env` à la racine du projet
   - Ajoutez les variables suivantes :
     ```env
     MISTRAL_API_KEY=VOTRE_CLE_API
     FOLDER='CHEMIN_VERS_VOTRE_DOSSIER_GIT'
     LAST_DAY=7 # Optionnel: Nombre de jours à analyser (par défaut: 7)
     AUTHOR='nom_auteur' # Optionnel: Filtre les commits par nom d'auteur
     ```
     Exemple :

   ```env
   MISTRAL_API_KEY=xyz123...
   FOLDER='F://projects//test'
   LAST_DAY=14
   AUTHOR='Jean'
   ```

   # Filtrage des commits par auteur

   Vous pouvez filtrer les commits par nom d'auteur en ajoutant la variable AUTHOR dans votre fichier .env :

   ```env
   AUTHOR='Jean' # Récupère uniquement les commits dont le nom d'auteur contient 'Jean'
   ```

   Exemple :

   - AUTHOR='Martin' : Analyse uniquement les commits des auteurs dont le nom contient 'Martin'
   - AUTHOR='dupont' : Analyse uniquement les commits des auteurs dont le nom contient 'dupont'

   # Nombre de jours à analyser

   Par défaut, l'application analyse les commits des 7 derniers jours.
   Vous pouvez modifier cette valeur en ajoutant la variable LAST_DAY dans votre fichier .env :

   ```env
   LAST_DAY=7 # Récupère les commits des 7 derniers jours
   ```

   Exemple :

   - LAST_DAY=1 : Analyse uniquement les commits du jour
   - LAST_DAY=30 : Analyse les commits du dernier mois

4. **Démarrez l'application**
   
   **Mode ligne de commande :**
   ```bash
   npm run cli
   ```
   
   **Mode interface web :**
   ```bash
   npm run web
   ```
   
   **Mode développement (avec auto-reload) :**
   ```bash
   npm run dev
   ```
   
   L'interface web sera disponible sur [http://localhost:3000](http://localhost:3000)

## Utilisation

### Interface Web (Recommandée)

1. **Lancez l'interface web :**
   ```bash
   npm run web
   ```

2. **Ouvrez votre navigateur** et allez sur [http://localhost:3000](http://localhost:3000)

3. **Remplissez le formulaire :**
   - **Clé API Mistral** : Votre clé API Mistral AI
   - **Dossier du Projet Git** : Chemin absolu vers votre répertoire Git
   - **Nombre de Jours** : Nombre de jours à analyser (par défaut: 7)
   - **Filtrer par Auteur** : Optionnel, filtre par nom d'auteur

4. **Cliquez sur "Générer le Rapport"** et suivez le progrès en temps réel

5. **Consultez le rapport** directement dans l'interface une fois généré

### Ligne de Commande (Mode Original)

Pour utiliser l'application en mode ligne de commande, créez un fichier `.env` avec les variables d'environnement et lancez :

```bash
npm run cli
```

Une fois l'application démarrée, les tâches générées seront disponibles dans le fichier `tasks.md`.

## Architecture du Projet

Le projet Commy est organisé de manière modulaire :

```
Commy/
├── cli/                    # Interface en ligne de commande
│   ├── index.js           # Point d'entrée CLI
│   └── commands/          # Commandes CLI futures
├── web/                   # Interface web
│   ├── server.js          # Serveur Express principal
│   ├── public/            # Fichiers statiques (HTML, CSS, JS)
│   └── routes/            # Routes API modulaires
│       ├── config.js      # Configuration (.env)
│       ├── process.js     # Traitement des commits
│       └── report.js      # Gestion des rapports
├── src/                   # Code partagé/core
│   ├── GitCommitsProcessor.js  # Processeur principal
│   └── services/          # Services métier
│       ├── GitService.js  # Gestion Git
│       └── MistralService.js  # Intégration Mistral AI
├── package.json
└── README.md
```

### Avantages de cette architecture :

- **Séparation claire** : CLI et Web dans des modules distincts
- **Code réutilisable** : Services partagés entre interfaces
- **Maintenabilité** : Chaque fichier a une responsabilité unique
- **Extensibilité** : Facile d'ajouter de nouvelles fonctionnalités
- **Testabilité** : Structure propice aux tests unitaires

## Support

Pour toute question ou problème, veuillez ouvrir une issue dans le dépôt GitHub.
