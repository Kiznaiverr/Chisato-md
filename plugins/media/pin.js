import { pinterestSearch } from '../../lib/scraper/pinterest-search.js';
import font from '../../lib/font.js';

export default {
    command: 'pin',
    aliases: ['pinterest'],
    category: 'media',
    description: 'Cari dan kirim gambar random dari Pinterest',
    usage: '<query>',
    limit: 1,
    cooldown: 5,

    async execute({ args, reply, sock, msg, react }) {
        if (!args[0]) {
            return reply(`${font.smallCaps('Masukkan kata kunci pencarian')}!\n${font.smallCaps('Contoh')}: .pin anime girl`);
        }

        await react('🔍');
        const query = args.join(' ');

        try {
            const result = await pinterestSearch(query);

            if (result.status !== 200 || !result.data || !result.data.images || result.data.images.length === 0) {
                await react('❌');
                return reply(`${font.smallCaps('Tidak ditemukan gambar untuk: ')} ${query}\n${font.smallCaps('Error: ')} ${result.error || 'Unknown error'}`);
            }

            const { images, total_found, timestamp } = result.data;
            
            // Select a random image from the results
            const randomImage = images[Math.floor(Math.random() * images.length)];

            await react('✅');
            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: randomImage },
                caption: `🔍 ${font.bold(font.smallCaps('PINTEREST SEARCH'))}\n• ${font.smallCaps('Query')}: ${query}\n• ${font.smallCaps('Total ditemukan')}: ${total_found} gambar\n• ${font.smallCaps('Waktu')}: ${timestamp}\n\n${font.smallCaps('Powered by Local Scraper')}`
            }, { quoted: msg });

        } catch (e) {
            console.error('Pinterest error:', e);
            await react('❌');
            return reply(`${font.smallCaps('Terjadi kesalahan saat mencari gambar Pinterest')}.`);
        }
    }
};
