import React from 'react';
import { 
  MessageSquare, Users, Archive, Settings, 
  Moon, Sun, User, LogOut 
} from 'lucide-react';

const ActivityBar = ({ activeTab, setActiveTab, darkMode, toggleTheme, user, ollamaStatus, onOpenSettings, onOpenProfile, onOpenSecretary, activeView }) => {
  const tabs = [
    { id: 'chats', icon: MessageSquare, label: 'Chats' },
    { id: 'groups', icon: Users, label: 'Groups' },
    { id: 'archived', icon: Archive, label: 'Archived' },
  ];

  return (
    <div className="w-[64px] flex-shrink-0 bg-wa-sidebar border-r border-white/5 flex flex-col items-center py-4 justify-between z-50">
      <div className="flex flex-col gap-6 items-center">
        <div
          onClick={onOpenProfile}
          className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all overflow-hidden border group shadow-lg active:scale-95 ${
            activeView === 'profile'
              ? 'bg-wa-accent/10 border-wa-accent/40 ring-2 ring-wa-accent/30'
              : 'bg-wa-panel border-white/10 hover:bg-wa-panel/80'
          }`}
          title="Your Profile Hub"
        >
          {user.avatar ? (
            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User size={20} className="text-wa-accent" />
          )}
        </div>

        <div
          onClick={onOpenSecretary}
          className="text-[9px] uppercase tracking-wider font-bold text-wa-text-secondary hover:text-wa-accent cursor-pointer transition-colors -mt-3"
          title="Go to Personal Secretary"
        >
          Sec
        </div>
        
        <div className="flex flex-col gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
                className={`p-3 rounded-xl cursor-pointer transition-all relative group ${
                  activeTab === tab.id 
                  ? 'bg-wa-accent/10 text-wa-accent shadow-[inset_0_0_0_1px_rgba(0,168,132,0.2)]' 
                  : 'text-wa-text-secondary hover:bg-white/5 hover:text-wa-text-primary'
                }`}
              >
                <Icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                {activeTab === tab.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-wa-accent rounded-r-full" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4 items-center mb-2">
        {/* Ollama Status Indicator */}
        <div 
          className="group relative cursor-help"
          title={`Ollama: ${ollamaStatus === 'connected' ? 'Connected' : ollamaStatus === 'error' ? 'Connection Error' : 'Loading...'}`}
        >
          <div className={`w-3 h-3 rounded-full transition-all duration-500 shadow-lg ${
            ollamaStatus === 'connected' 
              ? 'bg-wa-accent shadow-wa-accent/20 animate-pulse-slow' 
              : ollamaStatus === 'error' 
                ? 'bg-red-500 shadow-red-500/20' 
                : 'bg-yellow-500 shadow-yellow-500/20'
          }`} />
          
          {/* Tooltip */}
          <div className="absolute left-full ml-4 px-3 py-1.5 bg-wa-panel border border-white/10 rounded-lg text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[60] shadow-xl text-wa-text-primary">
             SERVICE: OLLAMA {(ollamaStatus || 'checking').toUpperCase()}
          </div>
        </div>

        <div 
          onClick={toggleTheme}
          className="p-3 text-wa-text-secondary hover:text-wa-accent cursor-pointer transition-colors"
        >
          {darkMode ? <Sun size={22} /> : <Moon size={22} />}
        </div>
        <div 
          onClick={onOpenSettings}
          className="p-3 text-wa-text-secondary hover:text-wa-accent cursor-pointer transition-colors"
          title="Settings"
        >
          <Settings size={22} />
        </div>
      </div>
    </div>
  );
};

export default ActivityBar;
