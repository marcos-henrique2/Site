import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Truck } from 'lucide-react';

// You can easily customize these messages
const BANNER_MESSAGES = [
  { icon: Zap, text: '⚡ Frete GRÁTIS para Goiânia nas compras acima de R$ 150!' },
  { icon: Truck, text: '🚀 Produção em até 5 dias úteis — qualidade garantida!' },
];

export default function PromoBanner() {
  const [visible, setVisible] = useState(true);
  const [msgIndex] = useState(0);

  if (!visible) return null;

  const message = BANNER_MESSAGES[msgIndex];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative bg-gradient-to-r from-cyan-500 via-primary to-cyan-400 overflow-hidden"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%)',
                animation: 'shimmer 3s infinite',
              }}
            />
          </div>

          <style>{`
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(200%); }
            }
          `}</style>

          <div className="relative max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-2">
            <p className="text-xs sm:text-sm font-semibold text-white text-center leading-tight">
              {message.text}
            </p>
            <button
              onClick={() => setVisible(false)}
              className="absolute right-3 sm:right-6 text-white/70 hover:text-white transition-colors shrink-0"
              aria-label="Fechar banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
