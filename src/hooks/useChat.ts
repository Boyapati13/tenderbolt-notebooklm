'use client';

import { useState, useCallback } from 'react';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  citations?: Array<{ docId: string; filename: string }>;
};

export function useChat(projectId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessage], 
          projectId: projectId || 'default' 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.reply ?? "Sorry, I couldn't get a response.",
        citations: data.citations,
      };
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (e: any) {
        console.error("Chat API error:", e);
        setError(e);
        const errorMessage: ChatMessage = {
            role: 'assistant',
            content: "Sorry, there was an error processing your request.",
        };
        setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [messages, projectId, loading]);

  return {
    messages,
    loading,
    error,
    sendMessage,
  };
}
