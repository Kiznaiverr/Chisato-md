import axios from 'axios';
import font from '../../lib/font.js';

export default {
    command: 'profilegi',
    description: 'Get Genshin Impact profile information',
    category: 'fun',
    usage: '<uid>',
    cooldown: 5,
    async execute(context) {
        const { args, reply, sock, msg, react } = context;
        
        if (!args[0]) {
            return reply(`⚠️ ${font.bold(font.smallCaps('Usage'))}: profilegi <uid>\n\n📝 ${font.smallCaps('Example')}: profilegi 856012067`);
        }
        
        const uid = args[0];
        
        if (!/^\d{9}$/.test(uid)) {
            return reply(`❌ ${font.bold(font.smallCaps('Invalid UID'))}\n\n📋 ${font.smallCaps('UID must be 9 digits')}`);
        }
        
        try {
            await react('🕔');
            
            const response = await axios.get(`https://api.siputzx.my.id/api/check/genshin?uid=${uid}`, {
                timeout: 15000
            });
            
            const data = response.data;
            
            if (!data.status || !data.data) {
                return reply(`❌ ${font.bold(font.smallCaps('Profile Not Found'))}\n\n📋 ${font.smallCaps('Please check your UID and try again')}`);
            }
            
            const playerData = data.data.playerData;
            const characterCards = data.data.characterCards;
            
            let caption = `⛨〡︎ *${font.smallCaps('Username')}:* ${font.smallCaps(playerData.username)}\n`;
            caption += `⛨〡︎ *${font.smallCaps('Adventure Rank')}:* ${font.smallCaps(playerData.adventureRank)}\n`;
            caption += `⛨〡 *${font.smallCaps('World Level')}* : *${font.smallCaps(playerData.worldLevel)}*\n`;
            caption += `⛨〡 *${font.smallCaps('UID')}* : *${font.smallCaps(uid)}*\n`;
            
            if (playerData.signature) {
                caption += `⛨〡 *${font.smallCaps('Signature')}* : *"${font.smallCaps(playerData.signature)}"*\n`;
            }
            
            caption += `\n${font.bold(font.smallCaps('Statistics'))}\n`;
            caption += `⛨〡︎ *${font.smallCaps('Total Achievement')}:* ${font.smallCaps(playerData.stats.totalAchievement)}\n`;
            caption += `⛨〡︎ *${font.smallCaps('Spiral Abyss')}:* ${font.smallCaps(playerData.stats.spiralAbyss)}\n`;
            caption += `⛨〡︎ *${font.smallCaps('Theater')}:* ${font.smallCaps(playerData.stats.theater)}\n`;
            
            caption += `\n${font.bold(font.smallCaps('Genshin Impact Profile'))}`;
            
            if (characterCards && characterCards.length > 0) {
                for (const cardUrl of characterCards) {
                    try {
                        await sock.sendMessage(msg.key.remoteJid, {
                            image: { url: cardUrl },
                            caption: caption
                        }, { quoted: msg });
                        
                        caption = '';
                    } catch (imageError) {
                        console.error('Error sending character card:', imageError);
                    }
                }
                await react('✅');
            } else {
                try {
                    await sock.sendMessage(msg.key.remoteJid, {
                        image: { url: playerData.avatar },
                        caption: caption
                    }, { quoted: msg });
                    await react('✅');
                } catch (avatarError) {
                    await reply(caption);
                    await react('✅');
                }
            }
            
        } catch (error) {
            console.error('ProfileGI Error:', error);
            
            if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
                return reply(`⏰ ${font.bold(font.smallCaps('Request Timeout'))}\n\n📋 ${font.smallCaps('The API is taking too long to respond. Please try again later.')}`);
            }
            
            if (error.response?.status === 404) {
                return reply(`❌ ${font.bold(font.smallCaps('Profile Not Found'))}\n\n📋 ${font.smallCaps('Please check your UID and try again')}`);
            }
            
            if (error.response?.status === 429) {
                return reply(`🚫 ${font.bold(font.smallCaps('Rate Limited'))}\n\n📋 ${font.smallCaps('Too many requests. Please wait before trying again.')}`);
            }
            
            return reply(`❌ ${font.bold(font.smallCaps('Error Occurred'))}\n\n📋 ${font.smallCaps('Failed to fetch profile data. Please try again later.')}`);
        }
    }
};
