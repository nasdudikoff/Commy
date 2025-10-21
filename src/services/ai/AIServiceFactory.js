import { MistralAdapter } from './MistralAdapter.js';
import { OpenAIAdapter } from './OpenAIAdapter.js';
import { GeminiAdapter } from './GeminiAdapter.js';
import { ClaudeAdapter } from './ClaudeAdapter.js';

export class AIServiceFactory {
    static createService(provider, apiKey) {
        switch (provider.toLowerCase()) {
            case 'mistral':
                return new MistralAdapter(apiKey);
            case 'openai':
            case 'chatgpt':
                return new OpenAIAdapter(apiKey);
            case 'gemini':
            case 'google':
                return new GeminiAdapter(apiKey);
            case 'claude':
            case 'anthropic':
                return new ClaudeAdapter(apiKey);
            default:
                throw new Error(`Provider '${provider}' non supporté. Providers disponibles: mistral, openai, gemini, claude`);
        }
    }

    static getSupportedProviders() {
        return [
            { id: 'mistral', name: 'Mistral AI', apiKeyEnv: 'MISTRAL_API_KEY' },
            { id: 'openai', name: 'OpenAI (ChatGPT)', apiKeyEnv: 'OPENAI_API_KEY' },
            { id: 'gemini', name: 'Google Gemini', apiKeyEnv: 'GEMINI_API_KEY' },
            { id: 'claude', name: 'Anthropic Claude', apiKeyEnv: 'CLAUDE_API_KEY' }
        ];
    }
}