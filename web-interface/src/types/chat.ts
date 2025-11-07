export interface Message {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
  retrieved_source?: string;
  retrieved_url?: string;
  response_time_ms?: number;
}

export interface ChatSession {
  id: string;
  started_at: string;
  last_activity: string;
  user_id?: string;
  metadata?: Record<string, any>;
}

export interface MessageFeedback {
  message_id: number;
  session_id: string;
  rating: 'helpful' | 'not_helpful';
  comment?: string;
}
