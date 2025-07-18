import { douyinDownload } from '../../lib/scraper/douyin.js';
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
        
        try {
            const result = await douyinDownload(url);
            
            if (result.status !== 200 || !result.data) {
                await react('❌');
                return reply(`${font.smallCaps('Gagal mendapatkan data: ')} ${result.error || 'Unknown error'}`);
            }
            
            const { original_text, thumbnail, download_links, title } = result.data;
            let videoUrl = null, label = '';
            
            if (download_links.hd) {
                videoUrl = download_links.hd.url;
                label = download_links.hd.label;
            } else if (download_links.normal) {
                videoUrl = download_links.normal.url;
                label = download_links.normal.label;
            } else {
                const first = Object.values(download_links)[0];
                videoUrl = first?.url;
                label = first?.label;
            }
            
            if (!videoUrl) {
                await react('❌');
                return reply(`${font.smallCaps('Tidak ada link video yang bisa diunduh')}.`);
            }
            
            const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
            const videoRes = await fetch(videoUrl);
            if (!videoRes.ok) throw new Error(`${font.smallCaps('Gagal download video Douyin')}!`);
            const buffer = Buffer.from(await videoRes.arrayBuffer());
            
            await sock.sendMessage(msg.key.remoteJid, {
                video: buffer,
                caption: `${font.bold(font.smallCaps('DOUYIN DOWNLOADER'))}\n• ${font.smallCaps('Judul')}: ${title || '-'}\n• ${font.smallCaps('Link/Share')}: ${original_text || '-'}\n• ${font.smallCaps('Kualitas')}: ${label}\n\n${font.smallCaps('Powered by Local Scraper')}`
            }, { quoted: msg });
            await react('✅');
        } catch (e) {
            console.error('Douyin error:', e);
            await react('❌');
            return reply(`${font.smallCaps('Terjadi kesalahan saat memproses permintaan Douyin')}.`);
        }
    }
};
