import { useEffect, useRef } from 'react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { useChatSession } from './hooks/useChatSession';
import './App.css';

function App() {
  const { messages, isLoading, sendMessage, submitFeedback } = useChatSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="app">
      <header className="chat-header">
        <h1>🎓 Asistent Universitar</h1>
        <p>Întreabă-mă orice despre Facultatea de Științe Economice</p>
      </header>

      <div className="chat-container">
        <div className="messages-container">
          {messages.length === 0 && (
            <div className="welcome-message">
              <h2>Bun venit!</h2>
              <p>Sunt aici să te ajut cu informații despre:</p>
              <ul>
                <li>Calendarul academic și orarul cursurilor</li>
                <li>Programe de licență și master</li>
                <li>Profesori și departamente</li>
                <li>Activități de cercetare</li>
                <li>Burse și facilități studenți</li>
              </ul>
            </div>
          )}
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message}
              onFeedback={submitFeedback}
            />
          ))}
          {isLoading && (
            <div className="loading-indicator">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <ChatInput onSend={sendMessage} disabled={isLoading} />
        </div>
      </div>

      <footer className="chat-footer">
        <p>Facultatea de Științe Economice - ULBS Sibiu</p>
      </footer>
    </div>
  );
}

export default App;
