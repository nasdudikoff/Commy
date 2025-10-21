import { AIServiceInterface } from './AIServiceInterface.js';

export class ClaudeAdapter extends AIServiceInterface {
    constructor(apiKey) {
        super(apiKey);
        this.baseUrl = 'https://api.anthropic.com/v1/messages';
        this.model = 'claude-3-haiku-20240307';
    }

    async reformulateCommits(commits, author) {
        this.validateApiKey();

        const commitMessages = commits.map(commit =>
            `${commit.date}: ${commit.message}`
        ).join('\n');

        const prompt = `la réponse sera en français. Regroupe et reformule ces commits par date en tâches concises pour un rapport d'activité pour ${author}. Garde la structure originale avec les dates. Évite les répétitions et généralise si possible. Réponds uniquement avec les tâches reformulées, sans commentaires explicatifs ni conclusions :\n${commitMessages}`;

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: this.model,
                    max_tokens: 1000,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erreur API Claude: ${response.status} - ${errorData.error?.message}`);
            }

            const data = await response.json();
            return data.content[0].text.trim();
        } catch (error) {
            console.error(`Erreur Claude pour ${author}:`, error);
            throw error;
        }
    }
}