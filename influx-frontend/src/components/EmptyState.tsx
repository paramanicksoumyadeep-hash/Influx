'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white/5 border border-white/10 border-dashed rounded-[32px]"
    >
      <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mb-6">
        <Icon size={40} className="text-purple-400" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 max-w-sm mb-8">{description}</p>
      {action && (
        <button 
          onClick={action.onClick}
          className="px-8 py-3 bg-white text-gray-950 font-bold rounded-xl hover:bg-purple-500 hover:text-white transition shadow-lg shadow-white/5"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
