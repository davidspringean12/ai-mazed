import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';
import type { ChatSession, Message } from '../types/chat';

export function useChatSession() {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    const sessionId = uuidv4();
    
    // Create session object immediately (don't wait for Supabase)
    const newSession: ChatSession = {
      id: sessionId,
      started_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      metadata: {
        user_agent: navigator.userAgent,
        referrer: document.referrer,
      },
    };
    
    setSession(newSession);

    // Try to store in Supabase (non-blocking, ignore errors)
    try {
      await supabase
        .from('chat_sessions')
        .insert({
          id: sessionId,
          metadata: newSession.metadata,
        });

      await supabase.from('analytics_events').insert({
        event_type: 'session_start',
        session_id: sessionId,
        metadata: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      console.warn('Could not store session in Supabase (tables may not exist):', error);
      // Continue anyway - session works without database
    }
  };

  const sendMessage = async (content: string) => {
    if (!session) return;

    const userMessage: Message = {
      role: 'user',
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const startTime = Date.now();

      // Use local API server instead of Supabase Edge Function
      // Port 5001 because macOS Control Center blocks port 5000
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const response = await fetch(
        `${apiUrl}/api/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: session.id,
            message: content,
          }),
        }
      );

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: data.message_id,
        role: 'assistant',
        content: data.response,
        retrieved_source: data.source,
        retrieved_url: data.url,
        response_time_ms: responseTime,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Store analytics (non-blocking, ignore errors)
      try {
        await supabase.from('chat_sessions').update({
          last_activity: new Date().toISOString(),
        }).eq('id', session.id);

        await supabase.from('analytics_events').insert({
          event_type: 'message_sent',
          session_id: session.id,
          metadata: { response_time_ms: responseTime },
        });
      } catch (analyticsError) {
        console.warn('Analytics error (non-critical):', analyticsError);
      }
    } catch (error) {
      console.error('Error sending message:', error);

      // Try to log error (non-blocking)
      try {
        await supabase.from('analytics_events').insert({
          event_type: 'error',
          session_id: session.id,
          metadata: { error: String(error) },
        });
      } catch {
        // Ignore analytics errors
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Ne pare rău, a apărut o eroare. Te rugăm să încerci din nou.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const submitFeedback = async (messageId: number, rating: 'helpful' | 'not_helpful') => {
    if (!session) return;

    try {
      await supabase.from('message_feedback').insert({
        message_id: messageId,
        session_id: session.id,
        rating,
      });

      await supabase.from('analytics_events').insert({
        event_type: 'feedback_given',
        session_id: session.id,
        metadata: { message_id: messageId, rating },
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return {
    session,
    messages,
    isLoading,
    sendMessage,
    submitFeedback,
  };
}
