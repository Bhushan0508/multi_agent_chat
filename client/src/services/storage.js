const STORAGE_KEYS = {
  AGENTS: 'wa_ai_agents',
  GROUPS: 'wa_ai_groups',
  CHATS: 'wa_ai_chats',
  PROFILE: 'wa_ai_profile',
  SETTINGS: 'wa_ai_settings',
};

const INITIAL_GROUPS = [
  { id: 'animal-nature', name: 'Animal & Nature Scientists', description: 'Scientists who study animals and nature', agentIds: ['zoologist', 'ornithologist', 'entomologist', 'ichthyologist', 'herpetologist', 'mammalogist'] },
  { id: 'plant-earth', name: 'Plant & Earth Scientists', description: 'Scientists who study plants and earth sciences', agentIds: ['phycologist', 'mycologist', 'geologist', 'hydrologist', 'meteorologist', 'paleontologist'] },
  { id: 'human-health', name: 'Human & Health Scientists', description: 'Scientists who study human mind and health', agentIds: ['psychologist', 'sociologist', 'anthropologist', 'archaeologist', 'epidemiologist', 'cardiologist', 'dermatologist', 'neurologist'] },
  { id: 'niche-specialists', name: 'Other Niche Specialists', description: 'Various specialized fields', agentIds: ['criminologist', 'seismologist', 'vulcanologist', 'cosmologist'] },
  { id: 'medical', name: 'Medical Specialists', description: 'Medical doctors and specialists', agentIds: ['medical-cardiologist', 'medical-dermatologist', 'endocrinologist', 'gastroenterologist', 'hematologist', 'nephrologist', 'medical-neurologist', 'oncologist', 'ophthalmologist', 'pulmonologist', 'radiologist', 'rheumatologist', 'urologist'] },
  { id: 'astrology-occult', name: 'Astrology & Occult Specialists', description: 'Astrologers and occult practitioners', agentIds: ['astrologer', 'numerologist', 'tarot-reader', 'horary-astrologer', 'mundane-astrologer', 'natal-astrologer'] },
  { id: 'conventional', name: 'Mainstream & Conventional Systems', description: 'Conventional medical systems', agentIds: ['allopath', 'osteopath'] },
  { id: 'holistic', name: 'Natural & Holistic Systems', description: 'Natural and holistic healing systems', agentIds: ['homeopath', 'naturopath', 'naprapath', 'aromatherapist'] },
  { id: 'traditional', name: 'Traditional & Cultural Systems', description: 'Traditional healing systems from various cultures', agentIds: ['ayurvedic', 'siddha', 'unani', 'tcm-practitioner'] },
  { id: 'body-based', name: 'Body-Based & Structural Systems', description: 'Body manipulation and structural systems', agentIds: ['chiropractor', 'reflexologist', 'kinesiologist'] },
  { id: 'physical-science', name: 'Natural & Physical Science Specialists', description: 'Physical and natural scientists', agentIds: ['astrophysicist', 'biophysicist', 'geophysicist', 'ethologist', 'geneticist'] },
  { id: 'esoteric', name: 'Ancient Wisdom & Esoteric Sciences', description: 'Ancient and esoteric sciences', agentIds: ['alchemist', 'theosophist', 'hermeticist', 'kabbalist', 'gnostic', 'vedantist'] },
  { id: 'healing-wisdom', name: 'Systems of Ancient Healing & Body Wisdom', description: 'Ancient healing wisdom systems', agentIds: ['iridologist', 'physiognomist', 'chirologist', 'pranic-healer'] },
  { id: 'philosophical', name: 'Interdisciplinary & Philosophical Specialists', description: 'Philosophical and interdisciplinary studies', agentIds: ['symbologist', 'philologist', 'etymologist', 'epistemologist'] },
  { id: 'main', name: 'Main Office', description: 'Global workspace', agentIds: ['personal-secretary'] }
];

const INITIAL_AGENTS = [
  { id: 'zoologist', name: 'Zoologist', groupId: 'animal-nature', expertise: ['animals', 'animal behavior', 'wildlife', 'zoo'], avoid: [], system_prompt: 'You are a zoologist. Expert in animals and their behaviors.', model: 'default', avatar: null },
  { id: 'ornithologist', name: 'Ornithologist', groupId: 'animal-nature', expertise: ['birds', 'avian', 'ornithology'], avoid: [], system_prompt: 'You are an ornithologist. Expert in birds.', model: 'default', avatar: null },
  { id: 'entomologist', name: 'Entomologist', groupId: 'animal-nature', expertise: ['insects', 'bugs', 'entomology'], avoid: [], system_prompt: 'You are an entomologist. Expert in insects.', model: 'default', avatar: null },
  { id: 'ichthyologist', name: 'Ichthyologist', groupId: 'animal-nature', expertise: ['fish', 'aquatic', 'marine life'], avoid: [], system_prompt: 'You are an ichthyologist. Expert in fish.', model: 'default', avatar: null },
  { id: 'herpetologist', name: 'Herpetologist', groupId: 'animal-nature', expertise: ['reptiles', 'amphibians', 'herpetology'], avoid: [], system_prompt: 'You are a herpetologist. Expert in reptiles and amphibians.', model: 'default', avatar: null },
  { id: 'mammalogist', name: 'Mammalogist', groupId: 'animal-nature', expertise: ['mammals', 'mammalogy'], avoid: [], system_prompt: 'You are a mammalogist. Expert in mammals.', model: 'default', avatar: null },
  { id: 'phycologist', name: 'Phycologist', groupId: 'plant-earth', expertise: ['algae', 'phycology', 'seaweed'], avoid: [], system_prompt: 'You are a phycologist. Expert in algae.', model: 'default', avatar: null },
  { id: 'mycologist', name: 'Mycologist', groupId: 'plant-earth', expertise: ['fungi', 'mushrooms', 'mycology'], avoid: [], system_prompt: 'You are a mycologist. Expert in fungi and mushrooms.', model: 'default', avatar: null },
  { id: 'geologist', name: 'Geologist', groupId: 'plant-earth', expertise: ['rocks', 'earth', 'geology', 'minerals'], avoid: [], system_prompt: 'You are a geologist. Expert in earth structure and rocks.', model: 'default', avatar: null },
  { id: 'hydrologist', name: 'Hydrologist', groupId: 'plant-earth', expertise: ['water', 'rivers', 'lakes', 'hydrology'], avoid: [], system_prompt: 'You are a hydrologist. Expert in water and its movement.', model: 'default', avatar: null },
  { id: 'meteorologist', name: 'Meteorologist', groupId: 'plant-earth', expertise: ['weather', 'climate', 'forecast', 'meteorology'], avoid: [], system_prompt: 'You are a meteorologist. Expert in weather and atmosphere.', model: 'default', avatar: null },
  { id: 'paleontologist', name: 'Paleontologist', groupId: 'plant-earth', expertise: ['fossils', 'dinosaurs', 'prehistoric', 'paleontology'], avoid: [], system_prompt: 'You are a paleontologist. Expert in fossils and prehistoric life.', model: 'default', avatar: null },
  { id: 'psychologist', name: 'Psychologist', groupId: 'human-health', expertise: ['psychology', 'mind', 'behavior', 'mental health'], avoid: [], system_prompt: 'You are a psychologist. Expert in human mind and behavior.', model: 'default', avatar: null },
  { id: 'sociologist', name: 'Sociologist', groupId: 'human-health', expertise: ['society', 'social behavior', 'sociology'], avoid: [], system_prompt: 'You are a sociologist. Expert in society and social behavior.', model: 'default', avatar: null },
  { id: 'anthropologist', name: 'Anthropologist', groupId: 'human-health', expertise: ['human origins', 'cultures', 'anthropology'], avoid: [], system_prompt: 'You are an anthropologist. Expert in human origins and cultures.', model: 'default', avatar: null },
  { id: 'archaeologist', name: 'Archaeologist', groupId: 'human-health', expertise: ['artifacts', 'excavation', 'archaeology', 'history'], avoid: [], system_prompt: 'You are an archaeologist. Expert in human history through artifacts.', model: 'default', avatar: null },
  { id: 'epidemiologist', name: 'Epidemiologist', groupId: 'human-health', expertise: ['diseases', 'epidemiology', 'public health', 'spread'], avoid: [], system_prompt: 'You are an epidemiologist. Expert in disease spread and control.', model: 'default', avatar: null },
  { id: 'cardiologist', name: 'Cardiologist', groupId: 'human-health', expertise: ['heart', 'cardiology', 'cardiovascular'], avoid: [], system_prompt: 'You are a cardiologist. Expert in heart and heart diseases.', model: 'default', avatar: null },
  { id: 'dermatologist', name: 'Dermatologist', groupId: 'human-health', expertise: ['skin', 'hair', 'nails', 'dermatology'], avoid: [], system_prompt: 'You are a dermatologist. Expert in skin, hair, and nails.', model: 'default', avatar: null },
  { id: 'neurologist', name: 'Neurologist', groupId: 'human-health', expertise: ['brain', 'nervous system', 'neurology'], avoid: [], system_prompt: 'You are a neurologist. Expert in nervous system and brain.', model: 'default', avatar: null },
  { id: 'criminologist', name: 'Criminologist', groupId: 'niche-specialists', expertise: ['crime', 'criminal behavior', 'criminology'], avoid: [], system_prompt: 'You are a criminologist. Expert in criminal behavior and causes.', model: 'default', avatar: null },
  { id: 'seismologist', name: 'Seismologist', groupId: 'niche-specialists', expertise: ['earthquakes', 'seismology'], avoid: [], system_prompt: 'You are a seismologist. Expert in earthquakes.', model: 'default', avatar: null },
  { id: 'vulcanologist', name: 'Vulcanologist', groupId: 'niche-specialists', expertise: ['volcanoes', 'volcanology'], avoid: [], system_prompt: 'You are a vulcanologist. Expert in volcanoes.', model: 'default', avatar: null },
  { id: 'cosmologist', name: 'Cosmologist', groupId: 'niche-specialists', expertise: ['universe', 'cosmos', 'cosmology', 'origin'], avoid: [], system_prompt: 'You are a cosmologist. Expert in universe origins and development.', model: 'default', avatar: null },
  { id: 'medical-cardiologist', name: 'Cardiologist', groupId: 'medical', expertise: ['heart', 'blood vessels', 'cardiovascular'], avoid: [], system_prompt: 'You are a cardiologist. Expert in heart and blood vessels.', model: 'default', avatar: null },
  { id: 'medical-dermatologist', name: 'Dermatologist', groupId: 'medical', expertise: ['skin', 'hair', 'nails'], avoid: [], system_prompt: 'You are a dermatologist. Expert in skin, hair, and nails.', model: 'default', avatar: null },
  { id: 'endocrinologist', name: 'Endocrinologist', groupId: 'medical', expertise: ['hormones', 'endocrine', 'glands'], avoid: [], system_prompt: 'You are an endocrinologist. Expert in hormones and endocrine system.', model: 'default', avatar: null },
  { id: 'gastroenterologist', name: 'Gastroenterologist', groupId: 'medical', expertise: ['digestive', 'stomach', 'intestines'], avoid: [], system_prompt: 'You are a gastroenterologist. Expert in digestive system.', model: 'default', avatar: null },
  { id: 'hematologist', name: 'Hematologist', groupId: 'medical', expertise: ['blood', 'hematology'], avoid: [], system_prompt: 'You are a hematologist. Expert in blood and blood tissues.', model: 'default', avatar: null },
  { id: 'nephrologist', name: 'Nephrologist', groupId: 'medical', expertise: ['kidney', 'renal'], avoid: [], system_prompt: 'You are a nephrologist. Expert in kidney function and diseases.', model: 'default', avatar: null },
  { id: 'medical-neurologist', name: 'Neurologist', groupId: 'medical', expertise: ['brain', 'nervous system'], avoid: [], system_prompt: 'You are a neurologist. Expert in nervous system and brain.', model: 'default', avatar: null },
  { id: 'oncologist', name: 'Oncologist', groupId: 'medical', expertise: ['cancer', 'tumor', 'oncology'], avoid: [], system_prompt: 'You are an oncologist. Expert in cancer diagnosis and treatment.', model: 'default', avatar: null },
  { id: 'ophthalmologist', name: 'Ophthalmologist', groupId: 'medical', expertise: ['eye', 'vision', 'eyesight'], avoid: [], system_prompt: 'You are an ophthalmologist. Expert in eye and vision care.', model: 'default', avatar: null },
  { id: 'pulmonologist', name: 'Pulmonologist', groupId: 'medical', expertise: ['lungs', 'respiratory', 'breathing'], avoid: [], system_prompt: 'You are a pulmonologist. Expert in respiratory system and lungs.', model: 'default', avatar: null },
  { id: 'radiologist', name: 'Radiologist', groupId: 'medical', expertise: ['x-ray', 'mri', 'imaging', 'scan'], avoid: [], system_prompt: 'You are a radiologist. Expert in medical imaging.', model: 'default', avatar: null },
  { id: 'rheumatologist', name: 'Rheumatologist', groupId: 'medical', expertise: ['joints', 'arthritis', 'autoimmune'], avoid: [], system_prompt: 'You are a rheumatologist. Expert in joints and autoimmune diseases.', model: 'default', avatar: null },
  { id: 'urologist', name: 'Urologist', groupId: 'medical', expertise: ['urinary', 'bladder', 'reproductive'], avoid: [], system_prompt: 'You are a urologist. Expert in urinary tract and male reproductive system.', model: 'default', avatar: null },
  { id: 'astrologer', name: 'Astrologer', groupId: 'astrology-occult', expertise: ['astrology', 'horoscope', 'zodiac', 'celestial'], avoid: [], system_prompt: 'You are an astrologer. Interpret celestial body movements to offer life guidance.', model: 'default', avatar: null },
  { id: 'numerologist', name: 'Numerologist', groupId: 'astrology-occult', expertise: ['numerology', 'numbers', 'future'], avoid: [], system_prompt: 'You are a numerologist. Study vibrations of numbers to analyze personality or future events.', model: 'default', avatar: null },
  { id: 'tarot-reader', name: 'Tarot Reader', groupId: 'astrology-occult', expertise: ['tarot', 'cards', 'reading'], avoid: [], system_prompt: 'You are a tarot reader. Use cards and symbolic imagery to guide individuals.', model: 'default', avatar: null },
  { id: 'horary-astrologer', name: 'Horary Astrologer', groupId: 'astrology-occult', expertise: ['horary astrology', 'specific questions'], avoid: [], system_prompt: 'You are a horary astrologer. Answer specific questions based on the exact moment asked.', model: 'default', avatar: null },
  { id: 'mundane-astrologer', name: 'Mundane Astrologer', groupId: 'astrology-occult', expertise: ['world events', 'wars', 'economy'], avoid: [], system_prompt: 'You are a mundane astrologer. Predict world events, wars, and economic cycles.', model: 'default', avatar: null },
  { id: 'natal-astrologer', name: 'Natal Astrologer', groupId: 'astrology-occult', expertise: ['birth chart', 'natal'], avoid: [], system_prompt: 'You are a natal astrologer. Interpret birth charts for individual potential.', model: 'default', avatar: null },
  { id: 'allopath', name: 'Allopath', groupId: 'conventional', expertise: ['western medicine', 'surgery', 'drugs'], avoid: [], system_prompt: 'You practice allopathy. Use modern Western medicine with drugs and surgery.', model: 'default', avatar: null },
  { id: 'osteopath', name: 'Osteopath', groupId: 'conventional', expertise: ['osteopathy', 'manipulation', 'bones'], avoid: [], system_prompt: 'You are an osteopath. Focus on physical manipulation of muscle tissue and bones.', model: 'default', avatar: null },
  { id: 'homeopath', name: 'Homeopath', groupId: 'holistic', expertise: ['homeopathy', 'natural healing', 'diluted'], avoid: [], system_prompt: 'You practice homeopathy. Based on "like cures like" principle with diluted substances.', model: 'default', avatar: null },
  { id: 'naturopath', name: 'Naturopath', groupId: 'holistic', expertise: ['naturopathy', 'natural remedies', 'diet'], avoid: [], system_prompt: 'You are a naturopath. Focus on natural remedies and lifestyle for healing.', model: 'default', avatar: null },
  { id: 'naprapath', name: 'Naprapath', groupId: 'holistic', expertise: ['naprapathy', 'connective tissue'], avoid: [], system_prompt: 'You are a naprapath. Focus on manual manipulation of connective tissue.', model: 'default', avatar: null },
  { id: 'aromatherapist', name: 'Aromatherapist', groupId: 'holistic', expertise: ['aromatherapy', 'essential oils'], avoid: [], system_prompt: 'You are an aromatherapist. Use essential oils for well-being.', model: 'default', avatar: null },
  { id: 'ayurvedic', name: 'Ayurvedic Practitioner', groupId: 'traditional', expertise: ['ayurveda', 'doshas', 'herbs'], avoid: [], system_prompt: 'You practice Ayurveda. Balance three doshas through diet, herbs, and yoga.', model: 'default', avatar: null },
  { id: 'siddha', name: 'Siddha Practitioner', groupId: 'traditional', expertise: ['siddha', 'minerals', 'herbs'], avoid: [], system_prompt: 'You practice Siddha. One of the oldest Indian systems using minerals and herbs.', model: 'default', avatar: null },
  { id: 'unani', name: 'Unani Practitioner', groupId: 'traditional', expertise: ['unani', 'humors', 'balanced'], avoid: [], system_prompt: 'You practice Unani. Based on balance of four humors.', model: 'default', avatar: null },
  { id: 'tcm-practitioner', name: 'TCM Practitioner', groupId: 'traditional', expertise: ['tcm', 'acupuncture', 'qi', 'herbal'], avoid: [], system_prompt: 'You practice Traditional Chinese Medicine. Use acupuncture and herbal tea to balance Qi.', model: 'default', avatar: null },
  { id: 'chiropractor', name: 'Chiropractor', groupId: 'body-based', expertise: ['chiropractic', 'spine', 'adjustments'], avoid: [], system_prompt: 'You are a chiropractor. Focus on spine and nervous system through manual adjustments.', model: 'default', avatar: null },
  { id: 'reflexologist', name: 'Reflexologist', groupId: 'body-based', expertise: ['reflexology', 'feet', 'pressure points'], avoid: [], system_prompt: 'You are a reflexologist. Apply pressure to feet/hands/ears for organ health.', model: 'default', avatar: null },
  { id: 'kinesiologist', name: 'Kinesiologist', groupId: 'body-based', expertise: ['kinesiology', 'movement', 'muscle'], avoid: [], system_prompt: 'You are a kinesiologist. Study body movement and muscle monitoring.', model: 'default', avatar: null },
  { id: 'astrophysicist', name: 'Astrophysicist', groupId: 'physical-science', expertise: ['astrophysics', 'stars', 'planets'], avoid: [], system_prompt: 'You are an astrophysicist. Study physical nature of stars and planets.', model: 'default', avatar: null },
  { id: 'biophysicist', name: 'Biophysicist', groupId: 'physical-science', expertise: ['biophysics', 'biological structures'], avoid: [], system_prompt: 'You are a biophysicist. Apply physics to biological structures.', model: 'default', avatar: null },
  { id: 'geophysicist', name: 'Geophysicist', groupId: 'physical-science', expertise: ['geophysics', 'earth physics', 'seismic'], avoid: [], system_prompt: 'You are a geophysicist. Use physics to study Earth.', model: 'default', avatar: null },
  { id: 'ethologist', name: 'Ethologist', groupId: 'physical-science', expertise: ['ethology', 'animal behavior'], avoid: [], system_prompt: 'You are an ethologist. Scientific study of animal behavior in natural conditions.', model: 'default', avatar: null },
  { id: 'geneticist', name: 'Geneticist', groupId: 'physical-science', expertise: ['genetics', 'genes', 'heredity'], avoid: [], system_prompt: 'You are a geneticist. Study genes and genetic variation.', model: 'default', avatar: null },
  { id: 'alchemist', name: 'Alchemist', groupId: 'esoteric', expertise: ['alchemy', 'transmutation', 'hermetic'], avoid: [], system_prompt: 'You practice alchemy. The Hermetic Science of transforming matter and self.', model: 'default', avatar: null },
  { id: 'theosophist', name: 'Theosophist', groupId: 'esoteric', expertise: ['theosophy', 'divine wisdom'], avoid: [], system_prompt: 'You are a theosophist. Study Divine Wisdom and underlying truth.', model: 'default', avatar: null },
  { id: 'hermeticist', name: 'Hermeticist', groupId: 'esoteric', expertise: ['hermetic', 'macrocosm', 'microcosm'], avoid: [], system_prompt: 'You are a hermeticist. Follow Hermes Trismegistus teachings.', model: 'default', avatar: null },
  { id: 'kabbalist', name: 'Kabbalist', groupId: 'esoteric', expertise: ['kabbalah', 'tree of life'], avoid: [], system_prompt: 'You are a kabbalist. Study the mystical Tree of Life.', model: 'default', avatar: null },
  { id: 'gnostic', name: 'Gnostic', groupId: 'esoteric', expertise: ['gnosis', 'spiritual knowledge'], avoid: [], system_prompt: 'You are a gnostic. Focus on direct experiential knowledge of the divine.', model: 'default', avatar: null },
  { id: 'vedantist', name: 'Vedantist', groupId: 'esoteric', expertise: ['vedanta', 'brahman', 'atman'], avoid: [], system_prompt: 'You are a vedantist. Student of Vedas, focus on ultimate reality.', model: 'default', avatar: null },
  { id: 'iridologist', name: 'Iridologist', groupId: 'healing-wisdom', expertise: ['iridology', 'iris', 'eyes'], avoid: [], system_prompt: 'You are an iridologist. Examine iris patterns to determine systemic health.', model: 'default', avatar: null },
  { id: 'physiognomist', name: 'Physiognomist', groupId: 'healing-wisdom', expertise: ['physiognomy', 'facial features'], avoid: [], system_prompt: 'You are a physiognomist. Judge character from facial features.', model: 'default', avatar: null },
  { id: 'chirologist', name: 'Chirologist (Palmist)', groupId: 'healing-wisdom', expertise: ['palmistry', 'palm reading'], avoid: [], system_prompt: 'You are a chirologist. Interpret hand lines for character or life path.', model: 'default', avatar: null },
  { id: 'pranic-healer', name: 'Pranic Healer', groupId: 'healing-wisdom', expertise: ['pranic healing', 'energy'], avoid: [], system_prompt: 'You are a pranic healer. Work with Prana (life energy).', model: 'default', avatar: null },
  { id: 'symbologist', name: 'Symbologist', groupId: 'philosophical', expertise: ['symbols', 'symbolism', 'cultural'], avoid: [], system_prompt: 'You are a symbologist. Study symbols and their meanings.', model: 'default', avatar: null },
  { id: 'philologist', name: 'Philologist', groupId: 'philosophical', expertise: ['philology', 'languages', 'ancient texts'], avoid: [], system_prompt: 'You are a philologist. Study history of languages and ancient texts.', model: 'default', avatar: null },
  { id: 'etymologist', name: 'Etymologist', groupId: 'philosophical', expertise: ['etymology', 'word origins'], avoid: [], system_prompt: 'You are an etymologist. Study origin and development of words.', model: 'default', avatar: null },
  { id: 'epistemologist', name: 'Epistemologist', groupId: 'philosophical', expertise: ['epistemology', 'knowledge', 'philosophy'], avoid: [], system_prompt: 'You are an epistemologist. Study nature and limits of human knowledge.', model: 'default', avatar: null },
  { id: 'personal-secretary', name: 'Personal Secretary', groupId: 'main', expertise: ['summary', 'scheduling', 'aggregation'], avoid: [], system_prompt: 'You are a personal secretary. Aggregate information and provide unified responses.', model: 'default', role: 'secretary', avatar: null, icon: 'user' }
];

const INITIAL_SETTINGS = {
  activeProviderId: 'ollama',
  providers: {
    ollama: { id: 'ollama', name: 'Ollama (Local)', baseUrl: 'http://localhost:11434', enabled: true },
    openai: { id: 'openai', name: 'OpenAI', apiKey: '', enabled: false },
    anthropic: { id: 'anthropic', name: 'Anthropic', apiKey: '', enabled: false },
    google: { id: 'google', name: 'Google Gemini', apiKey: '', enabled: false },
    openrouter: { id: 'openrouter', name: 'OpenRouter', apiKey: '', enabled: false }
  },
  general: {
    darkMode: true,
    temperature: 0.7,
    defaultModelId: 'llama3'
  }
};

export const storage = {
  getAgents: () => {
    const data = localStorage.getItem(STORAGE_KEYS.AGENTS);
    return data ? JSON.parse(data) : INITIAL_AGENTS;
  },
  saveAgents: (agents) => {
    localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(agents));
  },

  getGroups: () => {
    const data = localStorage.getItem(STORAGE_KEYS.GROUPS);
    return data ? JSON.parse(data) : INITIAL_GROUPS;
  },
  saveGroups: (groups) => {
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
  },

  getChats: (sessionId) => {
    const data = localStorage.getItem(`${STORAGE_KEYS.CHATS}_${sessionId}`);
    return data ? JSON.parse(data) : [];
  },
  saveChat: (sessionId, messages) => {
    localStorage.setItem(`${STORAGE_KEYS.CHATS}_${sessionId}`, JSON.stringify(messages));
  },

  // Sessions Logic
  getSessions: (targetId) => {
    const key = `wa_ai_sessions_${targetId}`;
    const data = localStorage.getItem(key);
    let sessions = data ? JSON.parse(data) : [];

    // Migration: If no sessions but there is a legacy chat, create a default session
    const legacyChatKey = `${STORAGE_KEYS.CHATS}_${targetId}`;
    if (sessions.length === 0 && localStorage.getItem(legacyChatKey)) {
      const legacyChatId = `session_${targetId}_default`;
      // Move legacy chat to new key
      const legacyData = localStorage.getItem(legacyChatKey);
      localStorage.setItem(`${STORAGE_KEYS.CHATS}_${legacyChatId}`, legacyData);
      localStorage.removeItem(legacyChatKey);

      sessions = [{
        id: legacyChatId,
        title: 'Initial Session',
        lastUpdate: new Date().toISOString(),
        lastMessage: 'Legacy conversation'
      }];
      localStorage.setItem(key, JSON.stringify(sessions));
    }

    return sessions;
  },
  saveSession: (targetId, session) => {
    const key = `wa_ai_sessions_${targetId}`;
    const sessions = storage.getSessions(targetId);
    const index = sessions.findIndex(s => s.id === session.id);
    
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.unshift(session);
    }
    
    localStorage.setItem(key, JSON.stringify(sessions));
  },
  deleteSession: (targetId, sessionId) => {
    const key = `wa_ai_sessions_${targetId}`;
    const sessions = storage.getSessions(targetId).filter(s => s.id !== sessionId);
    localStorage.setItem(key, JSON.stringify(sessions));
    localStorage.removeItem(`${STORAGE_KEYS.CHATS}_${sessionId}`);
  },

  getProfile: () => {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return data ? JSON.parse(data) : { name: 'User', status: 'Available', avatar: null };
  },
  saveProfile: (profile) => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  getSettings: () => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const settings = data ? JSON.parse(data) : INITIAL_SETTINGS;
    // Merge with initial settings to ensure new keys exist
    return { ...INITIAL_SETTINGS, ...settings, providers: { ...INITIAL_SETTINGS.providers, ...settings.providers } };
  },
  saveSettings: (settings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }
};
