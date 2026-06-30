import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (message: string) => void;
  playerId: string | null;
}

export function ChatPanel({ messages, onSend, playerId }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input.trim());
      setInput('');
    }
  };

  if (collapsed) {
    return (
      <button className="chat-toggle collapsed" onClick={() => setCollapsed(false)}>
        💬 Chat {messages.length > 0 && `(${messages.length})`}
      </button>
    );
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <span>Public Chat</span>
        <button className="icon-btn" onClick={() => setCollapsed(true)} aria-label="Collapse chat">
          −
        </button>
      </div>
      <div className="chat-messages" ref={listRef}>
        {messages.length === 0 && (
          <p className="chat-empty">Say hello to your colleagues!</p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message ${msg.playerId === playerId ? 'own' : ''}`}
          >
            <span className="chat-avatar">{msg.avatar}</span>
            <div className="chat-body">
              <span className="chat-name">{msg.playerName}</span>
              <span className="chat-text">{msg.message}</span>
            </div>
          </div>
        ))}
      </div>
      <form className="chat-input-row" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={500}
        />
        <button type="submit" disabled={!input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
