/**
 * Game rules and in-memory state.
 * Pure logic: score calculation, streak detection, player rotation.
 */

// In-memory game state (keyed by session id for future multi-session; for now single game)
const games = new Map();
const DEFAULT_SESSION = 'default';

// Famous movie characters for auto-assign (10)
const MOVIE_CHARACTERS = [
  'Batman 🦇',
  'Joker 🤡',
  'Iron Man 🤖',
  'Spider-Man 🕷️',
  'Darth Vader 🌌',
  'James Bond 🎩',
  'Gandalf 🧙‍♂️',
  'Neo 🕶️',
  'Jack Sparrow ☠️',
  'Rocky 🥊'
];

/**
 * Get or create game state for a session.
 */
function getState(sessionId = DEFAULT_SESSION) {
  if (!games.has(sessionId)) {
    games.set(sessionId, {
      phase: 'setup',       // 'setup' | 'playing'
      config: null,         // { numPlayers, bet, playerNames }
      players: [],          // { id, name, score, active, consecutiveWins }
      roundHistory: [],     // last round winner id for streak
      nextPlayerId: 0
    });
  }
  return games.get(sessionId);
}

/**
 * Setup a new game.
 * @param {Object} opts - { numPlayers, bet, playerNames[] }
 */
function setupGame(opts, sessionId = DEFAULT_SESSION) {
  const state = getState(sessionId);
  const names = opts.playerNames.slice(0, opts.numPlayers);
  state.config = {
    numPlayers: opts.numPlayers,
    bet: Number(opts.bet) || 1
  };
  state.players = names.map((name, i) => ({
    id: i,
    name: name.trim() || `Player ${i + 1}`,
    score: 0,
    active: true,
    consecutiveWins: 0
  }));
  state.phase = 'playing';
  state.roundHistory = [];
  state.nextPlayerId = opts.numPlayers;
  return state;
}

/**
 * Get number of active players (for this round's gain/loss calculation).
 */
function activeCount(players) {
  return players.filter(p => p.active).length;
}

/**
 * Apply one round: winner wins, others lose. Respects 3-win streak multiplier.
 * Returns updated state (we mutate in place and return for convenience).
 */
function applyRound(winnerPlayerId, sessionId = DEFAULT_SESSION) {
  const state = getState(sessionId);
  if (state.phase !== 'playing' || !state.players.length) return state;

  const winner = state.players.find(p => p.id === winnerPlayerId);
  if (!winner || !winner.active) return state;

  const active = activeCount(state.players);
  const bet = state.config.bet;

  // Winner gain: bet × (active - 1). If 3+ consecutive wins, multiply by 3.
  const isStreakRound = winner.consecutiveWins >= 2; // this round will be 3rd
  const baseGain = bet * (active - 1);
  const gainMultiplier = isStreakRound ? 3 : 1;
  const winnerGain = baseGain * gainMultiplier;

  winner.score += winnerGain;
  winner.consecutiveWins = (winner.consecutiveWins || 0) + 1;

  // Losers lose bet each
  state.players.forEach(p => {
    if (p.active && p.id !== winnerPlayerId) {
      p.score -= bet;
      p.consecutiveWins = 0;
    }
  });

  state.roundHistory.push(winnerPlayerId);
  return state;
}

/**
 * Player rotation: set one player inactive (leave) and optionally add a new player (join).
 * Scores persist for inactive players.
 */
function rotatePlayers(leavePlayerId, newPlayerName, sessionId = DEFAULT_SESSION) {
  const state = getState(sessionId);
  if (leavePlayerId != null) {
    const p = state.players.find(x => x.id === leavePlayerId);
    if (p) p.active = false;
  }
  if (newPlayerName != null && newPlayerName.trim()) {
    state.players.push({
      id: state.nextPlayerId++,
      name: newPlayerName.trim(),
      score: 0,
      active: true,
      consecutiveWins: 0
    });
  }
  return state;
}

/**
 * Get player names for auto-assign (movie characters).
 * If count > 10, repeats random picks so every player gets a name.
 */
function getMovieCharacterNames(count) {
  const shuffled = [...MOVIE_CHARACTERS].sort(() => Math.random() - 0.5);
  const result = shuffled.slice(0, Math.min(count, shuffled.length));
  while (result.length < count) {
    result.push(shuffled[Math.floor(Math.random() * shuffled.length)]);
  }
  return result;
}

/**
 * Go back to setup (clear game so user can reconfigure).
 */
function resetToSetup(sessionId = DEFAULT_SESSION) {
  const state = getState(sessionId);
  state.phase = 'setup';
  state.config = null;
  state.players = [];
  state.roundHistory = [];
  state.nextPlayerId = 0;
  return state;
}

/**
 * Clear all scores to 0, keep players and config. Resets win streaks.
 */
function clearScores(sessionId = DEFAULT_SESSION) {
  const state = getState(sessionId);
  if (state.phase !== 'playing') return state;
  state.players.forEach(p => {
    p.score = 0;
    p.consecutiveWins = 0;
  });
  state.roundHistory = [];
  return state;
}

module.exports = {
  getState,
  setupGame,
  applyRound,
  rotatePlayers,
  getMovieCharacterNames,
  resetToSetup,
  clearScores,
  MOVIE_CHARACTERS
};
