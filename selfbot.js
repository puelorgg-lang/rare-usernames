const fetch = require('node-fetch');

// ==================== CONFIGURAÇÃO ====================
// URL do seu site (altere para a URL real quando for publicar)
const SITE_URL = 'http://localhost:3000'; // Use seu IP/domínio público quando上线

// Mapa de canais do Discord para categorias do site
const CHANNEL_CATEGORY_MAP = {
  '1420065854401413231': 'CHARS_4',   // 4char
  '1420065865029652652': 'CHARS_3',   // 3chars
  '1420065875880316968': 'CHARS_2',   // 2chars
  '1420065886928244756': 'PT_BR',     // pt-br
  '1420065898370175038': 'EN_US',     // en-us
  '1420065909611036863': 'RANDOM',    // random
};

// ==================== SEU CÓDIGO DO DISCORD ====================
// Substitua esta parte pelo seu código existente do selfbot
// Este é um exemplo usando discord.js

const { Client, GatewayIntentBits, Events } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Quando uma mensagem for recebida
client.on(Events.MessageCreate, async (message) => {
  // Ignorar mensagens de bots
  if (message.author.bot) return;
  
  // Ignorar mensagens em canais que não mapeamos
  const channelId = message.channelId;
  const category = CHANNEL_CATEGORY_MAP[channelId];
  
  if (!category) {
    console.log(`Canal não mapeado: ${channelId}`);
    return;
  }
  
  console.log(`Mensagem recebida do canal ${category}: ${message.content}`);
  
  // Enviar para o site
  await sendToSite(message.content, channelId, category);
});

async function sendToSite(content, channelId, category) {
  try {
    const response = await fetch(`${SITE_URL}/api/webhooks/discord`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: content,
        channel_id: channelId,
      }),
    });
    
    const result = await response.json();
    console.log('Resposta do site:', result);
    
    if (result.success) {
      console.log(`✅ Salvos ${result.count} usernames no banco de dados`);
    }
  } catch (error) {
    console.error('❌ Erro ao enviar para o site:', error.message);
  }
}

// ==================== INICIAR BOT ====================
// Token do seu bot
const TOKEN = 'SEU_TOKEN_AQUI';

client.once(Events.ClientReady, () => {
  console.log(`🤖 Bot iniciado como ${client.user.tag}`);
  console.log(`📡 Enviando usernames para: ${SITE_URL}/api/webhooks/discord`);
});

client.login(TOKEN);
