# Virtual Office

A real-time multiplayer virtual office where colleagues can walk around, chat, and see who's planning to be in the physical office today or tomorrow.

## Features

- **No login required** — pick a name and avatar and join instantly
- **Top-down isometric view** (default) with **first-person 3D** toggle
- **Real-time movement** — see colleagues move around the office
- **Public chat** — message everyone in the office
- **Office presence toggles** — let others know if you'll be in the actual office today or tomorrow
- **Configurable layout** — edit `client/src/config/officeLayout.ts` to match your floor plan

## Quick Start

```bash
npm install
npm run dev
```

This starts:
- **Client** at http://localhost:5173
- **Server** at http://localhost:3001

Open the client URL in multiple browser tabs to test multiplayer.

## Production

```bash
npm run build
npm start
```

The server serves the built client and handles WebSocket connections on port 3001.

## Customizing Your Office Layout

Edit `client/src/config/officeLayout.ts` to match your real office plan:

- `width` / `depth` — overall floor dimensions (meters)
- `walls` — outer boundary walls
- `partitions` — interior walls (leave gaps for doorways)
- `rooms` — named zones with floor colors
- `desks` — workstation positions
- `spawn` — where new players appear

Share your floor plan and the layout can be mapped to match it precisely.

## Controls

| Key | Action |
|-----|--------|
| W / ↑ | Move forward |
| S / ↓ | Move backward |
| A / ← | Move left |
| D / → | Move right |

## Tech Stack

- **Frontend:** React, Three.js (@react-three/fiber), Vite
- **Backend:** Node.js, Express, Socket.io
