import { motion } from 'framer-motion';
import { MessageList } from './components/MessageList';
import { InputBox } from './components/InputBox';
import { ThemeToggle } from './components/ThemeToggle';
import { useChatSession } from './hooks/useChatSession';

function App() {
  const { messages, isLoading, sendMessage, submitFeedback } = useChatSession();

  return (
    <div className="flex flex-col h-screen max-w-5xl mx-auto bg-white dark:bg-slate-900">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-linear-to-br from-blue-600 via-blue-500 to-blue-700 dark:from-blue-800 dark:via-blue-700 dark:to-blue-900 text-white px-6 py-6 shadow-lg"
      >
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="text-center">
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="text-2xl md:text-3xl font-bold mb-2 flex items-center justify-center gap-2"
          >
            <span className="text-3xl md:text-4xl">🎓</span>
            Asistent Universitar
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-blue-50 text-sm md:text-base"
          >
            Întreabă-mă orice despre Facultatea de Științe Economice
          </motion.p>
        </div>
      </motion.header>

      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-900">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          onFeedback={submitFeedback}
        />

        <InputBox onSend={sendMessage} disabled={isLoading} />
      </div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-3 px-6 text-center"
      >
        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
          Facultatea de Științe Economice - ULBS Sibiu
        </p>
      </motion.footer>
    </div>
  );
}

export default App;
