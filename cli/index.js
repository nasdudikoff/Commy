import { GitCommitsProcessor } from '../src/GitCommitsProcessor.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    try {
        console.log('🚀 Démarrage de Commy CLI...');

        // Lecture des variables d'environnement
        const folder = process.env.FOLDER;
        const lastDay = parseInt(process.env.LAST_DAY) || 7;
        const author = process.env.AUTHOR;

        if (!folder) {
            throw new Error('❌ Variable FOLDER non définie dans le fichier .env');
        }

        if (!process.env.MISTRAL_API_KEY) {
            throw new Error('❌ Variable MISTRAL_API_KEY non définie dans le fichier .env');
        }

        console.log(`📁 Dossier: ${folder}`);
        console.log(`📅 Derniers ${lastDay} jours`);
        if (author) {
            console.log(`👤 Filtre auteur: ${author}`);
        }

        // Initialisation du processeur
        const processor = new GitCommitsProcessor(folder);

        // Validation du repository
        console.log('\n🔍 Validation du repository Git...');
        const isValidRepo = await processor.validateRepository();
        if (!isValidRepo) {
            throw new Error(`❌ Le dossier "${folder}" n'est pas un repository Git valide`);
        }
        console.log('✅ Repository Git valide');

        // Information du repository
        const repoInfo = await processor.getRepositoryInfo();
        console.log(`📡 Branche: ${repoInfo.currentBranch}`);
        console.log(`🔗 Remote: ${repoInfo.remoteUrl}`);

        if (author) {
            processor.setAuthorFilter(author);
        }

        // Récupération des commits
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - lastDay);

        console.log('\n📊 Récupération des commits...');
        const commits = await processor.getCommitsSinceDate(daysAgo);

        if (commits.length === 0) {
            console.log('❌ Aucun commit trouvé pour la période spécifiée.');
            return;
        }

        console.log(`✅ ${commits.length} commits trouvés`);

        // Regroupement par auteur
        console.log('\n👥 Regroupement par auteur...');
        const authorCommits = processor.groupCommitsByAuthor(commits);
        console.log(`✅ ${Object.keys(authorCommits).length} contributeurs trouvés`);

        // Affichage des statistiques
        for (const [author, authorCommitsList] of Object.entries(authorCommits)) {
            console.log(`   - ${author}: ${authorCommitsList.length} commits`);
        }

        // Reformulation avec Mistral
        console.log('\n🤖 Reformulation avec Mistral AI...');
        const authorTasks = await processor.reformulateCommitsByAuthor(authorCommits);

        // Génération du rapport
        console.log('\n📝 Génération du rapport...');
        const fullReport = await processor.generateReport(authorTasks);

        // Sauvegarde
        const outputPath = path.join(process.cwd(), 'tasks.md');
        fs.writeFileSync(outputPath, fullReport);

        console.log(`\n✅ Rapport généré avec succès: ${outputPath}`);
        console.log(`📄 ${fullReport.split('\n').length} lignes générées`);

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
}

// Gestion des signaux pour arrêt propre
process.on('SIGINT', () => {
    console.log('\n👋 Arrêt demandé par l\'utilisateur');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n👋 Arrêt du processus');
    process.exit(0);
});

main();