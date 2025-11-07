import { useState } from 'react';
import type { Message } from '../types/chat';

interface ChatMessageProps {
  message: Message;
  onFeedback?: (messageId: number, rating: 'helpful' | 'not_helpful') => void;
}

export function ChatMessage({ message, onFeedback }: ChatMessageProps) {
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const isUser = message.role === 'user';

  const handleFeedback = (rating: 'helpful' | 'not_helpful') => {
    if (message.id && onFeedback && !feedbackGiven) {
      onFeedback(message.id, rating);
      setFeedbackGiven(true);
    }
  };

  // Convert markdown formatting to HTML
  const formatMessageContent = (content: string) => {
    const parts: (string | React.ReactElement)[] = [];
    let currentIndex = 0;
    
    // Combined regex to match markdown links and bold text
    // Matches: [text](url) or **text**
    const markdownRegex = /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)/g;
    let match;

    while ((match = markdownRegex.exec(content)) !== null) {
      // Add text before the match
      if (match.index > currentIndex) {
        const textBefore = content.substring(currentIndex, match.index);
        parts.push(textBefore);
      }
      
      // Check if it's a link [text](url)
      if (match[1]) {
        parts.push(
          <a
            key={`link-${match.index}`}
            href={match[3]}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-link"
          >
            {match[2]}
          </a>
        );
      }
      // Check if it's bold **text**
      else if (match[4]) {
        parts.push(
          <strong key={`bold-${match.index}`}>
            {match[5]}
          </strong>
        );
      }
      
      currentIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (currentIndex < content.length) {
      parts.push(content.substring(currentIndex));
    }

    // If no markdown found, return original content
    return parts.length > 0 ? parts : content;
  };

  return (
    <div className={`message ${isUser ? 'user-message' : 'assistant-message'}`}>
      <div className="message-content">
        <div className="message-text" style={{ whiteSpace: 'pre-wrap' }}>
          {formatMessageContent(message.content)}
        </div>
        {message.retrieved_url && !message.content.includes(message.retrieved_url) && (
          <div className="message-link">
            <a href={message.retrieved_url} target="_blank" rel="noopener noreferrer">
              Vezi mai multe detalii
            </a>
          </div>
        )}
      </div>
      {!isUser && message.id && (
        <div className="message-feedback">
          {!feedbackGiven ? (
            <>
              <span className="feedback-label">A fost util?</span>
              <button
                onClick={() => handleFeedback('helpful')}
                className="feedback-btn helpful"
                title="Util"
              >
                👍
              </button>
              <button
                onClick={() => handleFeedback('not_helpful')}
                className="feedback-btn not-helpful"
                title="Nu e util"
              >
                👎
              </button>
            </>
          ) : (
            <span className="feedback-thanks">Mulțumim pentru feedback!</span>
          )}
        </div>
      )}
    </div>
  );
}
