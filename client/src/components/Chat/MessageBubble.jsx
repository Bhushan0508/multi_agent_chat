import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

const MessageBubble = ({ message, isOwn }) => {
  const { content, timestamp, sender_name, status } = message;
  
  return (
    <div className={`flex flex-col mb-2 max-w-[75%] ${isOwn ? 'self-end' : 'self-start'}`}>
      <div className={`relative px-3 py-1.5 rounded-lg shadow-sm ${
        isOwn 
        ? 'bg-wa-bubble-sent rounded-tr-none' 
        : 'bg-wa-bubble-received rounded-tl-none'
      }`}>
        {!isOwn && (
          <p className="text-[11px] font-bold text-wa-accent mb-0.5 uppercase">
            {sender_name}
          </p>
        )}
        <div className="text-[14.5px] leading-snug text-wa-text-primary whitespace-pre-wrap pr-12">
          {content}
        </div>
        
        <div className="absolute bottom-1 right-1.5 flex items-center gap-1">
          <span className="text-[10px] text-gray-400">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isOwn && (
            <span className="text-sky-400">
               {status === 'delivered' ? <CheckCheck size={14} /> : <Check size={14} />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
