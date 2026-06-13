const OLLAMA_BASE_URL = 'http://localhost:11434';

export const aiProvider = {
  /**
   * Universal generate call
   */
  async generate(prompt, model, providerConfig) {
    const { providerId, apiKey, baseUrl } = providerConfig;

    switch (providerId) {
      case 'ollama':
        return await this.generateOllama(prompt, model, baseUrl || OLLAMA_BASE_URL);
      case 'openai':
      case 'openrouter':
      case 'groq':
      case 'together':
      case 'fireworks':
        return await this.generateOpenAICompatible(prompt, model, apiKey, baseUrl, providerId);
      case 'anthropic':
        return await this.generateAnthropic(prompt, model, apiKey, baseUrl);
      case 'google':
        return await this.generateGoogle(prompt, model, apiKey);
      default:
        throw new Error(`Provider ${providerId} not supported.`);
    }
  },

  /**
   * OpenAI Compatible (covers many providers)
   */
  async generateOpenAICompatible(prompt, model, apiKey, baseUrl, providerId) {
    const url = baseUrl || 'https://api.openai.com/v1/chat/completions';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        ...(providerId === 'openrouter' ? { 'HTTP-Referer': window.location.origin, 'X-Title': 'Multi-Agent Platform' } : {})
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        stream: false
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  },

  /**
   * Local Ollama
   */
  async generateOllama(prompt, model, baseUrl) {
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      if (response.status === 404) throw new Error(`Model '${model}' not found in Ollama. Pull it with: ollama pull ${model}`);
      throw new Error(`Ollama error: ${errorBody.error || response.statusText}`);
    }

    const data = await response.json();
    return data.response;
  },

  /**
   * Anthropic Claude
   */
  async generateAnthropic(prompt, model, apiKey, baseUrl) {
    const url = baseUrl || 'https://api.anthropic.com/v1/messages';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'dangerously-allow-browser': 'true' // Note: Browsers usually block this due to CORS
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Anthropic Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  },

  /**
   * Google Gemini
   */
  async generateGoogle(prompt, model, apiKey) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Google Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  },

  /**
   * List models for a provider
   */
  async listModels(providerId, apiKey, baseUrl) {
    try {
      if (providerId === 'ollama') {
        const response = await fetch(`${baseUrl || OLLAMA_BASE_URL}/api/tags`);
        const data = await response.json();
        return (data.models || []).map(m => m.name);
      }
      
      // For OpenAI-compatible providers
      if (['openai', 'openrouter', 'groq', 'together', 'fireworks'].includes(providerId)) {
        const base = baseUrl ? baseUrl.replace('/chat/completions', '') : 'https://api.openai.com/v1';
        const response = await fetch(`${base}/models`, {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        const data = await response.json();
        return (data.data || []).map(m => m.id);
      }

      // Google Gemini — list models that support text generation.
      if (providerId === 'google') {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        return (data.models || [])
          .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
          .map(m => m.name.replace(/^models\//, ''));
      }

      return [];
    } catch (e) {
      console.error(`Failed to list models for ${providerId}:`, e);
      return [];
    }
  }
};
