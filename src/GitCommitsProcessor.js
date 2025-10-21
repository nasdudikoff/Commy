import { GitService } from './services/GitService.js';
import { MistralService } from './services/MistralService.js';
import { AIServiceFactory } from './services/ai/AIServiceFactory.js';

export class GitCommitsProcessor {
    constructor(repositoryPath, aiProvider = 'mistral') {
        this.gitService = new GitService(repositoryPath);
        this.authorFilter = null;
        this.repositoryPath = repositoryPath;
        this.aiProvider = aiProvider;
        this.mistralService = new MistralService(aiProvider);
    }

    setAuthorFilter(author) {
        this.authorFilter = author;
    }

    setAIProvider(provider, apiKey) {
        this.aiProvider = provider;
        this.mistralService.setProvider(provider, apiKey);
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
        // Déterminer quelle clé API utiliser selon le provider
        const providers = AIServiceFactory.getSupportedProviders();
        const currentProvider = providers.find(p => p.id === this.aiProvider);

        if (!currentProvider) {
            throw new Error(`Provider '${this.aiProvider}' non supporté`);
        }

        const apiKey = process.env[currentProvider.apiKeyEnv];
        if (!apiKey) {
            throw new Error(`${currentProvider.apiKeyEnv} non définie dans les variables d'environnement`);
        }

        // Configurer le service AI
        this.mistralService.setProvider(this.aiProvider, apiKey);

        const authorTasks = {};

        for (const [author, commits] of Object.entries(authorCommits)) {
            console.log(`Reformulation des commits pour ${author} avec ${currentProvider.name}...`);
            try {
                authorTasks[author] = await this.mistralService.reformulateCommits(commits, author);
            } catch (error) {
                console.error(`Erreur pour ${author}:`, error.message);
                // Fallback: format simple
                authorTasks[author] = commits.map(commit => `- ${commit.message}`).join('\n');
            }
        }

        return authorTasks;
    }

    async generateReport(authorTasks) {
        return await this.mistralService.generateReport(authorTasks);
    }
}