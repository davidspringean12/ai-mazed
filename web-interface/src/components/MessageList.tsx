import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowDown } from 'react-icons/fi';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import type { Message } from '../types/chat';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onFeedback: (messageId: number, rating: 'helpful' | 'not_helpful') => void;
}

export function MessageList({ messages, isLoading, onFeedback }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;

    setShowScrollButton(!isNearBottom);
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 md:px-6 py-6 flex flex-col gap-4 scroll-smooth"
    >
      {messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center h-full text-center px-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-6 text-6xl"
          >
            🎓
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Bun venit!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md">
            Sunt aici să te ajut cu informații despre Facultatea de Științe Economice
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full"
          >
            {[
              { icon: '📅', text: 'Calendarul academic și orarul cursurilor' },
              { icon: '🎓', text: 'Programe de licență și master' },
              { icon: '👨‍🏫', text: 'Profesori și departamente' },
              { icon: '🔬', text: 'Activități de cercetare' },
              { icon: '💰', text: 'Burse și facilități studenți' },
              { icon: '❓', text: 'Întrebări generale' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-sm text-slate-700 dark:text-slate-300 text-left">
                  {item.text}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      <AnimatePresence mode="popLayout">
        {messages.map((message, index) => (
          <MessageBubble
            key={`${message.id || 'msg'}-${index}`}
            message={message}
            onFeedback={onFeedback}
          />
        ))}
        {isLoading && <TypingIndicator key="typing" />}
      </AnimatePresence>

      <div ref={messagesEndRef} />

      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scrollToBottom()}
            className="fixed bottom-24 right-6 md:right-8 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-colors z-10"
            aria-label="Scroll to bottom"
          >
            <FiArrowDown className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
