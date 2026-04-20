/**
 * AI Orchestrator Service
 * Handles routing of user messages to relevant agents.
 */

class AIOrchestrator {
    constructor(agentService, adapterManager, memoryService) {
        this.agentService = agentService;
        this.adapterManager = adapterManager;
        this.memoryService = memoryService;
    }

    async processMessage(conversation, message, settings) {
        const { type, id: conversationId } = conversation;
        const { content } = message;

        switch (type) {
            case 'main':
                return await this.routeToRelevantAgents(content, null, settings);
            case 'subgroup':
                return await this.routeToRelevantAgents(content, conversation.reference_id, settings);
            case 'individual':
                return await this.routeToAgent(content, conversation.reference_id, settings);
            case 'secretary':
                return await this.personalSecretaryMode(content, settings);
            default:
                throw new Error('Unknown conversation type');
        }
    }

    async routeToRelevantAgents(query, groupId, settings) {
        const agents = await this.agentService.getAgentsByGroup(groupId);
        const responses = [];

        for (const agent of agents) {
            if (this.isRelevant(query, agent)) {
                await this.memoryService.appendToMemory(agent.name, 'user', query);
                const response = await this.callAgent(query, agent, settings);
                await this.memoryService.appendToMemory(agent.name, 'assistant', response);
                responses.push({ agent: agent.name, content: response });
            }
        }
        return responses;
    }

    async routeToAgent(query, agentId, settings) {
        const agent = await this.agentService.getAgentById(agentId);
        if (this.isRelevant(query, agent)) {
            await this.memoryService.appendToMemory(agent.name, 'user', query);
            const response = await this.callAgent(query, agent, settings);
            await this.memoryService.appendToMemory(agent.name, 'assistant', response);
            return [{ agent: agent.name, content: response }];
        } else {
            return [{ 
                agent: agent.name, 
                content: `I am an expert in ${agent.expertise.join(', ')}. Your request falls outside my expertise. Please ask a relevant agent.` 
            }];
        }
    }

    async personalSecretaryMode(query, settings) {
        const allAgents = await this.agentService.getAllAgents();
        const relevantAgents = allAgents.filter(agent => this.isRelevant(query, agent));
        
        if (relevantAgents.length === 0) {
            return [{ agent: 'Personal Secretary', content: "I'm not sure which expert can help with that. Could you clarify your request?" }];
        }

        const responses = [];
        await this.memoryService.appendToMemory('Personal Secretary', 'user', query);
        for (const agent of relevantAgents) {
            await this.memoryService.appendToMemory(agent.name, 'user', query);
            const res = await this.callAgent(query, agent, settings);
            await this.memoryService.appendToMemory(agent.name, 'assistant', res);
            responses.push(`According to ${agent.name}: ${res}`);
        }

        const finalContent = responses.join('\n\n');
        await this.memoryService.appendToMemory('Personal Secretary', 'assistant', finalContent);
        return [{ agent: 'Personal Secretary', content: finalContent }];
    }

    isRelevant(query, agent) {
        const lowerQuery = query.toLowerCase();
        
        // Block if in 'avoid' list
        if (agent.avoid && agent.avoid.some(term => lowerQuery.includes(term.toLowerCase()))) {
            return false;
        }

        // Match if in 'expertise' list
        return agent.expertise.some(term => lowerQuery.includes(term.toLowerCase()));
    }

    async callAgent(query, agent, settings) {
        const { provider, model, api_keys } = settings;
        const memoryContext = await this.memoryService.getAgentContext(agent);
        
        return await this.adapterManager.generateResponse(
            memoryContext.systemPrompt, 
            query, 
            provider, 
            model, 
            api_keys, 
            memoryContext.history
        );
    }
}

module.exports = AIOrchestrator;
