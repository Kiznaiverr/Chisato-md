import fetch from 'node-fetch';
import font from '../../lib/font.js';

export default {
    command: 'facebook',
    aliases: ['fb', 'fbvid', 'fbdown'],
    category: 'downloader',
    description: 'Download video Facebook via link',
    usage: '<url>',
    limit:1,
    cooldown: 5,

    async execute({ args, reply, sock, msg, react }) {
        if (!args[0]) return reply(`${font.smallCaps('Masukkan link Facebook yang valid')}!\n${font.smallCaps('Contoh')}: .facebook https://www.facebook.com/share/v/1AcEg1sL7A/`);
        await react('🕔');
        const url = args[0];
        const api = `https://api.nekoyama.my.id/api/facebook/download?url=${encodeURIComponent(url)}`;
        try {
            const res = await fetch(api);
            if (!res.ok) throw new Error(`${font.smallCaps('Gagal menghubungi API Facebook')}!`);
            const json = await res.json();
            if (json.status !== 'success' || !json.data) {
                await react('❌');
                return reply(`${font.smallCaps('Gagal mendapatkan data. Pastikan link Facebook valid dan publik')}.`);
            }
            const { title, download_links, url: fburl } = json.data;
            let videoUrl = null, label = '';
            if (download_links.hd) {
                videoUrl = download_links.hd;
                label = 'HD';
            } else if (download_links.sd) {
                videoUrl = download_links.sd;
                label = 'SD';
            } else if (download_links.audio) {
                videoUrl = download_links.audio;
                label = 'Audio';
            }
            if (!videoUrl) {
                await react('❌');
                return reply(`${font.smallCaps('Tidak ada link video yang bisa diunduh')}.`);
            }
            const videoRes = await fetch(videoUrl);
            if (!videoRes.ok) throw new Error(`${font.smallCaps('Gagal download video Facebook')}!`);
            const buffer = Buffer.from(await videoRes.arrayBuffer());
            await sock.sendMessage(msg.key.remoteJid, {
                video: buffer,
                caption: `${font.bold(font.smallCaps('FACEBOOK DOWNLOADER'))}\n• ${font.smallCaps('Judul')}: ${title || '-'}\n• ${font.smallCaps('Link')}: ${fburl}\n• ${font.smallCaps('Kualitas')}: ${label}\n\n${font.smallCaps('Powered by Chisato API')}`
            }, { quoted: msg });
            await react('✅');
        } catch (e) {
            await react('❌');
            return reply(`${font.smallCaps('Terjadi kesalahan saat memproses permintaan Facebook')}.`);
        }
    }
};
