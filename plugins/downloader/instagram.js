import { instagramDownload } from '../../lib/scraper/instagram.js';
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
        
        try {
            const result = await instagramDownload(url);
            
            if (result.status !== 200 || !result.data) {
                await react('❌');
                return reply(`${font.smallCaps('Gagal mendapatkan data: ')} ${result.error || 'Unknown error'}`);
            }
            
            const { title, username, download_links, url: igurl } = result.data;
            const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
            
            if (download_links.video) {
                const videoRes = await fetch(download_links.video);
                if (!videoRes.ok) throw new Error(`${font.smallCaps('Gagal download video Instagram')}!`);
                const buffer = Buffer.from(await videoRes.arrayBuffer());
                await sock.sendMessage(msg.key.remoteJid, {
                    video: buffer,
                    caption: `${font.bold(font.smallCaps('INSTAGRAM DOWNLOADER'))}\n• ${font.smallCaps('Judul')}: ${title || '-'}\n• ${font.smallCaps('User')}: @${username || '-'}\n• ${font.smallCaps('Link')}: ${igurl}\n\n${font.smallCaps('Powered by Local Scraper')}`
                }, { quoted: msg });
                await react('✅');
            } else if (download_links.image) {
                const imgRes = await fetch(download_links.image);
                if (!imgRes.ok) throw new Error(`${font.smallCaps('Gagal download gambar Instagram')}!`);
                const buffer = Buffer.from(await imgRes.arrayBuffer());
                await sock.sendMessage(msg.key.remoteJid, {
                    image: buffer,
                    caption: `${font.bold(font.smallCaps('INSTAGRAM DOWNLOADER'))}\n• ${font.smallCaps('Judul')}: ${title || '-'}\n• ${font.smallCaps('User')}: @${username || '-'}\n• ${font.smallCaps('Link')}: ${igurl}\n\n${font.smallCaps('Powered by Local Scraper')}`
                }, { quoted: msg });
                await react('✅');
            } else {
                await react('❌');
                return reply(`${font.smallCaps('Tidak ada media yang bisa diunduh dari link tersebut')}.`);
            }
        } catch (e) {
            console.error('Instagram error:', e);
            await react('❌');
            return reply(`${font.smallCaps('Terjadi kesalahan saat memproses permintaan Instagram')}.`);
        }
    }
};
