import { GitService } from './services/GitService.js';
import { MistralService } from './services/MistralService.js';

export class GitCommitsProcessor {
    constructor(repositoryPath) {
        this.gitService = new GitService(repositoryPath);
        this.authorFilter = null;
        this.repositoryPath = repositoryPath;
    }

    setAuthorFilter(author) {
        this.authorFilter = author;
    }

    async validateRepository() {
        return await this.gitService.validateRepository();
    }

    async getRepositoryInfo() {
        return await this.gitService.getRepositoryInfo();
    }

    async getCommitsSinceDate(sinceDate) {
        const commits = await this.gitService.getCommitsSinceDate(sinceDate);

        if (this.authorFilter) {
            return commits.filter(commit =>
                commit.author.toLowerCase().includes(this.authorFilter.toLowerCase())
            );
        }

        return commits;
    }

    groupCommitsByAuthor(commits) {
        return commits.reduce((grouped, commit) => {
            if (!grouped[commit.author]) {
                grouped[commit.author] = [];
            }
            grouped[commit.author].push(commit);
            return grouped;
        }, {});
    }

    async reformulateCommitsByAuthor(authorCommits) {
        const apiKey = process.env.MISTRAL_API_KEY;
        if (!apiKey) {
            throw new Error('MISTRAL_API_KEY non définie dans les variables d\'environnement');
        }

        const mistralService = new MistralService(apiKey);
        const authorTasks = {};

        for (const [author, commits] of Object.entries(authorCommits)) {
            console.log(`Reformulation des commits pour ${author}...`);
            try {
                authorTasks[author] = await mistralService.reformulateCommits(commits, author);
            } catch (error) {
                console.error(`Erreur pour ${author}:`, error.message);
                // Fallback: format simple
                authorTasks[author] = commits.map(commit => `- ${commit.message}`).join('\n');
            }
        }

        return authorTasks;
    }

    async generateReport(authorTasks) {
        const apiKey = process.env.MISTRAL_API_KEY;
        if (!apiKey) {
            throw new Error('MISTRAL_API_KEY non définie dans les variables d\'environnement');
        }

        const mistralService = new MistralService(apiKey);

        try {
            return await mistralService.generateReport(authorTasks);
        } catch (error) {
            console.error('Erreur lors de la génération du rapport:', error.message);
            // Fallback: rapport simple
            const today = new Date().toLocaleDateString('fr-FR');
            let report = `# Rapport d'activité - ${today}\n\n`;

            for (const [author, tasks] of Object.entries(authorTasks)) {
                report += `## ${author}\n\n${tasks}\n\n`;
            }

            return report;
        }
    }
}