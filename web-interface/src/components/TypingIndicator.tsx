import { motion } from 'framer-motion';

export function TypingIndicator() {
  const dotVariants = {
    initial: { y: 0, opacity: 0.3 },
    animate: { y: -8, opacity: 1 },
  };

  const containerVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
    },
    exit: {
      opacity: 0,
      scale: 0.8,
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex self-start max-w-[85%] md:max-w-[80%]"
    >
      <div className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-sm shadow-sm">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              variants={dotVariants}
              initial="initial"
              animate="animate"
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
                delay: index * 0.2,
              }}
              className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
