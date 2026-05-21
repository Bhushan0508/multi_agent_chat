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
    `);

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
