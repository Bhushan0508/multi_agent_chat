import React, { useState } from 'react';
import { X, Save, Sparkles, Hash, Camera, Info } from 'lucide-react';

const AgentModal = ({ isOpen, onClose, onSave, agent, allGroups, availableModels, defaultGroupId }) => {
  const [formData, setFormData] = useState({
    name: '',
    expertise: '',
    avoid: '',
    system_prompt: '',
    model: (typeof availableModels?.[0] === 'object' ? availableModels[0].name : availableModels?.[0]) || 'llama3',
    description: '',
    avatar: null,
    groupId: defaultGroupId || null
  });

  React.useEffect(() => {
    if (isOpen) {
      if (agent) {
        setFormData(agent);
      } else {
        setFormData({
          name: '',
          expertise: '',
          avoid: '',
          system_prompt: '',
          model: (typeof availableModels?.[0] === 'object' ? availableModels[0].name : availableModels?.[0]) || 'llama3',
          description: '',
          avatar: null,
          groupId: defaultGroupId || null
        });
      }
    }
  }, [isOpen, agent, defaultGroupId]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      ...formData,
      expertise: typeof formData.expertise === 'string' ? formData.expertise.split(',').map(s => s.trim()) : formData.expertise,
      avoid: typeof formData.avoid === 'string' ? formData.avoid.split(',').map(s => s.trim()) : formData.avoid,
      id: agent?.id || Date.now().toString()
    });
    onClose();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to find group name for display
  const getGroupName = (id) => {
    const g = allGroups.find(g => g.id === id);
    if (!g) return '';
    if (g.parentId) {
      const parent = allGroups.find(p => p.id === g.parentId);
      return `${parent?.name || 'Root'} > ${g.name}`;
    }
    return g.name;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-wa-panel w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        <header className="p-6 border-b border-white/5 flex justify-between items-center bg-wa-sidebar">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-wa-accent/10 rounded-lg text-wa-accent">
              <Sparkles size={20} />
            </div>
            <h2 className="text-xl font-bold text-wa-text-primary">{agent ? 'Edit Agent' : 'Create Dynamic Agent'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-wa-text-secondary">
            <X size={20} />
          </button>
        </header>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh] custom-scrollbar">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-wa-sidebar border-2 border-dashed border-wa-accent/30 flex items-center justify-center overflow-hidden hover:border-wa-accent transition-all shadow-inner">
                {formData.avatar ? (
                  <img src={formData.avatar} className="w-full h-full object-cover" />
                ) : (
                  <Camera size={28} className="text-wa-text-secondary group-hover:text-wa-accent" />
                )}
              </div>
              <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
            </div>
            <p className="text-[10px] text-wa-accent font-bold uppercase tracking-widest mt-2">{formData.avatar ? 'Change Photo' : 'Upload Photo'}</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-wa-text-secondary uppercase tracking-widest pl-1">Agent Name</label>
                <input 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Naturopathy Expert"
                  className="w-full bg-wa-sidebar p-3.5 rounded-xl border border-white/5 focus:border-wa-accent/30 outline-none text-wa-text-primary transition-all shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-wa-text-secondary uppercase tracking-widest pl-1">Assigned Group</label>
                <select 
                  value={formData.groupId || ''}
                  onChange={e => setFormData({...formData, groupId: e.target.value || null})}
                  className="w-full bg-wa-sidebar p-3.5 rounded-xl border border-white/5 focus:border-wa-accent/30 outline-none text-wa-text-primary transition-all shadow-inner appearance-none border-r-0"
                >
                  <option value="">Unassigned</option>
                  {allGroups.map(g => (
                    <option key={g.id} value={g.id}>{getGroupName(g.id)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-wa-text-secondary uppercase tracking-widest pl-1">Description</label>
              <input 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Short bio of the agent's purpose"
                className="w-full bg-wa-sidebar p-3.5 rounded-xl border border-white/5 focus:border-wa-accent/30 outline-none text-wa-text-primary transition-all shadow-inner"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-wa-text-secondary uppercase tracking-widest pl-1 flex justify-between">
                  <span>Model</span>
                  {availableModels.length === 0 && <span className="text-red-500 font-black animate-pulse">! DISCONNECTED</span>}
                </label>
                <select 
                  value={formData.model}
                  onChange={e => setFormData({...formData, model: e.target.value})}
                  className={`w-full bg-wa-sidebar p-3.5 rounded-xl border border-white/5 focus:border-wa-accent/30 outline-none text-wa-text-primary transition-all shadow-inner appearance-none border-r-0 ${availableModels.length === 0 ? 'opacity-50 grayscale' : ''}`}
                >
                  {availableModels.length > 0 ? (
                    availableModels.map((m, idx) => {
                      const name = typeof m === 'object' ? m.name : m;
                      return <option key={`${name}-${idx}`} value={name}>{String(name).toUpperCase()}</option>;
                    })
                  ) : (
                    <option value="llama3">LLAMA3 (NOT DETECTED)</option>
                  )}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-wa-text-secondary uppercase tracking-widest pl-1">Expertise</label>
                <input 
                  value={formData.expertise}
                  onChange={e => setFormData({...formData, expertise: e.target.value})}
                  placeholder="healing, diet"
                  className="w-full bg-wa-sidebar p-3.5 rounded-xl border border-white/5 focus:border-wa-accent/30 outline-none text-wa-text-primary transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-wa-text-secondary uppercase tracking-widest pl-1">Topics to Avoid</label>
              <input 
                value={formData.avoid}
                onChange={e => setFormData({...formData, avoid: e.target.value})}
                placeholder="politics, religion"
                className="w-full bg-wa-sidebar p-3.5 rounded-xl border border-white/5 focus:border-wa-accent/30 outline-none text-wa-text-primary transition-all shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-wa-text-secondary uppercase tracking-widest pl-1">System Prompt</label>
              <textarea 
                rows={4}
                value={formData.system_prompt}
                onChange={e => setFormData({...formData, system_prompt: e.target.value})}
                placeholder="How should this agent behave?"
                className="w-full bg-wa-sidebar p-3.5 rounded-xl border border-white/5 focus:border-wa-accent/30 outline-none text-wa-text-primary transition-all shadow-inner resize-none text-sm leading-relaxed"
              />
            </div>
          </div>
        </div>

        <footer className="p-6 border-t border-white/5 bg-wa-sidebar flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-semibold text-wa-text-secondary hover:bg-white/5 transition-all">Cancel</button>
          <button onClick={handleSave} className="px-8 py-2.5 bg-wa-accent rounded-xl font-bold text-wa-bg hover:bg-[#00c298] transition-all flex items-center gap-2 shadow-lg active:scale-95">
            <Save size={18} />Save Agent
          </button>
        </footer>
      </div>
    </div>
  );
};

export default AgentModal;
