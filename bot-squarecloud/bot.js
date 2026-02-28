require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const { PrismaClient } = require('@prisma/client');

const BOT_TOKEN = process.env.BOT_TOKEN;
const DATABASE_URL = process.env.DATABASE_URL;
const SITE_URL = process.env.SITE_URL || 'https://your-app.onrender.com';

console.log('🤖 Starting Discord bot...');
console.log('DATABASE_URL set:', !!DATABASE_URL);

// Lightweight Discord client
const botClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  rest: {
    timeout: 15000,
    retries: 2
  }
});

let prisma = null;
let lastCheckedId = null;

// In-memory channel configs
const channelConfigs = new Map();

// Mapeamento de categorias
const CATEGORY_MAP = {
  'CHARS_4': '4c',
  'CHARS_3': '3c', 
  'CHARS_2': '2c',
  'EN_US': 'en',
  'PT_BR': 'pt',
  'RANDOM': 'random'
};

const PLATFORM_MAP = {
  'DISCORD': 'discord',
  'MINECRAFT': 'minecraft',
  'ROBLOX': 'roblox',
  'INSTAGRAM': 'instagram',
  'GITHUB': 'github',
  'TWITTER': 'twitter',
  'TIKTOK': 'tiktok'
};

// Initialize Prisma
async function initPrisma() {
  if (!prisma && DATABASE_URL) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: DATABASE_URL
        }
      }
    });
    console.log('✅ Prisma connected to database');
  }
  return prisma;
}

// Load channel configs from database
async function loadChannelConfigs() {
  try {
    const db = await initPrisma();
    if (!db) return;
    
    const webhooks = await db.webhook.findMany();
    webhooks.forEach(webhook => {
      if (webhook.category && webhook.platform) {
        channelConfigs.set(webhook.channelId, {
          category: webhook.category,
          platform: webhook.platform
        });
      }
    });
    console.log(`✅ Carregados ${webhooks.length} canais do banco`);
  } catch (error) {
    console.log('⚠️ Erro ao carregar configurações:', error.message);
  }
}

// Check for new usernames in database
async function checkNewUsernames() {
  try {
    const db = await initPrisma();
    if (!db) return;
    
    // Get only the most recent username
    const latestUsername = await db.username.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    
    if (latestUsername && latestUsername.id !== lastCheckedId) {
      lastCheckedId = latestUsername.id;
      console.log(`📊 Novo username: ${latestUsername.name}`);
      await broadcastUsername(latestUsername.name, latestUsername.category, latestUsername.platform);
    }
  } catch (error) {
    console.log('⚠️ Erro ao verificar usernames:', error.message);
  }
}

// Start periodic check
function startUsernameChecker() {
  console.log('🔄 Verificando usernames a cada 2 segundos');
  setInterval(checkNewUsernames, 2000); // Check every 2 seconds
}

// Enviar embed
async function sendUsernameEmbed(channelId, username) {
  try {
    const channel = await botClient.channels.fetch(channelId);
    if (!channel) return false;

    const embed = {
      title: 'DogUser',
      description: `\`\`\`${username}\`\`\`\n\n**Status:** Disponível`,
      color: 0x000000,
      footer: { text: 'Todos os direitos reservados a @doguser' },
      timestamp: new Date().toISOString()
    };

    await channel.send({ embeds: [embed] });
    console.log(`✅ Enviado: ${username} para ${channelId}`);
    return true;
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
    return false;
  }
}

// Broadcast
async function broadcastUsername(username, category, platform) {
  console.log(`📤 Broadcast: ${username} - category: ${category} - platform: ${platform}`);
  console.log(`📋 Canais configurados: ${channelConfigs.size}`);
  
  for (const [channelId, config] of channelConfigs.entries()) {
    console.log(`  -> Canal ${channelId}: ${config.category} vs ${category}, ${config.platform} vs ${platform}`);
    if (config.category === category && config.platform === platform) {
      await sendUsernameEmbed(channelId, username);
    }
  }
}

// Bot pronto
botClient.on('ready', async () => {
  console.log(`✅ Bot online como ${botClient.user.tag}`);
  
  await loadChannelConfigs();
  startUsernameChecker();
  
  console.log(`📊 Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
});

// Mensagem recebida
botClient.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.trim();

  // Comando /resetar - limpa todos os canais
  if (content.startsWith('/resetar')) {
    channelConfigs.clear();
    try {
      const db = await initPrisma();
      if (db) {
        await db.webhook.deleteMany({});
      }
    } catch (error) {
      console.log('⚠️ Erro ao resetar banco:', error.message);
    }
    message.reply('✅ Todos os canais foram removidos!');
    return;
  }

  // Comando /listar - lista canais configurados
  if (content.startsWith('/listar')) {
    const channels = [];
    for (const [id, config] of channelConfigs.entries()) {
      channels.push(`<#${id}> - ${config.category} (${config.platform})`);
    }
    if (channels.length === 0) {
      message.reply('Nenhum canal configurado ainda.');
    } else {
      message.reply(`📋 Canais configurados:\n${channels.join('\n')}`);
    }
    return;
  }

  // Comando /setar
  if (content.startsWith('/setar')) {
    const args = content.slice(6).trim().split(/\s+/);
    const [categoryShort, platform] = args;

    if (!categoryShort || !platform) {
      message.reply('❌ Uso: /setar <categoria> <plataforma>\nEx: /setar 4c discord');
      return;
    }

    // Map short to full category
    const CATEGORY_FULL = {
      '4c': 'CHARS_4',
      '3c': 'CHARS_3',
      '2c': 'CHARS_2',
      'en': 'EN_US',
      'pt': 'PT_BR',
      'random': 'RANDOM'
    };
    
    const PLATFORM_FULL = {
      'discord': 'DISCORD',
      'minecraft': 'MINECRAFT',
      'roblox': 'ROBLOX',
      'instagram': 'INSTAGRAM',
      'github': 'GITHUB',
      'twitter': 'TWITTER',
      'tiktok': 'TIKTOK'
    };

    const category = CATEGORY_FULL[categoryShort.toLowerCase()];
    const platformUpper = PLATFORM_FULL[platform.toLowerCase()];

    if (!category || !platformUpper) {
      message.reply('❌ Categoria ou plataforma inválida');
      return;
    }

    // Save to memory
    channelConfigs.set(message.channel.id, { category, platform: platformUpper });
    
    // Save to database
    try {
      const db = await initPrisma();
      if (db) {
        await db.webhook.upsert({
          where: { channelId: message.channel.id },
          update: { category, platform: platformUpper },
          create: {
            channelId: message.channel.id,
            platform: platformUpper,
            category: category,
            webhookUrl: ''
          }
        });
        console.log('✅ Salvo no banco de dados');
      }
    } catch (error) {
      console.log('⚠️ Erro ao salvar no banco:', error.message);
    }

    message.reply(`✅ Configurado!\n📁 ${category}\n🔗 ${platformUpper}`);
    return;
  }
});

// Login
if (BOT_TOKEN) {
  botClient.login(BOT_TOKEN)
    .then(() => console.log('✅ Login OK'))
    .catch(err => console.error('❌ Login falhou:', err.message));
} else {
  console.log('⚠️ BOT_TOKEN não definido');
}

// Express server
const app = express();
const PORT = process.env.PORT || 80;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    bot: botClient.user ? 'online' : 'offline',
    channels: channelConfigs.size,
    memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
  });
});

app.get('/api/channels', (req, res) => {
  const channels = Array.from(channelConfigs.entries()).map(([id, config]) => ({
    channelId: id,
    ...config
  }));
  res.json({ channels });
});

app.listen(PORT, () => {
  console.log(`🌐 API running on port ${PORT}`);
});
