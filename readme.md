# Commy - Assistant de Création de rapport à partir de commits avec Mistral AI

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
   ```bash
   npm run start
   ```

## Utilisation

Une fois l'application démarrée, les tâches générées seront disponibles dans le fichier `tasks.md`.

## Support

Pour toute question ou problème, veuillez ouvrir une issue dans le dépôt GitHub.
