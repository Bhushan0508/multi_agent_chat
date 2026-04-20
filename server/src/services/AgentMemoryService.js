const fs = require('fs');
const path = require('path');

class AgentMemoryService {
    constructor() {
        this.contextDir = path.join(__dirname, '../context');
        if (!fs.existsSync(this.contextDir)) {
            fs.mkdirSync(this.contextDir, { recursive: true });
        }
    }

    getFilePath(agentName) {
        const safeName = agentName.toLowerCase().replace(/[^a-z0-9]/g, '_');
        return path.join(this.contextDir, `${safeName}.md`);
    }

    async getAgentContext(agent) {
        const filePath = this.getFilePath(agent.name);
        if (!fs.existsSync(filePath)) {
            // Initialize memory
            const content = `# Identity\nYou are ${agent.name}. Expertise: ${agent.expertise.join(', ')}. Avoid: ${agent.avoid.join(', ')}. Use your expertise only.\n\n# History\n`;
            fs.writeFileSync(filePath, content, 'utf8');
            return { systemPrompt: content.split('# History')[0].trim(), history: [] };
        }

        const data = fs.readFileSync(filePath, 'utf8');
        const [identityPart, historyPart] = data.split('# History');
        
        const historyText = historyPart ? historyPart.trim() : '';
        const historyLines = historyText.split('\n').filter(l => l.trim() !== '');
        
        const history = [];
        let currentRole = null;
        let currentContent = '';

        for (const line of historyLines) {
            if (line.startsWith('**User**:')) {
                if (currentRole) history.push({ role: currentRole, content: currentContent.trim() });
                currentRole = 'user';
                currentContent = line.replace('**User**:', '').trim();
            } else if (line.startsWith(`**${agent.name}**:`)) {
                if (currentRole) history.push({ role: currentRole, content: currentContent.trim() });
                currentRole = 'assistant';
                currentContent = line.replace(`**${agent.name}**:`, '').trim();
            } else {
                currentContent += '\n' + line;
            }
        }
        if (currentRole) {
            history.push({ role: currentRole, content: currentContent.trim() });
        }

        return {
            systemPrompt: identityPart ? identityPart.trim() : `You are ${agent.name}.`,
            history
        };
    }

    async appendToMemory(agentName, role, content) {
        const filePath = this.getFilePath(agentName);
        const prefix = role === 'user' ? '**User**:' : `**${agentName}**:`;
        const entry = `\n${prefix} ${content}\n`;
        try {
            fs.appendFileSync(filePath, entry, 'utf8');
        } catch (e) {
            console.error('Failed to append to memory for', agentName, e);
        }
    }
}

module.exports = AgentMemoryService;
