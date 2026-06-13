const Database = require('better-sqlite3');
const path = require('path');

function wrapDb(bsDb) {
    return {
        exec: async (sql) => { bsDb.exec(sql); },
        run: async (sql, ...params) => {
            const flat = params.flat();
            const stmt = bsDb.prepare(sql);
            const info = stmt.run(...flat);
            return { lastID: info.lastInsertRowid, changes: info.changes };
        },
        get: async (sql, ...params) => {
            const flat = params.flat();
            return bsDb.prepare(sql).get(...flat);
        },
        all: async (sql, ...params) => {
            const flat = params.flat();
            return bsDb.prepare(sql).all(...flat);
        },
    };
}

async function setupDatabase() {
    const bsDb = new Database(path.join(__dirname, '../../database.sqlite'));
    bsDb.pragma('journal_mode = WAL');
    const db = wrapDb(bsDb);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS agents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            group_id INTEGER,
            expertise TEXT,
            avoid TEXT,
            type TEXT DEFAULT 'individual',
            system_prompt TEXT
        );

        CREATE TABLE IF NOT EXISTS groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT DEFAULT 'main'
        );

        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            reference_id INTEGER,
            title TEXT
        );

        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id INTEGER,
            sender_type TEXT,
            sender_id TEXT,
            content TEXT,
            attachments TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id INTEGER,
            title TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT DEFAULT 'default',
            selected_model TEXT,
            provider TEXT,
            api_keys TEXT
        );

        CREATE TABLE IF NOT EXISTS user_profile (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            full_name TEXT,
            nickname TEXT,
            dob TEXT,
            gender TEXT,
            photo_url TEXT,
            occupation TEXT,
            education TEXT,
            birth_time TEXT,
            birth_place TEXT,
            astrology_enabled INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS profile_attributes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            key TEXT,
            value TEXT NOT NULL,
            importance INTEGER DEFAULT 5,
            sensitive INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS memories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            body TEXT,
            event_date TEXT,
            tags TEXT,
            importance INTEGER DEFAULT 5,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            details TEXT,
            due_at TEXT NOT NULL,
            recurrence TEXT,
            completed_at TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS pinned_chats (
            agent_id TEXT PRIMARY KEY,
            position INTEGER NOT NULL,
            pinned_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS daily_briefs (
            date TEXT PRIMARY KEY,
            body TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        );
    `);

    const profileRow = await db.get('SELECT id FROM user_profile WHERE id = 1');
    if (!profileRow) {
        await db.run('INSERT INTO user_profile (id) VALUES (1)');
    }

    const pinnedSecretary = await db.get('SELECT agent_id FROM pinned_chats WHERE agent_id = ?', 'personal-secretary');
    if (!pinnedSecretary) {
        await db.run('INSERT INTO pinned_chats (agent_id, position) VALUES (?, ?)', 'personal-secretary', 0);
    }

    const agentCount = await db.get('SELECT COUNT(*) as count FROM agents');
    if (agentCount.count === 0) {
        await db.run(`INSERT INTO agents (name, expertise, avoid, system_prompt) VALUES (?, ?, ?, ?)`,
            'Personal Secretary', '[]', '[]', 'You are a personal secretary. Aggregate expert responses.');

        await db.run(`INSERT INTO agents (name, expertise, avoid, system_prompt) VALUES (?, ?, ?, ?)`,
            'Naturopathy Expert', '["natural healing", "diet", "lifestyle", "detox"]', '["astrology", "religion"]', 'You are a naturopathy expert.');

        await db.run(`INSERT INTO agents (name, expertise, avoid, system_prompt) VALUES (?, ?, ?, ?)`,
            'Vedic Astrology', '["astrology", "horoscope", "planets", "zodiac"]', '["medicine", "science"]', 'You are a Vedic Astrology expert.');
    }

    return db;
}

module.exports = { setupDatabase };
