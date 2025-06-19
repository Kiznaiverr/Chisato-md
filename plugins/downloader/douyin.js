import fetch from 'node-fetch';
import { getContentType, downloadMediaMessage } from '@whiskeysockets/baileys'
import { fileTypeFromBuffer } from 'file-type'
import font from '../../lib/font.js';

export default {
    command: 'douyin',
    aliases: ['douyin', 'dy', 'douyindl'],
    category: 'downloader',
    description: 'Download video Douyin (TikTok China) via link/text',
    usage: '<url/text>',
    limit: 1,
    cooldown: 5,

    async execute({ args, reply, sock, msg, react }) {
        if (!args[0]) return reply(`${font.smallCaps('Masukkan link atau share text Douyin')}!\n${font.smallCaps('Contoh')}: .douyin https://v.douyin.com/FOihCb_rYBg/`);
        await react('🕔');
        const url = args.join(' ');
        const api = `https://api.nekoyama.my.id/api/douyin/download?url=${encodeURIComponent(url)}`;
        try {
            const res = await fetch(api);
            if (!res.ok) throw new Error(`${font.smallCaps('Gagal menghubungi API Douyin')}!`);
            const json = await res.json();
            if (json.status !== 'success' || !json.data) {
                await react('❌');
                return reply(`${font.smallCaps('Gagal mendapatkan data. Pastikan link Douyin valid dan publik')}.`);
            }
            const { original_text, thumbnail, download_links } = json.data;
            // Pilih kualitas terbaik (urutan: hd > normal > lainnya)
            let videoUrl = null, label = '';
            if (download_links.hd) {
                videoUrl = download_links.hd.url;
                label = download_links.hd.label;
            } else if (download_links.normal) {
                videoUrl = download_links.normal.url;
                label = download_links.normal.label;
            } else {
                // Ambil salah satu jika tidak ada hd/normal
                const first = Object.values(download_links)[0];
                videoUrl = first?.url;
                label = first?.label;
            }
            if (!videoUrl) {
                await react('❌');
                return reply(`${font.smallCaps('Tidak ada link video yang bisa diunduh')}.`);
            }
            // Download video
            const videoRes = await fetch(videoUrl);
            if (!videoRes.ok) throw new Error(`${font.smallCaps('Gagal download video Douyin')}!`);
            const buffer = Buffer.from(await videoRes.arrayBuffer());
            // Kirim video ke user
            await sock.sendMessage(msg.key.remoteJid, {
                video: buffer,
                caption: `${font.bold(font.smallCaps('DOUYIN DOWNLOADER'))}\n• ${font.smallCaps('Link/Share')}: ${original_text || '-'}\n• ${font.smallCaps('Kualitas')}: ${label}\n\n${font.smallCaps('Powered by Chisato API')}`
            }, { quoted: msg });
            await react('✅');
        } catch (e) {
            await react('❌');
            return reply(`${font.smallCaps('Terjadi kesalahan saat memproses permintaan Douyin')}.`);
        }
    }
};
