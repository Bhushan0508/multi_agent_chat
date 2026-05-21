import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, User, Heart, Star, BookOpen, Target, Sparkles, Calendar, Settings as SettingsIcon,
  Plus, Trash2, Edit2, Check, X, Upload
} from 'lucide-react';
import { profileApi } from '../../services/profileApi';

const TABS = [
  { id: 'identity', label: 'Identity', icon: User },
  { id: 'personal', label: 'Personal', icon: Heart },
  { id: 'preferences', label: 'Preferences', icon: Star },
  { id: 'memories', label: 'Memories', icon: BookOpen },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'astrology', label: 'Astrology', icon: Sparkles },
  { id: 'timeline', label: 'Timeline', icon: Calendar },
];

function calcAge(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d)) return null;
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

function InlineField({ label, value, onSave, type = 'text', placeholder = '—' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');
  useEffect(() => { setDraft(value ?? ''); }, [value]);

  const commit = async () => {
    if (draft !== (value ?? '')) await onSave(draft);
    setEditing(false);
  };

  return (
    <div className="flex items-start gap-4 py-3 border-b border-white/5 group">
      <div className="w-32 shrink-0 text-[13px] text-wa-text-secondary font-medium pt-1">{label}</div>
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex gap-2">
            <input
              type={type}
              autoFocus
              className="flex-1 bg-wa-sidebar border border-wa-accent/40 rounded-lg px-3 py-1.5 text-sm outline-none text-wa-text-primary"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(value ?? ''); setEditing(false); } }}
            />
            <button onClick={commit} className="p-1.5 text-wa-accent hover:bg-wa-accent/10 rounded-lg"><Check size={16} /></button>
            <button onClick={() => { setDraft(value ?? ''); setEditing(false); }} className="p-1.5 text-wa-text-secondary hover:bg-white/5 rounded-lg"><X size={16} /></button>
          </div>
        ) : (
          <div onClick={() => setEditing(true)} className="text-sm text-wa-text-primary cursor-text flex items-center gap-2 min-h-[28px]">
            <span className={value ? '' : 'text-wa-text-secondary italic'}>{value || placeholder}</span>
            <Edit2 size={12} className="opacity-0 group-hover:opacity-50 transition-opacity" />
          </div>
        )}
      </div>
    </div>
  );
}

function AttributeList({ category, attributes, onAdd, onUpdate, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ key: '', value: '' });

  const items = attributes.filter(a => a.category === category);

  return (
    <div className="space-y-2">
      {items.length === 0 && !adding && (
        <p className="text-sm text-wa-text-secondary italic">No {category}s yet.</p>
      )}
      {items.map(a => (
        <div key={a.id} className="flex items-center gap-3 p-3 bg-white/[0.02] hover:bg-white/5 rounded-lg group transition-all">
          <div className="flex-1 min-w-0">
            {a.key && <div className="text-[11px] text-wa-text-secondary uppercase tracking-wide font-semibold">{a.key}</div>}
            <div className="text-sm text-wa-text-primary">{a.value}</div>
          </div>
          <button
            onClick={() => onDelete(a.id)}
            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-red-400 rounded-lg transition-all"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      {adding ? (
        <div className="flex gap-2 p-3 bg-white/[0.02] rounded-lg">
          <input
            autoFocus
            placeholder="Label (optional)"
            className="w-1/3 bg-wa-sidebar border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none text-wa-text-primary"
            value={draft.key}
            onChange={e => setDraft({ ...draft, key: e.target.value })}
          />
          <input
            placeholder={`Add a ${category}…`}
            className="flex-1 bg-wa-sidebar border border-wa-accent/40 rounded-lg px-3 py-1.5 text-sm outline-none text-wa-text-primary"
            value={draft.value}
            onChange={e => setDraft({ ...draft, value: e.target.value })}
            onKeyDown={async e => {
              if (e.key === 'Enter' && draft.value.trim()) {
                await onAdd({ category, key: draft.key.trim() || null, value: draft.value.trim() });
                setDraft({ key: '', value: '' });
                setAdding(false);
              }
              if (e.key === 'Escape') { setDraft({ key: '', value: '' }); setAdding(false); }
            }}
          />
          <button
            onClick={async () => {
              if (!draft.value.trim()) return;
              await onAdd({ category, key: draft.key.trim() || null, value: draft.value.trim() });
              setDraft({ key: '', value: '' });
              setAdding(false);
            }}
            className="p-1.5 text-wa-accent hover:bg-wa-accent/10 rounded-lg"
          ><Check size={16} /></button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 text-sm text-wa-accent hover:bg-wa-accent/10 px-3 py-1.5 rounded-lg transition-all"
        >
          <Plus size={14} /> Add {category}
        </button>
      )}
    </div>
  );
}

function MemoriesSection({ memories, onAdd, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ title: '', body: '', event_date: '' });

  return (
    <div className="space-y-3">
      {memories.map(m => (
        <div key={m.id} className="p-4 bg-white/[0.02] hover:bg-white/5 rounded-xl group transition-all">
          <div className="flex justify-between items-start gap-3 mb-1">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-wa-text-primary">{m.title}</h4>
              {m.event_date && <div className="text-[11px] text-amber-400 mt-0.5">{m.event_date}</div>}
            </div>
            <button
              onClick={() => onDelete(m.id)}
              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-red-400 rounded-lg transition-all"
            ><Trash2 size={14} /></button>
          </div>
          {m.body && <p className="text-sm text-wa-text-secondary whitespace-pre-wrap">{m.body}</p>}
        </div>
      ))}
      {adding ? (
        <div className="p-4 bg-white/[0.02] rounded-xl space-y-2">
          <input
            autoFocus
            placeholder="Memory title"
            className="w-full bg-wa-sidebar border border-wa-accent/40 rounded-lg px-3 py-2 text-sm outline-none text-wa-text-primary"
            value={draft.title}
            onChange={e => setDraft({ ...draft, title: e.target.value })}
          />
          <input
            type="date"
            className="w-full bg-wa-sidebar border border-white/10 rounded-lg px-3 py-2 text-sm outline-none text-wa-text-primary"
            value={draft.event_date}
            onChange={e => setDraft({ ...draft, event_date: e.target.value })}
          />
          <textarea
            placeholder="Details (optional)…"
            rows={3}
            className="w-full bg-wa-sidebar border border-white/10 rounded-lg px-3 py-2 text-sm outline-none text-wa-text-primary resize-none"
            value={draft.body}
            onChange={e => setDraft({ ...draft, body: e.target.value })}
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setDraft({ title: '', body: '', event_date: '' }); setAdding(false); }} className="px-3 py-1.5 text-sm text-wa-text-secondary hover:bg-white/5 rounded-lg">Cancel</button>
            <button
              onClick={async () => {
                if (!draft.title.trim()) return;
                await onAdd({ title: draft.title.trim(), body: draft.body.trim() || null, event_date: draft.event_date || null });
                setDraft({ title: '', body: '', event_date: '' });
                setAdding(false);
              }}
              className="px-4 py-1.5 text-sm bg-wa-accent text-white rounded-lg hover:bg-wa-accent/90"
            >Save</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 text-sm text-wa-accent hover:bg-wa-accent/10 px-3 py-2 rounded-lg transition-all"
        ><Plus size={16} /> Add memory</button>
      )}
    </div>
  );
}

const ProfileHub = ({ onClose, onOpenSettings }) => {
  const [profile, setProfile] = useState(null);
  const [memories, setMemories] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [activeTab, setActiveTab] = useState('identity');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const [p, m, r] = await Promise.all([
        profileApi.getProfile(),
        profileApi.listMemories(),
        profileApi.listReminders(),
      ]);
      setProfile(p);
      setMemories(m);
      setReminders(r);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const updateIdentity = async (field, value) => {
    const updated = await profileApi.updateProfile({ [field]: value });
    setProfile(updated);
  };

  const handleAddAttribute = async (attr) => {
    await profileApi.addAttribute(attr);
    await refresh();
  };
  const handleDeleteAttribute = async (id) => {
    await profileApi.deleteAttribute(id);
    await refresh();
  };

  const handleAddMemory = async (m) => {
    await profileApi.addMemory(m);
    await refresh();
  };
  const handleDeleteMemory = async (id) => {
    await profileApi.deleteMemory(id);
    await refresh();
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await profileApi.uploadPhoto(file);
    await refresh();
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-wa-text-secondary">Loading profile…</div>;
  }
  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-wa-text-secondary p-8 text-center">
        <p>Failed to load profile: {error}</p>
        <button onClick={refresh} className="px-4 py-2 bg-wa-accent text-white rounded-lg">Retry</button>
      </div>
    );
  }

  const age = calcAge(profile.dob);
  const attributes = profile.attributes || [];

  return (
    <div className="flex-1 flex flex-col bg-wa-bg overflow-hidden">
      {/* Header */}
      <header className="p-6 border-b border-white/5 flex items-center gap-4">
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/5 rounded-lg text-wa-text-secondary hover:text-wa-text-primary transition-colors"
        ><ArrowLeft size={20} /></button>
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <label className="relative cursor-pointer group">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-wa-accent to-emerald-900 flex items-center justify-center overflow-hidden border-2 border-white/10">
              {profile.photo_url ? (
                <img src={`http://localhost:5000${profile.photo_url}`} alt="" className="w-full h-full object-cover" />
              ) : (
                <User size={28} className="text-white" />
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Upload size={16} className="text-white" />
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-wa-text-primary truncate">{profile.full_name || 'Your name'}</h1>
            <p className="text-sm text-wa-text-secondary truncate">
              {[profile.nickname && `"${profile.nickname}"`, age != null && `${age} years`, profile.birth_place].filter(Boolean).join(' · ') || 'Tap fields to add details'}
            </p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex gap-1 px-4 border-b border-white/5 overflow-x-auto custom-scrollbar shrink-0">
        {TABS.map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                active
                  ? 'border-wa-accent text-wa-accent'
                  : 'border-transparent text-wa-text-secondary hover:text-wa-text-primary'
              }`}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-wa-text-secondary hover:text-wa-text-primary ml-auto whitespace-nowrap"
        >
          <SettingsIcon size={16} /> Settings
        </button>
      </nav>

      {/* Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'identity' && (
                <section>
                  <h2 className="text-lg font-bold text-wa-text-primary mb-4">Identity</h2>
                  <InlineField label="Full name" value={profile.full_name} onSave={v => updateIdentity('full_name', v)} />
                  <InlineField label="Nickname" value={profile.nickname} onSave={v => updateIdentity('nickname', v)} />
                  <InlineField label="Date of birth" value={profile.dob} type="date" onSave={v => updateIdentity('dob', v)} />
                  <InlineField label="Age" value={age != null ? `${age} years` : ''} onSave={() => {}} placeholder="Auto from DOB" />
                  <InlineField label="Gender" value={profile.gender} onSave={v => updateIdentity('gender', v)} />
                </section>
              )}

              {activeTab === 'personal' && (
                <section>
                  <h2 className="text-lg font-bold text-wa-text-primary mb-4">Personal</h2>
                  <InlineField label="Occupation" value={profile.occupation} onSave={v => updateIdentity('occupation', v)} />
                  <InlineField label="Education" value={profile.education} onSave={v => updateIdentity('education', v)} />

                  <div className="mt-8">
                    <h3 className="text-sm font-semibold text-wa-text-secondary uppercase tracking-wide mb-3">Interests</h3>
                    <AttributeList category="interest" attributes={attributes} onAdd={handleAddAttribute} onDelete={handleDeleteAttribute} />
                  </div>

                  <div className="mt-8">
                    <h3 className="text-sm font-semibold text-wa-text-secondary uppercase tracking-wide mb-3">Relationships</h3>
                    <AttributeList category="relationship" attributes={attributes} onAdd={handleAddAttribute} onDelete={handleDeleteAttribute} />
                  </div>

                  <div className="mt-8">
                    <h3 className="text-sm font-semibold text-wa-text-secondary uppercase tracking-wide mb-3">Notes</h3>
                    <AttributeList category="note" attributes={attributes} onAdd={handleAddAttribute} onDelete={handleDeleteAttribute} />
                  </div>
                </section>
              )}

              {activeTab === 'preferences' && (
                <section>
                  <h2 className="text-lg font-bold text-wa-text-primary mb-4">Preferences & Habits</h2>
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-wa-text-secondary uppercase tracking-wide mb-3">Preferences</h3>
                    <AttributeList category="preference" attributes={attributes} onAdd={handleAddAttribute} onDelete={handleDeleteAttribute} />
                  </div>
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-wa-text-secondary uppercase tracking-wide mb-3">Habits</h3>
                    <AttributeList category="habit" attributes={attributes} onAdd={handleAddAttribute} onDelete={handleDeleteAttribute} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-wa-text-secondary uppercase tracking-wide mb-3">Daily routines</h3>
                    <AttributeList category="routine" attributes={attributes} onAdd={handleAddAttribute} onDelete={handleDeleteAttribute} />
                  </div>
                </section>
              )}

              {activeTab === 'memories' && (
                <section>
                  <h2 className="text-lg font-bold text-wa-text-primary mb-1">Memories & Milestones</h2>
                  <p className="text-sm text-wa-text-secondary mb-4">Important moments your Secretary will remember and surface.</p>
                  <MemoriesSection memories={memories} onAdd={handleAddMemory} onDelete={handleDeleteMemory} />
                </section>
              )}

              {activeTab === 'goals' && (
                <section>
                  <h2 className="text-lg font-bold text-wa-text-primary mb-4">Goals</h2>
                  <AttributeList category="goal" attributes={attributes} onAdd={handleAddAttribute} onDelete={handleDeleteAttribute} />
                </section>
              )}

              {activeTab === 'astrology' && (
                <section>
                  <h2 className="text-lg font-bold text-wa-text-primary mb-1 flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-400" /> Astrology Insights
                    <span className="text-[10px] uppercase tracking-wide bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">Optional</span>
                  </h2>
                  <p className="text-sm text-wa-text-secondary mb-6">Add birth details to unlock natal chart + dasha timeline in a future update.</p>

                  <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl mb-6">
                    <div>
                      <div className="text-sm font-semibold text-wa-text-primary">Enable astrology context</div>
                      <div className="text-xs text-wa-text-secondary">Lets Secretary reference astrological context.</div>
                    </div>
                    <button
                      onClick={() => updateIdentity('astrology_enabled', profile.astrology_enabled ? 0 : 1)}
                      className={`w-12 h-6 rounded-full transition-all relative ${profile.astrology_enabled ? 'bg-wa-accent' : 'bg-white/10'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${profile.astrology_enabled ? 'left-6' : 'left-0.5'}`} />
                    </button>
                  </div>

                  {profile.astrology_enabled ? (
                    <>
                      <InlineField label="Birth date" value={profile.dob} type="date" onSave={v => updateIdentity('dob', v)} />
                      <InlineField label="Birth time" value={profile.birth_time} type="time" onSave={v => updateIdentity('birth_time', v)} />
                      <InlineField label="Birth place" value={profile.birth_place} onSave={v => updateIdentity('birth_place', v)} />
                      <div className="mt-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl text-sm text-amber-200">
                        Natal chart and Dasha/Antardasha timeline computation coming in a future update.
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-wa-text-secondary italic">Toggle on to add birth details.</div>
                  )}
                </section>
              )}

              {activeTab === 'timeline' && (
                <section>
                  <h2 className="text-lg font-bold text-wa-text-primary mb-1">Timeline</h2>
                  <p className="text-sm text-wa-text-secondary mb-4">Upcoming reminders and significant dates.</p>

                  {reminders.length === 0 && memories.filter(m => m.event_date).length === 0 ? (
                    <p className="text-sm text-wa-text-secondary italic">Nothing on the timeline yet. Add reminders or memories with dates.</p>
                  ) : (
                    <div className="space-y-2">
                      {reminders.map(r => (
                        <div key={`r-${r.id}`} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg">
                          <Calendar size={16} className="text-wa-accent shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-wa-text-primary">{r.title}</div>
                            <div className="text-xs text-wa-text-secondary">{new Date(r.due_at).toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                      {memories.filter(m => m.event_date).map(m => (
                        <div key={`m-${m.id}`} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg">
                          <BookOpen size={16} className="text-amber-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-wa-text-primary">{m.title}</div>
                            <div className="text-xs text-wa-text-secondary">{m.event_date}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProfileHub;
