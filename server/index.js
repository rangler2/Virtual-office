import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

/** @type {Map<string, import('./types.js').Player>} */
const players = new Map();

/** @type {import('./types.js').ChatMessage[]} */
const chatHistory = [];
const MAX_CHAT_HISTORY = 100;

const SPAWN = { x: 12, y: 0, z: 8 };

io.on('connection', (socket) => {
  socket.on('join', ({ name, avatar }) => {
    if (!name?.trim()) return;

    const player = {
      id: socket.id,
      name: name.trim().slice(0, 24),
      avatar: avatar || '🧑‍💻',
      x: SPAWN.x,
      y: SPAWN.y,
      z: SPAWN.z,
      rotation: 0,
      inOfficeToday: false,
      inOfficeTomorrow: false,
    };

    players.set(socket.id, player);
    socket.emit('init', {
      playerId: socket.id,
      players: Object.fromEntries(players),
      chatHistory,
    });
    socket.broadcast.emit('playerJoined', player);
  });

  socket.on('move', ({ x, z, rotation }) => {
    const player = players.get(socket.id);
    if (!player) return;

    player.x = x;
    player.z = z;
    player.rotation = rotation;
    socket.broadcast.emit('playerMoved', {
      id: socket.id,
      x,
      z,
      rotation,
    });
  });

  socket.on('presence', ({ inOfficeToday, inOfficeTomorrow }) => {
    const player = players.get(socket.id);
    if (!player) return;

    if (typeof inOfficeToday === 'boolean') player.inOfficeToday = inOfficeToday;
    if (typeof inOfficeTomorrow === 'boolean') player.inOfficeTomorrow = inOfficeTomorrow;

    io.emit('presenceUpdated', {
      id: socket.id,
      inOfficeToday: player.inOfficeToday,
      inOfficeTomorrow: player.inOfficeTomorrow,
    });
  });

  socket.on('chat', ({ message }) => {
    const player = players.get(socket.id);
    if (!player || !message?.trim()) return;

    const chatMessage = {
      id: `${socket.id}-${Date.now()}`,
      playerId: socket.id,
      playerName: player.name,
      avatar: player.avatar,
      message: message.trim().slice(0, 500),
      timestamp: Date.now(),
    };

    chatHistory.push(chatMessage);
    if (chatHistory.length > MAX_CHAT_HISTORY) chatHistory.shift();
    io.emit('chatMessage', chatMessage);
  });

  socket.on('disconnect', () => {
    players.delete(socket.id);
    io.emit('playerLeft', socket.id);
  });
});

const clientDist = path.join(__dirname, '../client/dist');
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

httpServer.listen(PORT, () => {
  console.log(`Virtual office server running on port ${PORT}`);
});
