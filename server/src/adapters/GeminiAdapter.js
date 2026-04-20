const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiAdapter {
    async generate(systemPrompt, userQuery, model, apiKey) {
        if (!apiKey) throw new Error('Gemini API Key is required.');
        
        const genAI = new GoogleGenerativeAI(apiKey);
        const modelInstance = genAI.getGenerativeModel({ model: model || 'gemini-1.5-flash' });

        try {
            const prompt = `${systemPrompt}\n\nUser: ${userQuery}`;
            const result = await modelInstance.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Gemini Error:', error.message);
            throw new Error(`Gemini Error: ${error.message}`);
        }
    }
}

module.exports = GeminiAdapter;
