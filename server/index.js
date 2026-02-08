/**
 * Express server: serves the Mini App static files and game API.
 * No auth; in-memory game state keyed by session (default single game).
 */

const path = require('path');
const express = require('express');
const game = require('./game');

const app = express();
const PORT = process.env.PORT || 3000;

// Static files (Mini App)
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());

// Session from header (Telegram Mini App can send init data; for now we use a simple header or default)
function getSessionId(req) {
  return req.headers['x-session-id'] || req.query.sessionId || 'default';
}

// --- Game API (web app calls these) ---

// Get current game state
app.get('/api/game', (req, res) => {
  const state = game.getState(getSessionId(req));
  res.json(state);
});

// Setup new game. Body: { numPlayers, bet, playerNames[] }
app.post('/api/game/setup', (req, res) => {
  const { numPlayers, bet, playerNames } = req.body || {};
  if (!numPlayers || !playerNames || !Array.isArray(playerNames)) {
    return res.status(400).json({ error: 'Need numPlayers and playerNames array' });
  }
  const state = game.setupGame({ numPlayers, bet: bet || 1, playerNames }, getSessionId(req));
  res.json(state);
});

// Record round winner. Body: { winnerPlayerId }
app.post('/api/game/round', (req, res) => {
  const { winnerPlayerId } = req.body || {};
  if (winnerPlayerId == null) return res.status(400).json({ error: 'Need winnerPlayerId' });
  const state = game.applyRound(Number(winnerPlayerId), getSessionId(req));
  res.json(state);
});

// Rotation: one player leaves, optional new joins. Body: { leavePlayerId?, newPlayerName? }
app.post('/api/game/rotate', (req, res) => {
  const { leavePlayerId, newPlayerName } = req.body || {};
  const state = game.rotatePlayers(leavePlayerId, newPlayerName, getSessionId(req));
  res.json(state);
});

// Back / restart: return to setup screen
app.post('/api/game/back', (req, res) => {
  const state = game.resetToSetup(getSessionId(req));
  res.json(state);
});

// Clear: reset all scores to 0, keep players
app.post('/api/game/clear', (req, res) => {
  const state = game.clearScores(getSessionId(req));
  res.json(state);
});

// Get movie character names for auto-assign. Query: ?count=4
app.get('/api/names', (req, res) => {
  const count = Math.min(parseInt(req.query.count, 10) || 4, 16);
  res.json(game.getMovieCharacterNames(count));
});

// SPA fallback: serve index.html for non-api GET routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
