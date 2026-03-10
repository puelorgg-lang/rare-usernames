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

// Void Usernames channels to monitor
const VOID_USERNAMES_CHANNELS = [
  // New Free Channels
  '1418701271107375124', // 4C
  '1418701479107235940', // PT-BR
  '1418701413298733117', // PONCTUATED
  '1418701441073414329', // EN-US
  '1418701383892209836', // REPEATERS
  '1418701360790245436', // FACE
  '1418701299733627041', // 4L
  '1418701324979011777', // 3C
  '1418701237691486238', // 4N
  '1418701343052398643', // 3L
];

// In-memory channel configs
const channelConfigs = new Map();

// Mapeamento de categorias
const CATEGORY_MAP = {
  'CHARS_4': '4c',
  'CHARS_3': '3c', 
  'CHARS_2': '2c',
  'EN_US': 'en',
  'PT_BR': 'pt',
  'RANDOM': 'random',
  // New Free Categories
  '4C': '4c_new',
  'PT_BR_2': 'pt_br',
  'PONCTUATED': 'ponctuated',
  'EN_US_2': 'en_us',
  'REPEATERS': 'repeaters',
  'FACE': 'face',
  '4L': '4l',
  '3C': '3c_new',
  '4N': '4n',
  '3L': '3l',
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

// Monitor Void Usernames channels
botClient.on('messageCreate', async (message) => {
  // Only process messages from Void Usernames channels
  if (VOID_USERNAMES_CHANNELS.includes(message.channelId)) {
    // Skip messages from our own bot
    if (message.author.id === botClient.user.id) {
      console.log('📝 Ignoring own message');
      return;
    }
    
    // Log who sent the message for debugging
    console.log('📬 New message from: ' + message.author.username + ' (' + message.author.id + ') bot: ' + message.author.bot);
    
    // Skip messages from our own bot
    if (message.author.id === botClient.user.id) {
      console.log('📝 Ignoring own message');
      return;
    }
    
    // Get category for this channel
    const CHANNEL_CATEGORY_MAP = {
      '1418701271107375124': '4C',
      '1418701479107235940': 'PT_BR_2',
      '1418701413298733117': 'PONCTUATED',
      '1418701441073414329': 'EN_US_2',
      '1418701383892209836': 'REPEATERS',
      '1418701360790245436': 'FACE',
      '1418701299733627041': '4L',
      '1418701324979011777': '3C',
      '1418701237691486238': '4N',
      '1418701343052398643': '3L',
    };
    const category = CHANNEL_CATEGORY_MAP[message.channelId] || 'UNKNOWN';
    
    // Parse available date from embed
    // Format 1: "Available between 22 de março de 2026 - 23 de março de 2026"
    // Format 2: "Status: Disponível" or "Status: Indisponível"
    function parseAvailableDate(text) {
      if (!text) return null;
      
      // Match "Available between DATE - DATE" or just "Available from DATE"
      const dateMatch = text.match(/Available (?:between|from)\s+(.+?)\s*[-–]\s*(.+)$/i);
      if (dateMatch) {
        const dateStr = dateMatch[1].trim();
        // Parse Portuguese date format: "22 de março de 2026"
        const dateParts = dateStr.match(/(\d+)\s+de\s+(\w+)\s+de\s+(\d+)/i);
        if (dateParts) {
          const day = parseInt(dateParts[1]);
          const monthNames = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
          const month = monthNames.findIndex(m => dateParts[2].toLowerCase().startsWith(m));
          const year = parseInt(dateParts[3]);
          
          if (month >= 0 && year > 0) {
            return new Date(year, month, day);
          }
        }
      }
      return null;
    }
    
    // Check if message has embeds
    if (message.embeds && message.embeds.length > 0) {
      const embed = message.embeds[0];
      const title = embed.title || '';
      const description = embed.description || '';
      const footer = embed.footer?.text || '';
      
      console.log(`📝 Embed - Title: "${title}" Description: "${description}" Footer: "${footer}"`);
      
      // Check embed fields
      let fieldContent = '';
      if (embed.fields && embed.fields.length > 0) {
        for (const field of embed.fields) {
          fieldContent += (field.name || '') + ' ' + (field.value || '') + ' ';
        }
      }
      
      const allText = title + ' ' + description + ' ' + fieldContent + ' ' + footer;
      
      // Parse available date
      const availableDate = parseAvailableDate(allText);
      console.log('📅 Available date:', availableDate ? availableDate.toISOString() : 'N/A');
      
      // Check status from footer or description
      const isAvailableNow = allText.toLowerCase().includes('status: disponível') || 
                             allText.toLowerCase().includes('disponivel') ||
                             allText.toLowerCase().includes('available');
      
      // Extract username - prioritize description field (most reliable for this embed type)
      let username = null;
      
      // First, try to get from description (most reliable for this embed type)
      if (description && description.trim()) {
        const descUsername = description.trim().match(/^([a-zA-Z0-9_\.\-]+)$/);
        if (descUsername && descUsername[1].length >= 2 && descUsername[1].length <= 20) {
          username = descUsername[1].toLowerCase();
          console.log(`📝 Username from description: ${username}`);
        }
      }
      
      // Pattern 1: Code blocks ```username```
      if (!username) {
        const codeBlockMatch = allText.match(/```([a-zA-Z0-9_\.\-]+)```/);
        if (codeBlockMatch) {
          username = codeBlockMatch[1].toLowerCase();
        }
      }
      
      // Pattern 2: From title if it looks like a username
      if (!username && title) {
        const titleMatch = title.match(/^([a-zA-Z0-9_\.\-]+)$/);
        if (titleMatch && titleMatch[1].length >= 2 && !titleMatch[1].toLowerCase().includes('doguser') && !titleMatch[1].toLowerCase().includes('discord')) {
          username = titleMatch[1].toLowerCase();
        }
      }
      
      if (username) {
        console.log(`📝 Found username: ${username}`);
        
        // Determine status based on available date and current status text
        // If it says "Disponível" AND no future date, it's AVAILABLE
        // If it has a future date, it's PENDING
        // If it says "Indisponível", it's UNAVAILABLE
        let status = 'AVAILABLE';
        
        if (availableDate && availableDate > new Date()) {
          status = 'PENDING'; // Will be available in the future
        } else if (!isAvailableNow) {
          status = 'UNAVAILABLE'; // Not available now
        }
        
        console.log(`📝 Status: ${status} (availableNow: ${isAvailableNow}, hasFutureDate: ${availableDate && availableDate > new Date()})`);
        
        // Save to database
        try {
          const db = await initPrisma();
          if (db) {
            // Check if already exists
            const existing = await db.username.findFirst({
              where: { name: username }
            });
            
            if (!existing) {
              await db.username.create({
                data: {
                  name: username,
                  platform: 'DISCORD',
                  category: category,
                  status: status,
                  availableDate: status === 'PENDING' ? availableDate : null,
                  foundAt: new Date()
                }
              });
              console.log(`✅ Saved username: ${username} (${status}) to database`);
            } else {
              // Update if existing and has new info
              if (status !== existing.status || (availableDate && !existing.availableDate)) {
                await db.username.update({
                  where: { id: existing.id },
                  data: {
                    status: status,
                    availableDate: status === 'PENDING' ? availableDate : existing.availableDate
                  }
                });
                console.log(`✅ Updated username: ${username} to status: ${status}`);
              }
            }
          }
        } catch (err) {
          console.log(`⚠️ Error saving username: ${err.message}`);
        }
      }
    }
    
    // Also check message content for code blocks
    const messageContent = message.content || '';
    if (messageContent.includes('```')) {
      const contentMatch = messageContent.match(/```([a-zA-Z0-9_\.\-]+)```/);
      if (contentMatch) {
        const username = contentMatch[1].toLowerCase();
        console.log(`📝 Found username from content: ${username}`);
        
        try {
          const db = await initPrisma();
          if (db) {
            const existing = await db.username.findFirst({
              where: { name: username }
            });
            
            if (!existing) {
              await db.username.create({
                data: {
                  name: username,
                  platform: 'DISCORD',
                  category: category,
                  status: 'AVAILABLE',
                  foundAt: new Date()
                }
              });
              console.log(`✅ Saved username: ${username} to database`);
            }
          }
        } catch (err) {
          console.log(`⚠️ Error saving username: ${err.message}`);
        }
      }
    }
  }
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

  // Comando /search - busca usernames no banco de dados
  if (content.startsWith('/search')) {
    const args = content.slice(7).trim().split(/\s+/);
    const [categoria] = args;

    if (!categoria) {
      message.reply('❌ Uso: /search <categoria> [tamanho]\nEx: /search portugues 4\n\nCategorias disponíveis:\n- portugues (ou pt): Nomes em português\n- ingles (ou en): Nomes em inglês\n- random: Nomes aleatórios\n- 4, 5, 6, 3, 2, 7: Nomes por quantidade de caracteres\n\nExemplos:\n/search portugues 4\n/search ingles 5\n/search random 3');
      return;
    }

    // Mapear categorias
    const CATEGORY_MAP_SEARCH = {
      // Categorias por idioma
      'portugues': 'PT_BR',
      'pt': 'PT_BR',
      'ptbr': 'PT_BR',
      'ingles': 'EN_US',
      'en': 'EN_US',
      'enus': 'EN_US',
      'random': 'RANDOM',
      // Categorias por quantidade de caracteres (letras)
      '4l': '4L',
      '3l': '3L',
      '2l': '2L',
      '4n': '4N',
      '3n': '3N',
      'face': 'FACE',
      'repeaters': 'REPEATERS',
      'ponctuated': 'PONCTUATED',
      // Categorias por quantidade de caracteres (números)
      '4c': 'CHARS_4',
      '5c': 'CHARS_5',
      '6c': 'CHARS_6',
      '3c': 'CHARS_3',
      '2c': 'CHARS_2',
      '7c': 'CHARS_7',
    };

    // Verificar se é uma categoria com quantidade de caracteres (ex: "portugues 4" ou "portugues 4c")
    let categoryFilter = null;
    let charLength = null;

    // Verificar se o segundo argumento é um número (quantidade de caracteres) - com ou sem "c"
    if (args[1]) {
      // Aceita "4", "4c", "5", "5c", etc.
      const lengthMatch = args[1].match(/^(\d+)c?$/i);
      if (lengthMatch) {
        charLength = parseInt(lengthMatch[1]);
        categoryFilter = CATEGORY_MAP_SEARCH[categoria.toLowerCase()] || categoria.toUpperCase();
      }
    }

    // Se não tem segundo argumento, verificar se é só a categoria
    if (!categoryFilter) {
      categoryFilter = CATEGORY_MAP_SEARCH[categoria.toLowerCase()] || categoria.toUpperCase();
    }

    try {
      const db = await initPrisma();
      if (!db) {
        message.reply('❌ Banco de dados não conectado.');
        return;
      }

      // Construir a query - buscar mais resultados para filtrar por tamanho
      let whereClause = {};
      
      if (charLength) {
        // Primeiro busca só por categoria, depois filtra por tamanho em JS
        whereClause = {
          category: categoryFilter,
          status: 'AVAILABLE'
        };
      } else {
        // Filtrar só por categoria
        whereClause = {
          category: categoryFilter,
          status: 'AVAILABLE'
        };
      }

      // Buscar mais resultados para poder filtrar por tamanho
      const allUsernames = await db.username.findMany({
        where: whereClause,
        orderBy: {
          foundAt: 'desc'
        },
        take: 200 // Buscar mais para filtrar
      });

      // Filtrar por quantidade de caracteres se necessário
      let usernames = allUsernames;
      if (charLength) {
        usernames = allUsernames.filter(u => u.name.length === charLength);
      }

      // Limitar a 50 resultados
      usernames = usernames.slice(0, 50);

      if (usernames.length === 0) {
        message.reply(`❌ Nenhum username encontrado para a categoria "${categoria}"${charLength ? ` com ${charLength} caracteres` : ''}.`);
        return;
      }

      // Formatar a resposta
      const usernameList = usernames.map(u => `• ${u.name} (${u.platform})`).join('\n');
      
      // Contar total de resultados (após filtro de caracteres)
      const totalCount = usernames.length;

      const embed = {
        color: 0x00ff00,
        title: `🔍 Resultados para: ${categoria}${charLength ? ` ${charLength}` : ''}`,
        description: `Total encontrado: ${totalCount} | Mostrando: ${usernames.length}\n\n${usernameList}`,
        footer: {
          text: 'Users4U - Busca de usernames'
        },
        timestamp: new Date().toISOString()
      };

      message.reply({ embeds: [embed] });

    } catch (error) {
      console.log('⚠️ Erro na busca:', error.message);
      message.reply('❌ Erro ao buscar usernames. Tente novamente.');
    }
    return;
  }

  // Comando /setar
  if (content.startsWith('/setar')) {
    const args = content.slice(6).trim().split(/\s+/);
    const [categoryShort, platform] = args;

    if (!categoryShort || !platform) {
      message.reply('❌ Uso: /setar <categoria> <plataforma>\nEx: /setar 4c discord\nCategorias: 4c, 3c, 2c, en, pt, random, feed');
      return;
    }

    // Map short to full category
    const CATEGORY_FULL = {
      '4c': 'CHARS_4',
      '3c': 'CHARS_3',
      '2c': 'CHARS_2',
      'en': 'EN_US',
      'pt': 'PT_BR',
      'random': 'RANDOM',
      'feed': 'FEED',
      // New Free Categories
      '4c_new': '4C',
      'pt_br': 'PT_BR_2',
      'ponctuated': 'PONCTUATED',
      'en_us': 'EN_US_2',
      'repeaters': 'REPEATERS',
      'face': 'FACE',
      '4l': '4L',
      '3c_new': '3C',
      '4n': '4N',
      '3l': '3L',
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
