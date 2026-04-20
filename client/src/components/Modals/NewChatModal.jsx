import React, { useState } from 'react';
import { X, Search, UserPlus, Users, Cpu, Check } from 'lucide-react';

const NewChatModal = ({ isOpen, onClose, agents, onAddAgent }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-wa-sidebar w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-white/10">
        {/* Header */}
        <div className="bg-wa-panel p-6 flex justify-between items-center border-b border-white/5">
          <div>
            <h2 className="text-xl font-bold text-wa-text-primary">New Expert Chat</h2>
            <p className="text-sm text-wa-text-secondary">Select an AI agent to begin orchestration</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X size={24} className="text-wa-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 text-wa-text-secondary" size={18} />
            <input 
              className="w-full bg-wa-bubble-received border border-white/5 py-2.5 pl-11 pr-4 rounded-xl text-sm outline-none focus:border-wa-accent transition-colors"
              placeholder="Search experts by expertise..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer group transition-all">
                <div className="w-12 h-12 rounded-full bg-wa-accent flex items-center justify-center text-white font-bold">
                    <UserPlus size={24} />
                </div>
                <div>
                    <p className="font-semibold">New Group</p>
                    <p className="text-xs text-wa-text-secondary">Create a collaborative workspace</p>
                </div>
            </div>

            <div className="h-px bg-white/5 my-4"></div>
            <p className="text-xs font-bold text-wa-text-secondary uppercase px-2 mb-2 tracking-widest">Available Experts</p>

            {agents.map((agent) => (
              <div 
                key={agent.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer group transition-all border border-transparent hover:border-white/5"
              >
                <div className="w-12 h-12 rounded-full bg-wa-bubble-received border border-white/10 flex items-center justify-center group-hover:bg-wa-accent transition-all">
                  <Cpu size={24} className="text-wa-text-secondary group-hover:text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-wa-text-primary">{agent.name}</p>
                  <p className="text-xs text-wa-text-secondary line-clamp-1">Expertise: {agent.expertise.join(', ')}</p>
                </div>
                <div className="bg-wa-accent/10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <Check size={16} className="text-wa-accent" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-wa-panel border-t border-white/5 flex justify-end">
           <button onClick={onClose} className="px-6 py-2 rounded-lg text-sm font-semibold hover:bg-white/5 transition-colors">
              Cancel
           </button>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
