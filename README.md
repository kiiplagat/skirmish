# Skirmish

2D jetpack deathmatch (Mini Militia style) with AI bots and online PvP rooms of up to 6 players. First to 10 kills wins.

## Run locally

```
npm install
npm start
```

Open http://localhost:3000. For PvP, open it in two tabs and use the same room code.

## Controls

- Move: A/D or Left/Right
- Jetpack: W, Up or Space
- Aim and shoot: mouse
- Reload: R
- Menu: Esc
- Touch: left stick moves and flies, right stick aims and fires

## Put it live (Render, free tier)

Vercel and Netlify cannot host this because PvP needs a long-running WebSocket server. Use Render, Railway or Fly.io.

1. Push this folder to a GitHub repository.
2. On https://render.com choose New > Web Service and connect the repository.
3. Runtime: Node. Build command: `npm install`. Start command: `npm start`.
4. Deploy. You get a URL like https://skirmish.onrender.com. Share it and give friends the same room code.

The free tier sleeps after about 15 minutes idle, so the first load can take up to a minute. Both the page and the WebSocket are served from the same URL, so no extra configuration is needed.

## Files

- `server.js` serves the page and relays messages between players in a room.
- `public/index.html` is the whole game (rendering, physics, AI, networking).
