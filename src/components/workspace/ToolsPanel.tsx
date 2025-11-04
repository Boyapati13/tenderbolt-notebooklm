import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Tool {
  id: string;
  name: string;
  icon: React.ReactNode;
  panel: React.ReactNode;
}

export default function ToolsPanel() {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);

  const tools: Tool[] = [
    {
      id: 'ai-assistant',
      name: 'AI Assistant',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
      ),
      panel: <AIAssistantPanel />,
    },
    {
      id: 'snippets',
      name: 'Code Snippets',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      ),
      panel: <SnippetsPanel />,
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      panel: <SettingsPanel />,
    },
  ];

  return (
    <div className="tools-panel">
      <div className="tools-panel__sidebar">
        {tools.map((tool) => (
          <button
            key={tool.id}
            className={`tools-panel__button ${
              activeToolId === tool.id ? 'tools-panel__button--active' : ''
            }`}
            onClick={() => setActiveToolId(activeToolId === tool.id ? null : tool.id)}
          >
            {tool.icon}
            <span className="tools-panel__button-text">{tool.name}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeToolId && (
          <motion.div
            key={activeToolId}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="tools-panel__content"
          >
            {tools.find((t) => t.id === activeToolId)?.panel}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AIAssistantPanel() {
  return (
    <div className="tool-panel">
      <div className="tool-panel__header">
        <h3 className="tool-panel__title">AI Assistant</h3>
      </div>
      <div className="tool-panel__content">
        <div className="chat-window">
          <div className="chat-window__messages">
            {/* Chat messages would go here */}
          </div>
          <div className="chat-window__input">
            <textarea
              placeholder="Ask anything..."
              className="form-input"
              rows={3}
            />
            <button className="button-premium button-premium--primary">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SnippetsPanel() {
  return (
    <div className="tool-panel">
      <div className="tool-panel__header">
        <h3 className="tool-panel__title">Code Snippets</h3>
      </div>
      <div className="tool-panel__content">
        <div className="snippets-list">
          {/* Snippets would go here */}
        </div>
      </div>
    </div>
  );
}

function SettingsPanel() {
  return (
    <div className="tool-panel">
      <div className="tool-panel__header">
        <h3 className="tool-panel__title">Settings</h3>
      </div>
      <div className="tool-panel__content">
        {/* Settings form would go here */}
      </div>
    </div>
  );
}