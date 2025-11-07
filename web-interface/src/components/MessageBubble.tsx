import { motion } from 'framer-motion';
import { useState } from 'react';
import { FiThumbsUp, FiThumbsDown, FiCopy, FiCheck } from 'react-icons/fi';
import type { Message } from '../types/chat';

interface MessageBubbleProps {
  message: Message;
  onFeedback?: (messageId: number, rating: 'helpful' | 'not_helpful') => void;
}

export function MessageBubble({ message, onFeedback }: MessageBubbleProps) {
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleFeedback = (rating: 'helpful' | 'not_helpful') => {
    if (message.id && onFeedback && !feedbackGiven) {
      onFeedback(message.id, rating);
      setFeedbackGiven(true);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatMessageContent = (content: string) => {
    const parts: (string | React.ReactElement)[] = [];
    let currentIndex = 0;

    const markdownRegex = /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)/g;
    let match;

    while ((match = markdownRegex.exec(content)) !== null) {
      if (match.index > currentIndex) {
        const textBefore = content.substring(currentIndex, match.index);
        parts.push(textBefore);
      }

      if (match[1]) {
        parts.push(
          <a
            key={`link-${match.index}`}
            href={match[3]}
            target="_blank"
            rel="noopener noreferrer"
            className={`font-medium underline transition-colors ${
              isUser
                ? 'text-blue-100 hover:text-white'
                : 'text-blue-600 hover:text-blue-700'
            }`}
          >
            {match[2]}
          </a>
        );
      } else if (match[4]) {
        parts.push(
          <strong key={`bold-${match.index}`} className="font-semibold">
            {match[5]}
          </strong>
        );
      }

      currentIndex = match.index + match[0].length;
    }

    if (currentIndex < content.length) {
      parts.push(content.substring(currentIndex));
    }

    return parts.length > 0 ? parts : content;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex flex-col gap-2 max-w-[85%] md:max-w-[80%] ${
        isUser ? 'self-end items-end' : 'self-start items-start'
      }`}
    >
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className={`group relative px-4 py-3 rounded-2xl shadow-sm ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm'
            : 'bg-white text-slate-900 border border-slate-200 rounded-bl-sm'
        }`}
      >
        <div className="whitespace-pre-wrap break-words leading-relaxed">
          {formatMessageContent(message.content)}
        </div>

        {message.retrieved_url && !message.content.includes(message.retrieved_url) && (
          <div className={`mt-3 pt-3 border-t ${
            isUser
              ? 'border-blue-400/30'
              : 'border-slate-200'
          }`}>
            <a
              href={message.retrieved_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                isUser
                  ? 'text-blue-100 hover:text-white'
                  : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              Vezi mai multe detalii →
            </a>
          </div>
        )}

        {!isUser && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleCopy}
            className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-100 p-2 rounded-full shadow-md hover:bg-slate-200"
            aria-label="Copy message"
          >
            {copied ? (
              <FiCheck className="w-3 h-3 text-green-600" />
            ) : (
              <FiCopy className="w-3 h-3 text-slate-600" />
            )}
          </motion.button>
        )}
      </motion.div>

      {!isUser && message.id && (
        <div className="flex items-center gap-2 px-2 text-sm">
          {!feedbackGiven ? (
            <>
              <span className="text-slate-500 text-xs">A fost util?</span>
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleFeedback('helpful')}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                title="Util"
                aria-label="Mark as helpful"
              >
                <FiThumbsUp className="w-4 h-4 text-slate-600 hover:text-green-600" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleFeedback('not_helpful')}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                title="Nu e util"
                aria-label="Mark as not helpful"
              >
                <FiThumbsDown className="w-4 h-4 text-slate-600 hover:text-red-600" />
              </motion.button>
            </>
          ) : (
            <span className="text-green-600 text-xs font-medium">
              Mulțumim pentru feedback!
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
