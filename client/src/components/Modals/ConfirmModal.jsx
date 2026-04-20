import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', type = 'danger' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-wa-panel w-full max-w-sm rounded-2xl border border-white/10 shadow-3xl overflow-hidden flex flex-col scale-in">
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 animate-pulse-slow">
            <AlertTriangle size={32} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-wa-text-primary">{title}</h2>
            <p className="text-sm text-wa-text-secondary leading-relaxed px-2">{message}</p>
          </div>
        </div>

        <footer className="p-4 bg-wa-sidebar/50 border-t border-white/5 flex gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-wa-text-secondary hover:bg-white/5 transition-all text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }} 
            className="flex-1 px-4 py-2.5 bg-red-500 rounded-xl font-bold text-white hover:bg-red-600 transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-red-500/20"
          >
            <Trash2 size={16} />
            {confirmText}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ConfirmModal;
