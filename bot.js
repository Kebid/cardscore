/**
 * Telegram bot: only opens the web app.
 * No game logic; /start sends a button that opens the Mini App.
 */

require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = process.env.WEBAPP_URL || 'http://localhost:3000';

if (!token) {
  console.error('Missing TELEGRAM_BOT_TOKEN. Add it to .env (see .env.example).');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '💸 Card Score — tap the winner each round, no pen needed.', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Open Card Score',
            web_app: { url: webAppUrl }
          }
        ]
      ]
    }
  });
});

console.log('Bot running. WEBAPP_URL:', webAppUrl, '(edit .env to point to your server for Mini App)');
