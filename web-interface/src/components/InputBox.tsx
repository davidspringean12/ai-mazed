import { useState, useRef, type FormEvent, type KeyboardEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend } from 'react-icons/fi';

interface InputBoxProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function InputBox({ onSend, disabled = false }: InputBoxProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <div className="border-t border-slate-200 bg-white px-4 md:px-6 py-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-3 max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <motion.div
            initial={false}
            animate={{
              boxShadow: input.trim()
                ? '0 0 0 2px rgb(59 130 246 / 0.5)'
                : '0 0 0 0px rgb(59 130 246 / 0)',
            }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl overflow-hidden"
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pune o întrebare despre universitate..."
              disabled={disabled}
              rows={1}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 resize-none transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed text-slate-900 placeholder:text-slate-400 max-h-32"
              style={{ minHeight: '48px' }}
              aria-label="Message input"
            />
          </motion.div>

          <AnimatePresence>
            {input.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -top-6 right-2 text-xs text-slate-400"
              >
                {input.length > 500 && (
                  <span className={input.length > 1000 ? 'text-red-500' : 'text-yellow-500'}>
                    {input.length}/1000
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          type="submit"
          disabled={disabled || !input.trim()}
          whileHover={!disabled && input.trim() ? { scale: 1.05, y: -2 } : {}}
          whileTap={!disabled && input.trim() ? { scale: 0.95 } : {}}
          className={`p-3 rounded-2xl font-semibold transition-all shadow-sm ${
            disabled || !input.trim()
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-linear-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30'
          }`}
          aria-label="Send message"
        >
          <FiSend className="w-5 h-5" />
        </motion.button>
      </form>
    </div>
  );
}
