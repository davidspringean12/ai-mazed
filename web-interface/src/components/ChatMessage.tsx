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

  return (
    <div className={`message ${isUser ? 'user-message' : 'assistant-message'}`}>
      <div className="message-content">
        <div className="message-text">{message.content}</div>
        {message.retrieved_url && (
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
