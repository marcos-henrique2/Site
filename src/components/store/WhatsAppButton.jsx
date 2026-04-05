import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';

export default function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasShownOnce, setHasShownOnce] = useState(false);

  // Show tooltip automatically after 3s, once
  useEffect(() => {
    if (!hasShownOnce) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
        setHasShownOnce(true);
        setTimeout(() => setShowTooltip(false), 4000);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasShownOnce]);

  const handleClick = () => {
    const message = encodeURIComponent('Olá! Vim pelo site da Mallki Print e gostaria de mais informações. 😊');
    window.open(`https://wa.me/5562992882262?text=${message}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="relative bg-white rounded-2xl shadow-2xl border border-green-100 p-4 max-w-[220px]"
          >
            {/* Tail */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-green-100 rotate-45" />
            <button
              onClick={() => setShowTooltip(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
            <p className="text-xs font-semibold text-gray-800 mb-1">💬 Precisa de ajuda?</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Fale com a gente no WhatsApp! Respondemos rápido.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 1 }}
        className="relative w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-2xl flex items-center justify-center transition-colors"
        aria-label="Falar no WhatsApp"
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-30" />
        <MessageCircle className="w-7 h-7 text-white fill-white" />
      </motion.button>
    </div>
  );
}
