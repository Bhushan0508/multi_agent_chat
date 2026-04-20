import React, { useState } from 'react';
import { X, Save, Users, Camera, Info, Layers } from 'lucide-react';

const GroupModal = ({ isOpen, onClose, onSave, group, allGroups, allAgents }) => {
  const [formData, setFormData] = useState(group || {
    name: '',
    description: '',
    avatar: null,
    parentId: null,
    agentIds: []
  });
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      ...formData,
      id: group?.id || Date.now().toString()
    });
    onClose();
  };

  const toggleAgent = (agentId) => {
    const nextIds = formData.agentIds.includes(agentId)
      ? formData.agentIds.filter(id => id !== agentId)
      : [...formData.agentIds, agentId];
    setFormData({ ...formData, agentIds: nextIds });
  };

  const filteredAgents = allAgents.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-wa-panel w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        <header className="p-6 border-b border-white/5 flex justify-between items-center bg-wa-sidebar">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-wa-accent/10 rounded-lg text-wa-accent">
              <Layers size={20} />
            </div>
            <h2 className="text-xl font-bold text-wa-text-primary">{group ? 'Edit Group' : 'New Group / Sub-group'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-wa-text-secondary">
            <X size={20} />
          </button>
        </header>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-wa-sidebar border-2 border-dashed border-wa-accent/30 flex items-center justify-center overflow-hidden hover:border-wa-accent transition-all shadow-inner">
                {formData.avatar ? (
                  <img src={formData.avatar} className="w-full h-full object-cover" />
                ) : (
                  <Camera size={28} className="text-wa-text-secondary group-hover:text-wa-accent" />
                )}
              </div>
              <input type="file" onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setFormData({ ...formData, avatar: reader.result });
                  reader.readAsDataURL(file);
                }
              }} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
            </div>
            <p className="text-[10px] text-wa-accent font-bold uppercase tracking-widest mt-2">
              {formData.avatar ? 'Change Photo' : 'Upload Team Cover'}
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-wa-text-secondary uppercase tracking-widest pl-1">Name</label>
                <input 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Marketing Squad"
                  className="w-full bg-wa-sidebar p-3 py-2.5 rounded-xl border border-white/5 focus:border-wa-accent/30 outline-none text-wa-text-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-wa-text-secondary uppercase tracking-widest pl-1">Parent Group</label>
                <select 
                  value={formData.parentId || ''}
                  onChange={e => setFormData({...formData, parentId: e.target.value || null})}
                  className="w-full bg-wa-sidebar p-3 py-2.5 rounded-xl border border-white/5 focus:border-wa-accent/30 outline-none text-wa-text-primary appearance-none border-r-0"
                >
                  <option value="">Root Level</option>
                  {allGroups.filter(g => g.id !== group?.id).map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-wa-text-secondary uppercase tracking-widest pl-1">Agent Mapping</label>
              <div className="bg-wa-sidebar rounded-xl border border-white/5 overflow-hidden flex flex-col h-[180px]">
                <div className="p-2 border-b border-white/5 bg-black/20">
                   <input 
                     value={searchTerm}
                     onChange={e => setSearchTerm(e.target.value)}
                     placeholder="Search agents..."
                     className="w-full bg-transparent text-xs outline-none text-wa-text-primary"
                   />
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                  {filteredAgents.map(agent => (
                    <div 
                      key={agent.id} 
                      onClick={() => toggleAgent(agent.id)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        formData.agentIds?.includes(agent.id) ? 'bg-wa-accent border-wa-accent' : 'border-white/20'
                      }`}>
                        {formData.agentIds?.includes(agent.id) && <Save size={10} className="text-wa-bg" />}
                      </div>
                      <span className="text-[13px] text-wa-text-primary font-medium">{agent.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-wa-text-secondary uppercase tracking-widest pl-1">Description</label>
              <textarea 
                rows={2}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="What is this group's focus?"
                className="w-full bg-wa-sidebar p-3 rounded-xl border border-white/5 outline-none text-wa-text-primary resize-none text-xs"
              />
            </div>
          </div>
        </div>

        <footer className="p-6 border-t border-white/5 bg-wa-sidebar flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-semibold text-wa-text-secondary hover:bg-white/5 transition-all text-sm">Cancel</button>
          <button onClick={handleSave} className="px-8 py-2.5 bg-wa-accent rounded-xl font-bold text-wa-bg hover:bg-[#00c298] transition-all flex items-center gap-2 active:scale-95 text-sm uppercase">
            <Save size={18} />Save Mapping
          </button>
        </footer>
      </div>
    </div>
  );
};

export default GroupModal;
