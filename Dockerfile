# Card Score — web server + Telegram bot (both run in one container)
FROM node:20-alpine

WORKDIR /app

# Install deps first for better layer caching
COPY package.json ./
RUN npm install --omit=dev

COPY . .

# Run web server in background, bot in foreground (so container stays up)
CMD ["sh", "-c", "node server/index.js & node bot.js; wait"]
