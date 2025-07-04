import fetch from 'node-fetch';
import font from '../../lib/font.js';

export default {
    command: 'quote',
    aliases: ['wisdom'],
    description: 'Kirim gambar motivasi random',
    category: 'fun',
    usage: '',
    cooldown: 5,
    async execute(context) {
        const { sock, msg, reply } = context;
        try {
            const res = await fetch('https://api.nekoyama.my.id/api/kata-kata/motivasi');
            if (!res.ok) throw new Error(`${font.smallCaps('Gagal mengambil gambar motivasi dari API')}!`);
            const json = await res.json();
            if (json.status !== 'success' || !json.data || !json.data.image_url) throw new Error(`${font.smallCaps('Gambar motivasi tidak ditemukan')}!`);
            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: json.data.image_url },
                caption: `✨ ${font.bold(font.smallCaps('QUOTE OF THE DAY'))}\n\n${font.smallCaps('Powered by Chisato API')}`
            }, { quoted: msg });
        } catch (e) {
            await reply(`${font.smallCaps('Gagal mengambil gambar motivasi, coba lagi nanti')}.`);
        }
    }
};
