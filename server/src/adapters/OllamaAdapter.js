const axios = require('axios');

class OllamaAdapter {
    constructor() {
        this.baseUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    }

    async generate(systemPrompt, userQuery, model, apiKey, history = []) {
        try {
            let fullPrompt = `${systemPrompt}\n\n`;
            
            // Append history
            if (history && history.length > 0) {
                history.forEach(msg => {
                    fullPrompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n\n`;
                });
            }

            fullPrompt += `User: ${userQuery}\nAssistant:`;

            const response = await axios.post(`${this.baseUrl}/api/generate`, {
                model: model || 'llama3',
                prompt: fullPrompt,
                stream: false
            });

            return response.data.response;
        } catch (error) {
            console.error('Ollama Error:', error.message);
            throw new Error('Failed to connect to local Ollama instance.');
        }
    }
}

module.exports = OllamaAdapter;
