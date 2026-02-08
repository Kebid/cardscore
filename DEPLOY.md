# Deploy to Railway

## 1. Push code to GitHub

Make sure your repo is pushed (e.g. `github.com/Kebid/cardscore`).

## 2. Create a Railway project

1. Go to [railway.app](https://railway.app) and sign in (GitHub is easiest).
2. **New Project** → **Deploy from GitHub repo**.
3. Select the **cardscore** repository (or your fork).
4. Railway will detect the Dockerfile and start a build.

## 3. Set environment variables

In your Railway project:

1. Click your **service** (the one that was created from the repo).
2. Open the **Variables** tab.
3. Add:

   | Variable              | Value                                      |
   |-----------------------|--------------------------------------------|
   | `TELEGRAM_BOT_TOKEN`  | Your bot token from BotFather              |
   | `WEBAPP_URL`          | Your Railway public URL (see step 4)       |

You can set `WEBAPP_URL` after you generate a domain in step 4.

## 4. Get a public URL

1. In the same service, go to **Settings** → **Networking**.
2. Click **Generate domain**.
3. Copy the URL (e.g. `https://cardscore-production-xxxx.up.railway.app`).
4. Set **Variables** → `WEBAPP_URL` to this URL (so the Telegram button opens the right place).
5. Redeploy if you already deployed before setting `WEBAPP_URL` (Deploy → **Redeploy** or push a new commit).

## 5. Deploy

- **First time:** Railway deploys automatically when you connect the repo.
- **Later:** Push to `main` to trigger a new deploy, or use **Redeploy** in the dashboard.

## Notes

- The app runs **one container**: web server + Telegram bot together (see Dockerfile).
- Railway sets `PORT`; the server already uses `process.env.PORT`.
- If the app crashes, check **Deployments** → select a deployment → **View logs**.
