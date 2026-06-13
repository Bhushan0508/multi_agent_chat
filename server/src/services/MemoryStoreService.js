class MemoryStoreService {
    constructor(db) {
        this.db = db;
    }

    async list({ tag } = {}) {
        const rows = await this.db.all('SELECT * FROM memories ORDER BY importance DESC, COALESCE(event_date, created_at) DESC');
        if (!tag) return rows;
        return rows.filter(r => {
            try { return (JSON.parse(r.tags || '[]')).includes(tag); }
            catch { return false; }
        });
    }

    async add({ title, body, event_date, tags, importance = 5 }) {
        if (!title) throw new Error('title is required');
        const tagsJson = JSON.stringify(tags || []);
        const result = await this.db.run(
            'INSERT INTO memories (title, body, event_date, tags, importance) VALUES (?, ?, ?, ?, ?)',
            title, body || null, event_date || null, tagsJson, importance
        );
        return this.db.get('SELECT * FROM memories WHERE id = ?', result.lastID);
    }

    async update(id, fields) {
        const allowed = ['title', 'body', 'event_date', 'tags', 'importance'];
        const set = [];
        const values = [];
        for (const k of allowed) {
            if (k in fields) {
                set.push(`${k} = ?`);
                values.push(k === 'tags' ? JSON.stringify(fields[k] || []) : fields[k]);
            }
        }
        if (set.length === 0) return this.db.get('SELECT * FROM memories WHERE id = ?', id);
        values.push(id);
        await this.db.run(`UPDATE memories SET ${set.join(', ')} WHERE id = ?`, ...values);
        return this.db.get('SELECT * FROM memories WHERE id = ?', id);
    }

    async delete(id) {
        await this.db.run('DELETE FROM memories WHERE id = ?', id);
        return { ok: true };
    }
}

module.exports = MemoryStoreService;
