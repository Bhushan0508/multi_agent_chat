import React from 'react';
import { Search, ListFilter, Plus, Trash2, User, Pin } from 'lucide-react';

const PINNED_AGENT_IDS = new Set(['personal-secretary']);

const ChatList = ({ activeTab, activeChatId, onSelectChat, chats, groups, onAddNew, onDeleteItem }) => {
  const rawItems = activeTab === 'groups' ? groups : chats;
  const filteredItems = activeTab === 'groups'
    ? rawItems
    : [
        ...rawItems.filter(i => PINNED_AGENT_IDS.has(i.id)),
        ...rawItems.filter(i => !PINNED_AGENT_IDS.has(i.id)),
      ];

  return (
    <div className="w-[380px] flex-shrink-0 bg-wa-panel border-r border-white/5 flex flex-col animate-fade-in shadow-2xl z-40">
      <header className="p-4 flex flex-col gap-4">
        <div className="flex justify-between items-center px-2">
          <h1 className="text-xl font-bold tracking-tight text-wa-text-primary capitalize">{activeTab}</h1>
          <div className="flex gap-4">
            <div 
              onClick={() => onAddNew(activeTab === 'groups' ? 'group' : 'agent')}
              className="p-2 hover:bg-wa-accent/10 rounded-lg cursor-pointer text-wa-accent transition-all group"
            >
              <Plus size={20} className="group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 text-wa-text-secondary group-focus-within:text-wa-accent transition-colors" size={18} />
          <input 
            className="w-full bg-wa-sidebar py-2.5 pl-12 pr-4 rounded-xl text-sm outline-none border border-transparent focus:border-wa-accent/30 transition-all placeholder:text-wa-text-secondary text-wa-text-primary"
            placeholder={`Search ${activeTab}...`}
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredItems.map((item) => {
          const isPinned = activeTab !== 'groups' && PINNED_AGENT_IDS.has(item.id);
          return (
          <div
            key={item.id}
            onClick={() => onSelectChat(item)}
            className={`flex gap-4 p-4 cursor-pointer border-b border-white/5 items-center transition-all group relative ${
              activeChatId === item.id ? 'bg-white/5' : 'hover:bg-white/[0.02]'
            } ${isPinned ? 'bg-gradient-to-r from-amber-500/[0.06] to-transparent' : ''}`}
          >
            <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center font-bold text-white shadow-lg shrink-0 ${
              !item.avatar ? (item.color || 'bg-gradient-to-br from-wa-accent to-emerald-900') : ''
            }`}>
              {item.avatar ? (
                <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
              ) : item.icon === 'user' ? (
                <User size={24} />
              ) : (
                item.name.charAt(0).toUpperCase()
              )}
            </div>
            
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex justify-between items-center mb-0.5 gap-2">
                <h3 className="font-semibold text-[15px] truncate text-wa-text-primary flex items-center gap-1.5">
                  {isPinned && <Pin size={12} className="text-amber-400 shrink-0" fill="currentColor" />}
                  {item.name}
                </h3>
                {item.parentId && <span className="text-[8px] bg-wa-accent/20 text-wa-accent px-1.5 py-0.5 rounded font-bold uppercase">Sub-group</span>}
              </div>
              <p className="text-[13px] text-wa-text-secondary truncate font-medium">
                {item.description || item.lastMessage || 'Open details...'}
              </p>
            </div>

            {/* Quick Delete */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
               {item.id !== 'main' && !isPinned && (
                 <button
                   onClick={(e) => {
                     e.stopPropagation();
                     onDeleteItem(item.id, activeTab === 'groups' ? 'group' : 'agent');
                   }}
                   className="p-2 hover:bg-red-500/10 rounded-lg text-wa-text-secondary hover:text-red-400 transition-colors"
                 >
                   <Trash2 size={16} />
                 </button>
               )}
            </div>
          </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center opacity-50">
            <p className="text-sm text-wa-text-secondary">No {activeTab} found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
