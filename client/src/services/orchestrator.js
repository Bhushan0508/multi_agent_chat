import { aiProvider } from './aiProvider';
import { storage } from './storage';
import { profileApi } from './profileApi';

export class Orchestrator {
  constructor() {
    this.agents = storage.getAgents();
    this.currentContext = []; // Simplified memory
    this._preambleCache = { value: '', fetchedAt: 0 };
  }

  async getProfilePreamble(slice = 'full') {
    const now = Date.now();
    if (now - this._preambleCache.fetchedAt < 30 * 1000 && this._preambleCache.slice === slice) {
      return this._preambleCache.value;
    }
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(`http://localhost:5000/api/secretary/context?slice=${slice}`, { signal: controller.signal });
      clearTimeout(t);
      if (!res.ok) return '';
      const data = await res.json();
      this._preambleCache = { value: data.preamble || '', slice, fetchedAt: now };
      return this._preambleCache.value;
    } catch {
      return '';
    }
  }

  invalidatePreambleCache() {
    this._preambleCache = { value: '', fetchedAt: 0 };
  }

  async route(query, mode = 'main', targetId = null, providerConfig) {
    let processedQuery = query;
    let isSearch = false;

    if (query.trim().startsWith('[SEARCH]')) {
      isSearch = true;
      const actualQuery = query.replace('[SEARCH]', '').trim();
      try {
        const res = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(actualQuery)}`);
        const data = await res.json();
        if (data.result) {
          processedQuery = `[Real-Time Web Context: ${data.result}]\n\nPlease answer the user's query utilizing the real-time context above if helpful.\nUser Query: ${actualQuery}`;
        } else {
          processedQuery = actualQuery;
        }
      } catch (e) {
        console.error('Search fetch failed:', e);
        processedQuery = actualQuery;
      }
    }

    const queryLower = (isSearch ? query.replace('[SEARCH]', '') : query).trim().toLowerCase();
    this.agents = storage.getAgents(); // Refresh agents list
    const settings = storage.getSettings();
    const defaultModelId = settings.general?.defaultModelId || 'llama3';

    const relevantAgents = this.agents.filter(agent => {
      // Secretary is special
      if (agent.role === 'secretary') return false;
      
      // Check avoid topics
      if (agent.avoid && agent.avoid.some(term => queryLower.includes(term.toLowerCase()))) {
        return false;
      }
      
      // Check expertise match
      return agent.expertise && agent.expertise.some(term => queryLower.includes(term.toLowerCase()));
    });

    let responses = [];

    if (mode === 'main') {
      // In main mode, only relevant agents respond
      for (const agent of relevantAgents) {
        const res = await this.getAgentResponse(agent, query, providerConfig, defaultModelId);
        responses.push({ agent: agent.name, content: res });
      }
    } else if (mode === 'group') {
      // In group mode, only agents in that group respond
      const groupAgents = this.agents.filter(a => a.groupId === targetId);
      for (const agent of groupAgents) {
        if (relevantAgents.includes(agent) || agent.role === 'secretary') {
          // Note: added secretary check if we want direct group addressing
        }
        
        // In group mode, every agent in the group responds to the query if pertinent
        if (groupAgents.length > 0) {
           const res = await this.getAgentResponse(agent, query, providerConfig, defaultModelId);
           responses.push({ agent: agent.name, content: res });
        }
      }
    } else if (mode === 'individual') {
      // Direct message to a single agent
      const agent = this.agents.find(a => a.id === targetId);
      if (agent) {
        const res = await this.getAgentResponse(agent, query, providerConfig, defaultModelId);
        responses.push({ agent: agent.name, content: res });
      }
    }

    // Call Personal Secretary if multiple responses found or specifically requested
    if (responses.length > 0 && mode !== 'individual') {
      const secretary = this.agents.find(a => a.role === 'secretary');
      if (secretary) {
        const summary = await this.getSecretaryResponse(secretary, query, responses, providerConfig, defaultModelId);
        responses.push({ agent: secretary.name, content: summary, isSummary: true });
      }
    }

    return responses;
  }

  async getAgentResponse(agent, query, providerConfig, defaultModelId) {
    const model = agent.model === 'default' || !agent.model ? defaultModelId : agent.model;

    const slice = agent.role === 'secretary' ? 'full' : 'trim';
    const profilePreamble = await this.getProfilePreamble(slice);

    let historyContext = "";
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout for memory fetch
      const memRes = await fetch(`http://localhost:5000/api/memory/${encodeURIComponent(agent.name)}`, {
          signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (memRes.ok) {
         const data = await memRes.json();
         if (data.history && data.history.length > 0) {
            // Trim history to the last 6 messages to prevent LLM overload
            const trimmed = data.history.slice(-6);
            historyContext = trimmed.map(msg => `${msg.role === 'user' ? 'User' : 'Agent'}: ${msg.content}`).join('\n\n') + '\n\n';
         }
      }
    } catch (e) {
      console.warn("Memory backend not reachable or timed out, using stateless mode.");
    }

    const profileBlock = profilePreamble ? `${profilePreamble}\n` : '';
    const prompt = `${agent.system_prompt}\n\n${profileBlock}${historyContext}User: ${query}\n\nAgent:`;
    const response = await aiProvider.generate(prompt, model, providerConfig);

    // Save back to memory asynchronously
    try {
      fetch(`http://localhost:5000/api/memory/${encodeURIComponent(agent.name)}`, { 
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ role: 'user', content: query })
      }).catch(()=>{});
      fetch(`http://localhost:5000/api/memory/${encodeURIComponent(agent.name)}`, { 
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ role: 'assistant', content: response })
      }).catch(()=>{});
    } catch (e) {}

    return response;
  }

  async getSecretaryResponse(secretary, originalQuery, agentResponses, providerConfig, defaultModelId) {
    const model = secretary.model === 'default' || !secretary.model ? defaultModelId : secretary.model;
    const context = agentResponses.map(r => `${r.agent}: ${r.content}`).join('\n\n');
    const profilePreamble = await this.getProfilePreamble('full');
    const profileBlock = profilePreamble ? `${profilePreamble}\n` : '';
    const prompt = `${secretary.system_prompt}\n\n${profileBlock}The user asked: "${originalQuery}"\n\nExisting Agent Responses:\n${context}\n\nPlease summarize these responses and provide a unified, personalized response that takes the user's profile into account. Start with "According to the experts..."`;
    
    const response = await aiProvider.generate(prompt, model, providerConfig);
    
    try {
      fetch(`http://localhost:5000/api/memory/${encodeURIComponent(secretary.name)}`, { 
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ role: 'user', content: originalQuery })
      }).catch(()=>{});
      fetch(`http://localhost:5000/api/memory/${encodeURIComponent(secretary.name)}`, { 
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ role: 'assistant', content: response })
      }).catch(()=>{});
    } catch (e) {}

    return response;
  }
}

export const orchestrator = new Orchestrator();
