const STORAGE_KEYS = {
  AGENTS: 'wa_ai_agents',
  GROUPS: 'wa_ai_groups',
  CHATS: 'wa_ai_chats',
  PROFILE: 'wa_ai_profile',
  SETTINGS: 'wa_ai_settings',
};

const INITIAL_GROUPS = [
  { id: 'animal-nature', name: 'Animal & Nature Scientists', description: 'Scientists who study animals and nature', agentIds: [] },
  { id: 'plant-earth', name: 'Plant & Earth Scientists', description: 'Scientists who study plants and earth sciences', agentIds: [] },
  { id: 'human-health', name: 'Human & Health Scientists', description: 'Scientists who study human mind and health', agentIds: [] },
  { id: 'niche-specialists', name: 'Other Niche Specialists', description: 'Various specialized fields', agentIds: [] },
  { id: 'medical', name: 'Medical Specialists', description: 'Medical doctors and specialists', agentIds: [] },
  { id: 'astrology-occult', name: 'Astrology & Occult Specialists', description: 'Astrologers and occult practitioners', agentIds: [] },
  { id: 'conventional', name: 'Mainstream & Conventional Systems', description: 'Conventional medical systems', agentIds: [] },
  { id: 'holistic', name: 'Natural & Holistic Systems', description: 'Natural and holistic healing systems', agentIds: [] },
  { id: 'traditional', name: 'Traditional & Cultural Systems', description: 'Traditional healing systems from various cultures', agentIds: [] },
  { id: 'body-based', name: 'Body-Based & Structural Systems', description: 'Body manipulation and structural systems', agentIds: [] },
  { id: 'physical-science', name: 'Natural & Physical Science Specialists', description: 'Physical and natural scientists', agentIds: [] },
  { id: 'esoteric', name: 'Ancient Wisdom & Esoteric Sciences', description: 'Ancient and esoteric sciences', agentIds: [] },
  { id: 'healing-wisdom', name: 'Systems of Ancient Healing & Body Wisdom', description: 'Ancient healing wisdom systems', agentIds: [] },
  { id: 'philosophical', name: 'Interdisciplinary & Philosophical Specialists', description: 'Philosophical and interdisciplinary studies', agentIds: [] },
  { id: 'main', name: 'Main Office', description: 'Global workspace', agentIds: [] }
];

const INITIAL_AGENTS = [
  // Animal & Nature Scientists
  { id: 'zoologist', name: 'Zoologist', groupId: 'animal-nature', expertise: ['animals'], avoid: [], system_prompt: 'You are a zoologist. Expert in animals and their behaviors.', description: 'Animals and their behaviors.', model: 'default', avatar: null },
  { id: 'ornithologist', name: 'Ornithologist', groupId: 'animal-nature', expertise: ['birds'], avoid: [], system_prompt: 'You are an ornithologist. Expert in birds.', description: 'Birds.', model: 'default', avatar: null },
  { id: 'entomologist', name: 'Entomologist', groupId: 'animal-nature', expertise: ['insects'], avoid: [], system_prompt: 'You are an entomologist. Expert in insects.', description: 'Insects.', model: 'default', avatar: null },
  { id: 'ichthyologist', name: 'Ichthyologist', groupId: 'animal-nature', expertise: ['fish'], avoid: [], system_prompt: 'You are an ichthyologist. Expert in fish.', description: 'Fish.', model: 'default', avatar: null },
  { id: 'herpetologist', name: 'Herpetologist', groupId: 'animal-nature', expertise: ['reptiles', 'amphibians'], avoid: [], system_prompt: 'You are a herpetologist. Expert in reptiles and amphibians.', description: 'Reptiles and amphibians.', model: 'default', avatar: null },
  { id: 'mammalogist', name: 'Mammalogist', groupId: 'animal-nature', expertise: ['mammals'], avoid: [], system_prompt: 'You are a mammalogist. Expert in mammals.', description: 'Mammals.', model: 'default', avatar: null },
  
  // Plant & Earth Scientists
  { id: 'phycologist', name: 'Phycologist', groupId: 'plant-earth', expertise: ['algae'], avoid: [], system_prompt: 'You are a phycologist. Expert in algae.', description: 'Algae (also called algology).', model: 'default', avatar: null },
  { id: 'mycologist', name: 'Mycologist', groupId: 'plant-earth', expertise: ['fungi', 'mushrooms'], avoid: [], system_prompt: 'You are a mycologist. Expert in fungi and mushrooms.', description: 'Fungi and mushrooms.', model: 'default', avatar: null },
  { id: 'geologist', name: 'Geologist', groupId: 'plant-earth', expertise: ['rocks', 'earth'], avoid: [], system_prompt: 'You are a geologist. Expert in earth structure and rocks.', description: "The Earth's physical structure and rocks.", model: 'default', avatar: null },
  { id: 'hydrologist', name: 'Hydrologist', groupId: 'plant-earth', expertise: ['water'], avoid: [], system_prompt: 'You are a hydrologist. Expert in water and its movement.', description: 'Water and its movement.', model: 'default', avatar: null },
  { id: 'meteorologist', name: 'Meteorologist', groupId: 'plant-earth', expertise: ['weather'], avoid: [], system_prompt: 'You are a meteorologist. Expert in weather and atmosphere.', description: 'The atmosphere and weather.', model: 'default', avatar: null },
  { id: 'paleontologist', name: 'Paleontologist', groupId: 'plant-earth', expertise: ['fossils'], avoid: [], system_prompt: 'You are a paleontologist. Expert in fossils and prehistoric life.', description: 'Fossils and prehistoric life.', model: 'default', avatar: null },
  
  // Human & Health Scientists
  { id: 'psychologist', name: 'Psychologist', groupId: 'human-health', expertise: ['mind', 'behavior'], avoid: [], system_prompt: 'You are a psychologist. Expert in human mind and behavior.', description: 'The human mind and behavior.', model: 'default', avatar: null },
  { id: 'sociologist', name: 'Sociologist', groupId: 'human-health', expertise: ['society'], avoid: [], system_prompt: 'You are a sociologist. Expert in society and social behavior.', description: 'Society and social behavior.', model: 'default', avatar: null },
  { id: 'anthropologist', name: 'Anthropologist', groupId: 'human-health', expertise: ['cultures', 'human origins'], avoid: [], system_prompt: 'You are an anthropologist. Expert in human origins and cultures.', description: 'Human origins, societies, and cultures.', model: 'default', avatar: null },
  { id: 'archaeologist', name: 'Archaeologist', groupId: 'human-health', expertise: ['artifacts', 'history'], avoid: [], system_prompt: 'You are an archaeologist. Expert in human history through artifacts.', description: 'Human history through physical remains/artifacts.', model: 'default', avatar: null },
  { id: 'epidemiologist', name: 'Epidemiologist', groupId: 'human-health', expertise: ['diseases'], avoid: [], system_prompt: 'You are an epidemiologist. Expert in disease spread and control.', description: 'How diseases spread and are controlled.', model: 'default', avatar: null },
  { id: 'cardiologist', name: 'Cardiologist', groupId: 'human-health', expertise: ['heart'], avoid: [], system_prompt: 'You are a cardiologist. Expert in heart and heart diseases.', description: 'The heart and its diseases.', model: 'default', avatar: null },
  { id: 'dermatologist', name: 'Dermatologist', groupId: 'human-health', expertise: ['skin', 'hair', 'nails'], avoid: [], system_prompt: 'You are a dermatologist. Expert in skin, hair, and nails.', description: 'Skin, hair, and nails.', model: 'default', avatar: null },
  { id: 'neurologist', name: 'Neurologist', groupId: 'human-health', expertise: ['brain', 'nervous'], avoid: [], system_prompt: 'You are a neurologist. Expert in nervous system and brain.', description: 'The nervous system and brain.', model: 'default', avatar: null },
  
  // Other Niche Specialists
  { id: 'criminologist', name: 'Criminologist', groupId: 'niche-specialists', expertise: ['crime', 'criminal'], avoid: [], system_prompt: 'You are a criminologist. Expert in criminal behavior and causes.', description: 'Criminal behavior and its causes.', model: 'default', avatar: null },
  { id: 'seismologist', name: 'Seismologist', groupId: 'niche-specialists', expertise: ['earthquakes'], avoid: [], system_prompt: 'You are a seismologist. Expert in earthquakes.', description: 'Earthquakes.', model: 'default', avatar: null },
  { id: 'vulcanologist', name: 'Vulcanologist', groupId: 'niche-specialists', expertise: ['volcanoes'], avoid: [], system_prompt: 'You are a vulcanologist. Expert in volcanoes.', description: 'Volcanoes.', model: 'default', avatar: null },
  { id: 'cosmologist', name: 'Cosmologist', groupId: 'niche-specialists', expertise: ['universe', 'cosmos'], avoid: [], system_prompt: 'You are a cosmologist. Expert in universe origins and development.', description: 'The origins and development of the universe.', model: 'default', avatar: null },
  
  // Medical Specialists
  { id: 'medical-cardiologist', name: 'Cardiologist', groupId: 'medical', expertise: ['heart', 'blood'], avoid: [], system_prompt: 'You are a cardiologist. Expert in heart and blood vessels.', description: 'Heart and blood vessels.', model: 'default', avatar: null },
  { id: 'medical-dermatologist', name: 'Dermatologist', groupId: 'medical', expertise: ['skin'], avoid: [], system_prompt: 'You are a dermatologist. Expert in skin, hair, and nails.', description: 'Skin, hair, and nails.', model: 'default', avatar: null },
  { id: 'endocrinologist', name: 'Endocrinologist', groupId: 'medical', expertise: ['hormones'], avoid: [], system_prompt: 'You are an endocrinologist. Expert in hormones and endocrine system.', description: 'Hormones and the endocrine system.', model: 'default', avatar: null },
  { id: 'gastroenterologist', name: 'Gastroenterologist', groupId: 'medical', expertise: ['digestive', 'stomach'], avoid: [], system_prompt: 'You are a gastroenterologist. Expert in digestive system.', description: 'Digestive system and internal organs.', model: 'default', avatar: null },
  { id: 'hematologist', name: 'Hematologist', groupId: 'medical', expertise: ['blood'], avoid: [], system_prompt: 'You are a hematologist. Expert in blood and blood tissues.', description: 'Blood and blood-forming tissues.', model: 'default', avatar: null },
  { id: 'nephrologist', name: 'Nephrologist', groupId: 'medical', expertise: ['kidney'], avoid: [], system_prompt: 'You are a nephrologist. Expert in kidney function and diseases.', description: 'Kidney function and diseases.', model: 'default', avatar: null },
  { id: 'medical-neurologist', name: 'Neurologist', groupId: 'medical', expertise: ['brain', 'nervous'], avoid: [], system_prompt: 'You are a neurologist. Expert in nervous system and brain.', description: 'Nervous system and the brain.', model: 'default', avatar: null },
  { id: 'oncologist', name: 'Oncologist', groupId: 'medical', expertise: ['cancer'], avoid: [], system_prompt: 'You are an oncologist. Expert in cancer diagnosis and treatment.', description: 'Cancer diagnosis and treatment.', model: 'default', avatar: null },
  { id: 'ophthalmologist', name: 'Ophthalmologist', groupId: 'medical', expertise: ['eye', 'vision'], avoid: [], system_prompt: 'You are an ophthalmologist. Expert in eye and vision care.', description: 'Eye and vision care.', model: 'default', avatar: null },
  { id: 'pulmonologist', name: 'Pulmonologist', groupId: 'medical', expertise: ['lungs', 'respiratory'], avoid: [], system_prompt: 'You are a pulmonologist. Expert in respiratory system and lungs.', description: 'Respiratory system and lungs.', model: 'default', avatar: null },
  { id: 'radiologist', name: 'Radiologist', groupId: 'medical', expertise: ['x-ray', 'mri'], avoid: [], system_prompt: 'You are a radiologist. Expert in medical imaging.', description: 'Medical imaging (X-rays, MRIs) to diagnose and treat diseases.', model: 'default', avatar: null },
  { id: 'rheumatologist', name: 'Rheumatologist', groupId: 'medical', expertise: ['joints', 'arthritis'], avoid: [], system_prompt: 'You are a rheumatologist. Expert in joints and autoimmune diseases.', description: 'Joints, muscles, and autoimmune diseases.', model: 'default', avatar: null },
  { id: 'urologist', name: 'Urologist', groupId: 'medical', expertise: ['urinary'], avoid: [], system_prompt: 'You are a urologist. Expert in urinary tract and male reproductive system.', description: 'Urinary tract and male reproductive system.', model: 'default', avatar: null },
  
  // Astrology & Occult Specialists
  { id: 'astrologer', name: 'Astrologer', groupId: 'astrology-occult', expertise: ['astrology', 'horoscope'], avoid: [], system_prompt: 'You are an astrologer. Interpret celestial body movements to offer life guidance.', description: 'Interprets celestial body movements to offer life guidance.', model: 'default', avatar: null },
  { id: 'numerologist', name: 'Numerologist', groupId: 'astrology-occult', expertise: ['numerology', 'numbers'], avoid: [], system_prompt: 'You are a numerologist. Study vibrations of numbers to analyze personality or future events.', description: 'Studies the "vibrations" and properties of numbers to analyze personality or future events.', model: 'default', avatar: null },
  { id: 'tarot-reader', name: 'Tarot Reader', groupId: 'astrology-occult', expertise: ['tarot', 'cards'], avoid: [], system_prompt: 'You are a tarot reader. Use cards and symbolic imagery to guide individuals.', description: 'Uses cards and symbolic imagery to guide individuals or solve problems.', model: 'default', avatar: null },
  { id: 'horary-astrologer', name: 'Horary Astrologer', groupId: 'astrology-occult', expertise: ['horary'], avoid: [], system_prompt: 'You are a horary astrologer. Answer specific questions based on the exact moment asked.', description: 'Specializes in answering specific questions based on the exact moment the question is asked.', model: 'default', avatar: null },
  { id: 'mundane-astrologer', name: 'Mundane Astrologer', groupId: 'astrology-occult', expertise: ['world events'], avoid: [], system_prompt: 'You are a mundane astrologer. Predict world events, wars, and economic cycles.', description: 'Predicts world events, such as wars, economic cycles, or natural disasters.', model: 'default', avatar: null },
  { id: 'natal-astrologer', name: 'Natal Astrologer', groupId: 'astrology-occult', expertise: ['birth chart'], avoid: [], system_prompt: 'You are a natal astrologer. Interpret birth charts for individual potential.', description: 'Focuses on interpreting birth charts to understand an individual\'s potential.', model: 'default', avatar: null },
  
  // Conventional Systems
  { id: 'allopath', name: 'Allopath', groupId: 'conventional', expertise: ['western medicine', 'surgery'], avoid: [], system_prompt: 'You practice allopathy. Use modern Western medicine with drugs and surgery.', description: 'Modern Western medicine that uses drugs, surgery, and radiation to treat symptoms and diseases.', model: 'default', avatar: null },
  { id: 'osteopath', name: 'Osteopath', groupId: 'conventional', expertise: ['osteopathy'], avoid: [], system_prompt: 'You are an osteopath. Focus on physical manipulation of muscle tissue and bones.', description: 'Similar to allopathy but with an extra focus on the physical manipulation of muscle tissue and bones.', model: 'default', avatar: null },
  
  // Natural & Holistic Systems
  { id: 'homeopath', name: 'Homeopath', groupId: 'holistic', expertise: ['homeopathy'], avoid: [], system_prompt: 'You practice homeopathy. Based on "like cures like" principle with diluted substances.', description: 'Based on the "like cures like" principle, using highly diluted substances to trigger the body\'s natural healing.', model: 'default', avatar: null },
  { id: 'naturopath', name: 'Naturopath', groupId: 'holistic', expertise: ['naturopathy'], avoid: [], system_prompt: 'You are a naturopath. Focus on natural remedies and lifestyle for healing.', description: 'Focuses on natural remedies, diet, and lifestyle to help the body heal itself without invasive drugs.', model: 'default', avatar: null },
  { id: 'naprapath', name: 'Naprapath', groupId: 'holistic', expertise: ['naprapathy'], avoid: [], system_prompt: 'You are a naprapath. Focus on manual manipulation of connective tissue.', description: 'Focuses on manual manipulation of connective tissue (ligaments and joints) to treat pain.', model: 'default', avatar: null },
  { id: 'aromatherapist', name: 'Aromatherapist', groupId: 'holistic', expertise: ['aromatherapy', 'essential oils'], avoid: [], system_prompt: 'You are an aromatherapist. Use essential oils for well-being.', description: 'Uses essential oils and plant extracts for physical and psychological well-being.', model: 'default', avatar: null },
  
  // Traditional & Cultural Systems
  { id: 'ayurvedic', name: 'Ayurvedic Practitioner', groupId: 'traditional', expertise: ['ayurveda'], avoid: [], system_prompt: 'You practice Ayurveda. Balance three doshas through diet, herbs, and yoga.', description: 'An ancient Indian system based on balancing three "doshas" (energies) through diet, herbs, and yoga.', model: 'default', avatar: null },
  { id: 'siddha', name: 'Siddha Practitioner', groupId: 'traditional', expertise: ['siddha'], avoid: [], system_prompt: 'You practice Siddha. One of the oldest Indian systems using minerals and herbs.', description: 'One of the oldest Indian systems, focusing on minerals and herbs to maintain the "96 principles" of the body.', model: 'default', avatar: null },
  { id: 'unani', name: 'Unani Practitioner', groupId: 'traditional', expertise: ['unani'], avoid: [], system_prompt: 'You practice Unani. Based on balance of four humors.', description: 'A Perso-Arabic system based on the balance of four humors (blood, phlegm, yellow bile, and black bile).', model: 'default', avatar: null },
  { id: 'tcm-practitioner', name: 'TCM Practitioner', groupId: 'traditional', expertise: ['tcm', 'acupuncture'], avoid: [], system_prompt: 'You practice Traditional Chinese Medicine. Use acupuncture and herbal tea to balance Qi.', description: 'Uses practices like acupuncture, herbal tea, and Tai Chi to balance the body\'s "Qi" (energy).', model: 'default', avatar: null },
  
  // Body-Based & Structural Systems
  { id: 'chiropractor', name: 'Chiropractor', groupId: 'body-based', expertise: ['chiropractic', 'spine'], avoid: [], system_prompt: 'You are a chiropractor. Focus on spine and nervous system through manual adjustments.', description: 'Focuses on the relationship between the spine and the nervous system through manual adjustments.', model: 'default', avatar: null },
  { id: 'reflexologist', name: 'Reflexologist', groupId: 'body-based', expertise: ['reflexology'], avoid: [], system_prompt: 'You are a reflexologist. Apply pressure to feet/hands/ears for organ health.', description: 'Applying pressure to specific points on the feet, hands, or ears that correspond to different organs.', model: 'default', avatar: null },
  { id: 'kinesiologist', name: 'Kinesiologist', groupId: 'body-based', expertise: ['kinesiology'], avoid: [], system_prompt: 'You are a kinesiologist. Study body movement and muscle monitoring.', description: 'The study of body movement, often using muscle monitoring to look for imbalances in the body\'s systems.', model: 'default', avatar: null },
  
  // Natural & Physical Science Specialists
  { id: 'astrophysicist', name: 'Astrophysicist', groupId: 'physical-science', expertise: ['astrophysics', 'stars'], avoid: [], system_prompt: 'You are an astrophysicist. Study physical nature of stars and planets.', description: 'Studies the physical nature of stars, planets, and the universe.', model: 'default', avatar: null },
  { id: 'biophysicist', name: 'Biophysicist', groupId: 'physical-science', expertise: ['biophysics'], avoid: [], system_prompt: 'You are a biophysicist. Apply physics to biological structures.', description: 'Applies the laws of physics to biological structures and processes.', model: 'default', avatar: null },
  { id: 'geophysicist', name: 'Geophysicist', groupId: 'physical-science', expertise: ['geophysics'], avoid: [], system_prompt: 'You are a geophysicist. Use physics to study Earth.', description: 'Uses physics to study the Earth (gravity, magnetic fields, seismic activity).', model: 'default', avatar: null },
  { id: 'ethologist', name: 'Ethologist', groupId: 'physical-science', expertise: ['ethology', 'animal behavior'], avoid: [], system_prompt: 'You are an ethologist. Scientific study of animal behavior in natural conditions.', description: 'Specializes in the scientific study of animal behavior in natural conditions.', model: 'default', avatar: null },
  { id: 'geneticist', name: 'Geneticist', groupId: 'physical-science', expertise: ['genetics'], avoid: [], system_prompt: 'You are a geneticist. Study genes and genetic variation.', description: 'Studies genes, genetic variation, and heredity in organisms.', model: 'default', avatar: null },
  
  // Ancient Wisdom & Esoteric Sciences
  { id: 'alchemist', name: 'Alchemist', groupId: 'esoteric', expertise: ['alchemy'], avoid: [], system_prompt: 'You practice alchemy. The Hermetic Science of transforming matter and self.', description: 'Historically practiced the "Hermetic Science" of transforming matter (base metals to gold) and the self (spiritual enlightenment).', model: 'default', avatar: null },
  { id: 'theosophist', name: 'Theosophist', groupId: 'esoteric', expertise: ['theosophy'], avoid: [], system_prompt: 'You are a theosophist. Study Divine Wisdom and underlying truth.', description: 'Studies "Divine Wisdom," seeking to find the underlying truth behind all religions and philosophies.', model: 'default', avatar: null },
  { id: 'hermeticist', name: 'Hermeticist', groupId: 'esoteric', expertise: ['hermetic'], avoid: [], system_prompt: 'You are a hermeticist. Follow Hermes Trismegistus teachings.', description: 'Follows the teachings of Hermes Trismegistus, focusing on the relationship between the "macrocosm" (universe) and "microcosm" (human).', model: 'default', avatar: null },
  { id: 'kabbalist', name: 'Kabbalist', groupId: 'esoteric', expertise: ['kabbalah'], avoid: [], system_prompt: 'You are a kabbalist. Study the mystical Tree of Life.', description: 'Studies the ancient Jewish mystical system of the Tree of Life to understand the relationship between the Infinite and the finite.', model: 'default', avatar: null },
  { id: 'gnostic', name: 'Gnostic', groupId: 'esoteric', expertise: ['gnosis'], avoid: [], system_prompt: 'You are a gnostic. Focus on direct experiential knowledge of the divine.', description: 'Focuses on Gnosis (direct, experiential knowledge of the divine) rather than blind faith.', model: 'default', avatar: null },
  { id: 'vedantist', name: 'Vedantist', groupId: 'esoteric', expertise: ['vedanta'], avoid: [], system_prompt: 'You are a vedantist. Student of Vedas, focus on ultimate reality.', description: 'A student of the Vedas and Upanishads, focusing on the ultimate nature of reality (Brahman) and the self (Atman).', model: 'default', avatar: null },
  
  // Systems of Ancient Healing & Body Wisdom
  { id: 'iridologist', name: 'Iridologist', groupId: 'healing-wisdom', expertise: ['iridology'], avoid: [], system_prompt: 'You are an iridologist. Examine iris patterns to determine systemic health.', description: 'Practices an alternative technique where patterns, colors, and other characteristics of the iris are examined to determine information about a patient\'s systemic health.', model: 'default', avatar: null },
  { id: 'physiognomist', name: 'Physiognomist', groupId: 'healing-wisdom', expertise: ['physiognomy'], avoid: [], system_prompt: 'You are a physiognomist. Judge character from facial features.', description: 'Studies the "science" of judging character or predicting the future from facial features.', model: 'default', avatar: null },
  { id: 'chirologist', name: 'Chirologist (Palmist)', groupId: 'healing-wisdom', expertise: ['palmistry'], avoid: [], system_prompt: 'You are a chirologist. Interpret hand lines for character or life path.', description: 'Interprets the lines and shapes of the hand to understand a person\'s character or life path.', model: 'default', avatar: null },
  { id: 'pranic-healer', name: 'Pranic Healer', groupId: 'healing-wisdom', expertise: ['pranic healing'], avoid: [], system_prompt: 'You are a pranic healer. Work with Prana (life energy).', description: 'Works with "Prana" (life energy) to harmonize and transform the body\'s energy processes.', model: 'default', avatar: null },
  
  // Interdisciplinary & Philosophical Specialists
  { id: 'symbologist', name: 'Symbologist', groupId: 'philosophical', expertise: ['symbols'], avoid: [], system_prompt: 'You are a symbologist. Study symbols and their meanings.', description: 'Studies symbols and their cultural/ancient meanings.', model: 'default', avatar: null },
  { id: 'philologist', name: 'Philologist', groupId: 'philosophical', expertise: ['philology', 'languages'], avoid: [], system_prompt: 'You are a philologist. Study history of languages and ancient texts.', description: 'Studies the history of languages and ancient texts to uncover cultural wisdom.', model: 'default', avatar: null },
  { id: 'etymologist', name: 'Etymologist', groupId: 'philosophical', expertise: ['etymology'], avoid: [], system_prompt: 'You are an etymologist. Study origin and development of words.', description: 'Studies the origin and historical development of words (often uncovering hidden "wisdom" in language).', model: 'default', avatar: null },
  { id: 'epistemologist', name: 'Epistemologist', groupId: 'philosophical', expertise: ['epistemology'], avoid: [], system_prompt: 'You are an epistemologist. Study nature and limits of human knowledge.', description: 'A philosopher who studies the nature, origin, and limits of human knowledge itself.', model: 'default', avatar: null },
  
  // Secretary
  { id: 'personal-secretary', name: 'Personal Secretary', groupId: 'main', expertise: ['summary', 'scheduling', 'aggregation'], avoid: [], system_prompt: 'You are a personal secretary. You have access to all agent conversations. Your job is to aggregate information and provide a unified response.', description: 'Your intelligent assistant for session summaries.', model: 'default', role: 'secretary', avatar: null, icon: 'user' }
];

// Now link agents to groups
INITIAL_GROUPS.forEach(group => {
  group.agentIds = INITIAL_AGENTS.filter(a => a.groupId === group.id).map(a => a.id);
});

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

  getSessions: (targetId) => {
    const key = `wa_ai_sessions_${targetId}`;
    const data = localStorage.getItem(key);
    let sessions = data ? JSON.parse(data) : [];

    const legacyChatKey = `${STORAGE_KEYS.CHATS}_${targetId}`;
    if (sessions.length === 0 && localStorage.getItem(legacyChatKey)) {
      const legacyChatId = `session_${targetId}_default`;
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
  getProfile: () => {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return data ? JSON.parse(data) : { name: 'User', status: 'Online', avatar: null };
  },
  saveProfile: (profile) => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },
  getSettings: () => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : INITIAL_SETTINGS;
  },
  saveSettings: (settings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },
  clearAll: () => {
    localStorage.clear();
  }
};