require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const BOT_TOKEN = process.env.BOT_TOKEN;
const SITE_URL = process.env.SITE_URL || 'https://your-app.onrender.com';

// Criar o cliente do bot
const botClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  rest: {
    timeout: 30000
  }
});

// Armazenamento de configurações de canais (em memória)
const channelConfigs = new Map(); // channelId -> { category, platform }

// Carregar configurações do banco ao iniciar
async function loadChannelConfigs() {
  try {
    const webhooks = await prisma.webhook.findMany();
    webhooks.forEach(webhook => {
      if (webhook.category && webhook.platform) {
        channelConfigs.set(webhook.channelId, {
          category: webhook.category,
          platform: webhook.platform
        });
      }
    });
    console.log(`✅ Carregados ${webhooks.length} canais do banco de dados`);
  } catch (error) {
    console.log('⚠️ Erro ao carregar configurações do banco:', error.message);
  }
}

// Mapeamento de categorias curtas para completas
const CATEGORY_MAP = {
  '4c': 'CHARS_4',
  '3c': 'CHARS_3',
  '2c': 'CHARS_2',
  'en': 'EN_US',
  'pt': 'PT_BR',
  'random': 'RANDOM'
};

// Mapeamento de plataformas
const PLATFORM_MAP = {
  'discord': 'DISCORD',
  'minecraft': 'MINECRAFT',
  'roblox': 'ROBLOX',
  'instagram': 'INSTAGRAM',
  'github': 'GITHUB',
  'twitter': 'TWITTER',
  'tiktok': 'TIKTOK'
};

// Função para enviar embed de username
async function sendUsernameEmbed(channelId, username, platform) {
  try {
    const channel = await botClient.channels.fetch(channelId);
    if (!channel) {
      console.log(`❌ Canal não encontrado: ${channelId}`);
      return false;
    }

    const embed = {
      title: 'DogUser',
      description: `\`\`\`${username}\`\`\`\n\n**Status:** Disponível`,
      color: 0x000000, // Preto
      footer: {
        text: `Todos os direitos reservados a @doguser`
      },
      timestamp: new Date().toISOString()
    };

    await channel.send({ embeds: [embed] });
    console.log(`✅ Enviado username ${username} para canal ${channelId}`);
    return true;
  } catch (error) {
    console.log(`❌ Erro ao enviar embed: ${error.message}`);
    return false;
  }
}

// Broadcast username para todos os canais configurados
async function broadcastUsername(username, category, platform) {
  for (const [channelId, config] of channelConfigs.entries()) {
    if (config.category === category && config.platform === platform) {
      await sendUsernameEmbed(channelId, username, platform);
    }
  }
}

// Função para processar comando /setar
async function handleSetarCommand(message, args) {
  const [categoryShort, platform] = args;
  
  if (!categoryShort || !platform) {
    message.reply('❌ Uso correto: /setar <categoria> <plataforma>\nExemplo: /setar 4c discord');
    return;
  }

  const category = CATEGORY_MAP[categoryShort.toLowerCase()];
  const platformUpper = PLATFORM_MAP[platform.toLowerCase()];

  if (!category) {
    message.reply('❌ Categoria inválida! Use: 4c, 3c, 2c, en, pt ou random');
    return;
  }

  if (!platformUpper) {
    message.reply('❌ Plataforma inválida! Use: discord, minecraft, roblox, instagram, github, twitter, tiktok');
    return;
  }

  // Salvar configuração
  channelConfigs.set(message.channel.id, {
    category,
    platform: platformUpper
  });
  
  // Também salvar no banco de dados
  try {
    await prisma.webhook.upsert({
      where: { channelId: message.channel.id },
      update: { category, platform: platformUpper },
      create: {
        channelId: message.channel.id,
        platform: platformUpper,
        category: category,
        webhookUrl: ''
      }
    });
    console.log(`✅ Salvo no banco: Canal ${message.channel.id} - ${category} - ${platformUpper}`);
  } catch (error) {
    console.log('⚠️ Erro ao salvar no banco:', error.message);
  }

  message.reply(`✅ Canal configurado!\n📁 Categoria: ${category}\n🔗 Plataforma: ${platformUpper}\n\nEste canal receberá os usernames automaticamente.`);
  console.log(`✅ Canal ${message.channel.id} configurado para ${category} - ${platformUpper}`);
}

// Evento quando o bot estiver pronto
botClient.on('ready', async () => {
  console.log(`🤖 Bot logado como ${botClient.user.tag}!`);
  console.log(`📢 Bot está ouvindo comandos em todos os servidores`);
  
  // Carregar configurações do banco
  await loadChannelConfigs();
});

// Evento de mensagem
botClient.on('messageCreate', async (message) => {
  // Ignorar mensagens de bots
  if (message.author.bot) return;

  // Verificar se é comando /setar
  const content = message.content.trim();
  
  if (content.startsWith('/setar')) {
    const args = content.slice(6).trim().split(/\s+/);
    await handleSetarCommand(message, args);
    return;
  }

  // Verificar se o canal está configurado para enviar usernames
  const config = channelConfigs.get(message.channel.id);
  if (config) {
    // É uma mensagem de username?
    const username = content.trim();
    if (username && username.length >= 2 && username.length <= 32 && /^[a-zA-Z0-9_.]+$/.test(username)) {
      await sendUsernameEmbed(message.channel.id, username.toLowerCase(), config.platform);
    }
  }
});

// Login do bot
if (BOT_TOKEN) {
  console.log('🤖 Iniciando bot do Discord...');
  console.log('Token starts with:', BOT_TOKEN.substring(0, 5));
  console.log('Token length:', BOT_TOKEN.length);
  console.log('Making login request...');
  
  botClient.login(BOT_TOKEN)
    .then(() => {
      console.log('✅ Login bem-sucedido! Bot está online.');
    })
    .catch((error) => {
      console.error('❌ Erro ao fazer login do bot:', error.message);
      console.error('Error code:', error.code);
      console.error('Error name:', error.name);
    });
  
  // Keepalive
  console.log('Login request sent, waiting...');
} else {
  console.log('⚠️ BOT_TOKEN não definido - bot não será iniciado');
}

// ==================== EXPRESS SERVER ====================
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Endpoint para receber notificações do site
app.post('/api/notify-bot', async (req, res) => {
  try {
    const { username, category, platform } = req.body;
    
    if (!username || !category || !platform) {
      return res.status(400).json({ error: 'Missing parameters' });
    }
    
    console.log(`📥 Notificação recebida: ${username} (${category}) - ${platform}`);
    
    // Envia para todos os canais configurados
    await broadcastUsername(username, category, platform);
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erro ao processar notificação:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', bot: botClient.user ? botClient.user.tag : 'not logged in' });
});

app.listen(PORT, () => {
  console.log(`🌐 Bot API server running on port ${PORT}`);
});
