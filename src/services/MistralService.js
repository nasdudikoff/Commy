export class MistralService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.mistral.ai/v1/chat/completions';
    }

    async reformulateCommits(commits, author) {
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
                    model: 'mistral-small-latest',
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
            console.error(`Erreur lors de la reformulation pour ${author}:`, error);
            throw error;
        }
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
}