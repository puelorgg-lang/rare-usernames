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

// Mapeamento: Canal de Origem -> URL do Webhook do Discord
const CHANNEL_WEBHOOKS = {
    '1420065854401413231': 'https://discord.com/api/webhooks/1473341387830460590/qnoxDJTfKVwOrR5VetNNF7qwi5rtgKSQU1y2Uu0M4oXmyHxKRuXbzm4anK7iZLREHIrw',
    '1420065865029652652': 'https://discord.com/api/webhooks/1473341491882492137/9Agsgap0uqYjPZvtS2jvDDNrHLLo8TOw5qLbVFzijCZGPaQKUNsPhJOTPEJM7k5VmMLe',
    '1420065875880316968': 'https://discord.com/api/webhooks/1473341555795562528/fAhvuUYR75Mu1OfKAPCgjm4TPl55luMbQYUb9J_YAZ6MmTzfS2YfClyOpewQYXscplEJ',
    '1420065886928244756': 'https://discord.com/api/webhooks/1473341640881082565/omDeHXnBsM5cpU3IC-ZIzUkQkOvlC6iU5r5guUgTZK2S65lMOWazmh7y0o_kKKlc3tUN',
    '1420065898370175038': 'https://discord.com/api/webhooks/1473341694903849285/fLbwFx2hIkqfzTsLtQ8pnunTcuu-A2cJoAQnfIrYIfxLMwDUfkCwui3QyLG3yv96z7CJ',
    '1420065909611036863': 'https://discord.com/api/webhooks/1473341763359084849/0dT4aTtz4nU48ZYCjiB0pgwpSfNoeOHkpFnguUdqQtgKZQigfl-NVHdWPL5wCsHfHVAL',
};

// Mapeamento: Canal ID -> Categoria do site
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

// API endpoint for search from web
app.post('/api/search', async (req, res) => {
    const { query, option, channelId, serverId } = req.body;
    
    if (!query) {
        return res.status(400).json({ error: 'Query (ID or username) is required' });
    }

    // Create a unique ID for this search
    const searchId = `${query}-${Date.now()}`;
    
    // Store resolve/reject functions
    const searchPromise = new Promise((resolve, reject) => {
        pendingSearches.set(searchId, { 
            resolve, 
            reject, 
            startTime: Date.now(),
            timeout: setTimeout(() => {
                pendingSearches.delete(searchId);
                reject(new Error('Timeout waiting for bot response'));
            }, 60000) 
        });
    });

    try {
        // Send command to Discord channel using selfbot
        console.log('🔍 Checking selfbot status...');
        console.log('🔍 Client ready:', client.isReady());
        console.log('🔍 Client user:', client.user ? client.user.tag : 'No user');
        console.log('🔍 Channel ID:', channelId || SEARCH_CHANNEL_ID);
        console.log('🔍 Query:', query);
        
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

// ==================== SELFBOT CODE ====================
const client = new Client({
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
        const category = CHANNEL_CATEGORY_MAP[channelId] || 'RANDOM';
        
        const response = await axios.post(`${SITE_URL}/api/webhooks/discord`, {
            content: username,
            channel_id: channelId,
            status: status,
            available_date: availableDate,
        });

        if (response.data.success) {
            console.log(`   ✅ Salvo no site: ${username} (${category}) - ${response.data.count} usernames`);
            
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
            
            pending.resolve(result);
            pendingSearches.delete(searchId);
            console.log(`🔍 Search completed for ${searchId}`);
            return;
        }
    }
    
    console.log('🔍 No pending search found for zany bot response');
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
        rawEmbed: embed,
    };

    // Extract fields from embed
    if (embed.fields) {
        for (const field of embed.fields) {
            const fieldName = field.name.toLowerCase();
            const fieldValue = field.value;
            
            if (fieldName.includes('nitro')) {
                result.nitro = fieldValue.toLowerCase().includes('sim') || fieldValue.toLowerCase().includes('yes');
            }
            if (fieldName.includes('boost')) {
                result.nitroBoost = parseInt(fieldValue) || 0;
            }
            if (fieldName.includes('cores') || fieldName.includes('color')) {
                result.profileColors = fieldValue.split('\n').filter(c => c.trim());
            }
            if (fieldName.includes('nome') || fieldName.includes('name')) {
                result.previousUsernames = fieldValue.split('\n').filter(n => n.trim());
            }
            if (fieldName.includes('icon')) {
                result.oldIcons = fieldValue.match(/https?:\/\/[^\s]+/g) || [];
            }
            if (fieldName.includes('banner')) {
                result.oldBanners = fieldValue.match(/https?:\/\/[^\s]+/g) || [];
            }
            if (fieldName.includes('mensagem') || fieldName.includes('message')) {
                result.lastMessages = fieldValue.split('\n').filter(m => m.trim());
            }
            if (fieldName.includes('call') || fieldName.includes('vc')) {
                result.lastCall = fieldValue;
            }
            if (fieldName.includes('servidor') || fieldName.includes('server')) {
                result.servers = fieldValue.split('\n').filter(s => s.trim());
            }
            if (fieldName.includes('visualização') || fieldName.includes('view')) {
                result.viewHistory = fieldValue.split('\n').filter(v => v.trim());
            }
        }
    }

    // Try to extract user ID from message
    const idMatch = messageContent && messageContent.match(/\d{17,19}/);
    if (idMatch) {
        result.userId = idMatch[0];
    }

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
client.on('ready', () => {
    console.log(`✅ Selfbot logado como ${client.user.tag}!`);
    console.log(`📡 Monitorando ${Object.keys(CHANNEL_WEBHOOKS).length} canais`);
    console.log(`🌐 Enviando usernames para: ${SITE_URL}/api/webhooks/discord`);
    console.log(`🔍 Canal de busca: ${SEARCH_CHANNEL_ID}`);
    console.log('\n📋 Canais configurados:');
    for (const canalId of Object.keys(CHANNEL_WEBHOOKS)) {
        const category = CHANNEL_CATEGORY_MAP[canalId] || 'RANDOM';
        console.log(`   Canal: ${canalId} -> ${category}`);
    }
    console.log('\n🚀 Aguardando mensagens...\n');
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
        await handleZanyBotResponse(message);
        return;
    }

    const webhookUrl = CHANNEL_WEBHOOKS[message.channel.id];
    if (!webhookUrl) return;
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
