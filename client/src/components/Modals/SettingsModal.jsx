import React, { useState } from 'react';
import { 
  X, Cpu, Shield, Settings, Check, 
  Key, Globe, Zap, Moon, Sun, Monitor,
  Layers, RefreshCw, Box
} from 'lucide-react';

const SettingsModal = ({ 
  isOpen, 
  onClose, 
  settings, 
  onSave, 
  availableModels = [], 
  onRefreshModels,
  ollamaStatus 
}) => {
  const [activeTab, setActiveTab] = useState('providers');
  const [localSettings, setLocalSettings] = useState(settings);
  const [showKeys, setShowKeys] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshModels();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const toggleKey = (id) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleProviderChange = (providerId, field, value) => {
    setLocalSettings(prev => ({
      ...prev,
      providers: {
        ...prev.providers,
        [providerId]: {
          ...prev.providers[providerId],
          [field]: value
        }
      }
    }));
  };

  const handleGeneralChange = (field, value) => {
    setLocalSettings(prev => ({
      ...prev,
      general: {
        ...prev.general,
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in font-wa">
      <div className="bg-wa-panel w-full max-w-2xl rounded-3xl border border-white/10 shadow-3xl overflow-hidden flex h-[600px] scale-in">
        {/* Sidebar Nav */}
        <div className="w-[180px] bg-wa-sidebar/50 border-r border-white/5 flex flex-col p-6 space-y-4">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="p-2 bg-wa-accent/10 rounded-xl text-wa-accent">
              <Settings size={20} />
            </div>
            <h2 className="text-sm font-bold tracking-tight text-wa-text-primary">Settings</h2>
          </div>

          <button 
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'general' ? 'bg-wa-accent/10 text-wa-accent' : 'text-wa-text-secondary hover:bg-white/5'
            }`}
          >
            <Zap size={16} /> General
          </button>
          <button 
            onClick={() => setActiveTab('providers')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'providers' ? 'bg-wa-accent/10 text-wa-accent' : 'text-wa-text-secondary hover:bg-white/5'
            }`}
          >
            <Cpu size={16} /> Providers
          </button>
          <button 
            onClick={() => setActiveTab('models')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'models' ? 'bg-wa-accent/10 text-wa-accent' : 'text-wa-text-secondary hover:bg-white/5'
            }`}
          >
            <Layers size={16} /> Models
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'security' ? 'bg-wa-accent/10 text-wa-accent' : 'text-wa-text-secondary hover:bg-white/5'
            }`}
          >
            <Shield size={16} /> Security
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="px-8 py-6 flex justify-between items-center border-b border-white/5">
            <h3 className="text-xl font-bold text-wa-text-primary capitalize">{activeTab}</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-wa-text-secondary">
              <X size={20} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {activeTab === 'general' && (
              <div className="space-y-8 animate-slide-up">
                <section className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-wa-text-secondary pl-1">Appearance</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => handleGeneralChange('darkMode', true)}
                      className={`p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                        localSettings.general.darkMode ? 'bg-wa-accent/10 border-wa-accent/30 text-wa-accent shadow-lg' : 'bg-wa-sidebar/30 border-white/5 text-wa-text-secondary'
                      }`}
                    >
                      <Moon size={18} />
                      <span className="font-bold text-sm">Dark Mode</span>
                    </button>
                    <button 
                      onClick={() => handleGeneralChange('darkMode', false)}
                      className={`p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                        !localSettings.general.darkMode ? 'bg-wa-accent/10 border-wa-accent/30 text-wa-accent shadow-lg' : 'bg-wa-sidebar/30 border-white/5 text-wa-text-secondary'
                      }`}
                    >
                      <Sun size={18} />
                      <span className="font-bold text-sm">Light Mode</span>
                    </button>
                  </div>
                </section>

                <section className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-wa-text-secondary pl-1">Response Controls</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-wa-text-secondary px-1">
                      <span>Temperature</span>
                      <span className="text-wa-accent">{localSettings.general.temperature}</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.1"
                      value={localSettings.general.temperature}
                      onChange={e => handleGeneralChange('temperature', parseFloat(e.target.value))}
                      className="w-full accent-wa-accent h-1 bg-white/5 rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'providers' && (
              <div className="space-y-6 animate-slide-up">
                <div className="p-4 bg-wa-accent/5 rounded-2xl border border-wa-accent/10 mb-8">
                   <p className="text-xs text-wa-text-secondary leading-relaxed">
                     <span className="text-wa-accent font-bold">Smart Routing:</span> Your agents will use the selected active provider. You can switch between local and cloud models instantly.
                   </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-wa-text-secondary pl-1">Select Active Provider</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {Object.values(localSettings.providers).map(provider => (
                      <div 
                        key={provider.id}
                        onClick={() => setLocalSettings(prev => ({ ...prev, activeProviderId: provider.id }))}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                          localSettings.activeProviderId === provider.id 
                            ? 'bg-wa-accent/10 border-wa-accent/30 shadow-lg' 
                            : 'bg-wa-sidebar/30 border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-xl ${localSettings.activeProviderId === provider.id ? 'bg-wa-accent/20 text-wa-accent' : 'bg-white/5 text-wa-text-secondary'}`}>
                            <Globe size={18} />
                          </div>
                          <div>
                            <p className={`text-sm font-bold ${localSettings.activeProviderId === provider.id ? 'text-wa-text-primary' : 'text-wa-text-secondary'}`}>
                              {provider.name}
                            </p>
                            {provider.id === 'ollama' && <p className="text-[10px] text-wa-text-secondary opacity-60">Localhost Environment</p>}
                          </div>
                        </div>
                        {localSettings.activeProviderId === provider.id && (
                          <div className="p-1 bgColor-wa-accent rounded-full text-wa-bg">
                            <Check size={14} strokeWidth={4} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-wa-text-secondary pl-1">Configuration</h4>
                  {Object.values(localSettings.providers).map(provider => (
                    provider.id !== 'ollama' && (
                      <div key={provider.id} className="space-y-3 pb-4">
                        <label className="text-xs font-bold text-wa-text-primary pl-1">{provider.name} API Key</label>
                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-wa-text-secondary group-focus-within:text-wa-accent transition-colors">
                            <Key size={16} />
                          </div>
                          <input 
                            type={showKeys[provider.id] ? 'text' : 'password'}
                            value={provider.apiKey || ''}
                            onChange={e => handleProviderChange(provider.id, 'apiKey', e.target.value)}
                            placeholder={`Enter ${provider.name} Key`}
                            className="w-full bg-wa-sidebar/50 p-3.5 pl-11 pr-12 rounded-xl border border-white/5 focus:border-wa-accent/30 outline-none text-wa-text-primary transition-all shadow-inner text-sm"
                          />
                          <button 
                            onClick={() => toggleKey(provider.id)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-wa-text-secondary hover:text-wa-text-primary transition-colors text-[10px] font-black uppercase"
                          >
                            {showKeys[provider.id] ? 'Hide' : 'Show'}
                          </button>
                        </div>
                      </div>
                    )
                  ))}
                  
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-wa-text-primary pl-1">Ollama Base URL</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-wa-text-secondary">
                        <Monitor size={16} />
                      </div>
                      <input 
                        value={localSettings.providers.ollama.baseUrl}
                        onChange={e => handleProviderChange('ollama', 'baseUrl', e.target.value)}
                        className="w-full bg-wa-sidebar/50 p-3.5 pl-11 rounded-xl border border-white/5 focus:border-wa-accent/30 outline-none text-wa-text-primary transition-all shadow-inner text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'models' && (
              <div className="space-y-6 animate-slide-up">
                <div className="flex justify-between items-center mb-2 px-1">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-wa-text-secondary">Discovered Models</h4>
                  <button 
                    onClick={handleRefresh}
                    className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-wa-accent hover:opacity-80 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                  >
                    <RefreshCw size={12} /> Refresh
                  </button>
                </div>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {availableModels.length > 0 ? (
                    availableModels.map((modelId, index) => {
                      const id = typeof modelId === 'object' ? modelId.name : modelId;
                      return (
                        <div 
                          key={`${id}-${index}`}
                          onClick={() => handleGeneralChange('defaultModelId', id)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                            localSettings.general.defaultModelId === id 
                              ? 'bg-wa-accent/10 border-wa-accent/30 shadow-lg' 
                              : 'bg-wa-sidebar/30 border-white/5 hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-xl ${localSettings.general.defaultModelId === id ? 'bg-wa-accent/20 text-wa-accent' : 'bg-white/5 text-wa-text-secondary'}`}>
                              <Box size={18} />
                            </div>
                            <div>
                              <p className={`text-sm font-bold ${localSettings.general.defaultModelId === id ? 'text-wa-text-primary' : 'text-wa-text-secondary'}`}>
                                {id}
                              </p>
                              <p className="text-[10px] text-wa-text-secondary opacity-60 capitalize">{localSettings.activeProviderId} Model</p>
                            </div>
                          </div>
                          {localSettings.general.defaultModelId === id && (
                            <div className="flex items-center gap-2">
                               <span className="text-[9px] font-black uppercase tracking-tighter text-wa-accent bg-wa-accent/10 px-2 py-0.5 rounded-full">Default</span>
                               <div className="p-1 bgColor-wa-accent rounded-full text-wa-bg">
                                 <Check size={14} strokeWidth={4} />
                               </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-12 flex flex-col items-center text-center space-y-4 bg-wa-sidebar/20 rounded-3xl border border-dashed border-white/10">
                      <div className="p-4 bg-white/5 rounded-full text-wa-text-secondary opacity-30">
                        <Monitor size={32} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-wa-text-primary">No Models Found</p>
                        <p className="text-xs text-wa-text-secondary max-w-[200px]">Ensure your active provider is connected and try refreshing.</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {localSettings.activeProviderId === 'ollama' && (
                  <div className="p-4 bg-wa-accent/5 rounded-2xl border border-wa-accent/10">
                    <p className="text-[10px] text-wa-text-secondary leading-relaxed">
                      💡 To add more local models, run <code className="text-wa-accent font-bold">ollama pull [model]</code> in your terminal.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6 animate-slide-up">
                <div className="p-8 rounded-3xl bg-wa-panel/40 border border-white/5 flex flex-col items-center text-center space-y-6">
                  <div className="w-20 h-20 rounded-full bg-wa-accent/10 flex items-center justify-center text-wa-accent shadow-xl">
                    <Shield size={40} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-wa-text-primary">Local Storage Security</h4>
                    <p className="text-xs text-wa-text-secondary leading-relaxed max-w-sm">
                      Your API keys are stored in your browser's <span className="text-wa-accent">localStorage</span>. They are never sent to our servers. Only your chosen AI provider will ever see them.
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      if (window.confirm('Clear all settings and keys?')) {
                        setLocalSettings(settings);
                      }
                    }}
                    className="px-6 py-2.5 bg-red-500/10 text-red-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95"
                  >
                    Reset All Keys
                  </button>
                </div>
              </div>
            )}
          </div>

          <footer className="p-8 border-t border-white/5 bg-wa-sidebar/20 flex justify-end gap-3 rounded-br-3xl">
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-xs font-bold text-wa-text-secondary hover:bg-white/5 transition-all">Cancel</button>
            <button onClick={handleSave} className="px-10 py-2.5 bg-wa-accent rounded-xl text-xs font-black uppercase tracking-widest text-wa-bg hover:bg-[#00c298] transition-all shadow-lg shadow-wa-accent/20 active:scale-95">Save Changes</button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
