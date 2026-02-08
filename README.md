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

## Deploy to Fly.io

1. Install [flyctl](https://fly.io/docs/hands-on/install-flyctl/) and log in: `fly auth login`.

2. From the project directory:
   ```bash
   fly launch --no-deploy
   ```
   Use the app name `cardscore` (or pick one); don’t add a Postgres or Redis.

3. Set secrets (replace with your values):
   ```bash
   fly secrets set TELEGRAM_BOT_TOKEN=your_bot_token
   fly secrets set WEBAPP_URL=https://cardscore.fly.dev
   ```
   Use your actual Fly app URL if the name is different (e.g. `https://your-app-name.fly.dev`).

4. Deploy:
   ```bash
   fly deploy
   ```

5. Open the app: `https://cardscore.fly.dev` (or your app URL). In Telegram, set the bot’s Mini App URL to this in BotFather if needed.

## Game rules

- Setup: number of players, bet per round, names (manual or movie characters).
- Each round: tap the winner. Winner gains `bet × (active players − 1)`; each loser loses `bet`.
- Win streak: 3 wins in a row → that round’s winner gain × 3.
- Player in/out: one player can leave and an optional new one join; scores persist.
