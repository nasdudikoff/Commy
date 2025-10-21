import { AIServiceInterface } from './AIServiceInterface.js';

export class GeminiAdapter extends AIServiceInterface {
    constructor(apiKey) {
        super(apiKey);
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    }

    async reformulateCommits(commits, author) {
        this.validateApiKey();

        const commitMessages = commits.map(commit =>
            `${commit.date}: ${commit.message}`
        ).join('\n');

        const prompt = `la réponse sera en français. Regroupe et reformule ces commits par date en tâches concises pour un rapport d'activité pour ${author}. Garde la structure originale avec les dates. Évite les répétitions et généralise si possible. Réponds uniquement avec les tâches reformulées, sans commentaires explicatifs ni conclusions :\n${commitMessages}`;

        try {
            const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1000
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erreur API Gemini: ${response.status} - ${errorData.error?.message}`);
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text.trim();
        } catch (error) {
            console.error(`Erreur Gemini pour ${author}:`, error);
            throw error;
        }
    }
}