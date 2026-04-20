const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function setupDatabase() {
    const db = await open({
        filename: path.join(__dirname, '../../database.sqlite'),
        driver: sqlite3.Database
    });

    // Create Tables
    await db.exec(`
        CREATE TABLE IF NOT EXISTS agents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            group_id INTEGER,
            expertise TEXT, -- JSON array
            avoid TEXT, -- JSON array
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
            attachments TEXT, -- JSON array
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
            api_keys TEXT -- JSON string (encrypted in production)
        );
    `);

    // Add some default data if empty
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
