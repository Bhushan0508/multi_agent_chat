class ReminderService {
    constructor(db) {
        this.db = db;
    }

    async list({ upcoming } = {}) {
        if (upcoming) {
            const now = new Date().toISOString();
            const weekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
            return this.db.all(
                'SELECT * FROM reminders WHERE completed_at IS NULL AND due_at <= ? ORDER BY due_at ASC',
                weekLater
            );
        }
        return this.db.all('SELECT * FROM reminders ORDER BY due_at ASC');
    }

    async dueWithin(hours) {
        const cutoff = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
        return this.db.all(
            'SELECT * FROM reminders WHERE completed_at IS NULL AND due_at <= ? ORDER BY due_at ASC',
            cutoff
        );
    }

    async add({ title, details, due_at, recurrence }) {
        if (!title || !due_at) throw new Error('title and due_at are required');
        const result = await this.db.run(
            'INSERT INTO reminders (title, details, due_at, recurrence) VALUES (?, ?, ?, ?)',
            title, details || null, due_at, recurrence || null
        );
        return this.db.get('SELECT * FROM reminders WHERE id = ?', result.lastID);
    }

    async update(id, fields) {
        const allowed = ['title', 'details', 'due_at', 'recurrence', 'completed_at'];
        const set = [];
        const values = [];
        for (const k of allowed) {
            if (k in fields) {
                set.push(`${k} = ?`);
                values.push(fields[k]);
            }
        }
        if (set.length === 0) return this.db.get('SELECT * FROM reminders WHERE id = ?', id);
        values.push(id);
        await this.db.run(`UPDATE reminders SET ${set.join(', ')} WHERE id = ?`, ...values);
        return this.db.get('SELECT * FROM reminders WHERE id = ?', id);
    }

    async delete(id) {
        await this.db.run('DELETE FROM reminders WHERE id = ?', id);
        return { ok: true };
    }
}

module.exports = ReminderService;
