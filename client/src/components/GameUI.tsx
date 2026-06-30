import type { Player, ViewMode } from '../types';
import { ChatPanel } from './ChatPanel';
import { PresenceToggles } from './PresenceToggles';

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
  const me = playerId ? players[playerId] : null;
  const others = Object.values(players).filter((p) => p.id !== playerId);

  return (
    <div className="game-ui">
      <header className="top-bar">
        <div className="top-bar-left">
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

      <aside className="sidebar">
        <PresenceToggles
          inOfficeToday={me?.inOfficeToday ?? false}
          inOfficeTomorrow={me?.inOfficeTomorrow ?? false}
          onChange={onPresenceChange}
        />

        <div className="colleagues-panel">
          <h3>Colleagues ({others.length})</h3>
          <ul className="colleague-list">
            {others.length === 0 && (
              <li className="colleague-empty">You're the first one here!</li>
            )}
            {others.map((p) => (
              <li key={p.id} className="colleague-item">
                <span className="colleague-avatar">{p.avatar}</span>
                <div className="colleague-info">
                  <span className="colleague-name">{p.name}</span>
                  <div className="colleague-badges">
                    {p.inOfficeToday && (
                      <span className="badge badge-today" title="In office today">
                        📍 Today
                      </span>
                    )}
                    {p.inOfficeTomorrow && (
                      <span className="badge badge-tomorrow" title="In office tomorrow">
                        📅 Tomorrow
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
          <p>WASD or arrow keys to move</p>
        </div>
      </aside>

      <ChatPanel messages={chatMessages} onSend={onSendChat} playerId={playerId} />
    </div>
  );
}
