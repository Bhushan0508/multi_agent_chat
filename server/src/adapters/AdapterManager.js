const OllamaAdapter = require('./OllamaAdapter');
const OpenAIAdapter = require('./OpenAIAdapter');
const GeminiAdapter = require('./GeminiAdapter');

class AdapterManager {
    constructor() {
        this.adapters = {
            ollama: new OllamaAdapter(),
            openai: new OpenAIAdapter(),
            gemini: new GeminiAdapter(),
            claude: null // To be implemented
        };
    }

    async generateResponse(systemPrompt, userQuery, provider, model, apiKeys, history = []) {
        const adapter = this.adapters[provider];
        if (!adapter) {
            throw new Error(`Provider ${provider} not supported or not implemented.`);
        }

        const apiKey = apiKeys ? apiKeys[provider] : null;
        return await adapter.generate(systemPrompt, userQuery, model, apiKey, history);
    }
}

module.exports = AdapterManager;
