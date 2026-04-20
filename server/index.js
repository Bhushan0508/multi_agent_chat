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

// Initialize Services
let agentService, orchestrator, adapterManager, memoryService;

async function init() {
    const db = await setupDatabase();
    agentService = new AgentService(db);
    adapterManager = new AdapterManager();
    memoryService = new AgentMemoryService();
    orchestrator = new AIOrchestrator(agentService, adapterManager, memoryService);
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
