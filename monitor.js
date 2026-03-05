require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client } = require('discord.js-selfbot-v13');
const axios = require('axios');

const TOKEN = process.env.DISCORD_TOKEN;

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

// ==================== EXTERNAL DISCORD SOURCES ====================
// Additional Discord servers/channels to scan for usernames
const EXTERNAL_SOURCES = [
    {
        name: 'Void Usernames',
        channelId: '1418700979687133394',  // Channel ID
        category: 'FEED'
    }
];

// External Discord sources - track last processed message
let lastProcessedMessages = {};

// Function to scan external sources for usernames
async function scanExternalSources() {
    console.log('🔄 Scanning external Discord sources...');
    
    for (const source of EXTERNAL_SOURCES) {
        try {
            const channel = await client.channels.fetch(source.channelId);
            if (!channel) {
                console.log(`⚠️ Channel not found: ${source.channelId}`);
                continue;
            }
            
            // Get the last processed message ID for this source
            const lastId = lastProcessedMessages[source.channelId];
            
            // Fetch only recent messages (limit to 5 for efficiency)
            const options = { limit: 5 };
            if (lastId) {
                options.after = lastId;
            }
            
            const messages = await channel.messages.fetch(options);
            
            if (messages.size === 0) {
                console.log(`📭 No new messages in ${source.name}`);
                continue;
            }
            
            console.log(`📬 Found ${messages.size} new message(s) in ${source.name}`);
            
            // Sort messages by timestamp (oldest first)
            const sortedMessages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
            
            let newLastId = lastId;
            
            for (const [id, message] of sortedMessages) {
                // Update the last processed ID
                newLastId = id;
                
                // Check if message has embeds
                if (message.embeds && message.embeds.length > 0) {
                    const embed = message.embeds[0];
                    let username = null;
                    
                    // Try to extract username from embed
                    // Format: Discord Username
                    // ```username```
                    // Void Usernames•Hoje às 18:26
                    
                    // Check in embed title
                    const title = embed.title || '';
                    
                    // Check in embed description
                    const description = embed.description || '';
                    
                    // Check in embed fields
                    let fieldContent = '';
                    if (embed.fields && embed.fields.length > 0) {
                        for (const field of embed.fields) {
                            fieldContent += (field.name || '') + ' ' + (field.value || '') + ' ';
                        }
                    }
                    
                    // Combine all text sources
                    const allText = title + ' ' + description + ' ' + fieldContent;
                    
                    // Try to match username in code blocks: ```username```
                    const usernameMatch = allText.match(/```([a-zA-Z0-9_\.\-]+)```/);
                    
                    if (usernameMatch) {
                        username = usernameMatch[1].toLowerCase();
                        console.log(`📝 Found username: ${username} from ${source.name}`);
                        console.log(`📝 Embed title: "${title}"`);
                        console.log(`📝 Embed description: "${description.substring(0, 50)}..."`);
                        
                        // Send to API to save
                        try {
                            await axios.post(`${SITE_URL}/api/usernames`, {
                                name: username,
                                platform: 'discord',
                                category: source.category
                            });
                            console.log(`✅ Saved username: ${username}`);
                        } catch (err) {
                            console.log(`⚠️ Error saving username: ${err.message}`);
                        }
                    } else {
                        // Try alternative format: plain username (no code blocks)
                        // Some embeds might have username directly in description
                        const plainUsernameMatch = allText.match(/^([a-zA-Z0-9_\.\-]+)$/m);
                        if (plainUsernameMatch && title.toLowerCase().includes('username')) {
                            username = plainUsernameMatch[1].toLowerCase();
                            console.log(`📝 Found username (plain): ${username} from ${source.name}`);
                            
                            try {
                                await axios.post(`${SITE_URL}/api/usernames`, {
                                    name: username,
                                    platform: 'discord',
                                    category: source.category
                                });
                                console.log(`✅ Saved username: ${username}`);
                            } catch (err) {
                                console.log(`⚠️ Error saving username: ${err.message}`);
                            }
                        }
                    }
                }
                
                // Also check message content (non-embed messages)
                // Format might be plain text with username
                const messageContent = message.content || '';
                if (messageContent.includes('```')) {
                    const contentMatch = messageContent.match(/```([a-zA-Z0-9_\.\-]+)```/);
                    if (contentMatch) {
                        const username = contentMatch[1].toLowerCase();
                        console.log(`📝 Found username from message content: ${username} from ${source.name}`);
                        
                        try {
                            await axios.post(`${SITE_URL}/api/usernames`, {
                                name: username,
                                platform: 'discord',
                                category: source.category
                            });
                            console.log(`✅ Saved username: ${username}`);
                        } catch (err) {
                            console.log(`⚠️ Error saving username: ${err.message}`);
                        }
                    }
                }
            }
            
            // Update last processed message ID
            if (newLastId && newLastId !== lastId) {
                lastProcessedMessages[source.channelId] = newLastId;
                console.log(`📌 Updated last processed message ID for ${source.name}: ${newLastId}`);
            }
            
        } catch (error) {
            console.error(`❌ Error scanning ${source.name}:`, error.message);
        }
    }
}

// Scan external sources every 30 seconds
setInterval(scanExternalSources, 30000);

// Initial scan after client is ready
setTimeout(scanExternalSources, 5000);

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
        // Use selfbot to fetch user directly
        console.log('🔍 Checking selfbot status...');
        console.log('🔍 Client exists:', !!client);
        console.log('🔍 Client ready:', client?.isReady());
        console.log('🔍 Client user:', client?.user ? client.user.tag : 'No user');
        console.log('🔍 Query:', query);
        console.log('🔍 Category:', searchCategory);
        
        if (client && client.isReady()) {
            console.log('🔍 Client is ready, proceeding with search...');
            // Try to find user by ID or username
            let user = null;
            let userId = query;
            
            // Check if query is a valid Discord ID (numbers only)
            if (/^\d+$/.test(query)) {
                // It's a Discord ID - fetch from API
                try {
                    user = await client.users.fetch(query, true);
                } catch (e) {
                    console.log('🔍 Could not fetch user by ID:', e.message);
                }
            } else {
                // It's a username - try to find in cache first
                let cachedUser = client.users.cache.find(u => 
                    (u.username && u.username.toLowerCase() === query.toLowerCase()) ||
                    (u.tag && u.tag.toLowerCase() === query.toLowerCase())
                );
                
                // If not in cache, try to find in mutual guilds
                if (!cachedUser && client.guilds.cache.size > 0) {
                    console.log('🔍 Not in cache, searching in mutual guilds...');
                    
                    // Search in all cached guild members
                    for (const guild of client.guilds.cache.values()) {
                        try {
                            const member = await guild.members.fetch({ query: query, limit: 1 });
                            if (member && member.size > 0) {
                                const foundMember = member.first();
                                if (foundMember && foundMember.user) {
                                    cachedUser = foundMember.user;
                                    console.log('🔍 Found user in guild:', guild.name);
                                    break;
                                }
                            }
                        } catch (e) {
                            // Continue to next guild
                        }
                    }
                }
                
                // If still not found, try username#discriminator format
                if (!cachedUser && query.includes('#')) {
                    const [username, discriminator] = query.split('#');
                    cachedUser = client.users.cache.find(u => 
                        u.username.toLowerCase() === username.toLowerCase() && 
                        u.discriminator === discriminator
                    );
                }
                
                if (cachedUser) {
                    user = cachedUser;
                } else {
                    // If not found in cache or guilds, try to resolve via Discord API
                    console.log('🔍 User not found in cache or guilds. Attempting to resolve via API...');
                    try {
                        // Try using the users endpoint directly
                        // Note: This may not work for all users due to privacy settings
                        user = await client.users.fetch(query, true);
                    } catch (e) {
                        console.log('🔍 Could not resolve username:', e.message);
                        return res.status(404).json({ 
                            error: 'Usuário não encontrado. Tente usar o ID do Discord ou certifique-se que o usuário está em algum servidor em comum com o bot.' 
                        });
                    }
                }
            }
            
            if (user) {
                console.log('🔍 User found:', user.tag);
                
                // Fetch banner directly from Discord API since selfbot fetch might not work
                let bannerUrl = null;
                try {
                    // Try to get the token from the logged-in client
                    const token = client.token || TOKEN;
                    console.log('🔍 Using client token:', token ? 'Token available' : 'No token');
                    
                    // Selfbot uses user token - try both with and without Bot prefix
                    let response;
                    try {
                        response = await axios.get(`https://discord.com/api/v8/users/${user.id}`, {
                            headers: { Authorization: token }
                        });
                    } catch (authErr) {
                        // If that fails, try with Bot prefix
                        console.log('🔍 First auth attempt failed, trying with Bot prefix...');
                        response = await axios.get(`https://discord.com/api/v8/users/${user.id}`, {
                            headers: { Authorization: `Bot ${token}` }
                        });
                    }
                    
                    const userData = response.data;
                    console.log('🔍 User API data:', JSON.stringify(userData));
                    
                    if (userData.banner) {
                        let format = 'png';
                        if (userData.banner.substring(0, 2) === 'a_') {
                            format = 'gif';
                        }
                        bannerUrl = `https://cdn.discordapp.com/banners/${user.id}/${userData.banner}.${format}?size=4096`;
                        console.log('🔍 Banner URL from API:', bannerUrl);
                    } else {
                        console.log('🔍 User has no banner');
                    }
                } catch (e) {
                    console.log('🔍 Error fetching banner from API:', e.message);
                }
                
                // Build comprehensive profile data
                const result = {
                    userId: user.id,
                    username: user.username,
                    displayName: user.displayName || user.username,
                    avatar: user.displayAvatarURL({ dynamic: true, size: 4096 }),
                    banner: bannerUrl,
                    tag: user.tag,
                    createdAt: user.createdAt.toISOString(),
                    flags: user.flags ? user.flags.toArray() : [],
                    nitro: false,
                    nitroBoost: 0,
                    // Additional data that can be fetched
                    profile: {
                        // Placeholder for profile data
                        biography: null,
                        pronouns: null,
                    },
                    // Placeholder for other data (would need API calls)
                    messages: [],
                    calls: [],
                    servers: [],
                    alts: [],
                    connections: [],
                    interactions: [],
                    statistics: {
                        accountAge: Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
                        friendCount: 0,
                        mutualGuilds: 0,
                    },
                    bans: [],
                    badges: [],
                };
                
                // Try to fetch mutual guilds
                if (client.guilds) {
                    const mutuals = [];
                    for (const [guildId, guild] of client.guilds.cache) {
                        try {
                            const member = await guild.members.fetch(user.id);
                            if (member) {
                                mutuals.push({
                                    id: guild.id,
                                    name: guild.name,
                                    icon: guild.iconURL(),
                                    joinedAt: member.joinedAt,
                                    roles: member.roles.cache.map(r => r.name),
                                });
                            }
                        } catch (e) {
                            // Can't fetch member
                        }
                    }
                    result.servers = mutuals;
                    result.statistics.mutualGuilds = mutuals.length;
                }
                
                // Check for nitro based on badges/flags
                if (result.flags) {
                    const nitroFlags = ['NITRO', 'NITRO_CLASSIC', 'NITRO_BASIC'];
                    result.nitro = result.flags.some(f => nitroFlags.includes(f));
                }
                
                // Save avatar to history
                if (result.avatar) {
                    try {
                        await axios.post(`${SITE_URL}/api/avatar-history`, {
                            discordId: user.id,
                            avatarUrl: result.avatar
                        });
                    } catch (e) {
                        console.log('🔍 Could not save avatar history:', e.message);
                    }
                }
                
                // Save banner to history
                if (result.banner) {
                    try {
                        await axios.post(`${SITE_URL}/api/banner-history`, {
                            discordId: user.id,
                            bannerUrl: result.banner
                        });
                    } catch (e) {
                        console.log('🔍 Could not save banner history:', e.message);
                    }
                }
                
                // Add search category to result
                result.searchCategory = searchCategory;
                
                res.json(result);
            } else {
                console.log('🔍 User not found!');
                res.status(404).json({ error: 'Usuário não encontrado' });
            }
        } else {
            console.log('🔍 Selfbot not ready!');
            res.status(503).json({ error: 'Selfbot não pronto. Verifique se o bot está logado.' });
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


// ==================== SELFBOT CODE ====================
const client = new Client({
    checkUpdate: false,
    intents: [
        'GUILDS',
        'GUILD_MESSAGES',
        'DIRECT_MESSAGES',
        'GUILD_MEMBERS',
        'GUILD_PRESENCES',
    ]
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
            
            // Notifica o bot do Discord
            const BOT_URL = process.env.BOT_URL || 'http://localhost:3001';
            if (BOT_URL) {
                try {
                    await axios.post(`${BOT_URL}/api/notify-bot`, {
                        username,
                        category,
                        platform
                    });
                    console.log(`   ✅ Notificado ao bot`);
                } catch (err) {
                    console.log(`   ⚠️ Erro ao notificar bot: ${err.message}`);
                }
            }
            
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
    
    // ============================================
    // Handle Void Usernames (external source) in REAL-TIME
    // ============================================
    const voidUsernamesChannelId = '1418700979687133394';
    if (message.channelId === voidUsernamesChannelId) {
        console.log('📬 New message from Void Usernames channel');
        
        // Check if message has embeds
        if (message.embeds && message.embeds.length > 0) {
            const embed = message.embeds[0];
            let username = null;
            
            // Extract username from embed format:
            // Discord Username
            // ```username```
            // Void Usernames•Hoje às 18:26
            
            const title = embed.title || '';
            const description = embed.description || '';
            
            // Check embed fields
            let fieldContent = '';
            if (embed.fields && embed.fields.length > 0) {
                for (const field of embed.fields) {
                    fieldContent += (field.name || '') + ' ' + (field.value || '') + ' ';
                }
            }
            
            const allText = title + ' ' + description + ' ' + fieldContent;
            
            // Match username in code blocks: ```username```
            const usernameMatch = allText.match(/```([a-zA-Z0-9_\.\-]+)```/);
            
            if (usernameMatch) {
                username = usernameMatch[1].toLowerCase();
                console.log(`📝 Found username from Void Usernames (FEED): ${username}`);
                
                // Send to API to save with FEED category
                try {
                    console.log(`📤 Sending to API: ${SITE_URL}/api/usernames`);
                    await axios.post(`${SITE_URL}/api/usernames`, {
                        name: username,
                        platform: 'discord',
                        category: 'FEED'
                    });
                    console.log(`✅ Saved username: ${username} to FEED`);
                } catch (err) {
                    console.log(`⚠️ Error saving username: ${err.message}`);
                }
            }
        }
        
        // Also check message content (non-embed)
        const messageContent = message.content || '';
        if (messageContent.includes('```')) {
            const contentMatch = messageContent.match(/```([a-zA-Z0-9_\.\-]+)```/);
            if (contentMatch) {
                const username = contentMatch[1].toLowerCase();
                console.log(`📝 Found username from Void Usernames (FEED): ${username}`);
                
                try {
                    await axios.post(`${SITE_URL}/api/usernames`, {
                        name: username,
                        platform: 'discord',
                        category: 'FEED'
                    });
                    console.log(`✅ Saved username: ${username} to FEED`);
                } catch (err) {
                    console.log(`⚠️ Error saving username: ${err.message}`);
                }
            }
        }
        
        return; // Don't process this message further
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
