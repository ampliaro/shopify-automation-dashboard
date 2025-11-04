import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('❌ TELEGRAM_BOT_TOKEN não configurado no .env');
  process.exit(1);
}

console.log('🤖 Bot iniciado...');
console.log('📱 Envie qualquer mensagem para o bot no Telegram');
console.log('💡 Seu Chat ID será exibido aqui\n');

const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.username || msg.from.first_name || 'Usuário';
  
  console.log('✅ Mensagem recebida!');
  console.log(`👤 De: ${userName}`);
  console.log(`🆔 Chat ID: ${chatId}\n`);
  console.log(`💾 Adicione este ID no seu backend/.env:`);
  console.log(`   TELEGRAM_ADMIN_CHAT_IDS=${chatId}\n`);
  
  bot.sendMessage(chatId, 
    `✅ Olá, ${userName}!\n\n` +
    `Seu Chat ID é: \`${chatId}\`\n\n` +
    `Adicione no backend/.env:\n` +
    `\`\`\`\n` +
    `TELEGRAM_ADMIN_CHAT_IDS=${chatId}\n` +
    `\`\`\`\n\n` +
    `Depois reinicie o backend e use /start`,
    { parse_mode: 'Markdown' }
  );
});

console.log('⏳ Aguardando mensagens...');
console.log('   (Pressione Ctrl+C para sair)\n');

