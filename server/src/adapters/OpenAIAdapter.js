const OpenAI = require('openai');

class OpenAIAdapter {
    async generate(systemPrompt, userQuery, model, apiKey) {
        if (!apiKey) throw new Error('OpenAI API Key is required.');
        
        const openai = new OpenAI({ apiKey });

        try {
            const response = await openai.chat.completions.create({
                model: model || 'gpt-4o',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userQuery }
                ],
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error('OpenAI Error:', error.message);
            throw new Error(`OpenAI Error: ${error.message}`);
        }
    }
}

module.exports = OpenAIAdapter;
