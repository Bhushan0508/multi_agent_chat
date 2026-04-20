const axios = require('axios');

class SearchService {
    static async searchWeb(query) {
        try {
            // Very simple fallback search using a public API or duckduckgo HTML
            // Note: Since no specific Search API key was provided, we use a basic approach.
            // In production, SERP API, Tavily, or Google Custom Search should be used.
            const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`;
            const response = await axios.get(url);
            
            if (response.data && response.data.AbstractText) {
                return response.data.AbstractText;
            } else if (response.data && response.data.RelatedTopics && response.data.RelatedTopics.length > 0) {
                return response.data.RelatedTopics[0].Text;
            }
            
            return `No direct summarized answers found for '${query}'.`;
        } catch (error) {
            console.error('Search Service Error:', error.message);
            return 'Web search failed due to an error.';
        }
    }
}

module.exports = SearchService;
