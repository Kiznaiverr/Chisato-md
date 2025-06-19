import fetch from 'node-fetch';
import font from '../../lib/font.js';

export default {
    command: 'instagram',
    aliases: ['ig', 'igdl', 'instadl'],
    category: 'downloader',
    description: 'Download video atau gambar dari Instagram (Reel/Post)',
    usage: '<url>',
    limit: 1,
    cooldown: 5,

    async execute({ args, reply, sock, msg, react }) {
        if (!args[0]) return reply(`${font.smallCaps('Masukkan link Instagram yang valid')}!\n${font.smallCaps('Contoh')}: .instagram https://www.instagram.com/reel/DJGKCPHSi3N/`);
        await react('🕔');
        const url = args[0];
        const api = `https://api.nekoyama.my.id/api/instagram/download?url=${encodeURIComponent(url)}`;
        try {
            const res = await fetch(api);
            if (!res.ok) throw new Error(`${font.smallCaps('Gagal menghubungi API Instagram')}!`);
            const json = await res.json();
            if (json.status !== 'success' || !json.data) {
                await react('❌');
                return reply(`${font.smallCaps('Gagal mendapatkan data. Pastikan link Instagram valid dan publik')}.`);
            }
            const { title, username, download_links, url: igurl } = json.data;
            // Prioritaskan video, jika tidak ada kirim gambar
            if (download_links.video) {
                const videoRes = await fetch(download_links.video);
                if (!videoRes.ok) throw new Error(`${font.smallCaps('Gagal download video Instagram')}!`);
                const buffer = Buffer.from(await videoRes.arrayBuffer());
                await sock.sendMessage(msg.key.remoteJid, {
                    video: buffer,
                    caption: `${font.bold(font.smallCaps('INSTAGRAM DOWNLOADER'))}\n• ${font.smallCaps('Judul')}: ${title || '-'}\n• ${font.smallCaps('User')}: @${username || '-'}\n• ${font.smallCaps('Link')}: ${igurl}\n\n${font.smallCaps('Powered by Chisato API')}`
                }, { quoted: msg });
                await react('✅');
            } else if (download_links.image) {
                const imgRes = await fetch(download_links.image);
                if (!imgRes.ok) throw new Error(`${font.smallCaps('Gagal download gambar Instagram')}!`);
                const buffer = Buffer.from(await imgRes.arrayBuffer());
                await sock.sendMessage(msg.key.remoteJid, {
                    image: buffer,
                    caption: `${font.bold(font.smallCaps('INSTAGRAM DOWNLOADER'))}\n• ${font.smallCaps('Judul')}: ${title || '-'}\n• ${font.smallCaps('User')}: @${username || '-'}\n• ${font.smallCaps('Link')}: ${igurl}\n\n${font.smallCaps('Powered by Chisato API')}`
                }, { quoted: msg });
                await react('✅');
            } else {
                await react('❌');
                return reply(`${font.smallCaps('Tidak ada media yang bisa diunduh dari link tersebut')}.`);
            }
        } catch (e) {
            await react('❌');
            return reply(`${font.smallCaps('Terjadi kesalahan saat memproses permintaan Instagram')}.`);
        }
    }
};
