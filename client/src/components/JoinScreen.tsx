import { useState } from 'react';
import { AVATARS } from '../types';
import type { JoinData } from '../types';

interface JoinScreenProps {
  onJoin: (data: JoinData) => void;
  connected: boolean;
}

export function JoinScreen({ onJoin, connected }: JoinScreenProps) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onJoin({ name: name.trim(), avatar });
  };

  return (
    <div className="join-screen">
      <div className="join-card">
        <div className="join-header">
          <span className="join-icon">🏢</span>
          <h1>Virtual Office</h1>
          <p>Pick a name and avatar, then walk around and chat with your team.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="name">
            Your name
          </label>
          <input
            id="name"
            type="text"
            placeholder="e.g. Alex"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={24}
            autoFocus
          />

          <label className="field-label">Choose an avatar</label>
          <div className="avatar-grid">
            {AVATARS.map((a) => (
              <button
                key={a}
                type="button"
                className={`avatar-btn ${avatar === a ? 'selected' : ''}`}
                onClick={() => setAvatar(a)}
                aria-label={`Avatar ${a}`}
              >
                {a}
              </button>
            ))}
          </div>

          <button type="submit" className="join-btn" disabled={!name.trim() || !connected}>
            {connected ? 'Enter Office' : 'Connecting…'}
          </button>
        </form>

        <p className="join-hint">No sign-up required — just pick a name and go.</p>
      </div>
    </div>
  );
}
