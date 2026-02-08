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

## Deploy to Railway

1. Push your code to GitHub (e.g. [Kebid/cardscore](https://github.com/Kebid/cardscore)).

2. Go to [railway.app](https://railway.app), sign in, and **New Project** → **Deploy from GitHub repo** → select `cardscore`.

3. In the project, open your service → **Variables** and add:
   - `TELEGRAM_BOT_TOKEN` = your bot token
   - `WEBAPP_URL` = your app URL (Railway will give you a URL like `https://cardscore-production-xxxx.up.railway.app` — set this after the first deploy, then redeploy if needed)

4. Railway will build from the **Dockerfile** and run the app. The web server uses `PORT` automatically.

5. Under **Settings** → **Networking** → **Generate domain** to get a public URL. Use that URL as `WEBAPP_URL` and in Telegram for the Mini App.

## Game rules

- Setup: number of players, bet per round, names (manual or movie characters).
- Each round: tap the winner. Winner gains `bet × (active players − 1)`; each loser loses `bet`.
- Win streak: 3 wins in a row → that round’s winner gain × 3.
- Player in/out: one player can leave and an optional new one join; scores persist.
