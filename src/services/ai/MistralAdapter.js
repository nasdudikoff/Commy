import { AIServiceInterface } from './AIServiceInterface.js';

export class MistralAdapter extends AIServiceInterface {
    constructor(apiKey) {
        super(apiKey);
        this.baseUrl = 'https://api.mistral.ai/v1/chat/completions';
        this.model = 'mistral-small-latest';
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
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`Erreur API Mistral: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content.trim();
        } catch (error) {
            console.error(`Erreur Mistral pour ${author}:`, error);
            throw error;
        }
    }
}