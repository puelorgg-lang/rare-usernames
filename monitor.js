require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client: DiscordBot } = require('discord.js-selfbot-v13');
const { Client: BotClient, GatewayIntentBits, EmbedBuilder, Routes } = require('discord.js');
const axios = require('axios');

const TOKEN = process.env.DISCORD_TOKEN;
const BOT_TOKEN = process.env.BOT_TOKEN;

// Armazenamento de configurações de canais (em memória - pode ser salvo no banco)
const channelConfigs = new Map(); // channelId -> { category, platform }

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

// URL do seu site (use variável de ambiente ou fallback para local)
const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';

// Channel and server for search
const SEARCH_CHANNEL_ID = '1474813731526545614';
const SEARCH_SERVER_ID = '1473338499439657074';

// Cache de webhooks do banco de dados
let webhooksCache = {
  data: [],
  lastFetch: 0
};

// Buscar webhooks do banco de dados via API
async function fetchWebhooksFromAPI() {
  try {
    const response = await axios.get(`${SITE_URL}/api/admin/webhooks`);
    return response.data;
  } catch (error) {
    console.log('⚠️ Erro ao buscar webhooks da API:', error.message);
    return [];
  }
}

// Obter webhooks (do cache ou fresco da API)
async function getWebhooks(forceRefresh = false) {
  const now = Date.now();
  const CACHE_TTL = 60000; // 1 minuto de cache
  
  if (!forceRefresh && webhooksCache.data.length > 0 && (now - webhooksCache.lastFetch) < CACHE_TTL) {
    return webhooksCache.data;
  }
  
  const webhooks = await fetchWebhooksFromAPI();
  webhooksCache = {
    data: webhooks,
    lastFetch: now
  };
  
  return webhooks;
}

// Obter categoria de um canal
function getCategoryForChannel(channelId, webhooks) {
  const webhook = webhooks.find(w => w.channelId === channelId);
  return webhook ? webhook.category : 'RANDOM';
}

// Obter plataforma de um canal
function getPlatformForChannel(channelId, webhooks) {
  const webhook = webhooks.find(w => w.channelId === channelId);
  return webhook ? webhook.platform : 'discord';
}

// Mapeamento: Canal de Origem -> URL do Webhook do Discord (fallback)
const CHANNEL_WEBHOOKS = {
    '1420065854401413231': 'https://discord.com/api/webhooks/1473341387830460590/qnoxDJTfKVwOrR5VetNNF7qwi5rtgKSQU1y2Uu0M4oXmyHxKRuXbzm4anK7iZLREHIrw',
    '1420065865029652652': 'https://discord.com/api/webhooks/1473341491882492137/9Agsgap0uqYjPZvtS2jvDDNrHLLo8TOw5qLbVFzijCZGPaQKUNsPhJOTPEJM7k5VmMLe',
    '1420065875880316968': 'https://discord.com/api/webhooks/1473341555795562528/fAhvuUYR75Mu1OfKAPCgjm4TPl55luMbQYUb9J_YAZ6MmTzfS2YfClyOpewQYXscplEJ',
    '1420065886928244756': 'https://discord.com/api/webhooks/1473341640881082565/omDeHXnBsM5cpU3IC-ZIzUkQkOvlC6iU5r5guUgTZK2S65lMOWazmh7y0o_kKKlc3tUN',
    '1420065898370175038': 'https://discord.com/api/webhooks/1473341694903849285/fLbwFx2hIkqfzTsLtQ8pnunTcuu-A2cJoAQnfIrYIfxLMwDUfkCwui3QyLG3yv96z7CJ',
    '1420065909611036863': 'https://discord.com/api/webhooks/1473341763359084849/0dT4aTtz4nU48ZYCjiB0pgwpSfNoeOHkpFnguUdqQtgKZQigfl-NVHdWPL5wCsHfHVAL',
};

// Mapeamento: Canal ID -> Categoria do site (fallback)
const CHANNEL_CATEGORY_MAP = {
    '1420065854401413231': 'CHARS_4',   // 4char
    '1420065865029652652': 'CHARS_3',   // 3chars
    '1420065875880316968': 'CHARS_2',   // 2chars
    '1420065886928244756': 'PT_BR',     // pt-br
    '1420065898370175038': 'EN_US',     // en-us
    '1420065909611036863': 'RANDOM',    // random
};

// ==================== EXPRESS SERVER FOR SEARCH API ====================
const app = express();
app.use(cors());
app.use(express.json());

// Store pending searches
const pendingSearches = new Map();

// Store for additional search data (from button clicks)
const searchAdditionalData = new Map();

// API endpoint for search from web
app.post('/api/search', async (req, res) => {
    const { query, option, channelId, serverId, category } = req.body;
    
    if (!query) {
        return res.status(400).json({ error: 'Query (ID or username) is required' });
    }

    // Create a unique ID for this search
    const searchId = `${query}-${Date.now()}`;
    
    // Store the category for specific button clicking
    const searchCategory = category || option || 'all';
    
    // Store resolve/reject functions
    const searchPromise = new Promise((resolve, reject) => {
        pendingSearches.set(searchId, { 
            resolve, 
            reject, 
            startTime: Date.now(),
            category: searchCategory,
            timeout: setTimeout(() => {
                pendingSearches.delete(searchId);
                reject(new Error('Timeout waiting for bot response'));
            }, 120000) // Increased timeout to 2 minutes to allow for button clicks
        });
    });

    try {
        // Send command to Discord channel using selfbot
        console.log('🔍 Checking selfbot status...');
        console.log('🔍 Client ready:', client.isReady());
        console.log('🔍 Client user:', client.user ? client.user.tag : 'No user');
        console.log('🔍 Channel ID:', channelId || SEARCH_CHANNEL_ID);
        console.log('🔍 Query:', query);
        console.log('🔍 Category:', searchCategory);
        
        if (client && client.isReady()) {
            const channel = await client.channels.fetch(channelId || SEARCH_CHANNEL_ID);
            console.log('🔍 Channel found:', !!channel);
            
            if (channel) {
                await channel.send(`zui ${query}`);
                console.log(`🔍 Sent search command for: ${query}`);
                
                // Wait for response from zany bot
                const result = await searchPromise;
                res.json(result);
            } else {
                console.log('🔍 Channel not found!');
                res.status(404).json({ error: 'Channel not found' });
            }
        } else {
            console.log('🔍 Selfbot not ready!');
            res.status(503).json({ error: 'Selfbot not ready. Make sure the bot is logged in.' });
        }
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start Express server on port 3001
app.listen(3001, () => {
    console.log('🔍 Search API server running on port 3001');
});


// ==================== NOVO BOT PARA ENVIAR MENSAGENS ====================
// Usar a API compatível com a versão instalada

const botClient = new BotClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

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

    message.reply(`✅ Canal configurado!\n📁 Categoria: ${category}\n🔗 Plataforma: ${platformUpper}\n\nEste canal receberá os usernames automaticamente.`);
    console.log(`✅ Canal ${message.channel.id} configurado para ${category} - ${platformUpper}`);
}

// Evento quando o bot estiver pronto
botClient.on('ready', () => {
    console.log(`🤖 Bot logado como ${botClient.user.tag}!`);
    console.log(`📢 Bot está ouvindo comandos em todos os servidores`);
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
botClient.login(BOT_TOKEN).catch((error) => {
    console.error('❌ Erro ao fazer login do bot:', error.message);
});

// ==================== SELFBOT CODE ====================
const client = new DiscordBot({
    checkUpdate: false,
});

// Função para enviar mensagem via webhook do Discord
async function enviarWebhook(webhookUrl, autor, avatarUrl, conteudo, anexos = [], embed = null) {
    try {
        const data = {
            username: autor,
            avatar_url: avatarUrl,
            content: conteudo || null,
        };

        if (embed) {
            data.embeds = [embed];
            data.content = null;
        }

        const response = await axios.post(webhookUrl, data);

        if (response.status === 200 || response.status === 204) {
            console.log('   ✅ Mensagem enviada via webhook Discord!');
            for (const anexo of anexos) {
                const anexoData = {
                    username: autor,
                    avatar_url: avatarUrl,
                    content: anexo,
                };
                await axios.post(webhookUrl, anexoData);
            }
            return true;
        } else {
            console.log(`   ❌ Erro no webhook Discord: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log(`   ❌ Erro ao enviar webhook Discord: ${error.message}`);
        return false;
    }
}

// Função NOVA: Enviar username para o seu site
async function enviarParaSite(username, channelId, status = 'AVAILABLE', availableDate = null) {
    try {
        // Busca webhooks do banco de dados
        const webhooks = await getWebhooks();
        const category = getCategoryForChannel(channelId, webhooks) || CHANNEL_CATEGORY_MAP[channelId] || 'RANDOM';
        const platform = getPlatformForChannel(channelId, webhooks) || 'DISCORD';
        
        const response = await axios.post(`${SITE_URL}/api/webhooks/discord`, {
            content: username,
            channel_id: channelId,
            status: status,
            available_date: availableDate,
        });

        if (response.data.success) {
            console.log(`   ✅ Salvo no site: ${username} (${category}) - ${response.data.count} usernames`);
            
            // Envia para os canais do Discord configurados
            await broadcastUsername(username, category, platform);
            
            // Notifica os clientes conectados para atualizar
            await axios.post(`${SITE_URL}/api/notify`);
            
            return true;
        } else {
            console.log(`   ⚠️ Site retornou: ${response.data.message}`);
            return false;
        }
    } catch (error) {
        console.log(`   ❌ Erro ao enviar para site: ${error.message}`);
        return false;
    }
}

// Handle zany bot response for search
async function handleZanyBotResponse(message) {
    console.log('🔍 Received zany bot response');
    console.log('🔍 Message author:', message.author.username);
    console.log('🔍 Has embeds:', message.embeds.length > 0);
    
    // Only process messages from Zany bot
    if (message.author.username !== 'Zany') {
        console.log('🔍 Ignoring message from:', message.author.username);
        return;
    }
    
    // Check if this is the "buscando" message - ignore it
    if (message.content.includes('Buscando informações') || message.content.includes('aguarde')) {
        console.log('🔍 Ignoring "buscando" message, waiting for actual response...');
        return;
    }
    
    // Check if there's a pending search waiting for this response
    for (const [searchId, pending] of pendingSearches.entries()) {
        if (pending.startTime && Date.now() - pending.startTime < 60000) {
            // Found a pending search
            clearTimeout(pending.timeout);
            
            // Parse the embed to extract all information
            const embed = message.embeds[0];
            const result = parseZanyEmbed(embed, message.content);
            
            // Store the initial result
            pending.result = result;
            pending.message = message;
            
            // Check if there are buttons to click (Mais Informações)
            const messageWithComponents = message;
            if (messageWithComponents.components && messageWithComponents.components.length > 0) {
                console.log('🔍 Found buttons on message, clicking to get more info...');
                
                // Map category names to button customIds
                const categoryButtonMap = {
                    'cores do perfil': ['colors', 'cores'],
                    'profile colors': ['colors', 'cores'],
                    'cores': ['colors', 'cores'],
                    'colors': ['colors', 'cores'],
                    'nomes anteriores': ['names', 'nomes', 'username'],
                    'previous usernames': ['names', 'nomes', 'username'],
                    'nomes': ['names', 'nomes'],
                    'icons antigos': ['icons', 'ícones', 'avatars'],
                    'old icons': ['icons', 'ícones', 'avatars'],
                    'banners antigos': ['banners', 'fundos'],
                    'old banners': ['banners', 'fundos'],
                    'mensagens': ['messages', 'mensagens', 'msg'],
                    'last messages': ['messages', 'mensagens', 'msg'],
                    'calls': ['calls', 'vc', 'chamadas'],
                    'voice': ['calls', 'vc', 'chamadas'],
                    'servidores': ['servers', 'servidores', 'guilds'],
                    'servers': ['servers', 'servidores', 'guilds'],
                    'visualizações': ['views', 'visualizações', 'history'],
                    'view history': ['views', 'visualizações', 'history'],
                    'nitro': ['nitro', 'boost'],
                    'all': [] // Click all buttons
                };
                
                const targetKeywords = categoryButtonMap[pending.category.toLowerCase()] || [];
                console.log('🔍 Target category:', pending.category);
                console.log('🔍 Target keywords:', targetKeywords);
                
                // Get all buttons and click them
                for (const actionRow of messageWithComponents.components) {
                    if (actionRow.components) {
                        for (const component of actionRow.components) {
                            // Check if it's a button or select menu
                            const componentType = component.type; // 2 = button, 3 = select menu
                            const customId = component.customId;
                            
                            if (customId) {
                                const buttonId = customId.toLowerCase();
                                const shouldClick = targetKeywords.length === 0 || // Click all if 'all'
                                    targetKeywords.some(keyword => buttonId.includes(keyword));
                                
                                if (shouldClick) {
                                    console.log('🔍 Clicking component:', customId, 'type:', componentType);
                                    try {
                                        if (componentType === 2) {
                                            // It's a button
                                            await component.click();
                                        } else if (componentType === 3) {
                                            // It's a select menu - iterate through all options
                                            if (component.options && component.options.length > 0) {
                                                console.log('🔍 Select menu has', component.options.length, 'options');
                                                
                                                // Select each option to get all data
                                                for (const option of component.options) {
                                                    console.log('🔍 Selecting option:', option.label, '(', option.value, ')');
                                                    try {
                                                        await component.selectOption(option.value);
                                                        // Wait for response after each selection
                                                        await new Promise(r => setTimeout(r, 1500));
                                                    } catch (err) {
                                                        console.log('🔍 Error selecting option:', err.message);
                                                    }
                                                }
                                            }
                                        }
                                        // Wait a bit between components
                                        await new Promise(r => setTimeout(r, 1000));
                                    } catch (err) {
                                        console.log('🔍 Error clicking component:', err.message);
                                    }
                                }
                            }
                        }
                    }
                }
                
                // Wait for additional messages after clicking buttons
                console.log('🔍 Waiting for additional data after button clicks...');
                await new Promise(r => setTimeout(r, 3000));
                
                // Merge additional data if available
                const additionalData = searchAdditionalData.get(searchId);
                if (additionalData) {
                    console.log('🔍 Merging additional data...');
                    
                    // If specific category, only return that data
                    const isSpecificCategory = pending.category && pending.category.toLowerCase() !== 'all';
                    
                    if (!isSpecificCategory) {
                        // Return all data
                        if (additionalData.nitroStartDate && !result.nitroStartDate) {
                            result.nitroStartDate = additionalData.nitroStartDate;
                        }
                        if (additionalData.boostStartDate && !result.boostStartDate) {
                            result.boostStartDate = additionalData.boostStartDate;
                        }
                        if (additionalData.profileColors && additionalData.profileColors.length > 0) {
                            result.profileColors = [...new Set([...result.profileColors, ...additionalData.profileColors])];
                        }
                        if (additionalData.previousUsernames && additionalData.previousUsernames.length > 0) {
                            result.previousUsernames = [...new Set([...result.previousUsernames, ...additionalData.previousUsernames])];
                        }
                        if (additionalData.oldIcons && additionalData.oldIcons.length > 0) {
                            result.oldIcons = [...result.oldIcons, ...additionalData.oldIcons];
                        }
                        if (additionalData.oldBanners && additionalData.oldBanners.length > 0) {
                            result.oldBanners = [...result.oldBanners, ...additionalData.oldBanners];
                        }
                        if (additionalData.lastMessages && additionalData.lastMessages.length > 0) {
                            result.lastMessages = [...result.lastMessages, ...additionalData.lastMessages];
                        }
                        if (additionalData.lastCall && !result.lastCall) {
                            result.lastCall = additionalData.lastCall;
                        }
                        if (additionalData.servers && additionalData.servers.length > 0) {
                            result.servers = [...result.servers, ...additionalData.servers];
                        }
                        if (additionalData.viewHistory && additionalData.viewHistory.length > 0) {
                            result.viewHistory = [...result.viewHistory, ...additionalData.viewHistory];
                        }
                    } else {
                        // Return only specific category data
                        const category = pending.category.toLowerCase();
                        
                        if (category.includes('cores') || category.includes('color')) {
                            result.profileColors = additionalData.profileColors || [];
                        }
                        if (category.includes('nome') || category.includes('name')) {
                            result.previousUsernames = additionalData.previousUsernames || [];
                        }
                        if (category.includes('icon')) {
                            result.oldIcons = additionalData.oldIcons || [];
                        }
                        if (category.includes('banner')) {
                            result.oldBanners = additionalData.oldBanners || [];
                        }
                        if (category.includes('mensagem') || category.includes('message')) {
                            result.lastMessages = additionalData.lastMessages || [];
                        }
                        if (category.includes('call') || category.includes('vc')) {
                            result.lastCall = additionalData.lastCall;
                        }
                        if (category.includes('servidor') || category.includes('server')) {
                            result.servers = additionalData.servers || [];
                        }
                        if (category.includes('visualização') || category.includes('view')) {
                            result.viewHistory = additionalData.viewHistory || [];
                        }
                        if (category.includes('nitro')) {
                            result.nitroStartDate = additionalData.nitroStartDate;
                            result.boostStartDate = additionalData.boostStartDate;
                        }
                    }
                }
            }
            
            console.log('🔍 Final merged result:', JSON.stringify(result, null, 2));
            pending.resolve(result);
            pendingSearches.delete(searchId);
            searchAdditionalData.delete(searchId);
            console.log(`🔍 Search completed for ${searchId}`);
            return;
        }
    }
    
    console.log('🔍 No pending search found for zany bot response');
}

// Handle additional zany bot messages (from button clicks)
async function handleAdditionalZanyData(message) {
    if (message.author.username !== 'Zany' || message.channelId !== SEARCH_CHANNEL_ID) {
        return;
    }
    
    if (!message.embeds || message.embeds.length === 0) {
        return;
    }
    
    // Find any pending search to associate this data with
    for (const [searchId, pending] of pendingSearches.entries()) {
        if (pending.startTime && Date.now() - pending.startTime < 120000) {
            const embed = message.embeds[0];
            const additionalResult = parseZanyEmbed(embed, message.content);
            
            console.log('🔍 Received additional data from button click:', JSON.stringify(additionalResult, null, 2));
            
            // Store additional data
            const existingData = searchAdditionalData.get(searchId) || {};
            searchAdditionalData.set(searchId, {
                ...existingData,
                nitroStartDate: additionalResult.nitroStartDate,
                boostStartDate: additionalResult.boostStartDate,
                profileColors: additionalResult.profileColors,
                previousUsernames: additionalResult.previousUsernames,
                oldIcons: additionalResult.oldIcons,
                oldBanners: additionalResult.oldBanners,
                lastMessages: additionalResult.lastMessages,
                lastCall: additionalResult.lastCall,
                servers: additionalResult.servers,
                viewHistory: additionalResult.viewHistory,
            });
            return;
        }
    }
}

// Parse zany bot embed
function parseZanyEmbed(embed) {
    const result = {
        userId: '',
        username: '',
        avatar: null,
        banner: null,
        nitro: false,
        nitroBoost: 0,
        nitroStartDate: '',
        boostStartDate: '',
        nextBoostBadge: '',
        nextNitroBadge: '',
        currentNitroBadge: '',
        profileColors: [],
        previousUsernames: [],
        oldIcons: [],
        oldBanners: [],
        lastMessages: [],
        lastCall: null,
        servers: [],
        viewHistory: [],
        badges: [],
        createdAt: '',
        joinedAt: '',
        rawEmbed: embed,
    };
    
    // Extract author info (username and avatar)
    if (embed.author) {
        result.username = embed.author.name || '';
        if (embed.author.iconURL) {
            result.avatar = embed.author.iconURL;
        }
    }
    
    // Extract thumbnail (avatar)
    if (embed.thumbnail) {
        result.avatar = embed.thumbnail.url;
    }
    
    // Extract fields
    if (embed.fields) {
        for (const field of embed.fields) {
            const fieldName = field.name.toLowerCase();
            const fieldValue = field.value;
            
            // ID
            if (fieldName.includes('id')) {
                const idMatch = fieldValue.match(/\d{17,19}/);
                if (idMatch) {
                    result.userId = idMatch[0];
                }
            }
            
            // Tag/Username
            if (fieldName.includes('tag') || fieldName.includes('nome') || fieldName.includes('user')) {
                const cleanValue = fieldValue.replace(/```/g, '').trim();
                if (!result.username) {
                    result.username = cleanValue;
                }
            }
            
            // Badges
            if (fieldName.includes('insígnia') || fieldName.includes('badge')) {
                result.badges = fieldValue.split(' ').filter(b => b.trim());
            }
            
            // Account created
            if (fieldName.includes('conta criada') || fieldName.includes('conta')) {
                result.createdAt = fieldValue;
            }
            
            // Joined server
            if (fieldName.includes('entrou no servidor') || fieldName.includes('servidor')) {
                result.joinedAt = fieldValue;
            }
            
            // Nitro
            if (fieldName.includes('nitro') && !fieldName.includes('insígnia') && !fieldName.includes('próxima') && !fieldName.includes('next')) {
                result.nitro = fieldValue.includes('```') || fieldValue.length > 0;
                result.nitroStartDate = fieldValue;
            }
            
            // Boosting
            if (fieldName.includes('impulsionando') || fieldName.includes('impulse') || fieldName.includes('boosting')) {
                result.boostStartDate = fieldValue;
            }
            
            // Current boost badge
            if (fieldName.includes('impulso atual') || fieldName.includes('impulse') || fieldName.includes('badge') && fieldName.includes('atual')) {
                result.currentNitroBadge = fieldValue.replace(/```/g, '').trim();
            }
            
            // Next boost badge
            if (fieldName.includes('próxima') && (fieldName.includes('impulso') || fieldName.includes('boost'))) {
                result.nextBoostBadge = fieldValue.replace(/```/g, '').trim();
            }
            
            // Current nitro badge
            if (fieldName.includes('nitro') && fieldName.includes('atual') && !fieldName.includes('próxima')) {
                result.currentNitroBadge = fieldValue.replace(/```/g, '').trim();
            }
            
            // Next nitro badge
            if (fieldName.includes('próxima') && fieldName.includes('nitro')) {
                result.nextNitroBadge = fieldValue.replace(/```/g, '').trim();
            }
        }
    }
    
    console.log('🔍 Parsed result:', JSON.stringify(result, null, 2));
    return result;
}

// Parse embed from zany bot
function parseZanyEmbed(embed, messageContent) {
    const result = {
        userId: '',
        username: embed.author?.name || 'Unknown',
        avatar: embed.thumbnail?.url || embed.image?.url || null,
        banner: embed.image?.url || embed.fields?.find(f => f.name.toLowerCase().includes('banner'))?.value?.match(/https?:\/\/[^\s]+/g)?.[0] || null,
        nitro: false,
        nitroBoost: 0,
        nitroStartDate: '',
        boostStartDate: '',
        profileColors: [],
        previousUsernames: [],
        oldIcons: [],
        oldBanners: [],
        lastMessages: [],
        lastCall: null,
        servers: [],
        viewHistory: [],
        rawEmbed: embed,
    };

    // Extract fields from embed
    if (embed.fields) {
        for (const field of embed.fields) {
            const fieldName = field.name.toLowerCase();
            const fieldValue = field.value;
            
            // Nitro status
            if (fieldName.includes('nitro') && !fieldName.includes('evolução') && !fieldName.includes('start') && !fieldName.includes('data')) {
                result.nitro = fieldValue.toLowerCase().includes('sim') || fieldValue.toLowerCase().includes('yes') || fieldValue.toLowerCase().includes('true');
            }
            
            // Nitro boost count
            if (fieldName.includes('boost') || fieldName.includes('impulso')) {
                const boostMatch = fieldValue.match(/(\d+)/);
                if (boostMatch) {
                    result.nitroBoost = parseInt(boostMatch[1]) || 0;
                }
            }
            
            // Nitro start date
            if (fieldName.includes('nitro') && (fieldName.includes('data') || fieldName.includes('start') || fieldName.includes('desde'))) {
                result.nitroStartDate = fieldValue.replace(/```/g, '').trim();
            }
            
            // Boost start date
            if (fieldName.includes('boost') && (fieldName.includes('data') || fieldName.includes('start') || fieldName.includes('desde'))) {
                result.boostStartDate = fieldValue.replace(/```/g, '').trim();
            }
            
            // Profile colors
            if (fieldName.includes('cores') || fieldName.includes('color') || fieldName.includes('cores do perfil')) {
                result.profileColors = fieldValue.split('\n').filter(c => c.trim());
            }
            
            // Previous usernames
            if (fieldName.includes('nome') || fieldName.includes('name') || fieldName.includes('username') || fieldName.includes('antigo')) {
                result.previousUsernames = fieldValue.split('\n').filter(n => n.trim());
            }
            
            // Old icons/avatars
            if (fieldName.includes('icon') || fieldName.includes('avatar') || fieldName.includes('ícone')) {
                result.oldIcons = fieldValue.match(/https?:\/\/[^\s]+/g) || [];
            }
            
            // Old banners
            if (fieldName.includes('banner') || fieldName.includes('fundo')) {
                result.oldBanners = fieldValue.match(/https?:\/\/[^\s]+/g) || [];
            }
            
            // Last messages
            if (fieldName.includes('mensagem') || fieldName.includes('message') || fieldName.includes('msg')) {
                result.lastMessages = fieldValue.split('\n').filter(m => m.trim());
            }
            
            // Last call / voice
            if (fieldName.includes('call') || fieldName.includes('vc') || fieldName.includes('chamada') || fieldName.includes('voice')) {
                result.lastCall = fieldValue.replace(/```/g, '').trim();
            }
            
            // Servers
            if (fieldName.includes('servidor') || fieldName.includes('server') || fieldName.includes('guild')) {
                result.servers = fieldValue.split('\n').filter(s => s.trim());
            }
            
            // View history
            if (fieldName.includes('visualização') || fieldName.includes('view') || fieldName.includes('histórico')) {
                result.viewHistory = fieldValue.split('\n').filter(v => v.trim());
            }
        }
    }

    // Try to extract user ID from message
    const idMatch = messageContent && messageContent.match(/\d{17,19}/);
    if (idMatch) {
        result.userId = idMatch[0];
    }

    console.log('🔍 Parsed result:', JSON.stringify(result, null, 2));
    return result;
}

// Parse zany bot message content
function parseZanyMessage(content) {
    console.log('🔍 Raw zany message:', content);
    
    const result = {
        userId: '',
        username: '',
        avatar: null,
        banner: null,
        nitro: false,
        nitroBoost: 0,
        profileColors: [],
        previousUsernames: [],
        oldIcons: [],
        oldBanners: [],
        lastMessages: [],
        lastCall: null,
        servers: [],
        viewHistory: [],
        rawContent: content,
    };
    
    // Parse the message content
    const lines = content.split('\n');
    
    for (const line of lines) {
        // Extract ID
        const idMatch = line.match(/:zany_id:\s*ID\s*(\d{17,19})/);
        if (idMatch) {
            result.userId = idMatch[1];
        }
        
        // Extract username (usually after :zany_user: or on a new line)
        const usernameMatch = line.match(/^([^\n:]+)$/);
        if (usernameMatch && usernameMatch[1] && !usernameMatch[1].includes(':zany_')) {
            result.username = usernameMatch[1].trim();
        }
        
        // Extract Nitro info
        if (line.includes(':zany_nitro:') || line.includes('Assinante Nitro')) {
            result.nitro = true;
        }
        
        // Extract Boost info
        if (line.includes(':zany_boosting:') || line.includes('Impulsionando')) {
            const boostMatch = line.match(/(\d+)\s*mês/);
            if (boostMatch) {
                result.nitroBoost = parseInt(boostMatch[1]);
            }
        }
    }
    
    // Try to get more info from the message
    // The first line is usually the username
    const firstLine = lines[0]?.trim();
    if (firstLine && !firstLine.includes(':') && firstLine.length > 0) {
        result.username = firstLine;
    }
    
    console.log('🔍 Parsed result:', result);
    return result;
}

// Evento quando o bot estiver pronto
client.on('ready', async () => {
    console.log(`✅ Selfbot logado como ${client.user.tag}!`);
    
    // Busca webhooks do banco de dados
    const webhooks = await getWebhooks(true);
    console.log(`📡 Carregados ${webhooks.length} webhooks do banco de dados`);
    console.log(`🌐 Enviando usernames para: ${SITE_URL}/api/webhooks/discord`);
    console.log(`🔍 Canal de busca: ${SEARCH_CHANNEL_ID}`);
    
    if (webhooks.length > 0) {
        console.log('\n📋 Canais do banco de dados:');
        for (const w of webhooks) {
            console.log(`   Canal: ${w.channelId} -> ${w.category} (${w.platform})`);
        }
    }
    
    console.log('\n📋 Canais fallback (hardcoded):');
    for (const canalId of Object.keys(CHANNEL_WEBHOOKS)) {
        const category = CHANNEL_CATEGORY_MAP[canalId] || 'RANDOM';
        console.log(`   Canal: ${canalId} -> ${category}`);
    }
    
    console.log('\n🚀 Aguardando mensagens...\n');
    
    // Atualiza webhooks a cada 5 minutos
    setInterval(async () => {
        console.log('🔄 Atualizando cache de webhooks...');
        await getWebhooks(true);
    }, 300000);
});

// Evento quando uma mensagem é atualizada (Zany bot edits message with embed)
client.on('messageUpdate', async (oldMessage, newMessage) => {
    // Handle zany bot response edit in search channel
    if (newMessage.channelId === SEARCH_CHANNEL_ID && newMessage.author) {
        if (newMessage.author.username === 'Zany') {
            console.log('🔍 Zany bot message updated');
            console.log('🔍 Has embeds:', newMessage.embeds.length > 0);
            await handleZanyBotResponse(newMessage);
        }
    }
});

// Evento quando uma mensagem é criada
client.on('messageCreate', async (message) => {
    // Handle zany bot response in search channel
    if (message.author.bot && message.channelId === SEARCH_CHANNEL_ID) {
        // Check if this is a new search result or additional data
        const isNewSearch = message.embeds.length > 0 && 
            message.embeds[0].author && 
            message.embeds[0].author.name;
        
        if (isNewSearch) {
            await handleZanyBotResponse(message);
        } else {
            await handleAdditionalZanyData(message);
        }
        return;
    }

    // Get channel ID
    const channelId = message.channel.id;
    
    // Check if we should monitor this channel (from DB or fallback)
    const webhooks = await getWebhooks();
    const dbWebhook = webhooks.find(w => w.channelId === channelId);
    const webhookUrl = dbWebhook ? dbWebhook.webhookUrl : CHANNEL_WEBHOOKS[channelId];
    
    // If not in DB and not in fallback, skip
    if (!dbWebhook && !CHANNEL_WEBHOOKS[channelId]) {
        return;
    }
    
    if (message.author.id === client.user.id) return;

    try {
        const autor = message.author.username;
        const avatarUrl = message.author.displayAvatarURL({ format: 'png', size: 256 });
        let conteudo = message.content;
        let embed = null;
        let username = null;
        let status = 'AVAILABLE'; // Default
        let availableDateStr = null; // For pending usernames

        // Debug: mostra o conteúdo completo
        console.log(`   Debug Conteudo: "${conteudo}"`);
        
        // Regex para: - **username** | Está disponível...
        // Remove markdown ** e pega só o username
        const regexGeral = /^-\s*\*\*(\S+)\*\*\s*\|\s*(.+)$/s;
        const match = conteudo.match(regexGeral);

        // Debug: mostra o match
        console.log(`   Debug Match: ${match ? 'sim' : 'não'}`);

        if (match) {
            username = match[1]; // Extrai o username (sem **)
            let mensagem = match[2];
            
            console.log(`   Debug Username: "${username}" Mensagem: "${mensagem.substring(0, 30)}..."`);
            
            // Verifica se contém "Está disponível" (pode ter ** ao redor)
            if (mensagem.includes('disponível')) {
                // Detectar se é disponível agora ou no futuro
                const dataMatch = mensagem.match(/(\d{1,2})\s*de\s*(\w+)\s*de\s*(\d{4})/);
                
                // Verificar se é Discord timestamp format: <t:timestamp:F>
                const discordTimestampMatch = mensagem.match(/<t:(\d+):F>/);
                
                if (mensagem.includes('a partir deste momento') || mensagem.includes('agora')) {
                    // Disponível AGORA
                    embed = {
                        title: `✅ ${username}`,
                        description: mensagem,
                        color: 0x00FF00,
                        timestamp: new Date().toISOString()
                    };
                    console.log(`\n📝 Nick disponível AGORA: ${username}`);
                    status = 'AVAILABLE';
                } else if (dataMatch || discordTimestampMatch || mensagem.includes('Estará disponível')) {
                    // Disponível no FUTURO - Extrair a data
                    let availableDate = null;
                    
                    if (discordTimestampMatch) {
                        // Converter Discord timestamp para data
                        const timestamp = parseInt(discordTimestampMatch[1]) * 1000;
                        const date = new Date(timestamp);
                        availableDate = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
                        console.log(`\n📝 Nick disponível NO FUTURO (Discord timestamp): ${username} - Data: ${availableDate}`);
                    } else if (dataMatch) {
                        const meses = {
                            'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
                            'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
                            'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
                        };
                        const dia = dataMatch[1];
                        const mes = meses[dataMatch[2].toLowerCase()] || '01';
                        const ano = dataMatch[3];
                        availableDate = `${ano}-${mes}-${dia.padStart(2, '0')}`;
                        console.log(`\n📝 Nick disponível NO FUTURO: ${username} - Data: ${availableDate}`);
                    } else {
                        console.log(`\n📝 Nick disponível NO FUTURO: ${username} - Data: não identificada (Estará disponível)`);
                    }
                    
                    embed = {
                        title: `⏰ ${username}`,
                        description: mensagem,
                        color: 0xFFFF00, // Amarelo
                        timestamp: new Date().toISOString()
                    };
                    status = 'PENDING';
                    availableDateStr = availableDate;
                }
            }
        } else {
            console.log(`   Debug: Regex não deu match`);
        }

        // Debug: mostra informações sobre a mensagem
        console.log(`   Debug: username="${username}" embed=${!!embed} color=${embed?.color} status=${status}`);

        // NOVO: Envia para o SEU SITE se for um username disponível ou pendente
        if (username && embed) {
            console.log(`   -> Enviando para o site... (status: ${status})`);
            await enviarParaSite(username, message.channel.id, status, availableDateStr);
        } else {
            console.log(`   -> Ignorando mensagem (não é username disponível)`);
        }

    } catch (error) {
        console.log(`❌ Erro ao processar mensagem: ${error.message}`);
    }
});

client.on('error', (error) => {
    console.error('❌ Erro no cliente:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Erro não tratado:', error);
});

client.login(TOKEN).catch((error) => {
    console.error('❌ Erro ao fazer login:', error.message);
    process.exit(1);
});

process.on('SIGINT', () => {
    console.log('\n\n🛑 Selfbot encerrado.');
    client.destroy();
    process.exit(0);
});
