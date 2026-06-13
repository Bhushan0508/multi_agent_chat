# Personal Secretary Dashboard — Design Spec

> Status: spec for `feat/personal-secretary-dashboard`. MVP scope below; everything tagged **(Future)** is deferred.

## 1. Product framing

The app stops being "a multi-agent chat tool" and becomes **your personal secretary**. The Secretary is the single front door. Specialist agents (zoologist, astrologer, cardiologist, …) are tools the Secretary consults on your behalf; you rarely talk to them directly.

Three product anchors:

1. **Default landing = Secretary chat.** Always. Personal Secretary is pinned at the top of the chat list and cannot be deleted, renamed, or unpinned.
2. **First avatar icon = Profile Hub.** The first sidebar slot opens a full dashboard of who you are, not a chat. The Secretary uses this profile on every turn so its replies are context-aware.
3. **Continuously editable knowledge.** Identity, habits, goals, memories, routines, milestones are all add-anytime. No "complete your profile" wall.

## 2. UX flows

### 2.1 First-time user

```
App open
  → "Welcome. I'm your Secretary." card in Secretary chat
  → CTA: "Tell me about yourself" → opens Profile Hub > Identity
  → User fills Name + DOB (only required) → returns to Secretary
  → Secretary greets by name, asks 1 follow-up question
```

Friction budget: name + DOB is the only required step. Everything else is optional and discoverable via Profile Hub.

### 2.2 Returning user (every subsequent launch)

```
App open
  → Restore last Secretary session
  → Top of pane: "Daily brief" card (today's date, weather-of-the-day-of-life summary, due reminders)
  → Cursor in input box, ready to type
```

If the user was previously in a non-Secretary chat (e.g. talking to Cardiologist), restore that chat — but the Secretary is always one tap away (avatar in top-left? no — sidebar first row).

### 2.3 Asking a domain question

```
User in Secretary chat: "I've had chest tightness after meals for 3 days."
  → Secretary orchestrator
      → builds profile-context preamble (age, conditions, meds)
      → identifies relevant specialists (Cardiologist, Gastroenterologist)
      → calls each in background
      → aggregates into one Secretary reply
  → User sees: ONE coherent Secretary message ("Based on what I know about you... two specialists I consulted say...")
  → Optional: "Talk to Cardiologist directly" chip below the message
```

This is already partly built (`getSecretaryResponse`); MVP wires profile + memory into the upstream prompts.

### 2.4 Profile edit

```
Tap avatar (sidebar slot 1)
  → Profile Hub
  → 8 tabs (Identity, Personal, Preferences, Memories, Goals, Astrology, Timeline, Settings)
  → Each section: read view by default → "Edit" inline → autosave on blur
  → Diff goes to server → Secretary's next prompt sees the new value
```

No save buttons. Every field autosaves. Conflict resolution = last-write-wins (single user; sync addressed in §8).

## 3. Wireframes (text)

### 3.1 Main shell (desktop, ≥1024px)

```
┌──────┬──────────────────┬───────────────────────────────────────┬────────────────────┐
│ [👤] │  Chats           │  Personal Secretary       [↻]   [⋮]   │  Sessions          │
│      │  ────────────    │  ────────────────────────────────────  │  ───────────       │
│ [💬] │ 📌 Personal      │                                       │  Today's session   │
│      │    Secretary  ●  │  ┌────────────────────────────────┐   │  Yesterday: dinner │
│ [👥] │  ────────────    │  │ 🌅 Good morning, Bhushan.       │   │  Mon: trip plan    │
│      │  Cardiologist    │  │ • 2 reminders due today         │   │                    │
│ [📁] │  Astrologer      │  │ • Birth anniversary: dad (in 3) │   │  + New session     │
│      │  ...             │  │ [Open day plan]                 │   │                    │
│      │                  │  └────────────────────────────────┘   │                    │
│      │                  │                                       │                    │
│      │                  │  You: I have chest tightness…         │                    │
│      │                  │  Secretary: Based on what I know …    │                    │
│ ⏵    │                  │                                       │                    │
│ [⚙]  │                  │  [ type a message…              ➤ ]   │                    │
└──────┴──────────────────┴───────────────────────────────────────┴────────────────────┘
```

The 📌 icon next to Personal Secretary is permanent and the row sits above all other chats regardless of recency.

### 3.2 Profile Hub (desktop)

```
┌──────────────────────────────────────────────────────────────────┐
│  ← Back to Secretary                                             │
│                                                                  │
│   ╭──────╮   Bhushan Gandhi                                      │
│   │ 🖼  │   "Personal assistant user"                            │
│   ╰──────╯   Born 8 May 1995 · 30y · Mumbai                      │
│                                                                  │
│  ┌─Identity──┬─Personal─┬─Prefs─┬─Memories─┬─Goals─┬─★─┬─📅─┬─⚙─┐│
│  │                                                              ││
│  │   IDENTITY                                                   ││
│  │   ─────────                                                  ││
│  │   Full name      Bhushan Gandhi              [✎]             ││
│  │   Nickname       Bhushu                      [✎]             ││
│  │   DOB            1995-05-08 (30 years old)   [✎]             ││
│  │   Gender         Male (optional)             [✎]             ││
│  │   Photo          [upload]                                    ││
│  │                                                              ││
│  └──────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

### 3.3 Mobile (<768px) — bottom-tab shell

```
┌──────────────────────┐
│  Personal Secretary  │
│ ────────────────────│
│  [Daily brief]       │
│                      │
│  ...messages...      │
│                      │
│  [ type message  ➤ ] │
├──────────────────────┤
│  💬   👤   ⚙        │
│ Sec.  You  Sets      │
└──────────────────────┘
```

Three bottom tabs: **Secretary (default)**, **You (Profile Hub)**, **Settings**. Specialist chats are accessed from inside Secretary via "Talk to specialist" chip, never as a primary tab.

## 4. Information architecture

```
/                      → Secretary chat (default route)
/secretary             → same as /
/specialists/:agentId  → 1:1 with a specialist
/groups/:groupId       → group consult
/profile               → Profile Hub
/profile/identity      → tabs are deep-linkable
/profile/personal
/profile/preferences
/profile/memories
/profile/goals
/profile/astrology     (Future, hidden until enabled)
/profile/timeline
/profile/settings
```

Routing is client-side React state in MVP (no router lib added); URLs reflect via `history.pushState` for back-button support.

## 5. Database schema (server, better-sqlite3)

We keep the existing `agents`, `agent_memory`, `conversations`, `messages`, `user_settings` tables. Add:

```sql
-- single-user MVP: row id 1 always
CREATE TABLE IF NOT EXISTS user_profile (
  id              INTEGER PRIMARY KEY CHECK (id = 1),
  full_name       TEXT,
  nickname        TEXT,
  dob             TEXT,            -- ISO date
  gender          TEXT,
  photo_url       TEXT,
  occupation      TEXT,
  education       TEXT,
  birth_time      TEXT,            -- HH:MM (astrology, Future)
  birth_place     TEXT,            -- city, country (astrology, Future)
  astrology_enabled INTEGER DEFAULT 0,
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now'))
);

-- open-ended k/v for everything the user wants to add
CREATE TABLE IF NOT EXISTS profile_attributes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  category    TEXT NOT NULL,       -- 'interest' | 'goal' | 'habit' | 'routine' | 'relationship' | 'note' | 'preference' | 'custom'
  key         TEXT,                -- e.g. 'favorite_cuisine'
  value       TEXT NOT NULL,
  importance  INTEGER DEFAULT 5,   -- 1-10, drives retrieval ranking
  created_at  TEXT DEFAULT (datetime('now'))
);

-- discrete remembered events ("life events", "milestones")
CREATE TABLE IF NOT EXISTS memories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  body        TEXT,
  event_date  TEXT,                -- nullable, ISO date
  tags        TEXT,                -- JSON array
  importance  INTEGER DEFAULT 5,
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reminders (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  details     TEXT,
  due_at      TEXT NOT NULL,       -- ISO datetime
  recurrence  TEXT,                -- null | 'daily' | 'weekly' | 'monthly' | 'yearly'
  completed_at TEXT,
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pinned_chats (
  agent_id    TEXT PRIMARY KEY,
  position    INTEGER NOT NULL,
  pinned_at   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS daily_briefs (
  date        TEXT PRIMARY KEY,    -- YYYY-MM-DD
  body        TEXT NOT NULL,
  created_at  TEXT DEFAULT (datetime('now'))
);
```

Seed: insert `personal-secretary` into `pinned_chats` at position 0 on first boot, and a `user_profile` row with id=1 if absent.

## 6. API design

All under `/api`. All single-user, no auth in MVP.

| Method | Path | Purpose |
|--------|------|---------|
| GET    | `/api/profile`              | Full profile object (identity + attributes + counts) |
| PUT    | `/api/profile`              | Update identity fields (partial) |
| POST   | `/api/profile/photo`        | Multipart upload, returns URL |
| GET    | `/api/profile/attributes`   | Filter by `?category=` |
| POST   | `/api/profile/attributes`   | Add k/v attribute |
| PUT    | `/api/profile/attributes/:id` | Edit |
| DELETE | `/api/profile/attributes/:id` | Remove |
| GET    | `/api/memories`             | List, optional `?tag=` |
| POST   | `/api/memories`             | Add |
| PUT    | `/api/memories/:id`         | Edit |
| DELETE | `/api/memories/:id`         | Remove |
| GET    | `/api/reminders`            | `?upcoming=true` returns next 7 days |
| POST   | `/api/reminders`            | Add |
| PUT    | `/api/reminders/:id`        | Edit/complete |
| DELETE | `/api/reminders/:id`        | Remove |
| GET    | `/api/secretary/context`    | Profile summary block ready to inject into LLM |
| GET    | `/api/secretary/daily-brief?date=YYYY-MM-DD` | Returns today's brief; generates+caches on first call per day |
| GET    | `/api/pinned-chats`         | Pinned chat list (ordered) |

### Secretary context endpoint (the key one)

`GET /api/secretary/context` returns:

```json
{
  "preamble": "User profile: Bhushan Gandhi, 30, born Mumbai. Occupation: software engineer. Goals: ship dashboard MVP. Habits: morning walk, vegetarian diet. Recent memories: father's birthday in 3 days...",
  "tokens_est": 180
}
```

The orchestrator concatenates this in front of every Secretary system prompt. Specialist agents get a trimmed version (relevant slice only — Cardiologist gets health-flagged attributes, not interests).

## 7. Personal Secretary intelligence

Three jobs:

1. **Contextual aggregation** (already exists, plug profile in)
2. **Daily brief** — once per local day, generate a 3-bullet morning summary:
   - upcoming reminders for next 24h
   - upcoming birthdays / milestones (next 7 days)
   - 1 personalized prompt ("you mentioned you wanted to revive yoga — today's a Tuesday, your usual day")

   Generated lazily on first Secretary view of the day. Stored in `daily_briefs`. No background scheduler in MVP — saves us from cron infra.

3. **Long-term planning (Future)** — track goals, ping when slipping. Out of MVP.

## 8. Sync strategy

MVP: server SQLite is single source of truth. Client uses HTTP fetches against it, no local mirror beyond React state. Treat the local network as the trust boundary.

Cross-device:
- Device A and B both hit the same server URL (configurable in Settings)
- "Pair device" = entering the server URL on device B
- Updates push via existing socket.io connection; each mutation emits `profile_updated` / `reminders_changed` events; clients refetch the slice
- Conflict resolution: last-write-wins, server timestamp authoritative

Offline (MVP): client falls back to localStorage cache of last-known profile; mutations queued and replayed on reconnect. Out of scope for this turn; will add in follow-up.

## 9. Privacy

- All data lives in `server/database.sqlite` on the user's own machine. No cloud calls except to the LLM provider the user picked (Ollama = stays local).
- LLM prompts that include profile data are logged at INFO only with `[PROFILE REDACTED]` placeholder by default. Toggle in Settings.
- Sensitive sections (DOB, relationships, astrology birth details) are flagged `sensitive=true` in `profile_attributes`; UI shows a privacy-shield icon and asks for confirmation before including them in any non-Secretary specialist prompt.
- "Forget about X" command in Secretary chat → deletes matching memory/attribute and re-emits to clients.
- **(Future)** Encrypted-at-rest with SQLCipher; passphrase derived from device keychain.

## 10. Edge cases

| Case | Handling |
|------|----------|
| User deletes Personal Secretary | Blocked. The delete button is hidden for pinned-system agents; backend rejects with 409 if attempted directly. |
| User has 0 specialists installed | Secretary answers itself with general knowledge + "I don't have a specialist for this yet, want me to suggest one?" |
| Profile entirely empty | Secretary asks 1 onboarding question per turn until name + DOB known; never blocks. |
| Reminder due_at in past, not completed | Surfaced in daily brief as "overdue" until completed or deleted. |
| Two devices edit same field within 1s | Last write wins, loser device shows toast "Updated on another device". |
| User toggles astrology off after entering birth chart | Birth fields preserved in DB but hidden in UI; not included in any prompt. |
| User uninstalls Ollama / no provider | Secretary degrades to "I can't reach the AI right now. Your data is safe; reminders still surface." |
| DOB parses ambiguously (e.g. 01/02/2020) | Force ISO `YYYY-MM-DD` input with a date picker. |
| Daily brief generation fails | Cache an empty brief for the day to avoid retry storms; surface "Brief unavailable" card. |

## 11. Visual language

Keep dark theme + framer-motion. Refinements:
- New color tokens: `wa-secretary` (warm amber for Secretary-specific accents) alongside existing `wa-accent` (green).
- Profile Hub uses card-dense layout, glass panels (`bg-white/5 backdrop-blur`), 16px radius on cards.
- Avatar in sidebar slot 1 gets a subtle glow ring when there's an unread daily brief.
- Daily brief card uses gradient `from-amber-500/10 to-emerald-500/10`.
- Mobile: 100vh layout, safe-area-inset-bottom respected.

## 12. Technical architecture

```
┌──────────────── Browser ──────────────┐
│  React 19 + Vite                       │
│  ├─ App.jsx           (view router)    │
│  ├─ pages/                              │
│  │   ├─ SecretaryChat                  │
│  │   └─ ProfileHub/*                   │
│  ├─ services/                           │
│  │   ├─ orchestrator.js  (LLM routing) │
│  │   ├─ profileApi.js    (REST client) │
│  │   └─ aiProvider.js    (Ollama/etc)  │
│  └─ socket.io client                    │
└────┬──────────────────────┬────────────┘
     │HTTP                  │WS
     ▼                      ▼
┌────────── Node Express + Socket.IO ────┐
│  index.js              (HTTP + WS)     │
│  routes/                                │
│    profile.js          (REST)          │
│  services/                              │
│    ProfileService                       │
│    SecretaryContextService              │
│    ReminderService                       │
│    AIOrchestrator        (parked)       │
│    AgentMemoryService                   │
│  models/db.js          (better-sqlite3) │
└────────────────────────────────────────┘
              │
              ▼
       database.sqlite     (single user)
```

LLM calls still go **client → Ollama** for low latency. Server is the system of record for profile/memory/reminders, and the orchestrator fetches `/api/secretary/context` before composing prompts.

## 13. User journey (returning user, mid-day)

```
12:30 PM — opens app
  → Secretary chat already loaded with morning brief card collapsed
  → Types "what should I make for dinner that fits my diabetic diet"
  → Orchestrator:
      1. GET /api/secretary/context  → "diabetic, vegetarian, dislikes mushrooms"
      2. fetch relevant specialists → Naturopath + Ayurvedic
      3. each gets profile-trimmed prompt
      4. Secretary aggregates → one reply
  → User: "save this idea"
  → Secretary: POST /api/memories with {title: "Dinner idea", body: "...", tags:["recipe","diabetic"]}
  → Toast: "Saved to your memories"
```

## 14. MVP vs Future

**MVP (this branch):**
- DB schema (all new tables)
- REST endpoints (profile, attributes, memories, reminders, secretary context, daily brief, pinned)
- Personal Secretary permanently pinned at top of chat list, undeletable, default landing
- Profile Hub with Identity, Personal Details, Preferences, Memories, Goals, Timeline, Settings sections
- Astrology section visible as toggleable card, fields saved, computations stubbed
- Profile-aware Secretary: context preamble injected into every prompt
- Daily brief card surfaced on first Secretary view per day
- Mobile-responsive layout (single column, bottom tabs)

**Future (separate branches):**
- Astrology engine via `swisseph` (free) — natal chart + Vimshottari Dasha/Antardasha
- Multi-device sync over WebSocket diffs + offline queue
- SQLCipher encryption-at-rest
- Background scheduler for proactive notifications (reminders, brief)
- Voice-first Secretary (transcribe → Secretary → TTS reply)
- Goal tracking with progress graphs
- Long-term memory consolidation (nightly LLM job that summarizes the day's chats into structured memories)
- "Forget about X" natural-language command
- Export / backup / encrypted bundle
