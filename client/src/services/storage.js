const STORAGE_KEYS = {
  AGENTS: 'wa_ai_agents',
  GROUPS: 'wa_ai_groups',
  CHATS: 'wa_ai_chats',
  PROFILE: 'wa_ai_profile',
  SETTINGS: 'wa_ai_settings',
};

const INITIAL_AGENTS = [
  {
    id: 'health-advisor',
    name: 'Health Advisor',
    groupId: 'wellness',
    expertise: ['medicine', 'nutrition', 'detox', 'healing', 'diet'],
    avoid: ['astrology', 'religion', 'politics'],
    system_prompt: 'You are a naturopathy expert. Only answer using natural healing methods. Be concise and professional.',
    model: 'default',
    description: 'Expert in natural healing and detox methods.',
    avatar: null
  },
  {
    id: 'tech-guru',
    name: 'Tech Guru',
    groupId: 'main',
    expertise: ['coding', 'ai', 'gadgets', 'software', 'hardware'],
    avoid: ['cooking', 'gardening'],
    system_prompt: 'You are a veteran software engineer and tech enthusiast. Explain concepts simply but accurately.',
    model: 'default',
    description: 'Specialist in cutting-edge tech and software development.',
    avatar: null
  },
  {
    id: 'personal-secretary',
    name: 'Personal Secretary',
    groupId: 'main',
    expertise: ['summary', 'scheduling', 'aggregation'],
    avoid: [],
    system_prompt: 'You are a personal secretary. You have access to all agent conversations. Your job is to aggregate information and provide a unified response.',
    model: 'default',
    role: 'secretary',
    description: 'Your intelligent assistant for session summaries.',
    avatar: null,
    icon: 'user'
  }
];

const INITIAL_GROUPS = [
  {
    id: 'main',
    name: 'Main Office',
    description: 'Global workspace for all agents.',
    avatar: null,
    parentId: null,
    agentIds: ['tech-guru', 'personal-secretary']
  },
  {
    id: 'wellness',
    name: 'Wellness Center',
    description: 'Focused on health and lifestyle.',
    avatar: null,
    parentId: 'main',
    agentIds: ['health-advisor']
  }
];

const INITIAL_SETTINGS = {
  activeProviderId: 'ollama',
  providers: {
    ollama: { id: 'ollama', name: 'Ollama (Local)', baseUrl: 'http://localhost:11434', enabled: true },
    openai: { id: 'openai', name: 'OpenAI', apiKey: '', enabled: false },
    anthropic: { id: 'anthropic', name: 'Anthropic', apiKey: '', enabled: false },
    google: { id: 'google', name: 'Google Gemini', apiKey: '', enabled: false },
    openrouter: { id: 'openrouter', name: 'OpenRouter', apiKey: '', enabled: false }
  },
  general: {
    darkMode: true,
    temperature: 0.7,
    defaultModelId: 'llama3'
  }
};

export const storage = {
  getAgents: () => {
    const data = localStorage.getItem(STORAGE_KEYS.AGENTS);
    return data ? JSON.parse(data) : INITIAL_AGENTS;
  },
  saveAgents: (agents) => {
    localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(agents));
  },

  getGroups: () => {
    const data = localStorage.getItem(STORAGE_KEYS.GROUPS);
    return data ? JSON.parse(data) : INITIAL_GROUPS;
  },
  saveGroups: (groups) => {
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
  },

  getChats: (sessionId) => {
    const data = localStorage.getItem(`${STORAGE_KEYS.CHATS}_${sessionId}`);
    return data ? JSON.parse(data) : [];
  },
  saveChat: (sessionId, messages) => {
    localStorage.setItem(`${STORAGE_KEYS.CHATS}_${sessionId}`, JSON.stringify(messages));
  },

  // Sessions Logic
  getSessions: (targetId) => {
    const key = `wa_ai_sessions_${targetId}`;
    const data = localStorage.getItem(key);
    let sessions = data ? JSON.parse(data) : [];

    // Migration: If no sessions but there is a legacy chat, create a default session
    const legacyChatKey = `${STORAGE_KEYS.CHATS}_${targetId}`;
    if (sessions.length === 0 && localStorage.getItem(legacyChatKey)) {
      const legacyChatId = `session_${targetId}_default`;
      // Move legacy chat to new key
      const legacyData = localStorage.getItem(legacyChatKey);
      localStorage.setItem(`${STORAGE_KEYS.CHATS}_${legacyChatId}`, legacyData);
      localStorage.removeItem(legacyChatKey);

      sessions = [{
        id: legacyChatId,
        title: 'Initial Session',
        lastUpdate: new Date().toISOString(),
        lastMessage: 'Legacy conversation'
      }];
      localStorage.setItem(key, JSON.stringify(sessions));
    }

    return sessions;
  },
  saveSession: (targetId, session) => {
    const key = `wa_ai_sessions_${targetId}`;
    const sessions = storage.getSessions(targetId);
    const index = sessions.findIndex(s => s.id === session.id);
    
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.unshift(session);
    }
    
    localStorage.setItem(key, JSON.stringify(sessions));
  },
  deleteSession: (targetId, sessionId) => {
    const key = `wa_ai_sessions_${targetId}`;
    const sessions = storage.getSessions(targetId).filter(s => s.id !== sessionId);
    localStorage.setItem(key, JSON.stringify(sessions));
    localStorage.removeItem(`${STORAGE_KEYS.CHATS}_${sessionId}`);
  },

  getProfile: () => {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return data ? JSON.parse(data) : { name: 'User', status: 'Available', avatar: null };
  },
  saveProfile: (profile) => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  getSettings: () => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const settings = data ? JSON.parse(data) : INITIAL_SETTINGS;
    // Merge with initial settings to ensure new keys exist
    return { ...INITIAL_SETTINGS, ...settings, providers: { ...INITIAL_SETTINGS.providers, ...settings.providers } };
  },
  saveSettings: (settings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }
};
