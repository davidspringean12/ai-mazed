import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageList } from './components/MessageList';
import { InputBox } from './components/InputBox';
import { LandingPage } from './components/LandingPage';
import { useChatSession } from './hooks/useChatSession';
import { FiX } from 'react-icons/fi';

function App() {
  const { messages, isLoading, sendMessage, submitFeedback } = useChatSession();
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <LandingPage onOpenChat={() => setChatOpen(true)} />

      <AnimatePresence>
        {chatOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 z-30"
              onClick={() => setChatOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-4 md:inset-auto md:right-8 md:bottom-8 md:top-8 md:w-[500px] z-40 flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 text-white px-6 py-6 shadow-lg"
              >
                <button
                  onClick={() => setChatOpen(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                  aria-label="Close chat"
                >
                  <FiX className="w-5 h-5" />
                </button>

                <div className="text-center pr-8">
                  <motion.h1
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="text-2xl font-bold mb-2 flex items-center justify-center gap-2"
                  >
                    <span className="text-3xl">🎓</span>
                    Asistent Universitar
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-blue-50 text-sm"
                  >
                    Întreabă-mă orice despre Facultatea de Științe Economice
                  </motion.p>
                </div>
              </motion.header>

              <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
                <MessageList
                  messages={messages}
                  isLoading={isLoading}
                  onFeedback={submitFeedback}
                  onSend={sendMessage}
                />

                <InputBox onSend={sendMessage} disabled={isLoading} />
              </div>

              <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-slate-100 border-t border-slate-200 py-3 px-6 text-center"
              >
                <p className="text-xs text-slate-600">
                  Facultatea de Științe Economice - ULBS Sibiu
                </p>
              </motion.footer>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
