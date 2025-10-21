export class AIServiceInterface {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    async reformulateCommits(commits, author) {
        throw new Error('Method reformulateCommits must be implemented');
    }

    validateApiKey() {
        if (!this.apiKey) {
            throw new Error('API Key is required');
        }
    }
}