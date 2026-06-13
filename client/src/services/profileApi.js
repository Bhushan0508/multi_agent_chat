import { API_BASE } from '../config';
const BASE = `${API_BASE}/api`;

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `${res.status} ${res.statusText}`);
  }
  return res.status === 204 ? null : res.json();
}

export const profileApi = {
  getProfile: () => req('/profile'),
  updateProfile: (fields) => req('/profile', { method: 'PUT', body: JSON.stringify(fields) }),
  uploadPhoto: async (file) => {
    const fd = new FormData();
    fd.append('photo', file);
    const res = await fetch(`${BASE}/profile/photo`, { method: 'POST', body: fd });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  listAttributes: (category) => req(`/profile/attributes${category ? `?category=${encodeURIComponent(category)}` : ''}`),
  addAttribute: (attr) => req('/profile/attributes', { method: 'POST', body: JSON.stringify(attr) }),
  updateAttribute: (id, attr) => req(`/profile/attributes/${id}`, { method: 'PUT', body: JSON.stringify(attr) }),
  deleteAttribute: (id) => req(`/profile/attributes/${id}`, { method: 'DELETE' }),

  listMemories: (tag) => req(`/memories${tag ? `?tag=${encodeURIComponent(tag)}` : ''}`),
  addMemory: (m) => req('/memories', { method: 'POST', body: JSON.stringify(m) }),
  updateMemory: (id, m) => req(`/memories/${id}`, { method: 'PUT', body: JSON.stringify(m) }),
  deleteMemory: (id) => req(`/memories/${id}`, { method: 'DELETE' }),

  listReminders: (upcoming) => req(`/reminders${upcoming ? '?upcoming=true' : ''}`),
  addReminder: (r) => req('/reminders', { method: 'POST', body: JSON.stringify(r) }),
  updateReminder: (id, r) => req(`/reminders/${id}`, { method: 'PUT', body: JSON.stringify(r) }),
  deleteReminder: (id) => req(`/reminders/${id}`, { method: 'DELETE' }),

  getSecretaryContext: (slice = 'full') => req(`/secretary/context?slice=${slice}`),
  getDailyBrief: () => req('/secretary/daily-brief'),
  getPinnedChats: () => req('/pinned-chats'),
};
