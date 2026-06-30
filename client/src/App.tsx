import { useState, useCallback } from 'react';
import { JoinScreen } from './components/JoinScreen';
import { GameUI } from './components/GameUI';
import { OfficeScene } from './scenes/OfficeScene';
import { useSocket } from './hooks/useSocket';
import type { ViewMode, JoinData } from './types';

export default function App() {
  const {
    connected,
    joined,
    playerId,
    players,
    chatMessages,
    join,
    move,
    setPresence,
    sendChat,
  } = useSocket();

  const [viewMode, setViewMode] = useState<ViewMode>('isometric');

  const handleJoin = useCallback(
    (data: JoinData) => join(data.name, data.avatar),
    [join],
  );

  const handlePresenceChange = useCallback(
    (today: boolean, tomorrow: boolean) => setPresence(today, tomorrow),
    [setPresence],
  );

  if (!joined) {
    return <JoinScreen onJoin={handleJoin} connected={connected} />;
  }

  return (
    <div className="app">
      <OfficeScene
        players={players}
        playerId={playerId}
        viewMode={viewMode}
        onMove={move}
      />
      <GameUI
        players={players}
        playerId={playerId}
        chatMessages={chatMessages}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onSendChat={sendChat}
        onPresenceChange={handlePresenceChange}
      />
    </div>
  );
}
