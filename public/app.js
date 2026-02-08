/**
 * Frontend: all game UI and server communication.
 * Works inside Telegram Web App or in browser (same origin).
 */

(function () {
  const API_BASE = ''; // same origin

  let state = { phase: 'setup', players: [], config: null };

  const $ = (id) => document.getElementById(id);
  const setupScreen = $('setup-screen');
  const playScreen = $('play-screen');
  const namesContainer = $('names-container');
  const numPlayersInput = $('num-players');
  const betInput = $('bet');
  const btnManual = $('btn-manual');
  const btnAuto = $('btn-auto');
  const btnStart = $('btn-start');
  const playerCardsEl = $('player-cards');
  const scoreboardEl = $('scoreboard');
  const currentBetEl = $('current-bet');
  const btnRotate = $('btn-rotate');
  const btnClear = $('btn-clear');
  const btnBack = $('btn-back');
  const rotateModal = $('rotate-modal');
  const rotateLeave = $('rotate-leave');
  const rotateJoin = $('rotate-join');
  const btnRotateCancel = $('btn-rotate-cancel');
  const btnRotateApply = $('btn-rotate-apply');

  // Optional: Telegram Web App ready (expand viewport, theme)
  if (typeof window.Telegram !== 'undefined' && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation();
  }

  function api(path, options = {}) {
    const url = API_BASE + path;
    return fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...(options.body && typeof options.body === 'object' && !(options.body instanceof FormData)
        ? { body: JSON.stringify(options.body) }
        : {})
    }).then(r => {
      if (!r.ok) throw new Error(r.statusText);
      return r.json();
    });
  }

  function loadState() {
    return api('/api/game').then(s => {
      state = s;
      return s;
    });
  }

  function render() {
    if (state.phase === 'setup') {
      setupScreen.classList.remove('hidden');
      playScreen.classList.add('hidden');
      renderSetup();
    } else {
      setupScreen.classList.add('hidden');
      playScreen.classList.remove('hidden');
      renderPlay();
    }
  }

  function renderSetup() {
    const num = Math.max(2, parseInt(numPlayersInput.value, 10) || 4);
    numPlayersInput.value = num;
    const isManual = btnManual.classList.contains('active');
    namesContainer.innerHTML = '';
    if (isManual) {
      for (let i = 0; i < num; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Player ${i + 1}`;
        input.dataset.index = i;
        namesContainer.appendChild(input);
      }
    } else {
      // Placeholder: will be filled when we fetch names on Start or we can fetch now
      for (let i = 0; i < num; i++) {
        const div = document.createElement('div');
        div.className = 'name-placeholder';
        div.textContent = `…`;
        div.dataset.index = i;
        namesContainer.appendChild(div);
      }
    }
  }

  function getPlayerNamesForSetup() {
    const num = Math.max(2, parseInt(numPlayersInput.value, 10) || 4);
    const isManual = btnManual.classList.contains('active');
    if (isManual) {
      const inputs = namesContainer.querySelectorAll('input');
      return Array.from(inputs).slice(0, num).map(i => i.value.trim() || `Player ${i.dataset.index + 1}`);
    }
    return null; // will use API names
  }

  function renderPlay() {
    currentBetEl.textContent = state.config ? state.config.bet : 1;
    const active = state.players.filter(p => p.active);
    // Large tappable cards: only active players can be tapped as winner
    playerCardsEl.innerHTML = active.map(p => {
      const streak = (p.consecutiveWins || 0) >= 2;
      const scoreClass = p.score < 0 ? 'negative' : '';
      return `
        <div class="player-card active" data-player-id="${p.id}" role="button" tabindex="0">
          <span class="name">${escapeHtml(p.name)} ${streak ? '<span class="streak-badge streak-fire">🔥</span>' : ''}</span>
          <span class="score ${scoreClass}">${p.score}</span>
        </div>`;
    }).join('');

    state.players.filter(p => !p.active).forEach(p => {
      const div = document.createElement('div');
      div.className = 'player-card inactive';
      div.innerHTML = `<span class="name">${escapeHtml(p.name)}</span><span class="score">${p.score}</span>`;
      playerCardsEl.appendChild(div);
    });

    // Scoreboard: sorted by score descending
    const sorted = [...state.players].sort((a, b) => b.score - a.score);
    scoreboardEl.innerHTML = sorted.map((p, i) => {
      const rank = i + 1;
      const medal = rank === 1 ? '👑' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
      const streak = (p.consecutiveWins || 0) >= 2 ? ' 🔥' : '';
      return `
        <li>
          <span class="rank">${medal || rank}</span>
          <span>${escapeHtml(p.name)}${streak}</span>
          <span class="score-value">${p.score}</span>
        </li>`;
    }).join('');

    playerCardsEl.querySelectorAll('.player-card.active').forEach(card => {
      card.addEventListener('click', onPlayerCardClick);
    });
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function onPlayerCardClick(e) {
    const card = e.currentTarget;
    const id = parseInt(card.dataset.playerId, 10);
    api('/api/game/round', { method: 'POST', body: { winnerPlayerId: id } })
      .then(s => {
        state = s;
        render();
      })
      .catch(err => alert('Error: ' + err.message));
  }

  function openRotateModal() {
    rotateLeave.innerHTML = '<option value="">— Select —</option>';
    state.players.filter(p => p.active).forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      rotateLeave.appendChild(opt);
    });
    rotateJoin.value = '';
    rotateModal.classList.remove('hidden');
  }

  function applyRotate() {
    const leaveId = rotateLeave.value === '' ? undefined : parseInt(rotateLeave.value, 10);
    const newName = rotateJoin.value.trim() || undefined;
    api('/api/game/rotate', { method: 'POST', body: { leavePlayerId: leaveId, newPlayerName: newName } })
      .then(s => {
        state = s;
        rotateModal.classList.add('hidden');
        render();
      })
      .catch(err => alert('Error: ' + err.message));
  }

  // Event bindings
  numPlayersInput.addEventListener('change', () => renderSetup());
  numPlayersInput.addEventListener('input', () => {
    const v = parseInt(numPlayersInput.value, 10);
    if (v >= 2 && v <= 16) renderSetup();
  });

  btnManual.addEventListener('click', () => {
    btnManual.classList.add('active');
    btnAuto.classList.remove('active');
    renderSetup();
  });
  btnAuto.addEventListener('click', () => {
    btnAuto.classList.add('active');
    btnManual.classList.remove('active');
    renderSetup();
  });

  btnStart.addEventListener('click', () => {
    const num = Math.max(2, parseInt(numPlayersInput.value, 10) || 4);
    const bet = Math.max(1, parseInt(betInput.value, 10) || 1);
    const isManual = btnManual.classList.contains('active');
    let names;
    if (isManual) {
      const inputs = namesContainer.querySelectorAll('input');
      names = Array.from(inputs).slice(0, num).map((inp, i) => inp.value.trim() || `Player ${i + 1}`);
    } else {
      // Fetch movie character names from server
      names = [];
      api('/api/names?count=' + num)
        .then(arr => {
          names = arr;
          return api('/api/game/setup', {
            method: 'POST',
            body: { numPlayers: num, bet, playerNames: names }
          });
        })
        .then(s => {
          state = s;
          render();
        })
        .catch(err => alert('Error: ' + err.message));
      return;
    }
    api('/api/game/setup', { method: 'POST', body: { numPlayers: num, bet, playerNames: names } })
      .then(s => {
        state = s;
        render();
      })
      .catch(err => alert('Error: ' + err.message));
  });

  btnRotate.addEventListener('click', openRotateModal);
  btnRotateCancel.addEventListener('click', () => rotateModal.classList.add('hidden'));
  btnRotateApply.addEventListener('click', applyRotate);

  btnClear.addEventListener('click', () => {
    if (!confirm('Reset all scores to 0? Players stay.')) return;
    api('/api/game/clear', { method: 'POST' })
      .then(s => { state = s; render(); })
      .catch(err => alert('Error: ' + err.message));
  });

  btnBack.addEventListener('click', () => {
    if (!confirm('Go back to setup? This will start a new game.')) return;
    api('/api/game/back', { method: 'POST' })
      .then(s => { state = s; render(); })
      .catch(err => alert('Error: ' + err.message));
  });

  // Load initial state and show UI
  loadState().then(render).catch(() => render());
})();
