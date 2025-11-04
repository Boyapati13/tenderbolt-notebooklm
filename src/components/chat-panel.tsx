'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Send, AlertCircle, Upload, Bot, User, BrainCircuit } from 'lucide-react';
import { useChat, ChatMessage } from '@/hooks/useChat';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

export function ChatPanel({ 
  projectId, 
  onUploadSource 
}: { 
  projectId?: string;
  onUploadSource: () => void;
}) {
  const [input, setInput] = useState("");
  const { messages, loading, error, sendMessage } = useChat(projectId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput("");
    }
  };

  return (
    <div className="flex h-full flex-col bg-gray-900 text-white">
      <div ref={scrollRef} className="flex-1 space-y-6 overflow-auto p-6">
        {messages.length === 0 && !loading && <InitialState onUploadSource={onUploadSource} />}
        {messages.map((m, i) => <ChatMessageItem key={i} message={m} />)}
        {loading && <LoadingIndicator />}
        {error && <ErrorMessage error={error} />}
      </div>

      <ChatInput
        input={input}
        setInput={setInput}
        onSend={handleSend}
        disabled={loading}
      />
    </div>
  );
}

const InitialState = ({ onUploadSource }: { onUploadSource: () => void; }) => (
  <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-700 bg-gray-800 p-12 text-center">
    <BrainCircuit className="mx-auto h-16 w-16 text-gray-500" />
    <h3 className="mt-4 text-xl font-semibold">Welcome to TenderBolt AI</h3>
    <p className="mt-2 max-w-md text-gray-400">
      Get started by uploading your first tender document. The AI will analyze it and help you craft a winning proposal.
    </p>
    <Button onClick={onUploadSource} className="mt-6">
      <Upload className="mr-2 h-4 w-4" />
      Upload Document
    </Button>
  </div>
);

const ChatMessageItem = ({ message }: { message: ChatMessage }) => (
  <div className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
    {message.role !== 'user' && (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
        <Bot size={20} />
      </div>
    )}
    <Card 
      className={`max-w-[85%] ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700'}`}>
      <CardContent className="p-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
        {message.citations && message.citations.length > 0 && (
          <div className="mt-4 border-t border-gray-600 pt-3">
            <p className="mb-1 text-xs text-gray-400">Sources:</p>
            <div className="space-x-2 text-xs text-gray-400">
              {message.citations.map((c, idx) => (
                <span key={c.docId}>[{idx + 1}] {c.filename}</span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    {message.role === 'user' && (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600">
        <User size={20} />
      </div>
    )}
  </div>
);

const LoadingIndicator = () => (
  <div className="flex items-start gap-4">
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
        <Bot size={20} />
    </div>
    <Card className="max-w-[85%] bg-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400"></div>
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400 delay-75"></div>
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400 delay-150"></div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const ErrorMessage = ({ error }: { error: Error }) => (
  <Card className="border-red-500/50 bg-red-900/20 text-red-300">
    <CardContent className="p-4">
        <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-red-400" />
            <div className="flex flex-col">
              <p className="font-bold">An Error Occurred</p>
              <p className="text-sm text-red-300/80">{error.message || "Something went wrong."}</p>
            </div>
        </div>
    </CardContent>
  </Card>
);

const ChatInput = ({ input, setInput, onSend, disabled }: any) => (
  <div className="bg-gray-800 p-4">
    <div className="relative">
        <Textarea
            placeholder="Ask anything about the tender..."
            className="min-h-[52px] resize-none rounded-lg bg-gray-700 pr-14 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && !disabled && (e.preventDefault(), onSend())}
            disabled={disabled}
        />
        <Button
            size="icon"
            className="absolute right-3 top-1/2 -translate-y-1/2"
            onClick={onSend}
            disabled={disabled || !input.trim()}
        >
            <Send size={20} />
        </Button>
    </div>
  </div>
);
