"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Send } from "lucide-react";

type ChatMessage = { role: "user" | "assistant"; content: string; citations?: Array<{ docId: string; filename: string }> };

export function ChatPanel({ tenderId }: { tenderId?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function send() {
    const content = input.trim();
    if (!content || loading) return;
    
    setInput("");
    setLoading(true);
    const newMessages = [...messages, { role: "user" as const, content }];
    setMessages(newMessages);
    
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: newMessages,
          tenderId: tenderId || "default"
        }),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setMessages((m) => [...m, { 
        role: "assistant", 
        content: data.reply ?? "Sorry, I couldn't process your request.", 
        citations: data.citations 
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((m) => [...m, { 
        role: "assistant", 
        content: "Sorry, there was an error processing your request. Please try again." 
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div ref={scrollRef} className="flex-1 overflow-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
                <ArrowUp size={32} className="text-muted-foreground" />
              </div>
              <div className="text-lg font-medium text-heading text-foreground mb-2">Add a source to get started</div>
              <button
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => {
                  // Trigger file input in sources panel
                  const event = new Event('triggerUpload');
                  window.dispatchEvent(event);
                }}
              >
                Upload a source
              </button>
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] rounded-xl p-4 ${
                m.role === "user" 
                  ? "bg-blue-600 text-white" 
                  : "bg-muted border"
              }`}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</div>
                {m.citations && m.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="text-xs text-muted-foreground mb-1">Sources:</div>
                    <div className="text-xs text-muted-foreground">
                      {m.citations.map((c, idx) => (
                        <span key={c.docId} className="mr-2">[{idx + 1}] {c.filename}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Input Area */}
      <div className="border-t bg-background p-4">
        <div className="flex items-center space-x-3">
          <input
            className="flex-1 px-4 py-3 input"
            placeholder="Upload a source to get started"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            suppressHydrationWarning
          />
          <div className="text-sm text-gray-500">0 sources</div>
          <button 
            className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
            onClick={send}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}


