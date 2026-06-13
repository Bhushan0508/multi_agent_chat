class ProfileService {
    constructor(db) {
        this.db = db;
    }

    async getProfile() {
        const identity = await this.db.get('SELECT * FROM user_profile WHERE id = 1');
        const attributes = await this.db.all('SELECT * FROM profile_attributes ORDER BY importance DESC, created_at DESC');
        return { ...identity, attributes };
    }

    async updateIdentity(fields) {
        const allowed = ['full_name', 'nickname', 'dob', 'gender', 'photo_url', 'occupation', 'education', 'birth_time', 'birth_place', 'astrology_enabled'];
        const set = [];
        const values = [];
        for (const k of allowed) {
            if (k in fields) {
                set.push(`${k} = ?`);
                values.push(fields[k]);
            }
        }
        if (set.length === 0) return this.getProfile();
        set.push(`updated_at = datetime('now')`);
        await this.db.run(`UPDATE user_profile SET ${set.join(', ')} WHERE id = 1`, ...values);
        return this.getProfile();
    }

    async listAttributes(category) {
        if (category) {
            return this.db.all('SELECT * FROM profile_attributes WHERE category = ? ORDER BY importance DESC, created_at DESC', category);
        }
        return this.db.all('SELECT * FROM profile_attributes ORDER BY importance DESC, created_at DESC');
    }

    async addAttribute({ category, key, value, importance = 5, sensitive = 0 }) {
        if (!category || !value) throw new Error('category and value are required');
        const result = await this.db.run(
            'INSERT INTO profile_attributes (category, key, value, importance, sensitive) VALUES (?, ?, ?, ?, ?)',
            category, key || null, value, importance, sensitive ? 1 : 0
        );
        return this.db.get('SELECT * FROM profile_attributes WHERE id = ?', result.lastID);
    }

    async updateAttribute(id, fields) {
        const allowed = ['category', 'key', 'value', 'importance', 'sensitive'];
        const set = [];
        const values = [];
        for (const k of allowed) {
            if (k in fields) {
                set.push(`${k} = ?`);
                values.push(k === 'sensitive' ? (fields[k] ? 1 : 0) : fields[k]);
            }
        }
        if (set.length === 0) return this.db.get('SELECT * FROM profile_attributes WHERE id = ?', id);
        values.push(id);
        await this.db.run(`UPDATE profile_attributes SET ${set.join(', ')} WHERE id = ?`, ...values);
        return this.db.get('SELECT * FROM profile_attributes WHERE id = ?', id);
    }

    async deleteAttribute(id) {
        await this.db.run('DELETE FROM profile_attributes WHERE id = ?', id);
        return { ok: true };
    }
}

module.exports = ProfileService;
