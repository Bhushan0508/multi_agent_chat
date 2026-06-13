import React, { useState, useRef, useEffect } from 'react';
import { 
  Paperclip, Send, Mic, MoreVertical, Search, 
  Smile, Image as ImageIcon, FileText, X, User, Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DailyBriefCard from './DailyBriefCard';
import { API_BASE } from '../../config';

const ChatWindow = ({ activeChat, messages, onSendMessage, isTyping, agentStatuses }) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const scrollRef = useRef(null);
  
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim() && attachments.length === 0) return;
    const finalInput = isSearchMode ? `[SEARCH] ${input}` : input;
    onSendMessage(finalInput, attachments);
    setInput('');
    setAttachments([]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        
        try {
          const formData = new FormData();
          formData.append('audio', audioBlob, 'record.webm');
          
          const res = await fetch(`${API_BASE}/api/transcribe`, {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();
          if (data.text) {
             setInput(prev => prev + (prev ? ' ' : '') + data.text);
          }
        } catch (error) {
          console.error("Transcription error:", error);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing mic:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col relative bg-wa-bg overflow-hidden h-screen">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none" style={{
         backgroundImage: `url('https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-background-dark-background-whatsapp.jpg')`,
         backgroundSize: '400px'
      }}></div>

      {/* Header */}
      <header className="z-10 h-[64px] bg-wa-sidebar flex items-center justify-between px-6 border-b border-white/5 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-wa-accent to-emerald-900 border border-white/10 flex items-center justify-center font-bold text-white shadow-inner overflow-hidden">
            {activeChat?.avatar ? (
              <img src={activeChat.avatar} className="w-full h-full object-cover" />
            ) : activeChat?.icon === 'user' ? (
              <User size={20} />
            ) : (
              activeChat?.name?.charAt(0)
            )}
          </div>
          <div>
            <h2 className="font-bold text-[15px] text-wa-text-primary">{activeChat?.name}</h2>
            <p className="text-[11px] text-wa-accent font-bold uppercase tracking-wider">
               {isTyping ? 'Agents are thinking...' : 'AI Platform • Local'}
            </p>
          </div>
        </div>
        <div className="flex gap-6 text-wa-text-secondary items-center">
           <Search 
              size={20} 
              onClick={() => setIsSearchMode(!isSearchMode)}
              className={`transition-colors cursor-pointer ${isSearchMode ? 'text-wa-accent' : 'hover:text-wa-accent'}`} 
              title="Toggle Web Search Mode"
           />
           <MoreVertical size={20} className="hover:text-wa-accent transition-colors cursor-pointer" />
        </div>
      </header>

      {/* Messages Area */}
      <main className="z-10 flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-3 custom-scrollbar">
        {activeChat?.id === 'personal-secretary' && <DailyBriefCard />}
        <div className="flex-1"></div>

        <AnimatePresence>
          {messages.map((m, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              key={i}
              className={`flex flex-col ${m.isOwn ? 'items-end' : 'items-start'} mb-2`}
            >
              {!m.isOwn && <span className="text-[10px] font-bold text-wa-accent mb-1 ml-2 uppercase tracking-widest">{m.sender_name}</span>}
              <div className={`max-w-[85%] md:max-w-[70%] px-4 py-2.5 rounded-2xl shadow-sm relative group ${
                m.isOwn 
                ? 'bg-wa-bubble-sent text-white rounded-tr-none' 
                : 'bg-wa-bubble-received text-wa-text-primary rounded-tl-none'
              }`}>
                {m.attachments?.map((att, idx) => (
                  <div key={idx} className="mb-2">
                    {att.type === 'image' ? (
                      <img src={att.content} alt="Upload" className="rounded-lg max-h-60 w-full object-cover border border-white/10" />
                    ) : (
                      <div className="bg-black/20 p-3 rounded-lg flex items-center gap-3 border border-white/10">
                        <FileText size={20} className="text-wa-accent" />
                        <span className="text-xs truncate">{att.name}</span>
                      </div>
                    )}
                  </div>
                ))}
                <p className="text-[14.5px] leading-relaxed whitespace-pre-wrap">{m.content}</p>
                <div className="flex justify-end items-center gap-1 mt-1 opacity-50">
                  <span className="text-[9px] uppercase">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {m.isOwn && <span className="text-sky-400">✓✓</span>}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-2 items-center bg-wa-bubble-received/80 backdrop-blur-md px-4 py-3 rounded-2xl rounded-tl-none w-fit border border-white/5 ml-2 mt-2 shadow-lg"
          >
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-wa-accent rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-wa-accent rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-wa-accent rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
            <span className="text-[10px] font-bold text-wa-text-secondary uppercase ml-2 tracking-tighter">Analyzing Context...</span>
          </motion.div>
        )}
        <div ref={scrollRef}></div>
      </main>

      {/* Input Footer */}
      <footer className="z-20 bg-wa-sidebar p-3 flex flex-col gap-2 shadow-inner border-t border-white/5">
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 py-2 flex gap-3 overflow-x-auto bg-black/20 rounded-xl"
            >
              {attachments.map((file, idx) => (
                <div key={idx} className="relative group shrink-0">
                  <div className="w-16 h-16 rounded-lg bg-wa-panel border border-white/10 flex items-center justify-center overflow-hidden">
                    {file.type === 'image' ? (
                      <img src={file.content} className="w-full h-full object-cover" />
                    ) : (
                      <FileText size={24} className="text-wa-accent" />
                    )}
                  </div>
                  <button 
                    onClick={() => removeAttachment(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-4 px-2">
          <div className="flex gap-4 text-wa-text-secondary">
             <label className="cursor-pointer hover:text-wa-accent transition-all">
                <Paperclip size={24} />
                <input 
                  type="file" 
                  className="hidden" 
                  multiple 
                  onChange={async (e) => {
                    const files = Array.from(e.target.files);
                    const processed = await Promise.all(
                      files.map(async f => {
                        const reader = new FileReader();
                        return new Promise(resolve => {
                          reader.onload = (re) => resolve({
                            name: f.name,
                            type: f.type.startsWith('image/') ? 'image' : 'file',
                            content: re.target.result
                          });
                          f.type.startsWith('image/') ? reader.readAsDataURL(f) : reader.readAsText(f);
                        });
                      })
                    );
                    setAttachments(prev => [...prev, ...processed]);
                  }}
                />
             </label>
             <Smile size={24} className="cursor-pointer hover:text-wa-accent transition-all" />
          </div>
          
          <div className="flex-1 relative">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isRecording ? "Recording audio..." : "Ask your agents anything..."}
              disabled={isRecording}
              className={`w-full bg-[#2a3942] p-3 rounded-xl outline-none text-[15px] shadow-inner border transition-all ${
                 isRecording ? 'text-red-400 border-red-500/50 cursor-not-allowed' : 'placeholder:text-wa-text-secondary text-wa-text-primary border-white/5 focus:border-wa-accent/30'
              }`}
            />
          </div>

          <div className="flex items-center">
            {input.trim() || attachments.length > 0 ? (
              <button 
                onClick={handleSend} 
                className="w-12 h-12 bg-wa-accent rounded-xl flex items-center justify-center text-wa-bg hover:bg-[#00c298] transition-all shadow-lg active:scale-95"
              >
                <Send size={24} />
              </button>
            ) : (
              <div 
                 onClick={isRecording ? stopRecording : startRecording}
                 className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 ${
                    isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-[#2a3942] text-wa-text-secondary hover:text-wa-accent'
                 }`}
                 title={isRecording ? 'Stop Recording' : 'Start Voice Recording'}
              >
                {isRecording ? <Square size={20} fill="currentColor" /> : <Mic size={24} />}
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ChatWindow;
