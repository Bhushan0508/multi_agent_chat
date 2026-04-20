import json
from typing import List, Optional
from models.models import Agent
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

class AgentOrchestrator:
    @staticmethod
    async def get_relevant_agents(db: AsyncSession, query: str) -> List[Agent]:
        """
        Parses user input and identifies relevant agents using keyword matching.
        """
        query_lower = query.lower()
        
        # In a real app, this would use embeddings or a more advanced search
        result = await db.execute(select(Agent))
        all_agents = result.scalars().all()
        
        relevant = []
        for agent in all_agents:
            expertise = json.loads(agent.expertise) if agent.expertise else []
            avoid = json.loads(agent.avoid_topics) if agent.avoid_topics else []
            
            # Check for avoid topics
            if any(term.lower() in query_lower for term in avoid):
                continue
                
            # Check for expertise match
            if any(term.lower() in query_lower for term in expertise):
                relevant.append(agent)
                
        return relevant

    @staticmethod
    async def generate_agent_response(agent: Agent, query: str) -> str:
        """
        Mock response generation. In production, this calls OpenAI/Gemini.
        """
        # Placeholder for LLM call
        return f"According to {agent.name}: I have analyzed your request regarding my expertise in {agent.expertise}. Here is my expert opinion..."

orchestrator = AgentOrchestrator()
