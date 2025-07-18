import { randomWaifu } from '../../lib/scraper/random-waifu.js';
import font from '../../lib/font.js';

export default {
    command: 'waifu',
    aliases: ['randomwaifu', 'waifupic'],
    category: 'media',
    description: 'Kirim gambar waifu random',
    usage: '',
    limit: 1,
    cooldown: 3,

    async execute({ reply, sock, msg, react }) {
        await react('🔍');

        try {
            const result = await randomWaifu();

            if (result.status !== 200 || !result.data || !result.data.url) {
                await react('❌');
                return reply(`${font.smallCaps('Gagal mendapatkan gambar waifu: ')} ${result.error || 'Unknown error'}`);
            }

            const { url, source, timestamp } = result.data;

            await react('✅');
            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: url },
                caption: `🎭 ${font.bold(font.smallCaps('RANDOM WAIFU'))}\n• ${font.smallCaps('Source')}: ${source}\n• ${font.smallCaps('Waktu')}: ${timestamp}\n\n${font.smallCaps('Powered by Local Scraper')}`
            }, { quoted: msg });

        } catch (e) {
            console.error('Waifu error:', e);
            await react('❌');
            return reply(`${font.smallCaps('Terjadi kesalahan saat mengambil gambar waifu')}.`);
        }
    }
};
