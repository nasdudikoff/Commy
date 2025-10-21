import { AIServiceFactory } from './ai/AIServiceFactory.js';

export class MistralService {
    constructor(provider = 'mistral') {
        this.provider = provider;
        this.aiService = null;
    }

    setProvider(provider, apiKey) {
        this.provider = provider;
        this.aiService = AIServiceFactory.createService(provider, apiKey);
    }

    async reformulateCommits(commits, author) {
        if (!this.aiService) {
            // Fallback pour la compatibilité
            const apiKey = process.env.MISTRAL_API_KEY;
            this.aiService = AIServiceFactory.createService('mistral', apiKey);
        }

        return await this.aiService.reformulateCommits(commits, author);
    }

    async generateReport(authorTasks) {
        // Utiliser la même logique simple que dans votre fichier original
        const today = new Date().toLocaleDateString('fr-FR');
        let report = `# Rapport d'activité Git\n\nGénéré le: ${today}\n\n`;

        // Add tasks organized by author
        report += "## Activités par contributeur\n\n";

        for (const [author, tasks] of Object.entries(authorTasks)) {
            report += `### ${author}\n\n${tasks}\n\n`;
        }

        return report;
    }

    static getSupportedProviders() {
        return AIServiceFactory.getSupportedProviders();
    }
}