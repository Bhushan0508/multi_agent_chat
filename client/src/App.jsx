import React, { useState, useEffect } from 'react';
import ActivityBar from './components/Sidebar/ActivityBar';
import ChatList from './components/Chat/ChatList';
import ChatWindow from './components/Chat/ChatWindow';
import ContextPanel from './components/Chat/ContextPanel';
import AgentModal from './components/Modals/AgentModal';
import GroupModal from './components/Modals/GroupModal';
import ConfirmModal from './components/Modals/ConfirmModal';
import SettingsModal from './components/Modals/SettingsModal';
import { storage } from './services/storage';
import { orchestrator } from './services/orchestrator';
import { ollama } from './services/ollama';

function App() {
  const [activeTab, setActiveTab] = useState('chats');
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [agents, setAgents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [user, setUser] = useState({ name: 'User', status: 'Online', avatar: null });
  const [isTyping, setIsTyping] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  
  // Settings & Status
  const [settings, setSettings] = useState(storage.getSettings());
  const [ollamaStatus, setOllamaStatus] = useState('loading');
  const [availableModels, setAvailableModels] = useState([]);
  
  // Modals state
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [defaultGroupId, setDefaultGroupId] = useState(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  useEffect(() => {
    if (settings.general.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.general.darkMode]);

  useEffect(() => {
    // Initial Load
    const initialAgents = storage.getAgents();
    setAgents(initialAgents);
    setGroups(storage.getGroups());
    setUser(storage.getProfile());

    // Default selection: Personal Secretary
    const secretary = initialAgents.find(a => a.id === 'personal-secretary');
    if (secretary) setActiveChat(secretary);

    // Ollama Heartbeat (only if ollama active or we want to show its status)
    const checkOllama = async () => {
      const isConnected = await ollama.checkConnection();
      if (isConnected) {
        setOllamaStatus('connected');
        // Only fetch models for dropdown if we are on Ollama
        if (settings.activeProviderId === 'ollama') {
          const models = await ollama.listModels();
          setAvailableModels(models);
          
          // Auto-Repair: If default model is missing, pick the first available one
          if (models.length > 0 && (!settings.general.defaultModelId || !models.includes(settings.general.defaultModelId))) {
            const updatedSettings = {
              ...settings,
              general: {
                ...settings.general,
                defaultModelId: models[0]
              }
            };
            setSettings(updatedSettings);
            storage.saveSettings(updatedSettings);
            console.log(`Auto-selected available model: ${models[0]}`);
          }
        }
      } else {
        setOllamaStatus('error');
      }
    };

    checkOllama();
    const interval = setInterval(checkOllama, 30000);
    return () => clearInterval(interval);
  }, [settings.activeProviderId]);

  useEffect(() => {
    if (activeChat) {
      const chatSessions = storage.getSessions(activeChat.id);
      setSessions(chatSessions);
      
      if (chatSessions.length > 0) {
        setActiveSessionId(chatSessions[0].id);
        setMessages(storage.getChats(chatSessions[0].id));
      } else {
        // Create initial session if none exist
        const newSessionId = `session_${activeChat.id}_${Date.now()}`;
        const initialSession = {
          id: newSessionId,
          title: 'New Conversation',
          lastUpdate: new Date().toISOString(),
          lastMessage: ''
        };
        storage.saveSession(activeChat.id, initialSession);
        setSessions([initialSession]);
        setActiveSessionId(newSessionId);
        setMessages([]);
      }
    } else {
      setSessions([]);
      setActiveSessionId(null);
      setMessages([]);
    }
  }, [activeChat]);

  useEffect(() => {
    if (activeSessionId) {
      setMessages(storage.getChats(activeSessionId));
    }
  }, [activeSessionId]);

  const handleSendMessage = async (text, attachments) => {
    const newMessage = {
      content: text,
      timestamp: new Date().toISOString(),
      isOwn: true,
      sender_name: user.name,
      attachments
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    
    if (activeSessionId) {
      storage.saveChat(activeSessionId, updatedMessages);
      
      // Update session metadata
      const currentSession = sessions.find(s => s.id === activeSessionId);
      if (currentSession) {
        const updatedSession = {
          ...currentSession,
          lastUpdate: new Date().toISOString(),
          lastMessage: text.slice(0, 50),
          title: currentSession.title === 'New Conversation' ? text.slice(0, 25) + (text.length > 25 ? '...' : '') : currentSession.title
        };
        storage.saveSession(activeChat.id, updatedSession);
        setSessions(storage.getSessions(activeChat.id));
      }
    }

    setIsTyping(true);
    
    try {
      const mode = activeChat.isGroup ? 'group' : 'individual';
      // Pass the current provider config to the orchestrator
      const activeProvider = settings.providers[settings.activeProviderId];
      const responses = await orchestrator.route(text, mode, activeChat.id, {
        providerId: settings.activeProviderId,
        apiKey: activeProvider.apiKey,
        baseUrl: activeProvider.baseUrl
      });
      
      for (const res of responses) {
        await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
        
        const aiMessage = {
          content: res.content,
          timestamp: new Date().toISOString(),
          isOwn: false,
          sender_name: res.agent,
        };
        
        setMessages(prev => {
          const next = [...prev, aiMessage];
          if (activeSessionId) storage.saveChat(activeSessionId, next);
          return next;
        });
      }
    } catch (error) {
      console.error('Orchestration Error:', error);
      const errorMessage = {
        content: `System Error: ${error.message}`,
        timestamp: new Date().toISOString(),
        isOwn: false,
        sender_name: 'System',
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    storage.saveSettings(newSettings);
  };

  // --- CRUD Handlers ---

  const handleSaveAgent = (agentData) => {
    const updatedAgents = agents.some(a => a.id === agentData.id) 
      ? agents.map(a => a.id === agentData.id ? agentData : a)
      : [...agents, agentData];
    
    setAgents(updatedAgents);
    storage.saveAgents(updatedAgents);
    setEditingAgent(null);
    setDefaultGroupId(null);
    if (activeChat?.id === agentData.id) setActiveChat(agentData);
  };

  const handleDeleteAgent = (agentId) => {
    const agent = agents.find(a => a.id === agentId);
    setConfirmState({
      isOpen: true,
      title: 'Delete Agent',
      message: `Are you sure you want to delete "${agent?.name}"? All chat history with this agent will be permanently removed.`,
      onConfirm: () => {
        const updated = agents.filter(a => a.id !== agentId);
        setAgents(updated);
        storage.saveAgents(updated);
        if (activeChat?.id === agentId) setActiveChat(null);
      }
    });
  };

  const handleSaveGroup = (groupData) => {
    const updatedGroups = groups.some(g => g.id === groupData.id)
      ? groups.map(g => g.id === groupData.id ? groupData : g)
      : [...groups, groupData];
    
    setGroups(updatedGroups);
    storage.saveGroups(updatedGroups);
    setEditingGroup(null);
    if (activeChat?.id === groupData.id) setActiveChat({ ...groupData, isGroup: true });
  };

  const handleDeleteGroup = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    setConfirmState({
      isOpen: true,
      title: 'Delete Group',
      message: `Are you sure you want to delete "${group?.name}"? Agents within this group will remain but will be unassigned from this group.`,
      onConfirm: () => {
        // Remove group
        const updatedGroups = groups.filter(g => g.id !== groupId);
        setGroups(updatedGroups);
        storage.saveGroups(updatedGroups);

        // Unassign agents
        const updatedAgents = agents.map(a => 
          a.groupId === groupId ? { ...a, groupId: null } : a
        );
        setAgents(updatedAgents);
        storage.saveAgents(updatedAgents);

        if (activeChat?.id === groupId) setActiveChat(null);
      }
    });
  };

  const handleAddNew = (type) => {
    if (type === 'agent') {
      setEditingAgent(null);
      setDefaultGroupId(null);
      setIsAgentModalOpen(true);
    } else {
      setEditingGroup(null);
      setIsGroupModalOpen(true);
    }
  };

  const handleAddAgentToGroup = (groupId) => {
    setEditingAgent(null);
    setDefaultGroupId(groupId);
    setIsAgentModalOpen(true);
  };

  const handleRefreshModels = async () => {
    try {
      const activeProvider = settings.providers[settings.activeProviderId];
      // For Ollama, we can call the service directly
      if (settings.activeProviderId === 'ollama') {
        const models = await ollama.listModels();
        setAvailableModels(models);
      } else {
        // For cloud providers (OpenAI etc), we might need aiProvider.listModels
        // But since this is primarily for local first, we focus on Ollama for now
        // Later we can expand aiProvider.listModels
        console.log('Cloud model refresh not yet implemented');
      }
    } catch (error) {
      console.error('Failed to refresh models:', error);
    }
  };

  const handleNewChat = () => {
    if (!activeChat) return;
    const newSessionId = `session_${activeChat.id}_${Date.now()}`;
    const newSession = {
      id: newSessionId,
      title: 'New Conversation',
      lastUpdate: new Date().toISOString(),
      lastMessage: ''
    };
    storage.saveSession(activeChat.id, newSession);
    setSessions(storage.getSessions(activeChat.id));
    setActiveSessionId(newSessionId);
    setMessages([]);
  };

  const handleSelectSession = (sessionId) => {
    setActiveSessionId(sessionId);
  };

  const handleDeleteSession = (sessionId) => {
    storage.deleteSession(activeChat.id, sessionId);
    const updated = storage.getSessions(activeChat.id);
    setSessions(updated);
    if (activeSessionId === sessionId) {
      if (updated.length > 0) {
        setActiveSessionId(updated[0].id);
      } else {
        handleNewChat();
      }
    }
  };

  return (
    <div className={`flex h-screen bg-wa-bg text-wa-text-primary font-wa overflow-hidden ${settings.general.darkMode ? 'dark' : ''}`}>
      <ActivityBar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        darkMode={settings.general.darkMode}
        toggleTheme={() => handleSaveSettings({ ...settings, general: { ...settings.general, darkMode: !settings.general.darkMode }})}
        user={user}
        ollamaStatus={ollamaStatus}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenSecretary={() => {
          const secretary = agents.find(a => a.id === 'personal-secretary');
          if (secretary) {
            setActiveChat(secretary);
            setActiveTab('chats');
          }
        }}
      />
      
      <ChatList 
        activeTab={activeTab} 
        activeChatId={activeChat?.id}
        onSelectChat={(item) => setActiveChat({ ...item, isGroup: activeTab === 'groups' })}
        chats={agents}
        groups={groups}
        onAddNew={handleAddNew}
        onDeleteItem={(id, type) => {
          if (type === 'group') {
            handleDeleteGroup(id);
          } else {
            handleDeleteAgent(id);
          }
        }}
      />

      <ChatWindow 
        activeChat={activeChat} 
        messages={messages} 
        onSendMessage={handleSendMessage}
        isTyping={isTyping}
      />

      <ContextPanel 
        activeChat={activeChat} 
        agents={activeChat?.isGroup ? agents.filter(a => a.groupId === activeChat.id) : agents.filter(a => a.id === activeChat?.id)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onEditAgent={(agent) => { setEditingAgent(agent); setIsAgentModalOpen(true); }}
        onDeleteAgent={handleDeleteAgent}
        onEditGroup={(group) => { setEditingGroup(group); setIsGroupModalOpen(true); }}
        onDeleteGroup={handleDeleteGroup}
        onAddAgentToGroup={handleAddAgentToGroup}
      />

      <AgentModal 
        isOpen={isAgentModalOpen} 
        onClose={() => { setIsAgentModalOpen(false); setEditingAgent(null); setDefaultGroupId(null); }} 
        onSave={handleSaveAgent}
        agent={editingAgent}
        allGroups={groups}
        availableModels={availableModels}
        defaultGroupId={defaultGroupId}
      />

      <GroupModal
        isOpen={isGroupModalOpen}
        onClose={() => { setIsGroupModalOpen(false); setEditingGroup(null); }}
        onSave={(groupData) => {
          const updatedAgents = agents.map(agent => {
            if (activeChat?.id === groupData.id && agent.groupId === groupData.id && !groupData.agentIds?.includes(agent.id)) {
              return { ...agent, groupId: null };
            }
            if (groupData.agentIds?.includes(agent.id)) {
              return { ...agent, groupId: groupData.id };
            }
            return agent;
          });
          
          setAgents(updatedAgents);
          storage.saveAgents(updatedAgents);
          handleSaveGroup(groupData);
        }}
        group={editingGroup}
        allGroups={groups}
        allAgents={agents}
      />

      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
        availableModels={availableModels}
        onRefreshModels={handleRefreshModels}
        ollamaStatus={ollamaStatus}
      />

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ ...confirmState, isOpen: false })}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
      />
    </div>
  );
}

export default App;
