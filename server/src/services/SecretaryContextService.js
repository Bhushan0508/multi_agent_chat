function ageFromDob(dob) {
    if (!dob) return null;
    const birth = new Date(dob);
    if (isNaN(birth)) return null;
    const diff = Date.now() - birth.getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

class SecretaryContextService {
    constructor(db, profileService, memoryStore, reminderService) {
        this.db = db;
        this.profile = profileService;
        this.memories = memoryStore;
        this.reminders = reminderService;
    }

    async buildPreamble({ slice = 'full' } = {}) {
        const profile = await this.profile.getProfile();
        const memories = await this.memories.list();
        const upcomingReminders = await this.reminders.dueWithin(72);

        const lines = [];
        if (profile.full_name) lines.push(`Name: ${profile.full_name}${profile.nickname ? ` (nickname "${profile.nickname}")` : ''}.`);
        const age = ageFromDob(profile.dob);
        if (age != null) lines.push(`Age: ${age}.`);
        if (profile.gender) lines.push(`Gender: ${profile.gender}.`);
        if (profile.occupation) lines.push(`Occupation: ${profile.occupation}.`);
        if (profile.education) lines.push(`Education: ${profile.education}.`);

        const byCategory = {};
        for (const a of profile.attributes || []) {
            if (slice !== 'full' && a.sensitive) continue;
            (byCategory[a.category] ||= []).push(a);
        }
        for (const cat of Object.keys(byCategory)) {
            const items = byCategory[cat].slice(0, 5).map(a => a.key ? `${a.key}: ${a.value}` : a.value);
            lines.push(`${cat.charAt(0).toUpperCase() + cat.slice(1)}s: ${items.join('; ')}.`);
        }

        if (memories.length > 0) {
            const top = memories.slice(0, 3).map(m => m.title);
            lines.push(`Recent significant memories: ${top.join('; ')}.`);
        }

        if (upcomingReminders.length > 0) {
            const r = upcomingReminders.slice(0, 3).map(x => `${x.title} (${x.due_at})`);
            lines.push(`Upcoming reminders: ${r.join('; ')}.`);
        }

        const preamble = lines.length
            ? `User profile:\n${lines.join('\n')}\n`
            : `User profile is empty. Politely ask the user one onboarding question (name first, then DOB) before answering.`;

        return { preamble, tokens_est: Math.ceil(preamble.length / 4) };
    }

    async getOrGenerateDailyBrief(adapterManager, settings) {
        const dateKey = todayKey();
        const cached = await this.db.get('SELECT body FROM daily_briefs WHERE date = ?', dateKey);
        if (cached) return { date: dateKey, body: cached.body, cached: true };

        const profile = await this.profile.getProfile();
        const upcoming = await this.reminders.dueWithin(24);
        const memories = await this.memories.list();

        // Anniversaries within 7 days based on event_date MM-DD match
        const today = new Date();
        const upcomingMilestones = (memories || []).filter(m => {
            if (!m.event_date) return false;
            const md = new Date(m.event_date);
            if (isNaN(md)) return false;
            const next = new Date(today.getFullYear(), md.getMonth(), md.getDate());
            const diff = (next - today) / (24 * 60 * 60 * 1000);
            return diff >= -1 && diff <= 7;
        }).slice(0, 3);

        const bullets = [];
        if (upcoming.length > 0) {
            bullets.push(`${upcoming.length} reminder${upcoming.length > 1 ? 's' : ''} due in the next 24h: ${upcoming.map(r => r.title).join(', ')}.`);
        }
        if (upcomingMilestones.length > 0) {
            bullets.push(`Upcoming milestones: ${upcomingMilestones.map(m => m.title).join(', ')}.`);
        }
        if (bullets.length === 0) {
            bullets.push(`No reminders or milestones in the next week. A good day to make progress on a goal.`);
        }

        const greetingName = profile.nickname || profile.full_name || 'there';
        const body = `Good morning, ${greetingName}.\n\n• ${bullets.join('\n• ')}`;

        await this.db.run('INSERT INTO daily_briefs (date, body) VALUES (?, ?)', dateKey, body);
        return { date: dateKey, body, cached: false };
    }
}

module.exports = SecretaryContextService;
