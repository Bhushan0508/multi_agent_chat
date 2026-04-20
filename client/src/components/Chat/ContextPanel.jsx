import React from 'react';
import { 
  Info, ShieldCheck, ChevronRight, UserPlus, 
  Settings, Trash2, Cpu, Zap, Plus, Users, User
} from 'lucide-react';

const ContextPanel = ({ 
  activeChat, agents, sessions = [], activeSessionId, 
  onSelectSession, onNewChat, onDeleteSession,
  onEditAgent, onDeleteAgent, onEditGroup, onDeleteGroup, onAddAgentToGroup 
}) => {
  if (!activeChat) return (
    <div className="w-[320px] bg-wa-panel border-l border-white/5 flex flex-col items-center justify-center p-8 text-center opacity-30">
      <Info size={48} className="mb-4" />
      <p className="text-sm">Select a chat to view details</p>
    </div>
  );

  return (
    <div className="w-[320px] flex-shrink-0 bg-wa-panel border-l border-white/5 flex flex-col animate-fade-in shadow-2xl z-30 h-full">
      <header className="p-5 border-b border-white/5 flex items-center justify-between">
        <h2 className="font-bold text-xs text-wa-text-secondary uppercase tracking-[0.2em]">Context Panel</h2>
        <div className="flex gap-2">
          {activeChat.isGroup && (
            <button 
              onClick={() => onEditGroup(activeChat)}
              className="p-1.5 text-wa-text-secondary hover:text-wa-accent transition-colors"
              title="Edit Group"
            >
              <Settings size={16} />
            </button>
          )}
          {activeChat.isGroup && activeChat.id !== 'main' && (
            <button 
              onClick={() => onDeleteGroup(activeChat.id)}
              className="p-1.5 text-wa-text-secondary hover:text-red-400 transition-colors"
              title="Delete Group"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        <div className="flex flex-col items-center py-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-wa-accent/20 to-wa-accent/5 mb-6 shadow-2xl ring-4 ring-wa-accent/10 flex items-center justify-center overflow-hidden">
             {activeChat.avatar ? (
                <img src={activeChat.avatar} className="w-full h-full object-cover" />
             ) : activeChat.icon === 'user' ? (
                <User size={40} className="text-wa-accent" />
             ) : (
                <Cpu size={40} className="text-wa-accent" />
             )}
          </div>
          <h3 className="text-xl font-bold tracking-tight text-wa-text-primary text-center leading-tight">{activeChat.name}</h3>
          <p className="text-wa-accent text-[10px] font-black uppercase tracking-[0.1em] mt-3 bg-wa-accent/10 px-3 py-1.5 rounded-full ring-1 ring-wa-accent/20">
            {activeChat.isGroup ? 'Multi-Agent Network' : 'Direct Logic Channel'}
          </p>

          {activeChat.description && (
            <p className="text-xs text-wa-text-secondary text-center mt-4 leading-relaxed font-medium italic">
              "{activeChat.description}"
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <p className="text-[10px] font-bold text-wa-text-secondary uppercase tracking-widest">Previous chats</p>
            <button 
              onClick={onNewChat}
              className="p-1.5 text-wa-accent hover:bg-wa-accent/10 rounded-lg transition-all flex items-center gap-1.5"
              title="Start New Chat"
            >
              <Plus size={16} />
              <span className="text-[10px] font-bold">NEW</span>
            </button>
          </div>
          <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
            {sessions.map(session => (
              <div 
                key={session.id} 
                onClick={() => onSelectSession(session.id)}
                className={`group p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 relative ${
                  activeSessionId === session.id 
                  ? 'bg-wa-accent/10 border-wa-accent/30' 
                  : 'bg-white/[0.03] border-white/5 hover:border-wa-accent/20'
                }`}
              >
                <div className="flex justify-between items-start">
                  <p className={`text-sm font-semibold truncate pr-6 ${activeSessionId === session.id ? 'text-wa-accent' : 'text-wa-text-primary'}`}>
                    {session.title}
                  </p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                    className="absolute top-3 right-3 p-1 text-wa-text-secondary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-wa-text-secondary truncate max-w-[180px]">
                    {session.lastMessage || 'Empty session...'}
                  </p>
                  <p className="text-[9px] text-wa-text-secondary opacity-50 shrink-0">
                    {new Date(session.lastUpdate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <p className="text-[10px] font-bold text-wa-text-secondary uppercase tracking-widest">{activeChat.isGroup ? 'Active Agents' : 'Agent Capabilities'}</p>
            {activeChat.isGroup && (
              <div className="flex gap-1">
                <button 
                  onClick={() => onEditGroup(activeChat)}
                  className="p-1.5 text-wa-accent hover:bg-wa-accent/10 rounded-lg transition-all"
                  title="Assign Existing Agents"
                >
                  <Users size={16} />
                </button>
                <button 
                  onClick={() => onAddAgentToGroup(activeChat.id)}
                  className="p-1.5 text-wa-accent hover:bg-wa-accent/10 rounded-lg transition-all"
                  title="Create New Agent for this Group"
                >
                  <UserPlus size={16} />
                </button>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {agents.map(agent => (
              <div 
                key={agent.id} 
                className="group p-3 bg-white/[0.03] rounded-xl border border-white/5 hover:border-wa-accent/30 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-wa-accent/10 flex items-center justify-center">
                    <Zap size={14} className="text-wa-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-wa-text-primary">{agent.name}</p>
                    <p className="text-[10px] text-wa-text-secondary truncate max-w-[120px]">{agent.expertise.join(', ')}</p>
                  </div>
                </div>
                {!activeChat.isGroup && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onDeleteAgent(agent.id)} className="p-1.5 text-wa-text-secondary hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                    <button onClick={() => onEditAgent(agent)} className="p-1.5 text-wa-text-secondary hover:text-wa-accent">
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-white/5">
          <p className="text-[10px] font-bold text-wa-text-secondary uppercase tracking-widest px-1">Security & Logic</p>
          <div className="p-4 bg-wa-accent/5 rounded-2xl flex items-start gap-4 border border-wa-accent/10 shadow-sm">
            <ShieldCheck size={20} className="text-wa-accent shrink-0 mt-0.5" />
            <p className="text-[12px] text-wa-text-secondary leading-relaxed">
              All intelligence is generated locally via <span className="text-wa-accent font-bold">Ollama</span>. No data leaves this device. 
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextPanel;
