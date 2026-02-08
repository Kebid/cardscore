# Card Score — Telegram Mini App

Real-life card game score tracker. Bot opens the web app; all logic and UI run in the app.

## Run

```bash
npm install
node server/index.js
```

In another terminal (optional, for Telegram):

```bash
# Set in env or edit bot.js:
# TELEGRAM_BOT_TOKEN=your_bot_token
# WEBAPP_URL=https://your-server.com  (or https://your-ngrok-url for local test)
node bot.js
```

- **Server:** http://localhost:3000 (serve the app and API).
- **Bot:** `/start` → button opens the web app URL (set `WEBAPP_URL` to your deployed or tunnelled URL).

## Game rules

- Setup: number of players, bet per round, names (manual or movie characters).
- Each round: tap the winner. Winner gains `bet × (active players − 1)`; each loser loses `bet`.
- Win streak: 3 wins in a row → that round’s winner gain × 3.
- Player in/out: one player can leave and an optional new one join; scores persist.
