# AGENTS.md

## Cursor Cloud specific instructions

### Overview
Virtual Office is a single product built as an npm-workspaces monorepo with two required services:

- `server/` — Express + Socket.io backend (in-memory state, no database). Serves on port `3001` (`PORT` override).
- `client/` — React + Three.js (`@react-three/fiber`) frontend built with Vite. Dev server on port `5173`.

There is no database, cache, queue, or auth provider. No `.env` is required (`PORT` is the only referenced var, defaults to `3001`).

### Running (dev)
- `npm run dev` (from repo root) starts both services concurrently via `concurrently`. Open http://localhost:5173.
- Run individually with `npm run dev:server` / `npm run dev:client`.
- The Vite dev server proxies `/socket.io` to `localhost:3001`, and the client hard-codes `SOCKET_URL=http://localhost:3001` in dev (`client/src/hooks/useSocket.ts`). Both services must be running for realtime multiplayer to work.

### Lint / test / build
- There is no separate linter and no automated test suite in this repo.
- Type-check + build: `npm run build` runs `tsc --noEmit && vite build` for the client (use this as the type-check gate). The server is plain Node ESM with no build step.

### Notes / gotchas
- Production (`npm run build` then `npm start`) serves the built client from the server on port `3001` only — the client is NOT a separate service in prod, unlike dev.
- Server state (players + last 100 chat messages) lives in memory and resets on restart.
