import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Player, ChatMessage } from '../types';

const SOCKET_URL = import.meta.env.DEV ? 'http://localhost:3001' : undefined;

interface InitPayload {
  playerId: string;
  players: Record<string, Player>;
  chatHistory: ChatMessage[];
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('init', (data: InitPayload) => {
      setPlayerId(data.playerId);
      setPlayers(data.players);
      setChatMessages(data.chatHistory);
      setJoined(true);
    });

    socket.on('playerJoined', (player: Player) => {
      setPlayers((prev) => ({ ...prev, [player.id]: player }));
    });

    socket.on('playerLeft', (id: string) => {
      setPlayers((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    });

    socket.on('playerMoved', ({ id, x, z, rotation }: { id: string; x: number; z: number; rotation: number }) => {
      setPlayers((prev) => {
        const p = prev[id];
        if (!p) return prev;
        return { ...prev, [id]: { ...p, x, z, rotation } };
      });
    });

    socket.on('presenceUpdated', ({ id, inOfficeToday, inOfficeTomorrow }: { id: string; inOfficeToday: boolean; inOfficeTomorrow: boolean }) => {
      setPlayers((prev) => {
        const p = prev[id];
        if (!p) return prev;
        return { ...prev, [id]: { ...p, inOfficeToday, inOfficeTomorrow } };
      });
    });

    socket.on('chatMessage', (msg: ChatMessage) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const join = useCallback((name: string, avatar: string) => {
    socketRef.current?.emit('join', { name, avatar });
  }, []);

  const move = useCallback((x: number, z: number, rotation: number) => {
    socketRef.current?.emit('move', { x, z, rotation });
    if (playerId) {
      setPlayers((prev) => {
        const p = prev[playerId];
        if (!p) return prev;
        return { ...prev, [playerId]: { ...p, x, z, rotation } };
      });
    }
  }, [playerId]);

  const setPresence = useCallback((inOfficeToday: boolean, inOfficeTomorrow: boolean) => {
    socketRef.current?.emit('presence', { inOfficeToday, inOfficeTomorrow });
    if (playerId) {
      setPlayers((prev) => {
        const p = prev[playerId];
        if (!p) return prev;
        return { ...prev, [playerId]: { ...p, inOfficeToday, inOfficeTomorrow } };
      });
    }
  }, [playerId]);

  const sendChat = useCallback((message: string) => {
    socketRef.current?.emit('chat', { message });
  }, []);

  return {
    connected,
    joined,
    playerId,
    players,
    chatMessages,
    join,
    move,
    setPresence,
    sendChat,
  };
}
