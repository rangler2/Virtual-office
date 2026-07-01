import { useState } from 'react';
import type { Player, ViewMode } from '../types';
import { ChatPanel } from './ChatPanel';
import { PresenceToggles } from './PresenceToggles';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface GameUIProps {
  players: Record<string, Player>;
  playerId: string | null;
  chatMessages: import('../types').ChatMessage[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSendChat: (message: string) => void;
  onPresenceChange: (today: boolean, tomorrow: boolean) => void;
}

export function GameUI({
  players,
  playerId,
  chatMessages,
  viewMode,
  onViewModeChange,
  onSendChat,
  onPresenceChange,
}: GameUIProps) {
  const isDesktop = useMediaQuery('(min-width: 769px)');
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);

  const me = playerId ? players[playerId] : null;
  const colleagues = [
    ...(me ? [me] : []),
    ...Object.values(players).filter((p) => p.id !== playerId),
  ];

  return (
    <div className="game-ui">
      <header className="top-bar">
        <div className="top-bar-left">
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? '◀' : '☰'}
          </button>
          <span className="logo">🏢 Virtual Office</span>
          {me && (
            <span className="player-badge">
              {me.avatar} {me.name}
            </span>
          )}
        </div>
        <div className="top-bar-center">
          <div className="view-toggle">
            <button
              className={viewMode === 'isometric' ? 'active' : ''}
              onClick={() => onViewModeChange('isometric')}
            >
              🗺️ Isometric
            </button>
            <button
              className={viewMode === 'firstPerson' ? 'active' : ''}
              onClick={() => onViewModeChange('firstPerson')}
            >
              👁️ First Person
            </button>
          </div>
        </div>
        <div className="top-bar-right">
          <span className="online-count">{Object.keys(players).length} online</span>
        </div>
      </header>

      {!isDesktop && sidebarOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <PresenceToggles
          inOfficeToday={me?.inOfficeToday ?? false}
          inOfficeTomorrow={me?.inOfficeTomorrow ?? false}
          onChange={onPresenceChange}
        />

        <div className="colleagues-panel">
          <h3>Colleagues ({colleagues.length})</h3>
          <ul className="colleague-list">
            {colleagues.length === 0 && (
              <li className="colleague-empty">No one here yet</li>
            )}
            {colleagues.map((p) => (
              <li
                key={p.id}
                className={`colleague-item ${p.id === playerId ? 'colleague-item-you' : ''}`}
              >
                <span className="colleague-avatar">{p.avatar}</span>
                <div className="colleague-info">
                  <span className="colleague-name">
                    {p.name}
                    {p.id === playerId && <span className="colleague-you-tag"> (you)</span>}
                  </span>
                  <div className="colleague-badges">
                    {p.inOfficeToday && (
                      <span className="badge badge-today" title="In office today">
                        Today
                      </span>
                    )}
                    {p.inOfficeTomorrow && (
                      <span className="badge badge-tomorrow" title="In office tomorrow">
                        Tmrw
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="controls-hint">
          <h4>Controls</h4>
          <p className="controls-desktop">WASD or arrow keys to move</p>
          <p className="controls-mobile">
            Tap to walk · Drag to pan (map) or look (1st person)
          </p>
        </div>
      </aside>

      <ChatPanel messages={chatMessages} onSend={onSendChat} playerId={playerId} />
    </div>
  );
}
