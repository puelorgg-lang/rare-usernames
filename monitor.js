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

// Users that have been searched on the site - we track these for updates
let trackedUsers = new Set();

// Buscar webhooks do banco de dados via API
async function fetchWebhooksFromAPI() {
  try {
    const response = await axios.get(`${SITE_URL}/api/admin/webhooks`);
    return response.data;
  } catch (error) {
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
    
    // Log the search request
    console.log(`\n🔍 SEARCH: User "${query}" - Category: ${searchCategory}`);
    
    // Check if client is ready
    if (!client || !client.isReady()) {
        console.log(`⚠️ SELFBOT NOT READY: Bot is not logged in`);
        return res.status(503).json({ error: 'Selfbot não pronto. Verifique se o bot está logado.' });
    }
    
    console.log(`🔍 Starting search for: ${query} (client ready: ${client.isReady()})`);

    try {
        // Use selfbot to fetch user directly - with better error handling
        let user = null;
        let userId = query;
        
        // Check if query is a valid Discord ID (numbers only)
        if (/^\d+$/.test(query)) {
            // It's a Discord ID - clear cache and fetch fresh data using Discord.js
            console.log(`🔍 Search by ID: ${query}`);
            try {
                // Clear from cache first
                client.users.cache.delete(query);
                // Also try to remove from someUsers cache if exists
                if (client.users.someUsers) {
                    client.users.someUsers.delete(query);
                }
                
                // Use Discord.js fetch which handles caching better
                user = await client.users.fetch(query);
            } catch (e) {
                console.log(`🔍 Error fetching user ${query} via Discord.js:`, e.message);
                
                // Fallback: try direct API call with selfbot token
                try {
                    const token = client.token || TOKEN;
                    const response = await axios.get(`https://discord.com/api/v8/users/${query}`, {
                        headers: { Authorization: token }
                    });
                    
                    if (response.data && !response.data.message) {
                        const userData = response.data;
                        user = {
                            id: userData.id,
                            username: userData.username,
                            displayName: userData.global_name || userData.username,
                            tag: `${userData.username}#${userData.discriminator}`,
                            avatar: userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=4096` : null,
                            banner: userData.banner ? `https://cdn.discordapp.com/banners/${userData.id}/${userData.banner}.png?size=4096` : null,
                            createdAt: new Date(((parseInt(userData.id) >> 22) + 1420070400000)),
                            flags: userData.public_flags ? [userData.public_flags] : [],
                            presence: { status: 'offline' },
                            displayAvatarURL: function(options = {}) {
                                if (!this.avatar) return null;
                                const format = options.dynamic ? 'gif' : 'png';
                                const size = options.size || 4096;
                                return `https://cdn.discordapp.com/avatars/${this.id}/${this.avatar}.${format}?size=${size}`;
                            },
                            bannerURL: function(options = {}) {
                                if (!this.banner) return null;
                                const format = options.dynamic ? 'gif' : 'png';
                                const size = options.size || 4096;
                                return `https://cdn.discordapp.com/banners/${this.id}/${this.banner}.${format}?size=${size}`;
                            }
                        };
                    }
                } catch (apiErr) {
                    console.log(`🔍 Error fetching user via API:`, apiErr.message);
                }
            }
        } else {
            // It's a username - search in cache first, then force refresh
            let cachedUser = client.users.cache.find(u => 
                (u.username && u.username.toLowerCase() === query.toLowerCase()) ||
                (u.tag && u.tag.toLowerCase() === query.toLowerCase())
            );
            
            // Clear from cache to force fresh fetch
            if (cachedUser) {
                client.users.cache.delete(cachedUser.id);
            }
            
            // If not in cache, try to find in mutual guilds
            if (!cachedUser && client.guilds.cache.size > 0) {
                // Search in all cached guild members
                for (const guild of client.guilds.cache.values()) {
                    try {
                        const member = await guild.members.fetch({ query: query, limit: 1 });
                        if (member && member.size > 0) {
                            const foundMember = member.first();
                            if (foundMember && foundMember.user) {
                                cachedUser = foundMember.user;
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
                // Clear from cache to force fresh data
                if (cachedUser) {
                    client.users.cache.delete(cachedUser.id);
                }
            }
            
            if (cachedUser) {
                // Get the user ID and fetch fresh data from API
                const userIdToFetch = cachedUser.id;
                // Clear from cache first
                client.users.cache.delete(cachedUser.id);
                // Now fetch fresh data
                try {
                    user = await client.users.fetch(userIdToFetch);
                } catch (e) {
                    user = cachedUser; // Fallback to cached if fetch fails
                }
            } else {
                // If not found in cache or guilds, try to resolve via Discord API
                try {
                    client.users.cache.delete(query);
                    user = await client.users.fetch(query);
                } catch (e) {
                    console.log(`🔍 User "${query}" not found in cache or via API`);
                }
            }
        }
        
        if (user) {
            // Always clear cache and fetch fresh data
            client.users.cache.delete(user.id);
            try {
                user = await client.users.fetch(user.id);
            } catch (e) {
                // Keep original if fetch fails
            }
            
            // Fetch banner directly from Discord API
            let bannerUrl = null;
            try {
                // Try to get the token from the logged-in client
                const token = client.token || TOKEN;
                
                // Selfbot uses user token - try both with and without Bot prefix
                let response;
                try {
                    response = await axios.get(`https://discord.com/api/v8/users/${user.id}`, {
                        headers: { Authorization: token }
                    });
                } catch (authErr) {
                    // If that fails, try with Bot prefix
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
            // Try to get presence status from different sources
            let userStatus = 'offline';
            
            // Try from user.presence first
            if (user.presence?.status) {
                userStatus = user.presence.status;
                console.log('🔍 Status from user.presence:', userStatus);
            }
            
            // Try to get from guilds (members have more complete presence data)
            if (userStatus === 'offline' && client.guilds.cache.size > 0) {
                for (const guild of client.guilds.cache.values()) {
                    const member = guild.members.cache.get(user.id);
                    if (member && member.presence?.status) {
                        userStatus = member.presence.status;
                        console.log('🔍 Status from guild member:', userStatus, 'guild:', guild.name);
                        break;
                    }
                }
            }
            
            console.log('🔍 Final user status:', userStatus);
            
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
                // Get presence/status from the user
                status: userStatus,
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
            
            // Track this user for future updates
            trackedUsers.add(user.id);
            
            // Save user data to database for caching
            try {
                console.log(`💾 Saving user to database: ${user.username}`);
                await axios.post(`${SITE_URL}/api/user-search`, {
                    discordId: user.id,
                    username: user.username,
                    displayName: user.displayName || user.username,
                    avatar: result.avatar,
                    banner: result.banner,
                    tag: user.tag,
                    status: userStatus
                });
                console.log(`✅ FOUND: ${user.username}#${user.tag} (ID: ${user.id})`);
            } catch (e) {
                // Silent fail for database save
            }
            
            res.json(result);
            console.log(`📤 Returning result for: ${user.username} - Avatar: ${result.avatar ? 'YES' : 'NO'}`);
        } else {
            // User not found via selfbot - return error with helpful message
            console.log(`❌ NOT FOUND: "${query}" could not be found`);
            res.status(404).json({ 
                error: 'Usuário não encontrado. Verifique se o usuário existe ou se está em algum servidor em comum com o bot.' 
            });
            
            // If we get here, both methods failed
            console.log(`❌ NOT FOUND: "${query}" could not be found`);
            res.status(404).json({ error: 'Usuário não encontrado. Tente usar o ID do Discord ou certifique-se que o usuário está em algum servidor em comum com o bot.' });
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
            return false;
        }
    } catch (error) {
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
            // Notifica o bot do Discord
            const BOT_URL = process.env.BOT_URL || 'http://localhost:3001';
            if (BOT_URL) {
                try {
                    await axios.post(`${BOT_URL}/api/notify-bot`, {
                        username,
                        category,
                        platform
                    });
                } catch (err) {
                    // Erro ao notificar bot
                }
            }
            
            // Notifica os clientes conectados para atualizar
            await axios.post(`${SITE_URL}/api/notify`);
            
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

// Handle zany bot response for search
async function handleZanyBotResponse(message) {
    // Only process messages from Zany bot
    if (message.author.username !== 'Zany') {
        return;
    }
    
    // Check if this is the "buscando" message - ignore it
    if (message.content.includes('Buscando informações') || message.content.includes('aguarde')) {
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
    // Busca webhooks do banco de dados
    const webhooks = await getWebhooks(true);
    
    // Atualiza webhooks a cada 5 minutos
    setInterval(async () => {
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
        // Check if message has embeds
        if (message.embeds && message.embeds.length > 0) {
            const embed = message.embeds[0];
            let username = null;
            
            const title = embed.title || '';
            const description = embed.description || '';
            
            let fieldContent = '';
            if (embed.fields && embed.fields.length > 0) {
                for (const field of embed.fields) {
                    fieldContent += (field.name || '') + ' ' + (field.value || '') + ' ';
                }
            }
            
            const allText = title + ' ' + description + ' ' + fieldContent;
            
            const usernameMatch = allText.match(/```([a-zA-Z0-9_\.\-]+)```/);
            
            if (usernameMatch) {
                username = usernameMatch[1].toLowerCase();
                
                try {
                    await axios.post(`${SITE_URL}/api/usernames`, {
                        name: username,
                        platform: 'discord',
                        category: 'FEED'
                    });
                } catch (err) {
                    // Error saving username
                }
            }
        }
        
        const messageContent = message.content || '';
        if (messageContent.includes('```')) {
            const contentMatch = messageContent.match(/```([a-zA-Z0-9_\.\-]+)```/);
            if (contentMatch) {
                const username = contentMatch[1].toLowerCase();
                
                try {
                    await axios.post(`${SITE_URL}/api/usernames`, {
                        name: username,
                        platform: 'discord',
                        category: 'FEED'
                    });
                } catch (err) {
                    // Error saving username
                }
            }
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

        // Regex para: - **username** | Está disponível...
        const regexGeral = /^-\s*\*\*(\S+)\*\*\s*\|\s*(.+)$/s;
        const match = conteudo.match(regexGeral);

        if (match) {
            username = match[1];
            let mensagem = match[2];
            
            if (mensagem.includes('disponível')) {
                const dataMatch = mensagem.match(/(\d{1,2})\s*de\s*(\w+)\s*de\s*(\d{4})/);
                const discordTimestampMatch = mensagem.match(/<t:(\d+):F>/);
                
                if (mensagem.includes('a partir deste momento') || mensagem.includes('agora')) {
                    // Disponível AGORA
                    embed = {
                        title: `✅ ${username}`,
                        description: mensagem,
                        color: 0x00FF00,
                        timestamp: new Date().toISOString()
                    };
                    status = 'AVAILABLE';
                } else if (dataMatch || discordTimestampMatch || mensagem.includes('Estará disponível')) {
                    // Disponível no FUTURO - Extrair a data
                    let availableDate = null;
                    
                    if (discordTimestampMatch) {
                        // Converter Discord timestamp para data
                        const timestamp = parseInt(discordTimestampMatch[1]) * 1000;
                        const date = new Date(timestamp);
                        availableDate = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
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
                    } else {
                        // Estará disponível
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
            // No match
        }

        if (username && embed) {
            await enviarParaSite(username, message.channel.id, status, availableDateStr);
        } else {
            // Not a username availability message
        }

    } catch (error) {
        console.log(`❌ Erro ao processar mensagem: ${error.message}`);
    }
});

// Event: Track user updates for searched users only
client.on('userUpdate', async (oldUser, newUser) => {
    // Only track users that have been searched on the site
    if (!trackedUsers.has(newUser.id)) return;
    
    try {
        // Get full user data with fetch
        const user = await client.users.fetch(newUser.id).catch(() => null);
        if (!user) return;
        
        // Get avatar URL
        const avatar = user.displayAvatarURL({ format: 'png', size: 4096 });
        const banner = user.bannerURL({ format: 'png', size: 4096 });
        
        // Save to database
        await axios.post(`${SITE_URL}/api/user-search`, {
            discordId: user.id,
            username: user.username,
            displayName: user.globalName || user.username,
            avatar: avatar,
            banner: banner,
            tag: user.tag,
            status: 'online'
        });
        
        console.log(`👤 Updated tracked user ${user.username} (${user.id}) in database`);
    } catch (error) {
        console.log(`❌ Error updating tracked user: ${error.message}`);
    }
});

// Event: Track presence updates for searched users only
client.on('presenceUpdate', async (oldPresence, newPresence) => {
    // Only track users that have been searched on the site
    if (!newPresence || !newPresence.userId) return;
    if (!trackedUsers.has(newPresence.userId)) return;
    
    try {
        const user = await client.users.fetch(newPresence.userId).catch(() => null);
        if (!user) return;
        
        // Get status
        const userStatus = newPresence.activities && newPresence.activities.length > 0 
            ? newPresence.activities[0].name || 'online'
            : 'online';
        
        // Get avatar URL
        const avatar = user.displayAvatarURL({ format: 'png', size: 4096 });
        const banner = user.bannerURL({ format: 'png', size: 4096 });
        
        // Save to database
        await axios.post(`${SITE_URL}/api/user-search`, {
            discordId: user.id,
            username: user.username,
            displayName: user.globalName || user.username,
            avatar: avatar,
            banner: banner,
            tag: user.tag,
            status: userStatus
        });
        
        console.log(`📊 Updated tracked user ${user.username} status to ${userStatus}`);
    } catch (error) {
        console.log(`❌ Error updating tracked user presence: ${error.message}`);
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
