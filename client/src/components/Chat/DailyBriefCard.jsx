import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, X } from 'lucide-react';
import { profileApi } from '../../services/profileApi';

const DISMISS_KEY = 'wa_brief_dismissed_date';

const DailyBriefCard = () => {
  const [brief, setBrief] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await profileApi.getDailyBrief();
        const today = new Date().toISOString().slice(0, 10);
        if (localStorage.getItem(DISMISS_KEY) === today) {
          setDismissed(true);
        }
        setBrief(data);
      } catch (e) {
        // silent — brief unavailable
      }
    })();
  }, []);

  if (!brief || dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, new Date().toISOString().slice(0, 10));
    setDismissed(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 my-3 p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-wa-accent/5 to-emerald-500/10 border border-amber-500/20 relative"
    >
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1.5 hover:bg-white/5 rounded-lg text-wa-text-secondary"
      ><X size={14} /></button>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
          <Sun size={18} className="text-amber-400" />
        </div>
        <div className="flex-1 min-w-0 pr-6">
          <div className="text-xs text-amber-300 uppercase tracking-wide font-semibold mb-1">Daily brief · {brief.date}</div>
          <pre className="text-sm text-wa-text-primary whitespace-pre-wrap font-wa">{brief.body}</pre>
        </div>
      </div>
    </motion.div>
  );
};

export default DailyBriefCard;
