// Base URL of the multiagent-chat backend.
// In production, set VITE_API_URL to your Render backend URL at build time.
// Falls back to the local dev server when not set.
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
