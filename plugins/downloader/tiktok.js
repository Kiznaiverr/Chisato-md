import fetch from 'node-fetch';
import font from '../../lib/font.js';

export default {
    command: 'tiktok',
    aliases: ['tt', 'ttdl', 'tiktokdl'],
    category: 'downloader',
    description: 'Download video dan audio dari TikTok',
    usage: '<url>',
    limit: 1,
    cooldown: 5,

    async execute({ args, reply, sock, msg, react }) {
        if (!args[0]) return reply(`${font.smallCaps('Masukkan link TikTok yang valid')}!\n${font.smallCaps('Contoh')}: .tiktok https://www.tiktok.com/@user/video/1234567890`);
        await react('🕔');
        const url = args[0];
        const api = `https://api.nekoyama.my.id/api/tiktok/download?url=${encodeURIComponent(url)}`;
        try {
            const res = await fetch(api);
            if (!res.ok) throw new Error(`${font.smallCaps('Gagal menghubungi API TikTok')}!`);
            const json = await res.json();
            if (json.status !== 'success' || !json.data) {
                await react('❌');
                return reply(`${font.smallCaps('Gagal mendapatkan data. Pastikan link TikTok valid dan publik')}.`);
            }
            const { title, thumbnail, download_links, url: tiktokUrl } = json.data;
            if (download_links.video) {
                const videoRes = await fetch(download_links.video);
                if (!videoRes.ok) throw new Error(`${font.smallCaps('Gagal download video TikTok')}!`);
                const buffer = Buffer.from(await videoRes.arrayBuffer());
                await sock.sendMessage(msg.key.remoteJid, {
                    video: buffer,
                    caption: `${font.bold(font.smallCaps('TIKTOK DOWNLOADER'))}\n• ${font.smallCaps('Judul')}: ${title || '-'}\n• ${font.smallCaps('Link')}: ${tiktokUrl}\n\n${font.smallCaps('Powered by Chisato API')}`
                }, { quoted: msg });
                await react('✅');
            }
            if (download_links.audio) {
                const audioRes = await fetch(download_links.audio);
                if (!audioRes.ok) throw new Error(`${font.smallCaps('Gagal download audio TikTok')}!`);
                const buffer = Buffer.from(await audioRes.arrayBuffer());
                await sock.sendMessage(msg.key.remoteJid, {
                    audio: buffer,
                    mimetype: 'audio/mp4',
                    ptt: false,
                    caption: `${font.bold(font.smallCaps('TIKTOK AUDIO'))}\n• ${font.smallCaps('Judul')}: ${title || '-'}\n• ${font.smallCaps('Link')}: ${tiktokUrl}\n\n${font.smallCaps('Powered by Chisato API')}`
                }, { quoted: msg });
                await react('✅');
            }
            if (!download_links.video && !download_links.audio) {
                await react('❌');
                return reply(`${font.smallCaps('Tidak ada media yang bisa diunduh dari link tersebut')}.`);
            }
        } catch (e) {
            await react('❌');
            return reply(`${font.smallCaps('Terjadi kesalahan saat memproses permintaan TikTok')}.`);
        }
    }
};
