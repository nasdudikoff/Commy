import simpleGit from "simple-git";
import fs from "fs";
import path from "path";
import { Mistral } from '@mistralai/mistralai';
import { config } from "dotenv";
config();

class GitCommitsProcessor {
    constructor(repoPath) {
        const options = {
            baseDir: repoPath,
            binary: 'git',
        };
        this.git = simpleGit(options);

        this.mistral = new Mistral({
            apiKey: process.env.MISTRAL_API_KEY
        });
    }

    async getCommitsSinceDate(date) {
        try {
            const formattedDate = date.toISOString().split('T')[0];
            const commits = await this.git.log({
                '--since': formattedDate,
                format: {
                    subject: '%s',
                    date: '%ci'
                }
            });

            return commits.all.map(commit => ({
                subject: commit.subject,
                date: new Date(commit.date).toLocaleDateString('fr-FR')
            }));
        } catch (error) {
            console.error('Erreur lors de la récupération des commits:', error);
            return [];
        }
    }

    async reformulateCommitsWithAI(commits) {
        try {
            // Prepare a single message with all commits
            const commitsText = commits
                .map(commit => `${commit.date}: ${commit.subject}`)
                .join('\n');

            const response = await this.mistral.chat.complete({
                model: "mistral-small-latest",
                messages: [{
                    role: 'user',
                    content: `Regroupe et reformule ces commits par date en tâches concises pour un rapport. Garde la structure originale avec les dates. Évite les répétitions et généralise si possible :\n${commitsText}`
                }],
            });

            // Parse the AI response
            const tasksText = response.choices[0].message.content || '';
            console.log(tasksText);

            return tasksText
        } catch (error) {
            console.error('Erreur lors de la transformation des commits:', error);
            return {};
        }
    }

    async processCommits(date) {
        console.log(`Récupération des commits depuis ${date.toISOString()}`);

        const commits = await this.getCommitsSinceDate(date);
        console.log(`Commits trouvés: ${commits.length}`);

        if (commits.length === 0) {
            console.log('Aucun commit trouvé.');
            return;
        }

        // Reformuler avec AI en un seul appel
        const tasks = await this.reformulateCommitsWithAI(commits);

        // Sauvegarde des tâches dans tasks.md
        const outputPath = path.join(process.cwd(), 'tasks.md');

        fs.writeFileSync(outputPath, tasks);
        console.log(`\nTâches sauvegardées dans ${outputPath}`);
    }
}

// Exemple d'utilisation
async function main() {
    if (!process.env.MISTRAL_API_KEY) {
        console.error('La clé API Mistral est manquante. Définissez-la dans un fichier .env');
        process.exit(1);
    }

    if (!process.env.FOLDER) {
        console.error("Le dossier du projet est manquant");
        process.exit(1)
    }

    const repoPath = process.env.FOLDER// Chemin du répertoire du projet
    const processor = new GitCommitsProcessor(repoPath);

    const LAST_DAY = process.env.LAST_DAY || 7;
    // Récupérer les commits des 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - LAST_DAY);

    await processor.processCommits(thirtyDaysAgo);
}

// Exécuter le script
main().catch(console.error);