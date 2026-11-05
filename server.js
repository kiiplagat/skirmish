const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const server = http.createServer((req, res) => {
  if (req.url === '/health') { res.end('ok'); return; }
  fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, data) => {
    if (err) { res.writeHead(500); res.end('Server error'); return; }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
});

const wss = new WebSocketServer({ server, maxPayload: 2048 });
const rooms = new Map();
let nextId = 1;

function broadcast(from, msg) {
  if (!from.room) return;
  const s = JSON.stringify(msg);
  for (const p of from.room) {
    if (p !== from && p.readyState === 1) p.send(s);
  }
}

wss.on('connection', (ws) => {
  ws.id = nextId++;
  ws.room = null;
  ws.code = null;
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  ws.on('message', (raw) => {
    let m;
    try { m = JSON.parse(raw); } catch { return; }
    if (!m || typeof m.t !== 'string') return;

    if (m.t === 'join') {
      if (ws.room) return;
      const code = (String(m.room || '').slice(0, 12).toUpperCase()) || 'MAIN';
      let room = rooms.get(code);
      if (!room) { room = new Set(); rooms.set(code, room); }
      if (room.size >= 6) { ws.send(JSON.stringify({ t: 'full' })); return; }
      ws.name = String(m.name || 'Player').slice(0, 12);
      ws.code = code;
      ws.send(JSON.stringify({
        t: 'welcome',
        id: ws.id,
        peers: [...room].map((p) => ({ id: p.id, name: p.name })),
      }));
      room.add(ws);
      ws.room = room;
      broadcast(ws, { t: 'join', id: ws.id, name: ws.name });
    } else if (ws.room) {
      m.id = ws.id;
      broadcast(ws, m);
    }
  });

  ws.on('close', () => {
    if (!ws.room) return;
    ws.room.delete(ws);
    broadcast(ws, { t: 'leave', id: ws.id });
    if (ws.room.size === 0) rooms.delete(ws.code);
  });
});

// Drop dead connections (also keeps free hosts from idling the socket)
setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) { ws.terminate(); continue; }
    ws.isAlive = false;
    ws.ping();
  }
}, 30000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Skirmish running on port ' + PORT));
