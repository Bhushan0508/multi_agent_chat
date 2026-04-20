const OLLAMA_BASE_URL = 'http://localhost:11434';

export const ollama = {
  async generate(prompt, model = 'llama3', options = {}) {
    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: options.temperature || 0.7,
            num_ctx: 4096,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 404) {
          throw new Error(`Model '${model}' not found. Please pull it using 'ollama pull ${model}' or select a different model in settings.`);
        }
        throw new Error(errorData.error || `Ollama error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Ollama Service Error:', error);
      if (error.message.includes('Failed to fetch')) {
        throw new Error(`Could not connect to local Ollama. Ensure it is running at ${OLLAMA_BASE_URL} and OLLAMA_ORIGINS="*" is set.`);
      }
      throw error;
    }
  },

  async listModels() {
    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
      if (!response.ok) throw new Error('Failed to fetch models');
      const data = await response.json();
      return (data.models || []).map(m => m.name);
    } catch (error) {
      console.error('Error listing models:', error);
      return [];
    }
  },

  async checkConnection() {
    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
};
