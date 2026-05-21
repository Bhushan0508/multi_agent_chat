require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { setupDatabase } = require('./src/models/db');
const AgentService = require('./src/services/AgentService');
const AIOrchestrator = require('./src/services/AIOrchestrator');
const AdapterManager = require('./src/adapters/AdapterManager');
const AgentMemoryService = require('./src/services/AgentMemoryService');
const SearchService = require('./src/services/SearchService');
const ProfileService = require('./src/services/ProfileService');
const MemoryStoreService = require('./src/services/MemoryStoreService');
const ReminderService = require('./src/services/ReminderService');
const SecretaryContextService = require('./src/services/SecretaryContextService');
const multer = require('multer');
const { OpenAI } = require('openai');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Voice Transcription Endpoint
const upload = multer({ dest: 'uploads/' });
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No audio file provided' });
        
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            // Mock response if no Key
            fs.unlinkSync(req.file.path);
            return res.json({ text: "Voice transcription simulated. (Provide OPENAI_API_KEY for real transcription)" });
        }

        const openai = new OpenAI({ apiKey });
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(req.file.path),
            model: "whisper-1",
        });

        fs.unlinkSync(req.file.path);
        res.json({ text: transcription.text });
    } catch (error) {
        console.error('Transcription error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Web Search Endpoint
app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.status(400).json({ error: 'No query provided' });
        const result = await SearchService.searchWeb(query);
        res.json({ result });
    } catch (error) {
        console.error('Search API error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Memory endpoints
app.post('/api/memory/:agentName', async (req, res) => {
   try {
       const { agentName } = req.params;
       const { role, content } = req.body;
       if (!memoryService) return res.status(500).send('Not initialized');
       await memoryService.appendToMemory(agentName, role, content);
       res.json({ success: true });
   } catch (e) {
       res.status(500).json({ error: e.message });
   }
});

app.get('/api/memory/:agentName', async (req, res) => {
   try {
       const { agentName } = req.params;
       if (!memoryService) return res.status(500).send('Not initialized');
       const context = await memoryService.getAgentContext({ name: agentName, expertise: [], avoid: [] });
       res.json(context);
   } catch (e) {
       res.status(500).json({ error: e.message });
   }
});

// ---- Profile / Personal Dashboard endpoints ----
const ensureReady = (res) => {
    if (!profileService) {
        res.status(503).json({ error: 'Services initializing, try again' });
        return false;
    }
    return true;
};

app.get('/api/profile', async (req, res) => {
    if (!ensureReady(res)) return;
    try { res.json(await profileService.getProfile()); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/profile', async (req, res) => {
    if (!ensureReady(res)) return;
    try {
        const updated = await profileService.updateIdentity(req.body || {});
        io.emit('profile_updated', updated);
        res.json(updated);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/profile/photo', upload.single('photo'), async (req, res) => {
    if (!ensureReady(res)) return;
    try {
        if (!req.file) return res.status(400).json({ error: 'No photo uploaded' });
        const photoUrl = `/uploads/${req.file.filename}`;
        await profileService.updateIdentity({ photo_url: photoUrl });
        io.emit('profile_updated', await profileService.getProfile());
        res.json({ photo_url: photoUrl });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/profile/attributes', async (req, res) => {
    if (!ensureReady(res)) return;
    try { res.json(await profileService.listAttributes(req.query.category)); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/profile/attributes', async (req, res) => {
    if (!ensureReady(res)) return;
    try {
        const attr = await profileService.addAttribute(req.body || {});
        io.emit('profile_updated');
        res.json(attr);
    } catch (e) { res.status(400).json({ error: e.message }); }
});

app.put('/api/profile/attributes/:id', async (req, res) => {
    if (!ensureReady(res)) return;
    try {
        const attr = await profileService.updateAttribute(Number(req.params.id), req.body || {});
        io.emit('profile_updated');
        res.json(attr);
    } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete('/api/profile/attributes/:id', async (req, res) => {
    if (!ensureReady(res)) return;
    try {
        await profileService.deleteAttribute(Number(req.params.id));
        io.emit('profile_updated');
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/memories', async (req, res) => {
    if (!ensureReady(res)) return;
    try { res.json(await memoryStore.list({ tag: req.query.tag })); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/memories', async (req, res) => {
    if (!ensureReady(res)) return;
    try {
        const m = await memoryStore.add(req.body || {});
        io.emit('memories_changed');
        res.json(m);
    } catch (e) { res.status(400).json({ error: e.message }); }
});

app.put('/api/memories/:id', async (req, res) => {
    if (!ensureReady(res)) return;
    try {
        const m = await memoryStore.update(Number(req.params.id), req.body || {});
        io.emit('memories_changed');
        res.json(m);
    } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete('/api/memories/:id', async (req, res) => {
    if (!ensureReady(res)) return;
    try {
        await memoryStore.delete(Number(req.params.id));
        io.emit('memories_changed');
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/reminders', async (req, res) => {
    if (!ensureReady(res)) return;
    try { res.json(await reminderService.list({ upcoming: req.query.upcoming === 'true' })); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/reminders', async (req, res) => {
    if (!ensureReady(res)) return;
    try {
        const r = await reminderService.add(req.body || {});
        io.emit('reminders_changed');
        res.json(r);
    } catch (e) { res.status(400).json({ error: e.message }); }
});

app.put('/api/reminders/:id', async (req, res) => {
    if (!ensureReady(res)) return;
    try {
        const r = await reminderService.update(Number(req.params.id), req.body || {});
        io.emit('reminders_changed');
        res.json(r);
    } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete('/api/reminders/:id', async (req, res) => {
    if (!ensureReady(res)) return;
    try {
        await reminderService.delete(Number(req.params.id));
        io.emit('reminders_changed');
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/secretary/context', async (req, res) => {
    if (!ensureReady(res)) return;
    try { res.json(await secretaryContext.buildPreamble({ slice: req.query.slice || 'full' })); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/secretary/daily-brief', async (req, res) => {
    if (!ensureReady(res)) return;
    try { res.json(await secretaryContext.getOrGenerateDailyBrief()); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/pinned-chats', async (req, res) => {
    if (!ensureReady(res)) return;
    try {
        const rows = await app.locals.db.all('SELECT agent_id, position FROM pinned_chats ORDER BY position ASC');
        res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Initialize Services
let agentService, orchestrator, adapterManager, memoryService;
let profileService, memoryStore, reminderService, secretaryContext;

async function init() {
    const db = await setupDatabase();
    agentService = new AgentService(db);
    adapterManager = new AdapterManager();
    memoryService = new AgentMemoryService();
    orchestrator = new AIOrchestrator(agentService, adapterManager, memoryService);
    profileService = new ProfileService(db);
    memoryStore = new MemoryStoreService(db);
    reminderService = new ReminderService(db);
    secretaryContext = new SecretaryContextService(db, profileService, memoryStore, reminderService);
    app.locals.db = db;
    console.log('Services initialized');
}

init().catch(console.error);

// Socket.io for real-time
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
  });

  socket.on('send_message', async (data) => {
    const { conversation, message, settings } = data;
    
    // 1. Broadcast user message back to conversation
    io.to(conversation.id).emit('receive_message', {
        ...message,
        timestamp: new Date().toISOString()
    });

    // 2. Trigger AI Orchestration
    try {
        io.to(conversation.id).emit('typing', { status: true });

        let processedMessage = { ...message };
        if (processedMessage.isSearchMode) {
             const searchResult = await SearchService.searchWeb(processedMessage.content);
             processedMessage.content = `[Web Search Context: ${searchResult}]\n\nUser's Query: ${processedMessage.content}`;
        }

        const responses = await orchestrator.processMessage(conversation, processedMessage, settings);
        
        // 3. Emit each agent's response
        for (const res of responses) {
            const agentMsg = {
                sender_type: 'agent',
                sender_name: res.agent,
                content: res.content,
                timestamp: new Date().toISOString()
            };
            io.to(conversation.id).emit('receive_message', agentMsg);
        }
    } catch (error) {
        console.error('Orchestration Error:', error);
        io.to(conversation.id).emit('error', { message: 'Failed to generate AI response: ' + error.message });
    } finally {
        io.to(conversation.id).emit('typing', { status: false });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
