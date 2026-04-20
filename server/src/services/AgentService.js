const { setupDatabase } = require('../models/db');

class AgentService {
    constructor(db) {
        this.db = db;
    }

    async getAgentById(id) {
        const agent = await this.db.get('SELECT * FROM agents WHERE id = ?', [id]);
        if (agent) {
            agent.expertise = JSON.parse(agent.expertise || '[]');
            agent.avoid = JSON.parse(agent.avoid || '[]');
        }
        return agent;
    }

    async getAgentsByGroup(groupId) {
        let query = 'SELECT * FROM agents';
        const params = [];
        
        if (groupId) {
            query += ' WHERE group_id = ?';
            params.push(groupId);
        }

        const agents = await this.db.all(query, params);
        return agents.map(a => ({
            ...a,
            expertise: JSON.parse(a.expertise || '[]'),
            avoid: JSON.parse(a.avoid || '[]')
        }));
    }

    async getAllAgents() {
        return await this.getAgentsByGroup(null);
    }

    async createAgent(agent) {
        const { name, group_id, expertise, avoid, type, system_prompt } = agent;
        return await this.db.run(
            `INSERT INTO agents (name, group_id, expertise, avoid, type, system_prompt) VALUES (?, ?, ?, ?, ?, ?)`,
            [name, group_id, JSON.stringify(expertise), JSON.stringify(avoid), type, system_prompt]
        );
    }
}

module.exports = AgentService;
